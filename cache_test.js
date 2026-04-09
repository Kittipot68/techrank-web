const cheerio = require('cheerio');

async function testCache() {
    const url = 'https://shopee.co.th/product/106754729/19239567054';
    const cacheUrl = `https://webcache.googleusercontent.com/search?q=cache:${url}`;
    
    try {
        const res = await fetch(cacheUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        const html = await res.text();
        const $ = cheerio.load(html);
        const img = $('meta[property="og:image"]').attr('content');
        console.log('Cache Image:', img);
    } catch (e) {
        console.error('Cache error:', e.message);
    }
}
testCache();
