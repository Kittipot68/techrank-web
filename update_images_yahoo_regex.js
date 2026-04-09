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

    console.log("🚀 Starting Google Images bypass via JSON scraping...\n");

    const { data: products } = await supabase.from('products').select('id, name, slug, image_url').order('id', { ascending: true });
    let success = 0;
    
    // We already did the first 8 + 4 top ones. Let's filter the remaining
    const remaining = products.filter(p => !p.image_url || !(p.image_url.includes('shopee') || p.image_url.includes('susercontent')));
    
    console.log(`Remaining products to process: ${remaining.length}\n`);

    for (let i = 0; i < remaining.length; i++) {
        const p = remaining[i];
        
        // Clean up the name for better search query
        let cleanName = p.name.split('-')[0].split('|')[0].trim();
        const query = encodeURIComponent(`site:shopee.co.th "${cleanName}"`);
        // Searching on Yahoo Images again, but parsing correctly this time!
        const searchUrl = `https://images.search.yahoo.com/search/images?p=${query}`;
        
        process.stdout.write(`🔍 [${i+1}/${remaining.length}] ${p.slug}... `);
        
        try {
            await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
            
            const imageUrl = await page.evaluate(() => {
                // Yahoo stores original image URLs in the data-url attribute or inside JSON in the anchor tag!
                const items = document.querySelectorAll('li[data-url]');
                for (let item of items) {
                    const dataUrl = item.getAttribute('data-url');
                    // data-url is often a json string in yahoo?
                    // wait, no, the a tag has data-req inside it, or img has data-src
                    // Let's just find the first thing that looks like a shopee CDN link in the page source!
                }
                
                // Absolute robust fallback: regex over the entire DOM text for Shopee Image CDN links
                const bodyHtml = document.documentElement.innerHTML;
                const match = bodyHtml.match(/https:\/\/(cf\.shopee\.co\.th|down-th\.img\.susercontent\.com)\/(file\/)?[a-zA-Z0-9_-]{20,}/);
                
                return match ? match[0] : null;
            });
            
            if (imageUrl) {
                // Clean the extracted URL if it was inside quotes or something
                let cleanUrl = imageUrl.replace(/["\\]/g, '');
                const { error } = await supabase.from('products').update({ image_url: cleanUrl }).eq('id', p.id);
                if (!error) {
                    console.log(`✅ ${cleanUrl}`);
                    success++;
                } else {
                    console.log(`❌ DB Error`);
                }
            } else {
                console.log(`❌ Not Found in Yahoo Source`);
            }
        } catch (e) {
            console.log(`❌ Timeout/Error`);
        }
        await new Promise(r => setTimeout(r, 1000));
    }
    
    await browser.close();
    console.log(`\n🎉 Success! Updated ${success} images.`);
}

run();
