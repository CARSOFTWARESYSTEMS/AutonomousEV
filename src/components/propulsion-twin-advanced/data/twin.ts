// The Digital Twin itself: what separates it from a model, the states it keeps
// side by side, how it estimates them, how much it trusts them, and what
// evidence stands behind each model.
import type { Concept, ModelStatus } from "../types";

export const TWIN_DEFINITION =
  "A propulsion Digital Twin is a dynamically updated digital representation of a specific propulsion asset that combines physical models, sensor observations, estimated states, historical evidence and predictive models to understand current condition and forecast future behaviour within a defined operating envelope.";

// ── Maturity ladder ─────────────────────────────────────────────────────────

export const MATURITY_HEADLINE = "A 3D model is not automatically a Digital Twin.";

export interface MaturityLevel {
  level: number;
  name: string;
  what: string;
  /** What is still missing at this level. */
  missing: string;
  isTwin: boolean;
  example: string;
}

export const MATURITY_LEVELS: readonly MaturityLevel[] = [
  { level: 0, name: "Geometry", what: "A CAD or 3D representation of the hardware.", missing: "Behaviour. It shows what the engine looks like, not what it does.", isTwin: false, example: "A 3D engine you can rotate and take apart." },
  { level: 1, name: "Simulation", what: "A virtual model run with predefined inputs.", missing: "Any connection to a real asset. It answers what would happen, for inputs someone chose.", isTwin: false, example: "A start transient computed from a scripted valve sequence." },
  { level: 2, name: "Instrumented Simulation", what: "A simulation with synthetic sensor channels, so its output looks like telemetry.", missing: "Real measurements. The data comes from the model itself.", isTwin: false, example: "This page: a simulated engine producing simulated telemetry." },
  { level: 3, name: "Digital Shadow", what: "Measurements from a physical asset update the digital representation.", missing: "The model's states are not corrected by the data; data and model sit side by side.", isTwin: false, example: "A dashboard replaying test data over a schematic." },
  { level: 4, name: "Digital Twin", what: "Telemetry from the physical asset dynamically updates the model's states and parameters.", missing: "A view of the future.", isTwin: true, example: "A model whose pump head coefficient is re-estimated from each second of telemetry." },
  { level: 5, name: "Predictive Digital Twin", what: "The twin estimates future states and probable degradation, with uncertainty.", missing: "A link from the prediction to a decision.", isTwin: true, example: "A projection of chamber pressure against its limit, with a band." },
  { level: 6, name: "Decision-Support Twin", what: "The twin recommends inspection, control or operational actions for engineers to consider.", missing: "Nothing at the level of capability. Evidence and authority remain the engineer's.", isTwin: true, example: "A recommended inspection, with the evidence and the confidence behind it." },
];

export const MATURITY_HERE = "The twin on this page implements the methods of levels 4 to 6 against a simulated asset. Because its telemetry is simulated, as a whole it is a level 2 system: an instrumented simulation that demonstrates how a level 6 twin works.";

// ── Core states ─────────────────────────────────────────────────────────────

export interface TwinStateDef {
  id: "observed" | "estimated" | "expected" | "predicted" | "residual" | "health";
  label: string;
  definition: string;
  source: string;
  /** How the state is drawn on every chart, so it never depends on colour alone. */
  line: string;
}

export const TWIN_STATES: readonly TwinStateDef[] = [
  { id: "observed", label: "OBSERVED", definition: "What instrumentation reports.", source: "Sensors, after acquisition and validation. Carries noise, bias and whatever happened to the data on the way.", line: "Thin solid line" },
  { id: "estimated", label: "ESTIMATED", definition: "Best estimate of the physical state after sensor and model fusion.", source: "A state estimator: the model predicts, the measurement corrects. Includes states that no sensor measures.", line: "Heavy solid line" },
  { id: "expected", label: "EXPECTED", definition: "What physics predicts for the current command and operating environment.", source: "The physics model, driven by the same commands as the hardware, with calibrated nominal parameters.", line: "Dashed line" },
  { id: "predicted", label: "PREDICTED", definition: "Probable future state plus uncertainty.", source: "The estimated state and its trend, projected through the model. Always drawn with a band.", line: "Dotted line with a shaded band" },
  { id: "residual", label: "RESIDUAL", definition: "Difference between observed or estimated behaviour and expected behaviour.", source: "Estimated minus expected, expressed in standard deviations of its healthy scatter.", line: "Shown as a number beside each chart" },
  { id: "health", label: "HEALTH", definition: "Probabilistic health interpretation.", source: "Evidence fusion: residuals, inferred parameters, detectors and classifiers, reduced to a state and a confidence.", line: "A labelled state, never a colour alone" },
];

