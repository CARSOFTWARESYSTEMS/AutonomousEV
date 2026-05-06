import React from 'react';
import styles from './usecases.module.css';
import { ArchitectureAccordion, ChatBubble, Terminal } from './SharedComponents';

export const UseCase3 = () => {
  return (
    <section id="case3" className="container">
      <div className={styles.useCaseSection}>
        <div className={styles.useCaseHeader}>
          <div>
            <div className={styles.useCaseNum}>Use Case 3</div>
            <h2 className={styles.useCaseTitle}>Battery Fast Drain (Year 8)</h2>
            <div className={styles.useCaseMeta}>
              <span className={styles.metaChip}>Vehicle: EV-CAR-2026</span>
              <span className={styles.metaChip}>Odometer: 168,000 km</span>
              <span className={`${styles.severityChip} ${styles.severityHigh}`}>High Priority</span>
            </div>
          </div>
          <ArchitectureAccordion 
            title="View Technical Architecture"
            nodes={[
              { label: "Voice API Gateway" },
              { label: "Intent Detection Agent", active: true },
              { label: "Battery Intelligence Agent" },
              { label: "Diagnostics Engine" }
            ]}
          />
        </div>
        
        <div className={styles.layerGrid}>
          <div className={styles.layer}>
            <div className={styles.layerLabel}><div className={styles.layerLabelDot}/> Layer 1 — Human Dialog</div>
            <div className={styles.chatContainer}>
              <ChatBubble type="user" sender="EV User" time="14:20 PM" text="My car's range is dropping really fast. I charged it to 100% but it dropped to 80% after just 5 kilometers. I'm worried this is going to cost a fortune to replace." />
              <ChatBubble type="ai" sender="EV.ENGINEER" time="14:20 PM" text="I completely understand your frustration. Sudden range drops can be very stressful. Let's figure this out together. I'm running a quick diagnostic on your battery health." />
              <ChatBubble type="ai" sender="EV.ENGINEER" time="14:21 PM" text="I see your vehicle is at 168,000 km. The diagnostics show an increase in internal resistance, which explains the fast drain. Don't worry, we don't necessarily need to replace the whole pack—we might just need a module rebalancing." />
              <ChatBubble type="user" sender="EV User" time="14:21 PM" text="Oh, that’s a relief. Can I bring it in today?" />
            </div>
          </div>
          
          <div className={styles.layer}>
            <div className={styles.layerLabel}><div className={styles.layerLabelDot}/> Layer 2 — System Processing</div>
            <Terminal title="EV SYSTEM ( AI Diagnostics Engine )" jsonLines={[
              <span key="1"><span className={styles.termPrefix}>[REQ]</span> Analyzing SOC instability...</span>,
              <span key="2" className={styles.termModule}>&#123;</span>,
              <span key="3">&nbsp;&nbsp;<span className={styles.termKey}>"battery_soh"</span>: <span className={styles.termNumber}>71.0</span>,</span>,
              <span key="4">&nbsp;&nbsp;<span className={styles.termKey}>"internal_resistance_mOhm"</span>: <span className={styles.termNumber}>18.4</span>,</span>,
              <span key="5">&nbsp;&nbsp;<span className={styles.termKey}>"cell_imbalance_mV"</span>: <span className={styles.termNumber}>145</span>,</span>,
              <span key="6">&nbsp;&nbsp;<span className={styles.termKey}>"dtc_codes"</span>: [<span className={styles.termString}>"P0A7F"</span>, <span className={styles.termString}>"P0AFA"</span>],</span>,
              <span key="7">&nbsp;&nbsp;<span className={styles.termKey}>"diagnosis"</span>: <span className={styles.termString}>"high_degradation_imbalance"</span></span>,
              <span key="8">&#125;</span>,
              <span key="9" className={styles.termComment}>// Executing Action Planning Agent...</span>
            ]} />
          </div>

          <div className={styles.layer}>
            <div className={styles.layerLabel}><div className={styles.layerLabelDot}/> Layer 3 — Engineering Insights</div>
            <div className={styles.insightCards}>
              <div className={styles.insightCard}>
                <div className={styles.insightCardTitle}>Internal Resistance Trend</div>
                <div className={`${styles.insightValue} ${styles.insightValueWarn}`}>18.4 mΩ</div>
                <div className={styles.insightSubtext}>High resistance causing voltage sag and fast SOC drops.</div>
              </div>
              <div className={styles.sohGraph}>
                <div className={styles.sohTitle}>Historical Degradation (SOH)</div>
                <div className={styles.sohBars}>
                  <div className={styles.sohBar} style={{height: '100%'}}></div>
                  <div className={styles.sohBar} style={{height: '92%'}}></div>
                  <div className={styles.sohBar} style={{height: '85%'}}></div>
                  <div className={styles.sohBar} style={{height: '78%'}}></div>
                  <div className={`${styles.sohBar} ${styles.sohBarWarn}`} style={{height: '71%'}}></div>
                </div>
                <div className={styles.sohLabels}><span>Yr 1</span><span>Yr 8</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
