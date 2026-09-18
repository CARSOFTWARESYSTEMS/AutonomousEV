// Educational content for the Model Rocketry interactive learning page.
// Pure data, no JSX — kept separate from rendering components so content can
// be reviewed and extended without touching component code.

export type LearningLevel = "beginner" | "intermediate" | "advanced";

export type RocketSystem =
  | "vehicle"
  | "propulsion"
  | "avionics"
  | "recovery"
  | "ground-segment";

export const SYSTEM_LABELS: Record<RocketSystem, string> = {
  vehicle: "Vehicle",
  propulsion: "Propulsion",
  avionics: "Avionics",
  recovery: "Recovery",
  "ground-segment": "Ground Segment",
};

export const SYSTEM_COLORS: Record<RocketSystem, string> = {
  vehicle: "#67e8f9",
  propulsion: "#f59e0b",
  avionics: "#93c5fd",
  recovery: "#a78bfa",
  "ground-segment": "#34d399",
};

export interface RocketComponent {
  id: string;
  name: string;
  system: RocketSystem;
  /** Normalized position (0-1 of the cutaway viewBox) used to place the hit target. */
  location: { x: number; y: number };
  purpose: string;
  beginner: string;
  intermediate: string;
  advanced: string;
  interfaces: string[];
  failures: string[];
  checks: string[];
  careers: string[];
  learnNext: string[];
}

