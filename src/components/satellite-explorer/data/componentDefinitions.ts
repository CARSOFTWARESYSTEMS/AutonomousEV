// Educational metadata for every selectable assembly of the reference
// spacecraft. Rendering maps meshes to these ids; nothing here knows about
// geometry. Numbers are REFERENCE values unless a row is bound to a live
// (SIMULATED) quantity.
import type { ComponentId, SubsystemId } from "../types";

/** Simulated quantities a panel row can display instead of a fixed value. */
export type LiveKey =
  | "batterySoc"
  | "busVoltage"
  | "batteryCurrent"
  | "batteryState"
  | "generation"
  | "generationPerWing"
  | "load"
  | "sunlight"
  | "spacecraftMode"
  | "attitudeMode"
  | "wheelX"
  | "wheelY"
  | "wheelZ"
  | "wheelR"
  | "storage"
  | "payloadPhase"
  | "linkState"
  | "elevation"
  | "downlink";

export interface ValueRow {
  label: string;
  /** Fixed reference value, or the fallback shown before the first live sample. */
  value: string;
  live?: LiveKey;
}

/** What the panel's ANIMATE action does for a component. */
export type ComponentAnimation = "spin" | "deploy" | "capture" | "transmit" | "charge" | "pulse";

export interface ComponentDefinition {
  id: ComponentId;
  name: string;
  /** Compact name for 3D labels. */
  label: string;
  subsystem: SubsystemId;
  /** Learn mode: one short sentence. */
  purpose: string;
  /** Learn mode: one to three values. */
  learnValues: readonly ValueRow[];
  /** Engineer mode: role statement. */
  role: string;
  /** Engineer mode: reference figures. */
  engineerValues: readonly ValueRow[];
  interfaces: string;
  /** Build Mode step (1–8) in which the assembly is installed. */
  buildStep: number;
  /** Approximate power draw as a load, W (reference). */
  powerDrawW?: number;
  animation: ComponentAnimation;
}

const define = (d: ComponentDefinition) => d;

