export const SCIENCE = [
  {
    title: "A small spacecraft. A complete system.",
    tag: "01 / CUBESAT BASICS",
    formula: "3U ≈ three standard CubeSat units",
    text: "A CubeSat is a small satellite built around standardized units and dispenser interfaces. Its payload performs the mission; its bus supplies power, computing, attitude control, communications and thermal support. A launch vehicle carries it to space.",
    exercise:
      "Sketch a 3U mission. Identify the payload, EPS, OBC, ADCS and radio.",
  },
  {
    title: "Continuously falling around Earth.",
    tag: "02 / ORBIT & ECLIPSE",
    formula: "T = 2π √((Rᴇ + h)³ / μ)",
    text: "Altitude changes orbital period. With a mean Earth radius of 6,371 km, a circular orbit at 500 km takes about 94.5 minutes. Earth blocks direct sunlight during eclipse. This model starts each orbit in sunlight and uses a configurable eclipse at its end; real shadows depend on geometry and season.",
    exercise:
      "Predict the effect of moving from 400 to 600 km. Run both cases and compare periods.",
  },
  {
    title: "Sunlight becomes usable power.",
    tag: "03 / SOLAR & PMAD",
    formula: "Psolar = G × A × ηcell × derating × max(0, cos θ)",
    text: "Solar cells convert light to electricity. Panel area, efficiency and incidence angle determine generation; PMAD conditions and distributes that power. Beginner mode takes peak power directly. Engineering mode exposes the same assumptions. Delivered solar power is zero during the simplified eclipse.",
    exercise:
      "At 20 W peak and 90% PMAD efficiency, calculate the 18 W delivered to the bus.",
  },
  {
    title: "Every activity has an energy cost.",
    tag: "04 / POWER BALANCE",
    formula: "Pnet = Psolar,delivered − Pload",
    text: "Watts describe an instantaneous rate. Watt-hours describe energy accumulated over time. The nominal 8 W bus uses 4.67 Wh during a 35-minute eclipse before battery losses. Payload and downlink add 10 W and 6 W to the nominal bus. Essential-only operation uses 3 W.",
    exercise:
      "Calculate the battery withdrawal for 35 minutes at 8 W with 95% discharge efficiency: about 4.91 Wh.",
  },
  {
    title: "Follow the energy in the battery.",
    tag: "05 / SOC & DEPTH OF DISCHARGE",
    formula:
      "Enew = E + ηc Pnet Δt/3600 (charging); E + Pnet Δt/(3600ηd) (discharging)",
    text: "SOC is 100 × stored energy / usable capacity; DoD is 100 − SOC. Charging stores less energy than is supplied. Discharging removes more than the loads receive. The model clamps stored energy, records rejected charge at the upper limit and reports unmet demand when the battery is empty.",
    exercise:
      "A 40 Wh battery starts at 80% SOC. Deliver 8 W for one hour at 95% efficiency: final energy ≈ 23.58 Wh and SOC ≈ 58.95%.",
  },
  {
    title: "Voltage responds to load.",
    tag: "06 / VOLTAGE & RESISTANCE",
    formula: "Vterminal = OCV(SOC) − I × Rinternal",
    text: "Open-circuit voltage comes from an editable illustrative pack lookup. Positive current means discharge. The current estimate uses requested battery power divided by OCV. Greater resistance produces more voltage sag. This diagnostic approximation does not determine SOC from voltage or solve a coupled circuit.",
    exercise:
      "At equal discharge current, double resistance and compare terminal voltage.",
  },
  {
    title: "Heat is another state to watch.",
    tag: "07 / SIMPLIFIED TEMPERATURE",
    formula: "ΔT = Δt/Cth × (I²R + Qexternal − (T − Tbus)/Rth)",
    text: "The optional lumped model balances resistive heating, an assumed external heat input and heat exchange with a fixed bus temperature. Its parameters are educational assumptions. It excludes radiative geometry, cell chemistry and thermal runaway, and cannot assess battery safety.",
    exercise:
      "Increase resistance while holding the other parameters constant. Compare the peak temperature.",
  },
  {
    title: "Protect the reserve, then recover.",
    tag: "08 / MODES & RELIABILITY",
    formula: "safe entry < reserve ≤ recovery ≤ maximum SOC",
    text: "The deterministic controller defers noncritical payload/downlink below reserve and enters safe mode below its entry threshold. It exits only after the higher recovery threshold holds for the specified dwell time. This hysteresis prevents rapid switching. Completion, brownout intervals and per-orbit margins describe the simulated outcome.",
    exercise:
      "Run Heater Stuck On. Find the first safe-mode event and explain the transition using sensed SOC.",
  },
];
export const FAQ = [
  {
    q: "What is CubeTwin?",
    a: "CubeTwin is an educational CubeSat electrical-energy simulator and 12-week learning portal. It uses transparent models and simulated data to connect orbit, sunlight, battery behaviour, mission activities and power faults.",
  },
  {
    q: "How does a CubeSat battery survive eclipse?",
    a: "During sunlight, the solar array supplies spacecraft loads and charges the battery. In eclipse, the battery supplies those loads. Teams size the energy store, account for conversion losses, protect a reserve and schedule demanding activities around available energy.",
  },
  {
    q: "What is a CubeSat electrical power system?",
    a: "The Electrical Power System (EPS) generates, stores, manages and distributes electrical power. It includes solar generation, batteries and power management and distribution (PMAD) electronics.",
  },
  {
    q: "Do I need aerospace or coding experience?",
    a: "No. Start with the bundled 3U LEO Beginner Mission, run the simulation and follow the plain-language lessons. The 12-week guide introduces the science, hand calculations, software and verification in stages.",
  },
  {
    q: "Is CubeTwin connected to a real spacecraft?",
    a: "No. All data is simulated in your browser. CubeTwin is not flight software, live telemetry, certified analysis or a validated operational digital twin. Calibration against a specific physical test article is future work.",
  },
  {
    q: "What does the Monte Carlo probability mean?",
    a: "It is the fraction of seeded simulated trials completing all activities without unmet load or undervoltage under the selected uniform input uncertainty. The confidence interval describes sampling uncertainty. Neither value is a prediction of real spacecraft reliability.",
  },
  {
    q: "Can I save my work and use the workbook offline?",
    a: "Export the complete scenario or run as JSON, export telemetry as CSV, or use Print the Workbook and choose Save as PDF. Workbook notes and weekly progress are stored only in this browser when local storage is available. Downloads can be used offline; the portal is not an offline application.",
  },
  {
    q: "Who is responsible for CubeTwin?",
    a: "CubeTwin is an EV Society™ education and research initiative hosted on EV.ENGINEER™. Commercial engineering is handled separately by iTelematics Software Private Limited under explicit agreements. UFlight™ is referenced for the broader aerospace HUMS ecosystem.",
  },
];
export const CALCULATIONS = [
  "Calculate the period of the 500 km reference orbit and repeat at 600 km.",
  "Calculate battery energy used during a 35-minute eclipse at 8 W, including 95% discharge efficiency.",
  "Compare the baseline with a 35% solar degradation fault. Explain the change in minimum SOC.",
  "Move the downlink activity into a sunlight interval. Record whether the activity completes.",
  "Trigger safe mode. Record entry, recovery threshold, dwell time and exit.",
  "Compare true SOC and observed SOC with a +15 percentage-point sensor bias.",
  "Run 50 Monte Carlo trials twice with the same seed. Explain reproducibility and uncertainty.",
  "Write a conclusion: assumptions, analytical verification, limitations and next experiment.",
];
export const WEEK_CALCULATIONS = [
  "Calculate the circular-orbit period at 500 km.",
  "Calculate energy for a 35-minute, 8 W eclipse.",
  "Integrate an 8 W load for one hour at 95% efficiency.",
  "Calculate voltage sag for 1 A at 0.12 Ω.",
  "Calculate the reserve-to-recovery energy gap.",
  "Predict the extra Wh from a 6 W heater for two hours.",
  "Calculate equivalent cycles from charge/discharge throughput.",
  "Convert one sample time into orbital phase.",
  "Compute a completion fraction and compare its confidence interval.",
  "Close the generated, consumed and stored energy balance.",
  "Check canonical URLs and a public crawler response.",
  "Compare final demonstration results against requirements.",
];
export const REFERENCES = [
  {
    name: "NASA · CubeSat 101",
    detail: "Mission development and beginner systems engineering",
    href: "https://www.nasa.gov/wp-content/uploads/2017/03/nasa_csli_cubesat_101_508.pdf",
  },
  {
    name: "Cal Poly · CubeSat Design Specification",
    detail: "CubeSat units and preliminary interface requirements",
    href: "https://www.cubesat.org/cubesatinfo",
  },
  {
    name: "NASA · Small Spacecraft Power Systems",
    detail: "Electrical power generation, storage and distribution",
    href: "https://www.nasa.gov/smallsat-institute/sst-soa/power-subsystems/",
  },
  {
    name: "ECSS · Li-ion Battery Testing Handbook",
    detail: "Battery test considerations; consult applicable revisions",
    href: "https://ecss.nl/wp-content/uploads/2016/06/ECSS-E-HB-20-02A1October2015.pdf",
  },
  {
    name: "NASA · General Mission Analysis Tool",
    detail: "A future reference for higher-fidelity orbital comparisons",
    href: "https://gmat.atlassian.net/wiki/spaces/GW/overview",
  },
  {
    name: "Orekit · Official documentation",
    detail: "A future reference for orbit and shadow modelling",
    href: "https://www.orekit.org/",
  },
];
