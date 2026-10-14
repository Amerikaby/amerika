#!/usr/bin/env node
// Генератор статического сайта amerika.by (тестовая версия в /new2/).
// Запуск: node site/build.mjs            — сборка из кеша (site/cache/), при отсутствии кеша скачивает данные
//         node site/build.mjs --refresh  — заново скачать всё из WordPress REST API
//         BASE=/ node site/build.mjs     — собрать для корня домена (например, new.amerika.by)
//         OUT=/path/to/dir               — куда писать (по умолчанию new2/ рядом с site/)
import { readFile, writeFile, mkdir, rm, copyFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchAll } from './fetch.mjs';
import { esc, decode, plain, clip, sanitize } from './lib/html.mjs';
import { makeLayout, SITE, SERVICES, ICONS } from './partials.mjs';
import { homeBody } from './pages/home.mjs';
import { staticPages } from './pages/static.mjs';

// ---------- Настройки ----------
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(ROOT, '..');
/** Единственная константа адреса: все внутренние ссылки строятся от неё. */
const BASE = normalizeBase(process.env.BASE ?? '/new2/');
const OUT = path.resolve(process.env.OUT || path.join(REPO, 'new2'));
const CACHE = path.join(ROOT, 'cache');
const REFRESH = process.argv.includes('--refresh');
const CARS_PER_PAGE = 36;
const POSTS_PER_PAGE = 12;

function normalizeBase(b) {
  b = '/' + String(b).replace(/^\/+|\/+$/g, '');
  return b === '/' ? '/' : b + '/';
}

const L = makeLayout(BASE);
const { u, page, leadSection, pager } = L;
const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const fmtDate = (iso) => { const d = new Date(iso); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };

const written = [];   // пути страниц для sitemap
async function out(rel, html, { sitemap = true } = {}) {
  // rel: '' | 'katalog/' | '404.html'
  const file = rel.endsWith('.html') || rel.endsWith('.xml') || rel.endsWith('.json') || rel.endsWith('.txt') || rel === '.htaccess'
    ? path.join(OUT, rel) : path.join(OUT, rel, 'index.html');
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, html);
  if (sitemap && !rel.includes('.')) written.push(rel);
}

// ---------- Данные ----------
console.log(`BASE=${BASE}  OUT=${OUT}`);
const opt = { cacheDir: CACHE, refresh: REFRESH };
const [rawCars, rawBlog, terms] = await Promise.all([fetchAll('auto-usa', opt), fetchAll('blog', opt), fetchAll('marka_usa', opt)]);
console.log(`данные: машин ${rawCars.length}, статей ${rawBlog.length}, терминов марок ${terms.length}`);

const termById = new Map(terms.map((t) => [t.id, t]));
const brandName = (t) => decode(t.name).trim();

// Галерея: размеры WP → большие и маленькие картинки
function imgSizes(g) {
  const s = g.media_details?.sizes || {};
  const pick = (...keys) => keys.map((k) => s[k]?.source_url).find(Boolean);
  return {
    large: pick('large', 'medium_large') || g.full_image_url || g.url,
    card: pick('medium_large', 'large') || g.full_image_url || g.url,
    small: pick('medium', 'medium_large') || g.thumbnail_image_url || g.full_image_url || g.url,
    w: s.medium?.width, h: s.medium?.height,
  };
}

