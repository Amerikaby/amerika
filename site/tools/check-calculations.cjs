const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const dir=path.join(__dirname,'..');
const {CONFIG,costOf}=new Function(fs.readFileSync(path.join(dir,'assets/config.js'),'utf8')+'\n'+fs.readFileSync(path.join(dir,'assets/calc-core.js'),'utf8')+'\nreturn {CONFIG,costOf}')();
const base={moto:false,year:2022,cc:1500,alt:false,ev:false,region:'east',port:'klaipeda',sublot:false,benefit:false,repair:1500,serviceByn:590};
for(const price of [1000,8500,9000,9500,15000,30000]){
 const r=costOf(price,base);
 assert(Math.abs(r.total-['price','fee','inland','sea','last','extra','duty','cust','ours','repair'].reduce((a,key)=>a+r[key],0))<1e-7,'Total equals each distinct expense');
 assert.equal(costOf(price,{...base,repair:3500}).total-r.total,2000);
 assert(Math.abs((costOf(price,{...base,serviceByn:1999}).total-r.total)-(1999-590)/CONFIG.usdByn)<1e-7);
 const benefit=costOf(price,{...base,benefit:true});
 assert(Math.abs(r.total-benefit.total-r.duty/2)<1e-7);
 assert.equal(benefit.repair,r.repair);
 assert.equal(costOf(price,{...base,repair:0}).total,r.delivered);
}
for(const budget of [18000,20000,25000]){
 let lo=0,hi=budget;for(let i=0;i<40;i++){const mid=(lo+hi)/2; if(costOf(mid,base).total<=budget)lo=mid;else hi=mid}
 const bid=Math.floor(lo/50)*50;
 assert(costOf(bid,base).total<=budget);
 assert(costOf(bid+50,base).total>budget);
}
console.log('PASS: expense total, repair delta, tariff delta, explicit benefit, budget ceiling');
