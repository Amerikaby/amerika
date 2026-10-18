#!/usr/bin/env node
// Генератор статического сайта amerika.by (тестовая версия в /newcodex/).
// Запуск: node site/build.mjs            — сборка из кеша (site/cache/), при отсутствии кеша скачивает данные
//         node site/build.mjs --refresh  — заново скачать всё из WordPress REST API и карты старого сайта
//         BASE=/ node site/build.mjs     — собрать для корня домена (например, new.amerika.by)
//         PUBLIC_URL=https://new.amerika.by — где сайт реально открыт (для og:image и логотипа в разметке)
//         OUT=/path/to/dir               — куда писать (по умолчанию newcodex/ рядом с site/)
import { readFile, writeFile, mkdir, rm, copyFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchAll, fetchOldSitemap } from './fetch.mjs';
import { esc, decode, plain, clip, sanitize } from './lib/html.mjs';
import { makeLayout, SITE, SERVICES, ICONS } from './partials.mjs';
import { homeBody, quickCalc } from './pages/home.mjs';
import { staticPages } from './pages/static.mjs';
import { modelPages, modelsStrip, modelsTiles, modelRows, MODEL_PAGES } from './pages/models.mjs';
import { PHOTO_BLOCK, isStubImage, fixTitleCase, defaultCc, EV_MODELS } from './data-fixes.mjs';

// ---------- Настройки ----------
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(ROOT, '..');
/** Единственная константа адреса: все внутренние ссылки строятся от неё. */
const BASE = normalizeBase(process.env.BASE ?? '/newcodex/');
const PUBLIC_URL = (process.env.PUBLIC_URL || 'https://amerika.by').replace(/\/+$/, '');
const OUT = path.resolve(process.env.OUT || path.join(REPO, 'newcodex'));
const CACHE = path.join(ROOT, 'cache');
const REFRESH = process.argv.includes('--refresh');
const CARS_PER_PAGE = 36;
const POSTS_PER_PAGE = 12;
/** Адреса как на старом сайте: каталог /auto-usa/, машина /auto-usa/<slug>/, марка /usa/<марка>/. */
const CAT = 'auto-usa/';
const EV_PATH = 'auto-usa/elektromobily-usa/';
const carPath = (slug) => `auto-usa/${slug}/`;
const brandPath = (slug) => `usa/${slug}/`;
const EXAMPLE_PRICES = [5000, 10000, 15000];

function normalizeBase(b) {
  b = '/' + String(b).replace(/^\/+|\/+$/g, '');
  return b === '/' ? '/' : b + '/';
}

const L = makeLayout(BASE, PUBLIC_URL);
const { u, assetUrl, page, leadSection, pager } = L;
const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const fmtDate = (iso) => { const d = new Date(iso); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
const money = (n) => Math.round(n).toLocaleString('ru-RU').replace(/[  ,]/g, ' ');

const written = [];   // пути страниц для sitemap
async function out(rel, html, { sitemap = true } = {}) {
  const file = /\.(html|xml|json|txt|htaccess)$/.test(rel) || rel === '.htaccess'
    ? path.join(OUT, rel) : path.join(OUT, rel, 'index.html');
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, html);
  if (sitemap && !rel.includes('.')) written.push(rel);
}

// ---------- Калькулятор: те же формулы, что в браузере ----------
const configSrc = await readFile(path.join(ROOT, 'assets', 'config.js'), 'utf8');
const coreSrc = await readFile(path.join(ROOT, 'assets', 'calc-core.js'), 'utf8');
const { CONFIG, costOf, autoPortFor } = new Function(configSrc + '\n' + coreSrc + '\nreturn { CONFIG, costOf, autoPortFor };')();

// ---------- Данные ----------
console.log(`BASE=${BASE}  PUBLIC_URL=${PUBLIC_URL}  OUT=${OUT}`);
const opt = { cacheDir: CACHE, refresh: REFRESH };
const [rawCars, rawBlog, terms, rawPages] = await Promise.all([fetchAll('auto-usa', opt), fetchAll('blog', opt), fetchAll('marka_usa', opt), fetchAll('pages', opt)]);
console.log(`данные: машин ${rawCars.length}, статей ${rawBlog.length}, терминов марок ${terms.length}, страниц ${rawPages.length}`);

const termById = new Map(terms.map((t) => [t.id, t]));
const termName = (t) => decode(t.name).trim();

// Галерея: размеры WP → большие и маленькие картинки. Миниатюры 150×150 не используем никогда.
function imgSizes(g) {
  const s = g.media_details?.sizes || {};
  const pick = (...keys) => keys.map((k) => s[k]?.source_url).find(Boolean);
  const full = g.full_image_url || g.url;
  return {
    large: pick('large', 'medium_large') || full,
    card: pick('medium_large', 'large') || full,
    small: pick('medium', 'medium_large', 'large') || full,
  };
}

function parseSpecs(title, text) {
  const spec = {};
  const y = /\b(19[89]\d|20[0-3]\d)\b(?!.*\b(19[89]\d|20[0-3]\d)\b)/.exec(title);
  if (y) spec.year = +y[1];
  const first = text.slice(0, 900);
  const mil = /проб[её]г[а-я]*\s*(?:составляет\s*|около\s*)?(\d[\d\s ]{0,8}\d)\s*(миль|мил|км)/i.exec(first) || /(\d[\d\s ]{0,8}\d)\s*(миль)/i.exec(first);
  if (mil) { spec.mileageNum = +mil[1].replace(/\D/g, ''); spec.mileageUnit = mil[2].startsWith('мил') ? 'миль' : 'км'; }
  const eng = /двигател[а-я]*\s*(?:объ[её]мом\s*)?(\d[.,]\d)\s*(?:л|литр|t\b|т\b)?/i.exec(text) || /\b(\d[.,]\d)\s*(?:л\b|литр|T\b)/.exec(title + ' ' + first);
  if (eng) { const v = parseFloat(eng[1].replace(',', '.')); if (v >= 0.6 && v <= 8) spec.cc = Math.round(v * 1000 / 100) * 100; }
  const both = title + ' ' + first;
  if (/(полн[а-я]+ привод|AWD|4WD|4x4|4MATIC|xDrive|quattro)/i.test(both)) spec.drive = 'полный';
  else if (/передн[а-я]+ привод|FWD/i.test(both)) spec.drive = 'передний';
  else if (/задн[а-я]+ привод|RWD/i.test(both)) spec.drive = 'задний';
  if (/автоматическ[а-я]+ короб|АКПП|вариатор/i.test(first)) spec.gear = /вариатор/i.test(first) ? 'вариатор' : 'автомат';
  else if (/механическ[а-я]+ короб/i.test(first)) spec.gear = 'механика';
  if (/электромобил|электрическ[а-я]+ (?:силов|двигател|мотор)|\bEV\b|Electric/i.test(title + ' ' + first.slice(0, 300))) spec.fuel = 'электро';
  else if (/гибрид|hybrid/i.test(title + ' ' + first.slice(0, 300))) spec.fuel = 'гибрид';
  return spec;
}

/** Модель из названия: «Ford Bronco Sport, Big Bend 2022» → «Bronco Sport». */
const TWO_WORD_BRANDS = /^(alfa romeo|aston martin|land rover)\s+/i;
function modelFromTitle(title, taxModel) {
  const head = title.split(',')[0].replace(/\s+\b(19[89]\d|20[0-3]\d)\b.*$/, '').trim();
  const rest = TWO_WORD_BRANDS.test(head) ? head.replace(TWO_WORD_BRANDS, '') : head.replace(/^\S+\s*/, '');
  if (title.includes(',') && rest) return rest;
  if (taxModel) {
    const i = title.toLowerCase().indexOf(taxModel.toLowerCase());
    return i >= 0 ? title.substr(i, taxModel.length) : taxModel;
  }
  return rest || '';
}

