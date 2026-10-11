// Where learned models belong in a propulsion Digital Twin, where they do not,
// how they are combined with physics, and how they are governed. AI is used
// here as an engineering term: every model named is said to do a specific job.
import type { Concept } from "../types";

export const AI_INTRO =
  "AI and machine learning in a Digital Twin are models whose behaviour is learned from data. They earn their place where a relationship is real but hard to write down, where an expensive calculation has to run fast, or where a pattern across many signals is too subtle to encode by hand. They do not replace the physics, and they are not evidence of anything until they are validated.";

export interface ModelFamily {
  id: "regression" | "classification" | "anomaly" | "time_series" | "rul";
  name: string;
  definition: string;
  useFor: readonly string[];
  algorithms: readonly string[];
  /** What must be true for the family to be trusted for this job. */
  needs: string;
  /** How this page uses it, or why it does not. */
  here: string;
}

export const MODEL_FAMILIES: readonly ModelFamily[] = [
  {
    id: "regression",
    name: "Regression",
    definition: "Regression learns a continuous quantity from inputs.",
    useFor: ["Expected pressure estimation", "Performance parameter estimation", "Sensor correction"],
    algorithms: ["Linear and polynomial regression", "Random forest regression", "Gradient-boosted trees", "Neural-network regressors"],
    needs: "Training data that covers the operating envelope. A regressor interpolates; it does not extrapolate.",
    here: "Parameter identification is least-squares regression: each loss coefficient is the fitted slope of a pressure drop against flow squared.",
  },
  {
    id: "classification",
    name: "Classification",
    definition: "Classification assigns an observation to one of a set of known classes, with a probability.",
    useFor: ["Failure classification", "Operating-state classification", "Sensor-fault identification"],
    algorithms: ["Logistic regression", "Random forest", "Gradient boosting", "Support vector machines", "Neural networks"],
    needs: "Labelled examples of every class. Real failures are rare, so labels usually come from simulation, which then has to be credible.",
    here: "A multinomial logistic regression classifies eight conditions from 18 physics-derived symptoms. It is trained in your browser on simulated faults and scored on a separate simulated set.",
  },
  {
    id: "anomaly",
    name: "Unsupervised Anomaly Detection",
    definition: "Unsupervised anomaly detection learns what normal data looks like and flags what departs from it, without being shown any failure.",
    useFor: ["Detecting unfamiliar behaviour when labelled failures are scarce", "A second opinion that shares no assumptions with the physics model"],
    algorithms: ["Principal component analysis (PCA)", "Isolation Forest", "One-Class SVM", "Autoencoder", "Clustering"],
    needs: "Healthy data from every operating condition it will meet. Anything it has not seen, including a healthy transient, looks anomalous.",
    here: "Principal component analysis on healthy telemetry across the throttle range. It is deliberately given no physics, so that it can be compared with the physics-based residual.",
  },
  {
    id: "time_series",
    name: "Time-Series Models",
    definition: "Time-series models learn how a signal evolves in time, so that they can forecast it or recognise a temporal pattern.",
    useFor: ["Forecasting a channel", "Recognising a transient signature", "Detecting a change in dynamics"],
    algorithms: ["Autoregressive models", "Temporal convolution", "LSTM and GRU networks", "Transformer-based time-series models, where the data justifies them"],
    needs: "Many examples of the transient being learned. Sequence models are data-hungry and are hard to validate for rare events.",
    here: "Not trained here. The page's dynamics come from the physics model; a linear trend is the only temporal model fitted to data.",
  },
  {
    id: "rul",
    name: "Remaining Useful Life and Degradation",
    definition: "Degradation models describe how a health indicator worsens with use, and remaining-useful-life models estimate how long until it reaches a limit, as a distribution and not a single number.",
    useFor: ["Trending a health indicator across runs", "Estimating the probability of reaching a limit", "Planning inspection"],
    algorithms: ["Parametric degradation models", "Survival analysis", "Probabilistic prognostics (particle-filter based)", "Sequence-based prediction"],
    needs: "Run-to-failure or run-to-limit histories, which for rocket engines are few. Physics-based degradation models carry most of the weight.",
    here: "A linear trend on the driving inferred parameter, with its uncertainty, propagated through the physics model. It is a concept demonstration, not a life estimate.",
  },
];