// ── State estimation ────────────────────────────────────────────────────────

export const ESTIMATION_DEFINITION = "State estimation is the calculation of the most probable state of a system from noisy measurements and an imperfect model, together with how uncertain that estimate is. It is what turns separate sensor readings and a simulation into one synchronised picture.";

export const ESTIMATORS: readonly (Concept & { demo: "kalman" | "ekf" | "ukf" | "particle" | null })[] = [
  {
    id: "moving",
    demo: null,
    title: "Moving Filters",
    definition: "A moving filter replaces each sample by an average of recent samples. It reduces noise using the signal alone, with no model of the system.",
    simple: "Average the last few readings and the jitter cancels. The cost is that the average always runs behind when the real value changes.",
    engineering: "A moving average or first-order low-pass trades noise reduction for lag: a window of N samples cuts white noise by √N and delays the signal by about N/2 samples.",
    math: { equation: "ȳ_k = (1/N) · Σ y_(k−i),  i = 0 … N−1        or        ȳ_k = ȳ_(k−1) + α · (y_k − ȳ_(k−1))", where: "y raw sample · N window length · α smoothing factor" },
    twin: "Used for display and for slowly varying quantities. Not used alone where a transient matters, because the lag looks like a residual.",
    failure: "A filtered chamber pressure lags a throttle step by a quarter of a second, and a limit check on the filtered value trips late.",
  },
  {
    id: "kalman",
    demo: "kalman",
    title: "Kalman Filter",
    definition: "A Kalman filter estimates the state of a linear system by alternating two steps: predict the state with a model, then correct the prediction with a measurement, weighting each by its uncertainty.",
    simple: "Make a prediction from what you know about the system. Take a measurement. Believe each in proportion to how reliable it is. Repeat.",
    engineering: "It carries a state and its covariance. The gain is computed, not tuned by hand, from process noise Q and measurement noise R. It is optimal for linear systems with Gaussian noise.",
    math: { equation: "predict:  x⁻ = A·x + B·u,  P⁻ = A·P·Aᵀ + Q        update:  K = P⁻·Hᵀ·(H·P⁻·Hᵀ + R)⁻¹,  x = x⁻ + K·(z − H·x⁻),  P = (I − K·H)·P⁻", where: "x state · P its covariance · u input · z measurement · K gain · Q, R process and measurement noise" },
    twin: "One per measured channel here: the model's own step is the prediction, the sensor is the correction. The estimate is smoother than the sensor without lagging the transient.",
    failure: "If R is set too small the filter trusts a drifting sensor and follows it. Estimation does not remove the need to validate sensors.",
  },
  {
    id: "ekf",
    demo: "ekf",
    title: "Extended Kalman Filter",
    definition: "An extended Kalman filter applies the Kalman filter to a nonlinear system by linearising the model about the current estimate at every step.",
    simple: "Real engines are not straight lines. The extended filter treats the curve as a straight line just around where it thinks the engine is now, and redraws that line every step.",
    engineering: "The nonlinear model propagates the state; its Jacobian propagates the covariance. It is the usual choice for propulsion models, whose flow and pump relations are quadratic. It can diverge if the linearisation is poor.",
    math: { equation: "x⁻ = f(x, u)        P⁻ = F·P·Fᵀ + Q,   F = ∂f/∂x evaluated at x", where: "f the nonlinear model · F its Jacobian" },
    twin: "Appropriate for estimating states and parameters together, for instance chamber pressure with pump head coefficient, through the nonlinear pressure network.",
    failure: "Linearised about a wrong estimate after a large transient, the filter becomes overconfident and stops correcting: model divergence.",
  },
  {
    id: "ukf",
    demo: "ukf",
    title: "Unscented Kalman Filter",
    definition: "An unscented Kalman filter handles nonlinearity without derivatives: it passes a small, deliberately chosen set of points through the nonlinear model and rebuilds the mean and covariance from where they land.",
    simple: "Instead of approximating the curve, push a handful of sample states through the real model and see where they end up.",
    engineering: "2n+1 sigma points capture mean and covariance to second order. No Jacobian is needed, which helps when the model is a black box or has switches such as cavitation onset.",
    math: { equation: "χ_i = x ± √((n+κ)·P)_i        x⁻ = Σ w_i · f(χ_i)        P⁻ = Σ w_i · (f(χ_i) − x⁻)(f(χ_i) − x⁻)ᵀ + Q", where: "χ_i sigma points · w_i their weights · n number of states · κ a spread parameter" },
    twin: "Preferred over the extended filter where the model is strongly nonlinear across the uncertainty, such as near cavitation or choking boundaries.",
    failure: "With a covariance that has collapsed, the sigma points sit on top of each other and the filter is blind to anything the model does not expect.",
  },
  {
    id: "particle",
    demo: "particle",
    title: "Particle Filter",
    definition: "A particle filter represents the probability of the state with many random samples, each propagated through the model and weighted by how well it explains the measurement. It makes no assumption that the distribution is Gaussian.",
    simple: "Run hundreds of slightly different copies of the engine. After each measurement, keep more of the copies that agree with it and fewer of those that do not.",
    engineering: "It handles multi-modal and non-Gaussian distributions, such as noise with outliers, or two hypotheses that explain the data equally. Cost grows with the number of particles and of states.",
    math: { equation: "x_i ~ f(x_i, u) + w        w_i ∝ w_i · p(z | x_i)        resample when the effective sample size falls", where: "x_i particle i · w_i its weight · p(z | x) likelihood of the measurement" },
    twin: "Used where the question is which of several regimes the system is in, or where sensor noise has spikes that a Gaussian model handles badly.",
    failure: "Too few particles near the true state and the filter degenerates: every particle but one carries negligible weight.",
  },
];

