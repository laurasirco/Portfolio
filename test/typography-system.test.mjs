import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const typographyModuleUrl = pathToFileURL(
  path.join(projectRoot, 'assets/js/systems/typography-system.js')
).href;
const animationModuleUrl = pathToFileURL(
  path.join(projectRoot, 'assets/js/systems/animation-system.js')
).href;

const { TypographySystem } = await import(typographyModuleUrl);
const { TextAnimationSystem } = await import(animationModuleUrl);

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

await test('SCSS defines Neue Regrade Variable as the global sans-serif stack', async () => {
  const scss = await fs.readFile(path.join(projectRoot, 'assets/css/app.scss'), 'utf8');

  assert.match(
    scss,
    /\$font-stack-sans-serif:\s*#\{\$font-sans-serif-primary\},\s*-apple-system,\s*BlinkMacSystemFont,\s*"Segoe UI",\s*Roboto,\s*sans-serif;/
  );
  assert.match(scss, /font-family:\s*'Neue Regrade Variable';/);
  assert.match(scss, /url\('\/assets\/fonts\/Neue Regrade Variable\.ttf'\)/);
  assert.match(scss, /font-display:\s*swap;/);
});

await test('SCSS defines Newsreader as the global serif stack', async () => {
  const scss = await fs.readFile(path.join(projectRoot, 'assets/css/app.scss'), 'utf8');

  assert.match(scss, /@import url\('https:\/\/fonts\.googleapis\.com\/css2\?family=Newsreader:/);
  assert.match(
    scss,
    /\$font-stack-serif:\s*#\{\$font-serif-primary\},\s*Georgia,\s*Cambria,\s*"Times New Roman",\s*Times,\s*serif;/
  );
});

await test('TypographySystem loads the expected font descriptors when the Font Loading API is available', async () => {
  const descriptors = [];
  const typographySystem = new TypographySystem();

  const result = await typographySystem.loadFonts({
    fonts: {
      load(descriptor) {
        descriptors.push(descriptor);
        return Promise.resolve([descriptor]);
      }
    }
  });

  assert.equal(result.loaded, true);
  assert.deepEqual(descriptors, [
    '400 1em "Neue Regrade Variable"',
    '500 1em "Neue Regrade Variable"',
    '400 1em "Newsreader"'
  ]);
});

await test('TypographySystem applies font stacks and normalizes invalid font-weight values', async () => {
  const typographySystem = new TypographySystem();
  const element = { style: {} };

  const appliedFamily = typographySystem.applyFontStack(element, 'serif');

  assert.match(appliedFamily, /Newsreader/);
  assert.equal(element.style.fontFamily, appliedFamily);
  assert.equal(typographySystem.normalizeWeight('invalid'), 400);
  assert.equal(typographySystem.normalizeWeight(50), 100);
  assert.equal(typographySystem.normalizeWeight(950), 900);
});

await test('TypographySystem animates font weight with synchronized font-variation-settings fallback', async () => {
  const typographySystem = new TypographySystem({ defaultDuration: 1 });
  const element = { style: {} };

  await typographySystem.animateWeight(element, 320, 640, 1);

  assert.equal(element.style.fontWeight, '640');
  assert.equal(element.style.fontVariationSettings, '"wght" 640');
  assert.equal(element.style.transition, '');
});

await test('TypographySystem detects variable font support via CSS.supports', async () => {
  const typographySystem = new TypographySystem();

  assert.equal(
    typographySystem.checkVariableFontSupport({
      CSS: {
        supports(property, value) {
          return property === 'font-variation-settings' && value === '"wght" 500';
        }
      }
    }),
    true
  );

  assert.equal(typographySystem.checkVariableFontSupport({}), false);
});

await test('TextAnimationSystem keeps font-variation-settings aligned during weight animation fallback', async () => {
  const animationSystem = new TextAnimationSystem({ defaultDuration: 1 });
  const element = { style: {} };

  await animationSystem.animateWeight(element, 400, 700, 1);

  assert.equal(element.style.fontWeight, 700);
  assert.equal(element.style.fontVariationSettings, '"wght" 700');
  assert.equal(element.style.transition, '');
});

await test('Playground defaults inherit the new sans-serif typography stack', async () => {
  const pageTemplate = await fs.readFile(path.join(projectRoot, 'pages/playground.html'), 'utf8');
  const playgroundScript = await fs.readFile(path.join(projectRoot, 'assets/js/playground.js'), 'utf8');

  assert.match(pageTemplate, /var\(--font-sans-serif\)/);
  assert.doesNotMatch(pageTemplate, /DM Sans, sans-serif/);
  assert.match(playgroundScript, /Neue Regrade Variable/);
  assert.doesNotMatch(playgroundScript, /Golos Text', sans-serif/);
});

const failed = results.filter((result) => !result.ok);

console.log(`\n${results.length - failed.length}/${results.length} tests passed`);

if (failed.length > 0) {
  process.exit(1);
}
