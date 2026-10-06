// The Aerospace Quality Graph: the entities AQIP is planned to connect, and how
// they relate. Positions are percentages of the desktop canvas. The upper band
// runs left to right in the order of the digital thread; the lower band holds
// geometry and 3D, where a requirement sits on the part.

export type GraphGroupId = "definition" | "requirement" | "geometry" | "manufacturing" | "verification" | "evidence" | "events";

export interface GraphGroup {
  id: GraphGroupId;
  label: string;
  description: string;
}

export interface GraphNode {
  id: string;
  label: string;
  group: GraphGroupId;
  /** Centre of the node on the desktop canvas, as percentages. */
  x: number;
  y: number;
  summary: string;
  /** What the graph is planned to hold about this entity. */
  fields: readonly string[];
}

export interface GraphEdge {
  from: string;
  to: string;
  /** Reads as "<from> <relation> <to>". */
  relation: string;
}

export const GRAPH_GROUPS: readonly GraphGroup[] = [
  { id: "definition", label: "Engineering definition", description: "What the customer asked for." },
  { id: "requirement", label: "Requirements", description: "What must be true of the part." },
  { id: "geometry", label: "Geometry and 3D", description: "Where a requirement sits on the part." },
  { id: "manufacturing", label: "Manufacturing", description: "How and by whom it was made." },
  { id: "verification", label: "Verification", description: "How conformity was checked." },
  { id: "evidence", label: "Evidence and identity", description: "The records, and the parts they belong to." },
  { id: "events", label: "Quality events", description: "Approvals, problems and reviews." },
];