function parseSpecs(title, text) {
  const spec = {};
  const y = /\b(19[89]\d|20[0-3]\d)\b(?!.*\b(19[89]\d|20[0-3]\d)\b)/.exec(title);
  if (y) spec.year = +y[1];
  const first = text.slice(0, 900);
  const mil = /проб[её]г[а-я]*\s*(?:составляет\s*|около\s*)?(\d[\d\s ]{0,8}\d)\s*(миль|мил|км)/i.exec(first) || /(\d[\d\s ]{0,8}\d)\s*(миль)/i.exec(first);
  if (mil) spec.mileage = `${mil[1].replace(/[\s ]+/g, ' ').trim()} ${mil[2].startsWith('мил') ? 'миль' : 'км'}`;
  const eng = /двигател[а-я]*\s*(?:объ[её]мом\s*)?(\d[.,]\d)\s*(?:л|литр|t\b|т\b)?/i.exec(text) || /\b(\d[.,]\d)\s*(?:л\b|литр|T\b)/.exec(title + ' ' + first);
  if (eng) { const v = parseFloat(eng[1].replace(',', '.')); if (v >= 0.6 && v <= 8) spec.cc = Math.round(v * 1000 / 100) * 100; }
  if (/(полн[а-я]+ привод|AWD|4WD|4x4)/i.test(title + ' ' + first)) spec.drive = 'полный';
  else if (/передн[а-я]+ привод|FWD/i.test(title + ' ' + first)) spec.drive = 'передний';
  else if (/задн[а-я]+ привод|RWD/i.test(title + ' ' + first)) spec.drive = 'задний';
  if (/автоматическ[а-я]+ короб|АКПП|вариатор/i.test(first)) spec.gear = /вариатор/i.test(first) ? 'вариатор' : 'автомат';
  else if (/механическ[а-я]+ короб/i.test(first)) spec.gear = 'механика';
  if (/электромобил|электрическ[а-я]+ (?:силов|двигател|мотор)| EV\b/i.test(title + ' ' + first.slice(0, 300))) spec.fuel = 'электро';
  else if (/гибрид|hybrid/i.test(title + ' ' + first.slice(0, 300))) spec.fuel = 'гибрид';
  return spec;
}

const cars = rawCars.map((x) => {
  const title = decode(x.title.rendered).replace(/\s+/g, ' ').trim();
  const t = (x.marka_usa || []).map((id) => termById.get(id)).filter(Boolean);
  const brandT = t.find((z) => !z.parent) || (t[0] && termById.get(t[0].parent));
  const modelT = t.find((z) => z.parent);
  const gallery = (x.acf?.photo_gallery?.gallery || []).flat().filter((g) => g && (g.full_image_url || g.url)).map(imgSizes);
  if (!gallery.length && x.yoast_head_json?.og_image?.[0]?.url) { const og = x.yoast_head_json.og_image[0].url; gallery.push({ large: og, card: og, small: og }); }
  const text = plain(x.content.rendered);
  return {
    id: x.id, slug: x.slug, title, date: x.date, modified: x.modified,
    brand: brandT ? { slug: brandT.slug, name: brandName(brandT) } : null,
    model: modelT ? { slug: modelT.slug, name: brandName(modelT) } : null,
    gallery, rawContent: x.content.rendered, text,
    spec: parseSpecs(title, text),
    sold: (x.situation || []).includes(1587),
  };
}).sort((a, b) => b.date.localeCompare(a.date));
const carBySlug = new Map(cars.map((c) => [c.slug, c]));

const brands = new Map();
for (const c of cars) {
  if (!c.brand) continue;
  if (!brands.has(c.brand.slug)) brands.set(c.brand.slug, { ...c.brand, cars: [], models: new Map() });
  const b = brands.get(c.brand.slug);
  b.cars.push(c);
  if (c.model) { const m = b.models.get(c.model.slug) || { ...c.model, count: 0 }; m.count++; b.models.set(c.model.slug, m); }
}
const brandList = [...brands.values()].sort((a, b) => b.cars.length - a.cars.length || a.name.localeCompare(b.name));

