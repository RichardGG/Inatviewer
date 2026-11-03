# iNat Viewer

Static GitHub Pages prototype. Paste your iNaturalist API token (from
https://www.inaturalist.org/users/api_token) and your observations are shown as a
taxonomic tree (kingdom → genus → species), so closely related species sit together.

The token is cached in `localStorage`; observations and taxonomy are cached in IndexedDB so repeat visits render instantly and only fetch new observations. A debug log is available on the page.

Enable Pages: Settings → Pages → Build and deployment → Source: **GitHub Actions**. The workflow in `.github/workflows/pages.yml` installs the
pinned third-party packages from `package-lock.json` (`npm ci --ignore-scripts`), copies the few files the page needs into `vendor/`
(`scripts/vendor.mjs`: Leaflet, markercluster and the fonts), and deploys the site. `vendor/` is
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
your cached observations. iNaturalist API calls are never cached by the service worker. Recent Common searches
are stored separately (IndexedDB key `nearby`, up to 15) and can be reopened from the history button in the Location sheet.
Bump `VER` in `sw.js` to force the cached libraries, tiles and photos to be dropped.

## Controls

A bottom bar has the main controls; each opens a sheet above it.

- **Sort**: *Latest* (grouped by year, month, day), *Rarest* (species with the fewest iNaturalist observations first), *Taxonomy*, *Place* and *Common* (the most observed species inside the Location circle, shown as Polaroids with a green tick on the ones you have seen; "hide species I've seen" and "research grade only" are in the Sort sheet).
  For Latest and Rarest, *Same species* chooses between every observation, one per species per day, or one per species (grouped entries look like a small pile of Polaroids). *Shuffle* randomises the order.
- **Filter**: jump to a group or species, group (birds, plants…), favourite-photo status, and date.
- **Location**: one map for every sort. The orange circle is the current view of the map; it filters your observations to the area and is the area Common searches (within 100 km). Buttons on the map jump to your location or search for a place by name.
- **Compare**: species missing from another person's list, or seen by both (available from your own account and while viewing someone else).

Every photo is a Polaroid (white frame, handwritten name in Caveat, a small random tilt fixed per observation) in one strict grid. A group is not a row in between: its overlapping
chevron tab (graph paper, linen and denim in turn by level) sits above the first Polaroid of the group. Tap a tab to collapse every group of its level into a small overlapping stack of Polaroids (collapsing a group collapses everything inside it; tapping again expands one level; the group you tapped stays where it is on screen).
While scrolling, the tabs of the group you are in are shown at the top. Fonts are pinned in `package.json` and copied into `vendor/fonts/` at deploy time.

## Design prototype

`prototype.html` (served next to `index.html`) is a sheet of skeuomorphic design ideas: notebook and graph paper, spiral/stitched/ring binding, washi and masking tape, clips and pins, label-maker strips, ink stamps, stickers, watercolour washes, highlighter and brush marks, and photo treatments, composed into a scrapbook spread at the end. It is plain CSS/SVG.
