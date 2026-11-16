export const PROGRESS_KEY = "satellite-energy-academy:progress:v1";
export interface LessonProgress { lessonVersion: number; completed: boolean; advancedCompleted: boolean }
export interface AcademyProgress { schemaVersion: 1; lessons: Record<string, LessonProgress> }
export const emptyProgress = (): AcademyProgress => ({ schemaVersion: 1, lessons: {} });

/** Storage is untrusted and optional; an older/invalid record cannot unlock a challenge. */
export function parseProgress(raw: string | null): AcademyProgress {
  try {
    const value = JSON.parse(raw ?? "null");
    if (value?.schemaVersion !== 1 || !value.lessons || typeof value.lessons !== "object" || Array.isArray(value.lessons)) return emptyProgress();
    const lessons: AcademyProgress["lessons"] = {};
    for (const [id, entry] of Object.entries(value.lessons)) {
      if (!/^[a-z0-9-]+$/.test(id) || !entry || typeof entry !== "object") continue;
      const p = entry as LessonProgress;
      if (!Number.isInteger(p.lessonVersion) || p.lessonVersion < 1 || typeof p.completed !== "boolean" || typeof p.advancedCompleted !== "boolean") continue;
      lessons[id] = { lessonVersion: p.lessonVersion, completed: p.completed, advancedCompleted: p.completed && p.advancedCompleted };
    }
    return { schemaVersion: 1, lessons };
  } catch { return emptyProgress(); }
}
