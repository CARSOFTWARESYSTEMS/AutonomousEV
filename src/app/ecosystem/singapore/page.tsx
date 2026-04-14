import TopicPage from "@/components/TopicPage";

export const metadata = {
  title: "Singapore AV Ecosystem | EV.ENGINEER™",
  description: "Explore the Smart Nation direction, CETRAN scenario testing, and LTA policies shaping Singapore's AV landscape.",
};

export default function SingaporeEcosystemPage() {
  return (
    <TopicPage
      title="Singapore AV Ecosystem"
      subtitle="The gold standard for regulated, structured autonomy integration."
      execSummary={
        <p>Singapore represents one of the most mature AV policy environments in the world. Backed by the Smart Nation initiative, the city-state is systematically building the digital and physical infrastructure required to seamlessly integrate AV shuttles, buses, and logistics fleets into its dense urban fabric.</p>
      }
      whyItMatters={
        <p>Because of its constrained geography and proactive government, Singapore serves as the ultimate "living lab". If an autonomous architecture can pass the stringent safety and certification requirements here, it demonstrates a production-grade level of reliability that translates globally.</p>
      }
      basics={
        <>
          <p><strong>Smart Nation Direction:</strong> AVs are seen not as a novelty, but as a critical solution to an aging workforce and constrained land space for roads and parking.</p>
          <p><strong>LTA Relevance:</strong> The Land Transport Authority aggressively updates the TR 68 (Technical Reference for Autonomous Vehicles) guidelines, providing a clear roadmap for software compliance.</p>
        </>
      }
      midLevel={
        <>
          <p><strong>Pilots and Initiatives:</strong></p>
          <ul>
            <li style={{marginBottom: "8px"}}>• NTU Testbeds: Academic and industry collaboration for early-stage testing.</li>
            <li style={{marginBottom: "8px"}}>• Punggol & Tengah Shuttles: First and last-mile connectivity deployments.</li>
            <li style={{marginBottom: "8px"}}>• Jurong Island Cargo: Automating heavy logistics in dedicated industrial zones.</li>
          </ul>
        </>
      }
      advanced={
        <div style={{ padding: "24px", background: "rgba(17, 240, 87, 0.05)", border: "1px solid var(--color-accent)", borderRadius: "var(--radius-md)" }}>
          <h3 style={{ color: "var(--color-accent)", fontSize: "1.4rem", marginBottom: "16px" }}>CETRAN (Centre of Excellence for Testing & Research of AVs)</h3>
          <p style={{ marginBottom: "16px" }}>CETRAN is the linchpin of Singapore's AV deployment confidence. Located at NTU, it features a 2-hectare test circuit that replicates Singapore's road conditions, complete with traffic rules, bus stops, pedestrian crossings, and rain simulators.</p>
          
          <h4 style={{ color: "var(--color-text-primary)", marginBottom: "8px" }}>Why it matters:</h4>
          <p style={{ marginBottom: "16px" }}>You cannot test on public roads in Singapore without passing CETRAN milestones. It enforces <strong>Scenario-based testing</strong>. Instead of just proving the AI works most of the time, developers must prove the AI handles specific, adversarial Edge Cases defined by regulators.</p>
          
          <h4 style={{ color: "var(--color-text-primary)", marginBottom: "8px" }}>Safety Validation Role:</h4>
          <p>CETRAN bridges the gap between simulation validation and public road deployment. It acts as the final physical exam for an AV stack, ensuring deployment confidence for operators and the public.</p>
        </div>
      }
      keyTakeaways={
        <ul>
          <li>• Government orchestration (LTA/CETRAN) creates a predictable deployment roadmap.</li>
          <li>• Scenario-based certification is mandatory for public road testing.</li>
          <li>• The focus is heavily on public transit integration and port logistics, rather than individual ownership.</li>
        </ul>
      }
    />
  );
}
