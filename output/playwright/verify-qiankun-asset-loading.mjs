import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('http://localhost:9901/dashboard/qiankun/asset-loading', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const title = await page.$eval('h1, h2, h3, .ant-typography-title, [class*="title"]', el => el.textContent).catch(() => 'NO_TITLE');
  const body = await page.evaluate(() => document.body.innerText);

  const checks = {
    title: title.includes('qiankun 专题：子应用资源的加载'),
    nginxMonaco: body.includes('nginx 转发后为什么 Monaco 不需要 getWorkerUrl'),
    nginxWorker: body.includes('nginx 会自动将其转发到子应用的 editor.worker.js'),
  };

  console.log(JSON.stringify({ title: title.trim().slice(0, 200), checks }, null, 2));
  await browser.close();
})();
