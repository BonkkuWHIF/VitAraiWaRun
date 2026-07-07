# วิศวะก้างปลารัน 🏃💨

เกมวิ่งไม่รู้จบ (endless runner) สไตล์คุกกี้รัน — HTML + CSS + JavaScript ล้วนๆ ไม่ต้อง build ไม่ต้องติดตั้งอะไร

## วิธีเล่น

- ตัวละครวิ่งเองอัตโนมัติ ความเร็วเพิ่มขึ้นเรื่อยๆ
- **↑ / Space / แตะจอ / ปุ่มกระโดด** = กระโดด (กดซ้ำกลางอากาศ = กระโดดสองชั้น)
- **↓ / ปัดลง / กดปุ่มสไลด์ค้าง** = สไลด์ลอดคาน (กดตอนกลางอากาศ = ร่วงเร็ว)
- HP ลดลงเรื่อยๆ ตามเวลา ชนสิ่งกีดขวางยิ่งลดหนัก เก็บ ⚗️ ยาฟื้นฟูเพื่อต่อชีวิต
- เก็บเฟือง ⚙️ ได้แต้ม + ไอเทมบัพ: 🧲 แม่เหล็ก, 🛡️ โล่, ✖️2 แต้มคูณสอง, 🐌 สโลว์
- ตัวละครทั้ง 9 ตัวมีสกิลติดตัวไม่เหมือนกัน ลองให้ครบ!

## รันในเครื่อง

เพราะใช้ ES Modules ต้องเปิดผ่าน web server (เปิดไฟล์ตรงๆ ไม่ได้):

```bash
# ใช้ Python
python -m http.server 8123
# หรือใช้ Node
npx serve .
```

แล้วเปิด http://localhost:8123

## เปลี่ยนรูปตัวละครเป็นภาพวาดจริง 🎨

1. วาดรูปตัวละคร (แนะนำ **PNG พื้นหลังโปร่งใส** สัดส่วนแนวตั้ง ประมาณ 200×240 หรือใกล้เคียง)
2. วางไฟล์ไว้ในโฟลเดอร์ `assets/characters/` เช่น `kangpla1.png`
3. เปิดไฟล์ [js/characters.js](js/characters.js) แก้บรรทัด `img:` ของตัวนั้น:

```js
// จาก
img: 'assets/characters/char1.svg',
// เป็น
img: 'assets/characters/kangpla1.png',
```

เปลี่ยน `name` (ชื่อตัวละคร), `skill`, `desc`, `color` ได้ที่ไฟล์เดียวกัน
ตัวเลขบนรูป placeholder ตรงกับลำดับในไฟล์ config (char1 = ตัวแรกในลิสต์)

## Deploy ขึ้น GitHub Pages 🚀

1. สร้าง repository ใหม่บน GitHub (เช่น `kangpla-run`)
2. Push โค้ดขึ้นไป:

```bash
git remote add origin https://github.com/<username>/kangpla-run.git
git push -u origin main
```

3. เข้าหน้า repo บน GitHub → **Settings → Pages**
4. ตรง **Source** เลือก `Deploy from a branch` → Branch เลือก `main` / `(root)` → กด **Save**
5. รอ 1-2 นาที เกมจะอยู่ที่ `https://<username>.github.io/kangpla-run/`

## โครงสร้างโปรเจกต์

```
index.html          หน้าเดียว 3 จอ: เลือกตัวละคร / เล่น / จบเกม
style.css           ธีมสมุดสเก็ตช์
js/characters.js    ← config ตัวละคร 9 ตัว (แก้ชื่อ/รูป/สกิลที่นี่)
js/entities.js      ผู้เล่น สิ่งกีดขวาง เหรียญ ไอเทม ฟิสิกส์
js/game.js          game loop, spawn, ชน, HP, บัพ
js/input.js         คีย์บอร์ด + ทัชสกรีน
js/ui.js            จอต่างๆ + HUD + high score (localStorage)
js/main.js          จุดเริ่มต้น
assets/characters/  รูปตัวละคร
```
