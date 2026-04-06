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

await test('Requirement 4: layout includes bottom-safe scroll space so fixed footer does not cut content', async () => {
  const defaultLayout = await fs.readFile(path.join(projectRoot, '_layouts/default.html'), 'utf8');

  assert.match(defaultLayout, /#smooth-content\s*\{/);
  assert.match(defaultLayout, /padding-bottom:\s*110px;/);
  assert.match(defaultLayout, /@media \(max-width:\s*480px\)\s*\{\s*#smooth-content\s*\{/);
});

await test('Requirement 4 and 6: smooth scroll is disabled for about, backlog, and touch devices', async () => {
  const scrollAnimations = await fs.readFile(path.join(projectRoot, 'assets/js/scroll-animations.js'), 'utf8');

  assert.match(scrollAnimations, /function shouldEnableSmoothScroll\(\)/);
  assert.match(scrollAnimations, /function isTouchDevice\(\)/);
  assert.match(scrollAnimations, /function isBacklogPage\(\)/);
  assert.match(scrollAnimations, /if \(isAboutPage\(\) \|\| isBacklogPage\(\) \|\| isTouchDevice\(\)\)/);
  assert.match(scrollAnimations, /const enableSmooth = shouldEnableSmoothScroll\(\);/);
  assert.match(scrollAnimations, /if \(!enableSmooth \|\| typeof ScrollSmoother === 'undefined'\)/);
});

await test('Requirement 5: about page markup defines responsive columns that stack on mobile', async () => {
  const aboutPage = await fs.readFile(path.join(projectRoot, 'pages/about.html'), 'utf8');

  assert.match(aboutPage, /about-content-row/);
  assert.match(aboutPage, /class="col-12 col-md-6"/);
  assert.match(aboutPage, /class="about-profile-image"/);
});

await test('Requirement 5 and 7: CSS forces single-column layout for about page under 768px', async () => {
  const appScss = await fs.readFile(path.join(projectRoot, 'assets/css/app.scss'), 'utf8');

  assert.match(appScss, /@media \(max-width:\s*767\.98px\)/);
  assert.match(appScss, /\.about-page \.about-content-row\s*\{/);
  assert.match(appScss, /flex-direction:\s*column;/);
  assert.match(appScss, /width:\s*100%;/);
});

await test('Requirement 6: about page keeps footer-safe padding class for full vertical scroll', async () => {
  const aboutPage = await fs.readFile(path.join(projectRoot, 'pages/about.html'), 'utf8');
  assert.match(aboutPage, /class="container header_margin footer_padding link-svgmarker about-page"/);
});

const failed = results.filter((result) => !result.ok);

console.log(`\n${results.length - failed.length}/${results.length} tests passed`);

if (failed.length > 0) {
  process.exit(1);
}
