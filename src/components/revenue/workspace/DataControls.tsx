"use client";
// Where saved progress lives, and the two things a user can do with it.
import { useState } from "react";
import { STORAGE_KEY, useRevenue } from "../state/store";
import css from "../workspace.module.css";

export default function DataControls() {
  const resetAll = useRevenue((state) => state.resetAll);
  const [confirming, setConfirming] = useState(false);

  const exportData = () => {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      raw = null;
    }
    const blob = new Blob([raw ?? "{}"], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `revenue-engineering-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className={css.dataControls}>
      <p className={css.dataNote}>
        <strong>Saved in this browser only.</strong> Nothing you enter is sent to EV.ENGINEER or to analytics. Use public information and role names; never record drawings, controlled or defence-sensitive data.
      </p>
      <div className={css.buttonRow}>
        <button type="button" className={css.ghostButton} onClick={exportData}>
          Export my data
        </button>
        {confirming ? (
          <>
            <button
              type="button"
              className={css.dangerButton}
              onClick={() => {
                resetAll();
                setConfirming(false);
              }}
            >
              Yes, erase everything
            </button>
            <button type="button" className={css.ghostButton} onClick={() => setConfirming(false)}>
              Keep it
            </button>
          </>
        ) : (
          <button type="button" className={css.ghostButton} onClick={() => setConfirming(true)}>
            Reset workspace
          </button>
        )}
      </div>
    </div>
  );
}
