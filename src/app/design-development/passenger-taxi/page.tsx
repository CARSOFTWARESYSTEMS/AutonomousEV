import TopicPage from "@/components/TopicPage";

export const metadata = {
  title: "Autonomous Passenger Taxi | EV.ENGINEER™",
  description: "End-to-end engineering lifecycle for an urban Autonomous Passenger Taxi.",
};

export default function PassengerTaxiPage() {
  return (
    <TopicPage
      title="Autonomous Passenger Taxi"
      subtitle="Engineering for the chaos of open urban operational domains."
      execSummary={
        <p>The Autonomous Passenger Taxi (Robotaxi) represents the most complex deployment of L4 autonomy. It requires navigating unpredictable urban environments, interacting seamlessly with smart city infrastructure, and prioritizing human safety above all else.</p>
      }
      whyItMatters={
        <p>Designing a robotaxi isn't just about the software stack; it's about fleet operations, EV charging integration (duty cycles), incident response, and regulatory compliance. The total system architecture must account for all edge cases while maintaining operational uptime.</p>
      }
      basics={
        <>
          <p><strong>1. Product Definition & Planning:</strong> Defining the Operational Design Domain (ODD)—e.g., geofenced city center, speeds under 50km/h, daytime operations. <strong>2. Feasibility Study:</strong> Regulatory approval timelines, insurance costs, and sensor suite pricing (LiDAR + Radar + Camera + Compute).</p>
          <p><strong>3. System Analysis & Challenges:</strong> Unpredictable pedestrian behavior, adverse weather, sensor occlusion, and cybersecurity risks of remote takeover operations.</p>
        </>
      }
      midLevel={
        <>
          <p><strong>4. Architectural Design:</strong> Structuring the fail-operational hierarchy. If the primary compute node fails, the secondary system (e.g., redundant ECU running parallel) must execute a Minimum Risk Maneuver (pull over safely).</p>
          <p><strong>5. EV Battery & Charging:</strong> Sizing the battery not just for the powertrain, but for the massive continuous compute overhead (often drawing 2-4kW continuously for the autonomy stack).</p>
        </>
      }
      advanced={
        <>
          <p><strong>6. Development & ITS Integration:</strong> Building the software stack with ROS 2 and Autoware. Integrating V2X communications to interface with smart traffic lights and emergency vehicles.</p>
          <p><strong>7. Testing & Deployment:</strong> Shadow-mode driving (human drives, AI runs passively), simulation regression across millions of miles, closed-track validation, and finally, restricted public deployment.</p>
        </>
      }
      regionRelevance={
        <p>In Singapore, AV deployments such as Punggol shuttles and various NTU testbeds provide a regulatory framework managed by LTA. Certification at CETRAN is a mandatory precursor to any public road access involving passenger transport.</p>
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