export const ROCKET_COMPONENTS: RocketComponent[] = [
  {
    id: "nose-cone",
    name: "Nose cone",
    system: "vehicle",
    location: { x: 0.5, y: 0.05 },
    purpose: "Shapes the front of the rocket to reduce aerodynamic drag.",
    beginner:
      "The pointed or rounded tip at the top of the rocket. It slices through the air so the rocket flies smoothly instead of pushing a flat surface into the wind.",
    intermediate:
      "Nose-cone shape (conic, ogive, elliptical) trades drag at different speeds against ease of manufacture. It also often carries the recovery attachment point and, on some designs, the payload bay.",
    advanced:
      "At higher speeds, cone geometry affects wave drag and boundary-layer transition; shape selection should be revisited if a design moves into transonic flight regimes rather than assumed constant across the flight envelope.",
    interfaces: ["Bonds to the forward airframe/payload coupler", "Anchors the recovery harness attachment point"],
    failures: ["Poor bonding to the body tube can separate under aerodynamic load", "Excess weight forward shifts CG and affects stability"],
    checks: ["Inspect the bond line for gaps or cracks before flight", "Confirm the nose cone is not loose or wobbling when seated"],
    careers: ["Aerodynamics Engineer", "Aerospace Structures Engineer"],
    learnNext: ["cg-cp", "drag"],
  },
  {
    id: "payload-bay",
    name: "Payload / experiment section",
    system: "vehicle",
    location: { x: 0.5, y: 0.16 },
    purpose: "Houses an experiment, sensor package, or educational payload separate from the flight avionics.",
    beginner: "A compartment for whatever the mission is carrying — a small experiment, a camera, or a sensor to test.",
    intermediate:
      "Payload mass and its position directly affect the mass budget and CG location, so payload changes require re-checking stability, not just fitting the part physically.",
    advanced:
      "Payload interfaces (mechanical, electrical, data) should be defined early and traced through requirements review, since late payload changes are a common source of schedule and stability rework.",
    interfaces: ["Structural mount to airframe/couplers", "Optional data/power connection to avionics bay"],
    failures: ["Payload shifting in flight changes CG mid-flight", "Loose payload wiring intercepts recovery deployment charges"],
    checks: ["Secure payload before every flight", "Verify payload wiring is routed clear of separation points"],
    careers: ["Systems Engineer", "Mission Engineer"],
    learnNext: ["mass-budget", "cg-cp"],
  },
  {
    id: "airframe",
    name: "Airframe / body tube",
    system: "vehicle",
    location: { x: 0.5, y: 0.32 },
    purpose: "The structural tube that holds every subsystem together and carries flight loads.",
    beginner: "The long tube that makes up most of the rocket's body — everything else attaches to it.",
    intermediate:
      "The airframe must survive thrust loads at launch, bending loads from wind and any misalignment, and the shock of parachute deployment — three different load cases, not just one.",
    advanced:
      "Structural margins are usually verified against the highest expected dynamic pressure (max-Q) and against the deployment shock load, whichever governs for the chosen material and wall thickness.",
    interfaces: ["Nose cone forward", "Motor mount and fins aft", "Couplers joining separable sections"],
    failures: ["Buckling under flight loads", "Crack propagation from a prior hard landing"],
    checks: ["Inspect for cracks, dents or delamination before each flight", "Check coupler friction fit is snug but not glued shut if separation is required"],
    careers: ["Aerospace Structures Engineer", "Mechanical Design Engineer", "Composite Engineer"],
    learnNext: ["couplers", "structural-margin"],
  },
  {
    id: "couplers",
    name: "Couplers & bulkheads",
    system: "vehicle",
    location: { x: 0.5, y: 0.4 },
    purpose: "Joins separable airframe sections and seals internal bulkheads that anchor hardware.",
    beginner: "Sleeves that connect two tube sections together, and small internal disks that hardware can be attached to.",
    intermediate:
      "A coupler must be tight enough to survive flight loads but release cleanly at the intended separation event — friction fit tuning is itself a design and test task.",
    advanced:
      "Coupler friction and bulkhead attachment strength should be verified by ground testing (a controlled separation/shock test), not just by fit-check on the bench, since flight loads and vibration differ from static handling.",
    interfaces: ["Joins adjacent airframe sections", "Anchors shock cord and bulkhead-mounted hardware"],
    failures: ["Coupler too loose: premature separation in flight", "Coupler too tight: parachute deployment fails to separate the airframe"],
    checks: ["Test-fit and cycle couplers before flight", "Verify bulkhead attachment points are not cracked"],
    careers: ["Mechanical Design Engineer", "Aerospace Structures Engineer"],
    learnNext: ["deployment-charge", "structural-margin"],
  },
  {
    id: "fins",
    name: "Fins",
    system: "vehicle",
    location: { x: 0.5, y: 0.62 },
    purpose: "Provide aerodynamic stability by keeping the center of pressure behind the center of gravity.",
    beginner: "The flat pieces near the bottom that keep the rocket flying straight, the way feathers on an arrow do.",
    intermediate:
      "Fin size, shape and placement set the location of the center of pressure (CP). More/larger fins move CP further aft, increasing static margin — but too much margin makes the rocket oversensitive to wind (weathercocking).",
    advanced:
      "Fin flutter — high-speed aeroelastic oscillation — becomes a real risk on high-thrust or high-speed builds; flutter margin depends on fin material stiffness, thickness and root-to-tip geometry, and should be checked separately from static stability.",
    interfaces: ["Bonded/mounted to the aft airframe", "Adjacent to the motor mount"],
    failures: ["Fin detachment in flight from a weak bond", "Fin flutter at high speed causing structural failure", "Warped fins from heat or storage causing asymmetric flight"],
    checks: ["Inspect fin bonds and alignment before flight", "Check fins are not warped or delaminating"],
    careers: ["Aerodynamics Engineer", "CFD Engineer", "Aerospace Structures Engineer"],
    learnNext: ["cg-cp", "static-margin"],
  },
  {
    id: "launch-lug",
    name: "Launch lug / rail buttons",
    system: "vehicle",
    location: { x: 0.62, y: 0.5 },
    purpose: "Guides the rocket along the launch rail or rod during the first moments of flight, before aerodynamic surfaces are effective.",
    beginner: "Small clips or a tube on the side of the rocket that slide along the launch rail, keeping it pointed straight until it's moving fast enough to fly on its own.",
    intermediate:
      "Rail-exit velocity — the speed reached when the rocket leaves the rail — matters because fins can't stabilize a rocket that isn't yet moving fast enough for aerodynamic forces to act.",
    advanced:
      "Insufficient rail-exit velocity combined with any crosswind is a common cause of an early, uncontrolled weathercock turn; it's evaluated together with rail length, motor thrust curve and wind conditions during launch-readiness review, not assumed adequate by default.",
    interfaces: ["Engages the ground segment's launch rail"],
    failures: ["Rail button misalignment causing binding on the rail", "Insufficient rail length or motor thrust for a safe rail-exit velocity"],
    checks: ["Confirm rail buttons are securely mounted and aligned", "Verify rail length is adequate for the selected motor"],
    careers: ["Mechanical Systems Engineer", "Launch Operations Engineer"],
    learnNext: ["launch-rail", "thrust-curve"],
  },
  {
    id: "motor-mount",
    name: "Motor mount",
    system: "propulsion",
    location: { x: 0.5, y: 0.78 },
    purpose: "Positions and structurally supports the motor inside the airframe, transmitting thrust to the vehicle.",
    beginner: "The tube inside the rocket that holds the motor securely in place.",
    intermediate:
      "The mount must carry the full thrust load directly into the airframe structure — usually reinforced with centering rings — rather than relying on the motor casing alone for structural support.",
    advanced:
      "Motor-mount sizing should match the specific motor's certified diameter and length tolerance from its manufacturer data sheet; an undersized or misaligned mount changes how thrust loads transfer into the airframe.",
    interfaces: ["Aft airframe structure", "Motor retention hardware", "Fins (adjacent structural load path)"],
    failures: ["Motor mount detaching under thrust", "Misalignment causing off-axis thrust"],
    checks: ["Verify centering rings are intact and bonded", "Confirm motor fits snugly with correct diameter"],
    careers: ["Propulsion Engineer", "Aerospace Structures Engineer"],
    learnNext: ["motor-retention", "thrust-curve"],
  },
  {
    id: "motor",
    name: "Certified commercial motor",
    system: "propulsion",
    location: { x: 0.5, y: 0.88 },
    purpose: "Provides the thrust that accelerates the rocket off the pad and through powered ascent.",
    beginner: "The engine of the rocket. It burns fuel for a few seconds, pushing the rocket upward, then stops.",
    intermediate:
      "Motors are classified by total impulse (letter class, e.g. A–G for typical model rocketry) and described by a thrust-time curve showing how thrust varies over the burn. Motor selection balances total impulse, peak thrust, and burn time against the vehicle's mass and mission goal.",
    advanced:
      "Only commercially manufactured, certified model rocket motors from an established manufacturer are used in this educational context — motor selection is a data-sheet exercise (thrust curve, total impulse, burn time, delay charge, recommended liftoff weight range) and integration exercise (mount fit, retention, thrust-to-weight), never a manufacturing exercise. This page does not cover motor or propellant manufacture.",
    interfaces: ["Motor mount", "Motor retention hardware", "Recovery deployment charge (on delay/ejection motors)"],
    failures: ["Ignition failure (no thrust)", "Thrust under-performance versus data sheet", "CATO (catastrophic motor failure) — always follow manufacturer safety guidance and range procedures"],
    checks: ["Use only manufacturer-certified motors within their rated conditions", "Follow the manufacturer's handling and igniter installation instructions exactly", "Follow range safety officer procedures at every launch"],
    careers: ["Propulsion Engineer", "Test Engineer", "Thermal/Fluid Engineer"],
    learnNext: ["thrust-curve", "impulse", "motor-retention"],
  },
  {
    id: "motor-retention",
    name: "Motor retention",
    system: "propulsion",
    location: { x: 0.5, y: 0.95 },
    purpose: "Physically locks the motor in the mount so it cannot slide out under thrust or during recovery.",
    beginner: "A clip, ring, or cap that stops the motor from falling out or shooting backward out of the rocket.",
    intermediate:
      "Retention hardware must resist both the forward thrust load at launch and any rearward force during recovery deployment — some designs use a screw-on cap, others a spring clip or friction ring.",
    advanced:
      "Retention is verified by physical fit-check and, ideally, a ground test cycle before first flight — retention failure is a well-documented, avoidable failure mode with an established checklist-based prevention approach.",
    interfaces: ["Motor mount", "Motor casing"],
    failures: ["Retention hardware failing under thrust, ejecting the motor", "Retention loosening after repeated flights without inspection"],
    checks: ["Inspect retention hardware for wear before every flight", "Confirm motor cannot be pulled out by hand once retained"],
    careers: ["Mechanical Systems Engineer", "Reliability/Safety Engineer"],
    learnNext: ["motor", "checklist"],
  },
  {
    id: "flight-computer",
    name: "Flight computer",
    system: "avionics",
    location: { x: 0.62, y: 0.22 },
    purpose: "Reads sensor data, decides when to trigger recovery deployment, and often logs the flight.",
    beginner: "A small onboard computer that watches the flight and decides when to open the parachute.",
    intermediate:
      "A typical educational flight computer combines a microcontroller, a barometric pressure sensor for altitude, and often an IMU (accelerometer + gyroscope), running simple deployment logic (e.g., detect apogee by a barometric peak, or a fixed timer as backup).",
    advanced:
      "Flight software should have a documented deployment-decision algorithm, a backup timer in case sensor-based detection fails, and its own pre-flight self-test / continuity check — these are standard mitigations for a single-point-of-failure deployment trigger.",
    interfaces: ["Barometric/IMU sensors", "Power supply", "Deployment charge/e-match", "Telemetry radio", "Data logger"],
    failures: ["Power loss mid-flight (no deployment command)", "Sensor noise triggering false apogee detection", "Firmware reset losing flight state"],
    checks: ["Run a full continuity/self-test before every flight", "Verify battery voltage is within spec before flight", "Confirm backup timer is armed as a deployment fallback"],
    careers: ["Embedded Systems Engineer", "Avionics Engineer", "Flight Software Engineer"],
    learnNext: ["imu", "barometer", "deployment-logic"],
  },
  {
    id: "imu-baro",
    name: "IMU & barometric sensor",
    system: "avionics",
    location: { x: 0.5, y: 0.28 },
    purpose: "Measures acceleration, rotation and altitude so the flight computer can track the vehicle's state.",
    beginner: "Sensors that feel motion (like your inner ear) and measure air pressure to estimate how high the rocket is.",
    intermediate:
      "An IMU (Inertial Measurement Unit) combines an accelerometer and gyroscope; a barometer infers altitude from air pressure. Together they let the flight computer estimate velocity, orientation and apogee.",
    advanced:
      "Sensor fusion — combining noisy barometric and inertial data with a filter (e.g., a simple complementary filter or Kalman filter) — improves apogee-detection reliability over using either sensor alone, and is a common next step once basic single-sensor deployment logic is understood.",
    interfaces: ["Flight computer (data)", "Power supply"],
    failures: ["Barometric noise from turbulent airflow near the vehicle", "Sensor saturation during high acceleration", "Wiring fault losing sensor data"],
    checks: ["Verify sensor readings are sane during pre-flight ground test", "Check sensor is not obstructed by wiring or structure"],
    careers: ["GNC Engineer", "Sensor Fusion Engineer", "Navigation Engineer"],
    learnNext: ["flight-computer", "apogee"],
  },
  {
    id: "telemetry-radio",
    name: "Telemetry radio & antenna",
    system: "avionics",
    location: { x: 0.4, y: 0.24 },
    purpose: "Transmits flight data to the ground in real time, and/or helps locate the rocket after landing.",
    beginner: "A small radio that sends information about the flight down to the ground team, and can help find the rocket after it lands.",
    intermediate:
      "Telemetry range and reliability depend on transmit power, antenna placement/orientation, and local RF interference — antenna routing inside a composite or metal airframe needs particular care.",
    advanced:
      "Onboard data logging should not be treated as optional just because telemetry exists — a telemetry link can drop out during flight (RF shadowing, range, interference), so the two are complementary, not redundant only in name.",
    interfaces: ["Flight computer (data)", "Ground telemetry receiver", "Antenna routing through airframe"],
    failures: ["RF interference or antenna damage causing link loss", "Battery depletion cutting transmission early", "Ground receiver misconfiguration missing the link"],
    checks: ["Range-test the telemetry link before flight day", "Confirm antenna is not obstructed by conductive structure"],
    careers: ["RF Engineer", "Communication Systems Engineer", "Ground Systems Engineer"],
    learnNext: ["ground-station", "data-logging"],
  },
  {
    id: "power-supply",
    name: "Battery & power supply",
    system: "avionics",
    location: { x: 0.58, y: 0.28 },
    purpose: "Powers the flight computer, sensors, telemetry and deployment charges for the whole flight.",
    beginner: "The battery that keeps all the electronics running during flight.",
    intermediate:
      "Power budgeting means adding up every subsystem's current draw over the expected flight duration (plus margin) to size the battery, and includes the deployment charge's ignition current, not just steady-state electronics load.",
    advanced:
      "A single point of power failure taking down deployment logic is a known FMEA-worthy risk; some designs use separate batteries for flight computer vs. deployment ignition, or add a pre-flight voltage/continuity check as a mitigation rather than assuming one battery is always sufficient.",
    interfaces: ["Flight computer", "Sensors", "Telemetry radio", "Deployment charge (ignition current)"],
    failures: ["Loose connector losing power mid-flight", "Insufficient battery capacity for flight duration", "Voltage sag under deployment-charge current draw"],
    checks: ["Verify battery voltage before every flight", "Inspect connectors for secure fit and no corrosion"],
    careers: ["Electronics Engineer", "Avionics Engineer"],
    learnNext: ["flight-computer", "checklist"],
  },
  {
    id: "parachute",
    name: "Parachute / streamer",
    system: "recovery",
    location: { x: 0.5, y: 0.2 },
    purpose: "Slows the rocket's descent to a safe landing speed after apogee.",
    beginner: "A parachute (or a simple streamer for small/light rockets) that opens after the rocket reaches its highest point, so it comes down slowly and safely.",
    intermediate:
      "Parachute size is chosen to hit a target descent rate for the vehicle's recovered mass — too small and descent is too fast (hard landing/damage); too large and the rocket drifts too far to recover easily.",
    advanced:
      "Packing method affects deployment reliability as much as parachute sizing does — a poorly packed or tangled parachute is a well-documented recurring failure mode, which is why ground deployment testing of the packing procedure is treated as a verification step, not a formality.",
    interfaces: ["Shock cord/harness", "Deployment compartment", "Separation interface"],
    failures: ["Parachute fails to open (tangled or improperly packed)", "Parachute damage from excessive deployment shock or heat from the charge", "Excessive descent rate from an undersized parachute"],
    checks: ["Practice and verify the packing procedure with a ground deployment test", "Inspect parachute material and lines for damage before flight"],
    careers: ["Mechanical Systems Engineer", "Reliability/Safety Engineer"],
    learnNext: ["deployment-logic", "descent-rate"],
  },
  {
    id: "shock-cord",
    name: "Shock cord & harness",
    system: "recovery",
    location: { x: 0.5, y: 0.24 },
    purpose: "Connects the separated airframe sections together after deployment, absorbing the deployment shock.",
    beginner: "A strong cord that keeps the rocket's parts tethered together after the parachute opens, so nothing falls off separately.",
    intermediate:
      "The harness must be rated for the deployment shock load, which depends on parachute size, deployment altitude/speed, and vehicle mass — undersized cord is a structural failure waiting to happen at exactly the moment recovery is needed.",
    advanced:
      "Shock cord length and elasticity (some designs use an elastic section) are tuned to limit peak deployment loads on the airframe and bulkhead attachment points, which is why swapping a larger parachute in without revisiting the harness is a common design mistake.",
    interfaces: ["Nose cone/bulkhead anchor point", "Parachute", "Aft airframe section"],
    failures: ["Cord failure under deployment shock", "Cord tangling with the parachute"],
    checks: ["Inspect shock cord for fraying or heat damage before flight", "Confirm anchor points are secure"],
    careers: ["Mechanical Systems Engineer", "Aerospace Structures Engineer"],
    learnNext: ["parachute", "deployment-logic"],
  },
  {
    id: "deployment-compartment",
    name: "Deployment compartment & separation interface",
    system: "recovery",
    location: { x: 0.5, y: 0.3 },
    purpose: "Holds the packed recovery system and separates cleanly when the deployment charge fires.",
    beginner: "The section of the rocket where the parachute is packed, designed to pop open at the right moment.",
    intermediate:
      "The separation interface (usually a friction-fit coupler) must resist flight loads yet separate reliably on a deployment charge — a design tension that is tuned and tested, not assumed correct by default.",
    advanced:
      "Premature deployment (separating too early, under thrust or during ascent) and late/no deployment (failing to separate at apogee) are the two opposite failure modes bracketing this interface's design margin — both are tracked explicitly in an FMEA rather than only guarding against one.",
    interfaces: ["Airframe couplers", "Deployment charge/e-match", "Parachute/shock cord"],
    failures: ["Premature deployment under aerodynamic load", "Failure to separate at apogee (charge too weak, coupler too tight)"],
    checks: ["Ground-test the separation with a live deployment charge before first flight", "Verify coupler friction fit matches the tested configuration"],
    careers: ["Mechanical Systems Engineer", "Reliability/Safety Engineer"],
    learnNext: ["deployment-logic", "parachute"],
  },
  {
    id: "launch-rail",
    name: "Launch rail / pad",
    system: "ground-segment",
    location: { x: 0.85, y: 0.9 },
    purpose: "Provides a straight, stable guide for the rocket during the first phase of flight.",
    beginner: "The stand and rail the rocket sits on before launch, keeping it pointed straight up (or at the intended angle) until launched.",
    intermediate:
      "Rail length and angle are chosen together with rail-exit velocity considerations — a longer rail gives more guided distance for the rocket to reach a stable flight speed before leaving it.",
    advanced:
      "Launch-angle decisions also factor in wind conditions and airspace/range constraints, reviewed as part of launch-readiness procedures rather than fixed in advance regardless of conditions.",
    interfaces: ["Launch lug / rail buttons on the vehicle", "Launch controller (ignition circuit)"],
    failures: ["Rail misalignment causing an off-vertical launch", "Rail too short for a safe rail-exit velocity"],
    checks: ["Verify rail is vertical (or at the planned angle) and stable before launch", "Confirm rail length matches the flight plan for the selected motor"],
    careers: ["Launch Operations Engineer", "Mechanical Systems Engineer"],
    learnNext: ["launch-lug", "checklist"],
  },
  {
    id: "launch-controller",
    name: "Launch controller & safe ignition interface",
    system: "ground-segment",
    location: { x: 0.85, y: 0.98 },
    purpose: "Provides a safe, deliberate electrical path to ignite the motor from a safe distance.",
    beginner: "The box with a button the range safety team uses to launch the rocket from a safe distance away.",
    intermediate:
      "A safe launch controller requires deliberate, multi-step arming (e.g., a physical safety key plus a countdown) so ignition cannot happen accidentally, and a continuity check confirms the igniter circuit is actually connected before the launch is called.",
    advanced:
      "Launch procedures follow the local range's safety code and require a designated range safety officer; this page describes the systems-engineering role of the controller and does not provide instructions for building or bypassing ignition safety interlocks.",
    interfaces: ["Igniter/e-match in the motor", "Range safety procedures"],
    failures: ["Continuity check skipped, leading to a misfire or safety hazard", "Unsafe ad-hoc wiring bypassing standard safety interlocks"],
    checks: ["Always follow the range's official safety code and use commercially available, certified launch controllers", "Perform a continuity check before every attempt"],
    careers: ["Launch Operations Engineer", "Reliability/Safety Engineer"],
    learnNext: ["motor", "checklist"],
  },
  {
    id: "ground-station",
    name: "Ground telemetry receiver & station",
    system: "ground-segment",
    location: { x: 0.15, y: 0.85 },
    purpose: "Receives telemetry from the rocket in flight and displays/logs it for the ground team.",
    beginner: "A laptop or device on the ground that receives the data the rocket's radio sends down.",
    intermediate:
      "The ground station's antenna, receiver sensitivity and software logging determine how much of the flight is actually captured — it's tested and range-checked before flight day just like the onboard radio.",
    advanced:
      "Post-flight analysis compares logged telemetry against the pre-flight simulation prediction (e.g., from OpenRocket) — discrepancies are the starting point for understanding model assumptions versus real flight behaviour, not something to discard as noise.",
    interfaces: ["Telemetry radio (vehicle)", "Data-analysis software/scripts"],
    failures: ["Receiver misconfiguration missing part of the flight", "Data logging software crash losing the record"],
    checks: ["Test the full ground-station chain before flight day", "Confirm data logging is active and verified before each flight"],
    careers: ["Ground Systems Engineer", "RF Engineer", "Data/Software Engineer"],
    learnNext: ["telemetry-radio", "post-flight-analysis"],
  },
];