// ── Physics-informed AI ─────────────────────────────────────────────────────

export const HYBRID_HEADING = "When Physics Meets AI";
export const HYBRID_INTRO =
  "A physics-informed Digital Twin combines physical models with learned ones so that each covers the other's weakness. Pure machine learning can learn correlations that violate physical constraints: it may predict a pressure rise without the flow to cause it, because nothing told it that mass is conserved. Physics alone leaves out whatever the model's authors did not write down. The hybrid approaches below are the ways the two are joined.";

export const HYBRID_APPROACHES: readonly Concept[] = [
  {
    id: "features",
    title: "Physics Features + ML",
    definition: "Physics-derived features are quantities a physics model computes, such as residuals and inferred parameters, that are then used as the inputs to a learned model.",
    simple: "Let physics do the part it is good at, then hand the result to the learner. The learner sees \"pump head is 8 % low\" instead of twenty raw pressures.",
    engineering: "Residuals remove the operating point; inferred parameters localise change to a component. A classifier on these features needs far less data and generalises across throttle settings it never saw.",
    math: { equation: "features = [ (x̂ − x_expected) / σ ,  K̂ / K_cal − 1 , … ]        class = g(features)", where: "x̂ estimated measurement · σ healthy scatter · K̂ inferred parameter · g the learned classifier" },
    twin: "This page's fault classifier works this way: its 18 inputs are graded physics symptoms, not raw telemetry.",
    failure: "Trained on raw pressures at full thrust, a classifier calls a healthy engine at 70 % throttle faulty. Trained on residuals, it does not, because the physics already accounted for the throttle.",
  },
  {
    id: "residual_correction",
    title: "ML Residual Correction",
    definition: "ML residual correction keeps the physics model as the main predictor and trains a learned model only on the error the physics model leaves behind.",
    simple: "Final prediction = Physics prediction + learned correction. The physics does most of the work; the learner mops up what it missed.",
    engineering: "The learned term is small and bounded, so when it is wrong it is wrong by little. Outside its training range it should fade to zero, leaving the physics prediction.",
    math: { equation: "ŷ = f_physics(u, θ) + g_ML(u, x)        g trained on  y_measured − f_physics", where: "f_physics the physics model · θ its parameters · g_ML the learned correction" },
    twin: "The healthy baseline subtracted from each residual here is the simplest correction of this kind: a constant learned from a healthy run.",
    failure: "A correction trained on runs that included an undetected degraded pump learns to expect the degradation, and hides it from then on.",
  },
  {
    id: "constrained",
    title: "Physics-Constrained Learning",
    definition: "Physics-constrained learning adds physical consistency conditions to a learned model's training, so that it is penalised for predictions that break them.",
    simple: "Teach the model with data, and also mark it down whenever its answer breaks a rule it should have known: flow in must equal flow out.",
    engineering: "Constraints enter as penalty terms in the loss, as hard projections of the output, or through an architecture that cannot violate them, such as monotonic networks for a pressure drop that must rise with flow.",
    math: { equation: "Loss = Σ (ŷ − y)² + λ · Σ c(ŷ)²        e.g.  c = ṁ_in − ṁ_out", where: "c a constraint that should be zero · λ its weight" },
    twin: "Conceptual on this page. In a production twin it is how a learned surrogate is kept from predicting states that cannot occur.",
    failure: "An unconstrained model predicts chamber pressure higher than injector manifold pressure. The flow would have to run backwards.",
  },
  {
    id: "pinn",
    title: "Physics-Informed Neural Networks",
    definition: "A physics-informed neural network is trained to satisfy a governing differential equation as well as to fit data, by including the equation's residual in its loss function.",
    simple: "The network is graded twice: on matching the measurements, and on obeying the equation between the measurements, where there is no data at all.",
    engineering: "Automatic differentiation gives the network's derivatives, which are substituted into the governing equation at collocation points. Useful where data is sparse and the equation is known; training can be delicate.",
    math: { equation: "Loss = Loss_data + λ · Σ | ∂u/∂t + N[u] |²   at collocation points", where: "u the network's output · N[·] the differential operator of the governing equation" },
    twin: "Conceptual on this page. A candidate for reconstructing a wall-temperature field from a few thermocouples and the heat equation.",
    failure: "With the physics term weighted too lightly the network fits sensor noise; too heavily, it ignores a real departure from the assumed equation.",
  },
  {
    id: "surrogate",
    title: "Surrogate Models",
    definition: "A surrogate model is a fast learned approximation of an expensive high-fidelity simulation, trained on that simulation's results.",
    simple: "Run the slow, accurate model many times in advance, then teach a fast model to give the same answers.",
    engineering: "Gaussian processes, polynomial chaos or neural networks map inputs to the high-fidelity output. The training design must cover the envelope, and the surrogate's error is itself a model uncertainty to carry.",
    math: { equation: "ŷ = s(x) ≈ F_high-fidelity(x),   x inside the training envelope", where: "s the surrogate · F the expensive model" },
    twin: "Conceptual on this page. It is how a result that takes a CFD run, such as local wall heat flux, is made available to a real-time twin.",
    failure: "Queried at a mixture ratio outside its training range, a surrogate returns a confident number with nothing behind it.",
  },
  {
    id: "hybrid_estimation",
    title: "Hybrid State Estimation",
    definition: "Hybrid state estimation fuses telemetry, a physics model, a learned model and their uncertainties into one estimate, weighting each source by how far it can be trusted in the present conditions.",
    simple: "Telemetry + Physics + Learned Model + Uncertainty. No single source is believed outright; each is believed in proportion to how reliable it is right now.",
    engineering: "The estimator's process model is physics plus a learned correction; measurement noise is adapted from data quality; a learned classifier's output is one more piece of evidence with its own likelihood.",
    math: { equation: "P(cause | evidence) ∝ P_physics(cause | symptoms)^½ · P_ML(cause | symptoms)^½ · P(data checks)", where: "the fusion rule used on this page: a geometric mean, after direct data checks take their share" },
    twin: "This is the fusion the live twin on this page performs: physics-based pattern matching and a learned classifier reach a verdict independently, and are combined.",
    failure: "Physics says pump degradation, the classifier says nominal. The disagreement is itself the finding: the condition is one the classifier was not trained on.",
  },
];

