import type { Metadata } from 'next';
import Battery12WeekPlanContent from './Battery12WeekPlanContent';

export const metadata: Metadata = {
  title: '12-Week Execution Plan — EV Battery Diagnostics & Health Intelligence | EV.ENGINEER™',
  description: 'A focused weekly execution roadmap to validate one real EV battery problem, build a simple MVP, collect industry feedback, and move toward the first paying customer or pilot.',
};

export default function Battery12WeekPlanPage() {
  return <Battery12WeekPlanContent />;
}
