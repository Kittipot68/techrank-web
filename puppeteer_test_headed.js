const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'th-TH,th;q=0.9',
    });

    const url = 'https://shopee.co.th/product/106754729/19239567054';
    console.log(`Navigating to ${url}...`);

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(r => setTimeout(r, 5000)); // Wait for render
        
        await page.screenshot({path: 'shopee_test.png'});
        
        // Extract all images in the HTML just in case
        const html = await page.content();
        const matches = html.match(/(https:\/\/(cf\.shopee\.co\.th|down-th\.img\.susercontent\.com)\/(file\/)?[a-zA-Z0-9_-]{20,})/g);
        
        console.log('Found Image URLs:', matches ? [...new Set(matches)].slice(0, 3) : null);
    } catch (e) {
        console.error('Error:', e.message);
    }
    
    await browser.close();
})();
