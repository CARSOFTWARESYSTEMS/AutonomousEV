import type { Metadata } from "next";
import RoadmapClient from "./RoadmapClient";

export const metadata: Metadata = {
  title: 'EV Engineering Research & Internship Roadmap | EV.ENGINEER™',
  description: 'Explore EV.ENGINEER™ Research & Internship Roadmap focused on EV Battery Intelligence, Agentic AI, Autonomous Mobility, Aerospace Systems, and Intelligent Energy Platforms.',
  keywords: [
    'EV Internships', 'AV Internships', 'Autonomous Vehicles Internship',
    'Electric Vehicle Research', 'Battery Diagnostics Internship',
    'Air Taxi (eVTOL) Internships', 'Super-Intelligent AI EMS',
    'EV Engineering Internships', 'EV Repair Workshop Internships',
    'AICTE Internships', 'VTU Internships in EV'
  ]
};

export default function RoadmapPage() {
  return <RoadmapClient />;
}
