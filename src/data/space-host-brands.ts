/**
 * Hosts that show the Space pages under their own name. On these hosts the
 * shared Space header's top-left brand reads the host's name in place of
 * "ISHAVASYAM.ORG /space"; everything else on the page is unchanged.
 *
 * Pages are static, so the server cannot know the host: SpaceBrandHostFlag
 * marks <html data-space-brand="…"> before first paint and the header's CSS
 * swaps the brand (see SpaceHeader and ../app/space/space.module.css).
 */
export const STELLR_SPACE = {
  /** The value of <html data-space-brand> on these hosts. */
  id: "stellr",
  /** Always written exactly so. */
  name: "STELLR SPACE",
  /** Exact hostnames, no wildcards. */
  hosts: ["aerospace.stellrspace.com"],
} as const;
