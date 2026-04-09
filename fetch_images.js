const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// จับคู่ product code (จาก CSV) กับ slug ที่เราใช้ใน DB
const codeToSlug = {
  // Sony
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
  // Soundcore
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
  // Edifier
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

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchShopeeImage(shopId, itemId) {
  try {
    const url = `https://shopee.co.th/api/v4/item/get?itemid=${itemId}&shopid=${shopId}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': `https://shopee.co.th/product/${shopId}/${itemId}`,
        'Accept': 'application/json',
        'af-ac-enc-dat': '...',
      }
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const imageHash = data?.data?.image || data?.data?.images?.[0];
    if (imageHash) {
      return `https://down-th.img.susercontent.com/file/${imageHash}`;
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function run() {
  console.log("🖼️  Starting image fetch from Shopee...\n");

  // Read all CSV files to build itemId -> shopId + shopeeUrl map
  const dataDir = 'D:\\MY_FIRST_WEB\\DATA';
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv'));
  
  // Also check Downloads folder
  const downloadsDir = 'C:\\Users\\1-Click OC\\Downloads';
  const downloadFiles = fs.readdirSync(downloadsDir)
    .filter(f => f.endsWith('.csv') && f.startsWith('ลิงก์สินค้า'))
    .map(f => path.join(downloadsDir, f));
  
  const allFiles = [
    ...files.map(f => path.join(dataDir, f)),
    ...downloadFiles
  ];

  const productMap = {}; // code -> { shopId, itemId, productUrl }

  for (const file of allFiles) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.trim().split('\n');
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const row = parseCSVLine(line);
      const code = row[0];
      const productUrl = row[7]; // ลิงก์สินค้า เช่น https://shopee.co.th/product/106754729/19239567054
      
      if (code && productUrl && productUrl.includes('shopee.co.th/product/')) {
        const parts = productUrl.replace('https://shopee.co.th/product/', '').split('/');
        if (parts.length >= 2) {
          productMap[code] = {
            shopId: parts[0],
            itemId: parts[1],
            productUrl
          };
        }
      }
    }
  }

  console.log(`Found ${Object.keys(productMap).length} products with Shopee URLs\n`);

  let updated = 0;
  let failed = 0;

  for (const [code, slug] of Object.entries(codeToSlug)) {
    const shopeeInfo = productMap[code];
    if (!shopeeInfo) {
      console.log(`⚠️  No Shopee URL for code: ${code} (${slug})`);
      failed++;
      continue;
    }

    // Fetch image from Shopee
    const imageUrl = await fetchShopeeImage(shopeeInfo.shopId, shopeeInfo.itemId);
    
    if (imageUrl) {
      const { error } = await supabase
        .from('products')
        .update({ image_url: imageUrl })
        .eq('slug', slug);
      
      if (error) {
        console.error(`❌ DB error for ${slug}: ${error.message}`);
        failed++;
      } else {
        console.log(`✅ ${slug}`);
        console.log(`   📸 ${imageUrl}`);
        updated++;
      }
    } else {
      // Fallback: use Shopee product page URL pattern
      // Many products have predictable thumbnail URLs
      console.log(`⚠️  Could not fetch image for ${slug} — will try fallback`);
      failed++;
    }

    // Delay 300ms เพื่อไม่ให้โดน rate limit
    await delay(300);
  }

  console.log(`\n🎉 Image fetch complete!`);
  console.log(`✅ Updated: ${updated} products`);
  console.log(`⚠️  Failed/Skipped: ${failed} products`);
  
  if (failed > 0) {
    console.log('\n💡 สินค้าที่รูปยังขาด สามารถเพิ่มรูปได้ผ่านหน้า Admin ที่:');
    console.log('   https://tech-rank-web.vercel.app/admin');
  }
}

run();
