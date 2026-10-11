// From a working propulsion system to a Digital Twin: the twelve steps, the
// acquisition chain a measurement travels, what makes telemetry trustworthy,
// and the four kinds of question data can answer.

export const TRANSFORMATION_HEADING = "How do we convert a working propulsion system into a Digital Twin?";
export const TRANSFORMATION_INTRO =
  "Converting a physical propulsion system into a Digital Twin is a sequence of engineering steps, each of which produces evidence the next depends on. Skipping one does not remove the work; it removes the reason to trust what follows.";

export interface TransformationStep {
  id: string;
  title: string;
  summary: string;
  /** What is identified, produced or decided in this step. */
  outputs: readonly string[];
  /** How this page's own simulated twin does it. */
  here: string;
  /** Which module of the tutorial goes into it. */
  module: "system" | "pressure" | "physics" | "data" | "twin" | "ai" | "fdir" | "health";
}

export const TRANSFORMATION_STEPS: readonly TransformationStep[] = [
  { id: "define", title: "Define the Physical Asset", summary: "Draw the boundary. Say what the asset is, what it connects to, how it operates and which of its states can be observed.", outputs: ["Components", "Interfaces", "Operating modes", "Control inputs", "Measurable states", "Hidden states"], here: "Ten subsystems, five operating modes, 22 measured channels and eight inferred parameters.", module: "system" },
  { id: "instrument", title: "Instrument the Engine", summary: "Decide what is measured, where, how fast and how well, and how each measurement can be checked against another.", outputs: ["Location", "Physical variable", "Sampling requirement", "Accuracy requirement", "Operating range", "Redundancy", "Calibration state"], here: "Fifteen pressure sensors, plus flow, speed, valve position, temperature, vibration and a thrust proxy, each with a noise model.", module: "pressure" },
  { id: "acquire", title: "Build Data Acquisition", summary: "Carry each measurement from the sensor to an engineering value with a trustworthy timestamp.", outputs: ["Signal conditioning", "ADC and DAQ", "Timestamp", "Engineering units", "Validation", "Telemetry"], here: "Three acquisition nodes with latency, clock offset and sequence counters that the data-quality layer checks.", module: "data" },
  { id: "model", title: "Build Physics Models", summary: "Write the system equations and the component models, at the fidelity the twin's purpose needs.", outputs: ["System equations", "Component models", "Assumptions", "Operating envelope"], here: "A reduced-order pressure network: quadratic losses, pump head curves and a first-order chamber.", module: "physics" },
  { id: "identify", title: "Identify Model Parameters", summary: "Estimate the parameters design cannot give exactly, from test evidence of this particular asset.", outputs: ["Loss coefficients", "Pump head scale", "Combustion efficiency", "Fit quality and its limits"], here: "Least-squares fits to 400 simulated test points across five throttle settings. Time constants are not identified.", module: "data" },
  { id: "synchronise", title: "Synchronise Model and Telemetry", summary: "Drive the model with the measured operating conditions, on the same clock as the data.", outputs: ["Commands as model inputs", "Time alignment", "Operating-mode tracking"], here: "The model receives the same throttle command and ignition state, step for step, and widens its uncertainty in transients.", module: "twin" },
  { id: "estimate", title: "Estimate Hidden States", summary: "Use state estimation to combine what is measured with what the model predicts, and to reach states no sensor reads.", outputs: ["Filtered measurements", "Fused states", "Virtual sensors", "Inferred parameters"], here: "A Kalman filter per channel, a three-way fusion for chamber pressure, and eight parameters inferred by inverting the model.", module: "twin" },
  { id: "residual", title: "Calculate Residuals", summary: "Residual = Observation − Model Expectation. A residual near zero is agreement; one that grows is information.", outputs: ["Residual per channel", "Residual in standard deviations", "Healthy baseline and scatter"], here: "Each residual is measured against the baseline and scatter learned on a separate healthy run.", module: "twin" },
  { id: "detect", title: "Detect Faults", summary: "Decide, with a stated false-alarm behaviour, that something is no longer nominal.", outputs: ["Physics-based detection", "Statistical detection", "Learned detection", "A rule for combining them"], here: "Seven detectors side by side. An anomaly needs two independent detectors, or one redline.", module: "fdir" },
  { id: "diagnose", title: "Diagnose", summary: "Determine the probable component and the probable failure mechanism, and say how sure.", outputs: ["Candidate causes", "Evidence for and against", "Confidence", "What to verify"], here: "Physics-based pattern matching fused with a learned classifier, with every piece of evidence listed.", module: "fdir" },
  { id: "predict", title: "Predict", summary: "Estimate where the fault is going and how long there is.", outputs: ["Future pressure", "Performance degradation", "Health trajectory", "Remaining margin"], here: "A trend on the driving parameter, projected through the model, with a band that widens with the horizon.", module: "health" },
  { id: "validate", title: "Validate the Twin", summary: "Compare the model's predictions with independent evidence, and state the envelope in which the comparison holds.", outputs: ["Independent validation data", "Error against that data", "Declared envelope", "Limitations"], here: "Validation here is against simulated data only, and every model card on this page says so.", module: "twin" },
];