// ── AI architecture ─────────────────────────────────────────────────────────

export const AI_ARCHITECTURE: readonly { id: string; label: string; text: string; parallel?: readonly { id: string; label: string; text: string }[] }[] = [
  { id: "physical", label: "Physical Propulsion System", text: "The asset: hardware, propellants, commands." },
  { id: "sensors", label: "Sensors", text: "Transducers at pressure-, temperature-, flow-, speed- and vibration-critical locations." },
  { id: "daq", label: "DAQ / Edge Acquisition", text: "Conditioning, sampling and conversion to engineering units, close to the hardware." },
  { id: "time", label: "Time Synchronisation", text: "One clock for every node, so that samples can be compared at the same instant." },
  { id: "quality", label: "Signal Quality Layer", text: "Range, rate, flat-line, noise, latency and sequence checks. Each value leaves with a quality flag." },
  { id: "stream", label: "Telemetry Stream", text: "Ordered, buffered transport of values, timestamps and flags." },
  { id: "features", label: "Feature Engineering", text: "Pressure differences, ratios, residuals and inferred parameters: the inputs every engine below shares." },
  {
    id: "engines",
    label: "Parallel engines",
    text: "Five engines read the same features and reach their conclusions independently.",
    parallel: [
      { id: "physics", label: "Physics Model", text: "Expected state for the current command." },
      { id: "estimator", label: "State Estimator", text: "Estimated state and inferred parameters." },
      { id: "anomaly", label: "ML Anomaly Model", text: "Is this telemetry unfamiliar?" },
      { id: "classifier", label: "Fault Classifier", text: "Which known fault does it resemble?" },
      { id: "prognostic", label: "Prognostic Model", text: "Where is it heading?" },
    ],
  },
  { id: "fusion", label: "Evidence Fusion", text: "The engines' outputs are combined, with data-quality checks taking precedence over inferences drawn from the data." },
  { id: "health", label: "Health State", text: "A state and a confidence for the system and for each component." },
  { id: "fdir", label: "FDIR / Decision Support", text: "Detection, isolation and recommended action, each with its evidence." },
  { id: "dashboard", label: "Digital Twin Dashboard", text: "The four twin states, residuals, health and reasoning, for an engineer to read." },
  { id: "review", label: "Engineering Review / Maintenance / Operations", text: "People decide. The twin's output is an input to their decision." },
];

