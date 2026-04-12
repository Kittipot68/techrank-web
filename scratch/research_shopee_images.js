const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function getRichDescription() {
    const shopId = "106678713";
    const itemId = "57707748374";
    const proxyUrl = `https://shopee-co-th.translate.goog/product/${shopId}/${itemId}?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp`;
    
    console.log(`📡 Fetching from: ${proxyUrl}`);
    const res = await fetch(proxyUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    
    const jsonStringMatch = html.match(/<script [^>]*type="text\/mfe-initial-data"[^>]*>(.*?)<\/script>/s);
    if (!jsonStringMatch) return console.log("❌ JSON not found");

    const state = JSON.parse(jsonStringMatch[1]);
    const item = state?.initialState?.DOMAIN_PDP?.data?.PDP_BFF_DATA?.cachedMap[`${shopId}/${itemId}`]?.item;

    if (item.rich_text_description) {
        console.log("✅ Rich Text Description Found!");
        const images = item.rich_text_description.sections
            .filter(s => s.type === 'image')
            .map(s => `https://down-th.img.susercontent.com/file/${s.data.image_id}`);
        
        console.log("📸 Description Images:");
        images.forEach(img => console.log(img));
    } else {
        console.log("❌ No Rich Text Description. Trying to regex images from raw description...");
        // Sometimes images are just links in the text
        const imgMatches = item.description.match(/https:\/\/down-th\.img\.susercontent\.com\/file\/[a-z0-9]+/g);
        if (imgMatches) {
            console.log("📸 Found images in raw text:");
            imgMatches.forEach(img => console.log(img));
        }
    }
}

getRichDescription();
