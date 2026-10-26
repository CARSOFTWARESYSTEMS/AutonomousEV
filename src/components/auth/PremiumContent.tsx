"use client";

import type { ReactNode } from "react";
import { usePremiumLock } from "./PremiumRouteGate";

/**
 * The boundary of a required-login page with a public preview
 * (`publicPreview` in src/config/premiumAuthRoutes.ts): `children`, the full
 * experience, render only for a signed-in visitor; everyone else — and the
 * server render that search engines index — gets `preview`.
 *
 * A login gate, not access control: see the security boundary note in
 * src/config/premiumAuthRoutes.ts.
 */
export default function PremiumContent({ preview, children }: { preview: ReactNode; children: ReactNode }) {
  const { locked } = usePremiumLock();
  return <>{locked ? preview : children}</>;
}
