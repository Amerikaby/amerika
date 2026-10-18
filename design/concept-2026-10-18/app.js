const models = {
  equinox: {name:'Chevrolet Equinox', total:17700, base:16200},
  terrain: {name:'GMC Terrain', total:18200, base:16700},
  jetta: {name:'Volkswagen Jetta', total:17200, base:15700}
};
const format = value => new Intl.NumberFormat('ru-RU').format(value);
const modelSelect = document.querySelector('#model');
const dialog = document.querySelector('#price-dialog');
let previousFocus;
function showPrice(key){
  const model=models[key]; if(!model || !dialog) return;
  previousFocus=document.activeElement;
  document.querySelector('#dialog-title').textContent=model.name;
  document.querySelector('#dialog-base').textContent=format(model.base)+' $';
  document.querySelector('#dialog-total').textContent=format(model.total)+' $';
  document.querySelector('#dialog-cta').dataset.interest='Нужен расчёт '+model.name;
  dialog.showModal();
}
document.querySelectorAll('[data-model]').forEach(button=>button.addEventListener('click',()=>showPrice(button.dataset.model)));
document.querySelector('[data-open-estimate]')?.addEventListener('click',()=>showPrice(modelSelect.value));
document.querySelector('.close-dialog')?.addEventListener('click',()=>dialog.close());
dialog?.addEventListener('close',()=>previousFocus?.focus());
dialog?.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
modelSelect?.addEventListener('change',()=>{
  const model=models[modelSelect.value];
  document.querySelector('#estimate-total').innerHTML='≈ '+format(model.total)+' <small>$</small>';
  document.querySelector('#estimate-cta').dataset.interest='Нужен расчёт '+model.name;
});
const tabs=[...document.querySelectorAll('[role="tab"]')];
function chooseTab(tab){tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!active;});}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>chooseTab(tab));tab.addEventListener('keydown',event=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;chooseTab(tabs[next]);tabs[next].focus();}});});
document.querySelectorAll('[data-interest]').forEach(link=>link.addEventListener('click',()=>{
  const field=document.querySelector('#interest');if(field)field.value=link.dataset.interest;
  if(dialog?.open)dialog.close();
}));
document.querySelector('#budget-cta')?.addEventListener('click',()=>{
  const budget=document.querySelector('#budget');
  if(!budget.checkValidity()){budget.reportValidity();return;}
  document.querySelector('#interest').value=document.querySelector('#body-type').value+', бюджет до '+format(Number(budget.value))+' $ на готовую машину';
});
const navButton=document.querySelector('.menu-button');
navButton?.addEventListener('click',()=>{const open=navButton.getAttribute('aria-expanded')==='true';navButton.setAttribute('aria-expanded',String(!open));document.querySelector('#mobile-nav').hidden=open;navButton.textContent=open?'☰':'×';navButton.setAttribute('aria-label',open?'Открыть меню':'Закрыть меню');});
document.querySelectorAll('#mobile-nav a').forEach(link=>link.addEventListener('click',()=>{navButton.setAttribute('aria-expanded','false');document.querySelector('#mobile-nav').hidden=true;navButton.textContent='☰';navButton.setAttribute('aria-label','Открыть меню');}));
document.querySelector('.lead-form')?.addEventListener('submit',event=>{event.preventDefault();const status=document.querySelector('.form-result');status.hidden=false;status.textContent='Так будет выглядеть подтверждение заявки. В этом эскизе ничего не отправлено.';});
const query=new URLSearchParams(location.search);if(query.has('tariff')&&document.querySelector('#interest'))document.querySelector('#interest').value='Интересует тариф «'+query.get('tariff')+'»';
