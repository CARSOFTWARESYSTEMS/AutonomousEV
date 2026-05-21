"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./usecases.module.css";

// Reusable flow diagram component
const FlowDiagram = ({ nodes, direction = "horizontal" }: any) => {
  return (
    <div className={styles.flowDiagram}>
      <div className={styles.flowRow} style={{ flexDirection: direction === "horizontal" ? "row" : "column" }}>
        {nodes.map((nodeGroup: any, idx: number) => {
          const isArray = Array.isArray(nodeGroup);
          const group = isArray ? nodeGroup : [nodeGroup];
          return (
            <React.Fragment key={idx}>
              <div className={isArray ? styles.flowGroup : ""} style={isArray ? { flexDirection: direction === "horizontal" ? "column" : "row" } : {}}>
                {group.map((n: any, i: number) => (
                  <div key={i} className={`${styles.flowNode} ${n.active ? styles.flowNodeActive : ""}`}>
                    {n.label}
                  </div>
                ))}
              </div>
              {idx < nodes.length - 1 && (
                <div className={direction === "horizontal" ? styles.flowArrow : styles.flowVerticalArrow}>
                  →
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// Accordion for architecture
const ArchitectureAccordion = ({ title, nodes }: { title: string, nodes: any[] }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.accordionItem}>
      <button
        className={`${styles.accordionBtn} ${open ? styles.accordionBtnOpen : ''}`}
        onClick={() => setOpen(!open)}
      >
        <span>{title}</span>
        <span className={`${styles.accordionChevron} ${open ? styles.accordionChevronOpen : ''}`}>▼</span>
      </button>
      {open && (
        <div className={styles.accordionBody}>
          <FlowDiagram nodes={nodes} />
        </div>
      )}
    </div>
  );
};

// Chat Bubble
const ChatBubble = ({ sender, text, time, type }: { sender: string, text: string, time: string, type: "user" | "ai" }) => (
  <div className={`${styles.chatBubble} ${type === "ai" ? styles.chatBubbleAI : styles.chatBubbleUser}`}>
    <div className={`${styles.bubbleSender} ${type === "ai" ? styles.senderAI : styles.senderUser}`}>{sender}</div>
    <div className={`${styles.bubbleText} ${type === "ai" ? styles.bubbleTextAI : styles.bubbleTextUser}`}>{text}</div>
    <div className={styles.bubbleTime}>{time}</div>
  </div>
);

// Terminal JSON view
const Terminal = ({ title, jsonLines }: { title: string, jsonLines: React.ReactNode[] }) => (
  <div className={styles.terminal}>
    <div className={styles.terminalHeader}>
      <div className={`${styles.termDot} ${styles.termDotRed}`}></div>
      <div className={`${styles.termDot} ${styles.termDotYellow}`}></div>
      <div className={`${styles.termDot} ${styles.termDotGreen}`}></div>
      <span className={styles.terminalTitle}>{title}</span>
    </div>
    <div className={styles.terminalBody}>
      {jsonLines.map((line, idx) => (
        <div key={idx} className={styles.termLine}>{line}</div>
      ))}
    </div>
  </div>
);

export default function UseCasesContent() {
  return (
    <div className={styles.pageWrapper}>
      {/* PREMIUM HERO */}
      <section className={styles.hero}>
        <div className={styles.heroAnimatedBg}>
          <div className={styles.particle} style={{ top: "40%", left: "20%", animationDelay: "0s" }} />
          <div className={styles.particle} style={{ top: "60%", left: "70%", animationDelay: "1s" }} />
          <div className={styles.particle} style={{ top: "30%", left: "80%", animationDelay: "2s" }} />
          <div className={styles.particle} style={{ top: "80%", left: "30%", animationDelay: "3s" }} />
        </div>
        <div className={styles.heroGlow} />
        <div className={styles.heroInner}>
          <div className={styles.heroPill}><span>EV Help Agent — Real World AI Support Use Cases</span></div>
          <h1 className={styles.heroTitle}>Realtime AI Voice Dialogs & EV Diagnostics Intelligence</h1>
          <p className={styles.heroDesc}>
            Experience a production-ready AI EV support ecosystem. Featuring human-like interactions, agentic tool orchestration, engineering escalation workflows, and backend telemetry processing.
          </p>
          <div className={styles.waveformContainer}>
            <div className={styles.waveBar} style={{ animationDelay: "0.1s" }} />
            <div className={styles.waveBar} style={{ animationDelay: "0.3s" }} />
            <div className={styles.waveBar} style={{ animationDelay: "0.2s" }} />
            <div className={styles.waveBar} style={{ animationDelay: "0.5s" }} />
            <div className={styles.waveBar} style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      </section>

      {/* INDEX NAVIGATION */}
      <section className="container">
        <div className={styles.indexGrid}>
          <a href="#case1" className={styles.indexCard}>
            <span className={`${styles.indexCardBadge} ${styles.badgePredictive}`}>Predictive Maintenance</span>
            <div className={styles.indexCardTitle}>Warranty Reminder & SOH</div>
            <div className={styles.indexCardDesc}>Proactive AI outreach detecting battery degradation trend.</div>
            <div className={styles.indexCardArrow}>→</div>
          </a>
          <a href="#case2" className={styles.indexCard}>
            <span className={`${styles.indexCardBadge} ${styles.badgePredictive}`}>Service Alert</span>
            <div className={styles.indexCardTitle}>Year 5 Warranty Expiry</div>
            <div className={styles.indexCardDesc}>AI builds trust while suggesting cooling system inspection.</div>
            <div className={styles.indexCardArrow}>→</div>
          </a>
          <a href="#case3" className={styles.indexCard}>
            <span className={`${styles.indexCardBadge} ${styles.badgeSafety}`}>Battery Failure</span>
            <div className={styles.indexCardTitle}>Fast Battery Drain</div>
            <div className={styles.indexCardDesc}>Emotional conversation handling SOC instability and fast drain.</div>
            <div className={styles.indexCardArrow}>→</div>
          </a>
          <a href="#case4" className={styles.indexCard}>
            <span className={`${styles.indexCardBadge} ${styles.badgeSafety}`}>Safety Critical</span>
            <div className={styles.indexCardTitle}>Thermal Runaway Alert</div>
            <div className={styles.indexCardDesc}>Immediate safety escalation for DC charging overheating.</div>
            <div className={styles.indexCardArrow}>→</div>
          </a>
          <a href="#case5" className={styles.indexCard}>
            <span className={`${styles.indexCardBadge} ${styles.badgeMotor}`}>Motor Failure</span>
            <div className={styles.indexCardTitle}>Motor Torque Loss</div>
            <div className={styles.indexCardDesc}>Diagnostics reasoning for weak acceleration and vibration.</div>
            <div className={styles.indexCardArrow}>→</div>
          </a>
          <a href="#case6" className={styles.indexCard}>
            <span className={`${styles.indexCardBadge} ${styles.badgeTechnical}`}>Technician Diagnostics</span>
            <div className={styles.indexCardTitle}>Remote Engineer Analysis</div>
            <div className={styles.indexCardDesc}>Highly technical remote analysis, CAN telemetry, and DTC codes.</div>
            <div className={styles.indexCardArrow}>→</div>
          </a>
        </div>
      </section>

      {/* TIMELINE: EV OWNERSHIP LIFECYCLE */}
      <section className="container">
        <div className={styles.sectionHeader} style={{ marginBottom: "1rem", marginTop: "2rem" }}>
          <span className={styles.sectionNumber}>The Journey</span>
          <h2 className={styles.sectionTitle}>Full EV Ownership Lifecycle</h2>
          <p className={styles.sectionSubtitle}>
            EV.ENGINEER continuously monitors and protects the vehicle across its entire 8-year lifespan.
          </p>
        </div>

        <div className={styles.timelineWrapper}>
          <div className={styles.timelineTrack}>
            <div className={styles.timelineTrackFill} style={{ width: '100%' }}></div>
          </div>
          <div className={styles.timelineNodes}>
            <div className={styles.timelineNode}>
              <div className={styles.timelineYear}>YEAR 1</div>
              <div className={styles.timelineDot}></div>
              <div className={styles.timelineContent}>Healthy battery. AI onboarding & driving analytics baseline.</div>
            </div>
            <div className={styles.timelineNode}>
              <div className={styles.timelineYear}>YEAR 3</div>
              <div className={styles.timelineDot}></div>
              <div className={styles.timelineContent}>Warranty nearing expiry. AI recommends service.</div>
            </div>
            <div className={styles.timelineNode}>
              <div className={styles.timelineYear}>YEAR 5</div>
              <div className={styles.timelineDot}></div>
              <div className={styles.timelineContent}>Extended warranty. Charging stress detected.</div>
            </div>
            <div className={styles.timelineNode}>
              <div className={styles.timelineYear}>YEAR 6</div>
              <div className={styles.timelineDot}></div>
              <div className={styles.timelineContent}>Minor battery imbalance. Fast charging stress increases.</div>
            </div>
            <div className={styles.timelineNode}>
              <div className={styles.timelineYear}>YEAR 7</div>
              <div className={styles.timelineDot}></div>
              <div className={styles.timelineContent}>Thermal trend anomalies. AI issues proactive alerts.</div>
            </div>
            <div className={`${styles.timelineNode} ${styles.timelineCritical}`}>
              <div className={styles.timelineYear}>YEAR 8</div>
              <div className={styles.timelineDot}></div>
              <div className={styles.timelineContent}>Degradation visible. Motor derating & critical diagnostics.</div>
            </div>
          </div>
        </div>
      </section>

      {/* USE CASE 1: PREDICTIVE MAINTENANCE */}
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
              <div className={styles.layerLabel}><div className={styles.layerLabelDot} /> Layer 1 — Human Dialog</div>
              <div className={styles.chatContainer}>
                <ChatBubble type="ai" sender="EV.ENGINEER" time="10:00 AM" text="Hello Mr. Rajesh, I’m EV.ENGINEER. I noticed your EV-CAR-2026 is approaching its 3-year warranty expiration next month." />
                <ChatBubble type="user" sender="EV User" time="10:01 AM" text="Oh, hi. Yes, I remember. Is something wrong with the battery?" />
                <ChatBubble type="ai" sender="EV.ENGINEER" time="10:01 AM" text="No need to worry! The overall health is great. However, my telemetry analysis noticed a slight degradation trend in the battery health (SOH) over the last 15 fast-charging sessions." />
                <ChatBubble type="ai" sender="EV.ENGINEER" time="10:01 AM" text="It is completely normal, but I'd suggest a quick cooling system inspection to ensure peak performance and lock in your warranty coverage." />
                <ChatBubble type="user" sender="EV User" time="10:02 AM" text="Ah, that makes sense. Thanks for catching that. Can we schedule it?" />
              </div>
            </div>

            <div className={styles.layer}>
              <div className={styles.layerLabel}><div className={styles.layerLabelDot} /> Layer 2 — System Processing</div>
              <Terminal title="EV.SYSTEM ( Telemetry & Diagnostics Pipeline )" jsonLines={[
                <span key="1"><span className={styles.termPrefix}>[SYS]</span> 2026-10-04T10:00:12Z | Ingesting MQTT Packets...</span>,
                <span key="2" className={styles.termModule}>&#123;</span>,
                <span key="3">&nbsp;&nbsp;<span className={styles.termKey}>"telemetryId"</span>: <span className={styles.termString}>"TEL-90812-A"</span>,</span>,
                <span key="4">&nbsp;&nbsp;<span className={styles.termKey}>"vehicleId"</span>: <span className={styles.termString}>"EV-CAR-2026-VIN982"</span>,</span>,
                <span key="5">&nbsp;&nbsp;<span className={styles.termKey}>"odometer_km"</span>: <span className={styles.termNumber}>42105</span>,</span>,
                <span key="6">&nbsp;&nbsp;<span className={styles.termKey}>"battery_soh"</span>: <span className={styles.termNumber}>94.2</span>,</span>,
                <span key="7">&nbsp;&nbsp;<span className={styles.termKey}>"fast_charge_cycles"</span>: <span className={styles.termNumber}>112</span>,</span>,
                <span key="8">&nbsp;&nbsp;<span className={styles.termKey}>"soh_degradation_trend"</span>: <span className={styles.termString}>"marginal_increase"</span>,</span>,
                <span key="9">&nbsp;&nbsp;<span className={styles.termKey}>"predictive_risk_score"</span>: <span className={styles.termNumber}>0.12</span></span>,
                <span key="10">&#125;</span>,
                <span key="11" className={styles.termComment}>// Analyzing degradation curve...</span>,
                <span key="12" className={styles.termComment}>// Triggering Orchestration: [Conversation Agent] + [Ticketing Agent]</span>
              ]} />
            </div>

            <div className={styles.layer}>
              <div className={styles.layerLabel}><div className={styles.layerLabelDot} /> Layer 3 — Engineering Insights</div>
              <div className={styles.insightCards}>
                <div className={styles.insightCard}>
                  <div className={styles.insightCardTitle}>Battery Health (SOH) Trend</div>
                  <div className={styles.insightValue}>94.2%</div>
                  <div className={styles.insightBar}><div className={`${styles.insightBarFill} ${styles.barGreen}`} style={{ width: '94%' }}></div></div>
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

      {/* USE CASE 2: PREDICTIVE SERVICE ALERT */}
      <section id="case2" className="container">
        <div className={styles.useCaseSection}>
          <div className={styles.useCaseHeader}>
            <div>
              <div className={styles.useCaseNum}>Use Case 2</div>
              <h2 className={styles.useCaseTitle}>Service Alert (Year 5 Warranty Expiry)</h2>
              <div className={styles.useCaseMeta}>
                <span className={styles.metaChip}>Vehicle: EV-SUV-2024</span>
                <span className={styles.metaChip}>Odometer: 85,300 km</span>
                <span className={`${styles.severityChip} ${styles.severityNormal}`}>Predictive AI</span>
                <span className={`${styles.severityChip} ${styles.severityHigh}`} style={{ marginLeft: '0.5rem', background: 'rgba(255, 165, 0, 0.12)', color: '#ffad00', borderColor: 'rgba(255, 165, 0, 0.3)' }}>Moderate Depth</span>
              </div>
            </div>
            <ArchitectureAccordion
              title="View Technical Architecture"
              nodes={[
                { label: "Fleet Telemetry API" },
                { label: "Thermal Prediction Model", active: true },
                { label: "Conversation Agent" },
                { label: "CRM Ticketing" }
              ]}
            />
          </div>

          <div className={styles.layerGrid}>
            <div className={styles.layer}>
              <div className={styles.layerLabel}><div className={styles.layerLabelDot} /> Layer 1 — Human Dialog</div>
              <div className={styles.chatContainer}>
                <ChatBubble type="ai" sender="EV.ENGINEER" time="15:30 PM" text="Hello Mrs. Sharma, this is EV.ENGINEER. I hope you're having a good day. I'm reaching out because your extended warranty is expiring in exactly 45 days." />
                <ChatBubble type="user" sender="EV User" time="15:31 PM" text="Oh really? I hadn't realized. Is everything alright with the car? Last time I fast-charged it seemed a bit loud." />
                <ChatBubble type="ai" sender="EV.ENGINEER" time="15:31 PM" text="I'm glad you mentioned that! I checked the thermal drift history, and I did notice slightly elevated battery temperatures during repeated DC fast charging sessions over the past 90 days. The cooling fan is working harder than usual, which explains the noise." />
                <ChatBubble type="ai" sender="EV.ENGINEER" time="15:32 PM" text="Before your warranty expires, I strongly recommend scheduling a cooling loop inspection. It will be completely covered, and it will prevent any thermal stress on the battery long-term." />
                <ChatBubble type="user" sender="EV User" time="15:32 PM" text="Wow, thank you so much for catching that. Yes, let's schedule it." />
              </div>
            </div>

            <div className={styles.layer}>
              <div className={styles.layerLabel}><div className={styles.layerLabelDot} /> Layer 2 — System Processing</div>
              <Terminal title="EV.SYSTEM ( Thermal Risk Orchestrator )" jsonLines={[
                <span key="1"><span className={styles.termPrefix}>[SYS]</span> 2026-10-15T15:31:02Z | Querying Thermal DB...</span>,
                <span key="2" className={styles.termModule}>&#123;</span>,
                <span key="3">&nbsp;&nbsp;<span className={styles.termKey}>"queryId"</span>: <span className={styles.termString}>"THRM-EV-SUV-2024"</span>,</span>,
                <span key="4">&nbsp;&nbsp;<span className={styles.termKey}>"dc_fast_charge_count_90d"</span>: <span className={styles.termNumber}>24</span>,</span>,
                <span key="5">&nbsp;&nbsp;<span className={styles.termKey}>"avg_peak_temp_c"</span>: <span className={styles.termNumber}>48.5</span>,</span>,
                <span key="6">&nbsp;&nbsp;<span className={styles.termKey}>"cooling_pump_duty_cycle"</span>: <span className={styles.termString}>"98% (High)"</span>,</span>,
                <span key="7">&nbsp;&nbsp;<span className={styles.termKey}>"forecast_6mo"</span>: <span className={styles.termString}>"Thermal Throttling Likely"</span></span>,
                <span key="8">&#125;</span>,
                <span key="9" className={styles.termComment}>// Orchestrating Agentic Workflow:</span>,
                <span key="10" className={styles.termHighlight}>&gt; Agent[Conversation] - Generate reassuring prompt</span>,
                <span key="11" className={styles.termHighlight}>&gt; Agent[Ticketing] - Draft 'Cooling Loop Flush'</span>
              ]} />
            </div>

            <div className={styles.layer}>
              <div className={styles.layerLabel}><div className={styles.layerLabelDot} /> Layer 3 — Engineering Insights</div>
              <div className={styles.insightCards}>
                <div className={styles.insightCard}>
                  <div className={styles.insightCardTitle}>Thermal Stress Prediction</div>
                  <div className={`${styles.insightValue} ${styles.insightValueWarn}`}>48.5°C</div>
                  <div className={styles.insightBar}><div className={`${styles.insightBarFill} ${styles.barYellow}`} style={{ width: '75%' }}></div></div>
                  <div className={styles.insightSubtext}>Avg peak temp during DCFC. Normal is &lt;42°C.</div>
                </div>
                <div className={styles.insightCard}>
                  <div className={styles.insightCardTitle}>Pump Duty Cycle Trend</div>
                  <div className={styles.sohGraph} style={{ marginTop: 0, border: 'none', padding: 0, background: 'transparent' }}>
                    <div className={styles.sohBars} style={{ height: '40px' }}>
                      <div className={styles.sohBar} style={{ height: '30%', background: '#4CA930' }}></div>
                      <div className={styles.sohBar} style={{ height: '40%', background: '#4CA930' }}></div>
                      <div className={styles.sohBar} style={{ height: '70%', background: '#fbbf24' }}></div>
                      <div className={styles.sohBar} style={{ height: '85%', background: '#fbbf24' }}></div>
                      <div className={styles.sohBar} style={{ height: '98%', background: '#ff6b6b' }}></div>
                    </div>
                  </div>
                  <div className={styles.insightSubtext} style={{ marginTop: '0.5rem' }}>Cooling pump working at maximum capacity.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* USE CASE 3: BATTERY FAST DRAIN */}
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
              <div className={styles.layerLabel}><div className={styles.layerLabelDot} /> Layer 1 — Human Dialog</div>
              <div className={styles.chatContainer}>
                <ChatBubble type="user" sender="EV User" time="14:20 PM" text="My car's range is dropping really fast. I charged it to 100% but it dropped to 80% after just 5 kilometers. I'm worried this is going to cost a fortune to replace." />
                <ChatBubble type="ai" sender="EV.ENGINEER" time="14:20 PM" text="I completely understand your frustration. Sudden range drops can be very stressful. Let's figure this out together. I'm running a quick diagnostic on your battery health." />
                <ChatBubble type="ai" sender="EV.ENGINEER" time="14:21 PM" text="I see your vehicle is at 168,000 km. The diagnostics show an increase in internal resistance, which explains the fast drain. Don't worry, we don't necessarily need to replace the whole pack—we might just need a module rebalancing." />
                <ChatBubble type="user" sender="EV User" time="14:21 PM" text="Oh, that’s a relief. Can I bring it in today?" />
              </div>
            </div>

            <div className={styles.layer}>
              <div className={styles.layerLabel}><div className={styles.layerLabelDot} /> Layer 2 — System Processing</div>
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
              <div className={styles.layerLabel}><div className={styles.layerLabelDot} /> Layer 3 — Engineering Insights</div>
              <div className={styles.insightCards}>
                <div className={styles.insightCard}>
                  <div className={styles.insightCardTitle}>Internal Resistance Trend</div>
                  <div className={`${styles.insightValue} ${styles.insightValueWarn}`}>18.4 mΩ</div>
                  <div className={styles.insightSubtext}>High resistance causing voltage sag and fast SOC drops.</div>
                </div>
                <div className={styles.sohGraph}>
                  <div className={styles.sohTitle}>Historical Degradation (SOH)</div>
                  <div className={styles.sohBars}>
                    <div className={styles.sohBar} style={{ height: '100%' }}></div>
                    <div className={styles.sohBar} style={{ height: '92%' }}></div>
                    <div className={styles.sohBar} style={{ height: '85%' }}></div>
                    <div className={styles.sohBar} style={{ height: '78%' }}></div>
                    <div className={`${styles.sohBar} ${styles.sohBarWarn}`} style={{ height: '71%' }}></div>
                  </div>
                  <div className={styles.sohLabels}><span>Yr 1</span><span>Yr 8</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* USE CASE 4: BATTERY OVERHEATING (SAFETY CRITICAL) */}
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
              <div className={styles.layerLabel}><div className={styles.layerLabelDot} /> Layer 1 — Human Dialog</div>
              <div className={styles.chatContainer}>
                <ChatBubble type="user" sender="EV User" time="18:05 PM" text="My dashboard is showing a red temperature warning, and the charging stopped automatically." />
                <ChatBubble type="ai" sender="EV.ENGINEER" time="18:05 PM" text="I am detecting abnormal thermal activity in your battery pack. This may become a safety issue. For your safety, I have locked the charging port." />
                <ChatBubble type="ai" sender="EV.ENGINEER" time="18:06 PM" text="Please step away from the vehicle. Do not attempt to charge or ride it. I am escalating this immediately to our critical response team." />
              </div>
            </div>

            <div className={styles.layer}>
              <div className={styles.layerLabel}><div className={styles.layerLabelDot} /> Layer 2 — System Processing</div>
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
              <div className={styles.layerLabel}><div className={styles.layerLabelDot} /> Layer 3 — Engineering Insights</div>
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
                    <div className={styles.actionStepText}>HV Contactors opened. Service team dispatched.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* USE CASE 5: MOTOR FAILURE & TECHNICIAN COPILOT */}
      <section id="case5" className="container">
        <div className={styles.useCaseSection}>
          <div className={styles.useCaseHeader}>
            <div>
              <div className={styles.useCaseNum}>Use Case 5</div>
              <h2 className={styles.useCaseTitle}>Motor Torque Loss (Technician Copilot)</h2>
              <div className={styles.useCaseMeta}>
                <span className={styles.metaChip}>Vehicle: EV-SEDAN-2025</span>
                <span className={styles.metaChip}>Technician Mode</span>
                <span className={`${styles.severityChip} ${styles.severityNormal}`}>Diagnostics Copilot</span>
                <span className={`${styles.severityChip} ${styles.severityHigh}`} style={{ marginLeft: '0.5rem', background: 'rgba(76, 169, 48, 0.12)', color: 'var(--accent-primary)', borderColor: 'rgba(76, 169, 48, 0.3)' }}>Deep Engineering Depth</span>
              </div>
            </div>
            <ArchitectureAccordion
              title="View Technical Architecture"
              nodes={[
                { label: "EV Technician" },
                { label: "Diagnostics Copilot Agent", active: true },
                { label: "CAN Packet Analyzer" },
                { label: "Inverter Telemetry DB" }
              ]}
            />
          </div>

          <div className={styles.layerGrid}>
            <div className={styles.layer}>
              <div className={styles.layerLabel}><div className={styles.layerLabelDot} /> Layer 1 — Engineering Workflow</div>
              <div className={styles.chatContainer}>
                <ChatBubble type="user" sender="EV Technician" time="09:12 AM" text="EV.ENGINEER, fetch CAN packet history for EV-SEDAN-2025. The customer reported weak acceleration and vibration. Analyze inverter current spikes over the last 3 drive cycles." />
                <ChatBubble type="ai" sender="EV.ENGINEER" time="09:13 AM" text="Retrieving high-frequency CAN logs..." />
                <ChatBubble type="ai" sender="EV.ENGINEER" time="09:13 AM" text="Analysis complete. I found anomalous Phase B current spikes (up to 420A) in the rear inverter during hard acceleration. The vibration correlates exactly with these spikes. This indicates a potential IGBT gating issue or a degraded resolver sensor on the motor." />
                <ChatBubble type="user" sender="EV Technician" time="09:14 AM" text="Compare the Phase B spikes against Phase A and C. Show me the fault isolation logic." />
                <ChatBubble type="ai" sender="EV.ENGINEER" time="09:15 AM" text="Phase A and C are stable at ~310A max. Phase B shows severe asymmetry. Fault isolation points to the Inverter Power Module (IPM) with 85% confidence, rather than the motor winding itself. Recommend running the stationary IPM diagnostic sequence." />
              </div>
            </div>

            <div className={styles.layer}>
              <div className={styles.layerLabel}><div className={styles.layerLabelDot} /> Layer 2 — System Processing</div>
              <Terminal title="EV.SYSTEM ( High-Frequency Telemetry Parser )" jsonLines={[
                <span key="1"><span className={styles.termPrefix}>[SYS]</span> Extracting 10ms CAN logs [0x2A1_INV_CURR]...</span>,
                <span key="2" className={styles.termModule}>&#123;</span>,
                <span key="3">&nbsp;&nbsp;<span className={styles.termKey}>"can_timestamp"</span>: <span className={styles.termString}>"1696420102.405"</span>,</span>,
                <span key="4">&nbsp;&nbsp;<span className={styles.termKey}>"phase_a_rms_amp"</span>: <span className={styles.termNumber}>305.2</span>,</span>,
                <span key="5">&nbsp;&nbsp;<span className={styles.termKey}>"phase_b_rms_amp"</span>: <span className={styles.termNumber}>421.8</span>, <span className={styles.termComment}>// Anomaly</span></span>,
                <span key="6">&nbsp;&nbsp;<span className={styles.termKey}>"phase_c_rms_amp"</span>: <span className={styles.termNumber}>312.0</span>,</span>,
                <span key="7">&nbsp;&nbsp;<span className={styles.termKey}>"resolver_angle_deg"</span>: <span className={styles.termNumber}>142.5</span>,</span>,
                <span key="8">&nbsp;&nbsp;<span className={styles.termKey}>"dtc_code"</span>: <span className={styles.termString}>"P0A78"</span></span>,
                <span key="9">&#125;</span>,
                <span key="10" className={styles.termComment}>// Running Phase Asymmetry ML Model...</span>,
                <span key="11" className={styles.termHighlight}>&gt; Fault Isolation: Inverter IPM (Phase B)</span>
              ]} />
            </div>

            <div className={styles.layer}>
              <div className={styles.layerLabel}><div className={styles.layerLabelDot} /> Layer 3 — Engineering Insights</div>
              <div className={styles.insightCards}>
                <div className={styles.insightCard}>
                  <div className={styles.insightCardTitle}>Inverter Phase Asymmetry</div>
                  <div className={styles.insightValue}>Δ116 A</div>
                  <div className={styles.insightBar}><div className={`${styles.insightBarFill} ${styles.barRed}`} style={{ width: '90%' }}></div></div>
                  <div className={styles.insightSubtext}>Phase B exceeds Phase A/C by 116A. Threshold is 20A.</div>
                </div>
                <div className={styles.insightCard}>
                  <div className={styles.insightCardTitle}>Repair Recommendation</div>
                  <div className={styles.actionPlan} style={{ marginTop: '0.5rem' }}>
                    <div className={styles.actionStepText}>Do not replace drive unit. Initiate stationary IPM diagnostic sequence (SOP-INV-012) to verify IGBT gate driver integrity.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* USE CASE 6: REMOTE TECHNICIAN ANALYSIS */}
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
              <div className={styles.layerLabel}><div className={styles.layerLabelDot} /> Layer 1 — Engineering Request</div>
              <div className={styles.chatContainer}>
                <ChatBubble type="user" sender="EV Technician" time="09:15 AM" text="Fetch CAN telemetry for EV-CAR-2026. Analyze thermal drift and compare historical degradation across the last 100 fast charging cycles." />
                <ChatBubble type="ai" sender="EV.ENGINEER" time="09:16 AM" text="Retrieving telemetry..." />
                <ChatBubble type="ai" sender="EV.ENGINEER" time="09:16 AM" text="Analysis complete. Cell imbalance is at 145mV (Module 4). Thermal drift identified during DC fast charging above 50kW. RAG Knowledge base suggests SOP-BATT-042: Initiate deep balancing cycle before replacing module." />
              </div>
            </div>

            <div className={styles.layer}>
              <div className={styles.layerLabel}><div className={styles.layerLabelDot} /> Layer 2 — System Processing</div>
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
              <div className={styles.layerLabel}><div className={styles.layerLabelDot} /> Layer 3 — Engineering Insights</div>
              <div className={styles.insightCards}>
                <div className={styles.insightCard}>
                  <div className={styles.insightCardTitle}>Cell Imbalance Analysis</div>
                  <div className={styles.insightValue}>145 mV</div>
                  <div className={styles.insightBar}><div className={`${styles.insightBarFill} ${styles.barYellow}`} style={{ width: '60%' }}></div></div>
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

      {/* AGENTIC AI ORCHESTRATION */}
      <section className="container">
        <div className={styles.agenticContainer}>
          <h2 className={styles.agenticTitle}>Agentic AI Workflow Orchestration</h2>
          <div className={styles.agenticGrid}>
            <div className={styles.agentCard}>
              <div className={styles.agentCardIcon}>🗣️</div>
              <div className={styles.agentCardName}>Conversation Agent</div>
            </div>
            <div className={styles.agentCard}>
              <div className={styles.agentCardIcon}>🩺</div>
              <div className={styles.agentCardName}>Diagnostics Agent</div>
            </div>
            <div className={styles.agentCard}>
              <div className={styles.agentCardIcon}>🛡️</div>
              <div className={styles.agentCardName}>Safety Agent</div>
            </div>
            <div className={styles.agentCard}>
              <div className={styles.agentCardIcon}>🔋</div>
              <div className={styles.agentCardName}>Battery Intelligence</div>
            </div>
            <div className={styles.agentCard}>
              <div className={styles.agentCardIcon}>📚</div>
              <div className={styles.agentCardName}>RAG Knowledge</div>
            </div>
            <div className={styles.agentCard}>
              <div className={styles.agentCardIcon}>🎫</div>
              <div className={styles.agentCardName}>Ticketing Agent</div>
            </div>
            <div className={styles.agentCard}>
              <div className={styles.agentCardIcon}>⚠️</div>
              <div className={styles.agentCardName}>Escalation Agent</div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON: WHY THIS PLATFORM IS DIFFERENT */}
      <section className="container">
        <div className={styles.sectionHeader} style={{ marginTop: "4rem", marginBottom: "1rem" }}>
          <span className={styles.sectionNumber}>The Advantage</span>
          <h2 className={styles.sectionTitle}>Why This Platform is Different</h2>
        </div>
        <div className={styles.comparisonGrid}>
          <div className={styles.compareCard}>
            <div className={styles.compareHeader}>Traditional EV Support</div>
            <div className={styles.compareList}>
              <div className={styles.compareItem}><span className={`${styles.compareIcon} ${styles.compareIconCon}`}>✖</span> Reactive & FAQ-based chatbot</div>
              <div className={styles.compareItem}><span className={`${styles.compareIcon} ${styles.compareIconCon}`}>✖</span> Highly dependent on human escalations</div>
              <div className={styles.compareItem}><span className={`${styles.compareIcon} ${styles.compareIconCon}`}>✖</span> No direct telemetry integration</div>
              <div className={styles.compareItem}><span className={`${styles.compareIcon} ${styles.compareIconCon}`}>✖</span> Generic advice, lacks engineering depth</div>
            </div>
          </div>
          <div className={`${styles.compareCard} ${styles.compareCardPro}`}>
            <div className={`${styles.compareHeader} ${styles.compareProHeader}`}>EV.ENGINEER AI Support</div>
            <div className={styles.compareList}>
              <div className={styles.compareItem}><span className={`${styles.compareIcon} ${styles.compareIconPro}`}>✔</span> Predictive & Proactive Agentic Workflow</div>
              <div className={styles.compareItem}><span className={`${styles.compareIcon} ${styles.compareIconPro}`}>✔</span> Autonomous diagnostics & repair planning</div>
              <div className={styles.compareItem}><span className={`${styles.compareIcon} ${styles.compareIconPro}`}>✔</span> Direct high-frequency CAN/MQTT integration</div>
              <div className={styles.compareItem}><span className={`${styles.compareIcon} ${styles.compareIconPro}`}>✔</span> Deep battery intelligence & thermal modeling</div>
            </div>
          </div>
        </div>
      </section>

      {/* FUTURE VISION */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Future Vision</span>
            <h2 className={styles.sectionTitle}>The Autonomous EV Engineering Ecosystem</h2>
            <p className={styles.sectionSubtitle}>
              EV.ENGINEER is building the future AI-native infrastructure for EV diagnostics, battery intelligence, predictive maintenance, and autonomous engineering support.
            </p>
          </div>
          <div className={styles.visionGrid}>
            <div className={styles.visionCard}>
              <div className={styles.visionIcon}>🧠</div>
              <div className={styles.visionCardTitle}>Battery Digital Twin</div>
              <div className={styles.visionCardDesc}>Real-time simulation of battery pack physics to predict degradation and thermal events accurately.</div>
            </div>
            <div className={styles.visionCard}>
              <div className={styles.visionIcon}>📡</div>
              <div className={styles.visionCardTitle}>EV Telemetry Intelligence</div>
              <div className={styles.visionCardDesc}>Ingesting millions of CAN/MQTT data points to provide fleet-wide observability and insight.</div>
            </div>
            <div className={styles.visionCard}>
              <div className={styles.visionIcon}>⚡</div>
              <div className={styles.visionCardTitle}>SI-EMS Integration</div>
              <div className={styles.visionCardDesc}>Super-Intelligent AI Energy Management Systems actively mitigating issues on the fly.</div>
            </div>
            <div className={styles.visionCard}>
              <div className={styles.visionIcon}>🔗</div>
              <div className={styles.visionCardTitle}>Battery Pack Aadhaar</div>
              <div className={styles.visionCardDesc}>End-to-end lifecycle tracking integrating with circular economy models and secondary life.</div>
            </div>
          </div>
        </div>
      </section>

      {/* AUTHOR & ARCHITECT BLOCK */}
      <section className={styles.pageSection} style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "4rem", paddingBottom: "2rem" }}>
        <div className="container" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div className="glass-panel" style={{ padding: "2rem", borderLeft: "4px solid var(--accent-primary)", textAlign: "left" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--accent-primary)", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px", letterSpacing: "1px" }}>EV.ENGINEER™</p>
            <h3 style={{ fontSize: "1.8rem", marginBottom: "8px", color: "#fff", fontWeight: 700 }}>Sudarshana Karkala</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "12px" }}>Co-Founder, Principal Architect | Thasmai Infotech Private Limited</p>
            <div style={{
              display: "inline-block",
              fontSize: "0.85rem",
              padding: "8px 14px",
              marginBottom: "16px",
              borderRadius: "6px",
              background: "linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.08))",
              borderLeft: "3px solid var(--accent-primary)",
              color: "#fff"
            }}>
              Available for strategic architectural consulting and advanced automotive R&D partnerships.
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.85rem", flexWrap: "wrap" }}>
              <a href="tel:+919845561518" style={{ color: "var(--accent-primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>📞</span> +91 9845561518
              </a>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
              <a href="https://www.linkedin.com/in/sudarshanakarkala/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>🔗</span> LinkedIn Profile
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className={styles.pageSection} style={{ textAlign: 'center' }}>
        <div className="container">
          <div className={styles.heroCtas}>
            <Link href="/internships/ev-help-agent" className="btn btn-secondary" data-track-event="usecases_back_click">Back to EV Help Agent</Link>
            <Link href="/internships" className="btn btn-primary" data-track-event="usecases_internships_click">Explore All Internships</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