const posts = rawBlog.map((x) => {
  const title = decode(x.title.rendered).trim();
  const y = x.yoast_head_json || {};
  return {
    slug: x.slug, title, date: x.date, modified: x.modified,
    seoTitle: decode(y.title || title).replace(/\s*[|–-]\s*AMERIKA\.BY.*$/i, '').trim(),
    description: decode(y.description || '') || clip(plain(x.excerpt?.rendered || x.content.rendered), 160),
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
  'tamozhennyj-kalkulator': 'tamozhennyj-kalkulyator/', 'tamozhennyj-kalkulyator': 'tamozhennyj-kalkulyator/', faqs: '', auctions: 'katalog/' };
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
    case 'auto-usa': return { href: u(seg[1] && carBySlug.has(seg[1]) ? `katalog/${seg[1]}/` : 'katalog/') };
    case 'usa': {
      if (seg[1] && brands.has(seg[1])) {
        const b = brands.get(seg[1]);
        return { href: u(`katalog/${seg[1]}/`) + (seg[2] && b.models.has(seg[2]) ? `?model=${encodeURIComponent(seg[2])}` : '') };
      }
      return { href: u('katalog/') };
    }
    case 'blog': return { href: u(seg[1] && postBySlug.has(seg[1]) ? `blog/${seg[1]}/` : 'blog/') };
    case 'uslugi': return { href: u(seg[1] && SERVICE_SLUGS.has(seg[1]) ? `uslugi/${seg[1]}/` : 'uslugi/') };
    default: return null; // Европа, Канада, Китай и прочее: оставляем текст без ссылки (сайт про США)
  }
}

// ---------- Карточки ----------
function carCard(c, { model = false } = {}) {
  const g = c.gallery[0];
  const img = g ? `<img src="${esc(g.small)}" srcset="${esc(g.small)} 300w, ${esc(g.card)} 768w" sizes="(max-width:560px) 50vw, 300px" alt="${esc(c.title)}" loading="lazy" decoding="async" width="300" height="225">` : '';
  return `<a class="car" href="${u(`katalog/${c.slug}/`)}"${model ? ` data-model="${esc(c.model?.slug || '')}"` : ''}><div class="ph">${img}</div><div class="tx"><h3>${esc(c.title)}</h3><div class="meta">${c.spec.year ? `<b>${c.spec.year}</b>` : ''}<span>${esc(c.brand?.name || '')}</span></div></div></a>`;
}
function postCard(p, h = 'h3') {
  return `<a class="post" href="${u(`blog/${p.slug}/`)}"><div class="ph">${p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy" decoding="async" width="${p.imageW || 1024}" height="${p.imageH || 576}">` : ''}</div><div class="tx"><time datetime="${p.date.slice(0, 10)}">${fmtDate(p.date)}</time><${h}>${esc(p.title)}</${h}><p>${esc(p.excerpt)}</p></div></a>`;
}
const brandChips = (current) => `<div class="chips">${brandList.map((b) => `<a href="${u(`katalog/${b.slug}/`)}"${b.slug === current ? ' class="on" aria-current="page"' : ''}>${esc(b.name)}<small>${b.cars.length}</small></a>`).join('')}</div>`;

// ---------- Сборка ----------
if (existsSync(OUT)) await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

// Ассеты
await mkdir(path.join(OUT, 'assets'), { recursive: true });
const configSrc = await readFile(path.join(ROOT, 'assets', 'config.js'), 'utf8');
const CONFIG = new Function(configSrc + '\nreturn CONFIG;')();
await writeFile(path.join(OUT, 'assets', 'site.js'), configSrc + '\n' + await readFile(path.join(ROOT, 'assets', 'site.js'), 'utf8'));
await copyFile(path.join(ROOT, 'assets', 'site.css'), path.join(OUT, 'assets', 'site.css'));
await mkdir(path.join(OUT, 'img'), { recursive: true });
for (const f of await readdir(path.join(REPO, 'new', 'img'))) {
  if (/\.(svg|jpe?g|png|webp)$/i.test(f)) await copyFile(path.join(REPO, 'new', 'img', f), path.join(OUT, 'img', f));
}
await out('assets/cars.json', JSON.stringify(cars.map((c) => ({ s: c.slug, t: c.title, y: c.spec.year || null, b: c.brand?.slug || '', bn: c.brand?.name || '', i: c.gallery[0]?.small || '' }))), { sitemap: false });

// Общий контекст для статичных страниц
const ctx = { u, esc, SITE, SERVICES, ICONS, CONFIG, leadSection, carCard, postCard, cars, posts, brandList, fmtDate };

// 1. Главная
{
  const extra = `<section class="white" id="services">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow">Услуги</p>
      <h2>Что мы делаем, кроме подбора</h2>
      <p>Можно заказать всё под ключ или только нужную часть: проверку лота, растаможку, доставку мотоцикла.</p>
    </div>
    <div class="svc">${SERVICES.map(([p, t, d, ic], i) => `<a href="${u(p)}"${i === 0 ? ' class="main"' : ''}><span class="ico" aria-hidden="true">${ICONS[ic]}</span><h3>${t}</h3><p>${d}</p><span class="go">Подробнее →</span></a>`).join('')}</div>
  </div>
