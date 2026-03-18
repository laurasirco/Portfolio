import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const script = await fs.readFile(path.join(projectRoot, 'assets/js/sticker-drag.js'), 'utf8');

assert.match(script, /getViewportBoundsForCurrentSticker/);
assert.match(script, /Math\.max\(viewportBounds\.minX, Math\.min\(newX, viewportBounds\.maxX\)\)/);
assert.match(script, /Math\.max\(viewportBounds\.minY, Math\.min\(newY, viewportBounds\.maxY\)\)/);
assert.match(script, /window\.innerWidth - stickerWidth/);
assert.match(script, /window\.innerHeight - stickerHeight/);

console.log('PASS sticker drag clamps to viewport during drag');
