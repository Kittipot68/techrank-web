// cleanup_data.js — Delete all old CSV products and add 5 sample products with real data
require('dotenv').config({ path: 'd:/MY_FIRST_WEB/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function main() {
    console.log("🗑️  Clearing all existing data...\n");

    // Delete specs first (foreign key)
    await supabase.from('specs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // Delete products
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log("✅ All old data cleared.\n");

    // Get categories
    const { data: cats } = await supabase.from('categories').select('id, slug');
    const catMap = {};
    cats.forEach(c => catMap[c.slug] = c.id);
    console.log("Categories:", Object.keys(catMap).join(', '));

    // 5 Sample products with REAL specs
    const sampleProducts = [
        {
            name: "Sony WH-1000XM5",
            slug: "sony-wh-1000xm5",
            category: "headphones",
            description: "Sony WH-1000XM5 เป็นหูฟังไร้สาย Over-ear ระดับพรีเมียมจาก Sony ที่ขึ้นชื่อเรื่องระบบตัดเสียงรบกวน (ANC) ที่ดีที่สุดในตลาด มาพร้อมไดร์เวอร์ 30mm ที่ออกแบบใหม่ ให้เสียงที่ใส คมชัด และเบสลึก รองรับ LDAC สำหรับเสียงคุณภาพสูง แบตเตอรี่ใช้ได้นาน 30 ชั่วโมง ชาร์จเร็ว 3 นาทีได้ 3 ชั่วโมง น้ำหนักเบา สวมใส่สบายตลอดทั้งวัน",
            price_min: 8990,
            price_max: 12990,
            overall_score: 9.2,
            sound_score: 9.5,
            fps_score: 7.0,
            comfort_score: 9.0,
            build_score: 8.8,
            image_url: "https://m.media-amazon.com/images/I/51aXvjzcukL._AC_SL1500_.jpg",
            affiliate_url: "",
            pros: ["ระบบตัดเสียงรบกวน ANC ดีที่สุดในตลาด", "คุณภาพเสียงยอดเยี่ยม รองรับ LDAC Hi-Res", "แบตเตอรี่ 30 ชม. ชาร์จเร็ว", "น้ำหนักเบา สวมใส่สบายมาก", "Multipoint เชื่อมต่อ 2 อุปกรณ์พร้อมกัน"],
            cons: ["ราคาสูง", "ไม่มีช่องเสียบ 3.5mm โดยตรง (ต้องใช้สายแปลง)", "ไม่พับเก็บได้ (แบบแบน)"],
            specs: [
                { key: "ประเภท", value: "Over-ear Wireless" },
                { key: "ไดร์เวอร์", value: "30mm" },
                { key: "การเชื่อมต่อ", value: "Bluetooth 5.2 + สาย 3.5mm" },
                { key: "ความถี่ตอบสนอง", value: "4Hz - 40kHz (LDAC)" },
                { key: "ตัดเสียงรบกวน", value: "Auto NC Optimizer + 8 ไมค์" },
                { key: "Codec", value: "SBC, AAC, LDAC" },
                { key: "แบตเตอรี่", value: "30 ชั่วโมง (ANC เปิด)" },
                { key: "ชาร์จเร็ว", value: "3 นาที = 3 ชม." },
                { key: "น้ำหนัก", value: "250g" },
                { key: "Multipoint", value: "รองรับ 2 อุปกรณ์" },
                { key: "แบรนด์", value: "Sony" },
            ]
        },
        {
            name: "JBL Tune 520BT",
            slug: "jbl-tune-520bt",
            category: "headphones",
            description: "JBL Tune 520BT หูฟังไร้สายราคาประหยัดจาก JBL ที่ให้เสียง JBL Pure Bass อันเป็นเอกลักษณ์ แบตเตอรี่ใช้ได้ยาวนาน 57 ชั่วโมง ชาร์จเร็ว 5 นาทีได้ 3 ชั่วโมง น้ำหนักเบา พับเก็บได้ เหมาะสำหรับใช้งานประจำวัน",
            price_min: 1290,
            price_max: 1690,
            overall_score: 7.8,
            sound_score: 7.5,
            fps_score: 6.0,
            comfort_score: 7.5,
            build_score: 7.0,
            image_url: "https://m.media-amazon.com/images/I/51pXSJ4X35L._AC_SL1500_.jpg",
            affiliate_url: "",
            pros: ["ราคาประหยัด คุ้มค่ามาก", "แบตเตอรี่ 57 ชม. อึดมาก", "เสียง JBL Pure Bass เบสหนัก", "พับเก็บได้ พกพาง่าย"],
            cons: ["ไม่มี ANC ตัดเสียงรบกวน", "วัสดุเป็นพลาสติกทั้งหมด", "ไม่รองรับ LDAC/aptX"],
            specs: [
                { key: "ประเภท", value: "On-ear Wireless" },
                { key: "ไดร์เวอร์", value: "33mm" },
                { key: "การเชื่อมต่อ", value: "Bluetooth 5.3" },
                { key: "ความถี่ตอบสนอง", value: "20Hz - 20kHz" },
                { key: "Codec", value: "SBC, AAC" },
                { key: "แบตเตอรี่", value: "57 ชั่วโมง" },
                { key: "ชาร์จเร็ว", value: "5 นาที = 3 ชม." },
                { key: "น้ำหนัก", value: "155g" },
                { key: "Multipoint", value: "รองรับ" },
                { key: "แบรนด์", value: "JBL" },
            ]
        },
        {
            name: "Soundcore Space A40",
            slug: "soundcore-space-a40",
            category: "headphones",
            description: "Soundcore Space A40 จาก Anker เป็นหูฟัง TWS ราคาไม่แพงที่มีระบบ ANC ที่ดีเยี่ยม ได้รับรางวัล Best Budget ANC Earbuds หลายรางวัล ไดร์เวอร์ 10mm ให้เสียงที่สมดุล รองรับ LDAC คุณภาพเสียง Hi-Res แบตเตอรี่รวมเคสใช้ได้ 50 ชั่วโมง",
            price_min: 1990,
            price_max: 2690,
            overall_score: 8.5,
            sound_score: 8.5,
            fps_score: 6.5,
            comfort_score: 8.0,
            build_score: 8.0,
            image_url: "https://m.media-amazon.com/images/I/51cB09R5lQL._AC_SL1500_.jpg",
            affiliate_url: "",
            pros: ["ANC ดีเยี่ยมในราคานี้", "รองรับ LDAC เสียง Hi-Res", "แบตเตอรี่ 50 ชม. (รวมเคส)", "กันน้ำ IPX4", "รองรับ Multipoint"],
            cons: ["ไมค์โทรศัพท์ไม่ค่อยดี", "ไม่มี Wireless Charging (รุ่นปกติ)", "แอป Soundcore ช้าในบางครั้ง"],
            specs: [
                { key: "ประเภท", value: "True Wireless (TWS)" },
                { key: "ไดร์เวอร์", value: "10mm Dynamic" },
                { key: "การเชื่อมต่อ", value: "Bluetooth 5.2" },
                { key: "Codec", value: "SBC, AAC, LDAC" },
                { key: "ตัดเสียงรบกวน", value: "Adaptive ANC" },
                { key: "แบตเตอรี่ (หูฟัง)", value: "10 ชั่วโมง" },
                { key: "แบตเตอรี่ (เคส)", value: "50 ชั่วโมง" },
                { key: "กันน้ำ", value: "IPX4" },
                { key: "น้ำหนัก", value: "4.9g (ต่อข้าง)" },
                { key: "แบรนด์", value: "Soundcore (Anker)" },
            ]
        },
        {
            name: "Logitech G Pro X Superlight 2",
            slug: "logitech-g-pro-x-superlight-2",
            category: "mice",
            description: "Logitech G Pro X Superlight 2 เมาส์เกมมิ่งไร้สายตัวท็อปจาก Logitech เซ็นเซอร์ HERO 2 ที่แม่นยำสูงสุด รองรับ Polling Rate 2000Hz ผ่าน POWERPLAY น้ำหนักเพียง 60g ดีไซน์สมมาตรเหมาะกับทุกแบบการจับ แบตเตอรี่ใช้ได้นาน 95 ชั่วโมง เมาส์ที่โปรเพลเยอร์เลือกใช้มากที่สุด",
            price_min: 3790,
            price_max: 4590,
            overall_score: 9.0,
            sound_score: null,
            fps_score: 9.8,
            comfort_score: 9.0,
            build_score: 8.5,
            image_url: "https://m.media-amazon.com/images/I/61mpMH5TzkL._AC_SL1500_.jpg",
            affiliate_url: "",
            pros: ["น้ำหนักเบาสุด 60g", "เซ็นเซอร์ HERO 2 แม่นยำสูง", "Polling Rate สูงสุด 2000Hz", "แบตเตอรี่ 95 ชม.", "สวิตช์ Lightforce ไฮบริด กดเบา ตอบสนองเร็ว"],
            cons: ["ราคาสูง", "ไม่มีไฟ RGB", "สวิตช์ซ้ายขวาอาจมีเสียง Creak เล็กน้อย", "ไม่มี Bluetooth"],
            specs: [
                { key: "ประเภท", value: "เมาส์เกมมิ่งไร้สาย" },
                { key: "เซ็นเซอร์", value: "HERO 2 (25K)" },
                { key: "DPI สูงสุด", value: "32,000 DPI" },
                { key: "Polling Rate", value: "2000Hz (POWERPLAY)" },
                { key: "การเชื่อมต่อ", value: "LIGHTSPEED Wireless" },
                { key: "สวิตช์", value: "Lightforce Hybrid" },
                { key: "จำนวนปุ่ม", value: "5 ปุ่ม" },
                { key: "แบตเตอรี่", value: "95 ชั่วโมง" },
                { key: "น้ำหนัก", value: "60g" },
                { key: "แบรนด์", value: "Logitech G" },
            ]
        },
        {
            name: "Keychron K2 V2",
            slug: "keychron-k2-v2",
            category: "keyboards",
            description: "Keychron K2 V2 คีย์บอร์ดเมคานิคอลไร้สายเลย์เอาท์ 75% ที่ได้รับความนิยมสูงสุด เชื่อมต่อได้ทั้ง Bluetooth และ USB-C รองรับทั้ง macOS และ Windows Hot-swap ได้ เปลี่ยนสวิตช์ตามใจชอบ Keycap PBT แบบ Double-shot ไฟ RGB 18 แบบ แบตเตอรี่ 4000mAh ใช้ได้นาน",
            price_min: 2490,
            price_max: 3190,
            overall_score: 8.3,
            sound_score: 7.5,
            fps_score: 7.5,
            comfort_score: 8.0,
            build_score: 8.5,
            image_url: "https://m.media-amazon.com/images/I/71gUMIoyd7L._AC_SL1500_.jpg",
            affiliate_url: "",
            pros: ["เชื่อมต่อ Bluetooth + USB-C", "Hot-swap เปลี่ยนสวิตช์ได้", "Keycap PBT Double-shot", "รองรับทั้ง Mac และ Windows", "แบตเตอรี่ 4000mAh"],
            cons: ["เสียงดังกว่าคีย์บอร์ดทั่วไป", "ค่อนข้างหนา ควรใช้ wrist rest", "ซอฟต์แวร์ VIA/QMK ตั้งค่ายากสำหรับมือใหม่"],
            specs: [
                { key: "ประเภท", value: "คีย์บอร์ดเมคานิคอล 75%" },
                { key: "สวิตช์", value: "Gateron G Pro (Red/Brown/Blue)" },
                { key: "เลย์เอาต์", value: "84 ปุ่ม (75%)" },
                { key: "การเชื่อมต่อ", value: "Bluetooth 5.1 / USB-C" },
                { key: "Keycap", value: "PBT Double-shot" },
                { key: "Hot-swap", value: "รองรับ" },
                { key: "ไฟ LED", value: "RGB 18 รูปแบบ" },
                { key: "แบตเตอรี่", value: "4000mAh" },
                { key: "ระบบปฏิบัติการ", value: "macOS / Windows / Linux" },
                { key: "แบรนด์", value: "Keychron" },
            ]
        },
    ];

    let totalInserted = 0;
    let totalSpecs = 0;

    for (const p of sampleProducts) {
        const catId = catMap[p.category];
        if (!catId) {
            console.log(`❌ Category "${p.category}" not found, skipping ${p.name}`);
            continue;
        }

        // Insert product
        const { data, error } = await supabase.from('products').insert([{
            name: p.name,
            slug: p.slug,
            category_id: catId,
            description: p.description,
            price_min: p.price_min,
            price_max: p.price_max,
            overall_score: p.overall_score,
            sound_score: p.sound_score,
            fps_score: p.fps_score,
            comfort_score: p.comfort_score,
            build_score: p.build_score,
            image_url: p.image_url,
            affiliate_url: p.affiliate_url,
            pros: p.pros,
            cons: p.cons,
        }]).select();

        if (error) {
            console.error(`❌ Error inserting ${p.name}:`, error.message);
            continue;
        }

        totalInserted++;
        console.log(`✅ ${p.name}`);

        // Insert specs
        if (data && data[0]) {
            const specRows = p.specs.map(s => ({
                product_id: data[0].id,
                key: s.key,
                value: s.value,
            }));
            const { error: specErr } = await supabase.from('specs').insert(specRows);
            if (specErr) console.error(`   ❌ Spec error:`, specErr.message);
            else {
                totalSpecs += specRows.length;
                console.log(`   📋 ${specRows.length} specs added`);
            }
        }
    }

    console.log(`\n🎉 Done! ${totalInserted} products, ${totalSpecs} specs`);
    console.log("เว็บไซต์พร้อมใช้งาน เริ่มคีย์ข้อมูลเพิ่มผ่านหน้า Admin ได้เลยครับ!");
}

main().catch(console.error);
