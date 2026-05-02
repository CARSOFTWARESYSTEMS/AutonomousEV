"use client";

import styles from "./page.module.css";

/* ───────────────────────────────────────────────────
   DATA
   ─────────────────────────────────────────────────── */

const costData = [
  { cat: "2W E-Bicycle", avgPrice: "₹35,000", evOnly: "₹25,000", battery: "₹10,000", pct: "29%", stdW: 1, extW: 1, totalW: 2 },
  { cat: "2W Scooter/Bike", avgPrice: "₹1,25,000", evOnly: "₹70,000", battery: "₹55,000", pct: "44%", stdW: 3, extW: 5, totalW: 8 },
  { cat: "3W Auto/Cargo", avgPrice: "₹2,85,000", evOnly: "₹1,70,000", battery: "₹1,15,000", pct: "40%", stdW: 3, extW: 2, totalW: 5 },
  { cat: "4W Passenger", avgPrice: "₹15,00,000", evOnly: "₹9,75,000", battery: "₹5,25,000", pct: "35%", stdW: 3, extW: 5, totalW: 8 },
  { cat: "EV Buses", avgPrice: "₹1,85,00,000", evOnly: "₹1,15,00,000", battery: "₹70,00,000", pct: "38%", stdW: 5, extW: 5, totalW: 10 },
  { cat: "EV Trucks", avgPrice: "₹45,00,000", evOnly: "₹28,00,000", battery: "₹17,00,000", pct: "38%", stdW: 5, extW: 3, totalW: 8 },
];

const warrantyData = [
  { cat: "2W E-Bicycle", warranty: "2 yrs", origPrice: "₹35,000", resale: "₹8,000", replaceCost: "₹7,000", battResale: "₹3,500" },
  { cat: "2W Scooter", warranty: "8 yrs", origPrice: "₹1,25,000", resale: "₹32,000", replaceCost: "₹42,000", battResale: "₹20,000" },
  { cat: "3W Auto", warranty: "5 yrs", origPrice: "₹2,85,000", resale: "₹85,000", replaceCost: "₹1,00,000", battResale: "₹45,000" },
  { cat: "4W Passenger", warranty: "8 yrs", origPrice: "₹15,00,000", resale: "₹4,25,000", replaceCost: "₹5,25,000", battResale: "₹2,00,000" },
  { cat: "EV Buses", warranty: "10 yrs", origPrice: "₹1,85,00,000", resale: "₹40,00,000", replaceCost: "₹60,00,000", battResale: "₹20,00,000" },
  { cat: "EV Trucks", warranty: "8 yrs", origPrice: "₹45,00,000", resale: "₹12,50,000", replaceCost: "₹15,00,000", battResale: "₹6,00,000" },
];

const secondaryLifeData = [
  { cat: "2W E-Bicycle", cells: 100, purchaseCost: "₹4,000", initDiag: "₹1,000", cellTest: "₹2,000", packVal: "₹2,000", totalTest: "₹5,000", abcd: "50/25/15/10", prices: "80/50/20/5", totalValue: "₹6,500", profit: "-₹2,500", isNeg: true },
  { cat: "2W Scooter", cells: 800, purchaseCost: "₹23,000", initDiag: "₹2,000", cellTest: "₹5,000", packVal: "₹3,000", totalTest: "₹10,000", abcd: "400/200/120/80", prices: "100/60/25/5", totalValue: "₹42,000", profit: "₹9,000", isNeg: false },
  { cat: "3W Auto", cells: 1500, purchaseCost: "₹50,000", initDiag: "₹3,000", cellTest: "₹10,000", packVal: "₹7,000", totalTest: "₹20,000", abcd: "750/375/225/150", prices: "110/70/30/5", totalValue: "₹95,000", profit: "₹25,000", isNeg: false },
  { cat: "4W Passenger", cells: 4000, purchaseCost: "₹2,20,000", initDiag: "₹5,000", cellTest: "₹25,000", packVal: "₹30,000", totalTest: "₹60,000", abcd: "2000/1000/600/400", prices: "120/80/35/5", totalValue: "₹4,80,000", profit: "₹2,00,000", isNeg: false, isCore: true },
  { cat: "EV Buses", cells: 15000, purchaseCost: "₹21,50,000", initDiag: "₹10,000", cellTest: "₹80,000", packVal: "₹1,10,000", totalTest: "₹2,00,000", abcd: "7500/3750/2250/1500", prices: "130/90/40/5", totalValue: "₹55,00,000", profit: "₹31,50,000", isNeg: false },
  { cat: "EV Trucks", cells: 8000, purchaseCost: "₹6,50,000", initDiag: "₹8,000", cellTest: "₹40,000", packVal: "₹50,000", totalTest: "₹98,000", abcd: "4000/2000/1200/800", prices: "120/80/35/5", totalValue: "₹14,00,000", profit: "₹6,52,000", isNeg: false },
];