</section>

<section id="catalog">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow">Каталог</p>
      <h2>Примеры авто из США</h2>
      <p>Лоты с Copart и IAAI, которые можно заказать с доставкой в Минск. Похожую машину подберём под ваш бюджет.</p>
    </div>
    <div class="cars six">${cars.slice(0, 6).map((c) => carCard(c)).join('')}</div>
    <div class="sec-foot"><a class="btn btn-navy" href="${u('katalog/')}">Весь каталог: ${cars.length} авто</a></div>
  </div>
</section>

<section class="white" id="blog">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow">Блог</p>
      <h2>Разбираемся в аукционах, таможне и доставке</h2>
    </div>
    <div class="posts">${posts.slice(0, 3).map((p) => postCard(p)).join('')}</div>
    <div class="sec-foot"><a class="btn btn-line" href="${u('blog/')}">Все статьи</a></div>
  </div>
</section>`;
  const body = homeBody({ u, extra }) + leadSection();
  const faq = [...body.matchAll(/<details[^>]*><summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)]
    .map((m) => ({ '@type': 'Question', name: plain(m[1]), acceptedAnswer: { '@type': 'Answer', text: plain(m[2]) } }));
  await out('', page({
    path: '',
    title: 'Авто из США под ключ: доставка и пригон в Беларусь | Amerika.by',
    description: 'Авто из США в Беларусь под ключ: подбор на Copart и IAAI, проверка истории, доставка до Минска и растаможка. Работаем по договору, за авто платите аукциону напрямую. Калькулятор полной стоимости, услуга от 599 BYN.',
    body,
    ogImage: SITE.origin + '/img/nissan-rogue.jpg',
    jsonld: [
      { '@context': 'https://schema.org', '@type': 'AutomotiveBusiness', name: 'Amerika.by', legalName: SITE.company, url: SITE.origin + '/', logo: SITE.origin + '/img/logo.svg', telephone: '+375296332828', email: SITE.email,
        address: { '@type': 'PostalAddress', streetAddress: SITE.address, addressLocality: 'Минск', addressCountry: 'BY' },
        openingHours: 'Mo-Fr 10:00-19:00', areaServed: 'BY', sameAs: [SITE.instagram, SITE.tg, SITE.yandexOrg] },
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq },
    ],
  }));
}

// 2. Статичные страницы (калькуляторы, услуги, цены, о компании, контакты, отзывы)
for (const p of staticPages(ctx)) await out(p.path, page(p));

// 3. Каталог
const catalogIntro = `<p class="lead">Лоты с аукционов Copart и IAAI, которые можно заказать с доставкой в Минск. Это примеры: конкретная машина могла уже уйти с торгов, но похожую мы подберём под ваш бюджет. На аукционах каждый день появляются тысячи новых лотов.</p>`;
const totalCatPages = Math.ceil(cars.length / CARS_PER_PAGE);
const catHref = (n) => u(n === 1 ? 'katalog/' : `katalog/page/${n}/`);
for (let n = 1; n <= totalCatPages; n++) {
  const slice = cars.slice((n - 1) * CARS_PER_PAGE, n * CARS_PER_PAGE);
  const rel = n === 1 ? 'katalog/' : `katalog/page/${n}/`;
  const cr = n === 1 ? [['katalog/', 'Каталог']] : [['katalog/', 'Каталог'], [rel, `Страница ${n}`]];
  const body = `<div class="page-head"><div class="wrap">
  <p class="eyebrow">Каталог</p>
  <h1>Примеры авто из США${n > 1 ? `: страница ${n}` : ''}</h1>
  ${catalogIntro}
