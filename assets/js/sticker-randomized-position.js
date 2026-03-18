/**
 * Sticker randomized start positions
 * - Applies to welcome + about stickers
 * - Offsets are relative to YAML-defined positions (small random delta)
 * - Keeps stickers inside their visual container bounds
 */
(function initStickerRandomizedPosition() {
  const WELCOME_OFFSET_X = 0.035; // 3.5vw-ish
  const WELCOME_OFFSET_Y = 0.03;
  const ABOUT_OFFSET_X = 0.03;
  const ABOUT_OFFSET_Y = 0.025;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function docRectFromElement(el) {
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
      right: rect.right + window.scrollX,
      bottom: rect.bottom + window.scrollY,
      width: rect.width,
      height: rect.height
    };
  }

  function getBoundsForSticker(sticker) {
    const host = sticker.closest('.welcome-section') || sticker.closest('.about-page');
    if (!host) {
      return {
        left: window.scrollX,
        top: window.scrollY,
        right: window.scrollX + window.innerWidth,
        bottom: window.scrollY + window.innerHeight
      };
    }
    return docRectFromElement(host);
  }

  function randomizeSticker(sticker, offsetXRatio, offsetYRatio) {
    if (sticker.dataset.randomizedPosition === 'true') return;

    const rect = docRectFromElement(sticker);
    const bounds = getBoundsForSticker(sticker);

    const xRange = Math.max(8, window.innerWidth * offsetXRatio);
    const yRange = Math.max(8, window.innerHeight * offsetYRatio);

    const dx = randomBetween(-xRange, xRange);
    const dy = randomBetween(-yRange, yRange);

    const targetLeft = rect.left + dx;
    const targetTop = rect.top + dy;

    const minLeft = bounds.left;
    const maxLeft = bounds.right - rect.width;
    const minTop = bounds.top;
    const maxTop = bounds.bottom - rect.height;

    const clampedLeft = clamp(targetLeft, minLeft, maxLeft);
    const clampedTop = clamp(targetTop, minTop, maxTop);

    sticker.style.left = `${clampedLeft}px`;
    sticker.style.top = `${clampedTop}px`;
    sticker.style.right = 'auto';
    sticker.style.bottom = 'auto';
    sticker.dataset.randomizedPosition = 'true';
  }

  function setup() {
    const welcomeStickers = document.querySelectorAll('.welcome-section .sticker-wrapper');
    const aboutStickers = document.querySelectorAll('.about-page .sticker-wrapper');

    welcomeStickers.forEach((sticker) => randomizeSticker(sticker, WELCOME_OFFSET_X, WELCOME_OFFSET_Y));
    aboutStickers.forEach((sticker) => randomizeSticker(sticker, ABOUT_OFFSET_X, ABOUT_OFFSET_Y));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
