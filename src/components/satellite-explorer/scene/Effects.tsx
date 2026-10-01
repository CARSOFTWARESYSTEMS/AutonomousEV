// Post-processing, kept restrained: a thin selection outline, a little bloom
// that only HDR signal pulses reach, anti-aliasing and filmic tone mapping.
// Skipped entirely on the low quality tier.
import { useMemo } from "react";
import { Bloom, EffectComposer, Outline, SMAA, ToneMapping } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import { useExplorerStore } from "../state/explorerStore";
import { partMeshes } from "../spacecraft/modelRegistry";

export default function Effects() {
  const enabled = useExplorerStore((s) => s.quality.postprocessing);
  const hovered = useExplorerStore((s) => s.hoveredComponent);
  const selected = useExplorerStore((s) => s.selectedComponent);

  // Outline the hovered and selected parts through the same effect: no cloned meshes.
  const selection = useMemo(() => {
    const ids = new Set([hovered, selected].filter((id): id is NonNullable<typeof id> => id !== null));
    return [...ids].flatMap((id) => partMeshes(id));
  }, [hovered, selected]);

  if (!enabled) return null;
  return (
    <EffectComposer multisampling={0} enableNormalPass={false} autoClear={false}>
      <Outline selection={selection} blendFunction={BlendFunction.SCREEN} edgeStrength={2.4} visibleEdgeColor={0xffffff} hiddenEdgeColor={0x7e8aa3} blur={false} xRay />
      <Bloom mipmapBlur luminanceThreshold={1.05} luminanceSmoothing={0.2} intensity={0.42} radius={0.6} />
      <SMAA />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
