// Learning checkpoints, one set per module: can you explain, can you identify,
// can you diagnose, and an architect challenge. Each reveals its reasoning only
// after the learner has committed to an answer.
import type { ModuleId } from "../types";

export interface Choice {
  text: string;
  correct?: boolean;
}

export interface Question {
  question: string;
  choices: readonly Choice[];
  /** Shown once an answer has been chosen. */
  reasoning: string;
}

export interface Checkpoint {
  module: ModuleId;
  /** An open question, answered in the learner's own words before the model answer is revealed. */
  explain: { prompt: string; answer: string };
  identify: Question;
  diagnose: Question;
  architect: Question;
}

export const CHECKPOINT_LABELS = { explain: "Can you explain?", identify: "Can you identify?", diagnose: "Can you diagnose?", architect: "Architect Challenge" } as const;

export const CHECKPOINTS: readonly Checkpoint[] = [
  {
    module: "overview",
    explain: { prompt: "In two sentences, what makes something a Digital Twin and not a simulation?", answer: "A simulation runs a model under inputs someone chose. A Digital Twin is tied to one specific asset: that asset's telemetry continuously updates the model's states, so the twin says what is happening to this asset now and what is likely to happen next." },
    identify: {
      question: "A team shows a detailed 3D engine that plays back recorded test pressures as colours on the model. What is it?",
      choices: [{ text: "A Digital Twin" }, { text: "A Digital Shadow", correct: true }, { text: "A predictive Digital Twin" }, { text: "A simulation" }],
      reasoning: "Measurements from a physical asset update the picture, one way. No model state is being corrected by the data, and nothing is estimated or predicted. That is a Digital Shadow: level 3 on the ladder.",
    },
    diagnose: {
      question: "Which single addition would move that system up to a Digital Twin?",
      choices: [{ text: "Higher-resolution geometry" }, { text: "A faster rendering engine" }, { text: "A physics model whose states and parameters are updated from the telemetry", correct: true }, { text: "More sensors" }],
      reasoning: "The step from shadow to twin is the model: telemetry has to update model states and parameters, so that the representation can estimate what is not measured. Geometry and rendering change nothing about what the system knows.",
    },
    architect: {
      question: "You have budget for one of these first. Which gives a twin the most to stand on?",
      choices: [{ text: "A machine-learning anomaly detector" }, { text: "Time-synchronised, calibrated telemetry with quality flags", correct: true }, { text: "A real-time 3D viewer" }, { text: "A fleet dashboard" }],
      reasoning: "Every later step consumes telemetry. A model synchronised to badly timed or uncalibrated data produces residuals that mean nothing, and a learner trained on it learns the data faults. Trustworthy data comes first.",
    },
  },
  {
    module: "system",
    explain: { prompt: "Why is the fuel pump's discharge usually the highest pressure in a regeneratively cooled engine?", answer: "The fuel has the longest path to the chamber: it must pass the main valve, the cooling channels and the injector, each taking pressure, and still arrive above chamber pressure. The pump has to supply the sum of those drops on top of chamber pressure." },
    identify: {
      question: "Which of these is a hidden state, one that no sensor measures directly?",
      choices: [{ text: "Pump discharge pressure" }, { text: "Shaft speed" }, { text: "Pump head coefficient", correct: true }, { text: "Valve position" }],
      reasoning: "Head coefficient is the ratio of the pressure rise the pump delivers to what its curve predicts at the measured speed and flow. It is inferred from three measurements and a model, which is exactly what a twin adds.",
    },
    diagnose: {
      question: "Start is commanded and chamber pressure rises later than the sequence expects. Which subsystem do you look at first?",
      choices: [{ text: "Nozzle" }, { text: "Controls: valve timing and ignition sequence", correct: true }, { text: "Cooling" }, { text: "Propellant storage" }],
      reasoning: "A timing anomaly in a transient points at what sets the timing: valve opening order and rate, and ignition. The sequence is a control function, and valve command against position is the first evidence to check.",
    },
    architect: {
      question: "The model lumps both pumps onto one shaft-speed state. When does that assumption have to be revisited?",
      choices: [{ text: "Never; it is conservative" }, { text: "When a fault on one pump must be told apart from a fault on the other by its speed", correct: true }, { text: "When telemetry rate increases" }, { text: "When the UI is redesigned" }],
      reasoning: "A model is adequate for a purpose. Lumped speed is fine for pressure monitoring; it cannot represent one shaft slowing while the other does not, so a purpose that needs that distinction needs a higher-order model.",
    },
  },
  {
    module: "pressure",
    explain: { prompt: "Why is a pressure difference a better health indicator than either pressure on its own?", answer: "Each pressure depends on the operating point. The difference across a component depends on that component's flow resistance: divided by flow squared it is a constant of the hardware. If it changes at the same flow, the component has changed." },
    identify: {
      question: "Injector ΔP rises at constant flow. Which measurement pair shows it?",
      choices: [{ text: "Tank pressure and pump inlet pressure" }, { text: "Injector manifold pressure and chamber pressure", correct: true }, { text: "Turbine inlet and outlet pressure" }, { text: "Cooling inlet and outlet pressure" }],
      reasoning: "Injector ΔP is injector inlet (manifold) pressure minus chamber pressure. Because it is a small difference of two large numbers, both sensors have to be trustworthy for it to mean anything.",
    },
    diagnose: {
      question: "Pump inlet pressure falls while tank pressure holds steady and flow is unchanged. What is the most probable cause?",
      choices: [{ text: "Pump degradation" }, { text: "A restriction in the feed line or its filter", correct: true }, { text: "A pressurisation fault" }, { text: "Injector blockage" }],
      reasoning: "The loss is between the two sensors. With the tank holding, pressurisation is fine; with flow unchanged, the pressure drop of the feed line itself has increased. The pump has not failed yet, but its suction margin is shrinking.",
    },
    architect: {
      question: "Feed-line ΔP is comparable to the accuracy of the two absolute sensors that measure it. What do you specify?",
      choices: [{ text: "Faster sampling" }, { text: "A dedicated differential pressure sensor across the element", correct: true }, { text: "A larger filter" }, { text: "Averaging over a longer window" }],
      reasoning: "Subtracting two absolute readings adds their errors. A differential sensor measures the small quantity directly at its own accuracy. Sampling faster or averaging longer reduces noise, not bias.",
    },
  },
  {
    module: "physics",
    explain: { prompt: "Why does one flow meter, in steady state, imply flows it does not measure?", answer: "Conservation of mass: with nothing accumulating, what enters a volume leaves it. A measured flow into the cooling jacket is the flow out of it into the injector, unless there is a leak, which is what a mismatch would reveal." },
    identify: {
      question: "Shaft speed doubles at constant flow. Roughly what happens to pump pressure rise?",
      choices: [{ text: "It doubles" }, { text: "It quadruples", correct: true }, { text: "It stays the same" }, { text: "It rises eight-fold" }],
      reasoning: "Pump head scales with speed squared. Power scales with speed cubed, which is why shaft speed is both a primary control and a primary health quantity.",
    },
    diagnose: {
      question: "Coolant temperature rise climbs at constant chamber pressure. What does the energy balance tell you?",
      choices: [{ text: "Heat load has risen" }, { text: "Less coolant is carrying the same heat", correct: true }, { text: "The temperature sensor has failed" }, { text: "Combustion efficiency has improved" }],
      reasoning: "Heat load follows chamber pressure, which has not changed. Q̇ = ṁ·c_p·ΔT, so a larger ΔT at the same Q̇ means a smaller ṁ: the coolant flow is restricted. A sensor fault remains possible and is checked against cooling ΔP.",
    },
    architect: {
      question: "Which model belongs in the live loop of a twin that must keep up with telemetry?",
      choices: [{ text: "The CFD model, for accuracy" }, { text: "A reduced-order model, with high-fidelity models supplying its coefficients off line", correct: true }, { text: "Whichever was built first" }, { text: "No physics model; a neural network alone" }],
      reasoning: "One model should not try to answer every question. The live loop needs microseconds per step; the detail comes from higher-fidelity models that run in advance and feed the reduced one.",
    },
  },
  {
    module: "data",
    explain: { prompt: "Why does a few tens of milliseconds of clock offset between acquisition nodes matter?", answer: "A residual compares a measurement with a model value at the same instant. In steady running a small offset is invisible. In a transient, pressure may change by several percent in that time, so the misalignment appears as a residual and looks like a fault." },
    identify: {
      question: "Which step turns design values into a model of this particular asset?",
      choices: [{ text: "Build physics models" }, { text: "Identify model parameters", correct: true }, { text: "Calculate residuals" }, { text: "Detect faults" }],
      reasoning: "Design gives nominal coefficients. Hardware differs from design, and identification fits the model's parameters to test evidence of the as-built asset. Without it the twin is a model of the drawing.",
    },
    diagnose: {
      question: "A channel reads exactly 1,000 times too large from the first sample of a test. What kind of fault is this?",
      choices: [{ text: "Sensor drift" }, { text: "An engineering-unit conversion error", correct: true }, { text: "Packet delay" }, { text: "Pump overspeed" }],
      reasoning: "A constant factor present from the first sample is a scaling error in the conversion from counts to units, not a physical or sensor fault. It belongs to the digital fault class and is caught by a range check.",
    },
    architect: {
      question: "Where should quality checks on telemetry run?",
      choices: [{ text: "Only in the dashboard" }, { text: "At the edge, with the flag travelling beside every value", correct: true }, { text: "Only during post-test analysis" }, { text: "Nowhere; models are robust" }],
      reasoning: "Every consumer of the data needs to know whether to believe it, and the edge is the only place that sees the raw signal. The flag is part of the measurement.",
    },
  },
  {
    module: "twin",
    explain: { prompt: "What is the difference between the observed, the estimated and the expected value of chamber pressure?", answer: "Observed is what a sensor reports, with its noise and faults. Expected is what the physics model computes for the current command. Estimated is the best judgement of the true value after combining the two, weighting each by its uncertainty." },
    identify: {
      question: "Which estimator is the natural first choice for a propulsion model with quadratic flow relations and Gaussian noise?",
      choices: [{ text: "Moving average" }, { text: "Extended Kalman filter", correct: true }, { text: "Linear Kalman filter" }, { text: "Particle filter" }],
      reasoning: "The model is nonlinear, which rules out the linear filter, and a moving average uses no model at all. An extended filter linearises at each step and is cheap. A particle filter is kept for non-Gaussian or multi-modal problems.",
    },
    diagnose: {
      question: "Sensors A and B disagree on chamber pressure. What settles which is right?",
      choices: [{ text: "Trust the higher reading" }, { text: "Average them" }, { text: "A third, independent estimate, such as the model's virtual sensor", correct: true }, { text: "Whichever was calibrated more recently" }],
      reasoning: "Two sensors can show that one is wrong, not which. Analytical redundancy supplies the third opinion: chamber pressure computed from injector pressure and flow, or from thrust, without either sensor.",
    },
    architect: {
      question: "A model is labelled \"validated\". What must the label come with?",
      choices: [{ text: "A version number" }, { text: "The intended use, the envelope and the independent data it was validated against", correct: true }, { text: "A demonstration video" }, { text: "The developer's name" }],
      reasoning: "Validation is always for a use and inside an envelope, against data not used for fitting. Without those three, the word carries no information, and outside the envelope the model is unvalidated again.",
    },
  },
  {
    module: "ai",
    explain: { prompt: "Why can a pure machine-learning model predict something physically impossible?", answer: "It learns correlations in its training data and nothing else. Nothing tells it that mass is conserved or that flow runs from high pressure to low, so outside the conditions it was trained on it can produce a pressure without the flow to cause it." },
    identify: {
      question: "Labelled failures are scarce. Which family of method can still be trained?",
      choices: [{ text: "Supervised classification" }, { text: "Unsupervised anomaly detection", correct: true }, { text: "Regression on failure time" }, { text: "None" }],
      reasoning: "Anomaly detection learns only what healthy data looks like. It needs no failure examples, at the cost of saying only that something is unfamiliar, not what.",
    },
    diagnose: {
      question: "The physics residual is flat but a learned anomaly detector's score rises steadily over weeks. What do you suspect first?",
      choices: [{ text: "A slowly growing engine fault" }, { text: "Drift: the data has moved away from what the model was trained on", correct: true }, { text: "A cyber attack" }, { text: "Sensor saturation" }],
      reasoning: "If the engine were changing, the physics residual would move too. A learned model whose score rises while physics sees nothing is most likely seeing a change in its inputs: a recalibration, a new sensor, a different operating practice.",
    },
    architect: {
      question: "Where would you refuse to let a learned model have the final word?",
      choices: [{ text: "Ranking candidate causes for an engineer" }, { text: "Screening thousands of channels for anything unusual" }, { text: "Redline and shutdown logic", correct: true }, { text: "Approximating a CFD result inside its training range" }],
      reasoning: "Protection logic has to be deterministic, analysable and correct in conditions nobody has data for. Those are the conditions in which learned models are weakest. AI supports decisions; it does not certify safety.",
    },
  },
  {
    module: "fdir",
    explain: { prompt: "Why does requiring two independent detectors reduce false alarms without much loss of sensitivity?", answer: "Detectors built on different principles fail in different conditions: a residual detector false-alarms where the model is weak, a learned detector where data is unfamiliar. A real fault trips both; a weakness of one usually trips only that one." },
    identify: {
      question: "Which detection method finds a slow drift that never crosses a threshold on any one sample?",
      choices: [{ text: "Redline" }, { text: "Rate-of-change" }, { text: "Statistical process monitoring", correct: true }, { text: "None can" }],
      reasoning: "A cumulative-sum or similar chart accumulates small persistent deviations until they are significant. A redline waits for the limit, and a rate check sees nothing because the rate is tiny.",
    },
    diagnose: {
      question: "Chamber pressure is falling while pump discharge pressure and commanded valve position remain normal. Which additional signals would you inspect before declaring an engine fault?",
      choices: [{ text: "None; declare the fault" }, { text: "The second chamber sensor, the thrust proxy, measured valve position and propellant flow", correct: true }, { text: "Only tank temperature" }, { text: "Only the vibration spectrum" }],
      reasoning: "First ask whether chamber pressure has really fallen: sensor B and the thrust proxy answer that. Then ask what changed: commanded position is not measured position, and flow shows whether propellant is arriving. If sensor B and thrust are steady, it is the sensor.",
    },
    architect: {
      question: "The isolation logic names a cause at 55 % confidence. What should the interface do?",
      choices: [{ text: "Show the cause alone" }, { text: "Show the ranked candidates, the evidence for and against, and what to verify", correct: true }, { text: "Suppress it until confidence is 100 %" }, { text: "Trigger a shutdown" }],
      reasoning: "A diagnosis is advice with uncertainty. The engineer needs the alternatives and the evidence to judge it, and the recommended verification is how the confidence gets raised. Hiding it or acting on it automatically are both wrong.",
    },
  },
  {
    module: "health",
    explain: { prompt: "Why must a prediction be shown as a band and not a line?", answer: "The future state depends on a trend that is itself estimated from noisy data, and the error of that estimate grows the further it is extended. A single line claims knowledge nobody has; the band shows how much is actually known." },
    identify: {
      question: "Which quantity warns of cavitation before pump performance drops?",
      choices: [{ text: "Chamber pressure" }, { text: "Suction margin at the pump inlet", correct: true }, { text: "Pump discharge pressure" }, { text: "Thrust" }],
      reasoning: "Cavitation has an onset: nothing happens to pump head until the margin is used up. Projecting the margin itself gives warning; projecting chamber pressure does not, because it has not moved yet.",
    },
    diagnose: {
      question: "A health index has been steady at 85 for ten runs, then reads 70. What is the right first question?",
      choices: [{ text: "How long until zero?" }, { text: "Did the hardware, the sensors or the model change between runs?", correct: true }, { text: "Can the limit be relaxed?" }, { text: "Is the index wrong by design?" }],
      reasoning: "A step is not a trend. A sensor replaced, a recalibration or a new model version changes the indicator without changing the engine. Configuration history is checked before a degradation rate is fitted to one point.",
    },
    architect: {
      question: "What may an educational prognostic model be used for?",
      choices: [{ text: "Certifying an engine for flight" }, { text: "Setting inspection intervals for flight hardware" }, { text: "Teaching the method and exploring its behaviour", correct: true }, { text: "Replacing inspection" }],
      reasoning: "Its limits are illustrative and it has never been compared with hardware. It demonstrates how prognostics works. It certifies nothing, and saying so plainly is part of doing it properly.",
    },
  },
  {
    module: "lab",
    explain: { prompt: "A packet delay is injected and the residuals stay flat. Why, and what reveals it?", answer: "In steady operation a late sample has the same value as a timely one, so nothing disagrees with the model. Step the throttle and the data lags the model, producing residuals on every channel at once. The data-quality layer sees the latency directly from the timestamps without waiting for a transient." },
    identify: {
      question: "Which evidence separates oxidiser pump degradation from loss of oxidiser feed pressure, when both lower pump head?",
      choices: [{ text: "Chamber pressure" }, { text: "Tank and inlet pressure, and vibration", correct: true }, { text: "Fuel flow" }, { text: "Valve position" }],
      reasoning: "Both reduce head and chamber pressure. Only the feed fault lowers tank and inlet pressure and, once cavitating, raises vibration. The same symptom, isolated by what accompanies it.",
    },
    diagnose: {
      question: "Chamber sensor A is drifting and the twin has voted it out. What has happened to the estimated chamber pressure?",
      choices: [{ text: "It follows sensor A down" }, { text: "It stays with sensor B and the model", correct: true }, { text: "It becomes undefined" }, { text: "It is frozen at its last value" }],
      reasoning: "Once a sensor is voted out, the estimate is built from the remaining sensor and the model. The reading falls; the estimate does not. That separation is the point of estimating instead of reading.",
    },
    architect: {
      question: "Which of these should a fault-injection capability be used for in a real programme?",
      choices: [{ text: "Demonstrations only" }, { text: "Measuring detection and isolation performance before operational use", correct: true }, { text: "Training operators to ignore alarms" }, { text: "Nothing; real faults are sufficient" }],
      reasoning: "Real faults are rare and cannot be scheduled. Seeded faults, in simulation and where safe on hardware, are how missed-detection and false-alarm rates are measured before anyone relies on the twin.",
    },
  },
  {
    module: "architecture",
    explain: { prompt: "Why is the Digital Twin state store a separate thing from the telemetry database?", answer: "Telemetry is what was measured. The state store holds what the twin concluded: estimated states, inferred parameters, health and their uncertainties, with the model and data versions that produced them. It is the twin itself, as data, and it must be reproducible from the telemetry." },
    identify: {
      question: "Recorded healthy telemetry is being repeated to the twin. Which control detects it directly?",
      choices: [{ text: "Encryption at rest" }, { text: "Authenticated sequence counters and timestamps", correct: true }, { text: "Least privilege" }, { text: "A firewall rule" }],
      reasoning: "A replay is authentic data at the wrong time. Only freshness checks, counters and timestamps protected by message authentication, expose it. Physics helps too: replayed data does not respond to commands.",
    },
    diagnose: {
      question: "After a model update, every asset shows a small residual offset on the same channel. Engine fault or not?",
      choices: [{ text: "A fleet-wide engine fault" }, { text: "A model or configuration change: stale parameters or a version mismatch", correct: true }, { text: "Sensor drift on every asset at once" }, { text: "A cyber attack" }],
      reasoning: "The same change on every asset at the moment of a software update has one common cause, and it is the update. This is why model version travels with every result.",
    },
    architect: {
      question: "How do you scale a twin from one test engine to a fleet?",
      choices: [{ text: "Copy the code per engine" }, { text: "One versioned model definition, with parameters and state per serial number", correct: true }, { text: "One set of parameters for all engines" }, { text: "Retrain every model for every engine from scratch" }],
      reasoning: "The physics is common; the hardware is not. A shared, versioned model with per-asset calibrated parameters keeps the fleet comparable while letting each twin be a twin of its own asset.",
    },
  },
];

export const CHECKPOINT_BY_MODULE = Object.fromEntries(CHECKPOINTS.map((c) => [c.module, c])) as Partial<Record<ModuleId, Checkpoint>>;
