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
    pathname?.startsWith("/space/");

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
