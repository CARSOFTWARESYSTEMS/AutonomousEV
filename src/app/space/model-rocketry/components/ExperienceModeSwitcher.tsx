import styles from "../model-rocketry.module.css";

export type ExperienceMode = "webpage" | "presentation";

export default function ExperienceModeSwitcher({
  mode,
  onChange,
}: {
  mode: ExperienceMode;
  onChange: (mode: ExperienceMode) => void;
}) {
  return (
    <div className={styles.levelSwitcher} role="tablist" aria-label="Experience mode">
      <button type="button" role="tab" aria-selected={mode === "webpage"} className={styles.levelTab} onClick={() => onChange("webpage")}>
        Webpage
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "presentation"}
        className={styles.levelTab}
        onClick={() => onChange("presentation")}
      >
        Presentation Mode
      </button>
    </div>
  );
}
