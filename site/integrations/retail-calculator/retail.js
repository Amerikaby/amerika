/* Ставки калькуляторов. Единственный источник цифр: используется в site.js и при сборке (таблицы пошлин). */
/* Все ставки и тарифы в одном месте. Логистика и сборы аукциона — ориентиры, их нужно сверить с актуальными ценами. */
var CONFIG = {
  usdByn: 3.0091,          // курс USD/BYN
  eurUsd: 3.3749 / 3.0091,          // курс EUR/USD
  ratesDate: "2026-10-18",
  repairBudget: 1500, // editable illustrative allowance, not a lot-specific repair quote
  servicePrices: [590, 990, 1999],
  serviceByn: 590,       // наша услуга (минимальный тариф)
  leadEndpoint: "api/lead.php", // WordPress mail transport; recipient from existing contact form 103
  // Счётчики. Пусто = не загружаются. Пример: gtm "GTM-XXXXXXX", ym 12345678, ga4 "G-XXXXXXXXXX".
  // Если подключён GTM, GA4 и Метрику лучше ставить внутри GTM, а здесь оставить пустыми.
  analytics: {}, // existing live counter; preview goals stay local
  auctionFixed: 160,     // gate fee, environmental fee, документы, $
  auctionFee: [          // сбор покупателя по цене лота, $
    [500,200],[1000,350],[1500,450],[2000,525],[3000,650],[4000,750],
    [5000,850],[6000,900],[8000,1000],[10000,1100],[15000,1250]
  ],
  auctionFeeTopPct: 0.085, // свыше 15 000 $
  sublot: 100,           // машина не на площадке аукциона (Sublot / Offsite), $ для клиента
  altFuelEur: 175,       // доплата за доставку гибрида или электромобиля, EUR
  inland: {east:450, center:650, west:900},   // если площадка не выбрана — east
  sea: {
    klaipeda: {east:1150, center:1350, west:1900},
    poti:     {east:2000, center:2200, west:2800}
  },
  lastLeg: {klaipeda:650, poti:1700},  // от порта до Минска, $
  euMaxCc: 1900,                       // через ЕС: до 1,9 л, без гибридов и электро
  // Было одной суммой customsExtraByn: 945 BYN. Теперь утильсбор по возрасту + сбор + СВХ/декларант.
  utilByn: {upTo3: 624.92, over3: 1282.02},  // утильсбор, легковые физлиц, с 29.04.2026 (пост. СМ № 195). Для электро: TODO: уточнить льготную ставку
  customsFeeByn: 120,                  // таможенный сбор за оформление, BYN
  svhByn: 200,                         // TODO: уточнить у Леонида: СВХ и услуги декларанта, BYN (сейчас 945 − 624,92 − 120 ≈ 200)
  duty: {                              // физлица, EUR за см³ или % от стоимости
    under3: [[8500,.54,2.5],[16700,.48,3.5],[42300,.48,5.5],[84500,.48,7.5],[169000,.48,15],[Infinity,.48,20]],
    from3to5: [[1000,1.5],[1500,1.7],[1800,2.5],[2300,2.7],[3000,3.0],[Infinity,3.6]],
    over5: [[1000,3.0],[1500,3.2],[1800,3.5],[2300,4.8],[3000,5.0],[Infinity,5.7]]
  },
  // Мотоциклы (ТН ВЭД 8711), физлица. Сборы аукциона и наша услуга такие же, как у машин.
  // Единая ставка за см³ к мотоциклам не применяется: пошлина % от таможенной стоимости + НДС 20%, утильсбора нет.
  moto: {
    inland: {east:350, center:500, west:700},          // TODO: уточнить, доставка по США до порта, $
    sea: {                                              // TODO: уточнить, место в контейнере, $
      klaipeda: {east:600, center:750, west:1000},
      poti:     {east:1400, center:1550, west:1850}
    },
    lastLeg: {klaipeda:350, poti:900},                  // TODO: уточнить, от порта до Минска, $
    autoPort: "klaipeda",                               // TODO: уточнить маршрут для мотоциклов
    dutyPct: [[250,.14],[800,.15],[Infinity,.10]],      // ДВС: до 250 см³ 14%, 250–800 см³ 15%, свыше 800 см³ 10%
    dutyPctElectric: .14,                               // электромотоцикл 14%
    vat: .20,                                           // НДС от (таможенная стоимость + пошлина)
    utilByn: 0,                                         // утильсбор для мотоциклов не платится (подтвердить у декларанта)
    // Таможенная стоимость = лот + сборы аукциона + доставка до порта ЕАЭС. TODO: уточнить у декларанта, как считают на практике.
    // Льгота по Указу № 140: возврат 50% пошлины и НДС, таможенный сбор полностью.
  },
  // Штаты по направлению к порту отправки в США. Заменим на ваш файл с ценой по каждой площадке.
  states: {
    west: ["CA","OR","WA","NV","AZ","ID","UT","MT","WY","AK","HI"],
    center: ["TX","OK","LA","AR","KS","NE","CO","NM","MO","IA","MN","ND","SD","IL","WI","IN","MS"]
  }
};

