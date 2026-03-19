/**
 * Welcome text color influence system
 * - Mouse/touch proximity influence
 * - Sticker proximity influence (color + radius from stickers.yml data attrs)
 */

function parseCssColorToRgb(input) {
  if (!input) return { r: 1, g: 0, b: 2 };
  const color = input.trim();

  // #RGB / #RRGGBB
  const hexMatch = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    const value = parseInt(hex, 16);
    return {
      r: (value >> 16) & 255,
      g: (value >> 8) & 255,
      b: value & 255
    };
  }

  // rgb()/rgba()
  const rgbMatch = color.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(',').map((p) => parseFloat(p.trim()));
    if (parts.length >= 3) {
      return { r: parts[0], g: parts[1], b: parts[2] };
    }
  }

  // hsl()/hsla() and named colors via browser parsing
  if (typeof document !== 'undefined' && document.body) {
    const probe = document.createElement('span');
    probe.style.color = color;
    probe.style.display = 'none';
    document.body.appendChild(probe);
    const computed = getComputedStyle(probe).color;
    document.body.removeChild(probe);
    const match = computed.match(/\d+(\.\d+)?/g);
    if (match && match.length >= 3) {
      return {
        r: Number(match[0]),
        g: Number(match[1]),
        b: Number(match[2])
      };
    }
  }

  // Fallback to current text color-like black
  return { r: 1, g: 0, b: 2 };
}

function rgbToCss(rgb) {
  const r = Math.max(0, Math.min(255, Math.round(rgb.r)));
  const g = Math.max(0, Math.min(255, Math.round(rgb.g)));
  const b = Math.max(0, Math.min(255, Math.round(rgb.b)));
  return `rgb(${r}, ${g}, ${b})`;
}

function influenceFalloff(distance, radius) {
  if (radius <= 0 || distance >= radius) return 0;
  const t = 1 - distance / radius;
  // Stronger edge while preserving slight gradient.
  return t * t * t * t;
}

function blendInfluencedColor(baseColor, influences, minWeight = 0.08) {
  if (influences.length === 0) return baseColor;
  // Hard mode: dominant influence (no soft blend).
  let strongest = null;
  influences.forEach((influence) => {
    const w = Math.max(0, Math.min(1, influence.weight));
    if (!strongest || w > strongest.weight) {
      strongest = { color: influence.color, weight: w };
    }
  });
  if (!strongest || strongest.weight < minWeight) return baseColor;
  return strongest.color;
}

