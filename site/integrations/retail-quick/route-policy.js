/* Preview-only route policy from Sasha Gankovich's instructions, 28.10.2026. */
function AMZ_PREVIEW_ROUTE(moto,alt,cc){
  var Q=AMZ_QUICK_CORE,$=function(id){return document.getElementById(id)},root=$('calcForm');
  var year=Q.finiteInput($('year')&&$('year').value),price=Q.finiteInput($('price')&&$('price').value);
  var selected=function(name){var el=root&&root.querySelector('[name="'+name+'"]:checked');return el?el.value:''};
  var input={moto:moto,alt:alt,cc:cc,age:year===null?null:CALC_YEAR-year,clearance:Q.finiteInput($('clearance')&&$('clearance').value),requireClearanceForAll:!!window.AMZ_QUICK_POLICY.clearanceAll};
  if(moto){
    var auction=selected('auction'),yard=$('yard').value,region=Q.region(yard,CONFIG),row=retailRateFor(auction,yard);
    if(price!==null&&price>0&&region&&row&&Number.isFinite(row.moto)){
      var opts={moto:true,alt:alt,ev:alt,cc:cc||0,year:year||CALC_YEAR-4,auction:auction,yard:yard,region:region,port:'klaipeda',sublot:$('sublot').checked,repair:Math.max(0,Number($('repair').value)||0),benefit:$('benefit').checked,serviceByn:Number($('service').value)};
      var bid=selected('mode')==='budget'?maxBidForBudget(price,opts):price;
      var cost=costOf(bid,opts);input.landed=cost.price+cost.fee+cost.inland+cost.sea;
    }
  }
  return Q.routeDecision(input);
}
