"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import styles from "../cubetwin.module.css";
const Simulator = dynamic(() => import("./Simulator"), {
  loading: () => (
    <p className={styles.formNote} role="status">
      Preparing the energy simulator…
    </p>
  ),
});
export default function LazySimulator() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px" },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={styles.simulatorSlot}>
      {visible ? (
        <Simulator />
      ) : (
        <div className={styles.simulatorIntro}>
          <p>
            Configure orbit, solar power, battery energy and scheduled
            activities. Results are calculated locally with a deterministic
            model.
          </p>
          <button
            className={styles.primaryButton}
            onClick={() => setVisible(true)}
          >
            Open simulation controls
          </button>
        </div>
      )}
    </div>
  );
}
