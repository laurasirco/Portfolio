# Structure Steering

## Source Of Truth
- Use this document as the directory and ownership map for the repository.
- Keep new files inside the existing content/template/asset split unless there is a strong reason to reshape it.

## Repository Layout
- Use `_config.yml` for site-wide Jekyll configuration and collection registration.
- Use `pages/` for routed top-level pages such as `Work`, `Sketchbook`, and `About`.
- Use `_layouts/` for page shells and collection rendering layouts.
- Use `_includes/` for reusable Liquid partials such as header, footer, work grids, filters, and sticker rendering.
- Use `_works/` for portfolio case-study entries.
- Use `_playground/` for sketchbook entries and experiments.
- Use `_data/` for structured shared content consumed by templates.
- Use `assets/` for CSS, JavaScript, fonts, images, models, stickers, matcaps, and project media.
- Use `test/` for interaction-focused regression tests and verification fixtures.
- Use `.github/workflows/` for deployment automation.

## Content Placement Rules
- Put portfolio projects in `_works/` with the `work` layout and frontmatter for title, year, client, media, and page colors.
- Put sketchbook entries in `_playground/` with frontmatter that drives card rendering, grouping, and media handling.
- Put reusable site copy or structured shared configuration in `_data/` only when multiple pages consume it.
- Keep page-specific markup in `pages/` unless it clearly belongs in a reusable include or layout.

## Frontend Code Placement
- Keep site-wide styles in `assets/css/app.scss`.
- Keep page and feature scripts in `assets/js/`.
- Put reusable JS primitives in `assets/js/systems/`.
- Keep third-party static assets, models, fonts, and imagery under the matching `assets/` subdirectory.
- Do not add source files to `_site`; treat that directory as generated output only.

## Template Boundaries
- Use layouts to define page shells and shared script/style loading.
- Use includes for repeatable UI fragments and Liquid snippets.
- Keep frontmatter-driven rendering in Liquid where possible before reaching for JavaScript.
- Use JavaScript to enhance interaction, animation, audio, drag behavior, filters, and 3D previews after the HTML structure already works.

## Naming And Growth
- Follow existing folder names and content model names instead of inventing parallel terminology.
- Prefer extending `pages`, `_includes`, `_layouts`, `_works`, `_playground`, and `assets/js` over creating new top-level directories.
- Add a new top-level source directory only when the existing structure cannot express the concern cleanly.

## Exclusions
- Treat `_site`, local caches, and temporary debug artefacts as non-source output.
- Avoid committing generated duplicates of source content unless the repository already requires them for deployment.
