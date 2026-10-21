<main id="amz-retail-calc">
<nav aria-label="Хлебные крошки" class="crumbs wrap"><ol><li><a href="/">Главная</a></li><li><span aria-current="page">Калькулятор для розничных клиентов</span></li></ol></nav>
<div class="page-head"><div class="wrap">
<p class="eyebrow">Калькулятор · тест новой версии</p>
<h1>Сколько будет стоить авто в Минске?</h1>
<p class="lead">По номеру лота или вручную. С доставкой, таможней и вашим бюджетом ремонта.</p>
</div></div>
<section class="calc-sec" id="calc">
<div class="wrap">
<div class="calc">
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
<div class="field"><label for="repair">Бюджет восстановления, $</label><input id="repair" max="100000" min="0" step="100" type="number" value="1500"/></div>
<div class="field"><label for="service">Наша услуга, BYN</label><select id="service"><option value="590">Покупка лота · 590</option><option value="990">Подбор · 990</option><option value="1999">Под ключ · 1999</option></select></div>
<label class="check wide" for="benefit" id="benefitWrap"><input id="benefit" type="checkbox"/> Льгота 50% по Указу № 140</label>
<p class="simple-help wide">1 500 $ — пример резерва, а не оценка повреждений. Возраст на границе 3 и 5 лет уточняется по дате выпуска.</p>
<div class="field wide"><label id="vtypeLabel">Что везём</label><div aria-labelledby="vtypeLabel" class="seg" role="radiogroup"><label><input checked name="vtype" type="radio" value="car"/><span>Автомобиль</span></label><label><input name="vtype" type="radio" value="moto"/><span>Мотоцикл</span></label></div></div>
</div></details>
<button hidden aria-controls="adv" aria-expanded="false" id="advToggle" type="button"></button><div id="adv" hidden></div>
</form>
<div aria-live="polite" class="bill">
<p class="calc-error" hidden="" id="calcInputError" role="status"></p><div class="bill-in">
<div class="bill-head"><b>Ваш расчёт до Минска</b><span>предварительный</span></div>
<p class="budget-error" hidden="" id="budgetError" role="status">Даже без цены лота расходы выше этого бюджета. Увеличьте бюджет или обсудите варианты с менеджером.</p>
<div class="maxbid" hidden="" id="maxbid"><span>Можно ставить на аукционе до</span><b class="num" id="r-max"></b></div>
<div class="total"><span>В Минске с ремонтом</span><b class="num" id="r-total"></b></div>
<small class="num" id="r-byn"></small>
<div class="simple-totals" aria-label="Из чего складывается цена"><p><span>Авто и сборы аукциона</span><b id="simpleAuctionTotal"></b></p><p><span>Вся доставка до Минска</span><b id="simpleDeliveryTotal"></b></p><p><span>Таможня и оформление</span><b id="simpleCustomsTotal"></b></p><p><span>Наша услуга</span><b id="simpleServiceTotal"></b></p><p><span>Резерв ремонта</span><b id="simpleRepairTotal"></b></p></div><details class="simple-breakdown"><summary>Показать подробную смету</summary><div class="grp">Аукцион <i>платите аукциону</i></div>
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
<div class="grp">Восстановление <i>отдельный бюджет</i></div><div class="row"><span>Ваш резерв</span><span class="num" id="r-repair"></span></div>
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
<p>Через Евросоюз в Беларусь сейчас можно везти легковые машины с двигателем до 1,9 литра. Машины с большим объёмом, гибриды и электромобили идут через грузинский порт Поти. Калькулятор выбирает порт сам, но его можно сменить в расширенных настройках.</p>
<h2>Мотоциклы</h2>
<p>Переключите «Мотоцикл»: пошлина для мотоциклов считается процентом от таможенной стоимости плюс НДС 20%, утильсбор не платится. Стоимость доставки мотоцикла пока ориентировочная, точную сумму назовём по вашему лоту.</p>
</div>
<div class="box">
<h2>Восстановление — отдельная строка</h2>
<p>Указанный вами резерв ремонта включён в итог. Значение 1 500 $ — пример: стоимость повреждений оцениваем по фото и отчёту аукциона до ставки. Ремонт можно сделать у партнёрского СТО в Минске.</p>
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
<section class="lead-sec" id="lead"><div class="wrap"><div class="sec-head" style="margin:0"><p class="eyebrow">Расчёт по вашему лоту</p><h2>Получить точный расчёт</h2><p>Оставьте телефон — менеджер проверит выбранный лот, маршрут и все расходы до Минска.</p><div class="retail-summary"><label for="lcar">Ваш предварительный расчёт</label><textarea aria-describedby="retailSummaryNote" id="lcar" placeholder="Нажмите «Получить точный расчёт» под итоговой суммой, чтобы перенести сюда параметры." readonly="" rows="7"></textarea><p class="note" id="retailSummaryNote">Параметры расчёта передадим менеджеру вместе с заявкой.</p></div></div><div class="retail-form-panel"><?php echo do_shortcode('[contact-form-7 id="'.(int)get_option('amz_retail_form_id').'" title="Розничный калькулятор"]'); ?><p class="form-privacy">Ответим в рабочее время: Пн–Пт, 10:00–19:00.</p></div></div></section>
</main>
