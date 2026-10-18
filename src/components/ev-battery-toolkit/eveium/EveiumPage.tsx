// EVeium Battery Diagnostics — real-vehicle battery diagnosis for Cosmo, Comet
// and Czar. Server-rendered: the published specification (with sources), the
// fields still unverified, the location notice and the FAQ are in the HTML;
// the workflow is a client component. Battery and battery interfaces only.
import Link from "next/link";
import { ArrowRight, BatteryCharging, ChevronRight, ExternalLink, ShieldCheck } from "lucide-react";
import ResearcherCard from "@/components/ResearcherCard";
import { TOOLKIT } from "@/data/ev-battery-toolkit/content";
import { CZAR_CAPACITY_CONFLICT, ENERGY_NOTE, EVEIUM_FUTURE_DATA, EVEIUM_SOURCES, EVEIUM_UNKNOWN_FIELDS, EVEIUM_VEHICLES, nominalEnergy } from "@/data/ev-battery-toolkit/eveium";
import { LINK_EVENTS } from "@/lib/ev-battery-toolkit/analytics";
import { ScooterSchematic } from "../ui/Schematics";
import { PageViewTracker } from "../sections/ClientBits";
import { SectionHead } from "../ui/Badges";
import EveiumWorkflow from "./EveiumWorkflow";
import { EVEIUM_FAQ } from "./faq";
import css from "../toolkit.module.css";
import dx from "../diagnosis.module.css";

export const EVEIUM_ROUTE = `${TOOLKIT.route}/vehicles/eveium`;

function SpecCard({ id }: { id: string }) {
  const v = EVEIUM_VEHICLES.find((x) => x.id === id)!;
  const b = v.variants[0].battery;
  const czar = b.capacityAh.conflict;
  const energy = !czar && b.capacityAh.value ? nominalEnergy(72, b.capacityAh.value) : null;
  return (
    <article className={css.equipment} aria-label={`EVeium ${v.model} published battery specification`}>
      <h3 className={css.h3}>{v.model}</h3>
      <dl className={css.capabilities}>
        <div>
          <dt>Nominal voltage</dt>
          <dd>72 V</dd>
        </div>
        <div>
          <dt>Capacity</dt>
          <dd>{czar ? `${CZAR_CAPACITY_CONFLICT.manufacturer.ampHours} Ah or ${CZAR_CAPACITY_CONFLICT.launch2022.ampHours} Ah` : `${b.capacityAh.value} Ah`}</dd>
        </div>
        <div>
          <dt>Battery</dt>
          <dd>Lithium-ion</dd>
        </div>
        <div>
          <dt>Nominal energy</dt>
          <dd>{czar ? `${CZAR_CAPACITY_CONFLICT.manufacturer.energy.kwh} or ${CZAR_CAPACITY_CONFLICT.launch2022.energy.kwh} kWh` : `${energy?.kwh.toFixed(2)} kWh`}</dd>
        </div>
        <div>
          <dt>Motor (vehicle context)</dt>
          <dd>{b.motorPowerW.value} W</dd>
        </div>
        <div>
          <dt>Claimed range</dt>
          <dd>{String(b.claimedRange.value ?? "—").replace(" (manufacturer claim)", "")}</dd>
        </div>
      </dl>
      <p className={css.fine}>{czar ? `${CZAR_CAPACITY_CONFLICT.manufacturer.energy.text} (manufacturer website) · ${CZAR_CAPACITY_CONFLICT.launch2022.energy.text} (2022 launch coverage). Sources disagree — confirm on the pack label.` : energy?.text}</p>
      <p className={css.fine}>CALCULATED FROM PUBLISHED NOMINAL VOLTAGE AND CAPACITY. Range is a claim, not a test result.</p>
    </article>
  );
}

