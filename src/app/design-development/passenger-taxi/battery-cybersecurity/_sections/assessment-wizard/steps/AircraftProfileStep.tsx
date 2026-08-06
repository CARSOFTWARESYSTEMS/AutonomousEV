"use client";

import { AIRCRAFT_PROFILES } from "@/lib/battery-cybersecurity/data/aircraftProfiles";
import pageStyles from "../../../page.module.css";

export function AircraftProfileStep({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>Select Aircraft Profile</h3>
      <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "24px", maxWidth: "720px" }}>
        The aircraft profile provides context for the report; it does not change how questions are scored.
      </p>
      <div role="radiogroup" aria-label="Aircraft profile" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px" }}>
        {AIRCRAFT_PROFILES.map((profile) => {
          const isSelected = profile.id === selectedId;
          return (
            <label
              key={profile.id}
              className={pageStyles.navyPanel}
              style={{
                padding: "16px 18px",
                cursor: "pointer",
                display: "block",
                border: isSelected ? "1px solid #22d3ee" : undefined,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <input
                  type="radio"
                  name="aircraft-profile"
                  checked={isSelected}
                  onChange={() => onSelect(profile.id)}
                  style={{ marginTop: "4px" }}
                />
                <div>
                  <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem", marginBottom: "4px" }}>{profile.name}</p>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{profile.description}</p>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
