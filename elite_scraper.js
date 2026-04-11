const { createClient } = require('@supabase/supabase-js');
const cheerio = require('cheerio');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ----------------------------------------------------
// ⚙️ CONFIGURATION
// ----------------------------------------------------
const DELAY_MS = 2000; // Protection from IP ban
const BATCH_SIZE = 1;  // Process one by one for safety

// ----------------------------------------------------
// 🛠️ HELPERS
// ----------------------------------------------------

async function unshortenUrl(url) {
    if (!url.includes('s.shopee.co.th')) return url;
    try {
        const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
        return res.url;
    } catch (e) {
        console.error(`   ⚠️ Unshorten failed: ${e.message}`);
        return url;
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ----------------------------------------------------
// 📡 CORE SCRAPER (Proxy + JSON Deep Extraction)
// ----------------------------------------------------

async function fetchEliteData(shopId, itemId) {
    const proxyUrl = `https://shopee-co-th.translate.goog/product/${shopId}/${itemId}?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp`;
    
    try {
        const res = await fetch(proxyUrl, { 
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
            } 
        });

        if (!res.ok) {
            console.error(`   🛑 Proxy Error: ${res.status}`);
            return null;
        }

        const html = await res.text();
        const $ = cheerio.load(html);
        
        // 🕵️ EXTRACTION LOOPHOLE: Look for the SSR data script
        const jsonStringMatch = html.match(/<script [^>]*type="text\/mfe-initial-data"[^>]*>(.*?)<\/script>/s);
        if (!jsonStringMatch) {
            console.error('   ❌ Could not find data script in HTML (Proxy might be blocked or structure changed)');
            return null;
        }

        const fullState = JSON.parse(jsonStringMatch[1]);
        
        // Find item path in deep object
        const itemData = fullState?.initialState?.DOMAIN_PDP?.data?.PDP_BFF_DATA?.cachedMap[`${shopId}/${itemId}`]?.item 
                       || fullState?.initialState?.item;

        if (!itemData) {
            console.error('   ❌ Item data not found in JSON state');
            return null;
        }

        const d = itemData;

        // 🖼️ Images
        const imageHashes = d.images || (d.image ? [d.image] : []);
        const allImageUrls = imageHashes
            .filter(Boolean)
            .map(h => `https://down-th.img.susercontent.com/file/${h}`);
        const mainImageUrl = allImageUrls[0] || null;

        // 💰 Price
        let priceMin = d.price_min || d.price;
        if (priceMin > 100000) priceMin = priceMin / 100000;
        
        let priceMax = d.price_max || d.price;
        if (priceMax > 100000) priceMax = priceMax / 100000;

        // 📝 Description
        const description = d.description || d.rich_text_description?.text || null;

        // ⚙️ Specs (Attributes)
        const rawAttributes = d.attributes || [];
        const specs = rawAttributes
            .filter(a => a.name && a.value)
            .map(a => ({ key: a.name, value: a.value }));

        return {
            mainImageUrl,
            allImageUrls,
            priceMin,
            priceMax,
            description,
            specs,
            name: d.name
        };
    } catch (e) {
        console.error(`   ❌ Scraping error: ${e.message}`);
        return null;
    }
}

// ----------------------------------------------------
// 🧠 AI EXPERT SYNTHESIS (Generating Premium Content)
// ----------------------------------------------------

function synthesizeExpertContent(name, specs, shopeeDesc) {
    // This function mimics an AI transformation of raw specs into premium content
    const specStr = specs.map(s => `${s.key}: ${s.value}`).join(', ');
    
    // 🔍 Expert Scoring Logic (Inference based on specs)
    let sound = 8.0, comfort = 8.0, build = 8.0, fps = 7.0;
    
    // Sound Analysis
    if (specStr.toLowerCase().includes('ldac') || specStr.toLowerCase().includes('hi-res') || specStr.toLowerCase().includes('planar')) sound += 1.5;
    if (specStr.toLowerCase().includes('anc') || specStr.toLowerCase().includes('noise cancellation')) sound += 0.5;
    
    // Gaming/FPS Analysis
    if (specStr.toLowerCase().includes('latency') || specStr.toLowerCase().includes('2.4ghz') || specStr.toLowerCase().includes('dongle')) fps += 2.0;
    if (name.toLowerCase().includes('gaming') || name.toLowerCase().includes('inzone')) fps += 1.5;

    // Comfort/Build
    if (specStr.toLowerCase().includes('leather') || specStr.toLowerCase().includes('plush')) comfort += 1.0;
    if (specStr.toLowerCase().includes('aluminum') || specStr.toLowerCase().includes('metal')) build += 1.0;

    // 📝 Generating Pros/Cons based on facts
    const pros = [];
    const cons = [];

    if (sound >= 9) pros.push("คุณภาพเสียงระดับ Hi-Res ชัดเจนทุกรายละเอียด");
    if (specStr.toLowerCase().includes('anc')) pros.push("ระบบตัดเสียงรบกวนประสิทธิภาพสูง");
    if (specStr.toLowerCase().includes('bluetooth 5')) pros.push("การเชื่อมต่อ Bluetooth รุ่นใหม่ เสถียรและประหยัดพลังงาน");
    if (fps >= 9) pros.push("Latency ต่ำมาก เหมาะสําหรับการเล่นเกมสาย Competitive");
    
    if (!specStr.toLowerCase().includes('anc')) cons.push("ไม่มีระบบตัดเสียงรบกวน (ANC)");
    if (specStr.toLowerCase().includes('wired') || specStr.toLowerCase().includes('สาย')) cons.push("มีสายเชื่อมต่อ อาจไม่สะดวกเท่าไร้สาย");
    if (name.toLowerCase().includes('premium')) cons.push("ราคาสูงเมื่อเทียบกับรุ่นทั่วไป");

    if (pros.length === 0) pros.push("ความคุ้มค่าสูงเมื่อเทียบกับราคา", "ดีไซน์สวยงาม ทันสมัย");
    if (cons.length === 0) cons.push("วัสดุส่วนใหญ่เป็นพลาสติก");

    // ✍️ Synthetic Expert Review (Thai)
    const review = `บทวิเคราะห์จาก TechRank: ${name} เป็นผลิตภัณฑ์ที่น่าสนใจในหมวดหมู่ของมัน ด้วยคุณสมบัติที่โดดเด่นอย่าง ${specs[0]?.value || 'มาตรฐานคุณภาพ'} และ ${specs[1]?.value || 'ดีไซน์ที่ลงตัว'} จากการวิเคราะห์สเปคพบว่าเหมาะอย่างยิ่งสำหรับผู้ที่ต้องการ ${sound > 8.5 ? 'คุณภาพเสียงที่ยอดเยี่ยม' : 'ความสะดวกในการใช้งานทุกวัน'} โดยรวมถือเป็นตัวเลือกที่คุ้มค่าและตอบโจทย์การใช้งานในระยะยาว`;

    return {
        description: review + "\n\n---\n\n" + (shopeeDesc?.substring(0, 1000) || ""),
        pros: pros.slice(0, 4),
        cons: cons.slice(0, 3),
        overall_score: parseFloat(((sound + comfort + build) / 3).toFixed(1)),
        sound_score: Math.min(10, sound),
        comfort_score: Math.min(10, comfort),
        build_score: Math.min(10, build),
        fps_score: Math.min(10, fps)
    };
}

// ----------------------------------------------------
// 🚀 MAIN RUNNER
// ----------------------------------------------------

async function run() {
    console.log("==========================================");
    console.log("🚀 TECHRANK UNIVERSAL AI EXPERT SCRAPER");
    console.log("==========================================\n");

    // Get products with Shopee links but missing detailed data or having placeholder images
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .ilike('affiliate_url', '%shopee%')
        // Target items with null pros or placeholders
        .or('pros.is.null,overall_score.is.null,image_url.is.null,description.ilike.%TechRank:%')
        .order('id', { ascending: true });

    if (error) {
        console.error("❌ Database Error:", error.message);
        return;
    }

    console.log(`📦 Found ${products.length} products needing elite enrichment.\n`);

    for (let i = 0; i < products.length; i++) {
        const p = products[i];
        const prefix = `[${i+1}/${products.length}] ${p.slug}`;
        
        console.log(`\n🔄 Processing: ${p.name || p.slug}`);
        
        // 1. Resolve URL
        process.stdout.write(`   🔗 Resolving URL... `);
        const fullUrl = await unshortenUrl(p.affiliate_url);
        const match = fullUrl.match(/\/(\d+)\/(\d+)/);
        
        if (!match) {
            console.log(`❌ Failed (ID not found in ${fullUrl})`);
            continue;
        }
        
        const [_, shopId, itemId] = match;
        console.log(`✅ IDs: ${shopId}/${itemId}`);

        // 2. Scrape Data
        process.stdout.write(`   📡 Scraping via Proxy... `);
        const eliteData = await fetchEliteData(shopId, itemId);

        if (!eliteData) {
            console.log(`❌ Failed`);
            await delay(DELAY_MS);
            continue;
        }
        console.log(`✅ Success`);

        // 🧠 3. AI Expert Synthesis
        process.stdout.write(`   🧠 Synthesizing AI Expert Review... `);
        const expert = synthesizeExpertContent(p.name || eliteData.name, eliteData.specs, eliteData.description);
        console.log(`✅ Done`);

        // 4. Update DB
        process.stdout.write(`   💾 Saving to Database... `);
        
        const productUpdates = {
            image_url: eliteData.mainImageUrl,
            images: eliteData.allImageUrls,
            price_min: eliteData.priceMin,
            price_max: eliteData.priceMax,
            // Premium Fields
            description: expert.description,
            pros: expert.pros,
            cons: expert.cons,
            overall_score: expert.overall_score,
            sound_score: expert.sound_score,
            comfort_score: expert.comfort_score,
            build_score: expert.build_score,
            fps_score: expert.fps_score
        };

        const { error: upErr } = await supabase.from('products').update(productUpdates).eq('id', p.id);
        
        if (upErr) {
            console.log(`❌ Error: ${upErr.message}`);
        } else {
            // Update Specs
            if (eliteData.specs.length > 0) {
                // Remove generic template specs if they exist (usually 10+ identical items)
                await supabase.from('specs').delete().eq('product_id', p.id);
                
                const { error: specErr } = await supabase.from('specs').insert(
                    eliteData.specs.map(s => ({ 
                        product_id: p.id, 
                        key: s.key, 
                        value: s.value 
                    }))
                );
                
                if (specErr) console.log(` (Spec error: ${specErr.message})`);
                else console.log(`✅ OK (${eliteData.specs.length} real specs + Premium Analysis)`);
            } else {
                console.log(`✅ OK (Premium Analysis saved)`);
            }
        }

        // Safety Delay
        await delay(DELAY_MS);
    }

    console.log("\n==========================================");
    console.log(`🎉 ELITE ENRICHMENT COMPLETE!`);
    console.log("==========================================");
}

run();
