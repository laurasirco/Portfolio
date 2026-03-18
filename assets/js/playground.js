// Global state for popover
let currentPopoverIndex = -1;
let popoverElement = null;
let nextPopoverElement = null;
let overlayElement = null;
let allCards = [];
let popoverJustOpened = false;
let popoverPositionListeners = null;

/**
 * Center popover using absolute positioning based on window center
 * Calculates the center of the window and positions the popover there
 * This avoids CSS transform conflicts with GSAP animations
 */
function centerPopover(element) {
  if (!element) return;
  
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const elementWidth = element.offsetWidth;
  const elementHeight = element.offsetHeight;
  
  // Calculate center position (center of element at center of window)
  const centerX = (windowWidth / 2) - (elementWidth / 2);
  const centerY = (windowHeight / 2) - (elementHeight / 2);
  
  element.style.left = centerX + 'px';
  element.style.top = centerY + 'px';
}

function recenterVisiblePopovers() {
  [popoverElement, nextPopoverElement].forEach((el) => {
    if (!el) return;
    const isVisible = el.style.display !== 'none' && el.classList.contains('active');
    if (isVisible) {
      centerPopover(el);
    }
  });
}

function detachPopoverPositionListeners() {
  if (!popoverPositionListeners) return;
  window.removeEventListener('resize', popoverPositionListeners.update);
  window.removeEventListener('orientationchange', popoverPositionListeners.update);
  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', popoverPositionListeners.update);
  }
  popoverPositionListeners = null;
}

function attachPopoverPositionListeners() {
  detachPopoverPositionListeners();
  const update = () => recenterVisiblePopovers();
  window.addEventListener('resize', update);
  window.addEventListener('orientationchange', update);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', update);
  }
  popoverPositionListeners = { update };
}

// Create popover HTML structure with dual popover instances
function createPopoverStructure() {
  // Create overlay
  overlayElement = document.createElement('div');
  overlayElement.className = 'playground-overlay';
  overlayElement.addEventListener('click', (e) => {
    // Prevent closing if popover just opened
    if (popoverJustOpened) {
      return;
    }
    closePopover();
  });
  document.body.appendChild(overlayElement);
  
  // Create first popover container (current)
  popoverElement = createPopoverInstance();
  popoverElement.id = 'popover-current';
  document.body.appendChild(popoverElement);
  
  // Create second popover container (next - off-screen)
  nextPopoverElement = createPopoverInstance();
  nextPopoverElement.id = 'popover-next';
  nextPopoverElement.style.display = 'none';
  document.body.appendChild(nextPopoverElement);
  
  // Create navigation buttons positioned outside the popover
  const prevBtn = document.createElement('button');
  prevBtn.className = 'popover-nav-button prev';
  prevBtn.innerHTML = '←';
  prevBtn.addEventListener('click', prevCard);
  document.body.appendChild(prevBtn);
  
  const nextBtn = document.createElement('button');
  nextBtn.className = 'popover-nav-button next';
  nextBtn.innerHTML = '→';
  nextBtn.addEventListener('click', nextCard);
  document.body.appendChild(nextBtn);
  
  // Add touch handlers for swipe gestures
  addSwipeHandlers();
  
  // Add keyboard handlers
  addKeyboardHandlers();
}

// Helper function to create a popover instance
function createPopoverInstance() {
  const popover = document.createElement('div');
  popover.className = 'playground-popover';
  
  // Create header with close button
  const header = document.createElement('div');
  header.className = 'popover-header';
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'popover-close-btn';
  closeBtn.innerHTML = '✕';
  closeBtn.addEventListener('click', closePopover);
  
  header.appendChild(closeBtn);
  popover.appendChild(header);
  
  // Create content area
  const content = document.createElement('div');
  content.className = 'popover-content';
  popover.appendChild(content);
  
  // Navigation buttons are now positioned outside the popover using fixed positioning
  // They are created separately and appended to the body
  
  return popover;
}

// Add swipe gesture detection
function addSwipeHandlers() {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  
  const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
  };
  
  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndTime = Date.now();
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchEndY - touchStartY;
    const duration = touchEndTime - touchStartTime;
    
    // Calculate velocity for fast swipe detection
    const velocity = Math.abs(diffY) / duration;
    
    // Task 4.5: Implement swipe down to close
    // Detect vertical swipe (minimum 50px distance or fast swipe)
    if (Math.abs(diffY) > 50 && Math.abs(diffX) < 30) {
      if (diffY > 0) {
        // Swipe down: close popover with animation
        // Support velocity-based closing (fast swipe closes immediately)
        closePopoverWithSwipe();
        return;
      }
    }
    
    // Task 4.2: Implement swipe gesture detection for horizontal navigation
    // Only consider horizontal swipes (not vertical scrolls)
    if (Math.abs(diffX) > 50 && Math.abs(diffY) < 30) {
      if (diffX > 0) {
        // Swipe left: next card
        nextCard();
      } else {
        // Swipe right: previous card
        prevCard();
      }
    }
  };
  
  popoverElement.addEventListener('touchstart', handleTouchStart, { passive: true });
  popoverElement.addEventListener('touchend', handleTouchEnd, { passive: true });
  nextPopoverElement.addEventListener('touchstart', handleTouchStart, { passive: true });
  nextPopoverElement.addEventListener('touchend', handleTouchEnd, { passive: true });
}