export const GRAPH_NODES: readonly GraphNode[] = [
  { id: "customer", label: "Customer", group: "definition", x: 9, y: 5.8, summary: "The organisation that owns the requirement and accepts the part.", fields: ["Quality requirements", "Flow-downs", "Acceptance authority"] },
  { id: "part", label: "Part", group: "definition", x: 9, y: 18.6, summary: "The item being made and delivered, identified by its part number.", fields: ["Part number", "Name", "Customer", "Current revision", "Criticality class"] },
  { id: "drawing", label: "Drawing", group: "definition", x: 9, y: 32, summary: "The engineering definition the part is built and inspected to.", fields: ["Drawing number", "Sheet", "Format: 2D or model-based", "Owner", "Controlled copy"] },
  { id: "revision", label: "Revision", group: "definition", x: 9, y: 45.5, summary: "One issue of the drawing. Everything else is valid only against the revision it was done to.", fields: ["Revision letter", "Effective date", "Change reference", "Supersedes"] },
  { id: "specification", label: "Specification", group: "definition", x: 9, y: 58.3, summary: "A material, process or customer specification the drawing calls up.", fields: ["Specification number", "Issue", "Scope", "Called up by"] },

  { id: "requirement", label: "Requirement", group: "requirement", x: 25.5, y: 14.1, summary: "A statement the part or process must satisfy, from a drawing, specification or customer document.", fields: ["Source document", "Clause or note", "Applies to", "Flow-down"] },
  {
    id: "characteristic",
    label: "Characteristic",
    group: "requirement",
    x: 25.5,
    y: 32,
    summary: "One inspectable requirement of the design: the unit AQIP accounts for, from drawing to accepted result.",
    fields: ["Source Drawing", "Revision", "Zone", "Nominal", "Tolerance", "GD&T", "Criticality", "Inspection Method", "Measurement", "Evidence", "Verifier", "Status"],
  },
  { id: "gdt", label: "GD&T", group: "requirement", x: 25.5, y: 49.9, summary: "Geometric dimensioning and tolerancing: the symbols that control form, orientation and location.", fields: ["Control type", "Tolerance zone", "Datums", "Material condition"] },

  { id: "supplier", label: "Supplier", group: "manufacturing", x: 42, y: 4.5, summary: "The organisation that manufactures or processes the part.", fields: ["Approval status", "Scope of approval", "Site"] },
  { id: "process", label: "Process", group: "manufacturing", x: 42, y: 16, summary: "A manufacturing operation that creates or changes a characteristic.", fields: ["Operation", "Route step", "Work instruction", "Controls"] },
  { id: "machine", label: "Machine", group: "manufacturing", x: 42, y: 26.9, summary: "The equipment a process runs on.", fields: ["Asset ID", "Type", "Capability", "Maintenance status"] },
  { id: "operator", label: "Operator", group: "manufacturing", x: 42, y: 37.8, summary: "The person who performed the operation, where recording this is required and permitted.", fields: ["Role", "Authorisation", "Training record"] },
  { id: "tool", label: "Tool", group: "manufacturing", x: 42, y: 48.7, summary: "The cutting tools, fixtures and programs a process uses.", fields: ["Tool or fixture ID", "Program revision", "Life or condition"] },
  { id: "special-process", label: "Special Process", group: "manufacturing", x: 42, y: 59.5, summary: "A process whose result cannot be fully verified afterwards, such as heat treatment, plating, welding or NDT.", fields: ["Process type", "Specification", "Approved source", "Certificate"] },

  { id: "lot-batch", label: "Lot/Batch", group: "evidence", x: 58.5, y: 5.8, summary: "A group of parts made together from the same material and set-up.", fields: ["Lot number", "Quantity", "Material heat", "Route"] },
  { id: "inspection", label: "Inspection", group: "verification", x: 58.5, y: 18.6, summary: "A planned verification of one or more characteristics.", fields: ["Type: first article, in-process or final", "Method", "Sample", "Result"] },
  { id: "measurement", label: "Measurement", group: "verification", x: 58.5, y: 32, summary: "A recorded value for a characteristic.", fields: ["Value", "Unit", "Timestamp", "Instrument", "Recorded by"] },
  { id: "equipment", label: "Equipment", group: "verification", x: 58.5, y: 45.5, summary: "The measuring instrument or gauge used.", fields: ["Instrument ID", "Type", "Resolution", "Suitability for the tolerance"] },
  { id: "calibration", label: "Calibration", group: "verification", x: 58.5, y: 58.3, summary: "Evidence that the instrument was within calibration when it was used.", fields: ["Certificate", "Due date", "Status", "Laboratory"] },

  { id: "serial-number", label: "Serial Number", group: "evidence", x: 75, y: 5.8, summary: "The identity of one individual part.", fields: ["Serial", "Part and revision", "Build record", "Quality Passport"] },
  { id: "evidence", label: "Evidence", group: "evidence", x: 75, y: 18.6, summary: "Any record that supports a claim of conformity.", fields: ["Type", "Source system", "Integrity check", "Linked requirement"] },
  { id: "material-certificate", label: "Material Certificate", group: "evidence", x: 75, y: 32, summary: "The mill or supplier certificate for the raw material.", fields: ["Heat or batch number", "Specification", "Supplier", "Linked lot"] },
  { id: "cmm-result", label: "CMM Result", group: "evidence", x: 75, y: 45.5, summary: "A coordinate measuring machine report, imported as structured data.", fields: ["Program", "Features measured", "Deviations", "File reference"] },
  { id: "test-report", label: "Test Report", group: "evidence", x: 75, y: 58.3, summary: "Results of mechanical, chemical, non-destructive or functional tests.", fields: ["Test type", "Method", "Result", "Laboratory"] },

  { id: "fai", label: "FAI", group: "events", x: 91.5, y: 8.3, summary: "First Article Inspection: documented verification that the production process can make a conforming part.", fields: ["Scope: full or partial", "Revision", "Characteristics accounted for", "Approval"] },
  { id: "ncr", label: "NCR", group: "events", x: 91.5, y: 20.5, summary: "A nonconformance report, raised when a requirement is not met.", fields: ["Affected characteristic", "Quantity", "Disposition", "Owner"] },
  { id: "capa", label: "CAPA", group: "events", x: 91.5, y: 32, summary: "Corrective and preventive action taken to remove the cause.", fields: ["Root cause", "Action", "Verification of effectiveness", "Status"] },
  { id: "concession", label: "Concession", group: "events", x: 91.5, y: 43.5, summary: "Customer-approved acceptance of a specific nonconformance.", fields: ["Reference", "Scope", "Approved by", "Validity"] },
  { id: "audit", label: "Audit", group: "events", x: 91.5, y: 55.7, summary: "An internal, customer or certification audit that samples the evidence.", fields: ["Type", "Scope", "Findings", "Evidence sampled"] },

  { id: "view", label: "View", group: "geometry", x: 9, y: 77, summary: "One projection of the part on a drawing sheet: front, top, side or detail.", fields: ["View type", "Sheet", "Scale", "Projection"] },
  { id: "section-view", label: "Section View", group: "geometry", x: 25.5, y: 77, summary: "A view cut through the part to show what the outside hides, such as the depth of a hole.", fields: ["Cutting plane", "Sheet", "Features revealed"] },
  {
    id: "reconstruction",
    label: "Reconstruction",
    group: "geometry",
    x: 42,
    y: 77,
    summary: "A geometry candidate inferred from a drawing's views. A navigation aid once an engineer has verified it, never the engineering definition.",
    fields: ["Source views", "Engine version", "Status: candidate or verified", "Verified by"],
  },
  { id: "model-3d", label: "3D Model", group: "geometry", x: 58.5, y: 77, summary: "The geometry the inspection twin displays: approved CAD where it is supplied, otherwise a verified reconstruction.", fields: ["Source: CAD or reconstruction", "Revision", "Verification status", "Units"] },
  { id: "geometry", label: "Geometry", group: "geometry", x: 75, y: 77, summary: "The shape of the part, as bodies, faces and the features cut into them.", fields: ["Bodies", "Faces", "Datums", "Overall size"] },
  { id: "feature", label: "Feature", group: "geometry", x: 91.5, y: 77, summary: "One recognisable piece of geometry: a hole, slot, pocket, boss, chamfer or fillet.", fields: ["Type", "Parameters", "Parent geometry", "Linked characteristics"] },
  { id: "cad-model", label: "CAD Model", group: "geometry", x: 17.25, y: 92, summary: "Approved 3D geometry supplied by the customer. Where it exists it is the authority, and AQIP displays it rather than inferring anything.", fields: ["Format: STEP, IGES or native", "Revision", "Approval status", "PMI present"] },
  {
    id: "reconstruction-assumption",
    label: "Reconstruction Assumption",
    group: "geometry",
    x: 33.75,
    y: 92,
    summary: "Something the reconstruction had to assume because the drawing does not say.",
    fields: ["Statement", "Affected feature", "Resolution", "Resolved by"],
  },
  { id: "confidence", label: "Confidence", group: "geometry", x: 50, y: 92, summary: "How certain the reconstruction is of one feature, with the reason for that level.", fields: ["Level", "Basis", "Model version", "Recorded at"] },
  { id: "spatial-location", label: "Spatial Location", group: "geometry", x: 79, y: 92, summary: "Where on the part something is: a feature, a measurement point or a nonconformance.", fields: ["Feature", "Face", "Coordinates", "Linked record"] },
];

