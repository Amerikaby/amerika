/* Quick estimates reuse the approved production formulas and final retail rates. */
var AMZ_QUICK_CORE=(function(){
  'use strict';
  var states='AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' ');
  function finiteInput(value){return value===null||value===undefined||String(value).trim()===''?null:Number.isFinite(Number(value))?Number(value):null}
  function routeDecision(input){
    var age=finiteInput(input.age),cc=finiteInput(input.cc),clearance=finiteInput(input.clearance),landed=finiteInput(input.landed);
    if(input.moto){
      if(landed===null||landed<=0)return {status:'unknown',port:'poti',reason:'Для мотоцикла нужна сумма покупки, сборов и доставки до Клайпеды.'};
      return landed<=5000?{status:'allowed',port:'klaipeda',reason:'До Клайпеды не больше 5 000 $ вместе с покупкой и сборами.'}:{status:'denied',port:'poti',reason:'До Клайпеды больше 5 000 $ вместе с покупкой и сборами — выбираем Поти.'};
    }
    if(input.alt)return {status:'unknown',port:'poti',reason:'Маршрут гибрида или электромобиля подтвердит менеджер; для оценки выбран Поти.'};
    if(age===null||age<0)return {status:'unknown',port:'poti',reason:'Укажите возраст и двигатель для проверки маршрута.'};
    if(age<=5){
      if(cc===null||cc<=0)return {status:'unknown',port:'poti',reason:'Для авто до пяти лет укажите объём двигателя.'};
      if(cc>1900)return {status:'denied',port:'poti',reason:'Авто до пяти лет с двигателем больше 1,9 л направляем через Поти.'};
      if(!input.requireClearanceForAll)return {status:'allowed',port:'klaipeda',reason:'Авто до пяти лет и двигатель до 1,9 л — Клайпеда.'};
    }
    if(clearance===null||clearance<=0)return {status:'unknown',port:'poti',reason:'Для этой машины нужен клиренс. Пока он неизвестен, для оценки выбран Поти.'};
    return clearance<=165?{status:'allowed',port:'klaipeda',reason:'Клиренс не выше 165 мм — маршрут через Клайпеду.'}:{status:'denied',port:'poti',reason:'Клиренс выше 165 мм — маршрут через Поти.'};
  }
  function region(yard,config){
    var name=String(yard||'').replace(/[\s\u00a0]+/g,' '),m=/(?:,| -)\s*([A-Z]{2})\s*$/.exec(name);
    if(!m||states.indexOf(m[1])<0)return null;
    return config.states.west.indexOf(m[1])>=0?'west':config.states.center.indexOf(m[1])>=0?'center':'east';
  }
  function options(route,config,customs){
    customs=customs||{};
    return {auction:route.auction,yard:route.yard,region:route.region,port:route.port,moto:false,alt:false,ev:false,sublot:false,repair:0,
      year:customs.enabled?new Date().getFullYear()-Number(customs.age):new Date().getFullYear()-4,
      cc:customs.enabled?Number(customs.liters)*1000:1500,benefit:customs.benefit!==false,serviceByn:config.serviceByn};
  }
  function routes(rates,config,costFn,port){
    if(!config.fxReady||!['klaipeda','poti'].includes(port))return [];
    var found=[];
    ['copart','iaai'].forEach(function(auction){Object.keys(rates[auction]||{}).forEach(function(yard){
      var row=rates[auction][yard],area=region(yard,config),sea=row&&(port==='poti'?row.carPoti:row.car);
      if(!row||row.seaConfirmed!==true||!area||!Number.isFinite(sea)||sea<=0)return;
      var route={auction:auction,yard:yard,region:area,port:port},r=costFn(0,options(route,config));
      var shipping=r.inland+r.sea+r.last+r.extra;
      if([r.inland,r.sea,r.last,r.extra,shipping].every(Number.isFinite)&&shipping>0)found.push(Object.assign(route,{shipping:shipping,inland:r.inland,sea:r.sea,last:r.last}));
    })});
    return found.sort(function(a,b){return a.shipping-b.shipping||(a.auction+'|'+a.yard).localeCompare(b.auction+'|'+b.yard,'en')});
  }
  function estimate(price,route,config,costFn,customs){
    price=Number(price);customs=customs||{};
    if(!config.fxReady||!route||!Number.isFinite(price)||price<=0||price>10000000)return null;
    if(customs.enabled&&(!Number.isFinite(Number(customs.liters))||Number(customs.liters)<=0||Number(customs.liters)>10||customs.age===''||!Number.isInteger(Number(customs.age))||Number(customs.age)<0||Number(customs.age)>20))return null;
    var r=costFn(price,options(route,config,customs));
    var shipping=r.inland+r.sea+r.last+r.extra,withoutCustoms=r.price+r.fee+shipping+r.ours;
    var customsAmount=customs.enabled?r.duty+r.cust:0,total=withoutCustoms+customsAmount;
    if(![r.price,r.fee,r.ours,shipping,customsAmount,total].every(Number.isFinite))return null;
    return {price:r.price,fee:r.fee,service:r.ours,shipping:shipping,customs:customsAmount,customsEnabled:!!customs.enabled,total:total,withoutCustoms:withoutCustoms};
  }
  function motoMaxBid(budget,opts,unrestricted,costFn){
    var bid=unrestricted(budget,opts);
    if(!opts.moto||opts.port!=='klaipeda')return bid;
    // With nonnegative fees/delivery, any feasible bid is at most 5000. At most 101 steps.
    for(var candidate=Math.floor(Math.min(bid,5000)/50)*50;candidate>=0;candidate-=50){
      var r=costFn(candidate,opts),landed=r.price+r.fee+r.inland+r.sea;
      if(Number.isFinite(landed)&&landed<=5000&&Number.isFinite(r.total)&&r.total<=budget)return candidate;
    }
    return 0;
  }
  return {region:region,routes:routes,estimate:estimate,options:options,routeDecision:routeDecision,finiteInput:finiteInput,motoMaxBid:motoMaxBid};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=AMZ_QUICK_CORE;
