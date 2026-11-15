import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { STELLR_SPACE } from "@/data/space-host-brands";
import { STELLR_HOST_BRAND } from "@/lib/host-brand";
import { setRenderHostBrand } from "@/lib/host-brand-render";
import { HostBrandProvider } from "@/components/HostBrandContext";
import { hostPage } from "../pages";

// aerospace.stellrspace.com's own copies of its pages. A host-matched rewrite
// in next.config.ts sends each path in STELLR_SPACE.paths here
// (/space/cubesat → /stellrspace-space/space/cubesat); every other host
// keeps the shared pages, untouched.
type Props = { params: Promise<{ path: string[] }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return STELLR_SPACE.paths.map((path) => ({ path: path.slice(1).split("/") }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = hostPage(`/${(await params).path.join("/")}`);
  return page ? page.metadata() : {};
}

export default async function StellrSpaceHostPage({ params }: Props) {
  const page = hostPage(`/${(await params).path.join("/")}`);
  if (!page) notFound();
  // Before the shared page renders: its server components read the host from here, its client components from the provider.
  setRenderHostBrand(STELLR_HOST_BRAND);
  return <HostBrandProvider brand={STELLR_HOST_BRAND}>{await page.render()}</HostBrandProvider>;
}
