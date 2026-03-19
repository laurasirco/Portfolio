/**
 * Header/Footer inversion toggle
 * Toggle from code via `HEADER_FOOTER_UI_CONFIG.invertColors`.
 */
(function initHeaderFooterColorMode() {
  const HEADER_FOOTER_UI_CONFIG = {
    // Set to true to invert only header/footer colors against page colors.
    invertColors: false
  };

  function applyHeaderFooterMode() {
    const root = document.documentElement;
    root.classList.toggle('header-footer-inverted', !!HEADER_FOOTER_UI_CONFIG.invertColors);
  }

  window.HeaderFooterColorMode = {
    setInverted(enabled) {
      HEADER_FOOTER_UI_CONFIG.invertColors = !!enabled;
      applyHeaderFooterMode();
    },
    getConfig() {
      return { ...HEADER_FOOTER_UI_CONFIG };
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyHeaderFooterMode);
  } else {
    applyHeaderFooterMode();
  }
})();
