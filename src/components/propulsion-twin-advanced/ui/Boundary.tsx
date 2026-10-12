"use client";
// Keeps a failure inside the instrument it happened in. The instruments and the
// 3D view are separate downloads; if one cannot be fetched, or throws while it
// draws, the learner loses that instrument and nothing else: the text, the
// diagrams and every other module stay where they are.
import { Component, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import css from "../advancedTwin.module.css";

interface Props {
  /** What failed, as the start of a sentence: "This live instrument". */
  what: string;
  /** Shown beneath the message: what the instrument would have shown, in words. */
  children: ReactNode;
  fallback?: ReactNode;
}

export default class Boundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  // The error itself is not shown or reported: it names build files, not anything a learner can act on.
  render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    return (
      <div className={css.failure}>
        <div role="alert">
          <p>
            <strong>{this.props.what} could not be loaded.</strong> The rest of the tutorial is unaffected. This usually means the connection dropped, or the page was open while a new version was published.
          </p>
        </div>
        <button type="button" className={css.ghost} onClick={() => window.location.reload()}>
          <RotateCcw size={13} aria-hidden="true" /> Reload the page
        </button>
        {this.props.fallback}
      </div>
    );
  }
}
