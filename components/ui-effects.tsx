"use client";

import { useEffect } from "react";

/**
 * Small page-wide effects, set up once:
 * - a ripple where a `.btn` is pressed;
 * - `[data-reveal]` blocks slide in when they scroll into view.
 * Both switch off when the visitor prefers reduced motion.
 */
export function UiEffects() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const onPointerDown = (event: PointerEvent) => {
      if (reduce.matches || event.button !== 0) return;
      const button = (event.target as Element | null)?.closest<HTMLElement>(".btn");
      if (!button || button.matches(":disabled, [aria-disabled='true']")) return;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2.2;
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
      button.append(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    };
    document.addEventListener("pointerdown", onPointerDown);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const watch = () => {
      document.querySelectorAll("[data-reveal]:not(.is-visible)").forEach((element) => {
        if (reduce.matches) element.classList.add("is-visible");
        else observer.observe(element);
      });
    };
    // What is already on screen stays visible; only blocks further down wait for their turn.
    document.querySelectorAll("[data-reveal]").forEach((element) => {
      if (element.getBoundingClientRect().top < window.innerHeight) element.classList.add("is-visible");
    });
    document.documentElement.setAttribute("data-reveal-ready", "");
    watch();
    let frame = 0;
    const mutations = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(watch);
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      observer.disconnect();
      mutations.disconnect();
      cancelAnimationFrame(frame);
      document.documentElement.removeAttribute("data-reveal-ready");
    };
  }, []);

  return null;
}
