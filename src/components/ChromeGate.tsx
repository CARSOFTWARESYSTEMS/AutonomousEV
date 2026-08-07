"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAerospace = pathname === "/aerospace" || pathname?.startsWith("/aerospace/");

  if (isAerospace) {
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
