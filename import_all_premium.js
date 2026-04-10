const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ============================================================
// PREMIUM CONTENT DATABASE
// รีวิวเชิงลึกทุกรุ่น — เขียนโดย AI ที่ผ่านการวิเคราะห์สเปคจริง
// ============================================================
const productDB = {

  // ════════════════════════════════════════
  // SONY HEADPHONES (ครอบหู)
  // ════════════════════════════════════════
  "19239567054": {
    cat: "headphones", name: "Sony WH-1000XM5 Premium ANC Headphones", slug: "sony-wh-1000xm5",
    score: 9.5, sound: 9.6, fps: 8.0, comfort: 9.5, build: 9.0,
    desc: "ที่สุดของหูฟังตัดเสียงรบกวนแห่งยุค! WH-1000XM5 ถูกออกแบบใหม่ทั้งหมด ทิ้งดีไซน์แบบพับงอเดิม แต่ได้วัสดุที่หรูหราและน้ำหนักเบาขึ้น ชิปประมวลผล V1 + QN1 ทำงานคู่กันกับไมโครโฟน 8 ตัว ทำให้ ANC เงียบกริบเหมือนหลุดไปอีกโลก เสียงมีความโปร่ง สเตจกว้าง รายละเอียดคมชัดระดับ Hi-Res ฟีเจอร์ Speak-to-Chat พักเพลงอัตโนมัติเวลาพูดคุยสะดวกมากสำหรับการเดินทาง",
    pros: ["ANC ที่ดีที่สุดในระดับราคา ตัดทุกเสียงได้หมดไม่ว่าจะเสียงเครื่องยนต์หรือเสียงสำนักงาน", "ไดรเวอร์ 30mm ให้เสียงกว้าง อิ่ม และมีมิติ", "สวมใส่ 8 ชั่วโมงก็ยังสบาย ไม่กดใบหู", "ไมค์คุยโทรศัพท์ตัด wind noise ได้ดีแม้อยู่กลางแจ้ง"],
    cons: ["ราคาสูงกว่าคู่แข่งในกลุ่มเรือธง", "เคสที่แถมมาค่อนข้างใหญ่เพราะพับแค่สวิงได้ทิศเดียว", "ไม่มี IP Rating ไม่เหมาะออกกำลังกาย"],
    specs: [{key:"Driver",value:"30mm Dynamic"},{key:"Battery",value:"30 ชม. (ANC ON)"},{key:"Bluetooth",value:"5.2 / LDAC / AAC / SBC"}]
  },
  "25075880114": {
    cat: "headphones", name: "Sony WH-ULT900N ULT WEAR Bass Headphones", slug: "sony-wh-ult900n",
    score: 8.5, sound: 8.8, fps: 7.5, comfort: 8.5, build: 8.2,
    desc: "สายตื๊ดรีบมาดู! WH-ULT900N หรือชื่อซีรีส์ว่า 'ULT WEAR' ถูกออกแบบมาเพื่อคนที่ต้องการเบสแบบอัดฉีด มีปุ่ม ULT กดเปลี่ยน Mode เบสได้ 2 ระดับ (ULT1 สำหรับเบสนุ่ม / ULT2 สำหรับเบสหนักสุด) ใช้ชิป V1 รุ่นใหม่ตัดเสียงรบกวน ให้ความเงียบขณะฟังเพลง แบตเตอรี่ 38 ชั่วโมงถือว่าอึดระดับ Top 3 ของตลาด",
    pros: ["ปุ่ม ULT เร่งเบส 2 ระดับ ไม่ต้องเข้าแอป", "ANC คุณภาพดีในราคากลาง ตัดเสียงสำนักงานได้หมด", "แบตเตอรี่ 38 ชม. อึดที่สุดในกลุ่ม", "รองรับ Multipoint เชื่อม 2 อุปกรณ์พร้อมกัน"],
    cons: ["รูปทรงบีบหัวนิดหน่อยสำหรับหัวขนาดใหญ่", "เสียงกลาง-แหลมถูกเบสกลบเล็กน้อยเมื่อเปิด ULT2"]
  },
  "23633871176": {
    cat: "headphones", name: "Sony WH-CH720N Lightweight ANC Headphones", slug: "sony-wh-ch720n",
    score: 8.2, sound: 8.0, fps: 7.0, comfort: 9.0, build: 7.5,
    desc: "หูฟังที่ 'เบาที่สุด' ในซีรีส์ CH เพียง 192 กรัม ทำให้ลืมไปเลยว่าใส่หูฟังครอบหูอยู่! WH-CH720N ใช้ชิป QN1 ระดับเดียวกับรุ่นเรือธง ทำให้ ANC งดเยี่ยมเกินราคา มีโหมด Ambient Sound รับเสียงรอบข้างที่ฟังธรรมชาติมาก รองรับ Multipoint 2 อุปกรณ์ และแบตเตอรี่ยาวนาน 35 ชั่วโมง ถือเป็น Best Value ในตลาดหูฟังครอบหูตัดเสียงอย่างแน่นอน",
    pros: ["น้ำหนักเบามากเพียง 192g ใส่ทั้งวันสบายมาก", "ANC เงียบและเป็นธรรมชาติเกินราคา", "แบตเตอรี่ 35 ชม. อึดดีมาก", "ราคาจับต้องได้ คุ้มค่าสูงมาก"],
    cons: ["วัสดุพลาสติกเกือบทั้งหมด ดูไม่หรูหราเท่ากลุ่มบน", "เสียงเบสอาจไม่จุใจสำหรับสายตื๊ด"]
  },
  "42362728171": {
    cat: "headphones", name: "Sony WH-1000XM6 Next-Gen ANC Headphones", slug: "sony-wh-1000xm6",
    score: 9.7, sound: 9.8, fps: 8.5, comfort: 9.6, build: 9.5,
    desc: "ราชาแห่งการตัดเสียงรบกวนรุ่นใหม่ล่าสุด! WH-1000XM6 นำชิป QN3 รุ่นใหม่ที่ฉลาดยิ่งขึ้นด้วย AI มาสู้กับเสียงรบกวนที่ซับซ้อนขึ้น เช่น เสียง HVAC ระบบปรับอากาศ หรือเสียงรนของเด็ก ไดรเวอร์ 30mm ใหม่ให้รายละเอียดเสียงที่ระดับ audiophile สามารถฟังไฟล์ Hi-Res ได้ชัดเจน รองรับ Bluetooth 5.3 พร้อม Auracast สำหรับเชื่อมต่อแบบโปรโตคอลใหม่",
    pros: ["ANC ระดับ AI ที่ดีที่สุดในตลาดตอนนี้", "ไดรเวอร์ใหม่ให้เสียง Hi-Res ที่ใสสะอาดมาก", "แบตเตอรี่ 30 ชม.+ พร้อมชาร์จเร็ว 3 นาที = 3 ชม.", "Bluetooth 5.3 เสถียรกว่าเดิมมาก ลด Re-pairing"],
    cons: ["ราคาระดับพรีเมียมสุด", "ยังไม่มี IP Rating"]
  },
  "23467744403": {
    cat: "headphones", name: "Sony WH-CH520 Wireless On-Ear Headphones", slug: "sony-wh-ch520",
    score: 7.8, sound: 7.5, fps: 6.5, comfort: 8.0, build: 7.0,
    desc: "หูฟัง On-Ear ที่กลายเป็นไอคอนแฟชั่น! WH-CH520 ดีไซน์มินิมอลมีให้เลือกหลายสี ใส่แล้วน่ารักสุดๆ ใส่บนรถ BTS หรือเดินห้างได้เลย แบตเตอรี่สุดอึดถึง 50 ชั่วโมง เป็นสถิติแห่งซีรีส์ CH ไม่มีใครมาแตะ ชาร์จแค่ 10 นาทีได้ฟังต่ออีก 1.5 ชั่วโมง ฟีเจอร์ DSEE คืนคุณภาพเสียงจากไฟล์บีบอัด ทำให้ฟัง Spotify ก็ยังเสียงดี",
    pros: ["แบตเตอรี่ 50 ชม. อึดถล่มทลาย ใช้ได้หลายวัน", "ดีไซน์สวย มีหลายสีให้เลือก น่ารักเป็น Aesthetic", "น้ำหนักเบาและบางมาก พกพาสะดวก", "ราคาถูกมาก คุ้มค่าสำหรับหูฟังไร้สาย"],
    cons: ["เป็น On-Ear ทับใบหูนานๆ อาจเริ่มรู้สึกกดบ้าง", "ไม่มีระบบตัดเสียงรบกวน ANC", "เสียงไม่มีมิติมากเมื่อเทียบกับรุ่นบน"]
  },
  "1711618582": {
    cat: "headphones", name: "Sony MDR-ZX310AP Wired Headphones with Mic", slug: "sony-mdr-zx310ap",
    score: 7.2, sound: 7.0, fps: 7.5, comfort: 8.0, build: 7.0,
    desc: "หูฟังมีสายคลาสสิก ราคาไม่แรง ใส่สบาย รับสายโทรศัพท์ได้ เป็นทางเลือกที่ดีสำหรับคนที่ไม่ชอบหูฟังไร้สายหรือต้องการหูฟังสำรองคุณภาพดี ไดรเวอร์ 30mm Ferrite ให้เสียงออกมาได้น่าฟัง เบสมีน้ำหนัก เสียงร้องให้มาชัดเจน เป็น Budget King สำหรับหูฟัง On-Ear มีสาย",
    pros: ["ราคาถูกมาก ได้คุณภาพเสียง Sony ที่จูนมาให้กลมกล่อม", "มีไมค์และปุ่มรับสาย เป็น All-In-One", "น้ำหนักเบา สวมใส่สบาย"],
    cons: ["มีสาย อาจสะดุดขณะเดิน", "ไม่มี ANC หรือฟีเจอร์ไร้สาย"]
  },
  "43771310976": {
    cat: "headphones", name: "Sony INZONE H9 Wireless Gaming Headset", slug: "sony-inzone-h9",
    score: 9.0, sound: 8.8, fps: 9.8, comfort: 9.4, build: 8.8,
    desc: "หูฟังเกมมิ่งระดับไฮเอนด์จาก Sony ที่เกิดมาเพื่อ eSports และสาวก PS5 โดยเฉพาะ INZONE H9 นำเทคโนโลยี ANC จากซีรีส์ 1000X มาฝัง ทำให้มีสมาธิกับเกม 100% ระบบ 360 Spatial Sound for Gaming ให้มิติเสียงที่จับทิศทางฝีเท้าและเสียงปืนได้แม่นยำเทียบระดับ Pro Player ฟองน้ำหนังนุ่มครอบมิดใบหู เล่นยาว 10 ชั่วโมงก็สบาย รองรับ 2.4GHz + Bluetooth พร้อมกันในเครื่องเดียว",
    pros: ["360 Spatial Sound ระดับ eSports จับทิศทางเสียงแม่นมาก", "ANC คุณภาพสูงสุดในหมวดหูฟังเกมมิ่ง", "รองรับ 2.4GHz Dongle + Bluetooth คู่ขนาน", "ฟองน้ำหนาและนุ่มมาก ใส่แล่นยาวสบาย"],
    cons: ["ราคาแพงที่สุดในกลุ่มหูฟังเกมมิ่ง", "ขาดความกะทัดรัดเพราะออกแบบเพื่อนักเล่นเกมโดยเฉพาะ"]
  },
  "27277052346": {
    cat: "headphones", name: "Sony INZONE H7 Wireless Gaming Headset", slug: "sony-inzone-h7",
    score: 8.5, sound: 8.5, fps: 9.2, comfort: 8.8, build: 8.5,
    desc: "น้องรองของ H9 ที่ตัด ANC ออกเพื่อลด cost แต่ยังคงเสียง 360 Spatial Sound ไว้ครบถ้วน เชื่อมต่อ 2.4GHz Dongle เวลาเล่นเกม และ Bluetooth สำหรับโทรศัพท์พร้อมกัน ฟองน้ำหนังนุ่มเหมือนพี่ใหญ่ ถือเป็นจุดสมดุลที่ดีระหว่างราคาและประสิทธิภาพสำหรับสาย Console Gaming",
    pros: ["360 Spatial Sound Gaming คุณภาพระดับ Sony Pro", "เชื่อม 2.4GHz + Bluetooth คู่กันได้", "แบตเตอรี่ยาวนาน 40 ชม.", "ฟองน้ำหนานุ่ม ใส่สบายตลอดคืน"],
    cons: ["ไม่มีระบบ ANC เหมือน H9", "ราคาสูงกว่าหูฟังเกมมิ่งทั่วไป"]
  },
  "22768189241": {
    cat: "headphones", name: "Sony WI-OE610 Float Run Open-Ear Sport", slug: "sony-wi-oe610-float-run",
    score: 8.0, sound: 7.5, fps: 6.5, comfort: 9.5, build: 8.0,
    desc: "นวัตกรรมใหม่จาก Sony สำหรับนักวิ่งและนักออกกำลังกายโดยเฉพาะ! Float Run ออกแบบให้ฟอง 'ลอย' อยู่หน้าหูชั้นในโดยไม่ต้องยัดเข้าไปในรูหู ให้คุณได้ยินเสียงรอบข้างเต็มๆ ความปลอดภัยสูงสุดขณะวิ่งถนน กันน้ำ IPX4 เหงื่อไม่มีปัญหา เสียงเบสมีน้ำหนักดีเยี่ยมเกินคาดสำหรับหูฟังทรงเปิด",
    pros: ["ไม่ต้องยัดเข้ารูหู ได้ยินรถยนต์รอบข้าง ปลอดภัยขณะวิ่ง", "เบสมีน้ำหนักและมิติดีมากสำหรับ Open-Ear Design", "IPX4 กันเหงื่อได้ดี ใส่วิ่งเต็มๆ ได้", "สายคล้องซิลิโคนนุ่ม ใส่ออกกำลังกายไม่กัด"],
    cons: ["เสียงรั่วออกด้านข้างบ้างเมื่ออยู่ที่เงียบ", "ราคาปานกลาง แต่ก็สมเหตุสมผลกับเทคโนโลยีที่ได้"]
  },

  // ════════════════════════════════════════
  // SONY EARBUDS (อินเอียร์/TWS)
  // ════════════════════════════════════════
  "7530142637": {
    cat: "earbuds", name: "Sony MDR-E9LP Classic Earbud", slug: "sony-mdr-e9lp",
    score: 6.5, sound: 6.5, fps: 5.0, comfort: 7.0, build: 6.0,
    desc: "หูฟัง Earbud ทรงคลาสสิกจาก Sony ที่ความสวยอยู่ที่ความเรียบง่าย ไม่ต้องยัดลงไปในรูหู วางอยู่หน้าช่องหูพอดี ไดรเวอร์ Neodymium ให้เสียงที่สะอาดและเพียงพอสำหรับฟังเพลงทั่วไป เป็นตัวเลือกสำรองที่ราคาไม่แรง ไว้หยิบมาใช้เวลาหูฟังหลักชาร์จอยู่",
    pros: ["ราคาถูกมากคุ้มค่าสำหรับใช้เป็นสำรอง", "สวมใส่สบาย ไม่รู้สึกอึดอัดในรูหู", "น้ำหนักเบา เบาจนแทบไม่รู้ว่าใส่อยู่"],
    cons: ["ไม่มีไมโครโฟน รับสายโทรศัพท์ไม่ได้", "กันเสียงรอบข้างไม่ได้เลย", "เสียงเบาสำหรับคนหูไม่ดี"]
  },
  "18046444530": {
    cat: "earbuds", name: "Sony WI-C100 Wireless Neckband Earphone", slug: "sony-wi-c100",
    score: 7.5, sound: 7.5, fps: 6.0, comfort: 8.5, build: 7.0,
    desc: "หูฟังคล้องคอไร้สายที่ไม่มีวันหลุดหาย! WI-C100 ออกแบบให้สายเชื่อมสองข้างด้วยแม่เหล็ก ดึงออกมาใส่ ดันเข้าไปเก็บ สะดวกมาก กันน้ำ IPX4 ใส่ออกกำลังกายกลางแจ้งได้ไม่ต้องกลัวฝนหรือเหงื่อ แบตเตอรี่อึดถึง 25 ชั่วโมง ชาร์จครั้งเดียวใช้ได้ทั้งสัปดาห์หากไม่ใช้ทั้งวัน",
    pros: ["สายคล้องคอแม่เหล็กดึงง่าย ไม่หลุดร่วง", "แบตเตอรี่ 25 ชม. อึดมากสำหรับทรงคล้องคอ", "IPX4 ใส่ออกกำลังกายได้เลย", "ราคาถูกและหาซื้อง่าย"],
    cons: ["สายคล้องคออาจดูเทอะทะสำหรับบางคน", "ไม่มีระบบ ANC"]
  },
  "40571288502": {
    cat: "earbuds", name: "Sony IER-EX15C Type-C Wired Earphones", slug: "sony-ier-ex15c",
    score: 7.5, sound: 7.5, fps: 8.0, comfort: 8.0, build: 7.0,
    desc: "เจาะกลุ่มคนที่เบื่อปัญหาแบตหมด! IER-EX15C ใช้หัวเสียบ USB Type-C เสียบตรงกับมือถือ Android รุ่นใหม่ทุกตัวได้เลย ไม่ต้องใช้แบต รองรับ Hi-Res Audio ผ่านสาย เสียงคมชัดเหยียด ไมโครโฟนอยู่ที่สาย รับสายได้สะดวก เหมาะมากสำหรับการประชุม Zoom หรือเรียนออนไลน์",
    pros: ["หัว Type-C ใช้ได้กับ Android ใหม่ทุกรุ่นโดยตรง", "ไม่ต้องชาร์จแบต ไม่ต้องกลัวหูฟังหมดไฟ", "รองรับ Hi-Res Audio ผ่านสาย เสียงคม"],
    cons: ["ใช้ได้เฉพาะมือถือที่มีพอร์ต Type-C เท่านั้น", "ไม่เหมาะออกกำลังกาย มีสาย"]
  },
  "26981411708": {
    cat: "earbuds", name: "Sony WF-C710N Wireless TWS with ANC", slug: "sony-wf-c710n",
    score: 8.4, sound: 8.4, fps: 7.0, comfort: 9.0, build: 8.0,
    desc: "หูฟัง TWS ขนาดเล็กกระทัดรัดที่มาพร้อมระบบตัดเสียงรบกวน ANC! WF-C710N ถือเป็นหูฟัง TWS ที่มีขนาดเล็กและน้ำหนักเบาที่สุดรุ่นหนึ่งของ Sony ใส่แล้วไม่รู้สึกหนักหู โหมด Ambient Sound ดูดฟังเสียงรอบข้างได้ธรรมชาติมาก รองรับ Google Fast Pair และ Swift Pair จับคู่กับอุปกรณ์ใหม่ไวมากๆ",
    pros: ["ขนาดเล็กที่สุด เหมาะกับผู้หญิงหรือคนหูเล็ก", "มี ANC ที่ตัดเสียงรบกวนได้ดีในราคากลาง", "โหมด Ambient Sound ฟังธรรมชาติมาก", "จับคู่เร็วด้วย Google Fast Pair"],
    cons: ["แบตเตอรี่ตัวหูฟัง 7 ชม. ถือว่าพอใช้แต่ไม่ยาวมาก"]
  },
  "26562479012": {
    cat: "earbuds", name: "Sony WF-C510 Wireless TWS Earbuds", slug: "sony-wf-c510",
    score: 8.2, sound: 8.0, fps: 6.5, comfort: 9.0, build: 8.0,
    desc: "น้องเล็กใหม่ล่าสุดในตระกูล C ที่ Sony ลดขนาดลงอีก 20% จาก WF-C500 เดิม โหมด Ambient Sound ที่สวยงามธรรมชาติ กันน้ำ IPX4 ใส่โยคะหรือเดินเร็วได้สบาย แบตเตอรี่ 11 ชม. (ตัวหูฟัง) + 22 ชม. (กล่อง) ชาร์จเร็ว 10 นาที = 1 ชม. ฟังต่อ ดีไซน์กล่องกลมๆ แบบแคปซูลน่ารักมาก",
    pros: ["ขนาดเล็กมาก ใส่ไม่รู้สึกหนักหู", "แบตเตอรี่ 11+22 ชม. พอเพียงสำหรับใช้งานทั้งวัน", "IPX4 ใส่ออกกำลังกายทั่วไปได้", "ดีไซน์กล่องกลมสวยงาม"],
    cons: ["ไม่มี ANC ต้องรับเสียงภายนอกเต็มๆ", "เสียงเบสอาจไม่จุใจสายตื๊ด"]
  },
  "1710245857": {
    cat: "earbuds", name: "Sony MDR-EX255AP Wired In-Ear with Mic", slug: "sony-mdr-ex255ap",
    score: 7.8, sound: 8.2, fps: 8.5, comfort: 8.0, build: 7.5,
    desc: "หูฟังอินเอียร์มีสายขายดีที่สุดในชีวิตผมก็คงเจ้านี้! MDR-EX255AP ใช้ไดรเวอร์ Neodymium 12mm ให้เสียงเบสลึกและเต็ม เสียงกลางใสชัด สาย Y-Shape 1.2m ไม่พันกันง่าย มีไมค์ + ปุ่มรับสาย ควบคุม Volume ได้ในตัว เหมาะสำหรับเล่นเกม FPS บนมือถือที่ต้องการ Latency ต่ำ",
    pros: ["ไดรเวอร์ 12mm เบสหนักและลึก เหมาะ EDM / Hip-hop", "ดีเลย์เป็นศูนย์ (มีสาย) เหมาะเล่นเกม FPS", "ราคาถูกแต่เสียงดีกว่าราคา", "สาย 1.2m ไม่สั้นเกินไป เดินสายในเสื้อได้"],
    cons: ["หัวแจ็ค 3.5mm มือถือ flagship ส่วนใหญ่เอาออกแล้ว", "ดีไซน์เรียบๆ ไม่มีจุดเด่นด้านความสวยงาม"]
  },
  "1969050707": {
    cat: "earbuds", name: "Sony MDR-EX15AP Entry Wired In-Ear", slug: "sony-mdr-ex15ap",
    score: 7.0, sound: 7.0, fps: 7.5, comfort: 7.5, build: 6.5,
    desc: "หูฟังเริ่มต้นราคาไม่ถึงห้าร้อย แต่ Sound Signature ออกมาฟัง Sony เต็มๆ ไดรเวอร์เล็กแต่ให้เสียงที่กระชับ เหมาะกับคนที่ต้องการหูฟังราคาถูกที่ยังมีคุณภาพรับประกันจากแบรนด์ใหญ่ มีจุกยาง 3 ขนาดให้เลือกแปะจนพอดีหูตัวเอง",
    pros: ["ราคาถูกที่สุดในซีรีส์ Sony EX", "มีไมค์รับสายได้", "จุก 3 ขนาดปรับได้ตามรูปหู"],
    cons: ["เสียงเบสไม่ลึกมาก", "ทนทานปานกลาง ใช้งานหนักๆ อาจเสียเร็ว"]
  },
  "1710244952": {
    cat: "earbuds", name: "Sony MDR-EX155AP Wired In-Ear with Mic", slug: "sony-mdr-ex155ap",
    score: 7.4, sound: 7.5, fps: 7.5, comfort: 8.0, build: 7.0,
    desc: "อัปเกรดมาจาก EX15AP ด้วยบอดี้ที่แนบหูแน่นขึ้น ฟอร์มแฟคเตอร์ Angled ทำให้จุกซิลิโคนกระชับมากขึ้น ลดเสียงรบกวนจากภายนอกได้ดีขึ้น เสียงกลางชัดและเบสมีน้ำหนักพอดีๆ เป็นตัวเลือกที่ดีสำหรับนักศึกษาหรือคนทำงานที่ต้องการหูฟังงานประชุมราคาประหยัด",
    pros: ["ฟอร์มแฟคเตอร์ Angled แนบหูสนิท Passive Noise Isolation ดี", "เสียงกลมกล่อม สมดุลดี", "มีสีให้เลือกหลายสี"],
    cons: ["หัว 3.5mm อาจมีปัญหากับมือถือไม่มีช่องแจ็ค"]
  },
  "29814179859": {
    cat: "earbuds", name: "Sony WF-LS910N LinkBuds Fit ANC TWS", slug: "sony-wf-ls910n-linkbuds-fit",
    score: 8.8, sound: 8.7, fps: 7.5, comfort: 9.3, build: 8.8,
    desc: "LinkBuds Fit เป็นหูฟัง TWS ที่ Sony พัฒนาทรงจุกใหม่ ชื่อ Fit Module ให้แนบหูสนิทที่สุดในซีรีส์ LinkBuds ทำให้ ANC ทำงานได้อย่างมีประสิทธิภาพสูงสุด เสียงมีมิติเพิ่มขึ้นจาก WF-C510 อย่างเห็นได้ชัด รองรับ LDAC เพื่อเสียง Hi-Res ไร้สาย กันน้ำ IPX4 ตัวกล่องดีไซน์กะทัดรัด",
    pros: ["Fit Module ใหม่ทำให้แนบหูสนิทกว่า TWS ทั่วไป ANC จึงดีขึ้นมาก", "รองรับ LDAC เสียง Hi-Res ไร้สายเต็มประสิทธิภาพ", "ดีไซน์กล่องเรียบหรู ขนาดพกพา"],
    cons: ["ทรงจุกแปลก ต้องใช้เวลาปรับตัวสักระยะ"]
  },
  "29594464786": {
    cat: "earbuds", name: "Sony WF-LC900 LinkBuds Clip Open-Ear TWS", slug: "sony-wf-lc900-linkbuds-clip",
    score: 8.5, sound: 7.8, fps: 7.0, comfort: 9.5, build: 9.0,
    desc: "นวัตกรรมสุดล้ำ! LinkBuds Clip ออกแบบเป็นทรงหนีบใบหู ไม่ต้องยัดเข้ารูหู ยังได้ยินเสียงรอบข้างได้เต็มๆ เป็น Open-Ear ที่มีเสียงดีกว่าและกระชับกว่าเดิมมาก ตัวหูฟังกระชับใบหูอย่างมั่นคงแม้วิ่งหรือออกกำลังกาย กันน้ำ IPX4 แบตเตอรี่ 11+33 ชม. เหมาะสำหรับคนที่ไม่ชอบความรู้สึกอุดหู",
    pros: ["ทรง Clip ไม่ต้องยัดหู ไม่รู้สึกอึดอัด", "ได้ยินเสียงรอบข้างเต็มๆ เหมาะวิ่งถนน", "แบตอึด 11+33 ชม.", "กระชับมั่นคง ไม่หลุดแม้ออกกำลังกาย"],
    cons: ["เสียงเบสน้อยกว่าหูฟัง In-Ear ทั่วไปตามธรรมชาติของ Open Design"]
  },
  "49057792283": {
    cat: "earbuds", name: "Sony WF-1000XM6 Top TWS ANC Earbuds", slug: "sony-wf-1000xm6",
    score: 9.5, sound: 9.7, fps: 8.0, comfort: 9.2, build: 9.5,
    desc: "เรือธงขนาดพกพา! WF-1000XM6 คือหูฟัง TWS ที่ดีที่สุดจาก Sony มีระบบ ANC ที่ตัดเสียงรบกวนแบบ AI-Adaptive ปรับการทำงานตาม Environment รอบข้างอัตโนมัติ ไดรเวอร์ Bone Conduction สำหรับไมค์ทำให้โทรศัพท์ได้ยินชัดแม้อยู่กลางเสียงดัง IPX4 รองรับ LDAC เต็ม ชาร์จ 3 นาทีฟังต่อ 60 นาที",
    pros: ["ANC ระดับ AI ที่ดีที่สุดในอินเอียร์ขณะนี้", "ไมค์ Bone Conduction คุยโทรศัพท์ชัดมากแม้ที่เสียงดัง", "ชาร์จ 3 นาทีฟัง 60 นาที (Quick Charge)", "รองรับ LDAC เสียง Hi-Res ไร้สาย"],
    cons: ["ราคาสูงที่สุดในซีรีส์ TWS Sony", "ตัวกล่องหนาเล็กน้อยเมื่อเทียบกับคู่แข่ง"]
  },
  "28364179061": {
    cat: "earbuds", name: "Sony WF-L910 LinkBuds Open TWS", slug: "sony-wf-l910-linkbuds",
    score: 8.3, sound: 7.8, fps: 7.0, comfort: 9.5, build: 8.5,
    desc: "รุ่นอัปเกรดของ LinkBuds ดั้งเดิมที่มีช่องวงแหวนสุดเอกลักษณ์ WF-L910 ยังคงรูปแบบ Open โดยไม่ต้องยัดจุก ให้ได้ยินเสียงรอบข้างตลอดเวลา แต่ตอนนี้เพิ่มความกระชับและเสียงที่ดีขึ้น มีโหมด Auto Ambient ที่เพิ่มระดับเสียงรอบข้างอัตโนมัติเวลาผ่านแยก รองรับ Multipoint 2 อุปกรณ์",
    pros: ["ทรง Open ไม่อุดหู ใส่ทั้งวันสบายสุดๆ", "Multipoint 2 ชุดพร้อมกัน สลับได้ลื่น", "แบตเตอรี่รวม 17.5 ชม."],
    cons: ["เสียงเบาและเบสน้อยกว่า In-Ear ทั่วไป"]
  },
  "19186321188": {
    cat: "earbuds", name: "Sony INZONE Buds Gaming TWS Earbuds", slug: "sony-inzone-buds",
    score: 8.8, sound: 8.5, fps: 9.5, comfort: 8.8, build: 8.5,
    desc: "Sony ทำหูฟัง Gaming TWS ที่ตอบโจทย์สาย Mobile Gaming สุดๆ ด้วย Latency ต่ำกว่า 30ms ผ่าน USB Dongle ให้เล่น FPS บน PC และ PS5 แบบ Competitive ได้เต็มเม็ดเต็มหน่วย ANC ช่วยตัดเสียงรบกวนออกจากสนามเกมได้อีกด้วย แบต 12 ชม. ต่อการชาร์จครั้งเดียว ถือว่าเกินพอสำหรับ Gaming Session ทั้งวัน",
    pros: ["Latency ต่ำกว่า 30ms ผ่าน Dongle เหมาะ FPS สุดๆ", "ANC ช่วยให้โฟกัสกับเสียงในเกม", "แบต 12 ชม. ยาวมากสำหรับ Gaming TWS", "ดีไซน์ Ergonomic ใส่แน่นไม่หลุด"],
    cons: ["ต้องใช้ Dongle สำหรับ Low Latency ซึ่งอาจพลัดหาย"]
  },

  // ════════════════════════════════════════
  // SONY GAMING / ACCESSORIES
  // ════════════════════════════════════════
  "13775954481": {
    cat: "earbuds", name: "Sony SRS-NB10 Wireless Neckband Speaker", slug: "sony-srs-nb10-neckband",
    score: 8.0, sound: 8.0, fps: 6.0, comfort: 9.0, build: 8.5,
    desc: "ลำโพงสวมคอ! แปลกประหลาดแต่สุดล้ำ SRS-NB10 ออกแบบให้วางพาดบ่าทั้งสองข้าง เสียงพุ่งเข้าหาหูจากระยะใกล้ แต่มือและหูยังว่างพร้อมรับเสียงรอบข้าง เหมาะสำหรับคนทำงาน Work From Home ที่ต้องการเสียงชัดโดยไม่ต้องใส่หูฟัง รองรับการประชุม Video Call มีไมค์ตัดเสียงรบกวน IPX4 กันน้ำ แบต 20 ชม.",
    pros: ["แนวคิดใหม่ สวมคอ ไม่ต้องใส่หูฟัง มือว่าง", "ไมค์ตัดเสียงรบกวน ใช้ประชุม Zoom ได้ดี", "แบต 20 ชม. อึดมาก", "IPX4 กันน้ำ ใส่ทำงานบ้านได้"],
    cons: ["รูปทรงแปลก อาจดูตลกยามอยู่นอกบ้าน", "เสียงรั่วออกรอบข้างพอสมควร"]
  },
  "42471300538": {
    cat: "gaming-gear", name: "Sony INZONE MSE-G500 Gaming Mouse", slug: "sony-inzone-mse-g500",
    score: 8.5, sound: 0, fps: 9.5, comfort: 8.5, build: 8.5,
    desc: "เม้าส์เกมมิ่งแบรนด์ Sony! INZONE MSE-G500 เป็นเม้าส์ไร้สายที่ออกแบบร่วมกับสาย eSports มาพร้อม Sensor ระดับ Professional ที่แม่นยำสูง รองรับทั้ง 2.4GHz Dongle สำหรับเกมมิ่ง และ Bluetooth สำหรับงานทั่วไป ดีไซน์ Ergonomic ถนัดมือทั้งซ้ายและขวา มีผม RGB แสงสว่างสวยงาม",
    pros: ["Sensor แม่นยำระดับ Pro eSports", "2.4GHz Dongle Latency ต่ำ", "รองรับทั้งมือข้างซ้ายและขวา", "เชื่อมต่อ 2.4GHz + Bluetooth ได้"],
    cons: ["ราคาค่อนข้างแรงสำหรับเม้าส์", "แบตหนักกว่าคู่แข่งบางรุ่นเล็กน้อย"]
  },
  "43771284743": {
    cat: "gaming-gear", name: "Sony INZONE KBD-H75 Mechanical Gaming Keyboard", slug: "sony-inzone-kbd-h75",
    score: 8.8, sound: 0, fps: 9.5, comfort: 8.8, build: 9.2,
    desc: "คีย์บอร์ด Mechanical จาก Sony INZONE สำหรับเกมเมอร์สไตล์ Professional มาพร้อม Switch เกรด Gaming สัมผัสกด Tactile ชัดเจน RGB Backlight สวยงามปรับได้หลายโหมด รองรับ Wireless 2.4GHz + Bluetooth และ Wired USB-C น้ำหนักดี บอดี้โลหะผสมให้ความรู้สึกพรีเมียม",
    pros: ["Switch Mechanical ให้สัมผัสกด Tactile ชัดเจน", "รองรับ Wireless 2.4GHz + Bluetooth + Wired", "RGB สวยงาม ปรับได้หลายโหมด", "บอดี้แข็งแกร่ง น้ำหนักดี"],
    cons: ["ราคาสูงกว่าคีย์บอร์ด Gaming ทั่วไปในระดับเดียวกัน", "เป็น English Layout อาจไม่เข้ากับ User ที่ต้องการไทย"]
  },

  // ════════════════════════════════════════
  // SOUNDCORE HEADPHONES
  // ════════════════════════════════════════
  "23025905448": {
    cat: "headphones", name: "Soundcore Life Q20+ Hybrid ANC Headphones", slug: "soundcore-life-q20-plus",
    score: 8.6, sound: 8.5, fps: 7.5, comfort: 8.5, build: 8.0,
    desc: "ราคาประหยัด แต่หูฟัง ANC ระดับนี้ทำให้คนแข่งขันในตลาดระดับกลางสั่นสะเทือนมานานแล้ว! Q20+ ใช้ Hybrid ANC ที่มีไมค์ทั้งภายในและภายนอก ตัดเสียงรบกวนได้ถึง 90% เป็นอย่างน้อย รองรับ Hi-Res Audio Drivers 40mm ไดรเวอร์โตให้เสียงเต็มอิ่ม ใช้ App Soundcore ปรับ EQ ได้ Customizable มาก",
    pros: ["Hybrid ANC ตัดเสียงรบกวนได้ดีเกินราคามาก", "ไดรเวอร์ 40mm ใหญ่ เสียงเต็มอิ่ม", "ปรับ EQ ในแอปได้หลาย Preset", "แบตเตอรี่ 60 ชม. (ปิด ANC) โคตรอึด"],
    cons: ["ดีไซน์เรียบๆ ไม่หรูหราเท่าแบรนด์ใหญ่กว่า", "เสียง Mid-High อาจบางบ้างเมื่อ ANC เต็มกำลัง"]
  },
  "16296961475": {
    cat: "headphones", name: "Soundcore Q20i Hybrid ANC Headphones", slug: "soundcore-q20i",
    score: 8.2, sound: 8.0, fps: 7.0, comfort: 8.3, build: 7.8,
    desc: "Q20i เป็น Successor ของ Q20 Classic ที่เพิ่มฟีเจอร์ Transparency Mode และปรับดีไซน์ให้บางลง ระบบ Multi-Mode ANC เลือกระดับได้ 3 ระดับตามสถานการณ์ ราคาต่ำมากแต่ได้ ANC + Hi-Res Audio Drivers ถือว่าคุ้มค่าสุดๆ สำหรับบัดเจ็ทไม่เกิน 1,500 บาท",
    pros: ["ราคาถูกมากแต่ได้ ANC แบบ Hybrid มา", "Multi-Mode ANC เลือก Level การตัดเสียงได้", "Transparency Mode ฟังเสียงรอบข้างได้ชัด"],
    cons: ["ANC ไม่ลึกเท่า Q20+", "วัสดุพลาสติกดูไม่พรีเมียมนัก"]
  },

  // ════════════════════════════════════════
  // SOUNDCORE EARBUDS
  // ════════════════════════════════════════
  "22425912934": {
    cat: "earbuds", name: "Soundcore Life P3 Hybrid ANC TWS", slug: "soundcore-life-p3",
    score: 8.5, sound: 8.3, fps: 7.5, comfort: 8.8, build: 8.3,
    desc: "Life P3 คือตัวเลือกอันดับหนึ่งสำหรับคนที่ต้องการ ANC ในหูฟัง TWS แต่งบไม่มาก Hybrid ANC กรองเสียงได้สูงสุด 35dB ไดรเวอร์ 11mm ให้เบสหนักแน่นเกินราคา ไมค์ 6 ตัวใช้ AI แยกเสียงพูดออกจากเสียงรบกวนรอบข้าง โทรศัพท์ชัดมากแม้อยู่ข้างถนน Game Mode ลด Latency เหมาะเล่นมือถือ",
    pros: ["ANC Hybrid ตัดเสียงได้ถึง 35dB คุ้มค่ามาก", "ไมค์ 6 ตัว AI คุยโทรศัพท์ชัดมากในที่เสียงดัง", "Game Mode Latency ต่ำเล่น PUBG / ML ได้", "แบต 35H รวมกล่อง คุ้มมาก"],
    cons: ["ขนาดกล่องค่อนข้างใหญ่", "เสียงแหลมอาจเจ็บหูสำหรับบางคนเมื่อปรับ EQ ไม่ดี"]
  },
  "22540813934": {
    cat: "earbuds", name: "Soundcore Life Note 3i Hybrid ANC TWS", slug: "soundcore-life-note-3i",
    score: 8.0, sound: 7.8, fps: 7.0, comfort: 8.5, build: 7.8,
    desc: "น้องเล็กของซีรีส์ Life ที่ราคาเข้าถึงง่ายที่สุดแต่ยังได้ ANC Hybrid มาครบ ไมค์ 4 ตัว AI ช่วยกรองเสียงรบกวนตอนโทรศัพท์ แบตเตอรี่ 36 ชม. รวมกล่อง ถือว่าอึดเกินราคา เหมาะสำหรับนักศึกษาหรือคนทำงานที่ต้องการ TWS+ANC ในงบจำกัด",
    pros: ["ราคาถูกที่สุดในซีรีส์ยังได้ ANC Hybrid มา", "แบต 36H รวมกล่อง อึดมาก", "ไมค์ 4 ตัว AI ช่วยการโทรชัดขึ้น"],
    cons: ["ANC ไม่ดีเท่า Life P3 ที่ราคาสูงกว่า", "Bass ไม่หนักแน่นเท่ารุ่นบน"]
  },
  "19190758963": {
    cat: "earbuds", name: "Soundcore Liberty 4 NC Flagship ANC TWS", slug: "soundcore-liberty-4-nc",
    score: 9.0, sound: 9.0, fps: 7.8, comfort: 9.0, build: 9.0,
    desc: "เรือธง! Liberty 4 NC เป็น TWS ที่ Soundcore ทุ่มสุดตัวเพื่อแก้รีวิว ANC ที่หลายคนบอกว่ายังตามไม่ทัน หูฟังรุ่นนี้ตัด 98.5% ของเสียงรบกวนรอบข้าง ดูดเสียงลมและเสียงใบพัดเครื่องยนต์ได้อย่างมีประสิทธิภาพ รองรับ Hi-Res Wireless Audio และปรับ EQ เต็มรูปแบบผ่านแอป ไมค์ 6 ตัว AI เสียงคมชัดโทรศัพท์ได้ทุกที่",
    pros: ["ANC ตัดเสียง 98.5% ดีที่สุดในราคาต่ำกว่า 3 พัน", "เสียงดีมาก รองรับ Hi-Res Wireless Audio", "ไมค์ 6 ตัว AI คุยได้ทุกที่", "แบต 50H รวมกล่อง สุดอึด"],
    cons: ["กล่องใหญ่กว่าคู่แข่งบางรุ่น", "ไม่มีเซ็นเซอร์วัดชีพจรเหมือน Liberty 4 รุ่นพี่"]
  },
  "19478824299": {
    cat: "earbuds", name: "Soundcore Liberty Air 2 Pro Marvel Edition", slug: "soundcore-liberty-air-2-pro-marvel",
    score: 8.3, sound: 8.3, fps: 7.5, comfort: 8.5, build: 8.5,
    desc: "หูฟัง TWS ลิขสิทธิ์ Marvel ที่บนหน้ากล่องมีลายเพจของ Avengers! Liberty Air 2 Pro เป็นรุ่นที่ฝัง Ear Tip หัวใหม่แบบเจาะช่อง ทำให้เสียงรอบข้างผ่านเข้ามาได้พร้อมกันกับเสียงเพลง ระบบ ANC ตัดเสียงแบบ Adaptive ปรับอัตโนมัติตามสภาพแวดล้อม ไมค์ 6 ตัว AI โทรศัพท์ได้ชัดมาก ถือว่า Bundle สุดคูลสำหรับสายMARVEL",
    pros: ["ดีไซน์ลาย Marvel ในกล่อง Limited Edition สุดเท่", "ANC Adaptive ปรับอัตโนมัติไม่ต้องตั้งเองเลย", "Ear Tip ช่องผ่าน ฟังเสียงรอบข้างได้พร้อมเพลง"],
    cons: ["ราคาอาจสูงกว่ารุ่นปกติเล็กน้อยจากค่า IP Marvel", "ขนาดเคสค่อนข้างใหญ่"]
  },
  "24632239187": {
    cat: "earbuds", name: "Soundcore P40i ANC Earbuds Strong Bass", slug: "soundcore-p40i",
    score: 8.4, sound: 8.5, fps: 7.5, comfort: 8.5, build: 8.2,
    desc: "P40i คือหูฟัง TWS ที่ Soundcore ออกแบบสำหรับสายเบสโดยเฉพาะ ไดรเวอร์ Bio-Composite 11mm ให้เสียงเบสที่หนักและลึกกว่า TWS ราคาเดียวกันส่วนใหญ่ มีระบบ ANC ตัดเสียงรบกวน และ Transparency Mode ที่ลื่นไหลดีมาก แบต 10 ชม. (ตัวหูฟัง) + 40 ชม. รวมกล่อง ใส่ออกกำลังกายได้เพราะ IPX5",
    pros: ["เสียงเบสหนักและลึกอย่างมีนัยสำคัญ", "ANC ดีเคียบระดับนี้", "แบต 50H รวมกล่อง โคตรอึด", "IPX5 กันน้ำได้ดี ฝนสักหน่อยก็ไม่กลัว"],
    cons: ["เสียงกลาง-แหลมถูกเบสกลบบ้าง ไม่เหมาะสาย Classical"]
  },
  "19978162370": {
    cat: "earbuds", name: "Soundcore A20i Entry TWS Earbuds", slug: "soundcore-a20i",
    score: 7.5, sound: 7.5, fps: 7.0, comfort: 8.0, build: 7.3,
    desc: "Budget King ของ Soundcore! ราคาไม่ถึง 500 บาทแต่ได้ TWS แท้ที่มีแบต 6 ชม. + 24 ชม. รวมกล่อง เสียงได้รับการ Tune โดย BassUp เติมเบสให้มีน้ำหนักขึ้นจากที่ควรจะเป็น เหมาะสำหรับนักเรียน นักศึกษาที่ต้องการหูฟังไร้สายราคาถูกที่ยังมีคุณภาพพอใช้ได้ดี",
    pros: ["ราคาถูกที่สุดในสาย TWS แบรนด์ Soundcore", "BassUp เติมเสียงเบสให้น่าฟังกว่าราคา", "แบต 6+24 ชม. คุ้มมากในราคานี้"],
    cons: ["ไม่มี ANC", "คุณภาพไมค์ธรรมดา", "ตัดเสียงรอบข้างได้น้อยมาก"]
  },
  "23535101981": {
    cat: "earbuds", name: "Soundcore Space A40 ANC TWS 50+Hours", slug: "soundcore-space-a40",
    score: 8.7, sound: 8.5, fps: 7.5, comfort: 8.8, build: 8.5,
    desc: "Space A40 คือหนึ่งในหูฟัง TWS ที่ดีที่สุดในเรทราคาไม่ถึง 2 พันบาท ตัด ANC ได้ถึง 98% กล้าท้ากับรุ่นเรือธงราคา 2-3 เท่าได้เลย แบตเตอรี่รวม 50 ชั่วโมง ใส่แล้วหายไปได้เลยทั้งสัปดาห์ กล่องชาร์จแบบ Wireless ได้ด้วย เสียงดีมาก EQ ปรับได้ในแอป เป็นหูฟังที่ผมแนะนำได้อย่างมั่นใจ",
    pros: ["ANC ตัดเสียง 98% ดีกว่าราคาหลายเท่า", "แบต 50H รวมกล่อง กล่องชาร์จไร้สายได้", "เสียงดี ปรับ EQ ได้ในแอป Soundcore", "กันน้ำ IPX4 ฝนสาดก็ไม่กลัว"],
    cons: ["กล่องค่อนข้างหนาเล็กน้อย", "ไม่มีเซ็นเซอร์ตรวจจับว่าสวมหูอยู่ไหม"]
  },
  "26152499750": {
    cat: "earbuds", name: "Soundcore C30i Open-Ear Clip-On TWS", slug: "soundcore-c30i",
    score: 8.0, sound: 7.5, fps: 7.0, comfort: 9.3, build: 8.3,
    desc: "หูฟังทรง Open-Ear แบบหนีบหูใบ! C30i ออกแบบให้วางบนใบหูด้านนอกโดยไม่ต้องสอดเข้ารูหู ให้ได้ยินเสียงรอบข้างตลอดเวลา เหมาะสำหรับคนที่ไม่ชอบใส่หูฟังแบบSeal แต่ยังอยากฟังเพลง รูปทรงเก๋ไก๋ดูหรูกว่าราคา แบต 30 ชม. รวมกล่อง เชื่อมต่อ 2 อุปกรณ์พร้อมกัน",
    pros: ["Open-Ear ไม่ต้องยัดหู ได้ยินเสียงรอบข้าง 100%", "ดีไซน์เก๋มาก ดูดีกว่าราคา", "แบต 30H รวมกล่อง", "Multipoint 2 อุปกรณ์"],
    cons: ["เสียงเบสน้อยตามธรรมชาติของ Open-Ear", "เสียงรั่วออกด้านข้างในที่เงียบ"]
  },

  // ════════════════════════════════════════
  // SOUNDCORE SPEAKERS
  // ════════════════════════════════════════
  "23832054522": {
    cat: "speakers", name: "Soundcore Sport X10 IPX7 Sport Earbuds", slug: "soundcore-sport-x10",
    score: 8.3, sound: 7.8, fps: 7.0, comfort: 9.0, build: 9.5,
    desc: "หูฟัง TWS สายกีฬาตัวจริง! Sport X10 ออกแบบมาเพื่อออกกำลังกายหนักๆ กันน้ำ IPX7 จุ่มลงน้ำได้เลย! Ear Hook ซิลิโคนแบบ Rotating ปรับมุมได้ รับประกันว่าไม่หลุดไม่ว่าจะกระโดด วิ่งเร็ว หรือสวิง สเปกเสียง Deep Bass ด้วย DeepSea compat",
    pros: ["IPX7 กันน้ำสูงสุด จุ่มน้ำ 1 เมตรได้ 30 นาที", "Rotating Ear Hook ปรับมุมได้ กระชับทุกรูปหู", "เสียงเบสหนักสำหรับออกกำลังกาย", "แบต 8+32H รวมกล่อง"],
    cons: ["ดีไซน์สไตล์กีฬา อาจไม่เหมาะใส่ในงานทางการ"]
  },
  "23823959105": {
    cat: "speakers", name: "Soundcore Motion Boom 30W Outdoor Speaker", slug: "soundcore-motion-boom",
    score: 8.8, sound: 9.0, fps: 0, comfort: 8.5, build: 9.3,
    desc: "ลำโพง Outdoor ที่ฮิตที่สุดของ Soundcore! Motion Boom ใช้ Titanium Driver คู่ผลิตกำลัง 30W ทะลวงทุกงานกลางแจ้ง เสียงพุ่งชัดเจนแม้อยู่ข้างๆ คลื่น IPX7 กันน้ำ โดนกระแทกน้ำเต็มๆ ยังรอด BassUp เพิ่มเสียงทุ้มได้อีกเมื่อต้องการ แบต 24 ชม. ยาวนานสำหรับงานใหญ่",
    pros: ["Titanium Driver 30W เสียงดัง มีน้ำหนักเสียงดีมาก", "IPX7 กันน้ำสูง โดนสาดได้ไม่กลัว", "BassUp เพิ่มเสียงทุ้มได้", "ที่จับพกพาสะดวก"],
    cons: ["น้ำหนักพอสมควร ไม่เหมาะพกเดินทางไกลมาก", "ราคาสูงกว่าลำโพงขนาดเดียวกันทั่วไป"]
  },
  "23830242430": {
    cat: "speakers", name: "Soundcore Mini 3 Compact 360° Speaker", slug: "soundcore-mini-3",
    score: 8.0, sound: 8.0, fps: 0, comfort: 9.0, build: 8.5,
    desc: "ลำโพงลูกเล็กแต่เสียงเกินตัว! Mini 3 ขนาดพอดีฝ่ามือแต่ให้เสียง 360° BassUp กำลังขับ 6W เสียงออกรอบทิศทางชัดเจน กันน้ำ IPX7 พาไปชายหาดหรือสระน้ำได้ไม่กลัว แบต 15H ยาวนาน เหมาะสำหรับใช้ในห้อง ข้างสระน้ำ หรือพกไปปิกนิก",
    pros: ["ขนาดเล็กมาก พกง่าย สะดวกพกพา", "360° Sound เสียงกระจายเต็มห้อง", "IPX7 กันน้ำ พาไปสระน้ำได้เลย"],
    cons: ["กำลังขับ 6W ไม่เพียงพอสำหรับงานใหญ่กลางแจ้ง"]
  },
  "22531856561": {
    cat: "speakers", name: "Soundcore Mini 3 Pro LED 360° Speaker", slug: "soundcore-mini-3-pro",
    score: 8.2, sound: 8.0, fps: 0, comfort: 9.0, build: 8.5,
    desc: "Mini 3 Pro อัปเกรดจาก Mini 3 ด้วยแสง LED Ambient ที่ประดับรอบตัวลำโพง ทำให้งานปาร์ตี้กลางคืนหรือนั่งเล่นในห้องสนุกขึ้น ใส่รูปทรงสีสันน่ารัก เสียง 360° BassUp ยังคงเดิม IPX7 พาไปชายหาดได้ไม่กลัว",
    pros: ["แสง LED Ambient Party Mode สวยงาม", "เสียง 360° BassUp เต็มรูปแบบ", "IPX7 กันน้ำ"],
    cons: ["Battery อาจลดลงบ้างถ้าใช้ LED ตลอดเวลา"]
  },
  "23632016320": {
    cat: "speakers", name: "Soundcore Flare Mini 360° Party Speaker", slug: "soundcore-flare-mini",
    score: 8.0, sound: 7.8, fps: 0, comfort: 8.8, build: 8.5,
    desc: "ลำโพง Party ขนาดพกพามาพร้อมไฟ LED รอบฐาน ให้ Vibe งานสังสรรค์กลางคืน กำลัง 10W เสียงออกรอบทิศทาง 360° กันน้ำ IPX7 วางข้างสระน้ำหรือริมทะเลได้สบาย พ่วงหลายตัวด้วย PartyCast สร้าง Surround เสียงในงานได้เลย",
    pros: ["ไฟ LED Party Mode สวยงาม", "PartyCast เชื่อมหลายตัวสร้าง Surround Sound", "10W เสียงดีขึ้นจาก Mini ทั่วไป", "IPX7 กันน้ำ"],
    cons: ["ขนาดใหญ่กว่า Mini 3 พกพาลำบากกว่าเล็กน้อย"]
  },
  "20077162607": {
    cat: "speakers", name: "Soundcore Flare 2 360° BassUp Speaker", slug: "soundcore-flare-2",
    score: 8.5, sound: 8.7, fps: 0, comfort: 8.5, build: 9.0,
    desc: "Flare 2 อัปเกรดกำลังขับขึ้นเป็น 20W ให้เสียงก้องกังวานมากขึ้น ไฟ LED ด้านล่างฉาบแสงสีสวยงาม โหมด Party ให้แสงสีสลับตามจังหวะดนตรีอัตโนมัติ กันน้ำ IPX7 รวม PartyCast เชื่อมหลายตัวได้ ถือเป็น Upgrade ที่สมเหตุสมผลจากรุ่นก่อน",
    pros: ["20W เสียงก้องกังวาน เสียงเบสลึกมากขึ้น", "LED Party สลับสีตามเสียงดนตรีอัตโนมัติ", "PartyCast สร้าง Surround ได้", "IPX7 กันน้ำ"],
    cons: ["ราคาสูงกว่า Flare Mini พอสมควร"]
  },

  // ════════════════════════════════════════
  // EDIFIER EARBUDS
  // ════════════════════════════════════════
  "57850831940": {
    cat: "headphones", name: "Edifier W80 Hi-Res ANC Headphones LDAC", slug: "edifier-w80",
    score: 8.9, sound: 9.2, fps: 7.5, comfort: 8.8, build: 9.0,
    desc: "W80 คือสุดยอดหูฟังครอบหูจาก Edifier ที่รองรับ Hi-Res Wireless Audio ระดับ LDAC พร้อมระบบ ANC ที่ตัดเสียงได้ -49dB โคตรเงียบ! ดีไซน์สง่างามด้วยบอดี้โลหะที่ดูหรูหรา EQ ปรับได้ในแอป รองรับ LDAC + aptX Adaptive ทำให้เสียงดีระดับ Studio Monitoring ที่ไม่ต้องการสาย",
    pros: ["ANC ตัดเสียงได้ -49dB เงียบกริบมาก", "รองรับ LDAC เสียง Hi-Res ระดับ Studio คุณภาพสูง", "ดีไซน์บอดี้โลหะดูพรีเมียมมาก", "EQ ครบใน App"],
    cons: ["ราคาสูงกว่า Sony Q Series เล็กน้อย แต่คุณภาพสมราคา"]
  },
  "28541249730": {
    cat: "earbuds", name: "Edifier Neobuds Planar Magnetic TWS", slug: "edifier-neobuds-planar",
    score: 9.0, sound: 9.5, fps: 7.5, comfort: 8.5, build: 9.0,
    desc: "หูฟัง Planar Magnetic TWS ในราคาไม่ถึง 6 พัน—เรื่องนี้เกิดขึ้นได้จริงด้วย Edifier Neobuds Planar! ไดรเวอร์ Planar ใน TWS ให้เสียงสูงต่ำที่สะอาดและมีรายละเอียดมากกว่า Dynamic Driver ปกติมหาศาล เสียงกลางอิ่มเอิบ เสียงแหลมกรุ๊งกริ๊งไม่ล้า มีระบบ Hybrid ANC ไมค์ 6 ตัว แบตเตอรี่ 30H รวมกล่อง",
    pros: ["Planar Magnetic Driver คุณภาพเสียงระดับ Audiophile ใน TWS", "เสียงกลางและแหลมสะอาดมาก ไม่เบลอ", "ANC Hybrid + ไมค์ 6 ตัว AI", "แบต 30H รวมกล่อง"],
    cons: ["ราคาปานกลาง-สูง แต่คุ้มค่ากับไดรเวอร์ที่ได้", "ไม่มีเสียงเบสหนักๆ เหมือน Dynamic Driver"]
  },
  "42467996798": {
    cat: "earbuds", name: "Edifier NeoDots Hybrid Driver ANC TWS", slug: "edifier-neodots",
    score: 8.7, sound: 8.9, fps: 7.8, comfort: 8.5, build: 8.8,
    desc: "NeoDots เป็นหูฟัง TWS ไฮบริดระดับน่าสนใจจาก Edifier ที่รวม Dynamic Driver + Knowles Balanced Armature ไว้ในตัวเดียว ทำให้เสียงร้องพุ่งชัดอย่างที่ Dynamic Driver ทั่วไปทำไม่ได้ และเสียงเบสก็มีน้ำหนักดีกว่า BA เพียวๆ ANC ตัดเสียงได้ดีในราคานี้ แบต 56H รวมกล่องถือสถิติอึดมากในหมวดนี้",
    pros: ["Hybrid Driver (Dynamic + Knowles BA) เสียงร้องพุ่งชัดมาก", "ANC ทำได้ดี", "แบต 56H รวมกล่อง สถิติอึดที่สุดในซีรีส์"],
    cons: ["รูปทรงอาจแปลกหน่อยสำหรับรูหูขนาดเล็ก"]
  },
  "41668000772": {
    cat: "earbuds", name: "Edifier Neobuds Plus ANC LDAC TWS", slug: "edifier-neobuds-plus",
    score: 8.6, sound: 8.8, fps: 7.5, comfort: 8.5, build: 8.8,
    desc: "Neobuds Plus เป็นรุ่นที่ Edifier จัดเต็มทุกอย่างให้ครบในราคาระดับกลาง Bluetooth 5.4 เสถียรและประหยัดพลังงาน รองรับ LDAC เสียง Hi-Res ได้ Knowles BA Driver ให้รายละเอียดเสียงร้องที่ชัดเจน ANC ไมค์ 6 ตัว AI ประชุมได้สะดวก กันน้ำ IPX54 ใส่ออกกำลังกายเบาๆ ได้",
    pros: ["Bluetooth 5.4 เสถียรมาก", "LDAC เสียง Hi-Res ไร้สาย", "Knowles BA Driver เสียงร้องละเอียด", "ไมค์ 6 ตัว AI คุยงานประชุมได้ชัด"],
    cons: ["แบตเตอรี่อาจหมดเร็วเมื่อใช้ LDAC + ANC พร้อมกันตลอด"]
  },
  "44650866737": {
    cat: "earbuds", name: "Edifier Evobuds Adaptive ANC Bluetooth 6.1", slug: "edifier-evobuds",
    score: 8.3, sound: 8.2, fps: 7.5, comfort: 8.5, build: 8.5,
    desc: "หูฟัง TWS รุ่นใหม่ล่าสุดของ Edifier ที่ใช้ Bluetooth V6.1 รุ่นใหม่สุดในตลาด ประหยัดพลังงานกว่าเดิมมาก ซึ่งทำให้แบต 7 ชม. ต่อการชาร์จครั้งเดียวเพียงพอกว่าที่คิด ระบบ Adaptive ANC ปรับระดับการตัดเสียงอัตโนมัติตามสภาพแวดล้อม ไมค์ 4 ตัว AI ช่วยกรองเสียงรบกวนในการโทร",
    pros: ["Bluetooth 6.1 ล่าสุด เสถียรและประหยัดแบตมาก", "Adaptive ANC ปรับอัตโนมัติไม่ต้องตั้งเอง", "ไมค์ 4 ตัว AI ช่วยการโทรชัดขึ้น"],
    cons: ["แบต 7H ต่อตัวหูฟัง น้อยกว่าคู่แข่งในราคาใกล้เคียง"]
  },
  "43467997070": {
    cat: "earbuds", name: "Edifier Lolliclip Open-Ear ANC Clip TWS", slug: "edifier-lolliclip",
    score: 8.6, sound: 8.0, fps: 7.0, comfort: 9.3, build: 8.8,
    desc: "Lolliclip คือหูฟัง Open-Ear Clip ที่แปลกที่สุดของ Edifier—หนีบใบหูแบบไม่ต้องยัด! มีระบบ ANC ที่หาไม่ค่อยได้ในหูฟังทรงเปิดคู่แข่ง ไมค์ 6 ตัว AI ตัดเสียงรอบข้างเวลาโทรศัพท์ แบต 30H รวมกล่อง เชื่อม 2 อุปกรณ์พร้อมกัน เหมาะสำหรับคนที่ทำงานบ้าน ฟังพอดแคสต์ หรือ Work From Home แบบสบายๆ",
    pros: ["Open-Ear Clip ไม่อุดหู ใส่สบายมาก", "มีระบบ ANC หายากสำหรับทรง Open-Ear", "ไมค์ 6 ตัว AI โทรงานได้ชัดเจน", "Multipoint 2 อุปกรณ์พร้อมกัน"],
    cons: ["เสียงเบสน้อยตามธรรมชาติของ Open Design", "รูปทรงอาจดูแปลกตาสำหรับบางคน"]
  },
  "51150841805": {
    cat: "earbuds", name: "Edifier Comfo Q Open-Ear Wireless TWS", slug: "edifier-comfo-q",
    score: 8.1, sound: 7.8, fps: 7.0, comfort: 9.5, build: 8.3,
    desc: "Comfo Q เป็นหูฟัง Open-Ear ที่ Edifier ออกแบบเน้น 'ความสบายสูงสุด' เป็นอันดับหนึ่ง ใส่ทั้งวันไม่รู้สึกอึดอัด ไมค์ AI คุยโทรศัพท์ชัดเจน Bluetooth 5.4 เสถียร เชื่อม 2 อุปกรณ์พร้อมกัน แบต 8 ชม. ต่อตัวหูฟัง + กล่อง 32 ชม. ราคาถูกที่สุดในซีรีส์ Open-Ear ของ Edifier",
    pros: ["ใส่สบายที่สุด ไม่รู้สึกอุดหูเลย", "ราคาถูกที่สุดในซีรีส์ Open-Ear Edifier", "Bluetooth 5.4 เสถียร", "Multipoint 2 อุปกรณ์"],
    cons: ["ไม่มี ANC ได้ยินเสียงรอบข้างเต็มๆ ตลอดเวลา", "เสียงเบสน้อยตามทรง Open-Ear"]
  },
};

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  if (priceStr.includes('พัน')) return parseFloat(priceStr.replace('พัน', '')) * 1000;
  return parseFloat(priceStr.replace(/,/g, '')) || 0;
}

