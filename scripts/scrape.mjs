// scripts/scrape.mjs
// Phase 0: crawl zagagsheli.co.il and download all glass-work images to
// public/images/raw/{category}/ — categorization is best-effort; user reviews after.
//
// Strategy:
//   1. Fetch home + /examples/ HTML, extract every /wp-content/uploads/... URL
//      from raw HTML (src, srcset, data-src, data-thumbnail, data-elementor-* JSON).
//   2. Try WP REST API /wp-json/wp/v2/media (paginated) — WP exposes all media there
//      by default, which sidesteps Elementor's "load more" lazy loading.
//   3. Deduplicate, categorize by filename hints + section proximity, download.
//
// Run: node scripts/scrape.mjs

import { mkdir, writeFile } from 'node:fs/promises';
import { createWriteStream, existsSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { dirname, join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const OUT_ROOT = join(PROJECT_ROOT, 'public', 'images', 'raw');

const ORIGIN = 'https://zagagsheli.co.il';
const PAGES = ['/', '/examples/'];
const UA = 'Mozilla/5.0 (compatible; ZagagSheliMigrationBot/1.0; +local)';

// ---------------------------------------------------------------- helpers
async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'text/html,*/*' } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return await res.text();
}
async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return await res.json();
}

// Extract every /wp-content/uploads/... URL from a blob of HTML/JSON/text.
// Handles: src="...", srcset="a 1x, b 2x", data-src, data-thumbnail,
//   escaped JSON ("url":"https:\/\/..."), and bare occurrences.
function extractUploadUrls(text, origin = ORIGIN) {
  const urls = new Set();
  // Regex tolerant to escapes: \/ or /
  const re = /(https?:(?:\\?\/)+[^"'\s\\)]+?\/wp-content\/uploads\/[^"'\s\\)]+?\.(?:jpe?g|png|webp|gif|avif|svg))/gi;
  for (const m of text.matchAll(re)) {
    urls.add(m[1].replace(/\\\//g, '/'));
  }
  // Also relative //domain/... or /wp-content/...
  const reRel = /["'\s(]\/wp-content\/uploads\/[^"'\s)]+?\.(?:jpe?g|png|webp|gif|avif|svg)/gi;
  for (const m of text.matchAll(reRel)) {
    urls.add(origin + m[0].slice(1));
  }
  return [...urls];
}

// Strip WordPress size suffix so 'foo-300x200.jpg' -> 'foo.jpg' (original file).
function toOriginalUrl(u) {
  return u.replace(/-\d+x\d+(?=\.[a-z]+$)/i, '');
}

// Categorize by filename hints + known-good seed list from the brief.
const SEED_CATEGORIES = {
  shower: [
    'IMG-20210128-WA0045-1', 'IMG_20191216_121744-1',
    'IMG_20190731_154422', 'IMG-20210128-WA0043',
    'IMG_20200322_123120', 'IMG_20191215_120545_1',
  ],
  mirrors: [
    '20180323_103901', 'IMG_20200105_164555_1-1',
    'IMG_20210901_144107', 'IMG_20181212_092845',
    '20180209_113837', '20180323_103548',
  ],
  brand: ['logo_old_full', 'cropped-logo_old2', '86df875e6bce425dbba64f73f080387c'],
};

function categorizeByName(url) {
  const name = basename(url).toLowerCase();
  for (const [cat, seeds] of Object.entries(SEED_CATEGORIES)) {
    if (seeds.some(s => name.includes(s.toLowerCase()))) return cat;
  }
  if (/logo|cropped-logo|brand/.test(name)) return 'brand';
  if (/shower|מקלחון/.test(name)) return 'shower';
  if (/mirror|מראה/.test(name)) return 'mirrors';
  if (/railing|balustrade|מעקה/.test(name)) return 'railings';
  if (/cladding|kitchen|חיפוי/.test(name)) return 'cladding';
  if (/bath|אמבטיון/.test(name)) return 'bath';
  return 'uncategorized';
}

// Download a URL to disk (skip if already present).
async function download(url, destPath) {
  if (existsSync(destPath)) return { url, destPath, skipped: true };
  await mkdir(dirname(destPath), { recursive: true });
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  await pipeline(res.body, createWriteStream(destPath));
  return { url, destPath, skipped: false, bytes: Number(res.headers.get('content-length') || 0) };
}

// ---------------------------------------------------------------- main
async function main() {
  await mkdir(OUT_ROOT, { recursive: true });

  const collected = new Map(); // url -> { source, category }

  // 1) Scrape HTML pages
  for (const path of PAGES) {
    const url = ORIGIN + path;
    process.stdout.write(`\n▸ Fetching ${url}\n`);
    try {
      const html = await fetchText(url);
      const found = extractUploadUrls(html);
      process.stdout.write(`  extracted ${found.length} raw URL matches\n`);
      for (const u of found) {
        const orig = toOriginalUrl(u);
        if (!collected.has(orig)) collected.set(orig, { source: url, category: categorizeByName(orig) });
      }
    } catch (e) {
      process.stdout.write(`  ! ${e.message}\n`);
    }
  }

  // 2) WP REST API — often exposes full media library, bypasses "load more"
  process.stdout.write(`\n▸ Trying WP REST /wp-json/wp/v2/media\n`);
  let apiCount = 0;
  for (let page = 1; page <= 20; page++) {
    try {
      const items = await fetchJson(`${ORIGIN}/wp-json/wp/v2/media?per_page=100&page=${page}&_fields=source_url,mime_type`);
      if (!Array.isArray(items) || items.length === 0) break;
      for (const it of items) {
        if (!it.source_url || !/wp-content\/uploads/.test(it.source_url)) continue;
        if (it.mime_type && !/^image\//.test(it.mime_type)) continue;
        const orig = toOriginalUrl(it.source_url);
        if (!collected.has(orig)) collected.set(orig, { source: 'wp-rest', category: categorizeByName(orig) });
        apiCount++;
      }
      process.stdout.write(`  page ${page}: +${items.length}\n`);
      if (items.length < 100) break;
    } catch (e) {
      process.stdout.write(`  page ${page} failed: ${e.message}\n`);
      break;
    }
  }
  process.stdout.write(`  WP REST contributed ${apiCount} media entries\n`);

  // 3) Also seed the brief's explicit list (in case both above miss it)
  for (const seeds of Object.values(SEED_CATEGORIES)) {
    for (const s of seeds) {
      // Guess original filenames from the brief (jpg/png)
      const guesses = [
        `${ORIGIN}/wp-content/uploads/2024/05/${s}.jpg`,
        `${ORIGIN}/wp-content/uploads/2024/05/${s}.png`,
      ];
      for (const g of guesses) {
        if (!collected.has(g)) collected.set(g, { source: 'seed', category: categorizeByName(g) });
      }
    }
  }

  process.stdout.write(`\n▸ Total unique URLs to try: ${collected.size}\n`);

  // 4) Download
  const results = [];
  let ok = 0, fail = 0, skip = 0;
  for (const [url, meta] of collected) {
    const filename = basename(url.split('?')[0]);
    const dest = join(OUT_ROOT, meta.category, filename);
    try {
      const r = await download(url, dest);
      results.push({ ...meta, url, destPath: dest, ok: true, skipped: r.skipped });
      if (r.skipped) skip++; else ok++;
      process.stdout.write(r.skipped ? '·' : '.');
    } catch (e) {
      results.push({ ...meta, url, ok: false, error: e.message });
      fail++;
      process.stdout.write('x');
    }
  }
  process.stdout.write(`\n\n▸ Downloaded ${ok} new, skipped ${skip} existing, failed ${fail}\n`);

  // 5) Summary by category
  const byCat = {};
  for (const r of results) {
    if (!r.ok) continue;
    byCat[r.category] = (byCat[r.category] || 0) + 1;
  }
  process.stdout.write(`\nBy category:\n`);
  for (const [cat, n] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) {
    process.stdout.write(`  ${cat.padEnd(16)} ${n}\n`);
  }

  // 6) Persist manifest for the optimize step
  const manifestPath = join(OUT_ROOT, '_manifest.json');
  await writeFile(manifestPath, JSON.stringify(results, null, 2), 'utf8');
  process.stdout.write(`\nManifest → ${manifestPath}\n`);
}

main().catch(err => { console.error(err); process.exit(1); });
