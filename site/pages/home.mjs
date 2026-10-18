// Главная (вариант A, 18.10.2026): первый экран = быстрый расчёт по популярным моделям, затем «кому уходят деньги»,
// плитки моделей со сравнением с av.by, шаги, логистика, тарифы одной строкой, статьи, вопросы, заявка.

export function homeBody({ u, quick, models, extra }) {
  return `
<section class="hero hero-q">
  <div class="wrap">
    <div class="hq-head">
      <p class="eyebrow">Аукционы Copart и IAAI</p>
      <h1>Авто из США в Беларусь и Россию <span class="h1-tail">от аукциона до <mark>ключей в ваших руках</mark></span></h1>
      <p class="lead">Пригон авто из Америки под ключ: подбор на Copart и IAAI, доставка и растаможка. Полную цену знаете до ставки. Выберите модель в расчёте и сравните с ценами на av.by.</p>
    </div>
    ${quick}
    <ul class="hq-trust" aria-label="Гарантии">
      <li><span class="ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M10 13h6M10 17h4"/></svg></span><div><b>Официальный договор</b><span>офис и юрлицо в Минске</span></div></li>
      <li><span class="ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/></svg></span><div><b>За машину платите аукциону</b><span>деньги за лот не идут через нас</span></div></li>
      <li><span class="ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17h13l3-5h2"/><path d="M5 17l-1-6h12l2 6"/><circle cx="8" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg></span><div><b>Atlantic Express с 1995</b><span>логистика из США до Минска</span></div></li>
    </ul>
    <div class="facts hq-facts">
      <div><b class="num">9+ лет</b><span>возим авто из США</span></div>
      <div><b class="num">40–70 дней</b><span>от оплаты лота до Минска</span></div>
      <div><b class="num">от 599 BYN</b><span>услуга по договору</span></div>
    </div>
  </div>
</section>
<section class="white" id="price-inside">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow">Что входит в цену</p>
      <h2>Каждый платёж видно. И видно, кому он уходит</h2>
      <p>Деньги за машину не проходят через нас. Вы платите каждому участнику напрямую, со своего имени, по его счёту. Нам только фиксированную сумму за услугу.</p>
    </div>
    <div class="inc">
      <article>
        <p class="to"><b>1</b>Аукциону</p>
        <ul>
          <li><strong>Цена лота</strong>Ставка, на которой вы выиграли торги на Copart или IAAI.</li>
          <li><strong>Сборы аукциона</strong>Сбор покупателя, gate fee, оформление документов. Зависят от цены лота.</li>
        </ul>
      </article>
      <article>
        <p class="to"><b>2</b>Перевозчику</p>
        <ul>
          <li><strong>Доставка по США</strong>С площадки аукциона до порта отправки. Зависит от штата.</li>
          <li><strong>Море</strong>Контейнер до Клайпеды или Поти.</li>
          <li><strong>Порт → Минск</strong>Автовоз до таможни в Минске.</li>
        </ul>
      </article>
      <article>
        <p class="to"><b>3</b>Таможне</p>
        <ul>
          <li><strong>Таможенная пошлина</strong>По возрасту машины, объёму двигателя и цене. Для электромобилей отдельные условия.</li>
          <li><strong>Утильсбор, СВХ, декларант</strong>Обязательные платежи при оформлении в Минске.</li>
        </ul>
      </article>
      <article class="ours">
        <p class="to"><b>4</b>Нам</p>
        <ul>
          <li><strong>Услуга по договору</strong>Подбор, проверка, торги, организация доставки и сопровождение до Минска.</li>
          <li><strong>Фиксированная сумма</strong>599, 799 или 1999 BYN по тарифу. Без процента от цены машины.</li>
        </ul>
      </article>
    </div>
    <div class="inc-foot">
      <span><b>Отдельно от расчёта:</b> ремонт повреждений. Его стоимость мы оцениваем по фото и отчёту аукциона до ставки, ремонт можно сделать у нашего партнёрского СТО.</span>
    </div>
  </div>
</section>

${models}

<section class="white" id="how">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow">Шаги и сроки</p>
      <h2>Где ваша машина и что будет дальше</h2>
      <p>Пять шагов от договора до ключей. На каждом шаге вы знаете, где машина: присылаем фото и номер контейнера, отслеживание по VIN.</p>
    </div>
    <ol class="timeline">
      <li><span class="dot"><b>1</b></span><span class="when">День 1</span><h3>Договор и подбор</h3><p>Обсуждаем бюджет, подписываем договор. В течение часа присылаем до 5 подходящих лотов с расчётом под ключ.</p></li>
      <li><span class="dot"><b>2</b></span><span class="when">До ставки</span><h3>Проверка и торги</h3><p>Carfax, AutoCheck, оценка ремонта. Ставим за вас. После победы вы оплачиваете лот аукциону напрямую.</p></li>
      <li><span class="dot"><b>3</b></span><span class="when">1–2 недели</span><h3>Доставка по США</h3><p>Забираем машину с площадки и везём в порт. Присылаем фото и номер контейнера.</p></li>
      <li><span class="dot"><b>4</b></span><span class="when">4–6 недель</span><h3>Море</h3><p>Контейнер идёт в Клайпеду или Поти. Маршрут зависит от двигателя, подтверждаем при расчёте.</p></li>
      <li><span class="dot"><b>5</b></span><span class="when">Финиш</span><h3>Минск и таможня</h3><p>Привозим на таможню, помогаем с документами и платежами. В тарифе «Премиум» оформляем всё за вас.</p></li>
    </ol>
    <div class="total-time">
      <b class="num">40–70 дней</b>
      <p>Обычный срок от оплаты лота до машины в Минске. Через Поти путь дольше, чем через Клайпеду. Точный срок скажем по вашему лоту.</p>
    </div>
  </div>
</section>

<section id="logistics">
  <div class="wrap atl">
    <div class="sec-head" style="margin:0">
      <p class="eyebrow">Логистика</p>
      <h2>Логистика: Atlantic Express Corporation</h2>
      <p>Доставку из США организует наш логистический партнёр Atlantic Express Corporation (с 1995 года). Машину забирают с площадки аукциона, грузят в контейнер и отправляют в порт. Оплату за доставку вы переводите напрямую, без посредников.</p>
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

<section class="price-band">
  <div class="wrap pb-in">
    <div>
      <p class="eyebrow">Сколько стоит наша работа</p>
      <p class="pb-text">Фиксированная сумма в договоре, без процента от цены машины: <b class="num">599</b>, <b class="num">799</b> или <b class="num">1999 BYN</b> по тарифу. Оплата через ЕРИП.</p>
    </div>
    <a class="btn btn-line" href="${u('ceny/')}">Что входит в тарифы</a>
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
      <details><summary>Возите ли вы машины из США в Россию?</summary><p>Да, привозим авто из США и в Россию. Калькулятор на сайте считает таможню по правилам Беларуси, поэтому расчёт для России делает менеджер: напишите модель, год и город, пришлём полную стоимость.</p></details>
      <details><summary>Есть ли льготы на растаможку?</summary><p>По Указу № 140 многодетные семьи и инвалиды I и II группы платят 50% таможенных платежей: для легковых авто половину пошлины, для мотоциклов половину пошлины и НДС. Таможенный сбор платится полностью. Для электромобилей действуют отдельные условия и квота, их уточним при расчёте.</p></details>
    </div>
  </div>
</section>
`;
}

