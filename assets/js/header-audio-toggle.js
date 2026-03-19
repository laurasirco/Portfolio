(function initHeaderAudioToggle() {
  function getSfx() {
    return window.InteractionSFX || null;
  }

  function syncButton(button) {
    const sfx = getSfx();
    const state = sfx && typeof sfx.getState === 'function' ? sfx.getState() : { muted: true };
    const muted = !!state.muted;
    button.setAttribute('aria-pressed', muted ? 'true' : 'false');
    button.setAttribute('title', muted ? 'Audio muted' : 'Audio enabled');
  }

  function setup() {
    const button = document.getElementById('header-audio-toggle');
    if (!button) return;

    syncButton(button);

    button.addEventListener('click', () => {
      const sfx = getSfx();
      if (!sfx || typeof sfx.getState !== 'function' || typeof sfx.setMuted !== 'function') {
        return;
      }
      const state = sfx.getState();
      const nextMuted = !state.muted;
      sfx.setMuted(nextMuted);
      if (!nextMuted && typeof sfx.init === 'function') {
        sfx.init();
      }
      syncButton(button);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
