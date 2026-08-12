const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/login');
  await page.type('input[type=text]', '24isr001');
  await page.type('input[type=password]', '12345');
  await page.click('button[type=submit]');
  await page.waitForNavigation();
  
  await page.waitForSelector('input[type=password]');
  
  await page.type('input[placeholder="Enter new password"]', 'newpass123');
  const val = await page.$eval('input[placeholder="Enter new password"]', el => el.value);
  console.log('Typed value:', val);
  
  await browser.close();
})();
