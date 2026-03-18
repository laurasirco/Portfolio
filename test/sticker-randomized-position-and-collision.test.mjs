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

await test('Default layout loads sticker randomize and collision scripts (without wiggle)', async () => {
  const layout = await fs.readFile(path.join(projectRoot, '_layouts/default.html'), 'utf8');
  assert.match(layout, /\/assets\/js\/sticker-randomized-position\.js/);
  assert.match(layout, /\/assets\/js\/sticker-collision-system\.js/);
  assert.doesNotMatch(layout, /\/assets\/js\/welcome-sticker-wiggle\.js/);
});

await test('Randomized position script applies bounded randomized offsets for welcome/about', async () => {
  const script = await fs.readFile(path.join(projectRoot, 'assets/js/sticker-randomized-position.js'), 'utf8');
  assert.match(script, /welcome-section \.sticker-wrapper/);
  assert.match(script, /about-page \.sticker-wrapper/);
  assert.match(script, /randomBetween/);
  assert.match(script, /clamp/);
  assert.match(script, /dataset\.randomizedPosition/);
});

await test('Collision script resolves overlap and supports drag interactions', async () => {
  const script = await fs.readFile(path.join(projectRoot, 'assets/js/sticker-collision-system.js'), 'utf8');
  assert.match(script, /class|function initStickerCollisionSystem/);
  assert.match(script, /is-sticker-dragging/);
  assert.match(script, /requestAnimationFrame\(tick\)/);
  assert.match(script, /resolvePair/);
  assert.match(script, /RADIUS_SCALE/);
  assert.match(script, /nudge\(/);
});

const failed = results.filter((result) => !result.ok);
console.log(`\n${results.length - failed.length}/${results.length} tests passed`);

if (failed.length > 0) {
  process.exit(1);
}
