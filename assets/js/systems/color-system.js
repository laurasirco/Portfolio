/**
 * ColorSystem
 * 
 * Sistema para gestionar colores con soporte a frontmatter y valores por defecto.
 * Proporciona:
 * - Resolución de colores desde frontmatter con cascada
 * - Aplicación de colores a elementos
 * - Inversión de colores para header/footer
 */

class ColorSystem {
  /**
   * Inicializa el sistema de colores
   * @param {Object} options - Opciones de configuración
   * @param {string} options.defaultBgColor - Color de fondo por defecto
   * @param {string} options.defaultTextColor - Color de texto por defecto
   */
  constructor(options = {}) {
    this.options = {
      defaultBgColor: '#ffffff',
      defaultTextColor: '#000000',
      ...options
    };
  }

  /**
   * Resuelve un color desde frontmatter con cascada
   * @param {Object} entry - Objeto de entrada con propiedades de frontmatter
   * @param {string} colorKey - Clave del color a resolver (ej: 'bg_color', 'text_color')
   * @param {string} defaultValue - Valor por defecto si no se encuentra
   * @returns {string} Color resuelto
   */
  resolveColor(entry, colorKey, defaultValue) {
    // Si la entrada tiene el color, usarlo
    if (entry && entry[colorKey]) {
      return entry[colorKey];
    }
    
    // Si hay un valor por defecto, usarlo
    if (defaultValue) {
      return defaultValue;
    }
    
    // Usar el color por defecto del sistema
    if (colorKey === 'bg_color' || colorKey === 'bgColor') {
      return this.options.defaultBgColor;
    }
    
    if (colorKey === 'text_color' || colorKey === 'textColor') {
      return this.options.defaultTextColor;
    }
    
    return defaultValue || '#000000';
  }

  /**
   * Aplica colores a un elemento
   * @param {HTMLElement} element - Elemento a colorear
   * @param {string} bgColor - Color de fondo
   * @param {string} textColor - Color de texto
   */
  applyColors(element, bgColor, textColor) {
    if (!element) return;
    
    if (bgColor) {
      element.style.backgroundColor = bgColor;
    }
    
    if (textColor) {
      element.style.color = textColor;
    }
  }

  /**
   * Invierte colores (intercambia fondo y texto)
   * @param {string} bgColor - Color de fondo original
   * @param {string} textColor - Color de texto original
   * @returns {Object} Colores invertidos {bgColor, textColor}
   */
  invertColors(bgColor, textColor) {
    return {
      bgColor: textColor,
      textColor: bgColor
    };
  }

  /**
   * Aplica colores invertidos a un elemento
   * @param {HTMLElement} element - Elemento a colorear
   * @param {string} bgColor - Color de fondo original
   * @param {string} textColor - Color de texto original
   */
  applyInvertedColors(element, bgColor, textColor) {
    const inverted = this.invertColors(bgColor, textColor);
    this.applyColors(element, inverted.bgColor, inverted.textColor);
  }

  /**
   * Obtiene el color de CSS variable
   * @param {string} variableName - Nombre de la variable CSS (sin --)
   * @returns {string} Valor de la variable CSS
   */
  getCSSVariable(variableName) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(`--${variableName}`)
      .trim();
  }

  /**
   * Establece una variable CSS
   * @param {string} variableName - Nombre de la variable CSS (sin --)
   * @param {string} value - Valor a establecer
   */
  setCSSVariable(variableName, value) {
    document.documentElement.style.setProperty(`--${variableName}`, value);
  }
}

// Exportar para uso en otros módulos
export { ColorSystem };
