import type { Metadata, Viewport } from "next";
import { ApexShell } from "@/components/apex/ApexShell";
import { apexMetadata } from "@/data/apex/seo";
import { APEX_SITE } from "@/data/apex/site";

// The APEX microsite: its own header, footer, theme and metadata. The page
// bodies live in src/components/apex/pages so this folder can be copied to
// another host's app directory unchanged (see docs/apexrocketsystems.md).
export const metadata: Metadata = apexMetadata("home");

export const viewport: Viewport = {
  themeColor: APEX_SITE.themeColor,
  colorScheme: "dark",
};

export default function ApexLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ApexShell>{children}</ApexShell>;
}
