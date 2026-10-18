// Where diagnostic data comes from. V1 uses manual entry; the same interface
// takes an imported tester or BMS export (CSV or JSON) today and a live BMS
// link later, without changing the diagnostic engine. There is no fake live
// hardware here: the live source reports that it is not available.
import { MEASUREMENTS, OBSERVATIONS } from "@/data/ev-battery-toolkit/fields";
import type { DiagnosticContext, DiagnosticMeasurement, DiagnosticObservation, MeasurementKey, ObservationKey, Provenance } from "./types";
import type { SimulationResult } from "./simulation";

export interface DiagnosticImport {
  context: DiagnosticContext;
  source: string;
  measurements: Partial<Record<MeasurementKey, DiagnosticMeasurement>>;
  observations: Partial<Record<ObservationKey, DiagnosticObservation>>;
  groupVoltages: number[];
  /** Keys in the input that were not recognised. */
  ignored: string[];
}

export interface DiagnosticDataSource {
  id: string;
  kind: "manual" | "simulation" | "file" | "live";
  label: string;
  available: boolean;
  read(): Promise<DiagnosticImport>;
}

const MEASUREMENT_KEYS = new Set(Object.keys(MEASUREMENTS));
const OBSERVATION_KEYS = new Set(Object.keys(OBSERVATIONS));

const emptyImport = (context: DiagnosticContext, source: string): DiagnosticImport => ({ context, source, measurements: {}, observations: {}, groupVoltages: [], ignored: [] });

/** Values typed in by the technician; the UI writes into the job card directly. */
export class ManualEntrySource implements DiagnosticDataSource {
  id = "manual";
  kind = "manual" as const;
  label = "Manual entry";
  available = true;
  async read() {
    return emptyImport("real", this.label);
  }
}

/**
 * The simulation, as a data source. Its context is "simulation", which the real
 * workflow refuses to merge: simulated values never enter a real job card.
 */
export class SimulationSource implements DiagnosticDataSource {
  id = "simulation";
  kind = "simulation" as const;
  label = "Simulation / training data";
  available = true;
  constructor(private readonly result: SimulationResult) {}
  async read(): Promise<DiagnosticImport> {
    const s = this.result.snapshot;
    const out = emptyImport("simulation", this.label);
    const put = (key: MeasurementKey, value: number | null) => {
      out.measurements[key] = { key, value, provenance: value === null ? "NOT_AVAILABLE" : "SIMULATED" };
    };
    put("packVoltage", s.packVoltage.value);
    put("packCurrent", s.packCurrent.value);
    put("soc", s.soc.value);
    put("soh", s.soh.value);
    put("cellMin", s.minCellV.value);
    put("cellMax", s.maxCellV.value);
    put("cellDelta", s.cellDeltaMv.value);
    put("tempMin", s.minTemp.value);
    put("tempMax", s.maxTemp.value);
    put("tempSpread", s.tempSpread.value);
    out.groupVoltages = [...s.groupVoltages];
    return out;
  }
}

/** Parses a tester or BMS export. Values from an instrument file are MEASURED. */
export function parseDiagnosticFile(text: string, filename: string): DiagnosticImport {
  const out = emptyImport("real", `Imported file: ${filename.replace(/[^\w.\- ]/g, "").slice(0, 60) || "file"}`);
  const entries: [string, unknown][] = [];
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new Error("The file is not valid JSON.");
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Expected a JSON object of field names and values.");
    entries.push(...Object.entries(parsed as Record<string, unknown>));
  } else {
    for (const line of trimmed.split(/\r?\n/)) {
      const [k, ...rest] = line.split(/[,;\t]/);
      if (!k || /^\s*(key|field)\s*$/i.test(k)) continue;
      entries.push([k.trim(), rest.join(",").trim()]);
    }
  }
  const provenance: Provenance = "MEASURED";
  for (const [rawKey, raw] of entries) {
    const key = rawKey.trim();
    if (key === "groupVoltages") {
      const list = Array.isArray(raw) ? raw : String(raw).split(/[\s|]+/);
      out.groupVoltages = list.map((v) => Number(v)).filter((v) => Number.isFinite(v));
    } else if (MEASUREMENT_KEYS.has(key)) {
      const value = typeof raw === "number" ? raw : Number(String(raw).replace(/[^\d.\-eE+]/g, ""));
      if (Number.isFinite(value) && String(raw).trim() !== "") out.measurements[key as MeasurementKey] = { key: key as MeasurementKey, value, provenance };
      else out.ignored.push(key);
    } else if (OBSERVATION_KEYS.has(key) && typeof raw === "string" && raw.trim()) {
      out.observations[key as ObservationKey] = { key: key as ObservationKey, value: raw.trim().slice(0, 120), provenance };
    } else {
      out.ignored.push(key);
    }
  }
  return out;
}

export class ImportedFileSource implements DiagnosticDataSource {
  id = "file";
  kind = "file" as const;
  label = "Imported CSV / JSON";
  available = true;
  constructor(private readonly text: string, private readonly filename: string) {}
  async read() {
    return parseDiagnosticFile(this.text, this.filename);
  }
}

/** Placeholder for a future live CAN / UART / BLE connection. Not implemented in V1. */
export class FutureLiveBmsSource implements DiagnosticDataSource {
  id = "live";
  kind = "live" as const;
  label = "Live BMS connection";
  available = false;
  async read(): Promise<DiagnosticImport> {
    throw new Error("Live BMS connection is not available in this version.");
  }
}

/** Only real-context imports may enter a real job card. */
export function canMergeIntoRealJob(data: DiagnosticImport): boolean {
  return data.context === "real" && Object.values(data.measurements).every((m) => m?.provenance !== "SIMULATED");
}
