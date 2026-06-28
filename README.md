# Iris Sagie Solomovitz — Architecture Portfolio

תיק עבודות אינטראקטיבי בצורת **ספר** שמתהפך מימין לשמאל. בכל רגע מוצגים שני עמודים זה לצד זה
ביחס של דף **A3 לרוחב**, עם חיצי ניווט ותוכן עניינים במרכז התחתון.

An interactive, book-style architecture portfolio. Two A3-landscape pages are shown side by side,
the book turns right-to-left (Hebrew/RTL), and a bottom-centre bar holds the navigation arrows and
the Table of Contents.

**Live site:** https://magoler.github.io/Iris-Solomovitch/

## Structure
```
index.html              the page shell + bottom navigation bar
css/styles.css          design system, A3 page geometry, per-page layouts
js/content.js           ← single source of truth: all pages/spreads & the TOC
js/book.js              flipbook engine (scaling, page-turn, nav, TOC, keyboard, swipe)
assets/backgrounds/     black-and-white background (SVG) for cover / TOC / résumé / back
assets/projects/<key>/  per-project images
```

## The book (24 pages)
| Spread | Pages | Content |
|---|---|---|
| 1 | 1 | Cover |
| 2 | 3 · 2 | Résumé · Table of Contents |
| 3 | 5 · 4 | **Urban** — מדרחוב נווה שאנן *(placeholder)* |
| 4 | 7 · 6 | Urban content *(placeholder)* |
| 5 | 9 · 8 | **Seeing the Sea** — לראות את הים ✅ real |
| 6 | 11 · 10 | Seeing the Sea content ✅ real |
| 7–11 | 12–23 | Time·Space / Maryam / Technological *(placeholders)* |
| 12 | 24 | Back |

Only **Seeing the Sea** and the **résumé** have real material so far; the other four studios are
on-brand placeholder spreads. Each keeps the correct accent colour and caption slots so real
images drop straight in.

## Adding a project's real images
1. Put the images in `assets/projects/<key>/` (e.g. `assets/projects/urban/`).
2. In `js/content.js`, find that project's page builders (e.g. `urban_c1`) and replace the
   `fig(null, "caption", …)` placeholder calls with `fig("assets/projects/urban/<file>.jpg", "caption", …)`.
   A missing image degrades gracefully to a placeholder, so nothing ever looks broken.

## Fonts
Hebrew text uses the licensed **Ploni** web font (8 weights, self-hosted WOFF2 in
`assets/fonts/`, declared via `@font-face` and referenced through the `--font` variable at the top
of `css/styles.css`). No external font CDN is loaded.

## Run locally
```
cd Iris-Solomovitch
python3 -m http.server 8000
# open http://localhost:8000
```

## Navigation
- **Bottom arrows** — turn the page (left = forward, right = back; RTL).
- **תוכן עניינים** — jump to any project; click the name to jump to the résumé.
- **Keyboard** — ←/→ to turn, Home/End for first/last, Esc to close the menu.
- **Touch** — swipe to turn pages.

Built as a static site — no build step. Deploy = push to `main` with GitHub Pages on.
