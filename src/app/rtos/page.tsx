import TopicPage from "@/components/TopicPage";

export const metadata = {
  title: "RTOS for AV | EV.ENGINEER™",
  description: "Real-Time Operating Systems and deterministic execution in AV Stacks.",
};

export default function RTOSPage() {
  return (
    <TopicPage
      title="Real-Time Operating Systems for AV"
      subtitle="Deterministic execution at the core of driving automation."
      execSummary={
        <p>In Autonomous Vehicles, doing the right thing at the wrong time is catastrophic. Real-Time Operating Systems (RTOS) provide guaranteed, deterministic timing constraints for critical control loops.</p>
      }
      whyItMatters={
        <p>Standard operating systems (like Linux) prioritize throughput over predictability. An RTOS prioritizes strict deadlines. If an emergency brake command is generated, it must reach the ECU in milliseconds, unhindered by background scheduling.</p>
      }
      basics={
        <>
          <p><strong>RTOS Basics & Deterministic Execution:</strong> The fundamental rule of RTOS is predictability. The system guarantees that a critical task will complete within a specified hard deadline.</p>
          <p><strong>Latency Sensitivity:</strong> The AV stack relies on control loops running at high frequencies (e.g., 100Hz). Latency jitter can induce control instability.</p>
        </>
      }
      midLevel={
        <>
          <p><strong>Scheduling Concepts & Task Priorities:</strong> Preemptive scheduling ensures that high-priority safety tasks immediately interrupt lower-priority background tasks like logging or non-critical perception layers.</p>
          <p><strong>Embedded Control Relevance:</strong> Mapping high-level RTOS environments (like QNX or specialized real-time Linux variants) down to the embedded Microcontrollers running AUTOSAR Classic.</p>
        </>
      }
      advanced={
        <>
          <p><strong>Functional Safety Relevance (ISO 26262):</strong> Validating RTOS partition isolation to ensure that a failure in an infotainment or logging process cannot corrupt memory allocated to safety-critical steering applications.</p>
          <p><strong>ECU / Compute Partitioning:</strong> Implementing hypervisors to run safety-critical RTOS instances alongside general-purpose OS instances safely on unified AV compute domains.</p>
        </>
      }
      keyTakeaways={
        <ul>
          <li>• Predictability is more important than raw speed.</li>
          <li>• Proper task priority mapping is fundamentally tied to vehicle safety.</li>
          <li>• Modern AV architectures rely on isolated RTOS instances via hypervisors.</li>
        </ul>
      }
    />
  );
}
