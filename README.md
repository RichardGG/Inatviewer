# iNat Viewer

Static GitHub Pages prototype. Paste your iNaturalist API token (from
https://www.inaturalist.org/users/api_token) and your observations are shown as a
taxonomic tree (kingdom → genus → species), so closely related species sit together.

The token is cached in `localStorage`; observations and taxonomy are cached in IndexedDB so repeat visits render instantly and only fetch new observations. A debug log is available on the page.

Enable Pages: Settings → Pages → Deploy from branch `main` / root.

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
