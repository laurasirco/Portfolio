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

await test('Shared touch scroll lock utility exposes lock/unlock/isLocked API', async () => {
  const utility = await fs.readFile(path.join(projectRoot, 'assets/js/systems/touch-scroll-lock.js'), 'utf8');

  assert.match(utility, /TouchScrollLock/);
  assert.match(utility, /lock\(contextId/);
  assert.match(utility, /unlock\(contextId/);
  assert.match(utility, /isLocked\(\)/);
  assert.match(utility, /document\.addEventListener\('touchmove'/);
});

await test('Default layout loads touch scroll lock before sticker drag', async () => {
  const layout = await fs.readFile(path.join(projectRoot, '_layouts/default.html'), 'utf8');

  const lockScriptIdx = layout.indexOf('/assets/js/systems/touch-scroll-lock.js');
  const stickerScriptIdx = layout.indexOf('/assets/js/sticker-drag.js');
  assert.ok(lockScriptIdx >= 0, 'touch-scroll-lock script not loaded in default layout');
  assert.ok(stickerScriptIdx >= 0, 'sticker-drag script not loaded in default layout');
  assert.ok(lockScriptIdx < stickerScriptIdx, 'touch-scroll-lock should load before sticker-drag');
});

await test('Sticker drag uses shared touch scroll lock utility', async () => {
  const dragScript = await fs.readFile(path.join(projectRoot, 'assets/js/sticker-drag.js'), 'utf8');

  assert.match(dragScript, /TouchScrollLock\.lock/);
  assert.match(dragScript, /TouchScrollLock\.unlock/);
  assert.match(dragScript, /scrollLockContextId/);
});

await test('3D scene locks and unlocks touch scroll during mobile interaction', async () => {
  const threeScript = await fs.readFile(path.join(projectRoot, 'assets/js/playground-3d.js'), 'utf8');

  assert.match(threeScript, /lockTouchScroll\(\)/);
  assert.match(threeScript, /unlockTouchScroll\(\)/);
  assert.match(threeScript, /touchstart/);
  assert.match(threeScript, /touchend/);
  assert.match(threeScript, /touchcancel/);
  assert.match(threeScript, /TouchScrollLock\.lock/);
  assert.match(threeScript, /TouchScrollLock\.unlock/);
});

const failed = results.filter((result) => !result.ok);
console.log(`\n${results.length - failed.length}/${results.length} tests passed`);

if (failed.length > 0) {
  process.exit(1);
}
