import type { Metadata } from 'next';
import BatteryDiagnosticsContent from './BatteryDiagnosticsContent';

export const metadata: Metadata = {
  title: 'Second-Life EV Battery Intelligence Platform | EV.ENGINEER™',
  description: 'Design and development of a secure battery diagnostics, grading, traceability, and thermal reconfiguration platform for second-life EV battery packs, enabling safe rural energy storage applications.',
};

export default function BatteryDiagnosticsPage() {
  return <BatteryDiagnosticsContent />;
}
