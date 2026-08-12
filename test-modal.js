const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Navigating to login...');
  await page.goto('http://localhost:3000/login');
  
  console.log('Typing credentials...');
  // Using Dharshini P (24ISR007)
  await page.type('input[type="text"]', '24ISR007'); 
  await page.type('input[type="password"]', '12345');
  await page.click('button[type="submit"]');
  
  console.log('Waiting for modal inputs...');
  await page.waitForSelector('input[placeholder="Enter new password"]', { timeout: 10000 });
  
  console.log('Trying to type in modal...');
  await page.type('input[placeholder="Enter new password"]', 'newpass123');
  const val1 = await page.$eval('input[placeholder="Enter new password"]', el => el.value);
  console.log('Value of new password input:', val1);
  
  await browser.close();
})();
