// Главная (18.10.2026): первый экран с гарантиями, сразу под ним быстрый расчёт по любой модели, затем «кому уходят деньги»,
// плитки моделей со сравнением с av.by, шаги, логистика, тарифы одной строкой, статьи, вопросы, заявка.

export function homeBody({ u, quick, models, extra }) {
  return `
<section class="hero">
  <div class="wrap">
    <div class="hero-copy">
      <p class="eyebrow">Copart, IAAI и Manheim · доставка до Минска</p>
      <h1>Доставка авто из США в Беларусь <mark>под ключ</mark></h1>
      <p class="lead">Пригон авто из Америки: покупка на Copart, IAAI и Manheim, доставка до Минска и растаможка. Работаем по договору, полную цену до Минска видите до ставки.</p>
      <div class="cta-row">
        <a class="btn btn-red" href="#quick">Посчитать цену до Минска</a>
        <a class="btn btn-line" href="#lead">Подобрать машину</a>
      </div>
      <div class="facts">
        <div><b class="num">9+ лет</b><span>возим авто из США</span></div>
        <div><b class="num">40–70 дней</b><span>от оплаты лота до Минска</span></div>
        <div><b class="num">от 599 BYN</b><span>услуга по договору</span></div>
      </div>
    </div>

    <aside class="guar" aria-label="Три гарантии">
      <div class="guar-head"><p>Три гарантии</p><span>прописаны в договоре</span></div>
      <ol>
        <li>
          <span class="ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M10 13h6M10 17h4"/></svg></span>
          <div><h3>Официальный договор</h3><p>Офис в Минске, юрлицо в Беларуси. Что мы делаем и сколько это стоит, записано на бумаге.</p></div>
        </li>
        <li>
          <span class="ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/></svg></span>
          <div><h3>За машину платите аукциону сами</h3><p>Деньги за лот уходят банковским переводом напрямую аукциону. Нам вы платите только за услугу.</p></div>
        </li>
        <li>
          <span class="ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg></span>
          <div><h3>Полная цена до Минска заранее</h3><p>Лот, сборы, доставка, пошлина, утильсбор и наша услуга. Считаем всё до ставки, а не после покупки.</p></div>
        </li>
      </ol>
    </aside>
  </div>
</section>

<section class="calc-sec quick-sec" id="quick-sec">
  <div class="wrap quick-wrap">
    <div class="sec-head">
      <p class="eyebrow">Быстрый расчёт</p>
      <h2>Сколько будет стоить ваша машина в Минске</h2>
      <p>Выберите модель или введите бюджет. Сравним с ценами на av.by.</p>
    </div>
    ${quick}
  </div>
</section>
<section class="white" id="price-inside">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow">Что входит в цену</p>
      <h2>Каждый платёж видно. И видно, кому он уходит</h2>
      <p>Деньги за машину не проходят через нас. Каждому участнику вы платите напрямую.</p>
    </div>
    <div class="inc inc-short">
      <article><p class="to"><b>1</b>Аукциону</p><ul><li>Цена лота</li><li>Сборы аукциона</li></ul></article>
      <article><p class="to"><b>2</b>Перевозчику</p><ul><li>Доставка по США</li><li>Море до Клайпеды или Поти</li><li>Порт → Минск</li></ul></article>
      <article><p class="to"><b>3</b>Таможне</p><ul><li>Пошлина</li><li>Утильсбор, СВХ, декларант</li></ul></article>
      <article class="ours"><p class="to"><b>4</b>Нам</p><ul><li>Услуга по договору: <b class="num">599</b>, <b class="num">799</b> или <b class="num">1999 BYN</b></li><li>Без процента от цены машины</li></ul><a href="${u('ceny/')}">Что входит в тарифы →</a></article>
    </div>
  </div>
</section>

${models}

<section class="white" id="how">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow">Шаги и сроки</p>
      <h2>Где ваша машина и что будет дальше</h2>
      <p>Обычно 40–70 дней от оплаты лота до Минска. На каждом шаге вы знаете, где машина.</p>
    </div>
    <ol class="timeline">
      <li><span class="dot"><b>1</b></span><span class="when">День 1</span><h3>Договор и подбор</h3><p>Подписываем договор и присылаем до 5 лотов с расчётом.</p></li>
      <li><span class="dot"><b>2</b></span><span class="when">До ставки</span><h3>Проверка и торги</h3><p>Проверяем историю и ставим за вас. Лот оплачиваете аукциону.</p></li>
      <li><span class="dot"><b>3</b></span><span class="when">1–2 недели</span><h3>Доставка по США</h3><p>Везём с площадки в порт, присылаем фото и номер контейнера.</p></li>
      <li><span class="dot"><b>4</b></span><span class="when">4–6 недель</span><h3>Море</h3><p>Контейнер идёт в Клайпеду или Поти.</p></li>
      <li><span class="dot"><b>5</b></span><span class="when">Финиш</span><h3>Минск и таможня</h3><p>Помогаем с документами и платежами на таможне.</p></li>
    </ol>
  </div>
</section>

<section id="logistics">
  <div class="wrap atl">
    <div class="sec-head" style="margin:0">
      <p class="eyebrow">Логистика</p>
      <h2>Логистика: Atlantic Express Corporation</h2>
      <p>Везёт машины из США с 1995 года. За доставку вы платите перевозчику напрямую.</p>
    </div>
    <div class="atl-card">
      <div class="since"><b class="num">1995</b><span>с этого года работает<br>Atlantic Express Corporation</span></div>
      <div class="path" aria-label="Маршрут"><span>Аукцион в США</span><i>→</i><span>Порт США</span><i>→</i><span>Клайпеда / Поти</span><i>→</i><span>Минск</span></div>
      <div class="routes">
        <div><b>Через Клайпеду</b><span>Литва, через ЕС. Для машин с двигателем до 1,9 л.</span></div>
        <div><b>Через Поти</b><span>Грузия, в обход ЕС. Для машин больше 1,9 л, гибридов и электро.</span></div>
      </div>
    </div>
  </div>
</section>

${extra}
<section id="faq">
  <div class="wrap faq-grid">
    <div class="sec-head" style="margin:0">
      <p class="eyebrow">Вопросы</p>
      <h2>Что обычно спрашивают перед договором</h2>
      <p>Не нашли ответ? Позвоните <a href="tel:+375296332828" class="num" style="font-weight:700;color:var(--ink);white-space:nowrap">+375 (29) 633-28-28</a> или напишите в <a href="https://t.me/amerikaa_by" target="_blank" rel="noopener" style="font-weight:700;color:var(--ink)">Telegram</a>.</p>
    </div>
    <div class="faq">
      <details open><summary>Как я могу быть уверен, что деньги не пропадут?</summary><p>За машину вы платите аукциону напрямую, банковским переводом со своего счёта. За доставку платите перевозчику, пошлину таможне. Нам только фиксированную сумму за услугу по договору. У нас офис в Минске: ул. Большое Стиклево, 83, 3 этаж.</p></details>
      <details><summary>Сколько идёт машина из США в Минск?</summary><p>Обычно 40–70 дней после оплаты лота: около 1–2 недель по США до порта, 4–6 недель морем, затем доставка в Минск. Через Поти путь дольше, чем через Клайпеду.</p></details>
      <details><summary>Почему одни машины едут через Клайпеду, а другие через Поти?</summary><p>Через Евросоюз сейчас можно везти в Беларусь легковые машины с двигателем не больше 1,9 литра. Машины с большим объёмом мы везём через грузинский порт Поти. Электромобили и гибриды обычно тоже идут через Поти. Точный маршрут подтвердим при расчёте.</p></details>
      <details><summary>Могут ли появиться платежи, которых нет в расчёте?</summary><p>В калькуляторе все обязательные статьи: лот, сборы аукциона, доставка, пошлина, утильсбор, СВХ, декларант и наша услуга. Отдельно идёт ремонт повреждений, его мы оцениваем до ставки. Курс валют на день оплаты может немного изменить сумму.</p></details>
      <details><summary>Можно ли купить машину, которую я нашёл сам?</summary><p>Да. Пришлите ссылку на лот или VIN, мы проверим историю и повреждения и посчитаем полную стоимость до ставки. Это тариф «Проверка лота».</p></details>
      <details><summary>Что если машина окажется хуже, чем на фото?</summary><p>Перед ставкой мы проверяем историю по Carfax и AutoCheck, смотрим все фото и отчёт аукциона и оцениваем ремонт. Если риск высокий, честно отговорим от покупки.</p></details>
      <details><summary>Есть ли льготы на растаможку?</summary><p>По Указу № 140 многодетные семьи и инвалиды I и II группы платят 50% таможенных платежей: для легковых авто половину пошлины, для мотоциклов половину пошлины и НДС. Таможенный сбор платится полностью. Для электромобилей действуют отдельные условия и квота, их уточним при расчёте.</p></details>
    </div>
  </div>
</section>
`;
}

