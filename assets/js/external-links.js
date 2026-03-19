(function initExternalLinksTargetBlank() {
  function shouldSkipHref(href) {
    if (!href) return true;
    const value = href.trim();
    if (!value) return true;
    if (value.startsWith('#')) return true;
    if (value.startsWith('mailto:')) return true;
    if (value.startsWith('tel:')) return true;
    if (value.startsWith('javascript:')) return true;
    if (value.startsWith('data:')) return true;
    return false;
  }

  function isExternalLink(anchor) {
    const rawHref = anchor.getAttribute('href');
    if (shouldSkipHref(rawHref)) return false;

    try {
      const url = new URL(rawHref, window.location.href);
      return url.origin !== window.location.origin;
    } catch (_) {
      return false;
    }
  }

  function ensureSecureRel(anchor) {
    const currentRel = (anchor.getAttribute('rel') || '').trim();
    const parts = currentRel ? currentRel.split(/\s+/) : [];
    if (!parts.includes('noopener')) parts.push('noopener');
    if (!parts.includes('noreferrer')) parts.push('noreferrer');
    anchor.setAttribute('rel', parts.join(' ').trim());
  }

  function patchAnchor(anchor) {
    if (!anchor || anchor.tagName !== 'A') return;
    if (!isExternalLink(anchor)) return;
    anchor.setAttribute('target', '_blank');
    ensureSecureRel(anchor);
  }

  function patchAllExternalLinks(root) {
    const scope = root || document;
    const anchors = scope.querySelectorAll ? scope.querySelectorAll('a[href]') : [];
    anchors.forEach(patchAnchor);
  }

  function setupObserver() {
    if (typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!node || node.nodeType !== 1) return;
          if (node.tagName === 'A') {
            patchAnchor(node);
          }
          patchAllExternalLinks(node);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    patchAllExternalLinks(document);
    setupObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
