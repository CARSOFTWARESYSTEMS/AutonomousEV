import TopicPage from "@/components/TopicPage";

export const metadata = {
  title: "Europe AV Ecosystem | EV.ENGINEER™",
  description: "The European landscape of autonomous safety regulations and cross-border logistics.",
};

export default function EuropeEcosystemPage() {
  return (
    <TopicPage
      title="Europe AV Ecosystem"
      subtitle="Standards-driven, safety-first autonomous mobility."
      execSummary={
        <p>Europe approaches autonomous mobility with a deeply entrenched culture of functional safety and rigorous regulatory standards. The ecosystem is driven by traditional OEM powerhouses transitioning to software-defined vehicles under strict UNECE guidelines.</p>
      }
      whyItMatters={
        <p>The European market values type-approval. Unlike the rapid "test and iterate" models seen elsewhere, Europe requires exhaustive validation before widespread deployment, shaping global ISO standards like ISO 26262 and SOTIF.</p>
      }
      basics={
        <>
          <p><strong>Regulatory & Safety Maturity:</strong> Compliance with UNECE regulations regarding ADAS (like ALKS - Automated Lane Keeping Systems) sets the baseline. Deep emphasis on cybersecurity (ISO/SAE 21434).</p>
          <p><strong>Structured Testing Culture:</strong> Vast networks of proving grounds, such as Aldenhoven Testing Center or HORIBA MIRA, facilitate highly controlled scenario certification.</p>
        </>
      }
      midLevel={
        <>
          <p><strong>Collaboration Models:</strong> Public-private partnerships (PPPs) heavily fund cross-border testing corridors. Projects involving 5G V2X are connecting highways across national borders to support automated trucking platoons.</p>
          <p><strong>Industrial & Logistics Relevance:</strong> High labor costs and driver shortages push heavy investment into autonomous freight operations and automated guided vehicles (AGVs) in ports (e.g., Rotterdam).</p>
        </>
      }
      keyTakeaways={
        <ul>
          <li>• Regulation and type-approval precede deployment.</li>
          <li>• Legacy OEMs dictate the pace of standard-setting.</li>
          <li>• Heavy emphasis on cross-border ITS and V2X synchronization.</li>
        </ul>
      }
    />
  );
}
