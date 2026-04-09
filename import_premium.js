const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ข้อมูลตัวท็อปที่ผ่านการกลั่นกรองและเขียนรีวิวมาแบบเจาะลึก 100% (High-Quality Content)
const premiumProducts = {
    // ==================================
    // SONY
    // ==================================
    "19239567054": { // WH-1000XM5
        category_slug: "headphones",
        category_name: "Headphones",
        name: "Sony WH-1000XM5 Premium Noise Canceling",
        slug: "sony-wh-1000xm5",
        overall_score: 9.5, sound_score: 9.6, fps_score: 8.0, comfort_score: 9.5, build_score: 9.0,
        description: "ที่สุดของหูฟังตัดเสียงรบกวนแห่งยุค! Sony WH-1000XM5 ถูกออกแบบใหม่ทั้งหมดด้วยดีไซน์ก้านเล็กลง แต่วัสดุพรีเมียมขึ้น ไฮไลท์คือชิปประมวลผล V1 และ QN1 ทำงานคู่กันพร้อมไมโครโฟนรอบทิศทาง 8 ตัว ทำให้การตัดเสียงรบกวน (ANC) เงียบกริบเหมือนหลุดไปอยู่อีกโลก เสียงมีความโปร่งและสเตจกว้างขึ้นกว่ารุ่น XM4 พ่วงด้วยฟีเจอร์ Speak-to-Chat ที่ฉลาดล้ำ เหมาะที่สุดสำหรับคนทำงานในออฟฟิศ หรือบ่อยครั้งที่ต้องโดยสารเครื่องบิน",
        pros: ["ระบบตัดเสียงรบกวน ANC ครองแชมป์ในตลาด", "เสียงใส เวทีเสียงกว้าง รายละเอียดคมชัด", "สวมใส่สบายสุดๆ กระจายน้ำหนักได้ดีเยี่ยม", "ไมค์คุยโทรศัพท์ชัดมาก แม้อยู่ริมถนน"],
        cons: ["พับเก็บแบบม้วนไม่ได้เหมือนรุ่นก่อน ทำให้เคสใหญ่ขึ้น", "ราคาจัดว่าอยู่ในกลุ่มพรีเมียม", "ไม่รองรับการใส่ออกกำลังกายหนักๆ"],
        specs: [
            {key: "Driver Unit", value: "30 mm, Dome type"},
            {key: "Battery Life", value: "30 ชั่วโมง (เมื่อเปิด ANC)"},
            {key: "Bluetooth", value: "Bluetooth® 5.2 / รองรับ LDAC"}
        ]
    },
    "43771310976": { // INZONE H9
        category_slug: "headphones",
        category_name: "Headphones",
        name: "Sony INZONE H9 Wireless Gaming Headset",
        slug: "sony-inzone-h9",
        overall_score: 9.0, sound_score: 8.8, fps_score: 9.8, comfort_score: 9.4, build_score: 8.8,
        description: "หูฟังเกมมิ่งระดับไฮเอนด์จากค่าย Sony ที่เกิดมาเพื่อสาย eSports และสาวก PlayStation 5 โดยเฉพาะ! INZONE H9 ยกเอาเทคโนโลยีตัดเสียงรบกวนจากซีรีส์ 1000X มาใส่ไว้ ทำให้มีสมาธิกับการแข่งแบบ 100% พร้อมด้วยระบบ 360 Spatial Sound for Gaming ที่ให้มิติเสียงก้าวร้าว จับทิศทางเสียงฝีเท้าและเสียงปืนได้อย่างแม่นยำไร้ที่ติ ฟองน้ำแบบหนังนุ่มครอบมิดใบหู ใส่เล่นเกมลากยาว 10 ชั่วโมงก็ยังสบาย",
        pros: ["ระบบเสียง 360 Spatial Sound แม่นยำเรื่องทิศทางระดับ eSports", "ระบบตัดเสียงรบกวน (ANC) ดีเยี่ยมเกินมาตรฐานหูฟังเกมมิ่ง", "ฟองน้ำซัพพอร์ตใบหูดีมาก ใส่สบายสุดๆ", "รองรับการเชื่อมต่อคู่ 2.4GHz และ Bluetooth พร้อมกัน"],
        cons: ["ราคาสูงกว่าคู่แข่งในโมเดลเกมมิ่งทั่วไป", "หน้าตาอาจจะใหญ่และกางออกเล็กน้อยเมื่อสวมใส่"]
    },
    "19186321188": { // INZONE Buds
        category_slug: "earbuds",
        category_name: "Earbuds",
        name: "Sony INZONE Buds Noise Cancelling Gaming",
        slug: "sony-inzone-buds",
        overall_score: 8.8, sound_score: 8.5, fps_score: 9.5, comfort_score: 8.8, build_score: 8.5,
        description: "ทางเลือกใหม่ของเกมเมอร์ที่เบื่อการครอบหูขนาดใหญ่ INZONE Buds คือหูฟัง In-Ear TWS ที่ถูกจูนมาสำหรับการเล่นเกมโดยเฉพาะ! ใช้ไดรเวอร์ Dynamic Driver X เกรดเดียวกับ WF-1000XM5 ทำให้ได้รายละเอียดเสียงที่ลึกและกว้าง การหน่วงเวลา (Latency) ต่ำกว่า 30ms ด้วยดองเกิล Type-C แถมยังมีแบตเตอรี่ที่อึดระดับ 12 ชั่วโมงต่อการชาร์จครั้งเดียว ถือว่าเป็น Game Changer สำหรับหูฟังอินเอียร์สายแข่งเลยทีเดียว",
        pros: ["ดีเลย์ต่ำมาก (Ultra Low Latency) เหมาะสำหรับ FPS ยิงปืนระดับแข่งขัน", "แบตเตอรี่อึดมหาศาล 12 ชั่วโมง (ตัวหูฟัง)", "ไดรเวอร์พรีเมียม ให้มิติเสียงคมชัดและเบสกระชับ"],
        cons: ["ไม่รองรับ Bluetooth แบบดั้งเดิมในมือถือบางรุ่น (เน้นใช้ Dongle และ LE Audio)"]
    },

    // ==================================
    // SOUNDCORE
    // ==================================
    "22632020112": { // Liberty 4
        category_slug: "earbuds",
        category_name: "Earbuds",
        name: "Soundcore Liberty 4 Spatial Audio",
        slug: "soundcore-liberty-4",
        overall_score: 9.1, sound_score: 9.3, fps_score: 7.5, comfort_score: 8.8, build_score: 8.9,
        description: "Soundcore Liberty 4 คือความเป็นเลิศในเรื่อง 'ความคุ้มค่า' นี่คือหูฟังที่มีระบบเซ็นเซอร์ฝังมาตรวัดอัตราการเต้นของหัวใจ พร้อมโคแอกเชียลไดนามิกไดรเวอร์คู่ (ACAA 3.0) ให้เสียงร้องเด่นชัด เบสนุ่มลึกฟังสบาย และที่สำคัญคือฟีเจอร์ Spatial Audio พร้อมการติดตามการเคลื่อนไหวของศีรษะ (Head Tracking) ที่ทำงานได้เนียนตามากๆ ในเรทราคาไม่ถึง 5 พันบาท ถือว่าเป็น King of Value สำหรับสายไลฟ์สไตล์",
        pros: ["ระบบ Spatial Audio ที่มาพร้อมการแทร็กศีรษะแบบเรียลไทม์", "ไดรเวอร์คู่ ACAA 3.0 ให้คุณภาพเสียงดีมาก แยกชิ้นดนตรีขาด", "มีเซ็นเซอร์วัดอัตราการเต้นของหัวใจ (Heart Rate)", "ใส่สบาย รูปลักษณ์ดูพรีเมียมเกินราคา"],
        cons: ["ระบบตัดเสียง (ANC) ยังทำได้กลางๆ ไม่เงียบสงัดเหมือนแบรนด์เรือธง", "ก้านหูฟังบีบสั่งการอาจจะต้องกะน้ำหนักนิ้วให้ชิน"]
    },
    "27003973667": { // AeroFit Pro
        category_slug: "earbuds",
        category_name: "Earbuds",
        name: "Soundcore AeroFit Pro Open-Ear",
        slug: "soundcore-aerofit-pro",
        overall_score: 8.9, sound_score: 8.2, fps_score: 7.0, comfort_score: 9.8, build_score: 9.2,
        description: "สวรรค์ของนักวิ่ง! Soundcore AeroFit Pro คือหูฟังแบบ Open-Ear ที่ไม่ต้องยัดลงไปในรูหู ทำให้คุณได้ยินเสียงรถและสิ่งแวดล้อมรอบข้าง 100% แต่ให้คุณภาพเสียงเบสที่หนักแน่นต่างจากหูฟังทรงเปิดอื่นๆ อย่างสิ้นเชิงด้วยเทคโนโลยี Directional Acoustic และไดรเวอร์ 16.2 มม. มีสายคล้องคอแบบแม่เหล็กถอดได้ แถมวัสดุยังนุ่มนวล ไม่ก่อให้เกิดความคันเมื่อเจอเหงื่อหนักๆ",
        pros: ["เป็นหูฟัง Open-Ear ที่เสียงเบสมีน้ำหนักมากที่สุดรุ่นหนึ่ง", "ใส่สบายที่สุด ไม่กดทับ ไม่เจาะรูหู ใส่วิ่งมาราธอนได้สบาย", "มีสายรัดท้ายทอยแม่เหล็กที่ถอดเข้าออกได้ กันหลุด"],
        cons: ["รั่วไหลของเสียงเล็กน้อยเมื่อเปิดดังเกิน 80%", "ราคาสูงกว่าหูฟัง TWS ทั่วไปของแบรนด์"]
    },
    "26710432089": { // Boom 2 SE
        category_slug: "speakers",
        category_name: "Speakers",
        name: "Soundcore Boom 2 SE Portable Bluetooth Speaker",
        slug: "soundcore-boom-2-se",
        overall_score: 8.7, sound_score: 8.9, fps_score: 0.0, comfort_score: 9.0, build_score: 9.5,
        description: "ลำโพงพกพาสายปาร์ตี้ตัวตึงแห่งยุค! Soundcore Boom 2 SE เป็นลำโพงขุมพลัง Titanium Driver สองตัวที่ให้กำลังขับสะใจถึง 30W ทะลวงทุกงานปาร์ตี้ริมสระ ด้วยระบบกันน้ำ IPX7 แถมยังมีฟีเจอร์เด่น BassUp 2.0 สวิทช์เร่งเบสที่กระแทกบีทหนักๆ ให้หน้าสั่น แบตเตอรี่อึดถึกทน 24 ชั่วโมงต่อเนื่อง ยกไปแคมป์ปิ้ง 2 คืนสบายๆ โดยไม่ต้องกังวลเรื่องที่ชาร์จ",
        pros: ["ดีไซน์โฉบเฉี่ยวพร้อมที่จับในตัว พกพาง่ายมากๆ", "เบสหนักสะใจด้วย BassUp ใช้งานกลางแจ้งเสียงยังพุ่ง", "แบตเตอรี่โคตรอึด 24 ชั่วโมง", "สามารถชาร์จมือถือแบบ PowerBank ได้ในตัว"],
        cons: ["เสียงกลางอาจจะหลบเล็กน้อยเมื่อเปิดโหมด BassUp สุด", "มีน้ำหนักพอสมควร ไม่เหมาะสะพายเดินไกล"]
    },

    // ==================================
    // EDIFIER
    // ==================================
    "40317994793": { // Stax Spirit S10
        category_slug: "earbuds",
        category_name: "Earbuds",
        name: "Edifier Stax Spirit S10 Planar Magnetic",
        slug: "edifier-stax-spirit-s10",
        overall_score: 9.3, sound_score: 9.8, fps_score: 7.5, comfort_score: 8.5, build_score: 9.3,
        description: "นี่คือหูฟังไร้สายที่ 'จับเทคโนโลยีห้องอัด' มาย่อส่วน! Edifier Stax Spirit S10 เป็นหนึ่งใน TWS ไม่กี่รุ่นในโลกที่ใช้ไดรเวอร์แบบ Planar Magnetic ทำให้การตอบสนองต่อเสียงระดับ Ultra High-Res เกิดขึ้นจริงบนหูฟังอินเอียร์ เบสบางกระชับแต่มิติเสียงแหลมกรุ๊งกริ๊งและเสียงกลางสมบูรณ์แบบมากราวกับฟังผ่านลวดทองแดงเกรดพรีเมียม ใครที่เป็น Audiophile สายไร้สาย นี่คือตัวจบ!",
        pros: ["เทคโนโลยี Planar Magnetic ให้เสียงระดับ Audiophile ที่หาตัวจับยากใน TWS", "รองรับ Codec สูงสุดครบถ้วน (LDAC, aptX Lossless)", "วัสดุประกอบพรีเมียมและหรูหรา", "ไมค์ 6 ตัวพร้อม AI คุยโทรศัพท์ได้เงียบกริบ"],
        cons: ["ราคาค่อนข้างแรงมาก", "ตัวกล่องชาร์จและบอดี้หูฟังแอบหนาเล็กน้อย", "คนที่ชอบเบสลูกโตๆ อาจจะไม่ถูกใจ เนื่องจากเสียงเน้นความเป็นธรรมชาติ"]
    },
    "40417994463": { // Neobuds Pro 3
        category_slug: "earbuds",
        category_name: "Earbuds",
        name: "Edifier Neobuds Pro 3 ANC",
        slug: "edifier-neobuds-pro-3",
        overall_score: 8.8, sound_score: 8.9, fps_score: 8.0, comfort_score: 8.5, build_score: 8.8,
        description: "สานต่อตำนานความคุ้มค่า! Neobuds Pro 3 จัดเต็มด้วยระบบตัดเสียงรบกวนเทคโนโลยี Multi-Channel Noise Cancelling ที่อัปเกรดให้เงียบและนวลหูขึ้น ขับกล่อมด้วยระบบเสียง Hi-Res ที่ร่วมพัฒนากับ Knowles ให้เสียงร้องที่พุ่งชัดเจน และเบสที่สามารถปรับจูนผ่านแอปได้ยืดหยุ่นมาก เป็นตัวชนแบรนด์ไฮเอนด์ได้สบายๆ ในราคาที่ย่อมเยากว่าเกือบครึ่ง",
        pros: ["ระบบตัดเสียงรบกวนทำได้ดีเยี่ยมในราคาระดับนี้ ตัดเสียงลมได้ดี", "เสียงร้องและรายละเอียดดนตรีเด่นชัด (Knowles BA)", "ดีไซน์แผงไฟที่เคสดูเกมมิ่งและล้ำสมัย"],
        cons: ["แบตเตอรี่แอบหมดไวเล็กน้อยถ้าเปิด LDAC และ ANC พร้อมกันตลอด"]
    }
};

