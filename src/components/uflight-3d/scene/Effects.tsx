// Post-processing, kept restrained: a thin selection outline, a little bloom
// that only the travelling pulses and lights reach, anti-aliasing and filmic
// tone mapping. No chromatic aberration, lens dirt or glow on the aircraft.
// Skipped entirely on the low quality tier.
import { useMemo } from "react";
import { Bloom, EffectComposer, Outline, SMAA, ToneMapping } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import { partMeshes } from "../aircraft/modelRegistry";
import { useUFlightStore } from "../state/uflightStore";

export default function Effects() {
  const enabled = useUFlightStore((s) => s.quality.postprocessing);
  const hovered = useUFlightStore((s) => s.hoveredComponent);
  const selected = useUFlightStore((s) => s.selectedComponent);

  // Outline the hovered and selected components through the same effect: no cloned meshes.
  const selection = useMemo(() => {
    const ids = new Set([hovered, selected].filter((id): id is NonNullable<typeof id> => id !== null));
    return [...ids].flatMap((id) => partMeshes(id));
  }, [hovered, selected]);

  if (!enabled) return null;
  return (
    <EffectComposer multisampling={0} enableNormalPass={false} autoClear={false}>
      <Outline selection={selection} blendFunction={BlendFunction.SCREEN} edgeStrength={2.2} visibleEdgeColor={0xffffff} hiddenEdgeColor={0x7e8aa3} blur={false} xRay />
      <Bloom mipmapBlur luminanceThreshold={1.05} luminanceSmoothing={0.2} intensity={0.4} radius={0.6} />
      <SMAA />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
