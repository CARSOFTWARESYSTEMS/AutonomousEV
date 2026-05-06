import React from 'react';
import styles from './usecases.module.css';
import { ArchitectureAccordion, ChatBubble, Terminal } from './SharedComponents';

export const UseCase1 = () => {
  return (
    <section id="case1" className="container">
      <div className={styles.useCaseSection}>
        <div className={styles.useCaseHeader}>
          <div>
            <div className={styles.useCaseNum}>Use Case 1</div>
            <h2 className={styles.useCaseTitle}>Predictive Maintenance Call (Year 2.5)</h2>
            <div className={styles.useCaseMeta}>
              <span className={styles.metaChip}>Vehicle: EV-CAR-2026</span>
              <span className={styles.metaChip}>Odometer: 42,000 km</span>
              <span className={`${styles.severityChip} ${styles.severityNormal}`}>Predictive</span>
            </div>
          </div>
          <ArchitectureAccordion 
            title="View Technical Architecture"
            nodes={[
              { label: "Predictive Analytics Engine" },
              { label: "AI Orchestrator", active: true },
              { label: "Notification Tool" },
              { label: "Outbound Voice Agent" },
              { label: "EV Owner" }
            ]}
          />
        </div>
        
        <div className={styles.layerGrid}>
          <div className={styles.layer}>
            <div className={styles.layerLabel}><div className={styles.layerLabelDot}/> Layer 1 — Human Dialog</div>
            <div className={styles.chatContainer}>
              <ChatBubble type="ai" sender="EV.ENGINEER" time="10:00 AM" text="Hello, I’m EV.ENGINEER, your AI-powered EV diagnostics assistant. I'm calling because your EV-CAR-2026 is approaching its 3-year warranty expiration." />
              <ChatBubble type="user" sender="EV User" time="10:01 AM" text="Oh, hi. Yes, I remember. Is everything okay with the car?" />
              <ChatBubble type="ai" sender="EV.ENGINEER" time="10:01 AM" text="Yes, overall health is great! However, I am looking at your charging history, and our telemetry noticed a slight degradation trend in the battery health (SOH). It's normal, but I'd suggest a quick service to ensure peak performance before the warranty ends." />
              <ChatBubble type="user" sender="EV User" time="10:02 AM" text="Thanks for letting me know. Can we schedule that?" />
            </div>
          </div>
          
          <div className={styles.layer}>
            <div className={styles.layerLabel}><div className={styles.layerLabelDot}/> Layer 2 — System Processing</div>
            <Terminal title="EV SYSTEM ( Charging Analytics Engine )" jsonLines={[
              <span key="1"><span className={styles.termPrefix}>[SYS]</span> Loading Telemetry Packet...</span>,
              <span key="2" className={styles.termModule}>&#123;</span>,
              <span key="3">&nbsp;&nbsp;<span className={styles.termKey}>"vehicleId"</span>: <span className={styles.termString}>"EV-CAR-2026-VIN982"</span>,</span>,
              <span key="4">&nbsp;&nbsp;<span className={styles.termKey}>"odometer_km"</span>: <span className={styles.termNumber}>42105</span>,</span>,
              <span key="5">&nbsp;&nbsp;<span className={styles.termKey}>"battery_soh"</span>: <span className={styles.termNumber}>94.2</span>,</span>,
              <span key="6">&nbsp;&nbsp;<span className={styles.termKey}>"soh_degradation_trend"</span>: <span className={styles.termString}>"marginal_increase"</span>,</span>,
              <span key="7">&nbsp;&nbsp;<span className={styles.termKey}>"predictive_risk_score"</span>: <span className={styles.termNumber}>0.12</span></span>,
              <span key="8">&#125;</span>,
              <span key="9" className={styles.termComment}>// Triggering Outbound Workflow Agent...</span>
            ]} />
          </div>

          <div className={styles.layer}>
            <div className={styles.layerLabel}><div className={styles.layerLabelDot}/> Layer 3 — Engineering Insights</div>
            <div className={styles.insightCards}>
              <div className={styles.insightCard}>
                <div className={styles.insightCardTitle}>Battery Health (SOH) Trend</div>
                <div className={styles.insightValue}>94.2%</div>
                <div className={styles.insightBar}><div className={`${styles.insightBarFill} ${styles.barGreen}`} style={{width: '94%'}}></div></div>
                <div className={styles.insightSubtext}>Expected: 96% | Slight deviation detected</div>
              </div>
              <div className={styles.actionPlan}>
                <div className={styles.actionStep}>
                  <div className={styles.actionStepNum}>1</div>
                  <div className={styles.actionStepText}>Initiate predictive maintenance ticket.</div>
                </div>
                <div className={styles.actionStep}>
                  <div className={styles.actionStepNum}>2</div>
                  <div className={styles.actionStepText}>Recommend extended warranty.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
