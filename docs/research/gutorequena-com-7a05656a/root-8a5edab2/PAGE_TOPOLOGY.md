# gutorequena.com — Homepage Topology

Source: https://gutorequena.com (Readymag-built site, canvas scaled via CSS transform
`matrix(1.40625,...)` on `.css-1kb57v7` — base design unit is 1024px wide, scaled to
viewport width. All "real" pixel sizes below are already the rendered/on-screen values.)

## Architecture note
Real scroll container is `.content-scroll-wrapper` (`overflow-y:auto`), not `window`/`body`.
No smooth-scroll library detected; native scroll inside that wrapper.

## Sections (top to bottom)

1. **Header** (not sticky/fixed — scrolls away with content)
   - Logo: stacked wordmark "ESTUDIO GUTO REQUENA" (small vertical label + big stacked
     "GUTO REQUENA" in 2 lines), plain text, ~black.
   - Center nav: ARQUITETURA · PRODUTO · JUNTXS LAB (with a small 4-color diamond icon) · COMUNICAÇÃO
   - Right cluster: "PT / EN" language links, "SOBRE" link
   - Nav text: Roboto 500, 10px (canvas) → ~14px rendered, color rgb(150,150,150), uppercase (literal caps in copy, not text-transform)
   - Mobile (<768px): logo left, "MENU" text link right (presumed hamburger — menu contents not captured)

2. **Projects masonry grid** — the dominant homepage content, ~30+ tiles
   - Interaction model: **static** — no hover scale/zoom/filter transition detected on tiles
     (checked via getComputedStyle before/after mouse hover: transform/filter unchanged)
   - Desktop: multi-column grid (2–3 cols) with mixed tile shapes: wide (~2:1), tall
     (spans ~2 rows, ~1:2), and square (~1:1). No visible fixed gap — tiles sit edge-to-edge
     (0–2px). Layout is Readymag's manual absolute-position canvas, not a literal CSS grid.
   - Each tile: full-bleed image + bold uppercase title label overlaid bottom-left
     (bbkk font ≈ Inter Bold, 20px canvas → 28px rendered), color adapts per image
     (white on dark photos, dark gray rgb(102,102,102) on light photos).
   - Mobile (390px, real mobile emulation): single column, full width, same overlay style.
   - Click model: tiles link out to individual project pages (not captured — out of scope).

3. **Footer**
   - Divider rule, then a 6-column sitemap generated from the full project catalog grouped
     by category: ARQUITETURA, COMERCIAL, CENOGRAFIA, CORPORATIVO, PRODUTO, JUNTXS.LAB.
     Column header: bbkk bold 10px→14px, rgb(106,106,106). Items: Roboto/bbkk regular
     10px→14px, rgb(150,150,150).
   - Second divider rule, then bottom row: wordmark logo (small) · social links
     (Instagram/Facebook/Youtube) · contact block (studio name, email) · newsletter
     signup (email input + black "Inscrever" button).
   - All footer text ~8px canvas → 11px rendered.

## Colors observed
white bg `#fff`, body text `rgb(40,40,40)`, nav/secondary text `rgb(150,150,150)`,
footer link text `rgb(102,102,102)` / `rgb(106,106,106)`, pure black for footer button,
light gray `rgb(247,247,247)` subtle background, link blue `rgb(0,0,238)` (default `<a>`,
not used visually).

## Fonts
- Roboto (400/500) — nav labels, small UI text
- "bbkk" (custom/self-hosted, renders like a bold grotesk close to Inter Bold) — headings,
  project title overlays, footer column headers, buttons
- Approximated in the rebuild as: Roboto (nav/body) + Inter (headings/titles/buttons)

## Scope decision for this project
This project uses a JSON-driven generic renderer + admin CMS (not the skill's default
per-section fixed-component output). Per user decision, this clone pass:
- Matches layout/design tokens (colors, type, spacing, grid rhythm) closely
- Uses gutorequena.com's real project photos/titles as **temporary placeholder content**
  only (explicitly approved by the user), to be replaced with Humberto Resende Arquiteto's
  real project content before going live — flagged with an on-page banner
  (`placeholderNotice` in `content/site-content.json`) so it cannot ship by accident.
- Does NOT copy gutorequena.com's contact email/phone (functional data, not styling) —
  left as pending for the real client to provide.
