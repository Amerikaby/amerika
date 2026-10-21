// Local calculation regressions. No browser, network, or form submissions.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../integrations/retail-calculator/retail.js'), 'utf8');
// Public final retail prices, not the private wholesale source.
const rates = {
  copart: {'ALBANY - NY': {car: 1500, moto: 1100}, 'LOS ANGELES - CA': {car: 2200, moto: 1250}},
  iaai: {'ALBANY - NY': {car: 1500, moto: 1100}}
};
const context = vm.createContext({RETAIL_RATES: rates});
vm.runInContext(source.slice(0, source.indexOf('\n(function(){')), context);
const {CONFIG, CALC_YEAR, costOf, retailRateFor, maxBidForBudget} = context;
const base = {auction: 'copart', yard: 'ALBANY - NY', moto: false, year: CALC_YEAR - 4,
  cc: 1500, alt: false, ev: false, region: 'east', port: 'klaipeda', sublot: false,
  benefit: false, repair: 1500, serviceByn: 590};

for (const yard of ['', 'Unknown yard', 'constructor', 'toString', '__proto__']) {
  assert.equal(retailRateFor('copart', yard), null, 'Reject non-yard: ' + yard);
}
assert.equal(retailRateFor('constructor', 'ALBANY - NY'), null);
assert.equal(retailRateFor('missing', 'ALBANY - NY'), null);
assert.equal(retailRateFor('copart', 'ALBANY - NY').car, 1500);

for (const moto of [false, true]) for (const region of ['east', 'center', 'west']) {
  const previousPoti = moto ? {east: 700, center: 850, west: 1150} : {east: 1300, center: 1500, west: 2100};
  const r = costOf(9000, {...base, moto, region, port: 'poti'});
  assert.equal(r.sea, previousPoti[region] + 700, 'Poti surcharge applied once');
}
for (const auction of Object.keys(rates)) for (const yard of Object.keys(rates[auction])) {
  for (const moto of [false, true]) {
    const o = {...base, auction, yard, moto};
    const r = costOf(9000, o);
    assert.equal(r.sea, rates[auction][yard][moto ? 'moto' : 'car'], 'Use the supplied final sea price unchanged');
    const total = ['price', 'fee', 'inland', 'sea', 'last', 'extra', 'duty', 'cust', 'ours', 'repair'].reduce((sum, k) => sum + r[k], 0);
    assert(Math.abs(r.total - total) < 1e-7);
    assert(Math.abs(costOf(9000, {...o, repair: 3500}).total - r.total - 2000) < 1e-7);
  }
}

// Independent exhaustive oracle, including affordable islands after a duty-rate drop.
function exhaustiveBid(budget, o) {
  let best = 0;
  for (let price = 0; price <= budget; price += 50) if (costOf(price, o).total <= budget) best = price;
  return best;
}
const profiles = [base,
  ...[1000, 1200, 1500, 3000].map(cc => ({...base, year: CALC_YEAR - 1, cc, port: cc > 1900 ? 'poti' : 'klaipeda'})),
  {...base, year: CALC_YEAR - 1, cc: 1000, benefit: true},
  {...base, cc: 0, alt: true, ev: true, port: 'poti'},
  ...[250, 800, 1000].map(cc => ({...base, moto: true, cc})),
  {...base, moto: true, alt: true, cc: 0, benefit: true}
];
let budgetCases = 0;
for (const o of profiles) {
  const budgets = new Set([1, 1000, 18000, 20100, 20200, 35000, 75000, 200000]);
  const boundaries = CONFIG.auctionFee.map(t => t[0]);
  if (!o.moto && !o.ev && CALC_YEAR - o.year < 3) {
    boundaries.push(...CONFIG.duty.under3.filter(t => Number.isFinite(t[0])).map(t => t[0] * CONFIG.eurUsd));
  }
  for (const boundary of boundaries) {
    const before = Math.floor(boundary / 50) * 50;
    for (const price of [before - 50, before, before + 50]) {
      const total = costOf(Math.max(0, price), o).total;
      budgets.add(Math.floor(total));
      budgets.add(Math.ceil(total));
    }
  }
  for (const budget of budgets) {
    assert.equal(maxBidForBudget(budget, o), exhaustiveBid(budget, o), JSON.stringify({budget, year: o.year, cc: o.cc, moto: o.moto, benefit: o.benefit}));
    budgetCases++;
  }
}
assert.equal(maxBidForBudget(20100, {...base, year: CALC_YEAR - 1, cc: 1000}), 9600);
assert.equal(maxBidForBudget(20200, {...base, year: CALC_YEAR - 1, cc: 1200}), 9600);
assert.equal(maxBidForBudget(10000000, base), exhaustiveBid(10000000, base), 'Preserve the existing maximum input');

