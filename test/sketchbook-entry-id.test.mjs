import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const page = await fs.readFile(path.join(projectRoot, 'pages/playground.html'), 'utf8');
const css = await fs.readFile(path.join(projectRoot, 'assets/css/app.scss'), 'utf8');
const js = await fs.readFile(path.join(projectRoot, 'assets/js/playground.js'), 'utf8');

assert.match(page, /\{\%\s*assign\s+day_id\s*=\s*day_group\.items\[0\]\.date\s*\|\s*date:\s*"%y%m%d"\s*\%\}/);
assert.match(page, /\{\%\s*assign\s+entry_id\s*=\s*"SB"\s*\|\s*append:\s*day_id\s*\|\s*append:\s*""\s*\|\s*append:\s*day_seq_label\s*\%\}/);
assert.match(page, /data-entry-id="\{\{\s*entry_id\s*\}\}"/);
assert.match(page, /<span class="sketchbook-entry-id"[^>]*>\{\{\s*entry_id\s*\}\}<\/span>/);
assert.match(css, /\.sketchbook-entry-id\s*\{/);
assert.match(css, /color:\s*rgba\(0,\s*0,\s*0,\s*0\.22\)/);
assert.match(css, /\.popover-entry-id\s*\{/);
assert.match(js, /className\s*=\s*'popover-entry-id'/);
assert.match(js, /data-entry-id/);

console.log('PASS sketchbook entry id rendered with dynamic color logic');
