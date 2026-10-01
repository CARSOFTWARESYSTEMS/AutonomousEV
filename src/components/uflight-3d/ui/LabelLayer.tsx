// Interface side of the labels anchored to the scene: draws what the scene
// declared, in a layer over the canvas. The scene moves each element.
import { useSyncExternalStore } from "react";
import { type LabelEntry, labelSnapshot, setLabelElement, subscribeLabels } from "../../satellite-explorer/overlays/labelRegistry";
import ui from "../uflight.module.css";

const NO_LABELS: readonly LabelEntry[] = [];
const serverSnapshot = () => NO_LABELS;

export default function LabelLayer() {
  const labels = useSyncExternalStore(subscribeLabels, labelSnapshot, serverSnapshot);
  return (
    <div className={ui.labelLayer}>
      {labels.map(({ key, node, className, center }) => (
        <div key={key} className={ui.sceneLabel} ref={(element) => setLabelElement(key, element)}>
          <div className={className} data-center={center || undefined}>
            {node}
          </div>
        </div>
      ))}
    </div>
  );
}
