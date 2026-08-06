import Image from "next/image";
import Link from "next/link";

export function AuthorSection() {
  return (
    <section className="section bg-surface" id="author" aria-labelledby="bcs-author-heading">
      <div className="container">
        <div
          style={{
            display: "flex",
            gap: "2.5rem",
            alignItems: "center",
            background: "var(--glass-bg)",
            padding: "2.5rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--glass-border)",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              flexShrink: 0,
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid rgba(34,211,238,0.3)",
              boxShadow: "0 0 24px rgba(34,211,238,0.15)",
            }}
          >
            <Image
              src="/SudarshanaKarkala.jpg"
              alt="Sudarshana Karkala — Founder of EV.ENGINEER"
              width={100}
              height={100}
              style={{ objectFit: "cover" }}
            />
          </div>
          <div style={{ flex: "1 1 300px" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--bcs-cyan)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>
              Architect Behind EV.ENGINEER™
            </p>
            <h2 id="bcs-author-heading" style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>
              Sudarshana Karkala
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "20px", maxWidth: "560px" }}>
              This electric aircraft battery cybersecurity analysis is part of the EV.ENGINEER™ vision led by
              Sudarshana Karkala, focused on intelligent energy systems, battery intelligence, cybersecurity, and
              AI-driven engineering platforms for electric vehicles and aerospace applications.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link href="/about/sudarshana-karkala" className="btn btn-secondary" style={{ fontSize: "0.875rem", padding: "0.6rem 1.25rem" }}>
                View Profile
              </Link>
              <Link href="/design-development/passenger-taxi" className="btn btn-secondary" style={{ fontSize: "0.875rem", padding: "0.6rem 1.25rem" }}>
                Passenger Air Taxi
              </Link>
              <Link href="/cybersecurity" className="btn btn-secondary" style={{ fontSize: "0.875rem", padding: "0.6rem 1.25rem" }}>
                Cybersecurity
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
