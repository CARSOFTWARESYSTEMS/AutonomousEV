// Guided engineering stages. Each stage states its objective, the camera
// shot and visualisation it uses, the components and telemetry that matter,
// the physics behind it and the models that compute it — and brings the
// simulation to the state it needs through ./simControl. The station's twelve
// stages are the flagship sequence; the other environments have shorter
// sequences until their phases of the redesign.
import type { EnvironmentId, ViewModeId } from "@/lib/wireless-charging/content";
import type { PhaseId } from "@/lib/wireless-charging/stateMachine";
import { resetEnvironment, runtime } from "../state/runtime";
import { useTwin } from "../state/store";
import type { ShotId } from "../three/camera";
import type { MetricId } from "../lab/metrics";
import { recentBatteryPower } from "@/lib/wireless-charging/dynamic";
import { applyRoadPreset, depart, ensureEmptyBay, ensurePhase, padAhead, reached, setStageFault, setStageSpeed } from "./simControl";
import { PARKING_STAGES } from "./parkingStages";

export interface Stage {
  id: string;
  env: EnvironmentId;
  title: string;
  /** The engineering objective, one line. */
  objective: string;
  /** What is happening and why, two or three sentences. */
  explanation: string;
  narration: string;
  view: ViewModeId;
  shot: ShotId;
  components: string[];
  metrics: MetricId[];
  physics: { concept: string; equation: string; note?: string; lesson?: string };
  models: string[];
  /** Simulation speed during the stage; anything but 1 is labelled. */
  speed?: number;
  /** Brings the simulation to the state the stage needs. */
  enter?: () => void;
  /** Runs while the stage is shown (elapsed: seconds of playing time in the stage). */
  tick?: (elapsed: number) => void;
  /** Undoes anything the stage injected. */
  exit?: () => void;
  /** True once the stage's engineering event has happened (auto-advance waits for it). */
  done?: () => boolean;
  /** Seconds the stage is shown at least / at most in auto-advance. */
  min: number;
  max?: number;
}

const st = () => runtime.station.state;
const fodTimes = { on: 2.5, off: 9 };

