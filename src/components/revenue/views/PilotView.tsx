"use client";
// The Pilot / Proof-of-Value workspace. A pilot cannot be marked Passed
// unless its success criteria and baseline were written down first.
import { useRef } from "react";
import { trackRevenue } from "../analytics";
import { PILOT_STATUSES } from "../data/scoring";
import { pilotCanPass } from "../logic/pilot";
import type { Pilot } from "../state/model";
import { useRevenue } from "../state/store";
import type { PilotStatus } from "../types";
import { Badge } from "../ui/badges";
import { Notice, Panel, SelectField, TextArea, TextField, ViewHeader } from "../ui/controls";
import css from "../workspace.module.css";

export default function PilotView() {
  const pilot = useRevenue((state) => state.pilot);
  const setPilot = useRevenue((state) => state.setPilot);
  const reported = useRef(Boolean(pilot.customer.trim()));
  const canPass = pilotCanPass(pilot);

  const update = (patch: Partial<Pilot>) => {
    setPilot(patch);
    if (!reported.current && (patch.customer ?? pilot.customer).trim()) {
      reported.current = true;
      trackRevenue("pilot_created");
    }
  };

  const setStatus = (status: PilotStatus) => {
    if (status === "passed" && !canPass) return;
    update({ status });
  };

  const field = (key: keyof Omit<Pilot, "status">, label: string, area = false, hint?: string) =>
    area ? <TextArea key={key} label={label} hint={hint} value={pilot[key]} onChange={(value) => update({ [key]: value })} /> : <TextField key={key} label={label} hint={hint} value={pilot[key]} onChange={(value) => update({ [key]: value })} />;

  return (
    <div>
      <ViewHeader eyebrow="Sell" title="Pilot / Proof-of-Value Workspace" lede="Define success before the pilot starts. A pilot that cannot fail cannot prove anything." />

      <Notice tone="warn">Never allow a pilot to be successful without predefined criteria. Use non-controlled drawings the customer chooses and explicitly authorises.</Notice>

      <Panel title="Pilot charter" kicker="Plan" actions={<Badge tone={pilot.status === "passed" ? "green" : pilot.status === "failed" ? "red" : "cyan"}>{PILOT_STATUSES.find((s) => s.id === pilot.status)?.label}</Badge>}>
        <div className={css.formGrid}>
          {field("customer", "Customer (or account code)")}
          {field("owner", "Owner")}
          {field("problem", "Problem being tested", true)}
          {field("baseline", "Baseline (measured before the pilot)", true, "For example: preparation hours per drawing, measured on the last three FAIs.")}
          {field("scope", "Sample drawing / scope reference", true, "Reference only — never upload or paste drawing content here.")}
          {field("criteria", "Success criteria (agreed in writing)", true, "Measurable and agreed before the start: what result leads to which decision.")}
          {field("security", "Security constraints", true)}
          <TextField label="Start date" type="date" value={pilot.start} onChange={(start) => update({ start })} />
          <TextField label="End date" type="date" value={pilot.end} onChange={(end) => update({ end })} />
        </div>
      </Panel>

      <Panel title="Measurements" kicker="Evidence">
        <div className={css.formGrid}>
          {field("currentTime", "Current workflow time")}
          {field("assistedTime", "Assisted workflow time")}
          {field("corrections", "Corrections")}
          {field("reviewEffort", "Review effort")}
          {field("completeness", "Completeness")}
          {field("feedback", "User feedback", true)}
        </div>
      </Panel>

      <Panel title="Status and decision" kicker="Decision" tone="accent">
        <div className={css.formGrid}>
          <SelectField
            label="Pilot status"
            value={pilot.status}
            onChange={setStatus}
            options={PILOT_STATUSES.map((status) => ({ value: status.id, label: status.id === "passed" && !canPass ? "Passed (needs criteria and baseline)" : status.label, disabled: status.id === "passed" && !canPass }))}
            hint={canPass ? undefined : "Passed stays unavailable until success criteria and a baseline are recorded."}
          />
          {field("nextDecision", "Next decision", true)}
        </div>
      </Panel>
    </div>
  );
}
