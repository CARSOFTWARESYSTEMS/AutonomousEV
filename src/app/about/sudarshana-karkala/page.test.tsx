import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

// The page uses the Space fonts; next/font is not available under Vitest.
vi.mock("next/font/google", () => ({ Manrope: () => ({ variable: "font-manrope" }), Inter: () => ({ variable: "font-inter" }) }));

import ProfilePage, { metadata } from "./page";

/** The page's structured data, as it is in the rendered HTML. */
function graphOf(container: HTMLElement) {
  return JSON.parse(container.querySelector('script[type="application/ld+json"]')?.textContent ?? "{}")["@graph"] as Record<string, unknown>[];
}
const personNode = (container: HTMLElement) => graphOf(container).find((node) => node["@type"] === "Person") as Record<string, unknown>;
/** The text a reader sees: the page without its structured data, with a space where one block ends and the next begins. */
function visibleText(container: Element) {
  const copy = container.cloneNode(true) as HTMLElement;
  copy.querySelectorAll("script").forEach((script) => script.remove());
  const holder = document.createElement("div");
  holder.innerHTML = copy.innerHTML.replace(/<\/(p|h[1-6]|li|ul|div|section|article|header|footer|span)>/g, " </$1>");
  return (holder.textContent ?? "").replace(/\s+/g, " ");
}
/** The text of each paragraph, heading and list item, one by one: what a reader takes in as one statement. */
const statements = (container: Element) => [...container.querySelectorAll("p, li, h1, h2, h3, h4")].map((block) => (block.textContent ?? "").replace(/\s+/g, " "));
const section = (name: string | RegExp) => screen.getByRole("region", { name });

describe("/about/sudarshana-karkala: who he is", () => {
  it("leads with the name, then the engineering identity and the primary initiative on one line, then one line of focus", () => {
    render(<ProfilePage />);
    const hero = section("Sudarshana Karkala");
    expect(within(hero).getByRole("heading", { level: 1, name: "Sudarshana Karkala" })).toBeInTheDocument();
    expect([...hero.querySelectorAll("p")].map((p) => p.textContent?.replace(/\s+/g, " "))).toEqual([
      "EV.ENGINEER™ @ ISHAVASYAM.ORG",
      "Space Station Research · Satellite & Rocket Engineering · Digital Twins · Cybersecurity",
    ]);
    // The "@" between them is for the eye: a screen reader hears the two names.
    expect(hero.querySelector('[aria-hidden="true"]')).toHaveTextContent(/^@$/);
    expect(within(hero).getByRole("img", { name: "Portrait of Sudarshana Karkala" })).toBeInTheDocument();
    // The hero holds no button and no further title. Its two names are the links to those organisations' own sites.
    expect(within(hero).queryAllByRole("button")).toHaveLength(0);
    expect(within(hero).getAllByRole("link").map((a) => [a.textContent, a.getAttribute("href")])).toEqual([
      ["EV.ENGINEER™", "https://autonomous.ev.engineer/"],
      ["ISHAVASYAM.ORG", "https://ishavasyam.org/"],
    ]);
    for (const link of within(hero).getAllByRole("link")) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      // Its name begins with the words on it, and says that it leaves the page.
      expect(link).toHaveAccessibleName(`${link.textContent} (opens in a new tab)`);
      // A link and nothing more: the name itself, with no arrow or badge added to the hero.
      expect(link.children).toHaveLength(0);
    }
  });

  it("names EV.ENGINEER™ and ISHAVASYAM.ORG in the hero and no title, and nowhere states that he is a Consultant at iTelematics", () => {
    const { container } = render(<ProfilePage />);
    const hero = section("Sudarshana Karkala");
    expect(hero).toHaveTextContent("EV.ENGINEER™ @ ISHAVASYAM.ORG");
    expect(hero).not.toHaveTextContent(/Founder|Consult|iTelematics|Director|Manager/);
    // The old standalone statement is gone, in every form it took.
    expect(visibleText(container)).not.toMatch(/Consultant (at|—|,|to) iTelematics|a Consultant at/i);
    expect(screen.queryByText("Consultant")).toBeNull();
    // iTelematics is not in About, nor in the career: it is a consulting engagement, and only that.
    expect(section("About")).not.toHaveTextContent(/iTelematics|Consult/);
    expect(section("Professional Background")).not.toHaveTextContent(/iTelematics|Consult/);
  });

  it("never presents EV.ENGINEER™ as a founder title, on the page or in its data", () => {
    const { container } = render(<ProfilePage />);
    const text = visibleText(container);
    // No statement on the page has "founder" and EV.ENGINEER in it together. (The hero names EV.ENGINEER™ and ISHAVASYAM.ORG side by side, with no title.)
    for (const statement of statements(container)) expect(statement).not.toMatch(/found(er|ed)[^.]*EV\.ENGINEER|EV\.ENGINEER[^.]*found(er|ed)/i);
    expect(statements(container)).toContain("EV.ENGINEER™");
    const data = JSON.stringify(graphOf(container));
    expect(data).not.toMatch(/founder of (the )?EV\.ENGINEER|founded (the )?EV\.ENGINEER/i);
    expect(metadata.description).not.toMatch(/founder of EV\.ENGINEER/i);
    // What it is instead is said once, in its own card.
    expect(text.match(/EV\.ENGINEER™ represents the engineering identity of our team and the projects we build together\./g)).toHaveLength(1);
  });

  it("introduces him in two short paragraphs, and no more", () => {
    render(<ProfilePage />);
    const paragraphs = [...section("About").querySelectorAll("p")].map((p) => p.textContent);
    expect(paragraphs).toEqual([
      "Sudarshana Karkala is a technology leader and systems architect working across Space, Aerospace, Digital Twins, Cybersecurity, Electric Vehicles and intelligent energy systems.",
      "His engineering background spans software architecture, cybersecurity, connected systems and advanced engineering R&D, with current research interests in Space Station systems, satellite engineering, rocket and propulsion systems, spacecraft health and Digital Twins.",
    ]);
  });
});

