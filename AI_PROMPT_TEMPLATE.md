# 🤖 AI Prompt Template สำหรับสร้างข้อมูลสินค้า TechRank

## วิธีใช้

1. คัดลอก prompt ด้านล่าง
2. วางใน ChatGPT / Gemini / Claude
3. เปลี่ยนชื่อสินค้าที่ต้องการ
4. ได้ CSV row กลับมา → วางต่อท้ายไฟล์ template → Import ผ่านหน้า Admin

---

## Prompt (คัดลอกทั้งหมด)

```
ฉันต้องการข้อมูลสินค้าเทคโนโลยีในรูปแบบ CSV สำหรับเว็บไซต์รีวิว TechRank

กรุณาสร้างข้อมูลสำหรับสินค้าต่อไปนี้:
[ใส่ชื่อสินค้าที่นี่ เช่น: Sony WH-1000XM5, Apple AirPods Pro 2, JBL Charge 5]

โดยให้ข้อมูลในรูปแบบ CSV ตาม columns นี้:
name,slug,category_id,description,price_min,price_max,overall_score,sound_score,fps_score,comfort_score,build_score,pros,cons,image_url,affiliate_url,spec_1_key,spec_1_value,spec_2_key,spec_2_value,spec_3_key,spec_3_value,spec_4_key,spec_4_value,spec_5_key,spec_5_value,spec_6_key,spec_6_value,spec_7_key,spec_7_value,spec_8_key,spec_8_value,spec_9_key,spec_9_value,spec_10_key,spec_10_value

กฎ:
- slug: ใช้ชื่อสินค้าตัวพิมพ์เล็ก คั่นด้วย - (เช่น sony-wh-1000xm5)
- category_id: ใส่ค่าต่อไปนี้ตามหมวด:
  [วาง category ID จากไฟล์ techrank_categories.txt ที่นี่]
- description: เขียนเป็นภาษาไทย 2-3 ประโยค อธิบายจุดเด่นของสินค้า
- price_min/price_max: ราคาเป็นบาท (ตัวเลข ไม่ต้องมี ฿)
- overall_score: คะแนนรวม 0-10 (ทศนิยม 1 ตำแหน่ง)
- sound_score/fps_score/comfort_score/build_score: คะแนนรายหมวด 0-10
- pros: ข้อดี เขียนเป็นภาษาไทย คั่นด้วย ; (เช่น เสียงดี;แบตอึด;ANC ดีเยี่ยม)
- cons: ข้อเสีย เขียนเป็นภาษาไทย คั่นด้วย ;
- image_url: เว้นว่างไว้ได้
- affiliate_url: เว้นว่างไว้ได้
- spec_N_key / spec_N_value: สเปคสินค้าจริง เขียนเป็นภาษาไทย (key) กับค่าจริง (value)
  - ใส่สเปคที่สำคัญที่สุด 8-10 รายการ
  - ตัวอย่าง key: ประเภท, ไดร์เวอร์, การเชื่อมต่อ, แบตเตอรี่, น้ำหนัก, แบรนด์

ข้อมูลต้องถูกต้องตามสเปคจริงของสินค้า ห้ามเดา
ถ้าเป็นค่าที่มีเครื่องหมาย , ให้ครอบด้วย "" (เช่น "SBC, AAC, LDAC")
ให้ผลลัพธ์เป็น CSV rows เท่านั้น (ไม่ต้องมี header)
```

---

## ตัวอย่าง prompt แบบเฉพาะเจาะจง

```
สร้างข้อมูล CSV สำหรับหูฟัง 3 ตัวนี้:
1. Sony WF-1000XM5
2. Samsung Galaxy Buds3 Pro
3. Apple AirPods Pro 2

category_id สำหรับ headphones = [วาง UUID ที่นี่]

ใช้รูปแบบ CSV ตาม template ด้านบน
ข้อมูลต้องเป็นสเปคจริง ราคาเป็นบาท
```

---

## เคล็ดลับ

- **ดาวน์โหลด Template CSV** จากหน้า Admin ก่อน เพื่อดูรูปแบบตัวอย่าง
- **ดาวน์โหลดรายชื่อหมวดหมู่** เพื่อได้ category_id ที่ถูกต้อง
- หลังได้ CSV จาก AI ให้ **ตรวจสอบข้อมูลก่อน import** โดยเฉพาะ:
  - ราคาถูกต้องไหม
  - สเปคตรงกับสินค้าจริงไหม
  - category_id ถูกต้องไหม
- ถ้า AI ให้ข้อมูลเยอะ ให้ตัดเหลือ row เดียวที่สมบูรณ์ที่สุด แล้วค่อยเพิ่มทีละตัว
