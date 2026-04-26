/**
 * Smooth scroll with custom easing (ease-in-out-cubic)
 * Much smoother than the browser's default scroll-behavior: smooth
 */
export function smoothScrollTo(targetId: string, offset = 72) {
  const el = document.getElementById(targetId);
  if (!el) return;

  const targetY = el.getBoundingClientRect().top + window.scrollY - offset;
  const startY = window.scrollY;
  const distance = targetY - startY;
  const duration = Math.min(Math.max(Math.abs(distance) * 0.4, 400), 900);
  let startTime: number | null = null;

  // Ease-in-out-cubic
  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(timestamp: number) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(progress);

    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}