export default function EveiumPage() {
  return (
    <div className={css.page} data-track-manual="">
      <PageViewTracker />
      <a href="#main-content" className={css.skipLink}>
        Skip to content
      </a>
      <header className={css.header}>
        <div className={css.headerInner}>
          <Link href={TOOLKIT.route} className={css.brand}>
            <span className={css.brandMark} aria-hidden="true">
              <BatteryCharging size={16} />
            </span>
            <span>
              EV.ENGINEER<sup>™</sup> <span className={css.brandSub}>Battery Toolkit</span>
            </span>
          </Link>
          <nav aria-label="EVeium sections" className={css.nav}>
            <ul>
              <li>
                <a href="#diagnosis">Diagnosis</a>
              </li>
              <li>
                <a href="#specification">Specification</a>
              </li>
              <li>
                <a href="#unverified">Unverified data</a>
              </li>
              <li>
                <a href="#location">Location</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
            </ul>
          </nav>
          <Link href="/internships" className={css.headerLink}>
            Internships
          </Link>
        </div>
      </header>

      <main id="main-content">
        <div className={css.heroWrap}>
          <div className={css.container}>
            <nav className={css.breadcrumb} aria-label="Breadcrumb">
              <ol>
                <li>
                  <Link href="/internships">Internships</Link>
                  <ChevronRight size={12} aria-hidden="true" />
                </li>
                <li>
                  <Link href={TOOLKIT.route}>EV Battery Toolkit</Link>
                  <ChevronRight size={12} aria-hidden="true" />
                </li>
                <li aria-current="page">EVeium</li>
              </ol>
            </nav>
            <section className={css.heroCopy} aria-labelledby="eveium-title">
              <p className={css.heroEyebrow}>
                <span className={dx.realBadge}>REAL VEHICLE WORKFLOW</span>
              </p>
              <h1 id="eveium-title" className={css.h1}>
                EVeium Battery Diagnostics
              </h1>
              <p className={css.heroLede}>Real-vehicle battery diagnosis for Cosmo, Comet and Czar using measured evidence, BMS data and technician observations.</p>
              <div className={css.heroActions}>
                <a href="#diagnosis" className={css.primaryButton}>
                  Start real diagnosis <ArrowRight size={16} aria-hidden="true" />
                </a>
                <Link href={`${TOOLKIT.route}#explorer`} className={css.secondaryButton}>
                  Explore Generic 72-V Battery Digital Twin
                </Link>
              </div>
              <p className={css.positioning}>
                <ShieldCheck size={16} aria-hidden="true" />
                <span>
                  The toolkit never claims hidden EVeium battery construction: published values carry their sources, everything else stays UNKNOWN. {TOOLKIT.positioning} No live EVeium BMS connection is provided.
                </span>
              </p>
            </section>
          </div>
        </div>

        <section id="diagnosis" className={`${css.section} ${css.sectionMajor}`} aria-labelledby="diagnosis-h">
          <div className={css.container}>
            <SectionHead id="diagnosis-h" eyebrow="Real vehicle diagnosis" title="Select the model, record the evidence, decide the next test">
              <p>Safety screen first. Every measurement starts NOT MEASURED. A complaint never creates a repair decision on its own.</p>
            </SectionHead>
            <EveiumWorkflow />
          </div>
        </section>

        <section id="specification" className={`${css.section} ${css.sectionAlt}`} aria-labelledby="spec-h">
          <div className={css.container}>
            <SectionHead id="spec-h" eyebrow="PUBLICLY DOCUMENTED / THIRD-PARTY CORROBORATED" title="Publicly Documented Battery Specification">
              <p>Published by EVeium and corroborated by 2022 launch coverage. Cell chemistry, cell format, series / parallel count, BMS protocol and connector pinout are not published and are not shown.</p>
            </SectionHead>
            <div className={css.equipmentGrid}>
              {EVEIUM_VEHICLES.map((v) => (
                <SpecCard key={v.id} id={v.id} />
              ))}
            </div>
            <p className={css.fineNote}>{ENERGY_NOTE} Czar capacity: EVeium&apos;s website states 40 Ah; 2022 launch coverage states 42 Ah (3.02 kWh). The toolkit publishes both and asks the technician to read the pack label.</p>
            <h3 className={css.subTitle}>Sources</h3>
            <ul className={dx.sourceList}>
              {Object.values(EVEIUM_SOURCES).map((s) => (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" data-track-event={LINK_EVENTS.externalTool} data-track-tool={s.id}>
                    {s.publisher} — {s.title}
                    <ExternalLink size={12} aria-hidden="true" />
                    <span className={css.srOnly}> (opens in a new tab)</span>
                  </a>
                  <span>
                    {s.category.replace("_", " ")}
                    {s.published ? ` · published ${s.published}` : ""} · verified {s.verifiedDate}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="unverified" className={css.section} aria-labelledby="unverified-h">
          <div className={css.container}>
            <SectionHead id="unverified-h" eyebrow="Intentionally transparent" title="Technical Data Still Requiring Verification" />
            <ul className={css.scopeList} aria-label="Fields not verified">
              {EVEIUM_UNKNOWN_FIELDS.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <p className={css.fineNote}>The toolkit is ready to take, without redesign: {EVEIUM_FUTURE_DATA.join(", ").toLowerCase()} — once an authoritative source exists.</p>
          </div>
        </section>

        <section id="location" className={`${css.section} ${css.sectionAlt}`} aria-labelledby="location-h">
          <div className={css.container}>
            <SectionHead id="location-h" eyebrow="Battery location" title="Battery Location: NOT YET VERIFIED">
              <p>Use physical inspection and authorised service documentation to confirm battery location and service access.</p>
            </SectionHead>
            <div className={dx.locationPanel}>
              <div>
                <p className={dx.schematicTag}>SCHEMATIC VEHICLE — NOT OEM GEOMETRY</p>
                <ScooterSchematic architecture={null} located={false} title="Schematic scooter without a battery position: EVeium battery location not verified" />
              </div>
              <div>
                <p className={dx.schematicTag}>GENERIC 72-V BATTERY ARCHITECTURE · NOT VERIFIED AS EVeium INTERNAL PACK CONSTRUCTION</p>
                <p className={css.muted}>EVeium&apos;s specifications state a lithium-ion swappable battery. No removal path is shown as fact. To study a generic 72 V pack — modules, cell groups, BMS, thermal and current paths — open the generic digital twin.</p>
                <Link href={`${TOOLKIT.route}#explorer`} className={css.textLink}>
                  Explore Generic 72-V Battery Digital Twin <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className={css.section} aria-labelledby="faq-h">
          <div className={css.container}>
            <SectionHead id="faq-h" eyebrow="EVeium battery questions" title="EVeium battery diagnostics, answered" />
            <dl className={css.answers}>
              {EVEIUM_FAQ.map((a) => (
                <div key={a.q}>
                  <dt>{a.q}</dt>
                  <dd>{a.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className={`${css.section} ${css.designedBy}`} aria-label="Designed by">
          <div className={css.container}>
            <ResearcherCard profileLinkProps={{ "data-track-event": LINK_EVENTS.profile, "data-track-source": "ev_battery_toolkit_eveium" }} />
            <p className={css.providerNote}>EVeium is a separate company. EV.ENGINEER™ is not affiliated with or endorsed by EVeium; specifications are cited from their public sources.</p>
          </div>
        </section>
      </main>

      <footer className={css.footer}>
        <div className={css.container}>
          <div className={css.footerInner}>
            <p className={css.footerBrand}>EV.ENGINEER™ — EV Battery Health &amp; Diagnostics Toolkit</p>
            <ul className={css.footerLinks}>
              <li>
                <Link href={TOOLKIT.route}>Battery Toolkit</Link>
              </li>
              <li>
                <Link href="/internships">Internships</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
