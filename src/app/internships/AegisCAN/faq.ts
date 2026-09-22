/**
 * Single source of truth for the AegisCAN FAQ — rendered as the visible,
 * server-rendered accordion in AegisCANContent.tsx AND as the FAQPage
 * JSON-LD in page.tsx. Keeping one array for both means the structured
 * data can never drift from what a visitor actually reads on the page.
 */
export type FaqEntry = { question: string; answer: string };

export const AEGISCAN_FAQ: FaqEntry[] = [
  {
    question: "What is AegisCAN?",
    answer:
      "AegisCAN is a 12-week educational R&D mini-project for E&C/ECE/EEE/EE students. Students build a simulation-based CAN monitoring and anomaly-detection prototype while learning Battery, BMS, BESS, CAN communication, validation engineering and embedded cybersecurity.",
  },
  {
    question: "Who initiated and leads AegisCAN?",
    answer: "AegisCAN was initiated and is led by Tanuja Jadhav, Lead Researcher · EV.ENGINEER™.",
  },
  {
    question: "Who contributes to cybersecurity research for AegisCAN?",
    answer: "Bhavya Naga Sai Parvathi Kshatri contributes as Cybersecurity Researcher · EV.ENGINEER™.",
  },
  {
    question: "Who is the Co-Researcher for AegisCAN?",
    answer: "Sudarshana Karkala contributes as Co-Researcher · EV.ENGINEER™.",
  },
  {
    question: "What do students learn through AegisCAN?",
    answer:
      "Battery, BMS, BESS, CAN communication, validation, fault injection, cybersecurity, Python, testing and root cause analysis — connected through one 12-week engineering project.",
  },
  {
    question: "Is AegisCAN suitable for E&C/ECE/EEE/EE students?",
    answer:
      "Yes. AegisCAN is scoped for beginners — 5th-semester students with basic electronics, circuits and programming — across 12 weeks at roughly 4–6 hours per week alongside regular coursework.",
  },
  {
    question: "Does AegisCAN cover BESS?",
    answer:
      "Yes. Students learn BESS architecture and its data/communication layer through simulation, without needing to build a real high-voltage BESS.",
  },
  {
    question: "Does AegisCAN use PyBaMM?",
    answer:
      "PyBaMM is an optional advanced battery-modelling track for students who progress faster. It is not required to complete AegisCAN.",
  },
  {
    question: "Is AI/ML required?",
    answer:
      "No. Core anomaly detection uses rules, thresholds, timing analysis and statistical analysis. AI/ML is an optional advanced experiment on top of that.",
  },
  {
    question: "Is AegisCAN a production cybersecurity product?",
    answer:
      "No. AegisCAN is an educational and research prototype — not a production BMS, commercial intrusion-detection system, certified automotive/aerospace cybersecurity product, or safety-certified BESS controller.",
  },
];
