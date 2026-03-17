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

await test('Text stickers are defined in YAML for about page with rich properties', async () => {
  const stickersYaml = await fs.readFile(path.join(projectRoot, '_data/stickers.yml'), 'utf8');

  assert.match(stickersYaml, /page:\s*about/);
  assert.match(stickersYaml, /type:\s*text/);
  assert.match(stickersYaml, /content:\s*".*<a href=/s);
  assert.match(stickersYaml, /shape:\s*(rectangular|oval|svg|star8|octagon)/);
  assert.match(stickersYaml, /textColor:|text_color:/);
  assert.match(stickersYaml, /bgColor:|bg_color:/);
  assert.match(stickersYaml, /fontSize:|font_size:/);
  assert.match(stickersYaml, /fontWeight:|font_weight:/);
  assert.match(stickersYaml, /fontFamily:|font_family:/);
  assert.doesNotMatch(stickersYaml, /font-weight-sans-serif-default/);
});

await test('Unified sticker renderer applies text sticker properties and shape handling', async () => {
  const renderer = await fs.readFile(path.join(projectRoot, '_includes/sticker-item.html'), 'utf8');

  assert.match(renderer, /sticker-shape-\{\{ sticker_shape \}\}/);
  assert.match(renderer, /data-sticker-type="text"/);
  assert.match(renderer, /color:\s*\{\{ sticker_text_color \}\}/);
  assert.match(renderer, /background-color:\s*\{\{ sticker_bg_color \}\}/);
  assert.match(renderer, /font-size:\s*\{\{ sticker_font_size \}\}/);
  assert.match(renderer, /font-weight:\s*\{\{ sticker_font_weight \}\}/);
  assert.match(renderer, /font-family:\s*\{\{ sticker_font_family \}\}/);
  assert.match(renderer, /sticker_shape == "svg"/);
});

await test('About page renders stickers via unified include and page filter', async () => {
  const aboutPage = await fs.readFile(path.join(projectRoot, 'pages/about.html'), 'utf8');

  assert.match(aboutPage, /where:\s*"page",\s*"about"/);
  assert.match(aboutPage, /include sticker-item\.html sticker=sticker/);
});

await test('Sticker shape CSS supports oval, star8 and octagon masks', async () => {
  const css = await fs.readFile(path.join(projectRoot, 'assets/css/app.scss'), 'utf8');

  assert.match(css, /\.sticker-text-wrapper\.sticker-shape-oval/);
  assert.match(css, /\.sticker-text-wrapper\.sticker-shape-star8/);
  assert.match(css, /\.sticker-text-wrapper\.sticker-shape-octagon/);
  assert.match(css, /assets\/stickers\/shapes\/star8\.svg/);
  assert.match(css, /assets\/stickers\/shapes\/octagon\.svg/);
});

await test('SVG assets for sticker masks exist', async () => {
  const starPath = path.join(projectRoot, 'assets/stickers/shapes/star8.svg');
  const octagonPath = path.join(projectRoot, 'assets/stickers/shapes/octagon.svg');

  await fs.access(starPath);
  await fs.access(octagonPath);
});

await test('Sticker drag system keeps text sticker links clickable and respects draggable flag', async () => {
  const dragScript = await fs.readFile(path.join(projectRoot, 'assets/js/sticker-drag.js'), 'utf8');

  assert.match(dragScript, /e\.target\.closest\('a'\)/);
  assert.match(dragScript, /sticker\.dataset\.draggable === 'false'/);
  assert.match(dragScript, /lockPageScroll\(\)/);
  assert.match(dragScript, /unlockPageScroll\(\)/);
  assert.match(dragScript, /touchmove', this\.updateDrag, \{ passive: false \}/);
  assert.match(dragScript, /preventPageTouchScroll/);
  assert.match(dragScript, /e\.preventDefault\(\)/);
});

const failed = results.filter((result) => !result.ok);

console.log(`\n${results.length - failed.length}/${results.length} tests passed`);

if (failed.length > 0) {
  process.exit(1);
}