function initWelcomeTextLetterAnimation() {
  const welcomeText = document.querySelector('.welcome-text');
  if (!welcomeText) {
    return;
  }
  if (typeof SplitText === 'undefined') {
    // Safari/iOS can race-load external plugins; retry shortly.
    setTimeout(initWelcomeTextLetterAnimation, 120);
    return;
  }
  if (welcomeText.dataset.splitInitialized === 'true') {
    return;
  }
  welcomeText.dataset.splitInitialized = 'true';

  const MOUSE_RADIUS = 240;
  const DEFAULT_STICKER_RADIUS = 190;
  const STICKER_BOOST = 1.15;
  const MIN_INFLUENCE_WEIGHT = 0.08;
  const DESKTOP_RADIUS_MULTIPLIER = 1.45;
  const MOBILE_RADIUS_MULTIPLIER = 0.85;

  const splitTxt = new SplitText(welcomeText, { type: 'chars' });
  splitTxt.chars.forEach((char) => {
    char.style.transition = 'color 0.08s linear, -webkit-text-stroke-color 0.08s linear, -webkit-text-stroke-width 0.08s linear';
  });

  let pointerX = -9999;
  let pointerY = -9999;
  let isPointerActive = false;
  let isMousePointer = false;

  function getStickerSources() {
    const stickerEls = document.querySelectorAll('.welcome-section .sticker-wrapper[data-influence-color]');
    return Array.from(stickerEls).map((el) => {
      const influenceColor = parseCssColorToRgb(el.dataset.influenceColor);
      const influenceRadius = parseFloat(el.dataset.influenceRadius) || DEFAULT_STICKER_RADIUS;
      return { el, influenceColor, influenceRadius };
    });
  }

  function updateCharacterColors() {
    const normalColor = parseCssColorToRgb(getComputedStyle(welcomeText).color);
    const stickerSources = getStickerSources();

    splitTxt.chars.forEach((char) => {
      const rect = char.getBoundingClientRect();
      const charCenterX = rect.left + rect.width / 2;
      const charCenterY = rect.top + rect.height / 2;
      const influences = [];
      let mouseWeight = 0;

      if (isPointerActive) {
        const dx = pointerX - charCenterX;
        const dy = pointerY - charCenterY;
        const d = Math.sqrt(dx * dx + dy * dy);
        mouseWeight = influenceFalloff(d, MOUSE_RADIUS);
      }

      stickerSources.forEach((source) => {
        const sRect = source.el.getBoundingClientRect();
        const sCenterX = sRect.left + sRect.width / 2;
        const sCenterY = sRect.top + sRect.height / 2;
        const dx = sCenterX - charCenterX;
        const dy = sCenterY - charCenterY;
        const d = Math.sqrt(dx * dx + dy * dy);
        const isDesktopViewport = window.innerWidth > 768;
        const effectiveRadius = source.influenceRadius * (isDesktopViewport ? DESKTOP_RADIUS_MULTIPLIER : MOBILE_RADIUS_MULTIPLIER);
        const w = Math.max(0, Math.min(1, influenceFalloff(d, effectiveRadius) * STICKER_BOOST));
        if (w > 0) {
          influences.push({ color: source.influenceColor, weight: w });
        }
      });

      const blended = blendInfluencedColor(normalColor, influences, MIN_INFLUENCE_WEIGHT);
      const nextColor = rgbToCss(blended);
      const baseColor = rgbToCss(normalColor);
      const shouldOutlineFromMouse = isMousePointer && mouseWeight >= MIN_INFLUENCE_WEIGHT;

      if (shouldOutlineFromMouse) {
        if (char.dataset.currentInfluenceMode !== 'outline' || char.dataset.currentInfluenceColor !== baseColor) {
          char.dataset.currentInfluenceMode = 'outline';
          char.dataset.currentInfluenceColor = baseColor;
          char.style.color = 'transparent';
          char.style.webkitTextStrokeWidth = '1px';
          char.style.webkitTextStrokeColor = baseColor;
        }
      } else if (char.dataset.currentInfluenceColor !== nextColor || char.dataset.currentInfluenceMode !== 'fill') {
        char.dataset.currentInfluenceMode = 'fill';
        char.dataset.currentInfluenceColor = nextColor;
        char.style.color = nextColor;
        char.style.webkitTextStrokeWidth = '0px';
        char.style.webkitTextStrokeColor = 'transparent';
      }
    });

    requestAnimationFrame(updateCharacterColors);
  }

  document.addEventListener('mousemove', (e) => {
    pointerX = e.clientX;
    pointerY = e.clientY;
    isPointerActive = true;
    isMousePointer = true;
  });

  document.addEventListener('mouseleave', () => {
    isPointerActive = false;
    isMousePointer = false;
  });

  document.addEventListener('touchstart', (e) => {
    if (e.touches.length === 0) return;
    pointerX = e.touches[0].clientX;
    pointerY = e.touches[0].clientY;
    isPointerActive = true;
    isMousePointer = false;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (e.touches.length === 0) return;
    pointerX = e.touches[0].clientX;
    pointerY = e.touches[0].clientY;
    isPointerActive = true;
    isMousePointer = false;
  }, { passive: true });

  document.addEventListener('touchend', () => {
    isPointerActive = false;
    isMousePointer = false;
  }, { passive: true });

  requestAnimationFrame(updateCharacterColors);
}

document.addEventListener('DOMContentLoaded', initWelcomeTextLetterAnimation);
