// Pressure, the thread through the whole tutorial: where it is measured, what
// each measurement means, and what each pressure difference says about health.
//
// Reference values are the design point of the page's own reduced-order model,
// as a percentage of reference chamber pressure. They are REFERENCE VALUES for
// teaching, not operating pressures of any engine; a test keeps them equal to
// the model.
import type { ChannelId } from "../simulation/channels";
import type { FaultId } from "../simulation/isolation";
import type { Concept, SubsystemId } from "../types";

export const PRESSURE_UNIT = "% Pc,ref";
export const PRESSURE_UNIT_NOTE = "Percent of reference chamber pressure. The reference chamber pressure is 100 by definition; no absolute pressure is implied.";

/** Range classes stand in for operating ranges, which the page deliberately does not give. */
export type RangeClass = "LOW" | "MEDIUM" | "HIGH" | "VERY HIGH";

export interface SensorClass {
  id: "static_low" | "dynamic_high" | "chamber" | "hot_gas";
  sampling: string;
  accuracy: string;
  redundancy: string;
  calibration: string;
  noise: string;
  drift: string;
  bias: string;
}

/** Characteristics shared by sensors doing the same kind of job. Concepts, not specifications. */
export const SENSOR_CLASSES: Record<SensorClass["id"], SensorClass> = {
  static_low: {
    id: "static_low",
    sampling: "Slow: the quantity changes over seconds. Tens of samples per second is ample.",
    accuracy: "A small absolute error matters here, because the whole reading is small and suction margin is a difference of small numbers.",
    redundancy: "Usually duplicated where the reading gates start or protects a pump.",
    calibration: "Zero and span checked against a reference before each test campaign; zero re-checked with the system vented.",
    noise: "Low. Flow turbulence and pump inlet pulsation are the main sources.",
    drift: "Slow zero drift with temperature, which is significant at cryogenic conditions.",
    bias: "A fixed offset shifts suction margin directly, so it is trimmed out at a known condition.",
  },
  dynamic_high: {
    id: "dynamic_high",
    sampling: "Fast: hundreds to thousands of samples per second for control and transients, far more if pulsation is to be resolved.",
    accuracy: "A fraction of a percent of full scale. Differences between two such sensors need both to be accurate.",
    redundancy: "Duplicated where used for control or redlines; otherwise cross-checked against neighbours through the model.",
    calibration: "Multi-point calibration against a pressure standard, with the sense-line length and temperature recorded.",
    noise: "Pump blade-pass pulsation and line acoustics ride on the signal; anti-alias filtering precedes sampling.",
    drift: "Zero and sensitivity drift with temperature and with pressure cycling.",
    bias: "Appears in every pressure difference the sensor takes part in, which is how the twin can find it.",
  },
  chamber: {
    id: "chamber",
    sampling: "Fast for control, and very fast on a separate dynamic sensor if combustion stability is monitored.",
    accuracy: "The tightest of any pressure measurement: thrust and mixture control are referred to it.",
    redundancy: "Two or more independent sensors, voted. A virtual sensor from the model can referee between them.",
    calibration: "Calibrated before the campaign and checked after each test against a reference condition.",
    noise: "Combustion roughness adds broadband noise; sense lines add their own resonance.",
    drift: "Thermal soak through the mounting and sense line drives drift during and after a firing.",
    bias: "A biased chamber pressure reading moves the whole engine if it is used for closed-loop control.",
  },
  hot_gas: {
    id: "hot_gas",
    sampling: "Fast: the turbine drive responds within tenths of a second.",
    accuracy: "Moderate. The ratio across the turbine matters more than either absolute value.",
    redundancy: "Often single, cross-checked against shaft speed and pump power through the model.",
    calibration: "Calibrated cold; hot behaviour is corrected with a characterised thermal zero shift.",
    noise: "Combustion noise from the preburner and turbine blade-pass pulsation.",
    drift: "Strong thermal zero shift: the sensor sees the hottest gas of any pressure sensor.",
    bias: "Shifts the apparent turbine pressure ratio, and so the apparent turbine power.",
  },
};