export const COMPONENTS: Record<ComponentId, ComponentDefinition> = {
  // ── Structure ──
  "primary-frame": define({
    id: "primary-frame",
    name: "Primary Frame",
    label: "PRIMARY FRAME",
    subsystem: "structure",
    purpose: "Provides mechanical support and the launch-load path.",
    learnValues: [
      { label: "Form factor", value: "6U" },
      { label: "Material", value: "Aluminium" },
    ],
    role: "Primary load path between the deployer rails and every mounted unit",
    engineerValues: [
      { label: "Envelope", value: "226 × 366 × 100 mm" },
      { label: "Material", value: "Al 7075, hard-anodised rails" },
      { label: "Rails", value: "4, full length" },
      { label: "Mass", value: "1.1 kg reference" },
    ],
    interfaces: "Deployer rails / Decks / Panels",
    buildStep: 1,
    animation: "pulse",
  }),
  "end-plates": define({
    id: "end-plates",
    name: "End Plates",
    label: "END PLATES",
    subsystem: "structure",
    purpose: "Close the two ends of the bus and carry the Earth- and space-facing units.",
    learnValues: [
      { label: "Earth face", value: "Aperture + X-band" },
      { label: "Space face", value: "GNSS + S-band" },
    ],
    role: "End closures; mounting faces for aperture, antennas and sensors",
    engineerValues: [
      { label: "Nadir plate", value: "Payload aperture, X-band array, S-band patch" },
      { label: "Zenith plate", value: "GNSS patch, S-band patch, sun sensor" },
      { label: "Material", value: "Al 6061 reference" },
    ],
    interfaces: "Primary frame / Antennas / Sensors",
    buildStep: 1,
    animation: "pulse",
  }),
  "side-panels": define({
    id: "side-panels",
    name: "Close-out Panels",
    label: "CLOSE-OUT PANELS",
    subsystem: "structure",
    purpose: "Close the bus and add shear stiffness once the units are installed.",
    learnValues: [
      { label: "Count", value: "4" },
      { label: "Fitted", value: "Last" },
    ],
    role: "Shear panels and access closures; carry MLI and the radiator",
    engineerValues: [
      { label: "Panels", value: "2 large + 2 side" },
      { label: "Material", value: "Aluminium sheet reference" },
      { label: "Integration", value: "Installed after harness close-out" },
    ],
    interfaces: "Primary frame / MLI / Radiator",
    buildStep: 7,
    animation: "pulse",
  }),
  "payload-deck": define({
    id: "payload-deck",
    name: "Payload Deck",
    label: "PAYLOAD DECK",
    subsystem: "structure",
    purpose: "A stiff bench that keeps the telescope aligned.",
    learnValues: [{ label: "Carries", value: "Optical payload" }],
    role: "Optical bench: holds the telescope stable under launch loads and thermal change",
    engineerValues: [
      { label: "Bay", value: "1U × 3U" },
      { label: "Mounts", value: "Two cradles, kinematic reference" },
      { label: "Driver", value: "Alignment stability" },
    ],
    interfaces: "Primary frame / Optical payload",
    buildStep: 1,
    animation: "pulse",
  }),
  "avionics-deck": define({
    id: "avionics-deck",
    name: "Avionics Deck",
    label: "AVIONICS DECK",
    subsystem: "structure",
    purpose: "Stack rods and base plate that hold the electronics boards.",
    learnValues: [{ label: "Carries", value: "Board stack" }],
    role: "Board-stack mounting: rods, spacers and base plate for the avionics column",
    engineerValues: [
      { label: "Bay", value: "1U × 3U" },
      { label: "Stack", value: "4 rods, board spacers" },
      { label: "Driver", value: "Board-level vibration" },
    ],
    interfaces: "Primary frame / Avionics boards",
    buildStep: 1,
    animation: "pulse",
  }),
  "deployer-interface": define({
    id: "deployer-interface",
    name: "Deployer Interface",
    label: "DEPLOYER INTERFACE",
    subsystem: "structure",
    purpose: "Rail ends, switches and springs that meet the launch deployer.",
    learnValues: [
      { label: "Rail feet", value: "8" },
      { label: "Switches", value: "2" },
    ],
    role: "Mechanical and electrical inhibit interface to the dispenser",
    engineerValues: [
      { label: "Contact", value: "Rail ends, hard-anodised" },
      { label: "Deployment switches", value: "2, hold the bus unpowered" },
      { label: "Separation springs", value: "2" },
    ],
    interfaces: "Launch deployer / PCDU inhibits",
    buildStep: 1,
    animation: "pulse",
  }),

  // ── Power ──
  "solar-array-left": define({
    id: "solar-array-left",
    name: "Solar Array",
    label: "SOLAR ARRAY",
    subsystem: "power",
    purpose: "Converts sunlight into spacecraft electrical power.",
    learnValues: [
      { label: "Generation", value: "9.2 W", live: "generationPerWing" },
      { label: "Light", value: "Sunlight", live: "sunlight" },
    ],
    role: "Primary power generation; two-panel deployable wing",
    engineerValues: [
      { label: "Panels", value: "2 × (1U × 3U), hinged" },
      { label: "Cells", value: "Triple-junction, 7 per panel" },
      { label: "Peak (wing)", value: "17 W reference" },
      { label: "Output", value: "9.2 W", live: "generationPerWing" },
    ],
    interfaces: "PCDU array input / Hinges / Hold-down",
    buildStep: 2,
    animation: "deploy",
  }),
  "solar-array-right": define({
    id: "solar-array-right",
    name: "Solar Array",
    label: "SOLAR ARRAY",
    subsystem: "power",
    purpose: "Converts sunlight into spacecraft electrical power.",
    learnValues: [
      { label: "Generation", value: "9.2 W", live: "generationPerWing" },
      { label: "Light", value: "Sunlight", live: "sunlight" },
    ],
    role: "Primary power generation; two-panel deployable wing",
    engineerValues: [
      { label: "Panels", value: "2 × (1U × 3U), hinged" },
      { label: "Cells", value: "Triple-junction, 7 per panel" },
      { label: "Peak (wing)", value: "17 W reference" },
      { label: "Output", value: "9.2 W", live: "generationPerWing" },
    ],
    interfaces: "PCDU array input / Hinges / Hold-down",
    buildStep: 2,
    animation: "deploy",
  }),
  battery: define({
    id: "battery",
    name: "Battery Pack",
    label: "BATTERY",
    subsystem: "power",
    purpose: "Stores electrical energy for eclipse and peak loads.",
    learnValues: [
      { label: "Status", value: "78%", live: "batterySoc" },
      { label: "Supply", value: "8.1 V", live: "busVoltage" },
    ],
    role: "Eclipse operation and transient load support",
    engineerValues: [
      { label: "Energy", value: "40 Wh reference" },
      { label: "State of charge", value: "78%", live: "batterySoc" },
      { label: "Bus", value: "8.1 V", live: "busVoltage" },
      { label: "Temperature", value: "18.4 °C simulated" },
      { label: "Current", value: "-1.8 A", live: "batteryCurrent" },
    ],
    interfaces: "PCDU / Power bus",
    buildStep: 2,
    animation: "charge",
  }),
  pcdu: define({
    id: "pcdu",
    name: "PCDU",
    label: "PCDU",
    subsystem: "power",
    purpose: "Conditions solar power, charges the battery and switches power to each load.",
    learnValues: [
      { label: "Generated", value: "18.4 W", live: "generation" },
      { label: "Load", value: "12.1 W", live: "load" },
    ],
    role: "Power Conditioning & Distribution Unit: array regulation, battery management, switched rails",
    engineerValues: [
      { label: "Array input", value: "18.4 W", live: "generation" },
      { label: "Load", value: "12.1 W", live: "load" },
      { label: "Battery", value: "Charging", live: "batteryState" },
      { label: "Rails", value: "3.3 V / 5 V / unregulated" },
      { label: "Switched outputs", value: "Latch-up protected" },
    ],
    interfaces: "Solar arrays / Battery / Every load / OBC",
    buildStep: 2,
    powerDrawW: 1.0,
    animation: "pulse",
  }),
  "power-harness": define({
    id: "power-harness",
    name: "Power Harness",
    label: "POWER HARNESS",
    subsystem: "power",
    purpose: "Wiring that carries power from the PCDU to every unit.",
    learnValues: [{ label: "Carries", value: "Power bus" }],
    role: "Power distribution wiring between arrays, PCDU, battery and loads",
    engineerValues: [
      { label: "Branches", value: "OBC, ADCS, Payload, Comms, Heaters" },
      { label: "Protection", value: "Per-output current limit" },
    ],
    interfaces: "PCDU / Loads",
    buildStep: 2,
    animation: "pulse",
  }),

  // ── Avionics ──
  obc: define({
    id: "obc",
    name: "Onboard Computer",
    label: "OBC",
    subsystem: "avionics",
    purpose: "Runs the flight software that coordinates the whole spacecraft.",
    learnValues: [
      { label: "Mode", value: "Nominal", live: "spacecraftMode" },
      { label: "Software", value: "Running" },
    ],
    role: "Command & data handling: executes commands, gathers telemetry, supervises every subsystem",
    engineerValues: [
      { label: "Mode", value: "NOMINAL", live: "spacecraftMode" },
      { label: "Processor", value: "32-bit class reference" },
      { label: "Flight software", value: "Real-time, watchdog supervised" },
      { label: "Power", value: "1.8 W reference" },
    ],
    interfaces: "Data bus / PCDU / Radios / ADCS / Payload",
    buildStep: 3,
    powerDrawW: 1.8,
    animation: "pulse",
  }),
  "data-storage": define({
    id: "data-storage",
    name: "Data Storage",
    label: "STORAGE",
    subsystem: "avionics",
    purpose: "Holds payload data onboard until a ground station is in view.",
    learnValues: [{ label: "Stored", value: "243 MB", live: "storage" }],
    role: "Mass memory for payload data and housekeeping archives",
    engineerValues: [
      { label: "Payload data", value: "243 MB", live: "storage" },
      { label: "Capacity", value: "16 GB reference" },
      { label: "Protection", value: "Error detection & correction" },
    ],
    interfaces: "Payload processor / OBC / X-band transmitter",
    buildStep: 3,
    animation: "pulse",
  }),
  "data-bus": define({
    id: "data-bus",
    name: "Main Data Bus",
    label: "DATA BUS",
    subsystem: "avionics",
    purpose: "The shared wiring that lets every unit talk to the flight computer.",
    learnValues: [{ label: "Type", value: "Reference data bus" }],
    role: "Reference data bus linking sensors, actuators, radios and payload to the OBC",
    engineerValues: [
      { label: "Designation", value: "REFERENCE DATA BUS" },
      { label: "Topology", value: "Stack connector + harness" },
      { label: "Note", value: "No specific bus standard is implied" },
    ],
    interfaces: "OBC / Every unit",
    buildStep: 3,
    animation: "pulse",
  }),

  // ── ADCS ──
  "reaction-wheel-x": define({
    id: "reaction-wheel-x",
    name: "Reaction Wheel",
    label: "REACTION WHEEL X",
    subsystem: "adcs",
    purpose: "Turns the spacecraft by spinning a flywheel the opposite way.",
    learnValues: [
      { label: "Speed", value: "+1,200 rpm", live: "wheelX" },
      { label: "Axis", value: "X" },
    ],
    role: "Controls spacecraft attitude by exchanging angular momentum with the spacecraft body",
    engineerValues: [
      { label: "Speed", value: "+1,200 rpm", live: "wheelX" },
      { label: "State", value: "Active" },
      { label: "Axis", value: "X" },
      { label: "Torque", value: "2 mN·m reference" },
    ],
    interfaces: "ADCS controller / Power bus",
    buildStep: 4,
    animation: "spin",
  }),
  "reaction-wheel-y": define({
    id: "reaction-wheel-y",
    name: "Reaction Wheel",
    label: "REACTION WHEEL Y",
    subsystem: "adcs",
    purpose: "Turns the spacecraft by spinning a flywheel the opposite way.",
    learnValues: [
      { label: "Speed", value: "-900 rpm", live: "wheelY" },
      { label: "Axis", value: "Y" },
    ],
    role: "Controls spacecraft attitude by exchanging angular momentum with the spacecraft body",
    engineerValues: [
      { label: "Speed", value: "-900 rpm", live: "wheelY" },
      { label: "State", value: "Active" },
      { label: "Axis", value: "Y" },
      { label: "Torque", value: "2 mN·m reference" },
    ],
    interfaces: "ADCS controller / Power bus",
    buildStep: 4,
    animation: "spin",
  }),
  "reaction-wheel-z": define({
    id: "reaction-wheel-z",
    name: "Reaction Wheel",
    label: "REACTION WHEEL Z",
    subsystem: "adcs",
    purpose: "Turns the spacecraft by spinning a flywheel the opposite way.",
    learnValues: [
      { label: "Speed", value: "+1,500 rpm", live: "wheelZ" },
      { label: "Axis", value: "Z" },
    ],
    role: "Controls spacecraft attitude by exchanging angular momentum with the spacecraft body",
    engineerValues: [
      { label: "Speed", value: "+1,500 rpm", live: "wheelZ" },
      { label: "State", value: "Active" },
      { label: "Axis", value: "Z" },
      { label: "Torque", value: "2 mN·m reference" },
    ],
    interfaces: "ADCS controller / Power bus",
    buildStep: 4,
    animation: "spin",
  }),
  "reaction-wheel-r": define({
    id: "reaction-wheel-r",
    name: "Redundant Reaction Wheel",
    label: "REDUNDANT WHEEL",
    subsystem: "adcs",
    purpose: "A fourth, tilted wheel that can stand in for any of the other three.",
    learnValues: [
      { label: "Speed", value: "0 rpm", live: "wheelR" },
      { label: "State", value: "Standby" },
    ],
    role: "Skewed spare: keeps three-axis control after a single wheel failure",
    engineerValues: [
      { label: "Speed", value: "0 rpm", live: "wheelR" },
      { label: "State", value: "Cold standby" },
      { label: "Axis", value: "Skewed (1, 1, 1)" },
    ],
    interfaces: "ADCS controller / Power bus",
    buildStep: 4,
    animation: "spin",
  }),
  magnetorquers: define({
    id: "magnetorquers",
    name: "Magnetorquers",
    label: "MAGNETORQUERS",
    subsystem: "adcs",
    purpose: "Electromagnets that push against Earth's magnetic field to unload the wheels.",
    learnValues: [{ label: "Axes", value: "3" }],
    role: "Detumbling and reaction-wheel momentum unloading",
    engineerValues: [
      { label: "Set", value: "2 torque rods + 1 air coil" },
      { label: "Dipole", value: "0.2 A·m² reference" },
      { label: "Torque", value: "Perpendicular to the local field" },
    ],
    interfaces: "ADCS controller / Power bus",
    buildStep: 4,
    animation: "pulse",
  }),
  magnetometer: define({
    id: "magnetometer",
    name: "Magnetometer",
    label: "MAGNETOMETER",
    subsystem: "adcs",
    purpose: "Measures the direction of Earth's magnetic field.",
    learnValues: [{ label: "Measures", value: "Magnetic field" }],
    role: "Field vector for coarse attitude and magnetorquer control",
    engineerValues: [
      { label: "Axes", value: "3" },
      { label: "Mounting", value: "Away from the torquers" },
    ],
    interfaces: "ADCS controller / Data bus",
    buildStep: 4,
    animation: "pulse",
  }),
  "sun-sensors": define({
    id: "sun-sensors",
    name: "Sun Sensors",
    label: "SUN SENSORS",
    subsystem: "adcs",
    purpose: "Find the direction of the Sun.",
    learnValues: [
      { label: "Count", value: "2" },
      { label: "Sun", value: "In view", live: "sunlight" },
    ],
    role: "Coarse Sun vector for safe mode and attitude initialisation",
    engineerValues: [
      { label: "Heads", value: "2, opposite faces" },
      { label: "Accuracy", value: "0.5° class reference" },
      { label: "Sun", value: "In view", live: "sunlight" },
    ],
    interfaces: "ADCS controller / Data bus",
    buildStep: 4,
    animation: "pulse",
  }),
  "star-tracker": define({
    id: "star-tracker",
    name: "Star Tracker",
    label: "STAR TRACKER",
    subsystem: "adcs",
    purpose: "A camera that recognises star patterns to measure orientation precisely.",
    learnValues: [
      { label: "Pointing", value: "Nadir", live: "attitudeMode" },
      { label: "Looks at", value: "Stars" },
    ],
    role: "Fine attitude knowledge for payload pointing",
    engineerValues: [
      { label: "Accuracy", value: "0.01° class reference" },
      { label: "Baffle", value: "Faces away from the Sun" },
      { label: "Attitude", value: "NADIR", live: "attitudeMode" },
    ],
    interfaces: "ADCS controller / Data bus",
    buildStep: 4,
    animation: "pulse",
  }),
  "gnss-receiver": define({
    id: "gnss-receiver",
    name: "GNSS Receiver",
    label: "GNSS",
    subsystem: "adcs",
    purpose: "Gives the spacecraft its position, velocity and precise time.",
    learnValues: [{ label: "Provides", value: "Position + time" }],
    role: "Orbit knowledge and time reference for pointing and scheduling",
    engineerValues: [
      { label: "Antenna", value: "Zenith patch" },
      { label: "Output", value: "Position, velocity, time" },
    ],
    interfaces: "OBC / ADCS / Data bus",
    buildStep: 4,
    animation: "pulse",
  }),

  // ── Payload ──
  "optical-payload": define({
    id: "optical-payload",
    name: "Optical Payload",
    label: "OPTICAL PAYLOAD",
    subsystem: "payload",
    purpose: "A telescope and sensor that image the Earth below.",
    learnValues: [
      { label: "State", value: "Standby", live: "payloadPhase" },
      { label: "Swath", value: "≈ 70 km" },
    ],
    role: "Earth-observation instrument: collects light onto the focal plane",
    engineerValues: [
      { label: "State", value: "STANDBY", live: "payloadPhase" },
      { label: "Aperture", value: "90 mm reference" },
      { label: "Field of view", value: "7.6° reference" },
      { label: "Swath", value: "≈ 70 km at 525 km" },
    ],
    interfaces: "Payload deck / Payload electronics",
    buildStep: 6,
    powerDrawW: 3.1,
    animation: "capture",
  }),
  "payload-electronics": define({
    id: "payload-electronics",
    name: "Payload Electronics",
    label: "PAYLOAD ELECTRONICS",
    subsystem: "payload",
    purpose: "Reads the image sensor and turns light into digital data.",
    learnValues: [{ label: "Output", value: "Raw image data" }],
    role: "Focal-plane readout and instrument control",
    engineerValues: [
      { label: "Function", value: "Detector readout, timing" },
      { label: "Output", value: "Raw frames to processor" },
    ],
    interfaces: "Optical payload / Payload processor / Power bus",
    buildStep: 6,
    animation: "pulse",
  }),
  "payload-processor": define({
    id: "payload-processor",
    name: "Payload Processor",
    label: "PAYLOAD PROCESSOR",
    subsystem: "payload",
    purpose: "Compresses and prepares images before they are stored.",
    learnValues: [{ label: "Stored", value: "243 MB", live: "storage" }],
    role: "Onboard edge processing: compression, packaging, hand-off to storage",
    engineerValues: [
      { label: "Function", value: "Compression + packetisation" },
      { label: "Capture size", value: "75 MB reference" },
      { label: "Stored", value: "243 MB", live: "storage" },
    ],
    interfaces: "Payload electronics / Data storage / OBC",
    buildStep: 6,
    animation: "pulse",
  }),

  // ── Communications ──
  "sband-radio": define({
    id: "sband-radio",
    name: "S-band Transceiver",
    label: "S-BAND RADIO",
    subsystem: "communications",
    purpose: "Receives commands from the ground and sends telemetry back.",
    learnValues: [
      { label: "Role", value: "TT&C" },
      { label: "Link", value: "No link", live: "linkState" },
    ],
    role: "Telemetry, Tracking & Command link",
    engineerValues: [
      { label: "Band", value: "2.0–2.3 GHz reference" },
      { label: "Uplink", value: "32 kbit/s reference" },
      { label: "Downlink", value: "128 kbit/s reference" },
      { label: "Link", value: "NO LINK", live: "linkState" },
    ],
    interfaces: "S-band antennas / OBC / Power bus",
    buildStep: 5,
    powerDrawW: 1.6,
    animation: "transmit",
  }),
  "sband-antenna": define({
    id: "sband-antenna",
    name: "S-band Antennas",
    label: "S-BAND ANTENNA",
    subsystem: "communications",
    purpose: "Two patches that keep the command link open in almost any orientation.",
    learnValues: [
      { label: "Count", value: "2" },
      { label: "Elevation", value: "0°", live: "elevation" },
    ],
    role: "Near-omnidirectional TT&C coverage from opposite faces",
    engineerValues: [
      { label: "Type", value: "Patch, both end faces" },
      { label: "Coverage", value: "Near-omnidirectional" },
      { label: "Station elevation", value: "0°", live: "elevation" },
    ],
    interfaces: "S-band transceiver / RF harness",
    buildStep: 5,
    animation: "transmit",
  }),
  "xband-transmitter": define({
    id: "xband-transmitter",
    name: "X-band Transmitter",
    label: "X-BAND TRANSMITTER",
    subsystem: "communications",
    purpose: "Sends stored imagery to the ground at high data rate.",
    learnValues: [
      { label: "Role", value: "Payload data" },
      { label: "Downlink", value: "0%", live: "downlink" },
    ],
    role: "High-rate payload data downlink",
    engineerValues: [
      { label: "Band", value: "8.0–8.4 GHz reference" },
      { label: "Rate", value: "5 Mbit/s reference" },
      { label: "Downlink", value: "0%", live: "downlink" },
      { label: "Power", value: "8.4 W while transmitting" },
    ],
    interfaces: "Data storage / X-band antenna / Power bus",
    buildStep: 5,
    animation: "transmit",
  }),
  "xband-antenna": define({
    id: "xband-antenna",
    name: "X-band Antenna",
    label: "X-BAND ANTENNA",
    subsystem: "communications",
    purpose: "A patch array on the Earth-facing end that beams data to the station.",
    learnValues: [{ label: "Faces", value: "Earth" }],
    role: "Directional payload downlink antenna",
    engineerValues: [
      { label: "Type", value: "2 × 2 patch array" },
      { label: "Pointing", value: "Body-pointed at the station" },
    ],
    interfaces: "X-band transmitter / RF harness",
    buildStep: 5,
    animation: "transmit",
  }),
  "rf-harness": define({
    id: "rf-harness",
    name: "RF Harness",
    label: "RF HARNESS",
    subsystem: "communications",
    purpose: "Coaxial cables between the radios and their antennas.",
    learnValues: [{ label: "Carries", value: "RF signals" }],
    role: "Coaxial routing between transceivers and antennas",
    engineerValues: [
      { label: "Runs", value: "S-band ×2, X-band ×1" },
      { label: "Driver", value: "Low loss, short runs" },
    ],
    interfaces: "Radios / Antennas",
    buildStep: 5,
    animation: "pulse",
  }),

  // ── Thermal ──
  "mli-blanket": define({
    id: "mli-blanket",
    name: "MLI Blanket",
    label: "MLI",
    subsystem: "thermal",
    purpose: "Layered foil insulation that slows heat flow in and out of the bus.",
    learnValues: [{ label: "Type", value: "Multi-layer insulation" }],
    role: "Decouples the bus from external sun and deep-space swings",
    engineerValues: [
      { label: "Layers", value: "Multi-layer, metallised film" },
      { label: "Coverage", value: "Side faces and Sun face" },
    ],
    interfaces: "Close-out panels",
    buildStep: 7,
    animation: "pulse",
  }),
  radiator: define({
    id: "radiator",
    name: "Radiator",
    label: "RADIATOR",
    subsystem: "thermal",
    purpose: "A cold-facing surface that rejects waste heat to space.",
    learnValues: [{ label: "Faces", value: "Away from the Sun" }],
    role: "Rejects dissipated heat from electronics by radiation",
    engineerValues: [
      { label: "Face", value: "Anti-Sun" },
      { label: "Finish", value: "High-emissivity reference" },
      { label: "Coupled to", value: "PCDU, radios, processor" },
    ],
    interfaces: "Close-out panel / Heat sources",
    buildStep: 7,
    animation: "pulse",
  }),
  heaters: define({
    id: "heaters",
    name: "Heaters & Sensors",
    label: "HEATERS",
    subsystem: "thermal",
    purpose: "Keep the battery and optics warm in eclipse, guided by temperature sensors.",
    learnValues: [
      { label: "Zones", value: "Battery, payload" },
      { label: "Light", value: "Sunlight", live: "sunlight" },
    ],
    role: "Thermostatic survival and operational heating",
    engineerValues: [
      { label: "Heater zones", value: "Battery, payload" },
      { label: "Sensors", value: "Thermistors at each zone" },
      { label: "Power", value: "1.2 W Sun / 2.3 W eclipse reference" },
    ],
    interfaces: "PCDU switched output / OBC",
    buildStep: 7,
    powerDrawW: 1.2,
    animation: "pulse",
  }),
};

