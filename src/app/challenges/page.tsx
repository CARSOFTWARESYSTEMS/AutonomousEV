import TopicPage from "@/components/TopicPage";

export const metadata = {
  title: "AV Challenges | EV.ENGINEER™",
  description: "The technical, operation, regulatory, and social challenges hindering AV deployment.",
};

export default function ChallengesPage() {
  return (
    <TopicPage
      title="AV Deployment Challenges"
      subtitle="Understanding the systemic friction delaying widespread open-road autonomy."
      execSummary={
        <p>While the theoretical foundations of Autonomous Vehicles are solved, real-world scaling faces exponential difficulty. The challenge curve transitions from mapping simple routes to resolving infinite edge cases, social friction, and regulatory boundaries.</p>
      }
      whyItMatters={
        <p>Deploying a prototype is feasible; deploying a profitable, universally safe fleet is immensely difficult. Engineering leaders must maintain a clear-eyed view of what problems remain unsolved to accurately scope roadmaps.</p>
      }
      basics={
        <>
          <p><strong>Technical System Limits:</strong> Sensor degradation in heavy rain or fog, lack of generalization in ML models, and the massive compute requirements draining EV battery life.</p>
          <p><strong>Operational Challenges:</strong> Managing fleet maintenance, cleaning sensors constantly, and staffing Remote Assistance centers for instances where the AV gets "stuck."</p>
        </>
      }
      midLevel={
        <>
          <p><strong>Edge Cases & Weather:</strong> The final 1% of operational design domain constraints. Predicting the erratic behavior of humans (cyclists, jaywalkers) or adapting to changing physical geography (active construction zones blocking mapped lanes).</p>
        </>
      }
      advanced={
        <>
          <p><strong>Regulatory & Legal Challenges:</strong> Achieving type approval across fragmented jurisdictions. Defining legal liability frameworks when an unpreventable collision occurs involving a Level 4 system.</p>
          <p><strong>Social Challenges & Public Trust:</strong> Overcoming the inherent human distrust of automated machinery, fueled by highly publicized early failures. Resolving the friction entirely caused by human drivers attempting to "bully" cautious AV algorithms.</p>
        </>
      }
      keyTakeaways={
        <ul>
          <li>• The "Long Tail" of edge cases is the primary barrier to L5 autonomy.</li>
          <li>• Remote assistance is currently a requisite patch for lacking prediction models.</li>
          <li>• Public trust can be shattered in an instant, dictating the pace of regulatory approval.</li>
        </ul>
      }
    />
  );
}
