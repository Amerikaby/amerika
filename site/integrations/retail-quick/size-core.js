/* Apply the carrier's size difference to the existing retail base, once. */
var AMZ_SIZE_CORE=(function(){
  'use strict';
  function own(object,key){return object&&Object.prototype.hasOwnProperty.call(object,key)?object[key]:null}
  function quote(data,auction,yard,port,size,asOf){
    var q={inland:0,sea:0,total:0,inlandKnown:true,seaKnown:true,missing:[],origin:'',validUntil:data.validUntil,expired:false};
    if(!size||size==='compact')return q;
    var now=new Date(),today=asOf||[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
    if(data.validUntil&&today>data.validUntil){q.expired=true;q.missing.push('Прайс надбавок действовал до 31.10.2026: показаны последние ставки, актуальные доплаты подтвердит менеджер.');}
    if(!['crossover','large'].includes(size)){q.seaKnown=false;q.inlandKnown=false;q.missing.push('Уточните тип автомобиля.');return q;}
    var row=own(data.yards,auction+'|'+yard);q.origin=row?row.port:'';
    var sea=own(own(data.sea,port),q.origin),seaDelta=sea?sea[size]:null;
    if(Number.isFinite(seaDelta)&&seaDelta>=0)q.sea=seaDelta;
    else{q.seaKnown=false;q.missing.push('Неизвестная доплата за море для этого размера НЕ включена в сумму — уточните у менеджера.');}
    var inland=row?row[size]:null;
    if(Number.isFinite(inland)&&inland>=0)q.inland=inland;
    // AEC terms explicitly include standard SUVs in base inland prices. A blank Pickup is not a free oversize quote.
    else if(size==='large'||!row){q.inlandKnown=false;q.missing.push('Неизвестная доплата по США за габариты НЕ включена в сумму — уточните у менеджера.');}
    q.total=q.inland+q.sea;return q;
  }
  function apply(base,q){
    base.inland+=q.inland;base.sea+=q.sea;base.delivered+=q.total;base.total+=q.total;
    Object.defineProperty(base,'vehicleSizeQuote',{value:q,enumerable:false});return base;
  }
  return {quote:quote,apply:apply};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=AMZ_SIZE_CORE;