export const STATION_STAGES: Stage[] = [
  {
    id: "overview",
    env: "station",
    title: "A smart wireless charging bay",
    objective: "See the whole system before any energy flows.",
    explanation: "One bay of a four-bay solar shelter. The ground pad sits on the slab, the power cabinet at the head of the bay holds the converters and controllers, and a transformer and a storage container stand behind. The pad stays de-energised until a vehicle is identified, aligned and checked.",
    narration: "A smart wireless charging bay. The ground pad stays switched off until a vehicle has been identified, aligned and checked.",
    view: "cinematic",
    shot: "establishing",
    components: ["tx-enclosure", "power-cabinet", "solar"],
    metrics: ["phase", "stationRating", "gridLimit"],
    physics: { concept: "System boundary", equation: "Grid → PFC → inverter → C₁L₁ ⇄ L₂C₂ → rectifier → DC–DC → battery", note: "Every stage between the grid and the battery is a modelled loss." },
    models: ["WPT-SIM-001", "WPT-SYS-001"],
    enter: ensureEmptyBay,
    min: 8,
  },
  {
    id: "ground-assembly",
    env: "station",
    title: "Inside the ground pad",
    objective: "Take the transmitter assembly apart, layer by layer.",
    explanation: "From the top: a composite enclosure, a printed array of foreign-object sense coils, potting, the Litz-wire winding on its former, radial ferrite bars, an insulation sheet, the aluminium shield and the base with its terminal box. Ferrite gives the flux a low-reluctance return path behind the winding; the aluminium keeps the field out of what lies beneath.",
    narration: "Inside the ground pad: a Litz-wire winding over ferrite bars, with an aluminium shield beneath and a protective enclosure above.",
    view: "exploded",
    shot: "ground-assembly",
    components: ["tx-enclosure", "fod-sensor", "tx-coil", "tx-ferrite", "tx-insulation", "tx-shield", "tx-base"],
    metrics: ["txTurns", "padDiameter", "L1"],
    physics: { concept: "Ferrite guides the flux, aluminium contains it", equation: "B = μ₀ μᵣ H,   μᵣ ≈ 2300 in MnZn ferrite", note: "The model represents ferrite by image currents scaled by its coverage (F1).", lesson: "magnetism" },
    models: ["WPT-EM-001", "WPT-LOSS-001"],
    enter: ensureEmptyBay,
    min: 11,
  },
  {
    id: "approach",
    env: "station",
    title: "The vehicle arrives",
    objective: "Follow the vehicle into the bay and over the pad.",
    explanation: "The vehicle slows on a constant-deceleration profile and stops with its receiver over the ground pad, at the lateral and longitudinal offsets set for this session. Its wheels roll by the distance actually travelled.",
    narration: "The vehicle arrives and stops with its receiver over the ground pad.",
    view: "cinematic",
    shot: "approach",
    components: ["vehicle"],
    metrics: ["phase", "vehicleSpeed", "distanceToPad"],
    physics: { concept: "Braking to a stop", equation: "v = min(3.3 m/s, √(2·a·d)),   a = 0.55 m/s²", lesson: "vehicle" },
    models: ["WPT-SIM-001"],
    enter: () => {
      const s = st();
      if (s.vehicle.present && s.vehicle.parked) return;
      ensureEmptyBay();
      ensurePhase("approaching", 1);
    },
    done: () => reached("detected"),
    min: 5,
    max: 30,
  },
  {
    id: "identify",
    env: "station",
    title: "Detection, identification and authorisation",
    objective: "See what must be exchanged before any field exists.",
    explanation: "Presence sensing confirms a parked vehicle; the vehicle presents its identity and wireless-charging capability; the station and vehicle start exchanging BMS heartbeats; the backend authorises the session, or the station uses its offline list. Every message is simulated and shown with its link and latency.",
    narration: "Before any field exists, the vehicle is detected, identified and authorised, and the two controllers start exchanging heartbeats.",
    view: "iot",
    shot: "identify",
    components: ["id-camera", "alignment-sensor", "station-controller", "iot-gateway"],
    metrics: ["phase", "backend", "messages"],
    physics: { concept: "Supervision, not physics", equation: "Power allowed only while  t − t_heartbeat ≤ 1.0 s", note: "Safety decisions stay local to the station; the cloud is never in the loop." },
    models: ["WPT-CTRL-001", "WPT-IOT-001"],
    enter: () => ensurePhase("detected"),
    done: () => reached("alignment"),
    min: 7,
    max: 30,
  },
  {
    id: "alignment",
    env: "station",
    title: "Alignment and coupling",
    objective: "Measure how far the receiver sits from the pad, and what that does to coupling.",
    explanation: "Positioning measures the receiver's lateral and longitudinal offset and the air gap. Together they set the mutual inductance M between the windings, and with it the coupling coefficient k. Move the sliders in Engineer mode and k is recomputed from the filament model.",
    narration: "Alignment. The offsets and the air gap set the mutual inductance between the two windings, and with it the coupling coefficient.",
    view: "engineering",
    shot: "alignment",
    components: ["tx-coil", "rx-coil", "alignment-sensor"],
    metrics: ["lateral", "longitudinal", "airGap", "k", "M"],
    physics: { concept: "Mutual inductance", equation: "M = k √(L₁ L₂)", note: "M is computed from the windings' geometry (Neumann's formula with ferrite images); k follows from it.", lesson: "induction" },
    models: ["WPT-EM-001"],
    enter: () => ensurePhase("alignment"),
    done: () => reached("battery-check"),
    min: 10,
  },
  {
    id: "receiver",
    env: "station",
    title: "The receiver assembly",
    objective: "See how the vehicle side is built and where it connects.",
    explanation: "The receiver hangs under the battery enclosure, 0.6 m ahead of the vehicle's centre: enclosure, winding, ferrite and shield, mirror-image of the ground pad. Orange high-voltage cables run to the secondary compensation, the rectifier and the DC–DC converter, and back to the battery's junction box.",
    narration: "The receiver pad hangs under the battery. Its cables run to the compensation, the rectifier and the DC to DC converter.",
    view: "receiver",
    shot: "receiver",
    components: ["rx-enclosure", "rx-coil", "rx-ferrite", "rx-compensation", "rectifier", "dcdc"],
    metrics: ["rxTurns", "L2", "rxTemp"],
    physics: { concept: "Faraday's law", equation: "e₂ = −dλ₂/dt = −jωM I₁   (sinusoidal steady state)", lesson: "induction" },
    models: ["WPT-EM-001", "WPT-CIR-001"],
    enter: () => ensurePhase("battery-check"),
    min: 10,
  },
  {
    id: "field",
    env: "station",
    title: "The magnetic field between the pads",
    objective: "See the field the two windings produce, computed by the model.",
    explanation: "The colour map is the RMS flux density in the vertical section through both pad centres, on a logarithmic scale. The lines are field lines traced at one phase of the 85 kHz cycle. The animation is slowed by about 10⁵: the screen cannot show an 85 kHz field in real time.",
    narration: "The magnetic field between the pads, computed from the windings. The colours are RMS flux density; the lines are traced at one phase of the cycle.",
    view: "field",
    shot: "field",
    components: ["tx-coil", "rx-coil"],
    metrics: ["fieldCentre", "i1", "i2", "k"],
    physics: { concept: "Biot–Savart, with ferrite as image currents", equation: "B(r) = (μ₀ I / 4π) ∮ dl × r̂ / r²", note: "Analytical filament model (F1), not FEM. Flux density, flux linkage, M, k and EMF are different quantities.", lesson: "advanced-em" },
    models: ["WPT-EM-002", "WPT-EM-001"],
    enter: () => ensurePhase("charging"),
    done: () => reached("charging"),
    min: 11,
  },
  {
    id: "resonance",
    env: "station",
    title: "Resonance and the inverter",
    objective: "Open the cabinet: the inverter drives the series-resonant transmitter.",
    explanation: "Two SiC half-bridge modules on a liquid cold plate switch the DC link at about 85 kHz. The primary capacitor bank C₁ cancels the transmitter's reactance at resonance, so the inverter sees a mostly resistive load; a slightly inductive input phase keeps the switches turning on at zero voltage.",
    narration: "The inverter switches at about eighty-five kilohertz into a series-resonant transmitter. The capacitor bank cancels the coil's reactance.",
    view: "power",
    shot: "cabinet",
    components: ["inverter", "gate-driver", "tx-compensation", "dc-link"],
    metrics: ["frequency", "alpha", "zvs", "vc1", "i1"],
    physics: { concept: "Series resonance", equation: "f₀ = 1 / (2π √(L₁ C₁))", note: "The coupled SS network is solved as a whole; one LC formula does not describe it.", lesson: "resonance" },
    models: ["WPT-CIR-001", "WPT-LOSS-002"],
    enter: () => ensurePhase("charging"),
    min: 11,
  },
  {
    id: "energy",
    env: "station",
    title: "Follow the energy",
    objective: "Trace the power from the grid to the battery and see where it is lost.",
    explanation: "Each segment carries the power the chain model computes at that stage: grid AC, the 85 kHz drive, the magnetic link and the DC into the battery. The difference between grid and battery is the sum of every stage's loss, closed exactly.",
    narration: "From the grid to the battery: every stage carries the power the model computes, and the difference is the sum of the losses.",
    view: "energy",
    shot: "energy",
    components: ["grid", "pfc", "inverter", "tx-coil", "rx-coil", "rectifier", "dcdc", "battery-pack"],
    metrics: ["pGrid", "pCoilIn", "pGap", "pBattery", "efficiency"],
    physics: { concept: "Energy balance", equation: "P_grid = P_battery + Σ P_loss", lesson: "electricity" },
    models: ["WPT-SYS-001", "WPT-LOSS-003"],
    enter: () => ensurePhase("charging"),
    min: 11,
  },
  {
    id: "battery",
    env: "station",
    title: "Charging the battery",
    objective: "Watch the state of charge rise from the energy actually delivered.",
    explanation: "The pack is twelve modules on a cooling plate. Its terminal voltage follows the open-circuit voltage at the present SOC plus the drop across its internal resistance and RC branch. SOC rises only by the charge the chain delivers. Time runs 60× faster here; the energy accounting is unchanged.",
    narration: "The battery's state of charge rises only by the energy actually delivered. Time runs sixty times faster here.",
    view: "battery",
    shot: "battery",
    components: ["battery-pack", "bms"],
    metrics: ["soc", "vBat", "iBat", "acceptance", "tBat"],
    physics: { concept: "Battery equivalent circuit", equation: "V = OCV(SOC) + I R₀ + V₁,   dSOC/dt = I / Q", lesson: "battery" },
    models: ["WPT-BAT-001"],
    speed: 60,
    enter: () => ensurePhase("charging"),
    min: 11,
  },
  {
    id: "safety",
    env: "station",
    title: "A foreign object on the pad",
    objective: "See the protection act, then recover.",
    explanation: "A steel can lands on the pad. Metal in the field heats by eddy currents, so foreign-object detection trips within 0.25 s and the inverter is gated off in the same step — not ramped. When the object has been gone for 2 s the station repeats its safety checks and ramps back up.",
    narration: "A metal object lands on the pad. Detection trips, the inverter is switched off at once, and charging resumes only after the pad is clear.",
    view: "xray",
    shot: "safety",
    components: ["fod-sensor", "safety-controller"],
    metrics: ["phase", "pBattery", "objectTemp"],
    physics: { concept: "Eddy-current heating", equation: "P_object ∝ B²  (illustrative, uncalibrated coefficient)", note: "The protection logic is the state machine's; the heating coefficient is a stated assumption." },
    models: ["WPT-CTRL-001", "WPT-SIM-001"],
    enter: () => ensurePhase("charging"),
    tick: (t) => {
      const on = useTwin.getState().faults.foreignObject;
      if (t > fodTimes.on && t < fodTimes.off && !on) setStageFault({ foreignObject: true });
      if (t >= fodTimes.off && on) setStageFault({ foreignObject: false });
    },
    exit: () => setStageFault({ foreignObject: false }),
    done: () => reached("charging"),
    min: 16,
    max: 40,
  },
  {
    id: "complete",
    env: "station",
    title: "Session complete",
    objective: "Run the session to its target and let the vehicle leave.",
    explanation: "Time runs 300× faster until the battery reaches its target state of charge. Power ramps down, the session is recorded with its energy, cost and efficiency, the vehicle departs and the bay becomes available again.",
    narration: "At the target state of charge, power ramps down, the session is recorded, and the vehicle leaves.",
    view: "cinematic",
    shot: "establishing",
    components: ["vehicle", "station-controller"],
    metrics: ["soc", "energyDelivered", "cost", "efficiency"],
    physics: { concept: "Energy delivered", equation: "E = ∫ P_battery dt" },
    models: ["WPT-SIM-001"],
    speed: 300,
    enter: () => ensurePhase("charging"),
    tick: () => {
      if (st().phase === "completed") depart();
      if (st().phase === "departure" || !st().vehicle.present) setStageSpeed(1);
    },
    done: () => !st().vehicle.present && st().phase === "available",
    min: 8,
    max: 90,
  },
];

