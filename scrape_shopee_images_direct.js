const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const SHOPEE_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "th-TH,th;q=0.9,en;q=0.8",
  "Referer": "https://shopee.co.th/",
  "Cache-Control": "no-cache",
};

const codeToSlug = {
  "19239567054": "sony-wh-1000xm5",
  "25075880114": "sony-wh-ult900n",
  "23633871176": "sony-wh-ch720n",
  "42362728171": "sony-wh-1000xm6",
  "23467744403": "sony-wh-ch520",
  "1711618582":  "sony-mdr-zx310ap",
  "43771310976": "sony-inzone-h9",
  "27277052346": "sony-inzone-h7",
  "22768189241": "sony-wi-oe610-float-run",
  "7530142637":  "sony-mdr-e9lp",
  "18046444530": "sony-wi-c100",
  "40571288502": "sony-ier-ex15c",
  "26981411708": "sony-wf-c710n",
  "26562479012": "sony-wf-c510",
  "1710245857":  "sony-mdr-ex255ap",
  "1969050707":  "sony-mdr-ex15ap",
  "1710244952":  "sony-mdr-ex155ap",
  "29814179859": "sony-wf-ls910n-linkbuds-fit",
  "29594464786": "sony-wf-lc900-linkbuds-clip",
  "49057792283": "sony-wf-1000xm6",
  "28364179061": "sony-wf-l910-linkbuds",
  "19186321188": "sony-inzone-buds",
  "13775954481": "sony-srs-nb10-neckband",
  "42471300538": "sony-inzone-mse-g500",
  "43771284743": "sony-inzone-kbd-h75",
  "23025905448": "soundcore-life-q20-plus",
  "16296961475": "soundcore-q20i",
  "22632020112": "soundcore-liberty-4",
  "19190758963": "soundcore-liberty-4-nc",
  "22425912934": "soundcore-life-p3",
  "22540813934": "soundcore-life-note-3i",
  "19478824299": "soundcore-liberty-air-2-pro-marvel",
  "24632239187": "soundcore-p40i",
  "19978162370": "soundcore-a20i",
  "23535101981": "soundcore-space-a40",
  "26152499750": "soundcore-c30i",
  "27003973667": "soundcore-aerofit-pro",
  "23832054522": "soundcore-sport-x10",
  "23823959105": "soundcore-motion-boom",
  "26710432089": "soundcore-boom-2-se",
  "23830242430": "soundcore-mini-3",
  "22531856561": "soundcore-mini-3-pro",
  "23632016320": "soundcore-flare-mini",
  "20077162607": "soundcore-flare-2",
  "57850831940": "edifier-w80",
  "28541249730": "edifier-neobuds-planar",
  "42467996798": "edifier-neodots",
  "40317994793": "edifier-stax-spirit-s10",
  "41668000772": "edifier-neobuds-plus",
  "40417994463": "edifier-neobuds-pro-3",
  "44650866737": "edifier-evobuds",
  "43467997070": "edifier-lolliclip",
  "51150841805": "edifier-comfo-q",
};

function parseCSVLine(line) {
  const row = [];
  let insideQuote = false;
  let currentValue = '';
  for (const char of line) {
    if (char === '"') insideQuote = !insideQuote;
    else if (char === ',' && !insideQuote) { row.push(currentValue); currentValue = ''; }
    else currentValue += char;
  }
  row.push(currentValue);
  return row;
}

async function fetchShopeeImage(shopeeUrl) {
  try {
    const res = await fetch(shopeeUrl, { headers: SHOPEE_HEADERS });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Priority 1: OG Image Meta
    let imageUrl = $('meta[property="og:image"]').attr('content');
    
    // Priority 2: Try to find hash in script tags if meta fails
    if (!imageUrl || !imageUrl.includes('shopee')) {
      const scriptText = $('script').text();
      const match = scriptText.match(/"image":"([a-f0-9]{32})"/);
      if (match) {
        imageUrl = `https://cf.shopee.co.th/file/${match[1]}`;
      }
    }
    
    return imageUrl;
  } catch (e) {
    return null;
  }
}

async function run() {
  console.log("🕷️ Starting Fast Shopee Image Fetcher (No Puppeteer)...\n");

  const dataDir = 'D:\\MY_FIRST_WEB\\DATA';
  const downloadsDir = 'C:\\Users\\1-Click OC\\Downloads';
  const allFiles = [
    ...fs.readdirSync(dataDir).filter(f => f.endsWith('.csv')).map(f => path.join(dataDir, f)),
    ...fs.readdirSync(downloadsDir).filter(f => f.endsWith('.csv') && f.startsWith('ลิงก์สินค้า')).map(f => path.join(downloadsDir, f))
  ];
  
  const shopeeUrlMap = {};
  for (const file of allFiles) {
    if (!fs.existsSync(file)) continue;
    const lines = fs.readFileSync(file, 'utf8').trim().split('\n');
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i].trim());
      const code = row[0];
      const productUrl = row[7];
      if (code && productUrl && (productUrl.includes('shopee.co.th/product/') || productUrl.includes('shopee.co.th/'))) {
        shopeeUrlMap[code] = productUrl;
      }
    }
  }

  let updated = 0;
  const slugs = Object.values(codeToSlug);
  for (const [code, slug] of Object.entries(codeToSlug)) {
    const shopeeUrl = shopeeUrlMap[code];
    if (!shopeeUrl) continue;
    
    process.stdout.write(`🔍 ${slug}... `);
    const imageUrl = await fetchShopeeImage(shopeeUrl);
    
    if (imageUrl) {
      const { error } = await supabase
        .from('products')
        .update({ image_url: imageUrl })
        .eq('slug', slug);
      
      if (!error) {
        console.log(`✅ ${imageUrl.substring(0, 40)}...`);
        updated++;
      } else {
        console.log(`❌ DB error: ${error.message}`);
      }
    } else {
      console.log(`❌ Fetch failed`);
    }
    await new Promise(r => setTimeout(r, 2000)); // Be gentle
  }
  
  console.log(`\n🎉 Done! ✅ Updated: ${updated} products with direct Shopee links`);
}

run().catch(console.error);
