import type { Metadata } from 'next';
import BatteryPackDesignContent from './BatteryPackDesignContent';

export const metadata: Metadata = {
  title: 'EV Battery Pack Design Handbook — Basics to Real-World Systems | EV.ENGINEER™',
  description: 'The definitive technical engineering handbook for EV battery pack design. Discover end-to-end hardware, BMS architecture, thermal engineering, safety systems, telemetry, edge AI, cybersecurity, and second-life battery repurposing.',
  keywords: [
    'EV battery pack design',
    'battery management system design',
    'BMS hardware architecture',
    'thermal runaway propagation',
    'battery electrochemical models',
    'battery telemetry systems',
    'second-life battery grading',
    'EV battery safety standards',
    'un 38.3 testing',
    'ece r100 battery compliance',
    'automotive hardware-in-the-loop',
    'cell to pack integration',
    'BMS algorithms SOC SOH',
    'battery recycling economics',
    'Sudarshana Karkala'
  ]
};

export default function BatteryPackDesignPage() {
  return <BatteryPackDesignContent />;
}
