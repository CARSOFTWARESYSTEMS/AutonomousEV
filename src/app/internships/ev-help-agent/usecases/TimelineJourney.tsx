import React from 'react';
import styles from './usecases.module.css';

export const TimelineJourney = () => {
  return (
    <div className={styles.journeyTimeline}>
      <div className={styles.journeyLine}></div>
      <div className={styles.journeyNode}>
        <div className={styles.journeyYear}>Year 1</div>
        <div className={styles.journeyContent}>
          <h4>Healthy Battery</h4>
          <p>Initial AI onboarding. Baseline SOH established at 100%.</p>
        </div>
      </div>
      <div className={styles.journeyNode}>
        <div className={styles.journeyYear}>Year 3</div>
        <div className={styles.journeyContent}>
          <h4>Warranty Expiry Nearing</h4>
          <p>AI recommends inspection. Minor cell imbalance detected and passively resolved.</p>
        </div>
      </div>
      <div className={styles.journeyNode}>
        <div className={styles.journeyYear}>Year 5</div>
        <div className={styles.journeyContent}>
          <h4>Extended Warranty</h4>
          <p>Cooling system efficiency drop flagged. Preventive maintenance scheduled by AI.</p>
        </div>
      </div>
      <div className={styles.journeyNode}>
        <div className={styles.journeyYear}>Year 8</div>
        <div className={styles.journeyContent}>
          <h4>Degradation Visible</h4>
          <p>SOH reaches 71%. AI active diagnostics engaged for fast drain and thermal drift.</p>
        </div>
      </div>
    </div>
  );
};
