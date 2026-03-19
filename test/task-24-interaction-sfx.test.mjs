import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const layout = await fs.readFile(path.join(projectRoot, '_layouts/default.html'), 'utf8');
const sfx = await fs.readFile(path.join(projectRoot, 'assets/js/interaction-sfx.js'), 'utf8');
const cardDrag = await fs.readFile(path.join(projectRoot, 'assets/js/playground-card-drag.js'), 'utf8');
const playground = await fs.readFile(path.join(projectRoot, 'assets/js/playground.js'), 'utf8');
const tasks = await fs.readFile(path.join(projectRoot, '.kiro/specs/portfolio-polish/tasks.md'), 'utf8');

assert.match(layout, /\/assets\/js\/interaction-sfx\.js/);
assert.match(layout, /tone@.*Tone\.min\.js/);

assert.match(sfx, /InteractionSFX/);
assert.match(sfx, /init,\s*play,\s*setEnabled,\s*setVolume,\s*setMuted/);
assert.match(sfx, /preload/);
assert.match(sfx, /cache/);
assert.match(sfx, /playSynth/);
assert.match(sfx, /playTone/);
assert.match(sfx, /Tone\.start/);
assert.match(sfx, /silent fallback/i);
assert.match(sfx, /sessionStorage/);
assert.match(sfx, /muted:\s*true/);

assert.match(cardDrag, /sketchbook:carddragstart/);
assert.match(cardDrag, /sketchbook:carddragend/);

assert.match(playground, /sketchbook:popoveropen/);
assert.match(playground, /sketchbook:popoverclose/);
assert.match(playground, /sketchbook:popovernavigate/);

assert.match(tasks, /\[x\]\s+24\./);
assert.match(tasks, /\[x\]\s+24\.1/);
assert.match(tasks, /\[x\]\s+24\.2/);
assert.match(tasks, /\[x\]\s+24\.3/);
assert.match(tasks, /\[x\]\*\s+24\.4/);

console.log('PASS task 24 interaction sfx module + integration + task status');