export interface MissionStage {
  id: string;
  name: string;
  inputs: string;
  outputs: string;
  questions: string[];
  mistakes: string[];
}

export const MISSION_WORKFLOW: MissionStage[] = [
  { id: "mission", name: "Mission", inputs: "An educational or experimental goal", outputs: "A one-sentence mission statement", questions: ["What are we trying to learn or demonstrate?"], mistakes: ["Starting to build before agreeing what the mission actually is"] },
  { id: "requirements", name: "Requirements", inputs: "Mission statement, constraints (budget, motor class, range rules)", outputs: "A written requirements list (altitude target, payload, recovery method, safety constraints)", questions: ["What must be true for this mission to count as a success?", "What constraints are non-negotiable (safety, budget, range rules)?"], mistakes: ["Vague requirements that can't be checked later ('fly high')"] },
  { id: "concept", name: "Concept", inputs: "Requirements", outputs: "A rough vehicle concept (single-stage, size class, recovery approach)", questions: ["What's the simplest configuration that meets the requirements?"], mistakes: ["Over-engineering the concept before requirements are settled"] },
  { id: "mass-budget", name: "Size & Mass Budget", inputs: "Concept, component list", outputs: "An estimated mass breakdown by subsystem", questions: ["Does the estimated liftoff mass fit the motor's recommended range?"], mistakes: ["Forgetting to include payload, wiring or fasteners in the mass estimate"] },
  { id: "aerodynamics", name: "Aerodynamics", inputs: "Vehicle geometry, mass budget", outputs: "Estimated drag and stability characteristics", questions: ["Where is the center of pressure relative to the center of gravity?"], mistakes: ["Choosing fin size only for looks, without checking stability"] },
  { id: "propulsion-selection", name: "Propulsion Selection", inputs: "Mass budget, altitude/performance goal", outputs: "A selected certified motor with its data sheet", questions: ["Does the motor's total impulse and thrust-to-weight fit the mission and vehicle mass?"], mistakes: ["Picking a motor by 'bigger is better' rather than by data-sheet fit"] },
  { id: "stability", name: "Stability", inputs: "Aerodynamics estimate, mass budget", outputs: "A verified static margin (typically 1-2 calibers for a first design)", questions: ["Is the static margin adequate without being excessive?"], mistakes: ["Skipping a stability check because 'it looks like a rocket'"] },
  { id: "structures", name: "Structures", inputs: "Vehicle geometry, expected loads", outputs: "A structural design with margins against flight and deployment loads", questions: ["What is the worst-case load case: max-Q or deployment shock?"], mistakes: ["Designing only for the static weight, ignoring dynamic flight/deployment loads"] },
  { id: "avionics-design", name: "Avionics", inputs: "Mission requirements (data, deployment logic)", outputs: "An avionics architecture: sensors, flight computer, power, telemetry", questions: ["What is the backup if the primary deployment trigger fails?"], mistakes: ["No backup deployment timer as a fallback"] },
  { id: "recovery-design", name: "Recovery", inputs: "Recovered mass, target descent rate", outputs: "A sized parachute/streamer and harness design", questions: ["What descent rate keeps the vehicle and anyone nearby safe?"], mistakes: ["Sizing the parachute without verifying the harness can handle deployment shock"] },
  { id: "simulation", name: "Simulation", inputs: "Full vehicle design, motor data", outputs: "A predicted flight profile (altitude, velocity, stability margin over time)", questions: ["Does the simulated flight meet the mission's altitude/performance requirement?"], mistakes: ["Treating a single simulation run as proof, without checking sensitivity to input uncertainty"] },
  { id: "design-review", name: "Design Review", inputs: "Simulation results, structural/avionics design", outputs: "A reviewed, approved baseline design (or a list of required changes)", questions: ["What evidence supports each design decision?"], mistakes: ["Skipping review because the team is confident, then discovering an issue during build"] },
  { id: "build", name: "Build", inputs: "Approved design, materials", outputs: "A physical vehicle matching the design baseline", questions: ["Does the built vehicle match the design, or were there in-progress changes?"], mistakes: ["Undocumented changes made 'on the bench' that never get reflected in the design record"] },
  { id: "integration", name: "Integration", inputs: "Built subsystems", outputs: "A fully assembled, wired and tested vehicle", questions: ["Do all subsystem interfaces (mechanical, electrical) actually fit and function together?"], mistakes: ["Assuming subsystems built separately will integrate without a dedicated integration check"] },
  { id: "ground-testing", name: "Ground Testing", inputs: "Integrated vehicle", outputs: "Verified continuity, deployment charge test, and sensor sanity checks", questions: ["Has every safety-critical function been tested on the ground, not just assumed?"], mistakes: ["Skipping a ground deployment test to save time before a launch date"] },
  { id: "launch-readiness", name: "Launch Readiness", inputs: "Ground test results, weather, range availability", outputs: "A go/no-go decision", questions: ["Do conditions (weather, range, checklist status) support a safe launch?"], mistakes: ["Launching to meet a schedule despite an unresolved checklist item"] },
  { id: "flight", name: "Flight", inputs: "Go decision", outputs: "A completed flight from ignition to landing", questions: ["Did the vehicle perform as simulated, and if not, where did it diverge?"], mistakes: ["Not recording/observing the flight closely enough to learn from it"] },
  { id: "recovery-ops", name: "Recovery", inputs: "Landed vehicle location", outputs: "A safely recovered vehicle and any onboard data", questions: ["Is the vehicle and payload intact for post-flight inspection?"], mistakes: ["Recovering the vehicle without preserving flight data or noting condition"] },
  { id: "post-flight", name: "Post-Flight Analysis", inputs: "Recovered vehicle, telemetry/logged data", outputs: "A comparison of actual versus predicted performance, and lessons for the next iteration", questions: ["What should change in the next design iteration based on this flight?"], mistakes: ["Treating a successful flight as 'done' without extracting lessons for next time"] },
];