// Насколько описание — шаблон: доля 6-словных фрагментов, которые встречаются ещё минимум у двух машин.
function templateShare(items) {
  const docs = items.map((x) => {
    let t = plain(x.content.rendered).toLowerCase();
    for (const w of decode(x.title.rendered).toLowerCase().split(/[\s,]+/)) if (w.length > 1) t = t.split(w).join(' ');
    const w = t.replace(/\d+/g, '#').replace(/[^a-zа-яё#]+/g, ' ').split(' ').filter(Boolean);
    const s = new Set(); for (let i = 0; i + 6 <= w.length; i++) s.add(w.slice(i, i + 6).join(' '));
    return s;
  });
  const df = new Map(); for (const s of docs) for (const k of s) df.set(k, (df.get(k) || 0) + 1);
  return docs.map((s) => { if (!s.size) return 1; let c = 0; for (const k of s) if (df.get(k) >= 3) c++; return c / s.size; });
}
const shares = templateShare(rawCars);

const cars = rawCars.map((x, idx) => {
  const rawTitle = decode(x.title.rendered).replace(/\s+/g, ' ').trim();
  const title = fixTitleCase(rawTitle);
  const t = (x.marka_usa || []).map((id) => termById.get(id)).filter(Boolean);
  const brandT = t.find((z) => !z.parent) || (t[0] && termById.get(t[0].parent));
  const modelT = t.find((z) => z.parent);
  let gallery = (x.acf?.photo_gallery?.gallery || []).flat().filter((g) => g && (g.full_image_url || g.url)).map(imgSizes);
  if (!gallery.length && x.yoast_head_json?.og_image?.[0]?.url) { const og = x.yoast_head_json.og_image[0].url; gallery.push({ large: og, card: og, small: og }); }
  gallery = gallery.filter((g) => !isStubImage(g.large) && !isStubImage(g.small));
  if (PHOTO_BLOCK.has(x.slug)) gallery = [];
  const text = plain(x.content.rendered);
  const spec = parseSpecs(rawTitle, text);
  const modelSlug = modelT?.slug || '';
  if (!spec.fuel && EV_MODELS.has(modelSlug)) spec.fuel = 'электро';
  return {
    id: x.id, slug: x.slug, title, date: x.date, modified: x.modified,
    brand: brandT ? { slug: brandT.slug, name: termName(brandT) } : null,
    model: modelT ? { slug: modelSlug, name: modelFromTitle(title, termName(modelT)) } : (title ? { slug: '', name: modelFromTitle(title, '') } : null),
    gallery, rawContent: x.content.rendered, text, spec,
    uniqueText: shares[idx] < 0.5,
  };
}).sort((a, b) => b.date.localeCompare(a.date));
const carBySlug = new Map(cars.map((c) => [c.slug, c]));
// Одинаковые названия (дубли лотов на старом сайте): различаем в <title> пробегом или номером варианта
{
  const groups = new Map();
  for (const c of cars) { const k = c.title.toLowerCase(); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(c); }
  for (const list of groups.values()) {
    if (list.length < 2) continue;
    const mil = list.map((c) => c.spec.mileageNum ? `пробег ${money(c.spec.mileageNum)} ${c.spec.mileageUnit}` : '');
    const uniq = mil.every((m, i) => m && mil.indexOf(m) === i);
    [...list].reverse().forEach((c, i) => { c.titleSuffix = uniq ? `, ${mil[list.indexOf(c)]}` : ` (вариант ${i + 1})`; });
  }
}
const evCars = cars.filter((c) => c.spec.fuel === 'электро');

const brands = new Map();
for (const c of cars) {
  if (!c.brand) continue;
  if (!brands.has(c.brand.slug)) brands.set(c.brand.slug, { ...c.brand, cars: [], models: new Map() });
  const b = brands.get(c.brand.slug);
  b.cars.push(c);
  if (c.model?.slug) {
    const m = b.models.get(c.model.slug) || { slug: c.model.slug, names: new Map(), count: 0 };
    m.count++; m.names.set(c.model.name, (m.names.get(c.model.name) || 0) + 1); b.models.set(c.model.slug, m);
  }
}
// Имя модели для фильтра: самое частое из названий машин этой рубрики старого сайта
for (const b of brands.values()) for (const m of b.models.values()) m.name = [...m.names.entries()].sort((x, y) => y[1] - x[1])[0][0];
// Модели каталога для быстрого расчёта: марка, модель, типичный объём по годам (самый частый в каталоге, иначе по таблице)
const modelIndex = [];
for (const b of brands.values()) for (const m of b.models.values()) {
  const list = b.cars.filter((c) => c.model?.slug === m.slug && c.spec.year);
  if (!m.slug || !list.length) continue;
  const ev = EV_MODELS.has(m.slug) || list.every((c) => c.spec.fuel === 'электро');
  const byYear = {};
  for (const c of list) (byYear[c.spec.year] ||= []).push(c.spec.cc);
  const cc = {};
  for (const [y, arr] of Object.entries(byYear)) {
    const known = arr.filter(Boolean), cnt = {};
    for (const v of known) cnt[v] = (cnt[v] || 0) + 1;
    cc[y] = ev ? 0 : (known.length ? +Object.entries(cnt).sort((x, z) => z[1] - x[1])[0][0] : (defaultCc(m.slug, +y) ?? 2000));
  }
  modelIndex.push({ key: `${b.slug}/${m.slug}`, b: b.name, n: m.name, count: list.length, cc, ev });
}
modelIndex.sort((x, y) => y.count - x.count);
if (process.env.DUMP_MODELS) { console.log(modelIndex.slice(0, 60).map((m) => `${m.key}\t${m.b} ${m.n}\t${m.count}\t${JSON.stringify(m.cc)}`).join('\n')); process.exit(0); }
const brandList = [...brands.values()].sort((a, b) => b.cars.length - a.cars.length || a.name.localeCompare(b.name));

/** Заголовок статьи для <title>: не длиннее 65 знаков, режем по двоеточию или по слову. */
function shortTitle(t, max = 65) {
  t = t.trim();
  if (t.length <= max) return t;
  const parts = t.split(/\s*(?::|\s—\s|\s–\s|\?)\s*/);
  if (parts[0].length >= 25 && parts[0].length <= max) return parts[0] + (t[parts[0].length] === '?' ? '?' : '');
  let cut = t.slice(0, max + 1).replace(/\s+\S*$/, '');
  cut = cut.replace(/[\s,.;:–—-]+$/, '').replace(/\s+(и|в|на|с|по|для|от|до|из|к|о|а|но|или|как|что)$/i, '');
  return cut;
}

const posts = rawBlog.map((x) => {
  const title = decode(x.title.rendered).trim();
  const y = x.yoast_head_json || {};
  const seo = decode(y.title || title).replace(/\s*[|–-]\s*AMERIKA\.BY.*$/i, '').trim();
  return {
    slug: x.slug, title, date: x.date, modified: x.modified,
    seoTitle: shortTitle(seo),
    description: clip(decode(y.description || '') || plain(x.excerpt?.rendered || x.content.rendered), 160),
    excerpt: clip(plain(x.excerpt?.rendered || x.content.rendered).replace(/\s*\[…\]\s*$/, ''), 220),
    image: y.og_image?.[0]?.url || null,
    imageW: y.og_image?.[0]?.width, imageH: y.og_image?.[0]?.height,
    rawContent: x.content.rendered,
  };
}).sort((a, b) => b.date.localeCompare(a.date));
const postBySlug = new Map(posts.map((p) => [p.slug, p]));

// ---------- Ссылки из старого контента → новые адреса ----------
const SERVICE_SLUGS = new Set(SERVICES.map(([p]) => p.split('/')[1]));
const SIMPLE = { ceny: 'ceny/', kontakty: 'kontakty/', otzyvy: 'otzyvy/', 'o-nas': 'o-kompanii/', 'o-kompanii': 'o-kompanii/',
  calc: 'kalkulyator/', 'kalculyator-dostavki': 'kalkulyator/', 'kalkuljator-dostavki-rb': 'kalkulyator/', kalkulyator: 'kalkulyator/',
  'tamozhennyj-kalkulator': 'tamozhennyj-kalkulator/', 'tamozhennyj-kalkulyator': 'tamozhennyj-kalkulator/', faqs: '#faq', auctions: CAT,
  'privacy-policy': 'privacy-policy/', katalog: CAT };
function mapLink(href) {
  href = href.trim();
  if (!href) return null;
  if (href.startsWith('#')) return { href };
  if (/^(mailto|tel|viber):/i.test(href)) return { href };
  let p;
  const m = /^(?:https?:)?\/\/(?:www\.)?amerika\.by(\/[^\s]*)?$/i.exec(href);
  if (m) p = m[1] || '/';
  else if (href.startsWith('/')) p = href;
  else if (/^https?:\/\//i.test(href)) return { href, ext: true };
  else return null;
  const pathOnly = p.split(/[?#]/)[0];
  const seg = pathOnly.split('/').filter(Boolean);
  if (seg[0] === 'wp-content') return { href: 'https://amerika.by' + p, ext: true };
  if (!seg.length) return { href: u() };
  if (seg[0] in SIMPLE) return { href: u(SIMPLE[seg[0]]) };
  switch (seg[0]) {
    case 'auto-usa':
      if (seg[1] === 'elektromobily-usa') return { href: u(EV_PATH) };
      return { href: u(seg[1] && carBySlug.has(seg[1]) ? carPath(seg[1]) : CAT) };
    case 'usa': {
      if (seg[1] && brands.has(seg[1])) {
        const b = brands.get(seg[1]);
        return { href: u(brandPath(seg[1])) + (seg[2] && b.models.has(seg[2]) ? `?model=${encodeURIComponent(seg[2])}` : '') };
      }
      return { href: u(CAT) };
    }
    case 'blog': return { href: u(seg[1] && postBySlug.has(seg[1]) ? `blog/${seg[1]}/` : 'blog/') };
    case 'uslugi': return { href: u(seg[1] && SERVICE_SLUGS.has(seg[1]) ? `uslugi/${seg[1]}/` : 'uslugi/') };
    default: return null; // Европа, Канада, Китай и прочее: оставляем текст без ссылки (сайт про США)
  }
}

// ---------- Карточки ----------
function photoStub(c, cls = '') {
  return `<div class="ph ph-empty${cls}" role="img" aria-label="${esc(c.title)}: фото по запросу"><span>${esc(c.brand?.name || '')}</span><b>${esc(c.model?.name || c.title)}</b><small>фото по запросу</small></div>`;
}
function carCard(c, { model = false } = {}) {
  const g = c.gallery[0];
  const ph = g ? `<div class="ph"><img src="${esc(g.small)}" srcset="${esc(g.small)} 300w, ${esc(g.card)} 768w" sizes="(max-width:560px) 50vw, 300px" alt="${esc(c.title)}" loading="lazy" decoding="async" width="300" height="225"></div>` : photoStub(c);
  return `<a class="car" href="${u(carPath(c.slug))}"${model ? ` data-model="${esc(c.model?.slug || '')}"` : ''}>${ph}<div class="tx"><h3>${esc(c.title)}</h3><div class="meta">${c.spec.year ? `<b>${c.spec.year}</b>` : ''}<span>${esc(c.brand?.name || '')}</span></div></div></a>`;
}
function postCard(p, h = 'h3') {
  return `<a class="post" href="${u(`blog/${p.slug}/`)}"><div class="ph">${p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy" decoding="async" width="${p.imageW || 1024}" height="${p.imageH || 576}">` : ''}</div><div class="tx"><time datetime="${p.date.slice(0, 10)}">${fmtDate(p.date)}</time><${h}>${esc(p.title)}</${h}><p>${esc(p.excerpt)}</p></div></a>`;
}
const brandChips = (current) => `<div class="chips">${brandList.map((b) => `<a href="${u(brandPath(b.slug))}"${b.slug === current ? ' class="on" aria-current="page"' : ''}>${esc(b.name)}<small>${b.cars.length}</small></a>`).join('')}${evCars.length ? `<a href="${u(EV_PATH)}"${current === 'ev' ? ' class="on" aria-current="page"' : ''}>Электромобили<small>${evCars.length}</small></a>` : ''}</div>`;
const plural = (n, one, few, many) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? one : (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? few : many); };

// ---------- Сборка ----------
if (OUT === REPO || REPO.startsWith(OUT + path.sep) || OUT === ROOT || OUT.startsWith(ROOT + path.sep)) throw new Error('Unsafe output directory: ' + OUT);
if (existsSync(OUT)) await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

// Ассеты
await mkdir(path.join(OUT, 'assets'), { recursive: true });
await writeFile(path.join(OUT, 'assets', 'site.js'), configSrc + '\n' + coreSrc + '\n' + await readFile(path.join(ROOT, 'assets', 'site.js'), 'utf8'));
await writeFile(path.join(OUT, 'assets', 'site.css'), await readFile(path.join(ROOT, 'assets', 'site.css'), 'utf8') + '\n' + await readFile(path.join(ROOT, 'assets', 'theme.css'), 'utf8'));
await mkdir(path.join(OUT, 'img'), { recursive: true });
for (const dir of [path.join(REPO, 'new', 'img'), path.join(ROOT, 'static', 'img')]) {
  if (!existsSync(dir)) continue;
  for (const f of await readdir(dir)) if (/\.(svg|jpe?g|png|webp)$/i.test(f)) await copyFile(path.join(dir, f), path.join(OUT, 'img', f));
}
await out('assets/cars.json', JSON.stringify(cars.map((c) => ({ s: c.slug, t: c.title, y: c.spec.year || null, b: c.brand?.slug || '', bn: c.brand?.name || '', m: c.model?.name || '', i: c.gallery[0]?.small || '' }))), { sitemap: false });

const ORG = { '@type': 'Organization', name: 'Amerika.by', url: SITE.origin + '/', logo: { '@type': 'ImageObject', url: assetUrl('img/logo.png'), width: 512, height: 512 } };

// Общий контекст для статичных страниц
const ctx = { u, esc, SITE, SERVICES, ICONS, CONFIG, leadSection, carCard, postCard, cars, posts, brandList, fmtDate };

// 0. Страницы популярных моделей /usa/<марка>/<модель>/ (цены рынка: site/data/market-avby.json)
// Средние цены продажи на аукционе (лёгкие повреждения): site/data/auction-avg.json, заполняется вручную или из AuctionsAPI
const auction = existsSync(path.join(ROOT, 'data', 'auction-avg.json')) ? JSON.parse(await readFile(path.join(ROOT, 'data', 'auction-avg.json'), 'utf8')).models : {};
const market = existsSync(path.join(ROOT, 'data', 'market-avby.json')) ? JSON.parse(await readFile(path.join(ROOT, 'data', 'market-avby.json'), 'utf8')) : null;
const modelPg = market ? modelPages({ u, esc, money, costOf, autoPortFor, CONFIG, carCard, cars, leadSection, brandPath, market, plural }) : [];
for (const p of modelPg) await out(p.path, page(p));

// 1. Главная
{
  // Быстрый расчёт: модели каталога с типичным объёмом по годам и медианой av.by (site/data/market-avby.json)
  const MK_ALIAS = { 'ford/bronco': 'ford/bronco-sport' };
  const nowY = new Date().getFullYear();
  const quickIdx = modelIndex.map((m) => {
    const key = MK_ALIAS[m.key] || m.key, pg = MODEL_PAGES.find((x) => x.key === key);
    const cc = { ...m.cc };
    if (pg) for (let y = nowY - 15; y <= nowY; y++) cc[y] = pg.cc(y);
    const mk = {};
    for (const [y, v] of Object.entries(market?.models?.[key] || {})) if (v.n >= 5) mk[y] = v.median;
    const card = pg && modelPg.find((x) => x.card.name === pg.name)?.card;
    return [m.b, pg ? pg.name : m.n.replace(/^Seria (\d)$/, '$1 Series'), cc, m.ev ? 1 : 0, mk, card ? u(card.rel) : ''];
  });
  const popular = MODEL_PAGES.map((pg) => modelIndex.findIndex((m) => (MK_ALIAS[m.key] || m.key) === pg.key)).filter((i) => i >= 0);
  const quick = quickIdx.length ? quickCalc({ idx: quickIdx, popular }, { u, esc }) : '';
  // Популярные машины: средние цены av.by, аукциона, под ключ по Указу 140 и экономия (site/data/home-models.json)
  const HM = JSON.parse(await readFile(path.join(ROOT, 'data', 'home-models.json'), 'utf8'));
  const r100 = (n) => Math.round(n / 100) * 100;
  const hmCards = HM.models.slice(0, 3).map((m) => {
    const mk = market?.models?.[m.key]?.[HM.year];
    const car = cars.find((c) => c.slug === m.photo[0]);
    const ph = car?.gallery?.[m.photo[1]];
    const o = {moto:false,year:HM.year,cc:m.cc,alt:false,ev:false,region:'east',port:autoPortFor(false,false,m.cc),sublot:false,benefit:false,repair:m.repair,serviceByn:CONFIG.serviceByn};
    const result=costOf(m.auction,o);
    const href=u('kalkulyator/')+'?'+new URLSearchParams({price:String(m.auction),year:String(HM.year),cc:String(m.cc),repair:String(m.repair),service:String(CONFIG.serviceByn)}).toString()+'#calc';
    return `<article class="pm compact-model"><a class="ph" href="${href}">${ph?`<img src="${esc(ph.card)}" alt="${esc(m.brand+' '+m.name)}" loading="lazy" width="768" height="560">`:''}<span class="tag">${HM.year} · ${(m.cc/1000).toFixed(1).replace('.',',')} л</span></a><div class="tx"><span class="br">${esc(m.brand)}</span><h3>${esc(m.name)}</h3><p class="model-total-label">Пример бюджета с восстановлением</p><strong class="model-total num">≈ ${money(result.total)} $</strong><p class="model-condition">Без льготы · услуга ${CONFIG.serviceByn} BYN</p><details><summary>Посмотреть состав цены</summary><dl><div><dt>Лот (пример)</dt><dd>${money(m.auction)} $</dd></div><div><dt>До Минска со сборами и услугой</dt><dd>${money(result.delivered)} $</dd></div><div><dt>Резерв восстановления</dt><dd>${money(result.repair)} $</dd></div>${mk?`<div><dt>Медиана объявлений av.by</dt><dd>${money(mk.median)} $</dd></div>`:''}</dl><p class="note">Цены лота и восстановления — черновые ориентиры, требуют проверки по конкретной машине.</p></details><a class="model-calc" href="${href}">Изменить расчёт →</a></div></article>`;
  }).join('');
  const models = hmCards ? `<section id="models">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow">Популярные модели</p>
      <h2>Какая машина ваша?</h2>
      <p>Модели, которые чаще всего везут в Беларусь. Все с мотором до 1,9 л: едут через Клайпеду, поэтому доставка дешевле.</p>
    </div>
    <div class="pms">${hmCards}</div>
    <p class="pm-note">Примеры расчёта на ${HM.date.split('-').reverse().join('.')} для машин ${HM.year} года. av.by: средняя цена объявлений. Аукцион и восстановление: черновые оценки. Типичная цена лота с небольшими повреждениями. Под ключ: лот, сборы, доставка через Клайпеду, растаможка с возмещением 50% пошлины по Указу № 140 (многодетные семьи, инвалиды I и II группы) и наша услуга. Восстановление: средняя стоимость работ и запчастей для машины с небольшими повреждениями. Экономия: разница между ценой на av.by и итогом.</p>
    <div class="sec-foot"><a class="btn btn-navy" href="${u(CAT)}">Каталог: ${cars.length} авто из США</a></div>
  </div>
</section>` : '';
  const extra = `<section class="white" id="blog">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow">Блог</p>
      <h2>Разбираемся в аукционах, таможне и доставке</h2>
    </div>
    <div class="posts">${posts.filter((p) => !/ремонт|утоп|затоп|град|бит(ая|ые|ый)|поврежд/i.test(p.title)).slice(0, 3).map((p) => postCard(p)).join('')}</div>
    <div class="sec-foot"><a class="btn btn-line" href="${u('blog/')}">Все статьи</a></div>
  </div>
</section>`;
  const body = homeBody({ u, quick, models, extra }) + leadSection({ title: 'Пришлём до 5 вариантов с аукциона и расчёт до Минска' });
  // Вариант B «Витрина» (как bid.cars) для сравнения: /glavnaya-b/, не в sitemap
  {
    const pick = (id) => (body.match(new RegExp(`<section[^>]*id="${id}"[\\s\\S]*?</section>`)) || [''])[0];
    const fresh = cars.filter((c) => c.gallery.length && +c.spec.year >= 2022).sort((a, b) => +b.spec.year - +a.spec.year).slice(0, 8);
    const topBrands = brandList.slice(0, 10);
    const bodyB = `<section class="hero-b">
  <div class="wrap">
    <p class="eyebrow">Copart и IAAI · цена сразу до Минска</p>
    <h1>Авто из США в Беларусь <mark>под ключ</mark></h1>
    <p class="lead">Пригон авто из Америки: найдите машину в каталоге, а мы проверим лот, купим на аукционе и доставим в Минск.</p>
    <form class="hb-search" action="${u(CAT)}" method="get" role="search">
      <label for="hbQ" class="sr">Марка, модель или год</label>
      <input id="hbQ" name="q" type="search" placeholder="Например: Equinox 2022" autocomplete="off">
      <button class="btn btn-red" type="submit">Найти машину</button>
    </form>
    <div class="hb-chips" aria-label="Популярные марки">${topBrands.map((b) => `<a href="${u(brandPath(b.slug))}">${esc(b.name)}<small>${b.cars.length}</small></a>`).join('')}</div>
    <div class="hb-stats"><span><b class="num">${cars.length}</b> авто в каталоге</span><span><b class="num">${brandList.length}</b> марок</span><span><b>Copart и IAAI</b> по всем США</span><span><b>за машину</b> платите аукциону</span></div>
  </div>
</section>
${models.replace('<section id="models">', '<section class="white" id="models">')}
<section id="fresh">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow">Свежие лоты</p>
      <h2>Машины 2022 года и новее с аукционов США</h2>
      <p>Примеры лотов Copart и IAAI. Конкретная машина могла уйти с торгов, похожую подберём под ваш бюджет.</p>
    </div>
    <div class="cars fresh">${fresh.map((c) => carCard(c)).join('')}</div>
    <div class="sec-foot"><a class="btn btn-navy" href="${u(CAT)}">Весь каталог: ${cars.length} авто</a></div>
  </div>
</section>
<section class="white" id="steps3">
  <div class="wrap">
    <div class="sec-head"><p class="eyebrow">Как привозим</p><h2>Нашли машину? Дальше всё сделаем мы</h2></div>
    <ol class="steps3">
      <li><b>1</b><h3>Проверяем лот</h3><p>Carfax, AutoCheck, фото и отчёт аукциона, оценка ремонта. Считаем полную цену до Минска до ставки.</p></li>
      <li><b>2</b><h3>Покупаем на аукционе</h3><p>Ставим за вас по договору. За машину вы платите аукциону напрямую, через нас деньги не идут.</p></li>
      <li><b>3</b><h3>Везём и растаможиваем</h3><p>Atlantic Express доставляет через Клайпеду или Поти, помогаем с таможней в Минске. Обычно 40–70 дней.</p></li>
    </ol>
  </div>
</section>
<section id="calc-b">
  <div class="wrap calc-b">
    <div class="sec-head" style="margin:0">
      <p class="eyebrow">Цена до Минска</p>
      <h2>Посчитайте, во сколько обойдётся машина</h2>
      <p>Выберите модель, год и ставку. Под ключ: лот, сборы, доставка, таможня и наша услуга от ${CONFIG.serviceByn} BYN.</p>
      <p><a class="qc-more dark" href="${u('kalkulyator/')}">Подробный калькулятор со всеми статьями →</a></p>
    </div>
    ${quick}
  </div>
</section>
${pick('faq').replace('<section id="faq">', '<section class="white" id="faq">')}
${leadSection({ eyebrow: 'Не нашли нужную машину?', title: 'Подберём до 5 вариантов с аукциона и посчитаем под ключ' })}`;
    await out('glavnaya-b/', page({
      path: 'glavnaya-b/',
      title: 'Вариант главной B: витрина | amerika.by',
      description: 'Тестовый вариант главной страницы.',
      body: bodyB,
    }), { sitemap: false });
  }
  const faq = [...body.matchAll(/<details[^>]*><summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)]
    .map((m) => ({ '@type': 'Question', name: plain(m[1]), acceptedAnswer: { '@type': 'Answer', text: plain(m[2]) } }));
  await out('', page({
    path: '',
    // Как на живом сайте с 14.10.2026, чтобы не сбить сниппет при переезде
    title: 'Авто из США в Беларусь под ключ: купить с аукционов Copart и IAAI | amerika.by',
    description: 'Подбор и покупка авто на аукционах США, доставка и растаможка в Минск под ключ. Деньги за машину платите аукциону напрямую. +375 29 633-28-28',
    body,
    jsonld: [
      { '@context': 'https://schema.org', '@type': 'AutomotiveBusiness', name: 'Amerika.by', legalName: SITE.company, url: SITE.origin + '/', logo: assetUrl('img/logo.png'), image: assetUrl('img/og-default.jpg'), telephone: '+375296332828', email: SITE.email,
        address: { '@type': 'PostalAddress', streetAddress: SITE.address, addressLocality: 'Минск', addressCountry: 'BY' },
        openingHours: 'Mo-Fr 10:00-19:00', areaServed: 'BY', sameAs: [SITE.instagram, SITE.tg, SITE.yandexOrg] },
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq },
    ],
  }));
}

// 2. Статичные страницы (калькуляторы, услуги, цены, о компании, контакты, отзывы)
for (const p of staticPages(ctx)) await out(p.path, page(p));

// 2a. Политика конфиденциальности: текст старого сайта без изменений смысла, только очищена вёрстка
{
  const pp = rawPages.find((x) => x.slug === 'privacy-policy');
  const content = pp ? sanitize(pp.content.rendered, mapLink) : '<p>Текст политики временно недоступен. Напишите нам: info@amerika.by.</p>';
  await out('privacy-policy/', page({
    path: 'privacy-policy/',
    title: 'Политика конфиденциальности | Amerika.by',
    description: 'Политика конфиденциальности и обработки персональных данных ООО «МирАвтоИмпорт» на сайте amerika.by.',
    crumbs: [['privacy-policy/', 'Политика конфиденциальности']],
    body: `<div class="page-head"><div class="wrap"><h1>Политика конфиденциальности</h1>${pp ? `<p class="lead">Редакция от ${fmtDate(pp.modified)}.</p>` : ''}</div></div>
<section class="sec" style="padding-top:0"><div class="wrap"><div class="prose">${content}</div></div></section>`,
  }));
}

// 3. Каталог /auto-usa/
const catalogIntro = `<p class="lead">Лоты с аукционов Copart и IAAI, которые можно заказать с доставкой в Минск. Это примеры: конкретная машина могла уже уйти с торгов, но похожую мы подберём под ваш бюджет. На аукционах каждый день появляются тысячи новых лотов.</p>`;
const totalCatPages = Math.ceil(cars.length / CARS_PER_PAGE);
const catHref = (n) => u(n === 1 ? CAT : `${CAT}page/${n}/`);
for (let n = 1; n <= totalCatPages; n++) {
  const slice = cars.slice((n - 1) * CARS_PER_PAGE, n * CARS_PER_PAGE);
  const rel = n === 1 ? CAT : `${CAT}page/${n}/`;
  const cr = n === 1 ? [[CAT, 'Каталог']] : [[CAT, 'Каталог'], [rel, `Страница ${n}`]];
  const body = `<div class="page-head"><div class="wrap">
  <p class="eyebrow">Каталог</p>
  <h1>Авто из США${n > 1 ? `: страница ${n}` : ''}</h1>
  ${catalogIntro}
</div></div>
<section class="sec tight" style="padding-top:0">
  <div class="wrap">
    ${n === 1 && modelPg.length ? `<h2 style="font-size:20px;margin-bottom:12px">Популярные модели: цена в Минске</h2>${modelsStrip(modelPg, { u, esc, money })}<div style="height:28px"></div>` : ''}
    <h2 style="font-size:20px;margin-bottom:12px">Марки</h2>
    ${brandChips()}
  </div>
</section>
<section class="sec" style="padding-top:0">
  <div class="wrap">
    <form class="filters" id="catFilter" role="search">
      <div class="field"><label for="catQ">Поиск по модели или году</label><input id="catQ" type="search" placeholder="Например: RAV4 2021" autocomplete="off"></div>
      <div class="field"><label for="catBrand">Марка</label><select id="catBrand"><option value="">Все марки</option>${brandList.map((b) => `<option value="${esc(b.slug)}">${esc(b.name)} (${b.cars.length})</option>`).join('')}</select></div>
      <p class="count" id="catCount" aria-live="polite">${cars.length} авто · стр. ${n} из ${totalCatPages}</p>
    </form>
    <div class="cars" id="carGrid">${slice.map((c) => carCard(c)).join('')}</div>
    <div class="more"><button class="btn btn-navy" type="button" id="catMore" hidden>Показать ещё</button></div>
    ${pager(n, totalCatPages, catHref)}
  </div>
</section>
${leadSection({ eyebrow: 'Подбор под бюджет', title: 'Не нашли нужную машину? Подберём на аукционе', text: 'Напишите марку, модель и бюджет. Пришлём до 5 актуальных лотов с Copart и IAAI и полный расчёт до Минска.' })}`;
  await out(rel, page({
    path: rel,
    // n=1: как на живом сайте (title раздела поменяли 14.10.2026)
    title: n === 1 ? 'Купить авто из США в Беларуси: цены под ключ с доставкой в Минск' : `Авто из США: каталог, страница ${n} | Amerika.by`,
    description: n === 1 ? 'Авто из Америки с доставкой и растаможкой в Минск под ключ. Подбор на аукционах Copart и IAAI, проверка истории, расчёт полной стоимости.' : `Примеры авто из США с аукционов Copart и IAAI, страница ${n} из ${totalCatPages}. Подбор, доставка и растаможка в Минске.`,
    crumbs: cr, body,
  }));
}

// 3a. Страницы марок /usa/<марка>/ и электромобили /auto-usa/elektromobily-usa/
async function listingPage({ rel, list, name, crumbsName, models = [], title, description, h1, lead, leadCar, chipsCurrent, modelLinks = [] }) {
  const body = `<div class="page-head"><div class="wrap">
  <p class="eyebrow">Каталог · ${esc(crumbsName)}</p>
  <h1>${esc(h1)}</h1>
  <p class="lead">${lead}</p>
  <div class="cta-row"><a class="btn btn-red" href="#lead">Подобрать ${esc(name)}</a><a class="btn btn-line" href="${u('kalkulyator/')}">Посчитать цену до Минска</a></div>
  ${modelLinks.length ? `<p class="model-links">Цены в Минске по годам: ${modelLinks.map((p) => `<a href="${u(p.path)}">${esc(p.card.full)} из США</a>`).join(', ')}</p>` : ''}
</div></div>
<section class="sec" style="padding-top:0">
  <div class="wrap">
    ${models.length > 1 ? `<div class="chips" id="modelChips" style="margin-bottom:20px" aria-label="Модели"><button type="button" data-model="" aria-pressed="true">Все<small>${list.length}</small></button>${models.map((m) => `<button type="button" data-model="${esc(m.slug)}" aria-pressed="false">${esc(m.name)}<small>${m.count}</small></button>`).join('')}</div>` : ''}
    <div class="cars" id="carGrid">${list.map((c) => carCard(c, { model: true })).join('')}</div>
    <div class="more"><button class="btn btn-navy" type="button" id="brandMore" hidden>Показать ещё</button></div>
  </div>
</section>
<section class="sec tight white">
  <div class="wrap">
    <h2 style="font-size:24px;margin-bottom:16px">Другие марки</h2>
    ${brandChips(chipsCurrent)}
  </div>
</section>
${leadSection({ eyebrow: 'Подбор под бюджет', title: `Подберём ${esc(name)} на аукционе США`, text: 'Напишите модель, год и бюджет. Пришлём до 5 актуальных лотов и полный расчёт до Минска.', car: leadCar })}`;
  await out(rel, page({ path: rel, title, description, crumbs: [[CAT, 'Каталог'], [rel, crumbsName]], body }));
}
for (const b of brandList) {
  const models = [...b.models.values()].sort((x, y) => y.count - x.count || x.name.localeCompare(y.name));
  const years = b.cars.map((c) => c.spec.year).filter(Boolean);
  const range = years.length ? `${Math.min(...years)}–${Math.max(...years)}` : '';
  const n = b.cars.length;
  await listingPage({
    rel: brandPath(b.slug), list: b.cars, name: b.name, crumbsName: b.name, models, chipsCurrent: b.slug,
    title: `Купить ${b.name} из США с доставкой в Минск: цены под ключ`,
    description: `${b.name} из США под ключ: ${n} ${plural(n, 'пример', 'примера', 'примеров')} лотов Copart и IAAI${range ? ` ${range} г.` : ''}. Подбор, проверка истории, доставка в Минск и растаможка.`,
    h1: `${b.name} из США с доставкой в Минск`,
    lead: `${n} ${plural(n, 'пример', 'примера', 'примеров')} ${esc(b.name)} с аукционов Copart и IAAI${range ? `, ${range} годов выпуска` : ''}. Подберём такую же машину под ваш бюджет, проверим историю и доставим в Минск под ключ.`,
    leadCar: `Ищу ${b.name}: `,
    modelLinks: modelPg.filter((p) => p.brand === b.slug),
  });
}
if (evCars.length) {
  await listingPage({
    rel: EV_PATH, list: evCars, name: 'электромобиль', crumbsName: 'Электромобили', chipsCurrent: 'ev',
    title: 'Электромобили из США: купить с доставкой в Минск, цены под ключ',
    description: `Электромобили из США под ключ: ${evCars.length} примеров с аукционов Copart и IAAI. Подбор, проверка батареи и истории, доставка в Минск, пошлина 0 в пределах квоты.`,
    h1: 'Электромобили из США',
    lead: `Примеры электромобилей с аукционов Copart и IAAI. В пределах годовой квоты электромобили ввозятся в Беларусь без пошлины: <a href="${u('blog/kvota-na-elektromobili-belarus/')}">как устроена квота</a>.`,
    leadCar: 'Ищу электромобиль: ',
  });
}

// 3b. Страницы машин /auto-usa/<slug>/
const PORT_NAME = { klaipeda: 'Клайпеду (Литва)', poti: 'Поти (Грузия)' };
for (const c of cars) {
  const rel = carPath(c.slug);
  const g = c.gallery;
  const ev = c.spec.fuel === 'электро', hybrid = c.spec.fuel === 'гибрид';
  const ccDefault = !ev && !c.spec.cc ? (defaultCc(c.model?.slug, c.spec.year) ?? 2000) : null;
  const cc = ev ? 0 : (c.spec.cc || ccDefault);
  const year = c.spec.year || new Date().getFullYear() - 4;
  const alt = ev || hybrid;
  const port = autoPortFor(false, alt, cc);
  const o = { moto: false, year, cc, alt, ev, region: 'east', port, sublot: false, benefit: false };
  const rows = EXAMPLE_PRICES.map((p) => ({ p, r: costOf(p, o) }));
  const ccText = ev ? 'электро' : `${(cc / 1000).toFixed(1).replace('.', ',')} л${hybrid ? ', гибрид' : ''}`;
  const calcQ = new URLSearchParams({ price: '10000', year: String(year), cc: String(cc) });
  if (alt) calcQ.set('fuel', 'alt');
  const calcHref = u('kalkulyator/') + '?' + calcQ.toString() + '#calc';
  const km = c.spec.mileageNum && c.spec.mileageUnit === 'миль' ? Math.round(c.spec.mileageNum * 1.609344 / 100) * 100 : null;
  const mileage = c.spec.mileageNum ? `${money(c.spec.mileageNum)} ${c.spec.mileageUnit}${km ? ` (≈ ${money(km)} км)` : ''}` : '';
  const specs = [
    ['Марка', c.brand?.name], ['Модель', c.model?.name], ['Год выпуска', c.spec.year], ['Пробег', mileage],
    ['Двигатель', ev ? 'электро' : (c.spec.cc ? ccText : `${ccText} (типичный для модели)`)],
    ['Привод', c.spec.drive], ['Коробка', c.spec.gear], ['Маршрут', `через ${PORT_NAME[port]}`],
  ].filter(([, v]) => v);
  const age = new Date().getFullYear() - year;
  const facts = [c.spec.year && `${c.spec.year} год выпуска`, ev ? 'электромобиль' : (c.spec.cc ? `двигатель ${ccText}` : null), c.spec.drive && `${c.spec.drive} привод`, c.spec.gear, mileage && `пробег ${mileage}`].filter(Boolean);
  const routeText = ev || hybrid ? `${ev ? 'Электромобили' : 'Гибриды'} обычно везём через Поти (Грузия), в обход ЕС.`
    : (port === 'klaipeda' ? 'С двигателем до 1,9 л машина может ехать через Клайпеду (Литва), это быстрее.' : 'С двигателем больше 1,9 л машины едут через Поти (Грузия): через ЕС такие сейчас не везут.');
  const dutyText = ev ? 'Пошлина 0 в пределах годовой квоты на электромобили.'
    : (age < 3 ? 'Машина младше 3 лет: пошлина считается от стоимости, но не меньше минимума за см³.' : `Машина старше 3 лет: пошлина зависит только от объёма двигателя, цена лота на неё не влияет.`);
  const related = (c.brand ? brands.get(c.brand.slug).cars : cars).filter((x) => x !== c && x.title !== c.title)
    .sort((a, b) => (b.model?.slug === c.model?.slug) - (a.model?.slug === c.model?.slug)).slice(0, 4);
  const gallery = g.length ? `<div class="gallery" id="gallery">
      <div class="main"><img src="${esc(g[0].large)}" alt="${esc(c.title)}, фото 1" width="1024" height="768" fetchpriority="high">${g.length > 1 ? `<button class="nav-btn prev" type="button" aria-label="Предыдущее фото">‹</button><button class="nav-btn next" type="button" aria-label="Следующее фото">›</button><span class="cnt">1 / ${g.length}</span>` : ''}</div>
      ${g.length > 1 ? `<div class="thumbs">${g.map((x, i) => `<button type="button" data-src="${esc(x.large)}" aria-current="${i === 0}" aria-label="Фото ${i + 1}"><img src="${esc(x.small)}" alt="${esc(c.title)}, фото ${i + 1}" loading="lazy" decoding="async" width="300" height="225"></button>`).join('')}</div>` : ''}
    </div>` : `<div class="gallery">${photoStub(c, ' big')}</div>`;
  const desc = c.uniqueText ? sanitize(c.rawContent, mapLink, { shiftHeadings: true }) : '';
  const body = `<div class="page-head" style="padding-bottom:24px"><div class="wrap">
  <h1 style="max-width:none">${esc(c.title)}</h1>
  <p class="lead">Пример авто из США с аукциона. Такую же машину подберём под ваш бюджет и доставим в Минск под ключ.</p>
</div></div>
<section class="sec" style="padding-top:0">
  <div class="wrap car-page">
    <div class="car-gal">${gallery}</div>
    <div class="car-desc">
      <div class="prose">
        <h2 style="margin-top:0">Коротко</h2>
        <p>${esc(c.title)}${facts.length ? ': ' + esc(facts.join(', ')) : ''}. Лот с американского аукциона: конкретная машина могла уже уйти с торгов, но похожую мы найдём и проверим. ${esc(routeText)}</p>
        ${(() => { const mp = modelPg.find((p) => p.brand === c.brand?.slug && p.match(c)); return mp ? `<p>Сколько стоит ${esc(mp.card.full)} из США по годам и до какой ставки выходит дешевле, чем на av.by: <a href="${u(mp.path)}">${esc(mp.card.full)} из США под ключ</a>.</p>` : ''; })()}
      </div>
      <div class="estimate">
        <h2>Сколько будет стоить в Минске <span class="tag">пример</span></h2>
        <div class="table-wrap"><table class="tbl">
          <thead><tr><th>Цена лота</th><th>Таможня</th><th>Итого в Минске</th></tr></thead>
          <tbody>${rows.map(({ p, r }) => `<tr><td>${money(p)} $</td><td>${money(r.duty + r.cust)} $</td><td><b>≈ ${money(r.total)} $</b></td></tr>`).join('')}</tbody>
        </table></div>
        <p class="note">Расчёт для ${c.spec.year ? `${year} года` : `машины ${year} года (год лота не указан, взят для примера)`}, ${ccText}${ccDefault ? ' (типичный объём для модели, уточним по лоту)' : ''}, площадка на востоке США, доставка через ${PORT_NAME[port]}. В сумме: сборы аукциона, доставка, пошлина, утильсбор, СВХ и наша услуга ${CONFIG.serviceByn} BYN. ${esc(dutyText)} Ремонт считается отдельно.</p>
        <div class="cta-row"><a class="btn btn-navy" href="${esc(calcHref)}">Посчитать точнее в калькуляторе</a></div>
      </div>
      <div class="prose">
        <h2>Что проверим перед ставкой</h2>
        <ul>
          <li>Историю по VIN в Carfax и AutoCheck: ДТП, владельцы, пробег.</li>
          <li>Все фото и отчёт аукциона: что скрыто за описанием повреждений.</li>
          <li>Стоимость ремонта вместе с партнёрским СТО в Минске, до ставки.</li>
        </ul>
        ${desc ? `<h2>Описание</h2>${desc}` : ''}
      </div>
    </div>
    <aside class="side">
      <div class="specs"><dl>${specs.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl></div>
      <div class="cta-card">
        <h2>Хочу такую же</h2>
        <p>Найдём похожий вариант на Copart и IAAI, проверим историю и посчитаем цену до Минска.</p>
        <a class="btn btn-red" href="#lead">Хочу такую же</a>
        <a class="btn btn-line" href="${esc(calcHref)}">Посчитать цену до Минска</a>
      </div>
      <p class="note-box">За машину вы платите аукциону напрямую, нам только за услугу по договору: от 590 BYN. <a href="${u('ceny/')}">Тарифы</a></p>
    </aside>
  </div>
</section>
${related.length ? `<section class="sec white">
  <div class="wrap">
    <div class="sec-head" style="margin-bottom:24px"><h2>Ещё ${esc(c.brand?.name || 'авто')} из США</h2></div>
    <div class="cars">${related.map((x) => carCard(x)).join('')}</div>
    ${c.brand ? `<div class="sec-foot"><a class="btn btn-line" href="${u(brandPath(c.brand.slug))}">Все ${esc(c.brand.name)}</a></div>` : ''}
  </div>
</section>` : ''}
${leadSection({ eyebrow: 'Хочу такую же', title: 'Подберём такую же машину на аукционе', text: 'Оставьте телефон: пришлём похожие лоты с Copart и IAAI и расчёт под ключ до Минска.', car: `Хочу такую же: ${c.title}`, button: 'Хочу такую же' })}`;
  const desc160 = `${c.title} из США под ключ: ${facts.slice(0, 2).join(', ') || 'лот с аукциона'}. Пример цены в Минске ≈ ${money(rows[1].r.total)} $ при лоте 10 000 $. Подбор и доставка по договору.`;
  await out(rel, page({
    path: rel,
    title: `${c.title}${c.titleSuffix || ''} из США под ключ в Минск | Amerika.by`,
    description: desc160,
    crumbs: [[CAT, 'Каталог'], ...(c.brand ? [[brandPath(c.brand.slug), c.brand.name]] : []), [rel, c.title]],
    ogImage: g[0]?.large, body,
    jsonld: [{
      '@context': 'https://schema.org', '@type': 'Car', name: c.title, url: SITE.origin + '/' + rel,
      description: clip(`${c.title}: ${facts.join(', ')}. Пример авто из США с аукциона.`, 300),
      ...(g.length ? { image: g.slice(0, 5).map((x) => x.large) } : {}),
      ...(c.brand ? { brand: { '@type': 'Brand', name: c.brand.name } } : {}),
      ...(c.model?.name ? { model: c.model.name } : {}),
      ...(c.spec.year ? { vehicleModelDate: String(c.spec.year) } : {}),
      ...(c.spec.mileageNum ? { mileageFromOdometer: { '@type': 'QuantitativeValue', value: c.spec.mileageNum, unitCode: c.spec.mileageUnit === 'миль' ? 'SMI' : 'KMT' } } : {}),
    }],
  }));
}

// 4. Блог
const totalBlogPages = Math.ceil(posts.length / POSTS_PER_PAGE);
const blogHref = (n) => u(n === 1 ? 'blog/' : `blog/page/${n}/`);
for (let n = 1; n <= totalBlogPages; n++) {
  const rel = n === 1 ? 'blog/' : `blog/page/${n}/`;
  const slice = posts.slice((n - 1) * POSTS_PER_PAGE, n * POSTS_PER_PAGE);
  const body = `<div class="page-head"><div class="wrap">
  <p class="eyebrow">Блог</p>
  <h1>Блог об авто из США${n > 1 ? `: страница ${n}` : ''}</h1>
  <p class="lead">Как устроены аукционы Copart и IAAI, сколько стоит растаможка, что такое salvage title и как не переплатить за доставку. Пишем по своему опыту.</p>
</div></div>
<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="posts">${slice.map((p) => postCard(p, 'h2')).join('')}</div>
    ${pager(n, totalBlogPages, blogHref).replace('id="catPager"', '')}
  </div>
</section>`;
  await out(rel, page({
    path: rel,
    title: n === 1 ? 'Блог об авто из США: аукционы, доставка, растаможка | Amerika.by' : `Блог об авто из США, страница ${n} | Amerika.by`,
    description: n === 1 ? 'Статьи об авто из США: аукционы Copart и IAAI, проверка истории, доставка в Минск, растаможка и утильсбор в Беларуси.' : `Статьи об авто из США, страница ${n} из ${totalBlogPages}: аукционы, доставка и растаможка в Беларуси.`,
    crumbs: n === 1 ? [['blog/', 'Блог']] : [['blog/', 'Блог'], [rel, `Страница ${n}`]], body,
  }));
}

const words = (s) => new Set(s.toLowerCase().replace(/ё/g, 'е').split(/[^a-zа-я0-9]+/).filter((w) => w.length > 3).map((w) => w.slice(0, 6)));
for (const p of posts) {
  const rel = `blog/${p.slug}/`;
  const content = sanitize(p.rawContent, mapLink);
  const wcount = plain(p.rawContent).split(/\s+/).length;
  const W = words(p.title + ' ' + p.slug.replace(/-/g, ' '));
  const related = posts.filter((x) => x !== p)
    .map((x) => ({ x, s: [...words(x.title + ' ' + x.slug.replace(/-/g, ' '))].filter((w) => W.has(w)).length }))
    .sort((a, b) => b.s - a.s || b.x.date.localeCompare(a.x.date)).slice(0, 3).map((r) => r.x);
  const body = `<div class="page-head" style="padding-bottom:28px"><div class="wrap">
  <div class="article-head">
    <h1>${esc(p.title)}</h1>
    <p class="article-meta" style="margin-top:14px"><time datetime="${p.date.slice(0, 10)}">${fmtDate(p.date)}</time><span>${Math.max(1, Math.round(wcount / 180))} мин чтения</span></p>
  </div>
</div></div>
${p.image ? `<div class="wrap"><div class="article-cover"><img src="${esc(p.image)}" alt="${esc(p.title)}" width="${p.imageW || 1024}" height="${p.imageH || 576}" fetchpriority="high"></div></div>` : ''}
<section class="sec">
  <div class="wrap article-body">
    <article class="prose">${content}
      <div class="cta-inline">
        <div><h2>Сколько будет стоить ваша машина в Минске?</h2><p>Лот, сборы, доставка, пошлина и наша услуга одной суммой.</p></div>
        <a class="btn btn-yellow" href="${u('kalkulyator/')}">Открыть калькулятор</a>
      </div>
    </article>
    <aside class="side">
      <div class="cta-card">
        <h2>Авто из США под ключ</h2>
        <p>Подбор на Copart и IAAI, проверка истории, доставка до Минска и растаможка по договору. Услуга от 590 BYN.</p>
        <a class="btn btn-red" href="#lead">Подобрать машину</a>
        <a class="btn btn-line" href="${u('kalkulyator/')}">Калькулятор под ключ</a>
        <a class="btn btn-line" href="${u('tamozhennyj-kalkulator/')}">Таможенный калькулятор</a>
      </div>
    </aside>
  </div>
</section>
<section class="sec white">
  <div class="wrap">
    <div class="sec-head" style="margin-bottom:24px"><h2>Читайте также</h2></div>
    <div class="posts">${related.map((x) => postCard(x)).join('')}</div>
  </div>
</section>
${leadSection()}`;
  await out(rel, page({
    path: rel,
    title: p.seoTitle,   // ≤65 знаков, без бренда; H1 полный
    description: p.description,
    crumbs: [['blog/', 'Блог'], [rel, p.title]],
    ogImage: p.image, ogType: 'article', body,
    jsonld: [{
      '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: p.description,
      datePublished: p.date, dateModified: p.modified, ...(p.image ? { image: p.image } : {}),
      mainEntityOfPage: SITE.origin + '/' + rel, inLanguage: 'ru',
      author: { '@type': 'Organization', name: 'Amerika.by', url: SITE.origin + '/' },
      publisher: ORG,
    }],
  }));
}

// 5. 404, sitemap, robots, .htaccess
await out('404.html', page({
  path: '404.html', title: 'Страница не найдена | Amerika.by', description: 'Такой страницы нет. Перейдите в каталог авто из США, к калькулятору или на главную.',
  body: `<section class="nf"><div class="wrap">
  <b>404</b>
  <h1 style="font-size:clamp(28px,4vw,40px)">Такой страницы нет</h1>
  <p class="lead" style="margin:14px auto 0">Возможно, адрес изменился. Начните с главной, каталога или калькулятора.</p>
  <div class="cta-row"><a class="btn btn-red" href="${u()}">На главную</a><a class="btn btn-line" href="${u(CAT)}">Каталог</a><a class="btn btn-line" href="${u('kalkulyator/')}">Калькулятор</a></div>
</div></section>`,
}), { sitemap: false });

const today = new Date().toISOString().slice(0, 10);
const lastmod = new Map([...cars.map((c) => [carPath(c.slug), c.modified]), ...posts.map((p) => [`blog/${p.slug}/`, p.modified])]);
await out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<!-- Для будущего запуска: адреса указывают на https://amerika.by/. Пока сайт тестовый и закрыт noindex. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${written.filter((p) => !/\/page\/\d+\/$/.test(p)).map((p) => `  <url><loc>${SITE.origin}/${p}</loc><lastmod>${(lastmod.get(p) || today).slice(0, 10)}</lastmod></url>`).join('\n')}
</urlset>
`, { sitemap: false });
// llms.txt: краткая карта сайта для ИИ-поисковиков (ChatGPT, Perplexity, Яндекс Нейро). Адреса будущие, как в sitemap.
await out('llms.txt', `# Amerika.by

> Пригон и доставка авто из США в Беларусь под ключ: подбор на аукционах Copart и IAAI, проверка истории, доставка до Минска через Клайпеду или Поти, растаможка. ООО «МирАвтоИмпорт», Минск, ул. Большое Стиклево, 83. Телефон +375 29 633-28-28.

Деньги за машину клиент платит аукциону напрямую, нам только фиксированную сумму за услугу по договору: 590, 990 или 1999 BYN (покупка вашего лота, подбор, под ключ). Скидка от 2 машин, для дилеров специальные условия. Срок от покупки до Минска обычно 40–70 дней. Машины с двигателем до 1,9 л едут через Клайпеду (Литва), остальные, гибриды и электромобили через Поти (Грузия).

## Главное
- [Калькулятор авто из США под ключ](${SITE.origin}/kalkulyator/): полная цена до Минска по цене лота, году и объёму
- [Таможенный калькулятор](${SITE.origin}/tamozhennyj-kalkulyator/): пошлина, утильсбор и сборы для физлиц
- [Цены на услуги](${SITE.origin}/ceny/)
- [Каталог примеров авто из США](${SITE.origin}/${CAT})

## Популярные модели: цена в Минске по годам
${modelPg.map((p) => `- [${p.card.full} из США под ключ](${SITE.origin}/${p.path})`).join('\n')}

## Услуги
${SERVICES.map(([p, t, d]) => `- [${t}](${SITE.origin}/${p}): ${d}`).join('\n')}

## Статьи
${posts.slice(0, 20).map((p) => `- [${p.title}](${SITE.origin}/blog/${p.slug}/)`).join('\n')}
`, { sitemap: false });
await out('prices.html', `<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0;url=${u('ceny/')}"><title>Цены</title><a href="${u('ceny/')}">Перейти к тарифам</a></html>`, {sitemap:false});
await mkdir(path.join(OUT,'api'),{recursive:true});
await copyFile(path.join(ROOT,'static','api','lead.php'),path.join(OUT,'api','lead.php'));
await out('robots.txt', `# Тестовая версия сайта: индексация закрыта\nUser-agent: *\nDisallow: /\n`, { sitemap: false });
await out('.htaccess', `# Тестовая версия: отключаем правила WordPress внутри этой папки и отдаём свою 404.
# При переносе в корень сайта этот файл НЕ копировать поверх .htaccess WordPress.
RewriteEngine Off
DirectoryIndex index.html
ErrorDocument 404 ${BASE}404.html
<IfModule mod_headers.c>
  Header set X-Robots-Tag "noindex, nofollow"
</IfModule>
`, { sitemap: false });

// 6. Карта 301 для переезда на amerika.by: site/redirects.htaccess (только файл, в new2/ не подключается)
{
  let oldUrls = [];
  try { oldUrls = await fetchOldSitemap(opt); } catch (e) { console.warn('  карта старого сайта недоступна:', e.message); }
  const newPaths = new Set(['', ...written]);
  const rules = [];
  const add = (from, to, why) => rules.push({ from, to, why });
  const seen = new Set();
  for (const url of oldUrls) {
    const p = url.replace(/^https?:\/\/(www\.)?amerika\.by\/?/, '');
    if (seen.has(p)) continue; seen.add(p);
    if (newPaths.has(p)) continue; // адрес сохранён
    const seg = p.split('/').filter(Boolean);
    let to = null, why = '';
    if (seg[0] === 'usa' && seg[1]) { to = brands.has(seg[1]) ? brandPath(seg[1]) + (seg[2] && brands.get(seg[1]).models.has(seg[2]) ? `?model=${seg[2]}` : '') : CAT; why = 'страница модели → страница марки'; }
    else if (seg[0] === 'auto-usa' && seg[1]) { to = CAT; why = 'машины нет в каталоге'; }
    else if (seg[0] === 'situation') { to = CAT; why = 'фильтр по статусу'; }
    else if (/^auto-(europe|canada|china)$/.test(seg[0]) || /^(europe|canada|china)$/.test(seg[0])) {
      const brand = seg[0].startsWith('auto-') ? null : seg[1];
      if (/elektromobily/.test(p)) { to = EV_PATH; why = 'электромобили не из США → электромобили из США'; }
      else if (brand && brands.has(brand)) { to = brandPath(brand); why = 'марка не из США → та же марка из США'; }
      else if (seg[1] && /^auto-/.test(seg[0])) {
        const b = brandList.find((x) => seg[1].startsWith(x.slug + '-') || seg[1].startsWith(x.name.toLowerCase().replace(/\s+/g, '-') + '-'));
        to = b ? brandPath(b.slug) : CAT; why = 'машина не из США → марка или каталог США';
      } else { to = CAT; why = 'раздел не из США → каталог США'; }
    } else if (seg[0] in SIMPLE) { to = SIMPLE[seg[0]]; why = 'страница переименована'; }
    else if (seg[0] === 'blog' && seg[1]) { to = 'blog/'; why = 'статьи нет'; }
    else if (seg[0] === 'uslugi') { to = seg[1] && SERVICE_SLUGS.has(seg[1]) ? `uslugi/${seg[1]}/` : 'uslugi/'; why = 'услуга'; }
    else if (seg[0] === 'instagram' || seg[0] === 'sitemap') { to = ''; why = 'служебная страница'; }
    else if (seg[0] === 'vakansii') { to = 'o-kompanii/'; why = 'вакансий нет на новом сайте'; }
    else if (seg[0] === 'faqs') { to = '#faq'; why = 'вопросы на главной'; }
    else { to = ''; why = 'нет аналога'; }
    add(p, to, why);
  }
  // Известные адреса, которых нет в карте сайта
  for (const [from, to, why] of [['o-nas/', 'o-kompanii/', 'страница переименована'], ['faqs/', '#faq', 'вопросы на главной'], ['instagram/', '', 'служебная страница'],
    ['calc/', 'kalkulyator/', 'старый калькулятор'], ['kalculyator-dostavki/', 'kalkulyator/', 'старый калькулятор'], ['kalkuljator-dostavki-rb/', 'kalkulyator/', 'старый калькулятор'],
    ['auctions/', CAT, 'тестовый каталог'], ['vakansii/', 'o-kompanii/', 'вакансий нет'], ['sitemap/', '', 'служебная страница']]) {
    if (!seen.has(from) && !newPaths.has(from)) { seen.add(from); add(from, to, why); }
  }
  const esc301 = (s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  const lines = rules.sort((a, b) => a.from.localeCompare(b.from)).map((r) => {
    const target = '/' + r.to;
    return `RewriteRule ^${esc301(r.from.replace(/\/$/, ''))}/?$ ${target} [R=301,L,NE]`;
  });
  const generic = `# Всё, что не попало в список выше
${modelPg.length ? `RewriteCond %{REQUEST_URI} !^/(${modelPg.map((p) => p.path.replace(/\/$/, '').replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('|')})/?$
` : ''}RewriteRule ^usa/([^/]+)/[^/]+/?$ /usa/$1/ [R=301,L]
RewriteRule ^(europe|canada|china)/.*$ /${CAT} [R=301,L]
RewriteRule ^auto-(europe|canada|china)(/.*)?$ /${CAT} [R=301,L]
RewriteRule ^situation/.*$ /${CAT} [R=301,L]`;
  const file = `# 301-редиректы со старого WordPress на новый сайт (для переезда в корень amerika.by).
# Сгенерировано ${today} скриптом site/build.mjs из XML-карт старого сайта (${oldUrls.length} адресов).
# В new2/ НЕ подключается. При переезде вставить в .htaccess корня ПЕРЕД правилами сайта.
# Адреса, которые на новом сайте сохранены (каталог /auto-usa/, марки /usa/<марка>/, блог, услуги, цены,
# контакты, отзывы, таможенный калькулятор, политика), здесь не перечислены: они открываются как есть.
# Всего правил: ${lines.length}.
<IfModule mod_rewrite.c>
RewriteEngine On
${rules.sort((a, b) => a.from.localeCompare(b.from)).map((r, i) => `# ${r.why}\n${lines[i]}`).join('\n')}

${generic}
</IfModule>
`;
  await writeFile(path.join(ROOT, 'redirects.htaccess'), file);
  console.log(`  redirects.htaccess: ${lines.length} правил из ${oldUrls.length} старых адресов`);
}

// ---------- Итог ----------
async function dirSize(d) {
  let s = 0, n = 0;
  for (const e of await readdir(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { const r = await dirSize(p); s += r.s; n += r.n; } else { s += (await stat(p)).size; n++; }
  }
  return { s, n };
}
const { s, n } = await dirSize(OUT);
console.log(`готово: ${written.length} страниц в sitemap, ${n} файлов, ${(s / 1048576).toFixed(1)} МБ → ${OUT}`);
console.log(`  машин ${cars.length} (без фото ${cars.filter((c) => !c.gallery.length).length}, с уникальным описанием ${cars.filter((c) => c.uniqueText).length}), марок ${brandList.length}, электро ${evCars.length}, стр. каталога ${totalCatPages}, статей ${posts.length}, стр. блога ${totalBlogPages}`);