</div></div>
<section class="sec tight" style="padding-top:0">
  <div class="wrap">
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
    title: n === 1 ? 'Авто из США: примеры лотов Copart и IAAI с доставкой в Минск | Amerika.by' : `Авто из США: каталог, страница ${n} | Amerika.by`,
    description: n === 1 ? `Примеры авто из США с аукционов Copart и IAAI: ${cars.length} машин ${brandList.length} марок. Подберём такую же под ваш бюджет и доставим в Минск под ключ по договору.` : `Каталог примеров авто из США с аукционов Copart и IAAI, страница ${n} из ${totalCatPages}.`,
    crumbs: cr, body,
  }));
}

// 3a. Страницы марок
for (const b of brandList) {
  const rel = `katalog/${b.slug}/`;
  const models = [...b.models.values()].sort((x, y) => y.count - x.count || x.name.localeCompare(y.name));
  const years = b.cars.map((c) => c.spec.year).filter(Boolean);
  const range = years.length ? `${Math.min(...years)}–${Math.max(...years)}` : '';
  const body = `<div class="page-head"><div class="wrap">
  <p class="eyebrow">Каталог · ${esc(b.name)}</p>
  <h1>${esc(b.name)} из США</h1>
  <p class="lead">${b.cars.length} ${plural(b.cars.length, 'пример', 'примера', 'примеров')} ${esc(b.name)} с аукционов Copart и IAAI${range ? `, ${range} годов выпуска` : ''}. Подберём такую же машину под ваш бюджет, проверим историю и доставим в Минск под ключ.</p>
  <div class="cta-row"><a class="btn btn-red" href="#lead">Подобрать ${esc(b.name)}</a><a class="btn btn-line" href="${u('kalkulyator/')}">Посчитать цену до Минска</a></div>
</div></div>
<section class="sec" style="padding-top:0">
  <div class="wrap">
    ${models.length > 1 ? `<div class="chips" id="modelChips" style="margin-bottom:20px" aria-label="Модели"><button type="button" data-model="" aria-pressed="true">Все<small>${b.cars.length}</small></button>${models.map((m) => `<button type="button" data-model="${esc(m.slug)}" aria-pressed="false">${esc(m.name)}<small>${m.count}</small></button>`).join('')}</div>` : ''}
    <div class="cars" id="carGrid">${b.cars.map((c) => carCard(c, { model: true })).join('')}</div>
    <div class="more"><button class="btn btn-navy" type="button" id="brandMore" hidden>Показать ещё</button></div>
  </div>
</section>
<section class="sec tight white">
  <div class="wrap">
    <h2 style="font-size:24px;margin-bottom:16px">Другие марки</h2>
    ${brandChips(b.slug)}
  </div>
</section>
${leadSection({ eyebrow: 'Подбор под бюджет', title: `Подберём ${esc(b.name)} на аукционе США`, text: 'Напишите модель, год и бюджет. Пришлём до 5 актуальных лотов и полный расчёт до Минска.', car: `Ищу ${b.name}: ` })}`;
  await out(rel, page({
    path: rel,
    title: `${b.name} из США: примеры с аукционов и доставка в Минск | Amerika.by`,
    description: `${b.name} из США под ключ: ${b.cars.length} ${plural(b.cars.length, 'пример', 'примера', 'примеров')} лотов с Copart и IAAI${range ? ` (${range})` : ''}. Подбор, проверка истории, доставка в Минск и растаможка по договору.`,
    crumbs: [['katalog/', 'Каталог'], [rel, b.name]], body,
  }));
}

