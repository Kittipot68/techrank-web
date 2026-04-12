const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function getInfographicUrls() {
    const shopId = "106678713";
    const itemId = "57707748374";
    const proxyUrl = `https://shopee-co-th.translate.goog/product/${shopId}/${itemId}?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp`;
    
    const res = await fetch(proxyUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const jsonStringMatch = html.match(/<script [^>]*type="text\/mfe-initial-data"[^>]*>(.*?)<\/script>/s);
    if (!jsonStringMatch) return;
    
    const state = JSON.parse(jsonStringMatch[1]);
    const item = state?.initialState?.DOMAIN_PDP?.data?.PDP_BFF_DATA?.cachedMap[`${shopId}/${itemId}`]?.item;
    
    if (item?.rich_text_description?.paragraph_list) {
        const images = item.rich_text_description.paragraph_list
            .filter(p => p.img_id)
            .map(p => `https://down-th.img.susercontent.com/file/${p.img_id}`);
        
        console.log("Found Infographic Images:");
        console.log(JSON.stringify(images, null, 2));
    }
}

getInfographicUrls();
