(function initHeaderMobileMenu() {
  function setup() {
    const header = document.querySelector('header');
    const toggle = document.getElementById('header-menu-toggle');
    const nav = document.getElementById('header-nav');
    if (!header || !toggle || !nav) return;

    function setOpen(open) {
      header.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !header.classList.contains('menu-open');
      setOpen(open);
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('click', (e) => {
      if (!header.classList.contains('menu-open')) return;
      if (header.contains(e.target)) return;
      setOpen(false);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900 && header.classList.contains('menu-open')) {
        setOpen(false);
      }
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
