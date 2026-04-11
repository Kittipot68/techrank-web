const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// High-Precision Data Batch 5: Smart Cameras & Webcams
const enrichments = [
  {
    name_hint: 'Xiaomi Mi Smart Camera C500',
    affiliate_url: 'https://s.shopee.co.th/9UxQYuvjSo',
    specs: [
      { key: 'Resolution', value: '3.5K (6MP) Ultra-high definition' },
      { key: 'Night Vision', value: '940nm No-glow Infrared' },
      { key: 'Privacy', value: 'Physical lens shield' },
      { key: 'AI Features', value: 'Human/Pet detection & tracking' }
    ],
    score: 9.6,
    desc: 'กล้องวงจรปิดรุ่นท็อปซีรีส์ C ที่มาพร้อมความละเอียดสูงถึง 3.5K และระบบรักษาความเป้นส่วนตัวด้วยเลนส์ที่ซ่อนได้จริง'
  },
  {
    name_hint: 'Xiaomi Outdoor Camera CW500 Dual',
    affiliate_url: 'https://s.shopee.co.th/6L0On67mtV',
    specs: [
      { key: 'System', value: 'Dual Lens (Fixed + PTZ)' },
      { key: 'Resolution', value: '2.5K + 2.5K (8MP Total)' },
      { key: 'IP Rating', value: 'IP66 Waterproof & Dustproof' },
      { key: 'Connectivity', value: 'Wi-Fi 6 Dual-band support' }
    ],
    score: 9.5,
    desc: 'กล้องภายนอกระบบเลนส์คู่ที่ให้มุมมองกว้างพิเศษและซูมได้ในเวลาเดียวกัน พร้อมระบบกันน้ำมาตรฐาน IP66 สำหรับทุกสภาพอากาศ'
  },
  {
    name_hint: 'Xiaomi Outdoor Camera BW500',
    affiliate_url: 'https://s.shopee.co.th/16LFTxxFk',
    specs: [
      { key: 'Battery', value: '10,000mAh (Up to 180 days)' },
      { key: 'Resolution', value: '2.5K (2560x1440)' },
      { key: 'Night Vision', value: 'Full-color Smart Night Vision' },
      { key: 'Storage', value: 'Built-in 8GB eMMC' }
    ],
    score: 9.3,
    desc: 'กล้องไร้สาย 100% ที่มาพร้อมแบตเตอรี่มหาศาลและการมองเห็นภาพสีในตอนกลางคืน พร้อมหน่วยความจำในตัวเพื่อความปลอดภัย'
  },
  {
    name_hint: 'FANTECH WEBCAM LUMINOUS C30',
    affiliate_url: 'https://s.shopee.co.th/7VCMBw8BJ4',
    specs: [
      { key: 'Resolution', value: '2K Quad HD (2560x1440)' },
      { key: 'Field of View', value: '106-degree wide angle' },
      { key: 'Frame Rate', value: '25 fps' },
      { key: 'Mounting', value: '360-degree rotation & Tripod mount' }
    ],
    score: 8.8,
    desc: 'เว็บแคมคุณภาพสูงระดับ 2K สำหรับการสตรีมและประชุมงานที่ต้องการความคมชัดสูงในมุมมองที่กว้างกว่าปกติ'
  }
];

async function enrich() {
  console.log("🚀 Starting Batch 5: Smart Camera & Security Enrichment...");

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
        } catch(e) { console.log("   ⚠️ Proxy error."); }

        const { data: p } = await supabase
            .from('products')
            .select('id, name')
            .ilike('name', `%${item.name_hint}%`) // Match specific model hint
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
  console.log("\n🎯 Camera Enrichment Batch 5 Complete!");
}

enrich();
