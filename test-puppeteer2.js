const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set up console log capturing
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:3000/login');
  await page.type('input[type=text]', '24isr001');
  await page.type('input[type=password]', '12345');
  await page.click('button[type=submit]');
  await page.waitForNavigation();
  
  await page.waitForSelector('input[type=password]');
  console.log('Modal found');
  
  await page.type('input[placeholder="Enter new password"]', 'newpass123');
  await page.type('input[placeholder="Confirm new password"]', 'newpass123');
  
  // Click update
  await page.click('button[type=submit]');
  console.log('Submitted form, waiting for navigation or reload...');
  
  try {
    await page.waitForNavigation({ timeout: 5000 });
    console.log('Navigated! Current URL:', page.url());
  } catch(e) {
    console.log('No navigation in 5s. Current URL:', page.url());
  }
  
  // Wait to see if modal is still there
  await new Promise(r => setTimeout(r, 2000));
  const isModalStillThere = await page.$('input[placeholder="Enter new password"]');
  console.log('Is modal still there?', !!isModalStillThere);
  
  await browser.close();
})();
