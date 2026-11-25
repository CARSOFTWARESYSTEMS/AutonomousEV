"use client";
import { ArrowRight } from "lucide-react";
import { CHAIN_COMPONENTS } from "@/lib/wireless-charging/components";
import { ENVIRONMENTS, MODES, PRODUCT } from "@/lib/wireless-charging/content";
import { FIDELITY, type Fidelity } from "@/lib/wireless-charging/registry";
import { DATA_MODES, type DataMode } from "@/lib/wireless-charging/sensors";
import { useTwin } from "../state/store";
import { Tag } from "../ui/controls";
import ui from "../twin.module.css";

export default function OverviewSection() {
  const set = useTwin((s) => s.set);
  return (
    <div className={ui.labBody}>
      <header className={ui.labHead}>
        <p className={ui.eyebrow}>Overview</p>
        <h2>{PRODUCT.question}</h2>
        <p>Four connected digital twins share one engine: the same coupler, circuit, battery, thermal, communication and energy models drive every view, every graph and every number.</p>
      </header>
      <ul className={ui.envCards}>
        {ENVIRONMENTS.map((e) => (
          <li key={e.id}>
            <button type="button" onClick={() => set({ section: "twin", environment: e.id, view: "cinematic" })}>
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
        <p className={ui.small}>Ground side → wireless link → vehicle side. Select a stage to inspect it in 3D.</p>
        <ol className={ui.chain}>
          {CHAIN_COMPONENTS.map((c) => (
            <li key={c.id} data-side={c.side}>
              <button type="button" onClick={() => set({ section: "twin", environment: "station", view: "engineering", selected: c.id })}>
                {c.name}
              </button>
            </li>
          ))}
        </ol>
      </section>
      <div className={ui.columns2}>
        <section className={ui.labBlock} aria-labelledby="fidelity-title">
          <h3 id="fidelity-title">Model fidelity</h3>
          <dl className={ui.defs}>
            {(Object.keys(FIDELITY) as Fidelity[]).map((f) => (
              <div key={f}>
                <dt>{`${f} · ${FIDELITY[f].name}`}</dt>
                <dd>{FIDELITY[f].text}</dd>
              </div>
            ))}
          </dl>
          <p className={ui.small}>Connectivity and accuracy are independent: a connected model is not, by that fact, validated. No model here is experimentally validated yet.</p>
        </section>
        <section className={ui.labBlock} aria-labelledby="modes-title">
          <h3 id="modes-title">Data modes</h3>
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
        </section>
      </div>
      <section className={ui.labBlock} aria-labelledby="xp-title">
        <h3 id="xp-title">Experience modes</h3>
        <dl className={ui.defs}>
          {MODES.map((m) => (
            <div key={m.id}>
              <dt>{m.label}</dt>
              <dd>{m.text}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
