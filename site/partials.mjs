// Общие части страниц: <head>, шапка, меню, подвал, хлебные крошки, формы, карточки.
import { esc, clip } from './lib/html.mjs';

export const SITE = {
  name: 'Amerika.by',
  origin: 'https://amerika.by',   // будущий адрес: canonical и sitemap смотрят сюда
  phone: '+375 (29) 633-28-28',
  phoneHref: 'tel:+375296332828',
  tg: 'https://t.me/amerikaa_by',
  viber: 'viber://chat?number=%2B375296332828',
  wa: 'https://wa.me/375296332828',
  instagram: 'https://www.instagram.com/amerika.by/',
  email: 'info@amerika.by',
  address: 'ул. Большое Стиклево, 83, 3 этаж',
  city: 'Минск',
  hours: 'Пн–Пт 10:00–19:00',
  company: 'ООО «МирАвтоИмпорт»',
  unp: '692205841',
  yandexOrg: 'https://yandex.by/maps/org/amerika_bay/195163310146/',
  yandexReviews: 'https://yandex.by/maps/org/amerika_bay/195163310146/reviews/',
  yandexSearch: 'https://yandex.by/maps/?text=' + encodeURIComponent('Минск, ул. Большое Стиклево, 83'),
};

export const NAV = [
  ['auto-usa/', 'Каталог'],
  ['kalkulyator/', 'Калькулятор'],
  ['uslugi/', 'Услуги'],
  ['ceny/', 'Цены'],
  ['o-kompanii/', 'О компании'],
  ['kontakty/', 'Контакты'],
];

export const SERVICES = [
  ['uslugi/podbor-avto-na-aukcione/', 'Подбор авто на аукционе', 'Ищем машину на Copart и IAAI под бюджет, проверяем и ведём торги.', 'search'],
  ['uslugi/proverka-istorii-po-bazam/', 'Проверка истории по базам', 'Carfax и AutoCheck по VIN: ДТП, владельцы, пробег до ставки.', 'doc'],
  ['uslugi/rastamozhka-avtomobiley/', 'Растаможка автомобилей', 'Считаем платежи заранее, помогаем с декларантом и СВХ в Минске.', 'stamp'],
  ['uslugi/otslezhivanie-konteinerov/', 'Отслеживание контейнеров', 'Где сейчас машина: по VIN после погрузки в контейнер.', 'ship'],
  ['uslugi/dostavka-mototehniki/', 'Доставка мототехники', 'Мотоциклы, квадроциклы и гидроциклы с аукционов США.', 'moto'],
  ['uslugi/dostavka-zapchastey/', 'Доставка запчастей', 'Подскажем, где выгоднее купить запчасти под ремонт машины из США.', 'gear'],
];

export const ICONS = {
  tg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.6 4.2 18.4 19.6c-.2 1-.9 1.3-1.7.8l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.8 8.8-8c.4-.3-.1-.5-.6-.2L6.3 13.3l-4.6-1.5c-1-.3-1-1 .2-1.5L20.3 3c.9-.3 1.6.2 1.3 1.2z"/></svg>',
  viber: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 2.8h10a4 4 0 0 1 4 4v7.4a4 4 0 0 1-4 4h-5.2L7.5 21.4v-3.2H7a4 4 0 0 1-4-4V6.8a4 4 0 0 1 4-4z"/><path d="M8.6 7.3c.3-.3.8-.3 1 .1l.7 1.3c.2.3.1.7-.2 1l-.4.3c.5 1.1 1.3 1.9 2.4 2.4l.3-.4c.3-.3.7-.4 1-.2l1.3.7c.4.2.4.7.1 1-.6.7-1.5.9-2.3.6-1.8-.7-3.3-2.2-4-4-.3-.8-.1-1.7.6-2.3z"/><path d="M13.2 5.9a3.6 3.6 0 0 1 3.1 3.1M13.3 4.2a5.3 5.3 0 0 1 4.7 4.7"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 20.5l1.3-4.2A8.6 8.6 0 1 1 8 19.4z"/><path d="M9 8.3c.3-.3.8-.2 1 .2l.6 1.4c.1.3 0 .7-.3.9l-.4.3c.5 1 1.3 1.8 2.3 2.3l.3-.4c.2-.3.6-.4.9-.3l1.4.6c.4.2.5.7.2 1-.6.6-1.5.9-2.3.6-1.9-.7-3.4-2.2-4.1-4.1-.3-.8 0-1.7.4-2.5z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M10 13h6M10 17h4"/></svg>',
  stamp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21h16M6 17h12v-3a2 2 0 0 0-2-2h-2.5V9a3 3 0 1 0-3 0v3H8a2 2 0 0 0-2 2z"/></svg>',
  ship: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15l2 5h14l2-5H3z"/><path d="M5 15V9h14v6M9 9V5h6v4"/></svg>',
  moto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="16.5" r="3.5"/><circle cx="18.5" cy="16.5" r="3.5"/><path d="M5.5 16.5l4-6h5l4 6M14 6h3l1.5 4.5"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>',
  calc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2"/></svg>',
};

