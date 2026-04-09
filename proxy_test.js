const cheerio = require('cheerio');

async function testProxy() {
    const url = 'https://shopee-co-th.translate.goog/product/106754729/19239567054?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp';
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const html = await res.text();
        const $ = cheerio.load(html);
        const ogImage = $('meta[property="og:image"]').attr('content');
        console.log('Proxied image:', ogImage);
    } catch(e) {
        console.log('Error:', e.message);
    }
}
testProxy();
