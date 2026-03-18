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

await test('Welcome stickers define influence color and radius in YAML', async () => {
  const stickersYaml = await fs.readFile(path.join(projectRoot, '_data/stickers.yml'), 'utf8');

  assert.match(stickersYaml, /id:\s*welcome_sticker_01/);
  assert.match(stickersYaml, /influenceColor:\s*\"?#?[0-9a-fA-F]{6,8}\"?/);
  assert.match(stickersYaml, /influenceRadius:\s*\d+/);
});

await test('Sticker renderer exposes influence dataset attributes', async () => {
  const renderer = await fs.readFile(path.join(projectRoot, '_includes/sticker-item.html'), 'utf8');

  assert.match(renderer, /data-influence-color=/);
  assert.match(renderer, /data-influence-radius=/);
});

await test('Welcome animation includes sticker influence and radius falloff logic', async () => {
  const script = await fs.readFile(path.join(projectRoot, 'assets/js/welcome-text-animation.js'), 'utf8');

  assert.match(script, /influenceFalloff/);
  assert.match(script, /blendInfluencedColor/);
  assert.match(script, /data-influence-color/);
  assert.match(script, /dataset\.influenceRadius/);
  assert.match(script, /requestAnimationFrame\(updateCharacterColors\)/);
});

const failed = results.filter((result) => !result.ok);
console.log(`\n${results.length - failed.length}/${results.length} tests passed`);

if (failed.length > 0) {
  process.exit(1);
}