/**
 * Close popover with swipe-down animation
 * Task 4.5: Implement swipe down to close
 * - Animate popover card sliding down with fade out
 * - Animate overlay fading out
 * - Close popover on swipe down completion
 * Requirements: 1.7
 */
function closePopoverWithSwipe() {
  if (currentPopoverIndex === -1) {
    return;
  }
  
  detachPopoverPositionListeners();
  
  // Animate current popover slide down with fade out
  gsap.to(popoverElement, {
    y: window.innerHeight,
    opacity: 0,
    duration: 0.4,
    ease: 'power2.inOut',
    onComplete: () => {
      popoverElement.classList.remove('active');
      overlayElement.classList.remove('active');
      
      // Hide navigation buttons
      const navButtons = document.querySelectorAll('.popover-nav-button');
      navButtons.forEach(btn => btn.classList.remove('active'));
      
      // Hide close button
      const closeBtn = popoverElement.querySelector('.popover-close-btn');
      if (closeBtn) {
        closeBtn.style.display = 'none';
      }
      
      currentPopoverIndex = -1;
      
      // Hide both popovers completely
      popoverElement.style.display = 'none';
      nextPopoverElement.style.display = 'none';
      
      // Reset iPhone-specific styles
      popoverElement.style.top = '';
      popoverElement.style.transform = '';
      nextPopoverElement.style.top = '';
      nextPopoverElement.style.transform = '';
      
      // Clear content
      const contentArea = popoverElement.querySelector('.popover-content');
      contentArea.innerHTML = '';
      const nextContentArea = nextPopoverElement.querySelector('.popover-content');
      nextContentArea.innerHTML = '';
    }
  });
  
  // Fade out overlay
  gsap.to(overlayElement, {
    opacity: 0,
    duration: 0.3
  });
}

// Add keyboard navigation
function addKeyboardHandlers() {
  document.addEventListener('keydown', (e) => {
    if (currentPopoverIndex === -1) return; // Popover not open
    
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevCard();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextCard();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closePopover();
    }
  });
}

// Wait for GSAP to be available
function initializePlayground() {
  // Check if GSAP and Flip are available
  if (typeof gsap === 'undefined' || typeof Flip === 'undefined') {
    console.warn('GSAP or Flip plugin not loaded, retrying...');
    setTimeout(initializePlayground, 100);
    return;
  }

  const cards = document.querySelectorAll('.playground-card');
  allCards = Array.from(cards);
  
  // Create popover structure once
  createPopoverStructure();
  
  cards.forEach((card, index) => {
    // Set up accessibility attributes
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-expanded', 'false');
    card.setAttribute('data-card-index', index);
    
    const title = card.getAttribute('data-title') || 'Untitled';
    card.setAttribute('aria-label', `${title}, expandable sketchbook item`);
    
    // Hide native play button on videos by setting a transparent poster
    const video = card.querySelector('video');
    if (video) {
      // Create a 1x1 transparent PNG as data URL
      const transparentPoster = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      video.setAttribute('poster', transparentPoster);
    }
    
    // Add click handler to open popover
    card.addEventListener('click', function(e) {
      openPopover(index);
    });
    
    // Add touch handler for mobile
    // Track touch start to distinguish between tap and scroll
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    
    card.addEventListener('touchstart', function(e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    }, { passive: true });
    
    card.addEventListener('touchend', function(e) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();
      
      // Calculate touch distance and duration
      const distanceX = Math.abs(touchEndX - touchStartX);
      const distanceY = Math.abs(touchEndY - touchStartY);
      const duration = touchEndTime - touchStartTime;
      
      // Detect tap (short duration, minimal movement)
      const isTap = duration < 300 && distanceX < 10 && distanceY < 10;
      
      if (isTap) {
        openPopover(index);
      }
    }, { passive: true });
    
    // Add keyboard handler for Enter and Space keys
    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPopover(index);
      }
    });
  });
  
  // Handle keyboard navigation for Escape key globally
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (currentPopoverIndex !== -1) {
        closePopover();
      }
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePlayground);
} else {
  initializePlayground();
}

function toggleExpanded(card) {
  if (card.classList.contains('expanded')) {
    collapseCard(card);
  } else {
    expandCard(card);
  }
}

// Popover modal functions

/**
 * Open popover modal at specified card index
 * Displays entry content with fade-in overlay and slide-up animation
 * Requirements: 1.1, 1.2, 1.3
 * Bug Fix: iPhone popover centering (Bug 1)
 */