export const GRAPH_EDGES: readonly GraphEdge[] = [
  { from: "customer", to: "part", relation: "specifies" },
  { from: "part", to: "drawing", relation: "is defined by" },
  { from: "drawing", to: "revision", relation: "is controlled at" },
  { from: "drawing", to: "specification", relation: "calls up" },
  { from: "specification", to: "requirement", relation: "imposes" },
  { from: "revision", to: "characteristic", relation: "carries" },
  { from: "requirement", to: "characteristic", relation: "is expressed as" },
  { from: "characteristic", to: "gdt", relation: "is toleranced by" },
  { from: "characteristic", to: "process", relation: "is produced by" },
  { from: "supplier", to: "process", relation: "performs" },
  { from: "supplier", to: "part", relation: "manufactures" },
  { from: "process", to: "machine", relation: "runs on" },
  { from: "process", to: "operator", relation: "is performed by" },
  { from: "process", to: "tool", relation: "uses" },
  { from: "process", to: "special-process", relation: "can include" },
  { from: "special-process", to: "test-report", relation: "is evidenced by" },
  { from: "characteristic", to: "inspection", relation: "is verified by" },
  { from: "inspection", to: "measurement", relation: "records" },
  { from: "measurement", to: "equipment", relation: "is taken with" },
  { from: "equipment", to: "calibration", relation: "is covered by" },
  { from: "measurement", to: "cmm-result", relation: "is captured in" },
  { from: "inspection", to: "evidence", relation: "produces" },
  { from: "evidence", to: "material-certificate", relation: "includes" },
  { from: "evidence", to: "cmm-result", relation: "includes" },
  { from: "evidence", to: "test-report", relation: "includes" },
  { from: "part", to: "lot-batch", relation: "is produced in" },
  { from: "lot-batch", to: "serial-number", relation: "contains" },
  { from: "lot-batch", to: "material-certificate", relation: "is traceable to" },
  { from: "serial-number", to: "evidence", relation: "is traceable to" },
  { from: "fai", to: "characteristic", relation: "accounts for every" },
  { from: "fai", to: "evidence", relation: "assembles" },
  { from: "fai", to: "revision", relation: "is performed against" },
  { from: "customer", to: "fai", relation: "accepts" },
  { from: "inspection", to: "ncr", relation: "can raise" },
  { from: "ncr", to: "capa", relation: "drives" },
  { from: "ncr", to: "concession", relation: "can be dispositioned by" },
  { from: "customer", to: "concession", relation: "approves" },
  { from: "audit", to: "evidence", relation: "samples" },
  { from: "audit", to: "capa", relation: "can raise" },
  { from: "drawing", to: "view", relation: "is drawn as" },
  { from: "view", to: "section-view", relation: "can include" },
  { from: "view", to: "reconstruction", relation: "is an input to" },
  { from: "section-view", to: "reconstruction", relation: "resolves depth for" },
  { from: "reconstruction", to: "reconstruction-assumption", relation: "records each" },
  { from: "reconstruction", to: "confidence", relation: "is scored by" },
  { from: "reconstruction", to: "model-3d", relation: "proposes a candidate" },
  { from: "drawing", to: "cad-model", relation: "can be aligned with" },
  { from: "cad-model", to: "model-3d", relation: "is the authoritative source of" },
  { from: "model-3d", to: "geometry", relation: "contains" },
  { from: "geometry", to: "feature", relation: "is made of" },
  { from: "characteristic", to: "feature", relation: "is located on" },
  { from: "feature", to: "inspection", relation: "is verified by" },
  { from: "feature", to: "spatial-location", relation: "has" },
  { from: "ncr", to: "spatial-location", relation: "is recorded at" },
];

export const NODE_BY_ID: ReadonlyMap<string, GraphNode> = new Map(GRAPH_NODES.map((node) => [node.id, node]));

export interface Relation {
  node: GraphNode;
  /** The sentence that describes the link from the point of view of the node asked about. */
  phrase: string;
}

/** Every node directly linked to `id`, with the relation spelled out. */
export function relationsOf(id: string): Relation[] {
  const self = NODE_BY_ID.get(id);
  if (!self) return [];
  const relations: Relation[] = [];
  for (const edge of GRAPH_EDGES) {
    if (edge.from !== id && edge.to !== id) continue;
    const from = NODE_BY_ID.get(edge.from);
    const to = NODE_BY_ID.get(edge.to);
    if (!from || !to) continue;
    relations.push({ node: edge.from === id ? to : from, phrase: `${from.label} ${edge.relation} ${to.label}` });
  }
  return relations;
}

export const DEFAULT_NODE = "characteristic";