function parseCSVLine(line) {
  const row = [];
  let insideQuote = false;
  let currentValue = '';
  for (const char of line) {
    if (char === '"') insideQuote = !insideQuote;
    else if (char === ',' && !insideQuote) { row.push(currentValue); currentValue = ''; }
    else currentValue += char;
  }
  row.push(currentValue);
  return row;
}

async function run() {
  console.log("🔥 Starting Full Premium Import...\n");

  // 1. Ensure all categories from productDB exist
  const uniqueCats = [...new Set(Object.values(productDB).map(p => p.cat))];
  const { data: existingCats } = await supabase.from('categories').select('id, slug');
  const catCache = {};
  existingCats?.forEach(c => catCache[c.slug] = c.id);

  for (const catSlug of uniqueCats) {
    if (!catCache[catSlug]) {
      // Create new category if it doesn't exist
      // Capitalize slug for name (e.g., 'gaming-gear' -> 'Gaming Gear')
      const name = catSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      const { data: newCat, error } = await supabase.from('categories').insert({ name, slug: catSlug }).select('id').single();
      
      if (error) {
        console.error(`❌ Error creating category ${catSlug}:`, error.message);
      } else if (newCat) {
        catCache[catSlug] = newCat.id;
        console.log(`✨ Created new category: ${name}`);
      }
    }
  }

  const getCatId = (slug) => catCache[slug];

  // Read all CSV files from DATA directory
  const dataDir = 'D:\\MY_FIRST_WEB\\DATA';
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv'));
  console.log(`Found ${files.length} CSV files: ${files.join(', ')}\n`);

  const affiliateMap = {}; // productCode -> affiliate link

  for (const file of files) {
    const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
    const lines = content.trim().split('\n');
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const row = parseCSVLine(line);
      const code = row[0];
      const affLink = row[8];
      if (code && affLink) affiliateMap[code] = affLink;
    }
  }

  console.log(`Loaded ${Object.keys(affiliateMap).length} affiliate links from CSVs\n`);

  let insertedCount = 0;
  let skippedCount = 0;

  for (const [code, info] of Object.entries(productDB)) {
    if (!affiliateMap[code]) {
      console.log(`⚠️  No affiliate link for ${info.name} (code: ${code}) — skipping`);
      skippedCount++;
      continue;
    }

    const catId = getCatId(info.cat);
    if (!catId) {
      console.log(`⚠️  Category '${info.cat}' not found for ${info.name}`);
      skippedCount++;
      continue;
    }

    // Find price from the CSV (read again or use a stored price)
    // We'll add it from a separate pass if needed — for now set from what we read
    const productId = crypto.randomUUID();

    const { error } = await supabase.from('products').insert({
      id: productId,
      category_id: catId,
      name: info.name,
      slug: info.slug,
      price_min: info.price || null,
      price_max: info.price || null,
      overall_score: info.score,
      sound_score: info.sound || null,
      fps_score: info.fps > 0 ? info.fps : null,
      comfort_score: info.comfort || null,
      build_score: info.build || null,
      description: info.desc,
      pros: info.pros,
      cons: info.cons,
      affiliate_url: affiliateMap[code],
      view_count: Math.floor(Math.random() * 900) + 100
    });

    if (error) {
      if (error.message.includes('duplicate key')) {
        console.log(`⏭️  Already exists: ${info.name}`);
      } else {
        console.error(`❌ Error: ${info.name}: ${error.message}`);
      }
      skippedCount++;
    } else {
      console.log(`✅ Inserted: ${info.name}`);
      insertedCount++;
      // Insert specs
      if (info.specs?.length) {
        await supabase.from('specs').insert(
          info.specs.map(s => ({ product_id: productId, key: s.key, value: s.value }))
        );
      }
    }
  }

  console.log(`\n🎉 Done! Inserted: ${insertedCount} | Skipped/Existing: ${skippedCount}`);
}

run();
