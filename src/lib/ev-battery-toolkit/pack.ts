// Resolves a configuration into a pack: series and parallel counts, module
// split and the cell layout the 3D view draws. Pure, deterministic and free of
// rendering, so the same pack feeds the scene, the 2D schematic and the
// simulation.
import { ARCHITECTURES, CELL_MODEL, CELL_NOMINAL_V, ENERGY_BANDS, PACK_LAYOUTS, VOLTAGE_CLASSES } from "@/data/ev-battery-toolkit/architectures";
import { round } from "./provenance";
import type { ArchitectureId, BatteryConfig, BatteryPack, PackLayout } from "./types";

const clampInt = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(Number.isFinite(value) ? value : min)));

export function nominalVoltageOf(config: BatteryConfig): number {
  if (config.voltage === "custom") return Math.min(120, Math.max(24, Number.isFinite(config.customVoltage) ? config.customVoltage : 48));
  return VOLTAGE_CLASSES.find((v) => v.id === config.voltage)?.nominal ?? 48;
}

export function modulesFor(layout: PackLayout, architecture: ArchitectureId): number {
  switch (layout) {
    case "single":
    case "removable":
    case "swappable":
      return 1;
    case "dual-pack":
      return 2;
    case "multi-module":
      return 4;
    case "fixed":
      return ARCHITECTURES[architecture].modules;
  }
}

/** Choosing a layout that implies an architecture moves the configuration to it. */
export function applyLayout(config: BatteryConfig, layout: PackLayout): BatteryConfig {
  const implied = PACK_LAYOUTS.find((l) => l.id === layout)?.architecture;
  return { ...config, layout, architecture: implied ?? config.architecture };
}

export function resolvePack(config: BatteryConfig): BatteryPack {
  const cellNominalV = CELL_NOMINAL_V[config.chemistry];
  const cellCapacityAh = CELL_MODEL[config.format].capacityAh;
  const target = nominalVoltageOf(config);
  const series = clampInt(target / cellNominalV, 7, 34);
  const energyTarget = ENERGY_BANDS.find((e) => e.id === config.energy)?.target ?? 2.5;
  const parallel = clampInt((energyTarget * 1000) / (series * cellNominalV * cellCapacityAh), 1, 24);
  const modules = Math.min(series, modulesFor(config.layout, config.architecture));
  // Series groups split as evenly as possible; earlier modules take the remainder.
  const groupsPerModule = Array.from({ length: modules }, (_, m) => Math.floor(series / modules) + (m < series % modules ? 1 : 0));
  const nominalV = round(series * cellNominalV, 1);
  const capacityAh = round(parallel * cellCapacityAh, 1);
  return {
    config,
    series,
    parallel,
    modules,
    groupsPerModule,
    cellNominalV,
    cellCapacityAh,
    nominalV,
    capacityAh,
    energyKWh: round((nominalV * capacityAh) / 1000, 2),
    totalCells: series * parallel,
  };
}

export function packLabel(pack: BatteryPack): string {
  return `${pack.series}S${pack.parallel}P · ${pack.nominalV} V · ${pack.capacityAh} Ah · ${pack.energyKWh} kWh`;
}

// ── Layout for drawing ──

export interface CellSlot {
  position: [number, number, number];
  group: number;
  module: number;
}

export interface ModuleBox {
  module: number;
  center: [number, number, number];
  size: [number, number, number];
  /** Series groups in this module, first and last (inclusive). */
  groups: [number, number];
}

export interface PackLayoutResult {
  cells: CellSlot[];
  modules: ModuleBox[];
  /** Enclosure size and the per-cell body size actually drawn. */
  enclosure: [number, number, number];
  cellBody: [number, number, number];
  /** True when cells were shrunk to fit the envelope; the view says so. */
  scaled: boolean;
  /** Each group's centre, for labels, sensors and the "why" highlight. */
  groupCenters: [number, number, number][];
  /** Separate enclosures per module (dual-pack). */
  split: boolean;
}

const MODULE_GAP = 0.18;
const MARGIN: [number, number, number] = [0.5, 0.42, 0.36];

/**
 * Packs the cells of each module into a grid (columns along X, rows along Z,
 * layers along Y), shrinking the cell only if the architecture's envelope is
 * too small. A series group is P consecutive cells, so groups read as strips.
 */
