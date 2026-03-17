/**
 * TypographySystem
 *
 * Gestiona la carga de fuentes, la aplicación de stacks tipográficos
 * y la animación de pesos para fuentes variables.
 */

class TypographySystem {
  constructor(options = {}) {
    this.options = {
      defaultDuration: 300,
      fontFamilies: {
        sans: '"Neue Regrade Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        serif: '"Newsreader", Georgia, Cambria, "Times New Roman", Times, serif',
        mono: '"Sono", "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace'
      },
      ...options
    };
  }

  async loadFonts(doc = globalThis.document) {
    if (!doc || !doc.fonts || typeof doc.fonts.load !== 'function') {
      return { loaded: false, reason: 'Font Loading API unavailable' };
    }

    const descriptors = [
      '400 1em "Neue Regrade Variable"',
      '500 1em "Neue Regrade Variable"',
      '400 1em "Newsreader"'
    ];

    await Promise.all(
      descriptors.map((descriptor) => doc.fonts.load(descriptor).catch(() => []))
    );

    return {
      loaded: true,
      families: {
        sans: this.options.fontFamilies.sans,
        serif: this.options.fontFamilies.serif,
        mono: this.options.fontFamilies.mono
      }
    };
  }

  applyFontStack(element, type = 'sans') {
    if (!element || !element.style) {
      return false;
    }

    const fontFamily = this.options.fontFamilies[type] || this.options.fontFamilies.sans;
    element.style.fontFamily = fontFamily;
    return fontFamily;
  }

  animateWeight(element, fromWeight, toWeight, duration = this.options.defaultDuration) {
    if (!element || !element.style) {
      return Promise.resolve(false);
    }

    const safeFromWeight = this.normalizeWeight(fromWeight);
    const safeToWeight = this.normalizeWeight(toWeight);

    this.applyWeight(element, safeFromWeight);

    return new Promise((resolve) => {
      if (typeof gsap !== 'undefined') {
        gsap.to(element, {
          fontWeight: safeToWeight,
          duration: duration / 1000,
          onUpdate: () => {
            const currentWeight = this.normalizeWeight(
              Number.parseInt(element.style.fontWeight || safeToWeight, 10)
            );
            this.applyVariationSettings(element, currentWeight);
          },
          onComplete: () => {
            this.applyWeight(element, safeToWeight);
            resolve(true);
          }
        });

        return;
      }

      element.style.transition = `font-weight ${duration}ms ease-in-out, font-variation-settings ${duration}ms ease-in-out`;
      this.applyWeight(element, safeToWeight);

      setTimeout(() => {
        element.style.transition = '';
        resolve(true);
      }, duration);
    });
  }

  checkVariableFontSupport(env = globalThis) {
    return Boolean(
      env.CSS &&
      typeof env.CSS.supports === 'function' &&
      env.CSS.supports('font-variation-settings', '"wght" 500')
    );
  }

  normalizeWeight(weight) {
    const parsedWeight = Number.parseInt(weight, 10);

    if (Number.isNaN(parsedWeight)) {
      return 400;
    }

    return Math.min(900, Math.max(100, parsedWeight));
  }

  applyWeight(element, weight) {
    element.style.fontWeight = String(weight);
    this.applyVariationSettings(element, weight);
  }

  applyVariationSettings(element, weight) {
    element.style.fontVariationSettings = `"wght" ${weight}`;
  }
}

export { TypographySystem };
