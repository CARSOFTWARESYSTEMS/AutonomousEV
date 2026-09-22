"use client";

import { runSimulation } from "@/lib/evAutoRickshaw/engine";
import { useMemo } from "react";
import styles from "../page.module.css";
import { Badge } from "./Badge";
import { formatHours, formatInrLakh, formatKg, formatKm } from "./format";
import type { EvSimulator } from "./useSimulator";

export function PowertrainSection({ sim }: { sim: EvSimulator }) {
  const { outputs, updateOverride } = sim;
  const { powertrain } = outputs;

  return (
    <>
      <div className={styles.tagRow}>
        <Badge kind="simulated" />
      </div>
      <div className={styles.resultGrid} style={{ marginBottom: "1.5rem" }}>
        <Stat label="Continuous Power" value={`${powertrain.continuousPowerKw.toFixed(1)} kW`} />
        <Stat label="Peak Power" value={`${powertrain.peakPowerKw.toFixed(1)} kW`} />
        <Stat label="Max Gradeability (indicative)" value={`${powertrain.maxGradeAbilityPct.toFixed(1)}%`} />
        <Stat label="Peak Battery Current (indicative)" value={`${powertrain.peakBatteryCurrentA.toFixed(0)} A`} />
      </div>

      <div className={styles.field} style={{ maxWidth: 480, marginBottom: "1.5rem" }}>
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>Peak Motor Power</span>
          <span className={styles.fieldValue}>{powertrain.peakPowerKw.toFixed(1)} kW</span>
        </div>
        <input
          className={styles.slider}
          type="range"
          aria-label="Peak Motor Power"
          min={8}
          max={18}
          step={0.5}
          value={powertrain.peakPowerKw}
          onChange={(e) => updateOverride("peakPowerKw", Number(e.target.value))}
        />
      </div>

      {powertrain.warning ? (
        <div className={styles.warningCardCaution} style={{ marginBottom: "1.5rem", maxWidth: 640 }}>
          <div>
            <div className={styles.warningTitle}>
              {powertrain.warning.startsWith("Cost optimization") ? "Cost Optimization Opportunity" : "Powertrain Review"}
            </div>
            <div className={styles.warningMessage}>{powertrain.warning}</div>
          </div>
        </div>
      ) : null}

      <p className={styles.bodyText}>
        PMSM/IPM is the recommended baseline motor type. Peak power is sized from two conditions: sustaining the
        maximum speed requirement on flat ground with a margin, and climbing the terrain-based gradeability target
        at full load. This is a concept-level sizing model — final motor selection requires dynamometer validation.
      </p>

      <MotorTradeoff sim={sim} />
      <BatteryTradeoff sim={sim} />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.resultStat}>
      <span className={styles.resultStatLabel}>{label}</span>
      <span className={styles.resultStatValue}>{value}</span>
    </div>
  );
}

function BatteryTradeoff({ sim }: { sim: EvSimulator }) {
  const { requirement, overrides, assumptions } = sim;
  const smallKWh = 11;
  const largeKWh = 16;

  const { small, large } = useMemo(() => {
    const small = runSimulation(requirement, { ...overrides, batteryCapacityKWh: smallKWh }, assumptions);
    const large = runSimulation(requirement, { ...overrides, batteryCapacityKWh: largeKWh }, assumptions);
    return { small, large };
  }, [requirement, overrides, assumptions]);

  return (
    <div className={styles.card} style={{ marginTop: "2rem" }}>
      <div className={styles.cardTitle}>What Changes When I Change the Battery?</div>
      <div className={styles.tradeoffGrid}>
        <div className={styles.tradeoffCol}>
          <div className={styles.tradeoffVs}>{smallKWh} kWh</div>
          <Row label="Range" value={formatKm(small.range.typicalKm)} />
          <Row label="Battery Mass" value={formatKg(small.battery.massKg)} />
          <Row label="Selling Price" value={formatInrLakh(small.cost.sellingPriceInr)} />
          <Row label="Charge Time" value={formatHours(small.charging.hoursToTarget)} />
        </div>
        <div className={styles.tradeoffVs}>vs</div>
        <div className={styles.tradeoffCol}>
          <div className={styles.tradeoffVs}>{largeKWh} kWh</div>
          <Row label="Range" value={formatKm(large.range.typicalKm)} up />
          <Row label="Battery Mass" value={formatKg(large.battery.massKg)} up />
          <Row label="Selling Price" value={formatInrLakh(large.cost.sellingPriceInr)} up />
          <Row label="Charge Time" value={formatHours(large.charging.hoursToTarget)} up />
        </div>
      </div>
      <p className={styles.fieldHint} style={{ marginTop: "1rem" }}>
        Range, mass, price and charging time all rise together with capacity. Payload margin may fall as pack mass
        grows. Does your duty cycle actually require the additional battery?
      </p>
    </div>
  );
}

function MotorTradeoff({ sim }: { sim: EvSimulator }) {
  const { requirement, overrides, assumptions } = sim;
  const smallKw = 9;
  const largeKw = 16;

  const { small, large } = useMemo(() => {
    const small = runSimulation(requirement, { ...overrides, peakPowerKw: smallKw }, assumptions);
    const large = runSimulation(requirement, { ...overrides, peakPowerKw: largeKw }, assumptions);
    return { small, large };
  }, [requirement, overrides, assumptions]);

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>What Changes When I Increase Motor Power?</div>
      <div className={styles.tradeoffGrid}>
        <div className={styles.tradeoffCol}>
          <div className={styles.tradeoffVs}>{smallKw} kW peak</div>
          <Row label="Max Gradeability" value={`${small.powertrain.maxGradeAbilityPct.toFixed(1)}%`} />
          <Row label="Peak Battery Current" value={`${small.powertrain.peakBatteryCurrentA.toFixed(0)} A`} />
          <Row label="Selling Price" value={formatInrLakh(small.cost.sellingPriceInr)} />
        </div>
        <div className={styles.tradeoffVs}>vs</div>
        <div className={styles.tradeoffCol}>
          <div className={styles.tradeoffVs}>{largeKw} kW peak</div>
          <Row label="Max Gradeability" value={`${large.powertrain.maxGradeAbilityPct.toFixed(1)}%`} up />
          <Row label="Peak Battery Current" value={`${large.powertrain.peakBatteryCurrentA.toFixed(0)} A`} up />
          <Row label="Selling Price" value={formatInrLakh(large.cost.sellingPriceInr)} up />
        </div>
      </div>
      <p className={styles.fieldHint} style={{ marginTop: "1rem" }}>
        A larger motor improves hill performance and acceleration headroom but raises peak battery current
        (heavier busbars/contactors), controller current rating, and cost.
      </p>
    </div>
  );
}

function Row({ label, value, up }: { label: string; value: string; up?: boolean }) {
  return (
    <div className={styles.tradeoffRow}>
      <span>{label}</span>
      <span className={up ? styles.tradeoffArrowUp : undefined}>
        {value}
        {up ? " ↑" : ""}
      </span>
    </div>
  );
}
