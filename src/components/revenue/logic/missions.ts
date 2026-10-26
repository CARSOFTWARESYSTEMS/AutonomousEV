// Finding and moving between days.
import { MISSIONS } from "../data/missions";
import { TOTAL_DAYS, WEEKS, phaseOf, weekOf } from "../data/framework";
import type { Mission } from "../types";

export const clampDay = (day: number) => Math.min(TOTAL_DAYS, Math.max(1, Math.round(Number.isFinite(day) ? day : 1)));

export const missionFor = (day: number): Mission => MISSIONS[clampDay(day) - 1];

export const daysOfWeek = (week: number) => MISSIONS.filter((mission) => weekOf(mission.day) === week);

export const weekInfo = (day: number) => WEEKS[weekOf(day) - 1];

export { phaseOf, weekOf };

/** Every searchable word of a mission, lower-cased. */
function haystack(mission: Mission): string {
  return [
    mission.title,
    mission.mission,
    mission.output,
    mission.learn,
    mission.applyFai,
    ...mission.doToday,
    ...mission.ask,
    ...mission.dont,
    ...(mission.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();
}

const INDEX = MISSIONS.map((mission) => ({ day: mission.day, title: mission.title.toLowerCase(), output: mission.output.toLowerCase(), text: haystack(mission) }));

/**
 * Days matching every word of the query, best first: a title match outranks
 * an output match, which outranks a match anywhere in the day.
 */
export function searchMissions(query: string): Mission[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return INDEX.filter((entry) => words.every((word) => entry.text.includes(word)))
    .map((entry) => ({
      day: entry.day,
      rank: words.reduce((sum, word) => sum + (entry.title.includes(word) ? 4 : entry.output.includes(word) ? 2 : 1), 0),
    }))
    .sort((a, b) => b.rank - a.rank || a.day - b.day)
    .map((entry) => MISSIONS[entry.day - 1]);
}

/**
 * The day to work on: the first not completed, after the furthest completed
 * one. With nothing completed it is Day 1; with everything, Day 60.
 */
export function nextOpenDay(completed: Record<number, unknown>): number {
  const done = Object.keys(completed).map(Number).filter((day) => day >= 1 && day <= TOTAL_DAYS);
  if (done.length === 0) return 1;
  const furthest = Math.max(...done);
  for (let day = 1; day <= TOTAL_DAYS; day++) if (!completed[day] && day > furthest) return day;
  for (let day = 1; day <= TOTAL_DAYS; day++) if (!completed[day]) return day;
  return TOTAL_DAYS;
}