export interface DesignReview {
  id: string;
  name: string;
  fullName: string;
  beginner: string;
  entryCriteria: string[];
  evidence: string[];
}

export const DESIGN_REVIEWS: DesignReview[] = [
  { id: "mrr", name: "MRR", fullName: "Mission Requirements Review", beginner: "Confirms everyone agrees on what the mission needs to achieve before any design work starts.", entryCriteria: ["Draft mission statement", "Constraint list (budget, safety, range rules)"], evidence: ["Written, checkable requirements", "Stakeholder sign-off"] },
  { id: "concept-review", name: "Concept Review", fullName: "Concept Review", beginner: "Checks that the chosen rough vehicle concept can plausibly meet the requirements.", entryCriteria: ["Approved requirements", "At least one candidate concept"], evidence: ["Concept sketch/description", "Rough feasibility estimate"] },
  { id: "pdr", name: "PDR", fullName: "Preliminary Design Review", beginner: "Checks that the overall design approach is sound before detailed design work is invested in it.", entryCriteria: ["Preliminary mass budget", "Preliminary stability estimate", "Draft subsystem architecture"], evidence: ["Simulation results", "Identified risks and open items"] },
  { id: "cdr", name: "CDR", fullName: "Critical Design Review", beginner: "Checks that the design is complete and correct enough to start building — the design is 'frozen' after this, ideally.", entryCriteria: ["Complete design (structures, avionics, recovery)", "Updated simulation with as-designed values"], evidence: ["Structural margin calculations", "Avionics architecture", "Traceability from requirements to design"] },
  { id: "trr", name: "TRR", fullName: "Test Readiness Review", beginner: "Checks the vehicle and test plan are ready before ground testing (like a deployment charge test) begins.", entryCriteria: ["Built, integrated vehicle", "Written test procedure"], evidence: ["Test procedure with pass/fail criteria", "Safety plan for the test"] },
  { id: "frr", name: "FRR", fullName: "Flight Readiness Review", beginner: "The final go/no-go check before launch, confirming every checklist item is closed.", entryCriteria: ["Completed ground testing", "Closed action items", "Weather/range status"], evidence: ["Completed checklist", "Open-risk list with disposition"] },
  { id: "post-flight-review", name: "Post-Flight Review", fullName: "Post Flight Review", beginner: "Looks back at what actually happened in flight compared to what was predicted, to improve the next design.", entryCriteria: ["Recovered vehicle and/or telemetry data"], evidence: ["Actual-vs-predicted comparison", "Lessons-learned list"] },
];

