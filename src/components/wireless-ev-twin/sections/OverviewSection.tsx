"use client";
import { ArrowRight } from "lucide-react";
import { ALL_COMPONENTS, CHAIN_COMPONENTS, COMPONENTS } from "@/lib/wireless-charging/components";
import { ENVIRONMENTS, MODES, PRODUCT } from "@/lib/wireless-charging/content";
import { FIDELITY, type Fidelity, MODELS } from "@/lib/wireless-charging/registry";
import { DATA_MODES, type DataMode } from "@/lib/wireless-charging/sensors";
import { useTwin } from "../state/store";
import { openEnvironment } from "../story/guide";
import { Tag } from "../ui/controls";
import { Disclosure, ExpandScope, SectionHero } from "../ui/Section";
import { CHECKS } from "@/lib/wireless-charging/benchmarks";
import ui from "../twin.module.css";

export default function OverviewSection() {
  const set = useTwin((s) => s.set);
  const sides = [
    { id: "grid", label: "Grid side" },
    { id: "ground", label: "Ground side" },
    { id: "wireless", label: "Wireless link" },
    { id: "vehicle", label: "Vehicle side" },
  ].map((g) => ({ ...g, items: CHAIN_COMPONENTS.filter((c) => c.side === g.id) })).filter((g) => g.items.length > 0);
  return (
    <ExpandScope>
    <div className={ui.labBody}>
      <SectionHero
        eyebrow="Overview"
        title="Wireless energy for electric vehicles — parked, moving and autonomous"
        lede={PRODUCT.question}
        stats={[
          { value: "4", label: "Simulated environments" },
          { value: String(MODELS.length), label: "Models" },
          { value: String(CHECKS.length), label: "Checks" },
          { value: String(ALL_COMPONENTS.length), label: "Components" },
        ]}
      />
      <ul className={ui.envCards}>
        {ENVIRONMENTS.map((e) => (
          <li key={e.id}>
            <button
              type="button"
              onClick={() => {
                set({ section: "twin" });
                openEnvironment(e.id);
              }}
            >
              <span className={ui.envNumber}>{e.number}</span>
              <strong>{e.name}</strong>
              <span>{e.text}</span>
              <em>
                Open the twin <ArrowRight size={14} aria-hidden="true" />
              </em>
            </button>
          </li>
        ))}
      </ul>
      <section className={ui.labBlock} aria-labelledby="chain-title">
        <h3 id="chain-title">The energy chain, end to end</h3>
        <p className={ui.small}>Every stage between the grid and the battery is a modelled loss. Select one to open it in 3D.</p>
        <div className={ui.chainFlow}>
          {sides.map((g) => (
            <div key={g.id} className={ui.chainGroup} data-side={g.id}>
              <p>{g.label}</p>
              <ol className={ui.chain}>
                {g.items.map((c) => (
                  <li key={c.id} data-side={c.side}>
                    <button type="button" onClick={() => set({ section: "twin", environment: "station", view: "engineering", selected: c.id })}>
                      {c.name}
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>
      <Disclosure title="Model fidelity" summary="F0 conceptual to F5 — and what each level does and does not claim">
          <dl className={ui.defs}>
            {(Object.keys(FIDELITY) as Fidelity[]).map((f) => (
              <div key={f}>
                <dt>{`${f} · ${FIDELITY[f].name}`}</dt>
                <dd>{FIDELITY[f].text}</dd>
              </div>
            ))}
          </dl>
          <p className={ui.small}>Connectivity and accuracy are independent: a connected model is not, by that fact, validated. No model here is experimentally validated yet.</p>
      </Disclosure>
      <Disclosure title="Data modes" summary="Simulated, recorded, live, estimated — every value says which it is">
          <dl className={ui.defs}>
            {(Object.keys(DATA_MODES) as DataMode[]).map((m) => (
              <div key={m}>
                <dt>
                  <Tag kind={m} />
                </dt>
                <dd>{DATA_MODES[m]}</dd>
              </div>
            ))}
          </dl>
          <p className={ui.small}>
            Inputs you set are marked <Tag kind="input" />; model outputs <Tag kind="calculated" />.
          </p>
      </Disclosure>
      <Disclosure title="Experience modes" summary="Explore, Learn, Engineer and Research share one simulation">
        <dl className={ui.defs}>
          {MODES.map((m) => (
            <div key={m.id}>
              <dt>{m.label}</dt>
              <dd>{m.text}</dd>
            </div>
          ))}
        </dl>
      </Disclosure>
    </div>
    </ExpandScope>
  );
}
