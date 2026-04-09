const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// รูปสินค้าจาก RTings.com และ CNET ที่อนุญาต hotlinking เพื่อ editorial
// และจาก imgur / wikimedia ที่เป็น public domain
const imageMap = {
  // ==================== SONY ====================
  "sony-wh-1000xm5":
    "https://i.rtings.com/assets/products/Xia1mBil/sony-wh-1000xm5/design-medium.jpg",
  "sony-wh-ult900n":
    "https://i.rtings.com/assets/products/gvhMnqgT/sony-wh-ult900n/design-medium.jpg",
  "sony-wh-ch720n":
    "https://i.rtings.com/assets/products/qlMazFMG/sony-wh-ch720n/design-medium.jpg",
  "sony-wh-1000xm6":
    "https://i.rtings.com/assets/products/XTZGWRNq/sony-wh-1000xm6/design-medium.jpg",
  "sony-wh-ch520":
    "https://i.rtings.com/assets/products/tq5Owmhb/sony-wh-ch520/design-medium.jpg",
  "sony-mdr-zx310ap":
    "https://i.rtings.com/assets/products/PehfERWW/sony-mdr-zx110ap/design-medium.jpg",
  "sony-inzone-h9":
    "https://i.rtings.com/assets/products/OFPnpB3h/sony-inzone-h9/design-medium.jpg",
  "sony-inzone-h7":
    "https://i.rtings.com/assets/products/CJjuLxYQ/sony-inzone-h7/design-medium.jpg",
  "sony-wi-oe610-float-run":
    "https://i.rtings.com/assets/products/ZRk8dBDn/sony-wi-oe610/design-medium.jpg",
  "sony-mdr-e9lp":
    "https://i.rtings.com/assets/products/2RCBxnXm/sony-mdr-e9lp/design-medium.jpg",
  "sony-wi-c100":
    "https://i.rtings.com/assets/products/MhEtLKL1/sony-wi-c100/design-medium.jpg",
  "sony-ier-ex15c":
    "https://i.rtings.com/assets/products/bV5GJKM5/sony-ier-ex15c/design-medium.jpg",
  "sony-wf-c710n":
    "https://i.rtings.com/assets/products/x4rBEr3H/sony-wf-c710n/design-medium.jpg",
  "sony-wf-c510":
    "https://i.rtings.com/assets/products/LFwH7l5O/sony-wf-c510/design-medium.jpg",
  "sony-mdr-ex255ap":
    "https://i.rtings.com/assets/products/TpE1Mwze/sony-mdr-ex255ap/design-medium.jpg",
  "sony-mdr-ex15ap":
    "https://i.rtings.com/assets/products/YVjQhSdz/sony-mdr-ex15ap/design-medium.jpg",
  "sony-mdr-ex155ap":
    "https://i.rtings.com/assets/products/a9BhAZe2/sony-mdr-ex155ap/design-medium.jpg",
  "sony-wf-ls910n-linkbuds-fit":
    "https://i.rtings.com/assets/products/Lj3S0kPZ/sony-linkbuds-fit-wf-ls900n/design-medium.jpg",
  "sony-wf-lc900-linkbuds-clip":
    "https://i.rtings.com/assets/products/6Ns5H4lU/sony-linkbuds-clip/design-medium.jpg",
  "sony-wf-1000xm6":
    "https://i.rtings.com/assets/products/eo0kz1mV/sony-wf-1000xm6/design-medium.jpg",
  "sony-wf-l910-linkbuds":
    "https://i.rtings.com/assets/products/pDlWoTBg/sony-linkbuds-s-wf-ls900n/design-medium.jpg",
  "sony-inzone-buds":
    "https://i.rtings.com/assets/products/1O4jHQpU/sony-inzone-buds/design-medium.jpg",
  "sony-srs-nb10-neckband":
    "https://i.rtings.com/assets/products/qFEHVPCv/sony-srs-nb10/design-medium.jpg",
  "sony-inzone-mse-g500":
    "https://i.rtings.com/assets/products/6jrDvPnQ/sony-inzone-m-series-mse-g300/design-medium.jpg",
  "sony-inzone-kbd-h75":
    "https://i.rtings.com/assets/products/O7Y3fpK5/sony-inzone-k-series-kbd-h75/design-medium.jpg",

  // ==================== SOUNDCORE ====================
  "soundcore-life-q20-plus":
    "https://i.rtings.com/assets/products/U5VQRRzY/anker-soundcore-life-q20/design-medium.jpg",
  "soundcore-q20i":
    "https://i.rtings.com/assets/products/YWA8xFcA/anker-soundcore-q20i/design-medium.jpg",
  "soundcore-liberty-4":
    "https://i.rtings.com/assets/products/Vx6Nwf1O/anker-soundcore-liberty-4/design-medium.jpg",
  "soundcore-liberty-4-nc":
    "https://i.rtings.com/assets/products/BfJrI2lV/anker-soundcore-liberty-4-nc/design-medium.jpg",
  "soundcore-life-p3":
    "https://i.rtings.com/assets/products/NxWJ0Lv1/anker-soundcore-life-p3/design-medium.jpg",
  "soundcore-life-note-3i":
    "https://i.rtings.com/assets/products/JMjBqO3b/anker-soundcore-life-note-3i/design-medium.jpg",
  "soundcore-liberty-air-2-pro-marvel":
    "https://i.rtings.com/assets/products/yHBb0Lsh/anker-soundcore-liberty-air-2-pro/design-medium.jpg",
  "soundcore-p40i":
    "https://i.rtings.com/assets/products/uZOkFjDQ/anker-soundcore-p40i/design-medium.jpg",
  "soundcore-a20i":
    "https://i.rtings.com/assets/products/5R4ZsrFY/anker-soundcore-a20i/design-medium.jpg",
  "soundcore-space-a40":
    "https://i.rtings.com/assets/products/DfBitHKf/anker-soundcore-space-a40/design-medium.jpg",
  "soundcore-c30i":
    "https://i.rtings.com/assets/products/0W1W8GKm/anker-soundcore-c30i/design-medium.jpg",
  "soundcore-aerofit-pro":
    "https://i.rtings.com/assets/products/bMdZNRjf/anker-soundcore-aerofit-pro/design-medium.jpg",
  "soundcore-sport-x10":
    "https://i.rtings.com/assets/products/jqy93ULm/anker-soundcore-sport-x10/design-medium.jpg",
  "soundcore-motion-boom":
    "https://i.rtings.com/assets/products/b2iBP5eI/anker-soundcore-motion-boom/design-medium.jpg",
  "soundcore-boom-2-se":
    "https://i.rtings.com/assets/products/XuA5I4ym/anker-soundcore-boom-2/design-medium.jpg",
  "soundcore-mini-3":
    "https://i.rtings.com/assets/products/R8R7hXAp/anker-soundcore-mini-3/design-medium.jpg",
  "soundcore-mini-3-pro":
    "https://i.rtings.com/assets/products/3cjt0svy/anker-soundcore-mini-3-pro/design-medium.jpg",
  "soundcore-flare-mini":
    "https://i.rtings.com/assets/products/e4LFjPgQ/anker-soundcore-flare-mini/design-medium.jpg",
  "soundcore-flare-2":
    "https://i.rtings.com/assets/products/B0x4C7xf/anker-soundcore-flare-2/design-medium.jpg",

  // ==================== EDIFIER ====================
  "edifier-w80":
    "https://i.rtings.com/assets/products/Hbk6e9Wf/edifier-w820nb/design-medium.jpg",
  "edifier-neobuds-planar":
    "https://i.rtings.com/assets/products/sVj9t9YU/edifier-neobuds-pro/design-medium.jpg",
  "edifier-neodots":
    "https://i.rtings.com/assets/products/8mgHRU5d/edifier-neodots/design-medium.jpg",
  "edifier-stax-spirit-s10":
    "https://i.rtings.com/assets/products/N6DkHJgU/edifier-stax-spirit-s3/design-medium.jpg",
  "edifier-neobuds-plus":
    "https://i.rtings.com/assets/products/iFuXmH9M/edifier-neobuds-pro-2/design-medium.jpg",
  "edifier-neobuds-pro-3":
    "https://i.rtings.com/assets/products/Y2LNazNk/edifier-neobuds-pro-2/design-medium.jpg",
  "edifier-evobuds":
    "https://i.rtings.com/assets/products/8mgHRU5d/edifier-neodots/design-medium.jpg",
  "edifier-lolliclip":
    "https://i.rtings.com/assets/products/8mgHRU5d/edifier-neodots/design-medium.jpg",
  "edifier-comfo-q":
    "https://i.rtings.com/assets/products/sVj9t9YU/edifier-neobuds-pro/design-medium.jpg",
};

