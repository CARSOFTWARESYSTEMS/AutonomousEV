import { STELLR_SPACE } from "@/data/space-host-brands";

/** The pages whose shared social card names ISHAVASYAM.ORG, so aerospace.stellrspace.com has its own (./og/[image]/route.tsx). */
export const STELLR_CARDS = ["academy", "cubesat", "everyday-applications", "model-rocketry"] as const;
export type StellrCard = (typeof STELLR_CARDS)[number];

export const stellrCardUrl = (card: StellrCard) => `${STELLR_SPACE.origin}/stellrspace-space/og/${card}.png`;
