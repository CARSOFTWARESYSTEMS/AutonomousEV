"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { capability, capabilitiesForPartner, partnersForCapability, RELATIONSHIP_LABEL } from "@/data/apex/partner-capabilities";
import { RING_CATEGORY } from "@/data/apex/capabilities";
import { partner, PARTNER_STATUS_LABEL } from "@/data/apex/partners";
import { ENGINE_BLOCKS, systemDomain, SYSTEM_LAYER_LABEL } from "@/data/apex/system";
import { apexHref } from "@/data/apex/site";
import { CapabilityBadge, EvidenceBadge } from "./EvidenceBadge";
import { apexTrack } from "./analytics";
import { usePanel, type PanelTarget } from "./panelContext";
import styles from "./apex.module.css";
import panel from "./panel.module.css";

export function panelHeading(target: PanelTarget): { eyebrow: string; title: string } {
  switch (target.kind) {
    case "capability": {
      const item = capability(target.id);
      return { eyebrow: `Capability · ${RING_CATEGORY[item.ring]}`, title: item.name };
    }
    case "partner": {
      const item = partner(target.id);
      return { eyebrow: PARTNER_STATUS_LABEL[item.relationshipStatus], title: item.name };
    }
    case "domain": {
      const item = systemDomain(target.id);
      return { eyebrow: `System domain · ${SYSTEM_LAYER_LABEL[item.layer]}`, title: item.name };
    }
    case "engine-block": {
      const item = ENGINE_BLOCKS.find((block) => block.id === target.id)!;
      return { eyebrow: "Engine functional block", title: item.name };
    }
  }
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={panel.block}>
      <h3 className={panel.blockTitle}>{title}</h3>
      {children}
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/** Who provides a capability — every partner, plus the open slot. */
function CapabilityPartners({ capabilityId }: { capabilityId: string }) {
  const { open } = usePanel();
  const rows = partnersForCapability(capabilityId);
  const item = capability(capabilityId);
  return (
    <div className={panel.rows}>
      {rows.map(({ partner: p, relationship }) => (
        <button key={p.id} type="button" className={panel.partnerRow} onClick={(event) => open({ kind: "partner", id: p.id }, event.currentTarget)}>
          <span className={panel.partnerRowHead}>
            <span className={panel.partnerName}>{p.shortName}</span>
            <span className={panel.partnerRole}>{RELATIONSHIP_LABEL[relationship.relationshipStatus]}</span>
          </span>
          <span className={styles.small} style={{ color: "var(--apex-text-2)" }}>
            {relationship.role} — {relationship.contribution}
          </span>
        </button>
      ))}
      {rows.length === 0 && (
        <div className={panel.openSlot}>
          <EvidenceBadge status="PARTNER_REQUIRED" />
          <span>No partner is identified for this capability yet. More than one partner can contribute.</span>
        </div>
      )}
      {rows.length > 0 && (
        <p className={styles.small}>{item.openGap ?? "Open to additional partners."}</p>
      )}
    </div>
  );
}

export function CapabilityDetail({ id }: { id: string }) {
  const { open, close } = usePanel();
  const item = capability(id);
  return (
    <>
      <Block title="Maturity / status">
        <div className={styles.chips}>
          <CapabilityBadge status={item.status} />
        </div>
        <p className={panel.blockText}>{item.description}</p>
      </Block>
      <Block title="Why it matters">
        <p className={panel.blockText}>{item.whyItMatters}</p>
      </Block>
      <Block title="What it connects to">
        <div className={styles.chips}>
          {item.connectsTo.map((otherId) => (
            <button key={otherId} type="button" className={styles.chip} onClick={(event) => open({ kind: "capability", id: otherId }, event.currentTarget)}>
              {capability(otherId).name}
            </button>
          ))}
        </div>
      </Block>
      <Block title="Expected deliverables">
        <Bullets items={item.deliverables} />
      </Block>
      <Block title="Engineering evidence">
        <Bullets items={item.evidence} />
      </Block>
      <Block title="Partners">
        <CapabilityPartners capabilityId={id} />
      </Block>
      <Block title="APEX retains">
        <p className={panel.blockText}>{item.apexRetains}</p>
      </Block>
      <Block title="Additional partner opportunities">
        <p className={panel.blockText}>{item.additionalOpportunities}</p>
        <div>
          <Link
            href={apexHref("/company#contact")}
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={close}
            {...apexTrack("apex_partner_interest", { capability_id: id, placement: "capability_panel" })}
          >
            Register interest
          </Link>
        </div>
      </Block>
    </>
  );
}

export function PartnerDetail({ id }: { id: string }) {
  const { open } = usePanel();
  const item = partner(id);
  const rows = capabilitiesForPartner(id);
  return (
    <>
      <Block title="Role">
        <p className={styles.h3}>{item.role}</p>
        <p className={panel.blockText}>{item.description}</p>
        {item.location && <p className={styles.small}>{item.location}</p>}
      </Block>
      <Block title={`Capabilities (${rows.length})`}>
        <div className={panel.rows}>
          {rows.map(({ capability: c, relationship }) => (
            <button key={c.id} type="button" className={panel.partnerRow} onClick={(event) => open({ kind: "capability", id: c.id }, event.currentTarget)}>
              <span className={panel.partnerRowHead}>
                <span className={panel.partnerName}>{c.name}</span>
                <span className={panel.partnerRole}>{relationship.role}</span>
              </span>
              <span className={styles.small} style={{ color: "var(--apex-text-2)" }}>
                {relationship.contribution}
              </span>
            </button>
          ))}
        </div>
      </Block>
      <Block title="Relationship">
        <p className={panel.blockText}>
          {item.id === "apex"
            ? "Program owner. APEX keeps system intent and engineering authority across every capability."
            : item.relationshipStatus === "ENGINEERING_COLLABORATION"
              ? "Engineering collaboration with APEX Rocket Systems, working toward shared engineering goals. APEX retains ownership of its rocket-system and propulsion engineering direction; Gamyaa AeroSystems contributes complementary digital-engineering and quality capabilities."
              : item.relationshipStatus === "TO_BE_IDENTIFIED"
                ? "Open. No institution is named until an agreement exists."
                : "Proposed capability partner. The relationship is not yet confirmed."}
        </p>
        {item.website && (
          <div>
            <a
              href={item.website}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.btn} ${styles.btnSecondary}`}
              {...(item.id === "apex"
                ? apexTrack("apex_official_site_click", { placement: "partner_panel" })
                : apexTrack("apex_partner_site_click", { partner_id: item.id, placement: "partner_panel" }))}
            >
              {item.id === "apex" ? "Official APEX website" : "Website"} <ArrowUpRight size={15} aria-hidden="true" />
              <span className={styles.srOnly}> (opens in a new tab)</span>
            </a>
          </div>
        )}
      </Block>
    </>
  );
}

export function DomainDetail({ id }: { id: string }) {
  const { open } = usePanel();
  const item = systemDomain(id);
  return (
    <>
      <Block title="Purpose">
        <p className={panel.blockText}>{item.purpose}</p>
      </Block>
      <Block title="Status">
        <div className={styles.chips}>
          <EvidenceBadge status={item.status} />
        </div>
        <p className={panel.blockText}>{item.statusNote}</p>
      </Block>
      <Block title={`Interfaces (${item.interfaces.length})`}>
        <div className={styles.chips}>
          {item.interfaces.map((otherId) => (
            <button key={otherId} type="button" className={styles.chip} onClick={(event) => open({ kind: "domain", id: otherId }, event.currentTarget)}>
              {systemDomain(otherId).name}
            </button>
          ))}
        </div>
      </Block>
      <Block title="Development evidence">
        <Bullets items={item.evidence} />
      </Block>
      <Block title="Partner capabilities">
        <div className={panel.rows}>
          {item.capabilityIds.map((capabilityId) => {
            const c = capability(capabilityId);
            const names = partnersForCapability(capabilityId).map(({ partner: p }) => p.shortName);
            return (
              <button key={capabilityId} type="button" className={panel.partnerRow} onClick={(event) => open({ kind: "capability", id: capabilityId }, event.currentTarget)}>
                <span className={panel.partnerRowHead}>
                  <span className={panel.partnerName}>{c.name}</span>
                  <CapabilityBadge status={c.status} />
                </span>
                <span className={styles.small} style={{ color: "var(--apex-text-2)" }}>
                  {names.length ? names.join(" · ") : "Partner required"}
                </span>
              </button>
            );
          })}
        </div>
      </Block>
      <Block title="Related dependencies">
        <Bullets items={item.dependencies} />
      </Block>
    </>
  );
}

export function EngineBlockDetail({ id }: { id: string }) {
  const { open } = usePanel();
  const item = ENGINE_BLOCKS.find((block) => block.id === id)!;
  return (
    <>
      <Block title="What it does">
        <p className={panel.blockText}>{item.does}</p>
      </Block>
      <Block title="What it interfaces with">
        <Bullets items={item.interfaces} />
      </Block>
      <Block title="Capability needed">
        <p className={panel.blockText}>{item.capability}</p>
      </Block>
      <Block title="How it is verified">
        <Bullets items={item.verifiedBy} />
      </Block>
      <Block title="Partners who may contribute">
        <div className={panel.rows}>
          {item.capabilityIds.map((capabilityId) => {
            const c = capability(capabilityId);
            const names = partnersForCapability(capabilityId).map(({ partner: p }) => p.shortName);
            return (
              <button key={capabilityId} type="button" className={panel.partnerRow} onClick={(event) => open({ kind: "capability", id: capabilityId }, event.currentTarget)}>
                <span className={panel.partnerRowHead}>
                  <span className={panel.partnerName}>{c.name}</span>
                  <CapabilityBadge status={c.status} />
                </span>
                <span className={styles.small} style={{ color: "var(--apex-text-2)" }}>
                  {names.length ? names.join(" · ") : "Partner required"}
                </span>
              </button>
            );
          })}
        </div>
      </Block>
      <p className={styles.small} style={{ paddingTop: 12 }}>
        Functional description only. No design parameters are shown.
      </p>
    </>
  );
}
