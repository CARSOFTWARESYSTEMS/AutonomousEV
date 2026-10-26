// The Customer Meeting Guide: one card to read before a meeting and one
// list to fill in after it. Not a questionnaire — seven questions, what to
// listen for, what not to do and the next step to ask for.
import Link from "next/link";
import { ROUTES } from "../data/framework";
import { MEETING_GUIDE } from "../data/steps";
import css from "../site.module.css";

export default function MeetingGuide() {
  return (
    <section id="meeting-guide" className={css.section} data-tone="alt" aria-labelledby="rv-guide-title">
      <div className={css.container}>
        <article className={css.guide}>
          <header className={css.guideHead}>
            <p className={css.eyebrow}>Before a meeting</p>
            <h2 id="rv-guide-title" className={css.sectionTitle}>
              Customer Meeting Guide
            </h2>
            <p className={css.guideObjective}>
              <span className={css.stepResultLabel}>Objective</span> {MEETING_GUIDE.objective}
            </p>
          </header>
          <div className={css.guideGrid}>
            <div>
              <h3 className={css.stepLabel}>Ask</h3>
              <ol className={css.stepList}>
                {MEETING_GUIDE.ask.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className={css.stepLabel}>Listen for</h3>
              <ul className={css.listenFor}>
                {MEETING_GUIDE.listenFor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <h3 className={css.stepLabel} data-tone="warn">
                Do not
              </h3>
              <ul className={css.stepList} data-tone="warn">
                {MEETING_GUIDE.doNot.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className={css.stepResult}>
            <span className={css.stepResultLabel}>Desired next step</span>
            <span>{MEETING_GUIDE.next}</span>
          </p>
          <div className={css.guideAfter}>
            <h3 className={css.stepLabel}>After the meeting, record</h3>
            <ul className={css.stepList}>
              {MEETING_GUIDE.record.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className={css.guideFollow}>{MEETING_GUIDE.followUp}</p>
            <Link href={`${ROUTES.accounts}#meetings`} className={css.textLink}>
              Write your meeting notes →
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
