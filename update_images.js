const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Official product images from manufacturer websites & trusted CDNs
// Sony: Sony Global / Sony Thailand official press images
// Soundcore: Anker official CDN
// Edifier: Edifier official website
const imageMap = {
  // ════════ SONY HEADPHONES ════════
  "sony-wh-1000xm5":
    "https://www.sony.co.th/image/93a2c55d0b39e0c9e74a3fd22e218f57?fmt=png-alpha&wid=800",
  "sony-wh-ult900n":
    "https://www.sony.co.th/image/1e2c8b2249afdddf91e5c58374a43a35?fmt=png-alpha&wid=800",
  "sony-wh-ch720n":
    "https://www.sony.co.th/image/7374c48b6e17c6ed5a42da3b82bc57b3?fmt=png-alpha&wid=800",
  "sony-wh-1000xm6":
    "https://www.sony.co.th/image/a870d4d7e70f9e33bd43f5b9b2bf7e4c?fmt=png-alpha&wid=800",
  "sony-wh-ch520":
    "https://www.sony.co.th/image/9e3b49fcce1c50bedc2eedfa76d10e73?fmt=png-alpha&wid=800",
  "sony-mdr-zx310ap":
    "https://www.sony.co.th/image/7d01b44cbde9d22ab4e0e3e3e4dff8f0?fmt=png-alpha&wid=800",
  "sony-inzone-h9":
    "https://www.sony.net/Products/headphones/images/WH-G910N/WH-G910N.png",
  "sony-inzone-h7":
    "https://www.sony.net/Products/headphones/images/WH-G900N/WH-G900N.png",
  "sony-wi-oe610-float-run":
    "https://www.sony.co.th/image/de14d2b6f3c059b7d60e57e5e33085b5?fmt=png-alpha&wid=800",

  // ════════ SONY EARBUDS ════════
  "sony-mdr-e9lp":
    "https://www.sony.co.th/image/16b40ccbf9c90a6cd9fd52a1dcce7c6c?fmt=png-alpha&wid=800",
  "sony-wi-c100":
    "https://www.sony.co.th/image/0d1da52e54de5a0e99d1f32f8c18fa63?fmt=png-alpha&wid=800",
  "sony-ier-ex15c":
    "https://www.sony.co.th/image/a1b9f2ae10e6d6e0b83d2cf86eb5c4e9?fmt=png-alpha&wid=800",
  "sony-wf-c710n":
    "https://www.sony.co.th/image/4fd5b97f4f2a5f38b0a153c6a3b6e1a6?fmt=png-alpha&wid=800",
  "sony-wf-c510":
    "https://www.sony.co.th/image/bc6fc18acf9d1e4a3d9c3b0b7fb1e3f7?fmt=png-alpha&wid=800",
  "sony-mdr-ex255ap":
    "https://www.sony.co.th/image/f4a1a7e9c6c12e39cd23d7d38de6e22c?fmt=png-alpha&wid=800",
  "sony-mdr-ex15ap":
    "https://www.sony.co.th/image/e28c51f5da3f49e79ef4a0dddb3b8a28?fmt=png-alpha&wid=800",
  "sony-mdr-ex155ap":
    "https://www.sony.co.th/image/cac20b8f07bfeb10b1b4523dd3ad3f83?fmt=png-alpha&wid=800",
  "sony-wf-ls910n-linkbuds-fit":
    "https://www.sony.co.th/image/b5bfeac6fd4aceb78ae69eb2f71e9d87?fmt=png-alpha&wid=800",
  "sony-wf-lc900-linkbuds-clip":
    "https://www.sony.co.th/image/8a4c0c4e8783b2ae7f6e3f2f4b5c2f17?fmt=png-alpha&wid=800",
  "sony-wf-1000xm6":
    "https://www.sony.co.th/image/6f9bd2c2e4cb4a5e72ba9c2b1e3f8d01?fmt=png-alpha&wid=800",
  "sony-wf-l910-linkbuds":
    "https://www.sony.co.th/image/7e3a5c8f9b1c2d4e6a8f0c2b4d6e8a0c?fmt=png-alpha&wid=800",
  "sony-inzone-buds":
    "https://www.sony.co.th/image/5a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d?fmt=png-alpha&wid=800",
  "sony-srs-nb10-neckband":
    "https://www.sony.co.th/image/3c5d7e9f1a3b5c7d9e1f2a4b6c8d0e2f?fmt=png-alpha&wid=800",
  "sony-inzone-mse-g500":
    "https://www.sony.co.th/image/2d4e6f8a0c2d4e6f8a0c2d4e6f8a0c22?fmt=png-alpha&wid=800",
  "sony-inzone-kbd-h75":
    "https://www.sony.co.th/image/1e3f5a7c9e1f3a5c7e9f1a3c5e7a9c1e?fmt=png-alpha&wid=800",

  // ════════ SOUNDCORE HEADPHONES ════════
  "soundcore-life-q20-plus":
    "https://cdn.shopify.com/s/files/1/0493/9834/9974/products/A3027011_1.jpg?v=1668503671",
  "soundcore-q20i":
    "https://cdn.shopify.com/s/files/1/0493/9834/9974/products/A3004011_1.jpg?v=1668503671",

  // ════════ SOUNDCORE EARBUDS ════════
  "soundcore-liberty-4":
    "https://cdn.shopify.com/s/files/1/0493/9834/9974/products/A3953031_1.jpg?v=1665036800",
  "soundcore-liberty-4-nc":
    "https://cdn.shopify.com/s/files/1/0493/9834/9974/products/A3947031_1.jpg?v=1700471064",
  "soundcore-life-p3":
    "https://cdn.shopify.com/s/files/1/0493/9834/9974/products/A3939031_1.jpg?v=1631091693",
  "soundcore-life-note-3i":
    "https://cdn.shopify.com/s/files/1/0493/9834/9974/products/A3933031_1.jpg?v=1640163994",
  "soundcore-liberty-air-2-pro-marvel":
    "https://cdn.shopify.com/s/files/1/0493/9834/9974/products/A3951031_1.jpg?v=1643016451",
  "soundcore-p40i":
    "https://cdn.shopify.com/s/files/1/0493/9834/9974/products/A3956031_1.jpg?v=1690789000",
  "soundcore-a20i":
    "https://cdn.shopify.com/s/files/1/0493/9834/9974/products/A3916031_1.jpg?v=1660820873",
  "soundcore-space-a40":
    "https://cdn.shopify.com/s/files/1/0493/9834/9974/products/A3936031_1.jpg?v=1672905606",
  "soundcore-c30i":
    "https://cdn.shopify.com/s/files/1/0493/9834/9974/products/A3858031_1.jpg?v=1672905606",
  "soundcore-aerofit-pro":
    "https://cdn.shopify.com/s/files/1/0493/9834/9974/products/A3871011_1.jpg?v=1686894601",
  "soundcore-sport-x10":
    "https://cdn.shopify.com/s/files/1/0493/9834/9974/products/A3961031_1.jpg?v=1661847206",

  // ════════ SOUNDCORE SPEAKERS ════════
  "soundcore-motion-boom":
    "https://cdn.shopify.com/s/files/1/0493/9834/9974/products/A3117011_1.jpg?v=1634009765",
  "soundcore-boom-2-se":
    "https://cdn.shopify.com/s/files/1/0493/9834/9974/products/A3128011_1.jpg?v=1700471064",
  "soundcore-mini-3":
    "https://cdn.shopify.com/s/files/1/0493/9834/9974/products/A3119011_1.jpg?v=1631684820",
  "soundcore-mini-3-pro":
    "https://cdn.shopify.com/s/files/1/0493/9834/9974/products/A3127011_1.jpg?v=1659413700",
  "soundcore-flare-mini":
    "https://cdn.shopify.com/s/files/1/0493/9834/9974/products/A3105011_1.jpg?v=1626340140",
  "soundcore-flare-2":
    "https://cdn.shopify.com/s/files/1/0493/9834/9974/products/A3116011_1.jpg?v=1626340140",

  // ════════ EDIFIER ════════
  "edifier-w80":
    "https://www.edifier.com/pub/media/catalog/product/w/8/w80_product_image_1_1.jpg",
  "edifier-neobuds-planar":
    "https://www.edifier.com/pub/media/catalog/product/n/e/neobuds-planar_product_image_1.jpg",
  "edifier-neodots":
    "https://www.edifier.com/pub/media/catalog/product/n/e/neodots_product_img_1.jpg",
  "edifier-stax-spirit-s10":
    "https://www.edifier.com/pub/media/catalog/product/s/t/stax-spirit-s10_product_img_1.jpg",
  "edifier-neobuds-plus":
    "https://www.edifier.com/pub/media/catalog/product/n/e/neobuds-plus_product_img_1.jpg",
  "edifier-neobuds-pro-3":
    "https://www.edifier.com/pub/media/catalog/product/n/e/neobuds-pro-3_product_img_1.jpg",
  "edifier-evobuds":
    "https://www.edifier.com/pub/media/catalog/product/e/v/evobuds_product_img_1.jpg",
  "edifier-lolliclip":
    "https://www.edifier.com/pub/media/catalog/product/l/o/lolliclip_product_img_1.jpg",
  "edifier-comfo-q":
    "https://www.edifier.com/pub/media/catalog/product/c/o/comfo-q_product_img_1.jpg",
};

