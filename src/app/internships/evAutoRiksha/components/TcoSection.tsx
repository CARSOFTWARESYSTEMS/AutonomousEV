"use client";

import { runSimulation } from "@/lib/evAutoRickshaw/engine";
import { computeFuelComparison, computeTco } from "@/lib/evAutoRickshaw/tco";
import { useMemo, useState } from "react";
import styles from "../page.module.css";
import { Badge } from "./Badge";
import { formatInr, formatInrLakh } from "./format";
import type { EvSimulator } from "./useSimulator";

interface TcoLocalInputs {
  downPaymentInr: number;
  loanInterestRatePct: number;
  loanTenureMonths: number;
  workingDaysPerMonth: number;
  avgPassengersPerTrip: number;
  avgFarePerPassengerInr: number;
  tripsPerDay: number;
  annualMaintenanceInr: number;
  annualInsuranceInr: number;
  tyreSetCostInr: number;
  tyreLifeKm: number;
}

const DEFAULT_TCO_INPUTS: TcoLocalInputs = {
  downPaymentInr: 60000,
  loanInterestRatePct: 13,
  loanTenureMonths: 36,
  workingDaysPerMonth: 26,
  avgPassengersPerTrip: 2.5,
  avgFarePerPassengerInr: 20,
  tripsPerDay: 18,
  annualMaintenanceInr: 12000,
  annualInsuranceInr: 9000,
  tyreSetCostInr: 6000,
  tyreLifeKm: 18000,
};

type FuelTab = "ev" | "cng" | "petrol";

const FUEL_DEFAULTS = {
  cng: { fuelEconomyKmPerUnit: 28, fuelPriceInrPerUnit: 85, annualMaintenanceInr: 16000, annualInsuranceInr: 9000, purchasePriceInr: 280000 },
  petrol: { fuelEconomyKmPerUnit: 35, fuelPriceInrPerUnit: 105, annualMaintenanceInr: 18000, annualInsuranceInr: 9000, purchasePriceInr: 260000 },
};

