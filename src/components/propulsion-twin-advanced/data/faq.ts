// Questions the page answers directly, each with a definition that stands on
// its own, and the external sources its methods come from.
import { TWIN_DEFINITION } from "./twin";

export const FAQ: readonly { id: string; q: string; a: string }[] = [
  { id: "what", q: "What is a propulsion Digital Twin?", a: TWIN_DEFINITION },
  {
    id: "vs_simulation",
    q: "How is it different from simulation?",
    a: "A simulation runs a model under inputs someone chose, and answers what would happen. A Digital Twin is tied to one specific propulsion asset: that asset's telemetry continuously updates the model's states and parameters, so the twin answers what is happening to this asset and what is likely to happen next. A simulation is a component of a twin; it is not one by itself.",
  },
  {
    id: "why_pressure",
    q: "Why is pressure monitored in rocket propulsion?",
    a: "Pressure is monitored because every function of a rocket engine is a pressure difference. Propellant flows only from higher pressure to lower, thrust comes from chamber pressure acting through the nozzle, and the margins that protect the engine, against cavitation, combustion instability and structural limits, are stated as pressures. Pressure is also measured quickly and accurately, which makes it the best window into the engine's condition.",
  },
  {
    id: "chamber_pressure",
    q: "What is chamber pressure?",
    a: "Chamber pressure is the static pressure of the burning gas in the combustion chamber. With a choked nozzle it is proportional to the propellant mass flow and to how completely the propellants burn, which makes it the engine's primary indicator of thrust and performance and the reference that the other pressures in the engine are compared with.",
  },
  {
    id: "residual",
    q: "What is model residual?",
    a: "A model residual is the difference between what is observed and what a model expects for the same conditions: Residual = Observation − Model Expectation. A residual near zero means the system is behaving as the model says it should. A residual that grows, and stays outside its healthy scatter, is evidence that the system, a sensor or the model has changed.",
  },
  {
    id: "ai_models",
    q: "What AI models are used in Digital Twins?",
    a: "Digital Twins use regression to estimate expected values and correct sensors, classification to identify faults and operating states, unsupervised anomaly detection such as PCA, Isolation Forest and autoencoders where labelled failures are scarce, time-series models such as autoregressive, LSTM and Transformer models for temporal behaviour, and degradation or survival models for prognostics. Each is used for a specific job and validated for it.",
  },
  {
    id: "physics_informed",
    q: "What is a physics-informed Digital Twin?",
    a: "A physics-informed Digital Twin combines physical models with learned models so that each covers the other's weakness. Physics supplies the structure and stays valid outside tested conditions; learning captures what the physics model leaves out. Typical forms are physics-derived features fed to a classifier, a learned correction added to a physics prediction, and learned models trained under physical constraints.",
  },
  {
    id: "detection",
    q: "How are propulsion faults detected?",
    a: "Propulsion faults are detected by comparing measurements with limits, with their own rate of change, and above all with what a model expects. Threshold checks catch gross exceedances, rate checks catch abrupt changes, model residuals and statistical monitoring catch small and gradual ones, and learned anomaly detectors catch unfamiliar patterns across many channels. Robust schemes require independent methods to agree before declaring a fault.",
  },
  {
    id: "sensor_vs_engine",
    q: "How do we distinguish sensor drift from real engine degradation?",
    a: "Sensor drift and real engine degradation are distinguished by what else changes. A real change in the engine moves every measurement that physics ties to it: a second sensor, the thrust proxy, flow and pump pressure all shift together. A drifting sensor moves alone. Hardware redundancy, cross-sensor consistency and a model-based virtual sensor together decide which has happened.",
  },
  {
    id: "state_estimation",
    q: "What is state estimation?",
    a: "State estimation is the calculation of the most probable state of a system from noisy measurements and an imperfect model, together with the uncertainty of that estimate. Kalman filters and their nonlinear variants predict the state with the model and correct it with each measurement, and can reach states and parameters that no sensor measures directly.",
  },
  {
    id: "validation",
    q: "What is Digital Twin validation?",
    a: "Digital Twin validation is the demonstration, against independent measurements of the physical system, that the twin's models are accurate enough for a stated use within a stated operating envelope. It is distinct from verification, which checks that the model was built correctly, and from calibration, which fits parameters to data. Agreement with the data used for fitting is not validation.",
  },
  {
    id: "ai_replace",
    q: "Can AI replace propulsion physics?",
    a: "No. AI cannot replace propulsion physics. A learned model is reliable only inside the conditions it was trained on, and the conditions that matter most for safety are the ones for which little or no data exists. Physics remains mandatory for limits, protection and extrapolation. AI is valuable beside it: for screening, for ranking candidate causes and for making expensive physics fast.",
  },
  {
    id: "fdir",
    q: "What is FDIR?",
    a: "FDIR is fault detection, isolation and recovery: detecting that behaviour is no longer nominal, isolating the fault to a component and a mechanism, and recovering by reconfiguring, reducing power or shutting down safely. A Digital Twin contributes mainly to detection and isolation, and informs recovery decisions that control logic and engineers take.",
  },
  {
    id: "prognostics",
    q: "What is prognostics?",
    a: "Prognostics is the estimation of how a system's condition will evolve: the rate of degradation, the margin that remains and the probability that a limit will be reached within a given time. A prognostic result is a distribution with a confidence interval, not a single date, and it is only as good as the degradation model and data behind it.",
  },
  {
    id: "uncertainty",
    q: "What is Digital Twin uncertainty?",
    a: "Digital Twin uncertainty is the stated range within which the twin's estimates and predictions are expected to lie. It combines sensor and calibration uncertainty, model-form and parameter uncertainty, uncertainty in the environment and the error of any learned model. A twin that presents a prediction without it is claiming knowledge it does not have.",
  },
];

