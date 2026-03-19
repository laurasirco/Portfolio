/**
 * Header local time (Europe/Madrid) + day/night mode toggle.
 * Day/Night colors are derived from currently defined CSS colors.
 */
(function initHeaderTheme() {
  const THEME_CONFIG = {
    timezone: 'Europe/Madrid',
    defaultMode: 'auto', // auto | day | night
    sunsetHour: 19,
    sunsetMinute: 30,
    sunriseHour: 7,
    sunriseMinute: 0,
    localStorageKey: 'portfolio-theme-mode-v2'
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function nowInTimezoneParts(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: THEME_CONFIG.timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }).formatToParts(date);
    const map = {};
    parts.forEach((p) => {
      map[p.type] = p.value;
    });
    return map;
  }

  function parseCssColorToRgb(colorValue) {
    const probe = document.createElement('span');
    probe.style.color = colorValue;
    probe.style.display = 'none';
    document.body.appendChild(probe);
    const computed = getComputedStyle(probe).color;
    document.body.removeChild(probe);
    const match = computed.match(/\d+(\.\d+)?/g);
    if (!match || match.length < 3) return { r: 0, g: 0, b: 0 };
    return {
      r: Number(match[0]),
      g: Number(match[1]),
      b: Number(match[2])
    };
  }

  function rgbToHsl({ r, g, b }) {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const delta = max - min;
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (delta !== 0) {
      s = delta / (1 - Math.abs(2 * l - 1));
      if (max === rn) h = ((gn - bn) / delta) % 6;
      else if (max === gn) h = (bn - rn) / delta + 2;
      else h = (rn - gn) / delta + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    return { h, s: s * 100, l: l * 100 };
  }

  function hslToCss({ h, s, l }) {
    return `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%)`;
  }

  function deriveThemeColorsFromCurrentRoot() {
    const rootStyle = getComputedStyle(document.documentElement);
    const currentBg = rootStyle.getPropertyValue('--bg-color').trim() || '#ffffff';
    const currentText = rootStyle.getPropertyValue('--text-color').trim() || '#010002';

    const dayBg = currentBg;
    const dayText = currentText;

    const bgHsl = rgbToHsl(parseCssColorToRgb(currentBg));
    const textHsl = rgbToHsl(parseCssColorToRgb(currentText));

    // Keep hue relation to current palette but shift to a darker/night tone.
    const nightBg = hslToCss({
      h: bgHsl.h,
      s: clamp(bgHsl.s * 0.45, 6, 36),
      l: clamp(bgHsl.l * 0.2, 10, 22)
    });
    const nightText = hslToCss({
      h: textHsl.h,
      s: clamp(textHsl.s * 0.18, 5, 28),
      l: clamp(74 - bgHsl.l * 0.1, 66, 84)
    });

    const root = document.documentElement;
    root.style.setProperty('--theme-day-bg', dayBg);
    root.style.setProperty('--theme-day-text', dayText);
    root.style.setProperty('--theme-night-bg', nightBg);
    root.style.setProperty('--theme-night-text', nightText);
  }

  function getAutoThemeFromTime() {
    const parts = nowInTimezoneParts();
    const hour = Number(parts.hour || 0);
    const minute = Number(parts.minute || 0);
    const current = hour * 60 + minute;
    const sunset = THEME_CONFIG.sunsetHour * 60 + THEME_CONFIG.sunsetMinute;
    const sunrise = THEME_CONFIG.sunriseHour * 60 + THEME_CONFIG.sunriseMinute;
    return (current >= sunset || current < sunrise) ? 'night' : 'day';
  }

  function applyTheme(mode) {
    const root = document.documentElement;
    root.classList.remove('theme-day', 'theme-night');
    root.classList.add(mode === 'night' ? 'theme-night' : 'theme-day');
  }

  function resolveStoredMode() {
    // Ignore legacy persisted state from older implementation.
    if (window.localStorage.getItem('portfolio-theme-mode') !== null) {
      window.localStorage.removeItem('portfolio-theme-mode');
    }
    const stored = window.localStorage.getItem(THEME_CONFIG.localStorageKey);
    if (stored === 'day' || stored === 'night' || stored === 'auto') return stored;
    return THEME_CONFIG.defaultMode;
  }

  function updateClock(timeNode) {
    if (!timeNode) return;
    const parts = nowInTimezoneParts();
    const hour = parts.hour || '00';
    const minute = parts.minute || '00';
    const tz = parts.timeZoneName || 'CET';
    timeNode.textContent = `${hour}:${minute} ${tz}`;
    timeNode.setAttribute('datetime', `${hour}:${minute}`);
  }

  function syncCheckbox(toggleCheckbox, activeTheme) {
    if (!toggleCheckbox) return;
    // checked = day, unchecked = night
    toggleCheckbox.checked = activeTheme === 'day';
  }

  function setup() {
    const timeNode = document.getElementById('header-local-time');
    const toggleCheckbox = document.getElementById('theme-toggle-checkbox');
    if (!timeNode || !toggleCheckbox) return;

    deriveThemeColorsFromCurrentRoot();

    let mode = resolveStoredMode();
    let activeTheme = mode === 'auto' ? getAutoThemeFromTime() : mode;

    applyTheme(activeTheme);
    syncCheckbox(toggleCheckbox, activeTheme);
    updateClock(timeNode);

    setInterval(() => {
      updateClock(timeNode);
      if (mode === 'auto') {
        const nextAuto = getAutoThemeFromTime();
        if (nextAuto !== activeTheme) {
          activeTheme = nextAuto;
          applyTheme(activeTheme);
          syncCheckbox(toggleCheckbox, activeTheme);
        }
      }
    }, 15000);

    toggleCheckbox.addEventListener('change', () => {
      mode = toggleCheckbox.checked ? 'day' : 'night';
      activeTheme = mode;
      applyTheme(activeTheme);
      window.localStorage.setItem(THEME_CONFIG.localStorageKey, mode);
    });

    window.HeaderThemeMode = {
      setMode(nextMode) {
        if (!['auto', 'day', 'night'].includes(nextMode)) return;
        mode = nextMode;
        activeTheme = mode === 'auto' ? getAutoThemeFromTime() : mode;
        applyTheme(activeTheme);
        syncCheckbox(toggleCheckbox, activeTheme);
        window.localStorage.setItem(THEME_CONFIG.localStorageKey, mode);
      },
      getMode() {
        return mode;
      },
      getActiveTheme() {
        return activeTheme;
      },
      refreshDerivedColors() {
        deriveThemeColorsFromCurrentRoot();
        applyTheme(activeTheme);
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
