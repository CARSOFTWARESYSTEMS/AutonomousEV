import styles from "../page.module.css";

export type BadgeKind = "target" | "simulated" | "competitor" | "cost" | "validate";

const CLASS_MAP: Record<BadgeKind, string> = {
  target: styles.tagTarget,
  simulated: styles.tagSimulated,
  competitor: styles.tagCompetitor,
  cost: styles.tagCost,
  validate: styles.tagValidate,
};

const LABEL_MAP: Record<BadgeKind, string> = {
  target: "Engineering Target",
  simulated: "Simulated",
  competitor: "Competitor Published Data",
  cost: "Estimated Cost",
  validate: "To Be Validated",
};

export function Badge({ kind, label }: { kind: BadgeKind; label?: string }) {
  return <span className={CLASS_MAP[kind]}>{label ?? LABEL_MAP[kind]}</span>;
}
