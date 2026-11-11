import { aerospaceMetadata, CANONICAL } from "./seo";

// Server-rendered title, description, canonical, Open Graph and Twitter tags
// for /aerospace (see ./seo.ts). The share image is ./og-image.jpg/route.tsx.
export const metadata = aerospaceMetadata(CANONICAL);

export default function AerospaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
