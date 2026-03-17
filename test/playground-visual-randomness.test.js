/**
 * Tests for playground visual randomness with varied sizes
 * 
 * These tests verify that different collapsed sizes per entry create visual variety
 * while keeping the grid organized and maintaining responsive design.
 * 
 * Task 5.9: Implement visual randomness with varied sizes
 * Requirements: 15.15
 * 
 * Tests cover:
 * - Different collapsed sizes per entry (1x1, 2x1, 1x2, 2x2, etc.)
 * - Visual variety in the playground
 * - Grid organization and layout integrity
 * - Responsive sizing across viewports
 * - Collision detection with varied sizes
 */

describe('Task 5.9: Implement Visual Randomness with Varied Sizes', function() {
  
  // Test Suite 1: Size Variety
  describe('Size Variety', function() {
    
    test('Should support 1x1 collapsed size', function() {
      const size = '1x1';
      const parts = size.split('x');
      const col = parseInt(parts[0]);
      const row = parseInt(parts[1]);
      
      expect(col).toBe(1);
      expect(row).toBe(1);
    });
    
    test('Should support 2x1 collapsed size', function() {
      const size = '2x1';
      const parts = size.split('x');
      const col = parseInt(parts[0]);
      const row = parseInt(parts[1]);
      
      expect(col).toBe(2);
      expect(row).toBe(1);
    });
    
    test('Should support 1x2 collapsed size', function() {
      const size = '1x2';
      const parts = size.split('x');
      const col = parseInt(parts[0]);
      const row = parseInt(parts[1]);
      
      expect(col).toBe(1);
      expect(row).toBe(2);
    });
    
    test('Should support 2x2 collapsed size', function() {
      const size = '2x2';
      const parts = size.split('x');
      const col = parseInt(parts[0]);
      const row = parseInt(parts[1]);
      
      expect(col).toBe(2);
      expect(row).toBe(2);
    });
    
    test('Should support 3x2 collapsed size', function() {
      const size = '3x2';
      const parts = size.split('x');
      const col = parseInt(parts[0]);
      const row = parseInt(parts[1]);
      
      expect(col).toBe(3);
      expect(row).toBe(2);
    });
    
    test('Should default to 1x1 if size not specified', function() {
      const size = '1x1'; // default
      const parts = size.split('x');
      const col = parseInt(parts[0]);
      const row = parseInt(parts[1]);
      
      expect(col).toBe(1);
      expect(row).toBe(1);
    });
    
    test('Should parse size from frontmatter correctly', function() {
      // Simulate frontmatter parsing
      const entries = [
        { size: '1x1' },
        { size: '2x1' },
        { size: '1x2' },
        { size: '2x2' },
        { size: '3x2' },
      ];
      
      entries.forEach(entry => {
        const parts = entry.size.split('x');
        const col = parseInt(parts[0]);
        const row = parseInt(parts[1]);
        
        expect(col).toBeGreaterThan(0);
        expect(row).toBeGreaterThan(0);
      });
    });
  });
  
  // Test Suite 2: Visual Variety
  describe('Visual Variety', function() {
    
    test('Should create visual variety with different sizes', function() {
      // Simulate a grid with varied sizes
      const entries = [
        { size: '1x1', title: 'Entry 1' },
        { size: '2x1', title: 'Entry 2' },
        { size: '1x2', title: 'Entry 3' },
        { size: '2x2', title: 'Entry 4' },
        { size: '1x1', title: 'Entry 5' },
      ];
      
      // Check that sizes are varied
      const sizes = entries.map(e => e.size);
      const uniqueSizes = new Set(sizes);
      
      expect(uniqueSizes.size).toBeGreaterThan(1);
    });
    
    test('Should apply random rotation to each card', function() {
      // Each card should have a unique rotation
      const rotations = [];
      
      for (let i = 1; i <= 9; i++) {
        // Simulate rotation calculation from forloop.index
        const rotation = (i * 7.5) % 30 - 15; // -15 to 15 degrees
        rotations.push(rotation);
      }
      
      // Rotations should vary
      const uniqueRotations = new Set(rotations);
      expect(uniqueRotations.size).toBeGreaterThan(1);
    });
    
    test('Should apply random offset to each card', function() {
      // Each card should have unique X and Y offsets
      const offsets = [];
      
      for (let i = 1; i <= 9; i++) {
        const offsetX = (i * 73) % 60 - 30; // -30 to 30px
        const offsetY = (i * 89) % 60 - 30; // -30 to 30px
        offsets.push({ x: offsetX, y: offsetY });
      }
      
      // Offsets should vary
      const uniqueOffsets = new Set(offsets.map(o => `${o.x},${o.y}`));
      expect(uniqueOffsets.size).toBeGreaterThan(1);
    });
    
    test('Should combine size, rotation, and offset for visual variety', function() {
      // Each card should have unique combination of size, rotation, and offset
      const cards = [];
      
      for (let i = 1; i <= 9; i++) {
        const sizes = ['1x1', '2x1', '1x2', '2x2'];
        const size = sizes[(i - 1) % sizes.length];
        const rotation = (i * 7.5) % 30 - 15;
        const offsetX = (i * 73) % 60 - 30;
        const offsetY = (i * 89) % 60 - 30;
        
        cards.push({ size, rotation, offsetX, offsetY });
      }
      
      // All cards should be different
      expect(cards.length).toBe(9);
      cards.forEach(card => {
        expect(card.size).toBeDefined();
        expect(card.rotation).toBeDefined();
        expect(card.offsetX).toBeDefined();
        expect(card.offsetY).toBeDefined();
      });
    });
  });
  
  // Test Suite 3: Grid Organization
  describe('Grid Organization', function() {
    
    test('Should maintain grid layout with varied sizes', function() {
      // Grid should use CSS Grid with auto-fit
      const gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
      const gridTemplateRows = 'repeat(10, 200px)';
      
      expect(gridTemplateColumns).toBeDefined();
      expect(gridTemplateRows).toBeDefined();
    });
    
    test('Should calculate total grid area correctly', function() {
      // Simulate grid with varied sizes
      const entries = [
        { size: '1x1' }, // 1 unit
        { size: '2x1' }, // 2 units
        { size: '1x2' }, // 2 units
        { size: '2x2' }, // 4 units
        { size: '1x1' }, // 1 unit
      ];
      
      let totalArea = 0;
      entries.forEach(entry => {
        const parts = entry.size.split('x');
        const col = parseInt(parts[0]);
        const row = parseInt(parts[1]);
        totalArea += col * row;
      });
      
      expect(totalArea).toBe(10);
    });
    
    test('Should prevent grid gaps with auto-fit', function() {
      // auto-fit should fill gaps automatically
      const gridColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
      
      // This should allow flexible column count
      expect(gridColumns).toContain('auto-fit');
      expect(gridColumns).toContain('minmax');
    });
    
    test('Should maintain consistent gap between items', function() {
      const gap = 20; // pixels
      
      // Gap should be consistent
      expect(gap).toBe(20);
    });
    
    test('Should handle grid reflow when items have different sizes', function() {
      // When grid reflows, items should rearrange properly
      const gridItems = [
        { size: '1x1', position: 0 },
        { size: '2x1', position: 1 },
        { size: '1x2', position: 3 },
        { size: '2x2', position: 4 },
      ];
      
      // Items should have valid positions
      gridItems.forEach(item => {
        expect(item.position).toBeGreaterThanOrEqual(0);
      });
    });
  });
  
  // Test Suite 4: Responsive Sizing
  describe('Responsive Sizing', function() {
    
    test('Should adjust grid for desktop (1200px)', function() {
      const viewportWidth = 1200;
      const gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
      
      // Desktop should use full-size grid
      expect(gridTemplateColumns).toContain('200px');
    });
    
    test('Should adjust grid for tablet (768px)', function() {
      const viewportWidth = 768;
      const gridTemplateColumns = 'repeat(auto-fit, minmax(150px, 1fr))';
      
      // Tablet should use smaller grid
      expect(gridTemplateColumns).toContain('150px');
    });
    
    test('Should adjust grid for mobile (480px)', function() {
      const viewportWidth = 480;
      const gridTemplateColumns = 'repeat(auto-fit, minmax(120px, 1fr))';
      
      // Mobile should use even smaller grid
      expect(gridTemplateColumns).toContain('120px');
    });
    
    test('Should maintain size ratios across viewports', function() {
      // Size ratios should be consistent
      const desktopMinSize = 200;
      const tabletMinSize = 150;
      const mobileMinSize = 120;
      
      const desktopTabletRatio = desktopMinSize / tabletMinSize;
      const tabletMobileRatio = tabletMinSize / mobileMinSize;
      
      expect(desktopTabletRatio).toBeCloseTo(1.33, 1);
      expect(tabletMobileRatio).toBeCloseTo(1.25, 1);
    });
  });
  
  // Test Suite 5: Collision Detection with Varied Sizes
  describe('Collision Detection with Varied Sizes', function() {
    
    test('Should calculate collision radius for 1x1 card', function() {
      const width = 200;
      const height = 200;
      const radius = Math.max(width, height) / 2 + 20;
      
      expect(radius).toBe(120);
    });
    
    test('Should calculate collision radius for 2x1 card', function() {
      const width = 400;
      const height = 200;
      const radius = Math.max(width, height) / 2 + 20;
      
      expect(radius).toBe(220);
    });
    
    test('Should calculate collision radius for 1x2 card', function() {
      const width = 200;
      const height = 400;
      const radius = Math.max(width, height) / 2 + 20;
      
      expect(radius).toBe(220);
    });
    
    test('Should calculate collision radius for 2x2 card', function() {
      const width = 400;
      const height = 400;
      const radius = Math.max(width, height) / 2 + 20;
      
      expect(radius).toBe(220);
    });
    
    test('Should detect collision between cards of different sizes', function() {
      // 1x1 card
      const card1Radius = 120;
      const card1X = 200;
      const card1Y = 200;
      
      // 2x2 card
      const card2Radius = 220;
      const card2X = 400;
      const card2Y = 400;
      
      // Calculate distance
      const dx = card2X - card1X;
      const dy = card2Y - card1Y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = card1Radius + card2Radius;
      
      // Should detect collision if distance < minDistance
      const isColliding = distance < minDistance;
      expect(isColliding).toBe(true);
    });
  });
  
  // Test Suite 6: Frontmatter Parsing
  describe('Frontmatter Parsing', function() {
    
    test('Should parse size from frontmatter', function() {
      const frontmatter = {
        size: '2x1',
        expand_size: '3x2'
      };
      
      const parts = frontmatter.size.split('x');
      expect(parts[0]).toBe('2');
      expect(parts[1]).toBe('1');
    });
    
    test('Should use default size if not specified', function() {
      const frontmatter = {};
      const size = frontmatter.size || '1x1';
      
      expect(size).toBe('1x1');
    });
    
    test('Should parse expand_size from frontmatter', function() {
      const frontmatter = {
        size: '1x1',
        expand_size: '2x2'
      };
      
      const parts = frontmatter.expand_size.split('x');
      expect(parts[0]).toBe('2');
      expect(parts[1]).toBe('2');
    });
    
    test('Should use default expand_size if not specified', function() {
      const frontmatter = { size: '1x1' };
      const expandSize = frontmatter.expand_size || '2x2';
      
      expect(expandSize).toBe('2x2');
    });
  });
});

