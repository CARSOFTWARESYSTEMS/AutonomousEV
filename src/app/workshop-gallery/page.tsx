import type { Metadata } from "next";
import WorkshopGalleryPage from "./WorkshopGalleryPage";

export const metadata: Metadata = {
  title: "Workshop Gallery | EV.ENGINEER™",
  description:
    "Explore photos from our hands-on EV Battery & Autonomous Vehicle workshops. Register for an upcoming event.",
};

export default function Page() {
  return <WorkshopGalleryPage />;
}
