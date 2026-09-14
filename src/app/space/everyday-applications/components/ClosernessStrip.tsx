import { Cloud, MapPin, Wheat, LifeBuoy, Radio, Truck } from "lucide-react";
import styles from "../everyday-applications.module.css";

const ITEMS = [
  { icon: Cloud, label: "Weather" },
  { icon: MapPin, label: "Navigation" },
  { icon: Wheat, label: "Food" },
  { icon: LifeBuoy, label: "Safety" },
  { icon: Radio, label: "Connectivity" },
  { icon: Truck, label: "Delivery" },
];

export default function ClosernessStrip() {
  return (
    <div className={styles.closernessStrip}>
      <p className={styles.closernessLabel}>Space is closer than you think</p>
      <div className={styles.closernessRow} role="list">
        {ITEMS.map(({ icon: Icon, label }) => (
          <span key={label} className={styles.closernessChip} role="listitem">
            <Icon size={15} aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
