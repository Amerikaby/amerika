(function(){
  'use strict';
  var root=document.getElementById('amz-retail-calc');if(!root)return;
  var $=function(id){return document.getElementById(id)},Q=AMZ_QUICK_CORE,form=$('quickForm'),detailed=$('quickDetailed'),panel=$('quickPanel');
  var mode='quick',available=[],selected=null,result=null,revision=0,lastTransferred=-1,routesPort='';
  var sizeNames={compact:'Легковой: седан / хэтчбек',crossover:'Кроссовер среднего размера',large:'Крупный SUV / пикап'};
  var params=new URLSearchParams(location.search);
  function money(n){return Math.round(n).toLocaleString('ru-RU')+' $'}
  function size(){var el=form.querySelector('[name=qSize]:checked');return el?el.value:'compact'}
  function customs(){return {enabled:$('qCustoms').checked,liters:$('qLiters').value,age:$('qAge').value,benefit:$('qBenefit').checked}}
  function policy(){return Q.routeDecision({age:$('qAge').value,cc:$('qLiters').value===''?null:Number($('qLiters').value)*1000,clearance:$('qClearance').value,requireClearanceForAll:!!window.AMZ_QUICK_POLICY.clearanceAll})}
  function routePort(){var p=policy();return $('qPort').value==='auto'?($('qAge').value===''&&$('qLiters').value===''?'klaipeda':p.port):$('qPort').value}
  function label(route){return (route.auction==='copart'?'Copart':'IAAI')+' · '+route.yard}
  function summary(){
    if(mode==='detail'){
      var rows=['Подробный предварительный расчёт'];
      ['price','year','volume','yard','repair'].forEach(function(id){rows.push(({price:'Цена / бюджет, $',year:'Год',volume:'Двигатель, см³',yard:'Площадка',repair:'Ремонт, $'})[id]+': '+$(id).value)});
      var checked=function(n){var el=root.querySelector('#calcForm [name='+n+']:checked');return el?el.parentNode.textContent.trim():''};
      var invalid=!$('calcInputError').hidden||root.querySelector('#quickDetailed .bill-in').hidden;
      rows.push('Режим: '+checked('mode'),'Аукцион: '+checked('auction'),'Техника: '+checked('vtype'),'Двигатель: '+checked('fuel'),'Маршрут: '+$('route').textContent,'Клиренс, мм: '+($('clearance').value||'не указан'),'Услуга, BYN: '+$('service').value,'Льгота 50%: '+($('benefit').checked?'да':'нет'));
      if(root.querySelector('#calcForm [name=mode]:checked').value==='budget')rows.push('Максимальная ставка: '+(invalid?'не рассчитана':$('r-max').textContent));
      rows.push('Итог: '+(invalid?'не рассчитан — '+$('calcInputError').textContent:$('r-total').textContent),'Проверьте параметры по лоту перед оплатой.');
      $('qSummary').value=rows.join('\n');return;
    }
    if(!result){$('qSummary').value=$('qError').textContent?'Расчёт не завершён: '+$('qError').textContent:'Введите цену лота для быстрого предварительного расчёта.';return;}
    var c=customs(),lines=['Быстрый предварительный расчёт','Цена лота: '+money(result.price),'Тип: '+sizeNames[size()],
      'Маршрут: '+label(selected)+' → '+(selected.port==='poti'?'Поти':'Клайпеда')+' → Минск',
      'Доставка (базовый тариф): '+money(result.shipping),'Сборы аукциона: '+money(result.fee),'Наша услуга: '+money(result.service),
      'Таможня: '+(c.enabled?money(result.customs)+'; двигатель '+c.liters+' л; возраст '+c.age+' лет; льгота 50%: '+(c.benefit?'да':'нет'):'не включена'),
      'Клиренс, мм: '+($('qClearance').value||'не указан'),'Проверка маршрута: '+$('qPolicyNote').textContent,
      'Ремонт: не включён','Итог: '+money(result.total)];
    if(size()!=='compact')lines.push('Доплата за габариты не включена, нужен тариф менеджера.');
    lines.push('Площадка выбрана для примера, а не из реального лота.');$('qSummary').value=lines.join('\n');
  }
  function refreshRoutes(port){
    routesPort=port;available=Q.routes(RETAIL_RATES,CONFIG,costOf,port);
    var list=$('qYardOptions');list.replaceChildren();
    available.slice().sort(function(a,b){return label(a).localeCompare(label(b),'en')}).forEach(function(r){var option=document.createElement('option');option.value=label(r);list.appendChild(option)});
  }
  function update(){
    var c=customs(),typed=$('qYard').value.trim(),decision=policy(),port=routePort();
    if(routesPort!==port)refreshRoutes(port);
    selected=typed?available.find(function(r){return label(r).toLowerCase()===typed.toLowerCase()}):available[0];
    $('qSizeNote').hidden=size()==='compact';$('qClearanceField').hidden=$('qAge').value===''||Number($('qAge').value)<=5;
    $('qPort').querySelector('[value=auto]').textContent='Автоматически · '+(port==='poti'?'Поти':'Клайпеда')+(decision.status==='unknown'?' (предварительно)':'');
    $('qYard').setAttribute('aria-invalid',String(!!typed&&!selected));
    $('qRouteSummary').textContent=selected?(selected.port==='poti'?'Поти':'Клайпеда')+' · '+label(selected):'Маршрут не выбран';
    $('qRouteHint').textContent=typed?'Вы выбрали площадку вручную. Это базовый тариф доставки.':'Минимальная подтверждённая доставка в справочнике. Площадка реального лота может отличаться.';
    $('qResultTitle').textContent=c.enabled?'Авто с доставкой и таможней':'Авто с доставкой, без таможни';
    var routeWarning=port==='klaipeda'&&decision.status==='denied';
    $('qRouteWarning').hidden=!routeWarning;$('qRouteWarning').textContent=routeWarning?decision.reason+' Измените порт или выберите автоматический маршрут.':'';
    $('qPolicyNote').textContent=decision.status==='unknown'?(port==='klaipeda'?'Клайпеда выбрана для ценового примера. Доступность маршрута ещё не проверена. ':'Предварительно выбран Поти. ')+decision.reason:routeWarning?decision.reason:port!==decision.port?'Вы выбрали Поти вручную. По введённым параметрам возможна Клайпеда; дату выпуска подтвердит менеджер.':decision.reason+' Дату выпуска и параметры подтвердит менеджер.';
    $('qShipping').textContent=selected?'≈ '+money(selected.shipping):'—';
    result=Q.estimate($('qPrice').value,selected,CONFIG,costOf,c);
    if(routeWarning)result=null;
    var error=!CONFIG.fxReady?'Не удалось получить курс НБРБ. Расчёт временно недоступен.':!available.length?'Нет подтверждённых тарифов для выбранного порта. Свяжитесь с менеджером.':!selected?'Выберите площадку из подсказок или очистите поле для автоматического маршрута.':$('qPrice').value&&(!Number.isFinite(Number($('qPrice').value))||Number($('qPrice').value)<=0||Number($('qPrice').value)>10000000)?'Укажите положительную цену лота до 10 000 000 $.':c.enabled&&!result&&$('qPrice').value?'Для расчёта таможни укажите двигатель от 0,1 до 10 л и возраст автомобиля.':'';
    if(routeWarning)error='Этот маршрут не подходит под введённые параметры. Выберите Поти или автоматический маршрут.';
    $('qError').hidden=!error;$('qError').textContent=error;
    $('qBreakdownWrap').hidden=!result;$('qBreakdown').hidden=!result;$('qCustomsRow').hidden=!c.enabled;$('qTotal').textContent=result?(size()==='compact'?'≈ ':'от ≈ ')+money(result.total):'—';
    $('qByn').textContent=result?'≈ '+Math.round(result.total*CONFIG.usdByn).toLocaleString('ru-RU')+' BYN · по курсу НБРБ '+retailFxDate():error?'Исправьте отмеченные параметры.':'Введите цену лота, чтобы увидеть бюджет.';
    if(result){$('qLotTotal').textContent=money(result.price);$('qFee').textContent=money(result.fee);$('qDelivery').textContent=money(result.shipping);$('qService').textContent=money(result.service);$('qCustomsTotal').textContent=money(result.customs)}
    $('qIncluded').textContent=c.enabled?'Включено: лот, сборы, доставка, таможня и наша услуга.':'Включено: лот, сборы, доставка и наша услуга.';
    $('qExcluded').textContent=(c.enabled?'Не включён ремонт.':'Не включены таможня и ремонт.')+(size()!=='compact'?' Показан базовый тариф легкового авто; доплату за габариты уточнит менеджер.':'');
    $('qCustomsAssumption').hidden=!c.enabled||!result;$('qCustomsAssumption').textContent=c.enabled&&result?'Бензин / дизель · '+c.liters+' л · '+c.age+' лет · '+(c.benefit?'льгота 50%':'без льготы')+'. Пограничные даты выпуска проверит менеджер.':'';
    $('qFxNote').textContent=CONFIG.fxReady?'Курс НБРБ на '+retailFxDate()+'. '+(CONFIG.ratesStale?'Используется сохранённый курс, обновление временно недоступно. ':'')+'Это предварительная оценка, а не счёт на оплату.':'Курсы временно недоступны.';
    $('qShare').disabled=!result;summary();
  }
  function transferToDetailed(){
    if(revision===lastTransferred||!selected||!Number.isFinite(Number($('qPrice').value))||Number($('qPrice').value)<=0)return;
    root.querySelector('#calcForm [name=mode][value=price]').checked=true;
    root.querySelector('#calcForm [name=vtype][value=car]').checked=true;
    root.querySelector('#calcForm [name=auction][value="'+selected.auction+'"]').checked=true;
    root.querySelector('#calcForm [name=fuel][value=ice]').checked=true;
    $('price').value=$('qPrice').value;$('port').value=$('qPort').value==='auto'?'auto':selected.port;$('yard').value=selected.yard;$('repair').value=0;$('benefit').checked=$('qBenefit').checked;
    var c=customs();if(c.liters!=='')$('volume').value=Math.round(Number(c.liters)*1000);if(c.age!=='')$('year').value=new Date().getFullYear()-Number(c.age);
    $('clearance').value=$('qClearance').value;
    $('quickDetailedNote').textContent=c.liters!==''&&c.age!==''?'Параметры перенесены из быстрого режима. Подтвердите дату выпуска, площадку и расходы по лоту. Счёт на оплату подготовит менеджер.':'Не все параметры заданы в быстром режиме. Уже введённые перенесены; для остальных показан пример. Укажите год и двигатель вашего лота до использования суммы.';
    ['port','year','simpleFuel','simpleAuction'].forEach(function(id){delete $(id).dataset.comboInvalid});
    $('calcForm').dispatchEvent(new Event('change',{bubbles:true}));lastTransferred=revision;
  }
  function setMode(next,focus){
    if(next==='detail'&&($('qAge').value===''||$('qLiters').value===''))$('quickDetailedNote').textContent='Не все параметры заданы в быстром режиме. Уже введённые перенесены; для остальных показан пример. Укажите год и двигатель вашего лота до использования суммы.';
    if(next==='detail'&&mode!=='detail')transferToDetailed();
    mode=next;var isQuick=mode==='quick';panel.hidden=!isQuick;detailed.hidden=isQuick;$('quickDetailedNote').hidden=isQuick;
    $('quickTab').setAttribute('aria-selected',String(isQuick));$('detailedTab').setAttribute('aria-selected',String(!isQuick));$('quickTab').tabIndex=isQuick?0:-1;$('detailedTab').tabIndex=isQuick?-1:0;
    if(focus)$(isQuick?'quickTab':'detailedTab').focus();summary();
  }
  function detailedClearance(){var year=Q.finiteInput($('year').value),moto=root.querySelector('#calcForm [name=vtype]:checked').value==='moto';$('clearanceField').hidden=moto||year===null||CALC_YEAR-year<=5}
  $('quickTab').addEventListener('click',function(){setMode('quick')});$('detailedTab').addEventListener('click',function(){setMode('detail')});
  $('qToDetailed').addEventListener('click',function(){setMode('detail',true);$('quickModeSwitch').scrollIntoView({block:'start',behavior:'smooth'})});
  $('quickModeSwitch').addEventListener('keydown',function(e){if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();setMode(e.key==='Home'?'quick':e.key==='End'?'detail':mode==='quick'?'detail':'quick',true)});
  form.addEventListener('submit',function(e){e.preventDefault()});
  form.addEventListener('input',function(){revision++;update()});form.addEventListener('change',function(){revision++;update()});
  $('calcForm').addEventListener('input',detailedClearance);$('calcForm').addEventListener('change',detailedClearance);
  document.addEventListener('simplecalc:result',function(){detailedClearance();if(mode==='detail')summary()});
  $('qManager').addEventListener('click',summary);
  $('qShare').addEventListener('click',async function(){
    update();if(!result)return;
    var c=customs(),query=new URLSearchParams({view:'quick',qprice:$('qPrice').value,qsize:size(),qport:$('qPort').value,qyard:$('qYard').value,qcustoms:c.enabled?'1':'0',qliters:c.liters,qage:c.age,qclearance:$('qClearance').value,qbenefit:c.benefit?'1':'0'});
    var url=location.origin+location.pathname+'?'+query.toString()+'#calc';$('qShareStatus').hidden=false;
    try{await navigator.clipboard.writeText(url);$('qShareUrl').hidden=true;$('qShareStatus').textContent='Ссылка скопирована. При обновлении тарифов сумма может измениться.'}catch(e){$('qShareUrl').hidden=false;$('qShareUrl').value=url;$('qShareStatus').textContent='Скопируйте ссылку из поля ниже.'}
  });
  for(var age=0;age<=20;age++){var opt=document.createElement('option');opt.value=String(age);opt.textContent=age===0?'До 1 года':age+' '+(age%10===1&&age!==11?'год':age%10>=2&&age%10<=4&&(age<12||age>14)?'года':'лет');$('qAge').appendChild(opt)}
  $('qPrice').value=params.get('qprice')||'';$('qPort').value=['poti','klaipeda'].includes(params.get('qport'))?params.get('qport'):'auto';$('qYard').value=(params.get('qyard')||'').slice(0,160);
  var chosen=params.get('qsize');if(Object.prototype.hasOwnProperty.call(sizeNames,chosen))form.querySelector('[name=qSize][value="'+chosen+'"]').checked=true;
  $('qCustoms').checked=params.get('qcustoms')==='1';$('qBenefit').checked=params.get('qbenefit')!=='0';$('qLiters').value=params.get('qliters')||'';$('qAge').value=params.get('qage')||'';$('qClearance').value=params.get('qclearance')||'';
  if($('qCustoms').checked||$('qAge').value!==''||$('qPort').value!=='auto'||$('qYard').value)$('qSettings').open=true;
  detailedClearance();update();setMode(params.get('view')==='detail'?'detail':'quick');
})();
