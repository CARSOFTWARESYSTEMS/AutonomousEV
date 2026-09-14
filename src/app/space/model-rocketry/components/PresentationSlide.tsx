import type { PresentationSlide as SlideType } from "../presentationData";
import styles from "../model-rocketry.module.css";

export default function PresentationSlide({ slide, showNotes }: { slide: SlideType; showNotes: boolean }) {
  return (
    <div className={styles.slide}>
      <h2 className={styles.slideTitle}>{slide.title}</h2>
      <ul className={styles.slideBullets}>
        {slide.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      {showNotes && (
        <div className={styles.speakerNotes} aria-label="Speaker notes">
          <strong>Speaker notes:</strong> {slide.notes}
        </div>
      )}
    </div>
  );
}
