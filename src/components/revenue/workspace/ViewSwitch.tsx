"use client";
// The open view. Today ships with the page; every other view is its own
// chunk, loaded when first opened. `next/dynamic` code-splits only when called
// from a Client Component, hence this file.
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { ViewId } from "../types";
import css from "../workspace.module.css";
import TodayView from "../views/TodayView";

const loading = () => (
  <p className={css.loading} role="status">
    Loading…
  </p>
);

const lazy = (load: () => Promise<{ default: ComponentType }>) => dynamic(load, { loading });

const VIEWS: Record<ViewId, ComponentType> = {
  today: TodayView,
  journey: lazy(() => import("../views/JourneyView")),
  cockpit: lazy(() => import("../views/CockpitView")),
  market: lazy(() => import("../views/MarketView")),
  icp: lazy(() => import("../views/IcpView")),
  pains: lazy(() => import("../views/PainsView")),
  accounts: lazy(() => import("../views/AccountsView")),
  questions: lazy(() => import("../views/QuestionsView")),
  meetings: lazy(() => import("../views/MeetingsView")),
  pipeline: lazy(() => import("../views/PipelineView")),
  pilot: lazy(() => import("../views/PilotView")),
  "learn-marketing": lazy(() => import("../views/LearnView").then((m) => ({ default: m.LearnMarketing }))),
  "learn-sales": lazy(() => import("../views/LearnView").then((m) => ({ default: m.LearnSales }))),
  "learn-revenue": lazy(() => import("../views/LearnView").then((m) => ({ default: m.LearnRevenue }))),
  product: lazy(() => import("../views/ProductView")),
  evidence: lazy(() => import("../views/EvidenceView")),
  roi: lazy(() => import("../views/RoiView")),
  feedback: lazy(() => import("../views/FeedbackView")),
  review: lazy(() => import("../views/ReviewView")),
  decisions: lazy(() => import("../views/DecisionsView")),
  challenges: lazy(() => import("../views/ChallengesView")),
  boardroom: lazy(() => import("../views/BoardroomView")),
  internship: lazy(() => import("../views/InternshipView")),
};

export default function ViewSwitch({ view }: { view: ViewId }) {
  const View = VIEWS[view];
  return <View />;
}
