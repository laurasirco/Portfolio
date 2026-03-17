/**
 * Header and Footer Color Inversion
 * Applies inverted colors to header and footer elements
 * Uses ColorSystem for consistent color management
 */

// ColorSystem class (inline copy since we can't use ES6 imports)
class ColorSystem {
  constructor(options = {}) {
    this.options = {
      defaultBgColor: '#ffffff',
      defaultTextColor: '#000000',
      ...options
    };
  }

  resolveColor(entry, colorKey, defaultValue) {
    if (entry && entry[colorKey]) {
      return entry[colorKey];
    }
    
    if (defaultValue) {
      return defaultValue;
    }
    
    if (colorKey === 'bg_color' || colorKey === 'bgColor') {
      return this.options.defaultBgColor;
    }
    
    if (colorKey === 'text_color' || colorKey === 'textColor') {
      return this.options.defaultTextColor;
    }
    
    return defaultValue || '#000000';
  }

  applyColors(element, bgColor, textColor) {
    if (!element) return;
    
    if (bgColor) {
      element.style.backgroundColor = bgColor;
    }
    
    if (textColor) {
      element.style.color = textColor;
    }
  }

  invertColors(bgColor, textColor) {
    return {
      bgColor: textColor,
      textColor: bgColor
    };
  }

  applyInvertedColors(element, bgColor, textColor) {
    const inverted = this.invertColors(bgColor, textColor);
    this.applyColors(element, inverted.bgColor, inverted.textColor);
  }

  getCSSVariable(variableName) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(`--${variableName}`)
      .trim();
  }
}

function initHeaderFooterColors() {
  const colorSystem = new ColorSystem();
  
  // Get colors from CSS variables
  const bgColor = colorSystem.getCSSVariable('bg-color') || '#ffffff';
  const textColor = colorSystem.getCSSVariable('text-color') || '#000000';
  
  // Apply inverted colors to header
  const header = document.querySelector('header');
  if (header) {
    colorSystem.applyInvertedColors(header, bgColor, textColor);
    
    // Apply to navigation links
    const navLinks = header.querySelectorAll('nav a');
    navLinks.forEach(link => {
      link.style.color = bgColor; // Use original bg color as text color
    });
    
    // Apply inverted background color to logo div
    const logo = header.querySelector('#logo');
    if (logo) {
      logo.style.backgroundColor = bgColor; // Use original bg color as background
      logo.style.color = textColor; // Use original text color as text color
    }
  }
  
  // Apply inverted colors to footer
  const footer = document.querySelector('footer');
  if (footer) {
    colorSystem.applyInvertedColors(footer, bgColor, textColor);
    
    // Apply to footer text
    const footerText = footer.querySelectorAll('p');
    footerText.forEach(text => {
      text.style.color = bgColor; // Use original bg color as text color
    });
    
    // Apply to footer navigation links
    const footerNavLinks = footer.querySelectorAll('nav a');
    footerNavLinks.forEach(link => {
      link.style.color = bgColor; // Use original bg color as text color
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initHeaderFooterColors);