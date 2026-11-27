// Facility energy management (SP-MATH-008, SP-MATH-009).
//
// Solar: P_PV = G · A · η · (1 − γ (T_cell − 25 °C)) · derating, with the
// cell temperature T_cell = T_amb + (NOCT − 20)/800 · G. Storage: an energy
// reservoir with charge and discharge efficiencies, power limits, SOC limits
// and a reserve held back for essential loads. Loads are requested by
// priority — essential (safety controller, edge computing, communication,
// barriers, alarm), comfort (lighting, comfort ventilation), flexible
// (wireless charging) — and served from PV, storage and the grid connection
// under its import limit. Every step closes the balance
//   grid + PV used + storage discharge = served loads + storage charging + converter losses
// and any shortfall is recorded as unmet demand per priority, never as power
// that flowed. Charging power is allocated before the chargers step, so a
// charger never draws more than the site can supply in that step.

export interface EnergyInputs {
  pvArea: number;
  pvEfficiency: number;
  /** Soiling, wiring, inverter and mismatch, multiplicative. */
  pvDerating: number;
  /** Temperature coefficient of power, 1/K. */
  pvGamma: number;
  noct: number;
  bessKWh: number;
  bessKW: number;
  /** One-way efficiencies. */
  bessChargeEff: number;
  bessDischargeEff: number;
  bessSocMin: number;
  bessSocMax: number;
  /** SOC held back for essential loads during an outage. */
  bessReserve: number;
  bessInitialSoc: number;
  /** Grid import limit of the connection, W. */
  gridLimit: number;
  /** Rated power of each wireless charger, W. */
  chargerPower: number;
  /** "equal" share or earliest departure first. */
  chargingPolicy: "equal" | "least-laxity";
  /** Use storage to support charging (otherwise it backs essential loads only). */
  storageForCharging: boolean;
  /** Energy price, minor units per kWh, by tariff band (from the district model's bands). */
  price: { offPeak: number; standard: number; peak: number };
}

export const DEFAULT_ENERGY: EnergyInputs = {
  pvArea: 180,
  pvEfficiency: 0.21,
  pvDerating: 0.86,
  pvGamma: 0.0037,
  noct: 45,
  bessKWh: 30,
  bessKW: 12,
  bessChargeEff: 0.96,
  bessDischargeEff: 0.96,
  bessSocMin: 0.1,
  bessSocMax: 0.95,
  bessReserve: 0.25,
  bessInitialSoc: 0.6,
  gridLimit: 32000,
  chargerPower: 11000,
  chargingPolicy: "least-laxity",
  storageForCharging: true,
  price: { offPeak: 600, standard: 850, peak: 1150 },
};

export function pvPower(i: EnergyInputs, irradiance: number, ambient: number): { power: number; cellTemperature: number } {
  const cell = ambient + ((i.noct - 20) / 800) * irradiance;
  const temp = Math.max(0, 1 - i.pvGamma * (cell - 25));
  return { power: Math.max(0, irradiance * i.pvArea * i.pvEfficiency * temp * i.pvDerating), cellTemperature: cell };
}

export interface LoadRequest {
  essential: number;
  comfort: number;
}

export interface EnergyStep {
  pvAvailable: number;
  pvUsed: number;
  pvCurtailed: number;
  grid: number;
  bessCharge: number;
  bessDischarge: number;
  /** Storage converter losses, W. */
  losses: number;
  served: { essential: number; comfort: number; charging: number };
  requested: { essential: number; comfort: number; charging: number };
  unmet: { essential: number; comfort: number; charging: number };
  /** Power the chargers may draw in this step, W (total). */
  chargingBudget: number;
  residual: number;
}

export interface EnergyLedger {
  pv: number;
  grid: number;
  bessIn: number;
  bessOut: number;
  losses: number;
  essential: number;
  comfort: number;
  charging: number;
  unmet: number;
  curtailed: number;
  /** Cost of grid energy, minor units. */
  gridCost: number;
  maxResidual: number;
}

export const newLedger = (): EnergyLedger => ({ pv: 0, grid: 0, bessIn: 0, bessOut: 0, losses: 0, essential: 0, comfort: 0, charging: 0, unmet: 0, curtailed: 0, gridCost: 0, maxResidual: 0 });

export interface Storage {
  /** Stored energy, J. */
  energy: number;
  capacity: number;
}

export const newStorage = (i: EnergyInputs): Storage => ({ energy: i.bessInitialSoc * i.bessKWh * 3.6e6, capacity: i.bessKWh * 3.6e6 });
export const storageSoc = (s: Storage) => (s.capacity > 0 ? s.energy / s.capacity : 0);

/** How much power the chargers may draw this step, given the other loads and the supplies (before the chargers step). */
export function chargingBudget(i: EnergyInputs, s: Storage, load: LoadRequest, pv: number, gridUp: boolean, dt: number): number {
  const grid = gridUp ? i.gridLimit : 0;
  const reserveFloor = Math.max(i.bessSocMin, i.bessReserve) * s.capacity;
  const storage = i.storageForCharging ? Math.min(i.bessKW, Math.max(0, (s.energy - reserveFloor) * i.bessDischargeEff) / dt) : 0;
  return Math.max(0, pv + grid + storage - load.essential - load.comfort);
}

