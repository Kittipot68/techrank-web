const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ใช้ URL รูปที่สามารถ hotlink ได้ จาก:
// 1. Wikimedia Commons (CC License, สาธารณะ 100%)
// 2. RTings.com (press images)
// 3. GSMArena product images
// 4. Amazon product images (stable CDN)
// 5. BestBuy product images
const imageMap = {
  // ════════ SONY ════════
  "sony-wh-1000xm5":
    "https://m.media-amazon.com/images/I/51aXvjzcukL._AC_SL1500_.jpg",
  "sony-wh-ult900n":
    "https://m.media-amazon.com/images/I/61nPFvFjpSL._AC_SL1500_.jpg",
  "sony-wh-ch720n":
    "https://m.media-amazon.com/images/I/51qOhziSxgL._AC_SL1500_.jpg",
  "sony-wh-1000xm6":
    "https://m.media-amazon.com/images/I/61L5PlNDVvL._AC_SL1500_.jpg",
  "sony-wh-ch520":
    "https://m.media-amazon.com/images/I/61CGHv6kmwL._AC_SL1500_.jpg",
  "sony-mdr-zx310ap":
    "https://m.media-amazon.com/images/I/61HZBdRJr2L._AC_SL1500_.jpg",
  "sony-inzone-h9":
    "https://m.media-amazon.com/images/I/71s7RnUiMfL._AC_SL1500_.jpg",
  "sony-inzone-h7":
    "https://m.media-amazon.com/images/I/71XO1dT3YpL._AC_SL1500_.jpg",
  "sony-wi-oe610-float-run":
    "https://m.media-amazon.com/images/I/61d-w30HBAL._AC_SL1500_.jpg",
  "sony-mdr-e9lp":
    "https://m.media-amazon.com/images/I/61pFOrBIu3L._AC_SL1500_.jpg",
  "sony-wi-c100":
    "https://m.media-amazon.com/images/I/61Z0c37LQWL._AC_SL1500_.jpg",
  "sony-ier-ex15c":
    "https://m.media-amazon.com/images/I/51G4bJLdPXL._AC_SL1500_.jpg",
  "sony-wf-c710n":
    "https://m.media-amazon.com/images/I/51RRvUvJVRL._AC_SL1500_.jpg",
  "sony-wf-c510":
    "https://m.media-amazon.com/images/I/51XiJyiuYmL._AC_SL1500_.jpg",
  "sony-mdr-ex255ap":
    "https://m.media-amazon.com/images/I/71ZyEBYMrKL._AC_SL1500_.jpg",
  "sony-mdr-ex15ap":
    "https://m.media-amazon.com/images/I/61vURCxyjEL._AC_SL1500_.jpg",
  "sony-mdr-ex155ap":
    "https://m.media-amazon.com/images/I/71ueUFl7OcL._AC_SL1500_.jpg",
  "sony-wf-ls910n-linkbuds-fit":
    "https://m.media-amazon.com/images/I/51SjBRhRRxL._AC_SL1500_.jpg",
  "sony-wf-lc900-linkbuds-clip":
    "https://m.media-amazon.com/images/I/41yKXkNIEsL._AC_SL1500_.jpg",
  "sony-wf-1000xm6":
    "https://m.media-amazon.com/images/I/61GyvqvwTEL._AC_SL1500_.jpg",
  "sony-wf-l910-linkbuds":
    "https://m.media-amazon.com/images/I/51V7D8EyrAL._AC_SL1500_.jpg",
  "sony-inzone-buds":
    "https://m.media-amazon.com/images/I/61pcFb3QGLL._AC_SL1500_.jpg",
  "sony-srs-nb10-neckband":
    "https://m.media-amazon.com/images/I/61z0dVQxBnL._AC_SL1500_.jpg",
  "sony-inzone-mse-g500":
    "https://m.media-amazon.com/images/I/61Xd2Q9yIkL._AC_SL1500_.jpg",
  "sony-inzone-kbd-h75":
    "https://m.media-amazon.com/images/I/71k2Fa0mQ3L._AC_SL1500_.jpg",

  // ════════ SOUNDCORE ════════
  "soundcore-life-q20-plus":
    "https://m.media-amazon.com/images/I/616eFGMJsEL._AC_SL1500_.jpg",
  "soundcore-q20i":
    "https://m.media-amazon.com/images/I/61c1v2yiCRL._AC_SL1500_.jpg",
  "soundcore-liberty-4":
    "https://m.media-amazon.com/images/I/51eMlmlLvML._AC_SL1500_.jpg",
  "soundcore-liberty-4-nc":
    "https://m.media-amazon.com/images/I/51pkJlqMvRL._AC_SL1500_.jpg",
  "soundcore-life-p3":
    "https://m.media-amazon.com/images/I/61kRWEL1cNL._AC_SL1500_.jpg",
  "soundcore-life-note-3i":
    "https://m.media-amazon.com/images/I/61Y4wjivjHL._AC_SL1500_.jpg",
  "soundcore-liberty-air-2-pro-marvel":
    "https://m.media-amazon.com/images/I/61mGmOHsKyL._AC_SL1500_.jpg",
  "soundcore-p40i":
    "https://m.media-amazon.com/images/I/51W-h3mmFWL._AC_SL1500_.jpg",
  "soundcore-a20i":
    "https://m.media-amazon.com/images/I/51iA8hcPfGL._AC_SL1500_.jpg",
  "soundcore-space-a40":
    "https://m.media-amazon.com/images/I/51mSMyzj+7L._AC_SL1500_.jpg",
  "soundcore-c30i":
    "https://m.media-amazon.com/images/I/51fNVlq6oVL._AC_SL1500_.jpg",
  "soundcore-aerofit-pro":
    "https://m.media-amazon.com/images/I/51xKllWPsNL._AC_SL1500_.jpg",
  "soundcore-sport-x10":
    "https://m.media-amazon.com/images/I/51rI6-WMN6L._AC_SL1500_.jpg",
  "soundcore-motion-boom":
    "https://m.media-amazon.com/images/I/51O4JgEiVdL._AC_SL1500_.jpg",
  "soundcore-boom-2-se":
    "https://m.media-amazon.com/images/I/41wjfYvnShL._AC_SL1500_.jpg",
  "soundcore-mini-3":
    "https://m.media-amazon.com/images/I/51M4gGLQj6L._AC_SL1500_.jpg",
  "soundcore-mini-3-pro":
    "https://m.media-amazon.com/images/I/51rKH3OQH5L._AC_SL1500_.jpg",
  "soundcore-flare-mini":
    "https://m.media-amazon.com/images/I/61E2vKkRomL._AC_SL1500_.jpg",
  "soundcore-flare-2":
    "https://m.media-amazon.com/images/I/51RNuGJaSHL._AC_SL1500_.jpg",

  // ════════ EDIFIER ════════
  "edifier-w80":
    "https://m.media-amazon.com/images/I/61YnTF-GwQL._AC_SL1500_.jpg",
  "edifier-neobuds-planar":
    "https://m.media-amazon.com/images/I/51i+9rLj9GL._AC_SL1500_.jpg",
  "edifier-neodots":
    "https://m.media-amazon.com/images/I/41jL3l5WZAL._AC_SL1000_.jpg",
  "edifier-stax-spirit-s10":
    "https://m.media-amazon.com/images/I/61sZTxqMxFL._AC_SL1500_.jpg",
  "edifier-neobuds-plus":
    "https://m.media-amazon.com/images/I/51CUiNBE6AL._AC_SL1500_.jpg",
  "edifier-neobuds-pro-3":
    "https://m.media-amazon.com/images/I/51X7bnGbiqL._AC_SL1500_.jpg",
  "edifier-evobuds":
    "https://m.media-amazon.com/images/I/41jL3l5WZAL._AC_SL1000_.jpg",
  "edifier-lolliclip":
    "https://m.media-amazon.com/images/I/51jh4A6RFKL._AC_SL1000_.jpg",
  "edifier-comfo-q":
    "https://m.media-amazon.com/images/I/41uo0HkL-EL._AC_SL1000_.jpg",
};

async function run() {
  console.log("🖼️  Updating images using Amazon CDN URLs (most reliable)...\n");

  let updated = 0;

  for (const [slug, imageUrl] of Object.entries(imageMap)) {
    const { error } = await supabase
      .from('products')
      .update({ image_url: imageUrl })
      .eq('slug', slug);

    if (error) {
      console.error(`❌ ${slug}: ${error.message}`);
    } else {
      console.log(`✅ ${slug}`);
      updated++;
    }
  }

  console.log(`\n🎉 Done! ${updated} products updated with Amazon CDN images`);
  console.log('\n⚠️  หมายเหตุ: Amazon CDN URLs ต้องตรวจสอบว่ารูปถูกต้องหรือเปล่า');
  console.log('   ถ้ารูปไม่ตรงกับสินค้า สามารถแก้ไขผ่านหน้า Admin ได้ที่:');
  console.log('   https://tech-rank-web.vercel.app/admin');
}

run();
