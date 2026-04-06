/**
 * GSAP Scroll Animations with ScrollSmoother
 * Implements parallax effects for elements with .parallax-element class
 */

// ============================================
// CONFIGURATION VARIABLES
// ============================================

// ScrollSmoother Configuration
const SMOOTH_SCROLL_ENABLED = true; // Enabled with correct structure (fixed elements outside wrapper)
const SCROLL_SMOOTHER_SMOOTH = 0.65; // Lower = more responsive, less floaty
const SCROLL_SMOOTHER_EFFECTS = true; // Enable data-speed and data-lag effects

// Parallax Configuration
const PARALLAX_START_Y = 20; // Starting Y position (starts slightly below)
const PARALLAX_END_Y = 0; // Ending Y position (ends at natural position)
const PARALLAX_SCRUB_DURATION = 1.0; // Lag effect
const PARALLAX_START_TRIGGER = "top bottom"; // Starts when element enters viewport
const PARALLAX_END_TRIGGER = "bottom top"; // Ends when element leaves viewport
const PARALLAX_STAGGER_DELAY = 0.05; // Small delay between elements

// About Page Fade-in Configuration
const ABOUT_FADE_START_Y = 30; // Starting Y position for about page elements
const ABOUT_FADE_DURATION = 0.8; // Duration of fade-in animation
const ABOUT_STAGGER_DELAY = 0.08; // Delay between each element's animation (reduced from 0.15)

// Welcome Text Fade-in Configuration
const WELCOME_FADE_START_Y = 30; // Starting Y position for welcome text
const WELCOME_FADE_DURATION = 1.2; // Duration of fade-in animation

// Stickers Fade-in Configuration
const STICKERS_FADE_START_Y = 20; // Starting Y position for stickers
const STICKERS_FADE_DURATION = 0.8; // Duration of fade-in animation
const STICKERS_STAGGER_DELAY = 0.15; // Delay between each sticker's animation
const STICKERS_FADE_DELAY = 0.4; // Delay before stickers start fading in

// Menu Hover Configuration
const MENU_FONT_WEIGHT_HOVER = 500; // Font weight on hover (should match $menu-font-weight-hover in SCSS)
const MENU_HOVER_DURATION = 0.3; // Duration of hover animation
const MENU_SKEW_ANGLE = -8; // Skew angle in degrees (negative = italic-like slant)

// ============================================
// SCROLL SMOOTHER IMPLEMENTATION
// ============================================

let smoother;
let smoothRefreshTimer = null;

function isAboutPage() {
  return window.location.pathname.includes('/about');
}

function isBacklogPage() {
  return window.location.pathname.includes('/backlog');
}

function isTouchDevice() {
  return (
    window.matchMedia('(pointer: coarse)').matches ||
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0
  );
}

function shouldEnableSmoothScroll() {
  if (!SMOOTH_SCROLL_ENABLED) {
    return false;
  }

  // Preserve native scroll on About, Backlog, and touch devices.
  if (isAboutPage() || isBacklogPage() || isTouchDevice()) {
    return false;
  }

  return true;
}

function initSmoothScroll() {
  const enableSmooth = shouldEnableSmoothScroll();
  document.body.classList.toggle('native-scroll', !enableSmooth);

  if (!enableSmooth || typeof ScrollSmoother === 'undefined') {
    console.warn('ScrollSmoother not available or disabled');
    return null;
  }

  // Register plugins
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

  // Create ScrollSmoother instance
  smoother = ScrollSmoother.create({
    wrapper: '#smooth-wrapper',
    content: '#smooth-content',
    smooth: SCROLL_SMOOTHER_SMOOTH,
    effects: SCROLL_SMOOTHER_EFFECTS,
    smoothTouch: 0.1 // Smooth scroll on touch devices (0.1 = subtle)
  });

  return smoother;
}

function scheduleSmoothScrollRefresh(delay = 0) {
  if (typeof ScrollTrigger === 'undefined') {
    return;
  }

  window.clearTimeout(smoothRefreshTimer);
  smoothRefreshTimer = window.setTimeout(() => {
    requestAnimationFrame(() => {
      if (smoother && typeof smoother.refresh === 'function') {
        smoother.refresh();
      }
      ScrollTrigger.refresh();
    });
  }, delay);
}

