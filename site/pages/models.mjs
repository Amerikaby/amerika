// Страницы популярных моделей /usa/<марка>/<модель>/: цены на av.by по годам и до какой ставки на аукционе
// машина из США выходит дешевле рынка. Рыночные цены: site/data/market-avby.json (site/tools/avby-market.py).

/** Двигатель американской версии по году выпуска, см³. Гибриды и редкие моторы (2.0T и т. п.) не берём: считаем самую массовую версию. */
export const MODEL_PAGES = [
  {
    key: 'chevrolet/equinox', brand: 'chevrolet', brandName: 'Chevrolet', name: 'Equinox', match: (c) => c.model?.slug === 'equinox',
    cc: () => 1500, gen: 'Третье поколение (2018–2024) и четвёртое (с 2025)',
    about: [
      'Самый массовый кроссовер Chevrolet в США и одна из самых популярных машин из Америки в Беларуси. На аукционах Copart и IAAI Equinox много, поэтому лот под бюджет находится быстро.',
      'Основная версия в США: бензиновый 1,5 л турбо, передний или полный привод. В 2018–2020 годах были ещё 2,0 л турбо и 1,6 л дизель, но они встречаются редко. С 2025 года выпускается новое поколение, тоже с мотором 1,5 л.',
      'Мотор 1,5 л меньше 1,9 л, поэтому Equinox едет через Клайпеду: это быстрее и дешевле, чем через Поти.',
    ],
  },
  {
    key: 'chevrolet/trailblazer', brand: 'chevrolet', brandName: 'Chevrolet', name: 'Trailblazer', match: (c) => c.model?.slug === 'trailblazer',
    cc: () => 1300, gen: 'Компактный кроссовер, выпускается с 2021 модельного года',
    about: [
      'Компактный кроссовер между Trax и Equinox. В США продаётся с 2021 модельного года, на аукционах много машин 2021–2024 годов.',
      'Моторы маленькие: 1,2 л турбо (передний привод, вариатор) или 1,3 л турбо (передний привод с вариатором или полный с 9-ступенчатым автоматом). Считаем по самому частому 1,3 л.',
      'С таким объёмом пошлина для машин старше 3 лет одна из самых низких, а маршрут через Клайпеду.',
    ],
  },
  {
    key: 'chevrolet/trax', brand: 'chevrolet', brandName: 'Chevrolet', name: 'Trax', match: (c) => c.model?.slug === 'trax',
    cc: (y) => (y >= 2023 ? 1200 : 1400), gen: 'Первое поколение до 2022 года, новое с 2024 модельного года',
    about: [
      'Самый доступный кроссовер Chevrolet. До 2022 года выпускался с мотором 1,4 л турбо, с 2024 модельного года пришло новое поколение: заметно больше по размеру, мотор 1,2 л турбо, только передний привод.',
      'Новый Trax в Беларуси стоит дорого, а на аукционах США его много: это одна из моделей, где разница с рынком самая заметная.',
      'Оба мотора меньше 1,9 л, Trax едет через Клайпеду.',
    ],
  },
  {
    key: 'nissan/rogue', brand: 'nissan', brandName: 'Nissan', name: 'Rogue', match: (c) => c.model?.slug === 'rogue' && !/rogue sport/i.test(c.title),
    cc: (y) => (y >= 2022 ? 1500 : 2500), gen: 'До 2021 года мотор 2,5 л, с 2022 года 1,5 л турбо',
    about: [
      'Американская версия Nissan X-Trail. Главное, что нужно знать при покупке из США: до 2021 модельного года включительно у Rogue мотор 2,5 л, с 2022 года 1,5 л турбо (три цилиндра, переменная степень сжатия).',
      'От этого зависит маршрут и пошлина. Rogue 2022+ едет через Клайпеду, а с мотором 2,5 л только через Поти, и пошлина за объём у него почти вдвое выше. Поэтому старые Rogue из США в Беларусь обычно невыгодны, а 2022+ выгодны.',
      'Rogue Sport — другая, меньшая модель (в Европе это Qashqai), её считаем отдельно.',
    ],
  },
  {
    key: 'ford/bronco-sport', brand: 'ford', brandName: 'Ford', name: 'Bronco Sport', match: (c) => /bronco sport/i.test(c.title),
    cc: () => 1500, gen: 'Компактный внедорожник, выпускается с 2021 модельного года',
    about: [
      'Компактный внедорожник на базе Ford Escape, у всех версий полный привод. Не путать с большим рамным Bronco: это разные машины.',
      'Основной мотор 1,5 л турбо (три цилиндра). У версии Badlands мотор 2,0 л турбо: такая машина едет через Поти и платит пошлину больше, расчёт ниже для 1,5 л.',
      'Bronco Sport с мотором 1,5 л едет через Клайпеду.',
    ],
  },
  {
    key: 'vw/jetta', brand: 'vw', brandName: 'Volkswagen', name: 'Jetta', match: (c) => c.model?.slug === 'jetta',
    cc: (y) => (y >= 2022 ? 1500 : 1400), gen: 'Седан: 1,4 л турбо до 2021 года, 1,5 л турбо с 2022 года',
    about: [
      'Седан, который в Беларуси часто берут для работы в такси: недорогой в обслуживании мотор и большой багажник.',
      'В США Jetta до 2021 года выпускалась с мотором 1,4 л турбо, с 2022 года 1,5 л турбо. Спортивная Jetta GLI с мотором 2,0 л едет через Поти, расчёт ниже для обычной версии.',
      'Обе обычные версии едут через Клайпеду.',
    ],
  },
];