export function TcoSection({ sim }: { sim: EvSimulator }) {
  const [inputs, setInputs] = useState<TcoLocalInputs>(DEFAULT_TCO_INPUTS);
  const [tab, setTab] = useState<FuelTab>("ev");
  const [fuelAssumptions, setFuelAssumptions] = useState(FUEL_DEFAULTS);

  const setFuelField = <F extends "cng" | "petrol", K extends keyof (typeof FUEL_DEFAULTS)["cng"]>(
    fuel: F,
    key: K,
    value: number,
  ) => setFuelAssumptions((prev) => ({ ...prev, [fuel]: { ...prev[fuel], [key]: value } }));

  const set = <K extends keyof TcoLocalInputs>(key: K, value: TcoLocalInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const { requirement, overrides, assumptions, outputs } = sim;

  const tco = useMemo(
    () =>
      computeTco(
        { purchasePriceInr: outputs.cost.sellingPriceInr, ...inputs, electricityTariffInrPerKWh: assumptions.electricityTariffInrPerKWh, dailyDistanceKm: requirement.dailyDistanceKm },
        outputs.energy.typical.whPerKm,
        assumptions.chargerEfficiency,
      ),
    [inputs, outputs, assumptions, requirement.dailyDistanceKm],
  );

  const cngComparison = useMemo(
    () =>
      computeFuelComparison({
        purchasePriceInr: fuelAssumptions.cng.purchasePriceInr,
        dailyDistanceKm: requirement.dailyDistanceKm,
        workingDaysPerMonth: inputs.workingDaysPerMonth,
        fuelEconomyKmPerUnit: fuelAssumptions.cng.fuelEconomyKmPerUnit,
        fuelPriceInrPerUnit: fuelAssumptions.cng.fuelPriceInrPerUnit,
        annualMaintenanceInr: fuelAssumptions.cng.annualMaintenanceInr,
        annualInsuranceInr: fuelAssumptions.cng.annualInsuranceInr,
      }),
    [fuelAssumptions, requirement.dailyDistanceKm, inputs.workingDaysPerMonth],
  );

  const petrolComparison = useMemo(
    () =>
      computeFuelComparison({
        purchasePriceInr: fuelAssumptions.petrol.purchasePriceInr,
        dailyDistanceKm: requirement.dailyDistanceKm,
        workingDaysPerMonth: inputs.workingDaysPerMonth,
        fuelEconomyKmPerUnit: fuelAssumptions.petrol.fuelEconomyKmPerUnit,
        fuelPriceInrPerUnit: fuelAssumptions.petrol.fuelPriceInrPerUnit,
        annualMaintenanceInr: fuelAssumptions.petrol.annualMaintenanceInr,
        annualInsuranceInr: fuelAssumptions.petrol.annualInsuranceInr,
      }),
    [fuelAssumptions, requirement.dailyDistanceKm, inputs.workingDaysPerMonth],
  );

  // TCO = full purchase price (not just the financed part) + non-EMI operating costs over the horizon.
  const evTcoYears = (years: number) =>
    outputs.cost.sellingPriceInr + (tco.monthlyOperatingCostInr - tco.emi.monthlyEmiInr) * 12 * years;

  const warrantyComparison = useMemo(() => {
    const base = runSimulation(requirement, overrides, assumptions);
    const extended = runSimulation({ ...requirement, vehicleWarrantyYears: 6, batteryWarrantyYears: 6 }, overrides, assumptions);
    return { base, extended };
  }, [requirement, overrides, assumptions]);

  return (
    <>
      <div className={styles.tagRow}>
        <Badge kind="simulated" label="Illustrative Business Estimate" />
      </div>

      <h3 className={styles.sectionTitle} style={{ fontSize: "1.25rem", textAlign: "left" }}>
        Will This Auto Make Money?
      </h3>

      <div className={styles.cardGrid2}>
        <NumField label="Down Payment (₹)" value={inputs.downPaymentInr} step={5000} onChange={(v) => set("downPaymentInr", v)} />
        <NumField label="Loan Interest (% p.a.)" value={inputs.loanInterestRatePct} step={0.5} onChange={(v) => set("loanInterestRatePct", v)} />
        <NumField label="Loan Tenure (months)" value={inputs.loanTenureMonths} step={6} min={12} max={72} onChange={(v) => set("loanTenureMonths", v)} />
        <NumField label="Working Days / Month" value={inputs.workingDaysPerMonth} step={1} min={15} max={30} onChange={(v) => set("workingDaysPerMonth", v)} />
        <NumField label="Avg Passengers / Trip" value={inputs.avgPassengersPerTrip} step={0.1} onChange={(v) => set("avgPassengersPerTrip", v)} />
        <NumField label="Avg Fare / Passenger (₹)" value={inputs.avgFarePerPassengerInr} step={1} onChange={(v) => set("avgFarePerPassengerInr", v)} />
        <NumField label="Trips / Day" value={inputs.tripsPerDay} step={1} onChange={(v) => set("tripsPerDay", v)} />
        <NumField label="Annual Maintenance (₹)" value={inputs.annualMaintenanceInr} step={1000} onChange={(v) => set("annualMaintenanceInr", v)} />
        <NumField label="Annual Insurance (₹)" value={inputs.annualInsuranceInr} step={500} onChange={(v) => set("annualInsuranceInr", v)} />
        <NumField label="Tyre Set Cost (₹)" value={inputs.tyreSetCostInr} step={500} onChange={(v) => set("tyreSetCostInr", v)} />
        <NumField label="Tyre Life (km)" value={inputs.tyreLifeKm} step={1000} onChange={(v) => set("tyreLifeKm", v)} />
      </div>

      <div className={styles.resultGrid} style={{ marginTop: "1.5rem" }}>
        <Stat label="EMI" value={`₹${formatInr(tco.emi.monthlyEmiInr)}/mo`} />
        <Stat label="Daily Electricity" value={`₹${formatInr(tco.dailyElectricityCostInr)}`} />
        <Stat label="Monthly Operating Cost" value={`₹${formatInr(tco.monthlyOperatingCostInr)}`} />
        <Stat label="Monthly Revenue" value={`₹${formatInr(tco.monthlyRevenueInr)}`} />
        <Stat
          label="Monthly Operating Surplus"
          value={`₹${formatInr(tco.monthlyOperatingSurplusInr)}`}
        />
        <Stat label="₹ / km" value={`₹${tco.costPerKmInr.toFixed(2)}`} />
        <Stat label="₹ / passenger-km" value={`₹${tco.costPerPassengerKmInr.toFixed(2)}`} />
        <Stat
          label="Down-Payment Payback"
          value={tco.paybackMonths ? `${Math.ceil(tco.paybackMonths)} months` : "Not within surplus"}
        />
      </div>

      <h3 className={styles.sectionTitle} style={{ fontSize: "1.25rem", textAlign: "left", marginTop: "2.5rem" }}>
        EV vs CNG vs Petrol Auto
      </h3>
      <div className={styles.tabRow} role="tablist">
        {(["ev", "cng", "petrol"] as FuelTab[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={tab === t ? styles.tabActive : styles.tab}
            onClick={() => setTab(t)}
          >
            {t === "ev" ? "Our EV" : t === "cng" ? "CNG Auto" : "Petrol Auto"}
          </button>
        ))}
      </div>

      {tab !== "ev" ? (
        <div className={styles.cardGrid2} style={{ marginBottom: "1.5rem" }}>
          <NumField
            label={`${tab === "cng" ? "CNG" : "Petrol"} Price (₹/kg or ₹/L)`}
            value={fuelAssumptions[tab].fuelPriceInrPerUnit}
            step={1}
            onChange={(v) => setFuelField(tab, "fuelPriceInrPerUnit", v)}
          />
          <NumField
            label="Fuel Economy (km/unit)"
            value={fuelAssumptions[tab].fuelEconomyKmPerUnit}
            step={1}
            onChange={(v) => setFuelField(tab, "fuelEconomyKmPerUnit", v)}
          />
          <NumField
            label="Acquisition Price (₹)"
            value={fuelAssumptions[tab].purchasePriceInr}
            step={5000}
            onChange={(v) => setFuelField(tab, "purchasePriceInr", v)}
          />
          <NumField
            label="Annual Maintenance (₹)"
            value={fuelAssumptions[tab].annualMaintenanceInr}
            step={1000}
            onChange={(v) => setFuelField(tab, "annualMaintenanceInr", v)}
          />
        </div>
      ) : null}

      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Our EV</th>
              <th>CNG Auto</th>
              <th>Petrol Auto</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Acquisition</td>
              <td>{formatInrLakh(outputs.cost.sellingPriceInr)}</td>
              <td>{formatInrLakh(fuelAssumptions.cng.purchasePriceInr)}</td>
              <td>{formatInrLakh(fuelAssumptions.petrol.purchasePriceInr)}</td>
            </tr>
            <tr>
              <td>Daily Fuel / Energy</td>
              <td>₹{formatInr(tco.dailyElectricityCostInr)}</td>
              <td>₹{formatInr(cngComparison.dailyFuelCostInr)}</td>
              <td>₹{formatInr(petrolComparison.dailyFuelCostInr)}</td>
            </tr>
            <tr>
              <td>₹ / km (operating)</td>
              <td>₹{tco.costPerKmInr.toFixed(2)}</td>
              <td>₹{cngComparison.costPerKmInr.toFixed(2)}</td>
              <td>₹{petrolComparison.costPerKmInr.toFixed(2)}</td>
            </tr>
            <tr>
              <td>3-Year TCO</td>
              <td>{formatInrLakh(evTcoYears(3))}</td>
              <td>{formatInrLakh(cngComparison.tcoYear3Inr)}</td>
              <td>{formatInrLakh(petrolComparison.tcoYear3Inr)}</td>
            </tr>
            <tr>
              <td>5-Year TCO</td>
              <td>{formatInrLakh(evTcoYears(5))}</td>
              <td>{formatInrLakh(cngComparison.tcoYear5Inr)}</td>
              <td>{formatInrLakh(petrolComparison.tcoYear5Inr)}</td>
            </tr>
            <tr>
              <td>10-Year TCO</td>
              <td>{formatInrLakh(evTcoYears(10))}</td>
              <td>{formatInrLakh(cngComparison.tcoYear10Inr)}</td>
              <td>{formatInrLakh(petrolComparison.tcoYear10Inr)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className={styles.fieldHint}>
        CNG/petrol fuel economy and price are editable planning assumptions, not sourced live fuel prices — adjust
        them to match your local market before drawing conclusions.
      </p>

      <h3 className={styles.sectionTitle} style={{ fontSize: "1.25rem", textAlign: "left", marginTop: "2.5rem" }}>
        Maintenance Plan &amp; Lifetime Service Cost
      </h3>
      <div className={styles.cardGrid3} style={{ marginBottom: "1.5rem" }}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Daily</div>
          <ul className={styles.cardList}>
            <li>Tyres</li>
            <li>Brakes</li>
            <li>Lights</li>
            <li>Warning indicators</li>
            <li>Visible damage</li>
          </ul>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Periodic (km-based interval)</div>
          <ul className={styles.cardList}>
            <li>Tyres, brakes, steering, suspension, bearings</li>
            <li>Electrical connectors, charging connector</li>
            <li>Drivetrain and diagnostic fault check</li>
          </ul>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Annual</div>
          <ul className={styles.cardList}>
            <li>Battery health report</li>
            <li>HV inspection / isolation check</li>
            <li>Charger, chassis, corrosion, brake system, software, telematics</li>
          </ul>
        </div>
      </div>
      <LifetimeServiceCost annualMaintenanceInr={inputs.annualMaintenanceInr} dailyDistanceKm={requirement.dailyDistanceKm} workingDaysPerMonth={inputs.workingDaysPerMonth} />

      <h3 className={styles.sectionTitle} style={{ fontSize: "1.25rem", textAlign: "left", marginTop: "2.5rem" }}>
        Warranty Simulator
      </h3>
      <div className={styles.cardGrid2}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Vehicle 3 yr / Battery 3 yr</div>
          <p className={styles.cardBody}>Selling price: {formatInrLakh(warrantyComparison.base.cost.sellingPriceInr)}</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Vehicle 6 yr / Battery 6 yr</div>
          <p className={styles.cardBody}>Selling price: {formatInrLakh(warrantyComparison.extended.cost.sellingPriceInr)}</p>
        </div>
      </div>
      <p className={styles.fieldHint}>
        Estimated warranty-cost impact: +
        {formatInrLakh(warrantyComparison.extended.cost.sellingPriceInr - warrantyComparison.base.cost.sellingPriceInr)}{" "}
        for extending both vehicle and battery warranty from 3 to 6 years. These are cost-model provisioning
        assumptions, not final commercial warranty commitments.
      </p>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.resultStat}>
      <span className={styles.resultStatLabel}>{label}</span>
      <span className={styles.resultStatValue}>{value}</span>
    </div>
  );
}

function NumField({
  label,
  value,
  step,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <input
        className={styles.assumptionInput}
        style={{ width: "100%", textAlign: "left" }}
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </div>
  );
}

const SERVICE_BANDS = [
  { label: "Year 1", factor: 0.7 },
  { label: "Years 2–3", factor: 1.0 },
  { label: "Years 4–5", factor: 1.25 },
  { label: "Years 6–8", factor: 1.5 },
  { label: "Years 9–10", factor: 1.8 },
];

function LifetimeServiceCost({
  annualMaintenanceInr,
  dailyDistanceKm,
  workingDaysPerMonth,
}: {
  annualMaintenanceInr: number;
  dailyDistanceKm: number;
  workingDaysPerMonth: number;
}) {
  const annualKm = dailyDistanceKm * workingDaysPerMonth * 12;
  const totalCostInr = SERVICE_BANDS.reduce((sum, b) => sum + annualMaintenanceInr * b.factor * bandYears(b.label), 0);
  const totalKm = annualKm * 10;
  const lifetimeCostPerKm = totalKm > 0 ? totalCostInr / totalKm : 0;

  return (
    <div className={styles.tableWrapper} style={{ marginBottom: "0.75rem" }}>
      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>Period</th>
            <th>Est. Annual Service Cost</th>
          </tr>
        </thead>
        <tbody>
          {SERVICE_BANDS.map((b) => (
            <tr key={b.label}>
              <td>{b.label}</td>
              <td>₹{formatInr(annualMaintenanceInr * b.factor)}/yr</td>
            </tr>
          ))}
          <tr>
            <td>
              <strong>Lifetime Maintenance ₹/km</strong>
            </td>
            <td>
              <strong>₹{lifetimeCostPerKm.toFixed(2)}/km</strong> (at ~{Math.round(annualKm)} km/year)
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function bandYears(label: string): number {
  const years: Record<string, number> = { "Year 1": 1, "Years 2–3": 2, "Years 4–5": 2, "Years 6–8": 3, "Years 9–10": 2 };
  return years[label] ?? 1;
}
