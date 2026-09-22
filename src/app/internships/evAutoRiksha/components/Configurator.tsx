"use client";

import { PRESETS } from "@/lib/evAutoRickshaw/defaults";
import type {
  ChargingAvailability,
  CustomerRequirement,
  PresetId,
  SoftwareTier,
  Terrain,
  Traffic,
} from "@/lib/evAutoRickshaw/types";
import { useState } from "react";
import styles from "../page.module.css";
import type { EvSimulator } from "./useSimulator";

function SliderField({
  label,
  value,
  min,
  max,
  step,
  unit,
  hint,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  hint?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className={styles.field}>
      <div className={styles.fieldRow}>
        <span className={styles.fieldLabel}>{label}</span>
        <span className={styles.fieldValue}>
          {value}
          {unit}
        </span>
      </div>
      <input
        className={styles.slider}
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hint ? <p className={styles.fieldHint}>{hint}</p> : null}
    </div>
  );
}

function SegmentedField<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <div className={styles.segmentGroup} role="group" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={opt.value === value ? styles.segmentChipActive : styles.segmentChip}
            aria-pressed={opt.value === value}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleField({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className={styles.field}>
      <div className={styles.toggleRow}>
        <div>
          <span className={styles.fieldLabel}>{label}</span>
          {hint ? <p className={styles.fieldHint}>{hint}</p> : null}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          className={checked ? styles.toggleOn : styles.toggle}
          onClick={() => onChange(!checked)}
        >
          <span className={styles.toggleKnob} />
        </button>
      </div>
    </div>
  );
}

const PASSENGER_OPTIONS = [
  { value: 3 as const, label: "D+3" },
  { value: 4 as const, label: "D+4" },
  { value: 5 as const, label: "D+5" },
  { value: 6 as const, label: "D+6" },
];

const TERRAIN_OPTIONS: { value: Terrain; label: string }[] = [
  { value: "flat", label: "Flat" },
  { value: "mixed", label: "Mixed" },
  { value: "hilly", label: "Hilly" },
];

const TRAFFIC_OPTIONS: { value: Traffic; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "medium", label: "Medium" },
  { value: "heavy", label: "Heavy" },
];

const SPEED_OPTIONS = [40, 45, 50, 55, 60].map((v) => ({ value: v, label: `${v}` }));

const CHARGING_OPTIONS: { value: ChargingAvailability; label: string }[] = [
  { value: "overnight", label: "Overnight only" },
  { value: "overnight-opportunity", label: "Overnight + opportunity" },
  { value: "fleet-depot", label: "Fleet depot" },
  { value: "battery-swap", label: "Battery swapping" },
];

const SOFTWARE_OPTIONS: { value: SoftwareTier; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "connected", label: "Connected" },
  { value: "fleet", label: "Fleet" },
  { value: "intelligence", label: "Intelligence" },
];

export function Presets({ sim }: { sim: EvSimulator }) {
  return (
    <div className={styles.presetGrid}>
      {PRESETS.map((p) => (
        <button
          key={p.id}
          type="button"
          className={sim.preset === p.id ? styles.presetCardActive : styles.presetCard}
          onClick={() => sim.applyPreset(p.id as PresetId)}
        >
          <div className={styles.presetTitle}>{p.label}</div>
          <div className={styles.presetDesc}>{p.description}</div>
        </button>
      ))}
    </div>
  );
}

