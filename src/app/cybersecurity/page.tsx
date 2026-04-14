import TopicPage from "@/components/TopicPage";

export const metadata = {
  title: "AV Cybersecurity | EV.ENGINEER™",
  description: "Protecting attack surfaces, in-vehicle networks, and V2X infrastructure.",
};

export default function CybersecurityPage() {
  return (
    <TopicPage
      title="Cybersecurity in Autonomous Vehicles"
      subtitle="Securing the intersection of physical safety and digital connectivity."
      execSummary={
        <p>As vehicles transition from isolated mechanical units to hyper-connected rolling datacenters, the cybersecurity attack surface expands exponentially. In the context of an AV, a successful cyber attack directly equates to kinetic physical danger.</p>
      }
      whyItMatters={
        <p>The traditional IT security triad of Confidentiality, Integrity, and Availability (CIA) shifts priorities in operational tech. For AVs, Integrity and Availability govern functional safety. Cybersecurity-by-design is a fundamental requirement, not a post-production patch.</p>
      }
      basics={
        <>
          <p><strong>Attack Surfaces:</strong> Physical ports (OBD-II, USB), Short-range wireless (Bluetooth, Wi-Fi, Keyless Entry), and Long-range connectivity (Cellular/5G, Telematics control units).</p>
          <p><strong>In-Vehicle Networks:</strong> Legacy protocols like CAN (Controller Area Network) were built for reliability, not security (they lack inherent authentication). Securing internal communication against lateral movement is critical.</p>
        </>
      }
      midLevel={
        <>
          <p><strong>OTA Security:</strong> Over-The-Air updates allow manufacturers to deploy AI model improvements, but a compromised OTA server provides root access to the entire fleet simultaneously. Implementing cryptographic signing and rollback protection is mandatory.</p>
          <p><strong>V2X Risks & Cloud Connectivity:</strong> Trusting data received from external sources (e.g., a "fake" smart traffic light indicating a green phase). Developing Identity and Trust frameworks (PKI credentials) for infrastructure data.</p>
        </>
      }
      advanced={
        <>
          <p><strong>Sensor Spoofing:</strong> Projecting blinding infrared light into LiDAR arrays, altering road signs with adversarial stickers to trick CNN classifiers, or broadcasting counterfeit GPS/GNSS coordinates to decouple the vehicle from its HD map.</p>
          <p><strong>Remote Takeover Risks & Incident Response:</strong> Hardening the API endpoints used by Remote Assistance operators. Establishing fleet risk management protocols capable of securely bricking or quarantining infected nodes.</p>
        </>
      }
      keyTakeaways={
        <ul>
          <li>• A compromised AV is a kinetic weapon; security and safety are inextricably linked.</li>
          <li>• Sensor spoofing forces AVs to rely on multi-sensor redundancy and cross-validation.</li>
          <li>• Strict PKI and identity frameworks must govern all V2X communications.</li>
        </ul>
      }
    />
  );
}