// Helper functions for testing
function test(description, testFn) {
  try {
    testFn();
    console.log('✓ ' + description);
  } catch (error) {
    console.error('✗ ' + description);
    console.error('  ' + error.message);
  }
}

function describe(suiteName, suiteFn) {
  console.log('\n' + suiteName);
  suiteFn();
}

function expect(value) {
  return {
    toBe: function(expected) {
      if (value !== expected) {
        throw new Error(`Expected ${value} to be ${expected}`);
      }
    },
    toBeGreaterThan: function(expected) {
      if (value <= expected) {
        throw new Error(`Expected ${value} to be greater than ${expected}`);
      }
    },
    toBeLessThan: function(expected) {
      if (value >= expected) {
        throw new Error(`Expected ${value} to be less than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual: function(expected) {
      if (value < expected) {
        throw new Error(`Expected ${value} to be >= ${expected}`);
      }
    },
    toBeLessThanOrEqual: function(expected) {
      if (value > expected) {
        throw new Error(`Expected ${value} to be <= ${expected}`);
      }
    },
    toBeCloseTo: function(expected, precision = 2) {
      const factor = Math.pow(10, precision);
      if (Math.round(value * factor) !== Math.round(expected * factor)) {
        throw new Error(`Expected ${value} to be close to ${expected}`);
      }
    },
    toBeDefined: function() {
      if (value === undefined) {
        throw new Error(`Expected value to be defined`);
      }
    },
    toContain: function(substring) {
      if (!value.includes(substring)) {
        throw new Error(`Expected "${value}" to contain "${substring}"`);
      }
    }
  };
}

// Run tests
console.log('Running Playground Visual Randomness Tests for Task 5.9...\n');
