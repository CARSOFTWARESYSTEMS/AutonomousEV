import { ShieldCheck, ShieldAlert, ShieldQuestion, ShieldX } from "lucide-react";
import type { EvidenceStatus, Severity, TrustState } from "@/lib/battery-cybersecurity/types";
import styles from "./page.module.css";

const TRUST_META: Record<TrustState, { label: string; className: string; Icon: typeof ShieldCheck }> = {
  trusted: { label: "Trusted", className: styles.trustTrusted, Icon: ShieldCheck },
  degraded: { label: "Degraded", className: styles.trustDegraded, Icon: ShieldAlert },
  unverified: { label: "Unverified", className: styles.trustUnverified, Icon: ShieldQuestion },
  compromised: { label: "Compromised", className: styles.trustCompromised, Icon: ShieldX },
};

export function TrustStateBadge({ state }: { state: TrustState }) {
  const { label, className, Icon } = TRUST_META[state];
  return (
    <span className={className}>
      <Icon size={13} aria-hidden="true" />
      {label}
    </span>
  );
}

const EVIDENCE_META: Record<EvidenceStatus, { label: string; className: string }> = {
  "available-capability": { label: "Available Capability", className: styles.evidenceAvailable },
  "demonstration-poc": { label: "Demonstration / POC", className: styles.evidenceDemo },
  "research-in-progress": { label: "Research in Progress", className: styles.evidenceResearch },
  "future-roadmap": { label: "Future Roadmap", className: styles.evidenceRoadmap },
};

export function EvidenceStatusBadge({ status }: { status: EvidenceStatus }) {
  const { label, className } = EVIDENCE_META[status];
  return <span className={className}>{label}</span>;
}

const SEVERITY_META: Record<Severity, { label: string; className: string }> = {
  low: { label: "Low", className: styles.severityLow },
  medium: { label: "Medium", className: styles.severityMedium },
  high: { label: "High", className: styles.severityHigh },
  critical: { label: "Critical", className: styles.severityCritical },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const { label, className } = SEVERITY_META[severity];
  return <span className={`${styles.severityBadge} ${className}`}>{label} severity</span>;
}
