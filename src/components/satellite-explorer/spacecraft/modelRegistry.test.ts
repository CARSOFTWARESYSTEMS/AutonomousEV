import { describe, expect, it } from "vitest";
import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from "three";
import { bindModel, componentIdOf, partMeshes, partRoot, registerPart, registeredParts, unregisterPart } from "./modelRegistry";

const mesh = (name: string) => {
  const m = new Mesh(new BoxGeometry(1, 1, 1), new MeshStandardMaterial());
  m.name = name;
  return m;
};

describe("model registry (semantic id ↔ scene object)", () => {
  it("registers and removes a part's meshes under its semantic id", () => {
    const root = new Group();
    const cell = mesh("cell");
    root.add(cell);
    registerPart("battery", root, [cell]);
    expect(partRoot("battery")).toBe(root);
    expect(partMeshes("battery")).toEqual([cell]);
    expect(registeredParts()).toContain("battery");

    // A stale unmount must not remove a newer registration.
    unregisterPart("battery", new Group());
    expect(partRoot("battery")).toBe(root);
    unregisterPart("battery", root);
    expect(partRoot("battery")).toBeNull();
    expect(partMeshes("battery")).toEqual([]);
  });

  it("binds the nodes of an authored model by name, so a GLB can replace the procedural spacecraft", () => {
    // Stand-in for a loaded glTF scene with arbitrary node names.
    const model = new Group();
    const pack = new Group();
    pack.name = "BatteryPack_LOD0";
    pack.add(mesh("BatteryPack_cells"), mesh("BatteryPack_case"));
    const wheelHousing = mesh("RW_X_housing");
    const wheelRotor = mesh("RW_X_rotor");
    model.add(pack, wheelHousing, wheelRotor);

    const missing = bindModel(model, {
      battery: "BatteryPack_LOD0",
      "reaction-wheel-x": ["RW_X_housing", "RW_X_rotor"],
      obc: "FlightComputer",
    });

    // A node the asset does not contain is reported rather than ignored.
    expect(missing).toEqual(["obc"]);
    expect(partMeshes("battery")).toHaveLength(2);
    expect(partMeshes("reaction-wheel-x")).toEqual([wheelHousing, wheelRotor]);

    // Picking resolves any mesh back to its semantic id through the hierarchy.
    expect(componentIdOf(pack.children[0])).toBe("battery");
    expect(componentIdOf(wheelRotor)).toBe("reaction-wheel-x");
    expect(componentIdOf(model)).toBeNull();

    unregisterPart("battery", pack);
    unregisterPart("reaction-wheel-x", wheelHousing);
  });
});
