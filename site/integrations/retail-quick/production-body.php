<main id="amz-retail-calc">
<nav aria-label="Хлебные крошки" class="crumbs wrap"><ol><li><a href="/">Главная</a></li><li><span aria-current="page">Калькулятор для розничных клиентов</span></li></ol></nav>
<div class="page-head"><div class="wrap">
<p class="eyebrow">Калькулятор</p>
<h1>Сколько будет стоить авто в Минске?</h1>
<p class="lead">Быстро прикинуть покупку и доставку — или разобрать все расходы по вашему лоту.</p>
<p class="calc-status-top">Калькулятор пока в доработке. Для точного расчёта <a href="#lead">свяжитесь с менеджером</a>.</p>
</div></div>
<section class="calc-sec" id="calc">
<div class="wrap">
<div class="quick-mode-switch" id="quickModeSwitch" role="tablist" aria-label="Способ расчёта"><button id="quickTab" role="tab" aria-selected="true" aria-controls="quickPanel" type="button">Быстрый расчёт<span>Цена лота и тип автомобиля</span></button><button id="detailedTab" role="tab" aria-selected="false" aria-controls="quickDetailed" tabindex="-1" type="button">Подробный расчёт<span>Лот, двигатель и все расходы</span></button></div><p class="quick-mode-note" id="quickDetailedNote" hidden>Проверьте год, двигатель и площадку конкретного лота. Расчёт остаётся предварительным; счёт на оплату выставит менеджер после проверки.</p><section id="quickPanel" class="quick-panel" role="tabpanel" aria-labelledby="quickTab">
<div class="quick-layout">
<form id="quickForm" class="quick-form" autocomplete="off">
  <div class="quick-intro"><p>Без номера лота. Таможня — только по желанию.</p></div>
  <div class="quick-price"><label for="qPrice">Цена лота, $ <span>ваша ставка без сборов аукциона</span></label><input id="qPrice" type="number" min="1" max="10000000" step="100" inputmode="decimal" placeholder="Например, 8 000" aria-describedby="qPriceHelp"/><p id="qPriceHelp">Сборы аукциона добавим к расчёту.</p></div>
  <fieldset class="quick-sizes"><legend>Какой автомобиль?</legend><div class="quick-size-options">
    <label><input type="radio" name="qSize" value="compact" checked/><span><svg viewBox="0 0 96 40" aria-hidden="true"><path d="M9 28h78v-9l-15-3-13-9H34l-12 9-13 5zM26 16h42M44 8v8"/><circle cx="26" cy="29" r="7"/><circle cx="72" cy="29" r="7"/></svg><b>Легковой</b><small>Седан, хэтчбек</small></span></label>
    <label><input type="radio" name="qSize" value="crossover"/><span><svg viewBox="0 0 96 40" aria-hidden="true"><path d="M8 28h80V15l-10-3-9-8H30l-13 12-9 3zM28 15h48M48 5v10"/><circle cx="25" cy="29" r="7"/><circle cx="73" cy="29" r="7"/></svg><b>Кроссовер</b><small>SUV среднего размера</small></span></label>
    <label><input type="radio" name="qSize" value="large"/><span><svg viewBox="0 0 96 40" aria-hidden="true"><path d="M5 28h86V12H68L57 3H27L16 15H5zM29 13h32M44 4v9M68 13v13"/><circle cx="24" cy="29" r="8"/><circle cx="75" cy="29" r="8"/></svg><b>Крупный</b><small>Большой SUV, пикап</small></span></label>
  </div></fieldset>
  <p id="qSizeNote" class="quick-warning" hidden>Учтём известные надбавки выбранного размера.</p>
  <div class="quick-route-summary"><span>Маршрут для примера</span><strong id="qRouteSummary">Клайпеда · подбираем площадку</strong><small id="qRouteHint">Минимальная подтверждённая доставка в нашем справочнике.</small></div>
  <details class="quick-settings" id="qSettings"><summary>Уточнить расчёт: маршрут и таможня</summary><div class="quick-settings-body">
    <label for="qPort">Доставка через<select id="qPort"><option value="auto">Автоматически · Клайпеда для примера</option><option value="klaipeda">Клайпеда, Литва</option><option value="poti">Поти, Грузия</option></select></label>
    <label for="qYard">Площадка аукциона<input id="qYard" type="text" list="qYardOptions" placeholder="Автоматически — минимальный маршрут"/><datalist id="qYardOptions"></datalist></label>
    <p>Площадка настоящего лота может отличаться — тогда изменится доставка. Здесь доступны площадки с подтверждённым морским тарифом.</p>
  </div>
  <div class="quick-customs-toggle"><label for="qCustoms"><input id="qCustoms" type="checkbox"/> Добавить таможню</label><span>Необязательно — нужны двигатель и возраст</span></div>
  <div id="qCustomsFields" class="quick-customs-fields">
    <label for="qLiters">Двигатель, л<input id="qLiters" type="number" min="0.1" max="10" step="0.1" inputmode="decimal" list="qEngineList" placeholder="Например, 1.5"/><datalist id="qEngineList"><option value="1.0"></option><option value="1.2"></option><option value="1.4"></option><option value="1.5"></option><option value="1.6"></option><option value="1.8"></option><option value="2.0"></option><option value="2.5"></option><option value="3.0"></option></datalist></label>
    <label for="qAge">Возраст автомобиля<select id="qAge"><option value="">Выберите возраст</option></select></label>
    <label for="qClearance" id="qClearanceField" hidden>Клиренс, мм<input id="qClearance" type="number" min="50" max="600" step="1" inputmode="numeric" placeholder="Например, 160"/></label>
    <label class="quick-benefit" for="qBenefit"><input id="qBenefit" type="checkbox" checked/> Льгота 50% по Указу № 140</label>
    <p>Эти параметры также проверяют маршрут, даже без таможни. Для бензина и дизеля; дату выпуска, гибриды и электро проверит менеджер.</p>
  </div>
  <p id="qRouteWarning" class="quick-warning" hidden></p>
  </details>
