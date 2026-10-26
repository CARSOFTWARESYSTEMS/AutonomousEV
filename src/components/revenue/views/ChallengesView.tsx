"use client";
// One Founder Challenge per week: the outcome that matters more than the tasks.
import { trackRevenue } from "../analytics";
import { WEEKS, weekOf } from "../data/framework";
import { useRevenue } from "../state/store";
import { Badge } from "../ui/badges";
import { ViewHeader } from "../ui/controls";
import css from "../workspace.module.css";

export default function ChallengesView() {
  const day = useRevenue((state) => state.day);
  const challenges = useRevenue((state) => state.challenges);
  const setChallenge = useRevenue((state) => state.setChallenge);
  const current = weekOf(day);

  return (
    <div>
      <ViewHeader eyebrow="Review" title="Founder Challenges" lede="One high-impact challenge a week. Mark it complete only when you can show the evidence." />
      <ol className={css.challengeGrid}>
        {WEEKS.map((week) => (
          <li key={week.n} className={css.challengeCard} data-current={week.n === current ? "" : undefined} data-done={challenges[week.n] ? "" : undefined}>
            <p className={css.kicker}>
              Week {week.n} · {week.theme}
            </p>
            <p className={css.challengeText}>{week.challenge}</p>
            <div className={css.miniHead}>
              {week.n === current ? <Badge tone="cyan">This week</Badge> : <span />}
              <label className={css.switchLabel}>
                <input
                  type="checkbox"
                  checked={Boolean(challenges[week.n])}
                  autoComplete="off"
                  onChange={(event) => {
                    setChallenge(week.n, event.target.checked);
                    if (event.target.checked) trackRevenue("founder_challenge_complete", { week: String(week.n) });
                  }}
                />
                Complete
              </label>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
