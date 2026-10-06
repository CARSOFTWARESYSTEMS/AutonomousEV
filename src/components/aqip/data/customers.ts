// Customers: who to serve first, where to find them, how to interview them and
// how to validate that the product works for them.

export const SEGMENTS: readonly { stage: "Initial ICP" | "Next" | "Later"; title: string; items: readonly string[] }[] = [
  {
    stage: "Initial ICP",
    title: "AS9100-oriented precision machining MSMEs serving aerospace and defence customers",
    items: [
      "30–300 employees",
      "CNC machining",
      "CMM",
      "A quality team",
      "Recurring FAI requirements",
      "PDF, Excel and manual workflow",
      "Multiple customers",
      "AS9100 or customer-quality requirements",
    ],
  },
  { stage: "Next", title: "Adjacent manufacturing processes", items: ["Sheet metal", "Assemblies", "Composites", "Avionics", "Electronics", "Additive manufacturing"] },
  { stage: "Later", title: "Customers and networks", items: ["Primes", "DPSUs", "OEM supplier networks", "Space manufacturing", "International aerospace suppliers"] },
];

export const CLUSTERS = ["Bengaluru", "Hyderabad", "Pune", "Chennai / Hosur", "Coimbatore", "Nashik", "Belagavi", "Other validated aerospace and defence clusters"] as const;

/** Places to look for customers. None of these is a partner of AQIP. */
export const CHANNELS = [
  "Aerospace supplier ecosystems",
  "OEM supplier networks",
  "DPSU vendors",
  "DRDO suppliers",
  "ISRO suppliers",
  "iDEX startups",
  "SIDM",
  "CII",
  "Industry associations",
  "Aero India",
  "Defence MSME events",
  "CMM and metrology vendors",
  "Calibration labs",
  "AS9100 consultants",
  "Special-process houses",
] as const;

export const CHANNEL_LABEL = "Potential customer discovery channel";

export const DISCOVERY = {
  avoid: "We built an AI tool.",
  opening: "Could you walk me through the last difficult First Article Inspection or customer quality package your team completed?",
  validationAsk: "Can we run your next live FAI together?",
  validationAvoid: "Would you buy our product?",
} as const;

export const DISCOVERY_TOPICS: readonly { id: string; topic: string; listenFor: string; questions: readonly string[] }[] = [
  { id: "workflow", topic: "Workflow", listenFor: "The real sequence of steps, tools and hand-offs.", questions: ["Show me your last FAI.", "What starts the process?", "Who touches the drawing?", "Where is data entered?"] },
  { id: "time", topic: "Time", listenFor: "Hours, not impressions. Ask for the last real example.", questions: ["How long does ballooning take?", "How long does FAI preparation take?", "How much time goes into revision checks?"] },
  { id: "quality", topic: "Quality", listenFor: "Errors that reached a reviewer or the customer.", questions: ["What gets missed?", "What gets rejected?", "What creates rework?"] },
  { id: "revision", topic: "Revision", listenFor: "How the impact of a change is decided, and by whom.", questions: ["What happens when Rev C becomes Rev D?", "How do you decide what must be repeated?"] },
  { id: "measurement", topic: "Measurement", listenFor: "Where values are re-typed.", questions: ["How does CMM data enter quality records?", "How much is copied manually?"] },
  { id: "evidence", topic: "Evidence", listenFor: "How a certificate is found again months later.", questions: ["Where do material/process certificates live?", "How are they tied to the part/configuration?"] },
  { id: "commercial", topic: "Commercial", listenFor: "A cost or delay the business already feels.", questions: ["What does a difficult FAI cost internally?", "What happens when approval is delayed?"] },
  { id: "buying", topic: "Buying", listenFor: "The owner of the pain, the approver and the blockers.", questions: ["Who owns this pain?", "Who would approve software?", "What security requirements apply?"] },
  { id: "validation", topic: "Validation", listenFor: "A commitment of time and a live job, not a compliment.", questions: ["Can we run your next live FAI together?"] },
];

export const VALIDATION_MEASURES: readonly { measure: string; how: string }[] = [
  { measure: "Engineering hours", how: "Hours booked to the job, existing process against AQIP process." },
  { measure: "Ballooning time", how: "Time from drawing received to a complete characteristic list." },
  { measure: "FAI preparation time", how: "Time from first measurement to a package ready for review." },
  { measure: "Characteristics found", how: "Count against the verified reference list for the drawing." },
  { measure: "Characteristics missed", how: "Reference characteristics absent from the output." },
  { measure: "False extraction", how: "Proposed characteristics that are not on the drawing." },
  { measure: "Revision review time", how: "Time to identify and scope every change between two revisions." },
  { measure: "Report preparation", how: "Time to assemble and format the final report." },
  { measure: "Customer rejection / rework", how: "Packages returned, and the reason for each." },
  { measure: "Human corrections required", how: "Proposals a reviewer had to change before approval." },
];

export const AI_METRICS: readonly { metric: string; meaning: string }[] = [
  { metric: "Precision", meaning: "Of the characteristics proposed, the share that were correct." },
  { metric: "Recall", meaning: "Of the characteristics on the drawing, the share that were found." },
  { metric: "F1", meaning: "One figure that balances precision and recall." },
  { metric: "False negatives", meaning: "Characteristics that were missed. The most dangerous error." },
  { metric: "False positives", meaning: "Characteristics proposed that do not exist. A cost in review time." },
];

export const VALIDATION_RULE = "Any supported critical characteristic requires human reconciliation before release.";

export const PMF_SIGNALS = [
  "Pilots convert to paid",
  "Quality teams use AQIP weekly",
  "A customer completes a live FAI using AQIP",
  "Renewals",
  "Module expansion",
  "Multiple sites",
  "Referrals",
  "A customer asks its suppliers to use AQIP",
] as const;

export const PMF_STRONGEST = "An OEM/customer asks suppliers to use AQIP.";