</form>
<aside class="quick-result" aria-labelledby="qResultTitle">
  <div class="quick-result-top"><span class="eyebrow">Предварительная оценка</span><span class="quick-estimate-tag">Без ремонта</span></div>
  <h2 id="qResultTitle">Авто с доставкой, без таможни</h2><div id="qTotal" class="quick-total">—</div><p id="qByn" class="quick-byn">Введите цену лота, чтобы увидеть бюджет.</p>
  <p id="qError" class="quick-error" role="status" hidden></p>
  <div class="quick-shipping"><span>Из них доставка до Минска</span><b id="qShipping">—</b><small>США → порт → Минск, выбранный класс авто</small></div>
  <div class="quick-inclusions"><strong id="qIncluded">Включено: лот, сборы, доставка и наша услуга.</strong><p id="qExcluded">Не включено: таможня и ремонт. Для крупного авто может потребоваться доплата за габариты.</p></div>
  <p id="qCustomsAssumption" class="quick-assumptions" hidden></p>
  <p id="qPolicyNote" class="quick-policy-note">Клайпеда выбрана для ценового примера. Доступность маршрута по вашему автомобилю ещё не проверена.</p>
  <a id="qManager" class="btn btn-red" href="#lead">Уточнить по моему лоту</a>
  <details class="quick-breakdown-details" id="qBreakdownWrap" hidden><summary>Из чего складывается сумма</summary><div id="qBreakdown" class="quick-breakdown" hidden><p><span>Ваш лот</span><b id="qLotTotal"></b></p><p><span>Сборы аукциона</span><b id="qFee"></b></p><p><span>Доставка до Минска</span><b id="qDelivery"></b></p><p><span>Наша услуга · 590 BYN</span><b id="qService"></b></p><p id="qCustomsRow" hidden><span>Таможня и оформление</span><b id="qCustomsTotal"></b></p></div></details>
  <button id="qToDetailed" class="quick-text-link" type="button">Перейти к подробному расчёту →</button>
  <button id="qShare" class="quick-text-link" type="button">Ссылка на этот расчёт</button><p id="qShareStatus" role="status" class="quick-share-status" hidden></p><input id="qShareUrl" type="url" readonly aria-label="Ссылка на быстрый расчёт" hidden/>
  <p id="qFxNote" class="quick-fx-note"></p>
