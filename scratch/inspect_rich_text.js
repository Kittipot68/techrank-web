const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function inspectRichText() {
    const shopId = "106678713";
    const itemId = "57707748374";
    const proxyUrl = `https://shopee-co-th.translate.goog/product/${shopId}/${itemId}?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp`;
    
    const res = await fetch(proxyUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const jsonStringMatch = html.match(/<script [^>]*type="text\/mfe-initial-data"[^>]*>(.*?)<\/script>/s);
    const state = JSON.parse(jsonStringMatch[1]);
    const item = state?.initialState?.DOMAIN_PDP?.data?.PDP_BFF_DATA?.cachedMap[`${shopId}/${itemId}`]?.item;

    console.log("Rich Text Keys:", Object.keys(item.rich_text_description || {}));
    if (item.rich_text_description && item.rich_text_description.content) {
        console.log("Content type:", typeof item.rich_text_description.content);
        // It might be nested under content or sections
    }
    
    // Just print the first 500 chars of the stringified rich text to see the keys
    console.log("Snippet:", JSON.stringify(item.rich_text_description).substring(0, 1000));
}

inspectRichText();
