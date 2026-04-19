import TopicPage from "@/components/TopicPage";

export const metadata = {
  title: "AI-Powered EV Battery Fire Prevention System | EV.ENGINEER™",
  description:
    "Internship project: Design and develop an AI-powered system for real-time detection and prevention of EV battery fires using thermal imaging, predictive ML, and embedded safety circuits.",
};

export default function BatteryFirePreventionPage() {
  return (
    <TopicPage
      title="AI-Powered EV Battery Fire Prevention System"
      subtitle="An internship project focused on real-time thermal anomaly detection and predictive fire prevention in lithium-ion battery packs."
      execSummary={
        <p>
          Lithium-ion battery fires remain one of the most critical safety
          challenges in the EV industry. This internship project tasks
          candidates with designing an embedded AI system that monitors cell-level
          thermal data, detects early-stage thermal runaway signatures, and
          triggers automated safety interventions before ignition occurs.
        </p>
      }
      whyItMatters={
        <p>
          A single battery fire incident can cost an OEM billions in recalls and
          destroy public trust built over years. Proactive, AI-driven prevention
          is the next frontier — combining embedded ML inference, fail-safe
          circuit design, and real-time data pipelines into a unified safety
          architecture.
        </p>
      }
      basics={
        <>
          <p>
            <strong>Thermal Runaway Fundamentals:</strong> Understanding the
            chain reaction of internal short circuits, electrolyte decomposition,
            and heat generation inside lithium-ion cells.
          </p>
          <p>
            <strong>Sensor Architecture:</strong> Deploying a mesh of
            thermistors, voltage monitors, and IR cameras across the battery pack
            to create a real-time thermal map at cell resolution.
          </p>
        </>
      }
      midLevel={
        <>
          <p>
            <strong>ML Model Design:</strong> Training anomaly detection models
            (autoencoders, LSTM-based time-series classifiers) on thermal
            signatures to identify precursor patterns 60–120 seconds before
            critical thresholds are reached.
          </p>
          <p>
            <strong>Edge Inference:</strong> Deploying quantized models on
            microcontrollers (STM32 / Cortex-M series) for sub-millisecond
            latency safety decisions without cloud dependency.
          </p>
        </>
      }
      advanced={
        <>
          <p>
            <strong>Automated Safety Interventions:</strong> Designing
            hardware-triggered isolation circuits that disconnect faulty cell
            groups, activate venting systems, and send CAN-bus alerts to the
            vehicle BMS and telematics stack.
          </p>
          <p>
            <strong>Certification &amp; Standards:</strong> Aligning the system
            design with ISO 26262 functional safety (ASIL-D), UN ECE R100, and
            AIS-038 Rev 2 (India) requirements for battery safety.
          </p>
        </>
      }
      keyTakeaways={
        <ul>
          <li>• Thermal runaway prevention requires cell-level, millisecond-resolution sensing.</li>
          <li>• On-device ML inference is mandatory for fail-safe latency requirements.</li>
          <li>• Hardware isolation circuits must operate independently of software stacks.</li>
          <li>• Compliance with global safety standards is a non-negotiable deliverable.</li>
        </ul>
      }
    />
  );
}
