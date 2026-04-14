import TopicPage from "@/components/TopicPage";

export const metadata = {
  title: "EV Battery Diagnostics for AVs | EV.ENGINEER™",
  description: "Thermal behavior, predictive maintenance, and battery health tailored for autonomous fleet demands.",
};

export default function BatteryDiagnosticsPage() {
  return (
    <TopicPage
      title="EV Battery Health & Diagnostics"
      subtitle="Sustaining the power foundation of autonomous fleets."
      execSummary={
        <p>Autonomous Vehicles inherently run on Electric Vehicle platforms, but their duty cycles are vastly different from consumer EVs. An AV orchestrating constant sensor operation, massive data compute, and near 24/7 routing severely accelerates battery degradation without specialized diagnostic intelligence.</p>
      }
      whyItMatters={
        <p>A human driver can manage a degrading battery manually; an autonomous fleet cannot. Battery intelligence directly defines fleet uptime, ROI, and thermal safety. A stranded Robotaxi due to miscalculated State of Charge (SOC) disrupts the entire operational domain.</p>
      }
      basics={
        <>
          <p><strong>Battery Health (SOH & SOP):</strong> Monitoring State of Health (capacity fade) and State of Power (ability to deliver burst current). Crucial for calculating true remaining range.</p>
          <p><strong>Why EV Battery Intelligence Matters for AV:</strong> The AV compute trunk operates at high continuous wattage. If battery diagnostics are inaccurate, the vehicle may attempt a route it cannot physically complete, necessitating emergency intervention.</p>
        </>
      }
      midLevel={
        <>
          <p><strong>Duty-Cycle Considerations:</strong> Consumer EVs sit parked 95% of the time. Autonomous passenger taxis or airport cargo EVs run near-continuous loop cycles, vastly accelerating electrochemical degradation and impacting thermal behavior.</p>
          <p><strong>Predictive Maintenance:</strong> Transitioning from scheduled maintenance to condition-based maintenance via cloud-based AI models analyzing cell-level voltage deviations, preventing catastrophic module failure.</p>
        </>
      }
      advanced={
        <>
          <p><strong>Thermal Risk & Charging Optimization:</strong> Continuous fast charging generates extreme heat. Cloud AI orchestrates fleet charging schedules to balance charging speeds against degradation limits, maximizing total fleet lifecycle efficiency.</p>
          <p><strong>Use Case Specific Strategies:</strong> Airport Cargo EVs operating in high ambient temperatures require different derating algorithms than urban passenger taxis navigating stop-and-go congestion.</p>
        </>
      }
      keyTakeaways={
        <ul>
          <li>• AV compute demands severely impact traditional range estimations.</li>
          <li>• 24/7 duty cycles require predictive, not reactive, battery analytics.</li>
          <li>• Optimizing charging speed vs. thermal degradation is critical for fleet economics.</li>
        </ul>
      }
    />
  );
}
