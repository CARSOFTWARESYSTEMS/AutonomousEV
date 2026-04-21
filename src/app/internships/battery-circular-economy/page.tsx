import type { Metadata } from "next";
import BatteryCircularContent from "./BatteryCircularContent";

export const metadata: Metadata = {
  title:
    "EV Battery Circular Economy — Secondary Life Business Model | EV.ENGINEER™",
  description:
    "Comprehensive financial and engineering model for EV battery secondary life — cost breakdown, post-warranty economics, cell-level repurposing, 100-EV simulation, scaling projections, and Business Model Canvas. By Sudarshana Karkala.",
  keywords: [
    "EV battery secondary life",
    "EV battery circular economy",
    "battery repurposing business model",
    "EV battery cost breakdown India",
    "secondary life battery intelligence",
    "EV battery resale value",
    "battery cell grading",
    "EV battery reuse",
    "EV.ENGINEER",
    "Sudarshana Karkala",
  ],
};

export default function BatteryCircularEconomyPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <BatteryCircularContent />
    </div>
  );
}
