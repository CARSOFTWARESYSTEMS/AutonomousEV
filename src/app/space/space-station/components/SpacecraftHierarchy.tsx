"use client";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { HIERARCHY, VEHICLE_TYPES } from "../data/systems";
import styles from "../station.module.css";

const DETAIL: Record<string, string> = {
  "Space system": "Everything needed for a mission: launch, the spacecraft itself and the ground segment that commands it and receives its data.",
  "Launch segment": "Rockets and launch sites. A rocket's job ends minutes after lift-off.",
  Spacecraft: "Any vehicle built to operate in space. Every item below is a spacecraft.",
  "Ground segment": "Mission control, antennas, networks and data centres.",
  Satellite: "Orbits to do a job — communications, navigation or observation. Usually uncrewed.",
  "Crew vehicle": "Carries people to and from space, with abort and re-entry systems.",
  "Space station": "Stays in orbit for years for long-duration habitation, research and operations. A space station is itself a spacecraft.",
  Probe: "Travels beyond Earth orbit to study other worlds.",
  Lander: "Descends to the surface of another body.",
};

function TreeNode({ name, note, selected, onSelect }: { name: string; note?: string; selected: string; onSelect: (n: string) => void }) {
  return (
    <button type="button" className={styles.treeNode} aria-pressed={selected === name} onClick={() => onSelect(name)}>
      {name}
      {note && <small>· {note}</small>}
    </button>
  );
}

export default function SpacecraftHierarchy() {
  const [selected, setSelected] = useState("Space station");
  const node = (name: string, note?: string) => <TreeNode name={name} note={note} selected={selected} onSelect={setSelected} />;
  return (
    <div className={styles.split}>
      <div className={styles.card}>
        <h3>Interactive hierarchy</h3>
        <p>Select any level to see how it relates to the others.</p>
        <ul className={styles.tree} aria-label="Space system hierarchy">
          <li>
            {node(HIERARCHY.root)}
            <ul>
              {HIERARCHY.children.map((c) => (
                <li key={c.name}>
                  {node(c.name, c.note)}
                  {"children" in c && c.children && (
                    <ul>
                      {c.children.map((g) => (
                        <li key={g}>
                          {node(g)}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </li>
        </ul>
        <p className={styles.callout} aria-live="polite" style={{ marginTop: 16 }}>
          <ChevronRight size={14} aria-hidden="true" /> {selected}: {DETAIL[selected]}
        </p>
      </div>
      <dl className={styles.defList} aria-label="Vehicle types">
        {VEHICLE_TYPES.map((v) => (
          <div key={v.name}>
            <dt>{v.name}</dt>
            <dd>
              {v.definition}
              <small>Example: {v.example}</small>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