// Exercise the actual field validator using plain objects, without a DOM/browser.
const fields = {};
function element(id) {
  return {id, value: '', disabled: false, attrs: {}, setAttribute(k, v) {this.attrs[k] = v;},
    getAttribute(k) {return this.attrs[k] || '';}, after() {}};
}
for (const id of ['price', 'volume', 'repair', 'year']) {
  fields[id] = element(id); fields[id + 'Error'] = element(id + 'Error');
}
const validatorSource = source.slice(source.indexOf('function validFields('), source.indexOf('\n/* ---------- Общие формулы'));
const validate = new Function('$', 'document', validatorSource + '\nreturn validFields;')(
  id => fields[id], {createElement() {return element('');}});
for (const [id, min, max] of [['price', 1, 10000000], ['volume', 1, 10000], ['repair', 0, 100000], ['year', CALC_YEAR - 20, CALC_YEAR]]) {
  for (const value of ['', '-1', '1e309', 'abc', String(max + 1)]) {
    fields[id].value = value;
    assert.equal(validate([[id, min, max, 'Invalid']], element('error')), false, id + ': ' + value);
  }
  fields[id].value = '0';
  assert.equal(validate([[id, min, max, 'Invalid']], element('error')), id === 'repair');
}
fields.volume.disabled = true; fields.volume.value = '';
assert.equal(validate([['volume', 1, 10000, 'Invalid']], element('error')), true, 'EV does not need engine displacement');

// The real calc handler must hide the result and disable sending for invalid rates.
const ui = {}, bill = {};
const get = id => ui[id] || (ui[id] = Object.assign(element(id), {classList: {toggle() {}}}));
for (const [id, value] of Object.entries({price: '9000', volume: '1500', repair: '1500', year: String(base.year)})) get(id).value = value;
const documentStub = {querySelector() {return bill;}, createElement() {return element('');}};
const uiValidator = new Function('$', 'document', validatorSource + '\nreturn validFields;')(get, documentStub);
let selected = {...base};
const handlerSource = source.slice(source.indexOf('  function calc(){'), source.indexOf('\n  $("advToggle")'));
const handler = new Function('val', '$', 'validFields', 'document', 'options', 'RETAIL_RATES', 'cost', 'PORTS',
  'fmt', 'CONFIG', 'refreshRetailLead', 'nowYear', 'retailRateFor', 'maxBidForBudget', handlerSource + '\nreturn calc;')(
  name => ({fuel: 'ice', vtype: 'car', mode: 'price'})[name], get, uiValidator, documentStub, () => selected,
  rates, costOf, context.PORTS, n => Math.round(n) + ' $', CONFIG, () => {}, CALC_YEAR, retailRateFor, maxBidForBudget);
assert(handler());
for (const yard of ['', 'Unknown yard', 'constructor', 'toString', '__proto__']) {
  selected = {...base, yard};
  assert.equal(handler(), null);
  assert.equal(get('sendCalc').attrs['aria-disabled'], 'true');
  assert.equal(bill.hidden, true);
}
selected = {...base};
const oldLastLeg = CONFIG.lastLeg.klaipeda;
CONFIG.lastLeg.klaipeda = NaN;
assert.equal(handler(), null, 'Do not display or send a non-finite total');
assert.equal(get('sendCalc').attrs['aria-disabled'], 'true');
assert.equal(bill.hidden, true);
CONFIG.lastLeg.klaipeda = oldLastLeg;
assert(handler());
assert.equal(get('sendCalc').attrs['aria-disabled'], 'false');

