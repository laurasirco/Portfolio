import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const layout = await fs.readFile(path.join(projectRoot, '_layouts/default.html'), 'utf8');
const script = await fs.readFile(path.join(projectRoot, 'assets/js/header-scroll-shrink.js'), 'utf8');

assert.match(layout, /\/assets\/js\/header-scroll-shrink\.js/);
assert.match(script, /SHRINK_DISTANCE/);
assert.match(script, /ScrollTrigger\.create\(/);
assert.match(script, /gsap\.timeline\(/);
assert.match(script, /scrub:\s*SCRUB/);

console.log('PASS header scroll shrink script loaded and configured');
