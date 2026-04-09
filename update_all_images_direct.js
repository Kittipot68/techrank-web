const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const SHOPEE_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json",
  "Accept-Language": "th-TH,th;q=0.9,en;q=0.8",
  "Referer": "https://shopee.co.th/",
  "X-Requested-With": "XMLHttpRequest",
};

async function unshorten(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return res.url;
  } catch (e) {
    return url;
  }
}

function extractIds(url) {
  const match = url.match(/\/(\d+)\/(\d+)/);
  if (match) return { shopId: match[1], itemId: match[2] };
  return null;
}

async function getImageUrl(shopId, itemId) {
  const apiUrl = `https://shopee.co.th/api/v4/item/get?shopid=${shopId}&itemid=${itemId}`;
  try {
    const res = await fetch(apiUrl, { headers: SHOPEE_HEADERS });
    if (!res.ok) return null;
    const json = await res.json();
    const hash = json?.data?.image;
    return hash ? `https://cf.shopee.co.th/file/${hash}` : null;
  } catch (e) {
    return null;
  }
}

async function run() {
  console.log("🚀 Starting Massive Image Enrichment for all 53 products...\n");

  const { data: products } = await supabase.from('products').select('id, name, slug, affiliate_url');

  let success = 0;
  let fail = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const prefix = `[${i + 1}/53] ${p.name}...`;

    if (!p.affiliate_url || !p.affiliate_url.includes('shopee')) {
      console.log(`${prefix} ⚠️ No Shopee URL`);
      continue;
    }

    try {
      const fullUrl = await unshorten(p.affiliate_url);
      const ids = extractIds(fullUrl);

      if (ids) {
        const imageUrl = await getImageUrl(ids.shopId, ids.itemId);
        if (imageUrl) {
          const { error } = await supabase.from('products').update({ image_url: imageUrl }).eq('id', p.id);
          if (!error) {
            console.log(`${prefix} ✅ Updated Image`);
            success++;
          } else {
            console.log(`${prefix} ❌ DB Error: ${error.message}`);
            fail++;
          }
        } else {
          console.log(`${prefix} ❌ Failed to fetch Image from Shopee API`);
          fail++;
        }
      } else {
        console.log(`${prefix} ❌ Failed to parse IDs from: ${fullUrl.substring(0, 50)}...`);
        fail++;
      }
    } catch (err) {
      console.log(`${prefix} ❌ Error: ${err.message}`);
      fail++;
    }
    
    // Add a small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\n🎉 Image Update Complete! ✅ Success: ${success} | ❌ Failed: ${fail}`);
}

run();
