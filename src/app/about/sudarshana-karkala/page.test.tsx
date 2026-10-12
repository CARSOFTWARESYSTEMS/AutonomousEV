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
  it("leads with the name, then the engineering identity, then the two roles, then one line of focus", () => {
    render(<ProfilePage />);
    const hero = section("Sudarshana Karkala");
    expect(within(hero).getByRole("heading", { level: 1, name: "Sudarshana Karkala" })).toBeInTheDocument();
    expect([...hero.querySelectorAll("p")].map((p) => p.textContent?.replace(/\s+/g, " "))).toEqual([
      "EV.ENGINEER™",
      "Founder — ISHAVASYAM.ORG",
      "Consultant — iTelematics Software Private Limited",
      "Space Station Research · Satellite & Rocket Engineering · Digital Twins · Cybersecurity",
    ]);
    expect(within(hero).getByRole("img", { name: "Portrait of Sudarshana Karkala" })).toBeInTheDocument();
    // The hero holds no button and no further title.
    expect(within(hero).queryAllByRole("link")).toHaveLength(0);
  });

  it("gives ISHAVASYAM.ORG more weight than iTelematics: the two roles are different elements with different styles", () => {
    render(<ProfilePage />);
    const primary = screen.getByText((_, element) => element?.tagName === "P" && element.textContent === "Founder — ISHAVASYAM.ORG");
    const secondary = screen.getByText((_, element) => element?.tagName === "P" && element.textContent === "Consultant — iTelematics Software Private Limited");
    expect(primary.className).not.toBe(secondary.className);
    expect(primary.compareDocumentPosition(secondary) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("never presents EV.ENGINEER™ as a founder title, on the page or in its data", () => {
    const { container } = render(<ProfilePage />);
    const text = visibleText(container);
    // No statement on the page has "founder" and EV.ENGINEER in it together. (In the hero they are two lines: the identity, then the role at ISHAVASYAM.ORG.)
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
    expect(cards.map((card) => within(card).getByRole("heading", { level: 3 }).textContent)).toEqual(["EV.ENGINEER™", "CAR SOFTWARE SYSTEMS"]);
    expect(cards[0]).toHaveTextContent("Building World-Class Engineers to Solve Energy and EV Battery Challenges");
    expect(within(cards[0]).getByRole("link")).toHaveAttribute("href", "https://ev.engineer/");
    expect(cards[1]).toHaveTextContent("Electric Vehicle Engineering · Agentic AI Development");
    expect(within(cards[1]).getByRole("link")).toHaveAttribute("href", "https://carsoftwaresystems.com/");
    for (const card of cards) {
      expect(within(card).getByRole("link")).toHaveAttribute("rel", "noopener noreferrer");
      // A card, not a corporate page: a name, a line, at most one sentence, one link.
      expect(card.querySelectorAll("p").length).toBeLessThanOrEqual(2);
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

describe("/about/sudarshana-karkala: background and education", () => {
  it("names the consulting role and the Thasmai co-founder role quietly, in Professional Background and nowhere else", () => {
    const { container } = render(<ProfilePage />);
    const background = section("Professional Background");
    expect(within(background).getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "Consultant — iTelematics Software Private Limited",
      "Co-Founder — Thasmai InfoTech Private Limited",
    ]);
    // Thasmai is one line of text: not in the hero, not a card, not a heading, not a link, not in the structured data.
    expect(visibleText(container).match(/Thasmai/g)).toHaveLength(1);
    expect(section("Sudarshana Karkala")).not.toHaveTextContent(/Thasmai/);
    expect(screen.queryByRole("heading", { name: /Thasmai/ })).toBeNull();
    expect(screen.queryByRole("link", { name: /Thasmai/ })).toBeNull();
    expect(JSON.stringify(graphOf(container))).not.toMatch(/Thasmai/i);
  });

  it("never implies two decades of space or aerospace experience: that figure is for software, security, EV and energy", () => {
    const { container } = render(<ProfilePage />);
    expect(section("Professional Background")).toHaveTextContent(
      "Over two decades of experience across software architecture, cybersecurity, connected systems, IoT, telematics, AI, mobility, EV and energy platforms.",
    );
    expect(document.body.textContent).not.toMatch(/two decades[^.]*(aerospace|space|satellite|rocket)/i);
    expect(document.body.textContent).not.toMatch(/20\+? years[^.]*(aerospace|space)/i);
    expect(JSON.stringify(personNode(container))).not.toMatch(/two decades|20\+? years/i);
  });

  it("keeps education to one line each, and says exactly what each item is", () => {
    render(<ProfilePage />);
    const rows = within(section("Education & Professional Development")).getAllByRole("listitem").map((li) => li.textContent?.replace(/\s+/g, " ").trim());
    expect(rows).toEqual([
      "NITK Surathkal B.E. — Information Technology Education",
      "IIT Madras — CODE Electric Vehicle Engineering & Development Professional certification",
      "IN-SPACe Essentials of Model Rocketry Workshop · Aug 2026",
      "EV Society™ Certified EV Technology Officer (EVTO™) In progress · expected Mar 2028",
      "Business P.A.C.E. Business & Entrepreneurship Development Rajiv Talreja / QuantumLeap",
    ]);
    // The IIT Madras programme is a certification and never a degree; the workshop is a workshop.
    expect(document.body.textContent).not.toMatch(/IIT Madras[^.]*(degree|B\.Tech|M\.Tech)/i);
    // What is not finished is marked as that, in words and for the stylesheet.
    const evto = screen.getByText("In progress · expected Mar 2028");
    expect(evto).toHaveAttribute("data-status", "in-progress");
    expect(screen.getByText("Education")).not.toHaveAttribute("data-status");
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
    expect(within(bar).getByRole("link", { name: "EV.ENGINEER™" })).toHaveAttribute("href", "https://ev.engineer/");
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
    expect(foot).toHaveTextContent("Independent public profile page. Last reviewed: 12 October 2026.");
    expect(foot.querySelector("time")).toHaveAttribute("datetime", "2026-10-12");
    expect(within(foot).getByRole("link", { name: "Trust Center" })).toHaveAttribute("href", "/trust-center");
    expect(within(foot).getByRole("link", { name: "EV.ENGINEER contact page" })).toHaveAttribute("href", "/contact");
  });
});

describe("/about/sudarshana-karkala: the page as a whole", () => {
  it("has nine parts in one order, with Mission and Vision gone", () => {
    const { container } = render(<ProfilePage />);
    const parts = [...container.querySelectorAll("main > section")].map((part) => document.getElementById(part.getAttribute("aria-labelledby")!)?.textContent);
    expect(parts).toEqual([
      "Sudarshana Karkala",
      "About",
      "ISHAVASYAM.ORG",
      "Initiatives",
      "Research & Engineering",
      "Selected Work",
      "Professional Background",
      "Education & Professional Development",
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
    expect(words).toBeLessThan(420);
    expect(container.querySelectorAll("main a").length).toBeLessThanOrEqual(16);
  });

  it("puts who he is, his roles, his focus, his initiatives and his background in the server's HTML, with no script needed to read them", () => {
    const html = renderToStaticMarkup(<ProfilePage />)
      .replace(/<script[\s\S]*?<\/script>/g, "")
      .replace(/<!--.*?-->/g, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ");
    for (const fact of [
      "Sudarshana Karkala",
      "EV.ENGINEER™",
      "Founder — ISHAVASYAM.ORG",
      "Consultant — iTelematics Software Private Limited",
      "Space Systems",
      "Digital Twins",
      "Cybersecurity",
      "EV & Energy",
      "ISHAVASYAM.ORG",
      "CAR SOFTWARE SYSTEMS",
      "Co-Founder — Thasmai InfoTech Private Limited",
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
      "https://ishavasyam.org/",
      "https://ev.engineer/",
      "https://carsoftwaresystems.com/",
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
      "Sudarshana Karkala — EV.ENGINEER™, Founder of ISHAVASYAM.ORG and technology consultant working across Space research, Digital Twins, Cybersecurity, EV and energy systems.",
    );
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
    expect(keywords.length).toBeLessThanOrEqual(12);
    expect(new Set(keywords).size).toBe(keywords.length);
    for (const keyword of ["Sudarshana Karkala", "EV.ENGINEER", "ISHAVASYAM.ORG", "Satellite Engineering", "Aerospace Cybersecurity", "EV Battery Intelligence"]) expect(keywords).toContain(keyword);
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
    expect(page.dateModified).toBe("2026-10-12");
    expect(page.name).toBe(metadata.title);
  });

  it("states the roles the hero states, in the same words", () => {
    const { container } = render(<ProfilePage />);
    const hero = [...section("Sudarshana Karkala").querySelectorAll("p")].map((p) => p.textContent?.replace(" — ", ", "));
    for (const title of personNode(container).jobTitle as string[]) expect(hero).toContain(title);
    expect(personNode(container).jobTitle).toEqual(["Founder, ISHAVASYAM.ORG", "Consultant, iTelematics Software Private Limited"]);
  });

  it("claims only expertise the visible page names", () => {
    const { container } = render(<ProfilePage />);
    const text = visibleText(container).toLowerCase();
    const subjects = personNode(container).knowsAbout as string[];
    expect(subjects.length).toBeGreaterThanOrEqual(8);
    expect(subjects.length).toBeLessThanOrEqual(12);
    for (const subject of subjects) {
      // Every word of the subject that carries meaning is on the page.
      for (const word of subject.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3 && !["systems", "research", "engineering", "management"].includes(w))) {
        expect(text, `${subject}: "${word}" is not on the page`).toContain(word);
      }
    }
  });
});
