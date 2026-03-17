/**
 * StickerDragSystem - Integrated into sticker-drag.js
 * Sistema base para gestionar el arrastre de stickers con comportamiento consistente.
 * Proporciona:
 * - Anchor centrado en la posición del cursor al agarrar
 * - Seguimiento suave del cursor durante el arrastre
 * - Inertia reducida (50% menos) al soltar
 * - Soporte para todos los tipos de stickers (imagen, texto, 3D)
 */

class StickerDragSystem {
  constructor(stickerElement, options = {}) {
    this.element = stickerElement;
    this.options = {
      inertiaMultiplier: 0.5,
      scaleOnDrag: 1.15,
      dragDuration: 0.2,
      returnDuration: 0.3,
      inertiaFriction: 0.375,
      inertiaDuration: 0.6,
      minVelocity: 1.5,
      randomRotationMax: 20,
      rotationDuration: 0.6,
      ...options
    };
    
    this.isDragging = false;
    this.offsetX = 0;
    this.offsetY = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.lastTime = 0;
    this.velocity = { x: 0, y: 0 };
    this.baseScale = parseFloat(this.element.dataset.scale) || 1;
    this.isTouchDragging = false;
    this.scrollLockState = null;
    
    // Bind methods to preserve 'this' context
    this.startDrag = this.startDrag.bind(this);
    this.updateDrag = this.updateDrag.bind(this);
    this.endDrag = this.endDrag.bind(this);
    this.preventPageTouchScroll = this.preventPageTouchScroll.bind(this);
    
    this.init();
  }

  init() {
    // Disable native drag and drop
    this.element.addEventListener('dragstart', (e) => e.preventDefault());
    this.element.addEventListener('dragover', (e) => e.preventDefault());
    this.element.addEventListener('drop', (e) => e.preventDefault());

    // Mouse down / Touch start
    this.element.addEventListener('mousedown', this.startDrag);
    this.element.addEventListener('touchstart', this.startDrag, { passive: false });

    // Set initial cursor
    this.element.style.cursor = 'grab';
  }

  startDrag(e) {
    if (this.isDragging) return;

    // Let links inside text stickers work without forcing drag.
    if (e.target && e.target.closest && e.target.closest('a')) {
      return;
    }
    
    this.isDragging = true;
    this.isTouchDragging = e.type.includes('touch');

    if (this.isTouchDragging) {
      e.preventDefault();
      this.lockPageScroll();
    }
    
    // Get the position of the sticker
    const rect = this.element.getBoundingClientRect();
    
    // Get client coordinates (mouse or touch)
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    // Calculate offset from element center to cursor position
    // Using viewport coordinates (getBoundingClientRect)
    const elementCenterX = rect.left + rect.width / 2;
    const elementCenterY = rect.top + rect.height / 2;
    
    this.offsetX = clientX - elementCenterX;
    this.offsetY = clientY - elementCenterY;
    
    this.lastX = clientX;
    this.lastY = clientY;
    this.lastTime = Date.now();

    // Animate scale up
    if (typeof gsap !== 'undefined') {
      gsap.to(this.element, {
        scale: this.baseScale * this.options.scaleOnDrag,
        duration: this.options.dragDuration,
        ease: 'power2.out'
      });
    }

    // Add dragging class for cursor
    this.element.style.cursor = 'grabbing';
    this.element.style.pointerEvents = 'auto';
    this.element.style.zIndex = '1000';

    // Add event listeners for movement
    document.addEventListener('mousemove', this.updateDrag);
    document.addEventListener('touchmove', this.updateDrag, { passive: false });
    document.addEventListener('mouseup', this.endDrag);
    document.addEventListener('touchend', this.endDrag);
    document.addEventListener('touchcancel', this.endDrag);
  }

