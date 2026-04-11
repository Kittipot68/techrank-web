const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// High-Precision Data Batch 1
const enrichments = [
  {
    name_hint: 'UNIQ Cyprus Ridge',
    affiliate_url: 'https://s.shopee.co.th/30jwpNsNLp',
    specs: [
      { key: 'Material', value: 'High-quality water-resistant neoprene' },
      { key: 'Padding', value: 'Triple-layered with plush interior' },
      { key: 'Protection', value: 'Internal shock-absorbing crash guard' },
      { key: 'Closure', value: 'Zinc alloy zip pulls with fold-and-lock' }
    ],
    score: 8.5,
    desc: 'ซองใส่แล็ปท็อปเกรดพรีเมียมจาก UNIQ ที่มาพร้อมการปกป้อง 3 ชั้น วัสดุ Neoprene กันน้ำ และขอบกันกระแทกด้านในเพื่อความปลอดภัยสูงสุด'
  },
  {
    name_hint: 'Razer Laptop Stand Chroma',
    affiliate_url: 'https://s.shopee.co.th/60NYP7hlIY',
    specs: [
      { key: 'Material', value: 'Anodized Aluminum' },
      { key: 'Connectivity', value: '4-Port USB-C Hub (incl. 100W PD)' },
      { key: 'Lighting', value: 'Razer Chroma RGB Underglow' },
      { key: 'Incline', value: 'Ergonomic 18-degree tilt' }
    ],
    score: 9.3,
    desc: 'แท่นวางแล็ปท็อปอลูมิเนียมระดับไฮเอนด์ที่มาพร้อม USB-C Hub ในตัวและไฟ Razer Chroma RGB เพิ่มความสวยงามและประสิทธิภาพในการทำงาน'
  },
  {
    name_hint: 'BenQ LTB01 Laptop Tray',
    affiliate_url: 'https://s.shopee.co.th/9AKaB7nGIF',
    specs: [
      { key: 'VESA Standard', value: '75 x 75 mm' },
      { key: 'Capacity', value: 'Up to 5 kg (11 lbs)' },
      { key: 'Compatibility', value: '12-inch to 17-inch laptops' },
      { key: 'Mechanism', value: 'Foldable with 130-degree opening' }
    ],
    score: 8.9,
    desc: 'ถาดวางแล็ปท็อปมาตรฐาน VESA จาก BenQ ออกแบบมาเพื่อติดตั้งกับขาตั้งจอ ช่วยประหยัดพื้นที่โต๊ะและปรับระดับสายตาได้ตามต้องการ'
  }
];

async function enrich() {
  console.log("🚀 Starting Hybrid Premium Enrichment...");

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
                console.log(`   📸 Image Found: ${imageUrl.substring(25, 50)}...`);
            }
        }

        // 3. Find Product in DB
        const { data: p } = await supabase
            .from('products')
            .select('id, name')
            .ilike('name', `%${item.name_hint}%`)
            .limit(1)
            .single();

        if (p) {
            console.log(`   📦 Updating DB: ${p.name}`);
            
            // Update Main Info
            await supabase.from('products').update({
                image_url: imageUrl || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853',
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
    // Safety delay
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log("\n🎯 Batch enrichment complete!");
}

enrich();
