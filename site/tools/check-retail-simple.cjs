const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const dir=path.join(__dirname,'../integrations/retail-simple');
const H=require(path.join(dir,'preview.js'));
let count=0;
for(const input of ['53059306','#53059306',' 5305 9306 ']){assert.deepEqual(H.lookupInput(input),{kind:'detail',id:'53059306'});count++}
for(const input of ['https://www.copart.com/lot/53059306','https://www.iaai.com/VehicleDetail/123~US','https://www.copart.ca/lot/53059306']){assert.equal(H.lookupInput(input).kind,'url');count++}
for(const input of ['','123','http://www.copart.com/lot/53059306','https://copart.com.evil.test/lot/12345678','https://evilcopart.com/lot/12345678','https://user:secret@copart.com/lot/12345678','https://copart.com:444/lot/12345678','javascript:alert(1)','../../usage','https://127.0.0.1/']){assert.equal(H.lookupInput(input),null,input);count++}
assert(H.matches({label:'CHEVROLET',aliases:['шевроле']},'шев'));count++;
assert(H.matches({label:'Клайпеда (Литва)',aliases:['klaipeda']},'klai'));count++;
assert(H.matches({label:'Поти (Грузия)',aliases:['poti']},'пот'));count++;
assert(H.matches({label:'1,5 л · 1500 см³'},'1.5'));count++;
const car={vehicle_specs:{fuel_type:'Gas',engine:{size_l:'1.8',raw:'1.8L 4'}}};
assert.equal(H.fuelFor(car),'ice');assert.equal(H.ccFor(car),1800);count+=2;
assert.equal(H.fuelFor({vehicle_specs:{fuel_type:'Plug-in hybrid electric'}}),'hybrid');count++;
assert.equal(H.ccFor({vehicle_specs:{fuel_type:'Electric',engine:null}}),0);count++;
assert.equal(H.ccFor({vehicle_specs:{engine:{raw:'2.0L turbo'}}}),2000);count++;
for(const engine of [null,{size_l:'not known',raw:'unknown'},{size_l:20},{size_l:0},{size_l:Infinity}]){assert.equal(H.ccFor({vehicle_specs:{engine}}),null);count++}
assert.equal(H.fuelFor({vehicle_specs:{fuel_type:'unknown'}}),null);count++;
const yards=['MENTONE - CA','MENTONE EAST - CA','ALBANY - NY'];
for(const display of ['Mentone (CA)','CA - MENTONE','Copart: Mentone (CA)']){assert.equal(H.yardFor({display},yards),'MENTONE - CA');count++}
assert.equal(H.yardFor({display:'Mentone'},yards),'');assert.equal(H.yardFor({display:'Unknown (CA)'},yards),'');count+=2;
const base=fs.readFileSync(path.join(dir,'../retail-calculator/retail.js'),'utf8'),preview=fs.readFileSync(path.join(dir,'retail.js'),'utf8');
assert.equal(base.slice(0,base.indexOf('\n(function(){')),preview.slice(0,preview.indexOf('\n(function(){')),'FX, tariffs, forward and reverse formulas remain byte-identical');count++;
const body=fs.readFileSync(path.join(dir,'preview-body.php'),'utf8');
const ids=Array.from(body.matchAll(/\bid="([A-Za-z][A-Za-z0-9_-]*)"/g),m=>m[1]);
assert.equal(new Set(ids).size,ids.length,'No duplicate IDs in the preview source');count++;
for(const id of ['calcForm','year','volume','port','yard','repair','service','r-total','lotLookup','findLot','lotStatus','simpleDeliveryTotal']){assert(ids.includes(id));count++}
assert(preview.includes('/newcodex/kalkulyator-simple/?'));count++;
console.log('PASS: '+count+' preview checks: trusted lot URLs, normalization, exact yard matching, missing specs, unique fields, unchanged calculation core.');
