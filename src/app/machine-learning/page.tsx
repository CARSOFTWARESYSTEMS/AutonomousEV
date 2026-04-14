import TopicPage from "@/components/TopicPage";

export const metadata = {
  title: "Machine Learning & AI in AV | EV.ENGINEER™",
  description: "The role of AI perception models, prediction, and edge cases in autonomous mobility.",
};

export default function MachineLearningPage() {
  return (
    <TopicPage
      title="Machine Learning & AI"
      subtitle="From object detection to behavioral prediction."
      execSummary={
        <p>Artificial Intelligence bridges the gap between raw data collection and contextual understanding. ML models digest high-dimensional sensor data to recognize complex scenes, predict agent behaviors, and sometimes, guide end-to-end driving inputs.</p>
      }
      whyItMatters={
        <p>Traditional heuristics and rule-based programming fail universally in the dynamic chaos of mixed-traffic. ML provides the necessary generalization capability to handle unstructured driving environments.</p>
      }
      basics={
        <>
          <p><strong>Role of AI:</strong> Specifically utilized in perception (identifying "what" is there) and prediction (guessing "where" it will go).</p>
          <p><strong>Perception Models:</strong> Classification, object detection (bounding boxes), semantic segmentation, and lane detection using Convolutional Neural Networks (CNNs) and Vision Transformers.</p>
        </>
      }
      midLevel={
        <>
          <p><strong>Prediction & Planning Assistance:</strong> Utilizing Recurrent architectures or graph-based models to predict the future state of dynamic actors (like pedestrians and erratic drivers) to inform safe motion planning.</p>
          <p><strong>Data Challenges & Bias:</strong> Models are only as good as their training distribution. Heavily skewed data (e.g., mostly sunny highway driving) leads to catastrophic failures in unrepresented conditions (snow, heavy rain, specific geographies).</p>
        </>
      }
      advanced={
        <>
          <p><strong>Simulation Data vs Real-World Data:</strong> The "sim-to-real" gap. Training models on procedurally generated synthetic synthetic data is highly efficient, but requires domain adaptation techniques to accurately transfer inferences to real-world edge cases.</p>
          <p><strong>Engineering Workflow:</strong> Managing the CI/CD pipeline of AI models (MLOps). Active learning loops that automatically mine fleet telemetry for rare edge cases to continuously retrain and redeploy perception models.</p>
        </>
      }
      keyTakeaways={
        <ul>
          <li>• AI excels in perception, though rule-based safety wrappers often govern the final control plane.</li>
          <li>• Long-tail edge cases (the 1% of bizarre driving situations) consume 99% of AI engineering effort.</li>
          <li>• MLOps and efficient data-mining infrastructure define competitive advantage in AV.</li>
        </ul>
      }
    />
  );
}
