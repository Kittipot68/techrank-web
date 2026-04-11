const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// High-Precision Data Batch 4: Displays & TVs
const enrichments = [
  {
    name_hint: 'TCL Premium QD Mini LED TV 98 นิ้ว รุ่น 98T8D',
    affiliate_url: 'https://s.shopee.co.th/16LFuMAVo',
    specs: [
      { key: 'Screen Size', value: '98-inch QD-Mini LED' },
      { key: 'Refresh Rate', value: '144Hz VRR / 240Hz Game Accelerator' },
      { key: 'Resolution', value: '4K UHD (3840 x 2160)' },
      { key: 'Sound System', value: 'ONKYO 2.1 Speaker System (Dolby Atmos)' },
      { key: 'HDR', value: 'Dolby Vision IQ / HDR10+ / MEMC' }
    ],
    score: 9.7,
    desc: 'สมาร์ททีวีจอักษะรุ่นท็อปที่สุดจาก TCL ที่มาพร้อมเทคโนโลยี QD-Mini LED และอัตรารีเฟรช 144Hz ให้ประสบการณ์การรับชมภาพยนตร์และเล่นเกมระดับพรีเมียมสูงสุด'
  },
  {
    name_hint: 'TCL Premium QLED TV 85 นิ้ว รุ่น 85T8D',
    affiliate_url: 'https://s.shopee.co.th/10ysRkIMTy',
    specs: [
      { key: 'Panel Type', value: 'QLED (Quantum Dot)' },
      { key: 'Refresh Rate', value: '144Hz VRR' },
      { key: 'HDR', value: 'Dolby Vision / HDR10+' },
      { key: 'Audio', value: 'ONKYO Speakers with Dolby Atmos' }
    ],
    score: 9.3,
    desc: 'ทีวี QLED ขนาดใหญ่ 85 นิ้วที่ตอบโจทย์ทั้งความบันเทิงและการเล่นเกมด้วยภาพสีสันสดใสและความลื่นไหลระดับ 144Hz'
  },
  {
    name_hint: 'AOC AGON AG276QZD2/67',
    affiliate_url: 'https://s.shopee.co.th/8V4tNqTE2f',
    specs: [
      { key: 'Panel Type', value: '26.5" QD-OLED' },
      { key: 'Refresh Rate', value: '240Hz (Native) / 280Hz (OC)' },
      { key: 'Response Time', value: '0.03ms (GtG) Ultra-fast' },
      { key: 'Color Accuracy', value: '98% DCI-P3 / sRGB Mode' }
    ],
    score: 9.8,
    desc: 'เกมมิ่งมอนิเตอร์ระดับโปรที่ใช้แผงหน้าจอ QD-OLED ให้การตอบสนองที่ไวที่สุดในโลกเพียง 0.03ms และสีสันที่แม่นยำสูงระดับสตูดิโอ'
  },
  {
    name_hint: 'BenQ PD2706U',
    affiliate_url: 'https://s.shopee.co.th/4qBb1A3l4z',
    specs: [
      { key: 'Resolution', value: '27-inch 4K UHD' },
      { key: 'Color Gamut', value: '95% P3 / 100% sRGB' },
      { key: 'Mac-Ready', value: 'USB-C 90W / M-Book Mode' },
      { key: 'Certification', value: 'Pantone / Calman Verified' }
    ],
    score: 9.5,
    desc: 'จอมอนิเตอร์สำหรับดีไซเนอร์มืออาชีพที่ออกแบบมาเพื่อสาวก Mac โดยเฉพาะ มาพร้อมความแม่นยำของสีระดับสูงสุดและพอร์ตเชื่อมต่อ USB-C'
  }
];

async function enrich() {
  console.log("🚀 Starting Batch 4: Flagship Displays Enrichment...");

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
        } catch(e) { console.log("   ⚠️ Proxy/Link error."); }

        const { data: p } = await supabase
            .from('products')
            .select('id, name')
            .ilike('name', `%${item.name_hint.substring(0, 15)}%`)
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
  console.log("\n🎯 Display Enrichment Batch 4 Complete!");
}

enrich();
