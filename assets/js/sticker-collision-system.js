/**
 * Sticker collision system
 * - Resolves overlap between stickers globally
 * - Works while dragging and while autonomous movement runs
 * - Lightweight circle-based collision approximation
 */
(function initStickerCollisionSystem() {
  const RESTITUTION = 0.62;
  const MAX_PUSH_PER_FRAME = 12;
  const RADIUS_SCALE = 0.45;
  const ITERATIONS = 2;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function readLeftTop(el) {
    return {
      left: parseFloat(el.style.left) || 0,
      top: parseFloat(el.style.top) || 0
    };
  }

  function nudge(el, dx, dy) {
    const pos = readLeftTop(el);
    el.style.left = `${pos.left + dx}px`;
    el.style.top = `${pos.top + dy}px`;
    el.style.right = 'auto';
    el.style.bottom = 'auto';
  }

  function getState(el) {
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const r = Math.max(18, Math.min(rect.width, rect.height) * RADIUS_SCALE);
    return { el, rect, x, y, r };
  }

  function isDragging(el) {
    return el.classList.contains('is-sticker-dragging');
  }

  function setup() {
    const stickers = Array.from(document.querySelectorAll('.sticker-wrapper'));
    if (stickers.length < 2) return;

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    function resolvePair(a, b) {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 0.0001;
      const minDist = a.r + b.r;
      if (dist >= minDist) return;

      const nx = dx / dist;
      const ny = dy / dist;
      const overlap = minDist - dist;
      const push = clamp(overlap * 0.55, 0, MAX_PUSH_PER_FRAME);

      const aDragging = isDragging(a.el);
      const bDragging = isDragging(b.el);

      let moveA = 0.5;
      let moveB = 0.5;
      if (aDragging && !bDragging) {
        moveA = 0;
        moveB = 1;
      } else if (!aDragging && bDragging) {
        moveA = 1;
        moveB = 0;
      }

      const pushAx = -nx * push * moveA;
      const pushAy = -ny * push * moveA;
      const pushBx = nx * push * moveB;
      const pushBy = ny * push * moveB;

      if (moveA > 0) nudge(a.el, pushAx, pushAy);
      if (moveB > 0) nudge(b.el, pushBx, pushBy);

      // Small velocity-like bounce by offsetting again along normal.
      const bounce = push * RESTITUTION * 0.2;
      if (moveA > 0) nudge(a.el, -nx * bounce, -ny * bounce);
      if (moveB > 0) nudge(b.el, nx * bounce, ny * bounce);
    }

    function tick() {
      for (let iter = 0; iter < ITERATIONS; iter += 1) {
        const states = stickers.map(getState);
        for (let i = 0; i < states.length; i += 1) {
          for (let j = i + 1; j < states.length; j += 1) {
            resolvePair(states[i], states[j]);
          }
        }
      }
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