const evCalcData = [
  { grade: "A", cells: "2,00,000", packs: "1000", revenue: "₹3 Cr" },
  { grade: "B", cells: "1,00,000", packs: "666", revenue: "₹1.2 Cr" },
  { grade: "C", cells: "60,000", packs: "600", revenue: "₹0.48 Cr" },
  { grade: "D", cells: "40,000", packs: "Scrap", revenue: "₹0.02 Cr" },
];

const scalingData = [
  { evs: "100", revenue: "₹4.7 Cr", cost: "₹3.59 Cr", profit: "₹1.11 Cr" },
  { evs: "1,000", revenue: "₹47 Cr", cost: "₹35.9 Cr", profit: "₹11.1 Cr" },
  { evs: "10,000", revenue: "₹470 Cr", cost: "₹359 Cr", profit: "₹111 Cr" },
];

/* Battery % for stacked bars */
const barPcts = [29, 44, 40, 35, 38, 38];
const barLabels = ["2W Bicycle", "2W Scooter", "3W Auto", "4W Car", "Bus", "Truck"];

/* Profit values for bar chart (normalized to max) */
const profitValues = [-2500, 9000, 25000, 200000, 3150000, 652000];
const profitLabels = ["2W Bicycle", "2W Scooter", "3W Auto", "4W Car", "EV Bus", "EV Truck"];
const maxProfit = 3150000;

