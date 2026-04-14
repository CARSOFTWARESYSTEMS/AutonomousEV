import TopicPage from "@/components/TopicPage";

export const metadata = {
  title: "India AV Ecosystem | EV.ENGINEER™",
  description: "Exploring the challenges and opportunities of AV technology in India.",
};

export default function IndiaEcosystemPage() {
  return (
    <TopicPage
      title="India AV Ecosystem"
      subtitle="Navigating unstructured environments and high-chaos mobility."
      execSummary={
        <p>The Indian AV ecosystem is nascent but accelerating. Characterized by highly complex, unstructured traffic environments and diverse road infrastructure, India presents the ultimate edge-case challenge for perception AI.</p>
      }
      whyItMatters={
        <p>If an autonomy stack can reliably navigate the chaos of an Indian urban center, it can likely navigate anywhere. The focus in India is currently shifting towards ADAS integration, closed-loop industrial automation, and smart agriculture rather than L5 Robotaxis.</p>
      }
      basics={
        <>
          <p><strong>State of Adoption:</strong> Commercial focus is primarily on Level 1 and Level 2 ADAS across passenger cars. Fully autonomous systems are restricted to research campuses and mining operations.</p>
          <p><strong>Regulatory & Infrastructure Constraints:</strong> The lack of explicit AV legislation and standardized road markings creates massive hurdles for HD mapping and lane-keeping neural networks.</p>
        </>
      }
      midLevel={
        <>
          <p><strong>Urban Complexity:</strong> Mixed-modal traffic (cars, 2-wheelers, auto-rickshaws, pedestrians, and animals) breaks Western-trained prediction models. India forces the development of more robust, heuristic-ignoring deep learning architectures.</p>
          <p><strong>ITS and Logistics Relevance:</strong> The real opportunity lies in long-haul highway trucking and port logistics. Automating the closed-loop environments of massive freight corridors bypasses the urban complexity problem.</p>
        </>
      }
      regionRelevance={
        <p>As India aggressively pushes for EV adoption, the underlying telematics and drive-by-wire capability are being established. Indian deep-tech startups are uniquely positioned to build the "brain" for high-chaos environments, exporting robust perception models to European and American OEMs.</p>
      }
      keyTakeaways={
        <ul>
          <li>• Data collected in Indian traffic provides the ultimate stress-test for prediction AI.</li>
          <li>• Initial deployments will focus on ADAS and closed-loop logistics, not urban Robotaxis.</li>
          <li>• The EV transition is laying the hardware groundwork for future autonomy.</li>
        </ul>
      }
    />
  );
}
