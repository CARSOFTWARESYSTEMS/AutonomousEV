"use client";

import { useState } from "react";
import { trackAqip } from "../analytics";
import { PLATFORM_LAYERS, ROADMAP } from "../data/roadmap";
import { Chip, Tags } from "../ui/primitives";
import css from "../interactive.module.css";

/**
 * The five-year roadmap. On wide screens the reader picks a year and sees its
 * objectives, customer and company phase, and what the platform covers by
 * then. On phones every year is stacked as a milestone card that carries the
 * same detail, so nothing depends on the selector or on swiping.
 */
export default function RoadmapExplorer() {
  const [year, setYear] = useState(1);

  return (
    <div className={css.roadmap}>
      <div className={css.yearTabs} role="group" aria-label="Select a year">
        {ROADMAP.map((item) => (
          <button
            key={item.id}
            type="button"
            className={css.yearTab}
            data-horizon={item.horizon}
            aria-pressed={year === item.year}
            onClick={() => {
              setYear(item.year);
              trackAqip("aqip_roadmap_year_select", { year: item.id });
            }}
          >
            <span className={css.yearTabName}>Year {item.year}</span>
            <span className={css.yearTabPeriod}>{item.period}</span>
          </button>
        ))}
      </div>

      <div className={css.yearPanels}>
        {ROADMAP.map((item) => (
          <article key={item.id} className={css.yearPanel} data-active={year === item.year ? "" : undefined} aria-labelledby={`${item.id}-title`}>
            <p className={css.yearMeta}>
              Year {item.year} · {item.period} <Chip tone={item.horizon} />
            </p>
            <h4 id={`${item.id}-title`} className={css.yearTitle}>
              {item.theme}
            </h4>
            <p className={css.yearSummary}>{item.summary}</p>
            <p className={css.yearHeading}>Objectives and modules</p>
            <Tags items={item.items} label={`Year ${item.year} work`} />
            <dl className={css.yearPhases}>
              <div>
                <dt>Customer phase</dt>
                <dd>{item.customer}</dd>
              </div>
              <div>
                <dt>Company phase</dt>
                <dd>{item.company}</dd>
              </div>
            </dl>
            <ul className={css.yearScope} aria-label={`Platform scope by the end of Year ${item.year}`}>
              {PLATFORM_LAYERS.map((layer) => (
                <li key={layer.name} data-in={layer.fromYear <= item.year ? "" : undefined}>
                  <span>{layer.name}</span>
                  <span>{layer.fromYear <= item.year ? "In scope" : "Later"}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className={css.platform} aria-live="polite">
        <p className={css.platformTitle}>Platform scope by the end of Year {year}</p>
        <ol className={css.platformLayers}>
          {PLATFORM_LAYERS.map((layer) => {
            const state = layer.fromYear === year ? "new" : layer.fromYear < year ? "in" : "later";
            return (
              <li key={layer.name} className={css.platformLayer} data-state={state}>
                <div className={css.platformHead}>
                  <span className={css.platformName}>{layer.name}</span>
                  <span className={css.platformState}>{state === "new" ? `Added in Year ${year}` : state === "in" ? "In scope" : `Planned for Year ${layer.fromYear}`}</span>
                </div>
                {state === "later" ? null : <Tags items={layer.parts} />}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
