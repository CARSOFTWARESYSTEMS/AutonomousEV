import type { Metadata } from 'next';
import BatteryPackDesignContent from './BatteryPackDesignContent';

const PAGE_URL = 'https://autonomous.ev.engineer/internships/battery-pack-design';
const OG_IMAGE = 'https://autonomous.ev.engineer/EV ENGINEER Sudarshana Karkala.png';

export const metadata: Metadata = {
  title: 'EV Battery Pack Design Handbook | Sudarshana Karkala | EV.ENGINEER',
  description:
    'Learn EV Battery Pack Design from basics to real-world EV systems with Sudarshana Karkala and EV.ENGINEER. Covers lithium-ion cells, LFP, second-life batteries, BMS, thermal design, diagnostics, AI battery intelligence, cloud telemetry, cybersecurity, and EV battery systems architecture.',
  keywords: [
    'EV Battery Pack Design',
    'Lithium-Ion Battery Pack Design',
    'EV Battery Systems Engineering',
    'Battery Pack Design Handbook',
    'BMS Design',
    'EV Battery Architecture',
    'Second-Life Battery Pack',
    'LFP Battery Design',
    'Battery Intelligence',
    'EV Battery Cybersecurity',
    'EV Battery Diagnostics',
    'Battery Management System',
    'Thermal Runaway Prevention',
    'EV Battery Safety Standards',
    'Cell to Pack Design',
    'Sudarshana Karkala',
    'EV.ENGINEER',
    'EV Battery Pack Design by Sudarshana Karkala',
    'Sudarshana Karkala EV Battery',
    'Sudarshana Karkala EV.ENGINEER',
    'How to design EV battery pack',
    'Second-life battery pack design',
    'EV Battery Pack Design Handbook',
  ],
  authors: [
    {
      name: 'Sudarshana Karkala',
      url: 'https://www.linkedin.com/in/sudarshanakarkala/',
    },
  ],
  creator: 'Sudarshana Karkala',
  publisher: 'EV.ENGINEER',
  openGraph: {
    title: 'EV Battery Pack Design Handbook by Sudarshana Karkala | EV.ENGINEER',
    description:
      'Learn EV Battery Pack Design from basics to real-world EV systems with Sudarshana Karkala and EV.ENGINEER. Covers lithium-ion cells, LFP, second-life batteries, BMS, thermal design, diagnostics, AI battery intelligence, cloud telemetry, cybersecurity, and EV battery systems architecture.',
    type: 'article',
    url: PAGE_URL,
    siteName: 'EV.ENGINEER',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'EV Battery Pack Design Handbook by Sudarshana Karkala — EV.ENGINEER',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EV Battery Pack Design Handbook | Sudarshana Karkala | EV.ENGINEER',
    description:
      'Learn EV Battery Pack Design from basics to real-world EV systems. Covers lithium-ion cells, LFP, second-life batteries, BMS, thermal design, diagnostics, AI battery intelligence, and cybersecurity.',
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: PAGE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// ─── STRUCTURED DATA ───

const organizationSchema = {
  '@type': 'Organization',
  '@id': 'https://ev.engineer/#organization',
  name: 'EV.ENGINEER',
  url: 'https://ev.engineer/',
  sameAs: ['https://autonomous.ev.engineer/'],
  description:
    'EV.ENGINEER is an engineering platform focused on EV battery safety, diagnostics, second-life systems, AI battery intelligence, cloud telemetry, cybersecurity, and EV systems architecture.',
};

const personSchema = {
  '@type': 'Person',
  '@id': 'https://www.linkedin.com/in/sudarshanakarkala/#person',
  name: 'Sudarshana Karkala',
  jobTitle: 'EV Battery Systems Engineer, EV.ENGINEER Founder & Architect',
  url: 'https://autonomous.ev.engineer/',
  sameAs: [
    'https://www.linkedin.com/in/sudarshanakarkala/',
    'https://autonomous.ev.engineer/',
    'https://ev.engineer/',
  ],
  worksFor: organizationSchema,
};

const faqEntries = [
  {
    question: 'What is EV Battery Pack Design?',
    answer:
      'EV Battery Pack Design is the engineering discipline of architecting lithium-ion battery systems for electric vehicles — covering cell selection, module assembly, high-voltage electrical design, thermal management, BMS software, safety compliance, and second-life battery reuse.',
  },
  {
    question: 'How do I learn Lithium-Ion Battery Pack Design?',
    answer:
      'This handbook by EV.ENGINEER and Sudarshana Karkala provides a structured 19-part curriculum. Start with Part 0 (orientation) and Part 1 (battery fundamentals), then progress through electrical design, BMS hardware and software, thermal management, AI diagnostics, cloud telemetry, cybersecurity, and second-life systems.',
  },
  {
    question: 'Why is LFP important for EV battery packs?',
    answer:
      'LFP (Lithium Iron Phosphate) chemistry is cobalt-free, highly thermally stable, and has excellent cycle life — making it ideal for traction packs and second-life stationary storage. Its flat OCV curve and lower cost per kWh make it the chemistry of choice for cost-sensitive and longevity-focused applications.',
  },
  {
    question: 'What is second-life battery pack design?',
    answer:
      'Second-life battery pack design involves repurposing retired EV battery cells (typically at 70–80% remaining health) for secondary applications like grid energy storage, backup power, or light mobility. The process includes State-of-Health grading, cell sorting by internal resistance, module reassembly, and designing safe operating envelopes for degraded cells.',
  },
  {
    question: 'What is the role of BMS in EV battery safety?',
    answer:
      'The Battery Management System (BMS) is the intelligence core of the EV battery pack. It monitors cell voltages, temperatures, and current to estimate State of Charge and State of Health, protect against overcharge, over-discharge, and thermal runaway, balance cell voltages, and communicate fault states to the vehicle control system.',
  },
  {
    question: 'How are AI and cloud telemetry used in EV battery systems?',
    answer:
      'AI is used in EV battery systems for predictive State of Health estimation, remaining useful life forecasting, early fault detection, and anomaly detection. Cloud telemetry enables fleet-level monitoring, digital twin construction, over-the-air updates, and data-driven maintenance scheduling.',
  },
  {
    question: 'Why is cybersecurity important in EV battery systems?',
    answer:
      'EV battery systems are networked, connected assets. Cybersecurity protects communication channels from tampering, ensures firmware integrity via secure boot and authenticated OTA updates, and prevents remote attacks on safety-critical BMS functions. ISO 21434 defines the threat modeling and cybersecurity lifecycle for automotive systems.',
  },
  {
    question: 'Who created this EV Battery Pack Design handbook?',
    answer:
      'This handbook is created by EV.ENGINEER under the guidance of Sudarshana Karkala, focusing on EV battery safety, diagnostics, second-life systems, AI battery intelligence, cloud telemetry, and cybersecurity.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: 'EV Battery Pack Design Handbook | Sudarshana Karkala | EV.ENGINEER',
      description:
        'Learn EV Battery Pack Design from basics to real-world EV systems with Sudarshana Karkala and EV.ENGINEER.',
      inLanguage: 'en-US',
      isPartOf: {
        '@type': 'WebSite',
        '@id': 'https://autonomous.ev.engineer/#website',
        name: 'EV.ENGINEER',
        url: 'https://autonomous.ev.engineer/',
        publisher: organizationSchema,
      },
      author: personSchema,
      breadcrumb: {
        '@type': 'BreadcrumbList',
        '@id': `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://autonomous.ev.engineer/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Internships',
            item: 'https://autonomous.ev.engineer/internships',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'EV Battery Pack Design Handbook',
            item: PAGE_URL,
          },
        ],
      },
    },
    {
      '@type': 'Article',
      '@id': `${PAGE_URL}#article`,
      headline: 'EV Battery Pack Design Handbook — From Basics to Real-World EV Systems',
      description:
        'A comprehensive 19-part engineering handbook covering EV battery pack design from lithium-ion cell fundamentals through BMS architecture, thermal management, AI diagnostics, cloud telemetry, cybersecurity, and second-life battery systems.',
      url: PAGE_URL,
      author: personSchema,
      publisher: organizationSchema,
      datePublished: '2025-01-01',
      dateModified: '2026-05-21',
      image: OG_IMAGE,
      articleSection: 'EV Battery Engineering',
      keywords:
        'EV Battery Pack Design, Lithium-Ion Battery Pack Design, BMS Design, Second-Life Battery Pack, Sudarshana Karkala, EV.ENGINEER',
      mainEntityOfPage: `${PAGE_URL}#webpage`,
    },
    {
      '@type': 'Course',
      '@id': `${PAGE_URL}#course`,
      name: 'EV Battery Pack Design Handbook',
      description:
        'A 19-part engineering curriculum for EV battery pack design covering cell chemistry, electrical architecture, BMS hardware and software, thermal management, safety systems, AI battery intelligence, cloud telemetry, cybersecurity, and second-life battery design.',
      url: PAGE_URL,
      provider: organizationSchema,
      author: personSchema,
      inLanguage: 'en-US',
      educationalLevel: 'Beginner to Expert',
      teaches: [
        'EV Battery Pack Design',
        'Lithium-Ion Cell Selection',
        'BMS Architecture',
        'Thermal Management',
        'Battery Safety Standards',
        'AI Battery Diagnostics',
        'Cloud Telemetry',
        'EV Battery Cybersecurity',
        'Second-Life Battery Systems',
      ],
      courseCode: 'EVE-BPD-001',
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'online',
        inLanguage: 'en-US',
      },
    },
    personSchema,
    organizationSchema,
    {
      '@type': 'FAQPage',
      '@id': `${PAGE_URL}#faq`,
      mainEntity: faqEntries.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
  ],
};

export default function BatteryPackDesignPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BatteryPackDesignContent />
    </>
  );
}
