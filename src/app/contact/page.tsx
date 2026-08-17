const PAGE_TITLE = "Contact | EV.ENGINEER™";
const PAGE_DESCRIPTION = "Get in touch with iTelematics Software Private Limited for EV engineering platforms, AI agents, diagnostics, or training collaborations.";
const PAGE_URL = "https://autonomous.ev.engineer/contact";

export const metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    type: "website",
    siteName: "EV.ENGINEER",
  },
  twitter: {
    card: "summary",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

import styles from "./page.module.css";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { buildContactGraph } from "@/lib/structured-data/contactGraph";

const contactGraph = {
  "@context": "https://schema.org",
  "@graph": buildContactGraph({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  }),
};

export default function ContactPage() {
  return (
    <div className="container" style={{ paddingTop: "120px", paddingBottom: "80px" }}>
      <JsonLd data={contactGraph} />
      <div style={{ textAlign: "center", marginBottom: "64px" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "16px" }}>Contact Us</h1>
        <p style={{ fontSize: "1.2rem", color: "var(--color-text-secondary)", maxWidth: "800px", margin: "0 auto" }}>
          Let&apos;s discuss EV engineering platforms, AI agents, diagnostics, or training collaborations.
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
