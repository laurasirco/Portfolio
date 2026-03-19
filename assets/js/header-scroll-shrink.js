/**
 * Header scroll shrink
 * - Shrinks fixed header progressively with GSAP + ScrollTrigger
 * - Works with native scroll and ScrollSmoother
 */
(function initHeaderScrollShrink() {
  function getMetrics() {
    const w = window.innerWidth;
    if (w <= 360) {
      return {
        headerPad: 4,
        headerPadCompact: 4,
        headerMinHeight: 50,
        headerMinHeightCompact: 49,
        navMargin: 5,
        navMarginCompact: 4,
        rightMargin: 5,
        rightMarginCompact: 4,
        logoScale: 0.96
      };
    }
    if (w <= 480) {
      return {
        headerPad: 6,
        headerPadCompact: 5,
        headerMinHeight: 54,
        headerMinHeightCompact: 52,
        navMargin: 10,
        navMarginCompact: 8,
        rightMargin: 10,
        rightMarginCompact: 8,
        logoScale: 0.94
      };
    }
    if (w <= 768) {
      return {
        headerPad: 8,
        headerPadCompact: 6,
        headerMinHeight: 60,
        headerMinHeightCompact: 57,
        navMargin: 15,
        navMarginCompact: 11,
        rightMargin: 15,
        rightMarginCompact: 11,
        logoScale: 0.92
      };
    }
    return {
      headerPad: 10,
      headerPadCompact: 8,
      headerMinHeight: 68,
      headerMinHeightCompact: 64,
      navMargin: 30,
      navMarginCompact: 24,
      rightMargin: 10,
      rightMarginCompact: 8,
      logoScale: 0.9
    };
  }

  function setup() {
    const header = document.querySelector('header');
    if (!header) return;

    const nav = header.querySelector('.header-nav');
    const right = header.querySelector('.header-right');
    const logoLink = header.querySelector('.header-center a');
    const SHRINK_DISTANCE = 180;
    const SCRUB = true;
    let tl = null;
    let st = null;
    let resizeTimer = null;

    function applyExpandedState(metrics) {
      if (typeof gsap !== 'undefined') {
        gsap.set(header, { padding: metrics.headerPad, minHeight: metrics.headerMinHeight });
        if (nav) {
          gsap.set(nav, { marginLeft: metrics.navMargin });
        }
        if (right) {
          gsap.set(right, { marginRight: metrics.rightMargin });
        }
        if (logoLink) {
          gsap.set(logoLink, { scale: 1, transformOrigin: '50% 50%' });
        }
      } else {
        header.style.padding = `${metrics.headerPad}px`;
        header.style.minHeight = `${metrics.headerMinHeight}px`;
      }
    }

    function buildTimeline() {
      const metrics = getMetrics();
      if (tl) tl.kill();
      if (st) st.kill();
      applyExpandedState(metrics);

      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        return;
      }

      tl = gsap.timeline({ paused: true });
      tl.to(header, {
        paddingTop: metrics.headerPadCompact,
        paddingRight: metrics.headerPadCompact,
        paddingBottom: metrics.headerPadCompact,
        paddingLeft: metrics.headerPadCompact,
        minHeight: metrics.headerMinHeightCompact,
        duration: 1,
        ease: 'none'
      }, 0);

      if (nav) {
        tl.to(nav, {
          marginLeft: metrics.navMarginCompact,
          duration: 1,
          ease: 'none'
        }, 0);
      }

      if (right) {
        tl.to(right, {
          marginRight: metrics.rightMarginCompact,
          duration: 1,
          ease: 'none'
        }, 0);
      }

      if (logoLink) {
        tl.to(logoLink, {
          scale: metrics.logoScale,
          duration: 1,
          ease: 'none'
        }, 0);
      }

      st = ScrollTrigger.create({
        id: 'header-shrink',
        animation: tl,
        start: 0,
        end: SHRINK_DISTANCE,
        scrub: SCRUB,
        invalidateOnRefresh: true
      });

      ScrollTrigger.refresh();
    }

    window.addEventListener('resize', () => {
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
      resizeTimer = setTimeout(buildTimeline, 120);
    }, { passive: true });

    buildTimeline();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