export interface PressureSensor {
  id: ChannelId;
  tag: string;
  name: string;
  subsystem: SubsystemId;
  location: string;
  cls: SensorClass["id"];
  rangeClass: RangeClass;
  /** Design-point value of the reference model. */
  reference: number;
  measures: string;
  purpose: string;
  /** What the value means to an engineer reading it. */
  meaning: string;
  /** How it normally moves. */
  trend: string;
  /** The physics that sets it. */
  physics: string;
  failureSignature: string;
  twinUse: string;
  /** Faults in the lab that move this measurement. */
  faults: readonly FaultId[];
}

export const PRESSURE_SENSORS: readonly PressureSensor[] = [
  {
    id: "pTankOx",
    tag: "PT-OX-01",
    name: "Oxidiser tank pressure",
    subsystem: "storage",
    location: "Oxidiser tank ullage, above the liquid",
    cls: "static_low",
    rangeClass: "LOW",
    reference: 5,
    measures: "Gas pressure above the oxidiser.",
    purpose: "Confirms the pressurisation system is holding the tank at the pressure the pump inlet needs.",
    meaning: "The boundary condition of the whole oxidiser branch. Everything downstream starts from it.",
    trend: "Held steady by the pressurisation regulator; sags briefly at start as outflow begins.",
    physics: "A balance of pressurant gas flowing in and ullage volume growing as liquid leaves.",
    failureSignature: "A slow decay with outflow continuing: the regulator or pressurant supply is not keeping up.",
    twinUse: "Boundary condition of the feed model, and the first input to suction-margin estimation.",
    faults: ["feed_pressure_reduction"],
  },
  {
    id: "pTankFu",
    tag: "PT-FU-01",
    name: "Fuel tank pressure",
    subsystem: "storage",
    location: "Fuel tank ullage, above the liquid",
    cls: "static_low",
    rangeClass: "LOW",
    reference: 4,
    measures: "Gas pressure above the fuel.",
    purpose: "Confirms the fuel tank is pressurised for start and held there while it drains.",
    meaning: "The boundary condition of the fuel branch.",
    trend: "Steady in mainstage, like its oxidiser counterpart.",
    physics: "Pressurant inflow against a growing ullage volume.",
    failureSignature: "Pressure decay, or a rise if a vent or relief device fails to open.",
    twinUse: "Boundary condition of the fuel feed model.",
    faults: [],
  },
  {
    id: "pInOx",
    tag: "PT-OX-02",
    name: "Oxidiser pump inlet pressure",
    subsystem: "feed",
    location: "Feed line, immediately upstream of the oxidiser pump",
    cls: "static_low",
    rangeClass: "LOW",
    reference: 4.2,
    measures: "Static pressure of the liquid entering the pump.",
    purpose: "Shows how much pressure margin the liquid has above its vapour pressure as it enters the pump.",
    meaning: "The cavitation margin. If it falls too far the liquid boils at the pump inlet and the pump loses head.",
    trend: "Tank pressure less a small feed-line loss that grows with flow squared.",
    physics: "Tank pressure minus line, filter and valve losses; compared with vapour pressure it gives net positive suction head.",
    failureSignature: "Falls while tank pressure holds: a restriction in the feed line. Falls with tank pressure: a pressurisation fault.",
    twinUse: "Input to the pump model and to the suction-margin estimate that prognostics projects forward.",
    faults: ["feed_pressure_reduction"],
  },
  {
    id: "pInFu",
    tag: "PT-FU-02",
    name: "Fuel pump inlet pressure",
    subsystem: "feed",
    location: "Feed line, immediately upstream of the fuel pump",
    cls: "static_low",
    rangeClass: "LOW",
    reference: 3.4,
    measures: "Static pressure of the fuel entering the pump.",
    purpose: "Gives the fuel pump's suction margin.",
    meaning: "The fuel-side cavitation margin.",
    trend: "Tank pressure less feed-line loss.",
    physics: "The same loss relation as the oxidiser side, with the fuel's own vapour pressure.",
    failureSignature: "A fall with steady tank pressure points at the feed line or its filter.",
    twinUse: "Input to the fuel pump model.",
    faults: [],
  },
  {
    id: "pOutOx",
    tag: "PT-OX-03",
    name: "Oxidiser pump discharge pressure",
    subsystem: "turbomachinery",
    location: "Oxidiser pump volute outlet",
    cls: "dynamic_high",
    rangeClass: "VERY HIGH",
    reference: 195,
    measures: "Pressure of the oxidiser leaving the pump.",
    purpose: "Shows the pressure the pump adds; with inlet pressure it gives pump pressure rise.",
    meaning: "The pump's output. Compared with shaft speed and flow it says whether the pump is performing to its curve.",
    trend: "Rises roughly with the square of shaft speed; falls a little as flow increases.",
    physics: "Inlet pressure plus pump head, which scales with speed squared less a flow-dependent loss.",
    failureSignature: "Low for the speed and flow: pump degradation or cavitation. High with reduced flow: a restriction downstream.",
    twinUse: "Used with inlet pressure, speed and flow to estimate the pump head coefficient, a hidden health state.",
    faults: ["pump_degradation", "feed_pressure_reduction", "injector_restriction", "sensor_noise"],
  },
  {
    id: "pOutFu",
    tag: "PT-FU-03",
    name: "Fuel pump discharge pressure",
    subsystem: "turbomachinery",
    location: "Fuel pump volute outlet, upstream of the main fuel valve",
    cls: "dynamic_high",
    rangeClass: "VERY HIGH",
    reference: 230,
    measures: "Pressure of the fuel leaving the pump.",
    purpose: "Shows the pressure available to drive fuel through the valve, the cooling jacket and the injector.",
    meaning: "Usually the highest pressure in the engine, because the fuel has the longest path to the chamber.",
    trend: "Follows shaft speed squared; rises when anything downstream restricts the flow.",
    physics: "Inlet pressure plus fuel pump head.",
    failureSignature: "Rises while fuel flow falls: a restriction downstream, in the valve, the cooling channels or the injector.",
    twinUse: "Upstream reference for the valve loss coefficient; also the main fuel valve's upstream pressure.",
    faults: ["valve_restriction", "cooling_restriction"],
  },
  {
    id: "pCoolIn",
    tag: "PT-FU-04",
    name: "Cooling circuit inlet pressure",
    subsystem: "cooling",
    location: "Coolant inlet manifold at the nozzle, downstream of the main fuel valve",
    cls: "dynamic_high",
    rangeClass: "VERY HIGH",
    reference: 216,
    measures: "Pressure of the fuel entering the cooling channels.",
    purpose: "Upstream side of the cooling pressure drop, and downstream side of the main fuel valve.",
    meaning: "What is left of pump discharge pressure after the valve.",
    trend: "Tracks pump discharge less the valve's loss.",
    physics: "Discharge pressure minus the valve loss, which depends on valve opening and flow squared.",
    failureSignature: "Falls relative to pump discharge while flow falls: the valve is restricting.",
    twinUse: "Shared between two inferred parameters: the valve loss coefficient and the cooling loss coefficient.",
    faults: ["valve_restriction", "cooling_restriction"],
  },
  {
    id: "pCoolOut",
    tag: "PT-FU-05",
    name: "Cooling circuit outlet pressure",
    subsystem: "cooling",
    location: "Coolant outlet manifold, at the injector end of the chamber",
    cls: "dynamic_high",
    rangeClass: "HIGH",
    reference: 132,
    measures: "Pressure of the warmed fuel leaving the cooling channels.",
    purpose: "Downstream side of the cooling pressure drop.",
    meaning: "With the inlet reading it gives the largest single pressure loss on the fuel path.",
    trend: "Well below cooling inlet; the gap widens with flow squared.",
    physics: "Friction and turning losses in narrow channels, with the fuel's density falling as it is heated.",
    failureSignature: "Falls relative to cooling inlet at constant flow: the channels are restricted.",
    twinUse: "Gives the cooling loss coefficient, the health state behind the cooling-channel restriction scenario.",
    faults: ["cooling_restriction"],
  },
  {
    id: "pInjFu",
    tag: "PT-FU-06",
    name: "Injector fuel manifold pressure",
    subsystem: "injector",
    location: "Fuel manifold behind the injector face",
    cls: "dynamic_high",
    rangeClass: "HIGH",
    reference: 120,
    measures: "Pressure of the fuel about to be injected.",
    purpose: "Upstream side of the fuel injector pressure drop.",
    meaning: "Injector pressure drop isolates the feed system from chamber pressure oscillations; too little and they couple.",
    trend: "Sits a fixed fraction above chamber pressure at a given flow.",
    physics: "Chamber pressure plus the injector's loss, proportional to flow squared.",
    failureSignature: "Rises relative to chamber pressure at constant flow: injector passages are restricted.",
    twinUse: "One of three routes to a virtual chamber pressure, by subtracting the calibrated injector drop.",
    faults: [],
  },
  {
    id: "pInjOx",
    tag: "PT-OX-04",
    name: "Injector oxidiser manifold pressure",
    subsystem: "injector",
    location: "Oxidiser manifold behind the injector face, downstream of the main oxidiser valve",
    cls: "dynamic_high",
    rangeClass: "HIGH",
    reference: 122,
    measures: "Pressure of the oxidiser about to be injected.",
    purpose: "Upstream side of the oxidiser injector pressure drop, and downstream side of the main oxidiser valve.",
    meaning: "With chamber pressure it gives oxidiser injector pressure drop, a direct indicator of injector condition.",
    trend: "A fixed fraction above chamber pressure at a given flow.",
    physics: "Chamber pressure plus injector loss.",
    failureSignature: "Rises relative to chamber pressure while oxidiser flow falls: an injector restriction.",
    twinUse: "Gives the oxidiser injector loss coefficient, and a second route to virtual chamber pressure.",
    faults: ["injector_restriction", "pump_degradation"],
  },
  {
    id: "pcA",
    tag: "PT-CH-01A",
    name: "Chamber pressure, sensor A",
    subsystem: "chamber",
    location: "Combustion chamber wall, near the injector end",
    cls: "chamber",
    rangeClass: "HIGH",
    reference: 100,
    measures: "Static pressure of the burning gas.",
    purpose: "Primary thrust and performance measurement, and the reference for control.",
    meaning: "The engine's headline number. For a choked nozzle it is proportional to propellant mass flow times combustion efficiency.",
    trend: "Follows throttle command with a short lag; steady in mainstage.",
    physics: "Mass flow in, set by the pumps and injector, against mass flow out through the choked throat.",
    failureSignature: "Falls alone, with sensor B, the thrust proxy and the model unchanged: the sensor, not the engine.",
    twinUse: "Fused with sensor B into the estimated chamber pressure, after a vote refereed by the virtual sensor.",
    faults: ["pc_sensor_drift", "pump_degradation", "injector_restriction", "combustion_loss", "feed_pressure_reduction"],
  },
  {
    id: "pcB",
    tag: "PT-CH-01B",
    name: "Chamber pressure, sensor B",
    subsystem: "chamber",
    location: "Combustion chamber wall, on a separate port from sensor A",
    cls: "chamber",
    rangeClass: "HIGH",
    reference: 100,
    measures: "Static pressure of the burning gas, independently of sensor A.",
    purpose: "Hardware redundancy for the most important measurement on the engine.",
    meaning: "Agreement with sensor A is evidence about the sensors; a common change is evidence about the engine.",
    trend: "Identical to sensor A within the two sensors' noise.",
    physics: "The same chamber, a separate sense line and transducer.",
    failureSignature: "A growing difference from sensor A: one of the two has a fault, and something else must say which.",
    twinUse: "The second vote. The model's virtual sensor decides which sensor is right when they disagree.",
    faults: ["pump_degradation", "injector_restriction", "combustion_loss", "feed_pressure_reduction"],
  },
  {
    id: "pPb",
    tag: "PT-HG-01",
    name: "Preburner pressure",
    subsystem: "hot_gas",
    location: "Preburner chamber, in architectures that use one",
    cls: "hot_gas",
    rangeClass: "VERY HIGH",
    reference: 168,
    measures: "Pressure of the gas generated to drive the turbine.",
    purpose: "Shows the state of the turbine drive: it must sit below pump discharge and above turbine inlet.",
    meaning: "The source pressure of turbine power.",
    trend: "Rises with throttle, ahead of chamber pressure during start.",
    physics: "Its own small combustion balance, fed from both pump discharges.",
    failureSignature: "An unexpected transient, or a level that does not match the valve commanding it.",
    twinUse: "Boundary of the turbine model.",
    faults: [],
  },
  {
    id: "pTi",
    tag: "PT-HG-02",
    name: "Turbine inlet pressure",
    subsystem: "hot_gas",
    location: "Hot-gas duct at the turbine inlet manifold",
    cls: "hot_gas",
    rangeClass: "VERY HIGH",
    reference: 165,
    measures: "Pressure of the hot gas entering the turbine.",
    purpose: "With turbine outlet pressure it gives turbine pressure ratio, and so turbine power.",
    meaning: "The numerator of turbine pressure ratio.",
    trend: "Just below preburner pressure.",
    physics: "Preburner pressure minus duct loss.",
    failureSignature: "A pressure ratio that no longer matches shaft speed: turbine performance has changed.",
    twinUse: "Input to the turbine power estimate that is balanced against pump power.",
    faults: [],
  },
  {
    id: "pTo",
    tag: "PT-HG-03",
    name: "Turbine outlet pressure",
    subsystem: "hot_gas",
    location: "Turbine exhaust duct, upstream of the main injector",
    cls: "hot_gas",
    rangeClass: "HIGH",
    reference: 110,
    measures: "Pressure of the gas leaving the turbine.",
    purpose: "Denominator of turbine pressure ratio; in a closed cycle it must still exceed chamber pressure.",
    meaning: "How much pressure the turbine has taken out of the gas.",
    trend: "Sits above chamber pressure by the hot-gas injector drop.",
    physics: "Chamber pressure plus the loss of the path the exhaust takes into the chamber.",
    failureSignature: "A changed ratio to turbine inlet at the same speed.",
    twinUse: "Input to the turbine pressure-ratio check.",
    faults: [],
  },
];

