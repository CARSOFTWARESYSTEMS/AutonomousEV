import TopicPage from "@/components/TopicPage";

export const metadata = {
  title: "USA AV Ecosystem | EV.ENGINEER™",
  description: "The fragmented but aggressive landscape of US autonomous vehicle deployments.",
};

export default function USAEcosystemPage() {
  return (
    <TopicPage
      title="USA AV Ecosystem"
      subtitle="The frontier of commercial Robotaxi deployment and software innovation."
      execSummary={
        <p>The United States operates as the primary proving ground for rapid, scale-focused autonomous deployments. Driven by massive venture capital and the presence of global tech leaders, the US ecosystem prioritizes aggressive iteration and public road miles over centralized, standard-first deployment.</p>
      }
      whyItMatters={
        <p>Most of the foundational software architectures, datasets, and commercial operational lessons (both successes and failures) hail from US deployments. Understanding this ecosystem is critical for grasping the outer bounds of what is currently technically possible.</p>
      }
      basics={
        <>
          <p><strong>Technology Leaders:</strong> Home to the most dominant players spanning full-stack autonomous software, specialized hardware (NVIDIA compute), and fleet operations (Waymo, Cruise, Zoox).</p>
          <p><strong>Pilot Programs & Deployments:</strong> Commercial Robotaxis operational in cities like Phoenix, San Francisco, and Austin, transitioning from safety-driver pilots to fully driverless consumer operations.</p>
        </>
      }
      midLevel={
        <>
          <p><strong>Regulatory Complexity:</strong> A deeply fragmented environment. While the federal government issues voluntary guidelines (NHTSA), individual states dictate public road testing legality. States like California impose heavy reporting requirements, while others like Texas offer near-zero friction for deployment.</p>
          <p><strong>Lessons Learned:</strong> High-profile incidents have proven that scaling Robotaxi operations introduces extreme edge cases specific to V2I (like interacting with unmapped construction zones) and crowd psychology (human trust and hostility towards AVs).</p>
        </>
      }
      keyTakeaways={
        <ul>
          <li>• The US ecosystem leads in raw AI innovation and commercial deployment scale.</li>
          <li>• Fragmented state-by-state regulation creates highly localized testing environments.</li>
          <li>• Incident learning from early US deployments globally informs next-generation safety architecture.</li>
        </ul>
      }
    />
  );
}
