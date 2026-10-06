"use client";

import { useState } from "react";
import { trackAqip } from "../analytics";
import { POLICY_OUTCOME, POLICY_RULE } from "../data/product";
import css from "../interactive.module.css";

/** One example rule, and the controls it yields for a critical and a non-critical characteristic. */
export default function PolicyAsCode() {
  const [critical, setCritical] = useState(true);

  return (
    <div className={css.policy}>
      <pre className={css.code} aria-label="Example quality rule">
        <code>{POLICY_RULE.join("\n")}</code>
      </pre>
      <div className={css.policyEval}>
        <label className={css.switch}>
          <input
            type="checkbox"
            role="switch"
            autoComplete="off"
            checked={critical}
            onChange={(event) => {
              setCritical(event.target.checked);
              trackAqip("aqip_policy_toggle", { critical: event.target.checked ? "true" : "false" });
            }}
          />
          <span>
            characteristic.critical = <strong>{String(critical)}</strong>
          </span>
        </label>
        <dl className={css.policyOutcome} aria-live="polite" aria-label="Controls the rule yields">
          {POLICY_OUTCOME.map((row) => (
            <div key={row.control}>
              <dt>{row.control}</dt>
              <dd>{critical ? row.critical : row.standard}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
