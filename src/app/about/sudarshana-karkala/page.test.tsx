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

  it("links to Internships, Space, the rocketry guide, Trust Center and Contact", () => {
    render(<FounderPage />);
    expect(screen.getByRole("link", { name: /EV\.ENGINEER Internships/i })).toHaveAttribute("href", "/internships");
    expect(screen.getByRole("link", { name: /Space Initiative/i })).toHaveAttribute("href", "/space");
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

  it("shows the broader multidisciplinary areas in the hero without overcrowding the existing tagline", () => {
    render(<FounderPage />);
    expect(screen.getByText(/EV & Battery Intelligence · Cybersecurity · Space Research · CanSat Model Rocketry/)).toBeInTheDocument();
    expect(screen.getByText(/Building Battery Intelligence, Safety & Cybersecurity for eVTOL/)).toBeInTheDocument();
  });

  it("lists NITK as an Education credential, distinct from the certification programs", () => {
    render(<FounderPage />);
    expect(screen.getByText("National Institute of Technology Karnataka, Surathkal")).toBeInTheDocument();
    expect(screen.getByText("B.E. — Information Technology")).toBeInTheDocument();
  });

  it("identifies the IIT Madras program as a certification program, never as a degree", () => {
    render(<FounderPage />);
    expect(screen.getByText("IIT Madras — CODE")).toBeInTheDocument();
    expect(screen.getByText(/Certification Program · Centre for Outreach and Digital Education/)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/IIT Madras.*(degree|B\.Tech|M\.Tech)/i);
  });

  it("describes the IN-SPACe workshop accurately without overstated titles", () => {
    render(<FounderPage />);
    expect(screen.getByText(/IN-SPACe — Department of Space, Government of India/)).toBeInTheDocument();
    expect(screen.getByText("Essentials of Model Rocketry")).toBeInTheDocument();
    expect(screen.getByText(/Workshop · Aug 2026 · GNEC IIT Roorkee, Greater Noida/)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/ISRO Certified|IN-SPACe Certified Scientist|Rocket Scientist|Aerospace Engineer certification/i);
  });

  it("makes the EVTO certification's in-progress status visually and textually unambiguous", () => {
    render(<FounderPage />);
    expect(screen.getByText(/Certified EV Technology Officer \(EVTO™\) — In Progress/)).toBeInTheDocument();
    expect(screen.getByText(/Ongoing · Expected Mar 2028/)).toBeInTheDocument();
  });

  it("links Explore Space Research, Workshop Gallery, EV.ENGINEER Labs and CAR Software Systems", () => {
    render(<FounderPage />);
    expect(screen.getByRole("link", { name: /^Space Research →$/ })).toHaveAttribute("href", "https://autonomous.ev.engineer/space");
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

  it("updates the Contact and Collaboration positioning to consulting, battery technology and Space R&D", () => {
    render(<FounderPage />);
    expect(
      screen.getByText(/strategic architecture consulting, EV battery technology, and Space R&D partnerships/)
    ).toBeInTheDocument();
  });
});
