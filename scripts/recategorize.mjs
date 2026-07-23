// scripts/recategorize.mjs
// Re-sort images in public/images/raw/uncategorized/ into proper category folders
// by using each image's alt text from the WP page content.

import { readFile, rename, mkdir, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW_ROOT = join(__dirname, '..', 'public', 'images', 'raw');

const UA = 'Mozilla/5.0 (compatible; ZagagSheliMigrationBot/1.0)';

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return await res.json();
}

// Map Hebrew keywords -> category folder name.
// Used both against the Elementor `eael-cf-...` filter class and against alt/title text.
// Order matters: more specific first.
const KEYWORD_CAT = [
  [/מקלחון|פרזול/, 'shower'],
  [/אמבטיון/, 'bath'],
  [/מעקה|מעקות/, 'railings'],
  [/חיפוי/, 'cladding'],
  [/מראה|מראות/, 'mirrors'],
  [/עבוד(ה|ות)-?מיוחד|תיקון/, 'custom'],
];

function categoryFromText(text) {
  if (!text) return null;
  for (const [re, cat] of KEYWORD_CAT) {
    if (re.test(text)) return cat;
  }
  return null;
}

function stripSizeSuffix(name) {
  return name.replace(/-\d+x\d+(?=\.[a-z]+$)/i, '');
}
function baseKey(url) {
  return stripSizeSuffix(basename(url.split('?')[0].split('#')[0])).toLowerCase();
}

async function main() {
  process.stdout.write('▸ Fetching page content for alt-text mappings\n');
  const pages = await fetchJson('https://zagagsheli.co.il/wp-json/wp/v2/pages?per_page=50&_fields=slug,content');
  const targets = pages.filter(p => ['examples', 'main'].includes(p.slug));
  process.stdout.write(`  scanning ${targets.length} pages: ${targets.map(p => p.slug).join(', ')}\n`);

  // filename (lowercase, no size suffix) -> category
  const fileToCat = new Map();
  const altSamples = new Map(); // for debugging

  for (const p of targets) {
    let html = p.content?.rendered || '';
    // Elementor Essential Addons packs all gallery items into a `data-gallery-items="[...]"`
    // blob with HTML-encoded entities. Decode &quot; -> " and < -> < so regex can hit.
    const decoded = html
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/\\u003C/gi, '<')
      .replace(/\\u003E/gi, '>')
      .replace(/\\u0022/g, '"')
      .replace(/\\\//g, '/');

    // Match Elementor filter-item wrappers: class="eael-filterable-gallery-item-wrap eael-cf-<HEBREW_CATEGORY>"
    // followed (later in the same item) by an <a href="...uploads/..."> or <img src=...>.
    const itemRe = /eael-cf-([^\s"'\\]+)[^]*?(?=eael-filterable-gallery-item-wrap|$)/g;
    for (const m of decoded.matchAll(itemRe)) {
      const filterKey = decodeURIComponent(m[1]);
      const cat = categoryFromText(filterKey);
      if (!cat) continue;
      // Within this item's slice, grab every uploads URL
      const slice = m[0];
      const urlRe = /https?:\/\/[^\s"'<>]+?\/wp-content\/uploads\/[^\s"'<>]+?\.(?:jpe?g|png|webp|gif)/gi;
      for (const um of slice.matchAll(urlRe)) {
        const key = baseKey(um[0]);
        if (!fileToCat.has(key)) fileToCat.set(key, cat);
        if (!altSamples.has(cat)) altSamples.set(cat, filterKey);
      }
    }

    // Also handle plain <img alt="..."> pairs (site-wide, not just gallery)
    const imgRe = /<img\b[^>]*?>/gi;
    for (const m of decoded.matchAll(imgRe)) {
      const tag = m[0];
      const src = /\bsrc="([^"]+)"/i.exec(tag)?.[1] || /\bdata-src="([^"]+)"/i.exec(tag)?.[1];
      const alt = /\balt="([^"]*)"/i.exec(tag)?.[1] || '';
      const title = /\btitle="([^"]*)"/i.exec(tag)?.[1] || '';
      if (!src || !/wp-content\/uploads/.test(src)) continue;
      const key = baseKey(src);
      const cat = categoryFromText(alt) || categoryFromText(title);
      if (cat && !fileToCat.has(key)) {
        fileToCat.set(key, cat);
        if (!altSamples.has(cat)) altSamples.set(cat, alt || title);
      }
    }
  }

  process.stdout.write(`\n  Built alt→category map for ${fileToCat.size} unique files\n`);
  for (const [cat, sample] of altSamples) {
    process.stdout.write(`    ${cat}: "${sample}"\n`);
  }

  // Now walk raw/ and move any file whose baseKey has a known category
  const dirs = await readdir(RAW_ROOT, { withFileTypes: true });
  const moves = [];
  for (const d of dirs) {
    if (!d.isDirectory()) continue;
    const currentCat = d.name;
    const files = await readdir(join(RAW_ROOT, d.name));
    for (const f of files) {
      const key = baseKey(f);
      const target = fileToCat.get(key);
      if (target && target !== currentCat) {
        moves.push({ from: join(RAW_ROOT, currentCat, f), to: join(RAW_ROOT, target, f), file: f, fromCat: currentCat, toCat: target });
      }
    }
  }

  process.stdout.write(`\n  Planned moves: ${moves.length}\n`);
  for (const mv of moves) {
    await mkdir(dirname(mv.to), { recursive: true });
    if (existsSync(mv.to)) {
      process.stdout.write(`    skip (exists): ${mv.file}\n`);
      continue;
    }
    await rename(mv.from, mv.to);
    process.stdout.write(`    ${mv.fromCat.padEnd(15)} → ${mv.toCat.padEnd(10)}  ${mv.file}\n`);
  }

  // Final report
  process.stdout.write(`\n▸ Final counts:\n`);
  const dirs2 = await readdir(RAW_ROOT, { withFileTypes: true });
  const summary = {};
  for (const d of dirs2) {
    if (!d.isDirectory()) continue;
    const files = await readdir(join(RAW_ROOT, d.name));
    summary[d.name] = files.length;
    process.stdout.write(`  ${d.name.padEnd(16)} ${files.length}\n`);
  }

  await writeFile(join(RAW_ROOT, '_categories.json'), JSON.stringify(summary, null, 2), 'utf8');
}

main().catch(e => { console.error(e); process.exit(1); });