/** Быстрый расчёт на первом экране. data: [{n, b, rel, def, y: [[год, см³, медиана av.by, ставить до], ...]}] */
export function quickCalc(data, { u, esc }) {
  const first = data[0];
  return `<div class="qc" id="quick">
  <div class="qc-head"><b>Цена в Минске под ключ</b><span>сравнение с av.by</span></div>
  <div class="qc-models" role="radiogroup" aria-label="Модель">${data.map((m, i) => `<label><input type="radio" name="qm" value="${i}"${i === 0 ? ' checked' : ''}><span>${esc(m.n)}</span></label>`).join('')}<a href="${u('kalkulyator/')}#calc">Другая машина</a></div>
  <div class="qc-fields">
    <div class="field"><label for="qYear">Год выпуска</label><select id="qYear">${first.y.map(([y]) => `<option value="${y}"${y === first.def ? ' selected' : ''}>${y}</option>`).join('')}</select></div>
    <div class="field"><label for="qLot">Ставка на аукционе, $</label><input id="qLot" type="number" inputmode="numeric" min="0" step="500" value="8000"></div>
  </div>
  <div class="qc-out" aria-live="polite">
    <div class="qc-total"><span>Итого в Минске</span><b class="num" id="qTotal">—</b><small class="num" id="qByn"></small></div>
    <div class="qc-bars">
      <div class="qc-bar"><span>Из США под ключ</span><i><em id="qBarUs"></em></i><b class="num" id="qUs"></b></div>
      <div class="qc-bar mk"><span>Такая же на av.by</span><i><em id="qBarMk"></em></i><b class="num" id="qMk"></b></div>
    </div>
    <p class="qc-verdict" id="qVerdict"></p>
  </div>
  <div class="qc-actions">
    <a class="btn btn-red" href="#lead" id="qSend">Получить точный расчёт</a>
    <a class="qc-more" href="${u('kalkulyator/')}#calc" id="qMore">Все статьи расчёта →</a>
  </div>
  <p class="qc-note">Предварительно, без ремонта, по таможенным правилам Беларуси. Для России расчёт сделает менеджер. Цены av.by: медиана объявлений по году выпуска.</p>
  <script type="application/json" id="quickData">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
</div>`;
}
