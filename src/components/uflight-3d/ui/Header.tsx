import Link from "next/link";
import { ArrowLeft, CircleHelp, Info } from "lucide-react";
import { AIRCRAFT, PRODUCT } from "../data/uflightReferenceAircraft";
import { useUFlightStore } from "../state/uflightStore";
import { VehicleBadge } from "./common";
import ExecutiveEngineerToggle from "./ExecutiveEngineerToggle";
import ui from "../uflight.module.css";

/** Minimal, translucent header. Holds the page's only H1 and the vehicle-level state. */
export default function Header() {
  const started = useUFlightStore((s) => s.started);
  const helpOpen = useUFlightStore((s) => s.helpOpen);
  const setHelpOpen = useUFlightStore((s) => s.setHelpOpen);
  const aboutOpen = useUFlightStore((s) => s.aboutOpen);
  const setAboutOpen = useUFlightStore((s) => s.setAboutOpen);
  const vehicleState = useUFlightStore((s) => s.vehicleState);

  return (
    <header className={ui.header}>
      <div className={ui.headerLeft}>
        <Link href={PRODUCT.homeRoute} className={ui.backLink} aria-label={`Back to ${PRODUCT.homeLabel}`}>
          <ArrowLeft size={15} aria-hidden="true" />
          <span>{PRODUCT.homeLabel}</span>
        </Link>
        <span className={ui.headerRule} aria-hidden="true" />
        <h1 className={ui.headerTitle}>{PRODUCT.wordmark}</h1>
      </div>

      {started && (
        <div className={ui.headerCenter}>
          <ExecutiveEngineerToggle />
        </div>
      )}

      <div className={ui.headerRight}>
        {started && (
          <p className={ui.vehicle} role="status" aria-label={`Aircraft ${AIRCRAFT.tail} status`} data-testid="vehicle-state">
            <span className={ui.vehicleTail}>{AIRCRAFT.tail}</span>
            <VehicleBadge state={vehicleState} />
          </p>
        )}
        <button type="button" className={ui.iconButton} aria-expanded={aboutOpen} aria-controls="uflight-about" aria-label="About this experience: prepared by" onClick={() => setAboutOpen(!aboutOpen)}>
          <Info size={16} aria-hidden="true" />
        </button>
        <button type="button" className={ui.iconButton} aria-expanded={helpOpen} aria-controls="uflight-help" aria-label="Help: how to control the view" onClick={() => setHelpOpen(!helpOpen)}>
          <CircleHelp size={16} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
