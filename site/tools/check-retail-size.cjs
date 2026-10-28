const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=path.join(__dirname,'../integrations/retail-quick'),Q=require(path.join(dir,'quick-core.js')),S=require(path.join(dir,'size-core.js'));
const context={window:{AMZ_NBRB:{USD:2.9456,EUR:3.2811,date:'2026-10-28'}},AMZ_SIZE_CORE:S};vm.createContext(context);
for(const file of [process.argv[2],path.join(dir,'size-rates.js')])vm.runInContext(fs.readFileSync(file,'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(dir,'production-core.js'),'utf8').split('\n(function(){')[0],context);context.AMZ_QUICK_CORE=Q;
const D=context.AMZ_SIZE_RATES;let checks=0;const near=(a,b)=>{assert(Math.abs(a-b)<1e-7);checks++};
const atl=(port,size)=>S.quote(D,'copart','ATLANTA EAST - GA',port,size);
near(atl('poti','crossover').sea,150); assert(S.quote(D,'copart','ATLANTA EAST - GA','poti','crossover','2026-11-01').expired); assert(!S.quote(D,'copart','ATLANTA EAST - GA','poti','crossover','2026-10-31').expired); assert(S.quote(D,'iaai','PHOENIX - AZ','poti','large').seaKnown); near(S.quote(D,'copart','HONOLULU - HI','klaipeda','large').sea,750);near(atl('poti','large').sea,450);near(atl('klaipeda','large').sea,300);
assert(atl('klaipeda','crossover').missing.some(s=>s.includes('море')));checks++;
assert(atl('poti','large').missing.some(s=>s.includes('по США')));checks++;
assert(S.quote(D,'copart','__proto__','poti','large').missing.length);checks++;
for(const port of ['klaipeda','poti'])for(const auction of ['copart','iaai'])for(const yard of Object.keys(context.RETAIL_RATES[auction])){
 const region=Q.region(yard,context.CONFIG);if(!region)continue;
 for(const size of ['compact','crossover','large']){
  const surcharge=S.quote(D,auction,yard,port,size);assert(Number.isFinite(surcharge.total)&&surcharge.total>=0);checks++;
  for(const price of [1000,8000,15000]){
   const o={auction,yard,region,port,year:2022,cc:1500,moto:false,alt:false,ev:false,sublot:false,benefit:true,repair:0,serviceByn:590,vehicleSize:size};
   const base=context.costOfBase(price,o),sized=context.costOf(price,o);
   near(sized.total-base.total,surcharge.total);near(sized.inland-base.inland,surcharge.inland);near(sized.sea-base.sea,surcharge.sea);
   for(const name of ['fee','duty','cust','ours','last','extra','repair'])near(sized[name],base[name]);
  }
 }
}
const totals={};for(const port of ['klaipeda','poti'])for(const size of ['compact','crossover','large']){
 const routes=Q.routes(context.RETAIL_RATES,context.CONFIG,context.costOf,port,size);assert(routes.length===306);checks++;
 for(let i=1;i<routes.length;i++){assert(routes[i-1].sizeRank<routes[i].sizeRank||(routes[i-1].sizeRank===routes[i].sizeRank&&routes[i-1].shipping<=routes[i].shipping));checks++;}
 const r=Q.estimate(8000,routes[0],context.CONFIG,context.costOf,{enabled:false});totals[port+'|'+size]={total:Math.round(r.total),delivery:Math.round(r.shipping),yard:routes[0].yard};
}
assert(totals['poti|crossover'].total>totals['poti|compact'].total);assert(totals['poti|large'].total>totals['poti|crossover'].total);assert(totals['klaipeda|large'].total>totals['klaipeda|compact'].total);checks+=3;
const budgetOpts={auction:'copart',yard:'ATLANTA EAST - GA',region:'east',port:'poti',year:2022,cc:1500,moto:false,alt:false,ev:false,sublot:false,benefit:true,repair:0,serviceByn:590,vehicleSize:'large'};
const bid=context.maxBidForBudgetUnrestricted(18000,budgetOpts);assert(context.costOf(bid,budgetOpts).total<=18000);assert(context.costOf(bid+50,budgetOpts).total>18000);checks+=2;
console.log(JSON.stringify({status:'PASS',checks,matchedAECYards:Object.keys(D.yards).length,totals},null,2));