export interface FailureMode {
  id: string;
  title: string;
  system: RocketSystem;
  observe: string;
  causes: string[];
  consequence: string;
  detect: string;
  prevent: string;
  relatedComponentId?: string;
}

export const FAILURE_MODES: FailureMode[] = [
  { id: "unstable-flight", title: "Unstable flight", system: "vehicle", observe: "The rocket wobbles, tumbles, or arcs sharply off its intended path shortly after leaving the rail.", causes: ["Insufficient static margin (CG too close to or behind CP)", "Excessive weathercocking in wind"], consequence: "Unpredictable flight path and landing location; risk to people or property.", detect: "Check static margin during design (simulation) and by a swing test before flight.", prevent: "Verify CG is sufficiently ahead of CP with an adequate but not excessive static margin before flying.", relatedComponentId: "fins" },
  { id: "fin-failure", title: "Fin damage or detachment", system: "vehicle", observe: "A fin is missing, cracked, or came loose after landing or mid-flight.", causes: ["Weak bonding", "Fin flutter at high speed", "Storage/handling damage"], consequence: "Sudden loss of stability, often mid-flight.", detect: "Visual inspection before every flight; flutter risk assessed at design time for high-speed builds.", prevent: "Use adequate bonding technique and verified fin material/thickness for the expected speed.", relatedComponentId: "fins" },
  { id: "structural-separation", title: "Structural separation / weak joints", system: "vehicle", observe: "Airframe sections separate unexpectedly, or a coupler pulls apart under load.", causes: ["Insufficient bonding or friction fit", "Underestimated flight or deployment loads"], consequence: "Loss of vehicle integrity, often leading to an unrecoverable flight.", detect: "Structural margin calculation at design time; physical inspection and fit-check before flight.", prevent: "Size joints and bonds against the governing load case (max-Q or deployment shock), and re-inspect before every flight.", relatedComponentId: "couplers" },
  { id: "ignition-failure", title: "Motor ignition failure", system: "propulsion", observe: "No thrust at the expected ignition command; the motor does not light.", causes: ["Poor igniter installation", "Bad electrical continuity", "Igniter/motor incompatibility"], consequence: "Mission scrub; requires a safe, range-officer-led approach to a 'misfire' per standard safety procedures.", detect: "Continuity check before every launch attempt.", prevent: "Follow manufacturer igniter-installation instructions exactly and always continuity-check before arming.", relatedComponentId: "motor" },
  { id: "underperformance", title: "Propulsion under-performance", system: "propulsion", observe: "Lower altitude or slower ascent than the simulation predicted.", causes: ["Motor performance variance versus data sheet", "Higher-than-estimated vehicle mass or drag"], consequence: "Mission altitude/performance requirement not met.", detect: "Compare actual flight data (telemetry or altimeter) against the simulation prediction.", prevent: "Build in margin between required and simulated performance; verify as-built mass against the mass budget.", relatedComponentId: "motor" },
  { id: "deployment-failure", title: "Recovery deployment failure", system: "recovery", observe: "The parachute does not deploy at apogee; the vehicle continues in a high-speed descent (or 'lawn dart').", causes: ["Deployment charge too weak", "Coupler friction fit too tight", "Flight-computer logic or power failure"], consequence: "High-speed impact; likely vehicle damage or loss.", detect: "Ground-test the deployment charge and separation before first flight; verify flight-computer continuity pre-flight.", prevent: "Always include a backup deployment timer, and ground-test the full separation event before flying.", relatedComponentId: "deployment-compartment" },
  { id: "parachute-tangle", title: "Parachute damage or tangling", system: "recovery", observe: "The parachute is out but not fully open, or is twisted/tangled during descent.", causes: ["Improper packing procedure", "Shroud lines tangled with shock cord"], consequence: "Higher-than-intended descent rate; possible landing damage.", detect: "Practice and verify the packing procedure with ground deployment tests.", prevent: "Use a consistent, tested packing method every time — don't improvise packing on launch day.", relatedComponentId: "parachute" },
  { id: "excessive-descent", title: "Excessive descent rate", system: "recovery", observe: "The vehicle lands harder than intended, causing damage.", causes: ["Undersized parachute for the recovered mass", "Partial deployment"], consequence: "Vehicle or payload damage on landing.", detect: "Calculate expected descent rate during design; compare to the observed landing.", prevent: "Size the parachute to the actual recovered mass, not an early estimate.", relatedComponentId: "parachute" },
  { id: "avionics-power-loss", title: "Avionics power failure", system: "avionics", observe: "No telemetry, no logged data, or no deployment command — the flight computer appears to have lost power.", causes: ["Loose battery connector", "Insufficient battery capacity", "Voltage sag under deployment current draw"], consequence: "Loss of deployment logic and/or flight data.", detect: "Pre-flight voltage and continuity check; post-flight review of logs for power-related gaps.", prevent: "Verify connectors and battery voltage before every flight; consider separate batteries for critical functions.", relatedComponentId: "power-supply" },
  { id: "flight-computer-reset", title: "Flight computer reset or sensor failure", system: "avionics", observe: "Logged data shows a gap, a restart, or clearly invalid sensor values mid-flight.", causes: ["Firmware bug", "Electrical noise/interference", "Sensor saturation or wiring fault"], consequence: "Missed or delayed deployment command; incomplete flight data.", detect: "Ground testing with vibration/handling similar to flight conditions; review logs for anomalies after every flight.", prevent: "Include a backup deployment timer independent of primary sensor logic.", relatedComponentId: "flight-computer" },
  { id: "telemetry-loss", title: "Telemetry loss / antenna issue", system: "avionics", observe: "The ground station stops receiving data partway through the flight.", causes: ["RF interference", "Antenna damage or poor placement", "Range/line-of-sight limits"], consequence: "Incomplete real-time data (onboard logging, if present, may still have the full record).", detect: "Range-test the telemetry link before flight day.", prevent: "Always log data onboard in addition to telemetry, so a link dropout doesn't mean losing the whole record.", relatedComponentId: "telemetry-radio" },
  { id: "premature-deployment", title: "Premature or late deployment", system: "recovery", observe: "The parachute deploys well before or well after apogee.", causes: ["Deployment logic miscalibrated", "Barometric noise near transonic speed or vehicle structure", "Backup timer set incorrectly"], consequence: "Premature: high-speed deployment damage. Late: excessive speed before recovery.", detect: "Review logged sensor data against the actual deployment event after flight.", prevent: "Test deployment logic thoroughly on the ground and sanity-check backup timer settings against the simulated flight time to apogee.", relatedComponentId: "flight-computer" },
  { id: "rail-alignment", title: "Launch rail alignment issue", system: "ground-segment", observe: "The rocket departs the rail at a noticeable angle rather than the intended trajectory.", causes: ["Rail not vertical (or not at the planned angle)", "Rail buttons binding on the rail"], consequence: "Off-course flight, reduced altitude, increased risk to the safety perimeter.", detect: "Visual and level check of the rail before each launch.", prevent: "Verify rail alignment and rail-button fit as a standard pre-launch checklist item.", relatedComponentId: "launch-rail" },
  { id: "low-rail-exit", title: "Insufficient rail-exit velocity", system: "vehicle", observe: "The rocket appears to wobble or lean immediately after leaving the rail, especially in wind.", causes: ["Rail too short for the selected motor's thrust", "Motor underperforming"], consequence: "Early instability before aerodynamic surfaces can act.", detect: "Calculate expected rail-exit velocity during design against the motor's thrust curve.", prevent: "Match rail length to the motor and vehicle mass, and avoid launching in excessive wind.", relatedComponentId: "launch-lug" },
  { id: "weather-decision", title: "Poor weather decision", system: "ground-segment", observe: "A flight is attempted despite high wind, low clouds, or other unfavorable conditions.", causes: ["Schedule pressure overriding a cautious go/no-go decision"], consequence: "Increased risk of instability, drift into unsafe areas, or lost vehicle.", detect: "Weather checks are a standard, non-negotiable item on the launch-readiness checklist.", prevent: "Set clear weather go/no-go criteria in advance, and follow them regardless of schedule pressure." },
  { id: "mass-mismatch", title: "Incorrect mass assumption / configuration mismatch", system: "vehicle", observe: "Actual flight performance differs noticeably from the simulation.", causes: ["As-built mass differs from the design's mass budget", "Last-minute part swap not reflected in the design record"], consequence: "Stability margin or performance different from what was verified in review.", detect: "Weigh the as-built vehicle and compare against the mass budget before flight.", prevent: "Keep the mass budget and design record updated through build, not just at design review." },
  { id: "checklist-failure", title: "Checklist / process failure", system: "ground-segment", observe: "A known pre-flight step was skipped, discovered only after an anomaly.", causes: ["No written checklist, or checklist not followed under time pressure"], consequence: "Any of the other failure modes above becomes more likely.", detect: "A completed, signed-off checklist is required evidence at Flight Readiness Review.", prevent: "Use a written, itemized checklist for every flight, without exception." },
];

