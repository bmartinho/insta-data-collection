const puppeteer = require('puppeteer');
const settings = require('./settings');

const EXTENSION_PATH = 'C:/Users/bmm/Documents/Projects/chrome-extension-inst';
const EXTENSION_ID = 'fljddicoflbcbjaojihddnhfbojpnjpk';

let browser;

beforeEach(async () => {
  browser = await puppeteer.launch({
    // Set to 'new' to hide Chrome if running as part of an automated build.
    headless: 'new',//false
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`
    ],
    slowMo: 150,
    devtools: true
  });
});

afterEach(async () => {
  await browser.close();
  browser = undefined;
});

test('Run the content gathering on Inst', async () => {
  const m = puppeteer.devices['iPhone X'];

  const appUrl = 'https://www.instagram.com';
  const [appPage] = await browser.pages();
  await appPage.emulate(m);

  console.log('Opening Insta');
  await appPage.goto(appUrl, { waitUntil: 'load' });

  console.log('Accepting cookies');
  const cookiesBtn = await appPage.$('button._acan._acap._acaq._acas._acav._aj1-._ap30');

  await cookiesBtn.click();

  console.log('Moving to login page');
  const loginBtn = await appPage.waitForSelector('button.x5yr21d._acan._acao._acas._aj1-._ap30', { visible: true });
  await loginBtn.click();

  console.log('User and Pass');
  const usernameTxt = await appPage.waitForSelector('input[name=username]', { visible: true });
  await usernameTxt.type(settings.username);

  const passwordTxt = await appPage.$('input[name=password]');
  await passwordTxt.type(settings.password);

  const submitBtn = await appPage.$('button[type=submit]');
  await submitBtn.click();

  console.log('Don\'t remember user in this browser');
  const cancelBtn = await appPage.waitForSelector('button._acan._acap._acas._aj1-._ap30', { visible: true });
  await cancelBtn.click();

  const extPage = await browser.newPage();
  const extensionUrl = `chrome-extension://${EXTENSION_ID}/popup.html`;
  await extPage.goto(extensionUrl, { waitUntil: 'load' });

  for (let i = 0; i < settings.accounts.length; i++) {
    
    appPage.bringToFront();
    console.log('https://www.instagram.com/' + settings.accounts[i] + '/feed');
    await appPage.goto('https://www.instagram.com/' + settings.accounts[i] + '/feed', { waitUntil: 'load' });

    await extPage.bringToFront();
    const replaceBtn = await extPage.$('#changeColor');
    await replaceBtn.click();

    appPage.bringToFront();
    await appPage.$('body.done');

    await extPage.bringToFront();
    const doneLbl = await extPage.waitForSelector('#status.done', { visible: true });
    console.log('Done');
  }

}, settings.timeout);
