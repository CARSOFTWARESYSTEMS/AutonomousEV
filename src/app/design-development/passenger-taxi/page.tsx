import TopicPage from "@/components/TopicPage";

export const metadata = {
  title: "Autonomous Air Taxi (eVTOL) | EV.ENGINEER™",
  description: "End-to-end engineering lifecycle for an urban Autonomous Air Taxi (eVTOL).",
};

export default function PassengerTaxiPage() {
  return (
    <TopicPage
      title="Autonomous Air Taxi (eVTOL)"
      subtitle="Engineering for the vertical dimensions of urban operational domains."
      execSummary={
        <p>The Autonomous Air Taxi (eVTOL) represents the most complex deployment of L3/L4 aerial autonomy. It requires navigating unpredictable urban airspace, interacting seamlessly with smart aviation infrastructure, and prioritizing passenger safety above all else.</p>
      }
      whyItMatters={
        <p>Designing an air taxi isn't just about the software stack; it's about fleet operations, EV charging integration (duty cycles), incident response, and regulatory compliance. The total system architecture must account for all edge cases while maintaining operational uptime.</p>
      }
      basics={
        <>
          <p><strong>1. Product Definition & Planning:</strong> Defining the Operational Design Domain (ODD)—e.g., geofenced city airspace, altitudes under 500m, daytime operations. <strong>2. Feasibility Study:</strong> Regulatory approval timelines (CAAS/EASA), insurance costs, and sensor suite pricing (LiDAR + Radar + Camera + Flight Computer).</p>
          <p><strong>3. System Analysis & Challenges:</strong> Unpredictable weather conditions, bird strikes, battery energy density constraints, and cybersecurity risks of remote flight operations.</p>
        </>
      }
      midLevel={
        <>
          <p><strong>4. Architectural Design:</strong> Structuring the fail-operational hierarchy. If the primary flight computer fails, the secondary system (e.g., redundant FCU running parallel) must execute a safe emergency landing or return-to-base.</p>
          <p><strong>5. EV Battery & Charging:</strong> Sizing the battery for high-power discharge during take-off and landing, while accounting for the massive continuous compute overhead of the autonomy stack.</p>
        </>
      }
      advanced={
        <>
          <p><strong>6. Development & ATM Integration:</strong> Building the software stack with ROS 2 and custom flight control algorithms. Integrating V2X/V2V communications to interface with Air Traffic Management (ATM) and other aerial vehicles.</p>
          <p><strong>7. Testing & Deployment:</strong> Tethered flight tests, simulation regression across millions of virtual flight hours, closed-range validation, and finally, restricted public trials.</p>
        </>
      }
      regionRelevance={
        <p>In Singapore, UAM deployments such as Volocopter test flights and CAAS regulatory sandboxes provide a framework for future operations. Certification for vertiports and aerial corridors is a mandatory precursor to any public access involving passenger transport.</p>
      }
      keyTakeaways={
        <ul>
          <li>• The ODD dictates the entire hardware architecture.</li>
          <li>• Compute overhead significantly impacts EV battery range.</li>
          <li>• Remote assistance is a necessary fallback for edge cases the AI cannot resolve.</li>
        </ul>
      }
    />
  );
}
