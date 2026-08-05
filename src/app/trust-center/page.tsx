import type { Metadata } from "next";
import TrustCenterContent from "@/components/trust-center/TrustCenterContent";
import configRaw from "@/data/trust-center/config.json";
import faqsRaw from "@/data/trust-center/faqs.json";
import { validateTrustContentItems } from "@/lib/trust-center/validate";
import type { TrustCenterConfig } from "@/lib/trust-center/types";

const config = configRaw as unknown as TrustCenterConfig;
const PAGE_URL = "https://autonomous.ev.engineer/trust-center";

export const metadata: Metadata = {
  title: config.seo.title,
  description: config.seo.description,
  alternates: {
    canonical: config.seo.canonicalPath,
  },
  robots: config.seo.noindex ? { index: false, follow: false } : undefined,
  openGraph: {
    title: config.seo.title,
    description: config.seo.description,
    url: PAGE_URL,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: config.seo.title,
    description: config.seo.description,
  },
};

const organizationSchema = {
  "@type": "Organization",
  "@id": "https://ev.engineer/#organization",
  name: "EV.ENGINEER",
  url: "https://ev.engineer/",
  sameAs: ["https://autonomous.ev.engineer/"],
  description:
    "EV.ENGINEER is an engineering platform focused on EV battery safety, diagnostics, second-life systems, AI battery intelligence, cloud telemetry, cybersecurity, and EV systems architecture.",
};

const faqEntries = validateTrustContentItems(faqsRaw, "faqs.json").filter((f) => f.enabled);

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      name: config.seo.title,
      description: config.seo.description,
      url: PAGE_URL,
      about: organizationSchema,
    },
    organizationSchema,
    ...(faqEntries.length > 0
      ? [
          {
            "@type": "FAQPage",
            "@id": `${PAGE_URL}#faq`,
            mainEntity: faqEntries.map((item) => ({
              "@type": "Question",
              name: item.title,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.summary ?? "",
              },
            })),
          },
        ]
      : []),
  ],
};

export default function TrustCenterPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TrustCenterContent />
    </>
  );
}
