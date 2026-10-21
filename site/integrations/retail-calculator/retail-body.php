<main id="amz-retail-calc">
<nav aria-label="Хлебные крошки" class="crumbs wrap"><ol><li><a href="/">Главная</a></li><li><span aria-current="page">Калькулятор для розничных клиентов</span></li></ol></nav>
<div class="page-head"><div class="wrap">
<p class="eyebrow">Калькулятор</p>
<h1>Калькулятор для розничных клиентов</h1>
<p class="lead">Сколько стоит пригнать авто из Америки в Минск: лот, сборы аукциона, доставка, таможня и наша услуга. Можно идти и обратным путём: указать бюджет и узнать, до какой суммы ставить на аукционе.</p>
</div></div>
<section class="calc-sec" id="calc">
<div class="wrap">
<div class="calc">
<div class="calc-body">
<form autocomplete="off" id="calcForm">
<div class="field wide">
<label id="vtypeLabel">Что везём</label>
<div aria-labelledby="vtypeLabel" class="seg" role="radiogroup">
<label><input checked="" name="vtype" type="radio" value="car"/><span>Автомобиль</span></label>
<label><input name="vtype" type="radio" value="moto"/><span>Мотоцикл</span></label>
</div>
</div>
<div aria-label="Что считаем" class="tabs wide" role="radiogroup">
<label><input checked="" name="mode" type="radio" value="price"/><span>Цена лота → итого</span></label>
<label><input name="mode" type="radio" value="budget"/><span>Бюджет → до какой ставки</span></label>
</div>
<div class="field wide" id="carOnly">
<label id="pickLabel">Популярные машины: нажмите, чтобы подставить</label>
<div aria-labelledby="pickLabel" class="picks" role="group">
<button data-p="9000,2021,1500,ice" type="button">Chevrolet Equinox</button>
<button data-p="8000,2021,1300,ice" type="button">Chevrolet Trailblazer</button>
<button data-p="11000,2021,2500,ice" type="button">Nissan Rogue</button>
<button data-p="12000,2021,1500,ice" type="button">Ford Bronco Sport</button>
<button data-p="9000,2024,1200,ice" type="button">Chevrolet Trax</button>
<button data-p="8500,2022,1500,ice" type="button">VW Jetta</button>
</div>
</div>
<div class="field">
<label for="price" id="priceLabel">Цена лота, $</label>
<input id="price" inputmode="numeric" min="100" step="100" type="number" value="12000"/>
</div>
<div class="field">
<label for="year">Год выпуска</label>
<select id="year"></select>
</div>
<div class="field">
<label for="volume">Объём двигателя, см³</label>
<input id="volume" inputmode="numeric" min="0" step="100" type="number" value="2000"/>
</div>
<div class="field" id="fuelField">
<label id="fuelLabel">Двигатель</label>
<div aria-labelledby="fuelLabel" class="seg" role="radiogroup">
<label><input checked="" name="fuel" type="radio" value="ice"/><span>Бензин / дизель</span></label>
<label id="hybridChoice"><input name="fuel" type="radio" value="hybrid"/><span>Гибрид</span></label>
<label><input name="fuel" type="radio" value="ev"/><span>Электро</span></label>
</div>
</div>
<p class="hint wide" hidden="" id="evHint">Для электромобиля объём двигателя не требуется. Условия ввоза подтвердим по лоту.</p>
<div class="field"><label for="repair">Бюджет восстановления, $</label><input id="repair" max="100000" min="0" step="100" type="number" value="1500"/></div>
<div class="field"><label for="service">Наша услуга, BYN</label><select id="service"><option value="590">Покупка лота · 590</option><option value="990">Подбор · 990</option><option value="1999">Под ключ · 1999</option></select></div>
<p class="hint wide">Резерв 1 500 $ — пример, не оценка повреждений. Укажите свой бюджет ремонта. Возраст по году выпуска ориентировочный: на границе 3 и 5 лет нужна точная дата выпуска.</p>
<button aria-controls="adv" aria-expanded="false" class="adv-toggle wide" id="advToggle" type="button">Точнее: аукцион, площадка, порт <span aria-hidden="true">▾</span></button>
<div class="adv wide" hidden="" id="adv">
<p class="adv-title">Если лот уже выбран</p>
<div class="field">
<label id="aucLabel">Аукцион</label>
<div aria-labelledby="aucLabel" class="seg" role="radiogroup">
<label><input checked="" name="auction" type="radio" value="copart"/><span>Copart</span></label>
<label><input name="auction" type="radio" value="iaai"/><span>IAAI</span></label>
</div>
</div>
<div class="field">
<label for="yard">Площадка</label>
<input autocomplete="off" id="yard" list="yardList" placeholder="Начните вводить: ALB…" aria-describedby="yardExample"/>
<p class="hint" id="yardExample">Начальная площадка ALBANY — пример. Выберите площадку своего лота; море зависит от неё.</p><datalist id="yardList"></datalist>
</div>
<div class="field">
<label for="port">Порт прибытия</label>
<select id="port">
<option value="auto">Подобрать автоматически</option>
<option value="klaipeda">Клайпеда (Литва)</option>
<option value="poti">Поти (Грузия)</option>
</select>
</div>
<div class="field checks">
<label class="check" for="sublot"><input id="sublot" type="checkbox"/> Машина не на площадке аукциона (Sublot / Offsite), +100 $</label>
<label class="check" for="benefit" id="benefitWrap"><input id="benefit" type="checkbox"/> Льгота 50% по Указу № 140</label>
</div>
</div>
<p class="route" id="route"></p>
</form>
<div aria-live="polite" class="bill">
<p class="calc-error" hidden="" id="calcInputError" role="status"></p><div class="bill-in">
<div class="bill-head"><b>Ваш расчёт до Минска</b><span>предварительный</span></div>
<p class="budget-error" hidden="" id="budgetError" role="status">Даже без цены лота расходы выше этого бюджета. Увеличьте бюджет или обсудите варианты с менеджером.</p>
<div class="maxbid" hidden="" id="maxbid"><span>Можно ставить на аукционе до</span><b class="num" id="r-max"></b></div>
<div class="grp">Аукцион <i>платите аукциону</i></div>
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
<div class="total"><span>Итого с восстановлением</span><b class="num" id="r-total"></b></div>
<small class="num" id="r-byn"></small>
<p class="note warn-note" hidden="" id="motoNote"><b>Расчёт для мотоциклов ориентировочный.</b> Доставку мотоцикла считаем по вашему лоту: стоимость места в контейнере зависит от размеров техники.</p>
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
