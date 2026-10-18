# SUICAT: THE CATVERSE

Independently created showcase for **SuiCat** — one cat, multiple worlds. Built with the Sanctuary design system.

## Structure (GitHub)

```
index.html      -> entry, links to css/style.css + js/app.js
css/style.css   -> all styles (palette --void/--card, Bricolage Grotesque, responsive)
js/app.js       -> nav, contract copy, floating cat (3 states), oracle/forge
assets/         -> cat-run / cat-play / cat-sleep, suicat.jpg, dex + 4 game screenshots
```

## Run

Open `index.html` or serve the folder statically. No build step.

```bash
python -m http.server
# then http://localhost:8000
```

## Single-file Walrus build

For Epoch/Walrus: upload `../suicat-catverse-single.html` as `index.html` together with `assets/` — or use `index.html` from the project root, which is the same inline file (CSS + JS inlined, images via `assets/`). Keep `assets/` next to the HTML when publishing.

## Notes

- Token `0x63e89267aad1dcbd9fb84e7686db54bd128cb25ce4e9f1fda97fc716c4b73682::suipump::SUIPUMP` preserved verbatim.
- Market values are a labelled snapshot from the supplied DexScreener screenshot (not live).
- Floating cat: moving -> tap -> playing (1.8s) -> moving; after 5s inactivity -> sleeping; wakes on any mousemove/scroll/keydown/touch — single timer, cleaned up, reduced-motion respected.
- All external links use `target="_blank" rel="noopener"`.
