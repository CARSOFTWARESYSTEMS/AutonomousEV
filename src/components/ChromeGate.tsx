"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

/** Pages that bring their own header and footer (the Space visual family and its neighbours). */
export function isSelfContainedPath(pathname: string | null): boolean {
  return (
    pathname === "/aerospace" ||
    pathname?.startsWith("/aerospace/") ||
    pathname === "/space" ||
    pathname?.startsWith("/space/") ||
    pathname === "/ishavasyam-space" ||
    // aerospace.gamyaa.in's /aerospace, rewritten here (next.config.ts).
    pathname === "/gamyaa-aerospace" ||
    // The profile is in the visual language of /space, with its own bar and foot.
    pathname === "/about/sudarshana-karkala" ||
    // AQIP has its own header and its own footer, rendered by the page itself.
    pathname === "/internships/aerospace-quality-intelligence-platform" ||
    // B2B Revenue Engineering draws its own header and footer on every page, in its own theme.
    pathname === "/internships/marketing-sales" ||
    pathname?.startsWith("/internships/marketing-sales/") === true ||
    // So does the EV Battery Health & Diagnostics Toolkit, in the Space visual family.
    pathname === "/internships/ev-battery-health-diagnostics-toolkit" ||
    pathname?.startsWith("/internships/ev-battery-health-diagnostics-toolkit/") === true
  );
}

export default function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isSelfContainedPath(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
