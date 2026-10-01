// Scene side of a projected label: an anchor in the scene graph, the content
// handed to the interface's label layer, and the per-frame projection.
import { useEffect, useId, useLayoutEffect, useRef } from "react";
import { addAfterEffect, useThree } from "@react-three/fiber";
import type { Group } from "three";
import { type LabelVisibility, projectLabels, removeLabel, removeLabelAnchor, setLabel, setLabelAnchor } from "./labelRegistry";

interface SceneLabelProps {
  children: React.ReactNode;
  position?: [number, number, number];
  className?: string;
  center?: boolean;
  /** Extra condition checked each frame, e.g. "not behind Earth". Must be a stable function. */
  visible?: LabelVisibility;
}

export default function SceneLabel({ children, position, className, center = false, visible }: SceneLabelProps) {
  const key = useId();
  const anchor = useRef<Group>(null);

  // Content may change on any render of the owner; pass the latest to the layer.
  useLayoutEffect(() => {
    setLabel({ key, node: children, className, center });
  });
  useLayoutEffect(() => () => removeLabel(key), [key]);

  useLayoutEffect(() => {
    if (anchor.current) setLabelAnchor(key, anchor.current, visible);
    return () => removeLabelAnchor(key);
  }, [key, visible]);

  return <group ref={anchor} position={position} />;
}

/**
 * Projects every label after each rendered frame, so labels never trail the
 * picture. `declutter` stacks labels that would otherwise be drawn over each other.
 */
export function LabelProjector({ declutter = false }: { declutter?: boolean }) {
  const get = useThree((state) => state.get);
  useEffect(
    () =>
      addAfterEffect(() => {
        const { camera, size } = get();
        projectLabels(camera, size.width, size.height, declutter);
      }),
    [get, declutter],
  );
  return null;
}
