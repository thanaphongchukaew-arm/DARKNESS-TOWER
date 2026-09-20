<!-- ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.) -->

# Shadow-tower

`index.html` loads `dist/game.min.js`, a minified/mangled bundle of everything under `js/` (source of truth). After editing any file in `js/`, rebuild it:

```
npm install
npm run build
```

## Windows .exe (Electron)

The same `index.html` is wrapped by `electron/main.js` and packaged with electron-builder.
Fonts are bundled under `fonts/`, so the packaged game runs fully offline.

```
npm install
npm start          # run the desktop version from source
npm run build:exe  # rebuild dist/game.min.js, then package to release/
```

Output: `release/DARKNESS-TOWER.exe` — a single portable file, no install needed; just run it.

Saves live in localStorage, which Electron keeps under `%APPDATA%\DARKNESS TOWER`.