export const SENSOR_BY_ID = Object.fromEntries(PRESSURE_SENSORS.map((s) => [s.id, s])) as Partial<Record<ChannelId, PressureSensor>>;

/** Valve upstream and downstream pressures use sensors already on the list. */
export const VALVE_TAPS = [
  { valve: "Main fuel valve", upstream: "pOutFu", downstream: "pCoolIn" },
  { valve: "Main oxidiser valve", upstream: "pOutOx", downstream: "pInjOx" },
] as const satisfies readonly { valve: string; upstream: ChannelId; downstream: ChannelId }[];

export interface PathStep {
  id: string;
  label: string;
  /** The sensor read at this step, where there is one. */
  sensor?: ChannelId;
  /** Reference value where no sensor is read (computed points). */
  reference?: number;
  kind: "node" | "rise" | "loss";
  text: string;
}

/** One educational pressure path, followed along the oxidiser side from tank to environment. */
export const PRESSURE_PATH: readonly PathStep[] = [
  { id: "tank", label: "Tank pressure", sensor: "pTankOx", kind: "node", text: "A few percent of chamber pressure. The tank only has to keep the pump inlet above the liquid's vapour pressure, which lets the tank walls stay thin." },
  { id: "pump_inlet", label: "Pump inlet pressure", sensor: "pInOx", kind: "loss", text: "Slightly below tank pressure: the feed line, filter and isolation valve take a small loss that grows with flow squared. What is left above vapour pressure is the suction margin." },
  { id: "pump", label: "Pump", kind: "rise", text: "The pump does the work. Shaft power from the turbine raises the liquid's pressure by far more than everything upstream supplied." },
  { id: "pump_discharge", label: "Pump discharge pressure", sensor: "pOutOx", kind: "node", text: "The highest pressure on this branch, well above chamber pressure, because everything downstream takes pressure away." },
  { id: "valve_line", label: "Valve and line losses", kind: "loss", text: "The main valve is a deliberate, controllable loss: it is how flow is metered. Lines and bends add smaller ones." },
  { id: "injector_inlet", label: "Injector inlet pressure", sensor: "pInjOx", kind: "node", text: "What reaches the injector manifold. It must stay above chamber pressure by a margin." },
  { id: "injector_dp", label: "Injector ΔP", kind: "loss", text: "The injector drop atomises the propellant and, as importantly, isolates the feed system from pressure oscillations in the chamber." },
  { id: "chamber", label: "Chamber pressure", sensor: "pcA", kind: "node", text: "Where the propellants burn. By definition 100 % on this page's scale: the number the whole engine is referred to." },
  { id: "throat", label: "Nozzle throat", reference: 56.4, kind: "loss", text: "The gas accelerates to the speed of sound at the throat. Static pressure there is a fixed fraction of chamber pressure, set by the gas, not by what is downstream." },
  { id: "exit", label: "Nozzle exit", reference: 1.2, kind: "loss", text: "Through the bell, pressure and temperature are converted into exhaust velocity. Almost all of the chamber pressure has become momentum." },
  { id: "environment", label: "Environment", reference: 1, kind: "node", text: "Ambient pressure, which changes from sea level to vacuum. Thrust is exhaust momentum plus the exit-to-ambient pressure difference acting on the exit area." },
];

