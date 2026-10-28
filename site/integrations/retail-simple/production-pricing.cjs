// Preserve the production delivery changes approved and deployed on 27.10.2026.
// The preview retains its separate, earlier delivery model.
module.exports = function productionPricing(source) {
  function replaceOnce(before, after) {
    if (!source.includes(before) || source.indexOf(before) !== source.lastIndexOf(before)) {
      throw new Error('Production pricing source changed; reconcile it before rebuilding.');
    }
    source = source.replace(before, after);
  }
  replaceOnce('lastLeg: {klaipeda:650, poti:1700}', 'lastLeg: {klaipeda:null, poti:2490}');
  replaceOnce('  var sea = o.port === "klaipeda" ? (row ? row[o.moto ? "moto" : "car"] : NaN) : L.sea.poti[o.region];\n  var last = L.lastLeg[o.port];',
    '  var sea = o.port === "klaipeda" ? (row ? row[o.moto ? "moto" : "car"] : NaN) :\n    (!o.moto && row && row.seaConfirmed ? row.carPoti : L.sea.poti[o.region]);\n  // Retail destination leg includes port handling; EUR amount follows the shared daily FX.\n  var last = !o.moto && o.port === "klaipeda" ? 1100 * CONFIG.eurUsd - 50 : L.lastLeg[o.port];');
  replaceOnce('Тарифы Поти предварительные: подтвердим по конкретному лоту.', 'Доставку подтвердим по конкретному лоту.');
  replaceOnce('Море рассчитано по выбранной площадке. Наземная доставка — предварительно.', 'Море рассчитано по выбранной площадке. Доставка до Минска включает портовое оформление.');
  replaceOnce('    $("route").innerHTML = txt;', '    if (!o.moto) {\n      var selectedRate = retailRateFor(o.auction, o.yard);\n      if (selectedRate && !selectedRate.seaConfirmed) txt += " Морской тариф предварительный: уточните у менеджера.";\n    }\n    $("route").innerHTML = txt;');
  return source;
};