</aside></div>
</section>

<div class="calc" id="quickDetailed" role="tabpanel" aria-labelledby="detailedTab" hidden>
<div class="calc-body">
<form autocomplete="off" id="calcForm">
<div class="simple-lot wide">
<label for="lotLookup">Есть номер лота? Заполним данные автомобиля</label>
<div class="simple-lot-input"><input id="lotLookup" type="text" maxlength="500" placeholder="Номер или ссылка Copart / IAAI"/><button id="findLot" class="btn btn-navy" type="button">Найти лот</button></div>
<p id="lotStatus" class="simple-help" role="status" aria-live="polite">Можно пропустить и заполнить поля ниже.</p>
<div id="lotCard" class="simple-lot-card" hidden><strong id="lotTitle"></strong><span id="lotFacts"></span><a id="lotSource" target="_blank" rel="noopener noreferrer">Открыть на аукционе ↗</a></div>
</div>
<div aria-label="Что считаем" class="tabs wide" role="radiogroup">
<label><input checked name="mode" type="radio" value="price"/><span>Знаю цену лота</span></label>
<label><input name="mode" type="radio" value="budget"/><span>Знаю свой бюджет</span></label>
</div>
<div class="field" id="carOnly"><label for="carMake">Марка <span class="simple-optional">необязательно</span></label><input id="carMake" placeholder="Выберите или начните вводить" type="text"/></div>
<div class="field"><label for="carModel">Модель</label><input id="carModel" placeholder="Сначала выберите марку" type="text" disabled/></div>
<p id="modelStatus" class="simple-help wide" role="status" hidden></p>
<div class="field"><label for="price" id="priceLabel">Цена лота, $</label><input id="price" inputmode="decimal" min="1" step="100" type="number" value="12000"/></div>
<div class="field"><label for="year">Год выпуска</label><select id="year"></select></div>
<div class="field"><label for="volume">Объём двигателя, см³</label><input id="volume" inputmode="numeric" min="0" step="1" type="number" value="2000"/></div>
<div class="field wide" id="clearanceField" hidden><label for="clearance">Клиренс, мм · для авто старше пяти лет</label><input id="clearance" type="number" min="1" max="1000" step="1" inputmode="numeric" placeholder="Укажите по характеристикам модели"/><p class="simple-help">До 165 мм включительно — Клайпеда; выше или неизвестно — предварительно Поти.</p></div>
<div class="field wide" id="vehicleSizeField"><label for="vehicleSize">Размер автомобиля</label><select id="vehicleSize"><option value="compact">Легковой · седан, хэтчбек</option><option value="crossover">Кроссовер · SUV среднего размера</option><option value="large">Крупный SUV / пикап</option></select><p class="simple-help">Учтём известные надбавки по США и морю. Для крупных машин окончательный тариф зависит от габаритов.</p></div>
<div class="field" id="fuelField"><label for="simpleFuel">Двигатель</label><select id="simpleFuel"><option value="ice">Бензин / дизель</option><option value="hybrid">Гибрид</option><option value="ev">Электро</option></select>
<div hidden aria-hidden="true"><label><input checked name="fuel" type="radio" value="ice"/>Бензин / дизель</label><label id="hybridChoice"><input name="fuel" type="radio" value="hybrid"/>Гибрид</label><label><input name="fuel" type="radio" value="ev"/>Электро</label></div></div>
<p class="hint wide" hidden id="evHint">Для электромобиля объём не нужен. Условия ввоза подтвердим по лоту.</p>
<p class="simple-help wide" id="exampleStatus">Сейчас показан пример. Введите цену, год и двигатель своего автомобиля.</p>
<div class="field wide"><label for="port">Доставка через</label><select id="port"><option value="auto">Подобрать автоматически</option><option value="klaipeda">Клайпеда (Литва)</option><option value="poti">Поти (Грузия)</option></select></div>
<p class="route" id="route"></p>
<details class="simple-settings wide" id="deliverySettings"><summary>Аукцион и площадка <span id="deliverySummary"></span></summary><div class="simple-settings-body">
<div class="field"><label for="simpleAuction">Аукцион</label><select id="simpleAuction"><option value="copart">Copart</option><option value="iaai">IAAI</option></select><div hidden aria-hidden="true"><label><input checked name="auction" type="radio" value="copart"/>Copart</label><label><input name="auction" type="radio" value="iaai"/>IAAI</label></div></div>
<div class="field"><label for="yard">Площадка</label><input id="yard" list="yardList" autocomplete="off" aria-describedby="yardExample"/><datalist id="yardList"></datalist></div>
<p class="simple-help wide" id="yardExample">ALBANY — начальный пример. Для точного тарифа выберите площадку своего лота.</p>
<label class="check wide" for="sublot"><input id="sublot" type="checkbox"/> Машина вне площадки аукциона (Sublot / Offsite), +100 $</label>
</div></details>
<details class="simple-settings wide" id="costSettings"><summary>Ремонт, льгота и наша услуга <span id="costSummary"></span></summary><div class="simple-settings-body">
<div class="field"><label for="repair">Ремонт, $ <span class="simple-optional">необязательно</span></label><input id="repair" aria-describedby="repairHelp" max="100000" min="0" step="100" type="number" value="0"/></div>
<div class="field"><label for="service">Наша услуга, BYN</label><select id="service"><option value="590">Покупка лота · 590</option><option value="990">Подбор · 990</option><option value="1999">Под ключ · 1999</option></select></div>
<label class="check wide" for="benefit" id="benefitWrap"><input id="benefit" aria-describedby="benefitHelp" type="checkbox" checked/> Льгота 50% по Указу № 140</label>
<p class="simple-help wide" id="benefitHelp">Снимите галочку, если льгота не применяется.</p>
<p class="simple-help wide" id="repairHelp">По умолчанию ремонт не включён. Впишите свою сумму, если хотите учесть его в итоге. Возраст на границе 3 и 5 лет уточняется по дате выпуска.</p>
<div class="field wide"><label id="vtypeLabel">Что везём</label><div aria-labelledby="vtypeLabel" class="seg" role="radiogroup"><label><input checked name="vtype" type="radio" value="car"/><span>Автомобиль</span></label><label><input name="vtype" type="radio" value="moto"/><span>Мотоцикл</span></label></div></div>
</div></details>
<button hidden aria-controls="adv" aria-expanded="false" id="advToggle" type="button"></button><div id="adv" hidden></div>
</form>
<div aria-live="polite" class="bill">
<p class="calc-error" hidden="" id="calcInputError" role="status"></p><div class="bill-in">
<div class="bill-head"><b>Ваш расчёт до Минска</b><span>предварительный</span></div>
<p class="budget-error" hidden="" id="budgetError" role="status">Даже без цены лота расходы выше этого бюджета. Увеличьте бюджет или обсудите варианты с менеджером.</p>
<div class="maxbid" hidden="" id="maxbid"><span>Можно ставить на аукционе до</span><b class="num" id="r-max"></b></div>
<p id="sizeQuoteNote" class="quick-warning" hidden></p>
<div class="total"><span id="simpleTotalLabel">В Минске без ремонта</span><b class="num" id="r-total"></b></div>
<small class="num" id="r-byn"></small>
<div class="simple-totals" aria-label="Из чего складывается цена"><p><span>Авто и сборы аукциона</span><b id="simpleAuctionTotal"></b></p><p><span>Вся доставка до Минска</span><b id="simpleDeliveryTotal"></b></p><p><span>Таможня и оформление</span><b id="simpleCustomsTotal"></b></p><p><span>Наша услуга</span><b id="simpleServiceTotal"></b></p><p id="simpleRepairRow" hidden><span>Резерв ремонта</span><b id="simpleRepairTotal"></b></p></div><details class="simple-breakdown"><summary>Показать подробную смету</summary><div class="grp">Аукцион <i>платите аукциону</i></div>
<div class="row"><span>Лот на аукционе</span><span class="num" id="r-lot"></span></div>
<div class="row"><span>Сборы аукциона</span><span class="num" id="r-fee"></span></div>
<div class="grp">Доставка <i>платите перевозчику</i></div>
<div class="row"><span id="r-inland-l">Доставка по США до порта</span><span class="num" id="r-inland"></span></div>
<div class="row" hidden="" id="r-extra-row"><span id="r-extra-l"></span><span class="num" id="r-extra"></span></div>
<div class="row"><span id="r-sea-l">Море</span><span class="num" id="r-sea"></span></div>
<div class="row"><span id="r-last-l">Доставка в Минск</span><span class="num" id="r-last"></span></div>
<div class="grp">Таможня <i>платите государству</i></div>
<div class="row"><span id="r-duty-l">Таможенная пошлина</span><span class="num" id="r-duty"></span></div>
<div class="row"><span id="r-cust-l">Утильсбор, СВХ, декларант</span><span class="num" id="r-cust"></span></div>
<div class="grp">Мы <i>по договору</i></div>
<div class="row ours"><span>Наша услуга</span><span class="num" id="r-ours"></span></div>
<div class="grp" id="simpleRepairGroup" hidden>Восстановление <i>отдельный бюджет</i></div><div class="row" id="simpleRepairDetail" hidden><span>Ваш резерв</span><span class="num" id="r-repair"></span></div>
</details><p class="note warn-note" hidden="" id="motoNote"><b>Расчёт для мотоциклов ориентировочный.</b> Доставку мотоцикла считаем по вашему лоту: стоимость места в контейнере зависит от размеров техники.</p>
<p class="note">Расчёт ориентировочный: стоимость зависит от аукциона, площадки и состояния лота. Таможня считает платежи по курсу на день декларации. Точный расчёт по конкретной машине сделает менеджер.</p>
<div class="actions">
<a class="btn btn-red" href="#lead" id="sendCalc">Получить точный расчёт</a>
<button class="btn btn-line" id="shareCalc" type="button">Ссылка на этот расчёт</button>
</div>
<p class="note" hidden="" id="shareCalcStatus" role="status"></p>
<div class="field" hidden="" id="shareCalcFallback"><label for="shareCalcUrl">Скопируйте ссылку</label><input id="shareCalcUrl" readonly="" type="url"/></div>
</div>
</div>
</div>
</div>
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
<li><strong>Наша услуга.</strong> Фиксированная сумма по договору, в расчёте стоит минимальный тариф 590 BYN.</li>
</ul>
<h2>Почему Клайпеда или Поти</h2>
<p>Рабочее правило маршрута: авто до пяти лет с двигателем до 1,9 л — Клайпеда; старше пяти лет — Клайпеда при клиренсе не выше 165 мм, независимо от объёма. Остальные — Поти. Для мотоцикла сумма покупки, сборов и доставки до Клайпеды должна быть не выше 5 000 $. Дату выпуска и параметры по конкретной машине подтвердит менеджер.</p>
<h2>Мотоциклы</h2>
<p>Переключите «Мотоцикл»: пошлина для мотоциклов считается процентом от таможенной стоимости плюс НДС 20%, утильсбор не платится. Стоимость доставки мотоцикла пока ориентировочная, точную сумму назовём по вашему лоту.</p>
</div>
<div class="box">
<h2>Ремонт — по желанию</h2>
<p>По умолчанию стоимость ремонта не включена в итог. Если хотите учесть ремонт, раскройте «Ремонт, льгота и наша услуга» и впишите свою сумму. Калькулятор добавит её к итогу. Точную стоимость восстановления менеджер поможет оценить по фото и отчёту аукциона до ставки.</p>
<?php
$amz_retail_fx = function_exists('amz_nbrb_snapshot') ? amz_nbrb_snapshot() : null;
$amz_retail_fx_valid = is_array($amz_retail_fx) && isset($amz_retail_fx['USD'], $amz_retail_fx['EUR'], $amz_retail_fx['date'])
    && is_numeric($amz_retail_fx['USD']) && is_finite((float)$amz_retail_fx['USD']) && (float)$amz_retail_fx['USD'] > 0
    && is_numeric($amz_retail_fx['EUR']) && is_finite((float)$amz_retail_fx['EUR']) && (float)$amz_retail_fx['EUR'] > 0
    && preg_match('/^\d{4}-\d{2}-\d{2}$/', $amz_retail_fx['date']);
