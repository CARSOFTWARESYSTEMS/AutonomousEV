"use client";
// If WebGL fails to start or loses its context, the 2D schematic takes the
// canvas's place instead of leaving a blank box.
import { Component, type ReactNode } from "react";

interface Props {
  fallback: ReactNode;
  onError?: () => void;
  children: ReactNode;
}

export default class SceneBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError?.();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
