// Главная (18.10.2026): первый экран с гарантиями, сразу под ним быстрый расчёт по любой модели, затем «кому уходят деньги»,
import { SITE } from "../partials.mjs";
// плитки моделей со сравнением с av.by, шаги, логистика, тарифы одной строкой, статьи, вопросы, заявка.

export function homeBody({ u, quick, models, extra }) {
  return `
<section class="hero">
  <div class="wrap">
    <div class="hero-copy">
      <p class="eyebrow">Copart · IAAI · Manheim</p>
      <h1>Доставка авто из США в Беларусь <mark>под ключ</mark></h1>
      <p class="lead">Найдём машину на аукционе, привезём в Минск и растаможим. Полную цену видите до ставки.</p>
      <div class="cta-row">
        <a class="btn btn-red btn-xl" href="#lead">Подобрать машину</a>
        <a class="btn btn-line" href="#quick-sec">Посчитать цену</a>
      </div>
      <p class="cta-sub">Пришлём до 5 вариантов с аукциона и полную цену до Минска. Или напишите: <a href="${SITE.tg}" target="_blank" rel="noopener">Telegram</a>, <a href="${SITE.viber}">Viber</a>, <a href="${SITE.wa}" target="_blank" rel="noopener">WhatsApp</a>.</p>
      <div class="facts">
        <div><b class="num">9+ лет</b><span>возим авто из США</span></div>
        <div><b class="num">40–70 дней</b><span>от оплаты лота до Минска</span></div>
        <div><b class="num">от 590 BYN</b><span>услуга по договору</span></div>
      </div>
    </div>

    <figure class="hero-visual"><img src="${u('img/hero-light-suv.webp')}" alt="Иллюстрация серебристо-голубого кроссовера на светлом фоне" width="1448" height="1086" fetchpriority="high"><span class="image-label">ИЛЛЮСТРАЦИЯ · AI</span><figcaption><div><small>ПОД ВАШ БЮДЖЕТ И ЗАДАЧУ</small><strong>Ваша следующая машина</strong><p>Начнём с того, что важно именно вам.</p></div><a href="#models" aria-label="Посмотреть модели">↗</a></figcaption></figure>
  </div>
</section>

<div class="wrap trust-strip"><div><b>Вы платите аукциону</b><span>Нам — за услугу по договору</span></div><div><b>Считаете до ставки</b><span>Лот, доставка, таможня и восстановление</span></div><div><b>Общаетесь с нами в Минске</b><span>Офис, договор и ваш менеджер</span></div></div>
<section class="calc-sec quick-sec" id="quick-sec">
  <div class="wrap quick-wrap">
    <div class="sec-head">
      <p class="eyebrow">Быстрый расчёт</p>
      <h2>Посчитаем весь бюджет.
      Без скрытых строк.</h2>
      <p>Выберите модель или бюджет. Восстановление и наша услуга входят в итог отдельными строками.</p>
      <ul class="payees" aria-label="Кому уходят деньги">
        <li><b>Аукциону</b><span>лот и сборы</span></li>
        <li><b>Перевозчику</b><span>доставка по США, море, порт → Минск</span></li>
        <li><b>Таможне</b><span>пошлина, утильсбор, СВХ, декларант</span></li>
        <li class="ours"><b>Нам</b><span>услуга <b class="num">590</b>, <b class="num">990</b> или <b class="num">1999 BYN</b>. <a href="${u('ceny/')}">Тарифы →</a></span></li>
      </ul>
      <p class="payees-note">Деньги за машину не проходят через нас: каждому платите напрямую.</p>
    </div>
    ${quick}
  </div>
</section>
${models}

<section class="white" id="how">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow">40–70 дней</p>
      <h2>От договора до Минска</h2>
      <p>На каждом шаге вы знаете, где машина.</p>
    </div>
    <ol class="timeline">
      <li><span class="dot"><b>1</b></span><span class="when">День 1</span><h3>Договор и подбор</h3><p>Подписываем договор и присылаем до 5 лотов с расчётом.</p></li>
      <li><span class="dot"><b>2</b></span><span class="when">До ставки</span><h3>Проверка и торги</h3><p>Проверяем историю и ставим за вас. Лот оплачиваете аукциону.</p></li>
      <li><span class="dot"><b>3</b></span><span class="when">1–2 недели</span><h3>Доставка по США</h3><p>Везём с площадки в порт, присылаем фото и номер контейнера.</p></li>
      <li><span class="dot"><b>4</b></span><span class="when">4–6 недель</span><h3>Море</h3><p>В Клайпеду или Поти. Прямые контракты с контейнерными перевозчиками и автовозами.</p></li>
      <li><span class="dot"><b>5</b></span><span class="when">Финиш</span><h3>Минск и таможня</h3><p>Помогаем с документами и платежами на таможне.</p></li>
    </ol>
    <div class="mid-cta"><p>Пришлём до 5 вариантов с расчётом до Минска.</p><a class="btn btn-red" href="#lead">Получить 5 вариантов</a></div>
  </div>
</section>

${extra}
<section class="dealer-band">
  <div class="wrap">
    <div><h2>Покупаете несколько машин или вы дилер?</h2><p>Скидка на услугу от 2 машин. Дилерам от 10 машин прямой доступ к аукционам и специальные условия. Ищем партнёров и готовы к сотрудничеству на взаимовыгодных условиях.</p></div>
    <a class="btn btn-line" href="${u('dileram/')}">Условия для дилеров</a>
  </div>
</section>
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
      <details><summary>Могут ли появиться платежи, которых нет в расчёте?</summary><p>В расчёте все обязательные платежи до Минска: лот, сборы аукциона, доставка, пошлина, утильсбор, СВХ, декларант и наша услуга. Сумма может немного измениться из-за курса валют на день оплаты.</p></details>
      <details><summary>Можно ли купить машину, которую я нашёл сам?</summary><p>Да. Пришлите ссылку на лот или VIN, мы проверим историю и повреждения и посчитаем полную стоимость до ставки. Если вы сами знаете, какую ставку сделать, это тариф «Покупка вашего лота».</p></details>
      <details><summary>Что если машина окажется хуже, чем на фото?</summary><p>Перед ставкой проверяем историю по Carfax и AutoCheck и все фото лота. Если машина не стоит своих денег, скажем об этом прямо.</p></details>
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
    <div class="qc-fields two"><div class="field"><label for="qRepair">Бюджет восстановления, $</label><input id="qRepair" type="number" min="0" max="100000" step="100" value="1500"></div><div class="field"><label for="qService">Наша услуга, BYN</label><select id="qService"><option value="590">Покупка лота · 590</option><option value="990">Подбор · 990</option><option value="1999">Под ключ · 1999</option></select></div></div>
    <label class="check qc-benefit"><input type="checkbox" id="qBenefit"> У меня есть право на льготу 50%</label>
    <p class="qc-hint">1 500 $ на восстановление — условный пример. Измените сумму под свой лот; оценку подтвердит менеджер.</p>
    <div class="qc-total" aria-live="polite"><span>Итого с восстановлением</span><b class="num" id="qTotal">—</b><small class="num" id="qByn"></small></div>
    <div class="qc-actions">
      <a class="btn btn-red" href="#lead" id="qSend">Прислать мне этот расчёт</a>
      <a class="qc-more" href="${u('kalkulyator/')}#calc" id="qMore">Все статьи расчёта →</a>
    </div>
    <div class="qc-out">
      <div class="qc-bars" id="qBars">
        <div class="qc-bar"><span>Из США до Минска</span><i><em id="qBarUs"></em></i><b class="num" id="qUs"></b></div>
        <div class="qc-bar mk"><span>Такая же на av.by</span><i><em id="qBarMk"></em></i><b class="num" id="qMk"></b></div>
      </div>
      <p class="qc-verdict" id="qVerdict"></p>
    </div>
  </div>
  <div id="qPanelBudget" role="tabpanel" aria-labelledby="qTabBudget" class="qc-panel" hidden>
    <div class="field"><label for="qBudget">Весь бюджет с восстановлением, $</label><input id="qBudget" type="number" inputmode="numeric" min="3000" step="1000" value="20000"></div>
    <p class="qc-hint" id="qBudgetContext"></p><p class="qc-hint">С доставкой, растаможкой и выбранным резервом восстановления. Ниже машины, которые в него укладываются и в Беларуси стоят столько же или дороже.</p>
    <ul class="qc-fit" id="qFit"></ul>
    <div class="qc-actions">
      <a class="btn btn-red" href="#lead" id="qSendB">Подобрать машины под бюджет</a>
    </div>
  </div>
  <p class="qc-note">Предварительный расчёт. av.by: медиана цен объявлений, не цены состоявшихся продаж. Точную стоимость и сопоставимость состояния уточняем по лоту.</p>
  <script type="application/json" id="quickData">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
</div>`;
}
