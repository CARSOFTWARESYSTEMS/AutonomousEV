"use client";

import { useState } from "react";
import { trackAqip } from "../analytics";
import { PLATFORM_LAYERS, ROADMAP } from "../data/roadmap";
import { Chip, Tags } from "../ui/primitives";
import css from "../interactive.module.css";

/**
 * The three-year roadmap. On wide screens the reader picks a year and the
 * platform diagram shows what is in scope by then. On phones all three years
 * are stacked as milestone cards, each carrying its own scope list.
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
              Year {item.year} · {item.period} <Chip tone="target" />
            </p>
            <h4 id={`${item.id}-title`} className={css.yearTitle}>
              {item.theme}
            </h4>
            <p className={css.yearSummary}>{item.summary}</p>
            <Tags items={item.items} label={`Year ${item.year} work`} />
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
                <Tags items={layer.parts} />
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