var YARDS = {copart:Object.keys(RETAIL_RATES.copart), iaai:Object.keys(RETAIL_RATES.iaai)};
var PORTS = {klaipeda:{name:"Клайпеду (Литва)",short:"Клайпеды",from:"Клайпеда"},poti:{name:"Поти (Грузия)",short:"Поти",from:"Поти"}};

/* Формулы калькуляторов без DOM. Используются в браузере (site.js) и при сборке (примеры расчёта на страницах машин). */
var CALC_YEAR = new Date().getFullYear();
/* Сбор аукциона, $ */
function auctionFee(p){
  for (var i = 0; i < CONFIG.auctionFee.length; i++) if (p < CONFIG.auctionFee[i][0]) return CONFIG.auctionFee[i][1] + CONFIG.auctionFixed;
  return p * CONFIG.auctionFeeTopPct + CONFIG.auctionFixed;
}
/* Пошлина легкового авто в EUR по таблицам CONFIG.duty: возраст = текущий год минус год выпуска. */
function dutyEur(eur, year, cc){
  var age = CALC_YEAR - year, d = 0, t, i, T = CONFIG.duty;
  if (age < 3) {
    t = T.under3;
    for (i = 0; i < t.length; i++) if (eur <= t[i][0]) { d = Math.max(eur * t[i][1], cc * t[i][2]); break; }
  } else {
    t = age <= 5 ? T.from3to5 : T.over5;
    for (i = 0; i < t.length; i++) if (cc <= t[i][0]) { d = cc * t[i][1]; break; }
  }
  return d;
}
/* Утильсбор легкового авто, BYN: до 3 лет включительно и старше. */
function utilByn(year){ return (CALC_YEAR - year) <= 3 ? CONFIG.utilByn.upTo3 : CONFIG.utilByn.over3; }
/* Мотоцикл: пошлина % от таможенной стоимости по объёму, электро отдельно. */
function motoRate(cc, electric){
  if (electric) return CONFIG.moto.dutyPctElectric;
  var t = CONFIG.moto.dutyPct;
  for (var i = 0; i < t.length; i++) if (cc <= t[i][0]) return t[i][1];
  return t[t.length - 1][1];
}
/* Пошлина + НДС мотоцикла в той же валюте, что и value. */
function motoDutyVat(value, cc, electric){
  var duty = value * motoRate(cc, electric), vat = (value + duty) * CONFIG.moto.vat;
  return {duty:duty, vat:vat};
}
/* Порт по умолчанию: через ЕС только ДВС до 1,9 л. */
function autoPortFor(moto, alt, cc){ return moto ? CONFIG.moto.autoPort : ((!alt && cc <= CONFIG.euMaxCc) ? "klaipeda" : "poti"); }
/* Площадка должна быть собственной записью тарифа, а не свойством прототипа. */
function retailRateFor(auction, yard){
  var own = Object.prototype.hasOwnProperty;
  var group = own.call(RETAIL_RATES, auction) ? RETAIL_RATES[auction] : null;
  return group && own.call(group, yard) ? group[yard] : null;
}
/* Полная стоимость под ключ, $. o: {moto, year, cc, alt, ev, region, port, sublot, benefit} */
function costOf(price, o){
  var L = o.moto ? CONFIG.moto : CONFIG;   // у мотоциклов своя логистика и таможня
  var fee = auctionFee(price);
  var inland = L.inland[o.region] + (o.sublot ? CONFIG.sublot : 0);
  var row = retailRateFor(o.auction || "copart", o.yard || "ALBANY - NY");
  var sea = o.port === "klaipeda" ? (row ? row[o.moto ? "moto" : "car"] : NaN) : L.sea.poti[o.region];
  var last = L.lastLeg[o.port];
  var extra = (!o.moto && o.alt) ? CONFIG.altFuelEur * CONFIG.eurUsd : 0;
  var duty, cust;
  if (o.moto) {
    // TODO: уточнить у декларанта базу: сейчас лот + сборы аукциона + доставка до порта ЕАЭС
    var dv = motoDutyVat(price + fee + inland + sea, o.cc, o.alt);
    duty = (dv.duty + dv.vat) * (o.benefit ? .5 : 1);
    cust = (CONFIG.moto.utilByn + CONFIG.customsFeeByn + CONFIG.svhByn) / CONFIG.usdByn;
  } else {
    duty = (o.ev ? 0 : dutyEur(price / CONFIG.eurUsd, o.year, o.cc) * CONFIG.eurUsd) * (o.benefit ? .5 : 1);
    cust = (utilByn(o.year) + CONFIG.customsFeeByn + CONFIG.svhByn) / CONFIG.usdByn;
  }
  var service = CONFIG.servicePrices.indexOf(Number(o.serviceByn)) >= 0 ? Number(o.serviceByn) : CONFIG.serviceByn;
  var ours = service / CONFIG.usdByn;
  var repair = Math.max(0, Number.isFinite(Number(o.repair)) ? Number(o.repair) : CONFIG.repairBudget);
  var delivered = price + fee + inland + sea + last + extra + duty + cust + ours;
  return {price:price, fee:fee, inland:inland, sea:sea, last:last, extra:extra, duty:duty, cust:cust, ours:ours, repair:repair, delivered:delivered,
          total: delivered + repair};
}

