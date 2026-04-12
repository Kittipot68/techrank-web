const { createClient } = require('@supabase/supabase-js');
const cheerio = require('cheerio');
require('dotenv').config({ path: '.env.local' });

const TARGET_ID = "57707748374"; // The Shopee Item ID from the user's URL
const SHOP_ID = "61025595"; // Need to find this, usually it's in the link or we can unshorten

async function testScraper() {
    console.log("🚀 Testing Elite Scraper on TCL 98T8D...");
    
    // Resolve short link to get IDs
    const shortUrl = "https://s.shopee.co.th/16LFuMAVo";
    const res = await fetch(shortUrl, { method: 'HEAD', redirect: 'follow' });
    const fullUrl = res.url;
    console.log(`🔗 Resolved URL: ${fullUrl}`);

    const match = fullUrl.match(/\/(\d+)\/(\d+)/);
    if (!match) {
        console.error("❌ Could not extract IDs");
        return;
    }
    const [_, shopId, itemId] = match;
    console.log(`🆔 Shop: ${shopId}, Item: ${itemId}`);

    // Fetch via Proxy
    const proxyUrl = `https://shopee-co-th.translate.goog/product/${shopId}/${itemId}?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp`;
    const proxyRes = await fetch(proxyUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await proxyRes.text();

    const jsonStringMatch = html.match(/<script [^>]*type="text\/mfe-initial-data"[^>]*>(.*?)<\/script>/s);
    if (!jsonStringMatch) {
         console.error("❌ Loophole script not found");
         return;
    }

    const state = JSON.parse(jsonStringMatch[1]);
    const itemData = state?.initialState?.DOMAIN_PDP?.data?.PDP_BFF_DATA?.cachedMap[`${shopId}/${itemId}`]?.item;

    if (!itemData) {
         console.error("❌ Could not find item in JSON");
         console.log("Keys available:", Object.keys(state?.initialState?.DOMAIN_PDP?.data?.PDP_BFF_DATA?.cachedMap || {}));
         return;
    }

    console.log("✅ Data Extracted!");
    console.log(`Name: ${itemData.name}`);
    console.log(`Price Min: ${itemData.price_min}`);
    console.log(`Price Max: ${itemData.price_max}`);
    console.log(`Attributes: ${itemData.attributes?.length}`);
    console.log(`Description length: ${itemData.description?.length}`);
}

testScraper();
