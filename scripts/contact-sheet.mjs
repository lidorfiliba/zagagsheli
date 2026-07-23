// scripts/contact-sheet.mjs
// Generate public/images/raw/_review.html — a local page that shows every
// downloaded image grouped by category so Lior can eyeball misclassifications.

import { readdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW = join(__dirname, '..', 'public', 'images', 'raw');

const LABELS = {
  shower: 'מקלחונים',
  mirrors: 'מראות',
  railings: 'מעקות זכוכית',
  cladding: 'חיפויי זכוכית',
  bath: 'אמבטיונים',
  custom: 'עבודות מיוחדות',
  brand: 'לוגו / מותג',
  uncategorized: 'לא מקוטלגות (צריך עין אנושית)',
};

const dirs = (await readdir(RAW, { withFileTypes: true }))
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort((a, b) => {
    const order = ['shower', 'mirrors', 'railings', 'cladding', 'bath', 'custom', 'brand', 'uncategorized'];
    return order.indexOf(a) - order.indexOf(b);
  });

const sections = [];
for (const d of dirs) {
  const files = (await readdir(join(RAW, d))).filter(f => /\.(jpe?g|png|webp|avif|gif)$/i.test(f));
  const label = LABELS[d] || d;
  const items = files.map(f => `
    <figure>
      <img src="${d}/${f}" loading="lazy" alt="${f}">
      <figcaption><code>${f}</code></figcaption>
    </figure>`).join('');
  sections.push(`
    <section id="${d}">
      <h2>${label} <small>(${files.length})</small></h2>
      <div class="grid">${items}</div>
    </section>`);
}

const html = `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<title>גליון קונטקט — תמונות שנאספו מ-zagagsheli.co.il</title>
<style>
  :root { color-scheme: dark; }
  body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; margin: 0; padding: 24px; background: #0f0f10; color: #e7e7ea; }
  h1 { margin: 0 0 8px; font-size: 22px; font-weight: 500; }
  h2 { margin: 40px 0 12px; font-size: 18px; font-weight: 500; border-bottom: 1px solid #2a2a2e; padding-bottom: 8px; }
  small { color: #8a8a90; font-weight: 400; }
  nav { position: sticky; top: 0; background: #0f0f10ee; backdrop-filter: blur(8px); padding: 8px 0; margin-bottom: 20px; border-bottom: 1px solid #2a2a2e; z-index: 10; }
  nav a { color: #8ab4f8; margin-inline-end: 14px; text-decoration: none; font-size: 14px; }
  nav a:hover { text-decoration: underline; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
  figure { margin: 0; background: #1a1a1d; border: 1px solid #2a2a2e; border-radius: 8px; overflow: hidden; }
  img { width: 100%; height: 180px; object-fit: cover; display: block; background: #000; }
  figcaption { padding: 6px 8px; font-size: 11px; color: #a6a6ac; word-break: break-all; }
  code { font-family: ui-monospace, "Cascadia Code", monospace; font-size: 11px; }
</style>
</head>
<body>
<h1>גליון קונטקט — כל התמונות שנאספו</h1>
<p><small>אם משהו לא בקטגוריה הנכונה, אמור לי איזה קובץ + לאן להעביר.</small></p>
<nav>${dirs.map(d => `<a href="#${d}">${LABELS[d] || d}</a>`).join('')}</nav>
${sections.join('\n')}
</body>
</html>`;

const outPath = join(RAW, '_review.html');
await writeFile(outPath, html, 'utf8');
console.log('Wrote', outPath);
console.log('Open in browser: file:///' + outPath.replace(/\\/g, '/'));
