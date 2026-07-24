const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Intercept requests to see how Tally submits
  page.on('request', request => {
    if (request.method() === 'POST') {
      console.log('POST URL:', request.url());
      console.log('POST Data:', request.postData());
    }
  });

  await page.goto('https://tally.so/r/7R5DOa', { waitUntil: 'networkidle0' });
  
  // Fill the form. We need to find the inputs.
  const html = await page.content();
  console.log("HTML length:", html.length);
  // Let's just dump the HTML to a file to inspect it
  require('fs').writeFileSync('tally-form.html', html);
  
  await browser.close();
})();
