import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import FounderPage, { metadata } from "./page";

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

  it("leads the hero with the Director of Engineering positioning and Space/Avionics/EV Battery focus", () => {
    render(<FounderPage />);
    expect(screen.getByText(/Director of Engineering \| Technology & R&D Consultant/)).toBeInTheDocument();
    expect(
      screen.getByText(/Space Systems & Applications · Avionics & Telemetry · EV Battery & Energy Intelligence/)
    ).toBeInTheDocument();
    expect(screen.getByText(/AI · Cybersecurity · Digital Twins · CanSat Model Rocketry/)).toBeInTheDocument();
    expect(screen.getByText(/Exploring Director of Engineering, Technology Consulting/)).toBeInTheDocument();
  });

  it("never implies 20+ years of aerospace experience — establishes it for engineering/software/security/EV/energy instead", () => {
    render(<FounderPage />);
    expect(screen.getByText(/over two decades of\s*experience across software architecture, cybersecurity, connected systems/)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/two decades[^.]*aerospace/i);
    expect(document.body.textContent).not.toMatch(/20\+? years[^.]*aerospace/i);
  });

  it("shows the four Core Focus Area cards", () => {
    render(<FounderPage />);
    expect(screen.getByText("Space Systems & Applications", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText("Avionics & Telemetry", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText("EV Battery & Energy Intelligence", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText("AI & Cybersecurity")).toBeInTheDocument();
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
    expect(screen.getByText("Space Systems & Applications", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText("Avionics & Telemetry", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText("Aerospace Cybersecurity")).toBeInTheDocument();
  });

  it("adds a Consulting CTA in Contact and Collaboration pointing at the internal consulting page", () => {
    render(<FounderPage />);
    expect(screen.getByRole("link", { name: /^Consulting →$/ })).toHaveAttribute("href", "/consulting");
  });
});
