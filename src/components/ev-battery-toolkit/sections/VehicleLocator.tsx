"use client";
// Vehicle Battery Locator: manufacturer → model → variant → model year → show
// the vehicle → locate the battery. No platform's battery location is verified
// yet, so the technician confirms the architecture they see on the vehicle
// (USER ENTERED) and the generic scooter shows where that architecture sits.
import dynamic from "next/dynamic";
import { useId, useMemo, useState } from "react";
import { Crosshair, Eye, Focus, RotateCcw, RotateCw, ScanLine, ZoomIn, ZoomOut } from "lucide-react";
import { ARCHITECTURES, ARCHITECTURE_ORDER } from "@/data/ev-battery-toolkit/architectures";
import { MANUFACTURERS, SPEC_FIELDS, VEHICLES, selectableYears, vehicleLabel } from "@/data/ev-battery-toolkit/vehicles";
import { trackToolkit } from "@/lib/ev-battery-toolkit/analytics";
import { formatSourced } from "@/lib/ev-battery-toolkit/provenance";
import type { ArchitectureId } from "@/lib/ev-battery-toolkit/types";
import SceneBoundary from "../scene/SceneBoundary";
import { useDevice, useReducedMotion } from "../state/device";
import { useToolkit } from "../state/store";
import { Pill, ProvenanceBadge } from "../ui/Badges";
import { ScooterSchematic } from "../ui/Schematics";
import { Field } from "../ui/Field";
import css from "../workspace.module.css";

const VehicleCanvas = dynamic(() => import("../scene/VehicleCanvas"), {
  ssr: false,
  loading: () => (
    <p className={css.loading} role="status">
      Loading the vehicle view…
    </p>
  ),
});