export const COMPONENT_IDS = Object.keys(COMPONENTS) as ComponentId[];

/** Name that tells otherwise identical units apart (left / right wing, wheel axis). */
export function distinctName(id: ComponentId): string {
  const { name } = COMPONENTS[id];
  if (id === "solar-array-left") return `${name} (left)`;
  if (id === "solar-array-right") return `${name} (right)`;
  if (id === "reaction-wheel-x" || id === "reaction-wheel-y" || id === "reaction-wheel-z") return `${name} ${id.slice(-1).toUpperCase()}`;
  return name;
}

export const componentsOf = (subsystem: SubsystemId): ComponentId[] => COMPONENT_IDS.filter((id) => COMPONENTS[id].subsystem === subsystem);

export const componentsInBuildStep = (step: number): ComponentId[] => COMPONENT_IDS.filter((id) => COMPONENTS[id].buildStep === step);

/** Parts made see-through in X-ray so the internal units can be seen and selected. */
export const OUTER_SHELL: readonly ComponentId[] = ["side-panels", "end-plates", "mli-blanket", "radiator"];

/** Units that stay solid and selectable in X-ray. */
export const XRAY_SELECTABLE: readonly ComponentId[] = [
  "obc",
  "data-storage",
  "battery",
  "pcdu",
  "reaction-wheel-x",
  "reaction-wheel-y",
  "reaction-wheel-z",
  "reaction-wheel-r",
  "sband-radio",
  "xband-transmitter",
  "payload-processor",
];
