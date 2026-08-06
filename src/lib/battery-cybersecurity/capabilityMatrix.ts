import type { EvidenceStatus } from "./types";

export interface CapabilityMatrixRow {
  category: string;
  totalCount: number;
  counts: Record<EvidenceStatus, number>;
}

const EVIDENCE_STATUSES: EvidenceStatus[] = [
  "available-capability",
  "demonstration-poc",
  "research-in-progress",
  "future-roadmap",
];

/**
 * Pure aggregation over existing, already-tagged data — introduces no new
 * claims. Each category is an array of items that carry an evidenceStatus
 * field (directly or via a selector function).
 */
export function buildCapabilityMatrix(
  categories: Array<{ label: string; items: Array<{ evidenceStatus: EvidenceStatus }> }>
): CapabilityMatrixRow[] {
  return categories.map(({ label, items }) => {
    const counts = EVIDENCE_STATUSES.reduce(
      (acc, status) => {
        acc[status] = items.filter((item) => item.evidenceStatus === status).length;
        return acc;
      },
      {} as Record<EvidenceStatus, number>
    );
    return { category: label, totalCount: items.length, counts };
  });
}