/**
 * Serves the step: PV first, then storage (only above its reserve unless the
 * grid is down), then the grid up to its limit; surplus PV charges storage
 * and is curtailed beyond that. `charging` is what the chargers actually drew.
 */
export function dispatch(i: EnergyInputs, s: Storage, load: LoadRequest, charging: number, pv: number, gridUp: boolean, price: number, dt: number, ledger: EnergyLedger): EnergyStep {
  const requested = { essential: load.essential, comfort: load.comfort, charging };
  const gridMax = gridUp ? i.gridLimit : 0;
  const floorAll = i.bessSocMin * s.capacity;
  const floorReserve = Math.max(i.bessSocMin, i.bessReserve) * s.capacity;
  const canDischarge = (floor: number) => Math.min(i.bessKW, Math.max(0, ((s.energy - floor) * i.bessDischargeEff) / dt));
  let pvLeft = pv;
  let gridLeft = gridMax;
  let bessDischarge = 0;
  const served = { essential: 0, comfort: 0, charging: 0 };
  const serve = (key: keyof typeof served, want: number, storageFloor: number | null) => {
    let need = want;
    const a = Math.min(need, pvLeft);
    pvLeft -= a;
    need -= a;
    if (storageFloor !== null && need > 0) {
      const b = Math.min(need, Math.max(0, canDischarge(storageFloor) - bessDischarge));
      bessDischarge += b;
      need -= b;
    }
    const g = Math.min(need, gridLeft);
    gridLeft -= g;
    need -= g;
    served[key] = want - need;
  };
  // Essential loads may use the reserve; comfort and charging may not.
  serve("essential", load.essential, gridUp ? floorReserve : floorAll);
  serve("comfort", load.comfort, gridUp ? null : floorReserve);
  serve("charging", charging, i.storageForCharging ? floorReserve : null);
  // Surplus PV into storage, the rest curtailed.
  const room = Math.max(0, (i.bessSocMax * s.capacity - s.energy) / (i.bessChargeEff * dt));
  const bessCharge = bessDischarge > 0 ? 0 : Math.min(pvLeft, i.bessKW, room);
  const curtailed = pvLeft - bessCharge;
  const grid = gridMax - gridLeft;
  const pvUsed = pv - curtailed;
  // Stored energy: charging stores η·P; discharging withdraws P/η (the difference is the converter loss).
  const losses = bessCharge * (1 - i.bessChargeEff) + bessDischarge * (1 / i.bessDischargeEff - 1);
  s.energy = Math.min(s.capacity, Math.max(0, s.energy + (bessCharge * i.bessChargeEff - bessDischarge / i.bessDischargeEff) * dt));
  const unmet = { essential: requested.essential - served.essential, comfort: requested.comfort - served.comfort, charging: requested.charging - served.charging };
  // Balance at the bus (storage power measured at its terminals).
  const residual = grid + pvUsed + bessDischarge - (served.essential + served.comfort + served.charging + bessCharge);
  ledger.pv += pvUsed * dt;
  ledger.grid += grid * dt;
  ledger.bessIn += bessCharge * dt;
  ledger.bessOut += bessDischarge * dt;
  ledger.losses += losses * dt;
  ledger.essential += served.essential * dt;
  ledger.comfort += served.comfort * dt;
  ledger.charging += served.charging * dt;
  ledger.unmet += (unmet.essential + unmet.comfort + unmet.charging) * dt;
  ledger.curtailed += curtailed * dt;
  ledger.gridCost += (grid * dt * price) / 3.6e6;
  ledger.maxResidual = Math.max(ledger.maxResidual, Math.abs(residual));
  return { pvAvailable: pv, pvUsed, pvCurtailed: curtailed, grid, bessCharge, bessDischarge, losses, served, requested, unmet, chargingBudget: 0, residual };
}

/** Splits the charging budget between active chargers: equal shares, or earliest departure first; each at most its rating. Returns W per key. */
export function shareCharging(budget: number, demands: { key: string; rated: number; departAt: number }[], policy: EnergyInputs["chargingPolicy"]): Map<string, number> {
  const out = new Map<string, number>();
  let left = budget;
  if (policy === "least-laxity") {
    for (const d of [...demands].sort((a, b) => a.departAt - b.departAt || (a.key < b.key ? -1 : 1))) {
      const p = Math.min(d.rated, left);
      out.set(d.key, p);
      left -= p;
    }
    return out;
  }
  // Equal share with redistribution (water-filling).
  let open = [...demands];
  while (open.length && left > 1e-6) {
    const share = left / open.length;
    const capped = open.filter((d) => d.rated - (out.get(d.key) ?? 0) <= share);
    if (!capped.length) {
      for (const d of open) out.set(d.key, (out.get(d.key) ?? 0) + share);
      left = 0;
      break;
    }
    for (const d of capped) {
      left -= d.rated - (out.get(d.key) ?? 0);
      out.set(d.key, d.rated);
    }
    open = open.filter((d) => !capped.includes(d));
  }
  for (const d of demands) if (!out.has(d.key)) out.set(d.key, 0);
  return out;
}
