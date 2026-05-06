import React from 'react';
import styles from './usecases.module.css';
import { ArchitectureAccordion, ChatBubble, Terminal } from './SharedComponents';

export const UseCase2 = () => {
  return (
    <section id="case2" className="container">
      <div className={styles.useCaseSection}>
        <div className={styles.useCaseHeader}>
          <div>
            <div className={styles.useCaseNum}>Use Case 2</div>
            <h2 className={styles.useCaseTitle}>Year 5 Warranty Expiry & Service Alert</h2>
            <div className={styles.useCaseMeta}>
              <span className={styles.metaChip}>Vehicle: EV-CAR-2026</span>
              <span className={styles.metaChip}>Odometer: 85,000 km</span>
              <span className={`${styles.severityChip} ${styles.severityNormal}`}>Predictive</span>
            </div>
          </div>
          <ArchitectureAccordion 
            title="View Technical Architecture"
            nodes={[
              { label: "Warranty System API" },
              { label: "AI Orchestrator", active: true },
              { label: "Battery Diagnostics Agent" },
              { label: "Cooling System Analytics" },
              { label: "Outbound Voice Agent" }
            ]}
          />
        </div>
        
        <div className={styles.layerGrid}>
          <div className={styles.layer}>
            <div className={styles.layerLabel}><div className={styles.layerLabelDot}/> Layer 1 — Human Dialog</div>
            <div className={styles.chatContainer}>
              <ChatBubble type="ai" sender="EV.ENGINEER" time="11:30 AM" text="Hello! This is EV.ENGINEER. I noticed your 5-year powertrain warranty is expiring next month. Are you having a good day?" />
              <ChatBubble type="user" sender="EV User" time="11:31 AM" text="Oh, hi. Yes, I'm good. Wow, 5 years already? Time flies. Should I be worried about anything?" />
              <ChatBubble type="ai" sender="EV.ENGINEER" time="11:31 AM" text="Not at all! Your battery health is solid. However, I am looking at your cooling system telemetry, and pump efficiency has dropped slightly over the last year. I highly recommend scheduling a checkup and considering our extended warranty to cover any future coolant pump replacements." />
              <ChatBubble type="user" sender="EV User" time="11:32 AM" text="That's really helpful. Thank you for looking out for me. Let's schedule the inspection." />
            </div>
          </div>
          
          <div className={styles.layer}>
            <div className={styles.layerLabel}><div className={styles.layerLabelDot}/> Layer 2 — System Processing</div>
            <Terminal title="EV SYSTEM ( Diagnostics Engine )" jsonLines={[
              <span key="1"><span className={styles.termPrefix}>[SYS]</span> Fetching Powertrain Telemetry...</span>,
              <span key="2" className={styles.termModule}>&#123;</span>,
              <span key="3">&nbsp;&nbsp;<span className={styles.termKey}>"warranty_status"</span>: <span className={styles.termString}>"expiring_30_days"</span>,</span>,
              <span key="4">&nbsp;&nbsp;<span className={styles.termKey}>"battery_soh"</span>: <span className={styles.termNumber}>88.4</span>,</span>,
              <span key="5">&nbsp;&nbsp;<span className={styles.termKey}>"coolant_pump_rpm_deviation"</span>: <span className={styles.termString}>"+4.5%"</span>,</span>,
              <span key="6">&nbsp;&nbsp;<span className={styles.termKey}>"thermal_efficiency_drop"</span>: <span className={styles.termString}>"2.1%"</span>,</span>,
              <span key="7">&nbsp;&nbsp;<span className={styles.termKey}>"recommendation"</span>: <span className={styles.termString}>"INSPECT_COOLING_SYSTEM"</span></span>,
              <span key="8">&#125;</span>,
              <span key="9" className={styles.termComment}>// Routing to Scheduling Agent...</span>
            ]} />
          </div>

          <div className={styles.layer}>
            <div className={styles.layerLabel}><div className={styles.layerLabelDot}/> Layer 3 — Engineering Insights</div>
            <div className={styles.insightCards}>
              <div className={styles.insightCard}>
                <div className={styles.insightCardTitle}>Coolant Pump Efficiency</div>
                <div className={`${styles.insightValue} ${styles.insightValueWarn}`}>93.5%</div>
                <div className={styles.insightBar}><div className={`${styles.insightBarFill} ${styles.barYellow}`} style={{width: '93%'}}></div></div>
                <div className={styles.insightSubtext}>Slight deviation detected in RPM vs flow rate over past 6 months.</div>
              </div>
              <div className={styles.actionPlan}>
                <div className={styles.actionStep}>
                  <div className={styles.actionStepNum}>1</div>
                  <div className={styles.actionStepText}>Initiate service ticket for coolant flush and pump inspection.</div>
                </div>
                <div className={styles.actionStep}>
                  <div className={styles.actionStepNum}>2</div>
                  <div className={styles.actionStepText}>Send Extended Warranty document link via SMS.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
