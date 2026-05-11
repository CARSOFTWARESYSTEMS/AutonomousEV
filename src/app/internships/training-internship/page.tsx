import type { Metadata } from "next";
import TrainingInternshipContent from "./TrainingInternshipContent";

export const metadata: Metadata = {
  title: "Training & Internship Program | EV.ENGINEER™",
  description:
    "Explore EV.ENGINEER™ Training & Internship Program: a structured 12-month pathway covering training, proof of concept, product development, testing, release readiness, certification, and EV career preparation.",
  keywords: [
    "EV Internship",
    "EV Training",
    "EV Engineering Internship",
    "Battery Engineering Internship",
    "EV Software Internship",
    "EV Career India",
    "EV Engineering Training",
    "EV Product Development Internship",
  ],
};

export default function TrainingInternshipPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <TrainingInternshipContent />
    </div>
  );
}
