import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const headerInclude = await fs.readFile(path.join(projectRoot, '_includes/header.html'), 'utf8');
const css = await fs.readFile(path.join(projectRoot, 'assets/css/app.scss'), 'utf8');
const defaultLayout = await fs.readFile(path.join(projectRoot, '_layouts/default.html'), 'utf8');
const headerThemeScript = await fs.readFile(path.join(projectRoot, 'assets/js/header-theme.js'), 'utf8');
const headerFooterModeScript = await fs.readFile(path.join(projectRoot, 'assets/js/header-footer-colors.js'), 'utf8');

assert.match(headerInclude, /class="header-left"/);
assert.match(headerInclude, /id="header-menu-toggle"/);
assert.match(headerInclude, /class="header-center"/);
assert.match(headerInclude, /class="header-right"/);
assert.match(headerInclude, /id="header-local-time"/);
assert.match(headerInclude, /id="header-audio-toggle"/);
assert.match(headerInclude, /class="toggle-switch"/);
assert.match(headerInclude, /class="switch-label"/);
assert.match(headerInclude, /id="theme-toggle-checkbox"/);
assert.match(headerInclude, /class="header-nav"/);

assert.match(css, /grid-template-columns:\s*1fr auto 1fr/);
assert.match(css, /\.header-menu-toggle/);
assert.match(css, /header\.menu-open \.header-nav/);
assert.match(css, /--theme-night-bg/);
assert.match(css, /--theme-night-text/);
assert.match(css, /html\.theme-night/);
assert.match(css, /html\.header-footer-inverted/);
assert.match(css, /\.toggle-switch/);
assert.match(css, /\.checkbox:checked ~ \.slider/);

assert.match(defaultLayout, /\/assets\/js\/header-theme\.js/);
assert.match(defaultLayout, /\/assets\/js\/header-mobile-menu\.js/);
assert.match(defaultLayout, /\/assets\/js\/header-footer-colors\.js/);
assert.match(defaultLayout, /\/assets\/js\/header-audio-toggle\.js/);

assert.match(headerThemeScript, /timezone:\s*'Europe\/Madrid'/);
assert.match(headerThemeScript, /defaultMode:\s*'auto'/);
assert.match(headerThemeScript, /setInterval\(/);
assert.match(headerThemeScript, /HeaderThemeMode/);
assert.match(headerThemeScript, /theme-toggle-checkbox/);
assert.match(headerThemeScript, /deriveThemeColorsFromCurrentRoot/);

assert.match(headerFooterModeScript, /invertColors:\s*(true|false)/);
assert.match(headerFooterModeScript, /header-footer-inverted/);
assert.match(headerFooterModeScript, /HeaderFooterColorMode/);

console.log('PASS header layout + theme + header/footer inversion config wired');
