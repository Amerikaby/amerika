// Run against local preview; all form requests are intercepted, no emails are sent.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.QA_BASE || 'http://127.0.0.1:8876/newcodex/';
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/api/lead.php', route => route.fulfill({ status: 503, json: { ok: false, message: 'Mock transport' } }));
    await page.goto(base + 'kalkulyator/');
    const normal = await page.locator('#r-total').innerText();
    for (const bad of ['', '0', '-1']) {
      await page.locator('#volume').fill(bad);
      assert(await page.locator('#calcInputError').isVisible());
      assert(!(await page.locator('#r-total').isVisible()));
      assert.equal(await page.locator('#volume').getAttribute('aria-invalid'), 'true');
    }
    await page.locator('#volume').fill('2000');
    assert.equal(await page.locator('#r-total').innerText(), normal);
    for (const field of ['price', 'repair']) {
      await page.locator('#' + field).fill('');
      assert(!(await page.locator('#r-total').isVisible()));
      await page.locator('#' + field).fill(field === 'price' ? '12000' : '1500');
    }
    await page.locator('input[name=fuel][value=ev]').locator('..').click();
    assert(await page.locator('#volume').isDisabled());
    assert(await page.locator('#r-total').isVisible());
    await page.goto(base + 'tamozhennyj-kalkulator/');
    await page.locator('#ccVolume').fill('');
    assert(await page.locator('#ccInputError').isVisible());
    assert(!(await page.locator('#cr-total').isVisible()));
    await page.locator('input[name=cfuel][value=ev]').locator('..').click();
    assert(await page.locator('#cr-total').isVisible());
    await page.goto(base);
    await page.locator('#qModel').fill('Toyota Prius');
    assert(await page.locator('input[name=qFuel][value=hybrid]').isChecked());
    assert(await page.locator('#qFuelRow').isVisible());
    const quick = await page.locator('#qTotal').innerText();
    await page.locator('#qMore').click();
    await page.waitForURL('**/kalkulyator/**');
    await page.waitForLoadState('load');
    assert(await page.locator('input[name=fuel][value=hybrid]').isChecked());
    assert.equal(await page.locator('#r-total').innerText(), quick);
    assert((await page.locator('#route').innerText()).includes('Поти'));
    await page.goto(base);
    await page.locator('#qCc').fill('');
    assert(await page.locator('#qInputError').isVisible());
    assert(!(await page.locator('#qSend').isVisible()));
    await page.locator('#qRepair').fill('');
    await page.locator('#qTabBudget').click();
    assert(await page.locator('#qBudgetError').isVisible());
    assert(!(await page.locator('#qSendB').isVisible()));
    await page.locator('#qTabModel').click();
    await page.locator('#qRepair').fill('1500');
    await page.locator('#qTabBudget').click();
    await page.locator('#qBudget').fill('-100');
    assert(!(await page.locator('#qSendB').isVisible()));
    await page.locator('#qBudget').fill('20000');
    assert(await page.locator('#qSendB').isVisible());
    await page.locator('#burger').click();
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press(i % 3 ? 'Tab' : 'Shift+Tab');
      assert(await page.evaluate(() => document.activeElement.id === 'burger' || !!document.activeElement.closest('#mnav')));
    }
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'burger');
    assert(!(await page.locator('main').evaluate(e => e.inert)));
    await page.goto(base + 'ceny/');
    let release, received;
    const waiting = new Promise(resolve => release = resolve);
    await page.unroute('**/api/lead.php');
    await page.route('**/api/lead.php', async route => {
      if (route.request().method() === 'GET') return route.fulfill({ json: { ok: true, token: 'mock' } });
      received = route.request().postDataJSON();
      await waiting;
      return route.fulfill({ status: 503, json: { ok: false, message: 'Mock failure' } });
    });
    await page.locator('#lphone').fill('+375290000000');
    await page.locator('#lcar').fill('Keep this request');
    await page.locator('#lagree').check();
    await page.locator('#leadForm [type=submit]').click();
    await page.waitForFunction(() => document.querySelector('#leadForm').getAttribute('aria-busy') === 'true');
    assert(await page.locator('#lcar').isDisabled());
    assert(await page.locator('#lphone').isDisabled());
    while (!received) await page.waitForTimeout(20);
    release();
    await page.waitForFunction(() => !document.querySelector('#leadForm').hasAttribute('aria-busy'));
    assert(!(await page.locator('#lcar').isDisabled()));
    assert.equal(await page.locator('#lcar').inputValue(), 'Keep this request');
    assert(!(await page.evaluate(() => dataLayer.some(x => x.event === 'lead_submit'))));
    assert.deepEqual(errors, []);
    console.log('PASS: invalid inputs, explicit EV/hybrid, Prius quick/full parity, focus containment, pending form lock, failed submission preservation; actual emails: 0');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
