import Link from "next/link";
import { ReactNode } from "react";
import PrerequisitesSection from "@/components/PrerequisitesSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'AV & EV Internships | EV.ENGINEER™',
  description: 'Practical, engineering-focused internships in EV battery health, autonomous vehicle systems, safety systems, air taxis (eVTOL), and RTOS architecture. Kickstart your career in autonomous eMobility.',
  keywords: [
    'EV Internships', 'AV Internships', 'Autonomous Vehicles Internship',
    'Electric Vehicle Research', 'Battery Diagnostics Internship',
    'Air Taxi (eVTOL) Internships', 'Super-Intelligent AI EMS',
    'EV Engineering Internships', 'EV Repair Workshop Internships',
    'AICTE Internships', 'VTU Internships in EV'
  ]
};

import InternshipsClient from "./InternshipsClient";

export default function InternshipsPage() {
  return <InternshipsClient />;
}
