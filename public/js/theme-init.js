// Runs before the first paint, so the page never flashes in the wrong theme.
// 1) the visitor's saved choice, 2) otherwise the system setting.
// It also marks whether animations are allowed (prefers-reduced-motion).
(function () {
  var root = document.documentElement;
  var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  var saved = null;
  try {
    saved = window.localStorage.getItem("mot-theme");
  } catch (error) {
    saved = null;
  }
  root.dataset.theme = saved === "dark" || saved === "light" ? saved : systemDark ? "dark" : "light";
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.dataset.motion = "ok";
  }
})();