// 3b. Страницы машин
for (const c of cars) {
  const rel = `katalog/${c.slug}/`;
  const content = sanitize(c.rawContent, mapLink, { shiftHeadings: true });
  const g = c.gallery;
  const calcQ = new URLSearchParams();
  if (c.spec.year) calcQ.set('year', c.spec.year);
  if (c.spec.fuel === 'электро') { calcQ.set('fuel', 'alt'); calcQ.set('cc', '0'); }
  else { if (c.spec.cc) calcQ.set('cc', c.spec.cc); if (c.spec.fuel === 'гибрид') calcQ.set('fuel', 'alt'); }
  const calcHref = u('kalkulyator/') + (calcQ.toString() ? '?' + calcQ.toString() : '') + '#calc';
  const specs = [
    ['Марка', c.brand?.name], ['Модель', c.model?.name], ['Год выпуска', c.spec.year], ['Пробег', c.spec.mileage],
    ['Двигатель', c.spec.fuel === 'электро' ? 'электро' : (c.spec.cc ? `${(c.spec.cc / 1000).toFixed(1).replace('.', ',')} л` : '') + (c.spec.fuel === 'гибрид' ? ' гибрид' : '')],
    ['Привод', c.spec.drive], ['Коробка', c.spec.gear], ['Откуда', 'аукцион США'],
  ].filter(([, v]) => v);
  const related = (c.brand ? brands.get(c.brand.slug).cars : cars).filter((x) => x !== c).slice(0, 4);
  const gallery = g.length ? `<div class="gallery" id="gallery">
      <div class="main"><img src="${esc(g[0].large)}" alt="${esc(c.title)}, фото 1" width="1024" height="768" fetchpriority="high">${g.length > 1 ? `<button class="nav-btn prev" type="button" aria-label="Предыдущее фото">‹</button><button class="nav-btn next" type="button" aria-label="Следующее фото">›</button><span class="cnt">1 / ${g.length}</span>` : ''}</div>
      ${g.length > 1 ? `<div class="thumbs">${g.map((x, i) => `<button type="button" data-src="${esc(x.large)}" aria-current="${i === 0}" aria-label="Фото ${i + 1}"><img src="${esc(x.small)}" alt="${esc(c.title)}, фото ${i + 1}" loading="lazy" decoding="async" width="300" height="225"></button>`).join('')}</div>` : ''}
    </div>` : '';
  const body = `<div class="page-head" style="padding-bottom:24px"><div class="wrap">
  <h1 style="max-width:none">${esc(c.title)}</h1>
  <p class="lead">Пример авто из США с аукциона. Такую же машину подберём под ваш бюджет и доставим в Минск под ключ.</p>
</div></div>
<section class="sec" style="padding-top:0">
  <div class="wrap car-page">
    <div class="car-gal">${gallery}</div>
    <div class="prose car-desc">${content}</div>
    <aside class="side">
      <div class="specs"><dl>${specs.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl></div>
      <div class="cta-card">
        <h2>Хочу такую же</h2>
        <p>Это пример лота: он мог уже уйти с торгов. Найдём похожий вариант, проверим историю и посчитаем цену до Минска.</p>
        <a class="btn btn-red" href="#lead">Хочу такую же</a>
        <a class="btn btn-line" href="${esc(calcHref)}">Посчитать цену до Минска</a>
      </div>
      <p class="note-box">За машину вы платите аукциону напрямую, нам только за услугу по договору: от 599 BYN. <a href="${u('ceny/')}">Тарифы</a></p>
    </aside>
  </div>
</section>
${related.length ? `<section class="sec white">
  <div class="wrap">
    <div class="sec-head" style="margin-bottom:24px"><h2>Ещё ${esc(c.brand?.name || 'авто')} из США</h2></div>
    <div class="cars">${related.map((x) => carCard(x)).join('')}</div>
    ${c.brand ? `<div class="sec-foot"><a class="btn btn-line" href="${u(`katalog/${c.brand.slug}/`)}">Все ${esc(c.brand.name)}</a></div>` : ''}
  </div>
</section>` : ''}
${leadSection({ eyebrow: 'Хочу такую же', title: 'Подберём такую же машину на аукционе', text: 'Оставьте телефон: пришлём похожие лоты с Copart и IAAI и расчёт под ключ до Минска.', car: `Хочу такую же: ${c.title}`, button: 'Хочу такую же' })}`;
  const desc = clip(`${c.title} из США: пример лота с аукциона${c.spec.mileage ? `, пробег ${c.spec.mileage}` : ''}. Подберём такую же машину, проверим историю и доставим в Минск под ключ.`, 200);
  await out(rel, page({
    path: rel,
    title: `${c.title} из США под ключ в Минск | Amerika.by`,
    description: desc,
    crumbs: [['katalog/', 'Каталог'], ...(c.brand ? [[`katalog/${c.brand.slug}/`, c.brand.name]] : []), [rel, c.title]],
    ogImage: g[0]?.large, body,
    jsonld: [{
      '@context': 'https://schema.org', '@type': 'Car', name: c.title, url: SITE.origin + '/' + rel,
      description: clip(c.text, 300), image: g.slice(0, 5).map((x) => x.large),
      ...(c.brand ? { brand: { '@type': 'Brand', name: c.brand.name } } : {}),
      ...(c.model ? { model: c.model.name } : {}),
      ...(c.spec.year ? { vehicleModelDate: String(c.spec.year) } : {}),
      ...(c.spec.mileage && /миль/.test(c.spec.mileage) ? { mileageFromOdometer: { '@type': 'QuantitativeValue', value: +c.spec.mileage.replace(/\D/g, ''), unitCode: 'SMI' } } : {}),
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
    description: n === 1 ? 'Статьи об авто из США: аукционы Copart и IAAI, проверка истории, доставка в Минск, растаможка и утильсбор в Беларуси.' : `Статьи об авто из США, страница ${n} из ${totalBlogPages}.`,
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
        <p>Подбор на Copart и IAAI, проверка истории, доставка до Минска и растаможка по договору. Услуга от 599 BYN.</p>
        <a class="btn btn-red" href="#lead">Подобрать машину</a>
        <a class="btn btn-line" href="${u('kalkulyator/')}">Калькулятор под ключ</a>
        <a class="btn btn-line" href="${u('tamozhennyj-kalkulyator/')}">Таможенный калькулятор</a>
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
    title: `${p.seoTitle} | Amerika.by`,
    description: p.description,
    crumbs: [['blog/', 'Блог'], [rel, p.title]],
    ogImage: p.image, ogType: 'article', body,
    jsonld: [{
      '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: p.description,
      datePublished: p.date, dateModified: p.modified, ...(p.image ? { image: p.image } : {}),
      mainEntityOfPage: SITE.origin + '/' + rel, inLanguage: 'ru',
      author: { '@type': 'Organization', name: 'Amerika.by', url: SITE.origin + '/' },
      publisher: { '@type': 'Organization', name: 'Amerika.by', logo: { '@type': 'ImageObject', url: SITE.origin + '/img/logo.svg' } },
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
  <div class="cta-row"><a class="btn btn-red" href="${u()}">На главную</a><a class="btn btn-line" href="${u('katalog/')}">Каталог</a><a class="btn btn-line" href="${u('kalkulyator/')}">Калькулятор</a></div>
</div></section>`,
}), { sitemap: false });

const today = new Date().toISOString().slice(0, 10);
const lastmod = new Map([...cars.map((c) => [`katalog/${c.slug}/`, c.modified]), ...posts.map((p) => [`blog/${p.slug}/`, p.modified])]);
await out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<!-- Для будущего запуска: адреса указывают на https://amerika.by/. Пока сайт тестовый и закрыт noindex. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${written.filter((p) => !/\/page\/\d+\/$/.test(p)).map((p) => `  <url><loc>${SITE.origin}/${p}</loc><lastmod>${(lastmod.get(p) || today).slice(0, 10)}</lastmod></url>`).join('\n')}
</urlset>
`, { sitemap: false });
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
console.log(`  машин ${cars.length}, марок ${brandList.length}, стр. каталога ${totalCatPages}, статей ${posts.length}, стр. блога ${totalBlogPages}`);

function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  return m10 === 1 && m100 !== 11 ? one : (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? few : many);
}
