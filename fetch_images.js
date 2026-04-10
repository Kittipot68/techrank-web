// fetch_images.js — TechRank Smart Enricher
// ✅ ดึงรูปภาพจาก Shopee API อย่างแม่นยำ
// ✅ ดึง specs, description, brand จาก Shopee API มาด้วย
// ✅ จัดการสินค้าเดียวกันหลายร้าน (เก็บ price_min ราคาถูกสุด, price_max ราคาแพงสุด)

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// จับคู่ product code (จาก CSV Shopee Affiliate) กับ slug ที่ใช้ใน DB
// เพิ่ม/แก้ไขที่นี่เมื่อมีสินค้าใหม่
const codeToSlug = {
  // ── Sony Headphones ──
  "19239567054": "sony-wh-1000xm5",
  "25075880114": "sony-wh-ult900n",
  "23633871176": "sony-wh-ch720n",
  "42362728171": "sony-wh-1000xm6",
  "23467744403": "sony-wh-ch520",
  "1711618582":  "sony-mdr-zx310ap",
  "43771310976": "sony-inzone-h9",
  "27277052346": "sony-inzone-h7",
  "22768189241": "sony-wi-oe610-float-run",
  // ── Sony Earbuds ──
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
  // ── Sony Other ──
  "13775954481": "sony-srs-nb10-neckband",
  "42471300538": "sony-inzone-mse-g500",
  "43771284743": "sony-inzone-kbd-h75",
  // ── Soundcore Headphones ──
  "23025905448": "soundcore-life-q20-plus",
  "16296961475": "soundcore-q20i",
  // ── Soundcore Earbuds ──
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
  // ── Soundcore Speakers ──
  "23823959105": "soundcore-motion-boom",
  "26710432089": "soundcore-boom-2-se",
  "23830242430": "soundcore-mini-3",
  "22531856561": "soundcore-mini-3-pro",
  "23632016320": "soundcore-flare-mini",
  "20077162607": "soundcore-flare-2",
  // ── Edifier ──
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

// ── ฟังก์ชันช่วยเหลือ ──────────────────────────────────────────

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

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Shopee API: ดึงข้อมูลครบ (รูป + specs + description) ──────

async function fetchShopeeProductData(shopId, itemId) {
  const url = `https://shopee.co.th/api/v4/item/get?itemid=${itemId}&shopid=${shopId}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': `https://shopee.co.th/product/${shopId}/${itemId}`,
        'Accept': 'application/json',
        'Accept-Language': 'th-TH,th;q=0.9,en;q=0.8',
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
    if (!res.ok) return null;
    const json = await res.json();
    const d = json?.data;
    if (!d) return null;

    // ── รูปภาพ ──
    const imageHash = d.image || d.images?.[0];
    const imageUrl = imageHash ? `https://down-th.img.susercontent.com/file/${imageHash}` : null;

    // ── ราคา ──
    const priceMin = d.price_min ? d.price_min / 100000 : null;
    const priceMax = d.price_max ? d.price_max / 100000 : null;

    // ── คำอธิบาย ──
    const description = d.description || null;

    // ── Brand ──
    const brand = d.brand || null;

    // ── Attributes (Specs) จาก Shopee ──
    // Shopee จะให้ attributes มาเป็น array เช่น [{name: 'ความเชื่อมต่อ', value: 'Bluetooth'}]
    const rawAttributes = d.attributes || [];
    const specs = rawAttributes
      .filter(a => a.name && a.value)
      .map(a => ({ key: a.name, value: a.value }));

    // ── Specifications (เพิ่มเติม) ──
    // บางรุ่นมี tier_variations หรือ field อื่น ─ รวมให้ครบ
    const tierVariations = (d.tier_variations || [])
      .filter(t => t.name && t.options?.length > 0)
      .map(t => ({ key: t.name, value: t.options.join(' / ') }));

    const allSpecs = [...specs, ...tierVariations];

    // ── ยอดขาย + Rating ──
    const itemSold = d.historical_sold || d.sold || 0;
    const itemRating = d.item_rating?.rating_star ? (d.item_rating.rating_star / 1).toFixed(1) : null;
    const ratingCount = d.item_rating?.rating_count?.[0] || 0;

    return {
      imageUrl,
      priceMin,
      priceMax,
      description,
      brand,
      specs: allSpecs,
      itemSold,
      itemRating: itemRating ? parseFloat(itemRating) : null,
      ratingCount,
    };
  } catch (e) {
    return null;
  }
}

