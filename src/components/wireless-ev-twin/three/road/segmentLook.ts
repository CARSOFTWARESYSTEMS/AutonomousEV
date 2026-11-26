// What a road segment's controller state means to a viewer (no three.js here:
// the interface's legend imports it).
import type { Segment } from "@/lib/wireless-charging/dynamic";

export type SegmentLook = "off" | "energising" | "active" | "de-energising" | "blocked" | "failed";

/** What a segment's state and level mean to a viewer. */
export function segmentLook(seg: Pick<Segment, "state" | "level">): SegmentLook {
  if (seg.state === "failed") return "failed";
  if (seg.state === "blocked") return "blocked";
  if (seg.state === "on") return seg.level < 0.97 ? "energising" : "active";
  return seg.level > 0.01 ? "de-energising" : "off";
}

export const LOOK_COLORS: Record<SegmentLook, string> = {
  off: "#3a4048",
  energising: "#ffb84d",
  active: "#5ad1ff",
  "de-energising": "#2f7fa3",
  blocked: "#ff4d4d",
  failed: "#8a8f96",
};
