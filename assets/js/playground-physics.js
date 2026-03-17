// Simple physics for playground cards - keep them in grid with interactive effects
let mousePos = { x: 0, y: 0 };
let cards = [];
let debugMode = false; // Toggle with Ctrl+D
let gridDebugMode = false; // Toggle with Ctrl+G

// Expose cards array globally for expansion/collapse physics updates
window.cards = cards;

class CardPhysics {
  constructor(element) {
    this.element = element;
    
    // Get initial grid position
    const rect = element.getBoundingClientRect();
    this.gridX = rect.left + rect.width / 2;
    this.gridY = rect.top + rect.height / 2;
    
    // Read initial offset from CSS variables
    const computedStyle = getComputedStyle(element);
    const randomOffsetX = computedStyle.getPropertyValue('--random-offset-x');
    const randomOffsetY = computedStyle.getPropertyValue('--random-offset-y');
    
    const offsetX = randomOffsetX ? parseFloat(randomOffsetX) : 0;
    const offsetY = randomOffsetY ? parseFloat(randomOffsetY) : 0;
    
    // Adjust grid position to account for initial offset
    this.gridX += offsetX;
    this.gridY += offsetY;
    
    // Current position (starts at grid position with offset)
    this.x = this.gridX;
    this.y = this.gridY;
    
    // Velocity
    this.vx = 0;
    this.vy = 0;
    
    // Read initial rotation from CSS variable
    const randomRotate = computedStyle.getPropertyValue('--random-rotate');
    this.initialRotation = randomRotate ? parseFloat(randomRotate) * Math.PI / 180 : 0;
    this.angle = this.initialRotation;
    this.angularVelocity = 0;
    
    // Physics parameters (5x stronger)
    this.attractionRadius = 350 + Math.random() * 150;
    this.attractionStrength = 0.8; // Doubled from 0.4
    this.damping = 0.95; // Very high damping to stop bouncing quickly
    this.springStrength = 0.04; // 5x of 0.008
    this.collisionRadius = 85; // For collision detection (reduced to prevent fighting)
    
    // Create debug circle if debug mode is on
    this.debugCircle = null;
    this.attractionCircle = null;
    
    // Track if this card is currently expanded
    this.isExpanded = false;
    
    // Track if this card is being animated by GSAP
    this.isAnimating = false;
    
    // Grid bounds for physics containment
    this.gridBounds = null;
  }
  
  createDebugVisuals() {
    if (this.debugCircle) return; // Already created
    
    // Collision radius circle
    this.debugCircle = document.createElement('div');
    this.debugCircle.style.position = 'fixed';
    this.debugCircle.style.borderRadius = '50%';
    this.debugCircle.style.border = '2px solid rgba(255, 0, 0, 0.5)';
    this.debugCircle.style.pointerEvents = 'none';
    this.debugCircle.style.zIndex = '999';
    document.body.appendChild(this.debugCircle);
    
    // Attraction radius circle
    this.attractionCircle = document.createElement('div');
    this.attractionCircle.style.position = 'fixed';
    this.attractionCircle.style.borderRadius = '50%';
    this.attractionCircle.style.border = '1px dashed rgba(0, 0, 255, 0.3)';
    this.attractionCircle.style.pointerEvents = 'none';
    this.attractionCircle.style.zIndex = '998';
    document.body.appendChild(this.attractionCircle);
  }
  
  removeDebugVisuals() {
    if (this.debugCircle) {
      this.debugCircle.remove();
      this.debugCircle = null;
    }
    if (this.attractionCircle) {
      this.attractionCircle.remove();
      this.attractionCircle = null;
    }
  }
  
  updateDebugVisuals() {
    if (!debugMode || !this.debugCircle) return;
    
    // Get the card's actual position on screen
    const rect = this.element.getBoundingClientRect();
    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;
    
    // Update collision radius circle
    const size = this.collisionRadius * 2;
    this.debugCircle.style.width = size + 'px';
    this.debugCircle.style.height = size + 'px';
    this.debugCircle.style.left = (cardCenterX - this.collisionRadius) + 'px';
    this.debugCircle.style.top = (cardCenterY - this.collisionRadius) + 'px';
    
    // Update attraction radius circle
    const attractionSize = this.attractionRadius * 2;
    this.attractionCircle.style.width = attractionSize + 'px';
    this.attractionCircle.style.height = attractionSize + 'px';
    this.attractionCircle.style.left = (cardCenterX - this.attractionRadius) + 'px';
    this.attractionCircle.style.top = (cardCenterY - this.attractionRadius) + 'px';
  }
  
