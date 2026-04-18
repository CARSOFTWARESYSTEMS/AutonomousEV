import { Metadata } from 'next';
import SIEMSContent from "./SIEMSContent";

export const metadata: Metadata = {
  title: "AI-Driven SI-EMS Research | Autonomous EV Energy Management | EV.ENGINEER™",
  description: "Explore the flagship research on Super-Intelligent Energy Management Systems (SI-EMS) for Level-4 Autonomous EVs by Sudarshana Karkala. Discover advanced AI strategies for energy optimization, battery pack life extension, and safety-invariant autonomous control.",
  keywords: [
    "SI-EMS", 
    "Super-Intelligent Energy Management System", 
    "Autonomous EV", 
    "Level-4 Robotaxi", 
    "Electric Vehicle Optimization", 
    "Battery Management System", 
    "EV Research", 
    "Sudarshana Karkala",
    "Sudarshana Karkala Lead Architect",
    "Sudarshana Karkala Principal Architect",
    "Sudarshana Karkala Autonomous EV",
    "Sudarshana Karkala SI-EMS Research",
    "Sudarshana Karkala Thasmai Infotech Private Limited",
    "Sudarshana Karkala EV Consultant",
    "iTelematics",
    "Deep Reinforcement Learning EMS",
    "Model Predictive Control EV",
    "Fleet Coordination"
  ],
  authors: [{ name: "Sudarshana Karkala" }],
  creator: "Sudarshana Karkala",
  publisher: "EV.ENGINEER™",
  openGraph: {
    title: "AI-Driven SI-EMS Research | Autonomous EV Energy Management",
    description: "Explore the flagship research on Super-Intelligent Energy Management Systems (SI-EMS) for Level-4 Autonomous EVs. Advanced AI strategies for energy optimization and battery pack life extension.",
    url: "https://ev.engineer/si-ems",
    siteName: "EV.ENGINEER™",
    type: "article",
    authors: ["Sudarshana Karkala"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI-Driven SI-EMS Research | EV.ENGINEER™",
    description: "Explore the flagship research on Super-Intelligent Energy Management Systems (SI-EMS) for Level-4 Autonomous EVs by Sudarshana Karkala.",
  },
  alternates: {
    canonical: "https://ev.engineer/si-ems",
  },
};

export default function SIEMSPage() {
  return <SIEMSContent />;
}
