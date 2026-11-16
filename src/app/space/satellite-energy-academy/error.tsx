"use client";
import styles from "./academy.module.css";
import theme from "../spaceTheme.module.css";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className={`${theme.theme} ${styles.page}`} style={{ padding: "120px 24px" }}><h1>The academy couldn’t load.</h1><p>Your saved achievements are kept in this browser. Try loading the lesson again.</p><button onClick={reset} className={styles.primaryButton}>Try again</button> <a href="/space">Return to Space</a></main>;
}