// ── Explainable AI ──────────────────────────────────────────────────────────

export const XAI_INTRO = "Explainable AI means that a model's conclusion comes with the evidence that produced it, in terms an engineer can check. When the twin classifies a fault it shows which measurements support the diagnosis, which contradict it, and which it cannot account for.";

export const XAI_EXAMPLE = {
  verdict: "Probable Pump Degradation — 78%",
  evidence: ["Discharge pressure trending down", "Shaft speed unchanged", "Inlet pressure nominal", "Valve position nominal", "Physics residual increasing", "Similar feature pattern detected by anomaly model"],
  question: "Why this diagnosis?",
  note: "An illustrative verdict. The live twin produces one from its own evidence in the Lab.",
} as const;

// ── AI safety and MLOps ─────────────────────────────────────────────────────

export const MLOPS_INTRO = "MLOps is the discipline of building, versioning, validating, deploying and monitoring learned models so that their behaviour is reproducible and their limits are known. In a propulsion Digital Twin it is part of safety engineering, not an operations convenience.";

export const MLOPS_PRACTICES: readonly { id: string; name: string; text: string }[] = [
  { id: "dataset", name: "Dataset versioning", text: "Every model records exactly which data it was trained and validated on, down to the test, the channel list and the calibration in force." },
  { id: "feature", name: "Feature versioning", text: "A residual depends on the physics model that produced it. Change the model and every feature, and every learned model downstream, changes with it." },
  { id: "model", name: "Model versioning", text: "A deployed model is an identified, immutable artefact. A result can always be traced to the model version that produced it." },
  { id: "repro", name: "Reproducibility", text: "Fixed seeds, pinned code and recorded data let a model be rebuilt exactly. The models on this page train identically on every visit." },
  { id: "split", name: "Training–validation split", text: "Validation data is kept apart from training, split by test and not by sample, so that neighbouring samples of one run do not leak across." },
  { id: "bias", name: "Bias", text: "A dataset over-represents what was tested: nominal runs, one engine build, one propellant temperature. The model inherits that." },
  { id: "overfit", name: "Overfitting", text: "A model that matches its training data far better than its validation data has learned the data, not the behaviour." },
  { id: "drift", name: "Drift", text: "Hardware ages, sensors are replaced, operating practice changes. A model's inputs drift away from its training data, and its error grows unannounced unless it is monitored." },
  { id: "ood", name: "Out-of-distribution conditions", text: "A learned model asked about conditions it never saw still answers. The twin has to detect that it is outside the training envelope and say so." },
  { id: "confidence", name: "Confidence", text: "A probability from a classifier is not a calibrated probability until it has been checked against outcomes." },
  { id: "explain", name: "Explainability", text: "A diagnosis must come with evidence an engineer can check independently." },
  { id: "human", name: "Human review", text: "A model's output is advice. An engineer with authority reviews it before anything is done to the hardware." },
];

export const AI_BOUNDARY = "No AI model on this page, or in any design it describes, autonomously certifies propulsion safety. AI supports engineering decisions; engineers make them.";

/** Where a CTO should, and should not, rely on learned models. */
export const AI_TRUST: readonly { where: string; verdict: "Physics mandatory" | "AI can assist" | "AI is suited"; why: string }[] = [
  { where: "Redlines and shutdown logic", verdict: "Physics mandatory", why: "Deterministic, analysable and verifiable. A limit must be explainable from first principles and testable exhaustively." },
  { where: "Expected state for control and protection", verdict: "Physics mandatory", why: "It must be right outside the conditions anyone has data for, which is exactly where learned models are weakest." },
  { where: "Fault isolation", verdict: "AI can assist", why: "A classifier ranks candidates quickly; physics-based evidence has to agree before the ranking is believed." },
  { where: "Prognostics", verdict: "AI can assist", why: "Degradation data is scarce. Physics supplies the mechanism; learning refines the rate." },
  { where: "Anomaly screening across many channels", verdict: "AI is suited", why: "Finding the unfamiliar among thousands of signals is what unsupervised methods do well, as a prompt for investigation." },
  { where: "Surrogates of expensive simulations", verdict: "AI is suited", why: "The physics is still the source of truth; the learned model only makes it fast, inside a known envelope." },
];
