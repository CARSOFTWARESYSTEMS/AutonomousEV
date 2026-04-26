import StartupContent from "./StartupContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EV Startup - Building Organisational Structure | EV.ENGINEER™",
  description: "Learn the 7 fundamental activities and 3 key changes to build a stable and successful EV business that can grow independently.",
};

export default function StartupPage() {
  return <StartupContent />;
}