export const GLOSSARY: readonly { term: string; definition: string }[] = [
  { term: "Telemetry", definition: "Measurements sent from sensors and controllers for monitoring and recording, with their timestamps and quality flags." },
  { term: "Reduced-order model", definition: "A simplified model that keeps the dominant physics so that it runs fast enough to work beside live data." },
  { term: "Net positive suction head (NPSH)", definition: "The margin between the pressure at a pump's inlet and the liquid's vapour pressure, expressed as a head." },
  { term: "Cavitation", definition: "Local boiling of a liquid where its pressure falls to vapour pressure, typically at a pump inlet." },
  { term: "Characteristic velocity (c*)", definition: "Chamber pressure times throat area divided by mass flow: a measure of how well the chamber turns propellant into pressure." },
  { term: "Mixture ratio", definition: "Oxidiser mass flow divided by fuel mass flow." },
  { term: "Redline", definition: "A limit on a monitored quantity that, once exceeded and confirmed, triggers a protective action." },
  { term: "Virtual sensor", definition: "A value computed from other measurements through a model, standing in for a measurement that is missing or in doubt." },
  { term: "Analytical redundancy", definition: "Checking a measurement against a model-based estimate of the same quantity, instead of against a second sensor." },
  { term: "IVHM / PHM", definition: "Integrated vehicle health management, and prognostics and health management: the disciplines of monitoring condition and predicting its evolution." },
  { term: "Out of distribution", definition: "Conditions unlike those a learned model was trained on, where its output cannot be relied on." },
  { term: "Operating envelope", definition: "The range of conditions within which a model has been shown to be adequate for its use." },
];

// ── References ──────────────────────────────────────────────────────────────

/** What on this page is the page's own illustrative material. None of it is evidence about any engine. */
export const REFERENCE_ARCHITECTURE: readonly string[] = [
  "The propulsion system: a generic pump-fed, regeneratively cooled, closed-cycle reference architecture.",
  "Every pressure, flow, speed and temperature value: normalised, SIMULATED or REFERENCE VALUE.",
  "The reduced-order pressure network, its parameters, and the scatter added to the simulated system.",
  "The fault scenarios, their magnitudes and their rates.",
  "Limits, action thresholds and health indices: illustrative.",
  "The learned models and their validation figures, which describe performance on simulated data only.",
];

