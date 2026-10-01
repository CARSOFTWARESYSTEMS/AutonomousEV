import Link from "next/link";
import { ArrowLeft, CircleHelp, List } from "lucide-react";
import { PRODUCT } from "../data/satelliteReference";
import { useExplorerStore } from "../state/explorerStore";
import LearnEngineerToggle from "./LearnEngineerToggle";
import ui from "../explorer.module.css";

/** Minimal, translucent header. Holds the page's only H1. */
export default function ExplorerHeader() {
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
          <button type="button" className={ui.iconButton} aria-expanded={indexOpen} aria-controls="explorer-index" onClick={() => setIndexOpen(!indexOpen)}>
            <List size={15} aria-hidden="true" />
            <span>Components</span>
          </button>
        )}
        <button type="button" className={ui.iconButton} aria-expanded={helpOpen} aria-controls="explorer-help" aria-label="Help: how to control the view" onClick={() => setHelpOpen(!helpOpen)}>
          <CircleHelp size={16} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
