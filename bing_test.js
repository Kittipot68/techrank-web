const cheerio = require('cheerio');

async function testBing() {
    const query = encodeURIComponent('site:shopee.co.th "sony-wh-1000xm6"');
    const url = `https://www.bing.com/images/search?q=${query}`;
    
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        });
        const html = await res.text();
        const $ = cheerio.load(html);
        
        let found = null;
        $('.mimg').each((i, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src');
            // Bing often proxies images or puts original url in 'm' attribute JSON
        });
        
        // Let's just look at the raw html for Shopee CDN links
        const match = html.match(/https:\/\/(cf\.shopee\.co\.th|down-th\.img\.susercontent\.com)\/(file\/)?[a-zA-Z0-9_-]{20,}/);
        console.log('Found:', match ? match[0] : null);
    } catch (e) {
        console.error('Error:', e.message);
    }
}
testBing();