export function makeLayout(BASE, PUBLIC_URL) {
  const u = (p = '') => BASE + p;
  /** Абсолютный адрес файла там, где сайт реально лежит сейчас (og:image, логотип в разметке должны открываться). */
  const assetUrl = (p) => PUBLIC_URL + BASE + p;

  function header(path, leadHref) {
    const navLinks = NAV.map(([p, t]) => `<a href="${u(p)}"${path.startsWith(p) ? ' aria-current="page"' : ''}>${t}</a>`).join('');
    const mobLinks = NAV.map(([p, t]) => `<a class="item" href="${u(p)}"${path.startsWith(p) ? ' aria-current="page"' : ''}>${t}</a>`
      + (p === 'uslugi/' ? `<div class="sub">${SERVICES.map(([sp, st]) => `<a href="${u(sp)}">${st}</a>`).join('')}</div>` : '')
      + (p === 'kalkulyator/' ? `<div class="sub"><a href="${u('kalkulyator/')}">Цена под ключ</a><a href="${u('tamozhennyj-kalkulator/')}">Таможенный калькулятор</a></div>` : '')).join('');
    return `<a class="skip" href="#main">К содержимому</a>
<header class="top">
  <div class="wrap">
    <a class="logo" href="${u()}" aria-label="Amerika.by — на главную"><img src="${u('img/logo.svg')}" alt="" width="70" height="64"><span>AMERIKA.BY<small>Авто из США</small></span></a>
    <nav class="nav" aria-label="Разделы сайта">${navLinks}</nav>
    <div class="contact">
      <a class="phone num" href="${SITE.phoneHref}">${SITE.phone}<small>${SITE.hours}, Минск</small></a>
      <div class="msgr">
        <a href="${SITE.tg}" target="_blank" rel="noopener" aria-label="Telegram" title="Telegram">${ICONS.tg}</a>
        <a href="${SITE.viber}" aria-label="Viber" title="Viber">${ICONS.viber}</a>
        <a href="${SITE.wa}" target="_blank" rel="noopener" aria-label="WhatsApp" title="WhatsApp">${ICONS.wa}</a>
      </div>
      <a class="btn btn-red hdr-cta" href="${leadHref}">Подобрать авто</a>
    </div>
    <button class="burger" id="burger" type="button" aria-expanded="false" aria-controls="mnav" aria-label="Меню">
      <svg class="bars" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      <svg class="x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
  </div>
</header>
<nav class="mnav" id="mnav" aria-label="Меню" hidden>
  ${mobLinks}
  <a class="mphone num" href="${SITE.phoneHref}">${SITE.phone}</a>
  <p class="mmeta">${SITE.hours} · ${SITE.city}, ${SITE.address}</p>
</nav>`;
  }

  function footer() {
    return `<footer class="foot">
  <div class="wrap">
    <div class="foot-grid">
      <div class="brand">
        <b>AMERIKA.BY</b>
        <span>Авто из США в Беларусь под ключ: подбор на Copart и IAAI, доставка до Минска и растаможка по договору.</span>
        <a class="fphone num" href="${SITE.phoneHref}">${SITE.phone}</a>
        <div class="fmsgr">
          <a href="${SITE.tg}" target="_blank" rel="noopener">${ICONS.tg.replace('<svg', '<svg width="16" height="16"')}Telegram</a>
          <a href="${SITE.viber}">${ICONS.viber.replace('<svg', '<svg width="16" height="16"')}Viber</a>
          <a href="${SITE.wa}" target="_blank" rel="noopener">${ICONS.wa.replace('<svg', '<svg width="16" height="16"')}WhatsApp</a>
        </div>
      </div>
      <div>
        <h2>Разделы</h2>
        <ul>
          <li><a href="${u('auto-usa/')}">Каталог авто из США</a></li>
          <li><a href="${u('kalkulyator/')}">Калькулятор под ключ</a></li>
          <li><a href="${u('tamozhennyj-kalkulator/')}">Таможенный калькулятор</a></li>
          <li><a href="${u('ceny/')}">Цены</a></li>
          <li><a href="${u('dileram/')}">Дилерам</a></li>
          <li><a href="${u('blog/')}">Блог</a></li>
          <li><a href="${u('otzyvy/')}">Отзывы</a></li>
          <li><a href="${u('privacy-policy/')}">Политика конфиденциальности</a></li>
        </ul>
      </div>
      <div>
        <h2>Услуги</h2>
        <ul>${SERVICES.map(([p, t]) => `<li><a href="${u(p)}">${t}</a></li>`).join('')}</ul>
      </div>
      <div>
        <h2>Офис в Минске</h2>
        <ul>
          <li>${SITE.city}, ${SITE.address}</li>
          <li>${SITE.hours}</li>
          <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
          <li><a href="${SITE.yandexSearch}" target="_blank" rel="noopener">Открыть на Яндекс Картах</a></li>
          <li><a href="${u('o-kompanii/')}">О компании</a> · <a href="${u('kontakty/')}">Контакты</a></li>
        </ul>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© ${new Date().getFullYear()} AMERIKA.BY · ${SITE.company}, УНП ${SITE.unp} · <a href="${u('privacy-policy/')}">Политика конфиденциальности</a></span>
      <span>Цены и расчёты на сайте ориентировочные и не являются публичной офертой.</span>
    </div>
  </div>
</footer>
<a class="totop" href="#main" aria-label="Наверх" title="Наверх"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg></a>
<div class="mbar">
  <a class="btn btn-red" href="${SITE.phoneHref}">Позвонить</a>
  <a class="btn btn-line" href="${SITE.tg}" target="_blank" rel="noopener">Telegram</a>
  <a class="btn btn-line" href="${SITE.viber}">Viber</a>
  <a class="btn btn-line" href="${SITE.wa}" target="_blank" rel="noopener">WhatsApp</a>
</div>`;
  }

  function crumbs(items) {
    // items: [[path|null, title], ...]; первый элемент — Главная
    const all = [['', 'Главная'], ...items];
    return `<nav class="crumbs wrap" aria-label="Хлебные крошки"><ol>${all.map(([p, t], i) =>
      i === all.length - 1 ? `<li><span aria-current="page">${esc(t)}</span></li>` : `<li><a href="${u(p)}">${esc(t)}</a></li>`).join('')}</ol></nav>`;
  }

  function crumbsLd(items) {
    const all = [['', 'Главная'], ...items];
    return {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: all.map(([p, t], i) => ({ '@type': 'ListItem', position: i + 1, name: t, item: SITE.origin + '/' + p })),
    };
  }

  /**
   * Полная страница. path — путь без BASE ('' для главной, 'katalog/' ...).
   */
  function page({ path, title, description, body, crumbs: cr, jsonld = [], ogImage, ogType = 'website', noCrumbs }) {
    const canonical = SITE.origin + '/' + path;
    description = clip(description, 160);
    if (title.length > 70 && title.endsWith(' | Amerika.by')) title = title.slice(0, -13);
    ogImage = ogImage || assetUrl('img/og-default.jpg');
    const ld = [...(cr ? [crumbsLd(cr)] : []), ...jsonld];
    return `<!doctype html>
<html lang="ru" data-base="${esc(BASE)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<!-- Тестовая версия: закрыта от индексации до запуска -->
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="${ogType}">
<meta property="og:locale" content="ru_RU">
<meta property="og:site_name" content="Amerika.by">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#f8f6f0">
<link rel="icon" href="${u('img/logo.svg')}" type="image/svg+xml">
<link rel="stylesheet" href="${u('assets/site.css')}?v=ready-20261018-v3">
${ld.map((x) => `<script type="application/ld+json">${JSON.stringify(x).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body>
<div class="review-strip"><div class="wrap"><span>НОВАЯ ВЕРСИЯ · ПРЕДВАРИТЕЛЬНЫЙ ПРОСМОТР</span><a href="${u('ceny/')}">Тарифы и условия →</a></div></div>
${header(path, body.includes('id="lead"') ? '#lead' : u() + '#lead')}
<main id="main">
${cr && !noCrumbs ? crumbs(cr) : ''}
${body}
</main>
${footer()}
<script src="${u('assets/site.js')}?v=ready-20261018-v3" defer></script>
</body>
</html>
`;
  }

  /** Блок заявки (один на страницу: id полей фиксированы, к ним обращается калькулятор). */
  function leadSection({ title = 'Пришлём до 5 вариантов с аукциона и расчёт под ключ', text = 'Оставьте телефон и напишите, какую машину ищете. Менеджер подберёт лоты и посчитает полную цену до Минска. Подборка ни к чему не обязывает.', eyebrow = 'Подбор на аукционах США', car = '', carLabel = 'Какую машину ищете', button = 'Получить подборку и расчёт', placeholder = 'Например: Toyota RAV4 2021, бюджет до 25 000 $ под ключ' } = {}) {
    return `<section class="lead-sec" id="lead">
  <div class="wrap">
    <div class="sec-head" style="margin:0">
      <p class="eyebrow">${eyebrow}</p>
      <h2>${title}</h2>
      <p>${text}</p>
      <div class="channels">
        <a href="${SITE.phoneHref}" class="num">${SITE.phone}<small>Позвонить</small></a>
        <a href="${SITE.tg}" target="_blank" rel="noopener">Telegram<small>@amerikaa_by</small></a>
        <a href="${SITE.viber}">Viber<small>${SITE.phone}</small></a>
        <a href="${SITE.wa}" target="_blank" rel="noopener">WhatsApp<small>${SITE.phone}</small></a>
      </div>
      <p class="addr">Офис: ${SITE.city}, ${SITE.address} · <span style="white-space:nowrap">${SITE.hours}</span></p>
    </div>
    <form class="lead-form" id="leadForm" data-lead novalidate>
      <div class="field"><label for="lphone">Телефон</label><input id="lphone" name="phone" required maxlength="24" type="tel" inputmode="tel" autocomplete="tel" placeholder="+375 (__) ___-__-__"></div>
      <div class="field"><label for="lname">Имя <small>(необязательно)</small></label><input id="lname" name="name" autocomplete="name"></div>
      <div class="field"><label for="lcar">${carLabel}</label><textarea id="lcar" name="car" rows="3" placeholder="${esc(placeholder)}">${esc(car)}</textarea></div>
      <label class="check" for="lagree"><input id="lagree" name="agree" type="checkbox" required> <span>Согласен на обработку персональных данных в соответствии с <a href="${u('privacy-policy/')}" target="_blank">политикой конфиденциальности</a></span></label>
      <button class="btn btn-red" type="submit">${button}</button>
      <div class="form-trap" aria-hidden="true"><label>Оставьте пустым<input name="website" tabindex="-1" autocomplete="off"></label></div><p class="form-privacy">Заявка поступит в Amerika.by. Ответим в рабочее время.</p><p class="msg" role="status" aria-live="polite" hidden></p>
    </form>
  </div>
</section>`;
  }

  function pager(cur, total, hrefFor) {
    if (total <= 1) return '';
    const nums = new Set([1, total, cur - 1, cur, cur + 1, cur - 2, cur + 2].filter((n) => n >= 1 && n <= total));
    const list = [...nums].sort((a, b) => a - b);
    let html = '', prev = 0;
    if (cur > 1) html += `<a href="${hrefFor(cur - 1)}" rel="prev" aria-label="Предыдущая страница">←</a>`;
    for (const n of list) {
      if (n - prev > 1) html += '<span class="gap">…</span>';
      html += n === cur ? `<span aria-current="page">${n}</span>` : `<a href="${hrefFor(n)}">${n}</a>`;
      prev = n;
    }
    if (cur < total) html += `<a href="${hrefFor(cur + 1)}" rel="next" aria-label="Следующая страница">→</a>`;
    return `<nav class="pager" aria-label="Страницы" id="catPager">${html}</nav>`;
  }

  return { u, assetUrl, page, leadSection, pager, crumbs };
}
