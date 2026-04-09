const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Testing Direct API loading in headed browser
    const url = 'https://shopee.co.th/api/v4/item/get?shopid=106754729&itemid=19239567054';
    console.log(`Navigating to ${url}...`);

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        const html = await page.evaluate(() => document.body.innerText);
        console.log('JSON Output (truncated):', html.substring(0, 500));
        
        try {
            const data = JSON.parse(html);
            console.log('Hash image:', data.data?.image);
        } catch(err) {
            console.log('Not JSON');
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
    
    await browser.close();
})();