function openPopover(cardIndex) {
  if (cardIndex < 0 || cardIndex >= allCards.length) {
    return;
  }

  currentPopoverIndex = cardIndex;

  // Set flag to prevent immediate closing
  popoverJustOpened = true;
  setTimeout(() => {
    popoverJustOpened = false;
  }, 300);

  // Show popover
  popoverElement.style.display = 'flex';

  // Show overlay with fade-in
  overlayElement.classList.add('active');

  // Update popover content
  navigateToCard(cardIndex);

  // Activate popover with slide-up animation
  popoverElement.classList.add('active');

  // Show navigation buttons
  const navButtons = document.querySelectorAll('.popover-nav-button');
  navButtons.forEach(btn => btn.classList.add('active'));

  // Show close button
  const closeBtn = popoverElement.querySelector('.popover-close-btn');
  if (closeBtn) {
    closeBtn.style.display = 'flex';
  }

  // Center popover using absolute positioning
  centerPopover(popoverElement);

  // Keep centered on viewport changes and iOS browser chrome changes.
  attachPopoverPositionListeners();

  // Animate with GSAP bounce - slide up from bottom
  gsap.fromTo(popoverElement,
    { y: popoverElement.offsetHeight },
    {
      y: 0,
      duration: 0.6,
      ease: 'back.out(1.7)'
    }
  );

  // Fade in overlay
  gsap.fromTo(overlayElement,
    { opacity: 0 },
    {
      opacity: 1,
      duration: 0.4
    }
  );

  // Try to play video if present (must be done synchronously with user interaction)
  const video = popoverElement.querySelector('video');
  if (video) {
    video.play().catch(err => console.log('Autoplay prevented:', err));
  }
}

/**
 * Close popover modal
 * Slides down with reverse animation and fades out overlay
 * Requirements: 1.6
 */
function closePopover() {
  if (currentPopoverIndex === -1) {
    return;
  }
  
  detachPopoverPositionListeners();
  
  // Animate popover slide down
  gsap.to(popoverElement, {
    y: popoverElement.offsetHeight * 1.5,
    duration: 0.5,
    ease: 'back.in(1.5)',
    onComplete: () => {
      popoverElement.classList.remove('active');
      overlayElement.classList.remove('active');
      
      // Hide navigation buttons
      const navButtons = document.querySelectorAll('.popover-nav-button');
      navButtons.forEach(btn => btn.classList.remove('active'));
      
      // Hide close button
      const closeBtn = popoverElement.querySelector('.popover-close-btn');
      if (closeBtn) {
        closeBtn.style.display = 'none';
      }
      
      currentPopoverIndex = -1;
      
      // Hide both popovers completely
      popoverElement.style.display = 'none';
      nextPopoverElement.style.display = 'none';
      
      // Reset iPhone-specific styles
      popoverElement.style.top = '';
      popoverElement.style.transform = '';
      nextPopoverElement.style.top = '';
      nextPopoverElement.style.transform = '';
      
      // Clear content
      const contentArea = popoverElement.querySelector('.popover-content');
      contentArea.innerHTML = '';
      const nextContentArea = nextPopoverElement.querySelector('.popover-content');
      nextContentArea.innerHTML = '';
    }
  });
  
  // Fade out overlay
  gsap.to(overlayElement, {
    opacity: 0,
    duration: 0.3
  });
}

/**
 * Navigate to specific card in popover
 * Task 4.4: Implement content transition animations (REFACTORED)
 * - Maintains TWO popover instances: popoverElement (current) and nextPopoverElement (incoming)
 * - Pre-renders next popover off-screen with new content
 * - Animates current popover sliding out in navigation direction
 * - Animates next popover sliding in from opposite direction SIMULTANEOUSLY
 * - Both animations happen in parallel (0.4s with ease: "power2.inOut")
 * - Swaps popover references after animation completes
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.7
 */
