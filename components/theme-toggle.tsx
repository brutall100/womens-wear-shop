"use client";

import { useEffect, useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "./icons";

const KEY = "mot-theme";
const EVENT = "mot-theme";

function readTheme(): "light" | "dark" {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}

function applyTheme(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme;
  window.dispatchEvent(new Event(EVENT));
}

/** Light / dark switch. The choice is remembered; `public/js/theme-init.js` applies it before the first paint. */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "light" as const);

  useEffect(() => {
    const system = window.matchMedia("(prefers-color-scheme: dark)");
    const follow = () => {
      let saved: string | null = null;
      try {
        saved = window.localStorage.getItem(KEY);
      } catch {
        saved = null;
      }
      if (!saved) applyTheme(system.matches ? "dark" : "light");
    };
    system.addEventListener("change", follow);
    return () => system.removeEventListener("change", follow);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      // The switch still works for this visit.
    }
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doc = document as Document & { startViewTransition?: (update: () => void) => unknown };
    if (!calm && doc.startViewTransition) doc.startViewTransition(() => applyTheme(next));
    else applyTheme(next);
  };

  const label = theme === "dark" ? "Įjungti šviesų režimą" : "Įjungti tamsų režimą";
  return (
    <button type="button" className="btn btn-ghost btn-icon" onClick={toggle} aria-label={label} title={label}>
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
