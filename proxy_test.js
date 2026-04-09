const cheerio = require('cheerio');

async function testProxy() {
    const affiliateUrl = 'https://s.shopee.co.th/6VJnSV1G2T';
    
    // First unshorten the URL
    let fullUrl = affiliateUrl;
    try {
        const redirectRes = await fetch(affiliateUrl, { method: 'HEAD', redirect: 'follow' });
        fullUrl = redirectRes.url;
    } catch(e) {}
    
    // Extract actual shopId and itemId
    const match = fullUrl.match(/\/(\d+)\/(\d+)\??/);
    if (!match) return console.log('No IDs found');
    
    const shopId = match[1];
    const itemId = match[2];
    
    // Clean, direct URL without affiliate tracking tags that trigger mobile redirect
    const cleanUrl = `https://shopee.co.th/product/${shopId}/${itemId}`;
    console.log('Clean URL:', cleanUrl);
    
    // Convert to translate format
    const urlObj = new URL(cleanUrl);
    const domain = urlObj.hostname.replace(/\./g, '-');
    const proxyUrl = `https://${domain}.translate.goog${urlObj.pathname}?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp`;
    
    console.log('Proxy URL:', proxyUrl);

    try {
        const res = await fetch(proxyUrl, {
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
