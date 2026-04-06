# Tech Steering

## Source Of Truth
- Use this document as the technical guide for implementation choices in this repository.
- Prefer the existing stack and delivery model unless a change is explicitly justified by the current site needs.

## Runtime Model
- Build the site as a static Jekyll site with Liquid templates and frontmatter-driven content.
- Treat GitHub Pages deployment and Jekyll build output as the default publishing path.
- Keep generated output in `_site` as build artefacts, not hand-edited source.

## Primary Technologies
- Use Jekyll collections, pages, layouts, includes, and data files for site composition.
- Use SCSS in `assets/css/app.scss` as the main styling entrypoint.
- Use vanilla JavaScript for site behavior by default.
- Use CDN-delivered browser libraries already present in templates when the feature depends on them.
- Use Three.js only for sketchbook 3D rendering concerns.
- Use Matter.js only where the interaction model already depends on physics-like behavior.

## Content And Data
- Store page-level presentation data in frontmatter when it is content-specific.
- Store shared sticker definitions in `_data/stickers.yml`.
- Keep `works` and `playground` entries content-first: frontmatter should drive rendering, while the body carries editorial content.
- Preserve existing frontmatter conventions such as media type, colors, sizing, and display metadata when extending entries.

## JavaScript Conventions
- Prefer small, page-focused scripts loaded from layouts/includes over introducing a framework.
- Keep global scripts safe to execute on pages where their target elements may not exist.
- Use the reusable modules under `assets/js/systems/` when behavior needs shared color, typography, animation, drag, or touch-scroll utilities.
- Keep 3D behavior isolated to the sketchbook flow and the dedicated `playground-3d.js` module.
- Preserve progressive behavior: if an advanced effect fails, the page should remain readable and navigable.

## Styling Conventions
- Centralize design tokens, font stacks, and theme variables in `assets/css/app.scss`.
- Keep page theming compatible with runtime CSS custom properties such as background and text colors.
- Preserve the current typography strategy: custom local fonts plus selected web fonts.
- Treat hover, motion, and theme inversion as part of the design system, not one-off hacks.

## Testing And Verification
- Use the existing `test/` directory for focused regression coverage of interactive behavior.
- Add or update tests when changing complex interaction logic such as stickers, sketchbook cards, theme behavior, or 3D rendering.
- Prefer targeted verification over broad refactors when touching fragile UI behavior.
- If a change depends on Jekyll output, verify it against a local site build rather than editing `_site` directly.

## Avoid
- Avoid introducing a frontend framework where Liquid plus vanilla JS already covers the need.
- Avoid moving source-of-truth content into generated HTML.
- Avoid hard-coding behavior that should come from frontmatter, data files, or existing CSS variables.
- Avoid coupling unrelated interactions into a single monolithic script when a page-scoped file or shared system module is clearer.
