"use client";
// A label tied to its control by id, so the control's accessible name is the
// label alone (a wrapping <label> would also absorb the selected option text).
import { useId, type ReactNode } from "react";

export function Field({ label, className, children }: { label: ReactNode; className?: string; children: (id: string) => ReactNode }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id}>{label}</label>
      {children(id)}
    </div>
  );
}
