"use client";

import Link from "next/link";
import { useState } from "react";
import galleryData from "@/data/workshop-gallery.json";

export default function WorkshopGalleryPage() {
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null);

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  }

  return (
    <div style={{ paddingTop: "90px", minHeight: "100vh" }}>
      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0,0,0,0.93)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            cursor: "zoom-out",
          }}
        >
          <img
            src={lightbox.src}
            alt={lightbox.label}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "100%",
              maxHeight: "calc(100vh - 120px)",
              objectFit: "contain",
              borderRadius: "12px",
              boxShadow: "0 8px 64px rgba(0,0,0,0.8)",
              cursor: "default",
            }}
          />
          <div style={{ display: "flex", gap: "12px", marginTop: "16px", alignItems: "center", flexWrap: "wrap", justifyContent: "center", maxWidth: "90vw", textAlign: "center" }}>
            <span style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
              {lightbox.label}
            </span>
            <button
              onClick={() => setLightbox(null)}
              className="btn btn-primary"
              style={{ padding: "0.5rem 1.6rem", fontSize: "0.95rem" }}
              data-track-event="gallery_lightbox_close"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <section className="section">
        <div className="container">
          {/* Header */}
          <div style={{ marginBottom: "48px", textAlign: "center" }}>
            <h1 style={{ fontSize: "clamp(1.6rem, 5vw, 2.5rem)", fontWeight: 600, marginBottom: "12px" }}>
              <span style={{ color: "var(--accent-primary)" }}>EV Battery</span> Workshop Gallery
            </h1>
            <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: "28px" }}>
              A visual record of our hands-on EV Battery &amp; Autonomous Vehicle workshops.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/workshop"
                className="btn btn-primary"
                data-track-event="gallery_register_click"
              >
                Register for Next Workshop
              </Link>

              <a
                href="https://www.facebook.com/evsociety.org"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                data-track-event="gallery_facebook_click"
              >
                Facebook
              </a>
              <a
                href="https://carsoftwaresystems.com/#testimonial"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                data-track-event="gallery_events_click"
              >
                Gallery (Old)
              </a>
              <a
                href="https://www.youtube.com/@iTelematics/videos"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                data-track-event="gallery_youtube_click"
              >
                YouTube
              </a>
              <a
                href="https://www.evsociety.org/projects/battery-safety-systems/candidates"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                data-track-event="gallery_evsociety_click"
              >
                EV Society
              </a>
            </div>
          </div>

          {/* Sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: "64px" }}>
            {galleryData.map((section, sIdx) => {
              if (!section.items || section.items.length === 0) return null;
              return (
                <div key={sIdx}>
                  <h2 style={{ 
                    fontSize: "clamp(1.4rem, 4vw, 1.8rem)", 
                    fontWeight: 600, 
                    marginBottom: "24px", 
                    color: "var(--accent-primary)",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    paddingBottom: "12px"
                  }}>
                    {section.sectionName}
                  </h2>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                      gap: "20px",
                    }}
                  >
                    {section.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="glass-panel"
                        onClick={() => {
                          setLightbox({ src: item.src, label: item.label });
                        }}
                        data-track-event="gallery_photo_click"
                        data-track-label={item.label}
                        style={{
                          padding: 0,
                          overflow: "hidden",
                          cursor: "zoom-in",
                          transition: "transform 0.2s ease, box-shadow 0.2s ease",
                          display: "flex",
                          flexDirection: "column",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                          (e.currentTarget as HTMLDivElement).style.boxShadow =
                            "0 12px 40px rgba(0,0,0,0.5)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                          (e.currentTarget as HTMLDivElement).style.boxShadow = "";
                        }}
                      >
                        <div style={{ position: "relative", paddingBottom: "66%", overflow: "hidden" }}>
                          <img
                            src={item.src}
                            alt={item.label}
                            loading="lazy"
                            style={{
                              position: "absolute",
                              inset: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "transform 0.3s ease",
                            }}
                            onMouseEnter={(e) =>
                              ((e.currentTarget as HTMLImageElement).style.transform = "scale(1.04)")
                            }
                            onMouseLeave={(e) =>
                              ((e.currentTarget as HTMLImageElement).style.transform = "scale(1)")
                            }
                          />
                        </div>
                        <div style={{ padding: "14px 16px" }}>
                          <p
                            style={{
                              fontSize: "0.9rem",
                              color: "var(--text-primary)",
                              fontWeight: 500,
                              marginBottom: "4px",
                            }}
                          >
                            {item.label}
                          </p>
                          <p style={{ fontSize: "0.8rem", color: "var(--accent-primary)", marginBottom: item.label2 ? "6px" : "0" }}>
                            {formatDate(item.date)}
                          </p>
                          {item.label2 && (
                            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                              {item.label2}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div style={{ marginTop: "64px", textAlign: "center", paddingBottom: "40px" }}>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 600, marginBottom: "20px" }}>
              Want to Join Our Next Workshop?
            </h2>
            <Link
              href="/workshop"
              className="btn btn-primary"
              style={{ padding: "0.8rem 2.5rem", fontSize: "1.1rem" }}
              data-track-event="gallery_bottom_cta_click"
            >
              Register Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
