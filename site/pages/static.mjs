// Страницы с ручным текстом: калькуляторы, услуги, цены, о компании, контакты, отзывы.
import { calcWidget } from './calc-widget.mjs';

export function staticPages({ u, esc, SITE, SERVICES, ICONS, CONFIG, leadSection, postCard, posts }) {
  const pages = [];
  const add = (p) => pages.push(p);
  const num = (n, d = 0) => Number(n).toLocaleString('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/ /g, ' ');
  const head = ({ eyebrow, h1, lead, cta = '' }) => `<div class="page-head"><div class="wrap">
  ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}
  <h1>${h1}</h1>
  ${lead ? `<p class="lead">${lead}</p>` : ''}
  ${cta ? `<div class="cta-row">${cta}</div>` : ''}
</div></div>`;
  const postLinks = (slugs) => {
    const list = slugs.map((s) => posts.find((p) => p.slug === s)).filter(Boolean);
    return list.length ? `<section class="sec white"><div class="wrap"><div class="sec-head" style="margin-bottom:24px"><h2>Полезно почитать</h2></div><div class="posts">${list.slice(0, 3).map((p) => postCard(p)).join('')}</div></div></section>` : '';
  };
  const svcOthers = (cur) => `<section class="sec tight white"><div class="wrap"><h2 style="font-size:24px;margin-bottom:18px">Другие услуги</h2><div class="svc">${SERVICES.filter(([p]) => p !== cur).slice(0, 3).map(([p, t, d, ic]) => `<a href="${u(p)}"><span class="ico" aria-hidden="true">${ICONS[ic]}</span><h3>${t}</h3><p>${d}</p><span class="go">Подробнее →</span></a>`).join('')}</div></div></section>`;

  const plans = `<div class="plans">
      <div class="plan">
        <h3>Проверка лота</h3>
        <p class="for">Для тех, кто уже нашёл машину сам</p>
        <div class="price num">599 <small>BYN</small></div>
        <ul><li>Проверка по Carfax и AutoCheck</li><li>Оценка повреждений и расчёт всех расходов</li><li>Торги на аукционе</li><li>Организация доставки до Минска</li></ul>
        <a class="btn btn-line" href="#lead" data-plan="Проверка лота">Проверить мой лот</a>
      </div>
      <div class="plan hit">
        <span class="tag">Чаще выбирают</span>
        <h3>Подбор</h3>
        <p class="for">Для тех, кто знает бюджет и хочет, чтобы машину нашли</p>
        <div class="price num">799 <small>BYN</small></div>
        <ul><li>Ищем лоты под ваш бюджет</li><li>Консультация эксперта</li><li>Проверка, торги, доставка</li><li>Помощь с запчастями, ремонтом и таможней</li></ul>
        <a class="btn btn-red" href="#lead">Подобрать машину</a>
      </div>
      <div class="plan">
        <h3>Премиум</h3>
        <p class="for">Для тех, кто хочет получить ключи и не заниматься бумагами</p>
        <div class="price num">1999 <small>BYN</small></div>
        <ul><li>Всё из тарифа «Подбор»</li><li>Дополнительный отчёт с аукциона</li><li>Живые торги в любое время</li><li>Оформление на таможне за вас</li></ul>
        <a class="btn btn-line" href="#lead">Выбрать Премиум</a>
      </div>
    </div>`;

  // ---------- Калькулятор под ключ ----------
  add({
    path: 'kalkulyator/',
    title: 'Калькулятор авто из США под ключ до Минска | Amerika.by',
    description: 'Калькулятор полной стоимости авто из США в Минске: лот, сборы Copart и IAAI, доставка через Клайпеду или Поти, пошлина, утильсбор и услуга. Считает и автомобили, и мотоциклы.',
    crumbs: [['kalkulyator/', 'Калькулятор']],
    body: `${head({ eyebrow: 'Калькулятор', h1: 'Калькулятор авто из США под ключ', lead: 'Полная цена машины в Минске: лот, сборы аукциона, доставка, таможня и наша услуга. Можно идти и обратным путём: указать бюджет и узнать, до какой суммы ставить на аукционе.' })}
<section class="calc-sec" id="calc">
  <div class="wrap">
    ${calcWidget()}
  </div>
</section>
<section class="sec">
  <div class="wrap two">
    <div class="prose">
      <h2 style="margin-top:0">Как считает калькулятор</h2>
      <p>Каждая строка расчёта уходит своему получателю. Через нас идут только деньги за услугу, остальное вы платите напрямую.</p>
      <ul>
        <li><strong>Аукцион.</strong> Цена лота и сборы Copart или IAAI: сбор покупателя зависит от цены, плюс фиксированные платежи за площадку и документы.</li>
        <li><strong>Доставка.</strong> По США от площадки до порта (зависит от штата), море до Клайпеды или Поти и автовоз до Минска.</li>
        <li><strong>Таможня.</strong> Пошлина по возрасту, объёму и цене, утильсбор, таможенный сбор, СВХ и декларант.</li>
        <li><strong>Наша услуга.</strong> Фиксированная сумма по договору, в расчёте стоит минимальный тариф ${CONFIG.serviceByn} BYN.</li>
      </ul>
      <h2>Почему Клайпеда или Поти</h2>
      <p>Через Евросоюз в Беларусь сейчас можно везти легковые машины с двигателем до 1,9 литра. Машины с большим объёмом, гибриды и электромобили идут через грузинский порт Поти. Калькулятор выбирает порт сам, но его можно сменить в расширенных настройках.</p>
      <h2>Мотоциклы</h2>
      <p>Переключите «Мотоцикл»: пошлина для мотоциклов считается процентом от таможенной стоимости плюс НДС 20%, утильсбор не платится. Стоимость доставки мотоцикла пока ориентировочная, точную сумму назовём по вашему лоту.</p>
    </div>
    <div class="box">
      <h2>Что не входит в расчёт</h2>
      <p>Ремонт повреждений. Его стоимость мы оцениваем по фото и отчёту аукциона до ставки. Ремонт можно сделать у партнёрского СТО в Минске.</p>
      <p>Курсы: 1 $ = ${CONFIG.usdByn} BYN, 1 € = ${CONFIG.eurUsd} $. Таможня считает платежи по курсу на день декларации, поэтому итог может немного измениться.</p>
      <p><a class="btn btn-navy" href="${u('tamozhennyj-kalkulyator/')}">Только таможня: отдельный калькулятор</a></p>
    </div>
  </div>
</section>
${leadSection()}`,
  });

  // ---------- Таможенный калькулятор ----------
  const D = CONFIG.duty, M = CONFIG.moto;
  const lim = (t, i, unit) => (i === 0 ? `до ${num(t[0][0])} ${unit}` : (t[i][0] === Infinity ? `свыше ${num(t[i - 1][0])} ${unit}` : `${num(t[i - 1][0] + 1)}–${num(t[i][0])} ${unit}`));
  const dutyTable = `<div class="table-wrap"><table class="tbl">
<thead><tr><th>Возраст</th><th>Стоимость или объём</th><th>Ставка</th></tr></thead>
<tbody>
${D.under3.map((r, i) => `<tr>${i === 0 ? `<td rowspan="${D.under3.length}"><b>до 3 лет</b></td>` : ''}<td>${lim(D.under3, i, '€')}</td><td>${num(r[1] * 100)}%, но не менее ${num(r[2], r[2] % 1 ? 1 : 0)} €/см³</td></tr>`).join('\n')}
${D.from3to5.map((r, i) => `<tr>${i === 0 ? `<td rowspan="${D.from3to5.length}"><b>3–5 лет</b></td>` : ''}<td>${lim(D.from3to5, i, 'см³')}</td><td>${num(r[1], 1)} €/см³</td></tr>`).join('\n')}
${D.over5.map((r, i) => `<tr>${i === 0 ? `<td rowspan="${D.over5.length}"><b>старше 5 лет</b></td>` : ''}<td>${lim(D.over5, i, 'см³')}</td><td>${num(r[1], 1)} €/см³</td></tr>`).join('\n')}
</tbody></table></div>`;
  const motoTable = `<div class="table-wrap"><table class="tbl">
<thead><tr><th>Двигатель мотоцикла</th><th>Пошлина</th></tr></thead>
<tbody>
${M.dutyPct.map((r, i) => `<tr><td>ДВС ${lim(M.dutyPct, i, 'см³')}</td><td>${num(r[1] * 100)}% от таможенной стоимости</td></tr>`).join('\n')}
<tr><td>Электромотоцикл</td><td>${num(M.dutyPctElectric * 100)}% от таможенной стоимости</td></tr>
</tbody></table></div>`;
  add({
    path: 'tamozhennyj-kalkulyator/',
    title: 'Таможенный калькулятор: растаможка авто и мотоциклов в Беларуси | Amerika.by',
    description: 'Таможенный калькулятор для физлиц: пошлина, утильсбор и сборы при ввозе авто и мотоцикла в Беларусь. Ставки по возрасту, объёму и стоимости, льгота по Указу № 140.',
    crumbs: [['kalkulyator/', 'Калькулятор'], ['tamozhennyj-kalkulyator/', 'Таможенный калькулятор']],
    body: `${head({ eyebrow: 'Растаможка в Беларуси', h1: 'Таможенный калькулятор для физлиц', lead: 'Сколько придётся заплатить на таможне в Минске за автомобиль или мотоцикл. Нужны три вещи: год выпуска, объём двигателя и стоимость по документам.' })}
<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="ccalc">
      <form id="ccForm" autocomplete="off">
        <div class="field wide">
          <label id="cvtLabel">Что растамаживаем</label>
          <div class="seg" role="radiogroup" aria-labelledby="cvtLabel">
            <label><input type="radio" name="cvtype" value="car" checked><span>Автомобиль</span></label>
            <label><input type="radio" name="cvtype" value="moto"><span>Мотоцикл</span></label>
          </div>
        </div>
        <div class="field wide">
          <label id="cfLabel">Двигатель</label>
          <div class="seg" role="radiogroup" aria-labelledby="cfLabel">
            <label><input type="radio" name="cfuel" value="ice" checked><span>Бензин / дизель / гибрид</span></label>
            <label><input type="radio" name="cfuel" value="ev"><span id="ccFuelEv">Электро (квота)</span></label>
          </div>
        </div>
        <div class="field" id="ccYearField">
          <label for="ccYear">Год выпуска</label>
          <select id="ccYear"></select>
        </div>
        <div class="field" id="ccVolField">
          <label for="ccVolume">Объём двигателя, см³</label>
          <input id="ccVolume" type="number" inputmode="numeric" min="0" step="100" value="2000">
        </div>
        <div class="field">
          <label for="ccPrice">Стоимость по документам</label>
          <input id="ccPrice" type="number" inputmode="numeric" min="0" step="100" value="10000">
        </div>
        <div class="field">
          <label id="curLabel">Валюта</label>
          <div class="seg" role="radiogroup" aria-labelledby="curLabel">
            <label><input type="radio" name="cur" value="usd" checked><span>USD</span></label>
            <label><input type="radio" name="cur" value="eur"><span>EUR</span></label>
          </div>
        </div>
        <div class="field wide checks">
          <label for="ccBenefit" class="check"><input id="ccBenefit" type="checkbox"> Льгота 50% по Указу № 140 (многодетные семьи, инвалиды I и II группы)</label>
        </div>
        <p class="route wide">Возраст: <b id="ccAge"></b>. <span id="ccRule"></span></p>
      </form>
      <div class="bill" aria-live="polite">
        <div class="bill-head"><b>Платежи на таможне</b><span>предварительно</span></div>
        <div class="row"><span>Таможенная пошлина</span><span class="num" id="cr-duty-eur"></span></div>
        <div class="row" id="cr-vat-row" hidden><span>НДС 20%</span><span class="num" id="cr-vat"></span></div>
        <div class="row" id="cr-util-row"><span>Утилизационный сбор</span><span class="num" id="cr-util"></span></div>
        <div class="row"><span>Таможенный сбор</span><span class="num" id="cr-fee"></span></div>
        <div class="row"><span>СВХ и декларант (ориентир)</span><span class="num" id="cr-svh"></span></div>
        <div class="total"><span>Итого на таможне</span><b class="num" id="cr-total"></b></div>
        <small class="num" id="cr-total-usd" style="color:var(--muted);font-size:14px;text-align:right;margin-top:4px"></small>
        <p class="note warn-note" id="ccMotoNote" hidden><b>Расчёт для мотоциклов ориентировочный.</b> Таможенная стоимость мотоцикла включает доставку до границы ЕАЭС: введите цену вместе с доставкой до Клайпеды или Поти.</p>
        <p class="note">Расчёт предварительный. Таможня считает платежи по курсу на день регистрации декларации. Доставка и услуги сюда не входят: полную цену до Минска покажет <a href="${u('kalkulyator/')}">калькулятор под ключ</a>.</p>
        <div class="actions" style="display:flex;margin-top:14px"><a class="btn btn-red" href="#lead" style="flex:1">Получить точный расчёт</a></div>
      </div>
    </div>
  </div>
</section>
<section class="sec white">
  <div class="wrap two">
    <div class="prose">
      <h2 style="margin-top:0">Как пользоваться</h2>
      <ol>
        <li><strong>Выберите, что ввозите:</strong> автомобиль или мотоцикл. Для них разные правила.</li>
        <li><strong>Укажите год выпуска.</strong> Для легковых возраст решает почти всё: до 3 лет, 3–5 лет или старше.</li>
        <li><strong>Объём двигателя</strong> в кубических сантиметрах, как в документах. Для электро объём не нужен.</li>
        <li><strong>Стоимость по документам:</strong> из инвойса или договора, не рыночная оценка. Не округляйте.</li>
        <li><strong>Льгота по Указу № 140:</strong> отметьте, если она вам положена. Пошлина уменьшится вдвое.</li>
      </ol>
      <h2>Из чего складывается сумма</h2>
      <ul>
        <li><strong>Таможенная пошлина.</strong> Самый большой платёж. Для легковых физлиц до 3 лет считается процентом от стоимости, но не меньше минимума за см³. Для машин старше 3 лет только за объём, цена не важна.</li>
        <li><strong>Утилизационный сбор.</strong> С 29.04.2026 для легковых физлиц: ${num(CONFIG.utilByn.upTo3, 2)} BYN до 3 лет включительно и ${num(CONFIG.utilByn.over3, 2)} BYN старше 3 лет. Для мотоциклов не платится.</li>
        <li><strong>Таможенный сбор</strong> за оформление: ${CONFIG.customsFeeByn} BYN, не зависит от стоимости.</li>
        <li><strong>СВХ и декларант.</strong> Тарифы склада и декларанта, в расчёте ориентир ${CONFIG.svhByn} BYN.</li>
      </ul>
      <p>Для организаций ставки другие и добавляется НДС. Если ввозите на юрлицо, напишите нам: посчитаем отдельно.</p>
    </div>
    <div>
      <div class="box">
        <h2>Мотоциклы</h2>
        <p>Единая ставка за см³ к мотоциклам не применяется. Платится пошлина в процентах от таможенной стоимости и НДС 20% от суммы стоимости и пошлины. Таможенный сбор ${CONFIG.customsFeeByn} BYN, утильсбора нет. По Указу № 140 возвращается половина пошлины и НДС.</p>
        ${motoTable}
      </div>
    </div>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="sec-head"><h2>Ставки пошлины для легковых авто физлиц</h2><p>Для машин до 3 лет считаются оба варианта, процент от стоимости и минимум за объём, и берётся больший.</p></div>
    ${dutyTable}
    <p class="plans-note">Электромобили в пределах годовой квоты ввозятся без пошлины. Квота заканчивается, поэтому сроки важны: <a href="${u('blog/kvota-na-elektromobili-belarus/')}">как устроена квота</a>.</p>
  </div>
</section>
${postLinks(['utilizacionnyj-sbor-belarus-2026', 'avto-s-aukciona-ssha-cena-pod-kljuch', 'kvota-na-elektromobili-belarus'])}
${leadSection({ eyebrow: 'Точный расчёт бесплатно', title: 'Посчитаем растаможку по вашей машине', text: 'Пришлите ссылку на лот или VIN. Посчитаем таможню и полную цену до Минска по курсу на сегодня.', carLabel: 'Ссылка на лот, VIN или модель', placeholder: 'Например: https://www.copart.com/lot/… или Toyota RAV4 2021, 2,5 л' })}`,
  });

  // ---------- Услуги ----------
  add({
    path: 'uslugi/',
    title: 'Услуги: подбор, проверка, доставка и растаможка авто из США | Amerika.by',
    description: 'Услуги Amerika.by: подбор авто на аукционах Copart и IAAI, проверка истории по Carfax и AutoCheck, растаможка, отслеживание контейнера, доставка мототехники и запчастей.',
    crumbs: [['uslugi/', 'Услуги']],
    body: `${head({ eyebrow: 'Услуги', h1: 'Услуги по доставке авто из США', lead: 'Главная услуга: подбор машины на аукционе и доставка до Минска под ключ. Можно заказать и отдельные части работы.', cta: `<a class="btn btn-red" href="${u('uslugi/podbor-avto-na-aukcione/')}">Подбор под ключ</a><a class="btn btn-line" href="${u('ceny/')}">Цены</a>` })}
<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="svc">${SERVICES.map(([p, t, d, ic], i) => `<a href="${u(p)}"${i === 0 ? ' class="main"' : ''}><span class="ico" aria-hidden="true">${ICONS[ic]}</span><h3>${t}</h3><p>${d}</p><span class="go">Подробнее →</span></a>`).join('')}</div>
  </div>
</section>
<section class="sec white">
  <div class="wrap two">
    <div class="sec-head" style="margin:0"><p class="eyebrow">Как мы работаем</p><h2>Договор, прозрачные платежи, офис в Минске</h2><p>Работаем по официальному договору. За машину вы платите аукциону напрямую, за доставку перевозчику, пошлину таможне. Нам только фиксированную сумму за услугу.</p></div>
    <ol class="steps">
      <li><div><h3>Договор и бюджет</h3><p>Обсуждаем, какую машину ищете и сколько готовы потратить под ключ.</p></div></li>
      <li><div><h3>Подбор и проверка</h3><p>Присылаем лоты с расчётом, проверяем историю и повреждения до ставки.</p></div></li>
      <li><div><h3>Торги и доставка</h3><p>Ставим за вас, после победы организуем доставку через Клайпеду или Поти.</p></div></li>
      <li><div><h3>Таможня в Минске</h3><p>Помогаем с документами и платежами, в тарифе «Премиум» оформляем всё за вас.</p></div></li>
    </ol>
  </div>
</section>
${leadSection()}`,
  });

  add({
    path: 'uslugi/podbor-avto-na-aukcione/',
    title: 'Подбор авто на аукционах Copart и IAAI под ключ | Amerika.by',
    description: 'Подбор авто на аукционах США Copart и IAAI: ищем лоты под бюджет, проверяем историю, ведём торги и доставляем в Минск по договору. За машину платите аукциону напрямую. От 599 BYN.',
    crumbs: [['uslugi/', 'Услуги'], ['uslugi/podbor-avto-na-aukcione/', 'Подбор авто на аукционе']],
    body: `${head({ eyebrow: 'Главная услуга', h1: 'Подбор авто на аукционах Copart и IAAI', lead: 'Найдём машину на аукционах США под ваш бюджет, проверим её до ставки, выиграем торги и доставим в Минск. Работаем по договору, за лот вы платите аукциону напрямую.', cta: `<a class="btn btn-red" href="#lead">Подобрать машину</a><a class="btn btn-line" href="${u('kalkulyator/')}">Посчитать цену до Минска</a>` })}
<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="kpis">
      <div><b>9+ лет</b><span>возим авто из США</span></div>
      <div><b>до 5 лотов</b><span>с расчётом под ключ в первой подборке</span></div>
      <div><b>40–70 дней</b><span>обычно от оплаты лота до Минска</span></div>
      <div><b>от 599 BYN</b><span>фиксированная цена услуги</span></div>
    </div>
  </div>
</section>
<section class="sec white">
  <div class="wrap two">
    <div>
      <div class="sec-head"><p class="eyebrow">По шагам</p><h2>Что мы делаем</h2></div>
      <ol class="steps">
        <li><div><h3>Договор и подбор</h3><p>Обсуждаем бюджет и пожелания, подписываем договор. Присылаем до 5 подходящих лотов с полным расчётом до Минска.</p></div></li>
        <li><div><h3>Проверка до ставки</h3><p>Отчёты Carfax и AutoCheck, все фото и отчёт аукциона, оценка ремонта с партнёрским СТО. Если риск высокий, отговорим.</p></div></li>
        <li><div><h3>Торги</h3><p>Ставим за вас на Copart или IAAI. После победы вы оплачиваете лот аукциону банковским переводом.</p></div></li>
        <li><div><h3>Доставка</h3><p>Перевозчик Atlantic Express Corporation забирает машину с площадки и грузит в контейнер. Присылаем фото и номер контейнера.</p></div></li>
        <li><div><h3>Минск и таможня</h3><p>Машина приходит на СВХ в Минске. Помогаем с растаможкой, в тарифе «Премиум» оформляем за вас.</p></div></li>
      </ol>
    </div>
    <div class="box">
      <h2>Почему через аукцион</h2>
      <p>На Copart и IAAI продаются машины после страховых случаев, лизинговые и от дилеров. Выбор по всей стране обновляется каждый день, а историю каждой машины можно проверить по VIN.</p>
      <p>Обратная сторона: большинство лотов с повреждениями. Поэтому мы оцениваем ремонт до ставки и включаем его в бюджет.</p>
      <p><a href="${u('katalog/')}">Примеры авто из США в каталоге →</a></p>
    </div>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="sec-head"><p class="eyebrow">Тарифы</p><h2>Сколько стоит подбор</h2><p>Фиксированная цена в договоре, оплатить можно через ЕРИП.</p></div>
    ${plans}
    <p class="plans-note">Доставка, пошлина и сборы в тариф не входят: вы платите их напрямую, суммы видно в <a href="${u('kalkulyator/')}">калькуляторе</a>.</p>
  </div>
</section>
${postLinks(['aukcion-avto-ssha', 'copart-na-russkom', 'aukcion-iaai'])}
${svcOthers('uslugi/podbor-avto-na-aukcione/')}
${leadSection()}`,
  });

  add({
    path: 'uslugi/proverka-istorii-po-bazam/',
    title: 'Проверка истории авто из США по Carfax и AutoCheck | Amerika.by',
    description: 'Проверяем историю авто из США по VIN до ставки: отчёты Carfax и AutoCheck, ДТП, число и тип владельцев, страховые записи, продажи внутри США.',
    crumbs: [['uslugi/', 'Услуги'], ['uslugi/proverka-istorii-po-bazam/', 'Проверка истории по базам']],
    body: `${head({ eyebrow: 'Услуги', h1: 'Проверка истории авто по базам США', lead: 'Перед каждой ставкой мы проверяем машину по VIN в отчётах Carfax и AutoCheck. Так вы видите прошлое машины до покупки, а не после.', cta: `<a class="btn btn-red" href="#lead">Проверить мой лот</a>` })}
<section class="sec" style="padding-top:0">
  <div class="wrap two">
    <div class="box">
      <h2>Что показывает отчёт</h2>
      <ul class="ticks">
        <li><div><h3>Сколько было владельцев</h3><p>И кто они: частные лица, лизинг или прокат.</p></div></li>
        <li><div><h3>ДТП с начала эксплуатации</h3><p>Сколько аварий попало в базы и насколько серьёзных.</p></div></li>
        <li><div><h3>Записи страховых компаний</h3><p>Выплаты и признание машины тотальной потерей.</p></div></li>
        <li><div><h3>Продажи внутри США</h3><p>Как машина переходила из рук в руки и с каким пробегом.</p></div></li>
      </ul>
    </div>
    <div class="prose">
      <h2 style="margin-top:0">Зачем это нужно</h2>
      <p>На аукционе видно фото и короткое описание повреждений. Отчёт добавляет то, чего на фото нет: прошлые аварии, скрученный пробег, прокатное прошлое.</p>
      <p>Если история плохая, говорим об этом прямо и предлагаем другие лоты. Проверка входит во все тарифы. Если вы уже нашли машину сами, выбирайте тариф «Проверка лота» за 599 BYN: проверим, посчитаем все расходы и проведём торги.</p>
      <p>Про типы документов на машину (clean, salvage, rebuilt) читайте в статье <a href="${u('blog/clean-salvage-rebuilt-title/')}">о тайтлах</a>.</p>
    </div>
  </div>
</section>
${svcOthers('uslugi/proverka-istorii-po-bazam/')}
${leadSection({ eyebrow: 'Проверка лота', title: 'Пришлите лот или VIN, проверим до ставки', text: 'Посмотрим историю, фото и повреждения и посчитаем полную цену до Минска.', carLabel: 'Ссылка на лот или VIN', placeholder: 'Например: https://www.iaai.com/… или VIN', button: 'Проверить лот' })}`,
  });

  add({
    path: 'uslugi/rastamozhka-avtomobiley/',
    title: 'Растаможка авто из США в Минске: документы и платежи | Amerika.by',
    description: 'Растаможка авто из США в Минске: заранее считаем пошлину и утильсбор, помогаем с декларантом и СВХ. Оформление занимает 1–2 рабочих дня, нужен только паспорт.',
    crumbs: [['uslugi/', 'Услуги'], ['uslugi/rastamozhka-avtomobiley/', 'Растаможка автомобилей']],
    body: `${head({ eyebrow: 'Услуги', h1: 'Растаможка автомобилей из США', lead: 'Таможенные платежи мы считаем ещё до ставки на аукционе. Когда машина приходит в Минск, помогаем пройти оформление быстро и без сюрпризов.', cta: `<a class="btn btn-red" href="${u('tamozhennyj-kalkulyator/')}">Таможенный калькулятор</a><a class="btn btn-line" href="#lead">Задать вопрос</a>` })}
<section class="sec" style="padding-top:0">
  <div class="wrap two">
    <div>
      <div class="sec-head"><h2>Как проходит растаможка</h2></div>
      <ol class="steps">
        <li><div><h3>Расчёт до покупки</h3><p>Считаем платежи по типу машины, дате выпуска, стоимости, объёму двигателя и наличию льготы.</p></div></li>
        <li><div><h3>Документы едут с машиной</h3><p>Title (американский техпаспорт) и Bill of Sale или инвойс приходят вместе с машиной на склад временного хранения.</p></div></li>
        <li><div><h3>Декларант и оплата</h3><p>Вы подаёте документы декларанту и оплачиваете пошлину, утильсбор, таможенное оформление и услуги декларанта.</p></div></li>
        <li><div><h3>Забираете машину</h3><p>Получаете пропуск на склад и забираете машину. Советуем на эвакуаторе: перед поездкой нужно проверить все жидкости.</p></div></li>
      </ol>
    </div>
    <div class="box">
      <h2>Что взять с собой</h2>
      <ul class="ticks">
        <li><div><h3>Паспорт</h3><p>Этого достаточно, если оформляете на себя.</p></div></li>
        <li><div><h3>Удостоверение льготника</h3><p>Оригинал, если оформляете со скидкой 50% по Указу № 140.</p></div></li>
        <li><div><h3>Доверенность</h3><p>Если машину растамаживает другой человек.</p></div></li>
      </ul>
      <p>Обычно оформление на СВХ занимает 1–2 рабочих дня. В тарифе «Премиум» таможню мы берём на себя полностью.</p>
    </div>
  </div>
</section>
${postLinks(['utilizacionnyj-sbor-belarus-2026', 'kvota-na-elektromobili-belarus', 'clean-salvage-rebuilt-title'])}
${svcOthers('uslugi/rastamozhka-avtomobiley/')}
${leadSection()}`,
  });

  add({
    path: 'uslugi/otslezhivanie-konteinerov/',
    title: 'Отслеживание контейнера с авто из США по VIN | Amerika.by',
    description: 'Где сейчас ваша машина из США: отслеживание контейнера по VIN после погрузки на судно. Фото из порта, номер контейнера и сроки прибытия в Минск.',
    crumbs: [['uslugi/', 'Услуги'], ['uslugi/otslezhivanie-konteinerov/', 'Отслеживание контейнеров']],
    body: `${head({ eyebrow: 'Услуги', h1: 'Отслеживание контейнера по VIN', lead: 'Доставка идёт под контролем наших менеджеров, но следить за машиной можно и самому. После погрузки контейнера на судно по VIN видно, где сейчас машина.' })}
<section class="sec" style="padding-top:0">
  <div class="wrap two">
    <div class="box">
      <h2>Где моя машина?</h2>
      <form class="vin-form" id="vinForm" novalidate>
        <label for="vin" style="flex-basis:100%">VIN автомобиля (17 символов)</label>
        <input id="vin" name="vin" maxlength="17" autocomplete="off" spellcheck="false" placeholder="Например: 1HGCV1F30LA000000">
        <button class="btn btn-navy" type="submit">Проверить</button>
      </form>
      <div class="vin-out" id="vinOut" hidden>
        <p class="msg" id="vinMsg"></p>
        <div class="cta-row" id="vinActions" hidden>
          <a class="btn btn-line" id="vinWa" href="${SITE.wa}" target="_blank" rel="noopener">WhatsApp</a>
          <a class="btn btn-line" id="vinTg" href="${SITE.tg}" target="_blank" rel="noopener">Telegram</a>
          <a class="btn btn-red" href="#lead">Оставить заявку</a>
        </div>
      </div>
    </div>
    <div class="prose">
      <h2 style="margin-top:0">Как это работает</h2>
      <p>Доставку из США выполняет Atlantic Express Corporation. Перевозчик забирает машину с площадки аукциона, фотографирует её в порту и грузит в контейнер.</p>
      <p>Отслеживание становится доступно, когда судно выходит из порта. До этого момента статус подскажет менеджер: где машина, когда погрузка и номер контейнера.</p>
      <p>Обычный путь от оплаты лота до Минска занимает 40–70 дней: 1–2 недели по США, 4–6 недель морем и автовоз до Минска.</p>
    </div>
  </div>
</section>
${svcOthers('uslugi/otslezhivanie-konteinerov/')}
${leadSection({ eyebrow: 'Статус доставки', title: 'Спросите менеджера, где ваша машина', text: 'Оставьте телефон и VIN: ответим, где сейчас машина и когда она будет в Минске.', carLabel: 'VIN или номер договора', placeholder: 'VIN из 17 символов', button: 'Узнать статус' })}`,
  });

  add({
    path: 'uslugi/dostavka-mototehniki/',
    title: 'Мотоцикл из США под ключ: подбор и доставка в Минск | Amerika.by',
    description: 'Доставка мототехники из США: мотоциклы, квадроциклы, гидроциклы и снегоходы с аукционов Copart и IAAI. Подбор, проверка, доставка и растаможка в Минске.',
    crumbs: [['uslugi/', 'Услуги'], ['uslugi/dostavka-mototehniki/', 'Доставка мототехники']],
    body: `${head({ eyebrow: 'Услуги', h1: 'Доставка мототехники из США', lead: 'Подбираем мотоциклы и другую технику на аукционах Copart и IAAI и доставляем в Минск под ключ: от выбора лота до выдачи техники.', cta: `<a class="btn btn-red" href="#lead">Подобрать мотоцикл</a><a class="btn btn-line" href="${u('kalkulyator/?type=moto#calc')}">Посчитать мотоцикл</a>` })}
<section class="sec" style="padding-top:0">
  <div class="wrap two">
    <div class="prose">
      <h2 style="margin-top:0">Что можно привезти</h2>
      <ul>
        <li>Спортивные и дорожные мотоциклы, чопперы</li>
        <li>Эндуро и триал</li>
        <li>Квадроциклы и багги</li>
        <li>Гидроциклы</li>
        <li>Снегоходы</li>
      </ul>
      <h2>Почему из США</h2>
      <p>В США большой выбор моделей, в том числе тех, что почти не встречаются в Беларуси. Даже после небольшого ДТП технику часто отправляют на аукцион, и она заметно теряет в цене. Это шанс купить нужную модель дешевле, если ремонт несложный.</p>
      <h2>Как проходит</h2>
      <p>Так же, как с машинами: обсуждаем бюджет, модель, год и цель покупки, подбираем лоты, проверяем, ведём торги, организуем доставку и помогаем с таможней. Сделка по договору, за лот вы платите аукциону напрямую.</p>
    </div>
    <div class="box">
      <h2>Таможня для мотоциклов</h2>
      <p>Для мотоциклов другие правила, чем для легковых: пошлина в процентах от таможенной стоимости (${M.dutyPct.map((r) => num(r[1] * 100) + '%').filter((v, i, a) => a.indexOf(v) === i).join(', ')} в зависимости от объёма) плюс НДС 20%. Утильсбор не платится.</p>
      <p>Калькулятор под ключ считает мотоциклы ориентировочно: стоимость места в контейнере зависит от размеров техники, точную сумму назовём по лоту.</p>
      <p><a class="btn btn-navy" href="${u('tamozhennyj-kalkulyator/?type=moto')}">Таможня для мотоцикла</a></p>
    </div>
  </div>
</section>
${svcOthers('uslugi/dostavka-mototehniki/')}
${leadSection({ eyebrow: 'Подбор мототехники', title: 'Подберём мотоцикл на аукционе США', text: 'Напишите модель, год и бюджет. Пришлём подходящие лоты и расчёт до Минска.', carLabel: 'Какую технику ищете', placeholder: 'Например: Honda CBR600RR 2019, бюджет до 8 000 $ под ключ', car: '' })}`,
  });

  add({
    path: 'uslugi/dostavka-zapchastey/',
    title: 'Запчасти для авто из США: где купить выгоднее | Amerika.by',
    description: 'Консультация по запчастям для авто из США: подскажем, где выгоднее купить новые и б/у детали под ремонт, и поможем с ремонтом у партнёрского СТО в Минске.',
    crumbs: [['uslugi/', 'Услуги'], ['uslugi/dostavka-zapchastey/', 'Доставка запчастей']],
    body: `${head({ eyebrow: 'Услуги', h1: 'Запчасти для авто из США', lead: 'Машину с аукциона почти всегда нужно ремонтировать. Подскажем, где выгоднее купить запчасти именно для вашей модели, и поможем с ремонтом.' })}
<section class="sec" style="padding-top:0">
  <div class="wrap two">
    <div class="box">
      <h2>Где можно купить</h2>
      <ul class="ticks">
        <li><div><h3>Новые и б/у из США</h3><p>Можно отправить вместе с машиной в контейнере.</p></div></li>
        <li><div><h3>Из Польши</h3><p>Новые и б/у детали, часто быстрее по срокам.</p></div></li>
        <li><div><h3>Разборки в Литве и Беларуси</h3><p>Хороший вариант для кузовных деталей.</p></div></li>
      </ul>
    </div>
    <div class="prose">
      <h2 style="margin-top:0">Чем поможем</h2>
      <p>Поделимся опытом и сориентируем, где выгоднее купить запчасти на конкретную машину: что взять новым, что б/у, что везти из США.</p>
      <p>Стоимость ремонта мы оцениваем ещё до ставки на аукционе, вместе с партнёрским СТО в Минске. Там же можно отремонтировать машину после доставки.</p>
      <p>Помощь с запчастями и ремонтом входит в тарифы «Подбор» и «Премиум». <a href="${u('ceny/')}">Смотреть тарифы</a></p>
    </div>
  </div>
</section>
${svcOthers('uslugi/dostavka-zapchastey/')}
${leadSection({ eyebrow: 'Консультация', title: 'Спросите про запчасти для вашей машины', text: 'Напишите модель, год и что нужно заменить. Подскажем, где купить выгоднее.', carLabel: 'Машина и нужные детали', placeholder: 'Например: Nissan Rogue 2021, передний бампер и фара' })}`,
  });

  // ---------- Цены ----------
  add({
    path: 'ceny/',
    title: 'Цены на доставку авто из США: тарифы 599, 799 и 1999 BYN | Amerika.by',
    description: 'Тарифы на услугу доставки авто из США под ключ: проверка лота 599 BYN, подбор 799 BYN, премиум 1999 BYN. Фиксированная цена в договоре, оплата через ЕРИП.',
    crumbs: [['ceny/', 'Цены']],
    body: `${head({ eyebrow: 'Цены', h1: 'Цены на услуги', lead: 'Фиксированная цена в договоре, без процента от стоимости машины. Оплатить можно через ЕРИП. Выберите тариф по тому, сколько хотите делать сами.' })}
<section class="sec" style="padding-top:12px">
  <div class="wrap">
    ${plans}
    <p class="plans-note">Доставка, пошлина и сборы в тариф не входят: вы платите их напрямую, суммы видно в <a href="${u('kalkulyator/')}">калькуляторе</a>.</p>
  </div>
</section>
<section class="white" id="price-inside">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow">Что входит в цену машины</p>
      <h2>Каждый платёж видно. И видно, кому он уходит</h2>
      <p>Деньги за машину не проходят через нас. Вы платите каждому участнику напрямую, со своего имени, по его счёту.</p>
    </div>
    <div class="inc">
      <article><p class="to"><b>1</b>Аукциону</p><ul><li><strong>Цена лота</strong>Ставка, на которой вы выиграли торги.</li><li><strong>Сборы аукциона</strong>Сбор покупателя, gate fee, документы.</li></ul></article>
      <article><p class="to"><b>2</b>Перевозчику</p><ul><li><strong>Доставка по США</strong>С площадки до порта.</li><li><strong>Море</strong>Контейнер до Клайпеды или Поти.</li><li><strong>Порт → Минск</strong>Автовоз до таможни.</li></ul></article>
      <article><p class="to"><b>3</b>Таможне</p><ul><li><strong>Пошлина</strong>По возрасту, объёму и цене.</li><li><strong>Утильсбор, СВХ, декларант</strong>Обязательные платежи в Минске.</li></ul></article>
      <article class="ours"><p class="to"><b>4</b>Нам</p><ul><li><strong>Услуга по договору</strong>599, 799 или 1999 BYN по тарифу.</li><li><strong>Без процента</strong>Цена не зависит от стоимости машины.</li></ul></article>
    </div>
  </div>
</section>
<section id="faq">
  <div class="wrap faq-grid">
    <div class="sec-head" style="margin:0"><p class="eyebrow">Вопросы</p><h2>Про оплату и договор</h2></div>
    <div class="faq">
      <details open><summary>Когда я плачу за услугу?</summary><p>Сумма и порядок оплаты прописаны в договоре. Оплатить можно через ЕРИП.</p></details>
      <details><summary>Почему за машину я плачу аукциону, а не вам?</summary><p>Так безопаснее для вас: деньги за лот уходят банковским переводом напрямую Copart или IAAI, со своего имени. Мы не держим ваши деньги за машину.</p></details>
      <details><summary>Какой тариф выбрать?</summary><p>Если вы уже нашли лот, хватит «Проверки лота». Если знаете бюджет и хотите, чтобы машину нашли, берите «Подбор». Если не хотите заниматься таможней и бумагами, «Премиум».</p></details>
      <details><summary>Сколько стоит машина целиком?</summary><p>Зависит от лота, площадки, возраста и объёма двигателя. Посчитайте в <a href="${u('kalkulyator/')}">калькуляторе под ключ</a> или пришлите лот менеджеру.</p></details>
    </div>
  </div>
</section>
${leadSection()}`,
  });

  // ---------- О компании ----------
  add({
    path: 'o-kompanii/',
    title: 'О компании Amerika.by: авто из США с 9-летним опытом | Amerika.by',
    description: 'Amerika.by больше 9 лет возит авто из США в Беларусь. Офис в Минске, официальный договор, 80% клиентов приходят по рекомендации. Логистика: Atlantic Express Corporation.',
    crumbs: [['o-kompanii/', 'О компании']],
    body: `${head({ eyebrow: 'О компании', h1: 'Amerika.by: авто из США с 9-летним опытом', lead: 'Больше 9 лет помогаем покупать автомобили и другую технику на аукционах США и доставлять их в Беларусь. Работаем по официальному договору, офис в Минске.' })}
<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="kpis">
      <div><b>9+ лет</b><span>возим авто из США</span></div>
      <div><b>80%</b><span>клиентов приходят по рекомендации</span></div>
      <div><b>от 3 лет</b><span>опыт наших менеджеров</span></div>
      <div><b>1995</b><span>с этого года работает наш перевозчик Atlantic Express Corporation</span></div>
    </div>
  </div>
</section>
<section class="sec white">
  <div class="wrap two">
    <div class="prose">
      <h2 style="margin-top:0">Как мы работаем</h2>
      <p>Процесс покупки и доставки отлажен годами: подбор на аукционах Copart и IAAI, проверка истории, торги, доставка через Клайпеду или Поти и помощь с таможней в Минске.</p>
      <p>Работаем по официальному договору. Все платежи вы делаете от своего имени на банковские счета: за машину аукциону, за доставку перевозчику, пошлину таможне. Нам только фиксированную сумму за услугу.</p>
      <p>Ремонт после аукциона помогают сделать партнёрские СТО в Минске. Стоимость ремонта мы оцениваем вместе с ними ещё до ставки.</p>
      <h2>Логистика</h2>
      <p>Доставку из США выполняет американский перевозчик Atlantic Express Corporation, который работает с 1995 года. Он забирает машину с площадки аукциона, грузит в контейнер и отправляет в порт.</p>
    </div>
    <div class="box">
      <h2>Реквизиты и офис</h2>
      <p><b>${SITE.company}</b><br>УНП ${SITE.unp}</p>
      <p>${SITE.city}, ${SITE.address}<br>${SITE.hours}</p>
      <p><a class="num" href="${SITE.phoneHref}">${SITE.phone}</a><br><a href="mailto:${SITE.email}">${SITE.email}</a></p>
      <p><a class="btn btn-navy" href="${u('kontakty/')}">Все контакты</a></p>
    </div>
  </div>
</section>
${leadSection()}`,
    jsonld: [{ '@context': 'https://schema.org', '@type': 'AboutPage', name: 'О компании Amerika.by', url: SITE.origin + '/o-kompanii/' }],
  });

  // ---------- Контакты ----------
  add({
    path: 'kontakty/',
    title: 'Контакты Amerika.by: офис в Минске, телефон, Telegram | Amerika.by',
    description: `Контакты Amerika.by: ${SITE.city}, ${SITE.address}. Телефон ${SITE.phone}, Telegram, Viber, WhatsApp. ${SITE.hours}.`,
    crumbs: [['kontakty/', 'Контакты']],
    body: `${head({ eyebrow: 'Контакты', h1: 'Контакты', lead: 'Позвоните, напишите в мессенджер или приезжайте в офис в Минске. Консультация бесплатная.' })}
<section class="sec" style="padding-top:0">
  <div class="wrap contacts-grid">
    <div class="box"><h3>Телефон</h3><a class="big num" href="${SITE.phoneHref}">${SITE.phone}</a><p>${SITE.hours}</p></div>
    <div class="box"><h3>Мессенджеры</h3><div class="cta-row"><a class="btn btn-line" href="${SITE.tg}" target="_blank" rel="noopener">Telegram</a><a class="btn btn-line" href="${SITE.viber}">Viber</a><a class="btn btn-line" href="${SITE.wa}" target="_blank" rel="noopener">WhatsApp</a></div><p>Telegram: @amerikaa_by</p></div>
    <div class="box"><h3>Офис</h3><p class="big" style="font-size:20px">${SITE.city}, ${SITE.address}</p><p>${SITE.hours}. Перед визитом лучше позвонить.</p><div class="cta-row"><a class="btn btn-navy" href="${SITE.yandexSearch}" target="_blank" rel="noopener">Открыть на Яндекс Картах</a></div></div>
    <div class="box"><h3>Почта и реквизиты</h3><a class="big" style="font-size:20px" href="mailto:${SITE.email}">${SITE.email}</a><p>${SITE.company}, УНП ${SITE.unp}</p></div>
  </div>
</section>
${leadSection({ eyebrow: 'Заявка', title: 'Оставьте заявку, перезвоним', text: 'Менеджер перезвонит в рабочее время, ответит на вопросы и посчитает машину под ключ.' })}`,
    jsonld: [{ '@context': 'https://schema.org', '@type': 'ContactPage', name: 'Контакты Amerika.by', url: SITE.origin + '/kontakty/' }],
  });

  // ---------- Отзывы ----------
  add({
    path: 'otzyvy/',
    title: 'Отзывы клиентов Amerika.by | Amerika.by',
    description: 'Отзывы клиентов Amerika.by о доставке авто из США. Скоро здесь будут реальные отзывы и кейсы, а пока отзывы можно прочитать на Яндекс Картах.',
    crumbs: [['otzyvy/', 'Отзывы']],
    body: `${head({ eyebrow: 'Отзывы', h1: 'Отзывы и кейсы клиентов' })}
<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="soon" style="margin-top:0">
      <div>
        <span class="badge">Скоро</span>
        <h2 style="font-size:26px">Скоро здесь будут реальные отзывы и кейсы клиентов</h2>
        <p>Собираем истории машин, которые мы привезли: цена под ключ в Минске и что было сделано на каждом шаге. Публикуем только реальные отзывы с согласия клиентов.</p>
      </div>
      <div class="cta-row"><a class="btn btn-navy" href="${SITE.yandexReviews}" target="_blank" rel="noopener">Отзывы на Яндекс Картах</a><a class="btn btn-line" href="${SITE.instagram}" target="_blank" rel="noopener">Instagram</a></div>
    </div>
  </div>
</section>
${leadSection()}`,
  });

  return pages;
}
