const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Test URL
    const url = 'https://shopee.co.th/product/106754729/19239567054';
    
    console.log(`Navigating to ${url}...`);
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        
        const imageUrl = await page.evaluate(() => {
            const ogImage = document.querySelector('meta[property="og:image"]');
            return ogImage ? ogImage.content : null;
        });
        
        console.log('Image URL:', imageUrl);
    } catch (e) {
        console.error('Error:', e.message);
    }
    
    await browser.close();
})();