// ── The acquisition chain ───────────────────────────────────────────────────

export const ACQUISITION_CHAIN: readonly { id: string; label: string; text: string; failure: string }[] = [
  { id: "sensor", label: "Sensor", text: "A transducer turns a physical quantity into an electrical one.", failure: "Bias, drift, a stuck or saturated output." },
  { id: "conditioning", label: "Signal conditioning", text: "Excitation, amplification and anti-alias filtering, matched to the sensor and the sample rate.", failure: "A wrong gain or filter corner; noise pickup from poor shielding." },
  { id: "daq", label: "ADC / DAQ", text: "The signal is sampled and digitised at a fixed rate.", failure: "Aliasing, quantisation, dropped samples, a channel mapped to the wrong input." },
  { id: "timestamp", label: "Timestamp", text: "Each sample is stamped from a clock synchronised across every acquisition node.", failure: "A node clock that is offset or drifting; samples aligned at the wrong instant." },
  { id: "units", label: "Engineering units", text: "Counts become pressures, temperatures and speeds through each sensor's calibration.", failure: "An out-of-date calibration, or a unit conversion applied twice or not at all." },
  { id: "validation", label: "Validation", text: "Range, rate, flat-line and consistency checks, each recorded as a quality flag beside the value.", failure: "Bad data passed on as good, or good data rejected." },
  { id: "telemetry", label: "Telemetry", text: "Values, timestamps and quality flags are framed, sequenced and sent.", failure: "Latency, packet loss, duplication, reordering, replay." },
];

export const SAMPLING_NOTES: readonly { term: string; text: string }[] = [
  { term: "Sample rate", text: "Set by the fastest behaviour the twin must see, not by what is convenient. A chamber pressure used for control is sampled hundreds of times a second; a tank pressure does not need to be." },
  { term: "Anti-alias filtering", text: "Frequencies above half the sample rate fold back and look like slow signals. They have to be removed before sampling, in hardware." },
  { term: "Time synchronisation", text: "Residuals compare a measurement with a model value at the same instant. A few tens of milliseconds of misalignment between acquisition nodes is invisible in steady running and looks like a fault in a transient." },
  { term: "Calibration state", text: "A measurement is only as current as its calibration. The calibration date, standard and uncertainty travel with the channel as metadata." },
  { term: "Quality flags", text: "Every value carries its own health: in range, plausible rate, not flat-lined, fresh. Models consume the flag as well as the value." },
];

export const QUALITY_CHECKS: readonly { id: string; name: string; finds: string; how: string }[] = [
  { id: "range", name: "Range", finds: "Saturation, open circuit", how: "Value outside the sensor's physical range." },
  { id: "rate", name: "Rate", finds: "Spikes, intermittent contacts", how: "Change between samples faster than the physics allows." },
  { id: "flatline", name: "Flat-line", finds: "Stuck sensor, frozen channel", how: "Less variation than the channel's own noise floor." },
  { id: "noise", name: "Noise level", finds: "Noisy sensor, failing connector", how: "Scatter several times the calibrated noise, with the average unchanged." },
  { id: "latency", name: "Latency", finds: "Packet delay, congested link", how: "Arrival time minus sample timestamp." },
  { id: "skew", name: "Clock skew", finds: "Timestamp misalignment", how: "A node's time-sync pulse compared with the reference clock." },
  { id: "sequence", name: "Sequence", finds: "Packet loss, duplicated or replayed telemetry", how: "Sequence counters that skip, repeat or go backwards." },
  { id: "consistency", name: "Cross-sensor consistency", finds: "Bias and drift", how: "Redundant sensors, and sensors related through the model, that no longer agree." },
];

// ── Learning from test and operational data ─────────────────────────────────

export const ANALYTICS_HEADING = "Learning from Test and Operational Data";
export const ANALYTICS_INTRO = "A data-driven Digital Twin learns from recorded test and operational data. What it can learn is ordered by the kind of question being asked, and each level needs the one before it.";

export const ANALYTICS_LEVELS: readonly { id: string; name: string; question: string; text: string; example: string }[] = [
  { id: "descriptive", name: "Descriptive analytics", question: "What happened?", text: "Summaries of recorded data: levels, trends, exceedances, time spent in each operating mode.", example: "Chamber pressure averaged 1.4 % below command over the last run; cooling ΔP was 3 % higher than the run before." },
  { id: "diagnostic", name: "Diagnostic analytics", question: "Why did it happen?", text: "Relating a symptom to its cause, by residuals, by physics and by comparing with known signatures.", example: "The shortfall is explained by a pump head coefficient 2 % down; inlet pressure, shaft speed and valve position were nominal." },
  { id: "predictive", name: "Predictive analytics", question: "What will happen?", text: "Projecting a trend forward, with an uncertainty that grows with the horizon.", example: "At the present rate the head coefficient reaches its action limit in four to seven runs." },
  { id: "prescriptive", name: "Prescriptive decision support", question: "What action should engineers consider?", text: "Options with their consequences, for an engineer to decide between. The twin recommends; it does not decide.", example: "Inspect the oxidiser pump within three runs, or continue at reduced thrust with a tightened head-coefficient limit." },
];