export interface FmeaRow {
  id: string;
  system: string;
  failureMode: string;
  effect: string;
  cause: string;
  detection: string;
  mitigation: string;
  severity: 1 | 2 | 3 | 4 | 5;
  occurrence: 1 | 2 | 3 | 4 | 5;
  detectability: 1 | 2 | 3 | 4 | 5;
}

export const FMEA_ROWS: FmeaRow[] = [
  { id: "fmea-avionics-power", system: "Avionics", failureMode: "Power loss", effect: "No flight data or deployment command", cause: "Connector or battery issue", detection: "Pre-flight voltage/continuity check", mitigation: "Robust connectors, verified battery capacity, pre-flight checklist", severity: 5, occurrence: 2, detectability: 2 },
  { id: "fmea-recovery-deploy", system: "Recovery", failureMode: "Parachute fails to open", effect: "High descent velocity, vehicle damage", cause: "Packing or deployment-charge issue", detection: "Ground deployment test", mitigation: "Verification testing plus a consistent, tested packing procedure", severity: 5, occurrence: 2, detectability: 3 },
  { id: "fmea-structure-fin", system: "Structure", failureMode: "Fin damage", effect: "Stability degradation, possible loss of vehicle", cause: "Manufacturing or handling issue", detection: "Visual inspection", mitigation: "Design and manufacturing inspection, pre-flight checklist", severity: 4, occurrence: 2, detectability: 1 },
  { id: "fmea-telemetry-link", system: "Telemetry", failureMode: "Link loss", effect: "No real-time data (if onboard logging also missing, permanent data loss)", cause: "RF interference, antenna, or configuration issue", detection: "Range communication check before flight", mitigation: "Onboard logging in addition to telemetry, plus link validation", severity: 2, occurrence: 3, detectability: 2 },
  { id: "fmea-propulsion-ignition", system: "Propulsion", failureMode: "Ignition failure", effect: "Mission scrub, requires safe misfire procedure", cause: "Igniter installation or continuity fault", detection: "Continuity check before arming", mitigation: "Follow manufacturer igniter procedure exactly; always continuity-check", severity: 3, occurrence: 2, detectability: 1 },
  { id: "fmea-flight-computer", system: "Avionics", failureMode: "Flight computer reset", effect: "Missed deployment command", cause: "Firmware fault or electrical noise", detection: "Ground vibration/handling test, post-flight log review", mitigation: "Independent backup deployment timer", severity: 5, occurrence: 2, detectability: 3 },
];

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  { term: "Aerodynamics", definition: "The study of how air flows around a moving object, and the forces (like drag and lift) that result." },
  { term: "Apogee", definition: "The highest point of a rocket's flight, where vertical velocity briefly reaches zero before descent begins." },
  { term: "Avionics", definition: "The onboard electronics of a flight vehicle: sensors, flight computer, telemetry and power." },
  { term: "Burnout", definition: "The moment a motor finishes burning its propellant and stops producing thrust." },
  { term: "Centre of Gravity (CG)", definition: "The point where a rocket's mass can be considered to be concentrated for balance purposes." },
  { term: "Centre of Pressure (CP)", definition: "The point where the net aerodynamic force on a rocket can be considered to act." },
  { term: "Drag", definition: "The aerodynamic force that opposes a rocket's motion through the air." },
  { term: "FEA", definition: "Finite Element Analysis — a computational method for predicting how a structure behaves under load." },
  { term: "FMEA", definition: "Failure Mode and Effects Analysis — a structured method for identifying how a system could fail, its effects, and mitigations, before failure happens." },
  { term: "Flight computer", definition: "The onboard electronics that read sensors and make decisions, such as when to deploy recovery." },
  { term: "GNC", definition: "Guidance, Navigation and Control — the discipline of determining a vehicle's position/state and controlling its path." },
  { term: "HIL", definition: "Hardware-in-the-Loop — testing real flight hardware against a simulated environment before flight." },
  { term: "IMU", definition: "Inertial Measurement Unit — a sensor combining an accelerometer and gyroscope to measure motion." },
  { term: "Impulse", definition: "The total 'push' a motor delivers over its burn, used to classify motors by letter (e.g., A–G)." },
  { term: "Motor", definition: "The certified commercial device that burns propellant to produce thrust." },
  { term: "Payload", definition: "The experiment, sensor package, or cargo a rocket carries, separate from the vehicle's own flight systems." },
  { term: "PDR", definition: "Preliminary Design Review — checks the overall design approach is sound before detailed design work." },
  { term: "CDR", definition: "Critical Design Review — checks the design is complete and correct before build begins." },
  { term: "Recovery", definition: "The subsystem (usually a parachute) that slows a rocket's descent for a safe, reusable landing." },
  { term: "Static margin", definition: "The distance between CP and CG, expressed in body diameters (calibers), indicating stability margin." },
  { term: "Telemetry", definition: "Data transmitted in real time from the vehicle to a ground receiver during flight." },
  { term: "Thrust", definition: "The forward force produced by the motor that accelerates the rocket." },
  { term: "Thrust curve", definition: "A graph of a motor's thrust over the duration of its burn." },
  { term: "Verification", definition: "Confirming a system was built correctly, according to its design and requirements." },
  { term: "Validation", definition: "Confirming a system actually meets the intended mission need, not just its written requirements." },
];