/* Максимальная ставка с шагом 50 $. На границах ставок пошлины итог может
   уменьшаться, поэтому ищем отдельно внутри каждого тарифного интервала. */
function maxBidForBudget(budget, o){
  if (!Number.isFinite(budget) || budget < 0) return 0;
  var step = 50, upper = Math.floor(budget / step), cuts = [0, upper + 1];
  function boundary(price){
    if (!Number.isFinite(price)) return;
    var index = Math.floor(price / step);
    // Выделяем и точную границу: аукцион использует <, пошлина — <=.
    if (index > 0 && index <= upper) cuts.push(index);
    if (index + 1 > 0 && index + 1 <= upper) cuts.push(index + 1);
  }
  CONFIG.auctionFee.forEach(function(tier){ boundary(tier[0]); });
  if (!o.moto && !o.ev && CALC_YEAR - o.year < 3) {
    CONFIG.duty.under3.forEach(function(tier){ boundary(tier[0] * CONFIG.eurUsd); });
  }
  cuts = cuts.sort(function(a, b){ return a - b; }).filter(function(n, i, all){ return !i || n !== all[i - 1]; });
  function fits(index){
    var total = costOf(index * step, o).total;
    return Number.isFinite(total) && total <= budget;
  }
  for (var i = cuts.length - 2; i >= 0; i--) {
    var lo = cuts[i], hi = cuts[i + 1] - 1;
    if (!fits(lo)) continue;
    while (lo < hi) {
      var mid = Math.ceil((lo + hi) / 2);
      if (fits(mid)) lo = mid; else hi = mid - 1;
    }
    return lo * step;
  }
  return 0;
}

