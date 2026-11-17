// Regenerates assets/templates/<id>.jpg from the live builder with the example CV.
// Usage: serve the site on :8000 (python3 -m http.server 8000), then: node tools/thumbnails.js
const {chromium} = require('playwright');
const ids = ['classic','professional','executive','minimal','compact','elegant','tech','timeline','creative','modern','euro','gulf'];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport: {width: 1440, height: 1200}, deviceScaleFactor: 0.5});
  for (const id of ids) {
    await page.goto(`http://localhost:8000/builder.html?sample=1&template=${id}`);
    const box = await (await page.$('#resumePage')).boundingBox();
    // crop to exactly one A4 page so every thumbnail has the same shape
    const clip = {x: box.x, y: box.y, width: box.width, height: Math.round(box.width * 297 / 210)};
    await page.screenshot({path: `assets/templates/${id}.jpg`, type: 'jpeg', quality: 82, clip});
    console.log('wrote', id);
  }
  await browser.close();
})();
