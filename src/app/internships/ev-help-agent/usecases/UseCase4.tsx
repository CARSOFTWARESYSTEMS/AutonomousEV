import React from 'react';
import styles from './usecases.module.css';
import { ArchitectureAccordion, ChatBubble, Terminal } from './SharedComponents';

export const UseCase4 = () => {
  return (
    <section id="case4" className="container">
      <div className={styles.useCaseSection}>
        <div className={styles.useCaseHeader}>
          <div>
            <div className={styles.useCaseNum}>Use Case 4</div>
            <h2 className={styles.useCaseTitle}>Battery Overheating (Safety Critical)</h2>
            <div className={styles.useCaseMeta}>
              <span className={styles.metaChip}>Vehicle: EV-BIKE-2026</span>
              <span className={styles.metaChip}>Status: DC Fast Charging</span>
              <span className={`${styles.severityChip} ${styles.severityCritical}`}>Critical Safety Risk</span>
            </div>
          </div>
          <ArchitectureAccordion 
            title="View Technical Architecture"
            nodes={[
              { label: "Telemetry Stream" },
              { label: "Safety Agent", active: true },
              { label: "BMS Override Tool" },
              { label: "Escalation Agent" }
            ]}
          />
        </div>
        
        <div className={styles.layerGrid}>
          <div className={styles.layer}>
            <div className={styles.layerLabel}><div className={styles.layerLabelDot}/> Layer 1 — Human Dialog</div>
            <div className={styles.chatContainer}>
              <ChatBubble type="user" sender="EV User" time="18:05 PM" text="My dashboard is showing a red temperature warning, and the charging stopped automatically. I have my kids in the car, is it safe?" />
              <ChatBubble type="ai" sender="EV.ENGINEER" time="18:05 PM" text="I understand this is scary, but please stay calm. I am detecting abnormal thermal activity in your battery pack. For your safety, I have automatically locked the charging port and disconnected the high-voltage contactors." />
              <ChatBubble type="ai" sender="EV.ENGINEER" time="18:06 PM" text="Please safely exit the vehicle with your family and step away. Do not attempt to charge or drive it. I am escalating this immediately to our critical response team and dispatching emergency assistance to your GPS location." />
            </div>
          </div>
          
          <div className={styles.layer}>
            <div className={styles.layerLabel}><div className={styles.layerLabelDot}/> Layer 2 — System Processing</div>
            <Terminal title="EV SYSTEM ( Safety Agent Validation )" jsonLines={[
              <span key="1" className={styles.termHighlight}>[CRITICAL] Thermal Runaway Prediction Active!</span>,
              <span key="2" className={styles.termModule}>&#123;</span>,
              <span key="3">&nbsp;&nbsp;<span className={styles.termKey}>"module_3_temp"</span>: <span className={styles.termNumber}>68.5</span>,</span>,
              <span key="4">&nbsp;&nbsp;<span className={styles.termKey}>"temp_rate_of_change"</span>: <span className={styles.termString}>"+4.2C/min"</span>,</span>,
              <span key="5">&nbsp;&nbsp;<span className={styles.termKey}>"thermal_risk_score"</span>: <span className={styles.termNumber}>0.98</span>,</span>,
              <span key="6">&nbsp;&nbsp;<span className={styles.termKey}>"action"</span>: <span className={styles.termString}>"TRIGGER_BMS_CONTACTOR_OPEN"</span></span>,
              <span key="7">&#125;</span>,
              <span key="8" className={styles.termHighlight}>&gt; Disconnecting high voltage system... DONE.</span>
            ]} />
          </div>

          <div className={styles.layer}>
            <div className={styles.layerLabel}><div className={styles.layerLabelDot}/> Layer 3 — Engineering Insights</div>
            <div className={styles.insightCards}>
              <div className={styles.insightCard}>
                <div className={styles.insightCardTitle}>Thermal Heatmap</div>
                <div className={styles.batteryHeatmap} style={{ marginTop: 0 }}>
                  <div className={styles.heatmapGrid}>
                    {[...Array(24)].map((_, i) => {
                      let color = "rgba(76,169,48,0.8)";
                      if (i === 10 || i === 11 || i === 18) color = "#fbbf24";
                      if (i === 19 || i === 20) color = "#ff6b6b";
                      return <div key={i} className={styles.heatCell} style={{ background: color }}></div>;
                    })}
                  </div>
                  <div className={styles.heatLegend}>
                    <span>25°C</span><div className={styles.heatLegendBar}></div><span>&gt;65°C</span>
                  </div>
                </div>
              </div>
              <div className={styles.actionPlan}>
                <div className={styles.actionStep}>
                  <div className={styles.actionStepNum} style={{ background: 'rgba(255,77,77,0.2)', color: '#ff6b6b', borderColor: '#ff6b6b' }}>!</div>
                  <div className={styles.actionStepText}>HV Contactors opened. Emergency dispatch initiated.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
