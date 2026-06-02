import type { Metadata } from "next";
import CustomerDiscoveryToolkitContent from "./CustomerDiscoveryToolkitContent";

export const metadata: Metadata = {
  title: "Customer Discovery Toolkit — EV Battery Diagnostics & Health Intelligence | EV.ENGINEER™",
  description: "A structured, objective framework to execute productive, non-leading conversations with used EV dealers, fleet operators, service centers, and manufacturers. Dynamic survey question schemas powered by central JSON configuration.",
  keywords: [
    "Customer Discovery Toolkit",
    "EV Battery Diagnostics",
    "Used EV Dealer Questionnaire",
    "Fleet Operator Battery Health",
    "Battery Diagnostics Week 2",
    "Circular Economy Batteries",
    "Battery Pack Aadhaar",
    "Battery Diagnostics Interview",
    "EV Battery Lifecycle",
    "Thasmai Infotech",
    "Sudarshana Karkala"
  ],
  openGraph: {
    title: "Customer Discovery Toolkit — EV Battery Diagnostics & Health Intelligence | EV.ENGINEER™",
    description: "A structured, objective framework to execute productive, non-leading conversations with used EV dealers, fleet operators, service centers, and manufacturers.",
    type: "website",
    locale: "en_US",
    siteName: "EV.ENGINEER",
  },
  twitter: {
    card: "summary_large_image",
    title: "Customer Discovery Toolkit — EV Battery Diagnostics & Health Intelligence | EV.ENGINEER™",
    description: "A structured, objective framework to execute productive, non-leading conversations with used EV dealers, fleet operators, service centers, and manufacturers.",
  },
};

export default function CustomerDiscoveryToolkitPage() {
  return <CustomerDiscoveryToolkitContent />;
}