function navigateToCard(cardIndex) {
  if (cardIndex < 0 || cardIndex >= allCards.length) {
    return;
  }
  
  const contentArea = popoverElement.querySelector('.popover-content');
  const isFirstNavigation = contentArea.innerHTML === '';
  
  // Determine navigation direction
  const direction = cardIndex > currentPopoverIndex ? 'next' : 'prev';
  
  currentPopoverIndex = cardIndex;
  const card = allCards[cardIndex];
  
  // Get card data - extract colors from frontmatter via data attributes
  const title = card.getAttribute('data-title') || 'Untitled';
  const caption = card.getAttribute('data-caption') || '';
  const mediaType = card.getAttribute('data-media-type') || '';
  let textColor = card.getAttribute('data-text-color') || '#010002';
  let fontFamily = card.getAttribute('data-font-family') || '"Neue Regrade Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  let bgColor = card.getAttribute('data-bg-color') || '';
  
  // Clean up values (remove extra spaces)
  textColor = textColor.trim() || '#010002';
  fontFamily = fontFamily.trim() || '"Neue Regrade Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  bgColor = bgColor.trim() || '';
  
  // Default to white if no bg_color specified
  if (!bgColor || bgColor === 'transparent') {
    bgColor = '#ffffff';
  }
  
  // Create new content
  const newContent = createPopoverContent(card, title, caption, mediaType, textColor, fontFamily, bgColor);
  
  // If this is the first navigation, just set content without animation
  if (isFirstNavigation) {
    contentArea.innerHTML = '';
    contentArea.appendChild(newContent);
    gsap.set(popoverElement, { x: 0, opacity: 1 });
    
    // Apply background color to popover container
    popoverElement.style.setProperty('background-color', bgColor, 'important');
    
    // Apply text color to content and all child elements
    newContent.style.setProperty('color', textColor, 'important');
    newContent.querySelectorAll('h3, p, div, span, a, *').forEach(el => {
      el.style.setProperty('color', textColor, 'important');
    });
    
    // Center popover after setting content
    centerPopover(popoverElement);
  } else {
    // Subsequent navigations: use dual popover animation
    // 1. Populate nextPopoverElement with new content
    const nextContentArea = nextPopoverElement.querySelector('.popover-content');
    nextContentArea.innerHTML = '';
    nextContentArea.appendChild(newContent);
    
    // Apply background color to next popover
    nextPopoverElement.style.setProperty('background-color', bgColor, 'important');
    
    // Apply text color to content and all child elements
    newContent.style.setProperty('color', textColor, 'important');
    newContent.querySelectorAll('h3, p, div, span, a, *').forEach(el => {
      el.style.setProperty('color', textColor, 'important');
    });
    
    // Center nextPopoverElement before animation
    centerPopover(nextPopoverElement);
    
    // 2. Position nextPopoverElement off-screen using xPercent to preserve centering
    gsap.set(nextPopoverElement, { xPercent: direction === 'next' ? 100 : -100, opacity: 0 });
    
    // 3. Show nextPopoverElement
    nextPopoverElement.style.display = 'flex';
    nextPopoverElement.classList.add('active');
    
    // Re-center after showing (offsetWidth/Height now available)
    centerPopover(nextPopoverElement);
    
    // 4. Animate BOTH popovers simultaneously
    // Current popover slides out in navigation direction
    gsap.to(popoverElement, {
      xPercent: direction === 'next' ? -100 : 100,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.inOut'
    });
    
    // Next popover slides in from opposite direction
    gsap.to(nextPopoverElement, {
      xPercent: 0,
      opacity: 1,
      duration: 0.4,
      ease: 'power2.inOut',
      onComplete: () => {
        // 5. After animation completes, swap references
        // Hide current popover
        popoverElement.style.display = 'none';
        popoverElement.classList.remove('active');
        
        // Swap popover references
        const temp = popoverElement;
        popoverElement = nextPopoverElement;
        nextPopoverElement = temp;
        
        // Reset old popover for next navigation
        // The old popover (now nextPopoverElement) should be hidden and reset
        // Don't set xPercent to 0 - keep it off-screen
        gsap.set(nextPopoverElement, { xPercent: 0, opacity: 0 });
        const oldContentArea = nextPopoverElement.querySelector('.popover-content');
        oldContentArea.innerHTML = '';
        nextPopoverElement.style.display = 'none';
        
        // Re-center the current popover after swap to ensure it's properly positioned
        centerPopover(popoverElement);
      }
    });
  }
  
  // Update navigation button states
  const prevBtns = document.querySelectorAll('.popover-nav-button.prev');
  const nextBtns = document.querySelectorAll('.popover-nav-button.next');
  
  prevBtns.forEach(btn => btn.disabled = cardIndex === 0);
  nextBtns.forEach(btn => btn.disabled = cardIndex === allCards.length - 1);
}

/**
 * Helper function to create popover content
 * Handles all media types and styling
 * Task 1: Apply background and text colors to popover
 * Task 3: Render 3D scene in popover
 * Task 4: Apply colors to all elements
 */