  updateDrag(e) {
    if (!this.isDragging) return;

    if (e.type.includes('touch')) {
      e.preventDefault();
    }

    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds

    // Calculate velocity
    if (deltaTime > 0) {
      this.velocity.x = (clientX - this.lastX) / deltaTime;
      this.velocity.y = (clientY - this.lastY) / deltaTime;
    }

    this.lastX = clientX;
    this.lastY = clientY;
    this.lastTime = currentTime;

    // Get current element center position in viewport
    const rect = this.element.getBoundingClientRect();
    const elementCenterX = rect.left + rect.width / 2;
    const elementCenterY = rect.top + rect.height / 2;
    
    // Calculate where element center should be (cursor - offset)
    const targetCenterX = clientX - this.offsetX;
    const targetCenterY = clientY - this.offsetY;
    
    // Calculate movement needed
    const moveX = targetCenterX - elementCenterX;
    const moveY = targetCenterY - elementCenterY;
    
    // Apply movement in document coordinates
    const currentLeft = parseFloat(this.element.style.left) || rect.left + window.scrollX - rect.width / 2;
    const currentTop = parseFloat(this.element.style.top) || rect.top + window.scrollY - rect.height / 2;
    
    const newX = currentLeft + moveX;
    const newY = currentTop + moveY;

    // Update sticker position
    this.element.style.left = newX + 'px';
    this.element.style.top = newY + 'px';
    this.element.style.right = 'auto';
    this.element.style.bottom = 'auto';
  }

  endDrag(e) {
    if (!this.isDragging) return;
    this.isDragging = false;

    if (e && e.type && e.type.includes('touch') && e.cancelable) {
      e.preventDefault();
    }

    if (this.isTouchDragging) {
      this.unlockPageScroll();
      this.isTouchDragging = false;
    }

    // Generate random rotation
    const randomRotation = (Math.random() * (this.options.randomRotationMax * 2)) - this.options.randomRotationMax;

    // Animate scale back to normal
    if (typeof gsap !== 'undefined') {
      gsap.to(this.element, {
        scale: this.baseScale,
        duration: this.options.returnDuration,
        ease: 'power2.out'
      });

      // Animate rotation
      gsap.to(this.element, {
        rotation: randomRotation,
        duration: this.options.rotationDuration,
        ease: 'power2.out'
      });

      // Apply inertia if velocity is significant
      if (Math.abs(this.velocity.x) > this.options.minVelocity || Math.abs(this.velocity.y) > this.options.minVelocity) {
        const currentX = parseFloat(this.element.style.left) || 0;
        const currentY = parseFloat(this.element.style.top) || 0;

        // Calculate final position with inertia (reduced 50%)
        let finalX = currentX + (this.velocity.x * this.options.inertiaDuration * this.options.inertiaFriction);
        let finalY = currentY + (this.velocity.y * this.options.inertiaDuration * this.options.inertiaFriction);

        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const stickerWidth = this.element.offsetWidth;
        const stickerHeight = this.element.offsetHeight;

        // Clamp position to viewport
        finalX = Math.max(0, Math.min(finalX, viewportWidth - stickerWidth));
        finalY = Math.max(0, Math.min(finalY, viewportHeight - stickerHeight));

        // Animate to final position with inertia
        gsap.to(this.element, {
          left: finalX,
          top: finalY,
          duration: this.options.inertiaDuration,
          ease: 'power1.out'
        });
      }
    }

    // Reset cursor and z-index
    this.element.style.cursor = 'grab';
    this.element.style.zIndex = '3';

    // Reset velocity
    this.velocity.x = 0;
    this.velocity.y = 0;

    // Remove event listeners
    document.removeEventListener('mousemove', this.updateDrag);
    document.removeEventListener('touchmove', this.updateDrag, { passive: false });
    document.removeEventListener('mouseup', this.endDrag);
    document.removeEventListener('touchend', this.endDrag);
    document.removeEventListener('touchcancel', this.endDrag);
  }

  lockPageScroll() {
    if (this.scrollLockState) return;

    this.scrollLockState = { locked: true };
    document.addEventListener('touchmove', this.preventPageTouchScroll, { passive: false });
  }

  unlockPageScroll() {
    if (!this.scrollLockState) return;
    document.removeEventListener('touchmove', this.preventPageTouchScroll, { passive: false });
    this.scrollLockState = null;
  }

  preventPageTouchScroll(e) {
    if (!this.isTouchDragging) {
      return;
    }
    e.preventDefault();
  }
}

/**
 * Initialize sticker drag functionality
 */
function initStickerDrag() {
  const stickers = document.querySelectorAll('.sticker-wrapper');
  
  stickers.forEach((sticker) => {
    if (sticker.dataset.draggable === 'false') {
      return;
    }
    new StickerDragSystem(sticker);
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initStickerDrag);
