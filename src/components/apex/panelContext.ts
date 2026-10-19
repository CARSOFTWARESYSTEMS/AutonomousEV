"use client";

import { createContext, useContext } from "react";

export type PanelTarget =
  | { kind: "capability"; id: string }
  | { kind: "partner"; id: string }
  | { kind: "domain"; id: string }
  | { kind: "engine-block"; id: string };

export type PanelApi = {
  /** Opens the panel, or replaces what it shows. `trigger` gets focus back on close. */
  open: (target: PanelTarget, trigger?: HTMLElement | SVGElement | null) => void;
  close: () => void;
  current: PanelTarget | null;
};

export const PanelContext = createContext<PanelApi | null>(null);

export function usePanel(): PanelApi {
  const api = useContext(PanelContext);
  if (!api) throw new Error("usePanel must be used inside <PanelProvider>");
  return api;
}
