"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { Orbit, Menu, X } from "lucide-react";
import { useMobileMenuLock } from "@/hooks/useMobileMenuLock";
import { EOI_FORM_URL } from "@/lib/eoi";
import { FONT_MANROPE } from "../fonts";
import styles from "../space.module.css";
const navItems = [
  { label: "Home", href: "#home" },
  { label: "Mission Path", href: "#pathway" },
  { label: "Research", href: "#research" },
  { label: "Labs", href: "#labs" },
  { label: "Research Themes", href: "#projects" },
  { label: "Vision & References", href: "#vision" },
  { label: "Community", href: "#community" },
  { label: "UFlight", href: "https://www.uflight.in/" },
  { label: "EV.ENGINEER", href: "/" },
  { label: "EV Society", href: "https://www.evsociety.org" },
];

export type BrandLink = { label: string; href: string };

/**
 * Widest viewport (px) that still uses the compact header + menu. The full
 * single-line desktop header needs ~1,300px of layout width; 1340px leaves
 * room for a classic Windows scrollbar. Must match the header media query in
 * ../space.module.css.
 */
export const SPACE_HEADER_COMPACT_MAX = 1339;

export default function SpaceHeader({
  basePath = "",
  brandLinks,
}: {
  basePath?: string;
  /** Replaces the default brand links (UFlight, EV.ENGINEER, EV Society) for pages with their own attribution. */
  brandLinks?: BrandLink[];
}) {
  const items = brandLinks ? [...navItems.filter((item) => item.href.startsWith("#")), ...brandLinks] : navItems;
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  useMobileMenuLock(mobileOpen, setMobileOpen, mobileToggleRef, SPACE_HEADER_COMPACT_MAX);
  return (
    <>
      {/* ── Header ── */}
      <header
        className={styles.headerBar}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "rgba(9,11,29,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
            }}
          >
            <Orbit size={18} color="#fff" />
          </div>
          <span
            style={{
              fontFamily: FONT_MANROPE,
              fontWeight: 800,
              fontSize: 17,
              letterSpacing: "-0.02em",
              color: "#fff",
            }}
          >
            Space
          </span>
        </div>

        <nav
          aria-label="Space section navigation"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flex: 1,
            justifyContent: "center",
          }}
          className={styles.headerNavDesktop}
        >
          {items.map((item) => {
            const isInternalRoute = item.href === "/";
            const isExternal = item.href.startsWith("http");
            const borderedStyle: React.CSSProperties = {
              padding: "6px 12px",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 13,
              background:
                "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.2))",
              border: "1px solid rgba(124,58,237,0.4)",
              color: "#B39DDB",
              textDecoration: "none",
              display: "block",
              marginLeft: 8,
              whiteSpace: "nowrap",
            };
            if (isInternalRoute) {
              return (
                <Link
                  key={item.label}
                  href={
                    item.href.startsWith("#")
                      ? `${basePath}${item.href}`
                      : item.href
                  }
                  style={borderedStyle}
                >
                  {item.label}
                </Link>
              );
            }
            if (isExternal) {
              return (
                <a
                  key={item.label}
                  href={
                    item.href.startsWith("#")
                      ? `${basePath}${item.href}`
                      : item.href
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={borderedStyle}
                >
                  {item.label}
                </a>
              );
            }
            const linkStyle: React.CSSProperties = {
              padding: "6px 10px",
              borderRadius: 8,
              color: "#B5B8C9",
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
              transition: "color 0.2s, background 0.2s",
              display: "block",
              whiteSpace: "nowrap",
            };
            return (
              <a
                key={item.label}
                href={
                  item.href.startsWith("#")
                    ? `${basePath}${item.href}`
                    : item.href
                }
                style={linkStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#B5B8C9";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <a
            href={EOI_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Express Interest (opens Google Form in a new tab)"
            className={styles.headerCtaDesktop}
            style={{
              alignItems: "center",
              minHeight: 40,
              padding: "0 16px",
              borderRadius: 10,
              background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
              border: "none",
              color: "#fff",
              fontWeight: 600,
              fontSize: 13,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Express Interest
          </a>
          <button
            type="button"
            ref={mobileToggleRef}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="space-mobile-menu"
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              marginRight: -10,
              background: "none",
              border: "none",
              borderRadius: 10,
              color: "#fff",
              cursor: "pointer",
              padding: 0,
            }}
            className={styles.headerToggle}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          id="space-mobile-menu"
          className={styles.mobileMenu}
          style={{
            position: "fixed",
            top: 60,
            left: 0,
            right: 0,
            zIndex: 99,
            background: "rgba(9,11,29,0.98)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {items.map((item) => {
            const isInternalRoute = item.href === "/";
            const isExternal = item.href.startsWith("http");
            const borderedStyle: React.CSSProperties = {
              marginTop: 4,
              padding: "10px 16px",
              borderRadius: 10,
              fontWeight: 600,
              background:
                "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.2))",
              border: "1px solid rgba(124,58,237,0.4)",
              color: "#B39DDB",
              fontSize: 15,
              textDecoration: "none",
              textAlign: "center",
            };
            if (isInternalRoute) {
              return (
                <Link
                  key={item.label}
                  href={
                    item.href.startsWith("#")
                      ? `${basePath}${item.href}`
                      : item.href
                  }
                  onClick={() => setMobileOpen(false)}
                  style={borderedStyle}
                >
                  {item.label}
                </Link>
              );
            }
            if (isExternal) {
              return (
                <a
                  key={item.label}
                  href={
                    item.href.startsWith("#")
                      ? `${basePath}${item.href}`
                      : item.href
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  style={borderedStyle}
                >
                  {item.label}
                </a>
              );
            }
            const linkStyle: React.CSSProperties = {
              padding: "10px 0",
              color: "#B5B8C9",
              fontSize: 15,
              textDecoration: "none",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            };
            return (
              <a
                key={item.label}
                href={
                  item.href.startsWith("#")
                    ? `${basePath}${item.href}`
                    : item.href
                }
                onClick={() => setMobileOpen(false)}
                style={linkStyle}
              >
                {item.label}
              </a>
            );
          })}
          <a
            href={EOI_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Express Interest (opens Google Form in a new tab)"
            onClick={() => setMobileOpen(false)}
            style={{
              marginTop: 12,
              padding: "12px",
              borderRadius: 10,
              textAlign: "center",
              background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Express Interest
          </a>
        </div>
      )}
    </>
  );
}
