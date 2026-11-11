"use client";
// Short spoken explanations through the device's own text-to-speech (the Web
// Speech API). Nothing is downloaded or sent anywhere, it never starts on its
// own unless the learner turned on "Read each step aloud", and it stops when
// the step changes or the lab closes. Where a browser has no speech, the
// Listen button is simply not shown; the same words are always on screen.
import { useEffect, useRef, useSyncExternalStore } from "react";
import { Square, Volume2 } from "lucide-react";
import { academyEvent } from "../analytics";
import styles from "./lab.module.css";

const supported = () => typeof window !== "undefined" && "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";

let speakingId: string | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function stopSpeaking() {
  if (!supported()) return;
  window.speechSynthesis.cancel();
  speakingId = null;
  notify();
}

export function speak(id: string, text: string) {
  if (!supported() || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-IN";
  utterance.rate = 0.98;
  utterance.onend = utterance.onerror = () => {
    if (speakingId === id) {
      speakingId = null;
      notify();
    }
  };
  speakingId = id;
  notify();
  window.speechSynthesis.speak(utterance);
}

export function useSpeechSupported(): boolean {
  return useSyncExternalStore(
    () => () => {},
    supported,
    () => false,
  );
}

function useSpeakingId(): string | null {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => speakingId,
    () => null,
  );
}

/** A Listen / Stop toggle for one short explanation. */
export function ListenButton({ id, text, label = "Listen" }: { id: string; text: string; label?: string }) {
  const isSupported = useSpeechSupported();
  const current = useSpeakingId();
  const playing = current === id;
  if (!isSupported) return null;
  return (
    <button type="button" className={styles.listen} aria-pressed={playing} onClick={() => {
        if (playing) stopSpeaking();
        else {
          speak(id, text);
          academyEvent("lesson_listen", { item: id.split(":").slice(0, 2).join(":") });
        }
      }}>
      {playing ? <Square size={14} aria-hidden /> : <Volume2 size={16} aria-hidden />}
      <span>{playing ? "Stop" : label}</span>
    </button>
  );
}

/** Reads `text` aloud when `key` changes, if the learner asked for narration; always stops on unmount. */
export function useAutoNarration(key: string, text: string, enabled: boolean) {
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (!enabled || last.current === key) return;
    last.current = key;
    speak(key, text);
  }, [enabled, key, text]);
  useEffect(() => () => stopSpeaking(), []);
}