export default function VehicleLocator() {
  const device = useDevice();
  const reducedMotion = useReducedMotion();
  const descId = useId();
  const [manufacturer, setManufacturer] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [year, setYear] = useState("");
  const [shown, setShown] = useState(false);
  const [architecture, setArchitecture] = useState<ArchitectureId | "">("");
  const [located, setLocated] = useState(false);
  const [xray, setXray] = useState(false);
  const [isolate, setIsolate] = useState(false);
  const [lost, setLost] = useState(false);
  const sendCamera = useToolkit((s) => s.sendCamera);
  const years = useMemo(() => selectableYears(new Date()), []);

  const models = VEHICLES.filter((v) => v.manufacturer === manufacturer);
  const vehicle = VEHICLES.find((v) => v.id === vehicleId);
  const variant = vehicle?.variants.find((v) => v.id === variantId);
  const arch = architecture ? ARCHITECTURES[architecture] : null;
  const canShow = Boolean(vehicle && variant);
  const can3D = device === "desktop" && !lost;

  const reset = () => {
    setShown(false);
    setLocated(false);
    setXray(false);
    setIsolate(false);
  };

  return (
    <div className={css.locator}>
      <form
        className={css.locatorForm}
        onSubmit={(e) => {
          e.preventDefault();
          if (!vehicle) return;
          setShown(true);
          trackToolkit("vehicle_selected", { vehicle: vehicle.id });
        }}
        autoComplete="off"
      >
        <Field className={css.field} label="Manufacturer">
          {(id) => (
            <select id={id}
              value={manufacturer}
              onChange={(e) => {
                setManufacturer(e.target.value);
                setVehicleId("");
                setVariantId("");
                reset();
              }}
            >
              <option value="">Select manufacturer</option>
              {MANUFACTURERS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field className={css.field} label="Model">
          {(id) => (
            <select id={id}
              value={vehicleId}
              disabled={!manufacturer}
              onChange={(e) => {
                setVehicleId(e.target.value);
                setVariantId("");
                reset();
              }}
            >
              <option value="">Select model</option>
              {models.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.model}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field className={css.field} label="Variant">
          {(id) => (
            <select id={id} value={variantId} disabled={!vehicle} onChange={(e) => setVariantId(e.target.value)}>
              <option value="">Select variant</option>
              {vehicle?.variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field className={css.field} label="Model year">
          {(id) => (
            <select id={id} value={year} disabled={!variant} onChange={(e) => setYear(e.target.value)}>
              <option value="">As on vehicle documents</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}
        </Field>
        <button type="submit" className={css.primary} disabled={!canShow}>
          Show vehicle
        </button>
      </form>

      {shown && vehicle && variant ? (
        <div className={css.locatorBody}>
          <div className={css.locatorView}>
            <div className={css.locatorBar}>
              <Field className={css.fieldInline} label="Architecture seen on the vehicle">
                {(id) => (
                  <select id={id}
                    value={architecture}
                    onChange={(e) => {
                      const v = e.target.value as ArchitectureId | "";
                      setArchitecture(v);
                      setLocated(false);
                      if (v === "fixed-floor") trackToolkit("fixed_battery_selected");
                      if (v === "swappable") trackToolkit("swappable_battery_selected");
                    }}
                  >
                    <option value="">Not confirmed</option>
                    {ARCHITECTURE_ORDER.map((id) => (
                      <option key={id} value={id}>
                        {ARCHITECTURES[id].name}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <button
                type="button"
                className={css.primary}
                disabled={!architecture}
                onClick={() => {
                  setLocated(true);
                  sendCamera("focus-battery", "locator");
                }}
              >
                <Crosshair size={16} aria-hidden="true" /> LOCATE BATTERY
              </button>
            </div>
            <div className={css.viewportSmall}>
              {can3D ? (
                <SceneBoundary fallback={<ScooterSchematic architecture={architecture || null} located={located} title="Generic scooter schematic" />} onError={() => setLost(true)}>
                  <VehicleCanvas label={`Generic scooter for ${vehicleLabel(vehicle, variant)}`} describedBy={descId} architecture={architecture || null} located={located} xray={xray} isolate={isolate} reducedMotion={reducedMotion} onLost={() => setLost(true)} />
                </SceneBoundary>
              ) : (
                <ScooterSchematic architecture={architecture || null} located={located} title={`Generic scooter schematic for ${vehicleLabel(vehicle, variant)}`} />
              )}
              <p className={css.modelTag}>Generic procedural scooter — not OEM geometry</p>
            </div>
            <div className={css.controls} role="toolbar" aria-label="Vehicle view controls">
              <button type="button" className={css.tool} aria-label="Rotate left" disabled={!can3D} onClick={() => sendCamera("rotate-left", "locator")}>
                <RotateCcw size={16} aria-hidden="true" />
              </button>
              <button type="button" className={css.tool} aria-label="Rotate right" disabled={!can3D} onClick={() => sendCamera("rotate-right", "locator")}>
                <RotateCw size={16} aria-hidden="true" />
              </button>
              <button type="button" className={css.tool} aria-label="Zoom in" disabled={!can3D} onClick={() => sendCamera("zoom-in", "locator")}>
                <ZoomIn size={16} aria-hidden="true" />
              </button>
              <button type="button" className={css.tool} aria-label="Zoom out" disabled={!can3D} onClick={() => sendCamera("zoom-out", "locator")}>
                <ZoomOut size={16} aria-hidden="true" />
              </button>
              <button type="button" className={css.tool} aria-pressed={xray} onClick={() => setXray(!xray)}>
                <ScanLine size={16} aria-hidden="true" /> X-Ray
              </button>
              <button type="button" className={css.tool} aria-pressed={isolate} disabled={!architecture} onClick={() => setIsolate(!isolate)}>
                <Focus size={16} aria-hidden="true" /> Isolate Battery
              </button>
              <button
                type="button"
                className={css.tool}
                onClick={() => {
                  setXray(false);
                  setIsolate(false);
                  setLocated(false);
                  sendCamera("reset", "locator");
                }}
              >
                <Eye size={16} aria-hidden="true" /> Reset View
              </button>
            </div>
            <p id={descId} className={css.describe} aria-live="polite">
              {vehicleLabel(vehicle, variant)}
              {year ? ` (${year}, user entered)` : ""}.{" "}
              {arch ? (located ? `Battery located: ${arch.name}, ${arch.location === "floor" ? "in the floor" : arch.location === "under-seat" ? "in the seat bay" : "under the floor"} of the generic scooter.` : `${arch.name} selected. Press Locate Battery.`) : "Confirm the battery architecture you see on the vehicle to locate it."}
            </p>
          </div>

          <div className={css.specPanel}>
            <p className={css.panelEyebrow}>Battery data · {vehicle.family}</p>
            <dl className={css.specList}>
              <div>
                <dt>Battery Location</dt>
                <dd>
                  {arch ? `${arch.location === "floor" ? "Floor" : arch.location === "under-seat" ? "Seat bay" : "Under floor"} (confirmed on vehicle)` : formatSourced(variant.battery.batteryLocation)}{" "}
                  <ProvenanceBadge provenance={arch ? "USER_ENTERED" : "UNKNOWN"} />
                </dd>
              </div>
              <div>
                <dt>Architecture</dt>
                <dd>
                  {arch ? arch.name : formatSourced(variant.battery.batteryArchitecture)} <ProvenanceBadge provenance={arch ? "USER_ENTERED" : "UNKNOWN"} />
                </dd>
              </div>
              {SPEC_FIELDS.filter((f) => ["cellType", "capacityAh", "nominalVoltage", "chemistry"].includes(f.key)).map((f) => (
                <div key={f.key}>
                  <dt>{f.label}</dt>
                  <dd>
                    {formatSourced(variant.battery[f.key])} <ProvenanceBadge provenance={variant.battery[f.key].provenance} />
                  </dd>
                </div>
              ))}
              <div>
                <dt>Serviceability</dt>
                <dd>{arch ? arch.serviceability : "Technical specification not verified."}</dd>
              </div>
              <div>
                <dt>Removal Type</dt>
                <dd>{arch ? arch.removal[0].toUpperCase() + arch.removal.slice(1) + " (architecture concept)" : "Technical specification not verified."}</dd>
              </div>
              <div>
                <dt>Data Confidence</dt>
                <dd>
                  <Pill family="warning">{vehicle.confidence}</Pill> {vehicle.verificationStatus}
                </dd>
              </div>
            </dl>
            <p className={css.fine}>{vehicle.serviceNotes[0]}</p>
          </div>
        </div>
      ) : (
        <p className={css.muted}>Select a vehicle to begin. The list is an order of priority for this toolkit, not a ranking of battery reliability.</p>
      )}
    </div>
  );
}
