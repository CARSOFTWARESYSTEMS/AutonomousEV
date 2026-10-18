// Small, shared pieces of the toolkit's interface: provenance badges, the
// persistent real / simulation banner, safety banners and status pills. Every
// state is carried by words as well as colour.
import { AlertOctagon, AlertTriangle, FlaskConical, ShieldCheck, Wrench } from "lucide-react";
import { PROVENANCE } from "@/lib/ev-battery-toolkit/provenance";
import type { HealthStatus } from "@/lib/ev-battery-toolkit/health";
import type { DiagnosticContext, Provenance, SafetyLevel } from "@/lib/ev-battery-toolkit/types";
import css from "../toolkit.module.css";

export function ProvenanceBadge({ provenance }: { provenance: Provenance }) {
  const p = PROVENANCE[provenance];
  return (
    <span className={css.prov} data-family={p.family} title={`Data origin: ${p.label}`}>
      {p.label}
    </span>
  );
}

/** The banner that says, at all times, whether the panel shows a real vehicle or training data. */
export function ContextBanner({ context, detail }: { context: DiagnosticContext; detail?: string }) {
  const real = context === "real";
  return (
    <div className={css.contextBanner} data-context={context} role="status">
      {real ? <Wrench size={16} aria-hidden="true" /> : <FlaskConical size={16} aria-hidden="true" />}
      <strong>{real ? "REAL VEHICLE DIAGNOSIS" : "SIMULATION / TRAINING DATA"}</strong>
      {detail ? <span>{detail}</span> : null}
    </div>
  );
}

export const SAFETY_STOP_ACTIONS = ["STOP DIAGNOSIS", "DO NOT CHARGE", "DO NOT CONTINUE DISASSEMBLY", "ISOLATE / QUARANTINE / ESCALATE"] as const;

export function SafetyBanner({ level, title, children }: { level: Exclude<SafetyLevel, "none">; title?: string; children?: React.ReactNode }) {
  const stop = level === "stop";
  return (
    <div className={css.safety} data-level={level} role="alert">
      {stop ? <AlertOctagon size={20} aria-hidden="true" /> : <AlertTriangle size={20} aria-hidden="true" />}
      <div>
        <p className={css.safetyTitle}>{title ?? (stop ? "CRITICAL — STOP SERVICE PROCEDURE" : "EARLY WARNING")}</p>
        {stop ? (
          <ul className={css.safetyActions}>
            {SAFETY_STOP_ACTIONS.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        ) : null}
        {children}
      </div>
    </div>
  );
}

const HEALTH_FAMILY: Record<HealthStatus, string> = { Healthy: "ok", Attention: "warning", "Service Recommended": "service", Critical: "critical" };

export function HealthPill({ status }: { status: HealthStatus }) {
  return (
    <span className={css.pill} data-family={HEALTH_FAMILY[status]}>
      {status === "Healthy" ? <ShieldCheck size={14} aria-hidden="true" /> : <AlertTriangle size={14} aria-hidden="true" />}
      {status}
    </span>
  );
}

export function Pill({ family, children }: { family: "ok" | "warning" | "service" | "critical" | "neutral" | "info"; children: React.ReactNode }) {
  return (
    <span className={css.pill} data-family={family}>
      {children}
    </span>
  );
}

export function SectionHead({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className={css.sectionHead}>
      <p className={css.eyebrow}>{eyebrow}</p>
      <h2 id={id} className={css.h2}>
        {title}
      </h2>
      {children ? <div className={css.lead}>{children}</div> : null}
    </header>
  );
}
