// Whether the client has taken over from the server HTML. The route is
// prerendered once for every query string, so the server cannot know which
// environment a link asks for (`?env=`): anything environment-specific is held
// back until this is true, and the existing "Preparing the 3D laboratory"
// state stands in for it. No three.js here.
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** False in the server HTML and during hydration; true from the first client render after it. */
export const useHydrated = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
