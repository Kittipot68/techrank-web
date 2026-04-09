const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// จับคู่ product code -> slug
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

async function scrapeShopeeImage(page, shopeeUrl) {
  try {
    await page.goto(shopeeUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // รอให้รูปโหลดก่อน
    await new Promise(r => setTimeout(r, 3000));
    
    // ดึง URL รูปหลักจาก Shopee
    const imageUrl = await page.evaluate(() => {
      // วิธีที่ 1: หา img ขนาดใหญ่ในกรอบสินค้า
      const mainImg = document.querySelector(
        'img.IZqgXY, img._1ier5r, div.product-image img, ' +
        'div[class*="product-image"] img, ' +
        'div.carousel img:first-child, ' +
        'img[style*="width: 480px"]'
      );
      if (mainImg?.src && mainImg.src.includes('shopee')) return mainImg.src;
      
      // วิธีที่ 2: หาจาก og:image
      const ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg?.content) return ogImg.content;
      
      // วิธีที่ 3: หา img ที่ใหญ่ที่สุดในหน้า
      const allImgs = Array.from(document.querySelectorAll('img'));
      const shopeeImgs = allImgs.filter(img => 
        img.src && (img.src.includes('shopee') || img.src.includes('susercontent')) &&
        img.naturalWidth > 200
      );
      if (shopeeImgs.length > 0) {
        // เรียงตามขนาด เอาอันใหญ่สุด
        shopeeImgs.sort((a, b) => (b.naturalWidth * b.naturalHeight) - (a.naturalWidth * a.naturalHeight));
        return shopeeImgs[0].src;
      }
      
      return null;
    });
    
    return imageUrl;
  } catch (e) {
    console.log(`   Error: ${e.message.substring(0, 60)}`);
    return null;
  }
}

async function downloadAndUploadToSupabase(imageUrl, slug) {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return null;
    
    const buffer = await res.arrayBuffer();
    const fileName = `products/${slug}.jpg`;
    
    const { error } = await supabase.storage
      .from('images')
      .upload(fileName, new Uint8Array(buffer), {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (error) return null; // Storage อาจยังไม่ได้สร้าง — fallback ใช้ URL ตรง
    
    const { data } = supabase.storage.from('images').getPublicUrl(fileName);
    return data.publicUrl;
  } catch {
    return null;
  }
}

async function run() {
  console.log("🕷️  Starting Shopee image scraper with Puppeteer...\n");

  // อ่าน CSV ทั้งหมดเพื่อสร้าง code -> shopee URL map
  const dataDir = 'D:\\MY_FIRST_WEB\\DATA';
  const downloadsDir = 'C:\\Users\\1-Click OC\\Downloads';
  
  const allFiles = [
    ...fs.readdirSync(dataDir).filter(f => f.endsWith('.csv')).map(f => path.join(dataDir, f)),
    ...fs.readdirSync(downloadsDir).filter(f => f.endsWith('.csv') && f.startsWith('ลิงก์สินค้า')).map(f => path.join(downloadsDir, f))
  ];
  
  const shopeeUrlMap = {}; // code -> shopee product URL
  for (const file of allFiles) {
    const lines = fs.readFileSync(file, 'utf8').trim().split('\n');
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i].trim());
      const code = row[0];
      const productUrl = row[7]; // ลิงก์สินค้า
      if (code && productUrl && productUrl.includes('shopee.co.th/product/')) {
        shopeeUrlMap[code] = productUrl;
      }
    }
  }
  console.log(`Found ${Object.keys(shopeeUrlMap).length} Shopee product URLs\n`);

  // เปิด Browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--lang=th-TH,th',
    ]
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1280, height: 900 });
  
  // ปิด unnecessary requests เพื่อเร็วขึ้น
  await page.setRequestInterception(true);
  page.on('request', req => {
    const type = req.resourceType();
    if (['font', 'stylesheet', 'script'].includes(type) && !req.url().includes('shopee')) {
      req.abort();
    } else {
      req.continue();
    }
  });

  let updated = 0;
  let failed = 0;
  const results = {}; // slug -> imageUrl (สำหรับ backup)

  for (const [code, slug] of Object.entries(codeToSlug)) {
    const shopeeUrl = shopeeUrlMap[code];
    if (!shopeeUrl) {
      console.log(`⚠️  No Shopee URL: ${slug}`);
      failed++;
      continue;
    }
    
    process.stdout.write(`🔍 ${slug}... `);
    
    const imageUrl = await scrapeShopeeImage(page, shopeeUrl);
    
    if (imageUrl) {
      // ลองอัปโหลดเข้า Supabase Storage ก่อน
      let finalUrl = imageUrl;
      const supabaseUrl = await downloadAndUploadToSupabase(imageUrl, slug);
      if (supabaseUrl) {
        finalUrl = supabaseUrl;
        process.stdout.write(`☁️  Uploaded to Supabase... `);
      }
      
      results[slug] = finalUrl;
      
      const { error } = await supabase
        .from('products')
        .update({ image_url: finalUrl })
        .eq('slug', slug);
      
      if (!error) {
        console.log(`✅ ${imageUrl.substring(0, 60)}...`);
        updated++;
      } else {
        console.log(`❌ DB error: ${error.message}`);
        failed++;
      }
    } else {
      console.log(`❌ Could not scrape image`);
      failed++;
    }
    
    // delay ระหว่างสินค้าเพื่อหลีกเลี่ยง rate limit
    await new Promise(r => setTimeout(r, 2000));
  }
  
  await browser.close();
  
  // บันทึก results เป็น JSON สำรอง
  fs.writeFileSync('D:\\MY_FIRST_WEB\\scraped_images.json', JSON.stringify(results, null, 2));
  
  console.log(`\n🎉 Done! ✅ Updated: ${updated} | ❌ Failed: ${failed}`);
  console.log('📄 Results saved to scraped_images.json');
}

run().catch(console.error);
