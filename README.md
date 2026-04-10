# 🏆 TechRank — คู่มือการใช้งานโปรเจกต์

เว็บไซต์รีวิวและจัดอันดับอุปกรณ์เทคโนโลยี (หูฟัง, คีย์บอร์ด, เมาส์, ลำโพง) พร้อมลิงก์ Shopee Affiliate

---

## 📁 โครงสร้างโฟลเดอร์ที่สำคัญ

```
MY_FIRST_WEB/
├── DATA/                     ← วางไฟล์ CSV จาก Shopee Affiliate Dashboard ที่นี่
├── src/                      ← โค้ดหน้าเว็บ Next.js
├── import_all_premium.js     ← 🔑 STEP 1: นำเข้าสินค้าพรีเมียมจาก CSV
├── fetch_images.js           ← 🔑 STEP 2: ดึงรูป + specs + ราคา จาก Shopee API
├── auto_master_updater.js    ← 🔑 STEP 3: เติม specs ที่ขาด + อัปเดต automation
└── .env.local                ← config Supabase (ห้าม commit)
```

---

## 🚀 ขั้นตอนการใช้งาน

### เมื่อได้รับไฟล์ CSV ใหม่จาก Shopee

1. **วางไฟล์ CSV** ที่โหลดมาจาก Shopee Affiliate Dashboard ลงในโฟลเดอร์ `DATA/`

2. **นำเข้าสินค้า** (อ่าน CSV → บันทึกลง Supabase):
   ```powershell
   node import_all_premium.js
   ```
   สคริปต์นี้จะอ่านทุก `.csv` ในโฟลเดอร์ `DATA/` โดยอัตโนมัติ

3. **ดึงรูปภาพ + Specs + ราคา** จาก Shopee API:
   ```powershell
   node fetch_images.js
   ```
   สคริปต์นี้จะ:
   - ✅ ดึงรูปภาพจริงของสินค้าจาก Shopee API (แม่นยำมาก)
   - ✅ ดึง Attributes/Specs จาก Shopee มาเก็บใน DB
   - ✅ ดึง Description จาก Shopee เป็น fallback
   - ✅ **จัดการสินค้าเดียวกันหลายร้านค้า** → เก็บ `price_min` (ถูกสุด) และ `price_max` (แพงสุด) อัตโนมัติ

4. **(ถ้าต้องการ)** เติม specs ที่ขาดและอัปเดตสินค้าทั้งหมดแบบอัตโนมัติ:
   ```powershell
   npm run upgrade:techrank
   ```

---

## 🏬 การจัดการสินค้าเดียวกัน หลายร้านค้า

> **นโยบาย**: สินค้าเดียวกัน (รหัส Item เดียวกัน) หลายร้านค้า **ไม่ได้แยกเป็นหลายโปรดักต์**
> แต่จะ **เก็บ range ราคา** และ **ลิงก์ Affiliate ของร้านที่ถูกที่สุด**

| ข้อมูล | วิธีจัดการ |
|---|---|
| `price_min` | ราคาจากร้านที่ถูกที่สุด |
| `price_max` | ราคาจากร้านที่แพงที่สุด |
| `affiliate_url` | ลิงก์ไปร้านที่ถูกที่สุด (ให้ประโยชน์ผู้ใช้สูงสุด) |
| รูปภาพ | ดึงจากร้านที่ถูกที่สุดเป็นหลัก |

---

## 🛠️ การพัฒนาเว็บ

```powershell
# รันในโหมด Development
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์

```powershell
# Build สำหรับ Production
npm run build
```

---

## ➕ การเพิ่มสินค้าใหม่ใน import_all_premium.js

เมื่อต้องการเพิ่มสินค้า (Brand/รุ่น) ใหม่:

1. เพิ่มข้อมูลสินค้าลงใน `productDB` ใน `import_all_premium.js`:
   ```js
   "SHOPEE_ITEM_ID": {
     cat: "headphones",  // หมวดหมู่ slug
     name: "ชื่อสินค้า",
     slug: "slug-สินค้า",
     score: 8.5, sound: 8.5, fps: 7.0, comfort: 9.0, build: 8.5,
     desc: "คำอธิบายภาษาไทย...",
     pros: ["ข้อดี 1", "ข้อดี 2"],
     cons: ["ข้อเสีย 1"],
     specs: [{key: "Bluetooth", value: "5.3"}, ...]
   }
   ```

2. เพิ่ม mapping ใน `codeToSlug` ใน `fetch_images.js`:
   ```js
   "SHOPEE_ITEM_ID": "slug-สินค้า",
   ```

3. วาง CSV ที่มีสินค้านั้นลงใน `DATA/` แล้วรัน Step 1-3 ตามปกติ

---

## 📊 Database Schema (Supabase)

| ตาราง | คำอธิบาย |
|---|---|
| `categories` | หมวดหมู่สินค้า (headphones, keyboards, mice, speakers) |
| `products` | ข้อมูลสินค้าหลัก (ชื่อ, ราคา, คะแนน, รูป, ลิงก์) |
| `specs` | สเปคสินค้า key-value (ผูกกับ product_id) |

---

## 🔑 Scripts ที่ใช้งานจริง

| Script | ใช้ทำอะไร | เมื่อไหร่ |
|---|---|---|
| `import_all_premium.js` | นำเข้าสินค้าพรีเมียม + affiliate ลิงก์จาก DATA/ | ทุกครั้งที่ได้ CSV ใหม่ |
| `fetch_images.js` | ดึงรูป + specs + ราคาจาก Shopee API | หลัง import |
| `auto_master_updater.js` | เติม specs template ที่ขาด + scrape รูปสำรอง | เมื่อสินค้าขาดข้อมูล |
| `npm run dev` | รันเว็บในโหมด dev | พัฒนา/ทดสอบ |
| `npm run upgrade:techrank` | รัน auto_master_updater.js | เติมข้อมูลที่ขาด |

---

## ⚙️ Environment Variables (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

ต้องตั้งค่าก่อนใช้งานทุก script
