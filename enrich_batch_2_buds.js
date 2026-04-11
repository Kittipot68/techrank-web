const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// High-Precision Data Batch 2: Xiaomi Buds
const enrichments = [
  {
    name_hint: 'Redmi Buds 6 Play',
    affiliate_url: 'https://s.shopee.co.th/8fOJZNyu9j',
    specs: [
      { key: 'Active Noise Cancellation', value: 'AI Noise Reduction for Calls' },
      { key: 'Battery Life', value: 'Up to 36 Hours (with Case)' },
      { key: 'Charging', value: '10 mins for 3 hours playback' },
      { key: 'Bluetooth', value: 'v5.4 stable connection' }
    ],
    score: 8.2,
    desc: 'หูฟังไร้สายรุ่นคุ้มค่าที่สุดจาก Redmi มาพร้อมแบตเตอรี่ที่ใช้งานได้ยาวนานถึง 36 ชั่วโมง และระบบ AI ช่วยตัดเสียงรบกวนระหว่างสนทนา'
  },
  {
    name_hint: 'Redmi Buds 5 Pro',
    affiliate_url: 'https://s.shopee.co.th/4LFKPRhSTX',
    specs: [
      { key: 'Active Noise Cancellation', value: 'Up to 52dB Ultra-wide band ANC' },
      { key: 'Audio Codec', value: 'LDAC Hi-Res Audio Wireless' },
      { key: 'Battery Life', value: 'Up to 38 Hours (with Case)' },
      { key: 'Sound System', value: 'Dual drivers (11mm + 10mm)' }
    ],
    score: 9.2,
    desc: 'หูฟังระดับแฟลกชิปที่มาพร้อมระบบตัดเสียงรบกวน 52dB และคุณภาพเสียงระดับ Hi-Res ด้วย LDAC เพื่อประสบการณ์การฟังที่พรีเมียมที่สุด'
  },
  {
    name_hint: 'Redmi Buds 6 Pro',
    affiliate_url: 'https://s.shopee.co.th/8V4tN4zXVl',
    specs: [
      { key: 'Noise Cancellation', value: 'Up to 55dB Adaptive ANC' },
      { key: 'Audio Tech', value: '360 Spatial Audio with Dynamic Head Tracking' },
      { key: 'Battery Life', value: 'Up to 38 Hours total' },
      { key: 'Connectivity', value: 'Dual-device smart connection' }
    ],
    score: 9.4,
    desc: 'รุ่นท็อปสุดที่เหนือกว่าด้วยระบบ Adaptive ANC 55dB และระบบเสียง Spatial Audio แบบ 360 องศา พร้อมการเชื่อมต่อหลายอุปกรณ์พร้อมกัน'
  },
  {
    name_hint: 'Redmi Buds 8 Active',
    affiliate_url: 'https://s.shopee.co.th/AUpxkmJyx9',
    specs: [
      { key: 'Design', value: 'Open-ear secure fit' },
      { key: 'Battery Life', value: 'Up to 37 Hours total playback' },
      { key: 'Driver', value: '12mm Dynamic Driver for Enhanced Bass' },
      { key: 'Latency', value: 'Low Latency Mode for Gaming' }
    ],
    score: 8.4,
    desc: 'หูฟังสำหรับสายแอคทีฟที่เน้นความสบายในการสวมใส่ พลังเสียงเบสที่แน่น และแบตเตอรี่ที่ใช้งานได้ข้ามวัน'
  }
];

async function enrich() {
  console.log("🚀 Starting Batch 2: Xiaomi Buds Premium Enrichment...");

  for (const item of enrichments) {
    try {
        console.log(`\n🔄 Processing: ${item.name_hint}`);
        
        // 1. Resolve Affiliate Link to get IDs
        let shopId, itemId;
        const res = await fetch(item.affiliate_url, { method: 'HEAD', redirect: 'follow' });
        const match = res.url.match(/\/(\d+)\/(\d+)/);
        
        let imageUrl = null;
        if (match) {
            shopId = match[1];
            itemId = match[2];
            console.log(`   🔗 Shopee IDs: ${shopId}/${itemId}`);

            // 2. Fetch Image via Loophole Proxy
            const proxyUrl = `https://shopee-co-th.translate.goog/product/${shopId}/${itemId}?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp`;
            const proxyRes = await fetch(proxyUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const html = await proxyRes.text();
            const imageMatch = html.match(/property="og:image" content="([^"]+)"/);
            if (imageMatch) {
                imageUrl = imageMatch[1];
                console.log(`   📸 Image Found: ${imageUrl.substring(25, 45)}...`);
            }
        }

        // 3. Find Product in DB with better matching
        const { data: p } = await supabase
            .from('products')
            .select('id, name')
            .or(`name.ilike.%${item.name_hint}%, name.ilike.%${item.name_hint.replace(' ', '%')}%`)
            .limit(1)
            .single();

        if (p) {
            console.log(`   📦 Updating DB: ${p.name}`);
            
            // Update Main Info
            await supabase.from('products').update({
                image_url: imageUrl,
                description: item.desc,
                overall_score: item.score
            }).eq('id', p.id);

            // Update Specs
            await supabase.from('specs').delete().eq('product_id', p.id);
            await supabase.from('specs').insert(
                item.specs.map(s => ({ product_id: p.id, key: s.key, value: s.value }))
            );
            console.log("   ✅ SUCCESS");
        } else {
            console.log("   ⚠️ Product not found in database.");
        }
    } catch (e) {
        console.log(`   ❌ Error: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log("\n🎯 Xiaomi Buds Batch Enrichment Complete!");
}

enrich();
