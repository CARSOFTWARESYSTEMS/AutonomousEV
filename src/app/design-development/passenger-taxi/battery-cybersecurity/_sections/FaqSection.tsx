import { FAQ_ITEMS } from "@/lib/battery-cybersecurity/data/faq";
import { SectionHeader } from "../SectionHeader";
import pageStyles from "../page.module.css";

export function FaqSection() {
  return (
    <section className="section" id="faq" aria-labelledby="bcs-faq-heading">
      <div className="container">
        <SectionHeader label="Frequently Asked Questions" title="Electric Aircraft Battery Cybersecurity — FAQ" headingId="bcs-faq-heading">
          <p>Direct answers to common questions about battery and BMS cybersecurity for electric aircraft.</p>
        </SectionHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "900px" }}>
          {FAQ_ITEMS.map((item) => (
            <div key={item.id} className={pageStyles.navyPanel} style={{ padding: "24px 28px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px", lineHeight: 1.4 }}>
                {item.question}
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
