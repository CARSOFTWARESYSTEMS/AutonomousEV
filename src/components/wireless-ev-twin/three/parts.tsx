"use client";
// Shared materials for the road and district geometry. The hero assemblies
// live in ./vehicle (the car) and ./station (pads, cabinet, site).
import { MATERIALS, type Materials } from "./materials";

export { pick } from "./pick";

let bank: Materials | null = null;
/** Shared materials, created once on first use (module scope, so render stays pure). */
export const mats = (): Materials => (bank ??= MATERIALS());
