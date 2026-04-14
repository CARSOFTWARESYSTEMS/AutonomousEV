export const metadata = {
  title: "Contact | EV.ENGINEER™",
  description: "Get in touch with iTelematics Software Private Limited for EV engineering platforms, AI agents, diagnostics, or training collaborations.",
};

import styles from "./page.module.css";

export default function ContactPage() {
  return (
    <div className="container" style={{ paddingTop: "120px", paddingBottom: "80px" }}>
      <div style={{ textAlign: "center", marginBottom: "64px" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "16px" }}>Contact Us</h1>
        <p style={{ fontSize: "1.2rem", color: "var(--color-text-secondary)", maxWidth: "800px", margin: "0 auto" }}>
          Let's discuss EV engineering platforms, AI agents, diagnostics, or training collaborations.
        </p>
      </div>

      <div className={styles.contactContainer}>
        <div className={styles.infoBlock} style={{ maxWidth: "600px", width: "100%" }}>
          <div className="glass-panel" style={{ borderLeft: "4px solid var(--color-accent)" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "24px" }}>iTelematics Software Private Limited</h2>
            
            <div className={styles.infoBlock}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Email</span>
                <span className={styles.infoValue}>info@iTelematics.com</span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Phone</span>
                <span className={styles.infoValue}>+91 91082 06147</span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>WhatsApp</span>
                <span className={styles.infoValue}>+91 91082 06147</span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Address</span>
                <span className={styles.infoValue}>Bhoganahalli, Bangalore - 560103, India</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