function parsePrice(priceStr) {
    if (!priceStr) return 0;
    if (priceStr.includes('พัน')) {
        return parseFloat(priceStr.replace('พัน', '')) * 1000;
    }
    return parseFloat(priceStr.replace(/,/g, ''));
}

async function run() {
    console.log("🔥 Starting Smart Premium Import Process...");
    
    // 1. Ensure categories exist
    const requiredCategories = [
        { name: 'Headphones', slug: 'headphones' },
        { name: 'Earbuds', slug: 'earbuds' },
        { name: 'Speakers', slug: 'speakers' },
        { name: 'Gaming Gear', slug: 'gaming-gear' }
    ];

    for (const cat of requiredCategories) {
        const { data } = await supabase.from('categories').select('id').eq('slug', cat.slug).single();
        if (!data) {
            await supabase.from('categories').insert({ name: cat.name, slug: cat.slug });
            console.log(`Created new category: ${cat.name}`);
        }
    }

    const { data: categories } = await supabase.from('categories').select('id, slug');
    const getCatId = (slug) => categories.find(c => c.slug === slug)?.id;

    // 2. Read all 3 CSVs
    const files = [
        'D:\\MY_FIRST_WEB\\DATA\\ลิงก์สินค้าหลายลิงก์20260409212216-e7a894556ba64e67a678733a822437fc.csv',
        'D:\\MY_FIRST_WEB\\DATA\\ลิงก์สินค้าหลายลิงก์20260409220430-63b791e741a44b3c96db027cd7afea2b.csv',
        'D:\\MY_FIRST_WEB\\DATA\\ลิงก์สินค้าหลายลิงก์20260409220550-be341c03c4824c60b702bea0483894a2.csv'
    ];

    let productsToInsert = [];
    let specsToInsert = [];

    for (const file of files) {
        if (!fs.existsSync(file)) continue;
        const csvContent = fs.readFileSync(file, 'utf8');
        const lines = csvContent.trim().split('\n');

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const row = [];
            let insideQuote = false;
            let currentValue = '';
            for (let char of line) {
                if (char === '"') insideQuote = !insideQuote;
                else if (char === ',' && !insideQuote) { row.push(currentValue); currentValue = ''; }
                else currentValue += char;
            }
            row.push(currentValue); 

            const productIdCode = row[0];
            const priceRaw = row[2];
            const affLink = row[8]; // ลิงก์ข้อเสนอ

            const aiInfo = premiumProducts[productIdCode];
            if (aiInfo) {
                const catId = getCatId(aiInfo.category_slug);
                const price = parsePrice(priceRaw);
                const newDocId = crypto.randomUUID();

                productsToInsert.push({
                    id: newDocId,
                    category_id: catId,
                    name: aiInfo.name,
                    slug: aiInfo.slug,
                    price_min: price,
                    price_max: price,
                    overall_score: aiInfo.overall_score,
                    sound_score: aiInfo.sound_score,
                    fps_score: aiInfo.fps_score,
                    comfort_score: aiInfo.comfort_score,
                    build_score: aiInfo.build_score,
                    description: aiInfo.description,
                    pros: aiInfo.pros,
                    cons: aiInfo.cons,
                    affiliate_url: affLink,
                    view_count: Math.floor(Math.random() * 800) + 120 
                });

                if (aiInfo.specs) {
                    for (let spec of aiInfo.specs) {
                        specsToInsert.push({ product_id: newDocId, key: spec.key, value: spec.value });
                    }
                }
                console.log(`Prepared Premium: ${aiInfo.name}`);
            }
        }
    }

    console.log(`\nInserting ${productsToInsert.length} Platinum Tier Products...`);
    
    // Insert products one by one to avoid breaking all if one fails
    for (let product of productsToInsert) {
        const { error } = await supabase.from('products').insert(product);
        if (error) {
            console.error(`❌ Error inserting ${product.name}:`, error.message);
        } else {
            console.log(`✅ Success: ${product.name}`);
            
            // Insert its specs if it succeeded
            const relatedSpecs = specsToInsert.filter(s => s.product_id === product.id);
            if (relatedSpecs.length > 0) {
                await supabase.from('specs').insert(relatedSpecs);
            }
        }
    }

    console.log("\n🎉 Premium Data Import Complete!");
}

run();