  update(mouseX, mouseY, allCards) {
    // Skip physics update if this card is being animated by GSAP
    if (this.isAnimating) {
      // Just update the position from the DOM for collision detection
      const rect = this.element.getBoundingClientRect();
      this.x = rect.left + rect.width / 2;
      this.y = rect.top + rect.height / 2;
      // Don't apply transform - let GSAP handle it
      return;
    }
    
    // Skip physics if card is expanded (should stay locked in center)
    if (this.isExpanded) {
      // Just update debug visuals
      this.updateDebugVisuals();
      return;
    }
    
    // Mouse attraction - pull toward cursor
    const mdx = mouseX - this.x;
    const mdy = mouseY - this.y;
    const distance = Math.sqrt(mdx * mdx + mdy * mdy);
    
    if (distance < this.attractionRadius && distance > 1) {
      // Very strong attraction force
      const force = (this.attractionRadius - distance) / this.attractionRadius;
      this.vx += (mdx / distance) * force * this.attractionStrength;
      this.vy += (mdy / distance) * force * this.attractionStrength;
    }
    
    // Collision detection with other cards (circular)
    allCards.forEach(otherCard => {
      if (otherCard === this) return;
      
      const cdx = otherCard.x - this.x;
      const cdy = otherCard.y - this.y;
      const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
      const minDist = this.collisionRadius + otherCard.collisionRadius;
      
      if (cdist < minDist && cdist > 0) {
        // Collision! Push apart with gentle force
        const overlap = minDist - cdist;
        const pushForce = Math.min(overlap * 0.2, 1.0);
        const pushX = (cdx / cdist) * pushForce;
        const pushY = (cdy / cdist) * pushForce;
        
        this.vx -= pushX;
        this.vy -= pushY;
        otherCard.vx += pushX;
        otherCard.vy += pushY;
      }
    });
    
    // Spring force - gently pull back to grid position
    const dx = this.gridX - this.x;
    const dy = this.gridY - this.y;
    this.vx += dx * this.springStrength;
    this.vy += dy * this.springStrength;
    
    // Apply velocity
    this.x += this.vx;
    this.y += this.vy;
    
    // Constrain to grid bounds if available
    if (this.gridBounds) {
      const rect = this.element.getBoundingClientRect();
      const halfWidth = rect.width / 2;
      const halfHeight = rect.height / 2;
      
      // Get current position relative to grid
      const currentCenterX = this.x;
      const currentCenterY = this.y;
      
      // Calculate bounds for card center
      const minX = this.gridBounds.left + halfWidth;
      const maxX = this.gridBounds.right - halfWidth;
      const minY = this.gridBounds.top + halfHeight;
      const maxY = this.gridBounds.bottom - halfHeight;
      
      // Clamp position to grid bounds
      if (currentCenterX < minX) {
        this.x = minX;
        this.vx = 0; // Stop velocity when hitting boundary
      } else if (currentCenterX > maxX) {
        this.x = maxX;
        this.vx = 0;
      }
      
      if (currentCenterY < minY) {
        this.y = minY;
        this.vy = 0;
      } else if (currentCenterY > maxY) {
        this.y = maxY;
        this.vy = 0;
      }
    }
    
    // Damping
    this.vx *= this.damping;
    this.vy *= this.damping;
    
    // Rotation based on velocity
    this.angularVelocity = (this.vx + this.vy) * 0.001;
    this.angle += this.angularVelocity;
    
    // Update DOM - translate relative to grid position
    const offsetX = this.x - this.gridX;
    const offsetY = this.y - this.gridY;
    
    this.element.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${this.angle}rad)`;
    
    // Update debug visuals
    this.updateDebugVisuals();
  }
}

function initPhysics() {
  const cardElements = document.querySelectorAll('.playground-card');
  const gridElement = document.querySelector('.playground-grid');
  
  if (cardElements.length === 0) {
    console.warn('No playground cards found');
    return;
  }
  
  // Get grid bounds for physics containment
  const gridRect = gridElement ? gridElement.getBoundingClientRect() : null;
  const gridBounds = gridRect ? {
    left: gridRect.left,
    right: gridRect.right,
    top: gridRect.top,
    bottom: gridRect.bottom
  } : null;
  
  // Initialize each card
  cardElements.forEach((element) => {
    const physics = new CardPhysics(element);
    physics.gridBounds = gridBounds; // Store grid bounds for containment
    cards.push(physics);
  });
  
  // Update global reference
  window.cards = cards;
  
  console.log('Physics initialized for', cards.length, 'cards');
  console.log('Press Ctrl+D to toggle collision shape visualization');
  console.log('Press Ctrl+G to toggle grid visualization');
  
  // Animation loop
  function animate() {
    cards.forEach(card => {
      card.update(mousePos.x, mousePos.y, cards);
    });
    requestAnimationFrame(animate);
  }
  
  animate();
  
  // Mouse tracking
  document.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
  });
}

// Toggle debug mode with Ctrl+D
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'd') {
    e.preventDefault();
    debugMode = !debugMode;
    console.log('Debug mode:', debugMode ? 'ON' : 'OFF');
    
    cards.forEach(card => {
      if (debugMode) {
        card.createDebugVisuals();
      } else {
        card.removeDebugVisuals();
      }
    });
  }
});

// Toggle grid debug mode with Ctrl+G
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'g') {
    e.preventDefault();
    gridDebugMode = !gridDebugMode;
    console.log('Grid debug mode:', gridDebugMode ? 'ON' : 'OFF');
    
    const grid = document.querySelector('.playground-grid');
    if (!grid) return;
    
    if (gridDebugMode) {
      // Create overlay that matches the grid structure
      const gridOverlay = document.createElement('div');
      gridOverlay.id = 'grid-debug-overlay';
      gridOverlay.style.position = 'fixed';
      gridOverlay.style.top = '0';
      gridOverlay.style.left = '0';
      gridOverlay.style.width = '100%';
      gridOverlay.style.height = '100%';
      gridOverlay.style.pointerEvents = 'none';
      gridOverlay.style.zIndex = '10000';
      
      // Get computed grid properties
      const gridRect = grid.getBoundingClientRect();
      const computedStyle = getComputedStyle(grid);
      const gridTemplateColumns = computedStyle.gridTemplateColumns;
      const gridTemplateRows = computedStyle.gridTemplateRows;
      const gap = computedStyle.gap;
      
      console.log('Grid Template Columns:', gridTemplateColumns);
      console.log('Grid Template Rows:', gridTemplateRows);
      console.log('Gap:', gap);
      
      // Create SVG to draw grid lines
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.style.position = 'fixed';
      svg.style.top = '0';
      svg.style.left = '0';
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.style.pointerEvents = 'none';
      svg.style.zIndex = '10000';
      
      // Draw vertical lines (columns)
      let x = gridRect.left;
      const columnWidths = gridTemplateColumns.split(' ');
      columnWidths.forEach((width, i) => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x);
        line.setAttribute('y1', '0');
        line.setAttribute('x2', x);
        line.setAttribute('y2', '100%');
        line.setAttribute('stroke', 'rgba(0,0,255,0.3)');
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);
        
        // Parse width value
        const widthValue = parseFloat(width);
        x += widthValue;
      });
      
      // Draw horizontal lines (rows)
      let y = gridRect.top;
      const rowHeights = gridTemplateRows.split(' ');
      rowHeights.forEach((height, i) => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '0');
        line.setAttribute('y1', y);
        line.setAttribute('x2', '100%');
        line.setAttribute('y2', y);
        line.setAttribute('stroke', 'rgba(255,0,0,0.3)');
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);
        
        // Parse height value
        const heightValue = parseFloat(height);
        y += heightValue;
      });
      
      document.body.appendChild(svg);
      
      // Also show grid info
      const info = document.createElement('div');
      info.id = 'grid-debug-info';
      info.style.position = 'fixed';
      info.style.top = '10px';
      info.style.left = '10px';
      info.style.background = 'rgba(0,0,0,0.8)';
      info.style.color = '#0f0';
      info.style.padding = '10px';
      info.style.fontFamily = 'monospace';
      info.style.fontSize = '12px';
      info.style.zIndex = '10001';
      info.style.pointerEvents = 'none';
      info.innerHTML = `Grid: ${gridRect.width.toFixed(0)}x${gridRect.height.toFixed(0)}px<br>Columns: ${gridTemplateColumns}<br>Rows: ${gridTemplateRows}`;
      document.body.appendChild(info);
    } else {
      // Remove grid overlay
      const overlay = document.getElementById('grid-debug-overlay');
      if (overlay) overlay.remove();
      
      const svg = document.querySelector('svg[style*="z-index: 10000"]');
      if (svg) svg.remove();
      
      const info = document.getElementById('grid-debug-info');
      if (info) info.remove();
    }
  }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initPhysics, 300);
  });
} else {
  // DOM already loaded
  setTimeout(initPhysics, 300);
}

// Handle window resize - recalculate grid positions with debounce
let resizeTimeout;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function() {
    // Reinitialize physics for all visible cards
    const visibleCards = document.querySelectorAll('.playground-card');
    cards = [];
    
    visibleCards.forEach(element => {
      // Skip hidden cards
      if (element.style.display === 'none') return;
      
      const physics = new CardPhysics(element);
      cards.push(physics);
    });
    
    // Update global reference
    window.cards = cards;
    
    console.log('Physics reinitialized after resize for', cards.length, 'cards');
  }, 300);
});

// Handle discipline filter changes - reinitialize physics for visible cards
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('filter-link')) {
    // Wait for filter to apply
    setTimeout(function() {
      const visibleCards = document.querySelectorAll('.playground-card');
      cards = [];
      
      visibleCards.forEach(element => {
        // Skip hidden cards
        if (element.style.display === 'none') return;
        
        const physics = new CardPhysics(element);
        cards.push(physics);
      });
      
      // Update global reference
      window.cards = cards;
      
      console.log('Physics reinitialized for', cards.length, 'visible cards');
    }, 100);
  }
});