const PORT = { klaipeda: 'Клайпеда', poti: 'Поти' };

/** Самая большая ставка, при которой итог под ключ не больше target. null, если не укладывается даже лот за 0 $. */
function maxBid(costOf, o, target) {
  if (costOf(0, o).total > target) return null;
  let lo = 0, hi = target;
  for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (costOf(mid, o).total <= target) lo = mid; else hi = mid; }
  return Math.floor(lo / 100) * 100;
}

export function modelRows(m, market, { costOf, autoPortFor }) {
  const years = market?.models?.[m.key] || {};
  return Object.keys(years).map(Number).filter((y) => y >= 2018).sort((a, b) => b - a).map((y) => {
    const mk = years[y], cc = m.cc(y), port = autoPortFor(false, false, cc);
    const o = { moto: false, year: y, cc, alt: false, ev: false, region: 'east', port, sublot: false, benefit: false };
    const bid = maxBid(costOf, o, mk.median);
    return { year: y, cc, port, mk, bid, o, fixed: costOf(0, o).total };
  });
}

export function modelPages(ctx) {
  const { u, esc, costOf, autoPortFor, CONFIG, carCard, cars, leadSection, brandPath, market, plural } = ctx;
  const money = (n) => ctx.money(n).replace(/ /g, '\u00a0');
  const date = market?.date ? new Date(market.date) : new Date();
  const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const dateText = `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  const ccText = (cc) => `${(cc / 1000).toFixed(1).replace('.', ',')} л`;
  const pages = [];
  for (const m of MODEL_PAGES) {
    const rel = `usa/${m.key.split('/')[0]}/${m.key.split('/')[1]}/`;
    const full = `${m.brandName} ${m.name}`;
    const rows = modelRows(m, market, { costOf, autoPortFor });
    const list = cars.filter((c) => c.brand?.slug === m.brand && m.match(c));
    const withPhoto = list.filter((c) => c.gallery.length);
    const good = rows.filter((r) => r.bid && r.bid >= 3000);
    const best = good.slice().sort((a, b) => b.bid - a.bid)[0];
    const total = rows.reduce((s, r) => s + r.mk.n, 0);
    const exRow = rows.find((r) => r.year === 2022) || rows[0];
    const ex = exRow ? { r: exRow, lot: 8000, total: costOf(8000, exRow.o).total } : null;
    const calcHref = (r) => u('kalkulyator/') + '?' + new URLSearchParams({ price: String(r.bid || 5000), year: String(r.year), cc: String(r.cc) }).toString() + '#calc';
    const table = rows.length ? `<div class="table-wrap"><table class="tbl model-tbl">
  <thead><tr><th>Год</th><th>Мотор, маршрут</th><th>На av.by<br><small>медиана</small></th><th>Ставить до<br><small>чтобы выйти дешевле</small></th></tr></thead>
  <tbody>${rows.map((r) => `<tr><td><b>${r.year}</b></td><td>${ccText(r.cc)}, ${PORT[r.port]}</td><td>${money(r.mk.median)} $<br><small>${r.mk.n} ${plural(r.mk.n, 'объявление', 'объявления', 'объявлений')}</small></td><td>${r.bid ? `<a href="${esc(calcHref(r))}"><b>${money(r.bid)} $</b></a>` : '<span class="muted">невыгодно</span>'}</td></tr>`).join('')}</tbody>
</table></div>` : '';
    const pick = rows.find((r) => r.year === 2022 && r.bid) || best;
    const lead = pick
      ? `${esc(full)} из США выходит дешевле, чем в Беларуси, если выиграть лот дешевле суммы в таблице. Например, ${pick.year} года: на av.by такая стоит около ${money(pick.mk.median)} $, а из США под ключ столько же выйдет при ставке ${money(pick.bid)} $. Чем ниже ставка, тем больше экономия.`
      : `Считаем, при какой цене на аукционе ${esc(full)} из США выйдет дешевле, чем на рынке Беларуси.`;
    const faq = [
      [`Сколько стоит ${full} из США под ключ в Минске?`, `Сумма складывается из цены лота, сборов аукциона, доставки до Минска, таможенных платежей и нашей услуги от ${CONFIG.serviceByn} BYN.${ex ? ` Например, ${full} ${ex.r.year} года при лоте ${money(ex.lot)} $ обойдётся в Минске примерно в ${money(ex.total)} $ без ремонта.` : ''} Точную сумму по конкретному лоту считает калькулятор.`],
      [`Через какой порт везут ${full}?`, m.about[m.about.length - 1]],
      ['Что не входит в расчёт?', 'Ремонт повреждений. На аукционах большинство машин после страховых случаев, поэтому стоимость ремонта мы оцениваем по фото и отчёту аукциона до ставки и вычитаем её из суммы, до которой можно ставить.'],
      ['Откуда цены рынка?', `Медиана цен в объявлениях av.by по каждому году выпуска на ${dateText}. Это цена в объявлении, а не цена сделки: реальная продажа обычно немного ниже.`],
    ];
    const body = `<div class="page-head"><div class="wrap">
  <p class="eyebrow">Популярные модели · ${esc(m.brandName)}</p>
  <h1>${esc(full)} из США под ключ: цена в Минске</h1>
  <p class="lead">${lead}</p>
  <div class="cta-row"><a class="btn btn-red" href="#lead">Подобрать ${esc(m.name)}</a><a class="btn btn-line" href="${esc(rows[0] ? calcHref(rows[0]) : u('kalkulyator/'))}">Посчитать в калькуляторе</a></div>
</div></div>
<section class="sec" style="padding-top:0">
  <div class="wrap model-grid">
    <div>
      <h2 class="h-sm">До какой ставки ${esc(m.name)} из США дешевле рынка</h2>
      ${table}
      <p class="note">«Ставить до»: при такой цене лота итог под ключ в Минске равен медиане цен на av.by для того же года. Ставка ниже — экономия. В итоге: сборы аукциона, доставка с площадки на востоке США, море, доставка в Минск, пошлина, утильсбор, СВХ и наша услуга ${CONFIG.serviceByn} BYN. Ремонт не входит: его стоимость вычитаем из суммы. Рынок: ${total} ${plural(total, 'объявление', 'объявления', 'объявлений')} av.by на ${dateText}.</p>
    </div>
    <aside class="side">
      <div class="cta-card">
        <h2>Подберём ${esc(m.name)} под бюджет</h2>
        <p>Пришлём до 5 лотов с Copart и IAAI, проверим историю и посчитаем цену до Минска с ремонтом.</p>
        <a class="btn btn-red" href="#lead">Получить подборку</a>
        <a class="btn btn-line" href="${u('kalkulyator/')}">Калькулятор под ключ</a>
      </div>
    </aside>
  </div>
</section>
<section class="sec white">
  <div class="wrap">
    <div class="prose">
      <h2>Что важно знать про ${esc(full)} из США</h2>
      <p><b>${esc(m.gen)}.</b></p>
      ${m.about.map((p) => `<p>${esc(p)}</p>`).join('')}
      <h2>Что проверим перед ставкой</h2>
      <ul>
        <li>Историю по VIN в Carfax и AutoCheck: ДТП, владельцы, пробег.</li>
        <li>Все фото и отчёт аукциона: что скрыто за описанием повреждений.</li>
        <li>Стоимость ремонта с партнёрским СТО в Минске. Если ремонт съедает выгоду, скажем об этом до ставки.</li>
      </ul>
    </div>
  </div>
</section>
${withPhoto.length ? `<section class="sec">
  <div class="wrap">
    <div class="sec-head" style="margin-bottom:24px"><h2>Примеры ${esc(full)} с аукционов</h2><p>Лоты, которые мы показывали клиентам. Конкретная машина могла уже уйти с торгов, похожую найдём.</p></div>
    <div class="cars">${withPhoto.slice(0, 8).map((c) => carCard(c)).join('')}</div>
    <div class="sec-foot"><a class="btn btn-line" href="${u(brandPath(m.brand))}?model=${esc(list[0]?.model?.slug || '')}">Все ${esc(m.brandName)} в каталоге</a></div>
  </div>
</section>` : ''}
<section class="sec white">
  <div class="wrap faq-grid">
    <div class="sec-head"><p class="eyebrow">Вопросы</p><h2>${esc(full)} из США: частые вопросы</h2></div>
    <div class="faq">${faq.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
  </div>
</section>
${leadSection({ eyebrow: 'Подбор под бюджет', title: `Подберём ${esc(full)} на аукционе США`, text: 'Напишите год и бюджет. Пришлём до 5 актуальных лотов и полный расчёт до Минска.', car: `Ищу ${full}: ` })}`;
    const descBid = pick ? ` ${pick.year} г.: выгоднее рынка при ставке до ${money(pick.bid)} $.` : '';
    pages.push({
      path: rel,
      title: `${full} из США под ключ: цена в Минске по годам`,
      description: `${full} из США в Беларусь: цены на av.by по годам и до какой ставки на Copart и IAAI выйдет дешевле.${descBid}`.slice(0, 165),
      crumbs: [['auto-usa/', 'Каталог'], [brandPath(m.brand), m.brandName], [rel, m.name]],
      ogImage: withPhoto[0]?.gallery[0]?.large,
      body,
      jsonld: [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }],
      card: { rel, full, name: m.name, brandName: m.brandName, best: pick, photo: withPhoto[0]?.gallery[0], from: rows.length ? Math.min(...rows.map((r) => r.year)) : null },
    });
  }
  return pages;
}

/** Блок «Популярные модели» для главной и каталога. */
export function modelsStrip(pages, { u, esc, money: m }) {
  const money = (n) => m(n).replace(/ /g, '\u00a0');
  return `<div class="models">${pages.map(({ card: c }) => `<a class="model" href="${u(c.rel)}">
  <div class="ph">${c.photo ? `<img src="${esc(c.photo.small)}" srcset="${esc(c.photo.small)} 300w, ${esc(c.photo.card)} 768w" sizes="(max-width:560px) 50vw, 300px" alt="${esc(c.full)}" loading="lazy" decoding="async" width="300" height="225">` : ''}</div>
  <div class="tx"><span>${esc(c.brandName)}</span><h3>${esc(c.name)}</h3>${c.best ? `<p>${c.best.year} г.: выгоднее рынка при ставке до <b>${money(c.best.bid)} $</b></p>` : '<p>Цена в Минске по годам</p>'}</div>
</a>`).join('')}</div>`;
}
