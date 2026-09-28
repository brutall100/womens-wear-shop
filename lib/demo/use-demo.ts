import { useSyncExternalStore } from "react";
import { getState, seedState, subscribe, type DemoState } from "./store";

/** Current demo data. The static HTML is rendered with the seed, the browser then swaps in saved changes. */
export function useDemoState(): DemoState {
  return useSyncExternalStore(subscribe, getState, seedState);
}

const noop = () => () => {};

/** `true` only after the page runs in the browser, so storage-based UI does not flash during hydration. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
