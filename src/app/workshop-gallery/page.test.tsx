import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WorkshopGalleryPage from "./page";

const TITLE = "FACTORY VISIT & CUSTOMER INTERACTION";
const altFor = (n: number) => `Factory Visit & Customer Interaction — Aerospace MSME — 07 October 2026 — Photo ${n}`;
const fileFor = (n: number) => `/factory_visit/fai_factory_visit_${n - 1}.jpeg`;
const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function factoryVisit() {
  return within(screen.getByRole("region", { name: TITLE }));
}

describe("/workshop-gallery — Factory Visit & Customer Interaction", () => {
  it("sits directly after Gallery and directly before EV Society - Workshops", () => {
    render(<WorkshopGalleryPage />);
    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    const at = headings.indexOf(TITLE);
    expect(headings[at - 1]).toBe("Gallery");
    expect(headings[at + 1]).toBe("EV Society - Workshops");
  });

  it("leaves the other sections in their original order", () => {
    render(<WorkshopGalleryPage />);
    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(headings.filter((h) => h !== TITLE)).toEqual([
      "Certificate distribution",
      "Intern's Initiatives",
      "External Events",
      "Gallery",
      "EV Society - Workshops",
      "External Workshops",
      "New Initiatives",
      "Want to Join Our Next Workshop?",
    ]);
  });

  it("shows the title, then the date, then the description, then the photos", () => {
    render(<WorkshopGalleryPage />);
    const section = factoryVisit();
    const order = [
      section.getByRole("heading", { level: 2, name: TITLE }),
      section.getByText("07 OCT 2026"),
      section.getByText("Aerospace MSME"),
      section.getByRole("img", { name: altFor(1) }),
    ];
    for (let i = 1; i < order.length; i++) {
      expect(order[i - 1].compareDocumentPosition(order[i]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
    expect(section.getByText("07 OCT 2026")).toHaveAttribute("datetime", "2026-10-07");
  });

  it("shows all nine photos, in order, each with its alt text and an existing file", () => {
    render(<WorkshopGalleryPage />);
    const images = factoryVisit().getAllByRole("img");
    expect(images.map((img) => img.getAttribute("alt"))).toEqual(NUMBERS.map(altFor));
    images.forEach((img, i) => {
      const file = fileFor(i + 1);
      expect(decodeURIComponent(img.getAttribute("src") ?? "")).toContain(file);
      expect(existsSync(path.join(process.cwd(), "public", file))).toBe(true);
      expect(img).toHaveAttribute("loading", "lazy");
      expect(img.getAttribute("sizes")).toBeTruthy();
    });
  });

  it("makes every photo a button that opens the viewer", () => {
    render(<WorkshopGalleryPage />);
    const buttons = factoryVisit().getAllByRole("button");
    expect(buttons.map((b) => b.getAttribute("aria-label"))).toEqual(NUMBERS.map(altFor));
    buttons.forEach((b) => expect(b).toHaveAttribute("aria-haspopup", "dialog"));
  });

  it("opens the selected photo in the viewer", async () => {
    const user = userEvent.setup();
    render(<WorkshopGalleryPage />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(factoryVisit().getByRole("button", { name: altFor(3) }));

    const dialog = within(screen.getByRole("dialog"));
    expect(dialog.getByText("Photo 3 of 9")).toBeInTheDocument();
    const shown = dialog.getByRole("img", { name: altFor(3) });
    expect(decodeURIComponent(shown.getAttribute("src") ?? "")).toContain(fileFor(3));
    expect(dialog.getByRole("button", { name: "Close photo viewer" })).toHaveFocus();
  });

  it("steps with the Previous and Next buttons and wraps at both ends", async () => {
    const user = userEvent.setup();
    render(<WorkshopGalleryPage />);
    await user.click(factoryVisit().getByRole("button", { name: altFor(1) }));
    const dialog = within(screen.getByRole("dialog"));

    await user.click(dialog.getByRole("button", { name: "Next photo" }));
    expect(dialog.getByText("Photo 2 of 9")).toBeInTheDocument();
    expect(dialog.getByRole("img", { name: altFor(2) })).toBeInTheDocument();

    await user.click(dialog.getByRole("button", { name: "Previous photo" }));
    await user.click(dialog.getByRole("button", { name: "Previous photo" }));
    expect(dialog.getByText("Photo 9 of 9")).toBeInTheDocument();
    expect(dialog.getByRole("img", { name: altFor(9) })).toBeInTheDocument();

    await user.click(dialog.getByRole("button", { name: "Next photo" }));
    expect(dialog.getByText("Photo 1 of 9")).toBeInTheDocument();
  });

  it("steps with the arrow keys", async () => {
    const user = userEvent.setup();
    render(<WorkshopGalleryPage />);
    await user.click(factoryVisit().getByRole("button", { name: altFor(4) }));
    const dialog = within(screen.getByRole("dialog"));

    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(dialog.getByText("Photo 6 of 9")).toBeInTheDocument();
    await user.keyboard("{ArrowLeft}");
    expect(dialog.getByText("Photo 5 of 9")).toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the photo that opened it", async () => {
    const user = userEvent.setup();
    render(<WorkshopGalleryPage />);
    const opener = factoryVisit().getByRole("button", { name: altFor(5) });
    await user.click(opener);
    expect(document.body.style.overflow).toBe("hidden");

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
  });

  it("closes from the Close button", async () => {
    const user = userEvent.setup();
    render(<WorkshopGalleryPage />);
    await user.click(factoryVisit().getByRole("button", { name: altFor(2) }));

    await user.click(screen.getByRole("button", { name: "Close photo viewer" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps Tab inside the viewer", async () => {
    const user = userEvent.setup();
    render(<WorkshopGalleryPage />);
    await user.click(factoryVisit().getByRole("button", { name: altFor(2) }));
    const dialog = screen.getByRole("dialog");

    for (let i = 0; i < 6; i++) {
      await user.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
    await user.tab({ shift: true });
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });
});

describe("/workshop-gallery — existing sections", () => {
  it("still opens a workshop photo in the original viewer and closes it", async () => {
    const user = userEvent.setup();
    render(<WorkshopGalleryPage />);
    expect(screen.getAllByRole("img", { name: "Mar 2026 EV Webinar" })).toHaveLength(1);

    await user.click(screen.getByRole("img", { name: "Mar 2026 EV Webinar" }));

    // The card's photo plus the enlarged copy.
    const copies = screen.getAllByRole("img", { name: "Mar 2026 EV Webinar" });
    expect(copies).toHaveLength(2);
    expect(copies[0]).toHaveAttribute("src", "/workshops/evsociety2026_webinar3.jpeg");

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.getAllByRole("img", { name: "Mar 2026 EV Webinar" })).toHaveLength(1);
  });
});
