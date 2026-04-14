import TopicPage from "@/components/TopicPage";

export const metadata = {
  title: "Technical Concepts | EV.ENGINEER™",
  description: "Engineering-grade technical concepts for autonomous vehicles, covering sensors, perception, and control systems.",
};

export default function TechnicalConceptsPage() {
  return (
    <TopicPage
      title="Technical System Concepts"
      subtitle="Deep-dive into the autonomy stack, sensor architecture, and validation workflows."
      execSummary={
        <p>The AV technical stack is an intricate integration of hardware sensors, real-time perception models, predictive planning pipelines, and robust validation against an infinite state-space of edge cases.</p>
      }
      whyItMatters={
        <p>Building an AV requires deterministic performance. Knowing how to fuse LiDAR point clouds with camera pixels while maintaining functional safety guarantees is what separates prototyping from production engineering.</p>
      }
      basics={
        <>
          <p><strong>Sensors:</strong> The physical "eyes" of the vehicle. LiDAR (depth and shape), Radar (velocity and poor weather), Cameras (color and context).</p>
          <p><strong>Sensor Fusion:</strong> Combining disparate data streams to create a reliable, high-fidelity 3D representation of the environment, mitigating individual sensor blind spots.</p>
          <p><strong>Control Systems:</strong> Actuating steering, acceleration, and braking based on the planned path, requiring precise tuning and latency management.</p>
        </>
      }
      midLevel={
        <>
          <p><strong>Perception & Planning:</strong> Transforming raw sensor data into labeled objects with predicted trajectories. The planning module then computes a safe path, adhering to traffic logic and comfort constraints.</p>
          <p><strong>Architecture Overview:</strong> The standard pipeline flows from Sensor Input → Perception/Localization → Prediction → Motion Planning → Vehicle Control.</p>
        </>
      }
      advanced={
        <>
          <p><strong>Edge Cases and ODD:</strong> Handling the Operational Design Domain constraints. What happens when a sensor degrades? How does the vehicle fail-safe or fail-operational?</p>
          <p><strong>Validation Concepts:</strong> Moving from statistical MTBF to Coverage-Driven Verification. Utilizing massive simulation regression testing across parameter variations.</p>
        </>
      }
      simulationArchitecture={
        <p>Simulation is the primary engine for validation. By generating synthetic data for edge cases that are too dangerous to test in reality, engineers validate perception stacks and control boundaries iteratively.</p>
      }
      keyTakeaways={
        <ul>
          <li>• Heterogeneous sensor suites enable robustness through redundancy.</li>
          <li>• Latency across the perception-to-actuation pipeline must be predictable and bounded.</li>
          <li>• System validation relies heavily on parameterized scenarios in simulation.</li>
        </ul>
      }
    />
  );
}
