const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('https://nolanarc.com/projet/le-bol-den-face/', { waitUntil: 'networkidle0' });
  
  // Scroll down to trigger intersection observer
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  
  // Wait a bit for animations
  await new Promise(r => setTimeout(r, 2000));
  
  // Check if .reveal elements have .on class
  const revealClasses = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.reveal')).map(el => el.className);
  });
  
  console.log("Classes on .reveal elements:");
  revealClasses.forEach(c => console.log(c));
  
  // Also check bento grid on home page
  await page.goto('https://nolanarc.com/', { waitUntil: 'networkidle0' });
  const wideItem = await page.evaluate(() => {
    const el = document.querySelector('.work-item.wide');
    if (!el) return null;
    const style = window.getComputedStyle(el);
    return {
      aspectRatio: style.aspectRatio,
      gridColumn: style.gridColumn
    };
  });
  
  console.log("\nHome page .work-item.wide styles:");
  console.log(wideItem);
  
  await browser.close();
})();
