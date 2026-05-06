import React from 'react';
import styles from './usecases.module.css';
import { ArchitectureAccordion, ChatBubble, Terminal } from './SharedComponents';

export const UseCase6 = () => {
  return (
    <section id="case6" className="container">
      <div className={styles.useCaseSection}>
        <div className={styles.useCaseHeader}>
          <div>
            <div className={styles.useCaseNum}>Use Case 6</div>
            <h2 className={styles.useCaseTitle}>Remote Technician Diagnostics</h2>
            <div className={styles.useCaseMeta}>
              <span className={styles.metaChip}>Technician Workflow</span>
              <span className={styles.metaChip}>Deep Engineering Mode</span>
              <span className={`${styles.severityChip} ${styles.severityNormal}`}>Diagnostics</span>
            </div>
          </div>
          <ArchitectureAccordion 
            title="View Technical Architecture"
            nodes={[
              { label: "EV Technician" },
              { label: "RAG Knowledge Agent", active: true },
              { label: "Vector DB Search" },
              { label: "CAN Telemetry Fetch" },
              { label: "Engineering Summary" }
            ]}
          />
        </div>
        
        <div className={styles.layerGrid}>
          <div className={styles.layer}>
            <div className={styles.layerLabel}><div className={styles.layerLabelDot}/> Layer 1 — Engineering Request</div>
            <div className={styles.chatContainer}>
              <ChatBubble type="user" sender="EV Technician" time="09:15 AM" text="Fetch CAN telemetry for EV-CAR-2026. Analyze thermal drift and compare historical degradation across the last 100 fast charging cycles." />
              <ChatBubble type="ai" sender="EV.ENGINEER" time="09:16 AM" text="Retrieving telemetry..." />
              <ChatBubble type="ai" sender="EV.ENGINEER" time="09:16 AM" text="Analysis complete. Cell imbalance is at 145mV (Module 4). Thermal drift identified during DC fast charging above 50kW. RAG Knowledge base suggests SOP-BATT-042: Initiate deep balancing cycle before replacing module." />
            </div>
          </div>
          
          <div className={styles.layer}>
            <div className={styles.layerLabel}><div className={styles.layerLabelDot}/> Layer 2 — System Processing</div>
            <Terminal title="EV SYSTEM ( Vehicle Telemetry Server )" jsonLines={[
              <span key="1"><span className={styles.termPrefix}>[QUERY]</span> RAG Knowledge DB...</span>,
              <span key="2" className={styles.termComment}>&gt; Found: SOP-BATT-042 (Cell Balancing Protocol)</span>,
              <span key="3" className={styles.termModule}>&#123;</span>,
              <span key="4">&nbsp;&nbsp;<span className={styles.termKey}>"can_packet"</span>: <span className={styles.termString}>"0x1F4_BMS_STATUS"</span>,</span>,
              <span key="5">&nbsp;&nbsp;<span className={styles.termKey}>"v_max"</span>: <span className={styles.termNumber}>4.12</span>, <span className={styles.termKey}>"v_min"</span>: <span className={styles.termNumber}>3.97</span>,</span>,
              <span key="6">&nbsp;&nbsp;<span className={styles.termKey}>"dtc_active"</span>: <span className={styles.termBool}>true</span>,</span>,
              <span key="7">&nbsp;&nbsp;<span className={styles.termKey}>"recommended_action"</span>: <span className={styles.termString}>"DEEP_BALANCE_CYCLE"</span></span>,
              <span key="8">&#125;</span>
            ]} />
          </div>

          <div className={styles.layer}>
            <div className={styles.layerLabel}><div className={styles.layerLabelDot}/> Layer 3 — Engineering Insights</div>
            <div className={styles.insightCards}>
              <div className={styles.insightCard}>
                <div className={styles.insightCardTitle}>Cell Imbalance Analysis</div>
                <div className={styles.insightValue}>145 mV</div>
                <div className={styles.insightBar}><div className={`${styles.insightBarFill} ${styles.barYellow}`} style={{width: '60%'}}></div></div>
                <div className={styles.insightSubtext}>Delta V exceeds 100mV threshold. Module 4 flagged.</div>
              </div>
              <div className={styles.insightCard}>
                <div className={styles.insightCardTitle}>AI Recommendation</div>
                <div className={styles.actionPlan} style={{ marginTop: '0.5rem' }}>
                  <div className={styles.actionStepText}>Initiate Level 2 slow charge to 100% to allow passive BMS balancing over 12 hours. Do not replace pack yet.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
