const { createClient } = require('@supabase/supabase-js');
const cheerio = require('cheerio');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
    console.log("🚀 Starting BING Images bypass to fetch Shopee images...\n");

    const { data: products } = await supabase.from('products').select('id, name, slug, image_url').order('id', { ascending: true });
    let success = 0;
    
    // Process those that don't have direct shopee CDN links
    const remaining = products.filter(p => !p.image_url || !(p.image_url.includes('shopee') || p.image_url.includes('susercontent')));
    
    console.log(`Remaining products to process: ${remaining.length}\n`);

    for (let i = 0; i < remaining.length; i++) {
        const p = remaining[i];
        
        let cleanName = p.name.split('|')[0].trim();
        const query = encodeURIComponent(`site:shopee.co.th "${cleanName}"`);
        const searchUrl = `https://www.bing.com/images/search?q=${query}`;
        
        process.stdout.write(`🔍 [${i+1}/${remaining.length}] ${p.slug}... `);
        
        try {
            const res = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml',
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            });
            
            const html = await res.text();
            
            // Regex to find all shopee CDN links in the HTML
            const matches = html.match(/https:\/\/(cf\.shopee\.co\.th|down-th\.img\.susercontent\.com)\/(file\/)?[a-zA-Z0-9_-]{20,}/g);
            
            if (matches && matches.length > 0) {
                // Remove duplicates to find the most common one, or just take the first
                const cleanUrl = matches[0].replace(/["\\]/g, '');
                
                const { error } = await supabase.from('products').update({ image_url: cleanUrl }).eq('id', p.id);
                if (!error) {
                    console.log(`✅ ${cleanUrl.substring(25, 45)}...`);
                    success++;
                } else {
                    console.log(`❌ DB Error`);
                }
            } else {
                console.log(`❌ Not Found in Bing`);
            }
        } catch (e) {
            console.log(`❌ Error: ${e.message}`);
        }
        await new Promise(r => setTimeout(r, 800)); // Be respectful
    }
    
    console.log(`\n🎉 Success! Updated ${success} images.`);
}

run();
