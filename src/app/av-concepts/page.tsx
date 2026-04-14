import TopicPage from "@/components/TopicPage";

export const metadata = {
  title: "AV Concepts | EV.ENGINEER™",
  description: "High-level introduction to autonomous vehicles, SAE levels, and their global trajectory.",
};

export default function AVConceptsPage() {
  return (
    <TopicPage
      title="Autonomous Vehicle Concepts"
      subtitle="The structural foundation of autonomous mobility."
      execSummary={
        <p>Autonomous Vehicles (AVs) shift the paradigm from human-centric driving to machine-led perception and decision-making. At its core, an AV relies on sensors, compute, and AI to navigate dynamic environments without human intervention.</p>
      }
      whyItMatters={
        <p>The integration of autonomous systems into electric vehicle (EV) platforms creates compounding advantages. AVs require precise, robust control systems to steer and brake safely, and EV platforms—with their native drive-by-wire and integrated telemetry—are inherently designed for software-led control.</p>
      }
      basics={
        <>
          <p><strong>What AV means:</strong> Moving beyond "cruise control" to systems that perceive the environment, predict actions, and plan paths dynamically.</p>
          <p><strong>SAE Levels of Automation:</strong> Ranging from Level 0 (no automation) to Level 5 (full automation anywhere, anytime). Most commercial operations currently operate between Level 2 (ADAS) and Level 4 (Geofenced full autonomy like Robotaxis).</p>
        </>
      }
      regionRelevance={
        <p>Globally, AVs are defining the next iteration of transit. In Singapore, focused policies support fixed-route shuttles and closed-loop logistics platforms, driving the shift toward structured autonomy.</p>
      }
      keyTakeaways={
        <ul>
          <li>• AVs replace human perception with sensor fusion (LiDAR, radar, cameras).</li>
          <li>• The true complexity lies in decision-making and edge cases, not just perception.</li>
          <li>• EVs provide the required power architecture and drive-by-wire precision native to AV stacks.</li>
        </ul>
      }
    />
  );
}