function createPopoverContent(card, title, caption, mediaType, textColor, fontFamily, bgColor) {
  const newContent = document.createElement('div');
  newContent.className = 'popover-content-inner';
  
  // Add media based on type
  const mediaElement = card.querySelector('.playground-thumb, .playground-text-box, .playground-3d-thumb');
  
  if (mediaElement) {
    if (mediaType === 'video') {
      const wrapper = document.createElement('div');
      wrapper.className = 'popover-media-wrapper';
      
      // Create a new video element with same source
      const video = document.createElement('video');
      video.className = 'popover-media';
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('webkit-playsinline', '');
      video.setAttribute('playsinline', '');
      
      // Copy source from original video
      const source = mediaElement.querySelector('source');
      if (source) {
        const newSource = document.createElement('source');
        newSource.src = source.src;
        newSource.type = source.type || 'video/mp4';
        video.appendChild(newSource);
      }
      
      wrapper.appendChild(video);

      // Re-center popover when video metadata affects media height.
      const recenterOnVideoReady = () => {
        requestAnimationFrame(() => {
          recenterVisiblePopovers();
        });
      };
      video.addEventListener('loadedmetadata', recenterOnVideoReady);
      video.addEventListener('loadeddata', recenterOnVideoReady);
      video.addEventListener('canplay', recenterOnVideoReady);
      
      // Add invisible overlay to capture clicks
      const videoOverlay = document.createElement('div');
      videoOverlay.className = 'popover-video-overlay';
      
      // Capture clicks on overlay to toggle play/pause
      videoOverlay.addEventListener('click', (e) => {
        e.stopPropagation();
        if (video.paused) {
          video.play().catch(err => console.log('Play prevented:', err));
        } else {
          video.pause();
        }
      });
      
      wrapper.appendChild(videoOverlay);
      
      // Add fullscreen button
      const fullscreenBtn = document.createElement('button');
      fullscreenBtn.className = 'popover-fullscreen-btn';
      fullscreenBtn.innerHTML = '⛶';
      fullscreenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (video.requestFullscreen) {
          video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) {
          video.webkitRequestFullscreen();
        } else if (video.mozRequestFullscreen) {
          video.mozRequestFullscreen();
        } else if (video.mozRequestFullScreen) {
          video.mozRequestFullScreen();
        } else if (video.msRequestFullscreen) {
          video.msRequestFullscreen();
        }
      });
      
      wrapper.appendChild(fullscreenBtn);
      
      // Prevent video clicks from propagating to close handlers
      wrapper.addEventListener('click', (e) => {
        e.stopPropagation();
      });
      
      newContent.appendChild(wrapper);
      // Note: video.play() is called in openPopover() to work with browser autoplay policies
    } else if (mediaType === 'image' || mediaType === 'gif') {
      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'popover-media-wrapper';
      
      const img = document.createElement('img');
      img.className = 'popover-media';
      img.src = mediaElement.src;
      img.alt = title;
      imgWrapper.appendChild(img);
      
      newContent.appendChild(imgWrapper);
    } else if (mediaType === 'three_d') {
      // Task 3: Render 3D scene in popover
      const container = document.createElement('div');
      container.className = 'popover-3d-container';
      const modelUrl = mediaElement.getAttribute('data-3d-url');
      container.setAttribute('data-3d-url', modelUrl);
      
      // Apply background color to 3D container
      container.style.setProperty('background-color', bgColor, 'important');
      
      // Create wrapper for 3D
      const wrapper = document.createElement('div');
      wrapper.className = 'popover-media-wrapper';
      wrapper.style.setProperty('background-color', bgColor, 'important');
      wrapper.appendChild(container);
      
      newContent.appendChild(wrapper);
      
      // Initialize 3D scene in the popover container
      // Use requestAnimationFrame to ensure container is rendered and has dimensions
      const initializeScene = () => {
        if (typeof Playground3DScene !== 'undefined' && container.offsetWidth > 0 && container.offsetHeight > 0) {
          new Playground3DScene(container, modelUrl);
        } else if (typeof Playground3DScene !== 'undefined') {
          // Retry with setTimeout if dimensions not available
          setTimeout(initializeScene, 50);
        }
      };
      
      requestAnimationFrame(() => {
        setTimeout(initializeScene, 50);
      });
    } else if (mediaType === 'text') {
      const textBox = document.createElement('div');
      textBox.className = 'popover-text-box';
      textBox.innerHTML = mediaElement.innerHTML;
      textBox.style.setProperty('color', textColor, 'important');
      textBox.style.fontFamily = fontFamily;
      textBox.style.setProperty('background-color', bgColor, 'important');
      newContent.appendChild(textBox);
      
    }
  }
  
  // Apply background color to the entire content
  newContent.style.setProperty('background-color', bgColor, 'important');
  requestAnimationFrame(() => {
    recenterVisiblePopovers();
  });
  
  return newContent;
}

/**
 * Navigate to previous card
 * Task 4.1: Add click handlers to navigation buttons
 * - Previous button: call prevCard()
 * - Disable buttons at boundaries
 * - Animate entire popover card with GSAP slide effect
 * Requirements: 2.1, 2.2, 2.3, 2.7
 */
function prevCard() {
  if (currentPopoverIndex > 0) {
    navigateToCard(currentPopoverIndex - 1);
  }
}

/**
 * Navigate to next card
 * Task 4.1: Add click handlers to navigation buttons
 * - Next button: call nextCard()
 * - Disable buttons at boundaries
 * - Animate entire popover card with GSAP slide effect
 * Requirements: 2.1, 2.2, 2.3, 2.7
 */
function nextCard() {
  if (currentPopoverIndex < allCards.length - 1) {
    navigateToCard(currentPopoverIndex + 1);
  }
}

