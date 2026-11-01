# iNat Viewer

Static GitHub Pages prototype. Paste your iNaturalist API token (from
https://www.inaturalist.org/users/api_token) and your observations are shown as a
taxonomic tree (kingdom → genus → species), so closely related species sit together.

The token is cached in `localStorage`; observations and taxonomy are cached in IndexedDB so repeat visits render instantly and only fetch new observations. A debug log is available on the page.

Enable Pages: Settings → Pages → Build and deployment → Source: **GitHub Actions**. The workflow in `.github/workflows/pages.yml` installs the
pinned third-party packages from `package-lock.json` (`npm ci --ignore-scripts`), copies the few files the page needs into `vendor/`
(`scripts/vendor.mjs`: Leaflet, markercluster, the country shapes and the fonts), and deploys the site. `vendor/` is
not committed. There is no CDN fallback: the maps need `vendor/`, so Pages must use the GitHub Actions source (a plain
branch deploy, or opening `index.html` directly, has no `vendor/` and those features report the missing file). To change a version: edit `package.json`, run `npm install --ignore-scripts`, commit `package-lock.json`.
To try the vendored copy locally: `npm ci --ignore-scripts && npm run vendor`, then serve the folder.

## Login

The default is **Log in with iNaturalist** (OAuth authorization code + PKCE, no client secret).
One-time setup: register an app at https://www.inaturalist.org/oauth/applications/new — leave
"confidential" unchecked and set the redirect URI to the exact page URL
(`https://richardgg.github.io/Inatviewer/`). The Client ID is already set in `OAUTH.clientId`; to use a different app, paste its Client ID into the page under
"Or use an API token / OAuth settings" (stored in localStorage), or hard-code it in `OAUTH.clientId`.

The OAuth access token is exchanged for the 24h API JWT and re-exchanged automatically when it expires.
Fallback: paste a JWT from https://www.inaturalist.org/users/api_token.

## Installing and offline use

The page is an installable web app (`manifest.webmanifest`, `sw.js`): use "Add to Home screen" / "Install" in the browser.
The service worker caches the app itself, Leaflet, map tiles and photos, so the app opens without a connection and shows
your cached observations. iNaturalist API calls are never cached by the service worker. Recent Nearby searches
are stored separately (IndexedDB key `nearby`, up to 15) and can be reopened from the history button on the Nearby map.
Bump `VER` in `sw.js` to force the cached libraries, tiles and photos to be dropped.

## World map

The **World** tab shows the most observed animal over each country. *Everyone* asks iNaturalist for the top species per country (two
requests per country the first time, about four minutes; answers are kept in IndexedDB for 30 days), *Mine* counts your own observations
per country. The animal group chips narrow it to birds, mammals and so on. Country outlines come from the `world-atlas` file on jsDelivr.

## Photo proxy (optional)

Reading photo colours needs the page to be allowed to read the photo pixels. If iNaturalist's photo servers refuse, create a free
Cloudflare Worker that forwards only iNaturalist photo addresses (see the code in the project notes / chat), paste its address under
⚙ → "Or use an API token / OAuth settings" → "Photo proxy address". Colours are remembered per photo, so a photo goes through the proxy once.

## Photos tab

Recent, Taxonomy and Place are one **Photos** tab; the sort button (arrows icon) switches between *By date*, *Taxonomy* and *By place*. Every photo is a Polaroid
(white frame, handwritten name in Caveat, a small random tilt fixed per observation) in one strict grid. A group is not a row in between: its coloured
typewriter-font label (Courier Prime; common name large, scientific name small) sits above the first Polaroid of the group. Dates are grouped as
[2026][March][5th], taxonomy by rank, places by country/state/county/city.

Tap a label to collapse every group of its level into small overlapping stacks of Polaroids (tap again to expand them; tapping a stack expands just that one); hold a label to collapse or expand only that group; the button on the right of the icon bar collapses or expands everything. While scrolling, the labels of the group you are in sit side by side
(wrapping onto more lines) in a sticky header under the icon bar. Fonts are pinned in `package.json` and copied into `vendor/fonts/` at deploy time.
