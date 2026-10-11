"use client";
// A set of items of which one is open: steps of a workflow, rungs of a ladder,
// levels of a pyramid, cards being compared. Every panel is rendered and stays
// in the document, so the content is there whether or not anything is clicked;
// choosing an item only changes which panel is showing.
import { type KeyboardEvent, type ReactNode, useId, useState } from "react";
import { type AdvancedTwinEvent, trackAdvancedTwin } from "../analytics";
import css from "../advancedTwin.module.css";

export interface PickerItem {
  id: string;
  label: ReactNode;
  /** A short second line under the label. */
  hint?: ReactNode;
  panel: ReactNode;
}

type PickEvent = Extract<AdvancedTwinEvent, "physics_model_opened" | "ai_model_opened" | "digital_twin_architecture_opened" | "diagnosis_opened" | "week_module_opened">;
const PARAM: Record<PickEvent, string> = { physics_model_opened: "model", ai_model_opened: "model", digital_twin_architecture_opened: "view", diagnosis_opened: "fault", week_module_opened: "week" };

interface PickerProps {
  label: string;
  items: readonly PickerItem[];
  /** How the choices are laid out. */
  layout?: "tabs" | "steps" | "ladder" | "pyramid";
  initial?: string;
  /** The learning event a choice reports, with the item's id as its parameter. */
  event?: PickEvent;
  /** Shows "3 of 12" and previous / next controls: for a sequence meant to be walked through. */
  walk?: boolean;
}

export default function Picker({ label, items, layout = "tabs", initial, event, walk }: PickerProps) {
  const [open, setOpen] = useState(initial ?? items[0].id);
  const base = useId();
  const index = items.findIndex((item) => item.id === open);

  const choose = (id: string, focus = false) => {
    if (id !== open) {
      setOpen(id);
      if (event) (trackAdvancedTwin as (e: PickEvent, p: Record<string, string>) => void)(event, { [PARAM[event]]: id });
    }
    if (focus) document.getElementById(`${base}-tab-${id}`)?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const forward = e.key === "ArrowRight" || e.key === "ArrowDown";
    const back = e.key === "ArrowLeft" || e.key === "ArrowUp";
    const next = forward ? index + 1 : back ? index - 1 : e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : null;
    if (next === null) return;
    e.preventDefault();
    choose(items[(next + items.length) % items.length].id, true);
  };

  return (
    <div className={css.picker} data-layout={layout}>
      <div className={css.pickerTabs} role="tablist" aria-label={label} aria-orientation={layout === "tabs" ? "horizontal" : "vertical"}>
        {items.map((item, i) => (
          <button key={item.id} id={`${base}-tab-${item.id}`} type="button" role="tab" className={css.pickerTab} aria-selected={open === item.id} aria-controls={`${base}-panel-${item.id}`} tabIndex={open === item.id ? 0 : -1} onClick={() => choose(item.id)} onKeyDown={onKey} style={layout === "pyramid" ? { ["--rung" as string]: i } : undefined}>
            {(layout === "steps" || layout === "ladder") && (
              <span className={css.pickerIndex} aria-hidden="true">
                {layout === "ladder" ? i : i + 1}
              </span>
            )}
            <span className={css.pickerText}>
              <span className={css.pickerLabel}>{item.label}</span>
              {item.hint && <span className={css.pickerHint}>{item.hint}</span>}
            </span>
          </button>
        ))}
      </div>
      <div className={css.pickerBody}>
        {items.map((item) => (
          <div key={item.id} id={`${base}-panel-${item.id}`} role="tabpanel" aria-labelledby={`${base}-tab-${item.id}`} className={css.pickerPanel} hidden={open !== item.id} tabIndex={0}>
            {item.panel}
          </div>
        ))}
        {walk && (
          <div className={css.walk}>
            <button type="button" className={css.ghost} disabled={index === 0} onClick={() => choose(items[index - 1].id)}>
              <span aria-hidden="true">←</span> Previous
            </button>
            <span className={css.walkCount} role="status">
              {index + 1} of {items.length}
            </span>
            <button type="button" className={css.ghost} disabled={index === items.length - 1} onClick={() => choose(items[index + 1].id)}>
              Next <span aria-hidden="true">→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
