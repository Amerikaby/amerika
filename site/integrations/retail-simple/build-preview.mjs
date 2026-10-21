import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)), base=path.join(here,'../retail-calculator');
let body=fs.readFileSync(path.join(base,'retail-body.php'),'utf8');
const form=`<form autocomplete="off" id="calcForm">
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
</form>`;
body=body.replace(/<form autocomplete="off" id="calcForm">[\s\S]*?<\/form>/,form);
body=body.replace('<h1>Калькулятор для розничных клиентов</h1>','<h1>Сколько будет стоить авто в Минске?</h1>');
body=body.replace(/<p class="lead">[\s\S]*?<\/p>/,'<p class="lead">По номеру лота или вручную. С доставкой, таможней и вашим бюджетом ремонта.</p>');
body=body.replace('<p class="eyebrow">Калькулятор</p>','<p class="eyebrow">Калькулятор · тест новой версии</p>');
const detailStart=body.indexOf('<div class="grp">Аукцион'), detailEnd=body.indexOf('<div class="total">',detailStart);
const details=body.slice(detailStart,detailEnd),totalStart=detailEnd,totalEnd=body.indexOf('<p class="note warn-note"',totalStart);
const total=body.slice(totalStart,totalEnd);
body=body.slice(0,detailStart)+total+`<div class="simple-totals" aria-label="Из чего складывается цена"><p><span>Авто и сборы аукциона</span><b id="simpleAuctionTotal"></b></p><p><span>Вся доставка до Минска</span><b id="simpleDeliveryTotal"></b></p><p><span>Таможня и оформление</span><b id="simpleCustomsTotal"></b></p><p><span>Наша услуга</span><b id="simpleServiceTotal"></b></p><p><span>Резерв ремонта</span><b id="simpleRepairTotal"></b></p></div><details class="simple-breakdown"><summary>Показать подробную смету</summary>`+details+'</details>'+body.slice(totalEnd);
body=body.replace('<span>Итого с восстановлением</span>','<span>В Минске с ремонтом</span>');
fs.writeFileSync(path.join(here,'preview-body.php'),body);
fs.writeFileSync(path.join(here,'production-body.php'),body.replace('Калькулятор · тест новой версии','Калькулятор'));
let js=fs.readFileSync(path.join(base,'retail.js'),'utf8');
js=js.replace('function calc(){','function calc(){\n    if(window.SIMPLE_LOT_ERROR || document.querySelector(\'#calcForm select[data-combo-invalid="true"]\')){ $("calcInputError").hidden=false; $("calcInputError").textContent=window.SIMPLE_LOT_ERROR || "Выберите значение из списка под полем."; document.querySelector("#calcForm + .bill .bill-in").hidden=true; $("sendCalc").setAttribute("aria-disabled","true"); return null; }');
js=js.replace('$("r-total").textContent = fmt(r.total);','$("r-total").textContent = fmt(r.total);\n    window.SIMPLE_LAST_RESULT=r; document.dispatchEvent(new CustomEvent("simplecalc:result",{detail:r}));');
js=js.replace('var url=location.origin+BASE+"kalkulyator/?"+query.toString()+"#calc";', 'query.set("make",$("carMake").value.trim()); query.set("model",$("carModel").value.trim()); query.set("lot",$("lotLookup").value.trim());\n    var url=location.origin+"/newcodex/kalkulyator-simple/?"+query.toString()+"#calc";');
js=js.replace('var fields=["Техника: "+checked("vtype")','var fields=["Автомобиль: "+[$("carMake").value,$("carModel").value].filter(Boolean).join(" "),"Лот: "+$("lotLookup").value,"Техника: "+checked("vtype")');
// Closed <details> must not affect the estimate sent to the manager.
js=js.replace('e.innerText.trim().replace(/\\n+/g,": ")','Array.from(e.children).map(function(c){return c.textContent.trim()}).join(": ")');
js=js.replace('"Объём: "+$("volume").value+" см³"','"Объём: "+(checked("fuel")==="Электро"?"не требуется (электро)":$("volume").value+" см³")');
fs.writeFileSync(path.join(here,'retail.js'),js);
fs.writeFileSync(path.join(here,'retail-production.js'),js.replace('/newcodex/kalkulyator-simple/?','/kalkulyator/?'));
console.log('Preview generated. Calculation formulas and tariffs reused without changes.');
