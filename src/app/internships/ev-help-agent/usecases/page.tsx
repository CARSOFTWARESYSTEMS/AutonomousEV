import { Metadata } from 'next';
import UseCasesContent from './UseCasesContent';

export const metadata: Metadata = {
  title: "EV Help Agent — Real AI Conversations & EV Diagnostics | EV.ENGINEER™",
  description: "Real-world EV support use cases: predictive maintenance, battery diagnostics, thermal runaway alerts, motor telemetry, and remote technician workflows powered by AI.",
  keywords: ["EV Help Agent Use Cases","EV Diagnostics AI","Battery Intelligence","Predictive Maintenance EV","Thermal Runaway Detection","EV AI Support","Battery SOH Analysis","EV Telemetry","CAN Bus Diagnostics","EV.ENGINEER"],
};

export default function UseCasesPage() {
  return <UseCasesContent />;
}
