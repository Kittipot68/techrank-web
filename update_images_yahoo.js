const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log("🚀 Starting Google Images bypass to fetch Shopee images...\n");

    const { data: products } = await supabase.from('products').select('id, name, slug, image_url');
    let success = 0;
    
    for (let i = 0; i < products.length; i++) {
        const p = products[i];
        
        // Skip if already has a direct shopee/susercontent link
        if (p.image_url && (p.image_url.includes('susercontent.com') || p.image_url.includes('cf.shopee.co.th'))) {
            continue;
        }

        const query = encodeURIComponent(`site:shopee.co.th "${p.name}"`);
        const searchUrl = `https://html.duckduckgo.com/html/?q=${query}`;
        
        process.stdout.write(`🔍 [${i+1}/53] ${p.slug}... `);
        
        try {
            await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
            
            // For DuckDuckGo HTML version, we can extract the links to images
            // But DDG HTML doesn't have an image search tab directly.
            // Let's use Yahoo Image Search as it's less restrictive than Google
            const yahooUrl = `https://images.search.yahoo.com/search/images?p=${query}`;
            await page.goto(yahooUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
            
            const imageUrl = await page.evaluate(() => {
                const links = Array.from(document.querySelectorAll('img'));
                for(let img of links) {
                    let src = img.src || img.getAttribute('data-src');
                    if(src && src.includes('http')) {
                        return src;
                    }
                }
                return null;
            });
            
            if (imageUrl) {
                const { error } = await supabase.from('products').update({ image_url: imageUrl }).eq('id', p.id);
                if (!error) {
                    console.log(`✅ OK`);
                    success++;
                } else {
                    console.log(`❌ DB Error`);
                }
            } else {
                console.log(`❌ Not Found`);
            }
        } catch (e) {
            console.log(`❌ Error`);
        }
        await new Promise(r => setTimeout(r, 1500));
    }
    
    await browser.close();
    console.log(`\n🎉 Success! Updated ${success} images.`);
}

run();
