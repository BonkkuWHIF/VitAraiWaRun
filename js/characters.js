// ==== config ตัวละคร 9 ตัว ====
// อยากเปลี่ยนชื่อ/รูป/สกิล แก้ที่ไฟล์นี้ไฟล์เดียว
// ตอนใส่รูปวาดจริง: วางไฟล์ใน assets/characters/ แล้วแก้ img ให้ชี้ไฟล์นั้น (PNG/JPG/SVG ได้หมด)

export const DEFAULT_MODS = {
  hitDamageMult: 1,   // ตัวคูณดาเมจตอนชน
  maxJumps: 2,        // จำนวนกระโดดสูงสุด (รวมกระโดดแรก)
  coinScoreMult: 1,   // ตัวคูณแต้มจากเหรียญ
  passiveMagnet: 0,   // รัศมีดูดเหรียญติดตัว (px), 0 = ไม่มี
  hpDrainMult: 1,     // ตัวคูณอัตรา HP ลดตามเวลา
  buffDurationMult: 1,// ตัวคูณระยะเวลาไอเทมบัพ
  recycleHeal: 0,     // ฟื้น HP เท่านี้ทุกๆ 10 เหรียญ, 0 = ไม่มี
  startShield: 0,     // จำนวนโล่ตอนเริ่มเกม
  shieldEvery: 0,     // ได้โล่ใหม่ทุกๆ กี่วินาที, 0 = ไม่มี
  sizeMult: 1,        // ตัวคูณขนาดตัว/hitbox
};

export const CHARACTERS = [
  {
    id: 'civil', name: 'โยธา', color: '#e07a5f',
    skill: 'ตัวถึก', desc: 'ชนสิ่งกีดขวางเสีย HP แค่ครึ่งเดียว',
    img: 'assets/characters/char1.svg',
    mods: { hitDamageMult: 0.5 },
  },
  {
    id: 'mech', name: 'เครื่องกล', color: '#3d5a80',
    skill: 'สปริงขา', desc: 'กระโดดกลางอากาศได้ถึง 3 ชั้น',
    img: 'assets/characters/char2.svg',
    mods: { maxJumps: 3 },
  },
  {
    id: 'electrical', name: 'ไฟฟ้า', color: '#d4a017',
    skill: 'ชาร์จไว', desc: 'เก็บเหรียญได้แต้ม x1.5',
    img: 'assets/characters/char3.svg',
    mods: { coinScoreMult: 1.5 },
  },
  {
    id: 'computer', name: 'คอมพิวเตอร์', color: '#5f6caf',
    skill: 'สนามแม่เหล็ก', desc: 'ดูดเหรียญระยะใกล้ตลอดเวลา',
    img: 'assets/characters/char4.svg',
    mods: { passiveMagnet: 95 },
  },
  {
    id: 'chem', name: 'เคมี', color: '#81b29a',
    skill: 'ร่างทน', desc: 'HP ลดตามเวลาช้าลง 35%',
    img: 'assets/characters/char5.svg',
    mods: { hpDrainMult: 0.65 },
  },
  {
    id: 'industrial', name: 'อุตสาหการ', color: '#b5838d',
    skill: 'จัดการเก่ง', desc: 'ไอเทมบัพอยู่นานขึ้น 2 เท่า',
    img: 'assets/characters/char6.svg',
    mods: { buffDurationMult: 2 },
  },
  {
    id: 'env', name: 'สิ่งแวดล้อม', color: '#6a994e',
    skill: 'รีไซเคิล', desc: 'เก็บครบทุก 10 เหรียญ ฟื้น HP',
    img: 'assets/characters/char7.svg',
    mods: { recycleHeal: 8 },
  },
  {
    id: 'mecha', name: 'เมคคาทรอนิกส์', color: '#7f5539',
    skill: 'เกราะสำรอง', desc: 'เริ่มเกมมีโล่ + ได้โล่ใหม่ทุก 30 วิ',
    img: 'assets/characters/char8.svg',
    mods: { startShield: 1, shieldEvery: 30 },
  },
  {
    id: 'survey', name: 'สำรวจ', color: '#588b8b',
    skill: 'ตัวจิ๋ว', desc: 'ตัวเล็กลง 25% หลบง่ายขึ้น',
    img: 'assets/characters/char9.svg',
    mods: { sizeMult: 0.75 },
  },
];

export function getMods(character) {
  return { ...DEFAULT_MODS, ...character.mods };
}