/** The presets behind the three energy outcomes (the same as check B11, with the energy-neutral coverage found by the same search). */
export const ROAD_PRESETS = {
  default: {},
  /** A fully electrified stretch, so there are always pads around the vehicle to look at. */
  stretch: { coverage: 1 },
  charging: { speed: 8.3, coverage: 1 },
  neutral: { speed: 22.2, coverage: 0.47 },
  discharging: { speed: 33.3, coverage: 0.3 },
} as const;

const road = () => runtime.road.state;
/** True once the vehicle has driven a full zone period and the energy over it has the expected sign. */
const regimeIs = (want: "charging" | "energy-neutral" | "discharging") => () => recentBatteryPower(road().samples)?.regime === want;

export const DYNAMIC_STAGES: Stage[] = [
  {
    id: "drive",
    env: "dynamic",
    title: "An electrified highway",
    objective: "Watch a vehicle take energy from the road while it drives.",
    explanation: "The near lane carries a row of transmitter pads under its surface, in zones that cover 60 % of the route. The saw-cut outlines on the asphalt mark them. The vehicle's speed and position come from its longitudinal model; the camera is fixed beside the road.",
    narration: "An electrified lane. Transmitter pads lie under the surface, and the vehicle draws energy from them as it drives over.",
    view: "cinematic",
    shot: "road-tracking",
    components: ["road-coil", "segment-controller", "vehicle"],
    metrics: ["roadSpeed", "roadSoc", "segments", "handovers"],
    physics: { concept: "Charging in motion", equation: "P_battery = P_received − P_traction − P_losses", lesson: "vehicle" },
    models: ["WPT-SIM-002", "WPT-VEH-001"],
    enter: () => applyRoadPreset(ROAD_PRESETS.default),
    min: 12,
  },
  {
    id: "in-motion",
    env: "dynamic",
    title: "How the car charges while it drives",
    objective: "Follow the energy from the road, through the receiver, into the battery and the motor.",
    explanation: "1 · The roadside controller estimates where the receiver is and switches on the pad ahead of it (soft start: amber, then cyan). 2 · Over the pad, the 85 kHz field links road and receiver — the column is as bright as the power received. 3 · The receiver's compensation, rectifier and DC–DC converter turn it into DC at the junction box. 4 · From there it splits: the motor takes what traction needs; whatever is left charges the battery, or the battery makes up the difference. 5 · Behind the receiver the pad switches off and the next one takes over.",
    narration: "The pad ahead switches on, the field links it to the receiver, and the power splits between the motor and the battery while the next pad takes over.",
    view: "energy",
    shot: "road-energy",
    components: ["road-coil", "rx-coil", "rectifier", "dcdc", "battery-pack", "traction"],
    metrics: ["roadSpeed", "roadSoc", "segments", "handovers"],
    physics: { concept: "Charging in motion", equation: "P_battery = P_received − P_traction − P_losses,   P_received ∝ (ω M(x) I₁)² ", note: "Every glow and flow scales with the road model's calculated values at this step." },
    models: ["WPT-SIM-002", "WPT-VEH-001", "WPT-BAT-001"],
    enter: () => applyRoadPreset({ ...ROAD_PRESETS.stretch, speed: 13.9 }, false),
    min: 14,
  },
  {
    id: "road-cutaway",
    env: "dynamic",
    title: "Under the road",
    objective: "Open the road beside the vehicle and see how the pads are built in.",
    explanation: "On a fully electrified stretch, the wearing course is lifted from a window around the vehicle. Each pad is a precast module — winding over ferrite, under a resin cover — set into the surface course, with a feeder cable to the duct bank in a trench along the shoulder. The trench walls show the binder, base and subgrade. Layer depths are representative, not a pavement design.",
    narration: "Under the surface, each pad is a precast module, with a feeder cable to the duct bank along the shoulder.",
    view: "cutaway",
    shot: "dynamic-cutaway",
    components: ["road-coil", "road-layers"],
    metrics: ["roadSpeed", "segments", "pReceived"],
    physics: { concept: "Construction, not simulation", equation: "air gap = receiver height above the road + pad depth", note: "The road layers are drawn as construction; only the pads and their coupling are simulated." },
    models: ["WPT-SIM-002"],
    enter: () => applyRoadPreset(ROAD_PRESETS.stretch),
    min: 11,
  },
  {
    id: "segments",
    env: "dynamic",
    title: "Segment activation and handover",
    objective: "See which pads the controller switches on, and why.",
    explanation: "On a fully electrified stretch, the segment controller requests pads within a window around the receiver's estimated position — delayed and noisy, as a real position estimate is. An independent interlock lets a pad energise only when the vehicle body covers it (the green band), the vehicle is authorised and the supply is healthy. Colours show each pad's state from the controller: energising, active, de-energising, blocked or failed.",
    narration: "Each pad switches on only inside the request window around the receiver, and only while the vehicle body covers it.",
    view: "segments",
    shot: "dynamic-top",
    components: ["segment-controller", "road-coil"],
    metrics: ["segments", "handovers", "blocked", "roadSpeed"],
    physics: { concept: "Position-triggered switching with an interlock", equation: "energise j  ⇔  |x̂_rx − x_j| < w  ∧  |x_vehicle − x_j| ≤ c  ∧ authorised ∧ supply", note: "x̂ is the delayed, noisy estimate; c keeps every energised pad under the body." },
    models: ["WPT-SIM-002", "WPT-CTRL-001"],
    enter: () => applyRoadPreset(ROAD_PRESETS.stretch),
    min: 11,
  },
  {
    id: "coupling",
    env: "dynamic",
    title: "Position-dependent coupling",
    objective: "See mutual inductance rise and fall as the receiver crosses each pad.",
    explanation: "Behind the receiver, the chart shows the total mutual inductance it actually saw (cyan) and the power it received (amber). Ahead, the faint curve is the coupling the road will offer if each pad energises on time. M depends on position, so the induced voltage has a second term from the motion — here negligible against the 85 kHz term (the ratio is shown). The coupling comes from the filament coupler model tabulated against offset (F1).",
    narration: "Mutual inductance rises and falls as the receiver crosses each pad, and the received power follows it.",
    view: "coupling",
    shot: "dynamic-coupling",
    components: ["road-coil", "rx-coil"],
    metrics: ["mTotal", "kRoad", "pReceived", "motional"],
    physics: { concept: "Time-varying mutual inductance", equation: "λ₂ = L₂i₂ + M(x(t)) i₁,   e₂ = −(M di₁/dt + v i₁ dM/dx)", note: "The motional term v·i₁·dM/dx is computed every step and stays far below the transformer term ωMI₁.", lesson: "induction" },
    models: ["WPT-SIM-002", "WPT-EM-001"],
    enter: () => applyRoadPreset(ROAD_PRESETS.stretch, false),
    min: 12,
  },
  {
    id: "road-field",
    env: "dynamic",
    title: "The magnetic field over the road",
    objective: "See the field each energised pad makes, and how it moves with the receiver.",
    explanation: "A vertical section through the receiver centre, coloured by RMS flux density. It is computed every frame from the energised segments' currents and the receiver current, with the same filament model and ferrite images as the coupling (F1, not FEM). As a pad energises its field appears; as it switches off its contribution goes to zero. Pause to inspect; change the phase to see the field lines at another instant of the 85 kHz cycle.",
    narration: "The field over the road appears only where the pads are energised, and moves with the receiver from pad to pad.",
    view: "field",
    shot: "road-field",
    components: ["road-coil", "rx-coil", "segment-controller"],
    metrics: ["roadFieldB", "roadFieldPads", "mTotal", "i2Road"],
    physics: { concept: "Superposition of the pads' fields", equation: "B(r) = Σⱼ Iⱼ·b_tx(r − rⱼ) + I₂·b_rx(r − r_rx)", note: "Iⱼ = I₁·levelⱼ in one phase reference; I₂ = −jωM I₁/(R₂ + R_L) at resonance. Both are the road model's own assumptions.", lesson: "magnetism" },
    models: ["WPT-EM-005", "WPT-SIM-002", "WPT-EM-001"],
    enter: () => applyRoadPreset({ ...ROAD_PRESETS.stretch, speed: 8.3 }, false),
    min: 14,
  },
  {
    id: "road-receiver",
    env: "dynamic",
    title: "The receiver at speed",
    objective: "Watch the pads pass beneath the receiver at road level.",
    explanation: "From the shoulder, level with the receiver, the pads stream past through the section cut. The receiver current and the coupling coefficient change with every pad, while the vehicle-side converters keep taking what traction and the battery can use.",
    narration: "At road level, the pads stream past beneath the receiver, and its current follows the coupling.",
    view: "receiver",
    shot: "dynamic-receiver",
    components: ["rx-coil", "road-coil"],
    metrics: ["i2Road", "kRoad", "pReceived"],
    physics: { concept: "Faraday's law in motion", equation: "e₂ = −jωM(x) I₁", lesson: "induction" },
    models: ["WPT-SIM-002"],
    enter: () => applyRoadPreset(ROAD_PRESETS.stretch, false),
    min: 10,
  },
  {
    id: "gain",
    env: "dynamic",
    title: "Gaining energy while driving",
    objective: "At 30 km/h on a fully electrified road, the battery charges.",
    explanation: "At low speed the traction demand is small and every metre of road carries pads, so the received power exceeds what the vehicle uses. Battery power is averaged over one full repeat of the electrified zones (200 m), so the reading covers whole zones.",
    narration: "At thirty kilometres an hour on a fully electrified road, the vehicle receives more than it uses, and the battery charges.",
    view: "cinematic",
    shot: "road-side",
    components: ["battery-pack", "traction", "road-coil"],
    metrics: ["roadRegime", "roadNetPower", "roadReceivedAvg", "roadSocChange"],
    physics: { concept: "Battery energy balance", equation: "ΔE_battery = E_received − E_traction − E_losses" },
    models: ["WPT-SIM-002", "WPT-VEH-001", "WPT-BAT-001"],
    enter: () => applyRoadPreset(ROAD_PRESETS.charging),
    done: regimeIs("charging"),
    min: 12,
    max: 60,
  },
  {
    id: "neutral",
    env: "dynamic",
    title: "Energy-neutral driving",
    objective: "At 80 km/h with 47 % of the road electrified, the battery holds its charge.",
    explanation: "With less road electrified and more power going to overcome drag, what the road delivers roughly matches what the vehicle uses: averaged over a 200 m zone period, battery power stays within ±0.5 kW of zero.",
    narration: "At eighty kilometres an hour, with just under half the road electrified, what the road delivers matches what the vehicle uses.",
    view: "cinematic",
    shot: "road-rear",
    components: ["battery-pack", "traction", "road-coil"],
    metrics: ["roadRegime", "roadNetPower", "roadReceivedAvg", "roadSocChange"],
    physics: { concept: "Battery energy balance", equation: "ΔE_battery ≈ 0  ⇔  E_received ≈ E_traction + E_losses" },
    models: ["WPT-SIM-002", "WPT-VEH-001"],
    enter: () => applyRoadPreset(ROAD_PRESETS.neutral),
    done: regimeIs("energy-neutral"),
    min: 12,
    max: 60,
  },
  {
    id: "lose",
    env: "dynamic",
    title: "Losing energy despite charging",
    objective: "At 120 km/h with 30 % coverage, the battery drains while it receives power.",
    explanation: "Aerodynamic drag grows with the square of speed, so traction power climbs steeply while the received power is limited by the receiver's coupling and the short time over each pad. The vehicle still receives power on every pad, yet its battery discharges.",
    narration: "At a hundred and twenty kilometres an hour, the vehicle still receives power on every pad, yet its battery drains.",
    view: "cinematic",
    shot: "road-low",
    components: ["battery-pack", "traction"],
    metrics: ["roadRegime", "roadNetPower", "roadReceivedAvg", "roadSocChange"],
    physics: { concept: "Road load", equation: "P_traction = (m a + ½ρC_dAv² + C_rr m g) v / η" },
    models: ["WPT-VEH-001", "WPT-SIM-002"],
    enter: () => applyRoadPreset(ROAD_PRESETS.discharging),
    done: regimeIs("discharging"),
    min: 12,
    max: 60,
  },
  {
    id: "failed",
    env: "dynamic",
    title: "A failed segment",
    objective: "A pad's controller fails: see the gap in coupling and power.",
    explanation: "The tour fails the controller of one pad just ahead of the vehicle; once the vehicle has passed it, that pad is repaired and the next one ahead fails. A failed pad never energises, whatever the request. In the chart the coupling the road offers drops to zero over it, and the received power shows the gap as the receiver crosses it. Neighbouring pads keep working. Speed 40 km/h, so the gap stays in view.",
    narration: "When a pad's controller fails, the road offers no coupling over it, and the received power shows the gap.",
    view: "segments",
    shot: "road-failed",
    components: ["segment-controller", "road-coil"],
    metrics: ["pReceived", "mTotal", "segments"],
    physics: { concept: "Graceful degradation", equation: "M_total(x) = Σ_{j ≠ failed} M_j(x) · level_j" },
    models: ["WPT-SIM-002"],
    enter: () => {
      applyRoadPreset({ ...ROAD_PRESETS.stretch, speed: 11.1 });
      useTwin.setState((s) => ({ road: { ...s.road, failedSegment: padAhead(9) } }));
    },
    tick: () => {
      const st = road();
      const failed = st.segments.find((g) => g.index === useTwin.getState().road.failedSegment);
      if (!failed || failed.x - st.x < -7) useTwin.setState((s) => ({ road: { ...s.road, failedSegment: padAhead(10) } }));
    },
    exit: () => useTwin.setState((s) => ({ road: { ...s.road, failedSegment: -1 } })),
    min: 12,
  },
];

