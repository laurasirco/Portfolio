import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const layout = await fs.readFile(path.join(projectRoot, '_layouts/default.html'), 'utf8');
const script = await fs.readFile(path.join(projectRoot, 'assets/js/external-links.js'), 'utf8');

assert.match(layout, /\/assets\/js\/external-links\.js/);
assert.match(script, /target', '_blank'/);
assert.match(script, /noopener/);
assert.match(script, /noreferrer/);
assert.match(script, /MutationObserver/);

console.log('PASS external links script is wired and enforces target blank');