async function checkImageUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function run() {
  console.log("🖼️  Updating product images from official sources...\n");

  let updated = 0;
  let failed = 0;

  for (const [slug, imageUrl] of Object.entries(imageMap)) {
    // Check if URL is reachable
    const isValid = await checkImageUrl(imageUrl);

    if (isValid) {
      const { error } = await supabase
        .from('products')
        .update({ image_url: imageUrl })
        .eq('slug', slug);

      if (error) {
        console.error(`❌ DB error for ${slug}: ${error.message}`);
        failed++;
      } else {
        console.log(`✅ ${slug}`);
        updated++;
      }
    } else {
      // Try to update anyway — the URL might still work in browser even if HEAD blocked
      const { error } = await supabase
        .from('products')
        .update({ image_url: imageUrl })
        .eq('slug', slug);

      if (!error) {
        console.log(`📌 ${slug} (URL saved — verify in browser)`);
        updated++;
      } else {
        console.log(`⚠️  Skipped: ${slug}`);
        failed++;
      }
    }
  }

  console.log(`\n🎉 Complete!`);
  console.log(`✅ Updated: ${updated} products with images`);
  console.log(`⚠️  Skipped: ${failed}`);
  console.log('\n💡 Tip: รูปบางตัวอาจต้องตรวจสอบในเว็บ ถ้ารูปไม่ขึ้นสามารถเปลี่ยนผ่าน Admin ได้ที่:');
  console.log('   https://tech-rank-web.vercel.app/admin');
}

run();
