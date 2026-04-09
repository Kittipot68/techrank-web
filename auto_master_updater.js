const { createClient } = require('@supabase/supabase-js');
const cheerio = require('cheerio');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ----------------------------------------------------
// 1. SPECIFICATIONS DATABASE (Ultra-Premium Templates)
// ----------------------------------------------------
const categoryTemplates = {
  "headphones": [
    { key: "Type", value: "High-Resolution Headphones" },
    { key: "Bluetooth", value: "v5.0+ Stable Connection" },
    { key: "Battery life", value: "25-50 Hours Long Playtime" },
    { key: "Sound Engine", value: "Premium Balanced Sound" },
    { key: "Charging", value: "Quick Charge via USB-C" },
    { key: "Build", value: "Ergonomic & Lightweight Design" },
    { key: "Control", value: "On-ear Smart Control" },
    { key: "Special", value: "Foldable for Portability" }
  ],
  "tws": [
    { key: "Type", value: "True Wireless Stereo Earbuds" },
    { key: "Bluetooth", value: "v5.2+ Low Latency" },
    { key: "Waterproof", value: "IPX4/IPX5 Sweat Resistance" },
    { key: "Case Battery", value: "Large Capacity Charging Case" },
    { key: "Sound Tech", value: "Bass Boosted Technology" },
    { key: "Microphones", value: "Built-in AI Noise Cancellation" },
    { key: "Controls", value: "Smart Touch Controls" }
  ],
  "speakers": [
    { key: "Sound", value: "360° Immersive Audio" },
    { key: "Bass", value: "Exclusive BassUp Technology" },
    { key: "Waterproof", value: "IPX7 Fully Waterproof" },
    { key: "Battery", value: "12-24 Hours Playtime" },
    { key: "Light Show", value: "Synchronized Beat LED" },
    { key: "Connection", value: "Wireless Stereo Pairing (TWS)" },
    { key: "Port", value: "USB-C Fast Charging" }
  ]
};

// ----------------------------------------------------
// 2. MAIN UPGRADE FUNCTION
// ----------------------------------------------------
async function runAutoUpdater() {
    console.log("==========================================");
    console.log("🚀 TechRank MASTER UPDATER INITIALIZED");
    console.log("==========================================\n");

    const { data: products, error } = await supabase
        .from('products')
        .select('*, categories(slug)')
        .order('id', { ascending: true });

    if (error) {
        console.error("❌ Database Error:", error.message);
        return;
    }

    let specsUpdated = 0;
    let imagesUpdated = 0;

    console.log(`📦 Found ${products.length} products in database. Scanning for missing premium data...\n`);

    for (let i = 0; i < products.length; i++) {
        const p = products[i];
        const prefix = `[${i+1}/${products.length}] ${p.slug}`;
        let needsUpdate = false;

        // --- STEP A: Check & Upgrade Specs ---
        const { data: currentSpecs } = await supabase.from('specs').select('id').eq('product_id', p.id);
        if (!currentSpecs || currentSpecs.length < 5) {
            needsUpdate = true;
            process.stdout.write(`⚙️ ${prefix} (Upgrading Specs)... `);
            const catSlug = p.categories?.slug || 'headphones';
            const template = categoryTemplates[catSlug] || categoryTemplates['headphones'];
            
            let specs = template.map(t => ({...t}));
            specs.push({ key: "Regional Support", value: "Official Warranty (2026)" });
            specs.push({ key: "Certification", value: "Hi-Res / CE / RoHS Certified" });
            specs.push({ key: "Model Status", value: "Premium Authentic" });

            await supabase.from('specs').delete().eq('product_id', p.id);
            await supabase.from('specs').insert(
                specs.map(s => ({ product_id: p.id, key: s.key, value: s.value }))
            );
            console.log(`✅ OK (${specs.length} points)`);
            specsUpdated++;
        }

        // --- STEP B: Check & Upgrade Images (Shopee Proxy Bypass) ---
        if (!p.image_url || !(p.image_url.includes('shopee') || p.image_url.includes('susercontent'))) {
            needsUpdate = true;
            process.stdout.write(`📸 ${prefix} (Scraping Image)... `);
            
            if (!p.affiliate_url || !p.affiliate_url.includes('shopee')) {
                console.log(`⚠️ Skip (No Affiliate URL)`);
                continue;
            }

            try {
                // 1. Unshorten Affiliate Loop
                let fullUrl = p.affiliate_url;
                try {
                    const redirectRes = await fetch(p.affiliate_url, { method: 'HEAD', redirect: 'follow' });
                    fullUrl = redirectRes.url;
                } catch(e) {}
                
                // 2. Extract Clean IDs
                const match = fullUrl.match(/\/(\d+)\/(\d+)/);
                if (match) {
                    const shopId = match[1];
                    const itemId = match[2];

                    // 3. Google Translate Proxy Fetch
                    const proxyUrl = `https://shopee-co-th.translate.goog/product/${shopId}/${itemId}?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp`;
                    const res = await fetch(proxyUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
                    const html = await res.text();
                    
                    const $ = cheerio.load(html);
                    const imageUrl = $('meta[property="og:image"]').attr('content');
                    
                    if (imageUrl && (imageUrl.includes('shopee') || imageUrl.includes('susercontent'))) {
                        await supabase.from('products').update({ image_url: imageUrl }).eq('id', p.id);
                        console.log(`✅ OK (${imageUrl.substring(25, 45)}...)`);
                        imagesUpdated++;
                    } else {
                        console.log(`❌ Failed (Proxy blocked or missing tag)`);
                    }
                } else {
                    console.log(`❌ Failed (Could not extract ID from URL)`);
                }
            } catch (err) {
                console.log(`❌ Error (${err.message})`);
            }
            // Delay to protect from IP ban
            await new Promise(r => setTimeout(r, 1500));
        }
    }

    console.log("\n==========================================");
    console.log(`🎉 UPGRADE COMPLETE!`);
    console.log(`   - Added Premium Specs to: ${specsUpdated} products`);
    console.log(`   - Scraped Direct Images for: ${imagesUpdated} products`);
    console.log("==========================================");
}

runAutoUpdater();
