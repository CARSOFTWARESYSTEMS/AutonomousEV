import React, { useState } from 'react';
import styles from './usecases.module.css';

// Reusable flow diagram component
export const FlowDiagram = ({ nodes, direction = "horizontal" }: any) => {
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
export const ArchitectureAccordion = ({ title, nodes }: { title: string, nodes: any[] }) => {
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
export const ChatBubble = ({ sender, text, time, type }: { sender: string, text: string, time: string, type: "user" | "ai" }) => (
  <div className={`${styles.chatBubble} ${type === "ai" ? styles.chatBubbleAI : styles.chatBubbleUser}`}>
    <div className={`${styles.bubbleSender} ${type === "ai" ? styles.senderAI : styles.senderUser}`}>{sender}</div>
    <div className={`${styles.bubbleText} ${type === "ai" ? styles.bubbleTextAI : styles.bubbleTextUser}`}>{text}</div>
    <div className={styles.bubbleTime}>{time}</div>
  </div>
);

// Terminal JSON view
export const Terminal = ({ title, jsonLines }: { title: string, jsonLines: React.ReactNode[] }) => (
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
