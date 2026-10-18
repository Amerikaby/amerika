/* Общий скрипт сайта: меню, формы заявок, калькуляторы, каталог, галерея.
   Перед этим файлом при сборке подклеивается config.js (CONFIG, YARDS, PORTS). */
(function(){
"use strict";
var BASE = document.documentElement.getAttribute("data-base") || "/";
var $ = function(id){return document.getElementById(id)};
var qsa = function(sel, root){return Array.prototype.slice.call((root || document).querySelectorAll(sel))};
var nowYear = new Date().getFullYear();
var params = new URLSearchParams(location.search);
function validFields(rules, error) {
  var messages=[];
  rules.forEach(function(r){var el=$(r[0]), n=Number(el.value), bad=!el.disabled && (!el.value.trim() || !Number.isFinite(n) || n<r[1] || n>r[2]);el.setAttribute("aria-invalid",String(bad));var hint=$(el.id+"Error");if(!hint){hint=document.createElement("small");hint.id=el.id+"Error";hint.className="field-error";el.after(hint);el.setAttribute("aria-describedby",((el.getAttribute("aria-describedby")||"")+" "+hint.id).trim());}hint.textContent=bad?r[3]:"";hint.hidden=!bad;if(bad)messages.push(r[3]);});
  error.textContent=messages.join(" ");error.hidden=!messages.length;return !messages.length;
}

/* ---------- Аналитика: счётчики, цели, метки рекламы ---------- */
var A = CONFIG.analytics || {};
if (BASE !== "/" && !A.preview) A = {}; // do not mix review traffic with live advertising goals
window.dataLayer = window.dataLayer || [];
(function(){
  function load(src){ var s = document.createElement("script"); s.async = true; s.src = src; document.head.appendChild(s); }
  if (A.gtm) {
    window.dataLayer.push({"gtm.start": Date.now(), event: "gtm.js"});
    load("https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(A.gtm));
  }
  if (A.ga4) {
    window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
    window.gtag("js", new Date()); window.gtag("config", A.ga4);
    load("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(A.ga4));
  }
  if (A.ym) {
    window.ym = window.ym || function(){ (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = +new Date();
    load("https://mc.yandex.ru/metrika/tag.js");
    window.ym(A.ym, "init", {clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true});
  }
})();
/* Цель во все подключённые системы. Имена целей: lead_submit, click_phone, click_telegram, click_viber, click_whatsapp, calc_used, calc_send. */
function track(goal, params){
  params = params || {};
  try {
    window.dataLayer.push(Object.assign({event: goal}, params));
    if (A.ym && window.ym) window.ym(A.ym, "reachGoal", goal, params);
    if (A.ga4 && window.gtag) window.gtag("event", goal, params);
  } catch (e) {}
}
window.amzTrack = track;
/* Метки рекламы: сохраняем при входе на сайт (первая страница сессии) и добавляем в заявку. */
var ATTR_KEYS = ["utm_source","utm_medium","utm_campaign","utm_content","utm_term","gclid","yclid"];
var attribution = (function(){
  var stored = null;
  try { stored = JSON.parse(sessionStorage.getItem("amz_attr") || "null"); } catch (e) {}
  var found = {}, has = false;
  ATTR_KEYS.forEach(function(k){ var v = params.get(k); if (v) { found[k] = v.slice(0, 200); has = true; } });
  if (!stored || has) {
    stored = Object.assign({}, has ? found : (stored || {}), {landing: (stored && !has && stored.landing) || location.href, referrer: (stored && !has && stored.referrer) || document.referrer || ""});
    try { sessionStorage.setItem("amz_attr", JSON.stringify(stored)); } catch (e) {}
  }
  return stored;
})();
document.addEventListener("click", function(e){
  var a = e.target.closest && e.target.closest("a[href]");
  if (!a) return;
  var h = a.getAttribute("href");
  if (/^tel:/.test(h)) track("click_phone");
  else if (/t\.me\//.test(h)) track("click_telegram");
  else if (/^viber:/.test(h)) track("click_viber");
  else if (/wa\.me\//.test(h)) track("click_whatsapp");
});

/* ---------- Меню на телефоне ---------- */
(function(){
  var btn = $("burger"), panel = $("mnav"), top = document.querySelector(".top");
  if (!btn || !panel) return;
  function setH(){ document.documentElement.style.setProperty("--top-h", top.getBoundingClientRect().height + "px"); }
  var background=qsa("main, footer, .mbar, .review-strip, .top a"), previousInert=[];
  function toggle(open){
    btn.setAttribute("aria-expanded", open); panel.hidden = !open;
    document.body.classList.toggle("menu-open", open); setH();
    if(open){previousInert=background.map(function(el){return el.inert});background.forEach(function(el){el.inert=true});panel.querySelector("a").focus();}
    else {background.forEach(function(el,i){el.inert=previousInert[i]||false});btn.focus();}
  }
  document.addEventListener("keydown",function(e){if(panel.hidden || e.key!=="Tab")return;var items=[btn].concat(qsa('a[href],button:not([disabled])',panel)),i=items.indexOf(document.activeElement);e.preventDefault();items[(i+(e.shiftKey?-1:1)+items.length)%items.length].focus();});
  btn.addEventListener("click", function(){ toggle(btn.getAttribute("aria-expanded") !== "true"); });
  document.addEventListener("keydown", function(e){ if (e.key === "Escape" && !panel.hidden) { toggle(false); btn.focus(); } });
  panel.addEventListener("click", function(e){ if (e.target.closest("a")) toggle(false); });
  window.addEventListener("resize", function(){ if (window.innerWidth > 1120 && !panel.hidden) toggle(false); });
})();

/* ---------- Forms: success only after an explicit positive server response ---------- */
qsa('[data-plan]').forEach(function(link){link.addEventListener('click',function(){var field=$('lcar');if(field)field.value='Интересует тариф «'+link.dataset.plan+'». ';});});
qsa("form[data-lead]").forEach(function(form){
  var pending=false, requestId=null;
  form.addEventListener("input",function(){if(!pending)requestId=null;});
  form.addEventListener("submit",async function(e){
    e.preventDefault(); if(pending)return;
    var msg=form.querySelector(".msg"), phone=form.querySelector('[name="phone"]'), agree=form.querySelector('[name="agree"]'), button=form.querySelector('[type="submit"]');
    msg.hidden=false;
    var digits=phone.value.replace(/\D/g,"");
    if(digits.length<9||digits.length>15){msg.textContent="Укажите телефон с кодом страны.";phone.focus();return;}
    if(!agree.checked){msg.textContent="Подтвердите согласие на обработку данных.";agree.focus();return;}
    var data={source:location.href,agree:true};
    ATTR_KEYS.concat(["landing","referrer"]).forEach(function(k){if(attribution&&attribution[k])data[k]=attribution[k]});
    qsa("input[name],textarea[name]",form).forEach(function(el){if(el.type!=="checkbox")data[el.name]=el.value});
    var formName=form.getAttribute("data-lead")||"lead";
    track("lead_attempt",{form:formName});
    if(!CONFIG.leadEndpoint){msg.textContent="Приём заявок пока не подключён. Позвоните нам или напишите в Telegram.";return;}
    var endpoint=new URL(CONFIG.leadEndpoint,location.origin+BASE).href;
    var locked=qsa("input,textarea,select",form).map(function(el){var state={el:el,disabled:el.disabled};el.disabled=true;return state;});
    pending=true;button.disabled=true;form.setAttribute("aria-busy","true");msg.textContent="Отправляем…";
    var controller=new AbortController(),timeout=setTimeout(function(){controller.abort()},20000);
    try{
      var init=await fetch(endpoint,{credentials:"same-origin",cache:"no-store",signal:controller.signal});
      var ticket=await init.json();if(!init.ok||!ticket.ok||!ticket.token)throw Error("Приём заявок временно недоступен. Позвоните нам.");
      requestId=requestId||crypto.randomUUID();data.requestId=requestId;data.token=ticket.token;
      var response=await fetch(endpoint,{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify(data),signal:controller.signal});
      var result=await response.json();
      if(!response.ok||result.ok!==true)throw Error(result.message||"Не удалось передать заявку. Позвоните нам или напишите в Telegram.");
      track("lead_submit",{form:formName});msg.textContent=result.message;form.reset();requestId=null;
    }catch(error){msg.textContent=error.name==="AbortError"?"Сервер не успел ответить. Повторите отправку или позвоните нам.":error.message;}
    finally{clearTimeout(timeout);locked.forEach(function(x){x.el.disabled=x.disabled});pending=false;button.disabled=false;form.removeAttribute("aria-busy")}
  });
});

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
    var m = /,\s*([A-Z]{2})\s*$/.exec(yard || "");
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
    return {moto:moto, year:+$("year").value, cc:cc, alt:alt, ev:!moto && ev, region:region, yard:yard,
            port:port, autoPort:autoPort, sublot:$("sublot").checked, benefit:$("benefit").checked, repair:Math.max(0,+$("repair").value||0), serviceByn:+$("service").value};
  }
  function calc(){
    var ev=val("fuel")==="ev";$("volume").disabled=ev;
    $("evHint").hidden=!ev;$("carOnly").hidden=val("vtype")==="moto";
    var valid=validFields([["volume",1,10000,"Укажите объём двигателя больше нуля."],["price",1,10000000,"Укажите положительную цену или бюджет."],["repair",0,100000,"Укажите резерв ремонта от 0 до 100 000 $."],["year",nowYear-20,nowYear,"Выберите год выпуска."]],$("calcInputError"));
    document.querySelector("#calcForm + .bill .bill-in").hidden=!valid;$("sendCalc").setAttribute("aria-disabled",String(!valid));if(!valid)return null;
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
    $("r-repair").textContent = fmt(r.repair);
    $("r-total").textContent = fmt(r.total);
    $("r-byn").textContent = "≈ " + Math.round(r.total * CONFIG.usdByn).toLocaleString("ru-RU") + " BYN по курсу " + CONFIG.usdByn + " (НБРБ, " + CONFIG.ratesDate + ")";
    return {moto:o.moto, price:Math.round(r.price), year:o.year, cc:o.cc, alt:o.alt, port:o.port, yard:o.yard, budget:budget, repair:r.repair, serviceByn:o.serviceByn, benefit:o.benefit, total:Math.round(r.total)};
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

  /* Подстановка из адреса: ?type=moto&price=9000&year=2021&cc=1500&fuel=alt */
  if (params.get("type") === "moto") document.querySelector('#calcForm input[name="vtype"][value="moto"]').checked = true;
  if (params.get("type") === "moto") $("volume").value = 1000;
  if (+params.get("price") > 0) $("price").value = +params.get("price");
  if (+params.get("year") >= nowYear - 20 && +params.get("year") <= nowYear) $("year").value = +params.get("year");
  if (params.has("cc") && +params.get("cc") >= 0) $("volume").value = +params.get("cc");
  var requestedFuel=params.get("fuel");if(requestedFuel==="alt")requestedFuel=Number($("volume").value)===0?"ev":"hybrid";
  if(["hybrid","ev"].includes(requestedFuel))document.querySelector('#calcForm input[name="fuel"][value="'+requestedFuel+'"]').checked=true;

  if(params.has("repair")) $("repair").value = Math.max(0,Number(params.get("repair"))||0);
  if(CONFIG.servicePrices.includes(Number(params.get("service")))) $("service").value=params.get("service");
  $("benefit").checked=params.get("benefit")==="1";
  fillYards();
  var used = false;
  function onUse(){ calc(); if (!used) { used = true; track("calc_used", {calc: "turnkey"}); } }
  $("calcForm").addEventListener("input", onUse);
  $("calcForm").addEventListener("change", onUse);
  calc();

  var send = $("sendCalc");
  if (send) send.addEventListener("click", function(e){
    var r=calc();if(!r){e.preventDefault();return;}var box = $("lcar");
    track("calc_send", {total: r.total});
    if (!box) return;
    var f = r.moto ? (r.alt ? "электромотоцикл" : "мотоцикл") : (r.alt ? (r.cc ? "гибрид" : "электро") : "бензин/дизель");
    box.value = "Расчёт с калькулятора: " + (r.budget ? "бюджет " + r.total + " $, ставка до " + r.price + " $" : "лот " + r.price + " $, итого ≈ " + r.total + " $ под ключ")
      + ", " + r.year + " г., " + r.cc + " см³, " + f + (r.yard ? ", площадка " + r.yard : "") + ", через " + PORTS[r.port].name + ", резерв восстановления " + r.repair + " $, услуга " + r.serviceByn + " BYN, " + (r.benefit ? "с льготой" : "без льготы") + ".";
  });
})();

/* ---------- Быстрый расчёт на главной ---------- */
(function(){
  var box = $("quick"), dataEl = $("quickData");
  if (!box || !dataEl) return;
  /* idx: [марка, модель, {год: см³}, электро, {год: медиана av.by}, ссылка] */
  var D = JSON.parse(dataEl.textContent), IDX = D.idx, sel = -1, lotTouched = false, ccTouched = false, used = false;
  var q = $("qModel"), list = $("qList"), active = -1, shown = [];
  var name = function(i){ return IDX[i][0] + " " + IDX[i][1]; };
  var years = []; for (var y = nowYear; y >= nowYear - 15; y--) years.push(y);
  years.forEach(function(y){ var o = document.createElement("option"); o.value = y; o.textContent = y; $("qYear").appendChild(o); });
  $("qYear").value = nowYear - 4;
  /* Объём модели в году: ближайший год из каталога */
  function ccFor(i, y){
    var t = IDX[i][2], best = null, d = 99;
    for (var k in t) { var dd = Math.abs(+k - y); if (dd < d) { d = dd; best = t[k]; } }
    return best == null ? 2000 : best;
  }
  function opts(cc, alt, ev, year){ return {moto:false, year:year, cc:cc, alt:alt, ev:ev, region:"east", port:autoPortFor(false, alt, cc), sublot:false, benefit:$("qBenefit").checked, repair:Math.max(0,+$("qRepair").value||0), serviceByn:+$("qService").value}; }
  function maxBid(target, o){
    if (costOf(0, o).total > target) return 0;
    var lo = 0, hi = target;
    for (var k = 0; k < 32; k++) { var mid = (lo + hi) / 2; if (costOf(mid, o).total <= target) lo = mid; else hi = mid; }
    return Math.floor(lo / 100) * 100;
  }
  function cur(){
    var year = +$("qYear").value, ev, alt, cc;
    var f=box.querySelector('input[name="qFuel"]:checked').value;ev=f==="ev";alt=f!=="ice";cc=ev?0:Number($("qCc").value);
    return {year:year, o:opts(cc, alt, ev, year), mk: sel >= 0 ? IDX[sel][4][year] : null};
  }
  function run(){
    var c = cur(), o = c.o;
    $("qCc").disabled=o.ev;$("qFuelRow").hidden=false;
    var valid=validFields([["qCc",1,10000,"Укажите объём двигателя больше нуля."],["qLot",1,10000000,"Укажите положительную ставку."],["qRepair",0,100000,"Укажите резерв ремонта от 0 до 100 000 $."]],$("qInputError"));
    [".qc-total",".qc-actions",".qc-out"].forEach(function(s){$("qPanelModel").querySelector(s).hidden=!valid});if(!valid)return null;
    if (!lotTouched) { var lim = c.mk ? maxBid(c.mk, o) : 0; $("qLot").value = lim ? Math.max(1000, Math.floor(lim * 0.75 / 500) * 500) : 10000; }
    var lot = Math.max(0, +$("qLot").value || 0), r = costOf(lot, o);
    $("qTotal").textContent = fmt(r.total);
    $("qByn").textContent = "≈ " + Math.round(r.total * CONFIG.usdByn).toLocaleString("ru-RU") + " BYN";
    $("qFuelRow").hidden = false;
    $("qCc").disabled = o.ev;
    var h = $("qHint");
    if (sel >= 0) h.textContent = o.ev ? "Электромобиль: условия растаможки и квоту уточним при расчёте." : (ccTouched ? "" : "Объём подставлен типичный для " + IDX[sel][1] + " " + c.year + " года. Если у вашей машины другой, поправьте.");
    else h.textContent = !$("qList").hidden ? "Выберите модель из списка." : q.value.trim() ? "Этой модели нет в нашем списке. Укажите объём и тип двигателя, остальное посчитаем." : "Начните вводить марку или выберите популярную модель.";
    var v = $("qVerdict");
    if (c.mk) {
      var bid = maxBid(c.mk, o), max = Math.max(r.total, c.mk), diff = c.mk - r.total;
      $("qBars").hidden = false;
      $("qMk").textContent = fmt(c.mk);
      $("qUs").textContent = fmt(r.total); $("qBarUs").style.width = (r.total / max * 100) + "%"; $("qBarMk").style.width = (c.mk / max * 100) + "%";
      v.className = "qc-verdict " + (diff > 0 ? "good" : "bad");
      v.innerHTML = diff > 0 ? "Дешевле рынка примерно на <b>" + fmt(diff) + "</b>. Выгодно при ставке до " + fmt(bid) + "."
        : (bid ? "При такой ставке дороже рынка. Выгодно брать при ставке до <b>" + fmt(bid) + "</b>." : "Такая машина из США выходит не дешевле рынка. Посмотрите другой год.");
      if (IDX[sel][5]) v.innerHTML += ' <a href="' + IDX[sel][5] + '">Цены по всем годам →</a>';
    } else {
      $("qBars").hidden = true;
      v.className = "qc-verdict";
      v.innerHTML = "Маршрут через <b>" + PORTS[o.port].name + "</b>" + (o.port === "poti" ? ": машины больше 1,9 л, гибриды и электро везём в обход ЕС." : ".")
        + (sel >= 0 ? " Цен av.by для этого года мало, сравнение с рынком пришлём с точным расчётом." : " Сравнение с рынком Беларуси пришлём с точным расчётом.");
    }
    $("qMore").href = BASE + "kalkulyator/?" + new URLSearchParams({price: String(lot), year: String(c.year), cc: String(o.cc), repair:String(o.repair), service:String(o.serviceByn), benefit:o.benefit ? "1" : "0"}).toString() + (o.alt ? "&fuel=alt" : "") + "#calc";
    return {c:c, lot:lot, total:Math.round(r.total)};
  }
  function pick(i, year){
    sel = i; q.value = name(i); closeList(); lotTouched = false; ccTouched = false; $("qLot").value=10000;
    box.querySelector('input[name="qFuel"][value="'+(IDX[i][6]||(IDX[i][3]?"ev":"ice"))+'"]').checked=true;
    var mk = IDX[i][4], ys = Object.keys(mk).map(Number);
    if (year) $("qYear").value = year;
    else if (ys.length) $("qYear").value = ys.sort(function(a, b){ return Math.abs(a - (nowYear - 4)) - Math.abs(b - (nowYear - 4)); })[0];
    else { var cy = Object.keys(IDX[i][2]).map(Number).sort(function(a, b){ return b - a; }); if (cy.length) $("qYear").value = Math.min(cy[0], nowYear); }
    $("qCc").value = ccFor(i, +$("qYear").value);
    qsa(".qc-pop button", box).forEach(function(b){ b.setAttribute("aria-pressed", +b.dataset.i === i); });
    run();
  }
  /* Подсказки по вводу */
  function closeList(){ list.hidden = true; q.setAttribute("aria-expanded", "false"); active = -1; }
  function render(){
    var t = q.value.trim().toLowerCase().replace(/ё/g, "е"), words = t.split(/\s+/).filter(Boolean);
    shown = !words.length ? [] : IDX.map(function(r, i){ return i; }).filter(function(i){
      var hay = (name(i).toLowerCase() + (IDX[i][0] === "VW" ? " volkswagen" : "")).split(/[\s-]+/);
      return words.every(function(w){ return hay.some(function(h){ return h.indexOf(w) === 0; }); });
    }).slice(0, 8);
    list.innerHTML = "";
    shown.forEach(function(i, k){
      var li = document.createElement("li"); li.setAttribute("role", "option"); li.id = "qOpt" + k;
      li.innerHTML = "<b></b>" + (Object.keys(IDX[i][4]).length ? "<small>есть цены av.by</small>" : "");
      li.querySelector("b").textContent = name(i);
      li.addEventListener("mousedown", function(e){ e.preventDefault(); pick(i); });
      list.appendChild(li);
    });
    list.hidden = !shown.length; q.setAttribute("aria-expanded", String(!!shown.length));
  }
  q.addEventListener("input", function(){
    var t = q.value.trim().toLowerCase();
    sel = -1; for (var i = 0; i < IDX.length; i++) if (name(i).toLowerCase() === t) { sel = i; break; }
    qsa(".qc-pop button", box).forEach(function(b){ b.setAttribute("aria-pressed", "false"); });
    if (sel < 0 && !ccTouched) $("qCc").value = 2000;
    if(sel>=0){pick(sel);return;}render(); run();
  });
  q.addEventListener("keydown", function(e){
    if (list.hidden) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault(); active = (active + (e.key === "ArrowDown" ? 1 : -1) + shown.length) % shown.length;
      qsa("li", list).forEach(function(li, k){ li.classList.toggle("on", k === active); });
      q.setAttribute("aria-activedescendant", "qOpt" + active);
    } else if (e.key === "Enter" && active >= 0) { e.preventDefault(); pick(shown[active]); }
    else if (e.key === "Escape") closeList();
  });
  q.addEventListener("blur", function(){ setTimeout(function(){ closeList(); run(); }, 100); });
  q.addEventListener("focus", function(){ if (q.value.trim() && sel < 0) render(); });
  qsa(".qc-pop button", box).forEach(function(b){ b.addEventListener("click", function(){ pick(+b.dataset.i); }); });
  $("qYear").addEventListener("change", function(){ if (sel >= 0 && !ccTouched) $("qCc").value = ccFor(sel, +$("qYear").value); lotTouched = false; run(); });
  $("qCc").addEventListener("input", function(){ ccTouched = true; run(); });
  $("qLot").addEventListener("input", function(){ lotTouched = true; run(); });
  ["qRepair","qService","qBenefit"].forEach(function(id){$(id).addEventListener("change",function(){run();fit()})});
  qsa('input[name="qFuel"]', box).forEach(function(r){ r.addEventListener("change", run); });
  box.addEventListener("change", function(){ if (!used) { used = true; track("calc_used", {calc: "quick"}); } });

  /* Вкладки */
  function tab(budget){
    $("qTabModel").setAttribute("aria-selected", String(!budget)); $("qTabBudget").setAttribute("aria-selected", String(budget));
    $("qPanelModel").hidden = budget; $("qPanelBudget").hidden = !budget;
    $("qTabModel").tabIndex=budget?-1:0; $("qTabBudget").tabIndex=budget?0:-1;
    if (budget) fit();
  }
  $("qTabModel").addEventListener("click", function(){ tab(false); });
  $("qTabBudget").addEventListener("click", function(){ tab(true); });
  [$("qTabModel"),$("qTabBudget")].forEach(function(t){t.addEventListener("keydown",function(e){if(["ArrowLeft","ArrowRight","Home","End"].includes(e.key)){e.preventDefault();var b=e.key==="End"?true:e.key==="Home"?false:t.id==="qTabModel";tab(b);$(b?"qTabBudget":"qTabModel").focus()}})});
  $("qTabBudget").tabIndex=-1;

  /* Бюджет: модели, которые укладываются и на av.by стоят не дешевле */
  function fit(){
    var valid=validFields([["qBudget",1,10000000,"Укажите положительный бюджет."],["qRepair",0,100000,"Укажите резерв ремонта от 0 до 100 000 $ во вкладке модели."]],$("qBudgetError"));
    $("qFit").hidden=!valid;$("qPanelBudget").querySelector(".qc-actions").hidden=!valid;if(!valid)return null;
    var budget = Math.max(0, +$("qBudget").value || 0), rows = [];
    $("qBudgetContext").textContent="Резерв восстановления: "+fmt(+$("qRepair").value||0)+"; услуга: "+$("qService").value+" BYN; "+($("qBenefit").checked?"с льготой":"без льготы")+". Настройки можно изменить во вкладке модели.";
    IDX.forEach(function(r, i){
      var best = null;
      Object.keys(r[4]).forEach(function(ys){
        var y = +ys, mk = r[4][ys];
        /* Год, в котором такая машина в Беларуси стоит чуть дороже бюджета: тот же класс, а из США укладывается */
        if (y < nowYear - 8 || mk < budget * 0.95 || mk > budget * 1.4) return;
        var o = opts(r[3] ? 0 : ccFor(i, y), !!r[3] || r[6]==="hybrid", !!r[3], y), bid = maxBid(budget, o);
        if (bid < 2500) return;
        var score = Math.abs(mk - budget * 1.15);
        if (!best || score < best.score) best = {i:i, y:y, mk:mk, bid:bid, score:score};
      });
      if (best) rows.push(best);
    });
    rows.sort(function(a, b){ return b.y - a.y || b.mk - a.mk; });
    var ul = $("qFit"); ul.innerHTML = "";
    rows.slice(0, 6).forEach(function(x){
      var li = document.createElement("li"), btn = document.createElement("button");
      btn.type = "button";
      btn.innerHTML = '<b></b><span>ставка до <em class="num">' + fmt(x.bid) + '</em></span><span>на av.by <em class="num">' + fmt(x.mk) + "</em></span>";
      btn.querySelector("b").textContent = name(x.i) + " " + x.y;
      btn.addEventListener("click", function(){ tab(false); pick(x.i, x.y); lotTouched = true; $("qLot").value = Math.floor(x.bid / 500) * 500; run(); });
      li.appendChild(btn); ul.appendChild(li);
    });
    if (!rows.length) ul.innerHTML = '<li class="empty">Под этот бюджет популярные модели с выгодой не подобрались. Напишите нам, подберём вариант.</li>';
    return rows;
  }
  $("qBudget").addEventListener("input", fit);

  /* Заявка */
  function toLead(text){ var lc = $("lcar"); if (lc) lc.value = text; }
  $("qSend").addEventListener("click", function(e){
    var x=run();if(!x){e.preventDefault();return;}var o = x.c.o, nm = sel >= 0 ? name(sel) : (q.value.trim() || "машина");
    track("calc_send", {total: x.total, calc: "quick"});
    toLead("Быстрый расчёт: " + nm + ", " + x.c.year + " г., " + (o.ev ? "электро" : o.cc + " см³" + (o.alt ? ", гибрид" : "")) + ", ставка " + x.lot + " $, итого ≈ " + x.total + " $ с восстановлением (резерв " + o.repair + " $), услуга " + o.serviceByn + " BYN, " + (o.benefit?"с льготой":"без льготы") + ", через " + PORTS[o.port].name + ".");
  });
  $("qSendB").addEventListener("click", function(e){
    if(!fit()){e.preventDefault();return;}
    track("calc_send", {calc: "budget"});
    toLead("Бюджет до Минска: " + (+$("qBudget").value || 0) + " $ с резервом восстановления " + $("qRepair").value + " $, услуга " + $("qService").value + " BYN, " + ($("qBenefit").checked?"с льготой":"без льготы") + ". Подберите варианты.");
  });

  pick(D.popular[0]);
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
    $("ccVolume").disabled=ev;$("ccVolField").hidden=ev;
    var valid=validFields([["ccVolume",1,10000,"Укажите объём двигателя больше нуля."],["ccPrice",1,10000000,"Укажите положительную стоимость по документам."],["ccYear",nowYear-20,nowYear,"Выберите год выпуска."]],$("ccInputError"));
    $("ccResult").hidden=!valid;if(!valid)return;
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
    $("cr-total-usd").textContent = "≈ " + fmt(totalByn / CONFIG.usdByn) + " · курс: 1 € = " + CONFIG.eurUsd.toFixed(4) + " $, 1 $ = " + CONFIG.usdByn + " BYN";
  }
  var used = false;
  function onUse(){ run(); if (!used) { used = true; track("calc_used", {calc: "customs"}); } }
  form.addEventListener("input", onUse); form.addEventListener("change", onUse); run();
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
  a.className = "car"; a.href = BASE + "auto-usa/" + c.s + "/";
  var ph = c.i ? '<div class="ph"><img src="' + c.i + '" alt="" loading="lazy" decoding="async" width="300" height="225"></div>'
    : '<div class="ph ph-empty"><span class="pb"></span><b class="pm"></b><small>фото по запросу</small></div>';
  a.innerHTML = ph + '<div class="tx"><h3></h3><div class="meta">' + (c.y ? "<b>" + c.y + "</b>" : "") + "<span></span></div></div>";
  a.querySelector("h3").textContent = c.t; a.querySelector(".meta span").textContent = c.bn || "";
  if (!c.i) { a.querySelector(".pb").textContent = c.bn || ""; a.querySelector(".pm").textContent = c.m || c.t; }
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
    if (b && !t) { location.href = BASE + "usa/" + b + "/"; return; }
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
    msg.textContent = "VIN подготовлен для обращения. Отправьте его менеджеру в мессенджере или через форму ниже — уточним этап доставки и ожидаемый срок.";
    $("vinActions").hidden = false;
    $("vinWa").href = "https://wa.me/375296332828?text=" + encodeURIComponent(text);
    $("vinTg").href = "https://t.me/amerikaa_by";
    var box = $("lcar"); if (box) box.value = "Отслеживание: VIN " + vin;
    try { if (navigator.clipboard) navigator.clipboard.writeText(vin).catch(function(){}); } catch (err) {}
  });
})();
})();

