import { JsonLd } from "@/lib/structured-data/JsonLd";
import { apexJsonLd } from "@/data/apex/seo";
import { ApexPageView } from "../ApexPageView";
import { HomeEcosystem } from "../HomeEcosystem";
import { HomeBuilt, HomeFinal, HomeHardware, HomeHero, HomeValidation } from "../HomeNarrative";
import { HomeSystem } from "../HomeSystem";

/**
 * The executive narrative, in seven sections: who APEX is, what it has built,
 * the hardware itself, why an engine is the beginning, physical and digital
 * validation together, the ecosystem, and the collaboration. Everything deeper
 * — the full system, lifecycle, roadmap, founders, statistics — is one click
 * away on its own page.
 */
export function HomePage() {
  return (
    <>
      <JsonLd data={apexJsonLd("home")} />
      <ApexPageView page="home" />
      <HomeHero />
      <HomeBuilt />
      <HomeHardware />
      <HomeSystem />
      <HomeValidation />
      <HomeEcosystem />
      <HomeFinal />
    </>
  );
}
