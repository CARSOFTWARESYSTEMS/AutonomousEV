// What this page's simulator actually runs, said beside each part of the
// tutorial that describes more than that. A reference architecture is worth
// teaching. It must not be mistaken for an implementation, and nothing here
// may make the simulator look more mature than it is.

/** The standard wording for something the tutorial explains and the simulator does not do. */
export const NOT_IMPLEMENTED = "Concept described — not implemented in this educational simulator.";

export const IMPLEMENTATION_STATUS = {
  recovery:
    "On this page: detection and isolation are implemented. Recovery is not. The simulator stops at a recommended engineering investigation; it commands nothing, and no automatic response to a fault exists here.",
  pipeline:
    "On this page: all twelve steps are carried out against a simulated asset, with two exceptions that matter. Step 3 has no acquisition hardware: the telemetry is generated, and the loop current and counts shown for a sensor are illustrative. Step 12 is not done: nothing here has been validated against a physical engine.",
  estimation:
    "On this page: the live twin runs one scalar Kalman filter per measured channel, and fuses chamber pressure from two sensors and a virtual one. The extended, unscented and particle filters are implemented in the demonstration below only, on a single state. No estimator here estimates states and parameters jointly.",
  redundancy: "On this page: all three are implemented for chamber pressure only (two sensors, a virtual sensor from three model routes, and a vote between them). Every other channel has a single sensor.",
  validation:
    "On this page: every model is verified against the simulator it runs in, and validated against nothing else. No physical engine has been used to calibrate or validate any model here, and nothing on this page is flight-certification evidence or a basis for a flight-safety decision.",
  aiArchitecture:
    "On this page: a reference architecture. The signal-quality layer runs latency, clock-skew, sequence, noise, missing-sample and flat-line checks; range and rate plausibility checks are described, not implemented. The learned models are one PCA anomaly detector and one logistic-regression classifier, both trained on simulated data. No time-series or remaining-life model is trained.",
  mlops: `${NOT_IMPLEMENTED} The two learned models here are rebuilt in the browser every time the simulation loads. There is no dataset or model registry, no versioning, no drift monitoring, no approval gate and no deployment pipeline.`,
  northStar: "On this page: a reference architecture. The physical system is simulated, the test evidence is simulated, and the decision support is a recommendation to a learner.",
  dataArchitecture: `${NOT_IMPLEMENTED} There is no edge acquisition, transport, storage or service layer here: the simulated telemetry is produced and consumed inside the browser tab, and none of it is sent anywhere.`,
  digitalThread: `${NOT_IMPLEMENTED} The page is not connected to any requirements, design, manufacturing, test or maintenance record.`,
  cybersecurity: `${NOT_IMPLEMENTED} None of the controls below exists on this page: there is no authentication, signing, encryption, access control or audit log to demonstrate. One attack is simulated, replayed telemetry, and what catches it is the data-quality layer's sequence check, not a security control.`,
} as const;