describe("/about/sudarshana-karkala: the initiatives", () => {
  it("puts ISHAVASYAM.ORG first, as the primary initiative, with a short description and its own address", () => {
    render(<ProfilePage />);
    const primary = section("ISHAVASYAM.ORG");
    expect(within(primary).getByRole("heading", { level: 2, name: "ISHAVASYAM.ORG" })).toBeInTheDocument();
    expect(primary).toHaveTextContent("Primary initiative");
    expect(primary).toHaveTextContent("Research · Engineering · Experimentation");
    expect(primary).toHaveTextContent(
      "Space-focused research and engineering initiative exploring Space Station systems, Satellite Engineering, Rocket & Propulsion research, spacecraft Digital Twins and autonomous spacecraft health.",
    );
    const site = within(primary).getByRole("link", { name: /^ishavasyam\.org/ });
    expect(site).toHaveAttribute("href", "https://ishavasyam.org/");
    expect(site).toHaveAttribute("target", "_blank");
    expect(site).toHaveAttribute("rel", "noopener noreferrer");
    expect(site).toHaveAccessibleName(/^ishavasyam\.org\s*\(opens in a new tab\)$/);
    expect(within(primary).getByRole("link", { name: "Space initiative" })).toHaveAttribute("href", "/space");
    // It comes before the other initiatives.
    expect(primary.compareDocumentPosition(section("Initiatives")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("lists EV.ENGINEER™ and CAR SOFTWARE SYSTEMS as two small cards, each with its established line and its address", () => {
    render(<ProfilePage />);
    const cards = within(section("Initiatives")).getAllByRole("article");
    const links = (card: HTMLElement) => within(card).getAllByRole("link").map((a) => [a.textContent?.replace(/\s*\(opens in a new tab\)/, ""), a.getAttribute("href")]);
    expect(cards.map((card) => within(card).getByRole("heading", { level: 3 }).textContent)).toEqual(["EV.ENGINEER™", "CAR SOFTWARE SYSTEMS"]);
    expect(cards[0]).toHaveTextContent("Building World-Class Engineers to Solve Energy and EV Battery Challenges");
    // Its own site, and beside it the gallery of its workshops.
    expect(links(cards[0])).toEqual([
      ["autonomous.ev.engineer", "https://autonomous.ev.engineer/"],
      ["Workshop gallery", "/workshop-gallery"],
    ]);
    expect(cards[1]).toHaveTextContent("Electric Vehicle Engineering · Agentic AI Development");
    // Its own site, and beside it the workshops and labs.
    expect(links(cards[1])).toEqual([
      ["carsoftwaresystems.com", "https://carsoftwaresystems.com/"],
      ["Workshop / Labs", "https://labs.ev.engineer/"],
    ]);
    for (const card of cards) {
      for (const link of within(card).getAllByRole("link")) {
        // A link that leaves the site opens in a new tab, safely; a page of this site opens in place.
        if (link.getAttribute("href")?.startsWith("http")) expect(link).toHaveAttribute("rel", "noopener noreferrer");
        else expect(link).not.toHaveAttribute("target");
      }
      // A card, not a corporate page: a name, a line, at most one sentence, at most two links.
      expect(card.querySelectorAll("p").length).toBeLessThanOrEqual(2);
      expect(within(card).getAllByRole("link").length).toBeLessThanOrEqual(2);
    }
  });
});

describe("/about/sudarshana-karkala: what he works on", () => {
  it("shows four compact focus areas, as short lists and not as chips or cards of skills", () => {
    render(<ProfilePage />);
    const research = section("Research & Engineering");
    const areas = within(research).getAllByRole("heading", { level: 3 });
    expect(areas.map((h) => h.textContent)).toEqual(["Space Systems", "Digital Twins", "Cybersecurity", "EV & Energy"]);
    const items = (title: string) => within(within(research).getByRole("heading", { level: 3, name: title }).parentElement!).getAllByRole("listitem").map((li) => li.textContent);
    expect(items("Space Systems")).toEqual(["Space Station", "Satellite Engineering", "Rocket & Propulsion", "Spacecraft Health"]);
    expect(items("Digital Twins")).toEqual(["Simulation", "Telemetry", "State Estimation", "FDIR", "Prognostics"]);
    expect(items("Cybersecurity")).toEqual(["Aerospace", "Automotive", "Connected Systems", "Data Integrity"]);
    expect(items("EV & Energy")).toEqual(["Battery Intelligence", "BMS", "Diagnostics", "Energy Systems"]);
    expect(within(research).getAllByRole("listitem")).toHaveLength(17);
  });

  it("says what kind of work the Space and Aerospace work is in one quiet sentence, once, and repeats no maturity disclaimers", () => {
    const { container } = render(<ProfilePage />);
    const text = visibleText(container);
    expect(text.match(/Space and Aerospace activities include research, simulation, engineering development and education\./g)).toHaveLength(1);
    expect(text).not.toMatch(/flight[- ]qualif|operational[- ]spacecraft|physical[- ]engine|not validated|not presented as/i);
    // And it claims no credential it does not show.
    // A subject is not a title: "Rocket Engineering" is on the page, "rocket engineer" is not.
    expect(text).not.toMatch(/\bpropulsion (expert|specialist|engineer)\b|\brocket (scientist|engineer)\b|flight heritage|flight[- ]proven|space[- ]qualified/i);
    expect(text).not.toMatch(/validated (physical[- ]engine |rocket[- ]engine |propulsion )?Digital Twin/i);
    expect(text).not.toMatch(/certified (spacecraft|satellite|aerospace|space|avionics)/i);
    expect(text).not.toMatch(/ISRO Certified|IN-SPACe Certified Scientist|Rocket Scientist|Aerospace Engineer certification/i);
  });

  it("lists six pieces of selected work, each a title that links to its page and a few words on what it is", () => {
    render(<ProfilePage />);
    const work = within(section("Selected Work")).getAllByRole("listitem");
    expect(work.map((li) => [within(li).getByRole("link").getAttribute("href"), li.textContent?.replace(/\s+/g, " ").trim()])).toEqual([
      ["/space/space-station", "Space Station Research Research simulator"],
      ["/space/satellite-engineering", "Satellite Engineering Course"],
      ["/space/rocket-engine-digital-twin-advanced", "Advanced Rocket Propulsion Digital Twin Engineering tutorial"],
      ["/space/cubesat", "CubeTwin — CubeSat Digital Twin Educational simulator"],
      ["/space/model-rocketry", "Model Rocketry Learning programme"],
      ["/si-ems", "EV Battery Intelligence Research"],
    ]);
    // The project pages are the evidence: nothing here explains their physics, AI or FDIR.
    expect(section("Selected Work")).not.toHaveTextContent(/physics-based|state estimation|anomaly detection|fault diagnosis|pressure instrumentation/i);
  });
});

describe("/about/sudarshana-karkala: professional background", () => {
  const entries = () => [...section("Professional Background").querySelectorAll("ol > li")];
  const text = (element: Element) => (element.textContent ?? "").replace(/\s+/g, " ").trim();
  /** The parts of an entry, in order: the dates, then the organisation, the role and the domain where it has them. */
  const parts = (entry: Element) => [entry.children[0], ...entry.children[1].children].map(text);

  it("opens with how long and in what, and one sentence, then the career in the owner's order", () => {
    render(<ProfilePage />);
    const background = section("Professional Background");
    const [eyebrow, intro] = [...background.querySelectorAll("p")];
    expect(text(eyebrow)).toBe("20+ Years · Engineering · Technology · Leadership");
    expect(text(intro)).toBe(
      "Engineering and technology leadership experience spanning software architecture, cybersecurity, connected systems, mobile platforms, IoT, AI and EV battery technologies, extending more recently into aerospace and emerging space-systems research.",
    );
    expect(entries().map(text)).toEqual([
      "Nov 2025 — Nov 2026 Thasmai InfoTech Private Limited Co-Founder · Director Technology entrepreneurship, engineering R&D and aerospace / space research initiatives.",
      "Dec 2024 — Nov 2026 Gamyaa AeroSystems Co-Founder · Director Defence and Aerospace Engineering Intelligence initiatives, with a focus on quality, engineering workflows and emerging aerospace technologies.",
      "Jul 2021 — Dec 2024 Enphase Solar Energy Private Limited Senior Engineering Manager Software Engineering · Mobile Platforms · Connected Energy Systems · Cybersecurity",
      "Oct 2011 — Jul 2021 McAfee Software India Private Limited Engineering Manager Software Engineering · Mobile Security · Cybersecurity · Developer Ecosystems",
      "May 2005 — Sep 2011 NMS Communications · Ness Digital Engineering · eNovate Media Solutions",
    ]);
    // An ordered list: the order is the career's. The two roles held now are marked as such.
    expect(background.querySelector("ol")).not.toBeNull();
    expect(entries().map((entry) => entry.getAttribute("data-kind"))).toEqual(["current", "current", "previous", "previous", "previous"]);
  });

  it("writes each entry as date, organisation, role, domain, with the organisation and the role in elements of their own", () => {
    render(<ProfilePage />);
    expect(parts(entries()[2])).toEqual(["Jul 2021 — Dec 2024", "Enphase Solar Energy Private Limited", "Senior Engineering Manager", "Software Engineering · Mobile Platforms · Connected Energy Systems · Cybersecurity"]);
    expect(parts(entries()[3])).toEqual(["Oct 2011 — Jul 2021", "McAfee Software India Private Limited", "Engineering Manager", "Software Engineering · Mobile Security · Cybersecurity · Developer Ecosystems"]);
    expect(parts(entries()[0]).slice(1, 3)).toEqual(["Thasmai InfoTech Private Limited", "Co-Founder · Director"]);
    expect(parts(entries()[1]).slice(1, 3)).toEqual(["Gamyaa AeroSystems", "Co-Founder · Director"]);
    // The earlier career has no title on record, so none is written: the names and the dates, and nothing more.
    expect(parts(entries()[4])).toEqual(["May 2005 — Sep 2011", "NMS Communications · Ness Digital Engineering · eNovate Media Solutions"]);
    // The organisation is set apart from the role beneath it.
    const [name, role] = [...entries()[2].children[1].children];
    expect(name.className).not.toBe(role.className);
  });

  it("keeps the dates as they were given, to the month, in the text and in the markup", () => {
    render(<ProfilePage />);
    const dates = entries().map((entry) => [...entry.querySelectorAll("time")].map((time) => [time.textContent, time.getAttribute("datetime")]));
    expect(dates).toEqual([
      [["Nov 2025", "2025-11"], ["Nov 2026", "2026-11"]],
      [["Dec 2024", "2024-12"], ["Nov 2026", "2026-11"]],
      [["Jul 2021", "2021-07"], ["Dec 2024", "2024-12"]],
      [["Oct 2011", "2011-10"], ["Jul 2021", "2021-07"]],
      [["May 2005", "2005-05"], ["Sep 2011", "2011-09"]],
    ]);
    // Most recent start first.
    const starts = dates.map(([from]) => from[1]);
    expect([...starts].sort().reverse()).toEqual(starts);
  });

  it("claims nothing beyond the roles and domains given: no responsibility, achievement, customer, figure or registration", () => {
    const { container } = render(<ProfilePage />);
    for (const entry of entries()) {
      expect(text(entry)).not.toMatch(/responsib|built|delivered|\bled\b|head of|principal|\bVP\b|\bCTO\b|revenue|customer|client|award|certified|registered|incorporated|\d+\s*(people|engineers|users|%)/i);
    }
    // Gamyaa is named without a legal form, on the page and everywhere it might be read.
    expect(visibleText(container)).toContain("Gamyaa AeroSystems");
    expect(visibleText(container)).not.toMatch(/Gamyaa AeroSystems (Private Limited|Pvt|Ltd)/i);
  });

  it("never presents an employer as a Space or Aerospace employer: those words are only in the two ventures of the last two years", () => {
    render(<ProfilePage />);
    for (const entry of entries().slice(2)) expect(text(entry)).not.toMatch(/space|aerospace|satellite|rocket|orbit|defence|avionics/i);
  });

  it("keeps the established experience apart from the current and emerging focus, in two lines of their own", () => {
    render(<ProfilePage />);
    const groups = within(section("Professional Background")).getAllByRole("heading", { level: 3 });
    expect(groups.map((heading) => heading.textContent)).toEqual(["Established Professional Experience", "Current / Emerging Engineering & Research Focus"]);
    const line = (heading: Element) => text(heading.nextElementSibling!);
    expect(line(groups[0])).toBe("Software Engineering · Systems Architecture · Cybersecurity · Mobile Platforms · Connected Systems · IoT · Energy Systems · Engineering Leadership");
    expect(line(groups[1])).toBe("Space Systems · Aerospace · Digital Twins · Avionics · Telemetry · IVHM / FDIR / PHM · AI-assisted Engineering · EV Battery Intelligence");
    // The established experience names no Space or Aerospace subject, and neither line names an organisation or a length of time.
    expect(line(groups[0])).not.toMatch(/space|aerospace|satellite|rocket|avionics/i);
    for (const heading of groups) expect(line(heading)).not.toMatch(/Enphase|McAfee|NMS|Ness|eNovate|Thasmai|Gamyaa|\d{4}|years|decades/i);
  });

  it("links the organisations that have an address on record, and invents none for the others", () => {
    render(<ProfilePage />);
    const links = within(section("Professional Background")).getAllByRole("link");
    expect(links.map((a) => [a.textContent, a.getAttribute("href")])).toEqual([
      ["Thasmai InfoTech Private Limited", "https://www.thasmaiinfotech.com/space-research"],
      ["Gamyaa AeroSystems", "https://aerosystems.gamyaa.in/"],
      ["NMS Communications", "https://www.nmscommunications.com/"],
    ]);
    for (const link of links) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link).toHaveAccessibleName(`${link.textContent} (opens in a new tab)`);
      // A name and nothing more: no icon beside it to push the row out of line.
      expect(link.children).toHaveLength(0);
    }
    // A former employer's link is an ordinary link out: it declares no analytics event of its own.
    expect(links[2].getAttributeNames().filter((name) => name.startsWith("data-"))).toEqual([]);
  });

  it("names Thasmai and Gamyaa once each, in the career, and not in the hero, a heading or the structured data", () => {
    const { container } = render(<ProfilePage />);
    expect(visibleText(container).match(/Thasmai/g)).toHaveLength(1);
    expect(visibleText(container).match(/Gamyaa/g)).toHaveLength(1);
    expect(section("Sudarshana Karkala")).not.toHaveTextContent(/Thasmai|Gamyaa/);
    expect(screen.queryByRole("heading", { name: /Thasmai|Gamyaa/ })).toBeNull();
    expect(JSON.stringify(graphOf(container))).not.toMatch(/Thasmai|Gamyaa/i);
  });

  it("adds no employer, consulting organisation or institution to the structured data, and states only the hero's role there", () => {
    const { container } = render(<ProfilePage />);
    const data = JSON.stringify(graphOf(container));
    expect(data).not.toMatch(/Enphase|McAfee|NMS Communications|Ness Digital|eNovate|Skill-Lync|Schaeffler|Crompton|iFab|Canara|Sahyadri|Malnad|Chintamani|Dayananda|BMS College/);
    const person = personNode(container);
    expect(person.jobTitle).toBe("Founder, ISHAVASYAM.ORG");
    expect(person.affiliation).toEqual({ "@id": "https://ishavasyam.org/#organization" });
    expect(person.worksFor).toBeUndefined();
    expect(JSON.stringify(person)).not.toMatch(/Consultant|iTelematics/);
    expect(person.alumniOf).toEqual({ "@type": "CollegeOrUniversity", name: "National Institute of Technology Karnataka, Surathkal" });
  });

  it("never puts a length of experience and Space or Aerospace in the same statement", () => {
    const { container } = render(<ProfilePage />);
    // "20+ Years" is said of engineering, technology and leadership, in a statement of its own.
    expect(statements(container)).toContain("20+ Years · Engineering · Technology · Leadership");
    for (const statement of statements(container)) {
      expect(statement).not.toMatch(/(two decades|20\+? years|\d+\+? years)[^.]*(aerospace|space|satellite|rocket)/i);
      expect(statement).not.toMatch(/(aerospace|space|satellite|rocket)[^.]*(two decades|20\+? years|\d+\+? years)/i);
    }
    // The sentence beneath it comes to Aerospace and Space last, as the more recent work.
    expect(section("Professional Background").querySelectorAll("p")[1]).toHaveTextContent(/more recently into aerospace and emerging space-systems research\.$/);
    expect(JSON.stringify(personNode(container))).not.toMatch(/two decades|20\+? years/i);
  });
});

describe("/about/sudarshana-karkala: consulting engagements", () => {
  const consulting = () => section("Consulting Engagements");
  const rows = () => within(consulting()).getAllByRole("listitem");
  const text = (element: Element) => (element.textContent ?? "").replace(/\s+/g, " ").trim();

  it("follows the career as a section of its own, with one period for all its engagements", () => {
    render(<ProfilePage />);
    expect(section("Professional Background").compareDocumentPosition(consulting()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const [period, intro] = [...consulting().querySelectorAll(":scope p")];
    expect(text(period)).toBe("Dec 2024 — Nov 2026");
    expect([...period.querySelectorAll("time")].map((time) => time.getAttribute("datetime"))).toEqual(["2024-12", "2026-11"]);
    expect(text(intro)).toBe(
      "Worked across selected engineering, technology and training engagements spanning mobile software, GenAI, automotive engineering, embedded systems, IoT, aerospace, EV battery technologies and space research.",
    );
    expect(rows().map(text)).toEqual([
      "Skill-Lync Trainer & Consultant iOS · GenAI · Agentic AI",
      "Schaeffler India Consulting Engagement GenAI for Automotive & Embedded Engineering",
      "Crompton Greaves Consumer Electricals Consulting Engagement Smart Home IoT · iOS · Bluetooth Low Energy (BLE)",
      "iFab Innovations Consulting Engagement Aerospace Engineering",
      "iTelematics Software Private Limited Consulting Engagement EV Battery · Engineering Research · Space Research",
    ]);
    // A row is an organisation, what kind of engagement, and its areas: no dates of its own, so none reads as a position held.
    for (const row of rows()) {
      expect(row.children).toHaveLength(3);
      expect(row.querySelector("time")).toBeNull();
    }
  });

  it("calls each a consulting engagement, and none a position, employment, partnership, customer or deployment", () => {
    render(<ProfilePage />);
    expect(rows().map((row) => row.children[1].textContent)).toEqual(["Trainer & Consultant", "Consulting Engagement", "Consulting Engagement", "Consulting Engagement", "Consulting Engagement"]);
    expect(consulting()).not.toHaveTextContent(/employ|full[- ]time|permanent|partner|client|customer|endors|deploy|director|manager|head of|\bCTO\b|\bVP\b/i);
  });

  it("names iTelematics once on the page, here, with its address", () => {
    const { container } = render(<ProfilePage />);
    expect(visibleText(container).match(/iTelematics/g)).toHaveLength(1);
    const links = within(consulting()).getAllByRole("link");
    expect(links.map((a) => [a.textContent, a.getAttribute("href")])).toEqual([["iTelematics Software Private Limited", "https://itelematics.com/"]]);
    expect(links[0]).toHaveAttribute("target", "_blank");
    expect(links[0]).toHaveAttribute("rel", "noopener noreferrer");
    expect(links[0]).toHaveAccessibleName("iTelematics Software Private Limited (opens in a new tab)");
  });
});

describe("/about/sudarshana-karkala: academic engagement and student mentorship", () => {
  const academic = () => section("Academic Engagement & Student Mentorship");
  const text = (element: Element) => (element.textContent ?? "").replace(/\s+/g, " ").trim();
  const heading = (name: string) => within(academic()).getByRole("heading", { level: 3, name });

  it("follows the consulting, from 2001 to the present, with one sentence on what it is", () => {
    render(<ProfilePage />);
    expect(section("Consulting Engagements").compareDocumentPosition(academic()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const [period, intro] = [...academic().querySelectorAll("p")];
    expect(text(period)).toBe("2001 — Present");
    expect(period.querySelector("time")).toHaveAttribute("datetime", "2001");
    expect(text(intro)).toBe(
      "Guided engineering students through webinars, seminars, technical sessions, project mentoring, engineering reviews, career guidance and industry-oriented project development across software, cybersecurity, embedded systems, IoT, EV technologies, GenAI, aerospace and space engineering.",
    );
  });

  it("lists the fifteen institutions engaged, each with its place where one was given", () => {
    render(<ProfilePage />);
    const list = heading("Engineering Institutions Engaged").nextElementSibling!;
    expect(list.tagName).toBe("UL");
    expect([...list.querySelectorAll("li")].map(text)).toEqual([
      "National Institute of Technology Karnataka (NITK), Surathkal",
      "Canara Engineering College, Benjanapadavu, Mangaluru",
      "SRM Institute of Science and Technology, Tiruchirappalli",
      "NMAM Institute of Technology (NMAMIT), Nitte",
      "A J Institute of Engineering & Technology, Mangaluru",
      "Srinivas Institute of Technology, Mangaluru",
      "Sahyadri College of Engineering & Management, Mangaluru",
      "SDM Institute of Technology, Ujire",
      "SNM Polytechnic, Moodbidri",
      "Mangalore Institute of Technology & Engineering (MITE)",
      "Padre Conceicao College of Engineering, Goa",
      "BMS College of Engineering, Bengaluru",
      "Dayananda Sagar College of Engineering, Bengaluru",
      "Malnad College of Engineering, Hassan",
      "VTU Constituent College, Chintamani",
    ]);
  });

  it("names each institution as the place of the engagement, never as an employer or a partner", () => {
    const { container } = render(<ProfilePage />);
    expect(academic()).not.toHaveTextContent(/employ|faculty|professor|lecturer|visiting|adjunct|staff|partner|affiliat|appointed|on behalf of/i);
    // An institution is named, and linked to nothing that could read as an endorsement.
    expect(within(academic()).queryAllByRole("link")).toHaveLength(0);
    expect(JSON.stringify(graphOf(container))).not.toMatch(/Canara|Sahyadri|Malnad|Chintamani|Padre Conceicao|Dayananda|BMS College|Srinivas Institute|SDM Institute|SNM Polytechnic|NMAMIT|SRM Institute|Mangalore Institute/);
  });

  it("highlights the McAfee Student Developer Program in one restrained callout", () => {
    render(<ProfilePage />);
    const callout = heading("McAfee Student Developer Program").parentElement!;
    expect([...callout.children].map(text)).toEqual([
      "Industry–Academia Initiative",
      "McAfee Student Developer Program",
      "Initiated student-focused activities through the McAfee Student Developer Program, supporting engineering engagement, project guidance, internships and industry exposure as part of McAfee's CSR-related student initiatives.",
    ]);
    // He initiated activities within it. The programme, and McAfee's CSR, are not claimed as his.
    expect(callout).not.toHaveTextContent(/founded|founder|owned|\bled\b|head of|ran the|responsible for|established/i);
  });

  it("ends with the engagement areas, on one line and not as cards", () => {
    render(<ProfilePage />);
    const line = heading("Engagement Areas").nextElementSibling!;
    expect(line.tagName).toBe("P");
    expect(text(line)).toBe("Webinars · Seminars · Technical Sessions · Student Project Guidance · Technical Mentoring · Engineering Reviews · Industry Exposure · Internships · Innovation & R&D Guidance");
    expect(line.nextElementSibling).toBeNull();
    expect(academic().querySelectorAll("article")).toHaveLength(0);
    expect(within(academic()).getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["Engineering Institutions Engaged", "McAfee Student Developer Program", "Engagement Areas"]);
  });
});

describe("/about/sudarshana-karkala: workshops and certifications", () => {
  const learning = () => section("Workshops & Certifications");
  const rows = () => within(learning()).getAllByRole("listitem").map((li) => li.textContent?.replace(/\s+/g, " ").trim());

  it("is named Workshops & Certifications, with the degree first, then the certification, then IN-SPACe and CSIR-NAL", () => {
    render(<ProfilePage />);
    expect(within(learning()).getByRole("heading", { level: 2, name: "Workshops & Certifications" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Education & Professional Development/ })).toBeNull();
    expect(rows()).toEqual([
      "NITK Surathkal B.E. — Information Technology Education",
      "IIT Madras — CODE Electric Vehicle Engineering & Development Professional certification",
      "IN-SPACe Model Rocketry · CANSAT · Semiconductor · Aerospace & Space Systems Workshops & Certification",
      "CSIR-NAL Aircraft Structural Health Monitoring (NW-ASHM 2026) from CSIR–National Aerospace Laboratories Workshops & Certification",
      "EV Society™ Certified EV Technology Officer (EVTO™) In progress · expected Mar 2028",
      "Business P.A.C.E. Business & Entrepreneurship Development Rajiv Talreja / QuantumLeap",
    ]);
  });

  it("gives IN-SPACe one row with its four areas of learning: no date, no lecture list, no separate Semiconductor row, no line beneath", () => {
    const { container } = render(<ProfilePage />);
    const text = visibleText(container);
    expect(text).not.toMatch(/Workshop · Aug 2026|Aug 2026|Upcoming Workshop|Essentials of Model Rocketry/);
    for (const lecture of ["Mission Design", "Structures & Aerodynamics", "RF & Communications", "Separation & Deployment", "Recovery Systems", "Manufacturing & Quality Assurance"]) expect(text).not.toContain(lecture);
    // The areas are said once, on the IN-SPACe row, and the section ends with its list.
    expect(text.match(/CANSAT/g)).toHaveLength(1);
    expect(text.match(/Semiconductor/g)).toHaveLength(1);
    expect(text.match(/Aerospace & Space Systems/g)).toHaveLength(1);
    expect(learning().querySelectorAll("p")).toHaveLength(0);
    expect(within(learning()).getAllByRole("listitem")).toHaveLength(6);
  });

  it("labels the IN-SPACe row as the owner does, and claims no title, award or completion from it", () => {
    const { container } = render(<ProfilePage />);
    const row = screen.getByText("IN-SPACe").closest("li")!;
    // What kind of thing it is, in the row's third place, like "Education" and "Professional certification" on the rows above.
    expect([...row.children].at(-1)).toHaveTextContent(/^Workshops & Certification$/);
    expect(row.children).toHaveLength(3);
    // Nothing more is said of it: no "certified", no completion, no award, no title.
    expect(row.textContent).not.toMatch(/certified|complet|attended|awarded|earned|passed|qualified/i);
    expect(visibleText(container)).not.toMatch(/ISRO Certified|IN-SPACe Certified|Certified by IN-SPACe|Rocket Scientist|Aerospace Engineer certification/i);
    // It is not a credential in the structured data.
    expect(JSON.stringify(graphOf(container))).not.toMatch(/semiconductor|cansat|IN-SPACe/i);
  });

  it("lists the CSIR-NAL workshop directly after IN-SPACe: the short name, then the workshop and the laboratory in full, then what kind of thing it is", () => {
    const { container } = render(<ProfilePage />);
    const row = screen.getByText("CSIR-NAL").closest("li")!;
    expect([...row.children].map((cell) => cell.textContent)).toEqual([
      "CSIR-NAL",
      "Aircraft Structural Health Monitoring (NW-ASHM 2026) from CSIR–National Aerospace Laboratories",
      "Workshops & Certification",
    ]);
    // The code in brackets stays in one piece when the line wraps.
    expect(row.querySelector("span span")).toHaveTextContent(/^\(NW-ASHM 2026\)$/);
    expect(row.previousElementSibling).toHaveTextContent(/^IN-SPACe/);
    expect(row.nextElementSibling).toHaveTextContent(/^EV Society™/);
    // Named as given, and nothing added to it: no title, no completion, no award.
    expect(row.textContent).not.toMatch(/certified|complet|attended|awarded|earned|passed|qualified|expert/i);
    // Like the rest of the learning, it is not a credential in the structured data.
    expect(JSON.stringify(graphOf(container))).not.toMatch(/CSIR|Aerospace Laboratories|Structural Health|NW-ASHM/i);
  });

  it("marks what is not finished, and says what kind of thing each of the others is", () => {
    render(<ProfilePage />);
    expect(screen.getByText("In progress · expected Mar 2028")).toHaveAttribute("data-status", "in-progress");
    expect(screen.getByText("Professional certification")).not.toHaveAttribute("data-status");
    for (const label of screen.getAllByText("Workshops & Certification")) expect(label).not.toHaveAttribute("data-status");
    expect(screen.getByText("Education")).not.toHaveAttribute("data-status");
    // The IIT Madras programme is a certification and never a degree.
    expect(document.body.textContent).not.toMatch(/IIT Madras[^.]*(degree|B\.Tech|M\.Tech)/i);
  });
});

describe("/about/sudarshana-karkala: contact", () => {
  it("ends with Contact / Consultation: one line of topics and the verified contact actions", () => {
    render(<ProfilePage />);
    const contact = section("Contact / Consultation");
    expect(contact).toHaveAttribute("id", "contact");
    expect(contact).toHaveTextContent("Space Research · Digital Twins · Cybersecurity · Systems Architecture · Engineering Consultation");
    expect(within(contact).getAllByRole("link").map((a) => a.textContent?.trim())).toEqual(["LinkedIn", "Resume (PDF)", "Consulting", "+91 9845561518"]);

    const linkedIn = within(contact).getByRole("link", { name: "Sudarshana Karkala on LinkedIn (opens in a new tab)" });
    expect(linkedIn).toHaveAttribute("href", "https://www.linkedin.com/in/sudarshanakarkala/");
    const resume = within(contact).getByRole("link", { name: "Resume (PDF) of Sudarshana Karkala (opens in a new tab)" });
    expect(resume).toHaveAttribute("href", "https://carsoftwaresystems.com/public/sudarshanakarkala.pdf");
    for (const link of [linkedIn, resume]) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    expect(within(contact).getByRole("link", { name: "Consulting" })).toHaveAttribute("href", "/consulting");
    expect(within(contact).getByRole("link", { name: "+91 9845561518" })).toHaveAttribute("href", "tel:+919845561518");
    // It is the last section of the page.
    expect(contact.nextElementSibling).toBeNull();
  });

  it("is reachable from the bar at every width, by a link whose name begins with the word that always shows", () => {
    render(<ProfilePage />);
    const bar = screen.getByRole("banner");
    const link = within(bar).getByRole("link", { name: "Contact / Consultation" });
    expect(link).toHaveAttribute("href", "#contact");
    expect(link.firstChild).toHaveTextContent("Contact");
    expect(within(bar).getByRole("link", { name: "Space" })).toHaveAttribute("href", "/space");
    expect(within(bar).getByRole("link", { name: "EV.ENGINEER™" })).toHaveAttribute("href", "https://autonomous.ev.engineer/");
  });

  it("jumps to the contact section in place: no step is added to the history, and focus goes with it", () => {
    render(<ProfilePage />);
    const scrolled = vi.fn();
    const target = document.getElementById("contact")!;
    target.scrollIntoView = scrolled;
    const entries = window.history.length;
    const link = within(screen.getByRole("banner")).getByRole("link", { name: "Contact / Consultation" });

    // The click is handled here, so the browser adds no history entry that the router would not know.
    expect(fireEvent.click(link)).toBe(false);
    expect(scrolled).toHaveBeenCalledWith({ block: "start", behavior: expect.any(String) });
    expect(window.history.length).toBe(entries);
    expect(window.location.hash).toBe("");
    expect(document.activeElement).toBe(within(target).getByRole("heading", { level: 2, name: "Contact / Consultation" }));

    // A click meant to open it in a new tab is the browser's to handle.
    scrolled.mockClear();
    expect(fireEvent.click(link, { ctrlKey: true })).toBe(true);
    expect(scrolled).not.toHaveBeenCalled();
  });

  it("publishes no email address, and no contact detail beyond the verified telephone number", () => {
    const { container } = render(<ProfilePage />);
    expect(document.body.textContent).not.toMatch(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
    expect(container.querySelectorAll('a[href^="mailto:"]')).toHaveLength(0);
    expect(container.querySelectorAll('a[href^="tel:"]')).toHaveLength(1);
  });

  it("closes with the review date and the two places to verify or correct it", () => {
    render(<ProfilePage />);
    const foot = screen.getByRole("contentinfo");
    expect(foot).toHaveTextContent("Independent public profile page. Last reviewed: 19 October 2026.");
    expect(foot.querySelector("time")).toHaveAttribute("datetime", "2026-10-19");
    expect(within(foot).getByRole("link", { name: "Trust Center" })).toHaveAttribute("href", "/trust-center");
    expect(within(foot).getByRole("link", { name: "EV.ENGINEER contact page" })).toHaveAttribute("href", "/contact");
  });
});

describe("/about/sudarshana-karkala: the page as a whole", () => {
  it("has eleven parts in one order: the career, the consulting and the academic engagement come before the initiatives and the work", () => {
    const { container } = render(<ProfilePage />);
    const parts = [...container.querySelectorAll("main > section")].map((part) => document.getElementById(part.getAttribute("aria-labelledby")!)?.textContent);
    expect(parts).toEqual([
      "Sudarshana Karkala",
      "About",
      "Research & Engineering",
      "Professional Background",
      "Consulting Engagements",
      "Academic Engagement & Student Mentorship",
      "ISHAVASYAM.ORG",
      "Initiatives",
      "Selected Work",
      "Workshops & Certifications",
      "Contact / Consultation",
    ]);
    expect(screen.queryByRole("heading", { name: /^(Mission|Vision)$/ })).toBeNull();
    expect(visibleText(container)).not.toMatch(/To advance intelligent, secure|To contribute to the development|Verified Profiles|Core Focus Areas|About the Founder/);
  });

  it("has one h1, and headings that never skip a level", () => {
    const { container } = render(<ProfilePage />);
    const levels = [...container.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((h) => Number(h.tagName[1]));
    expect(levels.filter((level) => level === 1)).toHaveLength(1);
    expect(levels[0]).toBe(1);
    levels.forEach((level, i) => expect(level - (levels[i - 1] ?? 1)).toBeLessThanOrEqual(1));
  });

  it("stays short: a summary that links to the work, not a résumé", () => {
    const { container } = render(<ProfilePage />);
    const words = visibleText(container.querySelector("main")!).trim().split(/\s+/).length;
    expect(words).toBeLessThan(860);
    expect(container.querySelectorAll("main a").length).toBeLessThanOrEqual(22);
    // A line or two for each place, not paragraphs of duties: no paragraph of the career, consulting or academic sections is long.
    for (const name of ["Professional Background", "Consulting Engagements", "Academic Engagement & Student Mentorship"]) {
      for (const block of section(name).querySelectorAll("p, li")) expect((block.textContent ?? "").split(/\s+/).length).toBeLessThan(45);
    }
  });

  it("puts who he is, his career, his engagements, his focus and his initiatives in the server's HTML, with no script needed to read them", () => {
    const html = renderToStaticMarkup(<ProfilePage />)
      .replace(/<script[\s\S]*?<\/script>/g, "")
      .replace(/<!--.*?-->/g, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ");
    for (const fact of [
      "Sudarshana Karkala",
      "EV.ENGINEER™ @ ISHAVASYAM.ORG",
      "Space Systems",
      "Digital Twins",
      "Cybersecurity",
      "EV & Energy",
      "ISHAVASYAM.ORG",
      "CAR SOFTWARE SYSTEMS",
      // The career, the consulting, the academic engagement and the learning are text too, not pictures.
      "20+ Years · Engineering · Technology · Leadership",
      "Nov 2025 — Nov 2026",
      "Thasmai InfoTech Private Limited",
      "Gamyaa AeroSystems",
      "Co-Founder · Director",
      "Enphase Solar Energy Private Limited",
      "Senior Engineering Manager",
      "McAfee Software India Private Limited",
      "Engineering Manager",
      "NMS Communications",
      "Ness Digital Engineering",
      "eNovate Media Solutions",
      "Established Professional Experience",
      "Current / Emerging Engineering & Research Focus",
      "Skill-Lync",
      "Schaeffler India",
      "Crompton Greaves Consumer Electricals",
      "iFab Innovations",
      "iTelematics Software Private Limited",
      "Consulting Engagement",
      "2001 — Present",
      "National Institute of Technology Karnataka (NITK)",
      "Malnad College of Engineering",
      "VTU Constituent College",
      "McAfee Student Developer Program",
      "IN-SPACe",
      "Model Rocketry",
      "CANSAT",
      "Semiconductor",
      "Aerospace & Space Systems",
      "CSIR-NAL",
      "Aircraft Structural Health Monitoring (NW-ASHM 2026) from CSIR–National Aerospace Laboratories",
      "Workshop gallery",
      "Contact / Consultation",
    ]) {
      expect(html).toContain(fact);
    }
  });

  it("uses descriptive names for its links: none is a bare 'click here', 'learn more' or 'read more'", () => {
    render(<ProfilePage />);
    for (const link of screen.getAllByRole("link")) {
      const name = link.getAttribute("aria-label") ?? link.textContent ?? "";
      expect(name.trim().length).toBeGreaterThan(3);
      expect(name).not.toMatch(/^(click here|learn more|read more|here|more)$/i);
    }
  });

  it("opens every link that leaves the site in a new tab, safely, and says so to a screen reader", () => {
    const { container } = render(<ProfilePage />);
    const external = [...container.querySelectorAll<HTMLAnchorElement>('main a[href^="http"]')];
    expect(external.map((a) => a.getAttribute("href"))).toEqual([
      // The hero's two names.
      "https://autonomous.ev.engineer/",
      "https://ishavasyam.org/",
      // Professional Background, then Consulting Engagements.
      "https://www.thasmaiinfotech.com/space-research",
      "https://aerosystems.gamyaa.in/",
      "https://www.nmscommunications.com/",
      "https://itelematics.com/",
      // The cards and the contact actions.
      "https://ishavasyam.org/",
      "https://autonomous.ev.engineer/",
      "https://carsoftwaresystems.com/",
      "https://labs.ev.engineer/",
      "https://www.linkedin.com/in/sudarshanakarkala/",
      "https://carsoftwaresystems.com/public/sudarshanakarkala.pdf",
    ]);
    for (const link of external) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link.getAttribute("aria-label") ?? link.textContent).toMatch(/\(opens in a new tab\)/);
    }
  });
});

describe("/about/sudarshana-karkala: metadata", () => {
  it("keeps its one canonical address and stays indexable", () => {
    expect(metadata.alternates?.canonical).toBe("https://autonomous.ev.engineer/about/sudarshana-karkala");
    expect(metadata.openGraph?.url).toBe("https://autonomous.ev.engineer/about/sudarshana-karkala");
    const robots = metadata.robots as { index: boolean; follow: boolean };
    expect(robots.index).toBe(true);
    expect(robots.follow).toBe(true);
  });

  it("says in the title and the description what the page says: the identity, the initiative he founded, what he works on", () => {
    expect(metadata.title).toBe("Sudarshana Karkala | Space, Digital Twins & Cybersecurity | EV.ENGINEER™");
    expect(metadata.description).toBe(
      "Sudarshana Karkala — EV.ENGINEER™, Founder of ISHAVASYAM.ORG, engineering leader and consultant across Space research, Digital Twins, Cybersecurity, EV and energy systems.",
    );
    // Consulting is something he does, not a title at any one organisation.
    expect(metadata.description).not.toMatch(/iTelematics|Consultant at/i);
    expect((metadata.title as string).length).toBeLessThanOrEqual(75);
    expect((metadata.description as string).length).toBeLessThanOrEqual(175);
  });

  it("gives the social cards the same title and description, and names the person", () => {
    const openGraph = metadata.openGraph as { title: string; description: string; type: string; firstName: string; lastName: string };
    expect(openGraph.title).toBe(metadata.title);
    expect(openGraph.description).toBe(metadata.description);
    expect(openGraph.type).toBe("profile");
    expect([openGraph.firstName, openGraph.lastName]).toEqual(["Sudarshana", "Karkala"]);
    const twitter = metadata.twitter as { title: string; description: string; card: string };
    expect(twitter.title).toBe(metadata.title);
    expect(twitter.description).toBe(metadata.description);
    expect(twitter.card).toBe("summary_large_image");
  });

  it("keeps a short list of keywords, each a subject the page names, with none repeated", () => {
    const keywords = metadata.keywords as string[];
    expect(keywords.length).toBeLessThanOrEqual(14);
    expect(new Set(keywords).size).toBe(keywords.length);
    for (const keyword of ["Sudarshana Karkala", "EV.ENGINEER", "ISHAVASYAM.ORG", "Engineering Leadership", "Satellite Engineering", "Aerospace Cybersecurity", "EV Battery Intelligence", "Student Mentorship"]) expect(keywords).toContain(keyword);
  });
});

describe("/about/sudarshana-karkala: structured data", () => {
  it("is one ProfilePage whose main entity is one Person, in JSON that parses", () => {
    const { container } = render(<ProfilePage />);
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts).toHaveLength(1);
    const parsed = JSON.parse(scripts[0].textContent ?? "");
    expect(parsed["@context"]).toBe("https://schema.org");
    const graph = graphOf(container);
    expect(graph.filter((node) => node["@type"] === "Person")).toHaveLength(1);
    const page = graph.find((node) => node["@type"] === "ProfilePage")!;
    expect(page.mainEntity).toEqual({ "@id": personNode(container)["@id"] });
    expect(page.dateModified).toBe("2026-10-19");
    expect(page.name).toBe(metadata.title);
  });

  it("gives him one job title, Founder of the initiative the hero names beside EV.ENGINEER™, as the metadata does", () => {
    const { container } = render(<ProfilePage />);
    expect(personNode(container).jobTitle).toBe("Founder, ISHAVASYAM.ORG");
    expect(section("Sudarshana Karkala")).toHaveTextContent("EV.ENGINEER™ @ ISHAVASYAM.ORG");
    expect(metadata.description).toContain("Founder of ISHAVASYAM.ORG");
  });

  it("claims only expertise the visible page names", () => {
    const { container } = render(<ProfilePage />);
    const text = visibleText(container).toLowerCase();
    const subjects = personNode(container).knowsAbout as string[];
    expect(subjects.length).toBeGreaterThanOrEqual(8);
    expect(subjects.length).toBeLessThanOrEqual(18);
    for (const subject of subjects) {
      // Every word of the subject that carries meaning is on the page.
      for (const word of subject.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3 && !["systems", "research", "engineering", "management"].includes(w))) {
        expect(text, `${subject}: "${word}" is not on the page`).toContain(word);
      }
    }
  });
});