// ── อ่านไฟล์ CSV ทั้งหมดจาก /DATA ──────────────────────────────

function loadCSVData() {
  const dataDir = path.join('D:', 'MY_FIRST_WEB', 'DATA');
  const files = fs.existsSync(dataDir)
    ? fs.readdirSync(dataDir).filter(f => f.endsWith('.csv')).map(f => path.join(dataDir, f))
    : [];

  // code -> [{ shopId, itemId, affiliateUrl, price }]
  // เก็บทุกร้านค้าเพื่อเปรียบราคา
  const productMap = {};

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.trim().split('\n');
      // Row 0 = header, skip
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const row = parseCSVLine(line);

        const code        = row[0]?.trim();
        const priceRaw    = row[2]?.trim(); // ราคา
        const productUrl  = row[7]?.trim(); // ลิงก์สินค้า https://shopee.co.th/product/shopId/itemId
        const affLink     = row[8]?.trim(); // ลิงก์ Affiliate

        if (!code || !productUrl) continue;

        const urlMatch = productUrl.match(/shopee\.co\.th\/product\/(\d+)\/(\d+)/);
        if (!urlMatch) continue;

        const shopId  = urlMatch[1];
        const itemId  = urlMatch[2];
        const price   = parseFloat(priceRaw?.replace(/,/g, '')) || null;

        if (!productMap[code]) productMap[code] = [];
        productMap[code].push({ shopId, itemId, affiliateUrl: affLink || productUrl, price });
      }
    } catch (e) {
      console.error(`Error reading ${file}:`, e.message);
    }
  }

  return productMap;
}

// ── MAIN ─────────────────────────────────────────────────────────

