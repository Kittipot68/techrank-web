const { createClient } = require('@supabase/supabase-js');
const cheerio = require('cheerio');
require('dotenv').config({ path: '.env.local' });

async function debugVariations() {
    const shortUrl = "https://s.shopee.co.th/16LFuMAVo";
    const res = await fetch(shortUrl, { method: 'HEAD', redirect: 'follow' });
    const fullUrl = res.url;
    const match = fullUrl.match(/\/(\d+)\/(\d+)/);
    const [_, shopId, itemId] = match;

    const proxyUrl = `https://shopee-co-th.translate.goog/product/${shopId}/${itemId}?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp`;
    const proxyRes = await fetch(proxyUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await proxyRes.text();

    const jsonStringMatch = html.match(/<script [^>]*type="text\/mfe-initial-data"[^>]*>(.*?)<\/script>/s);
    const state = JSON.parse(jsonStringMatch[1]);
    const itemData = state?.initialState?.DOMAIN_PDP?.data?.PDP_BFF_DATA?.cachedMap[`${shopId}/${itemId}`]?.item;

    console.log("--- PRICE DEBUG ---");
    console.log(`Price Min: ${itemData.price_min}`);
    console.log(`Price: ${itemData.price}`);
    
    if (itemData.models && itemData.models.length > 0) {
        console.log(`Found ${itemData.models.length} variations (models).`);
        itemData.models.forEach(m => {
            console.log(` - Model: ${m.name}, Price: ${m.price || m.price_before_discount}`);
        });
    } else {
        console.log("No models found.");
    }

    console.log("--- ATTRIBUTES DEBUG ---");
    itemData.attributes.forEach(a => {
        console.log(`[${a.name}] ${a.value}`);
    });
}

debugVariations();
