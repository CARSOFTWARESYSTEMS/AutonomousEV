"use client";
import dynamic from "next/dynamic";
import styles from "../cubetwin.module.css";
const OrbitVisual = dynamic(() => import("./OrbitVisual"), {
  ssr: false,
  loading: () => (
    <div className={styles.scenePlaceholder}>
      <div />
      Preparing orbital view…
    </div>
  ),
});
export default function HeroScene() {
  return <OrbitVisual />;
}