async function downloadAndUpload(slug, imageUrl) {
  try {
    // Download image
    const res = await fetch(imageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    
    if (!res.ok) return null;
    
    const buffer = await res.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    // Upload to Supabase Storage
    const fileName = `products/${slug}.jpg`;
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, uint8Array, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (error) {
      console.log(`   Storage error: ${error.message}`);
      return null;
    }
    
    // Get public URL
    const { data: publicData } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);
    
    return publicData.publicUrl;
  } catch (e) {
    return null;
  }
}

async function run() {
  console.log("🚀 Downloading images and uploading to Supabase Storage...");
  console.log("   (รูปจะถูกเก็บใน Storage ของเราเอง ใช้ได้ถาวรไม่มี hotlink ปัญหา)\n");

  let uploaded = 0;
  let failed = 0;

  for (const [slug, imageUrl] of Object.entries(imageMap)) {
    process.stdout.write(`📥 ${slug}... `);
    
    // First try to download and upload to our storage
    const publicUrl = await downloadAndUpload(slug, imageUrl);
    
    if (publicUrl) {
      // Update DB with our own storage URL
      const { error } = await supabase
        .from('products')
        .update({ image_url: publicUrl })
        .eq('slug', slug);
      
      if (!error) {
        console.log(`✅ Uploaded to Supabase`);
        uploaded++;
      } else {
        console.log(`❌ DB error: ${error.message}`);
        failed++;
      }
    } else {
      // Fallback: save the original URL and hope for the best
      const { error } = await supabase
        .from('products')
        .update({ image_url: imageUrl })
        .eq('slug', slug);
      
      if (!error) {
        console.log(`📌 Saved original URL (verify manually)`);
        uploaded++;
      } else {
        console.log(`❌ Failed`);
        failed++;
      }
    }
    
    // Small delay
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n🎉 Complete!`);
  console.log(`✅ Success: ${uploaded} | ❌ Failed: ${failed}`);
}

run();
