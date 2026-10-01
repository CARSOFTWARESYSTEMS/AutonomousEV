import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CircleHelp, Info, List, X } from "lucide-react";
import PreparedBy from "@/components/PreparedBy";
import { PREPARED_BY, PRODUCT } from "../data/satelliteReference";
import { useExplorerStore } from "../state/explorerStore";
import LearnEngineerToggle from "./LearnEngineerToggle";
import ui from "../explorer.module.css";

/**
 * Who prepared the experience. The 3D application fills the viewport, so the
 * block that sits at the foot of the overview page is offered here instead.
 */
function AboutPanel({ onClose }: { onClose: () => void }) {
  // Esc closes this panel first; the application's own Esc handling skips handled events.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);
  return (
    <div id="explorer-about" className={ui.about} role="dialog" aria-label="About this experience">
      <div className={ui.popoverHead}>
        <p className={ui.popoverTitle}>ABOUT</p>
        <button type="button" className={ui.closeButton} aria-label="Close" onClick={onClose}>
          <X size={15} aria-hidden="true" />
        </button>
      </div>
      <PreparedBy notes={PREPARED_BY.notes} reviewed={PREPARED_BY.reviewed} reviewedLabel={PREPARED_BY.reviewedLabel} />
    </div>
  );
}

/** Minimal, translucent header. Holds the page's only H1. */
export default function ExplorerHeader() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const closeAbout = useCallback(() => setAboutOpen(false), []);
  const started = useExplorerStore((s) => s.started);
  const helpOpen = useExplorerStore((s) => s.helpOpen);
  const indexOpen = useExplorerStore((s) => s.indexOpen);
  const setHelpOpen = useExplorerStore((s) => s.setHelpOpen);
  const setIndexOpen = useExplorerStore((s) => s.setIndexOpen);

  return (
    <header className={ui.header}>
      <div className={ui.headerLeft}>
        <Link href={PRODUCT.satelliteEngineeringRoute} className={ui.backLink} aria-label="Back to Satellite Engineering">
          <ArrowLeft size={15} aria-hidden="true" />
          <span>Satellite Engineering</span>
        </Link>
        <span className={ui.headerRule} aria-hidden="true" />
        <h1 className={ui.headerTitle}>{PRODUCT.name}</h1>
      </div>

      {started && (
        <div className={ui.headerCenter}>
          <LearnEngineerToggle />
        </div>
      )}

      <div className={ui.headerRight}>
        {started && (
          <button
            type="button"
            className={ui.iconButton}
            aria-expanded={indexOpen}
            aria-controls="explorer-index"
            onClick={() => {
              setAboutOpen(false);
              setIndexOpen(!indexOpen);
            }}
          >
            <List size={15} aria-hidden="true" />
            <span>Components</span>
          </button>
        )}
        <button
          type="button"
          className={ui.iconButton}
          aria-expanded={aboutOpen}
          aria-controls="explorer-about"
          aria-label="About this experience: prepared by"
          onClick={() => {
            setHelpOpen(false);
            setIndexOpen(false);
            setAboutOpen(!aboutOpen);
          }}
        >
          <Info size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={ui.iconButton}
          aria-expanded={helpOpen}
          aria-controls="explorer-help"
          aria-label="Help: how to control the view"
          onClick={() => {
            setAboutOpen(false);
            setHelpOpen(!helpOpen);
          }}
        >
          <CircleHelp size={16} aria-hidden="true" />
        </button>
      </div>
      {aboutOpen && <AboutPanel onClose={closeAbout} />}
    </header>
  );
}
