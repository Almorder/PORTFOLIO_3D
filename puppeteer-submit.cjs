const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('request', request => {
    if (request.method() === 'POST' && !request.url().includes('sentry')) {
      console.log('POST URL:', request.url());
      console.log('POST Data:', request.postData());
    }
  });

  await page.goto('https://tally.so/r/7R5DOa', { waitUntil: 'networkidle0' });
  
  // Find all buttons and inputs
  await page.evaluate(() => {
    // Fill text inputs
    document.querySelectorAll('input[type="text"]').forEach(el => el.value = 'test');
    document.querySelectorAll('input[type="email"]').forEach(el => el.value = 'test@test.com');
    // Click submit button
    const btn = document.querySelector('button[type="submit"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Submit') || b.textContent.includes('Envoyer'));
    if(btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
