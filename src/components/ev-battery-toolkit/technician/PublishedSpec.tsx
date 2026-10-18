// The published battery specification for a vehicle: each value with its data
// origin, confidence and every source claim — including claims that disagree.
// UNKNOWN fields say so. Used in the real workflow and on vehicle pages.
import { ExternalLink } from "lucide-react";
import { ARCHITECTURES } from "@/data/ev-battery-toolkit/architectures";
import { EVEIUM_SOURCES } from "@/data/ev-battery-toolkit/eveium";
import { formatSourced, SOURCE_CONFLICT } from "@/lib/ev-battery-toolkit/provenance";
import type { Sourced, VehicleBatterySpec } from "@/lib/ev-battery-toolkit/types";
import { Pill, ProvenanceBadge } from "../ui/Badges";
import css from "../diagnosis.module.css";

const SOURCES = EVEIUM_SOURCES;

const CONFIDENCE_FAMILY = { LOW: "neutral", MEDIUM: "warning", HIGH: "ok" } as const;

export function valueText(key: keyof VehicleBatterySpec, item: Sourced<unknown>): string {
  if (item.conflict) return SOURCE_CONFLICT;
  if (key === "batteryArchitecture" && typeof item.value === "string" && item.value in ARCHITECTURES) return `${ARCHITECTURES[item.value as keyof typeof ARCHITECTURES].name} (stated)`;
  if (key === "batteryLocation" && item.value === null) return "NOT YET VERIFIED";
  return formatSourced(item, key === "energyKWh" ? 3 : 0);
}

export function SpecValue({ field, item }: { field: keyof VehicleBatterySpec; item: Sourced<unknown> }) {
  return (
    <span className={css.specValue}>
      <span>{valueText(field, item)}</span> <ProvenanceBadge provenance={item.provenance} />
      {item.confidence ? <Pill family={CONFIDENCE_FAMILY[item.confidence]}>{item.confidence}</Pill> : null}
    </span>
  );
}

export function SpecClaims({ item }: { item: Sourced<unknown> }) {
  if (!item.claims?.length && !item.note) return null;
  return (
    <div className={css.claims}>
      {item.claims?.length ? (
        <ul>
          {item.claims.map((c, i) => {
            const src = SOURCES[c.sourceId];
            return (
              <li key={`${c.sourceId}-${i}`}>
                <span className={css.claimValue}>{c.value}</span>{" "}
                {src ? (
                  <a href={src.url} target="_blank" rel="noopener noreferrer">
                    {src.publisher}
                    {src.published ? `, ${src.published}` : ""} <span className={css.claimCategory}>{src.category.replace("_", " ")}</span>
                    <ExternalLink size={11} aria-hidden="true" />
                    <span className={css.srOnly}> (opens in a new tab)</span>
                  </a>
                ) : (
                  c.sourceId
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
      {item.note ? <p className={css.note}>{item.note}</p> : null}
    </div>
  );
}

const ROWS: { key: keyof VehicleBatterySpec; label: string }[] = [
  { key: "batteryType", label: "Battery" },
  { key: "nominalVoltage", label: "Nominal voltage" },
  { key: "capacityAh", label: "Capacity" },
  { key: "energyKWh", label: "Nominal energy" },
  { key: "batteryArchitecture", label: "Architecture" },
  { key: "batteryLocation", label: "Battery location" },
  { key: "chemistry", label: "Cell chemistry" },
  { key: "cellType", label: "Cell format" },
  { key: "bmsCommunication", label: "BMS communication" },
  { key: "connectorType", label: "Connector" },
];

/** A compact table of the published specification, with sources on demand. */
export default function PublishedSpec({ spec, title, compact }: { spec: VehicleBatterySpec; title: string; compact?: boolean }) {
  return (
    <div className={css.published}>
      <p className={css.evLabel}>{title}</p>
      <dl className={css.publishedList}>
        {ROWS.map(({ key, label }) => {
          const item = spec[key];
          return (
            <div key={key}>
              <dt>{label}</dt>
              <dd>
                <SpecValue field={key} item={item} />
                {!compact && (item.claims?.length || item.note) ? (
                  <details className={css.claimDetails}>
                    <summary>Sources</summary>
                    <SpecClaims item={item} />
                  </details>
                ) : null}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