function expandCard(card) {
  // Close any other expanded cards
  const otherExpanded = document.querySelector('.playground-card.expanded');
  if (otherExpanded && otherExpanded !== card) {
    collapseCard(otherExpanded);
  }
  
  const expandedPhysics = window.cards.find(c => c.element === card);
  
  // Get expand size from data attribute
  const expandSize = card.getAttribute('data-expand-size') || '2x2';
  const expandParts = expandSize.split('x');
  let expandCol = parseInt(expandParts[0]) || 2;
  let expandRow = parseInt(expandParts[1]) || 2;
  
  // Adjust expand size for mobile devices
  const viewportWidth = window.innerWidth;
  
  if (viewportWidth <= 480) {
    // Small mobile: reduce to 2x2 maximum
    expandCol = Math.min(expandCol, 2);
    expandRow = Math.min(expandRow, 2);
  } else if (viewportWidth <= 768) {
    // Tablet: reduce by 1 grid unit if larger than 2x2
    if (expandCol > 2) expandCol = expandCol - 1;
    if (expandRow > 2) expandRow = expandRow - 1;
  }
  
  // Calculate viewport center
  const viewportCenterX = window.innerWidth / 2;
  const viewportCenterY = window.innerHeight / 2;
  
  // Get current card position
  const cardRect = card.getBoundingClientRect();
  const cardCenterX = cardRect.left + cardRect.width / 2;
  const cardCenterY = cardRect.top + cardRect.height / 2;
  
  // Calculate distance to center
  const distX = viewportCenterX - cardCenterX;
  const distY = viewportCenterY - cardCenterY;
  
  // Store original grid position for collapse
  if (expandedPhysics) {
    card.setAttribute('data-original-grid-x', expandedPhysics.gridX);
    card.setAttribute('data-original-grid-y', expandedPhysics.gridY);
    // Disable physics for this card during animation
    expandedPhysics.isAnimating = true;
  }
  
  // Phase 1: Animate card to center with a fun bounce effect
  gsap.to(card, {
    x: distX,
    y: distY,
    duration: 0.8,
    ease: 'back.out(1.7)',
    onComplete: () => {
      // Phase 2: After reaching center, expand the card
      const state = Flip.getState(card);
      
      // Mark card as expanded
      card.classList.add('expanded');
      card.setAttribute('data-expand-col', expandCol);
      card.setAttribute('data-expand-row', expandRow);
      card.setAttribute('aria-expanded', 'true');
      
      // Update CSS custom properties for grid expansion
      card.style.setProperty('--expand-col', expandCol);
      card.style.setProperty('--expand-row', expandRow);
      
      // Mark as expanded in physics
      if (expandedPhysics) {
        expandedPhysics.isExpanded = true;
        expandedPhysics.isAnimating = false;
      }
      
      // Phase 2: Animate expansion with Flip
      Flip.from(state, {
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: () => {
          // Update physics engine for expanded card and grid reflow
          updatePhysicsForExpansion(card, expandCol, expandRow);
          
          // Lock the expanded card to center position
          if (expandedPhysics) {
            const centerRect = card.getBoundingClientRect();
            expandedPhysics.gridX = centerRect.left + centerRect.width / 2;
            expandedPhysics.gridY = centerRect.top + centerRect.height / 2;
            expandedPhysics.x = expandedPhysics.gridX;
            expandedPhysics.y = expandedPhysics.gridY;
            expandedPhysics.vx = 0;
            expandedPhysics.vy = 0;
          }
        }
      });
    }
  });
}

function collapseCard(card) {
  const collapsedPhysics = window.cards.find(c => c.element === card);
  
  // Get original grid position
  const originalGridX = parseFloat(card.getAttribute('data-original-grid-x')) || 0;
  const originalGridY = parseFloat(card.getAttribute('data-original-grid-y')) || 0;
  
  // Disable physics for this card during animation
  if (collapsedPhysics) {
    collapsedPhysics.isAnimating = true;
  }
  
  // Phase 1: Collapse the card back to its original size
  // Capture the current expanded state
  const state = Flip.getState(card);
  
  // Remove expanded state
  card.classList.remove('expanded');
  card.setAttribute('aria-expanded', 'false');
  
  // Mark as not expanded in physics
  if (collapsedPhysics) {
    collapsedPhysics.isExpanded = false;
  }
  
  // Animate collapse with Flip
  Flip.from(state, {
    duration: 0.5,
    ease: 'power2.inOut',
    onComplete: () => {
      // Phase 2: Animate card back to its original position
      gsap.to(card, {
        x: 0,
        y: 0,
        duration: 0.8, // Match the expand animation speed
        ease: 'back.out(1.7)', // Same fun bouncy easing
        onComplete: () => {
          // Re-enable physics after animation completes
          if (collapsedPhysics) {
            collapsedPhysics.isAnimating = false;
          }
          
          // Update physics engine for collapsed card
          updatePhysicsForCollapse(card);
        }
      });
    }
  });
}


