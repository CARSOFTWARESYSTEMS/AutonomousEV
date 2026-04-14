import TopicPage from "@/components/TopicPage";

export const metadata = {
  title: "Non-Technical Concepts | EV.ENGINEER™",
  description: "For directors and strategy teams: AV policy, regulations, insurance, ethics, and governance.",
};

export default function NonTechnicalConceptsPage() {
  return (
    <TopicPage
      title="Non-Technical Concepts"
      subtitle="Strategy, Governance, Ethics, and Deployment Readiness."
      execSummary={
        <p>The successful deployment of Autonomous Vehicles hinges equally on engineering perfection and robust governance. Policy, public acceptance, risk management, and the ethical decision-making frameworks of machines form the critical path to commercialization.</p>
      }
      whyItMatters={
        <p>A flawless technical stack cannot be deployed without certification, insurance structures, and societal trust. Leaders must navigate these complex domains to define viable business and operational models.</p>
      }
      basics={
        <>
          <p><strong>Policy & Regulations:</strong> The evolving frameworks governing testing vs. deployment on public roads.</p>
          <p><strong>Insurance and Liability:</strong> The shift from human-driver liability to product liability and software accountability in L4/L5 systems.</p>
        </>
      }
      midLevel={
        <>
          <p><strong>Ethics & Social Impact:</strong> How algorithms resolve unavoidable collision scenarios (Trolley Problem derivatives), and the broader implications for workforce displacement in transit and logistics.</p>
          <p><strong>Trust and Safety:</strong> Building public confidence through transparency, safety reports, and rigorous certification regimes.</p>
        </>
      }
      advanced={
        <>
          <p><strong>Governance & Risk Management:</strong> Strategies for continuous compliance, OTA update security policies, and managing fleet-wide incident investigations.</p>
          <p><strong>Procurement Mindset:</strong> Evaluating vendor lock-in, open vs. proprietary AV stacks, and the total cost of ownership for autonomous fleets vs human-operated units.</p>
        </>
      }
      regionRelevance={
        <p>In Singapore, AV governance is led extensively by regulatory clarity through bodies like LTA and testing frameworks at CETRAN. The clear delineation of operational domains provides a structured testbed for risk management in dense urban environments.</p>
      }
      keyTakeaways={
        <ul>
          <li>• Liability shifts from operator to system manufacturer.</li>
          <li>• Social trust is fragile and dictates the speed of regulatory approval.</li>
          <li>• Business deployment relies heavily on defined ODDs and robust insurance partnerships.</li>
        </ul>
      }
    />
  );
}
