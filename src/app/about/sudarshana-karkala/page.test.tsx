import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import FounderPage, { metadata } from "./page";
import { FOCUS_AREAS } from "./profile";

/** The Person node of the page's structured data, as it is in the rendered HTML. */
function personNode(container: HTMLElement) {
  const graph = JSON.parse(container.querySelector('script[type="application/ld+json"]')?.textContent ?? "{}")["@graph"] as Record<string, unknown>[];
  return graph.find((node) => node["@type"] === "Person") as Record<string, unknown>;
}
/** The text a reader sees: the page without its structured data. */
function visibleText(container: HTMLElement) {
  const copy = container.cloneNode(true) as HTMLElement;
  copy.querySelectorAll("script").forEach((script) => script.remove());
  return (copy.textContent ?? "").replace(/\s+/g, " ");
}

describe("/about/sudarshana-karkala canonical profile page", () => {
  it("renders Sudarshana Karkala's full public name in the initial HTML", () => {
    render(<FounderPage />);
    expect(screen.getAllByText("Sudarshana Karkala").length).toBeGreaterThan(0);
  });

  it("has a canonical URL and is indexable", () => {
    expect(metadata.alternates?.canonical).toBe("https://autonomous.ev.engineer/about/sudarshana-karkala");
    const robots = metadata.robots as { index: boolean; follow: boolean };
    expect(robots.index).toBe(true);
    expect(robots.follow).toBe(true);
  });

  it("shows the verified phone number and LinkedIn link visibly, with no email address anywhere on the page", () => {
    render(<FounderPage />);
    expect(screen.getAllByText(/\+91 9845561518/).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /LinkedIn/i }).length).toBeGreaterThan(0);
    expect(document.body.textContent).not.toMatch(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  });

  it("links to Internships, Space, CubeTwin, the rocketry guide, Trust Center and Contact", () => {
    render(<FounderPage />);
    expect(screen.getByRole("link", { name: /Engineering Education & Research/i })).toHaveAttribute("href", "/internships");
    expect(screen.getByRole("link", { name: /^Space & Aerospace R&D$/i })).toHaveAttribute("href", "/space");
    expect(screen.getByRole("link", { name: /CubeTwin — CubeSat Battery & Energy Digital Twin/i })).toHaveAttribute(
      "href",
      "/space/cubesat"
    );
    expect(screen.getByRole("link", { name: /Model Rocketry Learning Guide/i })).toHaveAttribute(
      "href",
      "/space/2026-INSPACe-ROCKETRY-059"
    );
    expect(screen.getAllByRole("link", { name: /Trust Center/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /contact/i }).length).toBeGreaterThan(0);
  });

  it("injects a valid JSON-LD ProfilePage/Person graph without dangerouslySetInnerHTML", () => {
    const { container } = render(<FounderPage />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const parsed = JSON.parse(script?.textContent ?? "");
    expect(parsed["@context"]).toBe("https://schema.org");
    const types = parsed["@graph"].map((n: Record<string, unknown>) => n["@type"]);
    expect(types).toContain("Person");
    expect(types).toContain("ProfilePage");
  });

  it("leads the hero with the Director of Engineering, Systems Architecture and R&D positioning, then the two lines of focus", () => {
    const { container } = render(<FounderPage />);
    expect(screen.getByText("Director of Engineering | Systems Architecture | Technology & R&D")).toBeInTheDocument();
    expect(screen.getByText("Space Systems Engineering · Digital Twins · IVHM/FDIR · Avionics & Telemetry")).toBeInTheDocument();
    expect(screen.getByText("Aerospace Cybersecurity · AI/ML · EV Battery & Energy Intelligence")).toBeInTheDocument();
    // The hero ends with its positioning: the line about the opportunities being explored was removed on the owner's instruction.
    expect(container.textContent).not.toMatch(/Exploring Director of Engineering/);
    expect(container.querySelectorAll("section")[0].querySelectorAll("p")).toHaveLength(4);
    // The structured data gives the same headline as the hero.
    expect(personNode(container).jobTitle).toBe("Director of Engineering | Systems Architecture | Technology & R&D");
    // A separator stays with the item before it, so no line of the hero starts with a dot or a bar.
    expect(container.textContent).toContain("Space Systems Engineering\u00a0· Digital Twins");
    expect(container.textContent).toContain("Director of Engineering\u00a0| Systems Architecture\u00a0| Technology & R&D");
  });

  it("never implies 20+ years of aerospace experience — establishes it for engineering/software/security/EV/energy instead", () => {
    render(<FounderPage />);
    expect(screen.getByText(/over two decades of\s*experience across software architecture, cybersecurity, connected systems/)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/two decades[^.]*aerospace/i);
    expect(document.body.textContent).not.toMatch(/20\+? years[^.]*aerospace/i);
  });

  it("names the current Space research focus in the About section, and keeps it apart from the established experience", () => {
    const { container } = render(<FounderPage />);
    const text = visibleText(container);
    expect(text).toMatch(/His current research and engineering development focus is Space Systems Engineering: spacecraft and satellite systems, Digital Twin engineering, spacecraft health management, avionics and telemetry, and IVHM \/ FDIR \/ PHM/);
    expect(text).toMatch(/It extends to aerospace cybersecurity, AI\/ML-assisted engineering and EV Battery & Energy Intelligence\./);
    expect(text).toMatch(/Software architecture, cybersecurity, connected systems, EV and energy are his established professional experience\./);
    expect(text).toMatch(/The Space and Aerospace work is newer research and engineering development, carried out through simulation, educational Digital Twins, CanSat model rocketry and published engineering tutorials\./);
    expect(text).toMatch(/It is not presented as flight-qualified, operational-spacecraft or physical-engine test experience\./);
  });

  it("claims no credential it does not show: no propulsion expertise, flight heritage, validated twin or space certification", () => {
    const { container } = render(<FounderPage />);
    const text = visibleText(container);
    expect(text).not.toMatch(/propulsion (expert|specialist|engineer)|rocket (scientist|engineer)|flight heritage|flight[- ]proven|space[- ]qualified/i);
    expect(text).not.toMatch(/validated (physical[- ]engine |rocket[- ]engine |propulsion )?Digital Twin/i);
    expect(text).not.toMatch(/certified (spacecraft|satellite|aerospace|space|avionics)/i);
    // Flight qualification, operational spacecraft and physical engines are named only to say what the work is not.
    const named = text.split(/(?<=\.)\s+/).filter((s) => /flight[- ]qualif|operational[- ]spacecraft|physical[- ]engine|physical engine/i.test(s));
    expect(named.length).toBeGreaterThanOrEqual(3);
    for (const sentence of named) expect(sentence).toMatch(/\bnot\b/);
    expect(JSON.stringify(personNode(container))).not.toMatch(/propulsion expert|flight[- ]qualified|flight heritage|validated|certified/i);
  });

  it("shows the six Core Focus Area cards, each a heading and a list of its items", () => {
    render(<FounderPage />);
    const titles = [
      "Space Systems Engineering & Research",
      "Digital Twin & Engineering Intelligence",
      "Avionics & Telemetry",
      "Aerospace & Cyber-Physical Security",
      "AI/ML for Engineering",
      "EV Battery & Energy Intelligence",
    ];
    expect(screen.getAllByRole("heading", { level: 4 }).map((h) => h.textContent)).toEqual(titles);
    expect(FOCUS_AREAS.map((area) => area.items.length)).toEqual([10, 12, 8, 9, 8, 7]);

    const items = (title: string) => within(screen.getByRole("heading", { level: 4, name: title }).parentElement!).getAllByRole("listitem").map((li) => li.textContent);
    expect(items("Space Systems Engineering & Research")).toEqual([
      "Satellite Systems Engineering", "Spacecraft Architecture", "Spacecraft Health Management", "CubeSat Systems", "Mission Engineering",
      "Avionics & Telemetry", "Mission/Ground Systems", "Digital Twins", "Model Rocketry", "Verification & Validation",
    ]);
    expect(items("Digital Twin & Engineering Intelligence")).toEqual([
      "Physics-Based Modelling", "Reduced-Order Models", "Telemetry & State Estimation", "Sensor Fusion", "Residual Analysis", "Fault Detection & Isolation",
      "IVHM", "FDIR", "PHM", "Prognostics", "Model Verification & Validation", "AI/ML-Assisted Diagnostics",
    ]);
    expect(items("Avionics & Telemetry")).toContain("CanSat Avionics");
    expect(items("Aerospace & Cyber-Physical Security")).toEqual(expect.arrayContaining(["Aerospace Cybersecurity", "Replay/Tampering Detection", "Digital Twin Security", "Automotive/EV Cybersecurity"]));
    expect(items("AI/ML for Engineering")).toEqual(expect.arrayContaining(["Physics + Data Hybrid Models", "Anomaly Detection", "Uncertainty-Aware Engineering"]));
    expect(items("EV Battery & Energy Intelligence")).toEqual(["BMS", "Battery Safety", "Diagnostics", "Battery Digital Twins", "Predictive Maintenance", "Battery Cybersecurity", "Energy Intelligence"]);
    // The cards say what kind of claim they are.
    expect(screen.getByText(/The Space and Aerospace areas are research and engineering development, not flight or operational experience\./)).toBeInTheDocument();
  });

  it("lists the Advanced Rocket Propulsion Digital Twin as an educational exploration, after CubeTwin, and not as a validated twin", () => {
    render(<FounderPage />);
    const link = screen.getByRole("link", { name: "Advanced Rocket Propulsion Digital Twin" });
    expect(link).toHaveAttribute("href", "/space/rocket-engine-digital-twin-advanced");
    const item = link.closest("li")!;
    expect(item).toHaveTextContent(
      "Advanced Rocket Propulsion Digital Twin — Educational and research-oriented exploration of physics-based propulsion modelling, simulated telemetry, pressure instrumentation, state estimation, anomaly detection, fault diagnosis, FDIR, AI/ML-assisted diagnostics and prognostics.",
    );
    expect(item).toHaveTextContent("A reduced-order simulation for learning; not validated against a physical engine.");

    // CubeTwin keeps its place as the spacecraft Digital Twin project, ahead of it.
    const projects = [...item.parentElement!.children];
    const cubeTwin = screen.getByRole("link", { name: /CubeTwin — CubeSat Battery & Energy Digital Twin/i }).closest("li")!;
    expect(projects.indexOf(cubeTwin)).toBe(projects.indexOf(item) - 1);
    expect(cubeTwin).toHaveTextContent(/spacecraft health management/);
    expect(projects).toHaveLength(5);
  });

  it("offers technical consultation in its own section, immediately before Contact and Collaboration", () => {
    const { container } = render(<FounderPage />);
    const section = screen.getByRole("region", { name: "Technical Consultation & Collaboration" });
    expect(section).toHaveAttribute("id", "consultation");
    expect(within(section).getByRole("heading", { level: 2, name: "Technical Consultation & Collaboration" })).toBeInTheDocument();
    expect(section).toHaveTextContent(
      "Available for technical discussions, engineering consultation and research collaboration in Space Systems Engineering, Digital Twins, Spacecraft Health Management, IVHM/FDIR, Avionics & Telemetry, Aerospace Cybersecurity, AI-assisted engineering and EV Battery & Energy Intelligence.",
    );
    const tags = within(section).getByRole("list", { name: "Consultation and collaboration areas" });
    expect(within(tags).getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "Space Systems", "Digital Twins", "IVHM / FDIR", "Avionics & Telemetry", "Aerospace Cybersecurity", "AI/ML", "EV Battery Intelligence",
    ]);
    // It says what a Space engagement is, and welcomes the tutorial's readers.
    expect(section).toHaveTextContent(/research and engineering development: modelling, simulation, Digital Twins and study, not flight qualification or certification services\./);
    expect(section).toHaveTextContent(/including the Advanced Rocket Propulsion Digital Twin, are welcome through the contact details below\./);

    const next = section.nextElementSibling!;
    expect(next).toHaveAttribute("id", "contact");
    expect(within(next as HTMLElement).getByRole("heading", { level: 2, name: "Contact and Collaboration" })).toBeInTheDocument();
    // The areas are said once: the contact section no longer repeats them as tags.
    expect(container.querySelectorAll('[aria-label="Consultation and collaboration areas"]')).toHaveLength(1);
    expect(within(next as HTMLElement).queryByRole("list")).toBeNull();
  });

  it("states a mission and a vision across Space, Aerospace and Energy, in place of the EV-only ones", () => {
    const { container } = render(<FounderPage />);
    const text = visibleText(container);
    expect(text).toContain("“To advance intelligent, secure and resilient engineering systems through systems architecture, Digital Twins, AI, cybersecurity and engineering research across Space, Aerospace and Energy.”");
    expect(text).toContain("“To contribute to the development of safer, more autonomous and intelligence-driven Space, Aerospace and Energy systems through simulation, Digital Twins, health monitoring and secure engineering.”");
    expect(text).not.toMatch(/To solve EV battery safety|To eliminate EV battery failures/);
  });

  it("describes the same focus in the title, description, social cards and keywords, without stuffing or credentials", () => {
    expect(metadata.title).toBe("Sudarshana Karkala | Space Systems Engineering & Digital Twins | EV.ENGINEER™");
    const description = metadata.description as string;
    for (const concept of ["Space Systems Engineering", "Digital Twins", "spacecraft health management", "IVHM/FDIR/PHM", "avionics and telemetry", "aerospace cybersecurity", "AI/ML", "EV Battery & Energy Intelligence"]) {
      expect(description).toContain(concept);
    }
    expect(description).toMatch(/^Sudarshana Karkala is an engineering leader and technology consultant\. Research and engineering focus:/);
    expect(description.length).toBeLessThanOrEqual(300);
    expect(description).not.toMatch(/expert|certified|flight|validated|propulsion/i);

    expect(metadata.openGraph?.title).toBe(metadata.title);
    expect(metadata.openGraph?.description).toBe(description);
    expect((metadata.twitter as { title: string; description: string }).title).toBe(metadata.title);
    expect((metadata.twitter as { title: string; description: string }).description).toBe(description);

    const keywords = metadata.keywords as string[];
    for (const concept of ["Space Systems Engineering", "Satellite Engineering", "Spacecraft Digital Twin", "Digital Twin Engineering", "Spacecraft Health Management", "IVHM", "FDIR", "PHM", "Avionics", "Telemetry", "Aerospace Cybersecurity", "AI/ML Engineering", "CubeSat", "Model Rocketry", "EV Battery Intelligence"]) {
      expect(keywords).toContain(concept);
    }
    expect(new Set(keywords).size).toBe(keywords.length);
    expect(keywords.length).toBeLessThanOrEqual(24);
  });

  it("dates the structured data and the page with the same review date", () => {
    const { container } = render(<FounderPage />);
    const graph = JSON.parse(container.querySelector('script[type="application/ld+json"]')?.textContent ?? "{}")["@graph"] as Record<string, unknown>[];
    expect(graph.find((node) => node["@type"] === "ProfilePage")?.dateModified).toBe("2026-10-12");
    expect(visibleText(container)).toContain("Last reviewed: 12 October 2026.");
  });

  it("lists NITK as an Education credential, distinct from the certification programs", () => {
    render(<FounderPage />);
    expect(screen.getByText("National Institute of Technology Karnataka, Surathkal")).toBeInTheDocument();
    expect(screen.getByText("B.E. — Information Technology")).toBeInTheDocument();
  });

  it("shows the IIT Madras program as a Professional Certification, with no CODE meta line, and never as a degree", () => {
    render(<FounderPage />);
    expect(screen.getByText("IIT Madras — CODE")).toBeInTheDocument();
    expect(screen.getByText("Electric Vehicle Engineering & Development")).toBeInTheDocument();
    expect(screen.getAllByText("Professional Certification").length).toBeGreaterThan(0);
    expect(document.body.textContent).not.toMatch(/Certification Program · Centre for Outreach and Digital Education/);
    expect(document.body.textContent).not.toMatch(/IIT Madras.*(degree|B\.Tech|M\.Tech)/i);
  });

  it("describes the IN-SPACe workshop accurately without overstated titles", () => {
    render(<FounderPage />);
    expect(screen.getByText(/IN-SPACe — Department of Space, Government of India/)).toBeInTheDocument();
    expect(screen.getByText("Essentials of Model Rocketry")).toBeInTheDocument();
    expect(screen.getByText(/Workshop · Aug 2026 · GNEC IIT Roorkee, Greater Noida/)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/ISRO Certified|IN-SPACe Certified Scientist|Rocket Scientist|Aerospace Engineer certification/i);
  });

  it("makes the EVTO certification's in-progress status visually and textually unambiguous, with its Aerospace specialisation attributed only to EV Society", () => {
    render(<FounderPage />);
    expect(screen.getByText(/Certified EV Technology Officer \(EVTO™\) — In Progress/)).toBeInTheDocument();
    expect(screen.getByText(/Ongoing · Expected Mar 2028/)).toBeInTheDocument();
    expect(screen.getByText("Specialisation in Energy & EV Battery Technologies in Aerospace")).toBeInTheDocument();
  });

  it("links Explore Space Research, CubeTwin, Workshop Gallery, EV.ENGINEER Labs and CAR Software Systems", () => {
    render(<FounderPage />);
    expect(screen.getByRole("link", { name: /^Space Research →$/ })).toHaveAttribute("href", "https://autonomous.ev.engineer/space");
    expect(screen.getByRole("link", { name: /^CubeTwin →$/ })).toHaveAttribute("href", "https://autonomous.ev.engineer/space/cubesat");
    expect(screen.getByRole("link", { name: /^Workshop Gallery →$/ })).toHaveAttribute(
      "href",
      "https://autonomous.ev.engineer/workshop-gallery"
    );
    expect(screen.getByRole("link", { name: /^EV\.ENGINEER Labs →$/ })).toHaveAttribute("href", "https://labs.ev.engineer/");
    expect(screen.getByRole("link", { name: /^CAR Software Systems →$/ })).toHaveAttribute("href", "https://carsoftwaresystems.com/");
    expect(screen.getByRole("link", { name: /^View Workshop Gallery →$/ })).toHaveAttribute("href", "/workshop-gallery");
  });

  it("shows a View Resume CTA in Contact and Collaboration that opens the PDF safely in a new tab", () => {
    render(<FounderPage />);
    const resumeLink = screen.getByRole("link", { name: /View Sudarshana Karkala Resume \(PDF\)/i });
    expect(resumeLink).toHaveAttribute("href", "https://carsoftwaresystems.com/public/sudarshanakarkala.pdf");
    expect(resumeLink).toHaveAttribute("target", "_blank");
    expect(resumeLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(resumeLink).toHaveTextContent(/View Resume/);
  });

  it("updates the Contact and Collaboration positioning to Director of Engineering, Consulting and Space/Aerospace/EV Battery", () => {
    render(<FounderPage />);
    expect(
      screen.getByText(
        /Director of Engineering, Technology Consulting, Systems Architecture, R&D\s*and strategic collaboration opportunities across Space, Aerospace and EV Battery technologies/
      )
    ).toBeInTheDocument();
  });

  it("adds a Consulting CTA in Contact and Collaboration pointing at the internal consulting page", () => {
    render(<FounderPage />);
    expect(screen.getByRole("link", { name: /^Consulting →$/ })).toHaveAttribute("href", "/consulting");
  });
});
