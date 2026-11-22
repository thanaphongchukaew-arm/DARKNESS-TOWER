<!-- ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.) -->

# DARKNESS TOWER

`index.html` loads `dist/game.min.js`, a minified/mangled bundle of everything under `js/` (source of truth). After editing any file in `js/`, rebuild it:

```
npm install
npm run build
```

## Checks

```
npm test          # unit tests (node --test)
npm run lint
npm run smoke     # builds, then plays the real game in a hidden Electron window
npm run balance -- curve --diff normal --class blade     # difficulty curve per floor
npm run balance -- survive --runs 30                     # where a simple bot's runs end
```

Tune enemy strength only through the constants at the top of `js/formulas.js`
(`FLOOR_SCALE_ANCHORS`, `REGULAR_TUNING`, `MINIBOSS_TUNING`, `FINAL_BOSS_TUNING`,
`DIFFICULTY`) and re-run `npm run balance` to compare before and after.

## Saves

Saves live in localStorage under `towerRPG_*`, each slot with a `_bak` backup.
The desktop build mirrors every slot to a JSON file in the profile's `saves/`
folder. Players can export/import everything from Settings.

## Art sources

Full-size source art belongs in `art-source/` (git-ignored, never shipped).
Runtime portraits use the 16-bit PNGs in `assets/pixel16/{classes,monsters,npcs,companions}/`.
UI symbols, item illustrations and handbook diagrams are authored in
`js/ui-symbols.js`, `js/item-art.js` and `js/guide-art.js`, then bundled by `npm run build`.
The old `assets/classes/*.webp` exports are retained only for the comparison preview;
they are not used by the game, precached, or included in desktop packages.

## Desktop builds (Electron)

The same `index.html` is wrapped by `electron/main.js` and packaged with electron-builder.
Fonts are bundled under `fonts/`, so the packaged game runs fully offline.

```
npm install
npm start          # run the desktop version from source
npm run build:exe  # rebuild dist/game.min.js, then package to release/
```

Output: `release/DARKNESS-TOWER.exe` — a single portable file, no install needed; just run it.
`npm run build:mac` and `npm run build:linux` produce a `.dmg` and an `.AppImage` the same way
(build each on its own OS). None of the builds are code-signed yet.

Desktop saves are kept under `%APPDATA%\DARKNESS TOWER\saves` (Windows) or the equivalent profile folder.