// Нижняя панель на телефоне: показываем после первого экрана, чтобы не закрывала hero
(function(){
  var bar = document.querySelector(".mbar"); if (!bar) return;
  function f(){ bar.classList.toggle("on", window.scrollY > window.innerHeight * 0.6); }
  window.addEventListener("scroll", f, {passive: true}); f();
})();

// Кнопка «Подобрать авто» в шапке: ведёт к форме на странице, а если формы нет, на главную к форме
(function(){
  var b = document.querySelector(".hdr-cta"); if (!b) return;
  if (!document.getElementById("lead")) { var logo = document.querySelector(".logo"); b.href = (logo ? logo.getAttribute("href") : "/") + "#lead"; }
  b.addEventListener("click", function(){ if (typeof track === "function") track("cta_header"); });
})();
// Кнопка бюджета показывает введённую сумму
(function(){
  var i = document.getElementById("qBudget"), b = document.getElementById("qSendB"); if (!i || !b) return;
  function f(){ var v = +i.value || 0; b.textContent = v >= 3000 ? "Подобрать машины до " + v.toLocaleString("ru-RU") + " $" : "Подобрать машины под бюджет"; }
  i.addEventListener("input", f); f();
})();

// Кнопка «наверх»: появляется, когда пролистали больше полутора экранов
(function(){
  var t = document.querySelector(".totop"); if (!t) return;
  function f(){ t.classList.toggle("on", window.scrollY > window.innerHeight * 1.5); }
  window.addEventListener("scroll", f, {passive: true}); f();
  t.addEventListener("click", function(e){ e.preventDefault(); window.scrollTo({top: 0, behavior: "smooth"}); });
})();
