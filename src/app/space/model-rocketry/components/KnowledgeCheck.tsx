import styles from "../model-rocketry.module.css";

export default function KnowledgeCheck({ question, answer }: { question: string; answer: string }) {
  return (
    <details className={styles.knowledgeCheck}>
      <summary>Knowledge check: {question}</summary>
      <div>
        <p>{answer}</p>
      </div>
    </details>
  );
}
