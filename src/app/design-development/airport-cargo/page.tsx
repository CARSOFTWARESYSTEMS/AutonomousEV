import TopicPage from "@/components/TopicPage";

export const metadata = {
  title: "Autonomous Airport Cargo EV | EV.ENGINEER™",
  description: "End-to-end engineering lifecycle for closed-loop autonomous airport logistics.",
};

export default function AirportCargoPage() {
  return (
    <TopicPage
      title="Autonomous Airport Cargo EV"
      subtitle="Structured automation for high-speed logistics and ground support."
      execSummary={
        <p>Unlike urban robotaxis, airport cargo EVs operate in highly structured, closed-loop environments. This reduces the complexity of the perception stack but heavily emphasizes rigorous adherence to workflow, geofencing, and extreme operational reliability.</p>
      }
      whyItMatters={
        <p>Airport operations face intense pressure for efficiency. Ground support delays cascade into flight delays. Automating cargo tugs guarantees predictable turnaround times, provided the system can seamlessly integrate with the airport's fleet management architecture.</p>
      }
      basics={
        <>
          <p><strong>1. Product Definition & Planning:</strong> Designing an electric tug capable of Level 4 autonomy specifically constrained to airport tarmac lanes, baggage areas, and cargo depots.</p>
          <p><strong>2. Feasibility Study:</strong> Analyzing the ROI of eliminating shift-work drivers against the upfront CAPEX of sensors and retrofits. Mapping the specific safety zones and no-go areas around aircraft.</p>
        </>
      }
      midLevel={
        <>
          <p><strong>3. System Analysis & Challenges:</strong> The primary challenge is not navigation, but integration with logic—when to hitch, when to drop, and how to interface with Ground Support Equipment (GSE) standards.</p>
          <p><strong>4. Architectural Design & Geofencing:</strong> Establishing strict virtual boundaries using RTK-GPS (Real-Time Kinematic) for centimeter precision. The perception stack is optimized for detecting specific obstacles like planes, fuel trucks, and ground personnel in high-vis vests.</p>
        </>
      }
      advanced={
        <>
          <p><strong>5. Development & Operations Monitoring:</strong> Developing APIs to interface the EV telemetry directly with airport cargo manifesting databases. Fleet health monitoring relies on EV battery diagnostics to ensure an autonomous tug never runs out of charge while hauling cargo mid-tarmac.</p>
          <p><strong>6. Testing & Deployment:</strong> Simulated routing against airport maps (OpenDRIVE). Phased deployment starting during low-volume night shifts before scaling to peak operation hours.</p>
        </>
      }
      regionRelevance={
        <p>Changi Airport continually explores automation for baggage handling and cargo transit. Singapore's proactive stance on smart logistics makes it an ideal testing ground for structured-domain autonomous operations.</p>
      }
      keyTakeaways={
        <ul>
          <li>• Closed-loop environments allow for rapid AV deployment timelines.</li>
          <li>• RTK-GPS and strict geofencing are more critical here than generalized perception AI.</li>
          <li>• Integration with legacy airport IT systems is often the primary bottleneck.</li>
        </ul>
      }
    />
  );
}
