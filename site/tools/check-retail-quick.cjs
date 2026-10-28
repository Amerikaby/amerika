const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=path.join(__dirname,'../integrations/retail-quick'),Q=require(path.join(dir,'quick-core.js'));
const ratesSource=process.argv[2];if(!ratesSource)throw new Error('Pass a saved public rates.js snapshot');
const fx={USD:2.9456,EUR:3.2811,date:'2026-10-28'};
function runtime(file){const ctx={window:{AMZ_NBRB:fx}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(ratesSource,'utf8'),ctx);vm.runInContext(fs.readFileSync(file,'utf8').split('\n(function(){')[0],ctx);return ctx}
const ctx=runtime(path.join(dir,'retail-core.js')),prod=runtime(path.join(dir,'../retail-simple/retail-production.js'));let checks=0;
ctx.AMZ_QUICK_CORE=Q;
function equal(a,b,msg){assert.equal(a,b,msg);checks++}
function near(a,b,msg){assert(Math.abs(a-b)<1e-7,msg);checks++}
const counts={};
for(const port of ['klaipeda','poti']){
 const routes=Q.routes(ctx.RETAIL_RATES,ctx.CONFIG,ctx.costOf,port);counts[port]=routes.length;assert(routes.length>0);checks++;
 equal(routes[0].yard,'ATLANTA EAST - GA','Minimum ranks the full delivery');
 for(const r of routes){assert(ctx.RETAIL_RATES[r.auction][r.yard].seaConfirmed===true);near(r.shipping,r.inland+r.sea+r.last,'Delivery sum');}
 const route=routes[0],base=Q.estimate(8000,route,ctx.CONFIG,ctx.costOf,{enabled:false});
 near(base.total,base.price+base.fee+base.shipping+base.service,'No silent customs or repair');equal(base.customs,0);
 const withTax=Q.estimate(8000,route,ctx.CONFIG,ctx.costOf,{enabled:true,liters:1.5,age:4,benefit:true});
 assert(withTax.customs>0);checks++;near(withTax.total,base.total+withTax.customs,'Customs added exactly once');
 equal(Q.estimate(8000,route,ctx.CONFIG,ctx.costOf,{enabled:true,liters:'',age:4}),null,'Missing engine is not zero');
 equal(Q.estimate(8000,route,ctx.CONFIG,ctx.costOf,{enabled:true,liters:1.5,age:''}),null,'Missing age is not zero');
 for(const price of ['',0,-1,Infinity,10000001])equal(Q.estimate(price,route,ctx.CONFIG,ctx.costOf),null,'Invalid price blocked');
 equal(Q.routes(ctx.RETAIL_RATES,{...ctx.CONFIG,fxReady:false},ctx.costOf,port).length,0,'No FX fallback');
 equal(Q.routes({copart:{'UNKNOWN - XX':{car:1,carPoti:1,seaConfirmed:true}}},ctx.CONFIG,ctx.costOf,port).length,0,'No unknown state priced as east');
}
equal(Q.region('EXETER\u00a0- RI',ctx.CONFIG),'east');equal(Q.region('MOCKSVILLE\u00a0- NC',ctx.CONFIG),'east');equal(Q.region('TORONTO - ON',ctx.CONFIG),null);
const policyCases=[
 [{age:5,cc:1900,clearance:999},'allowed','klaipeda'],[{age:5,cc:1901},'denied','poti'],
 [{age:6,cc:4000,clearance:165},'allowed','klaipeda'],[{age:6,cc:1400,clearance:166},'denied','poti'],
 [{age:6,cc:1400,clearance:''},'unknown','poti'],[{age:'',cc:1400},'unknown','poti'],[{age:4,cc:''},'unknown','poti'],
 [{moto:true,landed:5000},'allowed','klaipeda'],[{moto:true,landed:5000.01},'denied','poti'],[{moto:true,landed:''},'unknown','poti']
];
for(const [input,status,port] of policyCases){const r=Q.routeDecision(input);equal(r.status,status);equal(r.port,port)}
const motoOpts={moto:true,auction:'copart',yard:'ALBANY - NY',port:'klaipeda',region:'east',cc:1000,year:2022,alt:false,ev:false,sublot:false,benefit:true,repair:0,serviceByn:590};
for(const budget of [1000,5000,6475,10000,1000000]){
 const bid=ctx.maxBidForBudget(budget,motoOpts),r=ctx.costOf(bid,motoOpts),landed=r.price+r.fee+r.inland+r.sea;
 if(ctx.costOf(0,motoOpts).total<=budget){assert(landed<=5000);assert(r.total<=budget);checks+=2;}
 assert(bid<=5000);checks++;
}
equal(ctx.maxBidForBudget(6475,motoOpts),2700,'Do not reject Klaipeda when a lower legal bid fits the budget');
for(const [auction,ys] of Object.entries(ctx.RETAIL_RATES))for(const yard of Object.keys(ys))for(const port of ['klaipeda','poti'])for(const moto of [false,true]){
 const o={auction,yard,port,moto,region:Q.region(yard,ctx.CONFIG)||'east',cc:1500,year:2022,alt:false,ev:false,sublot:false,benefit:true,repair:0,serviceByn:590};
 near(ctx.costOf(8000,o).total,prod.costOf(8000,o).total,'Existing financial formula unchanged');
}
const body=fs.readFileSync(path.join(dir,'body.php'),'utf8'),ids=Array.from(body.matchAll(/\bid="([A-Za-z][A-Za-z0-9_-]*)"/g),m=>m[1]);equal(new Set(ids).size,ids.length,'Unique IDs');
assert(!body.includes('contact-form-7'));checks++;for(const id of ['qPrice','qPort','qYard','qAge','qLiters','qClearance','quickPanel','quickDetailed','qSummary']){assert(ids.includes(id));checks++}
const core=fs.readFileSync(path.join(dir,'retail-core.js'),'utf8');assert(core.includes('/newcodex/kalkulyator-quick/?'));checks++;
console.log(JSON.stringify({result:'PASS',checks,confirmedRoutes:counts,minimum:Q.routes(ctx.RETAIL_RATES,ctx.CONFIG,ctx.costOf,'klaipeda')[0]},null,2));
