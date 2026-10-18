// Browsing only: no lead submissions, notifications or analytics requests.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.QA_BASE||'http://127.0.0.1:8876/newcodex/';
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const errors=[];
  for(const width of [1440,390,360]){
   const page=await browser.newPage({viewport:{width,height:900}});
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'auto-usa/');
   await page.locator('#catQ').fill('Equinox');
   await page.waitForFunction(()=>document.querySelector('#catCount').textContent.startsWith('Найдено:'));
   assert(new URL(page.url()).searchParams.get('q')==='Equinox');
   const count=await page.locator('#catCount').textContent();
   await page.reload();await page.waitForFunction(()=>document.querySelector('#catCount').textContent.startsWith('Найдено:'));
   assert.equal(await page.locator('#catCount').textContent(),count);
   await page.locator('#catBrand').selectOption('chevrolet');
   assert.equal(new URL(page.url()).searchParams.get('brand'),'chevrolet');
   const first=await page.locator('#carGrid a').first().getAttribute('href');
   await page.locator('#carGrid a').first().click();
   await page.waitForLoadState('load');
   await page.locator('.photo-zoom').click();
   assert(await page.locator('dialog').isVisible());
   const before=await page.locator('.photo-counter').textContent();
   await page.keyboard.press('ArrowRight');
   assert.notEqual(await page.locator('.photo-counter').textContent(),before);
   assert.equal(await page.locator('dialog img').getAttribute('src'),await page.locator('#gallery .main img').getAttribute('src'));
   for(let k=0;k<8;k++){await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.activeElement===document.body||!!document.activeElement.closest('dialog')));}
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(process.env.QA_SCREENSHOTS){await page.evaluate(()=>document.querySelector('dialog img').decode().catch(()=>{}));await page.screenshot({path:process.env.QA_SCREENSHOTS+'/gallery-'+width+'.png'});}
   await page.keyboard.press('Escape');assert(!(await page.locator('dialog').isVisible()));
   assert(await page.locator('.photo-zoom').evaluate(e=>e===document.activeElement));
   await page.goBack();await page.waitForLoadState('load');
   await page.waitForFunction(()=>document.querySelector('#catCount').textContent.startsWith('Найдено:'));
   assert.equal(await page.locator('#catQ').inputValue(),'Equinox');
   assert.equal(await page.locator('#catBrand').inputValue(),'chevrolet');
   await page.locator('#catQ').fill('zzzz-no-such-car');
   await page.waitForFunction(()=>document.querySelector('#catCount').textContent==='Найдено: 0');
   assert(await page.locator('#carGrid a[href="#lead"]').isVisible());
   await page.locator('#catReset').click();assert(!(await page.locator('#catReset').isVisible()));
   assert.equal(new URL(page.url()).searchParams.has('q'),false);
   assert(await page.locator('#carGrid .car').count()>0);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));

   // Force the clipboard fallback so it is available on both HTTP and HTTPS.
   await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(Error('blocked for test'))}}));
   const query=new URLSearchParams({mode:'budget',price:'35000',year:'2022',cc:'1800',fuel:'hybrid',repair:'2700',service:'990',benefit:'1',auction:'iaai',yard:'Los Angeles, CA',port:'poti',sublot:'1'});
   await page.goto(base+'kalkulyator/?'+query+'#calc');
   const total=await page.locator('#r-total').textContent();
   await page.locator('#shareCalc').click();
   assert(await page.locator('#shareCalcFallback').isVisible());
   const shared=await page.locator('#shareCalcUrl').inputValue();
   const other=await browser.newPage({viewport:{width,height:900}});
   await other.goto(shared);await other.waitForLoadState('load');
   assert.equal(await other.locator('#r-total').textContent(),total);
   for(const field of ['price','year','repair','service','yard','port'])assert.equal(await other.locator('#'+field).inputValue(),query.get(field));
   for(const field of ['mode','fuel','auction'])assert(await other.locator('input[name='+field+'][value='+query.get(field)+']').isChecked());
   for(const field of ['benefit','sublot'])assert(await other.locator('#'+field).isChecked());
   assert(await other.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(process.env.QA_SCREENSHOTS)await page.screenshot({path:process.env.QA_SCREENSHOTS+'/calculator-'+width+'.png',fullPage:true});
   await other.close();await page.close();console.log('PASS width '+width+': search persistence, empty/reset, gallery keyboard, calculation roundtrip');
  }
  const page=await browser.newPage();let fail=true;
  await page.route('**/assets/cars.json',r=>fail?r.fulfill({status:503,body:'unavailable'}):r.continue());
  await page.goto(base+'auto-usa/?q=Equinox');
  await page.locator('#catRetry').waitFor({state:'visible'});
  fail=false;await page.locator('#catRetry').click();
  await page.waitForFunction(()=>document.querySelector('#catCount').textContent.startsWith('Найдено:'));
  assert(!(await page.locator('#catRetry').isVisible()));
  await page.goto(base+'kalkulyator/');
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.testCopied=text}}}));
  await page.locator('#shareCalc').click();
  assert((await page.evaluate(()=>window.testCopied)).includes('/kalkulyator/?'));
  assert(!(await page.locator('#shareCalcFallback').isVisible()));
  assert((await page.locator('#shareCalcStatus').textContent()).includes('Ссылка скопирована'));
  assert.equal(errors.length,0,JSON.stringify(errors));
  console.log('PASS: network error/retry; no JavaScript errors');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