export interface RoadmapStage {
  id: string;
  stage: string;
  title: string;
  items: string[];
}

export const ROADMAP: RoadmapStage[] = [
  { id: "stage-0", stage: "Stage 0", title: "Understand", items: ["Rocket anatomy", "Four forces of flight", "Flight phases", "Safety basics"] },
  { id: "stage-1", stage: "Stage 1", title: "Simulate", items: ["OpenRocket basics", "Mass estimation", "CG/CP and stability", "Motor data sheets", "Predicted trajectory"] },
  { id: "stage-2", stage: "Stage 2", title: "Design", items: ["CAD fundamentals", "Structural design", "Avionics architecture", "Recovery sizing"] },
  { id: "stage-3", stage: "Stage 3", title: "Instrument", items: ["Microcontroller basics", "Sensor integration", "Data logging", "Telemetry basics"] },
  { id: "stage-4", stage: "Stage 4", title: "Verify", items: ["Requirements traceability", "Ground testing", "Checklists", "FMEA", "Design review"] },
  { id: "stage-5", stage: "Stage 5", title: "Fly & Analyse", items: ["Safe launch procedures", "Telemetry capture", "Recovery", "Actual vs. predicted analysis"] },
  { id: "stage-6", stage: "Stage 6", title: "Research", items: ["Modelling and simulation", "Digital twin concepts", "Fault detection", "Hardware-in-the-loop", "Reliability engineering"] },
  { id: "stage-7", stage: "Stage 7", title: "Career / Venture", items: ["Build a portfolio", "Pursue internships", "Explore research roles", "Consider aerospace product/startup paths"] },
];

export interface SimToolTopic {
  name: string;
  learnFirst: string[];
  whenComplexityRequires: string[];
}

export const SIM_TOOLS: SimToolTopic[] = [
  { name: "OpenRocket", learnFirst: ["Vehicle geometry and mass entry", "Motor selection from the built-in database", "CG/CP and stability check", "Predicted altitude, velocity and acceleration"], whenComplexityRequires: ["Comparing multiple simulation runs against real flight data", "Iterating fin/geometry design against a target performance"] },
  { name: "CAD", learnFirst: ["Basic 2D sketches and 3D parts (e.g., FreeCAD, Fusion 360, Onshape)", "Assembling a simple multi-part model"], whenComplexityRequires: ["Structural analysis integration (FEA)", "Manufacturing-ready detailed drawings"] },
  { name: "Python", learnFirst: ["Plotting altitude/velocity/acceleration from a CSV log", "Basic filtering of noisy sensor data"], whenComplexityRequires: ["Comparing simulated vs. actual flight with statistical analysis", "Basic Monte Carlo sensitivity studies"] },
  { name: "Electronics", learnFirst: ["Arduino/ESP32 basics", "Reading a sensor and logging to storage"], whenComplexityRequires: ["Custom flight-computer PCB design", "Sensor fusion algorithms"] },
  { name: "Data & Telemetry", learnFirst: ["Serial data logging", "Basic radio telemetry concepts"], whenComplexityRequires: ["Real-time dashboards", "Post-flight data pipelines"] },
  { name: "Advanced tools", learnFirst: ["Awareness of CFD/FEA concepts and what they're for"], whenComplexityRequires: ["CFD for detailed aerodynamic analysis", "FEA for structural margin verification", "RASAero for higher-power performance prediction", "Hardware-in-the-loop testing", "Monte Carlo / uncertainty-sensitivity analysis"] },
];

export const MATURITY_PATHWAY: string[] = [
  "Learn",
  "Build",
  "Validate",
  "Research",
  "Develop IP",
  "Pilot",
  "Customer Discovery",
  "Product/Service",
  "Startup",
];

export interface OpportunityCategory {
  id: string;
  name: string;
  problem: string;
  customer: string;
  prototypeIdea: string;
  validationNeeded: string;
  businessModels: string[];
}

