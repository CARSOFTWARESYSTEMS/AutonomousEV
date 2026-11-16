import { expect, it } from "vitest";
import { emptyProgress, parseProgress } from "./progress";
it.each([null, "{", "null", '[]', '{"schemaVersion":2,"lessons":{}}', '{"schemaVersion":1,"lessons":[]}'])("handles unavailable/corrupt/versioned storage: %s", raw => {
  expect(parseProgress(raw)).toEqual(emptyProgress());
});
it("keeps valid records and rejects malformed achievements", () => {
  expect(parseProgress(JSON.stringify({ schemaVersion: 1, lessons: {
    "capture-the-sun": { lessonVersion: 1, completed: true, advancedCompleted: true },
    broken: { lessonVersion: 1, completed: "true", advancedCompleted: true },
    unfinished: { lessonVersion: 1, completed: false, advancedCompleted: true },
  } })).lessons).toEqual({
    "capture-the-sun": { lessonVersion: 1, completed: true, advancedCompleted: true },
    unfinished: { lessonVersion: 1, completed: false, advancedCompleted: false },
  });
});