// ── Sensor fusion ───────────────────────────────────────────────────────────

export const FUSION_DEFINITION = "Sensor fusion combines several different measurements into one judgement about the system. One measurement should not determine system health: the same reading can come from different causes, and only the other measurements tell them apart.";
export const FUSION_SOURCES = ["Pressure", "Temperature", "Flow", "Shaft speed", "Valve position", "Vibration", "Acoustic information, where available"] as const;
export const FUSION_EXAMPLE = "Low chamber pressure alone does not identify the fault. Combine it with normal pump discharge pressure, an abnormal valve position and reduced flow, and the diagnosis changes.";

export const REDUNDANCY_KINDS: readonly { id: string; name: string; text: string }[] = [
  { id: "analytical", name: "Analytical redundancy", text: "Use physics and model estimates as a virtual sensor. Chamber pressure can be computed from injector manifold pressure and flow, or from thrust, without a chamber pressure sensor." },
  { id: "hardware", name: "Hardware redundancy", text: "Use multiple independent sensors where the measurement justifies it. Two sensors can show that one is wrong; a third opinion is needed to say which." },
  { id: "consistency", name: "Cross-sensor consistency", text: "Check whether supporting measurements agree. A real fall in chamber pressure moves thrust, flow and pump discharge with it; a sensor fault moves nothing else." },
];

// ── Uncertainty ─────────────────────────────────────────────────────────────

export const UNCERTAINTY_DEFINITION = "Digital Twin uncertainty is the stated range within which the twin's estimates and predictions are expected to lie. A serious Digital Twin shows it on every prediction, because a prediction presented without uncertainty is a claim of perfect knowledge.";

export const UNCERTAINTY_SOURCES: readonly { id: string; name: string; text: string; here: string }[] = [
  { id: "sensor", name: "Sensor uncertainty", text: "Noise and resolution of the transducer and its acquisition chain.", here: "A noise model per channel, estimated again on line so that a noisy channel is trusted less." },
  { id: "calibration", name: "Calibration uncertainty", text: "The residual error of the calibration, and its age.", here: "Represented as the offset of each sensor from the virtual sensor on a healthy run." },
  { id: "model_form", name: "Model-form uncertainty", text: "What the model's structure leaves out, however well its parameters are set.", here: "The simulated system has unmodelled scatter and different time constants; the model's residual baseline and scatter are learned from a healthy run." },
  { id: "parameter", name: "Parameter uncertainty", text: "Uncertainty of identified parameters, from finite and noisy test data.", here: "Identified parameters differ from the system's by a fraction of a percent; the difference is measured and reported." },
  { id: "environment", name: "Environmental uncertainty", text: "Inlet conditions, ambient pressure and temperature that are not exactly known.", here: "Tank pressures are measured boundary conditions; propellant temperature is not modelled, which is a stated limitation." },
  { id: "ai", name: "AI prediction uncertainty", text: "A learned model's own error, which grows sharply outside its training conditions.", here: "The classifier reports a probability; the anomaly detector declares itself outside its training conditions in a transient." },
];

