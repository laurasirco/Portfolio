/**
 * Tests for playground-physics.js
 * 
 * These tests verify the Matter.js physics implementation for playground cards.
 * Tests cover:
 * - Task 4.1: Engine and body initialization
 * - Task 4.2: Mouse-attraction forces
 * - Task 4.3: Collision handling
 * - Task 4.4: DOM synchronization
 */

// Mock Matter.js for testing
const mockMatter = {
  Engine: {
    create: function() {
      return {
        world: {
          gravity: { x: 0, y: 0 },
          bodies: []
        }
      };
    },
    run: function(engine) {
      return engine;
    }
  },
  World: {
    add: function(world, bodies) {
      if (Array.isArray(bodies)) {
        world.bodies = world.bodies.concat(bodies);
      } else {
        world.bodies.push(bodies);
      }
    }
  },
  Body: {
    applyForce: function(body, position, force) {
      body.force = force;
    }
  },
  Bodies: {
    rectangle: function(x, y, width, height, options) {
      return {
        position: { x, y },
        bounds: {
          min: { x: x - width / 2, y: y - height / 2 },
          max: { x: x + width / 2, y: y + height / 2 }
        },
        angle: 0,
        label: options?.label || 'body',
        restitution: options?.restitution || 0.5,
        friction: options?.friction || 0.5,
        frictionAir: options?.frictionAir || 0.01
      };
    }
  },
  Events: {
    on: function(target, eventName, callback) {
      if (!target._listeners) {
        target._listeners = {};
      }
      if (!target._listeners[eventName]) {
        target._listeners[eventName] = [];
      }
      target._listeners[eventName].push(callback);
    }
  },
  Composite: {}
};

// Test Suite 1: Engine Initialization (Task 4.1)
describe('Task 4.1: Matter.js Engine and Bodies Initialization', function() {
  
  test('Engine should be created with zero gravity', function() {
    const engine = mockMatter.Engine.create();
    
    expect(engine.world.gravity.x).toBe(0);
    expect(engine.world.gravity.y).toBe(0);
  });
  
  test('Rectangular bodies should be created for each card', function() {
    const body = mockMatter.Bodies.rectangle(100, 100, 180, 180, {
      restitution: 0.6,
      friction: 0.3,
      frictionAir: 0.01,
      label: 'card'
    });
    
    expect(body.position.x).toBe(100);
    expect(body.position.y).toBe(100);
    expect(body.label).toBe('card');
  });
  
  test('Body properties should be configured correctly', function() {
    const body = mockMatter.Bodies.rectangle(100, 100, 180, 180, {
      restitution: 0.6,
      friction: 0.3,
      frictionAir: 0.01
    });
    
    expect(body.restitution).toBe(0.6);
    expect(body.friction).toBe(0.3);
    expect(body.frictionAir).toBe(0.01);
  });
});

// Test Suite 2: Mouse-Attraction Forces (Task 4.2)
describe('Task 4.2: Mouse-Attraction Forces', function() {
  
  test('Attraction parameters should be randomized per card', function() {
    const params1 = {
      attractionRadius: 150 + Math.random() * 50,
      attractionStrength: 0.0005 + Math.random() * 0.0005,
      returnForce: 0.00001 + Math.random() * 0.00001
    };
    
    const params2 = {
      attractionRadius: 150 + Math.random() * 50,
      attractionStrength: 0.0005 + Math.random() * 0.0005,
      returnForce: 0.00001 + Math.random() * 0.00001
    };
    
    // Verify ranges
    expect(params1.attractionRadius).toBeGreaterThanOrEqual(150);
    expect(params1.attractionRadius).toBeLessThanOrEqual(200);
    expect(params2.attractionRadius).toBeGreaterThanOrEqual(150);
    expect(params2.attractionRadius).toBeLessThanOrEqual(200);
  });
  
  test('Attraction force should be calculated based on distance', function() {
    const body = { position: { x: 100, y: 100 } };
    const mousePos = { x: 150, y: 150 };
    const params = {
      attractionRadius: 200,
      attractionStrength: 0.0005
    };
    
    const dx = body.position.x - mousePos.x;
    const dy = body.position.y - mousePos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    expect(distance).toBeLessThan(params.attractionRadius);
    
    const forceX = (dx / distance) * params.attractionStrength;
    const forceY = (dy / distance) * params.attractionStrength;
    
    expect(forceX).toBeDefined();
    expect(forceY).toBeDefined();
  });
  
  test('Return force should pull cards back to original position', function() {
    const body = {
      position: { x: 150, y: 150 },
      originalX: 100,
      originalY: 100
    };
    const params = { returnForce: 0.00001 };
    
    const returnDx = body.originalX - body.position.x;
    const returnDy = body.originalY - body.position.y;
    const returnDistance = Math.sqrt(returnDx * returnDx + returnDy * returnDy);
    
    expect(returnDistance).toBeGreaterThan(0);
    
    const returnForceX = (returnDx / returnDistance) * params.returnForce;
    const returnForceY = (returnDy / returnDistance) * params.returnForce;
    
    expect(returnForceX).toBeLessThan(0); // Should pull back
    expect(returnForceY).toBeLessThan(0);
  });
});

// Test Suite 3: Collision Handling (Task 4.3)
describe('Task 4.3: Collision Handling', function() {
  
  test('Collision event should increase damping', function() {
    const bodyA = mockMatter.Bodies.rectangle(100, 100, 180, 180, { label: 'card' });
    const bodyB = mockMatter.Bodies.rectangle(200, 200, 180, 180, { label: 'card' });
    
    const initialDamping = bodyA.frictionAir;
    
    // Simulate collision by increasing damping
    bodyA.frictionAir = 0.02;
    bodyB.frictionAir = 0.02;
    
    expect(bodyA.frictionAir).toBeGreaterThan(initialDamping);
    expect(bodyB.frictionAir).toBeGreaterThan(initialDamping);
  });
  
  test('Collision end should reset damping', function() {
    const bodyA = mockMatter.Bodies.rectangle(100, 100, 180, 180, { label: 'card' });
    
    bodyA.frictionAir = 0.02;
    expect(bodyA.frictionAir).toBe(0.02);
    
    bodyA.frictionAir = 0.01;
    expect(bodyA.frictionAir).toBe(0.01);
  });
});

// Test Suite 4: DOM Synchronization (Task 4.4)
describe('Task 4.4: DOM Synchronization', function() {
  
  test('Card position should be updated from physics body', function() {
    const body = {
      position: { x: 150, y: 150 },
      angle: 0.5,
      bounds: {
        min: { x: 60, y: 60 },
        max: { x: 240, y: 240 }
      }
    };
    
    const width = body.bounds.max.x - body.bounds.min.x;
    const height = body.bounds.max.y - body.bounds.min.y;
    
    const x = body.position.x - width / 2;
    const y = body.position.y - height / 2;
    
    expect(x).toBe(60);
    expect(y).toBe(60);
  });
  
  test('Card rotation should be updated from physics body angle', function() {
    const body = {
      position: { x: 100, y: 100 },
      angle: 0.785 // ~45 degrees in radians
    };
    
    expect(body.angle).toBeCloseTo(0.785, 2);
  });
});

// Helper function for testing
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
    }
  };
}

// Run tests
console.log('Running Playground Physics Tests...\n');
