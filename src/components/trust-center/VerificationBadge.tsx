import { ShieldCheck, BadgeCheck, Clock, CircleDashed } from "lucide-react";
import styles from "./shared.module.css";
import type { VerificationStatus } from "@/lib/trust-center/types";

const CONFIG: Record<VerificationStatus, { label: string; className: keyof typeof styles; Icon: typeof ShieldCheck }> = {
  verified: { label: "Verified", className: "verificationVerified", Icon: ShieldCheck },
  "externally-published": { label: "Externally Published", className: "verificationCurated", Icon: BadgeCheck },
  "manually-curated": { label: "Manually Curated", className: "verificationCurated", Icon: BadgeCheck },
  "pending-verification": { label: "Pending Verification", className: "verificationPending", Icon: Clock },
  placeholder: { label: "Placeholder", className: "verificationPlaceholder", Icon: CircleDashed },
};

export default function VerificationBadge({ status }: { status: VerificationStatus }) {
  const config = CONFIG[status] ?? CONFIG["manually-curated"];
  const Icon = config.Icon;
  return (
    <span className={styles[config.className]}>
      <Icon className={styles.badgeIcon} aria-hidden="true" />
      {config.label}
    </span>
  );
}
