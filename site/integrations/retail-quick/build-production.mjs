import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
let body=fs.readFileSync(path.join(here,'body.php'),'utf8');
const previous=fs.readFileSync(path.join(here,'../retail-simple/production-body.php'),'utf8');
const lead=previous.match(/<section class="lead-sec" id="lead">[\s\S]*?<\/main>/)?.[0];
if(!lead)throw new Error('Existing lead section missing');
body=body.replace(/<section class="lead-sec" id="lead">[\s\S]*?<\/main>/,lead);
body=body.replace('Калькулятор · тест двух режимов','Калькулятор');
body=body.replace('Нажмите «Получить точный расчёт» под итоговой суммой, чтобы перенести сюда параметры.','Параметры активного режима появятся здесь автоматически.');
fs.writeFileSync(path.join(here,'production-body.php'),body);
let core=fs.readFileSync(path.join(here,'retail-core.js'),'utf8');
core=core.replace('/newcodex/kalkulyator-quick/?','/kalkulyator/?');
core=core.replace('  var send = $("sendCalc");','  window.AMZ_DETAIL_CALC=calc;\n  var send = $("sendCalc");');
core=core.replace('    $("priceLabel").textContent = budget ?',`    if(budget && cost(0,o).total>input){
      $("calcInputError").hidden=false;$("calcInputError").textContent="Бюджета недостаточно для доставки, оформления и нашей услуги. Увеличьте бюджет или свяжитесь с менеджером.";
      document.querySelector("#calcForm + .bill .bill-in").hidden=true;$("sendCalc").setAttribute("aria-disabled","true");refreshRetailLead();return null;
    }
    $("priceLabel").textContent = budget ?`);
core=core.replace('  if(!form)return;\n  var paramsField=',`  if(!form)return;
  if(window.AMZ_ACTIVE_CALC&&window.AMZ_ACTIVE_CALC.isQuick()){window.AMZ_ACTIVE_CALC.writeQuickLead();return;}
  if(!$("calcInputError").hidden||root.querySelector(".bill-in").hidden){
    var badParams=form.querySelector('[name="calc-params"]'),badResult=form.querySelector('[name="calc-result"]');
    if(badParams)badParams.value="";if(badResult)badResult.value="";
    if($("lcar"))$("lcar").value="Подробный расчёт не завершён: "+$("calcInputError").textContent;return;
  }
  var paramsField=`);
core=core.replace('var fields=["Автомобиль: "','var fields=["Тип расчёта: Подробный","Клиренс, мм: "+($("clearance").value||"не указан"),"Автомобиль: "');
core=core.replace('var fields=["Тип расчёта: Подробный",','var fields=["Тип расчёта: Подробный","Размер авто: "+(checked("vtype")==="Мотоцикл"?"не применяется":$("vehicleSize").selectedOptions[0].textContent),"Условия маршрута и размера: "+$("route").textContent,');
core=core.replace('  if(paramsField)paramsField.value=fields.join("\\n");','  if(checked("mode")==="Знаю свой бюджет")fields.push("Максимальная ставка: "+$("r-max").textContent);\n  if(paramsField)paramsField.value=fields.join("\\n");');
core=core.replace('if(lead)lead.addEventListener("submit",function(e){',`window.AMZ_DETAIL_LEAD_REFRESH=refreshRetailLead;
if(lead)lead.addEventListener("submit",function(e){
  if(window.AMZ_ACTIVE_CALC){
    if(!window.AMZ_ACTIVE_CALC.prepareLead()){e.preventDefault();e.stopImmediatePropagation();return;}
    if(window.AMZ_ACTIVE_CALC.isQuick())return;
  }`);
if(!core.includes('window.AMZ_DETAIL_CALC=calc;')||!core.includes('window.AMZ_ACTIVE_CALC.prepareLead()'))throw new Error('Lead bridge patch did not apply');
fs.writeFileSync(path.join(here,'production-core.js'),core);
fs.copyFileSync(path.join(here,'../retail-simple/form-transport.js'),path.join(here,'form-transport.js'));
console.log('Production dual calculator generated with existing CF7 form and transport.');
