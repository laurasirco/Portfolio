/**
 * TextAnimationSystem
 * 
 * Sistema base para animar propiedades de texto en diferentes contextos.
 * Proporciona:
 * - Animación de solo color (welcome)
 * - Animación de weight (tipografía variable)
 * - Animación de múltiples propiedades
 * - Integración con GSAP para animaciones suaves
 */

class TextAnimationSystem {
  /**
   * Inicializa el sistema de animación de texto
   * @param {Object} options - Opciones de configuración
   * @param {number} options.defaultDuration - Duración por defecto (ms)
   */
  constructor(options = {}) {
    this.options = {
      defaultDuration: 1000,
      ...options
    };
    
    this.activeAnimations = new Map();
  }

  /**
   * Anima solo la propiedad color (para welcome)
   * Mantiene el font-weight constante
   * @param {HTMLElement} element - Elemento a animar
   * @param {string} fromColor - Color inicial (hex, rgb, etc)
   * @param {string} toColor - Color final
   * @param {number} duration - Duración en ms
   * @returns {Promise} Promesa que se resuelve cuando la animación termina
   */
  animateColorOnly(element, fromColor, toColor, duration = this.options.defaultDuration) {
    return new Promise((resolve) => {
      // Cancelar animación anterior si existe
      if (this.activeAnimations.has(element)) {
        this.activeAnimations.get(element).kill();
      }
      
      // Usar GSAP si está disponible, sino usar CSS transitions
      if (typeof gsap !== 'undefined') {
        const animation = gsap.to(element, {
          color: toColor,
          duration: duration / 1000,
          onComplete: () => {
            this.activeAnimations.delete(element);
            resolve();
          }
        });
        
        this.activeAnimations.set(element, animation);
      } else {
        // Fallback a CSS transitions
        element.style.transition = `color ${duration}ms ease-in-out`;
        element.style.color = toColor;
        
        setTimeout(() => {
          element.style.transition = '';
          this.activeAnimations.delete(element);
          resolve();
        }, duration);
      }
    });
  }

  /**
   * Anima la propiedad font-weight (para tipografía variable)
   * @param {HTMLElement} element - Elemento a animar
   * @param {number} fromWeight - Weight inicial (100-900)
   * @param {number} toWeight - Weight final (100-900)
   * @param {number} duration - Duración en ms
   * @returns {Promise} Promesa que se resuelve cuando la animación termina
   */
  animateWeight(element, fromWeight, toWeight, duration = this.options.defaultDuration) {
    return new Promise((resolve) => {
      // Cancelar animación anterior si existe
      if (this.activeAnimations.has(element)) {
        this.activeAnimations.get(element).kill();
      }
      
      // Usar GSAP si está disponible
      if (typeof gsap !== 'undefined') {
        element.style.fontWeight = fromWeight;
        element.style.fontVariationSettings = `"wght" ${fromWeight}`;
        const animation = gsap.to(element, {
          fontWeight: toWeight,
          duration: duration / 1000,
          onUpdate: () => {
            const currentWeight = Number.parseInt(element.style.fontWeight || toWeight, 10);
            element.style.fontVariationSettings = `"wght" ${Number.isNaN(currentWeight) ? toWeight : currentWeight}`;
          },
          onComplete: () => {
            element.style.fontVariationSettings = `"wght" ${toWeight}`;
            this.activeAnimations.delete(element);
            resolve();
          }
        });
        
        this.activeAnimations.set(element, animation);
      } else {
        // Fallback a CSS transitions
        element.style.fontWeight = fromWeight;
        element.style.fontVariationSettings = `"wght" ${fromWeight}`;
        element.style.transition = `font-weight ${duration}ms ease-in-out, font-variation-settings ${duration}ms ease-in-out`;
        element.style.fontWeight = toWeight;
        element.style.fontVariationSettings = `"wght" ${toWeight}`;

        setTimeout(() => {
          element.style.transition = '';
          this.activeAnimations.delete(element);
          resolve();
        }, duration);
      }
    });
  }

  /**
   * Anima múltiples propiedades simultáneamente
   * @param {HTMLElement} element - Elemento a animar
   * @param {Object} properties - Propiedades a animar {color, fontWeight, opacity, etc}
   * @param {number} duration - Duración en ms
   * @returns {Promise} Promesa que se resuelve cuando la animación termina
   */
  animateProperties(element, properties, duration = this.options.defaultDuration) {
    return new Promise((resolve) => {
      // Cancelar animación anterior si existe
      if (this.activeAnimations.has(element)) {
        this.activeAnimations.get(element).kill();
      }
      
      // Usar GSAP si está disponible
      if (typeof gsap !== 'undefined') {
        const animation = gsap.to(element, {
          ...properties,
          duration: duration / 1000,
          onComplete: () => {
            this.activeAnimations.delete(element);
            resolve();
          }
        });
        
        this.activeAnimations.set(element, animation);
      } else {
        // Fallback a CSS transitions
        const transitionProps = Object.keys(properties)
          .map(prop => `${this.camelToKebab(prop)} ${duration}ms ease-in-out`)
          .join(', ');
        
        element.style.transition = transitionProps;
        
        // Aplicar propiedades
        Object.entries(properties).forEach(([key, value]) => {
          element.style[key] = value;
        });
        
        setTimeout(() => {
          element.style.transition = '';
          this.activeAnimations.delete(element);
          resolve();
        }, duration);
      }
    });
  }

  /**
   * Convierte camelCase a kebab-case
   * @param {string} str - String en camelCase
   * @returns {string} String en kebab-case
   */
  camelToKebab(str) {
    return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
  }

  /**
   * Cancela todas las animaciones activas
   */
  cancelAll() {
    this.activeAnimations.forEach(animation => {
      if (animation.kill) {
        animation.kill();
      }
    });
    this.activeAnimations.clear();
  }

  /**
   * Cancela la animación de un elemento específico
   * @param {HTMLElement} element - Elemento
   */
  cancel(element) {
    if (this.activeAnimations.has(element)) {
      const animation = this.activeAnimations.get(element);
      if (animation.kill) {
        animation.kill();
      }
      this.activeAnimations.delete(element);
    }
  }
}

// Exportar para uso en otros módulos
export { TextAnimationSystem };
