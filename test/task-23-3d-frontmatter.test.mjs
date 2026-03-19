import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const page = await fs.readFile(path.join(projectRoot, 'pages/playground.html'), 'utf8');
const threeScript = await fs.readFile(path.join(projectRoot, 'assets/js/playground-3d.js'), 'utf8');
const popoverScript = await fs.readFile(path.join(projectRoot, 'assets/js/playground.js'), 'utf8');
const tasks = await fs.readFile(path.join(projectRoot, '.kiro/specs/portfolio-polish/tasks.md'), 'utf8');

assert.match(page, /data-material-type="\{\{\s*item\.material_type/);
assert.match(page, /data-material-color="\{\{\s*item\.material_color/);
assert.match(page, /data-wireframe="\{\{\s*item\.wireframe/);
assert.match(page, /data-cast-shadows="\{\{\s*item\.cast_shadows/);
assert.match(page, /data-shadow-quality="\{\{\s*item\.shadow_quality/);
assert.match(page, /data-matcap-texture="\{\{\s*item\.matcap_texture/);
assert.doesNotMatch(page, /data-cast-shadows="\{\{\s*item\.cast_shadows\s*\|\s*default/);
assert.doesNotMatch(page, /data-wireframe="\{\{\s*item\.wireframe\s*\|\s*default/);

assert.match(threeScript, /createConfiguredMaterial/);
assert.match(threeScript, /materialType/);
assert.match(threeScript, /materialColor/);
assert.match(threeScript, /wireframe/);
assert.match(threeScript, /castShadows/);
assert.match(threeScript, /matcapTexture/);
assert.match(threeScript, /shadowQuality/);
assert.match(threeScript, /MeshMatcapMaterial/);
assert.match(threeScript, /assets\/matcaps/);
assert.match(threeScript, /MeshLambertMaterial/);
assert.match(threeScript, /MeshNormalMaterial/);
assert.match(threeScript, /MeshPhongMaterial/);
assert.match(threeScript, /ShadowMaterial/);
assert.match(threeScript, /setupShadowCatcher/);
assert.match(threeScript, /updateShadowCatcherToModelBounds/);
assert.match(threeScript, /PLAYGROUND_3D_LIGHTING/);
assert.match(threeScript, /PLAYGROUND_3D_SHADOW_PRESETS/);
assert.match(threeScript, /getShadowPresetName/);
assert.match(threeScript, /getShadowPreset/);
assert.match(threeScript, /applyShadowQualityToLight/);
assert.match(threeScript, /ambient/);
assert.match(threeScript, /key/);
assert.match(threeScript, /fill/);
assert.match(threeScript, /rim/);
assert.match(threeScript, /createConfiguredMaterial\(sourceMaterial = null\)/);
assert.match(threeScript, /sourceMaterial\.color/);
assert.match(threeScript, /sourceMaterial\.map/);
assert.match(threeScript, /sourceMaterial\.alphaMap/);
assert.match(threeScript, /sourceMaterial\.vertexColors/);
assert.match(threeScript, /map\(\(sourceMaterial\) => this\.createConfiguredMaterial\(sourceMaterial\)\)/);

assert.match(popoverScript, /data-material-type/);
assert.match(popoverScript, /data-material-color/);
assert.match(popoverScript, /data-wireframe/);
assert.match(popoverScript, /data-cast-shadows/);
assert.match(popoverScript, /data-shadow-quality/);
assert.match(popoverScript, /data-matcap-texture/);

assert.match(tasks, /\[x\]\s+22\./);
assert.match(tasks, /\[x\]\s+23\./);
assert.match(tasks, /\[x\]\s+23\.1/);
assert.match(tasks, /\[x\]\s+23\.3/);
assert.match(tasks, /\[x\]\s+23\.4/);
assert.match(tasks, /\[x\]\*\s+23\.5/);

console.log('PASS task 23 frontmatter 3D support wired in page + scripts');