// ── Pressure differences as health indicators ───────────────────────────────

export interface DeltaP {
  id: "dp_pump" | "dp_injector" | "dp_cooling" | "dp_line";
  name: string;
  /** Upstream minus downstream, or outlet minus inlet for the pump. */
  high: ChannelId;
  low: ChannelId;
  formula: string;
  healthy: string;
  indicates: readonly { change: string; meaning: string }[];
  instrumentation: string;
}

export const DELTA_PS: readonly DeltaP[] = [
  {
    id: "dp_pump",
    name: "ΔP Pump",
    high: "pOutOx",
    low: "pInOx",
    formula: "Pump outlet pressure − pump inlet pressure",
    healthy: "Follows the pump's curve: roughly the square of shaft speed, falling slightly with flow.",
    indicates: [
      { change: "Low for the speed and flow", meaning: "Pump degradation: wear, seal leakage, or damage to the impeller or inducer." },
      { change: "Low, with low inlet pressure and high vibration", meaning: "Cavitation: the pump is starved, and the cause is upstream of it." },
      { change: "High, with flow reduced", meaning: "A restriction downstream is pushing the pump back up its curve." },
    ],
    instrumentation: "Both sensors take part, so a bias on either shows as a pump that is always slightly better or worse than its curve at every speed.",
  },
  {
    id: "dp_injector",
    name: "ΔP Injector",
    high: "pInjOx",
    low: "pcA",
    formula: "Injector inlet pressure − chamber pressure",
    healthy: "Proportional to flow squared, and kept above a minimum fraction of chamber pressure for stability.",
    indicates: [
      { change: "High for the flow", meaning: "Restriction or blockage of injector passages: contamination, ice, or a damaged element." },
      { change: "Low for the flow", meaning: "Erosion, or leakage past a seal, that has opened the flow area." },
      { change: "Too small a fraction of chamber pressure", meaning: "Reduced margin against feed-coupled pressure oscillation." },
    ],
    instrumentation: "It is a small difference of two large numbers, so a chamber pressure sensor fault masquerades as an injector fault unless the sensors are cross-checked.",
  },
  {
    id: "dp_cooling",
    name: "ΔP Cooling Circuit",
    high: "pCoolIn",
    low: "pCoolOut",
    formula: "Cooling inlet pressure − cooling outlet pressure",
    healthy: "Proportional to coolant flow squared, shifting with how much the coolant is heated.",
    indicates: [
      { change: "Rising at constant flow", meaning: "Restriction in the channels: deposits, a deformed wall, or debris." },
      { change: "Rising, with coolant outlet temperature rising", meaning: "Less flow is carrying the same heat: the wall is losing margin." },
      { change: "Falling, with flow unaccounted for", meaning: "A leak from the jacket, or a bypass." },
    ],
    instrumentation: "Trended across runs at a matched operating point; a step between runs with no thermal change suggests the sensor.",
  },
  {
    id: "dp_line",
    name: "ΔP Filter / Line",
    high: "pTankOx",
    low: "pInOx",
    formula: "Upstream pressure − downstream pressure",
    healthy: "Small, and proportional to flow squared.",
    indicates: [
      { change: "Rising at constant flow", meaning: "A filter loading up, or a valve that has not opened fully." },
      { change: "A sudden step", meaning: "Debris lodged in the line, or a check valve partly closed." },
      { change: "Negative or erratic", meaning: "An instrumentation problem: the two sensors' offsets exceed the quantity being measured." },
    ],
    instrumentation: "The difference is close to the sensors' own accuracy, so a dedicated differential sensor is often used instead of two absolute ones.",
  },
];

