/* Общий скрипт сайта: меню, формы заявок, калькуляторы, каталог, галерея.
   Перед этим файлом при сборке подклеивается config.js (CONFIG, YARDS, PORTS). */
(function(){
"use strict";
var BASE = document.documentElement.getAttribute("data-base") || "/";
var $ = function(id){return document.getElementById(id)};
var qsa = function(sel, root){return Array.prototype.slice.call((root || document).querySelectorAll(sel))};
var nowYear = new Date().getFullYear();
var params = new URLSearchParams(location.search);

/* ---------- Меню на телефоне ---------- */
(function(){
  var btn = $("burger"), panel = $("mnav"), top = document.querySelector(".top");
  if (!btn || !panel) return;
  function setH(){ document.documentElement.style.setProperty("--top-h", top.getBoundingClientRect().height + "px"); }
  function toggle(open){
    btn.setAttribute("aria-expanded", open); panel.hidden = !open;
    document.body.classList.toggle("menu-open", open); setH();
  }
  btn.addEventListener("click", function(){ toggle(btn.getAttribute("aria-expanded") !== "true"); });
  document.addEventListener("keydown", function(e){ if (e.key === "Escape" && !panel.hidden) { toggle(false); btn.focus(); } });
  panel.addEventListener("click", function(e){ if (e.target.closest("a")) toggle(false); });
  window.addEventListener("resize", function(){ if (window.innerWidth > 1120 && !panel.hidden) toggle(false); });
})();

/* ---------- Формы заявок ---------- */
qsa("form[data-lead]").forEach(function(form){
  form.addEventListener("submit", function(e){
    e.preventDefault();
    var msg = form.querySelector(".msg"), phoneEl = form.querySelector('[name="phone"]');
    var agree = form.querySelector('[name="agree"]');
    msg.hidden = false;
    if (phoneEl.value.replace(/\D/g, "").length < 9) { msg.textContent = "Укажите телефон, чтобы менеджер мог с вами связаться."; phoneEl.focus(); return; }
    if (agree && !agree.checked) { msg.textContent = "Отметьте согласие на обработку данных."; return; }
    var data = {source: location.href};
    qsa("input[name],textarea[name],select[name]", form).forEach(function(el){ if (el.type !== "checkbox") data[el.name] = el.value; });
    if (!CONFIG.leadEndpoint) {
      msg.textContent = "Это тестовая версия сайта (тестовый режим): заявка никуда не отправлена. После подключения amoCRM она будет сразу приходить менеджеру.";
      return;
    }
    msg.textContent = "Отправляем…";
    fetch(CONFIG.leadEndpoint, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data)})
      .then(function(r){ if (!r.ok) throw 0; msg.textContent = "Заявка принята. Менеджер перезвонит в течение часа в рабочее время."; form.reset(); })
      .catch(function(){ msg.textContent = "Не получилось отправить. Позвоните нам: +375 (29) 633-28-28 или напишите в Telegram."; });
  });
});

