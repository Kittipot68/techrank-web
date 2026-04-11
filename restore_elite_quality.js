const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function resolveAffiliateLinks() {
    console.log("==========================================");
    console.log("🛠️  TECHRANK ELITE DATA RESTORATION");
    console.log("==========================================\n");

    // 1. Get Top 100 products to fix (Focusing on ones with placeholders or newly added)
    const brands = ['Xiaomi', 'Sony', 'HyperX', 'Logitech', 'Razer'];
    let allProducts = [];

    for (const brand of brands) {
        const { data } = await supabase
            .from('products')
            .select('*')
            .ilike('name', `%${brand}%`)
            .limit(20);
        if (data) allProducts = [...allProducts, ...data];
    }

    console.log(`🔍 Recovering data for ${allProducts.length} elite products across ${brands.join(', ')}...\n`);

    for (let i = 0; i < allProducts.length; i++) {
        const p = allProducts[i];
        console.log(`[${i+1}/${allProducts.length}] ⚙️  Processing: ${p.name.substring(0, 40)}...`);

        try {
            // STEP A: Extract IDs from Affiliate URL (or resolve it)
            let shopId, itemId;
            
            // Try to resolve if it's a short link
            if (p.affiliate_url.includes('s.shopee.co.th')) {
                try {
                    const res = await fetch(p.affiliate_url, { method: 'HEAD', redirect: 'follow' });
                    const fullUrl = res.url;
                    const match = fullUrl.match(/\/(\d+)\/(\d+)/);
                    if (match) {
                        shopId = match[1];
                        itemId = match[2];
                    }
                } catch (e) {
                    console.error("   ⚠️ Link resolution failed, skipping...");
                    continue;
                }
            }

            if (!shopId || !itemId) {
                console.error("   ⚠️ Could not identify Shopee IDs, skipping...");
                continue;
            }

            // STEP B: Fetch via Google Translate Proxy
            const proxyUrl = `https://shopee-co-th.translate.goog/product/${shopId}/${itemId}?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp`;
            const proxyRes = await fetch(proxyUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const html = await proxyRes.text();

            // STEP C: Parse HTML for the Loophole Script
            const jsonStringMatch = html.match(/<script [^>]*type="text\/mfe-initial-data"[^>]*>(.*?)<\/script>/s);
            if (!jsonStringMatch) {
                 console.error("   ⚠️ Loophole script not found in HTML, proxy might be rate-limited.");
                 continue;
            }

            const state = JSON.parse(jsonStringMatch[1]);
            const itemData = state?.initialState?.DOMAIN_PDP?.data?.PDP_BFF_DATA?.cachedMap[`${shopId}/${itemId}`]?.item;

            if (!itemData) {
                 console.error("   ⚠️ Could not find item object in JSON state.");
                 continue;
            }

            // STEP D: Extract REAL Data
            const imageUrl = `https://down-th.img.susercontent.com/file/${itemData.image || itemData.images[0]}`;
            const specs = (itemData.attributes || []).map(a => ({ key: a.name, value: a.value }));
            const rating = itemData.item_rating?.rating_star || 0;

            // STEP E: UPDATE DATABASE
            await supabase.from('products').update({
                image_url: imageUrl,
                item_rating: rating > 0 ? parseFloat(rating.toFixed(1)) : null
            }).eq('id', p.id);

            // Update Specs
            if (specs.length > 0) {
                await supabase.from('specs').delete().eq('product_id', p.id);
                await supabase.from('specs').insert(
                    specs.map(s => ({ product_id: p.id, key: s.key, value: s.value }))
                );
            }

            console.log(`   ✅ SUCCESS: Real data & ${specs.length} specs restored.`);

        } catch (err) {
            console.error(`   ❌ ERROR: ${err.message}`);
        }

        // Safety delay
        await new Promise(r => setTimeout(r, 2000));
    }

    console.log("\n==========================================");
    console.log("🎉  DATA RESTORATION BATCH 1 COMPLETE!");
    console.log("==========================================");
}

resolveAffiliateLinks();
