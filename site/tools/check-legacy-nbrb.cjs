const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '../integrations/nbrb-rates/legacy');
let checks = 0;
for (const name of ['calc-script.js', 'calc-script-rozn.js']) {
  const source = fs.readFileSync(path.join(root, name), 'utf8');
  const captures = [];
  function Request() { this.open = this.send = () => {}; this.status = 200; this.responseText = '1'; }
  vm.runInNewContext(source, {window:{AMZ_NBRB:{}}, XMLHttpRequest:Request, eval:code=>captures.push(code)});
  const decoded = captures.join('\n');
  new vm.Script(decoded);
  assert.match(source, /module\.exports = window\.AMZ_NBRB \|\| \{\}/); checks++;
  const start = decoded.indexOf('function executeMainProgramPart()');
  const end = decoded.indexOf('\n  }, {\n    key: "executeMainActions"', start);
  assert.ok(start >= 0 && end > start); checks++;
  const fnSource = decoded.slice(start, end).trim();
  for (const state of ['fresh','stale','missing']) {
    const rates = state === 'missing' ? {} : {USD:2.9883,EUR:3.3514,date:'2026-10-21',stale:state==='stale'};
    const status = {textContent:''}, result = {textContent:'old'};
    let called = 0;
    const context = {
      window:{AMZ_NBRB:rates}, exchange:{},
      document:{querySelector:()=>({}), getElementById:()=>status, querySelectorAll:()=>[result]}
    };
    const init = vm.runInNewContext('('+fnSource+')', context);
    const calculator = {executeMainActions(){called++;}};
    init.call(calculator);
    if (state === 'missing') {
      assert.equal(called,0); assert.equal(result.textContent,'—');
      assert.match(status.textContent,/недоступны/); checks+=3;
    } else {
      assert.equal(called,1); assert.equal(calculator.rubleDollarRate,2.9883);
      assert.equal(calculator.euroDollarRate,3.3514/2.9883);
      assert.match(status.textContent,/21\.10\.2026.*2\.9883.*3\.3514/);
      assert.equal(status.textContent.includes('последние доступные'),state==='stale'); checks+=5;
    }
  }
}
const customs=fs.readFileSync(path.join(root,'customs_calc.js'),'utf8');
new vm.Script(customs);
assert.doesNotMatch(customs,/jQuery\.ajax|www\.nbrb\.by/); checks++;
assert.match(customs,/enteredPrice \* selectedRate \/ j_eur/); checks++;
console.log(`PASS: ${checks} legacy checks, both wholesale initializers/exact FX/date/stale/missing, customs shared source and selected currency.`);
