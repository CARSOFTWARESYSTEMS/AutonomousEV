import { Fragment } from "react";

/** Keeps unit symbols such as "kN" in their correct case inside upper-cased display text. */
export function UnitText({ children }: { children: string }) {
  const parts = children.split(/\b(kN)\b/);
  return (
    <>
      {parts.map((part, i) =>
        part === "kN" ? (
          <span key={i} style={{ textTransform: "none" }}>
            kN
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
