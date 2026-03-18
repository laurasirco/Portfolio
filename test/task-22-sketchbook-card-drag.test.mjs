import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const results = [];

async function test(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({ name, ok: false, error });
    console.error(`FAIL ${name}`);
    console.error(error.stack);
  }
}

await test('Playground layout loads sketchbook card drag script', async () => {
  const layout = await fs.readFile(path.join(projectRoot, '_layouts/playground.html'), 'utf8');
  assert.match(layout, /\/assets\/js\/playground-card-drag\.js/);
});

await test('Sketchbook card drag uses sticker-like drag via left/top with inertia and click suppression', async () => {
  const script = await fs.readFile(path.join(projectRoot, 'assets/js/playground-card-drag.js'), 'utf8');

  assert.match(script, /class SketchbookCardDragSystem/);
  assert.match(script, /SCALE_ON_DRAG\s*=\s*1\.08/);
  assert.match(script, /DRAG_ROTATION_MAX\s*=\s*8/);
  assert.match(script, /RELEASE_ROTATION_MAX\s*=\s*14/);
  assert.match(script, /INERTIA_DURATION\s*=\s*0\.6/);
  assert.match(script, /INERTIA_FRICTION\s*=\s*0\.35/);
  assert.match(script, /addEventListener\('mousedown'/);
  assert.match(script, /addEventListener\('touchstart'/);
  assert.match(script, /addEventListener\('dragstart', this\.preventNativeDrag\)/);
  assert.match(script, /setAttribute\('draggable', 'false'\)/);
  assert.match(script, /this\.card\.style\.left/);
  assert.match(script, /this\.card\.style\.top/);
  assert.match(script, /gsap\.to\(this\.card,\s*\{\s*scale:\s*SCALE_ON_DRAG/s);
  assert.match(script, /gsap\.to\(this\.card,\s*\{\s*scale:\s*1/s);
  assert.match(script, /rotation:\s*dragRotation/);
  assert.match(script, /rotation:\s*releaseRotation/);
  assert.match(script, /addEventListener\('click', this\.handleClickCapture, true\)/);
  assert.match(script, /clickSuppressUntil/);
});

await test('Sketchbook card drag clamps movement inside each day section and uses touch scroll lock', async () => {
  const script = await fs.readFile(path.join(projectRoot, 'assets/js/playground-card-drag.js'), 'utf8');

  assert.match(script, /closest\('\.sketchbook-day-section'\)/);
  assert.match(script, /clampRelativePosition/);
  assert.match(script, /BOUNDS_PADDING/);
  assert.match(script, /TouchScrollLock\.lock/);
  assert.match(script, /TouchScrollLock\.unlock/);
});

const failed = results.filter((result) => !result.ok);
console.log(`\n${results.length - failed.length}/${results.length} tests passed`);

if (failed.length > 0) {
  process.exit(1);
}
