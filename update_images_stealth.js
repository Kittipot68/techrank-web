const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function unshorten(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return res.url;
  } catch (e) {
    return url;
  }
}

async function run() {
    // Run headless: 'new' with Stealth bypassing Cloudflare/Shopee bot checks easily
    const browser = await puppeteer.launch({ 
        headless: 'new', 
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'] 
    });
    
    console.log("🚀 Starting Stealth Shopee Scraper...\n");

    const { data: products } = await supabase.from('products').select('id, name, slug, affiliate_url, image_url').order('id', { ascending: true });
    let success = 0;
    
    const remaining = products.filter(p => !p.image_url || !(p.image_url.includes('shopee') || p.image_url.includes('susercontent')));
    console.log(`Remaining products to process: ${remaining.length}\n`);

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    for (let i = 0; i < remaining.length; i++) {
        const p = remaining[i];
        
        if (!p.affiliate_url || !p.affiliate_url.includes('shopee')) {
            console.log(`🔍 [${i+1}/${remaining.length}] ${p.slug}... ⚠️ No Affiliate URL`);
            continue;
        }

        process.stdout.write(`🔍 [${i+1}/${remaining.length}] ${p.slug}... `);
        
        try {
            const fullUrl = await unshorten(p.affiliate_url);
            
            await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
            
            // Wait for Shopee rendering text or image blocks
            await new Promise(r => setTimeout(r, 2000));
            
            const imageUrl = await page.evaluate(() => {
                // Priority 1: OG Meta
                const og = document.querySelector('meta[property="og:image"]');
                if (og && og.content) return og.content;
                
                // Priority 2: JSON-LD
                const script = document.querySelector('script[type="application/ld+json"]');
                if (script) {
                    try {
                        const json = JSON.parse(script.innerText);
                        if (json.image) return json.image;
                    } catch(e) {}
                }
                
                // Priority 3: First product image shown
                const img = document.querySelector('.product-image img, div[style*="background-image: url"]');
                if (img) return img.src || img.style.backgroundImage.slice(5, -2);
                
                // Priority 4: Regex over raw html
                const html = document.documentElement.innerHTML;
                const match = html.match(/https:\/\/(cf\.shopee\.co\.th|down-th\.img\.susercontent\.com)\/(file\/)?[a-zA-Z0-9_-]{20,}/);
                if (match) return match[0];

                return null;
            });
            
            if (imageUrl) {
                let cleanUrl = imageUrl.replace(/["\\]/g, '');
                const { error } = await supabase.from('products').update({ image_url: cleanUrl }).eq('id', p.id);
                if (!error) {
                    console.log(`✅ OK (${cleanUrl.substring(25, 45)}...)`);
                    success++;
                } else {
                    console.log(`❌ DB Error`);
                }
            } else {
                console.log(`❌ Not Found on Page`);
            }
        } catch (e) {
            console.log(`❌ Error/Timeout`);
        }
        
        // Anti-bot delay
        await new Promise(r => setTimeout(r, 1500));
    }
    
    await browser.close();
    console.log(`\n🎉 Success! Updated ${success} images using Stealth.`);
}

run();