export function RequirementInputs({ sim }: { sim: EvSimulator }) {
  const { requirement, updateRequirement } = sim;

  return (
    <div className={styles.configuratorPanel}>
      <SegmentedField
        label="Passenger Capacity"
        options={PASSENGER_OPTIONS}
        value={requirement.passengerCapacity}
        onChange={(v) => updateRequirement("passengerCapacity", v as CustomerRequirement["passengerCapacity"])}
      />

      <SliderField
        label="Average Passenger Weight"
        value={requirement.avgPassengerWeightKg}
        min={50}
        max={100}
        step={1}
        unit=" kg"
        hint={`${requirement.passengerCapacity} × ${requirement.avgPassengerWeightKg} kg = ${
          requirement.passengerCapacity * requirement.avgPassengerWeightKg
        } kg passenger payload`}
        onChange={(v) => updateRequirement("avgPassengerWeightKg", v)}
      />

      <SliderField
        label="Daily Driving Distance"
        value={requirement.dailyDistanceKm}
        min={40}
        max={250}
        step={5}
        unit=" km/day"
        onChange={(v) => updateRequirement("dailyDistanceKm", v)}
      />

      <SegmentedField
        label="Terrain"
        options={TERRAIN_OPTIONS}
        value={requirement.terrain}
        onChange={(v) => updateRequirement("terrain", v)}
      />

      <SegmentedField
        label="Traffic"
        options={TRAFFIC_OPTIONS}
        value={requirement.traffic}
        onChange={(v) => updateRequirement("traffic", v)}
      />

      <SegmentedField
        label="Maximum Speed Requirement (km/h)"
        options={SPEED_OPTIONS}
        value={requirement.maxSpeedKmh}
        onChange={(v) => updateRequirement("maxSpeedKmh", v)}
      />

      <ToggleField
        label="Air Conditioning"
        hint="Increases auxiliary energy consumption and vehicle price."
        checked={requirement.acEnabled}
        onChange={(v) => updateRequirement("acEnabled", v)}
      />

      <SliderField
        label="Additional Luggage"
        value={requirement.luggageKg}
        min={0}
        max={100}
        step={5}
        unit=" kg"
        onChange={(v) => updateRequirement("luggageKg", v)}
      />

      <SegmentedField
        label="Daily Charging Availability"
        options={CHARGING_OPTIONS}
        value={requirement.chargingAvailability}
        onChange={(v) => updateRequirement("chargingAvailability", v)}
      />

      <SegmentedField
        label="Software Tier"
        options={SOFTWARE_OPTIONS}
        value={requirement.softwareTier}
        onChange={(v) => updateRequirement("softwareTier", v)}
      />

      <SliderField
        label="Target Purchase Price"
        value={requirement.targetPriceInr}
        min={300000}
        max={600000}
        step={5000}
        unit=""
        hint={`₹${(requirement.targetPriceInr / 100000).toFixed(2)} lakh`}
        onChange={(v) => updateRequirement("targetPriceInr", v)}
      />
    </div>
  );
}

const ENGINEERING_GROUPS = ["vehicle", "battery", "powertrain", "charging", "economics"] as const;
type EngGroup = (typeof ENGINEERING_GROUPS)[number];

const GROUP_LABELS: Record<EngGroup, string> = {
  vehicle: "Vehicle",
  battery: "Battery",
  powertrain: "Powertrain",
  charging: "Charging",
  economics: "Economics",
};