/**
 * Update physics engine when a card expands
 * Recalculates collision radii and grid positions for all cards
 * Requirement 15.14: Physics engine SHALL update collision detection for new entry size
 * Requirement 15.7: Other entries SHALL shift position to accommodate expanded item
 * Requirement 15.8: Grid layout SHALL remain intact and organized during expansion
 * 
 * Task 5.8: Update physics during expansion/collapse
 * - Recalculate collision detection for expanded size
 * - Update physics bodies for new grid positions
 * - Ensure smooth physics transitions
 */
function updatePhysicsForExpansion(expandedCard, expandCol, expandRow) {
  // Check if physics system is initialized
  if (typeof window.cards === 'undefined' || !window.cards) {
    return;
  }
  
  // Find the physics object for the expanded card
  const expandedPhysics = window.cards.find(card => card.element === expandedCard);
  if (!expandedPhysics) {
    return;
  }
  
  // Get the expanded card's new bounding box
  const rect = expandedCard.getBoundingClientRect();
  const expandedWidth = rect.width;
  const expandedHeight = rect.height;
  
  // Update collision radius based on expanded size
  const newCollisionRadius = Math.max(expandedWidth, expandedHeight) / 2 + 20;
  expandedPhysics.collisionRadius = newCollisionRadius;
  
  // Update grid position to center of expanded card
  expandedPhysics.gridX = rect.left + expandedWidth / 2;
  expandedPhysics.gridY = rect.top + expandedHeight / 2;
  
  // Reset position to new grid center
  expandedPhysics.x = expandedPhysics.gridX;
  expandedPhysics.y = expandedPhysics.gridY;
  expandedPhysics.vx = 0;
  expandedPhysics.vy = 0;
  
  // Recalculate grid positions for all other cards (they may have shifted due to grid reflow)
  window.cards.forEach(cardPhysics => {
    if (cardPhysics === expandedPhysics) {
      return; // Skip the expanded card
    }
    
    const cardElement = cardPhysics.element;
    const cardRect = cardElement.getBoundingClientRect();
    
    // Update grid position to match new DOM position
    cardPhysics.gridX = cardRect.left + cardRect.width / 2;
    cardPhysics.gridY = cardRect.top + cardRect.height / 2;
    
    // Smoothly move toward new grid position
    // Don't reset position immediately - let physics smoothly transition
    // This creates a natural "settling" effect as cards reflow
  });
}

/**
 * Update physics engine when a card collapses
 * Recalculates collision radii and grid positions back to original size
 * Requirement 15.14: Physics engine SHALL update collision detection for new entry size
 * 
 * Task 5.8: Update physics during expansion/collapse
 * - Recalculate collision detection for expanded size
 * - Update physics bodies for new grid positions
 * - Ensure smooth physics transitions
 */
function updatePhysicsForCollapse(collapsedCard) {
  // Check if physics system is initialized
  if (typeof window.cards === 'undefined' || !window.cards) {
    return;
  }
  
  // Find the physics object for the collapsed card
  const collapsedPhysics = window.cards.find(card => card.element === collapsedCard);
  if (!collapsedPhysics) {
    return;
  }
  
  // Reset collision radius to original size
  collapsedPhysics.collisionRadius = 85; // Original collision radius
  
  // Recalculate grid position for collapsed card
  const collapsedRect = collapsedCard.getBoundingClientRect();
  collapsedPhysics.gridX = collapsedRect.left + collapsedRect.width / 2;
  collapsedPhysics.gridY = collapsedRect.top + collapsedRect.height / 2;
  
  // Reset position to new grid center
  collapsedPhysics.x = collapsedPhysics.gridX;
  collapsedPhysics.y = collapsedPhysics.gridY;
  collapsedPhysics.vx = 0;
  collapsedPhysics.vy = 0;
  
  // Recalculate grid positions for all cards
  window.cards.forEach(cardPhysics => {
    const cardElement = cardPhysics.element;
    const cardRect = cardElement.getBoundingClientRect();
    
    // Update grid position to match new DOM position
    cardPhysics.gridX = cardRect.left + cardRect.width / 2;
    cardPhysics.gridY = cardRect.top + cardRect.height / 2;
  });
}

/**
 * Handle window resize for responsive expansion (Requirement 15.12)
 * Recalculates expand size when viewport changes
 */
