const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const GOOGLEBOT_UA = "Googlebot/2.1 (+http://www.google.com/bot.html)";

async function unshorten(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', headers: { 'User-Agent': GOOGLEBOT_UA } });
    return res.url;
  } catch (e) {
    return url;
  }
}

async function fetchShopeeImage(shopeeUrl) {
  try {
    const res = await fetch(shopeeUrl, { headers: { 'User-Agent': GOOGLEBOT_UA } });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // OG Image Meta is highly reliable for Googlebot
    let imageUrl = $('meta[property="og:image"]').attr('content');
    
    if (!imageUrl || !imageUrl.includes('shopee')) {
      // Second try: JSON-LD
      const jsonLdScript = $('script[type="application/ld+json"]').html();
      if (jsonLdScript) {
        const jsonLd = JSON.parse(jsonLdScript);
        imageUrl = jsonLd.image;
      }
    }
    
    return imageUrl;
  } catch (e) {
    return null;
  }
}

async function run() {
  console.log("🕷️ Starting Full Site Image Enrichment via Googlebot Bypass...\n");

  const { data: products } = await supabase.from('products').select('id, name, slug, affiliate_url');

  let success = 0;
  let fail = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const prefix = `[${i + 1}/53] ${p.name}...`;

    if (!p.affiliate_url || !p.affiliate_url.includes('shopee')) {
      console.log(`${prefix} ⚠️ Skip (No Shopee URL)`);
      continue;
    }

    try {
      const fullUrl = await unshorten(p.affiliate_url);
      const imageUrl = await fetchShopeeImage(fullUrl);

      if (imageUrl) {
        const { error } = await supabase.from('products').update({ image_url: imageUrl }).eq('id', p.id);
        if (!error) {
          console.log(`${prefix} ✅ Updated: ${imageUrl.substring(0, 40)}...`);
          success++;
        } else {
          console.log(`${prefix} ❌ DB Error: ${error.message}`);
          fail++;
        }
      } else {
        console.log(`${prefix} ❌ Image Not Found`);
        fail++;
      }
    } catch (err) {
      console.log(`${prefix} ❌ Error: ${err.message}`);
      fail++;
    }
    
    await new Promise(r => setTimeout(r, 800)); // Be respectful but efficient
  }

  console.log(`\n🎉 ENRICHMENT COMPLETE! ✅ Success: ${success} | ❌ Failed: ${fail}`);
}

run();
