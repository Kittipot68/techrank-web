const puppeteer = require('puppeteer');

(async () => {
    // Launch non-headless to avoid bot detection
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
    const page = await browser.newPage();
    
    // Set a normal looking user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7',
    });

    const url = 'https://shopee.co.th/product/106754729/19239567054';
    console.log(`Navigating to ${url}...`);

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Wait for potential redirect or bot checks
        await new Promise(r => setTimeout(r, 3000));

        const imageUrl = await page.evaluate(() => {
            const ogImage = document.querySelector('meta[property="og:image"]');
            if (ogImage) return ogImage.content;
            
            // Fallback: look for the main product image block
            const img = document.querySelector('.product-image img, .VExxG img, div[style*="background-image"]');
            if (img) return img.src || img.style.backgroundImage.slice(5, -2);
            return null;
        });
        
        console.log('Image URL:', imageUrl);
    } catch (e) {
        console.error('Error:', e.message);
    }
    
    await browser.close();
})();
