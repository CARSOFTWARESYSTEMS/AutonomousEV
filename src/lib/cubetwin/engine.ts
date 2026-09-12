import {
  type Scenario,
  type MissionMode,
  type Fault,
  validateScenario,
  FAULT_INFO,
} from "./scenario";
export const ASSUMPTIONS = [
  "Educational R&D prototype · Simulated data · Not flight software.",
  "Circular two-body orbit: Earth mean radius 6371 km; gravitational parameter 398600.4418 km³/s². Inclination is descriptive in duration mode.",
  "Each orbit begins in sunlight; eclipse is a configurable interval at the end. No seasonal geometry, attitude dynamics or perturbations.",
  "Battery energy in Wh; power in W; time in seconds. Positive battery power/current means discharge. Efficiency losses are included.",
  "OCV is an illustrative editable pack lookup. Current = requested battery power / OCV; voltage sag and I²R temperature are diagnostic approximations, not a coupled electrical solver.",
  "Constant capacity except timed fault windows. Capacity loss removes excess stored energy explicitly; recovery never creates energy.",
  "SOC bias affects onboard decisions. Telemetry dropout affects ground observations only. Bias detection uses truth as a teaching oracle, unavailable to real operators.",
  "A deferred activity is skipped, not rescheduled. Mission completion requires every activity completed, no unmet load and no undervoltage interval.",
  "Lumped thermal model is uncalibrated; no radiation, electrochemistry, battery safety prediction, SOH or RUL estimate.",
] as const;
export function orbitalPeriodSeconds(altitudeKm: number) {
  if (!Number.isFinite(altitudeKm) || altitudeKm < 0)
    throw new Error("Altitude must be finite and nonnegative.");
  return 2 * Math.PI * Math.sqrt((6371 + altitudeKm) ** 3 / 398600.4418);
}
export function isSunlit(
  timeSeconds: number,
  periodSeconds: number,
  eclipseMinutes: number,
) {
  return timeSeconds % periodSeconds < periodSeconds - eclipseMinutes * 60;
}
export function openCircuitVoltage(
  soc: number,
  curve: Scenario["battery"]["ocvCurve"],
) {
  const p = Math.min(100, Math.max(0, soc));
  for (let i = 1; i < curve.length; i++)
    if (p <= curve[i].socPercent) {
      const a = curve[i - 1],
        b = curve[i];
      return (
        a.voltageV +
        ((b.voltageV - a.voltageV) * (p - a.socPercent)) /
          (b.socPercent - a.socPercent)
      );
    }
  return curve[curve.length - 1].voltageV;
}
export function batteryStep(
  energyWh: number,
  maxWh: number,
  netW: number,
  dt: number,
  chargeEfficiency: number,
  dischargeEfficiency: number,
) {
  const hours = dt / 3600;
  if (netW >= 0) {
    const offered = netW * hours;
    const stored = Math.min(
      Math.max(0, maxWh - energyWh),
      offered * chargeEfficiency,
    );
    const accepted = stored / chargeEfficiency;
    return {
      energyWh: energyWh + stored,
      rejectedWh: Math.max(0, offered - accepted),
      unmetWh: 0,
      lossWh: accepted - stored,
      throughputWh: stored,
    };
  }
  const demanded = -netW * hours,
    withdrawn = Math.min(energyWh, demanded / dischargeEfficiency),
    delivered = withdrawn * dischargeEfficiency;
  return {
    energyWh: energyWh - withdrawn,
    rejectedWh: 0,
    unmetWh: Math.max(0, demanded - delivered),
    lossWh: withdrawn - delivered,
    throughputWh: withdrawn,
  };
}
export interface ControlState {
  safe: boolean;
  recoverySince: number | null;
}
export function stateTransition(
  state: ControlState,
  soc: number,
  time: number,
  battery: Scenario["battery"],
) {
  if (!state.safe && soc < battery.safeModeSocPercent)
    return { safe: true, recoverySince: null };
  if (state.safe && soc >= battery.recoverySocPercent) {
    const since = state.recoverySince ?? time;
    return time - since >= battery.recoveryDwellSeconds
      ? { safe: false, recoverySince: null }
      : { safe: true, recoverySince: since };
  }
  return { safe: state.safe, recoverySince: null };
}
export function activeFaults(faults: Fault[], time: number) {
  return faults.filter(
    (f) => time >= f.startSecond && time < f.startSecond + f.durationSeconds,
  );
}
export interface Sample {
  timeSeconds: number;
  orbitNumber: number;
  orbitPhase: number;
  sunlight: boolean;
  mode: MissionMode;
  solarW: number;
  loadW: number;
  batteryW: number;
  currentA: number;
  socPercent: number;
  observedSocPercent: number | null;
  dodPercent: number;
  voltageV: number;
  temperatureC: number | null;
  detector: string;
  activeFaultIds: string[];
  energyWh: number;
}
export interface SimEvent {
  timeSeconds: number;
  kind: "mode" | "fault" | "warning" | "activity";
  message: string;
}
export interface ActivityResult {
  id: string;
  mode: MissionMode;
  status: "completed" | "deferred" | "failed";
  servedSeconds: number;
  requestedSeconds: number;
}
export interface Metrics {
  minSocPercent: number;
  maxSocPercent: number;
  finalSocPercent: number;
  maxDodPercent: number;
  generatedWh: number;
  consumedWh: number;
  batteryFinalWh: number;
  rejectedWh: number;
  unmetWh: number;
  conversionLossWh: number;
  capacityRemovedWh: number;
  energyResidualWh: number;
  belowReserveSeconds: number;
  brownoutEvents: number;
  brownoutSeconds: number;
  minVoltageV: number;
  minTemperatureC: number | null;
  maxTemperatureC: number | null;
  safeEntries: number;
  safeExits: number;
  throughputWh: number;
  equivalentFullCycles: number;
  energyMarginWh: number;
  missionCompleted: boolean;
  perOrbit: { orbit: number; marginWh: number; durationSeconds: number }[];
}
export interface SimulationResult {
  schemaVersion: "1.0";
  scenario: Scenario;
  assumptions: readonly string[];
  periodSeconds: number;
  samples: Sample[];
  events: SimEvent[];
  activities: ActivityResult[];
  metrics: Metrics;
}
export function simulate(input: Scenario): SimulationResult {
  const s = validateScenario(input),
    b = s.battery,
    period = orbitalPeriodSeconds(s.orbit.altitudeKm);
  let energy = (b.nominalEnergyWh * b.initialSocPercent) / 100,
    temp = s.thermal.initialC,
    state: ControlState = { safe: false, recoverySince: null };
  const initialEnergy = energy,
    samples: Sample[] = [],
    events: SimEvent[] = [];
  const activities: ActivityResult[] = s.activities.map((a) => ({
    id: a.id,
    mode: a.mode,
    status: "completed",
    servedSeconds: 0,
    requestedSeconds: a.durationSeconds,
  }));
  const m: Metrics = {
    minSocPercent: 100,
    maxSocPercent: 0,
    finalSocPercent: 0,
    maxDodPercent: 0,
    generatedWh: 0,
    consumedWh: 0,
    batteryFinalWh: 0,
    rejectedWh: 0,
    unmetWh: 0,
    conversionLossWh: 0,
    capacityRemovedWh: 0,
    energyResidualWh: 0,
    belowReserveSeconds: 0,
    brownoutEvents: 0,
    brownoutSeconds: 0,
    minVoltageV: Infinity,
    minTemperatureC: s.thermal.enabled ? temp : null,
    maxTemperatureC: s.thermal.enabled ? temp : null,
    safeEntries: 0,
    safeExits: 0,
    throughputWh: 0,
    equivalentFullCycles: 0,
    energyMarginWh: 0,
    missionCompleted: false,
    perOrbit: [],
  };
  const times = new Set<number>([0, s.durationSeconds]);
  for (let t = 0; t < s.durationSeconds; t += s.timeStepSeconds) times.add(t);
  for (const e of [...s.activities, ...s.faults]) {
    times.add(e.startSecond);
    times.add(e.startSecond + e.durationSeconds);
  }
  // Split all orbit/eclipse boundaries, including fault-modified eclipse windows.
  const faultBoundaries = [
    0,
    ...s.faults.flatMap((f) => [
      f.startSecond,
      f.startSecond + f.durationSeconds,
    ]),
  ];
  const eclipseLengths = [
    ...new Set(
      faultBoundaries.map((t) =>
        Math.min(
          period / 60,
          s.orbit.eclipseDurationMinutes +
            activeFaults(s.faults, t)
              .filter((f) => f.type === "extended-eclipse")
              .reduce((sum, f) => sum + f.severity, 0),
        ),
      ),
    ),
  ];
  for (let orbit = 0; orbit * period < s.durationSeconds; orbit++) {
    times.add(orbit * period);
    for (const e of eclipseLengths) times.add(orbit * period + period - e * 60);
  }
  const ordered = [...times]
    .filter((t) => t >= 0 && t <= s.durationSeconds)
    .sort((a, b) => a - b);
  let previousMode: MissionMode | undefined,
    previousFaults = "",
    brownout = false,
    warned = false;
  for (let index = 0; index < ordered.length; index++) {
    const t = ordered[index],
      dt = (ordered[index + 1] ?? t) - t,
      faults = activeFaults(s.faults, t);
    const sum = (type: Fault["type"]) =>
      faults.filter((f) => f.type === type).reduce((n, f) => n + f.severity, 0);
    const factor = (type: Fault["type"]) =>
      faults
        .filter((f) => f.type === type)
        .reduce((n, f) => n * (1 - f.severity), 1);
    const capacity = b.nominalEnergyWh * factor("capacity-fade"),
      maxEnergy = (capacity * b.maximumSocPercent) / 100;
    if (energy > maxEnergy) {
      m.capacityRemovedWh += energy - maxEnergy;
      energy = maxEnergy;
    }
    const soc = (100 * energy) / capacity,
      sensedSoc = Math.min(100, Math.max(0, soc + sum("soc-bias")));
    const nextState = stateTransition(state, sensedSoc, t, b);
    if (!state.safe && nextState.safe) {
      m.safeEntries++;
      events.push({
        timeSeconds: t,
        kind: "warning",
        message:
          "Safe mode entered: sensed SOC below entry threshold; nonessential activities suspended.",
      });
    }
    if (state.safe && !nextState.safe) {
      m.safeExits++;
      events.push({
        timeSeconds: t,
        kind: "warning",
        message:
          "Safe mode exited: recovery threshold held for the configured dwell time.",
      });
    }
    state = nextState;
    const constrained = sensedSoc < b.minimumReserveSocPercent;
    if (constrained && !warned)
      events.push({
        timeSeconds: t,
        kind: "warning",
        message:
          "Energy constrained: noncritical payload and downlink are deferred.",
      });
    warned = constrained;
    const activityIndex = s.activities.findIndex(
        (a) => t >= a.startSecond && t < a.startSecond + a.durationSeconds,
      ),
      activity = s.activities[activityIndex];
    const defer =
      !!activity &&
      !activity.critical &&
      constrained &&
      ["payload", "downlink"].includes(activity.mode);
    const mode: MissionMode = state.safe
      ? "safe"
      : defer
        ? "recovery"
        : (activity?.mode ?? "nominal");
    if (mode !== previousMode) {
      events.push({
        timeSeconds: t,
        kind: "mode",
        message: `${previousMode ?? "initial"} → ${mode}${activity ? ` · ${activity.id}` : ""}`,
      });
      previousMode = mode;
    }
    const faultIds = faults.map((f) => f.id).join(",");
    if (faultIds !== previousFaults) {
      events.push({
        timeSeconds: t,
        kind: "fault",
        message: faults.length
          ? `Active injection: ${faults.map((f) => FAULT_INFO[f.type].name).join(", ")}`
          : "Fault window ended.",
      });
      previousFaults = faultIds;
    }
    const eclipse = Math.min(
      period / 60,
      s.orbit.eclipseDurationMinutes + sum("extended-eclipse"),
    );
    const sunlight = isSunlit(t, period, eclipse);
    const peak =
      s.solar.mode === "peak-power"
        ? s.solar.peakPowerW
        : s.solar.irradianceWm2 *
          s.solar.areaM2 *
          s.solar.cellEfficiency *
          Math.max(0, Math.cos((s.solar.incidenceDeg * Math.PI) / 180));
    const solarW =
      (sunlight ? peak : 0) *
      s.solar.pmadEfficiency *
      s.solar.degradationFactor *
      factor("solar-degradation") *
      factor("panel-loss");
    const essential = s.loads.find((l) => l.id === "essential")?.powerW ?? 0;
    const nominal = s.loads
      .filter((l) => l.alwaysOn)
      .reduce((n, l) => n + l.powerW, 0);
    let loadW =
      mode === "off"
        ? 0
        : ["safe", "recovery", "boot"].includes(mode)
          ? essential
          : nominal;
    if (mode === "detumble")
      loadW += s.loads.find((l) => l.id === "adcs")?.powerW ?? 0;
    if (mode === "payload")
      loadW += s.loads.find((l) => l.id === "payload")?.powerW ?? 0;
    if (mode === "downlink")
      loadW += s.loads.find((l) => l.id === "radio")?.powerW ?? 0;
    loadW += sum("load-spike") + sum("heater-stuck") + sum("payload-overrun");
    const batteryW = loadW - solarW,
      ocv = openCircuitVoltage(soc, b.ocvCurve),
      resistance = b.internalResistanceOhm * (1 + sum("resistance-rise"));
    const currentA =
      (energy <= 0 && batteryW > 0) || (energy >= maxEnergy && batteryW < 0)
        ? 0
        : batteryW / ocv;
    const voltageV =
      energy <= 0 && batteryW > 0 ? 0 : ocv - currentA * resistance;
    const observedSocPercent = faults.some(
      (f) => f.type === "telemetry-dropout",
    )
      ? null
      : sensedSoc;
    const detector =
      observedSocPercent === null
        ? "Telemetry missing"
        : Math.abs(observedSocPercent - soc) > 5
          ? "SOC discrepancy (truth-assisted)"
          : voltageV < b.undervoltageV
            ? "Undervoltage"
            : soc < b.minimumReserveSocPercent
              ? "Low reserve"
              : "No threshold alert";
    const sample: Sample = {
      timeSeconds: t,
      orbitNumber: Math.floor(t / period) + 1,
      orbitPhase: (t % period) / period,
      sunlight,
      mode,
      solarW,
      loadW,
      batteryW,
      currentA,
      socPercent: soc,
      observedSocPercent,
      dodPercent: 100 - soc,
      voltageV,
      temperatureC: s.thermal.enabled ? temp : null,
      detector,
      activeFaultIds: faults.map((f) => f.id),
      energyWh: energy,
    };
    samples.push(sample);
    m.minSocPercent = Math.min(m.minSocPercent, soc);
    m.maxSocPercent = Math.max(m.maxSocPercent, soc);
    m.minVoltageV = Math.min(m.minVoltageV, voltageV);
    if (s.thermal.enabled) {
      m.minTemperatureC = Math.min(m.minTemperatureC!, temp);
      m.maxTemperatureC = Math.max(m.maxTemperatureC!, temp);
    }
    if (dt <= 0) continue;
    const result = batteryStep(
      energy,
      maxEnergy,
      -batteryW,
      dt,
      b.chargeEfficiency * factor("charge-loss"),
      b.dischargeEfficiency,
    );
    const isBrownout = result.unmetWh > 1e-9 || voltageV < b.undervoltageV;
    if (isBrownout && !brownout) {
      m.brownoutEvents++;
      events.push({
        timeSeconds: t,
        kind: "warning",
        message: "Brownout / undervoltage interval began.",
      });
    }
    brownout = isBrownout;
    if (isBrownout) m.brownoutSeconds += dt;
    if (soc < b.minimumReserveSocPercent) m.belowReserveSeconds += dt;
    if (activity) {
      const a = activities[activityIndex];
      if (isBrownout) a.status = "failed";
      else if (defer || (state.safe && activity.mode !== "safe")) {
        if (a.status !== "failed") a.status = "deferred";
      } else a.servedSeconds += dt;
    }
    m.generatedWh += (solarW * dt) / 3600;
    m.consumedWh += (loadW * dt) / 3600;
    m.rejectedWh += result.rejectedWh;
    m.unmetWh += result.unmetWh;
    m.conversionLossWh += result.lossWh;
    m.throughputWh += result.throughputWh;
    const orbit = Math.floor(t / period),
      margin = ((solarW - loadW) * dt) / 3600;
    m.perOrbit[orbit] ??= { orbit: orbit + 1, marginWh: 0, durationSeconds: 0 };
    m.perOrbit[orbit].marginWh += margin;
    m.perOrbit[orbit].durationSeconds += dt;
    energy = result.energyWh;
    if (s.thermal.enabled)
      temp +=
        (dt / s.thermal.capacitanceJPerK) *
        (currentA * currentA * resistance +
          s.thermal.externalHeatW -
          (temp - s.thermal.busC) / s.thermal.resistanceKPerW);
  }
  for (const a of activities) {
    const activity = s.activities.find((x) => x.id === a.id)!;
    events.push({
      timeSeconds: activity.startSecond + activity.durationSeconds,
      kind: "activity",
      message: `${a.id}: ${a.status} (${a.servedSeconds.toFixed(0)} / ${a.requestedSeconds} s served).`,
    });
  }
  m.finalSocPercent = samples.at(-1)!.socPercent;
  m.maxDodPercent = 100 - m.minSocPercent;
  m.batteryFinalWh = energy;
  m.equivalentFullCycles = m.throughputWh / (2 * b.nominalEnergyWh);
  m.energyMarginWh = m.generatedWh - m.consumedWh;
  m.energyResidualWh =
    initialEnergy +
    m.generatedWh -
    (m.consumedWh - m.unmetWh) -
    m.rejectedWh -
    m.conversionLossWh -
    m.capacityRemovedWh -
    energy;
  m.missionCompleted =
    activities.every((a) => a.status === "completed") &&
    m.unmetWh < 1e-9 &&
    m.brownoutEvents === 0;
  return {
    schemaVersion: "1.0",
    scenario: s,
    assumptions: ASSUMPTIONS,
    periodSeconds: period,
    samples,
    events: events.sort((a, b) => a.timeSeconds - b.timeSeconds),
    activities,
    metrics: m,
  };
}
export function seededRandom(seed: number) {
  let x = seed >>> 0;
  return () => {
    x = (Math.imul(1664525, x) + 1013904223) >>> 0;
    return x / 4294967296;
  };
}
export interface MonteCarloResult {
  seed: number;
  trials: number;
  uncertaintyPercent: number;
  completionProbability: number;
  belowReserveProbability: number;
  minimumSocDistribution: number[];
  completionInterval95: [number, number];
}
export function runMonteCarlo(
  input: Scenario,
  trials = 50,
  uncertaintyPercent = 10,
): MonteCarloResult {
  const scenario = validateScenario(input);
  if (
    !Number.isInteger(trials) ||
    trials < 1 ||
    trials > 100 ||
    !Number.isFinite(uncertaintyPercent) ||
    uncertaintyPercent < 0 ||
    uncertaintyPercent > 30
  )
    throw new Error("Use 1–100 trials and 0–30% uncertainty.");
  const rng = seededRandom(scenario.seed),
    distribution: number[] = [];
  let completed = 0,
    below = 0;
  for (let i = 0; i < trials; i++) {
    const s = JSON.parse(JSON.stringify(scenario)) as Scenario;
    const scale = () => 1 + ((rng() * 2 - 1) * uncertaintyPercent) / 100;
    s.battery.nominalEnergyWh = Math.min(
      500,
      Math.max(1, s.battery.nominalEnergyWh * scale()),
    );
    s.battery.internalResistanceOhm = Math.min(
      1,
      s.battery.internalResistanceOhm * scale(),
    );
    if (s.solar.mode === "peak-power")
      s.solar.peakPowerW = Math.min(200, s.solar.peakPowerW * scale());
    else
      s.solar.areaM2 = Math.min(0.5, Math.max(0.001, s.solar.areaM2 * scale()));
    const loadScale = scale();
    s.loads = s.loads.map((l) => ({
      ...l,
      powerW: Math.min(100, l.powerW * loadScale),
    }));
    const r = simulate(s);
    distribution.push(r.metrics.minSocPercent);
    if (r.metrics.missionCompleted) completed++;
    if (r.metrics.minSocPercent < s.battery.minimumReserveSocPercent) below++;
  }
  const p = completed / trials,
    z = 1.96,
    d = 1 + (z * z) / trials,
    center = (p + (z * z) / (2 * trials)) / d,
    half =
      (z *
        Math.sqrt((p * (1 - p)) / trials + (z * z) / (4 * trials * trials))) /
      d;
  return {
    seed: scenario.seed,
    trials,
    uncertaintyPercent,
    completionProbability: p,
    belowReserveProbability: below / trials,
    minimumSocDistribution: distribution,
    completionInterval95: [
      Math.max(0, center - half),
      Math.min(1, center + half),
    ],
  };
}
