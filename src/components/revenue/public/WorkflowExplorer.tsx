"use client";
// The customer's work before our software: seven stages from drawing to
// approval. Each reveals what happens, what to ask and the pain that might
// exist — always tagged as a hypothesis to validate with the customer.
import { HYPOTHESIS_TAG, WORKFLOW } from "../data/steps";
import SignalFlow from "../ui/SignalFlow";
import css from "../site.module.css";

const STAGES = WORKFLOW.map((stage) => ({ name: stage.name }));

export default function WorkflowExplorer() {
  return (
    <SignalFlow
      id="fai-workflow"
      label="The customer's FAI workflow"
      stages={STAGES}
      hints={false}
      detail={(index) => {
        const stage = WORKFLOW[index];
        return (
          <dl className={css.workflowDetail}>
            <div>
              <dt>What happens here?</dt>
              <dd>{stage.what}</dd>
            </div>
            <div>
              <dt>What should we ask?</dt>
              <dd>
                <ul className={css.askList}>
                  {stage.ask.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt>What pain might exist?</dt>
              <dd>
                <span className={css.painLine}>{stage.pain}</span>
                <span className={css.hypothesisTag}>{HYPOTHESIS_TAG}</span>
              </dd>
            </div>
          </dl>
        );
      }}
    />
  );
}