export interface Reference {
  id: string;
  group: "Systems engineering and model credibility" | "Digital Twin" | "Propulsion" | "State estimation and fault diagnosis" | "Prognostics and health management" | "Physics-informed machine learning" | "AI risk and governance";
  authors: string;
  title: string;
  source: string;
  year: number;
  href: string;
  /** What the tutorial takes from it. */
  supports: string;
}

/** Published sources for the methods taught here. They support the methods, not the page's numbers. */
export const REFERENCES: readonly Reference[] = [
  { id: "nasa_se", group: "Systems engineering and model credibility", authors: "NASA", title: "NASA Systems Engineering Handbook", source: "NASA/SP-2016-6105 Rev 2", year: 2016, href: "https://www.nasa.gov/reference/systems-engineering-handbook/", supports: "Life-cycle reviews, verification and validation as distinct activities." },
  { id: "nasa_7009", group: "Systems engineering and model credibility", authors: "NASA", title: "Standard for Models and Simulations", source: "NASA-STD-7009B", year: 2024, href: "https://standards.nasa.gov/standard/NASA/NASA-STD-7009", supports: "Model credibility assessed per model, on evidence, for an intended use." },
  { id: "nasem", group: "Digital Twin", authors: "National Academies of Sciences, Engineering, and Medicine", title: "Foundational Research Gaps and Future Directions for Digital Twins", source: "The National Academies Press", year: 2024, href: "https://doi.org/10.17226/26894", supports: "The bidirectional link between asset and model; verification, validation and uncertainty quantification as foundations." },
  { id: "glaessgen", group: "Digital Twin", authors: "E. Glaessgen, D. Stargel", title: "The Digital Twin Paradigm for Future NASA and U.S. Air Force Vehicles", source: "53rd AIAA/ASME/ASCE/AHS/ASC Structures, Structural Dynamics and Materials Conference, AIAA 2012-1818", year: 2012, href: "https://doi.org/10.2514/6.2012-1818", supports: "The definition of a Digital Twin as an integrated, as-built, continuously updated simulation of a specific vehicle." },
  { id: "grieves", group: "Digital Twin", authors: "M. Grieves, J. Vickers", title: "Digital Twin: Mitigating Unpredictable, Undesirable Emergent Behavior in Complex Systems", source: "Transdisciplinary Perspectives on Complex Systems, Springer", year: 2017, href: "https://doi.org/10.1007/978-3-319-38756-7_4", supports: "The physical asset, its virtual counterpart and the data connecting them." },
  { id: "kritzinger", group: "Digital Twin", authors: "W. Kritzinger, M. Karner, G. Traar, J. Henjes, W. Sihn", title: "Digital Twin in manufacturing: A categorical literature review and classification", source: "IFAC-PapersOnLine 51(11), 1016–1022", year: 2018, href: "https://doi.org/10.1016/j.ifacol.2018.08.474", supports: "The distinction between a digital model, a digital shadow and a digital twin by direction of data flow." },
  { id: "rasheed", group: "Digital Twin", authors: "A. Rasheed, O. San, T. Kvamsdal", title: "Digital Twin: Values, Challenges and Enablers From a Modeling Perspective", source: "IEEE Access 8, 21980–22012", year: 2020, href: "https://doi.org/10.1109/ACCESS.2020.2970143", supports: "Physics-based, data-driven and hybrid modelling as enablers of a twin." },
  { id: "nasa_ntrs", group: "Propulsion", authors: "NASA", title: "NASA Technical Reports Server", source: "Public repository of NASA technical literature, including liquid rocket engine design criteria and engine health-management reports", year: 2026, href: "https://ntrs.nasa.gov/", supports: "Primary public literature on liquid propulsion design and engine health monitoring." },
  { id: "lpsc", group: "Propulsion", authors: "Indian Space Research Organisation", title: "Liquid Propulsion Systems Centre", source: "Public information on liquid propulsion stages and engines", year: 2026, href: "https://www.lpsc.gov.in/", supports: "Public context on liquid propulsion systems. No data from it is used on this page." },
  { id: "huzel", group: "Propulsion", authors: "D. K. Huzel, D. H. Huang", title: "Modern Engineering for Design of Liquid-Propellant Rocket Engines", source: "Progress in Astronautics and Aeronautics, vol. 147, AIAA", year: 1992, href: "https://doi.org/10.2514/4.866197", supports: "Feed systems, turbopumps, injectors, chambers and cooling at the level the pressure network abstracts." },
  { id: "kalman", group: "State estimation and fault diagnosis", authors: "R. E. Kalman", title: "A New Approach to Linear Filtering and Prediction Problems", source: "Journal of Basic Engineering 82(1), 35–45", year: 1960, href: "https://doi.org/10.1115/1.3662552", supports: "The Kalman filter." },
  { id: "julier", group: "State estimation and fault diagnosis", authors: "S. J. Julier, J. K. Uhlmann", title: "Unscented Filtering and Nonlinear Estimation", source: "Proceedings of the IEEE 92(3), 401–422", year: 2004, href: "https://doi.org/10.1109/JPROC.2003.823141", supports: "The unscented Kalman filter." },
  { id: "arulampalam", group: "State estimation and fault diagnosis", authors: "M. S. Arulampalam, S. Maskell, N. Gordon, T. Clapp", title: "A Tutorial on Particle Filters for Online Nonlinear/Non-Gaussian Bayesian Tracking", source: "IEEE Transactions on Signal Processing 50(2), 174–188", year: 2002, href: "https://doi.org/10.1109/78.978374", supports: "Particle filters and resampling." },
  { id: "isermann", group: "State estimation and fault diagnosis", authors: "R. Isermann", title: "Model-based fault-detection and diagnosis – status and applications", source: "Annual Reviews in Control 29(1), 71–85", year: 2005, href: "https://doi.org/10.1016/j.arcontrol.2004.12.002", supports: "Residual generation, parameter estimation and symptom-based fault diagnosis." },
  { id: "chandola", group: "State estimation and fault diagnosis", authors: "V. Chandola, A. Banerjee, V. Kumar", title: "Anomaly Detection: A Survey", source: "ACM Computing Surveys 41(3), article 15", year: 2009, href: "https://doi.org/10.1145/1541880.1541882", supports: "Families of anomaly detection and their assumptions." },
  { id: "jardine", group: "Prognostics and health management", authors: "A. K. S. Jardine, D. Lin, D. Banjevic", title: "A review on machinery diagnostics and prognostics implementing condition-based maintenance", source: "Mechanical Systems and Signal Processing 20(7), 1483–1510", year: 2006, href: "https://doi.org/10.1016/j.ymssp.2005.09.012", supports: "Diagnostics and prognostics as distinct steps of condition-based maintenance." },
  { id: "raissi", group: "Physics-informed machine learning", authors: "M. Raissi, P. Perdikaris, G. E. Karniadakis", title: "Physics-informed neural networks: A deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations", source: "Journal of Computational Physics 378, 686–707", year: 2019, href: "https://doi.org/10.1016/j.jcp.2018.10.045", supports: "Physics-informed neural networks." },
  { id: "karniadakis", group: "Physics-informed machine learning", authors: "G. E. Karniadakis, I. G. Kevrekidis, L. Lu, P. Perdikaris, S. Wang, L. Yang", title: "Physics-informed machine learning", source: "Nature Reviews Physics 3, 422–440", year: 2021, href: "https://doi.org/10.1038/s42254-021-00314-5", supports: "The ways physical knowledge is embedded in learned models." },
  { id: "willard", group: "Physics-informed machine learning", authors: "J. Willard, X. Jia, S. Xu, M. Steinbach, V. Kumar", title: "Integrating Scientific Knowledge with Machine Learning for Engineering and Environmental Systems", source: "ACM Computing Surveys 55(4), article 66", year: 2022, href: "https://doi.org/10.1145/3514228", supports: "Residual modelling, physics-guided loss functions and hybrid architectures." },
  { id: "nist_ai", group: "AI risk and governance", authors: "National Institute of Standards and Technology", title: "Artificial Intelligence Risk Management Framework (AI RMF 1.0)", source: "NIST AI 100-1", year: 2023, href: "https://doi.org/10.6028/NIST.AI.100-1", supports: "Validity, reliability, explainability and human oversight as properties of trustworthy AI." },
];
