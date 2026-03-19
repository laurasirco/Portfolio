/**
 * Interaction SFX system
 * - Configurable play/init/setEnabled/setVolume/setMuted
 * - Preload/cache when URLs are provided
 * - Silent fallback if audio fails or is blocked
 */
(function initInteractionSFXModule() {
  const SFX_VERSION = '20260319-7';
  window.__INTERACTION_SFX_VERSION = SFX_VERSION;
  try {
    console.info('[InteractionSFX] script loaded', SFX_VERSION);
  } catch (_) {}
  // Early safe stub so the global is always present.
  if (!window.InteractionSFX) {
    window.InteractionSFX = {
      init() {},
      play() {},
      setEnabled() {},
      setVolume() {},
      setMuted() {},
      getState() { return { enabled: false, muted: true, volume: 0 }; }
    };
  }

  const STORAGE_KEYS = {
    enabled: 'interaction-sfx-enabled',
    muted: 'interaction-sfx-muted',
    volume: 'interaction-sfx-volume'
  };

  const CONFIG = {
    enabled: true,
    muted: true,
    volume: 0.14,
    sounds: {
      stickerHover: { url: '', freq: 520, duration: 0.08, type: 'sine' },
      stickerDrop: { url: '', freq: 180, duration: 0.15, type: 'triangle' },
      cardPick: { url: '', freq: 300, duration: 0.09, type: 'sine' },
      cardDrop: { url: '', freq: 170, duration: 0.16, type: 'triangle' },
      popoverOpen: { url: '', freq: 420, duration: 0.12, type: 'triangle' },
      popoverClose: { url: '', freq: 180, duration: 0.14, type: 'sine' },
      popoverNavigate: { url: '', freq: 340, duration: 0.09, type: 'triangle' }
    }
  };
  const RANDOMIZATION = {
    freqJitterRatio: 0.06,
    durationJitterRatio: 0.12
  };

  const cache = new Map();
  let audioContext = null;
  let toneSynth = null;
  let toneDropSynth = null;
  let toneNoiseSynth = null;
  let toneOutputGain = null;
  let lastBackend = 'none';
  let debugEnabled = false;
  let initialized = false;

  function debugLog(message, payload = {}) {
    if (!debugEnabled) return;
    try {
      console.log('[InteractionSFX]', message, {
        ...payload,
        timestamp: new Date().toISOString()
      });
    } catch (_) {}
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function randomInRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function computeInertiaMagnitude(detail) {
    if (!detail || !detail.velocity) return 0;
    const vx = Number(detail.velocity.x || 0);
    const vy = Number(detail.velocity.y || 0);
    return Math.hypot(vx, vy);
  }

  function buildPlaybackParams(name, def, options = {}) {
    const jittered = { ...def };
    const freqBase = Number(def.freq || 440);
    const durationBase = Number(def.duration || 0.08);
    const freqJitter = 1 + randomInRange(-RANDOMIZATION.freqJitterRatio, RANDOMIZATION.freqJitterRatio);
    const durationJitter = 1 + randomInRange(-RANDOMIZATION.durationJitterRatio, RANDOMIZATION.durationJitterRatio);

    jittered.freq = clamp(freqBase * freqJitter, 80, 2400);
    jittered.duration = clamp(durationBase * durationJitter, 0.02, 1.2);
    jittered.gainScale = 1;

    const inertia = clamp(Number(options.inertia || 0), 0, 2600);
    if ((name === 'stickerDrop' || name === 'cardDrop') && inertia > 0) {
      const t = clamp(inertia / 1200, 0, 1);
      jittered.duration = clamp(jittered.duration * (1 + t * 0.7), 0.06, 1.4);
      jittered.gainScale = 1 + t * 0.25;
      jittered.freq = clamp(jittered.freq * (1 - t * 0.12), 80, 1800);
      jittered.noiseScale = 1 + t * 0.3;
      jittered.stepStrength = 1 + t * 0.28;
    } else {
      jittered.noiseScale = 1;
      jittered.stepStrength = 1;
    }

    return jittered;
  }

  function loadPersistedSettings() {
    let enabled = null;
    let muted = null;
    let volume = null;
    try {
      enabled = window.sessionStorage.getItem(STORAGE_KEYS.enabled);
      muted = window.sessionStorage.getItem(STORAGE_KEYS.muted);
      volume = window.sessionStorage.getItem(STORAGE_KEYS.volume);
    } catch (error) {
      return;
    }
    if (enabled !== null) CONFIG.enabled = enabled === 'true';
    if (muted !== null) CONFIG.muted = muted === 'true';
    if (volume !== null) CONFIG.volume = clamp(parseFloat(volume) || CONFIG.volume, 0, 1);
  }

  function persistSettings() {
    try {
      window.sessionStorage.setItem(STORAGE_KEYS.enabled, String(CONFIG.enabled));
      window.sessionStorage.setItem(STORAGE_KEYS.muted, String(CONFIG.muted));
      window.sessionStorage.setItem(STORAGE_KEYS.volume, String(CONFIG.volume));
    } catch (error) {
      // Silent fallback when storage is blocked.
    }
  }

  function ensureAudioContext() {
    if (audioContext && audioContext.state !== 'closed') return audioContext;
    if (audioContext && audioContext.state === 'closed') {
      audioContext = null;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    try {
      audioContext = new Ctx();
      return audioContext;
    } catch (error) {
      return null;
    }
  }

  function ensureToneSynth() {
    if (typeof window.Tone === 'undefined') return null;
    if (toneSynth) return toneSynth;
    try {
      toneOutputGain = new window.Tone.Gain(0.9).toDestination();
      toneSynth = new window.Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.003,
          decay: 0.09,
          sustain: 0.04,
          release: 0.12
        }
      }).connect(toneOutputGain);
      toneDropSynth = new window.Tone.MembraneSynth({
        pitchDecay: 0.025,
        octaves: 2,
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.001,
          decay: 0.18,
          sustain: 0.0,
          release: 0.08
        }
      }).connect(toneOutputGain);
      toneNoiseSynth = new window.Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: {
          attack: 0.001,
          decay: 0.07,
          sustain: 0.0,
          release: 0.02
        }
      }).connect(toneOutputGain);
      if (window.Tone && window.Tone.Destination) {
        window.Tone.Destination.mute = false;
        window.Tone.Destination.volume.value = 0;
      }
      toneSynth.volume.value = 0;
      debugLog('Tone synth initialized');
      return toneSynth;
    } catch (error) {
      debugLog('Tone synth init failed', { error: String(error) });
      return null;
    }
  }

  function unlockAudio() {
    debugLog('unlockAudio called', {
      toneLoaded: typeof window.Tone !== 'undefined',
      toneState: (window.Tone && window.Tone.context && window.Tone.context.state) ? window.Tone.context.state : 'unavailable'
    });
    if (typeof window.Tone !== 'undefined' && typeof window.Tone.start === 'function') {
      window.Tone.start()
        .then(() => {
          debugLog('Tone.start resolved', {
            toneState: (window.Tone && window.Tone.context && window.Tone.context.state) ? window.Tone.context.state : 'unavailable'
          });
        })
        .catch((error) => debugLog('Tone.start rejected', { error: String(error) }));
    }
    const ctx = ensureAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  function preload() {
    Object.entries(CONFIG.sounds).forEach(([name, def]) => {
      if (!def.url) {
        cache.set(name, { available: false, audio: null });
        return;
      }

      try {
        const audio = new Audio(def.url);
        audio.preload = 'auto';
        audio.load();
        cache.set(name, { available: true, audio });
      } catch (error) {
        cache.set(name, { available: false, audio: null });
      }
    });
  }

  function canPlay() {
    return CONFIG.enabled && !CONFIG.muted && CONFIG.volume > 0;
  }

  function toToneNote(freq) {
    const f = clamp(freq || 440, 80, 2000);
    return f;
  }

  function playTone(def) {
    if (!canPlay()) return false;
    const synth = ensureToneSynth();
    if (!synth || typeof window.Tone === 'undefined') return false;
    if (window.Tone.context && window.Tone.context.state !== 'running') {
      debugLog('playTone deferred (context not running)', {
        toneState: window.Tone.context.state,
        def
      });
      window.Tone.start().catch(() => {});
      return false;
    }
    try {
      const duration = Math.max(0.02, def.duration || 0.05);
      const velocity = clamp(CONFIG.volume * (def.gainScale || 1), 0, 1);
      const oscType = def.type || 'triangle';
      synth.set({ oscillator: { type: oscType } });
      const noteHz = toToneNote(def.freq);
      if (toneOutputGain && toneOutputGain.gain) {
        toneOutputGain.gain.value = clamp((0.22 + CONFIG.volume * 0.78) * (def.gainScale || 1), 0, 1);
      }
      synth.triggerAttackRelease(noteHz, duration, window.Tone.now(), velocity);
      lastBackend = 'tone';
      debugLog('playTone OK', { noteHz, duration, velocity, oscType });
      return true;
    } catch (error) {
      debugLog('playTone failed', { error: String(error), def });
      return false;
    }
  }

  function playToneDrop(def) {
    if (!canPlay()) return false;
    const synth = ensureToneSynth();
    if (!synth || typeof window.Tone === 'undefined' || !toneDropSynth || !toneNoiseSynth) return false;
    if (window.Tone.context && window.Tone.context.state !== 'running') {
      window.Tone.start().catch(() => {});
      return false;
    }
    try {
      const duration = Math.max(0.08, def.duration || 0.15);
      const velocity = clamp(CONFIG.volume * 1.15 * (def.gainScale || 1), 0, 0.72);
      const noteHz = clamp(def.freq || 180, 90, 420);
      if (toneOutputGain && toneOutputGain.gain) {
        toneOutputGain.gain.value = clamp((0.14 + CONFIG.volume * 0.55) * (def.gainScale || 1), 0, 0.78);
      }
      toneDropSynth.triggerAttackRelease(noteHz, duration, window.Tone.now(), velocity * (def.stepStrength || 1));
      toneNoiseSynth.triggerAttackRelease(
        Math.min(0.09, duration * 0.4),
        window.Tone.now(),
        clamp(velocity * 0.3 * (def.noiseScale || 1), 0, 0.75)
      );
      lastBackend = 'tone';
      debugLog('playToneDrop OK', { noteHz, duration, velocity });
      return true;
    } catch (error) {
      debugLog('playToneDrop failed', { error: String(error), def });
      return false;
    }
  }

  function playSynth(def) {
    if (!canPlay()) return;
    const ctx = ensureAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
      return;
    }

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = def.type || 'sine';
      osc.frequency.value = def.freq || 440;
      gain.gain.value = 0;

      const now = ctx.currentTime;
      const dur = def.duration || 0.05;
      const peak = clamp(CONFIG.volume * 0.2 * (def.gainScale || 1), 0, 0.33);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(peak, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.01);
      lastBackend = 'webaudio';
      debugLog('playSynth OK', { freq: def.freq, dur, peak, ctxState: ctx.state });
    } catch (error) {
      // Silent fallback
      debugLog('playSynth failed', { error: String(error), def });
    }
  }

  function playSynthDrop(def) {
    if (!canPlay()) return;
    const ctx = ensureAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
      return;
    }
    try {
      const now = ctx.currentTime;
      const dur = Math.max(0.08, def.duration || 0.15);
      const freq = clamp(def.freq || 180, 90, 420);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq * 1.25, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(70, freq * 0.55), now + dur);

      const peak = clamp(CONFIG.volume * 0.18 * (def.gainScale || 1), 0, 0.2);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peak, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * Math.min(0.07, dur * 0.35)), ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * (0.26 * (def.noiseScale || 1));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.0001, now);
      noiseGain.gain.exponentialRampToValueAtTime(peak * 0.42 * (def.noiseScale || 1), now + 0.004);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + Math.min(0.07, dur * 0.35));

      osc.connect(gain);
      gain.connect(ctx.destination);
      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + dur + 0.01);
      noise.start(now);
      noise.stop(now + Math.min(0.08, dur * 0.4));
      lastBackend = 'webaudio';
      debugLog('playSynthDrop OK', { freq, dur, peak });
    } catch (error) {
      debugLog('playSynthDrop failed', { error: String(error), def });
    }
  }

  function playFromCache(name, def) {
    if (playTone(def)) return;

    const cached = cache.get(name);
    if (!cached || !cached.available || !cached.audio) {
      playSynth(def);
      return;
    }

    try {
      const node = cached.audio.cloneNode();
      node.volume = clamp(CONFIG.volume, 0, 1);
      node.play().then(() => {
        lastBackend = 'html-audio';
        debugLog('HTMLAudio play OK', { name, volume: node.volume });
      }).catch((error) => {
        debugLog('HTMLAudio play failed; fallback synth', { name, error: String(error) });
        unlockAudio();
        playSynth(def);
      });
    } catch (error) {
      debugLog('HTMLAudio clone/play failed; fallback synth', { name, error: String(error) });
      playSynth(def);
    }
  }

  function play(name, options = {}) {
    if (!canPlay()) return;
    debugLog('play requested', {
      name,
      enabled: CONFIG.enabled,
      muted: CONFIG.muted,
      volume: CONFIG.volume,
      toneLoaded: typeof window.Tone !== 'undefined',
      toneState: (window.Tone && window.Tone.context && window.Tone.context.state) ? window.Tone.context.state : 'unavailable'
    });
    unlockAudio();
    const def = CONFIG.sounds[name];
    if (!def) return;
    const playbackDef = buildPlaybackParams(name, def, options);
    if (name === 'stickerDrop' || name === 'cardDrop') {
      if (!playToneDrop(playbackDef)) {
        playSynthDrop(playbackDef);
      }
      return;
    }
    playFromCache(name, playbackDef);
  }

  function setEnabled(enabled) {
    CONFIG.enabled = !!enabled;
    persistSettings();
  }

  function setVolume(volume) {
    CONFIG.volume = clamp(volume, 0, 1);
    persistSettings();
  }

  function setMuted(muted) {
    CONFIG.muted = !!muted;
    persistSettings();
  }

  function getState() {
    return {
      version: SFX_VERSION,
      enabled: CONFIG.enabled,
      muted: CONFIG.muted,
      volume: CONFIG.volume,
      backend: lastBackend,
      debug: debugEnabled,
      toneLoaded: typeof window.Tone !== 'undefined',
      toneState: (window.Tone && window.Tone.context && window.Tone.context.state) ? window.Tone.context.state : 'unavailable'
    };
  }

  function debugPing() {
    debugLog('debugPing requested');
    const testDef = { freq: 440, duration: 0.35, type: 'triangle' };
    const tonePlayed = playTone(testDef);
    if (!tonePlayed) {
      playSynth(testDef);
    }
    return getState();
  }

  function setDebug(enabled) {
    debugEnabled = !!enabled;
    if (debugEnabled) {
      debugLog('Debug enabled', getState());
    }
  }

  function setupInteractionBindings() {
    const hoverThrottle = new WeakMap();
    const HOVER_INTERVAL_MS = 120;

    document.addEventListener('pointerenter', (event) => {
      const target = event.target && event.target.closest
        ? event.target.closest('.sticker-wrapper, .playground-card, .popover-nav-button')
        : null;
      if (!target) return;
      const now = Date.now();
      const last = hoverThrottle.get(target) || 0;
      if (now - last < HOVER_INTERVAL_MS) return;
      hoverThrottle.set(target, now);
      play('stickerHover');
    }, true);

    // Sticker pick intentionally disabled to avoid overlap with hover sound.
    document.addEventListener('sticker:dragend', (event) => play('stickerDrop', { inertia: computeInertiaMagnitude(event && event.detail) }));
    document.addEventListener('sketchbook:carddragstart', () => play('cardPick'));
    document.addEventListener('sketchbook:carddragend', (event) => play('cardDrop', { inertia: computeInertiaMagnitude(event && event.detail) }));
    document.addEventListener('sketchbook:popoveropen', () => play('popoverOpen'));
    document.addEventListener('sketchbook:popoverclose', () => play('popoverClose'));
    document.addEventListener('sketchbook:popovernavigate', () => play('popoverNavigate'));
  }

  function init() {
    if (initialized) return;
    initialized = true;
    loadPersistedSettings();
    preload();
    setupInteractionBindings();

    const unlockOnce = () => {
      unlockAudio();
      document.removeEventListener('pointerdown', unlockOnce, true);
      document.removeEventListener('touchstart', unlockOnce, true);
      document.removeEventListener('keydown', unlockOnce, true);
      document.removeEventListener('wheel', unlockOnce, true);
      document.removeEventListener('touchmove', unlockOnce, true);
      document.removeEventListener('scroll', unlockOnce, true);
    };
    document.addEventListener('pointerdown', unlockOnce, true);
    document.addEventListener('touchstart', unlockOnce, true);
    document.addEventListener('keydown', unlockOnce, true);
    document.addEventListener('wheel', unlockOnce, true);
    document.addEventListener('touchmove', unlockOnce, true);
    document.addEventListener('scroll', unlockOnce, true);

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        unlockAudio();
      }
    });
  }

  window.InteractionSFX = {
    version: SFX_VERSION,
    init,
    play,
    setEnabled,
    setVolume,
    setMuted,
    getState,
    debugPing,
    setDebug
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
