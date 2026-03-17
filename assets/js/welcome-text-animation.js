/**
 * Welcome Text Letter-by-Letter Animation
 * Animates color only based on mouse/touch proximity to characters
 * Creates a trail effect with delayed return to normal state
 * Font weight remains constant throughout the animation
 */

function initWelcomeTextLetterAnimation() {
  const welcomeText = document.querySelector('.welcome-text');
  
  if (!welcomeText || typeof gsap === 'undefined' || typeof SplitText === 'undefined') {
    return;
  }

  // Configuration
  const MOUSE_RADIUS = 100;
  const ANIMATION_DURATION = 0.5;
  const RETURN_DELAY = 0.4;
  const RETURN_DURATION = 0.8;
  const TOUCH_END_DELAY = 0.6; // Delay adicional al soltar el dedo

  // Get colors from CSS variables
  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
  const normalColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();

  // Split text into characters
  const splitTxt = new SplitText(welcomeText, { type: "chars" });
  let mouseX = 0;
  let mouseY = 0;
  let isTouching = false;
  
  // Track which characters are currently in the radius
  const charStates = new Map();
  splitTxt.chars.forEach((char, index) => {
    charStates.set(index, { inRadius: false, returnTimeout: null });
  });

  function updateCharacterStates() {
    splitTxt.chars.forEach((char, index) => {
      const rect = char.getBoundingClientRect();
      const charCenterX = rect.left + rect.width / 2;
      const charCenterY = rect.top + rect.height / 2;

      const distance = Math.sqrt(
        Math.pow(mouseX - charCenterX, 2) + Math.pow(mouseY - charCenterY, 2)
      );

      const state = charStates.get(index);

      if (distance < MOUSE_RADIUS) {
        if (state.returnTimeout) {
          clearTimeout(state.returnTimeout);
          state.returnTimeout = null;
        }
        
        state.inRadius = true;
        // Animate only color, not font-weight
        gsap.to(char, {
          color: accentColor,
          duration: ANIMATION_DURATION,
          ease: 'power2.out'
        });
      } else if (state.inRadius) {
        state.inRadius = false;
        
        state.returnTimeout = setTimeout(() => {
          // Animate only color back to normal
          gsap.to(char, {
            color: normalColor,
            duration: RETURN_DURATION,
            ease: 'power2.inOut'
          });
          state.returnTimeout = null;
        }, RETURN_DELAY * 1000);
      }
    });
  }

  // Track mouse position
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    updateCharacterStates();
  });

  // Track touch position
  document.addEventListener('touchstart', (e) => {
    isTouching = true;
    if (e.touches.length > 0) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
      updateCharacterStates();
    }
  });

  document.addEventListener('touchmove', (e) => {
    if (isTouching && e.touches.length > 0) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
      updateCharacterStates();
      e.preventDefault(); // Prevenir scroll
    }
  }, { passive: false });

  // Track touch end with delay
  document.addEventListener('touchend', (e) => {
    isTouching = false;
    
    // Reset all characters with delay
    splitTxt.chars.forEach((char, index) => {
      const state = charStates.get(index);
      if (state && state.inRadius) {
        state.inRadius = false;
        if (state.returnTimeout) {
          clearTimeout(state.returnTimeout);
          state.returnTimeout = null;
        }
        
        state.returnTimeout = setTimeout(() => {
          // Animate only color back to normal
          gsap.to(char, {
            color: normalColor,
            duration: RETURN_DURATION,
            ease: 'power2.inOut'
          });
          state.returnTimeout = null;
        }, TOUCH_END_DELAY * 1000);
      }
    });
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initWelcomeTextLetterAnimation);
