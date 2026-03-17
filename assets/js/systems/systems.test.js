/**
 * Test de estructura de módulos
 * Verifica que todos los módulos se cargan correctamente
 * y que las clases base se instancian sin errores
 */

import { ColorSystem } from './color-system.js';
import { StickerDragSystem } from './drag-system.js';
import { TextAnimationSystem } from './animation-system.js';
import { TypographySystem } from './typography-system.js';

describe('Module Structure Tests', () => {
  
  describe('ColorSystem', () => {
    it('should instantiate without errors', () => {
      const colorSystem = new ColorSystem();
      expect(colorSystem).toBeDefined();
      expect(colorSystem.defaults).toBeDefined();
    });

    it('should have default colors', () => {
      const colorSystem = new ColorSystem();
      expect(colorSystem.defaults.bgColor).toBe('#FFFFFF');
      expect(colorSystem.defaults.textColor).toBe('#000000');
    });

    it('should accept custom defaults', () => {
      const colorSystem = new ColorSystem({
        bgColor: '#FF0000',
        textColor: '#00FF00'
      });
      expect(colorSystem.defaults.bgColor).toBe('#FF0000');
      expect(colorSystem.defaults.textColor).toBe('#00FF00');
    });

    it('should have required methods', () => {
      const colorSystem = new ColorSystem();
      expect(typeof colorSystem.resolveColor).toBe('function');
      expect(typeof colorSystem.applyColors).toBe('function');
      expect(typeof colorSystem.invertColors).toBe('function');
      expect(typeof colorSystem.isValidColor).toBe('function');
    });
  });

  describe('StickerDragSystem', () => {
    let dragSystem;
    let mockElement;

    beforeEach(() => {
      // Crear elemento mock
      mockElement = document.createElement('div');
      mockElement.style.position = 'absolute';
      mockElement.style.left = '0px';
      mockElement.style.top = '0px';
      document.body.appendChild(mockElement);
      
      dragSystem = new StickerDragSystem();
    });

    afterEach(() => {
      if (dragSystem) {
        dragSystem.destroy();
      }
      if (mockElement && mockElement.parentNode) {
        mockElement.parentNode.removeChild(mockElement);
      }
    });

    it('should instantiate without errors', () => {
      expect(dragSystem).toBeDefined();
      expect(dragSystem.isDragging).toBe(false);
    });

    it('should initialize with element', () => {
      dragSystem.init(mockElement);
      expect(dragSystem.element).toBe(mockElement);
      expect(dragSystem.options.inertiaMultiplier).toBe(0.5);
    });

    it('should have required methods', () => {
      expect(typeof dragSystem.init).toBe('function');
      expect(typeof dragSystem.startDrag).toBe('function');
      expect(typeof dragSystem.updateDrag).toBe('function');
      expect(typeof dragSystem.endDrag).toBe('function');
      expect(typeof dragSystem.calculateReducedInertia).toBe('function');
    });

    it('should calculate reduced inertia', () => {
      dragSystem.init(mockElement);
      const velocity = { x: 100, y: 100 };
      const inertia = dragSystem.calculateReducedInertia(velocity);
      
      expect(inertia.x).toBe(50); // 100 * 0.5
      expect(inertia.y).toBe(50); // 100 * 0.5
    });

    it('should accept custom inertia multiplier', () => {
      dragSystem.init(mockElement, { inertiaMultiplier: 0.25 });
      const velocity = { x: 100, y: 100 };
      const inertia = dragSystem.calculateReducedInertia(velocity);
      
      expect(inertia.x).toBe(25); // 100 * 0.25
      expect(inertia.y).toBe(25); // 100 * 0.25
    });
  });

  describe('TextAnimationSystem', () => {
    let animationSystem;

    beforeEach(() => {
      animationSystem = new TextAnimationSystem();
    });

    it('should instantiate without errors', () => {
      expect(animationSystem).toBeDefined();
      expect(animationSystem.activeAnimations).toBeDefined();
    });

    it('should have default duration', () => {
      expect(animationSystem.options.defaultDuration).toBe(1000);
    });

    it('should accept custom duration', () => {
      const system = new TextAnimationSystem({ defaultDuration: 500 });
      expect(system.options.defaultDuration).toBe(500);
    });

    it('should have required methods', () => {
      expect(typeof animationSystem.animateColorOnly).toBe('function');
      expect(typeof animationSystem.animateWeight).toBe('function');
      expect(typeof animationSystem.animateProperties).toBe('function');
      expect(typeof animationSystem.cancelAll).toBe('function');
      expect(typeof animationSystem.cancel).toBe('function');
    });

    it('should track active animations', () => {
      const element = document.createElement('div');
      expect(animationSystem.activeAnimations.size).toBe(0);
    });

    it('should convert camelCase to kebab-case', () => {
      expect(animationSystem.camelToKebab('fontSize')).toBe('font-size');
      expect(animationSystem.camelToKebab('fontWeight')).toBe('font-weight');
      expect(animationSystem.camelToKebab('backgroundColor')).toBe('background-color');
    });
  });

  describe('TypographySystem', () => {
    let typographySystem;

    beforeEach(() => {
      typographySystem = new TypographySystem();
    });

    it('should instantiate without errors', () => {
      expect(typographySystem).toBeDefined();
      expect(typographySystem.options.fontFamilies).toBeDefined();
    });

    it('should expose the expected font stacks', () => {
      expect(typographySystem.options.fontFamilies.sans).toContain('Neue Regrade Variable');
      expect(typographySystem.options.fontFamilies.serif).toContain('Newsreader');
      expect(typographySystem.options.fontFamilies.mono).toContain('Sono');
    });

    it('should have required methods', () => {
      expect(typeof typographySystem.loadFonts).toBe('function');
      expect(typeof typographySystem.applyFontStack).toBe('function');
      expect(typeof typographySystem.animateWeight).toBe('function');
      expect(typeof typographySystem.checkVariableFontSupport).toBe('function');
    });

    it('should normalize font weights to the variable font range', () => {
      expect(typographySystem.normalizeWeight(50)).toBe(100);
      expect(typographySystem.normalizeWeight(950)).toBe(900);
      expect(typographySystem.normalizeWeight('500')).toBe(500);
    });
  });

  describe('Module Exports', () => {
    it('should export ColorSystem', () => {
      expect(ColorSystem).toBeDefined();
      expect(typeof ColorSystem).toBe('function');
    });

    it('should export StickerDragSystem', () => {
      expect(StickerDragSystem).toBeDefined();
      expect(typeof StickerDragSystem).toBe('function');
    });

    it('should export TextAnimationSystem', () => {
      expect(TextAnimationSystem).toBeDefined();
      expect(typeof TextAnimationSystem).toBe('function');
    });

    it('should export TypographySystem', () => {
      expect(TypographySystem).toBeDefined();
      expect(typeof TypographySystem).toBe('function');
    });
  });
});