export const AUTONOMOUS_STAGES: Stage[] = [
  {
    id: "mission",
    env: "autonomous",
    title: "Autonomous precision parking",
    objective: "A vehicle finds a station, reserves it and parks over the pad on its own.",
    explanation: "The vehicle follows a planned forward path with pure-pursuit steering on a kinematic bicycle model, steering from its EKF estimate rather than the true pose. Its front wheels turn by the model's steering angle.",
    narration: "The vehicle steers from its own estimate of where it is, and parks with its receiver over the pad.",
    view: "cinematic",
    shot: "autonomous",
    components: ["alignment-sensor", "vehicle"],
    metrics: ["parkPhase", "parkError", "parkSigma"],
    physics: { concept: "Kinematic bicycle model", equation: "ẋ = v cos ψ,  ẏ = v sin ψ,  ψ̇ = v tan δ / L" },
    models: ["WPT-AV-001", "WPT-AV-002"],
    enter: () => {
      if (runtime.parking.state.phase === "parked") resetEnvironment("autonomous");
    },
    min: 12,
  },
  {
    id: "estimate",
    env: "autonomous",
    title: "Estimate and truth",
    objective: "Compare where the vehicle thinks it is with where it is.",
    explanation: "UWB ranges arrive late and noisy; the extended Kalman filter fuses them with odometry. The final alignment error is what the charging station then measures.",
    narration: "The filter's estimate and the true position stay within millimetres at the pad.",
    view: "xray",
    shot: "autonomous-top",
    components: ["alignment-sensor"],
    metrics: ["parkError", "parkSigma", "parkPhase"],
    physics: { concept: "Extended Kalman filter", equation: "x̂ₖ = x̂ₖ⁻ + Kₖ (zₖ − h(x̂ₖ⁻))" },
    models: ["WPT-AV-002"],
    min: 10,
  },
];