/** Быстрый расчёт на первом экране.
 * data.idx: [[марка, модель, {год: см³}, электро 0/1, {год: медиана av.by $}, ссылка на страницу модели], ...]; data.popular: индексы быстрых кнопок. */
export function quickCalc(data, { u, esc }) {
  return `<div class="qc" id="quick">
  <div class="qc-tabs" role="tablist" aria-label="Что считаем">
    <button type="button" role="tab" id="qTabModel" aria-selected="true" aria-controls="qPanelModel">Знаю модель</button>
    <button type="button" role="tab" id="qTabBudget" aria-selected="false" aria-controls="qPanelBudget">Знаю бюджет</button>
  </div>
  <div id="qPanelModel" role="tabpanel" aria-labelledby="qTabModel" class="qc-panel">
    <div class="field qc-search">
      <label for="qModel">Марка и модель</label>
      <input id="qModel" type="text" autocomplete="off" placeholder="Например: Toyota RAV4" role="combobox" aria-expanded="false" aria-controls="qList" aria-autocomplete="list">
      <ul class="qc-list" id="qList" role="listbox" hidden></ul>
    </div>
    <div class="qc-pop" aria-label="Популярные">${data.popular.map((i) => `<button type="button" data-i="${i}">${esc(data.idx[i][1])}</button>`).join('')}</div>
    <div class="qc-fields three">
      <div class="field"><label for="qYear">Год</label><select id="qYear"></select></div>
      <div class="field"><label for="qCc">Объём, см³</label><input id="qCc" type="number" inputmode="numeric" min="0" step="100" value="1500"></div>
      <div class="field"><label for="qLot">Ставка, $</label><input id="qLot" type="number" inputmode="numeric" min="0" step="500" value="8000"></div>
    </div>
    <div class="qc-fuel" id="qFuelRow" hidden>
      <div class="seg" role="radiogroup" aria-label="Двигатель">
        <label><input type="radio" name="qFuel" value="ice" checked><span>Бензин, дизель</span></label>
        <label><input type="radio" name="qFuel" value="hybrid"><span>Гибрид</span></label>
        <label><input type="radio" name="qFuel" value="ev"><span>Электро</span></label>
      </div>
    </div>
    <p class="qc-hint" id="qHint"></p>
    <div class="qc-total" aria-live="polite"><span>Итого в Минске</span><b class="num" id="qTotal">—</b><small class="num" id="qByn"></small></div>
    <div class="qc-actions">
      <a class="btn btn-red" href="#lead" id="qSend">Получить точный расчёт</a>
      <a class="qc-more" href="${u('kalkulyator/')}#calc" id="qMore">Все статьи расчёта →</a>
    </div>
    <div class="qc-out">
      <div class="qc-bars" id="qBars">
        <div class="qc-bar"><span>Из США до Минска</span><i><em id="qBarUs"></em></i><b></b></div>
        <div class="qc-bar mk"><span>Такая же на av.by</span><i><em id="qBarMk"></em></i><b class="num" id="qMk"></b></div>
      </div>
      <p class="qc-verdict" id="qVerdict"></p>
    </div>
  </div>
  <div id="qPanelBudget" role="tabpanel" aria-labelledby="qTabBudget" class="qc-panel" hidden>
    <div class="field"><label for="qBudget">Бюджет до Минска, $</label><input id="qBudget" type="number" inputmode="numeric" min="3000" step="1000" value="20000"></div>
    <p class="qc-hint">С доставкой и растаможкой. Ниже машины, которые в него укладываются и в Беларуси стоят столько же или дороже.</p>
    <ul class="qc-fit" id="qFit"></ul>
    <div class="qc-actions">
      <a class="btn btn-red" href="#lead" id="qSendB">Подобрать под мой бюджет</a>
    </div>
  </div>
  <p class="qc-note">Предварительный расчёт. av.by: средняя цена объявлений.</p>
  <script type="application/json" id="quickData">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
</div>`;
}
