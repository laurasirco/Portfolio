/**
 * Tests for Playground 3D Scene
 * Validates: Requirements 4.1, 4.5
 */

describe('Playground3DScene', () => {
  let container;
  let scene;

  beforeEach(() => {
    // Create a container element
    container = document.createElement('div');
    container.id = 'playground-3d-container';
    container.style.width = '800px';
    container.style.height = '400px';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    if (scene && scene.renderer) {
      scene.renderer.dispose();
    }
  });

  test('should initialize 3D scene when container exists', () => {
    scene = new Playground3DScene();
    expect(scene.isInitialized).toBe(true);
    expect(scene.scene).not.toBeNull();
    expect(scene.camera).not.toBeNull();
    expect(scene.renderer).not.toBeNull();
  });

  test('should create a cube in the scene', () => {
    scene = new Playground3DScene();
    expect(scene.cube).not.toBeNull();
    expect(scene.cube.geometry).toBeInstanceOf(THREE.BoxGeometry);
  });

  test('should have proper lighting setup', () => {
    scene = new Playground3DScene();
    const lights = scene.scene.children.filter(child => child instanceof THREE.Light);
    expect(lights.length).toBeGreaterThanOrEqual(3); // Ambient, Directional, Point
  });

  test('should respond to mouse movement', () => {
    scene = new Playground3DScene();
    const initialRotationY = scene.cube.rotation.y;
    
    // Simulate mouse move event
    const event = new MouseEvent('mousemove', {
      clientX: 400,
      clientY: 200
    });
    document.dispatchEvent(event);
    
    // Target rotation should be updated
    expect(scene.targetRotation.y).not.toBe(0);
    expect(scene.targetRotation.x).not.toBe(0);
  });

  test('should respond to touch movement', () => {
    scene = new Playground3DScene();
    
    // Simulate touch move event
    const touch = new Touch({
      identifier: 0,
      target: document,
      clientX: 400,
      clientY: 200
    });
    const touchEvent = new TouchEvent('touchmove', {
      touches: [touch]
    });
    document.dispatchEvent(touchEvent);
    
    // Target rotation should be updated
    expect(scene.targetRotation.y).not.toBe(0);
    expect(scene.targetRotation.x).not.toBe(0);
  });

  test('should reset rotation on mouse leave', () => {
    scene = new Playground3DScene();
    
    // Set some target rotation
    scene.targetRotation.x = 0.5;
    scene.targetRotation.y = 0.5;
    
    // Simulate mouse leave
    const event = new MouseEvent('mouseleave');
    document.dispatchEvent(event);
    
    // Target rotation should be reset
    expect(scene.targetRotation.x).toBe(0);
    expect(scene.targetRotation.y).toBe(0);
  });

  test('should handle window resize', () => {
    scene = new Playground3DScene();
    const initialAspect = scene.camera.aspect;
    
    // Simulate window resize
    window.dispatchEvent(new Event('resize'));
    
    // Camera should still exist and be valid
    expect(scene.camera).not.toBeNull();
    expect(scene.renderer).not.toBeNull();
  });

  test('should not initialize if container does not exist', () => {
    // Remove the container
    document.body.removeChild(container);
    
    scene = new Playground3DScene();
    expect(scene.isInitialized).toBe(false);
  });

  test('should render continuously with animation loop', (done) => {
    scene = new Playground3DScene();
    const initialRotationZ = scene.cube.rotation.z;
    
    // Wait for a few animation frames
    setTimeout(() => {
      // Cube should have rotated (z-axis auto-rotation when not interacting)
      expect(scene.cube.rotation.z).toBeGreaterThan(initialRotationZ);
      done();
    }, 100);
  });

  test('should smoothly interpolate rotation changes', (done) => {
    scene = new Playground3DScene();
    
    // Set target rotation
    scene.targetRotation.x = Math.PI * 0.5;
    scene.targetRotation.y = Math.PI * 0.5;
    
    // Wait for interpolation
    setTimeout(() => {
      // Cube rotation should be closer to target but not exactly equal (smooth interpolation)
      expect(scene.cube.rotation.x).toBeGreaterThan(0);
      expect(scene.cube.rotation.x).toBeLessThan(Math.PI * 0.5);
      expect(scene.cube.rotation.y).toBeGreaterThan(0);
      expect(scene.cube.rotation.y).toBeLessThan(Math.PI * 0.5);
      done();
    }, 50);
  });
});