(function(){
"use strict";
var BASE="/", $=function(id){return document.getElementById(id)};
var qsa=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var nowYear=new Date().getFullYear(),params=new URLSearchParams(location.search);
function track(goal,p){try{if(typeof window.ym==="function")window.ym(91733040,"reachGoal",goal,p||{})}catch(e){}}
function validFields(rules, error) {
  var messages=[];
  rules.forEach(function(r){var el=$(r[0]), n=Number(el.value), bad=!el.disabled && (!el.value.trim() || !Number.isFinite(n) || n<r[1] || n>r[2]);el.setAttribute("aria-invalid",String(bad));var hint=$(el.id+"Error");if(!hint){hint=document.createElement("small");hint.id=el.id+"Error";hint.className="field-error";el.after(hint);el.setAttribute("aria-describedby",((el.getAttribute("aria-describedby")||"")+" "+hint.id).trim());}hint.textContent=bad?r[3]:"";hint.hidden=!bad;if(bad)messages.push(r[3]);});
  error.textContent=messages.join(" ");error.hidden=!messages.length;return !messages.length;
}

/* ---------- Общие формулы ---------- */
var fmt = function(n){return Math.round(n).toLocaleString("ru-RU").replace(/,/g," ") + " $"};
var fmtEur = function(n){return Math.round(n).toLocaleString("ru-RU").replace(/,/g," ") + " €"};
var fmtByn = function(n){return Math.round(n).toLocaleString("ru-RU").replace(/,/g," ") + " BYN"};
function fillYears(sel, def){
  for (var y = nowYear; y >= nowYear - 20; y--) {
    var o = document.createElement("option"); o.value = y; o.textContent = y;
    if (y === def) o.selected = true;
    sel.appendChild(o);
  }
}

/* ---------- Калькулятор под ключ ---------- */
(function(){
  if (!$("calcForm")) return;
  var val = function(name){return document.querySelector('#calcForm input[name="' + name + '"]:checked').value};
  fillYears($("year"), nowYear - 4);

  function fillYards(){
    var list = $("yardList"); list.innerHTML = "";
    YARDS[val("auction")].forEach(function(n){ var o = document.createElement("option"); o.value = n; list.appendChild(o); });
  }
  function regionOf(yard){
    var m = /(?:,| -)\s*([A-Z]{2})\s*$/.exec(yard || "");
    if (!m) return null;
    if (CONFIG.states.west.indexOf(m[1]) >= 0) return "west";
    if (CONFIG.states.center.indexOf(m[1]) >= 0) return "center";
    return "east";
  }
  var cost = costOf;
  function options(){
    var moto = val("vtype") === "moto";
    var ev=val("fuel")==="ev", cc=ev?0:Number($("volume").value), alt=val("fuel")!=="ice";
    var yard = $("yard").value.trim(), region = regionOf(yard) || "east";
    var autoPort = autoPortFor(moto, alt, cc);
    var port = $("port").value === "auto" ? autoPort : $("port").value;
    return {auction:val("auction"), moto:moto, year:+$("year").value, cc:cc, alt:alt, ev:!moto && ev, region:region, yard:yard,
            port:port, autoPort:autoPort, sublot:$("sublot").checked, benefit:$("benefit").checked, repair:Math.max(0,+$("repair").value||0), serviceByn:+$("service").value};
  }
  function calc(){
    var ev=val("fuel")==="ev";$("volume").disabled=ev;
    $("evHint").hidden=!ev;$("carOnly").hidden=val("vtype")==="moto";
    var valid=validFields([["volume",1,10000,"Укажите объём двигателя больше нуля."],["price",1,10000000,"Укажите положительную цену или бюджет."],["repair",0,100000,"Укажите резерв ремонта от 0 до 100 000 $."],["year",nowYear-20,nowYear,"Выберите год выпуска."]],$("calcInputError"));
    document.querySelector("#calcForm + .bill .bill-in").hidden=!valid;$("sendCalc").setAttribute("aria-disabled",String(!valid));if(!valid)return null;
    var o = options(), budget = val("mode") === "budget";
    var rate = retailRateFor(o.auction, o.yard);
    var known = rate && Number.isFinite(rate[o.moto ? "moto" : "car"]);
    $("yard").setAttribute("aria-invalid", String(!known));
    if (!known) {
      $("calcInputError").hidden=false;
      $("calcInputError").textContent="Выберите площадку из списка своего аукциона.";
      document.querySelector("#calcForm + .bill .bill-in").hidden=true;
      $("sendCalc").setAttribute("aria-disabled","true");
      return null;
    }
    var input = Math.max(0, +$("price").value || 0), r;
    if (budget) {
      r = cost(maxBidForBudget(input, o), o);
    } else {
      r = cost(input, o);
    }
    if (!Object.keys(r).every(function(key){ return Number.isFinite(r[key]); })) {
      $("calcInputError").hidden=false;
      $("calcInputError").textContent="Не удалось рассчитать стоимость. Проверьте параметры или свяжитесь с менеджером.";
      document.querySelector("#calcForm + .bill .bill-in").hidden=true;
      $("sendCalc").setAttribute("aria-disabled","true");
      return null;
    }
    $("priceLabel").textContent = budget ? "Бюджет под ключ, $" : "Цена лота, $";
    $("maxbid").hidden = !budget;
    $("budgetError").hidden = !budget || cost(0,o).total <= input;
    if(budget && cost(0,o).total>input) $("maxbid").hidden=true;
    $("r-max").textContent = fmt(r.price);
    $("evHint").hidden = !ev;
    $("carOnly").hidden = o.moto;
    $("hybridChoice").hidden=o.moto;
    $("r-duty-l").textContent = o.moto ? "Пошлина и НДС 20%" : "Таможенная пошлина";
    $("r-cust-l").textContent = o.moto ? "Таможенный сбор, СВХ, декларант" : "Утильсбор, СВХ, декларант";
    $("motoNote").hidden = !o.moto;

    var P = PORTS[o.port], txt;
    if (o.moto) {
      txt = "Маршрут: через <b>" + P.name + "</b>. Для мотоциклов маршрут подтверждаем при расчёте. Порт можно сменить.";
    } else if (o.port === o.autoPort) {
      txt = "Маршрут: через <b>" + P.name + "</b>, " + (o.port === "klaipeda" ? "двигатель до 1,9 л можно везти через ЕС."
        : (o.alt ? "гибриды и электромобили обычно везём в обход ЕС." : "через ЕС сейчас не везут машины с двигателем больше 1,9 л.")) + " Порт можно сменить.";
    } else if (o.port === "klaipeda") {
      txt = "Через Клайпеду такую машину могут не пропустить: ограничения ЕС для двигателей больше 1,9 л, гибридов и электро. Уточните у менеджера.";
    } else {
      txt = "Маршрут: через <b>" + P.name + "</b>, вы выбрали его сами.";
    }
    txt += o.port === "poti" ? " Тарифы Поти предварительные: подтвердим по конкретному лоту." : " Море рассчитано по выбранной площадке. Наземная доставка — предварительно.";
    $("route").innerHTML = txt;
    $("route").classList.toggle("warn", !o.moto && o.port === "klaipeda" && o.port !== o.autoPort);

    $("r-lot").textContent = fmt(r.price);
    $("r-fee").textContent = fmt(r.fee);
    $("r-inland-l").textContent = "По США до порта (предварительно)" + (o.sublot ? ", с Sublot" : "");
    $("r-inland").textContent = fmt(r.inland);
    $("r-sea-l").textContent = "Море до " + P.short;
    $("r-sea").textContent = fmt(r.sea);
    $("r-last-l").textContent = P.from + " → Минск (предварительно)";
    $("r-last").textContent = fmt(r.last);
    $("r-extra-row").hidden = !r.extra;
    $("r-extra-l").textContent = "Доплата за гибрид / электро";
    $("r-extra").textContent = fmt(r.extra);
    $("r-duty").textContent = o.ev ? "0 $ (электро)" : fmt(r.duty);
    $("r-cust").textContent = fmt(r.cust);
    $("r-ours").textContent = fmt(r.ours);
    $("r-repair").textContent = fmt(r.repair);
    $("r-total").textContent = fmt(r.total);
    $("r-byn").textContent = "≈ " + Math.round(r.total * CONFIG.usdByn).toLocaleString("ru-RU") + " BYN по курсу " + CONFIG.usdByn + " (НБРБ, " + CONFIG.ratesDate + ")";
    refreshRetailLead();
    return {moto:o.moto, price:Math.round(r.price), year:o.year, cc:o.cc, alt:o.alt, port:o.port, yard:o.yard, budget:budget, repair:r.repair, serviceByn:o.serviceByn, benefit:o.benefit, total:Math.round(r.total)};
  }

  $("advToggle").addEventListener("click", function(){
    var open = this.getAttribute("aria-expanded") !== "true";
    this.setAttribute("aria-expanded", open); $("adv").hidden = !open;
  });
  qsa('#calcForm input[name="auction"]').forEach(function(r){
    r.addEventListener("change", function(){ fillYards(); $("yard").value = "ALBANY - NY"; calc(); });
  });
  qsa('#calcForm input[name="mode"]').forEach(function(r){
    r.addEventListener("change", function(){ $("price").value = r.value === "budget" ? 20000 : 12000; calc(); });
  });
  qsa('#calcForm input[name="vtype"]').forEach(function(r){
    r.addEventListener("change", function(){
      var moto = r.value === "moto";
      $("volume").value = moto ? 1000 : 2000;
      if(moto && val("fuel")==="hybrid")document.querySelector('#calcForm input[name="fuel"][value="ice"]').checked=true;
      if (val("mode") === "price") $("price").value = moto ? 5000 : 12000;
      calc();
    });
  });
  qsa("#calcForm .picks button").forEach(function(b){
    b.addEventListener("click", function(){
      var v = b.dataset.p.split(",");
      document.querySelector('#calcForm input[name="mode"][value="price"]').checked = true;
      $("price").value = v[0]; $("year").value = v[1]; $("volume").value = v[2];
      document.querySelector('#calcForm input[name="fuel"][value="' + v[3] + '"]').checked = true;
      calc();
    });
  });

  /* Подстановка из адреса: car_year не конфликтует с архивным параметром WordPress year. */
  if (params.get("type") === "moto") document.querySelector('#calcForm input[name="vtype"][value="moto"]').checked = true;
  if (params.get("type") === "moto") $("volume").value = 1000;
  if (+params.get("price") > 0) $("price").value = +params.get("price");
  var requestedYear = params.has("car_year") ? params.get("car_year") : params.get("year");
  if (+requestedYear >= nowYear - 20 && +requestedYear <= nowYear) $("year").value = +requestedYear;
  if (params.has("cc") && +params.get("cc") >= 0) $("volume").value = +params.get("cc");
  var requestedFuel=params.get("fuel");if(requestedFuel==="alt")requestedFuel=Number($("volume").value)===0?"ev":"hybrid";
  if(["hybrid","ev"].includes(requestedFuel))document.querySelector('#calcForm input[name="fuel"][value="'+requestedFuel+'"]').checked=true;

  if(params.has("repair")) $("repair").value = Math.max(0,Number(params.get("repair"))||0);
  if(CONFIG.servicePrices.includes(Number(params.get("service")))) $("service").value=params.get("service");
  $("benefit").checked=params.get("benefit")==="1";
  if(params.get("mode")==="budget")document.querySelector('#calcForm input[name="mode"][value="budget"]').checked=true;
  if(params.get("auction")==="iaai")document.querySelector('#calcForm input[name="auction"][value="iaai"]').checked=true;
  if(["auto","klaipeda","poti"].includes(params.get("port")))$("port").value=params.get("port");
  $("yard").value=(params.get("yard")||"ALBANY - NY").slice(0,120);
  $("sublot").checked=params.get("sublot")==="1";
  if (!retailRateFor(val("auction"), $("yard").value)) {
    var normalized = $("yard").value.toUpperCase().replace(/,\s*/g," - ");
    if (retailRateFor(val("auction"), normalized)) $("yard").value=normalized;
  }
  fillYards();
  var used = false;
  function onUse(){ calc(); if (!used) { used = true; track("calc_used", {calc: "turnkey"}); } }
  $("calcForm").addEventListener("input", onUse);
  $("calcForm").addEventListener("change", onUse);
  calc();

  $("shareCalc").addEventListener("click",async function(){
    if(!calc())return;
    var query=new URLSearchParams({type:val("vtype"),mode:val("mode"),price:$("price").value,car_year:$("year").value,cc:$("volume").value,fuel:val("fuel"),repair:$("repair").value,service:$("service").value,benefit:$("benefit").checked?"1":"0",auction:val("auction"),yard:$("yard").value.trim(),port:$("port").value,sublot:$("sublot").checked?"1":"0"});
    var url=location.origin+BASE+"kalkulyator/?"+query.toString()+"#calc";
    var status=$("shareCalcStatus");status.hidden=false;
    try{await navigator.clipboard.writeText(url);$("shareCalcFallback").hidden=true;status.textContent="Ссылка скопирована. В ней сохранены параметры; при изменении ставок итог может измениться.";}
    catch(e){$("shareCalcFallback").hidden=false;$("shareCalcUrl").value=url;$("shareCalcUrl").focus();$("shareCalcUrl").select();status.textContent="Скопируйте ссылку из поля ниже. Она откроет расчёт с вашими параметрами.";}
  });

  var send = $("sendCalc");
  if (send) send.addEventListener("click", function(e){
    var r=calc();if(!r){e.preventDefault();return;}var box = $("lcar");
    track("calc_send", {total: r.total});
    if (!box) return;
    var f = r.moto ? (r.alt ? "электромотоцикл" : "мотоцикл") : (r.alt ? (r.cc ? "гибрид" : "электро") : "бензин/дизель");
    box.value = "Расчёт с калькулятора: " + (r.budget ? "бюджет " + r.total + " $, ставка до " + r.price + " $" : "лот " + r.price + " $, итого ≈ " + r.total + " $ под ключ")
      + ", " + r.year + " г., " + r.cc + " см³, " + f + (r.yard ? ", площадка " + r.yard : "") + ", через " + PORTS[r.port].name + ", резерв восстановления " + r.repair + " $, услуга " + r.serviceByn + " BYN, " + (r.benefit ? "с льготой" : "без льготы") + ".";
    refreshRetailLead();
  });
})();


function refreshRetailLead(){
  var root=document.getElementById("amz-retail-calc"), form=root.querySelector(".wpcf7 form");
  if(!form)return;
  var paramsField=form.querySelector('[name="calc-params"]'), resultField=form.querySelector('[name="calc-result"]');
  var rows=Array.from(root.querySelectorAll(".bill-in .row:not([hidden])")).map(function(e){return e.innerText.trim().replace(/\n+/g,": ")}).filter(Boolean);
  function checked(n){var e=root.querySelector('#calcForm input[name="'+n+'"]:checked');return e?e.parentNode.textContent.trim():"";}
  var fields=["Техника: "+checked("vtype"),"Режим: "+checked("mode"),"Введённая сумма: "+$("price").value+" $",
    "Год: "+$("year").value,"Объём: "+$("volume").value+" см³","Двигатель: "+checked("fuel"),
    "Аукцион: "+checked("auction"),"Площадка: "+$("yard").value,"Маршрут: "+$("r-sea-l").textContent,
    "Sublot: "+($("sublot").checked?"да":"нет"),"Льгота 50%: "+($("benefit").checked?"да":"нет"),
    "Ремонт: "+$("repair").value+" $","Услуга: "+$("service").value+" BYN"];
  if(paramsField)paramsField.value=fields.join("\n");
  if(resultField)resultField.value="Итого: "+$("r-total").textContent+"\n"+rows.join("\n");
  var source=form.querySelector('[name="post-url"]');if(source)source.value=location.href;
  var summary=$("lcar");if(summary)summary.value=fields.join("\n")+"\nПредварительный итог: "+$("r-total").textContent;
}
var lead=document.querySelector("#amz-retail-calc .wpcf7 form");
if(lead)lead.addEventListener("submit",function(e){
  if($("sendCalc").getAttribute("aria-disabled")==="true"){
    e.preventDefault();e.stopImmediatePropagation();$("calcInputError").scrollIntoView({block:"center"});return;
  }
  refreshRetailLead();
},true);

})();
