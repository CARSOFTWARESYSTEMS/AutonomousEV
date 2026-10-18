"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSelfContained =
    pathname === "/aerospace" ||
    pathname?.startsWith("/aerospace/") ||
    pathname === "/space" ||
    pathname?.startsWith("/space/") ||
    pathname === "/ishavasyam-space" ||
    // The profile is in the visual language of /space, with its own bar and foot.
    pathname === "/about/sudarshana-karkala" ||
    // AQIP has its own header and its own footer, rendered by the page itself.
    pathname === "/internships/aerospace-quality-intelligence-platform" ||
    // So does the EV Battery Health & Diagnostics Toolkit, in the Space visual family.
    pathname === "/internships/ev-battery-health-diagnostics-toolkit";

  if (isSelfContained) {
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