if ($amz_retail_fx_valid) {
    $amz_retail_date_parts = explode('-', $amz_retail_fx['date']);
    $amz_retail_fx_valid = checkdate((int)$amz_retail_date_parts[1], (int)$amz_retail_date_parts[2], (int)$amz_retail_date_parts[0]);
}
?>
<p id="retailRatesNote"><?php if ($amz_retail_fx_valid) { ?>Курсы НБРБ на <?php echo esc_html(implode('.', array_reverse($amz_retail_date_parts))); ?>: 1 $ = <?php echo esc_html($amz_retail_fx['USD']); ?> BYN, 1 € = <?php echo esc_html(number_format($amz_retail_fx['EUR'] / $amz_retail_fx['USD'], 4, '.', '')); ?> $. <?php if (!empty($amz_retail_fx['stale'])) { ?>Используется сохранённый курс; обновление временно недоступно. <?php } ?>Таможня считает платежи по курсу на день декларации, поэтому итог может немного измениться.<?php } else { ?>Не удалось загрузить курсы НБРБ. Обновите страницу или свяжитесь с менеджером.<?php } ?></p>
<p><a class="btn btn-navy" href="/tamozhennyj-kalkulator/">Только таможня: отдельный калькулятор</a></p>
</div>
</div>
</section>
<section class="calc-status-bottom" aria-labelledby="calcStatusTitle"><div class="wrap"><div class="calc-status-card"><h2 id="calcStatusTitle">Калькулятор пока в доработке</h2><p>Результаты расчёта могут быть неточными. Рекомендуем связаться с менеджером для точного расчёта по вашему автомобилю.</p><div class="calc-status-links"><a class="btn btn-navy" href="#lead">Связаться с менеджером</a><a class="calc-status-phone" href="tel:+375296332828">+375 (29) 633-28-28</a></div></div></div></section>
<section class="lead-sec" id="lead"><div class="wrap"><div class="sec-head" style="margin:0"><p class="eyebrow">Расчёт по вашему лоту</p><h2>Получить точный расчёт</h2><p>Оставьте телефон — менеджер проверит выбранный лот, маршрут и все расходы до Минска.</p><div class="retail-summary"><label for="lcar">Ваш предварительный расчёт</label><textarea aria-describedby="retailSummaryNote" id="lcar" placeholder="Параметры активного режима появятся здесь автоматически." readonly="" rows="7"></textarea><p class="note" id="retailSummaryNote">Параметры расчёта передадим менеджеру вместе с заявкой.</p></div></div><div class="retail-form-panel"><?php echo do_shortcode('[contact-form-7 id="'.(int)get_option('amz_retail_form_id').'" title="Розничный калькулятор"]'); ?><p class="form-privacy">Ответим в рабочее время: Пн–Пт, 10:00–19:00.</p></div></div></section>
</main>
