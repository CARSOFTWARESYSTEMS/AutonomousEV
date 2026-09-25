import Link from "next/link";
import { Orbit, Mail } from "lucide-react";
import { FONT_MANROPE } from "../fonts";
import styles from "../space.module.css";
const CONTACT_HREF = "/contact";
export default function SpaceFooter({
  basePath = "",
  showCommunityBranding = true,
}: {
  basePath?: string;
  /** Pages that must not carry EV Society branding pass false. */
  showCommunityBranding?: boolean;
}) {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "48px 32px 28px",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div
          style={{ gap: 40, marginBottom: 40 }}
          className={styles.footerGrid}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Orbit size={16} color="#fff" />
              </div>
              <span
                style={{
                  fontFamily: FONT_MANROPE,
                  fontWeight: 800,
                  fontSize: 16,
                  color: "#fff",
                }}
              >
                Space
              </span>
            </div>
            <p
              style={{
                color: "#B5B8C9",
                fontSize: 14,
                lineHeight: 1.7,
                marginBottom: 4,
                maxWidth: 320,
              }}
            >
              {showCommunityBranding ? <>Space &middot; An EV Society initiative.</> : <>Space &middot; EV.ENGINEER</>}
            </p>
            <p
              style={{
                color: "#B5B8C9",
                fontSize: 14,
                lineHeight: 1.7,
                maxWidth: 320,
              }}
            >
              Focused on Autonomous Spacecraft Health Management and Safe
              Recovery.
            </p>
          </div>

          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: "#fff",
                marginBottom: 16,
                fontFamily: FONT_MANROPE,
              }}
            >
              Mission
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a
                href={`${basePath}#mission`}
                style={{
                  color: "#B5B8C9",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                The Mission
              </a>
              <a
                href={`${basePath}#pathway`}
                style={{
                  color: "#B5B8C9",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Mission Pathway
              </a>
              <a
                href={`${basePath}#roadmap`}
                style={{
                  color: "#B5B8C9",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Roadmap
              </a>
              <a
                href={`${basePath}#faq`}
                style={{
                  color: "#B5B8C9",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                FAQ
              </a>
            </div>
          </div>

          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: "#fff",
                marginBottom: 16,
                fontFamily: FONT_MANROPE,
              }}
            >
              Contact
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link
                href={CONTACT_HREF}
                style={{
                  color: "#B5B8C9",
                  fontSize: 14,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Mail size={13} /> Contact Us
              </Link>
              <Link
                href="/aerospace"
                style={{
                  color: "#B5B8C9",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Aerospace
              </Link>
              <Link
                href="/"
                style={{
                  color: "#B5B8C9",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                EV.ENGINEER
              </Link>
              <a
                href="https://www.uflight.in/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#B5B8C9",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                UFlight
              </a>
              {showCommunityBranding && (
                <a
                  href="https://www.evsociety.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#B5B8C9",
                    fontSize: 14,
                    textDecoration: "none",
                  }}
                >
                  EV Society
                </a>
              )}
              <a
                href="https://itelematics.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#B5B8C9",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                iTelematics
              </a>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: 24,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span style={{ color: "#B5B8C9", fontSize: 13 }}>
            &copy; 2026 Space{showCommunityBranding ? <> &middot; An EV Society initiative</> : null}
          </span>
          <span style={{ color: "#B5B8C9", fontSize: 13 }}>
            Commercial products and services, where applicable, are handled
            separately by iTelematics Software Private Limited under explicit
            agreements.
          </span>
        </div>
      </div>
    </footer>
  );
}