export default function BatteryCircularContent() {
  return (
    <>
      {/* ═══════════════════ SECTION 1: HERO ═══════════════════ */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroPill}>🔋 EV Battery Circular Economy</div>

          <h1 className={styles.heroTitle}>
            Engineering the Future of<br />EV Battery Circular Economy
          </h1>

          <span className={styles.heroHighlight}>
            Secondary Life Battery Intelligence Platform — Business Model Canvas Workshop
          </span>

          <p className={styles.heroDesc}>
            End-to-end financial and engineering model for EV battery reuse and energy infrastructure.
          </p>

          <div className={styles.heroCtas}>
            <a href="#cost-breakdown" className="btn btn-primary" data-track-event="circular_hero_explore_click">Explore Model</a>
            <a href="#bmc" className="btn btn-secondary" data-track-event="circular_hero_workshop_click">Start Workshop</a>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 2: COST & WARRANTY ═══════════════════ */}
      <section className={styles.pageSectionAlt} id="cost-breakdown">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 01</span>
            <h2 className={styles.sectionTitle}>EV Cost &amp; Warranty Breakdown</h2>
            <p className={styles.sectionSubtitle}>Understanding the true cost structure of electric vehicles across segments</p>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>EV Category</th>
                  <th>Avg Unit Price</th>
                  <th>EV Price (Without Battery)</th>
                  <th>Battery Cost</th>
                  <th>Battery %</th>
                  <th>Std Warranty</th>
                  <th>Extended</th>
                  <th>Total Warranty</th>
                </tr>
              </thead>
              <tbody>
                {costData.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{r.cat}</td>
                    <td>{r.avgPrice}</td>
                    <td>{r.evOnly}</td>
                    <td style={{ color: "var(--accent-primary)", fontWeight: 600 }}>{r.battery}</td>
                    <td style={{ color: "var(--accent-primary)", fontWeight: 700 }}>{r.pct}</td>
                    <td>{r.stdW} yr</td>
                    <td>{r.extW} yr</td>
                    <td style={{ fontWeight: 600 }}>{r.totalW} yr</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Charts */}
          <div className={styles.chartsGrid}>
            {/* Stacked Bar Chart */}
            <div className={styles.chartCard}>
              <div className={styles.chartTitle}>EV vs Battery Cost Split</div>
              <div className={styles.stackedBarChart}>
                {barLabels.map((label, i) => (
                  <div className={styles.barRow} key={i}>
                    <span className={styles.barLabel}>{label}</span>
                    <div className={styles.barTrack}>
                      <div className={styles.barSegmentEV} style={{ width: `${100 - barPcts[i]}%` }}>
                        {100 - barPcts[i]}%
                      </div>
                      <div className={styles.barSegmentBattery} style={{ width: `${barPcts[i]}%` }}>
                        {barPcts[i]}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.chartLegend}>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: "rgba(76,169,48,0.3)" }} />
                  EV (excl. Battery)
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: "var(--accent-primary)" }} />
                  Battery
                </span>
              </div>
            </div>

            {/* Insight */}
            <div className={styles.chartCard} style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div className={styles.chartTitle}>Key Insight</div>
              <div style={{ fontSize: "3rem", fontWeight: 800, color: "var(--accent-primary)", marginBottom: "0.5rem" }}>
                35–45%
              </div>
              <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                of total EV cost is attributed to the battery pack — making it the single most expensive component
                and the key driver for secondary-life economics.
              </p>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                2W Scooters have the highest battery cost ratio at 44%, while 4W Passenger EVs sit at 35%.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 3: POST-WARRANTY ═══════════════════ */}
      <section className={styles.pageSection} id="post-warranty">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 02</span>
            <h2 className={styles.sectionTitle}>Post-Warranty Economics</h2>
            <p className={styles.sectionSubtitle}>What happens after the warranty expires — depreciation, resale, and replacement economics</p>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>EV Category</th>
                  <th>Warranty</th>
                  <th>Original Price</th>
                  <th>Resale Value</th>
                  <th>Battery Replacement Cost</th>
                  <th>Battery Resale Cost</th>
                </tr>
              </thead>
              <tbody>
                {warrantyData.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{r.cat}</td>
                    <td>{r.warranty}</td>
                    <td>{r.origPrice}</td>
                    <td>{r.resale}</td>
                    <td style={{ color: "var(--error)", fontWeight: 600 }}>{r.replaceCost}</td>
                    <td>{r.battResale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.insightCard}>
            <span className={styles.insightIcon}>⚠️</span>
            <div className={styles.insightText}>
              <strong>Critical Finding:</strong> In most segments, the cost of battery replacement exceeds
              the vehicle&apos;s post-warranty resale value — creating a strong economic case for secondary-life
              battery repurposing instead of disposal.
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 4: SECONDARY LIFE MODEL ═══════════════════ */}
      <section className={styles.pageSectionAlt} id="secondary-life">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 03 — Core</span>
            <h2 className={styles.sectionTitle}>Secondary Life Business Model</h2>
            <p className={styles.sectionSubtitle}>Cell-level economics of battery repurposing across all EV segments</p>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>EV Category</th>
                  <th>Cells</th>
                  <th>Purchase Cost</th>
                  <th>Initial Diag.</th>
                  <th>Cell Testing</th>
                  <th>Pack Validation</th>
                  <th>Total Testing</th>
                  <th>A/B/C/D Cells</th>
                  <th>Cell Prices (₹)</th>
                  <th>Total Cell Value</th>
                  <th>Profit</th>
                </tr>
              </thead>
              <tbody>
                {secondaryLifeData.map((r, i) => (
                  <tr key={i} className={r.isCore ? styles.highlightRow : undefined}>
                    <td style={{ fontWeight: 600, color: "var(--text-muted)" }}>
                      {r.isCore && "⭐ "}{r.cat}
                      {r.isCore && <span className={styles.coreBadge}>⭐</span>}
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>{r.cells.toLocaleString("en-IN")}</td>
                    <td style={{ color: "var(--text-muted)" }}>{r.purchaseCost}</td>
                    <td style={{ color: "var(--text-muted)" }}>{r.initDiag}</td>
                    <td style={{ color: "var(--text-muted)" }}>{r.cellTest}</td>
                    <td style={{ color: "var(--text-muted)" }}>{r.packVal}</td>
                    <td style={{ color: "var(--text-muted)" }}>{r.totalTest}</td>
                    <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{r.abcd}</td>
                    <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{r.prices}</td>
                    <td style={{ fontWeight: 600, color: "var(--text-muted)" }}>{r.totalValue}</td>
                    <td className={r.isNeg ? styles.negativeValue : undefined} style={{ fontWeight: 700, color: r.isNeg ? undefined : "var(--accent-primary)" }}>
                      {r.profit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Visuals Row */}
          <div className={styles.chartsGrid}>
            {/* Pie Chart – Cell Distribution */}
            <div className={styles.chartCard}>
              <div className={styles.chartTitle}>Cell Grade Distribution</div>
              <div
                className={styles.pieChart}
                style={{
                  background: `conic-gradient(
                    #4CA930 0% 50%,
                    #3D8C26 50% 75%,
                    #2a6b1a 75% 90%,
                    #1a4a10 90% 100%
                  )`,
                }}
              >
                <div className={styles.pieCenter}>Cell<br />Grades</div>
              </div>
              <div className={styles.chartLegend} style={{ justifyContent: "center" }}>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: "#4CA930" }} /> A 50%
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: "#3D8C26" }} /> B 25%
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: "#2a6b1a" }} /> C 15%
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: "#1a4a10" }} /> D 10%
                </span>
              </div>
            </div>

            {/* Profit Bar Chart */}
            <div className={styles.chartCard}>
              <div className={styles.chartTitle}>Profit by Segment</div>
              <div className={styles.profitBars}>
                {profitLabels.map((label, i) => {
                  const val = profitValues[i];
                  const isNeg = val < 0;
                  const width = isNeg ? 3 : Math.max(3, (val / maxProfit) * 100);
                  return (
                    <div className={styles.profitBarRow} key={i}>
                      <span className={styles.profitBarLabel}>{label}</span>
                      <div className={styles.profitBarTrack}>
                        <div
                          className={`${styles.profitBarFill} ${label === "4W Car" ? styles.profitBarHighlight :
                            isNeg ? styles.profitBarNegative : styles.profitBarNormal
                            }`}
                          style={{ width: `${width}%` }}
                        >
                          {label === "4W Car" && "⭐"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Flow Diagram */}
          <div className={styles.chartCard} style={{ marginTop: "2rem" }}>
            <div className={styles.chartTitle}>Secondary Life Value Chain</div>
            <div className={styles.flowDiagram}>
              <div className={styles.flowStep}>
                <span className={styles.flowStepIcon}>🚗</span>
                <span className={styles.flowStepLabel}>EV</span>
              </div>
              <span className={styles.flowArrow}>→</span>
              <div className={styles.flowStep}>
                <span className={styles.flowStepIcon}>🔋</span>
                <span className={styles.flowStepLabel}>Battery</span>
              </div>
              <span className={styles.flowArrow}>→</span>
              <div className={styles.flowStep}>
                <span className={styles.flowStepIcon}>⚡</span>
                <span className={styles.flowStepLabel}>Cells</span>
              </div>
              <span className={styles.flowArrow}>→</span>
              <div className={styles.flowStep}>
                <span className={styles.flowStepIcon}>🔧</span>
                <span className={styles.flowStepLabel}>Repack</span>
              </div>
              <span className={styles.flowArrow}>→</span>
              <div className={styles.flowStep}>
                <span className={styles.flowStepIcon}>💰</span>
                <span className={styles.flowStepLabel}>Revenue</span>
              </div>
            </div>
          </div>

          {/* Insight Cards */}
          <div className={styles.insightGrid}>
            <div className={styles.insightGridCard}>
              <div className={styles.insightGridIcon}>🔌</div>
              <div className={styles.insightGridTitle}>2W Segment</div>
              <div className={styles.insightGridDesc}>Low margin — testing costs exceed cell value</div>
            </div>
            <div className={styles.insightGridCard}>
              <div className={styles.insightGridIcon}>🛺</div>
              <div className={styles.insightGridTitle}>3W Segment</div>
              <div className={styles.insightGridDesc}>Entry segment — viable for early operations</div>
            </div>
            <div className={styles.insightGridCardCore}>
              <div className={styles.insightGridIcon}>⭐</div>
              <div className={styles.insightGridTitle}>4W Passenger</div>
              <div className={styles.insightGridDesc}>Core business — highest ROI per unit</div>
            </div>
            <div className={styles.insightGridCard}>
              <div className={styles.insightGridIcon}>🚌</div>
              <div className={styles.insightGridTitle}>Bus / Truck</div>
              <div className={styles.insightGridDesc}>Scale phase — massive volume, premium margins</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 5: 100 EV CALCULATION ═══════════════════ */}
      <section className={styles.pageSection} id="100ev">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 04</span>
            <h2 className={styles.sectionTitle}>100 EV Financial Simulation</h2>
            <p className={styles.sectionSubtitle}>Projecting revenue from 100 4W passenger EVs — 4,00,000 cells</p>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Grade</th>
                  <th>Cells</th>
                  <th>Re-Packs</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {evCalcData.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: i === 0 ? "var(--accent-primary)" : "var(--text-primary)" }}>
                      Grade {r.grade}
                    </td>
                    <td>{r.cells}</td>
                    <td>{r.packs}</td>
                    <td style={{ fontWeight: 600, color: "var(--accent-primary)" }}>{r.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Cards */}
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryCardValue}>₹4.7 Cr</div>
              <div className={styles.summaryCardLabel}>Total Revenue</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryCardValue} style={{ color: "var(--text-secondary)" }}>₹3.59 Cr</div>
              <div className={styles.summaryCardLabel}>Total Cost</div>
            </div>
            <div className={styles.summaryCardProfit}>
              <div className={styles.summaryCardValue}>₹1.11 Cr</div>
              <div className={styles.summaryCardLabel}>Net Profit</div>
            </div>
          </div>

          {/* Donut + Column */}
          <div className={styles.chartsGrid} style={{ marginTop: "2.5rem" }}>
            <div className={styles.chartCard}>
              <div className={styles.chartTitle}>Revenue Split by Grade</div>
              <div
                className={styles.donutChart}
                style={{
                  background: `conic-gradient(
                    #4CA930 0% 63.8%,
                    #3D8C26 63.8% 89.4%,
                    #2a6b1a 89.4% 99.6%,
                    #1a4a10 99.6% 100%
                  )`,
                }}
              >
                <div className={styles.donutCenter}>
                  <span className={styles.donutCenterValue}>₹4.7 Cr</span>
                  <span className={styles.donutCenterLabel}>Total</span>
                </div>
              </div>
              <div className={styles.chartLegend} style={{ justifyContent: "center" }}>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: "#4CA930" }} /> A — ₹3 Cr
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: "#3D8C26" }} /> B — ₹1.2 Cr
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: "#2a6b1a" }} /> C — ₹0.48 Cr
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: "#1a4a10" }} /> D — ₹0.02 Cr
                </span>
              </div>
            </div>

            <div className={styles.chartCard}>
              <div className={styles.chartTitle}>Profit Breakdown</div>
              <div className={styles.profitBars}>
                <div className={styles.profitBarRow}>
                  <span className={styles.profitBarLabel}>Revenue</span>
                  <div className={styles.profitBarTrack}>
                    <div className={`${styles.profitBarFill} ${styles.profitBarNormal}`} style={{ width: "100%" }}>₹4.7 Cr</div>
                  </div>
                </div>
                <div className={styles.profitBarRow}>
                  <span className={styles.profitBarLabel}>Cost</span>
                  <div className={styles.profitBarTrack}>
                    <div className={`${styles.profitBarFill} ${styles.profitBarNegative}`} style={{ width: "76.4%" }}>₹3.59 Cr</div>
                  </div>
                </div>
                <div className={styles.profitBarRow}>
                  <span className={styles.profitBarLabel}>Profit</span>
                  <div className={styles.profitBarTrack}>
                    <div className={`${styles.profitBarFill} ${styles.profitBarHighlight}`} style={{ width: "23.6%" }}>₹1.11 Cr</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 6: SCALING ═══════════════════ */}
      <section className={styles.pageSectionAlt} id="scaling">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 05</span>
            <h2 className={styles.sectionTitle}>Scaling Projections</h2>
            <p className={styles.sectionSubtitle}>Revenue and profit projections at 100, 1,000, and 10,000 EV scale</p>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>EV Count</th>
                  <th>Revenue</th>
                  <th>Cost</th>
                  <th>Profit</th>
                </tr>
              </thead>
              <tbody>
                {scalingData.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>{r.evs} EVs</td>
                    <td>{r.revenue}</td>
                    <td>{r.cost}</td>
                    <td style={{ fontWeight: 700, color: "var(--accent-primary)" }}>{r.profit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Scaling Visual */}
          <div className={styles.chartCard}>
            <div className={styles.chartTitle}>Profit Growth Trajectory</div>
            <div className={styles.scalingChart}>
              <div className={styles.scalingBar}>
                <div className={styles.scalingBarFill} style={{ height: "60px" }}>₹1.11 Cr</div>
                <div className={styles.scalingBarLabel}>100 EVs</div>
              </div>
              <div className={styles.scalingBar}>
                <div className={styles.scalingBarFill} style={{ height: "140px" }}>₹11.1 Cr</div>
                <div className={styles.scalingBarLabel}>1,000 EVs</div>
              </div>
              <div className={styles.scalingBar}>
                <div className={styles.scalingBarFill} style={{ height: "260px" }}>₹111 Cr</div>
                <div className={styles.scalingBarLabel}>10,000 EVs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 7: BUSINESS MODEL CANVAS ═══════════════════ */}
      <section className={styles.pageSection} id="bmc">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 06</span>
            <h2 className={styles.sectionTitle}>Business Model Canvas</h2>
            <p className={styles.sectionSubtitle}>Strategic framework for the Secondary Life Battery business</p>
          </div>

          <div className={styles.canvasGrid}>
            {/* Row 1-2: 5 columns */}
            <div className={`${styles.canvasCell} ${styles.canvasPartners}`}>
              <div className={styles.canvasCellTitle}>Key Partners</div>
              <ul className={styles.canvasCellList}>
                <li>EV OEMs &amp; Dealers</li>
                <li>Battery recyclers</li>
                <li>Energy storage integrators</li>
                <li>Testing equipment suppliers</li>
                <li>Government bodies (FAME, PLI)</li>
              </ul>
            </div>

            <div className={`${styles.canvasCell} ${styles.canvasActivities}`}>
              <div className={styles.canvasCellTitle}>Key Activities</div>
              <ul className={styles.canvasCellList}>
                <li>Battery procurement</li>
                <li>Cell-level diagnostics</li>
                <li>Grade classification (A/B/C/D)</li>
                <li>Pack reassembly</li>
                <li>Quality certification</li>
              </ul>
            </div>

            <div className={`${styles.canvasCell} ${styles.canvasValue}`}>
              <div className={styles.canvasCellTitle}>Value Proposition</div>
              <ul className={styles.canvasCellList}>
                <li>Certified second-life battery packs at 40–60% lower cost</li>
                <li>Reduce EV battery waste by 80%+</li>
                <li>Enable affordable energy storage</li>
                <li>Full traceability with Battery Aadhaar</li>
                <li>Revenue from waste stream</li>
              </ul>
            </div>

            <div className={`${styles.canvasCell} ${styles.canvasRelations}`}>
              <div className={styles.canvasCellTitle}>Customer Relationships</div>
              <ul className={styles.canvasCellList}>
                <li>B2B contracts</li>
                <li>Performance guarantees</li>
                <li>After-sales monitoring</li>
                <li>Technical consulting</li>
              </ul>
            </div>

            <div className={`${styles.canvasCell} ${styles.canvasSegments}`}>
              <div className={styles.canvasCellTitle}>Customer Segments</div>
              <ul className={styles.canvasCellList}>
                <li>Telecom tower operators</li>
                <li>Solar + storage installers</li>
                <li>EV fleet operators (2W/3W)</li>
                <li>Industrial UPS providers</li>
                <li>Rural electrification projects</li>
              </ul>
            </div>

            <div className={`${styles.canvasCell} ${styles.canvasResources}`}>
              <div className={styles.canvasCellTitle}>Key Resources</div>
              <ul className={styles.canvasCellList}>
                <li>Cell testing lab</li>
                <li>Diagnostic AI platform</li>
                <li>Pack assembly line</li>
                <li>Skilled battery engineers</li>
              </ul>
            </div>

            <div className={`${styles.canvasCell} ${styles.canvasChannels}`}>
              <div className={styles.canvasCellTitle}>Channels</div>
              <ul className={styles.canvasCellList}>
                <li>Direct B2B sales</li>
                <li>Online marketplace</li>
                <li>EV dealer partnerships</li>
                <li>Government tenders</li>
              </ul>
            </div>

            {/* Row 3: Cost + Revenue full width */}
            <div className={`${styles.canvasCell} ${styles.canvasCost}`}>
              <div className={styles.canvasCellTitle}>Cost Structure</div>
              <ul className={styles.canvasCellList}>
                <li>Battery procurement (60–70% of cost)</li>
                <li>Testing &amp; diagnostics infrastructure</li>
                <li>Assembly labor &amp; facility</li>
                <li>Logistics &amp; warehousing</li>
                <li>Compliance &amp; certification</li>
              </ul>
            </div>

            <div className={`${styles.canvasCell} ${styles.canvasRevenue}`}>
              <div className={styles.canvasCellTitle}>Revenue Streams</div>
              <ul className={styles.canvasCellList}>
                <li>Grade-A repacked battery packs</li>
                <li>Grade-B/C energy storage modules</li>
                <li>Grade-D material recovery / scrap</li>
                <li>Diagnostics-as-a-Service</li>
                <li>Battery health consulting</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 8: FINAL CTA ═══════════════════ */}
      <section className={styles.finalSection}>
        <div className={styles.finalGlow} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <h2 className={styles.finalTitle}>From EV Waste to Energy Infrastructure</h2>
          <a href="https://itelematics.com/contact" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: "0.9rem 2.5rem", fontSize: "1.1rem", marginTop: "1.5rem" }} data-track-event="circular_pilot_contact_click">
            Start Pilot Program
          </a>
        </div>
      </section>
    </>
  );
}