export const OPPORTUNITY_CATEGORIES: OpportunityCategory[] = [
  {
    id: "education",
    name: "Education",
    problem: "Students and educators need accessible, structured ways to learn real aerospace engineering.",
    customer: "Schools, colleges, STEM education programmes",
    prototypeIdea: "A structured workshop curriculum or learning kit",
    validationNeeded: "Piloting with a real classroom or workshop cohort and measuring learning outcomes",
    businessModels: ["Workshop delivery", "Kit sales", "Licensing curriculum content"],
  },
  {
    id: "avionics",
    name: "Avionics",
    problem: "Hobbyist and student teams need affordable, reliable flight computers.",
    customer: "Student rocketry teams, hobbyists, university labs",
    prototypeIdea: "An educational flight computer with sensor logging and deployment logic",
    validationNeeded: "Multiple successful test flights and independent reliability verification",
    businessModels: ["Hardware sales", "Open-source hardware with paid support"],
  },
  {
    id: "telemetry",
    name: "Telemetry",
    problem: "Teams need affordable, reliable real-time data links for student-scale rockets.",
    customer: "Student rocketry teams, competition organisers",
    prototypeIdea: "A low-cost telemetry radio + ground receiver kit",
    validationNeeded: "Range testing across realistic flight conditions",
    businessModels: ["Hardware sales", "Subscription ground-station software"],
  },
  {
    id: "simulation",
    name: "Simulation",
    problem: "Beginners need approachable tools to predict flight performance before building.",
    customer: "Students, educators, hobbyist teams",
    prototypeIdea: "A simplified web-based flight simulator or teaching tool",
    validationNeeded: "Comparing simulator predictions against real flight data",
    businessModels: ["Freemium software", "Institutional licensing"],
  },
  {
    id: "digital-twin",
    name: "Digital Twin",
    problem: "Teams lack an easy way to compare simulated and actual mission behaviour visually.",
    customer: "University labs, advanced student teams",
    prototypeIdea: "A dashboard that overlays simulated and telemetry data on one timeline",
    validationNeeded: "Demonstrated value on multiple real missions",
    businessModels: ["Software subscription", "Research collaboration"],
  },
  {
    id: "sensors",
    name: "Sensors",
    problem: "Advanced student payloads need reliable, small, well-documented sensor modules.",
    customer: "Student teams, research labs",
    prototypeIdea: "A validated sensor breakout module with clear documentation",
    validationNeeded: "Independent accuracy/reliability testing",
    businessModels: ["Hardware sales", "Custom integration services"],
  },
  {
    id: "testing",
    name: "Testing",
    problem: "Teams need affordable ways to ground-test deployment charges, structures and avionics before flight.",
    customer: "Student teams, workshop organisers",
    prototypeIdea: "A portable ground-test rig for deployment/continuity checks",
    validationNeeded: "Demonstrated safety and repeatability across multiple test cycles",
    businessModels: ["Equipment rental", "Testing-as-a-service at events"],
  },
  {
    id: "ground-systems",
    name: "Ground Systems",
    problem: "Teams and range operators need safe, reliable launch control and ground infrastructure.",
    customer: "Student teams, workshop and competition organisers",
    prototypeIdea: "A safe, certified-component launch controller kit",
    validationNeeded: "Safety review and use across multiple real launch events",
    businessModels: ["Hardware sales", "Range-support services"],
  },
  {
    id: "data-analytics",
    name: "Data Analytics",
    problem: "Teams collect flight data but often lack tools to analyse it meaningfully.",
    customer: "Student teams, research labs",
    prototypeIdea: "A post-flight analysis toolkit (plotting, filtering, comparison)",
    validationNeeded: "Adoption and useful insight generation across multiple teams",
    businessModels: ["Software subscription", "Open-source with paid analysis services"],
  },
  {
    id: "safety-reliability",
    name: "Safety & Reliability",
    problem: "Teams need structured ways to apply FMEA and safety review to educational projects.",
    customer: "Workshop organisers, university programmes",
    prototypeIdea: "A guided FMEA/checklist toolkit for student teams",
    validationNeeded: "Demonstrated reduction in preventable failures across teams that adopt it",
    businessModels: ["Training workshops", "Toolkit licensing"],
  },
  {
    id: "software",
    name: "Software",
    problem: "Teams need reliable, well-documented flight and ground software rather than ad-hoc scripts.",
    customer: "Student teams, educational programmes",
    prototypeIdea: "An open, documented flight-software reference implementation",
    validationNeeded: "Adoption and successful flights across multiple independent teams",
    businessModels: ["Support contracts", "Custom development services"],
  },
  {
    id: "training-consulting",
    name: "Training & Consulting",
    problem: "Institutions want to run rocketry programmes but lack in-house expertise.",
    customer: "Schools, universities, corporate STEM outreach programmes",
    prototypeIdea: "A trainer-delivered workshop or mentorship programme",
    validationNeeded: "Repeat engagements and measurable outcomes across institutions",
    businessModels: ["Workshop fees", "Retainer consulting"],
  },
  {
    id: "tech-transfer",
    name: "Space/Aerospace Technology Transfer",
    problem: "Techniques and components proven at model-rocketry scale may generalise to adjacent aerospace applications.",
    customer: "Research institutions, early-stage aerospace ventures",
    prototypeIdea: "A validated component or method with a clear technology-readiness narrative",
    validationNeeded: "Independent replication and a credible path to higher technology readiness levels",
    businessModels: ["Licensing", "Joint research and development"],
  },
];

export interface ChapterSection {
  href: string;
  label: string;
}

export interface Chapter {
  id: string;
  title: string;
  sections: ChapterSection[];
}

// Groups every anchor in AnchorNav.NAV_ITEMS into the six mobile learning
// chapters — every existing href must appear here exactly once.
export const CHAPTERS: Chapter[] = [
  {
    id: "understand",
    title: "Understand",
    sections: [
      { href: "#what-is-it", label: "What is it?" },
      { href: "#model-vs-real", label: "Model vs Real" },
    ],
  },
  {
    id: "explore-the-rocket",
    title: "Explore the Rocket",
    sections: [
      { href: "#explorer", label: "Rocket Explorer" },
      { href: "#systems", label: "Systems" },
    ],
  },
  {
    id: "understand-flight",
    title: "Understand Flight",
    sections: [
      { href: "#flight-physics", label: "Flight & Stability" },
      { href: "#propulsion", label: "Propulsion" },
    ],
  },
  {
    id: "engineer-the-mission",
    title: "Engineer the Mission",
    sections: [
      { href: "#workflow", label: "Build Path" },
      { href: "#design-reviews", label: "Design Reviews" },
      { href: "#sim-tools", label: "Simulation" },
    ],
  },
  {
    id: "learn-from-failure",
    title: "Learn from Failure",
    sections: [
      { href: "#failure-lab", label: "Failure Lab" },
      { href: "#fmea", label: "FMEA" },
    ],
  },
  {
    id: "explore-your-future",
    title: "Explore Your Future",
    sections: [
      { href: "#rocketry-vs-cansat", label: "Model vs CanSat" },
      { href: "#competitions", label: "Competitions" },
      { href: "#glossary", label: "Glossary" },
      { href: "#careers", label: "Careers" },
      { href: "#cost", label: "Cost" },
      { href: "#enterprise", label: "Enterprise" },
      { href: "#roadmap", label: "Roadmap" },
    ],
  },
];