export function EngineeringControls({ sim }: { sim: EvSimulator }) {
  const [openGroup, setOpenGroup] = useState<EngGroup | null>("battery");
  const { overrides, updateOverride, resetToRecommended } = sim;

  return (
    <div className={styles.configuratorPanel}>
      <div className={styles.utilityRow}>
        <button type="button" className={styles.linkButton} onClick={resetToRecommended}>
          Reset to Recommended
        </button>
      </div>

      {ENGINEERING_GROUPS.map((group) => {
        const isOpen = openGroup === group;
        return (
          <div className={styles.engGroup} key={group}>
            <button
              type="button"
              className={styles.engGroupSummary}
              onClick={() => setOpenGroup(isOpen ? null : group)}
              aria-expanded={isOpen}
            >
              <span>{GROUP_LABELS[group]}</span>
              <span className={styles.accordionChevron}>{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen ? (
              <div className={styles.engGroupBody}>
                {group === "vehicle" ? (
                  <>
                    <SliderField
                      label="Glider Mass (ex-battery)"
                      value={Math.round(overrides.gliderMassKg ?? 0) || 400}
                      min={320}
                      max={520}
                      step={5}
                      unit=" kg"
                      hint="Chassis, body, suspension, brakes, wheels, motor and electronics excluding the battery pack."
                      onChange={(v) => updateOverride("gliderMassKg", v)}
                    />
                    <SliderField
                      label="Frontal Area"
                      value={overrides.frontalAreaM2 ?? 1.9}
                      min={1.5}
                      max={2.4}
                      step={0.05}
                      unit=" m²"
                      onChange={(v) => updateOverride("frontalAreaM2", v)}
                    />
                    <SliderField
                      label="Drag Coefficient (Cd)"
                      value={overrides.dragCoefficient ?? 0.9}
                      min={0.6}
                      max={1.1}
                      step={0.01}
                      unit=""
                      onChange={(v) => updateOverride("dragCoefficient", v)}
                    />
                    <SliderField
                      label="Rolling Resistance (Crr)"
                      value={overrides.rollingResistanceCoefficient ?? 0.012}
                      min={0.008}
                      max={0.02}
                      step={0.001}
                      unit=""
                      onChange={(v) => updateOverride("rollingResistanceCoefficient", v)}
                    />
                    <SliderField
                      label="Auxiliary Load"
                      value={overrides.auxiliaryLoadW ?? 150}
                      min={80}
                      max={300}
                      step={10}
                      unit=" W"
                      onChange={(v) => updateOverride("auxiliaryLoadW", v)}
                    />
                  </>
                ) : null}

                {group === "battery" ? (
                  <>
                    <SliderField
                      label="Battery Capacity Override"
                      value={overrides.batteryCapacityKWh ?? 0}
                      min={0}
                      max={16}
                      step={0.5}
                      unit=" kWh"
                      hint="0 = let the simulator recommend a capacity from your duty cycle."
                      onChange={(v) => updateOverride("batteryCapacityKWh", v === 0 ? undefined : v)}
                    />
                    <SliderField
                      label="Usable SOC Window"
                      value={(overrides.usableSocWindow ?? 0.9) * 100}
                      min={70}
                      max={95}
                      step={1}
                      unit="%"
                      onChange={(v) => updateOverride("usableSocWindow", v / 100)}
                    />
                    <SliderField
                      label="Degradation Allowance"
                      value={(overrides.degradationAllowance ?? 0.08) * 100}
                      min={0}
                      max={20}
                      step={1}
                      unit="%"
                      onChange={(v) => updateOverride("degradationAllowance", v / 100)}
                    />
                    <SliderField
                      label="Pack Specific Energy"
                      value={overrides.packSpecificEnergyWhPerKg ?? 95}
                      min={70}
                      max={140}
                      step={5}
                      unit=" Wh/kg"
                      onChange={(v) => updateOverride("packSpecificEnergyWhPerKg", v)}
                    />
                    <SliderField
                      label="Battery Cost"
                      value={overrides.batteryCostPerKWhInr ?? 9000}
                      min={6000}
                      max={13000}
                      step={250}
                      unit=" ₹/kWh"
                      onChange={(v) => updateOverride("batteryCostPerKWhInr", v)}
                    />
                  </>
                ) : null}

                {group === "powertrain" ? (
                  <>
                    <SliderField
                      label="Peak Motor Power Override"
                      value={overrides.peakPowerKw ?? 0}
                      min={0}
                      max={18}
                      step={0.5}
                      unit=" kW"
                      hint="0 = let the simulator recommend peak power from load and terrain."
                      onChange={(v) => updateOverride("peakPowerKw", v === 0 ? undefined : v)}
                    />
                    <SliderField
                      label="Drivetrain Efficiency"
                      value={(overrides.drivetrainEfficiency ?? 0.9) * 100}
                      min={80}
                      max={97}
                      step={1}
                      unit="%"
                      onChange={(v) => updateOverride("drivetrainEfficiency", v / 100)}
                    />
                    <SliderField
                      label="Controller Efficiency"
                      value={(overrides.controllerEfficiency ?? 0.94) * 100}
                      min={85}
                      max={99}
                      step={1}
                      unit="%"
                      onChange={(v) => updateOverride("controllerEfficiency", v / 100)}
                    />
                  </>
                ) : null}

                {group === "charging" ? (
                  <>
                    <SliderField
                      label="Charger Power Override"
                      value={overrides.chargerPowerKw ?? 0}
                      min={0}
                      max={22}
                      step={0.1}
                      unit=" kW"
                      hint="0 = let the simulator recommend from charging availability. Above 6.6 kW is a research/future option only."
                      onChange={(v) => updateOverride("chargerPowerKw", v === 0 ? undefined : v)}
                    />
                    <SliderField
                      label="Charger Efficiency"
                      value={(overrides.chargerEfficiency ?? 0.9) * 100}
                      min={80}
                      max={97}
                      step={1}
                      unit="%"
                      onChange={(v) => updateOverride("chargerEfficiency", v / 100)}
                    />
                    <SliderField
                      label="Start SOC"
                      value={overrides.startSocPct ?? 10}
                      min={0}
                      max={90}
                      step={5}
                      unit="%"
                      onChange={(v) => updateOverride("startSocPct", v)}
                    />
                    <SliderField
                      label="Target SOC"
                      value={overrides.targetSocPct ?? 100}
                      min={20}
                      max={100}
                      step={5}
                      unit="%"
                      onChange={(v) => updateOverride("targetSocPct", v)}
                    />
                  </>
                ) : null}

                {group === "economics" ? (
                  <>
                    <SliderField
                      label="Motor + Controller Cost"
                      value={overrides.motorControllerCostPerKwInr ?? 1500}
                      min={900}
                      max={2500}
                      step={50}
                      unit=" ₹/kW"
                      onChange={(v) => updateOverride("motorControllerCostPerKwInr", v)}
                    />
                    <SliderField
                      label="Assembly + Overhead"
                      value={overrides.assemblyOverheadPct ?? 6}
                      min={2}
                      max={15}
                      step={0.5}
                      unit="%"
                      onChange={(v) => updateOverride("assemblyOverheadPct", v)}
                    />
                    <SliderField
                      label="Logistics"
                      value={overrides.logisticsPct ?? 8}
                      min={2}
                      max={15}
                      step={0.5}
                      unit="%"
                      onChange={(v) => updateOverride("logisticsPct", v)}
                    />
                    <SliderField
                      label="Dealer + OEM Margin"
                      value={overrides.distributionMarginPct ?? 20}
                      min={8}
                      max={35}
                      step={1}
                      unit="%"
                      onChange={(v) => updateOverride("distributionMarginPct", v)}
                    />
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
