// Customer flows only; no forms are submitted.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const data=require('../data/availability.json');
const base=process.env.QA_BASE||'http://127.0.0.1:8876/newcodex/';
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const errors=[];
  const page=await browser.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/lead.php',r=>r.abort());
  for(const width of [1440,1100,1024,768,409,390,360,320]){
   await page.setViewportSize({width,height:900});
   for(const route of ['', 'situation/in-stock/','situation/in-transit/','auto-canada/chevrolet-equinox-lt-2023/']){
    await page.goto(base+route,{waitUntil:'domcontentloaded'});
    const sizes=await page.evaluate(()=>({view:document.documentElement.clientWidth,doc:document.documentElement.scrollWidth}));
    assert(sizes.doc<=sizes.view,`${route} overflow at ${width}: ${JSON.stringify(sizes)}`);
   }
  }
  for(const status of ['in-stock','in-transit']){
   await page.goto(base+'situation/'+status+'/');
   const expected=data.items.filter(c=>c.status===status);
   assert.equal(await page.locator('.inventory-card').count(),expected.length);
   for(const c of expected){
    const route=new URL(c.source).pathname.slice(1);
    const card=page.locator('.inventory-card').filter({has:page.locator('a[href="'+new URL(base).pathname+route+'"]')});
    assert.equal(await card.count(),1);
    assert.equal(await card.locator('img').getAttribute('src'),c.image);
   }
   await page.locator('.inventory-card h3 a').first().click();
   await page.waitForLoadState('domcontentloaded');
   assert((await page.locator('#lcar').inputValue()).includes(String(expected[0].id)));
   assert(!(await page.locator('.estimate').count()));
   await page.locator('.photo-zoom').click();
   assert(await page.locator('dialog').isVisible());
   await page.keyboard.press('ArrowRight');
   assert((await page.locator('.photo-counter').textContent()).startsWith('2'));
   await page.keyboard.press('Escape');
  }
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:1000});await page.goto(base);
   assert.equal(await page.locator('#qSettings').evaluate(e=>e.open),false);
   assert(await page.locator('#qYear').isVisible());
   assert(!(await page.locator('#qLot').isVisible()));
   assert((await page.locator('#qAssumptions').textContent()).includes('резерв ремонта'));
   assert.equal(await page.locator('#available .inventory-card').count(),6);
   await page.locator('#qSettings summary').click();
   const before=await page.locator('#qTotal').textContent();
   await page.locator('#qRepair').fill('4000');await page.locator('#qRepair').blur();
   assert.notEqual(await page.locator('#qTotal').textContent(),before);
   await page.locator('#qSettings summary').click();
   assert((await page.locator('#qAssumptions').textContent()).replace(/\s/g,'').includes('4000'));
   await page.locator('#qTabBudget').click();
   assert(await page.locator('#qBudget').isVisible());
   await page.locator('#qTabModel').click();
   if(process.env.QA_SCREENSHOTS){
    await page.locator('.hero img').evaluate(e=>e.decode());
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,'real-hero-'+width+'.png')});
    await page.locator('#available').evaluate(e=>window.scrollTo({top:e.offsetTop-90,behavior:'instant'}));
    await page.locator('#available img').evaluateAll(imgs=>Promise.all(imgs.map(i=>{i.loading='eager';return i.decode()})));
    await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,'real-inventory-'+width+'.png')});
    await page.locator('#quick-sec').evaluate(e=>window.scrollTo({top:e.offsetTop-90,behavior:'instant'}));
    await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,'real-quick-'+width+'.png')});
   }
  }
  assert.deepEqual(errors,[]);
  console.log('PASS inventory: 13 + 6 records, source photos, unique links, contextual leads, gallery, progressive calculator, 32 responsive checks; no emails');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
