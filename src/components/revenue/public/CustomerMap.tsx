"use client";
// Who are we trying to help? One company, and the four people in it who
// matter to a purchase. Choosing a person shows one short explanation.
// From 900px the people sit around the company on thin connection lines;
// on phones the company comes first and the people below it.
import { useState } from "react";
import { trackRevenue } from "../analytics";
import { CUSTOMER_COMPANY, CUSTOMER_ROLES } from "../data/steps";
import css from "../site.module.css";

export default function CustomerMap() {
  const [selected, setSelected] = useState(0);
  const role = CUSTOMER_ROLES[selected];

  const choose = (index: number) => {
    if (index === selected) return;
    setSelected(index);
    trackRevenue("customer_role_view", { role: CUSTOMER_ROLES[index].id });
  };

  return (
    <div className={css.customerMap}>
      <div className={css.orbit}>
        <svg className={css.orbitLines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M50 50 V12 M50 50 H88 M50 50 V88 M50 50 H12" />
        </svg>
        <p className={css.company}>
          <span className={css.companyKicker}>Customer</span>
          <span className={css.companyName}>{CUSTOMER_COMPANY}</span>
        </p>
        <ul className={css.roles} aria-label="People in the customer company">
          {CUSTOMER_ROLES.map((item, i) => (
            <li key={item.id} className={css.roleSlot} data-slot={i}>
              <button type="button" className={css.role} aria-pressed={selected === i} aria-controls="rv-role-detail" onClick={() => choose(i)}>
                <span className={css.roleName}>{item.name}</span>
                <span className={css.rolePart}>{item.part}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div id="rv-role-detail" className={css.roleDetail} aria-live="polite">
        <p className={css.flowDetailStep}>{role.part}</p>
        <p className={css.roleDetailName}>{role.name}</p>
        <p className={css.roleDetailText}>{role.text}</p>
      </div>
    </div>
  );
}
