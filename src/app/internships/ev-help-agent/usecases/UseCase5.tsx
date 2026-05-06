import React from 'react';
import styles from './usecases.module.css';
import { ArchitectureAccordion, ChatBubble, Terminal } from './SharedComponents';

export const UseCase5 = () => {
  return (
    <section id="case5" className="container">
      <div className={styles.useCaseSection}>
        <div className={styles.useCaseHeader}>
          <div>
            <div className={styles.useCaseNum}>Use Case 5</div>
            <h2 className={styles.useCaseTitle}>Motor Torque Loss & Vibration</h2>
            <div className={styles.useCaseMeta}>
              <span className={styles.metaChip}>Vehicle: EV-CAR-2026</span>
              <span className={styles.metaChip}>Symptom: Weak Acceleration</span>
              <span className={`${styles.severityChip} ${styles.severityHigh}`}>High Priority</span>
            </div>
          </div>
          <ArchitectureAccordion 
            title="View Technical Architecture"
            nodes={[
              { label: "Voice Assistant UI" },
              { label: "Diagnostics Agent", active: true },
              { label: "Inverter Telemetry Analysis" },
              { label: "Action Planning Agent" }
            ]}
          />
        </div>
        
        <div className={styles.layerGrid}>
          <div className={styles.layer}>
            <div className={styles.layerLabel}><div className={styles.layerLabelDot}/> Layer 1 — Human Dialog</div>
            <div className={styles.chatContainer}>
              <ChatBubble type="user" sender="EV User" time="16:00 PM" text="My car feels really weird. When I press the accelerator, it hesitates, and I can feel a strange vibration from the back. It also feels like regenerative braking isn't working properly." />
              <ChatBubble type="ai" sender="EV.ENGINEER" time="16:00 PM" text="I'm sorry to hear you're experiencing that. That hesitation and vibration must feel unsettling. Please safely pull over when you can. I am checking the motor and inverter telemetry now." />
              <ChatBubble type="ai" sender="EV.ENGINEER" time="16:01 PM" text="The data shows a phase current imbalance in the rear motor inverter, which is causing the torque loss and vibration. It's safe to drive at low speeds, but I recommend heading directly to the nearest service center." />
            </div>
          </div>
          
          <div className={styles.layer}>
            <div className={styles.layerLabel}><div className={styles.layerLabelDot}/> Layer 2 — System Processing</div>
            <Terminal title="EV SYSTEM ( Inverter Analysis Engine )" jsonLines={[
              <span key="1"><span className={styles.termPrefix}>[REQ]</span> Analyzing Motor Telemetry...</span>,
              <span key="2" className={styles.termModule}>&#123;</span>,
              <span key="3">&nbsp;&nbsp;<span className={styles.termKey}>"motor_rpm"</span>: <span className={styles.termNumber}>4200</span>,</span>,
              <span key="4">&nbsp;&nbsp;<span className={styles.termKey}>"phase_u_current"</span>: <span className={styles.termNumber}>120.5</span>,</span>,
              <span key="5">&nbsp;&nbsp;<span className={styles.termKey}>"phase_v_current"</span>: <span className={styles.termNumber}>118.2</span>,</span>,
              <span key="6">&nbsp;&nbsp;<span className={styles.termKey}>"phase_w_current"</span>: <span className={styles.termNumber}>65.4</span>, <span className={styles.termComment}>// Anomaly detected</span></span>,
              <span key="7">&nbsp;&nbsp;<span className={styles.termKey}>"dtc_codes"</span>: [<span className={styles.termString}>"P0A43"</span>, <span className={styles.termString}>"P0A3F"</span>],</span>,
              <span key="8">&nbsp;&nbsp;<span className={styles.termKey}>"diagnosis"</span>: <span className={styles.termString}>"inverter_phase_w_failure"</span></span>,
              <span key="9">&#125;</span>,
              <span key="10" className={styles.termComment}>// Limiting max torque output to 30%...</span>
            ]} />
          </div>

          <div className={styles.layer}>
            <div className={styles.layerLabel}><div className={styles.layerLabelDot}/> Layer 3 — Engineering Insights</div>
            <div className={styles.insightCards}>
              <div className={styles.insightCard}>
                <div className={styles.insightCardTitle}>Inverter Phase Balance</div>
                <div className={`${styles.insightValue} ${styles.insightValueWarn}`}>Phase W Fault</div>
                <div className={styles.insightSubtext}>Significant current drop in Phase W causing uneven magnetic field and mechanical vibration.</div>
              </div>
              <div className={styles.actionPlan}>
                <div className={styles.actionStep}>
                  <div className={styles.actionStepNum}>1</div>
                  <div className={styles.actionStepText}>Limp mode activated. Max torque limited to prevent further IGBT damage.</div>
                </div>
                <div className={styles.actionStep}>
                  <div className={styles.actionStepNum}>2</div>
                  <div className={styles.actionStepText}>Service ticket routed to HV Powertrain specialist.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