/* ---------- Общие формулы ---------- */
var fmt = function(n){return Math.round(n).toLocaleString("ru-RU").replace(/,/g," ") + " $"};
var fmtEur = function(n){return Math.round(n).toLocaleString("ru-RU").replace(/,/g," ") + " €"};
var fmtByn = function(n){return Math.round(n).toLocaleString("ru-RU").replace(/,/g," ") + " BYN"};
/* Пошлина легкового авто в EUR по таблицам CONFIG.duty: возраст = текущий год минус год выпуска. */
function dutyEur(eur, year, cc){
  var age = nowYear - year, d = 0, t, i, T = CONFIG.duty;
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
function utilByn(year){ return (nowYear - year) <= 3 ? CONFIG.utilByn.upTo3 : CONFIG.utilByn.over3; }
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
    var m = /,\s*([A-Z]{2})\s*$/.exec(yard || "");
    if (!m) return null;
    if (CONFIG.states.west.indexOf(m[1]) >= 0) return "west";
    if (CONFIG.states.center.indexOf(m[1]) >= 0) return "center";
    return "east";
  }
  function auctionFee(p){
    for (var i = 0; i < CONFIG.auctionFee.length; i++) if (p < CONFIG.auctionFee[i][0]) return CONFIG.auctionFee[i][1] + CONFIG.auctionFixed;
    return p * CONFIG.auctionFeeTopPct + CONFIG.auctionFixed;
  }
  function dutyUsd(priceUsd, year, cc, ev){
    if (ev) return 0;
    return dutyEur(priceUsd / CONFIG.eurUsd, year, cc) * CONFIG.eurUsd;
  }
  /* Полная стоимость для цены лота price при текущих настройках формы. */
  function cost(price, o){
    var L = o.moto ? CONFIG.moto : CONFIG;   // у мотоциклов своя логистика и таможня
    var fee = auctionFee(price);
    var inland = L.inland[o.region] + (o.sublot ? CONFIG.sublot : 0);
    var sea = L.sea[o.port][o.region], last = L.lastLeg[o.port];
    var extra = (!o.moto && o.alt) ? CONFIG.altFuelEur * CONFIG.eurUsd : 0;
    var duty, cust;
    if (o.moto) {
      // TODO: уточнить у декларанта базу: сейчас лот + сборы аукциона + доставка до порта ЕАЭС
      var dv = motoDutyVat(price + fee + inland + sea, o.cc, o.alt);
      duty = (dv.duty + dv.vat) * (o.benefit ? .5 : 1);
      cust = (CONFIG.moto.utilByn + CONFIG.customsFeeByn + CONFIG.svhByn) / CONFIG.usdByn;
    } else {
      duty = dutyUsd(price, o.year, o.cc, o.ev) * (o.benefit ? .5 : 1);
      cust = (utilByn(o.year) + CONFIG.customsFeeByn + CONFIG.svhByn) / CONFIG.usdByn;
    }
    var ours = CONFIG.serviceByn / CONFIG.usdByn;
    return {price:price, fee:fee, inland:inland, sea:sea, last:last, extra:extra, duty:duty, cust:cust, ours:ours,
            total: price + fee + inland + sea + last + extra + duty + cust + ours};
  }
  function options(){
    var moto = val("vtype") === "moto";
    var cc = Math.max(0, +$("volume").value || 0), alt = val("fuel") === "alt";
    var yard = $("yard").value.trim(), region = regionOf(yard) || "east";
    var autoPort = moto ? CONFIG.moto.autoPort : ((!alt && cc <= CONFIG.euMaxCc) ? "klaipeda" : "poti");
    var port = $("port").value === "auto" ? autoPort : $("port").value;
    return {moto:moto, year:+$("year").value, cc:cc, alt:alt, ev:!moto && alt && cc === 0, region:region, yard:yard,
            port:port, autoPort:autoPort, sublot:$("sublot").checked, benefit:$("benefit").checked};
  }
  function calc(){
    var o = options(), budget = val("mode") === "budget";
    var input = Math.max(0, +$("price").value || 0), r;
    if (budget) {
      var lo = 0, hi = input;                 // ищем самую большую ставку, при которой итог укладывается в бюджет
      if (cost(0, o).total > input) hi = 0;
      for (var i = 0; i < 40; i++) { var mid = (lo + hi) / 2; if (cost(mid, o).total <= input) lo = mid; else hi = mid; }
      r = cost(Math.floor(lo / 50) * 50, o);
    } else {
      r = cost(input, o);
    }
    $("priceLabel").textContent = budget ? "Бюджет под ключ, $" : "Цена лота, $";
    $("maxbid").hidden = !budget;
    $("r-max").textContent = fmt(r.price);
    $("evHint").hidden = !o.alt || o.moto;
    $("carOnly").hidden = o.moto;
    $("fuelAlt").textContent = o.moto ? "Электро" : "Гибрид / электро";
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
    $("route").innerHTML = txt;
    $("route").classList.toggle("warn", !o.moto && o.port === "klaipeda" && o.port !== o.autoPort);

    $("r-lot").textContent = fmt(r.price);
    $("r-fee").textContent = fmt(r.fee);
    $("r-inland-l").textContent = "Доставка по США до порта" + (o.yard ? "" : " (в среднем)") + (o.sublot ? ", с Sublot" : "");
    $("r-inland").textContent = fmt(r.inland);
    $("r-sea-l").textContent = "Море до " + P.short;
    $("r-sea").textContent = fmt(r.sea);
    $("r-last-l").textContent = P.from + " → Минск";
    $("r-last").textContent = fmt(r.last);
    $("r-extra-row").hidden = !r.extra;
    $("r-extra-l").textContent = "Доплата за гибрид / электро";
    $("r-extra").textContent = fmt(r.extra);
    $("r-duty").textContent = o.ev ? "0 $ (электро)" : fmt(r.duty);
    $("r-cust").textContent = fmt(r.cust);
    $("r-ours").textContent = fmt(r.ours);
    $("r-total").textContent = fmt(r.total);
    $("r-byn").textContent = "≈ " + Math.round(r.total * CONFIG.usdByn).toLocaleString("ru-RU") + " BYN по курсу " + CONFIG.usdByn;
    return {moto:o.moto, price:Math.round(r.price), year:o.year, cc:o.cc, alt:o.alt, port:o.port, yard:o.yard, budget:budget, total:Math.round(r.total)};
  }

  $("advToggle").addEventListener("click", function(){
    var open = this.getAttribute("aria-expanded") !== "true";
    this.setAttribute("aria-expanded", open); $("adv").hidden = !open;
  });
  qsa('#calcForm input[name="auction"]').forEach(function(r){
    r.addEventListener("change", function(){ fillYards(); $("yard").value = ""; calc(); });
  });
  qsa('#calcForm input[name="mode"]').forEach(function(r){
    r.addEventListener("change", function(){ $("price").value = r.value === "budget" ? 20000 : 12000; calc(); });
  });
  qsa('#calcForm input[name="vtype"]').forEach(function(r){
    r.addEventListener("change", function(){
      var moto = r.value === "moto";
      $("volume").value = moto ? 1000 : 2000;
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

  /* Подстановка из адреса: ?type=moto&price=9000&year=2021&cc=1500&fuel=alt */
  if (params.get("type") === "moto") document.querySelector('#calcForm input[name="vtype"][value="moto"]').checked = true;
  if (params.get("type") === "moto") $("volume").value = 1000;
  if (+params.get("price") > 0) $("price").value = +params.get("price");
  if (+params.get("year") >= nowYear - 20 && +params.get("year") <= nowYear) $("year").value = +params.get("year");
  if (params.has("cc") && +params.get("cc") >= 0) $("volume").value = +params.get("cc");
  if (params.get("fuel") === "alt") document.querySelector('#calcForm input[name="fuel"][value="alt"]').checked = true;

  fillYards();
  $("calcForm").addEventListener("input", calc);
  $("calcForm").addEventListener("change", calc);
  calc();

  var send = $("sendCalc");
  if (send) send.addEventListener("click", function(){
    var r = calc(), box = $("lcar");
    if (!box) return;
    var f = r.moto ? (r.alt ? "электромотоцикл" : "мотоцикл") : (r.alt ? (r.cc ? "гибрид" : "электро") : "бензин/дизель");
    box.value = "Расчёт с калькулятора: " + (r.budget ? "бюджет " + r.total + " $, ставка до " + r.price + " $" : "лот " + r.price + " $, итого ≈ " + r.total + " $ под ключ")
      + ", " + r.year + " г., " + r.cc + " см³, " + f + (r.yard ? ", площадка " + r.yard : "") + ", через " + PORTS[r.port].name + ".";
  });
})();

/* ---------- Таможенный калькулятор ---------- */
(function(){
  var form = $("ccForm");
  if (!form) return;
  var val = function(name){return form.querySelector('input[name="' + name + '"]:checked').value};
  fillYears($("ccYear"), nowYear - 4);
  if (+params.get("year")) $("ccYear").value = +params.get("year");
  if (params.has("cc")) $("ccVolume").value = +params.get("cc");
  if (params.get("type") === "moto") form.querySelector('input[name="cvtype"][value="moto"]').checked = true;
  function run(){
    var moto = val("cvtype") === "moto", ev = val("cfuel") === "ev";
    var cur = val("cur"), price = Math.max(0, +$("ccPrice").value || 0);
    var eur = cur === "eur" ? price : price / CONFIG.eurUsd;
    var cc = ev ? 0 : Math.max(0, +$("ccVolume").value || 0), year = +$("ccYear").value, age = nowYear - year;
    var benefit = $("ccBenefit").checked, k = benefit ? .5 : 1;
    var eurByn = CONFIG.eurUsd * CONFIG.usdByn, duty, vat = 0, util, rule;
    if (moto) {
      var dv = motoDutyVat(eur, cc, ev);
      duty = dv.duty * k; vat = dv.vat * k; util = CONFIG.moto.utilByn;
      rule = "Мотоцикл: " + Math.round(motoRate(cc, ev) * 100) + "% от таможенной стоимости плюс НДС 20%. Ставка за см³ к мотоциклам не применяется, утильсбор не платится.";
    } else {
      duty = ev ? 0 : dutyEur(eur, year, cc) * k; util = utilByn(year);
      if (ev) rule = "Электромобиль: пошлина 0 в пределах годовой квоты.";
      else if (age < 3) rule = "До 3 лет: процент от стоимости, но не меньше минимума за см³. Берётся большее.";
      else rule = "Старше 3 лет: ставка за каждый см³ объёма, стоимость не важна.";
    }
    $("ccFuelEv").textContent = moto ? "Электро" : "Электро (квота)";
    $("ccYearField").hidden = false;
    $("ccMotoNote").hidden = !moto;
    $("ccVolField").hidden = ev;
    $("ccAge").textContent = age < 3 ? "до 3 лет" : (age <= 5 ? "от 3 до 5 лет" : "старше 5 лет");
    $("ccRule").textContent = rule;
    $("cr-duty-eur").textContent = fmtEur(duty) + " ≈ " + fmt(duty * CONFIG.eurUsd);
    $("cr-vat-row").hidden = !moto;
    $("cr-vat").textContent = fmtEur(vat) + " ≈ " + fmt(vat * CONFIG.eurUsd);
    $("cr-util-row").hidden = moto;
    $("cr-util").textContent = fmtByn(util);
    $("cr-fee").textContent = fmtByn(CONFIG.customsFeeByn);
    $("cr-svh").textContent = fmtByn(CONFIG.svhByn);
    var totalByn = (duty + vat) * eurByn + util + CONFIG.customsFeeByn + CONFIG.svhByn;
    $("cr-total").textContent = fmtByn(totalByn);
    $("cr-total-usd").textContent = "≈ " + fmt(totalByn / CONFIG.usdByn) + " · курс: 1 € = " + CONFIG.eurUsd + " $, 1 $ = " + CONFIG.usdByn + " BYN";
  }
  form.addEventListener("input", run); form.addEventListener("change", run); run();
})();

/* ---------- Галерея на странице машины ---------- */
(function(){
  var g = $("gallery");
  if (!g) return;
  var main = g.querySelector(".main img"), btns = qsa(".thumbs button", g), cnt = g.querySelector(".cnt"), i = 0;
  function show(n){
    if (!btns.length) return;
    i = (n + btns.length) % btns.length;
    var b = btns[i];
    main.src = b.dataset.src; main.alt = b.querySelector("img").alt;
    btns.forEach(function(x, k){ x.setAttribute("aria-current", k === i); });
    if (cnt) cnt.textContent = (i + 1) + " / " + btns.length;
  }
  btns.forEach(function(b, k){ b.addEventListener("click", function(){ show(k); }); });
  var p = g.querySelector(".prev"), n = g.querySelector(".next");
  if (p) p.addEventListener("click", function(){ show(i - 1); });
  if (n) n.addEventListener("click", function(){ show(i + 1); });
})();

/* ---------- Каталог: поиск и фильтр по марке ---------- */
function carCard(c){
  var a = document.createElement("a");
  a.className = "car"; a.href = BASE + "katalog/" + c.s + "/";
  var img = c.i ? '<img src="' + c.i + '" alt="" loading="lazy" decoding="async" width="300" height="225">' : "";
  a.innerHTML = '<div class="ph">' + img + '</div><div class="tx"><h3></h3><div class="meta">' + (c.y ? "<b>" + c.y + "</b>" : "") + "<span></span></div></div>";
  a.querySelector("h3").textContent = c.t; a.querySelector(".meta span").textContent = c.bn || "";
  return a;
}
(function(){
  var form = $("catFilter");
  if (!form) return;
  var grid = $("carGrid"), pager = $("catPager"), count = $("catCount"), more = $("catMore"), data = null, list = [], shown = 0, STEP = 24;
  var q = $("catQ"), brand = $("catBrand");
  if (params.get("q")) q.value = params.get("q");
  function render(reset){
    if (reset) { grid.innerHTML = ""; shown = 0; }
    var frag = document.createDocumentFragment();
    list.slice(shown, shown + STEP).forEach(function(c){ frag.appendChild(carCard(c)); });
    shown = Math.min(list.length, shown + STEP);
    grid.appendChild(frag);
    more.hidden = shown >= list.length;
    if (!list.length) grid.innerHTML = '<p class="empty">Ничего не нашли. Напишите нам, какую машину ищете: подберём на аукционе.</p>';
  }
  function apply(){
    var t = q.value.trim().toLowerCase(), b = brand.value;
    if (!t && !b) { location.href = location.pathname; return; }
    if (b && !t) { location.href = BASE + "katalog/" + b + "/"; return; }
    var words = t.split(/\s+/).filter(Boolean);
    list = data.filter(function(c){
      if (b && c.b !== b) return false;
      var hay = (c.t + " " + (c.y || "")).toLowerCase();
      return words.every(function(w){ return hay.indexOf(w) >= 0; });
    });
    count.textContent = "Найдено: " + list.length;
    if (pager) pager.hidden = true;
    render(true);
  }
  function load(cb){
    if (data) return cb();
    count.textContent = "Загружаем…";
    fetch(BASE + "assets/cars.json").then(function(r){ return r.json(); }).then(function(d){ data = d; cb(); })
      .catch(function(){ count.textContent = "Не удалось загрузить список"; });
  }
  var timer;
  q.addEventListener("input", function(){ clearTimeout(timer); timer = setTimeout(function(){ load(apply); }, 250); });
  brand.addEventListener("change", function(){ load(apply); });
  form.addEventListener("submit", function(e){ e.preventDefault(); load(apply); });
  more.addEventListener("click", function(){ render(false); });
  if (q.value) load(apply);
})();

/* ---------- Страница марки: фильтр по модели и «показать ещё» ---------- */
(function(){
  var chips = $("modelChips"), grid = $("carGrid");
  if (!chips || !grid) return;
  var cards = qsa(".car", grid), more = $("brandMore"), STEP = 24, limit = STEP, model = params.get("model") || "";
  function apply(){
    var list = cards.filter(function(c){ return !model || c.dataset.model === model; });
    cards.forEach(function(c){ c.hidden = true; });
    list.slice(0, limit).forEach(function(c){ c.hidden = false; });
    more.hidden = list.length <= limit;
    qsa("button", chips).forEach(function(b){ b.setAttribute("aria-pressed", b.dataset.model === model); });
  }
  chips.addEventListener("click", function(e){
    var b = e.target.closest("button"); if (!b) return;
    model = b.dataset.model; limit = STEP;
    var u = new URL(location.href); if (model) u.searchParams.set("model", model); else u.searchParams.delete("model");
    history.replaceState(null, "", u);
    apply();
  });
  more.addEventListener("click", function(){ limit += STEP; apply(); });
  apply();
})();

/* ---------- Отслеживание по VIN ---------- */
(function(){
  var form = $("vinForm");
  if (!form) return;
  // TODO: когда Atlantic Express Corporation даст адрес отслеживания, открывать его здесь, например:
  // window.open("https://<atlantic-express-tracking>/?vin=" + vin, "_blank", "noopener");
  form.addEventListener("submit", function(e){
    e.preventDefault();
    var vin = $("vin").value.trim().toUpperCase().replace(/\s+/g, ""), out = $("vinOut"), msg = $("vinMsg");
    out.hidden = false;
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
      msg.textContent = "VIN состоит из 17 символов: латинские буквы (кроме I, O, Q) и цифры. Проверьте номер.";
      $("vinActions").hidden = true; return;
    }
    var text = "Здравствуйте! Подскажите, где сейчас моя машина. VIN: " + vin;
    msg.textContent = "Онлайн-отслеживание подключаем. Пока пришлите VIN менеджеру: он ответит, где машина и когда она будет в Минске.";
    $("vinActions").hidden = false;
    $("vinWa").href = "https://wa.me/375296332828?text=" + encodeURIComponent(text);
    $("vinTg").href = "https://t.me/amerikaa_by";
    var box = $("lcar"); if (box) box.value = "Отслеживание: VIN " + vin;
    try { if (navigator.clipboard) navigator.clipboard.writeText(vin).catch(function(){}); } catch (err) {}
  });
})();
})();
