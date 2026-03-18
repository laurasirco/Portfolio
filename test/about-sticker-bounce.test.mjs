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

await test('Default layout loads about sticker bounce script', async () => {
  const layout = await fs.readFile(path.join(projectRoot, '_layouts/default.html'), 'utf8');
  assert.match(layout, /\/assets\/js\/about-sticker-bounce\.js/);
});

await test('About sticker bounce script applies viewport bounce and drag pause behavior', async () => {
  const script = await fs.readFile(path.join(projectRoot, 'assets/js/about-sticker-bounce.js'), 'utf8');
  assert.match(script, /about-page/);
  assert.match(script, /requestAnimationFrame\(tick\)/);
  assert.match(script, /is-sticker-dragging/);
  assert.match(script, /is-sticker-settling/);
  assert.match(script, /RESUME_AFTER_DRAG_MS/);
  assert.match(script, /MIN_RELEASE_DIRECTION_SPEED/);
  assert.match(script, /MIN_SPEED\s*=\s*44/);
  assert.match(script, /MAX_SPEED\s*=\s*78/);
  assert.match(script, /pickDistinctSpeed/);
  assert.match(script, /aboutRoot\.addEventListener\('sticker:dragend'/);
  assert.match(script, /event\.detail && event\.detail\.velocity/);
  assert.match(script, /state\.vx = dir\.x \* state\.speed/);
  assert.match(script, /state\.vy = dir\.y \* state\.speed/);
  assert.match(script, /getBoundingClientRect\(\)/);
  assert.match(script, /rendered\.right > window\.innerWidth/);
  assert.match(script, /rendered\.left < 0/);
  assert.match(script, /toLocalPosition/);
  assert.match(script, /getViewportBoundsInRootSpace/);
  assert.match(script, /window\.scrollX - rootRectDoc\.left/);
  assert.match(script, /s\.vx = -Math\.abs\(s\.vx\)/);
  assert.match(script, /s\.vy = -Math\.abs\(s\.vy\)/);
});

const failed = results.filter((result) => !result.ok);
console.log(`\n${results.length - failed.length}/${results.length} tests passed`);

if (failed.length > 0) {
  process.exit(1);
}
