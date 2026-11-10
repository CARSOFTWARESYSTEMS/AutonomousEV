import MissionPage from "../../components/MissionPage";
import BuildCubeSatMission from "@/components/space-academy/missions/cubesat/BuildCubeSatMission";
import { missionBySlug, missionHref, MISSIONS } from "../../data/missions";
import { trackBySlug } from "../../data/curriculum";
import { missionMetadata } from "../../seo";

const SLUG = "build-your-first-cubesat";
const mission = missionBySlug(SLUG)!;
const nextMission = MISSIONS.find((m) => m.number === mission.number + 1);

export const metadata = missionMetadata(mission);

export default function Page() {
  return (
    <MissionPage slug={SLUG}>
      <BuildCubeSatMission
        mission={mission}
        related={trackBySlug(mission.track)?.tutorials ?? []}
        next={nextMission ? { href: missionHref(nextMission.slug), label: `Next: ${nextMission.title}` } : undefined}
      />
    </MissionPage>
  );
}
