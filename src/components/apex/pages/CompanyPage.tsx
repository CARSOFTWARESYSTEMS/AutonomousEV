import { ArrowUpRight } from "lucide-react";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { APEX_CONTACT, CONTACTS, COLLABORATION_PARTNER_CONTACT } from "@/data/apex/contacts";
import { evidence } from "@/data/apex/evidence";
import { apexImage } from "@/data/apex/images";
import { capabilitiesForPartner } from "@/data/apex/partner-capabilities";
import { apexJsonLd } from "@/data/apex/seo";
import { APEX_OFFICIAL_PAGES, APEX_OFFICIAL_SITE_URL, APEX_SITE } from "@/data/apex/site";
import { APEX_RESPONSIBILITIES } from "@/data/apex/system";
import { ApexPageView } from "../ApexPageView";
import { CollaborationStatement } from "../CollaborationStatement";
import { ContactComposer } from "../ContactComposer";
import { EvidenceFigure } from "../EvidenceFigure";
import { FounderSection } from "../DeepSections";
import { PageHero } from "../PageHero";
import { ProtectedEmail, ProtectedPhone } from "../ProtectedContact";
import { SectionHead } from "../SectionHead";
import { apexTrack } from "../analytics";
import styles from "../apex.module.css";
import company from "../company.module.css";

