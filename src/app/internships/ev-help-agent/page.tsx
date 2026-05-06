import { Metadata } from 'next';
import EVHelpAgentContent from './EVHelpAgentContent';

export const metadata: Metadata = {
  title: "EV Help Agent — Architecture & Design | EV.ENGINEER™",
  description: "Technical Requirement and AI Architectural Design for EV Help Agent. AI Voice Agent for EV Diagnostics, Support, Battery Intelligence & Engineering Assistance.",
  keywords: [
    "EV Help Agent",
    "AI Voice Agent",
    "EV Diagnostics",
    "Battery Intelligence",
    "EV Engineering Assistance",
    "AI Support Assistant",
    "EV Triage System",
    "Sudarshana Karkala",
    "EV.ENGINEER"
  ],
};

export default function EVHelpAgentPage() {
  return <EVHelpAgentContent />;
}