async function run() {
  console.log('══════════════════════════════════════════════════════');
  console.log('🚀 TechRank Smart Enricher — รูปภาพ + Specs + ราคา');
  console.log('══════════════════════════════════════════════════════\n');

  const productMap = loadCSVData();
  console.log(`📂 โหลดข้อมูล CSV สำเร็จ: ${Object.keys(productMap).length} รหัสสินค้า พบในไฟล์\n`);

  let updatedImages = 0;
  let updatedSpecs  = 0;
  let updatedDesc   = 0;
  let skipped       = 0;
  let multiStoreCount = 0;

  for (const [code, slug] of Object.entries(codeToSlug)) {
    const storeList = productMap[code];
    if (!storeList || storeList.length === 0) {
      console.log(`⚠️  [${slug}] ไม่พบ URL ใน CSV — ข้าม`);
      skipped++;
      continue;
    }

    // ── สินค้าเดียวกัน หลายร้าน ──
    // เรียงราคาถูกสุดก่อน
    storeList.sort((a, b) => (a.price || 9999999) - (b.price || 9999999));

    const cheapest  = storeList[0];
    const mostExp   = storeList[storeList.length - 1];
    const priceMin  = cheapest.price;
    const priceMax  = mostExp.price;
    const bestAffiliate = cheapest.affiliateUrl; // ลิงก์ร้านราคาถูกสุด

    if (storeList.length > 1) {
      multiStoreCount++;
      console.log(`🏬 [${slug}] พบ ${storeList.length} ร้านค้า — ราคา ${priceMin?.toFixed(0)} - ${priceMax?.toFixed(0)} บาท`);
    } else {
      console.log(`🔍 [${slug}] 1 ร้านค้า — ราคา ${priceMin?.toFixed(0) || '-'} บาท`);
    }

    // ── ดึงข้อมูลจาก Shopee API (ใช้ร้านราคาถูกสุดเป็น source หลัก) ──
    process.stdout.write(`   📡 กำลังดึงข้อมูลจาก Shopee API... `);
    const shopeeData = await fetchShopeeProductData(cheapest.shopId, cheapest.itemId);

    if (!shopeeData) {
      console.log(`❌ API ไม่ตอบสนอง`);
      skipped++;
      await delay(500);
      continue;
    }

    console.log(`✅ ได้ข้อมูลมาแล้ว`);

    // ── อัปเดต products ──
    const productUpdate = {};

    if (shopeeData.imageUrl) {
      productUpdate.image_url  = shopeeData.imageUrl;
      updatedImages++;
    }
    if (priceMin) productUpdate.price_min = priceMin;
    if (priceMax) productUpdate.price_max = priceMax;
    if (bestAffiliate) productUpdate.affiliate_url = bestAffiliate;

    // เพิ่ม description ถ้า DB ยังไม่มี
    if (shopeeData.description) {
      const { data: existing } = await supabase
        .from('products').select('description').eq('slug', slug).single();
      if (!existing?.description || existing.description.length < 50) {
        productUpdate.description = shopeeData.description.substring(0, 2000);
        updatedDesc++;
      }
    }

    if (Object.keys(productUpdate).length > 0) {
      const { error } = await supabase.from('products').update(productUpdate).eq('slug', slug);
      if (error) console.error(`   ❌ DB error: ${error.message}`);
      else {
        if (productUpdate.image_url) console.log(`   📸 รูป: ${shopeeData.imageUrl?.substring(0, 60)}...`);
        if (productUpdate.price_min) console.log(`   💰 ราคา: ${priceMin} - ${priceMax} บาท`);
        if (productUpdate.description) console.log(`   📝 เพิ่ม description (${shopeeData.description?.length} ตัวอักษร)`);
      }
    }

    // ── อัปเดต specs ──
    if (shopeeData.specs.length > 0) {
      const { data: product } = await supabase
        .from('products').select('id').eq('slug', slug).single();

      if (product) {
        // ดูว่า specs ที่มีอยู่แล้วมีกี่ตัว
        const { data: existingSpecs } = await supabase
          .from('specs').select('key').eq('product_id', product.id);

        const existingKeys = new Set((existingSpecs || []).map(s => s.key));

        // เพิ่มเฉพาะ spec ที่ยังไม่มี
        const newSpecs = shopeeData.specs
          .filter(s => !existingKeys.has(s.key))
          .map(s => ({ product_id: product.id, key: s.key, value: s.value }));

        if (newSpecs.length > 0) {
          const { error: specErr } = await supabase.from('specs').insert(newSpecs);
          if (!specErr) {
            console.log(`   ⚙️  เพิ่ม ${newSpecs.length} specs ใหม่ (จาก Shopee API)`);
            updatedSpecs += newSpecs.length;
          }
        } else {
          console.log(`   ⚙️  Specs ครบแล้ว (${existingSpecs?.length} รายการ)`);
        }
      }
    }

    await delay(400); // ป้องกัน rate limit
  }

  console.log('\n══════════════════════════════════════════════════════');
  console.log('🎉 เสร็จสิ้น!');
  console.log(`   📸 อัปเดตรูปภาพ  : ${updatedImages} สินค้า`);
  console.log(`   ⚙️  เพิ่ม Specs   : ${updatedSpecs} รายการ`);
  console.log(`   📝 เพิ่ม Desc     : ${updatedDesc} สินค้า`);
  console.log(`   🏬 หลายร้านค้า   : ${multiStoreCount} สินค้า (เก็บ range ราคา)`);
  console.log(`   ⚠️  ข้าม          : ${skipped} สินค้า`);
  console.log('══════════════════════════════════════════════════════');
}

run();
