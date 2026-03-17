/**
 * Tests for Sticker Drag System - Anchor Centering
 * Validates: Requirements 1.1, 1.2, 1.3
 * 
 * Property 1: Sticker Anchor Centered at Cursor
 * Property 2: Sticker Follows Cursor Smoothly
 */

import { StickerDragSystem } from '../assets/js/systems/drag-system.js';

describe('StickerDragSystem - Anchor Centering', () => {
  let stickerElement;
  let dragSystem;

  beforeEach(() => {
    // Create a mock sticker element
    stickerElement = document.createElement('div');
    stickerElement.className = 'sticker-wrapper';
    stickerElement.style.position = 'absolute';
    stickerElement.style.width = '100px';
    stickerElement.style.height = '100px';
    stickerElement.style.left = '200px';
    stickerElement.style.top = '200px';
    document.body.appendChild(stickerElement);

    dragSystem = new StickerDragSystem();
  });

  afterEach(() => {
    // Clean up
    if (dragSystem) {
      dragSystem.destroy();
    }
    if (stickerElement && stickerElement.parentNode) {
      stickerElement.parentNode.removeChild(stickerElement);
    }
  });

  test('should initialize drag system without errors', () => {
    dragSystem.init(stickerElement);
    expect(dragSystem.element).toBe(stickerElement);
    expect(dragSystem.isDragging).toBe(false);
  });

  test('should center anchor at cursor position when drag starts', () => {
    dragSystem.init(stickerElement);

    // Simulate mouse down at cursor position (300, 300)
    const mouseDownEvent = new MouseEvent('mousedown', {
      clientX: 300,
      clientY: 300,
      bubbles: true
    });

    stickerElement.dispatchEvent(mouseDownEvent);

    // After startDrag, the offset should be calculated from element center
    // Element is at (200, 200) with size 100x100, so center is at (250, 250)
    // Cursor is at (300, 300), so offset should be (50, 50)
    expect(dragSystem.offsetX).toBe(50);
    expect(dragSystem.offsetY).toBe(50);
    expect(dragSystem.isDragging).toBe(true);
  });

  test('should not jump to top-right corner when dragging begins', () => {
    dragSystem.init(stickerElement);

    // Initial position
    const initialLeft = parseFloat(stickerElement.style.left);
    const initialTop = parseFloat(stickerElement.style.top);

    // Simulate mouse down
    const mouseDownEvent = new MouseEvent('mousedown', {
      clientX: 300,
      clientY: 300,
      bubbles: true
    });
    stickerElement.dispatchEvent(mouseDownEvent);

    // Position should not change on mousedown
    expect(parseFloat(stickerElement.style.left)).toBe(initialLeft);
    expect(parseFloat(stickerElement.style.top)).toBe(initialTop);
  });

  test('should follow cursor smoothly during drag', () => {
    dragSystem.init(stickerElement);

    // Start drag at (300, 300)
    const mouseDownEvent = new MouseEvent('mousedown', {
      clientX: 300,
      clientY: 300,
      bubbles: true
    });
    stickerElement.dispatchEvent(mouseDownEvent);

    // Move cursor to (350, 350)
    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: 350,
      clientY: 350,
      bubbles: true
    });
    document.dispatchEvent(mouseMoveEvent);

    // Element should move to keep center at cursor position
    // Cursor at (350, 350), offset is (50, 50)
    // So element should be at (300, 300)
    expect(parseFloat(stickerElement.style.left)).toBe(300);
    expect(parseFloat(stickerElement.style.top)).toBe(300);
  });

  test('should maintain consistent offset throughout drag', () => {
    dragSystem.init(stickerElement);

    // Start drag at (300, 300)
    const mouseDownEvent = new MouseEvent('mousedown', {
      clientX: 300,
      clientY: 300,
      bubbles: true
    });
    stickerElement.dispatchEvent(mouseDownEvent);

    const initialOffsetX = dragSystem.offsetX;
    const initialOffsetY = dragSystem.offsetY;

    // Move to (400, 400)
    const mouseMoveEvent1 = new MouseEvent('mousemove', {
      clientX: 400,
      clientY: 400,
      bubbles: true
    });
    document.dispatchEvent(mouseMoveEvent1);

    // Move to (500, 500)
    const mouseMoveEvent2 = new MouseEvent('mousemove', {
      clientX: 500,
      clientY: 500,
      bubbles: true
    });
    document.dispatchEvent(mouseMoveEvent2);

    // Offset should remain constant
    expect(dragSystem.offsetX).toBe(initialOffsetX);
    expect(dragSystem.offsetY).toBe(initialOffsetY);
  });

  test('should calculate reduced inertia correctly', () => {
    dragSystem.init(stickerElement, { inertiaMultiplier: 0.5 });

    const velocity = { x: 100, y: 100 };
    const inertia = dragSystem.calculateReducedInertia(velocity);

    // With 0.5 multiplier, inertia should be 50% of velocity
    expect(inertia.x).toBe(50);
    expect(inertia.y).toBe(50);
  });

  test('should support custom inertia multiplier', () => {
    dragSystem.init(stickerElement, { inertiaMultiplier: 0.25 });

    const velocity = { x: 100, y: 100 };
    const inertia = dragSystem.calculateReducedInertia(velocity);

    // With 0.25 multiplier, inertia should be 25% of velocity
    expect(inertia.x).toBe(25);
    expect(inertia.y).toBe(25);
  });

  test('should call onDragStart callback when drag begins', () => {
    const onDragStart = jest.fn();
    dragSystem.init(stickerElement, { onDragStart });

    const mouseDownEvent = new MouseEvent('mousedown', {
      clientX: 300,
      clientY: 300,
      bubbles: true
    });
    stickerElement.dispatchEvent(mouseDownEvent);

    expect(onDragStart).toHaveBeenCalled();
  });

  test('should call onDragEnd callback when drag ends', () => {
    const onDragEnd = jest.fn();
    dragSystem.init(stickerElement, { onDragEnd });

    // Start drag
    const mouseDownEvent = new MouseEvent('mousedown', {
      clientX: 300,
      clientY: 300,
      bubbles: true
    });
    stickerElement.dispatchEvent(mouseDownEvent);

    // End drag
    const mouseUpEvent = new MouseEvent('mouseup', {
      clientX: 350,
      clientY: 350,
      bubbles: true
    });
    document.dispatchEvent(mouseUpEvent);

    expect(onDragEnd).toHaveBeenCalled();
  });

  test('should handle multiple stickers independently', () => {
    const sticker2 = document.createElement('div');
    sticker2.className = 'sticker-wrapper';
    sticker2.style.position = 'absolute';
    sticker2.style.width = '100px';
    sticker2.style.height = '100px';
    sticker2.style.left = '500px';
    sticker2.style.top = '500px';
    document.body.appendChild(sticker2);

    const dragSystem2 = new StickerDragSystem();
    dragSystem.init(stickerElement);
    dragSystem2.init(sticker2);

    // Drag first sticker
    const mouseDownEvent1 = new MouseEvent('mousedown', {
      clientX: 300,
      clientY: 300,
      bubbles: true
    });
    stickerElement.dispatchEvent(mouseDownEvent1);

    // Drag second sticker
    const mouseDownEvent2 = new MouseEvent('mousedown', {
      clientX: 600,
      clientY: 600,
      bubbles: true
    });
    sticker2.dispatchEvent(mouseDownEvent2);

    // Both should be dragging independently
    expect(dragSystem.isDragging).toBe(true);
    expect(dragSystem2.isDragging).toBe(true);

    // Clean up
    dragSystem2.destroy();
    sticker2.parentNode.removeChild(sticker2);
  });
});
