import MissionPage, { MissionInfo } from "../../components/MissionPage";
import EclipseMission from "@/components/space-academy/missions/eclipse/EclipseMission";
import { missionBySlug, missionHref, MISSIONS } from "../../data/missions";
import { trackBySlug } from "../../data/curriculum";
import { missionMetadata } from "../../seo";

const SLUG = "survive-the-eclipse";
const mission = missionBySlug(SLUG)!;
const nextMission = MISSIONS.find((m) => m.number === mission.number + 1);
const track = trackBySlug(mission.track);

export const metadata = missionMetadata(mission);

export default function Page() {
  return (
    <MissionPage slug={SLUG}>
      <EclipseMission
        mission={mission}
        trackTitle={track?.title}
        related={track?.tutorials ?? []}
        next={nextMission ? { href: missionHref(nextMission.slug), label: `Next: ${nextMission.title}` } : undefined}
        info={<MissionInfo slug={SLUG} />}
      />
    </MissionPage>
  );
}
