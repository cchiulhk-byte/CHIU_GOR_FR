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
  
  // Snappier duration: faster for short distances, capped at 600ms
  const duration = Math.min(Math.max(Math.abs(distance) * 0.3, 300), 600);
  let startTime: number | null = null;

  // Quad easing for better performance and snappier feel
  function easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function step(timestamp: number) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutQuad(progress);

    window.scrollTo({
      top: startY + distance * eased,
      behavior: 'auto' // Force instant jump for each step to avoid browser interference
    });

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}