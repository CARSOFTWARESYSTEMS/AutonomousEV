import MissionPage from "../../components/MissionPage";
import RocketMission from "@/components/space-academy/missions/rocket/RocketMission";
import { missionBySlug, missionHref, MISSIONS } from "../../data/missions";
import { trackBySlug } from "../../data/curriculum";
import { missionMetadata } from "../../seo";

const SLUG = "stable-model-rocket";
const mission = missionBySlug(SLUG)!;
const nextMission = MISSIONS.find((m) => m.number === mission.number + 1);

export const metadata = missionMetadata(mission);

export default function Page() {
  return (
    <MissionPage slug={SLUG}>
      <RocketMission
        mission={mission}
        related={trackBySlug(mission.track)?.tutorials ?? []}
        next={nextMission ? { href: missionHref(nextMission.slug), label: `Next: ${nextMission.title}` } : { href: "/space/academy#tracks", label: "Back to Space Academy" }}
      />
    </MissionPage>
  );
}
