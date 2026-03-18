/**
 * About sticker linear motion system (DVD-like bounce).
 * - Runs only on About page
 * - Random angle + speed per sticker
 * - Bounces on viewport edges
 * - Pauses while sticker is being dragged
 */
(function initAboutStickerBounceSystem() {
  const MIN_SPEED = 44; // px/s
  const MAX_SPEED = 78; // px/s
  const RESUME_AFTER_DRAG_MS = 650;
  const MIN_SPEED_DELTA = 5;
  const MIN_RELEASE_DIRECTION_SPEED = 80; // px/s

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function normalize(vx, vy) {
    const mag = Math.hypot(vx, vy) || 1;
    return { x: vx / mag, y: vy / mag };
  }

  function pickDistinctSpeed(usedSpeeds) {
    let candidate = randomBetween(MIN_SPEED, MAX_SPEED);
    let guard = 0;
    while (usedSpeeds.some((s) => Math.abs(s - candidate) < MIN_SPEED_DELTA) && guard < 24) {
      candidate = randomBetween(MIN_SPEED, MAX_SPEED);
      guard += 1;
    }
    usedSpeeds.push(candidate);
    return candidate;
  }

  function toDocumentPosition(rect) {
    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY
    };
  }

  function toLocalPosition(rect, rootRectDoc) {
    return {
      left: (rect.left + window.scrollX) - rootRectDoc.left,
      top: (rect.top + window.scrollY) - rootRectDoc.top
    };
  }

  function getViewportBoundsInRootSpace(rootRectDoc, width, height) {
    // Stickers use left/top relative to about root (position: relative),
    // so viewport bounds must be converted to the same coordinate space.
    const minX = window.scrollX - rootRectDoc.left;
    const minY = window.scrollY - rootRectDoc.top;
    const maxX = (window.scrollX + window.innerWidth) - rootRectDoc.left - width;
    const maxY = (window.scrollY + window.innerHeight) - rootRectDoc.top - height;
    return { minX, minY, maxX, maxY };
  }

  function setup() {
    const aboutRoot = document.querySelector('.about-page');
    if (!aboutRoot) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const stickers = Array.from(aboutRoot.querySelectorAll('.sticker-wrapper'));
    if (stickers.length === 0) return;

    function getRootRectDoc() {
      return toDocumentPosition(aboutRoot.getBoundingClientRect());
    }

    const usedSpeeds = [];
    const states = stickers.map((el) => {
      const rect = el.getBoundingClientRect();
      const rootRectDoc = getRootRectDoc();
      const pos = toLocalPosition(rect, rootRectDoc);
      const angle = randomBetween(0, Math.PI * 2);
      const speed = pickDistinctSpeed(usedSpeeds);
      const dir = normalize(Math.cos(angle), Math.sin(angle));

      el.style.left = `${pos.left}px`;
      el.style.top = `${pos.top}px`;
      el.style.right = 'auto';
      el.style.bottom = 'auto';

      return {
        el,
        x: pos.left,
        y: pos.top,
        width: rect.width,
        height: rect.height,
        speed,
        vx: dir.x * speed,
        vy: dir.y * speed,
        wasDragging: false,
        pausedUntil: 0
      };
    });
    const stateByElement = new Map(states.map((state) => [state.el, state]));

    aboutRoot.addEventListener('sticker:dragend', (event) => {
      const targetSticker = event.target && event.target.closest
        ? event.target.closest('.sticker-wrapper')
        : null;
      if (!targetSticker) return;

      const state = stateByElement.get(targetSticker);
      if (!state) return;

      const velocity = event.detail && event.detail.velocity ? event.detail.velocity : null;
      if (!velocity) return;

      const magnitude = Math.hypot(velocity.x || 0, velocity.y || 0);
      if (magnitude < MIN_RELEASE_DIRECTION_SPEED) {
        return;
      }

      const dir = normalize(velocity.x, velocity.y);
      state.vx = dir.x * state.speed;
      state.vy = dir.y * state.speed;
      state.pausedUntil = Date.now() + RESUME_AFTER_DRAG_MS;
      state.wasDragging = true;
    });

    let lastTs = performance.now();

    function tick(ts) {
      const dt = Math.min(0.04, (ts - lastTs) / 1000);
      lastTs = ts;

      states.forEach((s) => {
        const isDragging = s.el.classList.contains('is-sticker-dragging');
        const isSettling = s.el.classList.contains('is-sticker-settling');

        if (isDragging || isSettling) {
          s.wasDragging = true;
          return;
        }

        if (s.wasDragging) {
          const rect = s.el.getBoundingClientRect();
          const rootRectDoc = getRootRectDoc();
          const pos = toLocalPosition(rect, rootRectDoc);
          s.x = pos.left;
          s.y = pos.top;
          s.width = rect.width;
          s.height = rect.height;
          s.pausedUntil = Date.now() + RESUME_AFTER_DRAG_MS;
          s.wasDragging = false;
        }

        if (Date.now() < s.pausedUntil) {
          return;
        }

        s.x += s.vx * dt;
        s.y += s.vy * dt;

        const rootRectDoc = getRootRectDoc();
        const bounds = getViewportBoundsInRootSpace(rootRectDoc, s.width, s.height);

        if (s.x <= bounds.minX) {
          s.x = bounds.minX;
          s.vx = Math.abs(s.vx);
        } else if (s.x >= bounds.maxX) {
          s.x = bounds.maxX;
          s.vx = -Math.abs(s.vx);
        }

        if (s.y <= bounds.minY) {
          s.y = bounds.minY;
          s.vy = Math.abs(s.vy);
        } else if (s.y >= bounds.maxY) {
          s.y = bounds.maxY;
          s.vy = -Math.abs(s.vy);
        }

        // Apply candidate position first.
        s.el.style.left = `${s.x}px`;
        s.el.style.top = `${s.y}px`;

        // Correct with REAL rendered bounds (includes rotation/scale/mask),
        // so stickers never get visually "squeezed" near viewport edges.
        const rendered = s.el.getBoundingClientRect();
        let corrected = false;

        if (rendered.left < 0) {
          s.x += -rendered.left;
          s.vx = Math.abs(s.vx);
          corrected = true;
        } else if (rendered.right > window.innerWidth) {
          s.x -= (rendered.right - window.innerWidth);
          s.vx = -Math.abs(s.vx);
          corrected = true;
        }

        if (rendered.top < 0) {
          s.y += -rendered.top;
          s.vy = Math.abs(s.vy);
          corrected = true;
        } else if (rendered.bottom > window.innerHeight) {
          s.y -= (rendered.bottom - window.innerHeight);
          s.vy = -Math.abs(s.vy);
          corrected = true;
        }

        if (corrected) {
          s.el.style.left = `${s.x}px`;
          s.el.style.top = `${s.y}px`;
        }
      });

      requestAnimationFrame(tick);
    }

    window.addEventListener('resize', () => {
      states.forEach((s) => {
        const rect = s.el.getBoundingClientRect();
        s.width = rect.width;
        s.height = rect.height;
        const rootRectDoc = getRootRectDoc();
        const pos = toLocalPosition(rect, rootRectDoc);
        s.x = pos.left;
        s.y = pos.top;
      });
    });

    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
