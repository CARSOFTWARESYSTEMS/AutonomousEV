import TopicPage from "@/components/TopicPage";

export const metadata = {
  title: "Driverless Car Technologies | EV.ENGINEER™",
  description: "Core technology stack of driverless vehicles including perception, planning, and redundant fail-operational systems.",
};

export default function DriverlessTechPage() {
  return (
    <TopicPage
      title="Driverless Car Technologies"
      subtitle="The specific software and hardware stacks enabling L4/L5 autonomy."
      execSummary={
        <p>Driverless Car Technologies encompass the entire pipelined architecture from localized environmental awareness to control execution, overlaid with stringent fail-operational redundancies necessary for driverless operations.</p>
      }
      whyItMatters={
        <p>Eliminating the human fallback means the system must handle all dynamic driving tasks and fallback performance. This requires an exponentially more rigorous approach to system architecture compared to standard ADAS.</p>
      }
      basics={
        <>
          <p><strong>Core Stack:</strong> Broken down into Perception (what is around me?), Localization (where am I?), Mapping (what is the persistent environment?), Planning (what should I do?), and Control (how do I do it?).</p>
          <p><strong>Communication Interfaces:</strong> Standardized messaging (like CAN, Ethernet) connecting the high-compute AV node to the low-level vehicle ECUs.</p>
        </>
      }
      midLevel={
        <>
          <p><strong>Localization & Mapping:</strong> Centimeter-level accuracy using HD Maps, SLAM (Simultaneous Localization and Mapping), and GNSS/IMU integration. Without human visual memory, the vehicle relies on prior maps compared against live sensor data.</p>
          <p><strong>Engineering Tradeoffs:</strong> Balancing compute latency vs. perception accuracy, or power consumption vs. sensor range.</p>
        </>
      }
      advanced={
        <>
          <p><strong>Redundant Systems & Fail-Operational Concepts:</strong> If the primary compute node fails, a secondary, dissimilar architecture must be able to securely execute a Minimum Risk Maneuver (MRM). This includes dual-power supplies, redundant steering, and braking ECUs.</p>
        </>
      }
      caseStories={
        <p>Real vehicle platforms, such as automated shuttles deployed in constrained environments, utilize stripped-down but highly localized HD maps, demonstrating that specific operational domains drastically reduce necessary compute overhead.</p>
      }
      keyTakeaways={
        <ul>
          <li>• True driverless tech mandates fail-operational hardware.</li>
          <li>• Localization must achieve centimeter certainty, often relying on HD maps.</li>
          <li>• Architecture must solve for severe timing and latency constraints.</li>
        </ul>
      }
    />
  );
}
