import { Cpu, Orbit, Package, Radio, Rocket, Satellite, Shield } from "lucide-react";
import type { TrackIcon as Name } from "../data/curriculum";

const ICONS = { rocket: Rocket, satellite: Satellite, orbit: Orbit, cpu: Cpu, radio: Radio, shield: Shield, package: Package } as const;

export default function TrackIcon({ name, size = 20 }: { name: Name; size?: number }) {
  const Icon = ICONS[name];
  return <Icon size={size} aria-hidden />;
}