// ── First questions about pressure ──────────────────────────────────────────

export const PRESSURE_QUESTIONS: readonly { q: string; a: string }[] = [
  { q: "What is pressure?", a: "Pressure is force per unit area: how hard a fluid pushes on whatever contains it. In a rocket engine it is also stored energy. A fluid at high pressure can be made to flow, to spray, to turn a turbine or to accelerate through a nozzle." },
  { q: "Why is pressure critical in a rocket engine?", a: "Because every function of the engine is a pressure difference. Propellant flows only from higher pressure to lower. Thrust comes from chamber pressure acting through the nozzle. And the margins that keep the engine safe, against cavitation, against combustion instability, against structural limits, are all stated as pressures." },
  { q: "Why do rocket engines need pumps?", a: "Chamber pressure has to be high for an efficient, compact engine, and propellant must arrive at an even higher pressure to get in. Holding the whole tank at that pressure would need very heavy tank walls. A pump lets the tank stay at low pressure and raises the pressure only where it is needed, at the engine." },
  { q: "What does chamber pressure tell us?", a: "Almost everything about how the engine is performing. With a choked nozzle, chamber pressure is proportional to the propellant mass flow and to how completely it burns. If it is right, flow and combustion are right. If it is low, one of them is not, and the other measurements say which." },
  { q: "What is pressure drop?", a: "Pressure drop is the pressure a fluid loses passing through a line, valve, filter, cooling channel or injector. It grows roughly with the square of the flow. A pressure drop that is high for the flow passing means something is restricting the passage, which is why pressure drops are health indicators." },
  { q: "Why does cavitation matter?", a: "If the pressure at a pump's inlet falls to the liquid's vapour pressure, the liquid boils locally. The pump then moves vapour bubbles instead of liquid: its pressure rise collapses, it vibrates, and collapsing bubbles erode it. The margin against this is small, because inlet pressure is small." },
  { q: "Why is transient pressure important?", a: "Start, throttle changes and shutdown move the engine through conditions it does not see in steady running: pressures overshoot, valves open in a set order, pumps accelerate. Limits are most often approached in transients, and a fault often shows there first, so the twin has to model how pressure changes in time, not only where it settles." },
];

