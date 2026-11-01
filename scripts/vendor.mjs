// Copies the pinned third-party files (installed by `npm ci`) into vendor/, where the page loads them from.
// vendor/ is not committed: the Pages workflow runs this on every deploy. Run `npm ci --ignore-scripts && npm run vendor` to try it locally.
import { cpSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const nm = 'node_modules', out = 'vendor';
const copies = [
  [join(nm, 'leaflet/dist/leaflet.js'), 'leaflet/leaflet.js'],
  [join(nm, 'leaflet/dist/leaflet.css'), 'leaflet/leaflet.css'],
  [join(nm, 'leaflet/dist/images'), 'leaflet/images'],
  [join(nm, 'leaflet.markercluster/dist/leaflet.markercluster.js'), 'leaflet.markercluster/leaflet.markercluster.js'],
  [join(nm, 'leaflet.markercluster/dist/MarkerCluster.css'), 'leaflet.markercluster/MarkerCluster.css'],
  [join(nm, 'leaflet.markercluster/dist/MarkerCluster.Default.css'), 'leaflet.markercluster/MarkerCluster.Default.css'],
  [join(nm, 'world-atlas/countries-110m.json'), 'world-atlas/countries-110m.json'],
  [join(nm, '@fontsource/caveat/files/caveat-latin-700-normal.woff2'), 'fonts/caveat-latin-700-normal.woff2'],
  [join(nm, '@fontsource/caveat/files/caveat-latin-ext-700-normal.woff2'), 'fonts/caveat-latin-ext-700-normal.woff2'],
];
rmSync(out, { recursive: true, force: true });
for (const [from, to] of copies) {
  if (!existsSync(from)) { console.error(`missing ${from}: run npm ci first`); process.exit(1); }
  mkdirSync(join(out, to, '..'), { recursive: true });
  cpSync(from, join(out, to), { recursive: true });
}
console.log(`vendor/ ready (${copies.length} entries)`);
