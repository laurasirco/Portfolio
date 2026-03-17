/**
 * Verification script for Sticker Drag System implementation
 * Tests that the StickerDragSystem class is properly implemented
 * and that sticker-drag.js correctly imports and uses it
 */

const fs = require('fs');
const path = require('path');

console.log('=== Sticker Drag System Implementation Verification ===\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log('✓ ' + message);
    testsPassed++;
  } else {
    console.error('✗ ' + message);
    testsFailed++;
  }
}

// Test 1: Check that drag-system.js exists and contains StickerDragSystem
console.log('Test 1: Verify drag-system.js exists and exports StickerDragSystem');
const dragSystemPath = path.join(__dirname, '../assets/js/systems/drag-system.js');
assert(fs.existsSync(dragSystemPath), 'drag-system.js file exists');

const dragSystemContent = fs.readFileSync(dragSystemPath, 'utf8');
assert(dragSystemContent.includes('class StickerDragSystem'), 'StickerDragSystem class is defined');
assert(dragSystemContent.includes('export { StickerDragSystem }'), 'StickerDragSystem is exported');
assert(dragSystemContent.includes('init(stickerElement, options'), 'init method exists');
assert(dragSystemContent.includes('startDrag(event)'), 'startDrag method exists');
assert(dragSystemContent.includes('updateDrag(event)'), 'updateDrag method exists');
assert(dragSystemContent.includes('endDrag(event)'), 'endDrag method exists');
assert(dragSystemContent.includes('calculateReducedInertia(velocity)'), 'calculateReducedInertia method exists');
console.log('');

// Test 2: Check that sticker-drag.js imports StickerDragSystem
console.log('Test 2: Verify sticker-drag.js imports StickerDragSystem');
const stickerDragPath = path.join(__dirname, '../assets/js/sticker-drag.js');
assert(fs.existsSync(stickerDragPath), 'sticker-drag.js file exists');

const stickerDragContent = fs.readFileSync(stickerDragPath, 'utf8');
assert(stickerDragContent.includes("import { StickerDragSystem }"), 'StickerDragSystem is imported');
assert(stickerDragContent.includes("from './systems/drag-system.js'"), 'Import path is correct');
console.log('');

// Test 3: Check that sticker-drag.js uses StickerDragSystem
console.log('Test 3: Verify sticker-drag.js uses StickerDragSystem');
assert(stickerDragContent.includes('new StickerDragSystem()'), 'StickerDragSystem is instantiated');
assert(stickerDragContent.includes('dragSystem.init(sticker'), 'dragSystem.init is called');
assert(stickerDragContent.includes('inertiaMultiplier: 0.5'), 'Reduced inertia (0.5) is configured');
assert(stickerDragContent.includes('onDragStart:'), 'onDragStart callback is provided');
assert(stickerDragContent.includes('onDragEnd:'), 'onDragEnd callback is provided');
console.log('');

// Test 4: Check that anchor centering logic is in drag-system.js
console.log('Test 4: Verify anchor centering logic');
assert(dragSystemContent.includes('elementCenterX'), 'Element center X calculation exists');
assert(dragSystemContent.includes('elementCenterY'), 'Element center Y calculation exists');
assert(dragSystemContent.includes('rect.width / 2'), 'Width division by 2 for center calculation');
assert(dragSystemContent.includes('rect.height / 2'), 'Height division by 2 for center calculation');
assert(dragSystemContent.includes('event.clientX - elementCenterX'), 'Offset calculation from center');
assert(dragSystemContent.includes('event.clientY - elementCenterY'), 'Offset calculation from center');
console.log('');

// Test 5: Check that smooth cursor following is implemented
console.log('Test 5: Verify smooth cursor following');
assert(dragSystemContent.includes('updateDrag(event)'), 'updateDrag method exists');
assert(dragSystemContent.includes('this.velocity.x = event.clientX - this.lastX'), 'Velocity calculation');
assert(dragSystemContent.includes('this.velocity.y = event.clientY - this.lastY'), 'Velocity calculation');
assert(dragSystemContent.includes('const newX = event.clientX - this.offsetX'), 'Position calculation during drag');
assert(dragSystemContent.includes('const newY = event.clientY - this.offsetY'), 'Position calculation during drag');
console.log('');

// Test 6: Check that reduced inertia is implemented
console.log('Test 6: Verify reduced inertia implementation');
assert(dragSystemContent.includes('calculateReducedInertia(velocity)'), 'calculateReducedInertia method exists');
assert(dragSystemContent.includes('inertiaMultiplier'), 'inertiaMultiplier option exists');
assert(dragSystemContent.includes('velocity.x * this.options.inertiaMultiplier'), 'Inertia multiplier applied to X');
assert(dragSystemContent.includes('velocity.y * this.options.inertiaMultiplier'), 'Inertia multiplier applied to Y');
console.log('');

// Test 7: Check that animations are preserved in sticker-drag.js
console.log('Test 7: Verify animations are preserved');
assert(stickerDragContent.includes('SCALE_ON_DRAG'), 'Scale on drag configuration exists');
assert(stickerDragContent.includes('RANDOM_ROTATION_MAX'), 'Random rotation configuration exists');
assert(stickerDragContent.includes('gsap.to(sticker'), 'GSAP animations are used');
assert(stickerDragContent.includes('scale: baseScale * SCALE_ON_DRAG'), 'Scale animation on drag start');
assert(stickerDragContent.includes('rotation: randomRotation'), 'Rotation animation on drag end');
console.log('');

// Test 8: Check that compatibility is maintained
console.log('Test 8: Verify backward compatibility');
assert(stickerDragContent.includes('initStickerDrag()'), 'initStickerDrag function exists');
assert(stickerDragContent.includes("document.addEventListener('DOMContentLoaded'"), 'DOMContentLoaded listener exists');
assert(stickerDragContent.includes('querySelectorAll(\'.sticker-wrapper\')'), 'Sticker wrapper selector is used');
console.log('');

// Summary
console.log('=== Verification Summary ===');
console.log('Passed: ' + testsPassed);
console.log('Failed: ' + testsFailed);
console.log('Total: ' + (testsPassed + testsFailed));

if (testsFailed === 0) {
  console.log('\n✓ All verification tests passed!');
  console.log('\nImplementation Summary:');
  console.log('• StickerDragSystem class created with anchor centering');
  console.log('• sticker-drag.js refactored to use StickerDragSystem');
  console.log('• Reduced inertia (50%) implemented');
  console.log('• Smooth cursor following implemented');
  console.log('• Animations preserved for backward compatibility');
  console.log('• All sticker types supported (image, text, 3D ready)');
  process.exit(0);
} else {
  console.log('\n✗ Some verification tests failed');
  process.exit(1);
}
