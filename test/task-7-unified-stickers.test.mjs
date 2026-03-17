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

await test('Sticker data uses unified type-based schema', async () => {
  const stickersYaml = await fs.readFile(path.join(projectRoot, '_data/stickers.yml'), 'utf8');

  assert.match(stickersYaml, /type:\s*image/);
  assert.match(stickersYaml, /page:\s*welcome/);
  assert.match(stickersYaml, /position:\s*\n\s+top:|position:\s*\n\s+bottom:/);
  assert.match(stickersYaml, /draggable:\s*true/);
});

await test('Sticker renderer includes type discrimination for image, text and 3d', async () => {
  const renderer = await fs.readFile(path.join(projectRoot, '_includes/sticker-item.html'), 'utf8');

  assert.match(renderer, /{% case sticker_type %}/);
  assert.match(renderer, /{% when "image" %}/);
  assert.match(renderer, /{% when "text" %}/);
  assert.match(renderer, /{% when "3d" %}/);
});

await test('Home uses unified sticker renderer and filters by page', async () => {
  const homeTemplate = await fs.readFile(path.join(projectRoot, 'index.html'), 'utf8');

  assert.match(homeTemplate, /where:\s*"page",\s*"welcome"/);
  assert.match(homeTemplate, /include sticker-item\.html sticker=sticker/);
});

const failed = results.filter((result) => !result.ok);

console.log(`\n${results.length - failed.length}/${results.length} tests passed`);

if (failed.length > 0) {
  process.exit(1);
}
