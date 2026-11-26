// Pointer handlers that select and hover a registry component. Every
// selectable mesh carries its component id in userData, which the camera's
// framing and the highlight use to find it.
import type { ThreeEvent } from "@react-three/fiber";
import { useTwin } from "../state/store";

export function pick(id: string) {
  return {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (e.delta > 5) return;
      useTwin.getState().select(id);
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      useTwin.setState({ hovered: id });
    },
    onPointerOut: () => {
      if (useTwin.getState().hovered === id) useTwin.setState({ hovered: null });
    },
    userData: { component: id },
  };
}
