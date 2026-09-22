export type FaqEntry = { question: string; answer: string };

/**
 * Single source of truth for the visible FAQ accordion and the FAQPage
 * JSON-LD in page.tsx — keeps both in sync.
 */
export const EV_AUTO_RICKSHAW_FAQ: FaqEntry[] = [
  {
    question: "How large should an electric auto battery be?",
    answer:
      "It depends on the duty cycle: daily distance, terrain, traffic, payload, speed and whether AC is used. This simulator sizes the battery from your inputs rather than assuming one fixed capacity for every vehicle.",
  },
  {
    question: "Is 15 kWh necessary?",
    answer:
      "Not always. A larger battery increases range but also mass, cost and charging time. For moderate daily distances with overnight charging, a smaller pack in the 8–12 kWh range is often the lower-total-cost choice.",
  },
  {
    question: "Why is LFP recommended?",
    answer:
      "LFP offers thermal stability, longer cycle life and generally lower cost per kWh — well suited to high daily-utilization commercial duty cycles. NMC can offer higher pack-level specific energy where mass is the binding constraint.",
  },
  {
    question: "How long will charging take?",
    answer:
      "Estimated from energy required divided by effective charger power, with an allowance for CC-CV taper above 80% SOC. Actual time depends on battery temperature, BMS limits, charger behaviour and cell chemistry.",
  },
  {
    question: "Is battery swapping better?",
    answer:
      "It depends on utilization and infrastructure availability. Fixed battery is the default cost-optimized configuration; swapping adds vehicle hardware cost and requires separate station infrastructure investment.",
  },
  {
    question: "What motor power is needed for six passengers?",
    answer:
      "This simulator sizes peak motor power from the vehicle's full-load mass, the maximum speed requirement and a terrain-based gradeability target — typically in the 8–18 kW range for a D+6 configuration, not a single fixed number.",
  },
  {
    question: "How much can an electric auto cost?",
    answer:
      "Concept-stage planning estimates for this program range roughly ₹3.3–5.2+ lakh depending on battery size, motor size, software tier and features — derived component-by-component in the Cost section, not a single hardcoded price.",
  },
  {
    question: "How is real-world range estimated?",
    answer:
      "From a simplified road-load model (rolling resistance, aerodynamic drag, drivetrain efficiency, terrain and traffic loss factors, auxiliary load) divided into the usable battery energy — shown as a Light Load / Typical / Full Load band, not one optimistic number.",
  },
  {
    question: "How much does the battery weigh?",
    answer:
      "Estimated from a configurable pack-level specific energy assumption (Wh/kg). Final weight depends on the cell supplier, enclosure, cooling and structural protection chosen during detailed engineering.",
  },
  {
    question: "Can the battery be replaced?",
    answer:
      "The default architecture uses a fixed, service-replaceable pack. A swap-ready configuration is also modelled as an option with separate vehicle and infrastructure cost implications.",
  },
  {
    question: "What happens after battery degradation?",
    answer:
      "See the Battery Circular Economy project for second-life qualification, stationary BESS reuse and recycling economics once a pack no longer meets vehicle-duty requirements.",
  },
  {
    question: "Does the simulator represent a production vehicle?",
    answer:
      "No. It is a concept-level engineering and business simulation platform for research, product planning and feasibility evaluation — not a production specification, and not a homologated or certified vehicle.",
  },
];