export const INFRASTRUCTURE_STAGES: Stage[] = [
  {
    id: "district",
    env: "infrastructure",
    title: "A district's energy day",
    objective: "See grid, solar, storage and chargers share one budget.",
    explanation: "Each flow is sized by the dispatch model's power at the hour shown. Unmet demand is reported as unmet, never drawn as delivered. The model dispatches aggregate energy; it is not a network power-flow study.",
    narration: "Grid, solar, storage and chargers share one energy budget through the day.",
    view: "cinematic",
    shot: "district",
    components: ["solar", "bess", "transformer"],
    metrics: ["gridImport", "pvUsed", "bessPower", "hour"],
    physics: { concept: "Aggregate dispatch", equation: "P_grid + P_pv + P_bess = P_load + P_charging", note: "Aggregate energy dispatch, not network power flow." },
    models: ["WPT-GRID-001"],
    speed: 60,
    min: 14,
  },
];

export const PLAYLISTS: Record<EnvironmentId, Stage[]> = {
  parking: PARKING_STAGES,
  station: STATION_STAGES,
  dynamic: DYNAMIC_STAGES,
  autonomous: AUTONOMOUS_STAGES,
  infrastructure: INFRASTRUCTURE_STAGES,
};

export interface Chapter {
  title: string;
  stages: Stage[];
}

