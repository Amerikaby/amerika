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
/* Полная стоимость под ключ, $. o: {moto, year, cc, alt, ev, region, port, sublot, benefit} */
function costOf(price, o){
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
