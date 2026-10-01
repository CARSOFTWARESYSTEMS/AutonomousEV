"use client";
// Entry point. Decides which experience this device gets and mounts only
// that one: the three.js application is a separate chunk that is requested
// solely on a desktop-sized viewport with working WebGL.
import dynamic from "next/dynamic";
import { useEffect, useSyncExternalStore } from "react";
import { trackEvent } from "@/utils/analytics";
import { DESKTOP_MIN_WIDTH, DESKTOP_QUERY, type Experience, getWebGLSupport, resolveExperience } from "../satellite-explorer/lib/capabilities";
import MobileUFlight from "./MobileUFlight";
import LoadingScreen from "./ui/LoadingScreen";
import loading from "./ui/loading.module.css";

const DesktopUFlight = dynamic(() => import("./DesktopUFlight"), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

function subscribe(notify: () => void) {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener("change", notify);
  return () => mql.removeEventListener("change", notify);
}

function getSnapshot(): Experience {
  // WebGL is only probed on a desktop-sized viewport, so phones never create a context.
  const wide = window.matchMedia(DESKTOP_QUERY).matches;
  return resolveExperience({ width: wide ? DESKTOP_MIN_WIDTH : 0, webgl: wide && getWebGLSupport().supported });
}

/** The server cannot know the viewport, so it renders both, gated by CSS. */
const getServerSnapshot = (): Experience | "pending" => "pending";

export default function UFlightExplorer() {
  const experience = useSyncExternalStore<Experience | "pending">(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (experience === "mobile") trackEvent("uflight_3d_mobile_desktop_recommendation", { page_path: window.location.pathname });
  }, [experience]);

  if (experience === "desktop") return <DesktopUFlight />;

  // The overview page keeps its place in the tree from the server render onward,
  // so resolving the viewport on a phone does not remount it.
  const pending = experience === "pending";
  return (
    <>
      <div className={pending ? loading.pendingMobile : undefined}>
        <MobileUFlight variant={pending ? "mobile" : experience} />
      </div>
      {pending && (
        <div className={loading.pendingDesktop}>
          <LoadingScreen />
        </div>
      )}
    </>
  );
}
