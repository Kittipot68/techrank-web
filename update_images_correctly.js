const { createClient } = require('@supabase/supabase-js');
const cheerio = require('cheerio');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
    console.log("🚀 Starting Google Translate Proxy Scraper for 100% Accurate Images...\n");

    const { data: products } = await supabase.from('products').select('id, name, slug, affiliate_url').order('id', { ascending: true });
    let success = 0;
    
    for (let i = 0; i < products.length; i++) {
        const p = products[i];
        
        if (!p.affiliate_url || !p.affiliate_url.includes('shopee')) {
            console.log(`🔍 [${i+1}/53] ${p.slug}... ⚠️ No Affiliate URL`);
            continue;
        }

        process.stdout.write(`🔍 [${i+1}/53] ${p.slug}... `);
        
        try {
            // Unshorten
            let fullUrl = p.affiliate_url;
            try {
                const redirectRes = await fetch(p.affiliate_url, { method: 'HEAD', redirect: 'follow' });
                fullUrl = redirectRes.url;
            } catch(e) {}
            
            // Extract correct shopId and itemId
            const match = fullUrl.match(/\/(\d+)\/(\d+)/);
            if (!match) {
                console.log(`❌ No IDs inside URL`);
                continue;
            }
            
            const shopId = match[1];
            const itemId = match[2];
            const cleanUrl = `https://shopee.co.th/product/${shopId}/${itemId}`;
            
            // Route through Google Translate
            const proxyUrl = `https://shopee-co-th.translate.goog/product/${shopId}/${itemId}?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp`;
            
            const res = await fetch(proxyUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
            });
            const html = await res.text();
            
            const $ = cheerio.load(html);
            const imageUrl = $('meta[property="og:image"]').attr('content');
            
            if (imageUrl && (imageUrl.includes('shopee') || imageUrl.includes('susercontent'))) {
                const { error } = await supabase.from('products').update({ image_url: imageUrl }).eq('id', p.id);
                if (!error) {
                    console.log(`✅ OK (${imageUrl.substring(25, 45)}...)`);
                    success++;
                } else {
                    console.log(`❌ DB Error`);
                }
            } else {
                console.log(`❌ Proxy Failed`);
            }
        } catch (e) {
            console.log(`❌ Error: ${e.message}`);
        }
        await new Promise(r => setTimeout(r, 1500)); // Be respectful
    }
    
    console.log(`\n🎉 Success! Updated ${success} TRUE images.`);
}

run();
