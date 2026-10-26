"use client";
// The workspace's saved progress, kept in this browser only. The store starts
// from its defaults on the server and on first render, and reads localStorage
// after mount (see useHydrateRevenue), so server and client HTML match.
import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { GATES, type GateId } from "../data/framework";
import { clampDay } from "../logic/missions";
import { pilotCanPass } from "../logic/pilot";
import type { EvidenceLevel } from "../types";
import { INITIAL_STATE, type Account, type Decision, type Feedback, type Meeting, type Opportunity, type PainState, type Pilot, type Reflection, type RevenueState } from "./model";

export const STORAGE_KEY = "ev-revenue-engineering-v1";

interface Actions {
  setDay: (day: number) => void;
  completeDay: (day: number, done: boolean) => void;
  toggleCheck: (key: string) => void;
  setReflection: (day: number, patch: Partial<Reflection>) => void;
  setPain: (id: string, patch: Partial<PainState>) => void;
  toggleQuestion: (id: string) => void;
  clearQuestions: () => void;
  saveAccount: (account: Account) => void;
  removeAccount: (id: string) => void;
  saveOpportunity: (opportunity: Opportunity) => void;
  removeOpportunity: (id: string) => void;
  saveMeeting: (meeting: Meeting) => void;
  removeMeeting: (id: string) => void;
  setPilot: (patch: Partial<Pilot>) => void;
  addDecision: (decision: Decision) => void;
  removeDecision: (id: string) => void;
  addFeedback: (feedback: Feedback) => void;
  removeFeedback: (id: string) => void;
  setGate: (id: GateId, done: boolean) => void;
  setProfessional: (done: boolean) => void;
  setChallenge: (week: number, done: boolean) => void;
  setReview: (week: number, question: number, answer: string) => void;
  setBoardroom: (item: number, level: EvidenceLevel | null) => void;
  setWeight: (id: string, weight: number) => void;
  resetWeights: () => void;
  setShowSynthetic: (show: boolean) => void;
  resetAll: () => void;
}

export type RevenueStore = RevenueState & Actions;

const EMPTY_REFLECTION: Reflection = { before: "", evidence: "", change: "", tomorrow: "" };

const upsert = <T extends { id: string }>(list: readonly T[], item: T) =>
  list.some((existing) => existing.id === item.id) ? list.map((existing) => (existing.id === item.id ? item : existing)) : [...list, item];

/** Gate G needs every gate it requires, and the Professional Behaviour module. */
export const gateUnlocked = (state: Pick<RevenueState, "gates" | "professional">, id: GateId) => {
  const gate = GATES.find((candidate) => candidate.id === id);
  if (!gate?.requires) return true;
  return state.professional && gate.requires.every((required) => state.gates[required]);
};

/** Ensures the browser's storage can't throw on read or write (private mode, blocked storage). */
const safeStorage = createJSONStorage<Partial<RevenueState>>(() => ({
  getItem: (name) => {
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(name, value);
    } catch {
      /* Storage full or blocked: progress lasts for this visit only. */
    }
  },
  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
}));

export const useRevenue = create<RevenueStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setDay: (day) => set({ day: clampDay(day) }),
      completeDay: (day, done) =>
        set((state) => {
          const completed = { ...state.completed };
          if (done) completed[day] = new Date().toISOString().slice(0, 10);
          else delete completed[day];
          return { completed };
        }),
      toggleCheck: (key) => set((state) => ({ checks: { ...state.checks, [key]: !state.checks[key] } })),
      setReflection: (day, patch) =>
        set((state) => ({
          reflections: { ...state.reflections, [day]: { ...EMPTY_REFLECTION, ...(state.reflections[day] as Partial<Reflection> | undefined), ...patch } },
        })),
      setPain: (id, patch) =>
        set((state) => ({ pains: { ...state.pains, [id]: { level: "assumption", count: 0, ...(state.pains[id] as Partial<PainState> | undefined), ...patch } } })),
      toggleQuestion: (id) =>
        set((state) => ({ questionSet: state.questionSet.includes(id) ? state.questionSet.filter((q) => q !== id) : [...state.questionSet, id] })),
      clearQuestions: () => set({ questionSet: [] }),
      saveAccount: (account) => set((state) => ({ accounts: upsert(state.accounts, { ...account, synthetic: false }) })),
      removeAccount: (id) => set((state) => ({ accounts: state.accounts.filter((account) => account.id !== id) })),
      saveOpportunity: (opportunity) => set((state) => ({ opportunities: upsert(state.opportunities, { ...opportunity, synthetic: false }) })),
      removeOpportunity: (id) => set((state) => ({ opportunities: state.opportunities.filter((opportunity) => opportunity.id !== id) })),
      saveMeeting: (meeting) => set((state) => ({ meetings: upsert(state.meetings, meeting) })),
      removeMeeting: (id) => set((state) => ({ meetings: state.meetings.filter((meeting) => meeting.id !== id) })),
      setPilot: (patch) =>
        set((state) => {
          const pilot = { ...state.pilot, ...patch };
          // Success has to be defined before it can be claimed.
          if (pilot.status === "passed" && !pilotCanPass(pilot)) pilot.status = state.pilot.status === "passed" ? "evidence-review" : state.pilot.status;
          return { pilot };
        }),
      addDecision: (decision) => set((state) => ({ decisions: [decision, ...state.decisions] })),
      removeDecision: (id) => set((state) => ({ decisions: state.decisions.filter((decision) => decision.id !== id) })),
      addFeedback: (feedback) => set((state) => ({ feedback: [feedback, ...state.feedback] })),
      removeFeedback: (id) => set((state) => ({ feedback: state.feedback.filter((item) => item.id !== id) })),
      setGate: (id, done) => {
        if (done && !gateUnlocked(get(), id)) return;
        set((state) => ({ gates: { ...state.gates, [id]: done } }));
      },
      setProfessional: (professional) => set({ professional }),
      setChallenge: (week, done) => set((state) => ({ challenges: { ...state.challenges, [week]: done } })),
      setReview: (week, question, answer) =>
        set((state) => ({ reviews: { ...state.reviews, [week]: { ...state.reviews[week], [question]: answer } } })),
      setBoardroom: (item, level) =>
        set((state) => {
          const boardroom = { ...state.boardroom };
          if (level) boardroom[item] = level;
          else delete boardroom[item];
          return { boardroom };
        }),
      setWeight: (id, weight) => set((state) => ({ weights: { ...state.weights, [id]: Math.max(0, Math.min(100, Math.round(weight) || 0)) } })),
      resetWeights: () => set({ weights: {} }),
      setShowSynthetic: (showSynthetic) => set({ showSynthetic }),
      resetAll: () => set({ ...INITIAL_STATE }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: safeStorage,
      skipHydration: true,
      partialize: (state) => {
        // Save data, not functions.
        const data: Partial<RevenueState> = {};
        for (const key of Object.keys(INITIAL_STATE) as (keyof RevenueState)[]) (data as Record<string, unknown>)[key] = state[key];
        return data;
      },
      merge: (persisted, current) => ({ ...current, ...(persisted as Partial<RevenueState>), day: clampDay((persisted as Partial<RevenueState>)?.day ?? current.day) }),
    },
  ),
);

/** Reads saved progress once, after mount. Returns true once it has been read. */
export function useHydrateRevenue(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    let active = true;
    const unsubscribe = useRevenue.persist.onFinishHydration(() => {
      if (active) setHydrated(true);
    });
    void useRevenue.persist.rehydrate();
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);
  return hydrated;
}
