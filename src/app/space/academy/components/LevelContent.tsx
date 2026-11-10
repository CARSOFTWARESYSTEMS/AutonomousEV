"use client";
import type { ReactNode } from "react";
import { useLevel } from "@/components/space-academy/store";
import type { Level } from "../data/curriculum";

/**
 * Renders every level's content into the HTML (so all of it is crawlable and
 * readable without JavaScript) and hides the levels the learner did not pick.
 */
export default function LevelContent({ blocks }: { blocks: Record<Level, ReactNode> }) {
  const level = useLevel();
  return (
    <>
      {(Object.keys(blocks) as Level[]).map((l) => (
        <div key={l} hidden={l !== level} data-level={l}>
          {blocks[l]}
        </div>
      ))}
    </>
  );
}
