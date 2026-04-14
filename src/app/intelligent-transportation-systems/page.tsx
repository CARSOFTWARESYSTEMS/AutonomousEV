import TopicPage from "@/components/TopicPage";

export const metadata = {
  title: "Intelligent Transportation Systems | EV.ENGINEER™",
  description: "V2X, smart roads, and traffic orchestration for Autonomous capabilities.",
};

export default function ITSPage() {
  return (
    <TopicPage
      title="Intelligent Transportation Systems"
      subtitle="Integrating vehicles into the broader smart infrastructure."
      execSummary={
        <p>Intelligent Transportation Systems (ITS) allow AVs to extend their perception beyond line-of-sight. By interacting with smart roads, infrastructure, and other vehicles, the entire traffic network becomes an orchestrated system.</p>
      }
      whyItMatters={
        <p>Standalone AVs are inherently limited by their localized sensors. V2X (Vehicle-to-Everything) connectivity allows for optimized traffic flows, predictive safety warnings, and coordinated fleet movement, directly improving efficiency in logistics corridors.</p>
      }
      basics={
        <>
          <p><strong>ITS Fundamentals & Smart Roads:</strong> Infrastructure fitted with communication modules (RSUs - Roadside Units) that broadcast traffic light signal phases, road closures, and localized dynamic mapping updates.</p>
          <p><strong>V2X (Vehicle-to-Everything):</strong> Low latency communication passing intents between vehicles (V2V) or infrastructure (V2I).</p>
        </>
      }
      midLevel={
        <>
          <p><strong>Traffic Orchestration:</strong> Moving away from individualized routing towards fleet-wide optimization, drastically reducing urban congestion.</p>
          <p><strong>Public Transport & Logistics:</strong> Synchronizing cargo shuttles at airports or ports with cargo handling systems through a unified ITS back-end.</p>
        </>
      }
      regionRelevance={
        <p>Singapore represents a pinnacle of ITS implementation. The Smart Nation initiative aggressively incorporates smart mobility, integrating widespread roadside sensors, dynamic tolling, and connected intersections that seamlessly support future AV testing and scaling.</p>
      }
      keyTakeaways={
        <ul>
          <li>• V2X extends AV perception beyond line of sight.</li>
          <li>• Fleet coordination via ITS prevents emergent congestion issues.</li>
          <li>• Singapore's infrastructure provides a ready-made testbed for connected AV integration.</li>
        </ul>
      }
    />
  );
}
