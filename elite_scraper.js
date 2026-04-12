const { createClient } = require('@supabase/supabase-js');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ----------------------------------------------------
// ⚙️ CONFIGURATION
// ----------------------------------------------------
const DELAY_MS = 2000; // Protection from IP ban
const DATA_DIR = path.join(__dirname, 'DATA');

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

/**
 * Loads all Shopee IDs and Prices from CSV files in DATA/
 */
function loadPriceMap() {
    const priceMap = new Map();
    try {
        const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.csv'));
        files.forEach(file => {
            const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
            const lines = content.split('\n').slice(1); // Skip header
            lines.forEach(line => {
                const parts = line.split(',');
                if (parts.length >= 3) {
                    const id = parts[0].trim();
                    let price = parts[2].trim();
                    // Clean price (e.g., 1.1พัน -> 1100, 3.2พัน -> 3200)
                    if (price.includes('พัน')) {
                        price = parseFloat(price.replace('พัน', '')) * 1000;
                    } else if (price.includes('หมื่น')) {
                        price = parseFloat(price.replace('หมื่น', '')) * 10000;
                    } else {
                        price = parseFloat(price.replace(/[^0-9.]/g, ''));
                    }
                    if (id && !isNaN(price)) {
                        priceMap.set(id, price);
                    }
                }
            });
        });
        console.log(`📊 Loaded ${priceMap.size} unique product prices from CSVs.`);
    } catch (e) {
        console.error('❌ Error loading price map:', e.message);
    }
    return priceMap;
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
        
        const jsonStringMatch = html.match(/<script [^>]*type="text\/mfe-initial-data"[^>]*>(.*?)<\/script>/s);
        if (!jsonStringMatch) return null;

        const fullState = JSON.parse(jsonStringMatch[1]);
        const itemData = fullState?.initialState?.DOMAIN_PDP?.data?.PDP_BFF_DATA?.cachedMap[`${shopId}/${itemId}`]?.item 
                       || fullState?.initialState?.item;

        if (!itemData) return null;

        const d = itemData;

        // 🖼️ Images
        const imageHashes = d.images || (d.image ? [d.image] : []);
        const allImageUrls = imageHashes.filter(Boolean).map(h => `https://down-th.img.susercontent.com/file/${h}`);

        // 📝 Description (Raw text + Rich Text sections)
        let description = d.description || "";
        if (d.rich_text_description?.paragraph_list) {
            const richText = d.rich_text_description.paragraph_list
                .map(p => p.text || "")
                .filter(Boolean)
                .join("\n");
            if (richText.length > description.length) description = richText;
        }

        // ⚙️ Specs (Shopee Attributes)
        const rawAttributes = d.attributes || [];
        const specs = rawAttributes
            .filter(a => a.name && a.value && a.value !== '-')
            .map(a => ({ key: a.name, value: a.value }));

        return {
            mainImageUrl: allImageUrls[0] || null,
            allImageUrls,
            priceMin: d.price_min || d.price || null,
            priceMax: d.price_max || d.price || null,
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
// 🧠 AI EXPERT SYNTHESIS (Category-Aware + High Precision)
// ----------------------------------------------------

function synthesizeExpertContentV2(name, rawSpecs, shopeeDesc, category) {
    // 🏷️ Category Analysis
    const cat = category?.toLowerCase() || "";
    const isAudio = cat.includes('headphone') || cat.includes('speaker') || cat.includes('earphone');
    const isGaming = cat.includes('mouse') || cat.includes('keyboard') || cat.includes('headphone');
    const isHome = cat.includes('vac') || cat.includes('pet') || cat.includes('appliance');
    const isDisplay = cat.includes('monitor') || cat.includes('screen') || cat.includes('tv') || cat.includes('display');

    // 🔨 Extract Better Specs from Description Text
    const extractedSpecs = [...rawSpecs];
    if (shopeeDesc) {
        // Simple regex to find common spec patterns in text like "BT 5.3", "Battery 50h", etc.
        const patterns = [
            { key: "รุ่นแบรนด์", regex: /รุ่น\s*[:：]?\s*([A-Za-z0-9-]+)/i },
            { key: "แบตเตอรี่", regex: /แบตเตอรี่\s*[:：]?\s*([0-9]+\s*(?:mAh|ชม|ชั่วโมง|h))/i },
            { key: "บลูทูธ", regex: /Bluetooth\s*[:：]?\s*([0-9.]+)/i },
            { key: "ความละเอียด", regex: /(4K|8K|UHD|1080p|Full HD|QLED|OLED)/i },
            { key: "Refresh Rate", regex: /([0-9]+\s*(?:Hz|เฮิร์ตซ์))/i },
            { key: "ขนาดหน้าจอ", regex: /([0-9.]+\s*(?:นิ้ว|inch|"))/i },
            { key: "WiFi", regex: /(Wi-Fi\s*[0-9./a-z]+|Dual\s*Band)/i },
            { key: "ระบบปฏิบัติการ", regex: /(Google\s*TV|Android\s*TV|Tizen|webOS|Windows\s*[0-9]+|Android\s*[0-9]+|iOS\s*[0-9]+|macOS)/i },
            { key: "กำลังขับเสียง", regex: /([0-9]+\s*W)/i },
            { key: "พาเนล", regex: /(OLED|QD-Mini\s*LED|Mini\s*LED|QLED|IPS|VA|Retina|AMOLED)/i },
            { key: "Brightness", regex: /([0-9]+\s*nits)/i },
            { key: "Color Gamut", regex: /([0-9]+%\s*(?:DCI-P3|sRGB|NTSC))/i },
            { key: "น้ำหนัก", regex: /([0-9.]+\s*(?:kg|g|กรัม|กิโลกรัม))/i },
            { key: "ชิปประมวลผล", regex: /(AiPQ\s*Pro|A[0-9]+\s*Bionic|Snapdragon\s*[0-9a-z ]+|Intel\s*Core\s*[i0-9-]+|Apple\s*M[0-9]+|Ryzen\s*[0-9]+)/i },
            { key: "RAM", regex: /(RAM\s*[0-9]+\s*GB)/i },
            { key: "ความจุ Storage", regex: /(ROM|SSD|Storage)\s*([0-9]+\s*(?:GB|TB))/i },
            { key: "สวิตช์", regex: /(Blue|Red|Brown|Linear|Tactile|Optical|Mechanical)\s*Switch/i },
            { key: "DPI", regex: /([0-9,.]+\s*DPI)/i },
            { key: "การป้องกันน้ำ", regex: /(IP[0-9]+)/i },
        ];
        patterns.forEach(p => {
            const m = shopeeDesc.match(p.regex);
            if (m && !extractedSpecs.find(s => s.key === p.key)) {
                extractedSpecs.push({ key: p.key, value: m[1] });
            }
        });
    }

    // 🔍 Realistic Scoring Logic
    let sound = 8.0, comfort = 8.0, build = 8.0, fps = 7.0;
    const specStr = shopeeDesc + " " + extractedSpecs.map(s => s.value).join(" ");
    
    if (isAudio) {
        if (specStr.includes('ANC') || specStr.includes('Noise')) sound += 0.5;
        if (specStr.includes('LDAC') || specStr.includes('Hi-Res')) sound += 1.0;
    }
    if (isGaming || isDisplay) {
        if (specStr.includes('latency') || specStr.includes('2.4GHz') || specStr.includes('VRR')) fps += 2.0;
        if (specStr.includes('3395') || specStr.includes('144Hz') || specStr.includes('240Hz')) fps += 1.0;
    }

    // 📝 Pros & Cons (Category-Aware)
    const pros = [];
    const cons = [];

    if (isDisplay) {
        if (specStr.includes('4K')) pros.push("ความละเอียดระดับ 4K คมชัดสมจริง");
        if (specStr.includes('144Hz') || specStr.includes('Hz')) pros.push("Refresh Rate สูง เล่นเกมและดูหนังลื่นไหล");
        if (specStr.includes('Mini LED') || specStr.includes('QLED')) pros.push("เทคโนโลยีจอระดับพรีเมียม สีสันสดใส");
    } else if (isAudio) {
        if (sound >= 8.5) pros.push("คุณภาพเสียงระดับ Hi-Res คมชัด");
        if (specStr.includes('ANC')) pros.push("ตัดเสียงรบกวนได้เงียบสนิท");
    } else if (isHome) {
        if (specStr.includes('อัจฉริยะ') || specStr.includes('AI')) pros.push("รองรับระบบ AI และการควบคุมผ่านแอป");
        pros.push("ดีไซน์มินิมอล เข้ากับบ้านได้ง่าย");
    } else {
        pros.push("ความคุ้มค่าสูงเมื่อเทียบกับฟีเจอร์");
        pros.push("ดีไซน์ล้ำสมัย แข็งแรงทนทาน");
    }
    
    if (extractedSpecs.length > 5) pros.push("สเปคจัดเต็ม ครบเครื่องทุกการใช้งาน");

    if (isDisplay && (specStr.includes('ใหญ่') || specStr.includes('นิ้ว'))) {
        cons.push("ขนาดค่อนข้างใหญ่ ต้องใช้พื้นที่จัดวางมาก");
    }
    if (!specStr.includes('ประกัน') && !specStr.includes('Warranty')) cons.push("โปรดตรวจสอบเงื่อนไขการรับประกัน");
    if (isAudio && !specStr.includes('ANC')) cons.push("ไม่มีระบบตัดเสียงรบกวน");
    
    if (cons.length < 1) cons.push("วัสดุส่วนใหญ่เป็นพลาสติก");

    // ✍️ Synthetic Expert Review (Thai)
    const review = `บทวิเคราะห์จาก TechRank: ${name} รุ่นนี้ถือว่าเป็นตัวเลือกที่โดดเด่นในหมวด ${isDisplay ? 'จอภาพอัจฉริยะ' : cat} โดยเฉพาะเรื่องของ ${extractedSpecs.find(s => s.key.includes('ความละเอียด'))?.value || 'ประสิทธิภาพ'} ที่ทำออกมาได้มาตรฐานระพรีเมียม จากการวิเคราะห์สเปคพบว่าการออกแบบเน้นไปที่ ${isGaming || isDisplay ? 'คุณภาพการแสดงผลและการตอบสนอง' : 'ความสะดวกสบายในการใช้งานจริง'} สำหรับใครที่กำลังมองหา ${isDisplay ? 'ทีวีหรือจอมอนิเตอร์' : cat} ที่เน้น ${isDisplay ? 'สีสันและความคมชัด' : 'ความคุ้มค่า'} รุ่นนี้จะไม่ทำให้คุณผิดหวังแน่นอนครับ`;

    return {
        description: review + "\n\n---\n\n" + (shopeeDesc?.substring(0, 5000) || ""),
        pros: pros.slice(0, 4),
        cons: cons.slice(0, 3),
        scores: {
            overall: parseFloat(((sound + comfort + build) / 3).toFixed(1)),
            sound: Math.min(10, sound),
            comfort: Math.min(10, comfort),
            build: Math.min(10, build),
            fps: Math.min(10, fps)
        },
        specs: extractedSpecs.slice(0, 20)
    };
}

// ----------------------------------------------------
// 🚀 MAIN RUNNER
// ----------------------------------------------------

async function run() {
    console.log("==========================================");
    console.log("🚀 TECHRANK UNIVERSAL AI EXPERT SCRAPER v2");
    console.log("==========================================\n");

    const priceMap = loadPriceMap();

    const { data: products, error } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .ilike('affiliate_url', '%shopee%')
        // Target items with null prices, null pros or generic descriptions
        .or('price_min.is.null,pros.is.null,description.ilike.%TechRank:%')
        .order('id', { ascending: true });

    if (error) {
        console.error("❌ Database Error:", error.message);
        return;
    }

    console.log(`📦 Found ${products.length} products needing elite enrichment.\n`);

    for (let i = 0; i < products.length; i++) {
        const p = products[i];
        console.log(`\n🔄 [${i+1}/${products.length}] Processing: ${p.name}`);
        
        // 1. Extract Shopee ID
        const urlMatch = p.affiliate_url.match(/\/(\d+)\/(\d+)/);
        let shopId, itemId;
        if (urlMatch) {
            [_, shopId, itemId] = urlMatch;
        } else {
            const fullUrl = await unshortenUrl(p.affiliate_url);
            const m = fullUrl.match(/\/(\d+)\/(\d+)/);
            if (!m) { console.log(`   ❌ IDs not found`); continue; }
            [_, shopId, itemId] = m;
        }

        // 2. Scrape Data
        process.stdout.write(`   📡 Scraping via Proxy... `);
        const eliteData = await fetchEliteData(shopId, itemId);
        if (!eliteData) { console.log(`❌ Failed`); continue; }
        console.log(`✅ Success`);

        // 💰 Price Logic: Preferred order (Live SSR -> CSV Map -> Existing DB)
        let price = eliteData.priceMin || priceMap.get(itemId) || p.price_min;
        // Handle malformed prices from earlier runs or weird scaling
        if (price && price < 1000 && (p.name.includes('ทีวี') || p.name.includes('TV') || p.name.includes('นิ้ว'))) {
            // If it's a TV and price is < 1000, it's likely scaled wrong (e.g. 65.1 instead of 65100)
            const csvPrice = priceMap.get(itemId);
            if (csvPrice && csvPrice > 1000) price = csvPrice;
        }
        
        // 🏗️ Improve Category Detection (Override if name contains strong keywords)
        let catSlug = p.categories?.slug;
        if (p.name.includes('ทีวี') || p.name.includes('TV')) catSlug = 'monitors'; // We'll map TVs to monitors/displays

        // 🧠 3. AI Expert Synthesis v2
        process.stdout.write(`   🧠 Synthesizing Expert Content... `);
        const expert = synthesizeExpertContentV2(p.name || eliteData.name, eliteData.specs, eliteData.description, catSlug);
        console.log(`✅ Done`);

        // 4. Update DB
        process.stdout.write(`   💾 Saving to Database... `);
        const updates = {
            image_url: eliteData.mainImageUrl || p.image_url,
            images: eliteData.allImageUrls.length > 0 ? eliteData.allImageUrls : p.images,
            price_min: price,
            price_max: eliteData.priceMax ? (eliteData.priceMax > 100000 ? eliteData.priceMax/100000 : eliteData.priceMax) : price,
            description: expert.description,
            pros: expert.pros,
            cons: expert.cons,
            overall_score: expert.scores.overall,
            sound_score: expert.scores.sound,
            comfort_score: expert.scores.comfort,
            build_score: expert.scores.build,
            fps_score: expert.scores.fps
        };

        const { error: upErr } = await supabase.from('products').update(updates).eq('id', p.id);
        
        if (upErr) {
            console.log(`❌ Error: ${upErr.message}`);
        } else {
            // Update Specs Table
            await supabase.from('specs').delete().eq('product_id', p.id);
            await supabase.from('specs').insert(
                expert.specs.map(s => ({ product_id: p.id, key: s.key, value: s.value }))
            );
            console.log(`✅ OK (${expert.specs.length} optimized specs)`);
        }

        await delay(DELAY_MS);
    }

    console.log("\n==========================================");
    console.log(`🎉 ELITE ENRICHMENT v2 COMPLETE!`);
    console.log("==========================================");
}

run();