// Round-trip the actual share serializer and URL loader, not a second implementation.
const serializeLine = source.match(/var query=new URLSearchParams\(\{[^\n]+\}\);/)[0];
const serialize = new Function('val', '$', serializeLine + '\nreturn query;');
const loaderSource = source.slice(source.indexOf('  /* Подстановка из адреса:'), source.indexOf('\n  fillYards();'));
const load = new Function('params', '$', 'document', 'nowYear', 'CONFIG', 'retailRateFor', 'val', loaderSource);
function controls(values = {}, radios = {}) {
  const nodes = {}, choices = Object.assign({vtype: 'car', mode: 'price', fuel: 'ice', auction: 'copart'}, radios);
  for (const [key, value] of Object.entries(Object.assign({price: '12000', year: String(CALC_YEAR - 4), volume: '2000',
    repair: '1500', service: '590', yard: 'ALBANY - NY', port: 'auto', benefit: false, sublot: false}, values))) {
    nodes[key] = {value: String(value), checked: Boolean(value)};
  }
  const document = {querySelector(selector) {
    const match = selector.match(/\[name="([^"]+)"\]\[value="([^"]+)"\]/);
    assert(match, 'Expected a radio selector: ' + selector);
    return {set checked(value) {if (value) choices[match[1]] = match[2];}};
  }};
  return {nodes, choices, get: id => nodes[id], val: name => choices[name], document};
}
function restore(query) {
  const c = controls();
  load(new URLSearchParams(query), c.get, c.document, CALC_YEAR, CONFIG, retailRateFor, c.val);
  return c;
}
const roundTrips = [
  controls({price: '35000', year: String(CALC_YEAR - 1), volume: '1800', repair: '2700', service: '990',
    benefit: true, sublot: true, port: 'poti'}, {mode: 'budget', fuel: 'hybrid', auction: 'iaai'}),
  controls({price: '5000', year: String(CALC_YEAR - 2), volume: '0', repair: '800', service: '1999',
    port: 'klaipeda'}, {vtype: 'moto', fuel: 'ev'}),
  controls({price: '20100', year: String(CALC_YEAR - 1), volume: '1000'}, {mode: 'budget'})
];
for (const original of roundTrips) {
  const query = serialize(original.val, original.get);
  assert.equal(query.has('year'), false, 'Shared links must not use WordPress archive query variable');
  assert.equal(query.get('car_year'), String(original.nodes.year.value));
  // Simulate the observed canonical redirect removing the reserved parameter.
  const url = new URL('/kalkulyator/?' + query, 'https://amerika.by');
  url.searchParams.delete('year');
  const restored = restore(url.searchParams);
  for (const id of ['price', 'year', 'volume', 'repair', 'service', 'yard', 'port']) {
    assert.equal(String(restored.nodes[id].value), String(original.nodes[id].value), 'Round trip: ' + id);
  }
  for (const id of ['benefit', 'sublot']) assert.equal(restored.nodes[id].checked, original.nodes[id].checked, 'Round trip: ' + id);
  assert.deepEqual(restored.choices, original.choices);
}
const restoredRegression = restore(serialize(roundTrips[2].val, roundTrips[2].get));
assert.equal(maxBidForBudget(Number(restoredRegression.nodes.price.value), {...base,
  year: Number(restoredRegression.nodes.year.value), cc: Number(restoredRegression.nodes.volume.value)}), 9600,
  'A shared recent-car budget must preserve its affordable bid');
assert.equal(Number(restore('year=' + (CALC_YEAR - 1)).nodes.year.value), CALC_YEAR - 1, 'Legacy year still loads where no redirect removed it');
assert.equal(Number(restore('year=' + (CALC_YEAR - 4) + '&car_year=' + (CALC_YEAR - 1)).nodes.year.value), CALC_YEAR - 1, 'car_year takes priority');

console.log('PASS: own-yard lookup; final retail sea/Poti +700; expense totals; ' + budgetCases + ' exhaustive budget comparisons; 10m input; invalid fields/EV; invalid result blocks sending; full share round trips and legacy year');
