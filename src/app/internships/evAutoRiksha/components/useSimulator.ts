"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_ASSUMPTIONS, DEFAULT_REQUIREMENT, EMPTY_OVERRIDES, PRESETS } from "@/lib/evAutoRickshaw/defaults";
import { runSimulation } from "@/lib/evAutoRickshaw/engine";
import type {
  ChargingAvailability,
  CustomerRequirement,
  EngineeringOverrides,
  PresetId,
  SimulatorAssumptions,
  SimulatorOutputs,
  SoftwareTier,
  Terrain,
  Traffic,
} from "@/lib/evAutoRickshaw/types";
import { sanitizeRequirement } from "@/lib/evAutoRickshaw/validation";

export type ConfiguratorMode = "simple" | "engineering";

function parseQueryRequirement(params: URLSearchParams): Partial<CustomerRequirement> {
  const out: Partial<CustomerRequirement> = {};
  const num = (key: string) => {
    const v = params.get(key);
    return v !== null && v !== "" && !Number.isNaN(Number(v)) ? Number(v) : undefined;
  };

  const passengers = num("passengers");
  if (passengers) out.passengerCapacity = Math.min(6, Math.max(3, Math.round(passengers))) as 3 | 4 | 5 | 6;
  const dailyKm = num("dailyKm");
  if (dailyKm) out.dailyDistanceKm = dailyKm;
  const speed = num("speed");
  if (speed) out.maxSpeedKmh = speed;
  const budget = num("budget");
  if (budget) out.targetPriceInr = budget;
  const luggage = num("luggage");
  if (luggage !== undefined) out.luggageKg = luggage;

  const terrain = params.get("terrain");
  if (terrain === "flat" || terrain === "mixed" || terrain === "hilly") out.terrain = terrain as Terrain;

  const traffic = params.get("traffic");
  if (traffic === "light" || traffic === "medium" || traffic === "heavy") out.traffic = traffic as Traffic;

  const ac = params.get("ac");
  if (ac === "1" || ac === "0") out.acEnabled = ac === "1";

  const software = params.get("software");
  if (software === "standard" || software === "connected" || software === "fleet" || software === "intelligence") {
    out.softwareTier = software as SoftwareTier;
  }

  const charging = params.get("charging");
  if (
    charging === "overnight" ||
    charging === "overnight-opportunity" ||
    charging === "fleet-depot" ||
    charging === "battery-swap"
  ) {
    out.chargingAvailability = charging as ChargingAvailability;
  }

  return out;
}

function parseQueryOverrides(params: URLSearchParams): EngineeringOverrides {
  const out: EngineeringOverrides = {};
  const battery = params.get("battery");
  if (battery && !Number.isNaN(Number(battery))) out.batteryCapacityKWh = Number(battery);
  const motor = params.get("motor");
  if (motor && !Number.isNaN(Number(motor))) out.peakPowerKw = Number(motor);
  return out;
}

export function buildShareQuery(requirement: CustomerRequirement, overrides: EngineeringOverrides): string {
  const params = new URLSearchParams();
  params.set("passengers", String(requirement.passengerCapacity));
  params.set("dailyKm", String(Math.round(requirement.dailyDistanceKm)));
  params.set("terrain", requirement.terrain);
  params.set("traffic", requirement.traffic);
  params.set("speed", String(requirement.maxSpeedKmh));
  params.set("ac", requirement.acEnabled ? "1" : "0");
  params.set("budget", String(Math.round(requirement.targetPriceInr)));
  params.set("software", requirement.softwareTier);
  params.set("charging", requirement.chargingAvailability);
  if (overrides.batteryCapacityKWh !== undefined) params.set("battery", String(overrides.batteryCapacityKWh));
  if (overrides.peakPowerKw !== undefined) params.set("motor", String(overrides.peakPowerKw));
  return params.toString();
}

export function useEvSimulator() {
  const [mode, setMode] = useState<ConfiguratorMode>("simple");
  const [preset, setPreset] = useState<PresetId | "custom">("city");
  const [requirement, setRequirement] = useState<CustomerRequirement>(DEFAULT_REQUIREMENT);
  const [overrides, setOverrides] = useState<EngineeringOverrides>(EMPTY_OVERRIDES);
  const [assumptions, setAssumptions] = useState<SimulatorAssumptions>(DEFAULT_ASSUMPTIONS);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from the URL once on mount (shareable configuration links). Reading
  // window.location must happen post-mount to avoid an SSR/client markup
  // mismatch, so this one-time sync from an external source is an effect by
  // necessity rather than something derivable during render.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if ([...params.keys()].length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time external-source sync, see comment above
      setHydrated(true);
      return;
    }
    const reqPatch = parseQueryRequirement(params);
    const overridePatch = parseQueryOverrides(params);
    if (Object.keys(reqPatch).length > 0) {
      setRequirement((prev) => ({ ...prev, ...reqPatch }));
      setPreset("custom");
    }
    if (Object.keys(overridePatch).length > 0) {
      setOverrides((prev) => ({ ...prev, ...overridePatch }));
    }
    setHydrated(true);
  }, []);

  // Keep the URL in sync (debounced) so "Copy Configuration Link" always reflects current state.
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    const handle = window.setTimeout(() => {
      const query = buildShareQuery(requirement, overrides);
      const url = `${window.location.pathname}?${query}`;
      window.history.replaceState(null, "", url);
    }, 400);
    return () => window.clearTimeout(handle);
  }, [requirement, overrides, hydrated]);

  const updateRequirement = useCallback(<K extends keyof CustomerRequirement>(key: K, value: CustomerRequirement[K]) => {
    setRequirement((prev) => sanitizeRequirement({ ...prev, [key]: value }));
    setPreset("custom");
  }, []);

  const updateOverride = useCallback(<K extends keyof EngineeringOverrides>(key: K, value: EngineeringOverrides[K]) => {
    setOverrides((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateAssumption = useCallback(<K extends keyof SimulatorAssumptions>(key: K, value: SimulatorAssumptions[K]) => {
    setAssumptions((prev) => ({ ...prev, [key]: value }));
  }, []);

  const applyPreset = useCallback((id: PresetId) => {
    const def = PRESETS.find((p) => p.id === id);
    if (!def) return;
    setRequirement((prev) => sanitizeRequirement({ ...prev, ...def.requirement }));
    setOverrides(def.overrides);
    setPreset(id);
  }, []);

  const resetToRecommended = useCallback(() => {
    setOverrides(EMPTY_OVERRIDES);
  }, []);

  const resetAssumptions = useCallback(() => {
    setAssumptions(DEFAULT_ASSUMPTIONS);
  }, []);

  const resetAll = useCallback(() => {
    setRequirement(DEFAULT_REQUIREMENT);
    setOverrides(EMPTY_OVERRIDES);
    setAssumptions(DEFAULT_ASSUMPTIONS);
    setPreset("city");
  }, []);

  const outputs: SimulatorOutputs = useMemo(
    () => runSimulation(requirement, overrides, assumptions),
    [requirement, overrides, assumptions],
  );

  const shareQuery = useMemo(() => buildShareQuery(requirement, overrides), [requirement, overrides]);

  return {
    mode,
    setMode,
    preset,
    requirement,
    overrides,
    assumptions,
    outputs,
    updateRequirement,
    updateOverride,
    updateAssumption,
    applyPreset,
    resetToRecommended,
    resetAssumptions,
    resetAll,
    shareQuery,
  };
}

export type EvSimulator = ReturnType<typeof useEvSimulator>;
