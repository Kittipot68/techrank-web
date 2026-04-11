const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// High-Precision Data Batch 3: Gaming Gear
const enrichments = [
  {
    name_hint: 'Pulsar X2H',
    affiliate_url: 'https://s.shopee.co.th/8phjlmkIUM',
    specs: [
      { key: 'Sensor', value: 'PixArt PAW3395 (26,000 DPI)' },
      { key: 'Weight', value: 'Ultra-light ~54g' },
      { key: 'IPS / Acceleration', value: '650 IPS / 50g' },
      { key: 'Polling Rate', value: 'Up to 1,000Hz (4,000Hz compatible)' }
    ],
    score: 9.4,
    desc: 'เมาส์เกมมิ่งน้ำหนักเบาพิเศษทรง High Hump สำหรับชาว Claw Grip ที่มาพร้อมเซนเซอร์ PixArt PAW3395 ระดับท็อปและความประณีตในการผลิตสูงสุด'
  },
  {
    name_hint: 'Pulsar X2N CrazyLight',
    affiliate_url: 'https://s.shopee.co.th/7AZVmiqdrw',
    specs: [
      { key: 'Weight', value: 'Extreme Light 43g - 45g' },
      { key: 'Sensor', value: 'Pulsar XS-1 (32,000 DPI)' },
      { key: 'IPS', value: '750 IPS' },
      { key: 'Build', value: 'Ultra-durable lightweight shell' }
    ],
    score: 9.6,
    desc: 'นิยามใหม่ของความเบาด้วยรุ่น CrazyLight เพียง 43-45 กรัม พร้อมเซนเซอร์ XS-1 รุ่นล่าสุดที่แรงที่สุดในตลาดเพื่อการควบคุมที่ฉับไวที่สุด'
  },
  {
    name_hint: 'Logitech G502 Lightspeed',
    affiliate_url: 'https://s.shopee.co.th/9019y9BsGf',
    specs: [
      { key: 'Battery Life', value: 'Up to 60 Hours (RGB Off)' },
      { key: 'Sensor', value: 'HERO 25K Sensor' },
      { key: 'Wireless Tech', value: 'LightSpeed Wireless' },
      { key: 'Special', value: 'POWERPLAY Infinite Charging' }
    ],
    score: 9.2,
    desc: 'เมาส์เกมมิ่งไร้สายระดับตำนานที่มาพร้อมเซนเซอร์ HERO 25K และรองรับการชาร์จไร้สายขณะใช้งานเพื่อประสิทธิภาพที่ไร้ขีดจำกัด'
  },
  {
    name_hint: 'HyperX Pulsefire Haste 2',
    affiliate_url: 'https://s.shopee.co.th/6fdFBltYlm',
    specs: [
      { key: 'Polling Rate', value: 'Extreme 8,000Hz (Wired)' },
      { key: 'Sensor', value: 'HyperX 26K Sensor' },
      { key: 'Weight', value: 'Featherlight 52g' },
      { key: 'Switches', value: 'HyperX Custom Switches' }
    ],
    score: 9.1,
    desc: 'เมาส์รุ่นอัปเกรดที่มาพร้อมความเร็ว Polling Rate ถึง 8,000Hz และน้ำหนักที่เบาเพียง 52 กรัม ให้การตอบสนองที่ลื่นไหลไร้ที่ติ'
  },
  {
    name_hint: 'Logitech MX Mechanical',
    affiliate_url: 'https://s.shopee.co.th/3LMnDiPSnT',
    specs: [
      { key: 'Switches', value: 'Low-profile Tactile/Linear/Clicky' },
      { key: 'Battery', value: '15 Days (Backlit) / 10 Months (Off)' },
      { key: 'Connectivity', value: 'Bluetooth & Logi Bolt' },
      { key: 'Multi-Device', value: 'Easy-Switch up to 3 devices' }
    ],
    score: 9.5,
    desc: 'คีย์บอร์ดแมกคานิคอลไร้สายระดับมาสเตอร์สำหรับสายทำงานมือโปร มาพร้อมไฟอัจฉริยะและความเงียบที่ยอดเยี่ยม'
  }
];

async function enrich() {
  console.log("🚀 Starting Batch 3: High-Performance Gaming Gear...");

  for (const item of enrichments) {
    try {
        console.log(`\n🔄 Processing: ${item.name_hint}`);
        
        let shopId, itemId, imageUrl = null;
        try {
            const res = await fetch(item.affiliate_url, { method: 'HEAD', redirect: 'follow' });
            const match = res.url.match(/\/(\d+)\/(\d+)/);
            if (match) {
                shopId = match[1];
                itemId = match[2];
                const proxyUrl = `https://shopee-co-th.translate.goog/product/${shopId}/${itemId}?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp`;
                const proxyRes = await fetch(proxyUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                const html = await proxyRes.text();
                const imageMatch = html.match(/property="og:image" content="([^"]+)"/);
                if (imageMatch) imageUrl = imageMatch[1];
            }
        } catch(e) { console.log("   ⚠️ Proxy/Link error, using fallback image."); }

        const { data: p } = await supabase
            .from('products')
            .select('id, name')
            .ilike('name', `%${item.name_hint}%`)
            .limit(1)
            .single();

        if (p) {
            console.log(`   📦 Updating DB: ${p.name}`);
            await supabase.from('products').update({
                image_url: imageUrl,
                description: item.desc,
                overall_score: item.score
            }).eq('id', p.id);

            await supabase.from('specs').delete().eq('product_id', p.id);
            await supabase.from('specs').insert(
                item.specs.map(s => ({ product_id: p.id, key: s.key, value: s.value }))
            );
            console.log("   ✅ SUCCESS");
        }
    } catch (e) { console.log(`   ❌ Error: ${e.message}`); }
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log("\n🎯 Gaming Gear Batch Enrichment Complete!");
}

enrich();
