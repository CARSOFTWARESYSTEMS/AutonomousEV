"use client";
// Jump to any of the sixty days, first to last. A native select: on a phone
// one tap opens the system picker. Days are listed in order, grouped by
// week; each shows its title, and a tick once it is complete.
import { useId } from "react";
import { trackRevenue } from "../analytics";
import { WEEKS } from "../data/framework";
import { daysOfWeek } from "../logic/missions";
import { useRevenue } from "../state/store";
import css from "../site.module.css";

export default function DayPicker({ value, onSelect, label = "Go to any day" }: { value?: number; onSelect: (day: number) => void; label?: string }) {
  const id = useId();
  const completed = useRevenue((state) => state.completed);

  return (
    <div className={css.dayPicker}>
      <label htmlFor={id} className={css.dayPickerLabel}>
        {label}
      </label>
      <select
        id={id}
        className={css.dayPickerSelect}
        value={value ?? ""}
        autoComplete="off"
        onChange={(event) => {
          const day = Number(event.target.value);
          if (!day) return;
          trackRevenue("daily_mission_view", { day: String(day) });
          onSelect(day);
        }}
      >
        {value === undefined ? (
          <option value="" disabled>
            Choose a day, 1 to 60
          </option>
        ) : null}
        {WEEKS.map((week) => {
          const days = daysOfWeek(week.n);
          return (
            <optgroup key={week.n} label={`Week ${week.n} · Days ${days[0].day}–${days[days.length - 1].day}`}>
              {days.map((mission) => (
                <option key={mission.day} value={mission.day}>
                  Day {mission.day} — {mission.title}
                  {completed[mission.day] ? " ✓" : ""}
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>
    </div>
  );
}
