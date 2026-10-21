/* Searchable controls and lot import. The production calculation core is reused. */
var SIMPLE_CALC_HELPERS=(function(){
  var letters={а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'i',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sh',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'};
  function norm(s){return String(s||'').toLowerCase().replace(/[а-яё]/g,function(c){return letters[c]}).replace(/[^a-z0-9]/g,'')}
  function matches(item,q){var n=norm(q);return !n||[item.label].concat(item.aliases||[]).some(function(s){return norm(s).includes(n)})}
  function lookupInput(value){
    var text=String(value||'').trim();
    if(/^[\s#\d]+$/.test(text)){var id=text.replace(/[\s#]/g,'');if(/^\d{7,12}$/.test(id))return {kind:'detail',id:id};}
    try{var url=new URL(text);if(url.protocol==='https:'&&!url.username&&!url.password&&(!url.port||url.port==='443')&&/(^|\.)(copart\.com|copart\.ca|iaai\.com)$/.test(url.hostname)&&text.length<=500)return {kind:'url',url:url.href};}catch(e){}
    return null;
  }
  function text(value){return typeof value==='object'&&value?String(value.label||value.value||value.name||''):String(value||'')}
  function fuelFor(v){var s=text(v.vehicle_specs&&v.vehicle_specs.fuel_type).toLowerCase();if(/hybrid|phev/.test(s))return 'hybrid';if(/electric|battery|\bbev\b/.test(s))return 'ev';if(/gas|petrol|diesel|flex|ethanol/.test(s))return 'ice';return null}
  function ccFor(v){if(fuelFor(v)==='ev')return 0;var e=v.vehicle_specs&&v.vehicle_specs.engine;if(!e)return null;var liters=Number(e.size_l);if(!Number.isFinite(liters)||liters<=0){var m=/\b(\d+(?:[.,]\d+)?)\s*L\b/i.exec(text(e.raw));liters=m?Number(m[1].replace(',','.')):NaN;}return Number.isFinite(liters)&&liters>0&&liters<=10?Math.round(liters*1000):null}
  function yardFor(location, keys){var raw=text(location&&location.display).replace(/^(?:copart|iaai?)\s*[-:]?\s*/i,'');var candidates=[norm(raw)];var m=/^([A-Z]{2})\s*[-–:]\s*(.+)$/i.exec(raw);if(m)candidates.push(norm(m[2]+' '+m[1]));var found=keys.filter(function(k){return candidates.includes(norm(k))});return found.length===1?found[0]:''}
  return {norm:norm,matches:matches,lookupInput:lookupInput,fuelFor:fuelFor,ccFor:ccFor,yardFor:yardFor,text:text};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=SIMPLE_CALC_HELPERS;
(function(){
  if(typeof document==='undefined')return;
  var root=document.getElementById('amz-retail-calc');if(!root||!document.getElementById('lotLookup'))return;
  var H=SIMPLE_CALC_HELPERS,$=function(id){return document.getElementById(id)},form=$('calcForm'),make=$('carMake'),model=$('carModel');
  var cache=new Map(),bootstrap=null,bootstrapAt=0,makeRows=[],modelRows=[],makeValue='',makeVersion=0,lookupVersion=0,modelsLoading=false;
  var aliases={'CHEVROLET':'шевроле шеви chevy','BMW':'бмв бэ эм вэ','MERCEDES-BENZ':'мерседес мерс mercedes','VOLKSWAGEN':'фольксваген фольц vw','TOYOTA':'тойота тоёта','HYUNDAI':'хендай хёндай хундай','KIA':'киа кия','NISSAN':'ниссан','AUDI':'ауди','FORD':'форд','HONDA':'хонда','MAZDA':'мазда','LEXUS':'лексус','JEEP':'джип','DODGE':'додж','CHRYSLER':'крайслер','BUICK':'бьюик','CADILLAC':'кадиллак','SUBARU':'субару','VOLVO':'вольво','PORSCHE':'порше','TESLA':'тесла','LAND ROVER':'ленд ровер лэнд ровер','ACURA':'акура','LINCOLN':'линкольн','RAM':'рам','GMC':'джи эм си','MINI':'мини'};
  var modelAliases={EQUINOX:['эквинокс','экви'],CAMRY:['камри'],MALIBU:['малибу'],TRAVERSE:['траверс'],TAHOE:['тахо'],TUCSON:['туксон'],SPORTAGE:['спортейдж'],EXPLORER:['эксплорер'],ESCAPE:['эскейп'],COMPASS:['компас'],COROLLA:['королла'],RAV4:['рав4','рав 4'],JETTA:['джетта'],ELANTRA:['элантра']};
  function change(el){el.dispatchEvent(new Event('change',{bubbles:true}))}
  function status(el,message){el.textContent=message;el.hidden=!message}
  async function post(args){
    var c=new AbortController(),timer=setTimeout(function(){c.abort()},25000);
    try{var r=await fetch(SIMPLE_CALC_CONFIG.ajax,{method:'POST',credentials:'same-origin',body:new URLSearchParams(args),headers:{Accept:'application/json'},signal:c.signal});var data;try{data=await r.json()}catch(e){throw new Error('Источник сейчас не отвечает. Поля можно заполнить вручную.')}if(!r.ok||!data.success)throw new Error(data.data&&data.data.message||'Не удалось получить данные. Попробуйте позже.');return data.data;}
    catch(e){if(e.name==='AbortError')throw new Error('Источник не ответил вовремя. Попробуйте ещё раз или заполните поля вручную.');throw e}finally{clearTimeout(timer)}
  }
  async function remote(args){
    if(!bootstrap||Date.now()-bootstrapAt>240000){bootstrapAt=Date.now();bootstrap=post({action:'amap_bootstrap'}).catch(function(e){bootstrap=null;throw e})}
    var b=await bootstrap;return post(Object.assign({action:'amap_tools',nonce:b.nonce},args));
  }
  function metadata(args){var key=JSON.stringify(args||{});if(!cache.has(key))cache.set(key,remote(Object.assign({kind:'picker'},args)).then(function(d){return d.payload||{}}).catch(function(e){cache.delete(key);throw e}));return cache.get(key)}
  function combo(input,config){
    var wrap=document.createElement('div');wrap.className='sc-combo';input.parentNode.insertBefore(wrap,input);wrap.appendChild(input);
    var arrow=document.createElement('button');arrow.type='button';arrow.className='sc-arrow';arrow.textContent='⌄';arrow.setAttribute('aria-label','Открыть список: '+config.label);
    var list=document.createElement('div');list.id=input.id+'Options';list.className='sc-list';list.hidden=true;list.setAttribute('role','listbox');list.setAttribute('aria-label',config.label);
    wrap.append(arrow,list);input.removeAttribute('list');input.setAttribute('role','combobox');input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-expanded','false');input.setAttribute('aria-controls',list.id);input.setAttribute('autocomplete','off');
    var active=-1,shown=[],typed=false,loading=null,epoch=0;
    function close(){epoch++;list.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant')}
    function draw(){
      var all=config.items(),found=all.filter(function(i){return H.matches(i,typed?input.value:'')});shown=found.slice(0,40);active=-1;list.replaceChildren();
      shown.forEach(function(item,i){var option=document.createElement('button');option.type='button';option.className='sc-option';option.id=list.id+'-'+i;option.setAttribute('role','option');option.setAttribute('aria-selected','false');option.tabIndex=-1;option.textContent=item.label;option.addEventListener('pointerdown',function(e){e.preventDefault()});option.addEventListener('click',function(){choose(i)});list.appendChild(option)});
      if(!found.length||found.length>40){var info=document.createElement('span');info.className='sc-message';info.textContent=!found.length?(loading||(config.pending&&config.pending())?'Загружаем список…':'Нет совпадений. Уточните название или введите данные вручную.'):'Показаны первые 40. Начните вводить, чтобы найти нужное.';list.appendChild(info)}
      list.hidden=false;input.setAttribute('aria-expanded','true');
    }
    function highlight(i){if(!shown.length)return;active=(i+shown.length)%shown.length;Array.from(list.querySelectorAll('[role=option]')).forEach(function(el,n){el.setAttribute('aria-selected',String(n===active))});input.setAttribute('aria-activedescendant',list.id+'-'+active);list.querySelectorAll('[role=option]')[active].scrollIntoView({block:'nearest'})}
    async function open(all){if(input.disabled)return;typed=!all;var ticket=++epoch;try{if(config.load){if(!loading)loading=Promise.resolve(config.load()).finally(function(){loading=null});arrow.disabled=true;await loading;}if(ticket===epoch&&(document.activeElement===input||document.activeElement===arrow))draw();}catch(e){status($('modelStatus'),e.message)}finally{arrow.disabled=false}}
    function choose(i){var item=shown[i];if(!item)return;input.value=String(item.display===undefined?item.label:item.display);close();if(config.choose)config.choose(item);change(input);input.focus();close()}
    input.addEventListener('focus',function(){open(true)});
    input.addEventListener('input',function(){typed=true;if(config.edit)config.edit(input.value);draw()});
    input.addEventListener('keydown',function(e){if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(list.hidden)open(true);else highlight(active+(e.key==='ArrowDown'?1:-1));}else if(e.key==='Enter'&&!list.hidden){e.preventDefault();e.stopPropagation();if(shown.length)choose(active<0?0:active)}else if(e.key==='Escape'){e.preventDefault();close()}else if(e.key==='Tab')close()});
    arrow.addEventListener('click',function(){if(!list.hidden){close();return}input.focus();open(true)});
    wrap.addEventListener('focusout',function(){setTimeout(function(){if(!wrap.contains(document.activeElement))close()},0)});
    document.addEventListener('pointerdown',function(e){if(!wrap.contains(e.target))close()});
    return {close:close,refresh:draw,disabled:function(value){input.disabled=value;arrow.disabled=value},sync:function(value){input.value=value;close()}};
  }
  function selectCombo(select,label,extra){
    var input=document.createElement('input');input.type='text';input.id=select.id+'Search';input.value=select.options[select.selectedIndex]&&select.options[select.selectedIndex].textContent||'';select.after(input);select.hidden=true;select.tabIndex=-1;
    var lab=root.querySelector('label[for="'+select.id+'"]');if(lab)lab.htmlFor=input.id;
    var binding=combo(input,{label:label,items:function(){return Array.from(select.options).filter(function(o){return !o.disabled}).map(function(o){return {label:o.textContent,value:o.value,aliases:extra&&extra[o.value]||[]}})},choose:function(item){select.value=item.value;delete select.dataset.comboInvalid;input.removeAttribute('aria-invalid');change(select)},edit:function(value){var exact=Array.from(select.options).find(function(o){return !o.disabled&&(H.norm(o.textContent)===H.norm(value)||H.norm(o.value)===H.norm(value))});select.value=exact?exact.value:'';select.dataset.comboInvalid=String(!exact);input.setAttribute('aria-invalid',String(!exact));change(select)}});
    return {sync:function(){if(document.activeElement!==input){binding.sync(select.options[select.selectedIndex]&&select.options[select.selectedIndex].textContent||'');select.dataset.comboInvalid=String(!select.value);input.setAttribute('aria-invalid',String(!select.value));}input.disabled=select.disabled},input:input};
  }
  async function loadMakes(){var data=await metadata();makeRows=(data.makes||[]).map(function(v){return {label:String(v),value:String(v),aliases:(aliases[String(v).toUpperCase()]||'').split(' ')}})}
  async function chooseMake(item){
    makeValue=item.value;make.value=item.label;model.value='';modelRows=[];modelsLoading=true;model.disabled=false;modelCombo.disabled(false);model.placeholder='Загрузка моделей…';var ticket=++makeVersion;
    try{var data=await metadata({make:makeValue});if(ticket!==makeVersion)return;var rows=(data.series||[]).map(function(v){return {label:v.name||v.label||v.series,value:v.series||v.name||v.label}});var known=new Set(rows.map(function(i){return H.norm(i.label)}));(data.models||[]).forEach(function(v){if(!known.has(H.norm(v))&&!rows.some(function(i){return H.norm(v).startsWith(H.norm(i.label))})){rows.push({label:v,value:v})}});modelRows=rows.filter(function(i){return i.label}).map(function(i){i.aliases=modelAliases[String(i.label).toUpperCase()]||[];return i});model.placeholder='Выберите или начните вводить';status($('modelStatus'),'');}
    catch(e){if(ticket===makeVersion){model.placeholder='Можно вписать модель вручную';status($('modelStatus'),e.message)}}
    finally{if(ticket===makeVersion){modelsLoading=false;if(document.activeElement===model&&model.getAttribute('aria-expanded')==='true')modelCombo.refresh();}}
  }
  var makeCombo=combo(make,{label:'Марка',items:function(){return makeRows},load:loadMakes,choose:function(item){chooseMake(item)},edit:function(){makeValue='';makeVersion++;modelsLoading=false;model.value='';modelRows=[];modelCombo.disabled(true);model.placeholder='Сначала выберите марку'}});
  var modelCombo=combo(model,{label:'Модель',items:function(){return modelRows},pending:function(){return modelsLoading}});modelCombo.disabled(true);
  var yearCombo=selectCombo($('year'),'Год выпуска');
  var portCombo=selectCombo($('port'),'Порт доставки',{auto:['автоматически авто маршрут'],klaipeda:['klaipeda литва клайпеду'],poti:['poti грузия поти']});
  var fuelCombo=selectCombo($('simpleFuel'),'Двигатель',{ice:['gasoline gas petrol diesel бензин дизель'],hybrid:['hybrid phev'],ev:['electric электро bev']});
  var auctionCombo=selectCombo($('simpleAuction'),'Аукцион',{copart:['копарт'],iaai:['IAA айаа иая']});
  combo($('volume'),{label:'Объём двигателя',items:function(){return [1000,1200,1300,1400,1500,1600,1800,1900,2000,2200,2400,2500,3000,3500].map(function(n){return {label:(n/1000).toLocaleString('ru-RU')+' л · '+n+' см³',display:n,value:n,aliases:[String(n),String(n/1000)]}})},choose:function(item){$('volume').value=item.value}});
  combo($('yard'),{label:'Площадка аукциона',items:function(){var a=root.querySelector('input[name=auction]:checked').value;return Object.keys(RETAIL_RATES[a]||{}).map(function(k){return {label:k,value:k}})},choose:function(item){$('yard').value=item.value}});
  $('simpleFuel').addEventListener('change',function(){var radio=root.querySelector('input[name=fuel][value="'+this.value+'"]');if(radio){window.SIMPLE_LOT_ERROR='';radio.checked=true;change(radio)}});
  $('simpleAuction').addEventListener('change',function(){var radio=root.querySelector('input[name=auction][value="'+this.value+'"]');if(radio){radio.checked=true;change(radio)}});
  form.addEventListener('submit',function(e){e.preventDefault()});
  function money(n){return Math.round(n).toLocaleString('ru-RU')+' $'}
  function summaries(){
    var a=root.querySelector('input[name=auction]:checked').value,f=root.querySelector('input[name=fuel]:checked').value;
    $('deliverySummary').textContent=(a==='copart'?'Copart':'IAAI')+' · '+($('yard').value||'площадка не выбрана');
    $('costSummary').textContent='Ремонт '+money(Number($('repair').value)||0)+' · услуга '+$('service').value+' BYN'+($('benefit').checked?' · льгота 50%':' · без льготы');
    if($('simpleFuel').dataset.comboInvalid!=='true')$('simpleFuel').value=f;fuelCombo.sync();if($('simpleAuction').dataset.comboInvalid!=='true')$('simpleAuction').value=a;auctionCombo.sync();yearCombo.sync();
    var moto=root.querySelector('input[name=vtype]:checked').value==='moto';modelCombo.disabled(moto||!make.value);makeCombo.disabled(moto);$('simpleFuel').querySelector('[value=hybrid]').disabled=moto;
    var cc=Number($('volume').value),routeReady=(f==='ev'||cc>0)&&!window.SIMPLE_LOT_ERROR;
    var suggested=routeReady?autoPortFor(moto,f!=='ice',f==='ev'?0:cc):null;
    $('port').querySelector('[value=auto]').textContent=suggested?'Авто · '+PORTS[suggested].name:'Авто · укажите двигатель';portCombo.sync();
    if(!$('calcInputError').hidden&&suggested){var selected=$('port').value==='auto'?suggested:$('port').value;if(PORTS[selected])$('route').textContent='Предложенный маршрут: через '+PORTS[selected].name+'. Для суммы укажите цену, год и площадку автомобиля. Маршрут можно изменить.';}
    var r=window.SIMPLE_LAST_RESULT;if(!r)return;
    $('simpleAuctionTotal').textContent=money(r.price+r.fee);$('simpleDeliveryTotal').textContent=money(r.inland+r.sea+r.last+r.extra);$('simpleCustomsTotal').textContent=money(r.duty+r.cust);$('simpleServiceTotal').textContent=money(r.ours);$('simpleRepairTotal').textContent=money(r.repair);
  }
  form.addEventListener('input',function(e){if(e.target.id!=='lotLookup')$('exampleStatus').textContent='Расчёт предварительный. Все подставленные значения можно изменить.';summaries()});
  form.addEventListener('change',summaries);document.addEventListener('simplecalc:result',summaries);
  $('lotLookup').addEventListener('input',function(){lookupVersion++;$('lotCard').hidden=true;window.SIMPLE_LOT_ERROR=this.value.trim()?'Нажмите «Найти лот» или очистите номер для ручного расчёта.':'';status($('lotStatus'),this.value.trim()?'Нажмите «Найти лот», чтобы загрузить именно этот автомобиль.':'Можно заполнить поля вручную.');});
  $('lotLookup').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();findLot()}});
  async function findLot(){
    var args=H.lookupInput($('lotLookup').value);if(!args){status($('lotStatus'),'Введите номер из 7–12 цифр или HTTPS-ссылку Copart / IAAI.');return}
    var ticket=++lookupVersion;$('findLot').disabled=true;status($('lotStatus'),'Ищем автомобиль…');
    try{
      var response=await remote(args);if(ticket!==lookupVersion)return;var v=response.payload||{};
      if(!['copart','iaai'].includes(v.platform)||!v.title||!v.lot_number)throw new Error('Лот не найден у источника. Попробуйте ссылку с аукциона или заполните поля вручную.');
      if(args.kind==='detail'&&String(v.lot_number)!==args.id)throw new Error('Источник вернул другой номер. Вставьте точную ссылку на нужный лот.');
      var year=Number(v.year),cc=H.ccFor(v),fuel=H.fuelFor(v),yard=H.yardFor(v.location,Object.keys(RETAIL_RATES[v.platform]||{})),missing=[];
      var moto=root.querySelector('input[name=vtype][value=car]');moto.checked=true;change(moto);
      var auction=root.querySelector('input[name=auction][value="'+v.platform+'"]');auction.checked=true;change(auction);
      $('yard').value=yard;if(!yard)missing.push('площадку — она не сопоставлена с тарифной таблицей');
      $('year').value=year>=CALC_YEAR-20&&year<=CALC_YEAR?String(year):'';if(!$('year').value)missing.push('год');
      $('volume').value=cc===null?'':String(cc);if(cc===null)missing.push('объём двигателя');
      window.SIMPLE_LOT_ERROR='';if(fuel){root.querySelector('input[name=fuel][value="'+fuel+'"]').checked=true;$('simpleFuel').value=fuel;delete $('simpleFuel').dataset.comboInvalid;}else{window.SIMPLE_LOT_ERROR='Источник не указал тип двигателя. Выберите его вручную.';missing.push('тип двигателя')}
      $('simpleAuction').value=v.platform;delete $('simpleAuction').dataset.comboInvalid;delete $('year').dataset.comboInvalid;delete $('port').dataset.comboInvalid;
      $('port').value='auto';make.value=H.text(v.make);makeValue=make.value;model.value=H.text(v.series&&v.series.name||v.model);modelCombo.disabled(false);model.placeholder='Модель из найденного лота';modelRows=[];makeVersion++;
      if(root.querySelector('input[name=mode]:checked').value==='price')$('price').value='';
      $('lotTitle').textContent=v.title;$('lotFacts').textContent=(v.platform==='copart'?'Copart':'IAAI')+' · лот '+v.lot_number+' · '+H.text(v.location&&v.location.display);
      $('lotSource').href=v.platform==='copart'?'https://www.copart.com/lot/'+encodeURIComponent(v.lot_number):'https://www.iaai.com/Search?searchkeyword='+encodeURIComponent(v.lot_number);
      $('lotCard').hidden=false;$('deliverySettings').open=!yard;
      status($('lotStatus'),'Данные найдены. '+(missing.length?'Уточните '+missing.join(', ')+'. ':'')+'Укажите вашу планируемую цену или бюджет. Порт предложен калькулятором; его можно изменить.');
      $('exampleStatus').textContent='Автомобиль найден у источника. Текущая ставка не является окончательной ценой покупки.';change($('year'));summaries();
    }catch(e){if(ticket===lookupVersion)status($('lotStatus'),e.message)}finally{$('findLot').disabled=false}
  }
  $('findLot').addEventListener('click',findLot);
  var params=new URLSearchParams(location.search);make.value=(params.get('make')||'').slice(0,80);model.value=(params.get('model')||'').slice(0,120);$('lotLookup').value=(params.get('lot')||'').slice(0,500);if(make.value){makeValue=make.value;modelCombo.disabled(false);model.placeholder='Выберите или впишите модель';}
  summaries();
})();