function handleWindowResize() {
  const expandedCard = document.querySelector('.playground-card.expanded');
  
  if (expandedCard) {
    // Get original expand size from data attribute
    const expandSize = expandedCard.getAttribute('data-expand-size') || '2x2';
    const expandParts = expandSize.split('x');
    let expandCol = parseInt(expandParts[0]) || 2;
    let expandRow = parseInt(expandParts[1]) || 2;
    
    // Adjust expand size for current viewport
    const viewportWidth = window.innerWidth;
    
    if (viewportWidth <= 480) {
      expandCol = Math.min(expandCol, 2);
      expandRow = Math.min(expandRow, 2);
    } else if (viewportWidth <= 768) {
      if (expandCol > 2) expandCol = expandCol - 1;
      if (expandRow > 2) expandRow = expandRow - 1;
    }
    
    // Update CSS custom properties
    expandedCard.style.setProperty('--expand-col', expandCol);
    expandedCard.style.setProperty('--expand-row', expandRow);
    expandedCard.setAttribute('data-expand-col', expandCol);
    expandedCard.setAttribute('data-expand-row', expandRow);
    
    // Update physics for new size
    updatePhysicsForExpansion(expandedCard, expandCol, expandRow);
  }
}

// Add window resize listener for responsive behavior
window.addEventListener('resize', handleWindowResize);

/**
 * Gyroscope-based attraction for mobile devices
 * Creates a subtle parallax effect based on device orientation
 * Bug Fix: HTTPS detection for iOS (Bug 2)
 */
/**
 * Gyroscope-based attraction for mobile devices
 * Creates a subtle parallax effect based on device orientation
 * Bug Fix: HTTPS detection for iOS (Bug 2)
 * Note: iOS 13+ requires DeviceMotionEvent.requestPermission() for accelerometer/gyroscope
 */
/**
 * Gyroscope-based attraction for mobile devices
 * Creates a subtle parallax effect based on device orientation
 * Bug Fix: HTTPS detection for iOS (Bug 2)
 * Note: iOS 13+ requires DeviceMotionEvent.requestPermission() for accelerometer/gyroscope
 */
function initializeGyroscopeAttraction() {
  console.log('🔍 Initializing gyroscope attraction...');

  // Check if device supports DeviceOrientation API
  if (!window.DeviceOrientationEvent) {
    console.log('❌ DeviceOrientation not supported');
    return;
  }

  console.log('✅ DeviceOrientation supported');

  // Bug Fix: Check HTTPS requirement for iOS
  // iOS requires HTTPS for DeviceOrientation API access
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isHTTPS = window.location.protocol === 'https:';

  console.log('📱 Device check - iOS:', isIOS, 'HTTPS:', isHTTPS);

  if (isIOS && !isHTTPS) {
    console.warn('⚠️ Gyroscope requires HTTPS on iOS. Currently on HTTP - gyroscope disabled.');
    return; // Exit early without attempting permission request
  }

  let gyroAttraction = { x: 0, y: 0 };
  const attractionStrength = 20; // Pixels of movement

  function startGyroTracking() {
    console.log('🎯 Starting gyro tracking');
    window.addEventListener('deviceorientation', (event) => {
      if (!event.beta || !event.gamma) return;

      // beta: front-to-back tilt (-180 to 180)
      // gamma: left-to-right tilt (-90 to 90)
      const beta = event.beta;
      const gamma = event.gamma;

      // Normalize to -1 to 1 range
      const normalizedX = Math.max(-1, Math.min(1, gamma / 45));
      const normalizedY = Math.max(-1, Math.min(1, (beta - 45) / 45));

      // Apply attraction strength
      gyroAttraction.x = normalizedX * attractionStrength;
      gyroAttraction.y = normalizedY * attractionStrength;

      // Apply directly to cards if physics exists
      if (window.cards) {
        window.cards.forEach(card => {
          card.vx += gyroAttraction.x * 0.02;
          card.vy += gyroAttraction.y * 0.02;
        });
      }
    });
  }

  // Request permission for iOS 13+
  // iOS 13+ requires DeviceMotionEvent.requestPermission() for accelerometer/gyroscope access
  if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
    console.log('📲 iOS 13+ detected - will request permission on touch');
    console.log('👆 TAP ANYWHERE ON THE SCREEN TO ENABLE GYROSCOPE');

    // iOS 13+ requires permission - request on first touch
    const requestPermission = () => {
      console.log('🔄 Requesting gyro permission...');
      DeviceMotionEvent.requestPermission()
        .then(permissionState => {
          console.log('✅ Permission state:', permissionState);
          if (permissionState === 'granted') {
            console.log('🎉 Gyroscope enabled!');
            startGyroTracking();
          } else {
            console.log('❌ Gyroscope permission denied');
          }
        })
        .catch(err => {
          console.error('❌ Permission error:', err);
          console.error('Error message:', err.message);
          if (err.message && err.message.includes('not secure')) {
            console.warn('⚠️ HTTPS is required for gyroscope on iOS');
          }
        });

      // Remove listener after first request
      document.removeEventListener('touchstart', requestPermission);
    };

    document.addEventListener('touchstart', requestPermission, { once: true });
  } else {
    // Non-iOS or older iOS, start immediately
    console.log('🚀 Starting gyro without permission (non-iOS or older iOS)');
    startGyroTracking();
  }
}