function bindSmoothScrollRefresh() {
  if (typeof ScrollTrigger === 'undefined') {
    return;
  }

  const mediaElements = document.querySelectorAll('img, video, iframe');

  mediaElements.forEach((element) => {
    if (element.tagName === 'IMG') {
      if (element.complete) return;
      element.addEventListener('load', () => scheduleSmoothScrollRefresh(0), { once: true });
      element.addEventListener('error', () => scheduleSmoothScrollRefresh(0), { once: true });
      return;
    }

    if (element.tagName === 'VIDEO') {
      element.addEventListener('loadedmetadata', () => scheduleSmoothScrollRefresh(0), { once: true });
      element.addEventListener('loadeddata', () => scheduleSmoothScrollRefresh(0), { once: true });
      return;
    }

    element.addEventListener('load', () => scheduleSmoothScrollRefresh(0), { once: true });
  });

  window.addEventListener('load', () => {
    scheduleSmoothScrollRefresh(0);
    scheduleSmoothScrollRefresh(250);
    scheduleSmoothScrollRefresh(1000);
  }, { once: true });
}

// ============================================
// MENU HOVER ANIMATIONS
// ============================================

/**
 * Initialize menu hover animations
 */
function initMenuHoverAnimations() {
  const menuItems = document.querySelectorAll('header nav a:not(.active)');
  
  menuItems.forEach(item => {
    // Store original font weight
    const originalFontWeight = window.getComputedStyle(item).fontWeight;
    
    // Set initial transform state
    gsap.set(item, { skewX: 0 });
    
    item.addEventListener('mouseenter', () => {
      gsap.to(item, {
        fontWeight: MENU_FONT_WEIGHT_HOVER,
        skewX: MENU_SKEW_ANGLE,
        duration: MENU_HOVER_DURATION,
        ease: 'power2.out',
        force3D: true
      });
    });
    
    item.addEventListener('mouseleave', () => {
      gsap.to(item, {
        fontWeight: originalFontWeight,
        skewX: 0,
        duration: MENU_HOVER_DURATION,
        ease: 'power2.out',
        force3D: true
      });
    });
  });
}

// ============================================
// PARALLAX ANIMATIONS
// ============================================

/**
 * Auto-add parallax class to portfolio entries
 */
function autoAddParallaxToPortfolio() {
  // Add parallax-element class to work grid items
  const workGridItems = document.querySelectorAll('.work_grid');
  workGridItems.forEach(item => {
    if (!item.classList.contains('parallax-element')) {
      item.classList.add('parallax-element');
    }
  });
  
  // Add parallax-element class to playground cards
  const playgroundCards = document.querySelectorAll('.playground-card');
  playgroundCards.forEach(card => {
    if (!card.classList.contains('parallax-element')) {
      card.classList.add('parallax-element');
    }
  });
}

/**
 * Initialize welcome text fade-in animation
 */
function initWelcomeTextFadeIn() {
  const welcomeText = document.querySelector('.welcome-text');
  if (!welcomeText) return;
  
  // Set initial state (hidden and below)
  gsap.set(welcomeText, { 
    opacity: 0, 
    y: WELCOME_FADE_START_Y 
  });
  
  // Animate with fade in
  gsap.to(welcomeText, {
    opacity: 1,
    y: 0,
    duration: WELCOME_FADE_DURATION,
    ease: "power2.out",
    delay: 0.2 // Small delay before animation starts
  });
}

/**
 * Initialize stickers fade-in animation
 */
function initStickersFadeIn() {
  const stickers = document.querySelectorAll('.sticker-wrapper');
  if (stickers.length === 0) return;
  
  // Set initial state (hidden and below)
  gsap.set(stickers, { 
    opacity: 0, 
    y: STICKERS_FADE_START_Y 
  });
  
  // Animate stickers with stagger
  gsap.to(stickers, {
    opacity: 1,
    y: 0,
    duration: STICKERS_FADE_DURATION,
    stagger: STICKERS_STAGGER_DELAY,
    ease: "power2.out",
    delay: STICKERS_FADE_DELAY // Delay before stickers start fading in
  });
}

/**
 * Initialize about page fade-in animations
 */
function initAboutPageAnimations() {
  // Check if we're on the about page by looking for the about permalink
  if (!isAboutPage()) return;
  
  // Select the container on the about page
  const aboutContainer = document.querySelector('.container.header_margin');
  if (!aboutContainer) return;
  
  // Select all children elements to animate
  const aboutElements = aboutContainer.querySelectorAll('h2, p, img, .row, .col');
  
  if (aboutElements.length === 0) return;
  
  // Set initial state (hidden and below)
  gsap.set(aboutElements, { 
    opacity: 0, 
    y: ABOUT_FADE_START_Y 
  });
  
  // Animate elements with stagger
  gsap.to(aboutElements, {
    opacity: 1,
    y: 0,
    duration: ABOUT_FADE_DURATION,
    stagger: ABOUT_STAGGER_DELAY,
    ease: "power2.out",
    scrollTrigger: {
      trigger: aboutContainer,
      start: "top 80%",
      toggleActions: "play none none none"
    }
  });
}

