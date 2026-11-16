import styles from "./academy.module.css";
import theme from "../spaceTheme.module.css";
export default function Loading() {
  return <main className={`${theme.theme} ${styles.page}`} style={{ padding: "120px 24px" }}><p role="status">Preparing Satellite Energy Academy…</p></main>;
}
