import { renderSpaceOgImage } from "../../../space/ogCard";
import { ACADEMY_CARD } from "../../../space/academy/og-card";
import { renderCubeTwinCard } from "../../../space/cubesat/og-card";
import { renderEverydayApplicationsCard } from "../../../space/everyday-applications/og-card";
import { renderModelRocketryCard } from "../../../space/model-rocketry/og-card";
import { STELLR_SPACE } from "@/data/space-host-brands";
import { STELLR_CARDS, type StellrCard } from "../../cards";

// aerospace.stellrspace.com's own social cards for the pages whose shared
// card names ISHAVASYAM.ORG: the same designs, with STELLR SPACE and this
// host's address. Plain PNGs at fixed URLs (/stellrspace-space/og/<name>.png),
// rendered once at build. Every other host keeps the shared cards.
export const dynamic = "force-static";
export const dynamicParams = false;

const HOST = new URL(STELLR_SPACE.origin).host;
const LAB = `${STELLR_SPACE.name} · SPACE LEARNING LAB`;

const RENDER: Record<StellrCard, () => Response> = {
  academy: () => renderSpaceOgImage(`${HOST}/space/academy`, ACADEMY_CARD.title, ACADEMY_CARD.subtitle, STELLR_SPACE.name),
  cubesat: () => renderCubeTwinCard(LAB, `${HOST}/space/cubesat`),
  "everyday-applications": () => renderEverydayApplicationsCard(LAB, `${HOST}/space/everyday-applications`),
  "model-rocketry": () => renderModelRocketryCard(LAB, `${HOST}/space/model-rocketry`),
};

export function generateStaticParams() {
  return STELLR_CARDS.map((card) => ({ image: `${card}.png` }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ image: string }> }) {
  const { image } = await params;
  const card = image.replace(/\.png$/, "") as StellrCard;
  return RENDER[card]();
}