export const UNCERTAINTY_RULE = "Every predicted pressure on this page is drawn with an uncertainty band, and the band widens with the prediction horizon. Model predictions are never presented as truth.";

// ── Model credibility ───────────────────────────────────────────────────────

export const MODEL_STATUSES: readonly { status: ModelStatus; meaning: string }[] = [
  { status: "CONCEPTUAL", meaning: "Described, not implemented." },
  { status: "REFERENCE MODEL", meaning: "Implemented for a generic reference system; its values are illustrative." },
  { status: "SIMULATED", meaning: "Exercised only against simulated data." },
  { status: "CALIBRATED", meaning: "Parameters adjusted using evidence from the asset it represents." },
  { status: "TEST-CORRELATED", meaning: "Compared with test data of the asset, with the agreement quantified." },
  { status: "VALIDATED WITHIN DEFINED ENVELOPE", meaning: "Shown, against independent data, to be accurate enough for a stated use inside a stated envelope." },
];

export const CREDIBILITY_INTRO = "Model credibility is the justified confidence that a model is adequate for a specific use. It belongs to each model separately and is established by evidence: what the model was calibrated on, what it was validated against, and where it stops being trustworthy. No model on this page is described as validated, because none has been compared with a physical engine.";

export interface ModelCard {
  id: string;
  name: string;
  purpose: string;
  fidelity: string;
  inputs: string;
  outputs: string;
  assumptions: string;
  calibrationData: string;
  validationData: string;
  envelope: string;
  uncertainty: string;
  version: string;
  owner: string;
  lastValidation: string;
  limitations: string;
  status: ModelStatus;
}

const OWNER = "EV.ENGINEER tutorial";
const NONE = "None. Not compared with any physical engine.";

