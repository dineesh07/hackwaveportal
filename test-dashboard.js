const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Navigating to login...');
  await page.goto('http://localhost:3000/login');
  
  console.log('Typing credentials...');
  await page.type('input[type="text"]', '24isr008'); // James, who might have already changed password
  await page.type('input[type="password"]', '12345');
  await page.click('button[type="submit"]');
  
  console.log('Waiting for network idle...');
  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(e => console.log('Navigation timeout, continuing...'));
  
  console.log('Current URL:', page.url());
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'test-screenshot.png' });
  console.log('Screenshot saved to test-screenshot.png');
  
  await browser.close();
})();