const byId = (list: Stage[], id: string) => list.find((s) => s.id === id)!;
const brief = (s: Stage, min: number): Stage => ({ ...s, min, max: s.max ? Math.max(s.max, min) : undefined });

/** The technology demonstration: eight chapters across the environments. */
export const DEMO_CHAPTERS: Chapter[] = [
  { title: "Arrival and identification", stages: [brief(byId(STATION_STAGES, "overview"), 6), byId(STATION_STAGES, "approach"), brief(byId(STATION_STAGES, "identify"), 5)] },
  { title: "Park and align", stages: [brief(byId(STATION_STAGES, "alignment"), 8)] },
  { title: "See the invisible physics", stages: [brief(byId(STATION_STAGES, "receiver"), 7), brief(byId(STATION_STAGES, "field"), 9)] },
  { title: "Follow the electrical energy", stages: [brief(byId(STATION_STAGES, "resonance"), 8), brief(byId(STATION_STAGES, "energy"), 8), brief(byId(STATION_STAGES, "battery"), 8)] },
  { title: "Charge while driving", stages: [brief(byId(DYNAMIC_STAGES, "drive"), 7), brief(byId(DYNAMIC_STAGES, "in-motion"), 10), brief(byId(DYNAMIC_STAGES, "road-field"), 9)] },
  { title: "Autonomous charging", stages: [brief(AUTONOMOUS_STAGES[0], 14)] },
  { title: "Intelligent energy ecosystem", stages: [brief(INFRASTRUCTURE_STAGES[0], 12)] },
  {
    title: "Enter the science",
    stages: [
      {
        ...brief(byId(STATION_STAGES, "overview"), 7),
        id: "science",
        title: "Enter the research laboratory",
        objective: "Choose an environment, open a component, change a parameter.",
        explanation: "Everything shown was computed by the twin's models. Open any component to see its physics, equations, live values and limitations, or switch to Learn, Engineer or Research mode.",
        narration: "Explore the physics. Engineer the technology. Electrify the future.",
        enter: undefined,
      },
    ],
  },
];

export const DEMO_STAGES: Stage[] = DEMO_CHAPTERS.flatMap((c) => c.stages);
export const chapterOf = (index: number) => {
  let n = 0;
  for (let c = 0; c < DEMO_CHAPTERS.length; c++) {
    n += DEMO_CHAPTERS[c].stages.length;
    if (index < n) return c;
  }
  return DEMO_CHAPTERS.length - 1;
};

export const stagesFor = (playlist: EnvironmentId | "demo"): Stage[] => (playlist === "demo" ? DEMO_STAGES : PLAYLISTS[playlist]);

export type { PhaseId };