export const MODEL_CARDS: readonly ModelCard[] = [
  {
    id: "physics",
    name: "Reduced-order pressure network",
    purpose: "Expected state of every channel for a throttle command, in real time.",
    fidelity: "Lumped parameter: three dynamic states, algebraic flows and pressures",
    inputs: "Throttle command, ignition state, tank pressures",
    outputs: "22 channels: 15 pressures, two flows, speed, valve position, coolant temperature rise, vibration, thrust proxy",
    assumptions: "Incompressible quadratic losses, lumped shaft, first-order chamber, choked nozzle, open-loop controller schedule",
    calibrationData: "400 simulated steady points at five throttle settings",
    validationData: "A separate simulated healthy run with throttle steps. SIMULATED only.",
    envelope: "Mainstage, 58–102 % throttle. Start and shutdown are followed but not used for health assessment.",
    uncertainty: "Residual baseline and scatter learned per channel; widened in transients",
    version: "1.0.0",
    owner: OWNER,
    lastValidation: NONE,
    limitations: "No line inertance, two-phase flow, combustion dynamics or propellant temperature. Time constants are not identified.",
    status: "REFERENCE MODEL",
  },
  {
    id: "estimator",
    name: "State estimator and virtual sensors",
    purpose: "Estimated value of each channel, a fused chamber pressure, and eight inferred health parameters.",
    fidelity: "Scalar Kalman filter per channel; algebraic inversion of the physics model",
    inputs: "Telemetry, expected state, per-channel noise estimate",
    outputs: "Estimated channels with variance, chamber pressure with a sensor vote, inferred parameters",
    assumptions: "Gaussian sensor noise, independent channels, flow meters trusted",
    calibrationData: "Sensor noise levels as specified; healthy baselines from a simulated run",
    validationData: "Compared with the simulated truth, which only a simulation has. SIMULATED only.",
    envelope: "Mainstage with flow above 35 % of reference",
    uncertainty: "Filter variance per channel; parameter scatter from the healthy run",
    version: "1.0.0",
    owner: OWNER,
    lastValidation: NONE,
    limitations: "A flow-meter fault would corrupt every inferred parameter. Channels are not estimated jointly.",
    status: "SIMULATED",
  },
  {
    id: "anomaly",
    name: "Learned anomaly detector",
    purpose: "Flag telemetry that does not look like healthy telemetry, with no physics supplied.",
    fidelity: "Principal component analysis, six components",
    inputs: "22 observed channels",
    outputs: "Reconstruction error over its threshold",
    assumptions: "Healthy steady operation spans a low-dimensional linear subspace",
    calibrationData: "280 simulated healthy steady points, 58–102 % throttle",
    validationData: "Threshold set on a separate simulated healthy run it was not trained on. SIMULATED only.",
    envelope: "Steady mainstage inside its training throttle range. It reports itself out of distribution otherwise.",
    uncertainty: "None reported by the method itself; its false-alarm behaviour is set by the threshold",
    version: "1.0.0",
    owner: OWNER,
    lastValidation: NONE,
    limitations: "Sees only steady conditions it was trained on. Cannot say what is wrong, only that something is unfamiliar.",
    status: "SIMULATED",
  },
  {
    id: "classifier",
    name: "Fault classifier",
    purpose: "Probability of each known fault class from graded symptoms.",
    fidelity: "Multinomial logistic regression on physics-derived features",
    inputs: "18 graded symptoms: residuals and inferred parameters",
    outputs: "Probability over eight classes: nominal, six physical faults, one sensor fault",
    assumptions: "One fault at a time; faults resemble those it was trained on",
    calibrationData: "560 simulated labelled conditions, 70 per class",
    validationData: "320 separate simulated conditions from a different generator and a wider severity range. SIMULATED only.",
    envelope: "The eight trained classes, in steady mainstage",
    uncertainty: "Class probabilities; a held-out confusion matrix shown on the page",
    version: "1.0.0",
    owner: OWNER,
    lastValidation: NONE,
    limitations: "Will assign an unknown fault to the nearest known class. Trained on the same simulator it is tested on.",
    status: "SIMULATED",
  },
  {
    id: "prognostic",
    name: "Prognostic projection",
    purpose: "Where the driving health parameter is heading, and when a limit may be reached.",
    fidelity: "Linear trend on an inferred parameter, propagated through model sensitivities",
    inputs: "20 seconds of the driving parameter's estimate; model sensitivities",
    outputs: "Projected quantity with a band, probability of crossing a limit, time to the limit with a range",
    assumptions: "The present rate of change continues; Gaussian errors",
    calibrationData: "None beyond the physics model",
    validationData: "None. Illustrative only.",
    envelope: "Sixty seconds ahead, in steady mainstage",
    uncertainty: "Band from trend scatter and slope error, growing with the horizon",
    version: "1.0.0",
    owner: OWNER,
    lastValidation: NONE,
    limitations: "A linear projection cannot foresee an onset such as cavitation. Limits are illustrative. Not a remaining-useful-life estimate.",
    status: "CONCEPTUAL",
  },
];

// ── Verification and validation ─────────────────────────────────────────────

export const VV_TERMS: readonly { id: string; term: string; question: string; text: string; here: string }[] = [
  { id: "verification", term: "Verification", question: "Did we build the model correctly?", text: "Checks that the implementation does what its specification says: equations coded correctly, numerics converged, units consistent.", here: "Automated tests check that the model conserves pressure around each branch, reaches its reference point and repeats exactly for a given seed." },
  { id: "validation", term: "Validation", question: "Does the model represent the physical system accurately enough for its intended use?", text: "Compares model output with measurements of the real system, for a stated use and inside a stated envelope.", here: "Not done. There is no physical system behind this page, so nothing here is validated." },
  { id: "calibration", term: "Calibration", question: "Have uncertain parameters been adjusted using evidence?", text: "Fits parameters to data. It improves agreement with the data used and proves nothing about data not used.", here: "Loss coefficients, pump head scale and combustion efficiency are identified from simulated test points." },
  { id: "independent", term: "Independent Validation", question: "Does it hold on data that was not used to fit it?", text: "Evaluates the model against data kept apart from fitting. Agreement with the fitting data is not evidence.", here: "The classifier and the anomaly threshold are scored on separately generated data. Independent of the fit, not of the simulator." },
];

export const VV_RULE = "Training Data ≠ Validation Data";