/**
 * Initialize works page fade-in animations
 */
function initWorksPageAnimations() {
  // Check if we're on the works page
  const isWorksPage = window.location.pathname.includes('/work');
  if (!isWorksPage) return;
  
  // Select all work_grid items
  const workItems = document.querySelectorAll('.work_grid');
  
  if (workItems.length === 0) return;
  
  // Set initial state (hidden and below)
  gsap.set(workItems, { 
    opacity: 0, 
    y: ABOUT_FADE_START_Y 
  });
  
  // Animate elements with stagger
  gsap.to(workItems, {
    opacity: 1,
    y: 0,
    duration: ABOUT_FADE_DURATION,
    stagger: ABOUT_STAGGER_DELAY,
    ease: "power2.out",
    scrollTrigger: {
      trigger: '.work_container',
      start: "top 80%",
      toggleActions: "play none none none"
    }
  });
}

/**
 * Initialize sketchbook page fade-in animations
 * Mirrors About/Works behavior with per-day staggered reveal.
 */
function initSketchbookPageAnimations() {
  const isSketchbookPage = window.location.pathname.includes('/sketchbook');
  if (!isSketchbookPage) return;

  const daySections = document.querySelectorAll('.sketchbook-day-section');
  if (daySections.length === 0) return;

  daySections.forEach((section) => {
    const animatedElements = section.querySelectorAll(
      '.sketchbook-day-divider, .sketchbook-day-heading, .playground-card'
    );

    if (animatedElements.length === 0) return;

    gsap.set(animatedElements, {
      opacity: 0,
      y: ABOUT_FADE_START_Y
    });

    gsap.to(animatedElements, {
      opacity: 1,
      y: 0,
      duration: ABOUT_FADE_DURATION,
      stagger: ABOUT_STAGGER_DELAY,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  });
}

/**
 * Initialize individual portfolio entry animations
 */
function initPortfolioEntryAnimations() {
  // Check if we're on an individual portfolio entry page
  const workPage = document.querySelector('.work_page');
  if (!workPage) return;
  
  // Select all direct children and major elements to animate
  const entryElements = workPage.querySelectorAll('video, iframe, img, h1, h2, h3, p, div, section, .d-flex');
  
  if (entryElements.length === 0) return;
  
  // FIRST: Add parallax-element class BEFORE setting initial state
  entryElements.forEach((element) => {
    if (!element.classList.contains('parallax-element')) {
      element.classList.add('parallax-element');
    }
  });
  
  // THEN: Set initial state (hidden and below)
  gsap.set(entryElements, { 
    opacity: 0, 
    y: ABOUT_FADE_START_Y 
  });
  
  // FINALLY: Animate elements with stagger
  gsap.to(entryElements, {
    opacity: 1,
    y: 0,
    duration: ABOUT_FADE_DURATION,
    stagger: ABOUT_STAGGER_DELAY,
    ease: "power2.out"
  });
}

/**
 * Initialize parallax animations on page load
 */
function initParallaxAnimations() {
  // Check if GSAP and ScrollTrigger are available
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP not available, parallax animations disabled');
    return;
  }

  // Initialize smooth scroll
  initSmoothScroll();
  bindSmoothScrollRefresh();
  
  // Initialize menu hover animations
  initMenuHoverAnimations();
  
  // Initialize welcome text fade-in
  initWelcomeTextFadeIn();
  
  // Initialize stickers fade-in
  initStickersFadeIn();
  
  // Auto-add parallax class to portfolio entries
  autoAddParallaxToPortfolio();
  
  // Initialize about page animations
  initAboutPageAnimations();
  
  // Initialize works page animations
  initWorksPageAnimations();

  // Initialize sketchbook page animations
  initSketchbookPageAnimations();
  
  // Initialize individual portfolio entry animations (this adds parallax classes)
  initPortfolioEntryAnimations();

  // Apply parallax to all elements with parallax-element class
  const parallaxElements = document.querySelectorAll('.parallax-element');

  // Apply parallax animation to each element with staggered delay
  parallaxElements.forEach((element, index) => {
    // Set initial state
    gsap.set(element, { willChange: 'transform' });
    
    gsap.fromTo(element, 
      {
        y: PARALLAX_START_Y
      },
      {
        y: PARALLAX_END_Y,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: PARALLAX_START_TRIGGER,
          end: PARALLAX_END_TRIGGER,
          scrub: PARALLAX_SCRUB_DURATION + (index * PARALLAX_STAGGER_DELAY), // Add stagger delay
          invalidateOnRefresh: true
        }
      }
    );
  });

  scheduleSmoothScrollRefresh(0);
}

// Initialize animations when DOM is ready
document.addEventListener('DOMContentLoaded', initParallaxAnimations);
