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
    // AQIP has its own header and a themed footer, rendered by the page itself.
    pathname === "/internships/aerospace-quality-intelligence-platform";

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