export function CompanyPage() {
  const apexCaps = capabilitiesForPartner("apex");
  return (
    <>
      <JsonLd data={apexJsonLd("company")} />
      <ApexPageView page="company" />
      <PageHero
        eyebrow="Company"
        title="APEX Rocket Systems"
        lead={evidence("company-focus").approvedWording}
        aside={<EvidenceFigure image={apexImage("05")} sizes="(min-width: 1024px) 34vw, 100vw" aspect="4 / 5" priority />}
      >
        <div className={styles.actions}>
          <a
            href={APEX_OFFICIAL_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.btn} ${styles.btnPrimary}`}
            {...apexTrack("apex_official_site_click", { placement: "company_hero" })}
          >
            Official website <ArrowUpRight size={16} aria-hidden="true" />
            <span className={styles.srOnly}> (opens in a new tab)</span>
          </a>
        </div>
      </PageHero>

      <section className={styles.section} aria-labelledby="partnership-contacts-title" id="partnership-contacts">
        <div className={styles.container}>
          <SectionHead
            eyebrow="Partnership contacts"
            id="partnership-contacts-title"
            title="Who to talk to"
            lead={`${APEX_CONTACT.organisation} and ${COLLABORATION_PARTNER_CONTACT.organisation} are working together in an engineering collaboration. APEX owns its rocket-system and propulsion engineering direction; ${COLLABORATION_PARTNER_CONTACT.organisation} contributes digital engineering and quality. Every email from this site goes to both.`}
            small
          />
          <ul className={company.contactCards}>
            {CONTACTS.map((contact) => (
              <li key={contact.id} className={company.contactCard} data-contact={contact.id}>
                <p className={`${styles.eyebrow} ${contact.id === "gamyaa" ? company.partnerEyebrow : ""}`}>{contact.id === "apex" ? "Program owner" : "For partnership"}</p>
                <h3 className={styles.h3}>{contact.organisation}</h3>
                <p className={styles.small}>{contact.role}</p>
                <dl className={company.factList}>
                  <div>
                    <dt>Contact</dt>
                    <dd>
                      {contact.person}
                      {contact.personTitle ? ` · ${contact.personTitle}` : ""}
                    </dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>
                      <ProtectedEmail contactId={contact.id} placement="partnership_contacts" className={styles.textLink} />
                    </dd>
                  </div>
                  {contact.phone && (
                    <div>
                      <dt>Telephone</dt>
                      <dd>
                        <ProtectedPhone contactId={contact.id} placement="partnership_contacts" className={styles.textLink} />
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt>Web</dt>
                    <dd>
                      <a
                        href={contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.textLink}
                        {...(contact.id === "apex"
                          ? apexTrack("apex_official_site_click", { placement: "partnership_contacts" })
                          : apexTrack("apex_partner_site_click", { partner_id: contact.id, placement: "partnership_contacts" }))}
                      >
                        {contact.websiteLabel} <ArrowUpRight size={13} aria-hidden="true" style={{ verticalAlign: "-1px" }} />
                        <span className={styles.srOnly}> of {contact.organisation} (opens in a new tab)</span>
                      </a>
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
          {/* One email for both organisations, below both cards rather than inside either. */}
          <div className={company.contactsAction}>
            <ProtectedEmail contactId="gamyaa" placement="partnership_contacts_both" subject="APEX Rocket Systems — partnership enquiry" className={`${styles.btn} ${company.skyButton}`}>
              Email for partnership
            </ProtectedEmail>
            <p className={styles.small}>
              One email to {APEX_CONTACT.organisation} and {COLLABORATION_PARTNER_CONTACT.organisation}.
            </p>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="about-title" id="about">
        <div className={styles.container}>
          <div className={company.aboutGrid}>
            <SectionHead
              eyebrow="What exists today"
              id="about-title"
              title="Hardware first"
              lead="At APEX, engineering concepts become physical hardware. These facts come from APEX's official website or were supplied by APEX for this concept experience."
              small
            />
            <dl className={company.factList}>
              <div>
                <dt>Company</dt>
                <dd>APEX Rocket Systems</dd>
              </div>
              <div>
                <dt>Focus</dt>
                <dd>Small- and medium-lift launch vehicles</dd>
              </div>
              <div>
                <dt>Built</dt>
                <dd>5 kN-class gas-generator-cycle liquid-engine demonstrator</dd>
              </div>
              <div>
                <dt>Approach</dt>
                <dd>Hardware-first, manufacturability-driven design with conventional, accessible processes</dd>
              </div>
              <div>
                <dt>Founders</dt>
                <dd>Vibbhav Gopaal · Arcchit Gopaal</dd>
              </div>
              <div>
                <dt>Website</dt>
                <dd>
                  <a href={APEX_OFFICIAL_SITE_URL} target="_blank" rel="noopener noreferrer" className={styles.textLink} {...apexTrack("apex_official_site_click", { placement: "company_facts" })}>
                    www.apexrocketsystems.com
                  </a>
                </dd>
              </div>
              <div>
                <dt>Contact</dt>
                <dd>
                  <ProtectedEmail placement="company_facts" className={styles.textLink} />
                </dd>
              </div>
              <div>
                <dt>For Partnership</dt>
                <dd>
                  {COLLABORATION_PARTNER_CONTACT.organisation} · {COLLABORATION_PARTNER_CONTACT.person} ·{" "}
                  <a href="#partnership-contacts" className={styles.textLink} {...apexTrack("apex_nav_click", { item: "partnership_contacts", placement: "company_facts" })}>
                    Partnership contacts
                  </a>
                </dd>
              </div>
            </dl>
          </div>
          <p className={styles.source} style={{ marginTop: 18 }}>
            Sources:{" "}
            <a href={APEX_OFFICIAL_PAGES.about} target="_blank" rel="noopener noreferrer" {...apexTrack("apex_official_site_click", { placement: "company_source" })}>
              apexrocketsystems.com — About
            </a>{" "}
            ·{" "}
            <a href={APEX_OFFICIAL_PAGES.home} target="_blank" rel="noopener noreferrer" {...apexTrack("apex_official_site_click", { placement: "company_source_home" })}>
              Home
            </a>
          </p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="ownership-title" id="ownership">
        <div className={styles.container}>
          <SectionHead eyebrow="Vision & direction" id="ownership-title" title={APEX_SITE.ownerRole} small />
          <div className={company.vision}>
            {["vision-foundation", "vision-access"].map((id) => (
              <blockquote key={id} className={company.quote}>
                <p>{evidence(id).approvedWording}</p>
                <footer className={styles.source}>
                  <a href={APEX_OFFICIAL_PAGES.home} target="_blank" rel="noopener noreferrer" {...apexTrack("apex_official_site_click", { placement: "company_vision" })}>
                    apexrocketsystems.com
                  </a>
                </footer>
              </blockquote>
            ))}
          </div>
          <div className={company.ownership}>
            <div className={company.ownBlock} data-apex="">
              <h3 className={styles.h4}>APEX owns</h3>
              <ul className={styles.list}>
                {APEX_RESPONSIBILITIES.map((item) => (
                  <li key={item.id}>
                    <strong style={{ color: "var(--apex-text)" }}>{item.label}.</strong> {item.detail}
                  </li>
                ))}
              </ul>
            </div>
            <div className={company.ownBlock} data-partners="">
              <h3 className={styles.h4}>Ecosystem partners contribute</h3>
              <p className={styles.body}>
                Specialist capabilities — electronics, firmware, sensors, software, digital engineering, manufacturing, quality, cybersecurity, AI, verification and
                skills — delivered to APEX&rsquo;s requirements and accepted by APEX.
              </p>
              <p className={styles.small}>APEX itself holds {apexCaps.length} capabilities as program owner: {apexCaps.map(({ capability }) => capability.name).join(", ")}.</p>
            </div>
          </div>
        </div>
      </section>

      <FounderSection headingLevel={2} />

      <section className={styles.section} aria-labelledby="contact-title" id="contact">
        <div className={styles.container}>
          <SectionHead
            eyebrow="Contact"
            id="contact-title"
            title={
              <>
                Build with <span className={styles.amber}>APEX.</span>
              </>
            }
            lead="Strategic partnership, engineering collaboration, manufacturing, embedded systems, avionics, sensors, testing, research, investment or talent."
          />
          <ContactComposer />
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionTight} ${styles.sectionAlt}`} aria-labelledby="collaboration-title" id="collaboration">
        <div className={styles.container}>
          <p className={styles.eyebrow}>Engineering collaboration</p>
          <h2 id="collaboration-title" className={styles.h4} style={{ margin: "10px 0 14px" }}>
            {APEX_SITE.collaboration.title}
          </h2>
          <CollaborationStatement placement="company_statement" className={company.statement} />
          <p className={styles.small} style={{ marginTop: 18, maxWidth: "88ch" }}>
            About this site: claims about APEX are limited to APEX&rsquo;s own published information and information APEX supplied. Showing a capability, test or
            product here does not mean it already exists; anything not yet built or confirmed is marked Concept, Partner Required or Evidence Required.
          </p>
        </div>
      </section>
    </>
  );
}
