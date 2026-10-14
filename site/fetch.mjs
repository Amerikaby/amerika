// Загрузка данных из WordPress REST API старого сайта с кешем в site/cache/.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

export const API = 'https://amerika.by/wp-json/wp/v2';

export async function fetchAll(type, { cacheDir, query = '', refresh = false } = {}) {
  const file = path.join(cacheDir, `${type}${query ? '-' + query.replace(/[^a-z0-9]+/gi, '_') : ''}.json`);
  if (!refresh && existsSync(file)) return JSON.parse(await readFile(file, 'utf8'));
  await mkdir(cacheDir, { recursive: true });
  const out = [];
  for (let page = 1; ; page++) {
    const url = `${API}/${type}?per_page=100&page=${page}${query ? '&' + query : ''}`;
    let res, tries = 0;
    for (;;) {
      try { res = await fetch(url, { headers: { 'User-Agent': 'amerika-site-build/1.0' } }); break; }
      catch (e) { if (++tries > 3) throw e; await new Promise(r => setTimeout(r, 1500 * tries)); }
    }
    if (res.status === 400 && page > 1) break; // страница за пределами
    if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
    const items = await res.json();
    out.push(...items);
    const totalPages = +res.headers.get('x-wp-totalpages') || 1;
    process.stdout.write(`  ${type} p${page}/${totalPages} (${out.length})\n`);
    if (page >= totalPages) break;
  }
  await writeFile(file, JSON.stringify(out));
  return out;
}
