/** A small clothing tag flies from the button into the cart in the header. Only transform and opacity move. */
export function flyToCart(from: Element): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const target = document.querySelector("[data-cart-target]");
  if (!target) return;
  const start = from.getBoundingClientRect();
  const end = target.getBoundingClientRect();
  const tag = document.createElement("span");
  tag.className = "fly-tag";
  tag.setAttribute("aria-hidden", "true");
  tag.innerHTML =
    '<svg viewBox="0 0 40 26" width="40" height="26"><path d="M1 13 9 2h29v22H9z" fill="currentColor"/><circle cx="10" cy="13" r="3" style="fill: var(--surface)"/></svg>';
  const x0 = start.left + start.width / 2 - 20;
  const y0 = start.top + start.height / 2 - 13;
  const x1 = end.left + end.width / 2 - 20;
  const y1 = end.top + end.height / 2 - 13;
  tag.style.left = `${x0}px`;
  tag.style.top = `${y0}px`;
  document.body.append(tag);
  const dx = x1 - x0;
  const dy = y1 - y0;
  const animation = tag.animate(
    [
      { transform: "translate(0, 0) rotate(0deg) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 90}px) rotate(-25deg) scale(1.1)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) rotate(-8deg) scale(0.35)`, opacity: 0.2 },
    ],
    { duration: 850, easing: "cubic-bezier(.3,.7,.4,1)" },
  );
  animation.onfinish = () => tag.remove();
  animation.oncancel = () => tag.remove();
}
