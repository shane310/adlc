const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const CHROME_BIN = process.env.CHROME_BIN || '/usr/bin/google-chrome';

let driver;

beforeAll(async () => {
  const options = new chrome.Options();
  options.setChromeBinaryPath(CHROME_BIN);
  options.addArguments(
    '--headless=new',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--window-size=1280,900'
  );

  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  await driver.manage().setTimeouts({ implicit: 10000, pageLoad: 60000 });
  globalThis.driver = driver;
}, 120000);

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
});