export function layoutPack(pack: BatteryPack): PackLayoutResult {
  const arch = ARCHITECTURES[pack.config.architecture];
  const [envX, envY, envZ] = arch.dimensions;
  const model = CELL_MODEL[pack.config.format];
  const split = pack.config.layout === "dual-pack";
  const usableX = envX - MARGIN[0] - MODULE_GAP * (pack.modules - 1);
  const usableY = envY - MARGIN[1];
  const usableZ = envZ - MARGIN[2];

  const maxCellsPerModule = Math.max(...pack.groupsPerModule) * pack.parallel;
  let scale = 1;
  let grid = { cols: 1, rows: 1, layers: 1 };
  for (let attempt = 0; attempt < 40; attempt++) {
    const [sx, sy, sz] = model.slot.map((d) => d * scale);
    const rows = Math.max(1, Math.floor(usableZ / sz));
    const layers = Math.max(1, Math.floor(usableY / sy));
    const colsAvailable = Math.max(1, Math.floor(usableX / pack.modules / sx));
    const perColumn = rows * layers;
    const colsNeeded = Math.ceil(maxCellsPerModule / perColumn);
    grid = { cols: colsNeeded, rows, layers };
    if (colsNeeded <= colsAvailable) break;
    scale *= 0.92;
  }
  // Use the fewest rows and layers that still fit, so the block is compact.
  const perModuleCols = grid.cols;
  const rowsUsed = Math.min(grid.rows, Math.ceil(maxCellsPerModule / (perModuleCols * grid.layers)));
  const layersUsed = Math.min(grid.layers, Math.ceil(maxCellsPerModule / (perModuleCols * rowsUsed)));
  const [sx, sy, sz] = model.slot.map((d) => round(d * scale, 4));
  const moduleX = perModuleCols * sx;
  const blockX = moduleX * pack.modules + MODULE_GAP * (pack.modules - 1);
  const blockY = layersUsed * sy;
  const blockZ = rowsUsed * sz;

  const cells: CellSlot[] = [];
  const modules: ModuleBox[] = [];
  const groupSums: [number, number, number, number][] = Array.from({ length: pack.series }, () => [0, 0, 0, 0]);
  let groupBase = 0;
  for (let m = 0; m < pack.modules; m++) {
    const x0 = -blockX / 2 + m * (moduleX + MODULE_GAP);
    const groups = pack.groupsPerModule[m];
    for (let i = 0; i < groups * pack.parallel; i++) {
      // Fill column by column; within a column, row by row, then layer by layer.
      const col = Math.floor(i / (rowsUsed * layersUsed));
      const within = i % (rowsUsed * layersUsed);
      const layer = Math.floor(within / rowsUsed);
      const row = within % rowsUsed;
      const position: [number, number, number] = [
        round(x0 + (col + 0.5) * sx, 4),
        round(-blockY / 2 + (layer + 0.5) * sy, 4),
        round(-blockZ / 2 + (row + 0.5) * sz, 4),
      ];
      const group = groupBase + Math.floor(i / pack.parallel);
      cells.push({ position, group, module: m });
      const sum = groupSums[group];
      sum[0] += position[0];
      sum[1] += position[1];
      sum[2] += position[2];
      sum[3] += 1;
    }
    modules.push({
      module: m,
      center: [round(x0 + moduleX / 2, 4), 0, 0],
      size: [round(moduleX + 0.06, 4), round(blockY + 0.06, 4), round(blockZ + 0.06, 4)],
      groups: [groupBase, groupBase + groups - 1],
    });
    groupBase += groups;
  }

  return {
    cells,
    modules,
    enclosure: [round(Math.min(envX, blockX + MARGIN[0]), 4), round(Math.min(envY, blockY + MARGIN[1]), 4), round(Math.min(envZ, blockZ + MARGIN[2]), 4)],
    cellBody: model.body.map((d) => round(d * scale, 4)) as [number, number, number],
    scaled: scale < 1,
    groupCenters: groupSums.map(([x, y, z, n]) => (n ? [round(x / n, 4), round(y / n, 4), round(z / n, 4)] : [0, 0, 0])),
    split,
  };
}
