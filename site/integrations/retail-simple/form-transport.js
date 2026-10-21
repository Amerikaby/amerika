/* Use CF7's native controller: this host rejects multipart REST POSTs with nginx 403.
 * Same public form, validation, honeypot and outbox; no alternate lead endpoint.
 * Parse the returned form only. Never execute scripts from the returned HTML.
 */
(function(){
  'use strict';
  var form=document.querySelector('#amz-retail-calc .wpcf7 form');
  if(!form||!form.querySelector('[name="_wpcf7"][value="17910"]'))return;
  var pending=false;
  function setStatus(status){
    ['init','submitting','invalid','unaccepted','spam','aborted','sent','failed'].forEach(function(s){form.classList.remove(s)});
    form.classList.add(status);form.dataset.status=status;
    if(form.wpcf7)form.wpcf7.status=status;
  }
  form.addEventListener('submit',async function(event){
    if(event.defaultPrevented)return; // Calculation validation runs first, in capture phase.
    event.preventDefault();event.stopImmediatePropagation();if(pending)return;
    var button=form.querySelector('[type="submit"]'),output=form.querySelector('.wpcf7-response-output');
    var data=new FormData(form),body=new URLSearchParams();
    for(var pair of data){if(typeof pair[1]!=='string'){output.textContent='Файлы в этой форме не поддерживаются.';return}body.append(pair[0],pair[1])}
    var url=new URL(form.action,location.href);if(url.origin!==location.origin||url.pathname!=='/kalkulyator/')return;
    pending=true;button.disabled=true;setStatus('submitting');output.textContent='Отправляем расчёт…';
    form.querySelectorAll('.wpcf7-not-valid-tip').forEach(function(e){e.remove()});
    form.querySelectorAll('[aria-invalid="true"]').forEach(function(e){e.setAttribute('aria-invalid','false')});
    try{
      var response=await fetch(url.href,{method:'POST',credentials:'same-origin',body:body,headers:{Accept:'text/html'}});
      if(!response.ok)throw new Error('HTTP '+response.status);
      var html=new DOMParser().parseFromString(await response.text(),'text/html');
      var returned=html.querySelector('#amz-retail-calc .wpcf7 form');
      if(!returned||!returned.querySelector('[name="_wpcf7"][value="17910"]'))throw new Error('Unexpected form response');
      var status=returned.dataset.status;
      if(!['invalid','unaccepted','spam','aborted','sent','failed'].includes(status))throw new Error('Unconfirmed submission');
      setStatus(status);output.textContent=returned.querySelector('.wpcf7-response-output').textContent;
      returned.querySelectorAll('.wpcf7-not-valid-tip').forEach(function(tip){
        var source=tip.closest('[data-name]');if(!source)return;
        var target=Array.from(form.querySelectorAll('[data-name]')).find(function(e){return e.dataset.name===source.dataset.name});
        if(target){var label=document.createElement('span');label.className='wpcf7-not-valid-tip';label.textContent=tip.textContent;target.appendChild(label);var input=target.querySelector('input,select,textarea');if(input)input.setAttribute('aria-invalid','true')}
      });
      var apiStatus=status==='sent'?'mail_sent':status==='invalid'?'validation_failed':status;
      var detail={contactFormId:17910,unitTag:form.querySelector('[name="_wpcf7_unit_tag"]').value,status:apiStatus,apiResponse:{status:apiStatus,message:output.textContent}};
      if(status==='sent'){
        form.querySelectorAll('[name="your-name"],[name="mask-644"]').forEach(function(e){e.value=''});
        form.dispatchEvent(new CustomEvent('wpcf7mailsent',{bubbles:true,detail:detail}));
      }
      form.dispatchEvent(new CustomEvent('wpcf7submit',{bubbles:true,detail:detail}));
    }catch(error){
      // Keep the same request ID: an uncertain delivery must not create another receipt on retry.
      setStatus('failed');output.textContent='Не удалось подтвердить отправку. Попробуйте ещё раз или позвоните нам.';
    }finally{pending=false;button.disabled=!!form.querySelector('.wpcf7-acceptance input:not(:checked)')}
  },true);
})();
