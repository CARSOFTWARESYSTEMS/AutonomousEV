"use client";
import { useCallback, useState, useSyncExternalStore } from "react";
import { BookOpen, ChevronDown, Download, Printer, Search } from "lucide-react";
import learning from "@/lib/cubetwin/learning.json";
import { CALCULATIONS, WEEK_CALCULATIONS } from "@/lib/cubetwin/content";
import { useSimulation } from "./SimulationProvider";
import { download } from "./Simulator";
import styles from "../cubetwin.module.css";
const memoryNotes = new Map<string, string>();
const unavailableStores = new Set<string>();
function subscribeNotes(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener("cubetwin-storage", notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener("cubetwin-storage", notify);
  };
}
function useStoredText(key: string) {
  const getSnapshot = useCallback(() => {
    try {
      if (unavailableStores.has(key)) return JSON.stringify([false, memoryNotes.get(key) ?? ""]);
      return JSON.stringify([true, localStorage.getItem(key) ?? ""]);
    } catch {
      return JSON.stringify([false, memoryNotes.get(key) ?? ""]);
    }
  }, [key]);
  const snapshot = useSyncExternalStore(
    subscribeNotes,
    getSnapshot,
    () => '[true,""]',
  );
  const [saved, value] = JSON.parse(snapshot) as [boolean, string];
  const setValue = (next: string) => {
    memoryNotes.set(key, next);
    try {
      localStorage.setItem(key, next);
    } catch {
      unavailableStores.add(key); // Quota / privacy restrictions: retain editable session memory.
    }
    window.dispatchEvent(new Event("cubetwin-storage"));
  };
  return { value, setValue, saved };
}
export function PrintButton({ className }: { className?: string }) {
  const print = () => {
    const details = Array.from(document.querySelectorAll("details"));
    const states = details.map((d) => d.open);
    details.forEach((d) => (d.open = true));
    const restore = () => {
      details.forEach((d, i) => (d.open = states[i]));
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
  };
  return (
    <button className={className ?? styles.button} onClick={print}>
      <Printer size={14} /> Print the Workbook
    </button>
  );
}
export function Roadmap() {
  const stored = useStoredText("cubetwin-progress-v1");
  let checked: string[] = [];
  try {
    const parsed = JSON.parse(stored.value || "[]");
    checked = Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {}
  const groups = (week: (typeof learning.weeks)[number]) => {
    const g = week.groups as Record<string, string[] | undefined>;
    return {
      Learn: g.Learn ?? [
        "Review model assumptions and the weekly learning material.",
      ],
      Calculate: [WEEK_CALCULATIONS[week.number - 1]],
      Build: g.Build ?? [],
      Verify: g.Verify ??
        g["Stage Gate 1 acceptance"] ??
        g["Stage Gate 2 acceptance"] ?? [
          "Compare outputs with the week’s stated acceptance criteria.",
        ],
      Deliver: g.Deliverables ?? [
        "Record your results, evidence, assumptions and one next improvement.",
      ],
    };
  };
  const ids = learning.weeks.flatMap((w) =>
    Object.entries(groups(w)).flatMap(([g, items]) =>
      items.map((_, i) => `${w.number}-${g}-${i}`),
    ),
  );
  const completed = checked.filter((id) => ids.includes(id)).length;
  const toggle = (id: string) =>
    stored.setValue(
      JSON.stringify(
        checked.includes(id)
          ? checked.filter((x) => x !== id)
          : [...checked, id],
      ),
    );
  return (
    <>
      <div className={styles.roadmapTop}>
        <div>
          <h3>Your mission, one week at a time.</h3>
          <p>
            14 September – 6 December 2026 · Learn → Calculate → Build → Verify
            → Deliver
          </p>
        </div>
        <div>
          <small>
            {completed} / {ids.length} tasks complete · saved in this browser
          </small>
          <div className={styles.progressBar}>
            {learning.weeks.map((w) => (
              <i
                key={w.number}
                data-complete={ids
                  .filter((id) => id.startsWith(`${w.number}-`))
                  .every((id) => checked.includes(id))}
              />
            ))}
          </div>
        </div>
      </div>
      <div className={styles.roadmapGrid}>
        {[
          "Foundations & first prototype",
          "Mission behaviour & faults",
          "Uncertainty & release",
        ].map((month, index) => (
          <div key={month}>
            <div className={styles.monthLabel}>
              <span>0{index + 1}</span>
              {month}
            </div>
            {learning.weeks.slice(index * 4, index * 4 + 4).map((w) => (
              <details className={styles.week} key={w.number}>
                <summary>
                  <span className={styles.weekNumber}>
                    {String(w.number).padStart(2, "0")}
                  </span>
                  <span className={styles.weekTitle}>
                    <b>{w.title}</b>
                    <small>{w.dates} 2026</small>
                  </span>
                  <ChevronDown size={15} />
                </summary>
                <div className={styles.weekBody}>
                  {Object.entries(groups(w)).map(([group, items]) => (
                    <div key={group}>
                      <h4>{group}</h4>
                      {items.map((item, i) => {
                        const id = `${w.number}-${group}-${i}`;
                        return (
                          <label key={id}>
                            <input
                              type="checkbox"
                              checked={checked.includes(id)}
                              onChange={() => toggle(id)}
                            />
                            <span>
                              {item.replace(/`/g, "").replace(/\*\*/g, "")}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  ))}
                  {w.number === 3 && (
                    <p>
                      The guide plans a concept submission milestone for 30
                      September. Confirm eligibility, deadline and submission
                      requirements with the organizer; the full learning project
                      continues to December.
                    </p>
                  )}
                </div>
              </details>
            ))}
          </div>
        ))}
      </div>
      {!stored.saved && (
        <p className={styles.formNote}>
          Browser storage is unavailable. Progress lasts for this session; print
          a copy to retain it.
        </p>
      )}
    </>
  );
}
export function Workbook() {
  const { result } = useSimulation();
  const notes = useStoredText("cubetwin-workbook-notes-v1");
  return (
    <div className={styles.workbook}>
      <div className={styles.workbookCover}>
        <BookOpen size={35} />
        <div className={styles.cardTag}>THE CUBETWIN FIELD NOTES</div>
        <h3>
          Build understanding.
          <br />
          Keep the evidence.
        </h3>
        <p>
          A printable companion to the same lessons, equations and 12-week
          project. Capture your predictions before you run, then explain what
          changed.
        </p>
        <div className={styles.actions}>
          <PrintButton className={styles.primaryButton} />
          <button
            className={styles.textButton}
            onClick={() =>
              download(
                "cubetwin-scenario.json",
                JSON.stringify(result.scenario, null, 2),
              )
            }
          >
            <Download size={13} /> Scenario template
          </button>
        </div>
      </div>
      <div className={styles.workbookFields}>
        <h3>Eight experiments to make it yours</h3>
        <ol className={styles.exerciseList}>
          {CALCULATIONS.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ol>
        <label className={styles.noteLabel} htmlFor="workbook-notes">
          Your prediction, observations & engineering conclusion
        </label>
        <textarea
          id="workbook-notes"
          className={styles.noteArea}
          placeholder="Prediction → scenario → observed result → explanation → limitations"
          value={notes.value}
          onChange={(e) => notes.setValue(e.target.value)}
          maxLength={12000}
        />
        <div className={styles.printNotes}>{notes.value || "Record your observations here."}</div>
        <p className={styles.saveNote}>
          {notes.saved
            ? "Notes stay in this browser. No account or upload is needed."
            : "Storage unavailable: download notes before leaving."}
        </p>
        <button
          className={`${styles.textButton} ${styles.noPrint}`}
          onClick={() =>
            download(
              "cubetwin-workbook-notes.txt",
              notes.value,
              "text/plain;charset=utf-8",
            )
          }
        >
          <Download size={12} /> Download notes
        </button>
      </div>
    </div>
  );
}
export function Glossary() {
  const [query, setQuery] = useState("");
  const entries = learning.glossary.filter((g) =>
    `${g.term} ${g.definition}`
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  );
  return (
    <>
      <div className={styles.sectionHead}>
        <div>
          <div className={styles.eyebrow}>THE LANGUAGE OF YOUR MISSION</div>
          <h2>Big ideas. Plain language.</h2>
          <p>A searchable field guide to spacecraft, energy and simulation.</p>
        </div>
        <label className={styles.search}>
          <Search size={17} />
          <span className={styles.srOnly}>Search the glossary</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try “eclipse”, “SOC” or “digital twin”…"
            type="search"
          />
        </label>
      </div>
      <p className={styles.glossaryCount} role="status">
        {entries.length} of {learning.glossary.length} terms
        {entries.length === 0 ? " · No matches. Try a shorter term." : ""}
      </p>
      <dl className={styles.glossaryGrid} tabIndex={0} aria-label="Glossary definitions">
        {learning.glossary.map((g) => (
          <div
            className={styles.glossaryTerm}
            key={g.term}
            style={{ display: entries.includes(g) ? undefined : "none" }}
          >
            <dt>{g.term}</dt>
            <dd>{g.definition}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
