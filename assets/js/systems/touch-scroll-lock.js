/**
 * TouchScrollLock
 * Shared utility to temporarily block page scroll during touch interactions.
 *
 * API:
 *   TouchScrollLock.lock(contextId)
 *   TouchScrollLock.unlock(contextId)
 *   TouchScrollLock.isLocked()
 */
(function initTouchScrollLock(global) {
  if (global.TouchScrollLock) {
    return;
  }

  const activeContexts = new Set();

  function preventTouchMove(e) {
    if (activeContexts.size === 0) {
      return;
    }
    if (e.cancelable) {
      e.preventDefault();
    }
  }

  function applyLockedStyles() {
    document.documentElement.classList.add('touch-scroll-lock');
    document.body.classList.add('touch-scroll-lock');
    document.addEventListener('touchmove', preventTouchMove, { passive: false });
  }

  function removeLockedStyles() {
    document.documentElement.classList.remove('touch-scroll-lock');
    document.body.classList.remove('touch-scroll-lock');
    document.removeEventListener('touchmove', preventTouchMove, { passive: false });
  }

  const api = {
    lock(contextId = 'default') {
      const wasUnlocked = activeContexts.size === 0;
      activeContexts.add(String(contextId));
      if (wasUnlocked && activeContexts.size > 0) {
        applyLockedStyles();
      }
    },

    unlock(contextId = 'default') {
      activeContexts.delete(String(contextId));
      if (activeContexts.size === 0) {
        removeLockedStyles();
      }
    },

    isLocked() {
      return activeContexts.size > 0;
    }
  };

  global.TouchScrollLock = api;
})(window);