/** The stages a pressure reading passes through, from the sensor to a statement about health. */
export const SIGNAL_CHAIN = [
  { id: "sensor", label: "Physical sensor", text: "A diaphragm deflects under pressure and a strain gauge or crystal turns that into a small electrical signal." },
  { id: "raw", label: "Raw signal", text: "A current or voltage, here a 4–20 mA loop: 4 mA at zero pressure, 20 mA at full scale." },
  { id: "conditioned", label: "Conditioned measurement", text: "Amplified, anti-alias filtered and digitised: a count from the converter, with a timestamp." },
  { id: "engineering", label: "Engineering value", text: "The count converted with the sensor's calibration: a pressure, in a unit, with a known accuracy." },
  { id: "twin", label: "Digital Twin state", text: "The measurement fused with the model: the estimated value, beside what the model expected." },
  { id: "residual", label: "Residual", text: "Estimated minus expected, in the unit and in standard deviations of its healthy scatter." },
  { id: "health", label: "Health interpretation", text: "What the residual means for this location, given every other piece of evidence." },
] as const;

/** Pressure concepts taught at five depths (see `Concept`). */
export const DELTA_P_CONCEPT: Concept = {
  id: "delta_p",
  title: "Pressure-differential monitoring",
  definition: "Pressure-differential monitoring tracks the difference between two pressures across a component. Because that difference depends on the component's flow resistance, a change in it at the same flow means the component itself has changed.",
  simple: "One pressure tells you where you are. The difference between two tells you what the thing between them is doing.",
  engineering: "For a passive element the drop is Δp = K·ṁ². K is a property of the hardware. Dividing a measured drop by measured flow squared gives K, and K should not change.",
  math: { equation: "K̂ = (p_up − p_down) / ṁ²        health ratio = K̂ / K_calibrated", where: "p_up, p_down upstream and downstream pressure · ṁ mass flow · K loss coefficient · K̂ its estimate" },
  twin: "The twin computes each loss coefficient continuously from estimated pressures and flow, smooths it, and compares it with the value identified at calibration. These ratios are hidden states: no sensor measures them.",
  failure: "Cooling ΔP rises 20 % while fuel flow falls. Flow alone could be a pump or a valve; the ratio shows the resistance of the cooling circuit itself has risen, which isolates the fault to the channels.",
};
