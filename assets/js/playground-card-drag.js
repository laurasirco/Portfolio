/**
 * Sketchbook cards drag (sticker-like)
 * - Drag with centered anchor
 * - Inertia on release
 * - Constrained to each day section bounds
 * - Mouse + touch support
 */
(function initSketchbookCardDrag() {
  const DRAG_THRESHOLD_PX = 2;
  const HOVER_SCALE = 1.03;
  const HOVER_DURATION = 0.16;
  const SCALE_ON_DRAG = 1.08;
  const SCALE_IN_DURATION = 0.2;
  const SCALE_OUT_DURATION = 0.28;
  const DRAG_ROTATION_MAX = 8;
  const RELEASE_ROTATION_MAX = 14;
  const INERTIA_DURATION = 0.6;
  const INERTIA_FRICTION = 0.35;
  const MIN_INERTIA_VELOCITY = 1.5;
  const CLICK_SUPPRESS_MS = 300;
  const BOUNDS_PADDING = 6;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function randomRotation(maxDegrees) {
    return (Math.random() * (maxDegrees * 2)) - maxDegrees;
  }

  class SketchbookCardDragSystem {
    constructor(card) {
      this.card = card;
      this.daySection = card.closest('.sketchbook-day-section');
      this.isDragging = false;
      this.isTouchDragging = false;
      this.activeTouchId = null;
      this.clickSuppressUntil = 0;

      this.offsetX = 0;
      this.offsetY = 0;
      this.lastX = 0;
      this.lastY = 0;
      this.lastTime = 0;
      this.velocity = { x: 0, y: 0 };

      this.startPointerX = 0;
      this.startPointerY = 0;
      this.dragStarted = false;

      this.scrollLockContextId = `sketchbook-card-${Math.random().toString(36).slice(2, 10)}`;

      this.startDrag = this.startDrag.bind(this);
      this.updateDrag = this.updateDrag.bind(this);
      this.endDrag = this.endDrag.bind(this);
      this.handleClickCapture = this.handleClickCapture.bind(this);
      this.preventNativeDrag = this.preventNativeDrag.bind(this);
      this.onMouseEnter = this.onMouseEnter.bind(this);
      this.onMouseLeave = this.onMouseLeave.bind(this);

      this.init();
    }

    init() {
      this.card.style.touchAction = 'manipulation';
      this.card.setAttribute('draggable', 'false');
      this.card.addEventListener('mousedown', this.startDrag);
      this.card.addEventListener('touchstart', this.startDrag, { passive: true });
      this.card.addEventListener('click', this.handleClickCapture, true);
      this.card.addEventListener('dragstart', this.preventNativeDrag);
      this.card.addEventListener('mouseenter', this.onMouseEnter);
      this.card.addEventListener('mouseleave', this.onMouseLeave);

      // Prevent browser native drag-and-drop for media inside cards (especially <img>).
      this.card.querySelectorAll('img, video, canvas, a').forEach((el) => {
        el.setAttribute('draggable', 'false');
        el.addEventListener('dragstart', this.preventNativeDrag);
      });
    }

    preventNativeDrag(event) {
      event.preventDefault();
    }

    onMouseEnter() {
      if (this.isDragging || typeof gsap === 'undefined') return;
      gsap.to(this.card, {
        scale: HOVER_SCALE,
        duration: HOVER_DURATION,
        ease: 'power2.out'
      });
    }

    onMouseLeave() {
      if (this.isDragging || typeof gsap === 'undefined') return;
      gsap.to(this.card, {
        scale: 1,
        duration: HOVER_DURATION,
        ease: 'power2.out'
      });
    }

    handleClickCapture(event) {
      if (Date.now() < this.clickSuppressUntil) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }

    getPointerFromEvent(event) {
      if (event.type.startsWith('touch')) {
        if (event.type === 'touchstart' && event.touches.length > 0) {
          const t = event.touches[0];
          return { x: t.clientX, y: t.clientY, id: t.identifier };
        }
        const list = event.touches && event.touches.length ? event.touches : event.changedTouches;
        if (!list || !list.length) return null;
        if (this.activeTouchId === null) {
          const t = list[0];
          return { x: t.clientX, y: t.clientY, id: t.identifier };
        }
        const found = Array.from(list).find((t) => t.identifier === this.activeTouchId);
        if (!found) return null;
        return { x: found.clientX, y: found.clientY, id: found.identifier };
      }
      return { x: event.clientX, y: event.clientY, id: null };
    }

    startDrag(event) {
      if (this.isDragging) return;
      if (event.type === 'mousedown' && event.button !== 0) return;
      if (event.target && event.target.closest && event.target.closest('a, button, input, textarea, select')) {
        return;
      }

      const pointer = this.getPointerFromEvent(event);
      if (!pointer) return;

      this.isTouchDragging = event.type.startsWith('touch');
      if (this.isTouchDragging) {
        this.activeTouchId = pointer.id;
      }

      const rect = this.card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      this.offsetX = pointer.x - centerX;
      this.offsetY = pointer.y - centerY;
      this.lastX = pointer.x;
      this.lastY = pointer.y;
      this.lastTime = Date.now();
      this.startPointerX = pointer.x;
      this.startPointerY = pointer.y;
      this.dragStarted = false;

      this.card.classList.add('is-card-dragging');
      if (typeof gsap !== 'undefined') {
        const dragRotation = randomRotation(DRAG_ROTATION_MAX);
        gsap.to(this.card, {
          scale: SCALE_ON_DRAG,
          rotation: dragRotation,
          duration: SCALE_IN_DURATION,
          ease: 'power2.out'
        });
      }

      document.addEventListener('mousemove', this.updateDrag);
      document.addEventListener('mouseup', this.endDrag);
      document.addEventListener('touchmove', this.updateDrag, { passive: false });
      document.addEventListener('touchend', this.endDrag, { passive: true });
      document.addEventListener('touchcancel', this.endDrag, { passive: true });
    }

    getSectionBounds() {
      if (!this.daySection) return null;
      const rect = this.daySection.getBoundingClientRect();
      return {
        left: rect.left + BOUNDS_PADDING,
        right: rect.right - BOUNDS_PADDING,
        top: rect.top + BOUNDS_PADDING,
        bottom: rect.bottom - BOUNDS_PADDING
      };
    }

    clampRelativePosition(candidateLeft, candidateTop) {
      const cardRect = this.card.getBoundingClientRect();
      const bounds = this.getSectionBounds();
      if (!bounds) return { left: candidateLeft, top: candidateTop };

      const currentLeft = parseFloat(this.card.style.left) || 0;
      const currentTop = parseFloat(this.card.style.top) || 0;

      const baseLeft = cardRect.left - currentLeft;
      const baseTop = cardRect.top - currentTop;

      const minLeft = bounds.left - baseLeft;
      const maxLeft = bounds.right - (baseLeft + cardRect.width);
      const minTop = bounds.top - baseTop;
      const maxTop = bounds.bottom - (baseTop + cardRect.height);

      return {
        left: clamp(candidateLeft, minLeft, maxLeft),
        top: clamp(candidateTop, minTop, maxTop)
      };
    }

    updateDrag(event) {
      const pointer = this.getPointerFromEvent(event);
      if (!pointer) return;

      const moveDx = pointer.x - this.startPointerX;
      const moveDy = pointer.y - this.startPointerY;
      if (!this.dragStarted) {
        const exceeded = Math.abs(moveDx) >= DRAG_THRESHOLD_PX || Math.abs(moveDy) >= DRAG_THRESHOLD_PX;
        if (!exceeded) return;
        this.dragStarted = true;
        this.isDragging = true;
        this.card.dispatchEvent(new CustomEvent('sketchbook:carddragstart', { bubbles: true }));
        if (this.isTouchDragging && window.TouchScrollLock && typeof window.TouchScrollLock.lock === 'function') {
          window.TouchScrollLock.lock(this.scrollLockContextId);
        }
      }

      if (this.isTouchDragging && event.cancelable) {
        event.preventDefault();
      }

      const now = Date.now();
      const deltaTime = (now - this.lastTime) / 1000;
      if (deltaTime > 0) {
        this.velocity.x = (pointer.x - this.lastX) / deltaTime;
        this.velocity.y = (pointer.y - this.lastY) / deltaTime;
      }
      this.lastX = pointer.x;
      this.lastY = pointer.y;
      this.lastTime = now;

      const rect = this.card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const targetCenterX = pointer.x - this.offsetX;
      const targetCenterY = pointer.y - this.offsetY;
      const moveX = targetCenterX - centerX;
      const moveY = targetCenterY - centerY;

      const currentLeft = parseFloat(this.card.style.left) || 0;
      const currentTop = parseFloat(this.card.style.top) || 0;
      const candidateLeft = currentLeft + moveX;
      const candidateTop = currentTop + moveY;
      const clamped = this.clampRelativePosition(candidateLeft, candidateTop);

      this.card.style.left = `${clamped.left}px`;
      this.card.style.top = `${clamped.top}px`;
    }

    endDrag(event) {
      if (event && event.type.startsWith('touch')) {
        const touchesLeft = event.touches && event.touches.length > 0;
        if (touchesLeft) {
          const activeStillPresent = Array.from(event.touches).some((t) => t.identifier === this.activeTouchId);
          if (activeStillPresent) return;
        }
      }

      document.removeEventListener('mousemove', this.updateDrag);
      document.removeEventListener('mouseup', this.endDrag);
      document.removeEventListener('touchmove', this.updateDrag, { passive: false });
      document.removeEventListener('touchend', this.endDrag, { passive: true });
      document.removeEventListener('touchcancel', this.endDrag, { passive: true });

      if (this.isTouchDragging && window.TouchScrollLock && typeof window.TouchScrollLock.unlock === 'function') {
        window.TouchScrollLock.unlock(this.scrollLockContextId);
      }

      this.card.classList.remove('is-card-dragging');
      if (typeof gsap !== 'undefined') {
        const releaseRotation = randomRotation(RELEASE_ROTATION_MAX);
        gsap.to(this.card, {
          scale: 1,
          rotation: releaseRotation,
          duration: SCALE_OUT_DURATION,
          ease: 'power2.out'
        });
      }

      const releaseVelocity = { x: this.velocity.x, y: this.velocity.y };

      if (this.dragStarted) {
        this.clickSuppressUntil = Date.now() + CLICK_SUPPRESS_MS;
      }

      if (this.dragStarted && typeof gsap !== 'undefined') {
        const currentLeft = parseFloat(this.card.style.left) || 0;
        const currentTop = parseFloat(this.card.style.top) || 0;

        let finalLeft = currentLeft;
        let finalTop = currentTop;
        if (Math.abs(this.velocity.x) > MIN_INERTIA_VELOCITY || Math.abs(this.velocity.y) > MIN_INERTIA_VELOCITY) {
          finalLeft = currentLeft + (this.velocity.x * INERTIA_DURATION * INERTIA_FRICTION);
          finalTop = currentTop + (this.velocity.y * INERTIA_DURATION * INERTIA_FRICTION);
        }

        const clampedFinal = this.clampRelativePosition(finalLeft, finalTop);
        gsap.to(this.card, {
          left: clampedFinal.left,
          top: clampedFinal.top,
          duration: INERTIA_DURATION,
          ease: 'power2.out'
        });
      }

      if (this.dragStarted) {
        this.card.dispatchEvent(new CustomEvent('sketchbook:carddragend', {
          bubbles: true,
          detail: { velocity: releaseVelocity }
        }));
      }

      this.isDragging = false;
      this.dragStarted = false;
      this.isTouchDragging = false;
      this.activeTouchId = null;
      this.velocity.x = 0;
      this.velocity.y = 0;
    }
  }

  function init() {
    const cards = document.querySelectorAll('.playground-card');
    cards.forEach((card) => {
      if (!card.closest('.sketchbook-day-section')) return;
      new SketchbookCardDragSystem(card);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
