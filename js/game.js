// ==== game loop หลัก: spawn, ชน, HP, คะแนน, บัพ, สกิลตัวละคร ====

import {
  WIDTH, HEIGHT, GROUND_Y,
  Player, Obstacle, Coin, Item, ITEM_TYPES, rectsOverlap,
} from './entities.js';

const INK = '#3a3226';

const BASE_SPEED = 330;
const SPEED_GAIN = 7;      // เพิ่มความเร็ววินาทีละ
const MAX_SPEED = 880;
const HP_MAX = 100;
const HP_DRAIN = 2.2;      // HP ลดต่อวินาที
const HIT_DAMAGE = 20;
const INVINCIBLE_TIME = 1.3;
const MAGNET_RADIUS = 170; // รัศมีตอนมีบัพแม่เหล็ก

const rand = (a, b) => a + Math.random() * (b - a);

export class Game {
  constructor(canvas, input, onGameOver) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = input;
    this.onGameOver = onGameOver;
    this.running = false;
  }

  start(character, mods, image) {
    this.character = character;
    this.mods = mods;
    this.player = new Player(character, mods, image);

    this.speed = BASE_SPEED;
    this.hp = HP_MAX;
    this.score = 0;
    this.coins = 0;
    this.time = 0;
    this.distance = 0;
    this.invincible = 0;
    this.shields = mods.startShield;
    this.shieldTimer = 0;
    this.buffs = { magnet: 0, x2: 0, slow: 0 }; // เวลาที่เหลือของแต่ละบัพ

    this.obstacles = [];
    this.coinsList = [];
    this.items = [];
    this.nextObstacleDist = 500;
    this.nextItemTime = rand(6, 10);

    this.input.reset();
    this.running = true;
  }

  update(dt) {
    if (!this.running) return;
    this.time += dt;
    this.input.update(dt);

    // ความเร็วโลก (บัพสโลว์ทำให้ช้าลง)
    this.speed = Math.min(MAX_SPEED, BASE_SPEED + this.time * SPEED_GAIN);
    const worldSpeed = this.speed * (this.buffs.slow > 0 ? 0.55 : 1);
    const moved = worldSpeed * dt;
    this.distance += moved;

    // --- ผู้เล่น ---
    if (this.input.consumeJump()) this.player.jump();
    this.player.update(dt, this.input.isSliding());

    // --- HP ลดตามเวลา (สกิลเคมีลดช้าลง) ---
    this.hp -= HP_DRAIN * this.mods.hpDrainMult * dt;

    // --- คะแนนจากระยะทาง ---
    const x2 = this.buffs.x2 > 0 ? 2 : 1;
    this.score += moved * 0.035 * x2;

    // --- โล่อัตโนมัติ (เมคคาทรอนิกส์) ---
    if (this.mods.shieldEvery > 0) {
      this.shieldTimer += dt;
      if (this.shieldTimer >= this.mods.shieldEvery) {
        this.shieldTimer = 0;
        this.shields = Math.min(this.shields + 1, 2);
      }
    }

    // --- นับถอยหลังบัพ / อมตะ ---
    for (const k of Object.keys(this.buffs)) {
      if (this.buffs[k] > 0) this.buffs[k] = Math.max(0, this.buffs[k] - dt);
    }
    if (this.invincible > 0) this.invincible -= dt;

    this.spawn(moved, dt);
    this.moveAndCollide(moved, dt, x2);

    if (this.hp <= 0) {
      this.hp = 0;
      this.running = false;
      this.onGameOver(Math.floor(this.score), this.coins, this.time);
    }
  }

  spawn(moved, dt) {
    // สิ่งกีดขวาง: อิงระยะทาง จะได้ไม่ถี่เกินตอนวิ่งเร็ว
    this.nextObstacleDist -= moved;
    if (this.nextObstacleDist <= 0) {
      const roll = Math.random();
      let type;
      if (this.time > 12 && roll < 0.3) type = 'bar';      // คานให้สไลด์ โผล่หลัง 12 วิ
      else if (roll < 0.6) type = 'box';
      else type = 'spike';
      this.obstacles.push(new Obstacle(type, WIDTH + 60, Math.random));
      this.nextObstacleDist = rand(330, 640) + this.speed * 0.3;

      // มีโอกาสวางแถวเหรียญในช่องว่างถัดไป
      if (Math.random() < 0.55) {
        const n = 4 + Math.floor(Math.random() * 3);
        const arc = Math.random() < 0.4; // โค้งข้ามหัวสิ่งกีดขวาง
        const startX = WIDTH + 200;
        for (let i = 0; i < n; i++) {
          const y = arc
            ? GROUND_Y - 60 - Math.sin((i / (n - 1)) * Math.PI) * 110
            : GROUND_Y - 42;
          this.coinsList.push(new Coin(startX + i * 42, y));
        }
      }
    }

    // ไอเทมบัพ
    this.nextItemTime -= dt;
    if (this.nextItemTime <= 0) {
      // ยาฟื้นฟูออกบ่อยกว่าอย่างอื่น เพราะ HP ลดตลอดเวลา
      const pool = ['magnet', 'shield', 'potion', 'potion', 'x2', 'slow'];
      const type = pool[Math.floor(Math.random() * pool.length)];
      const y = Math.random() < 0.5 ? GROUND_Y - 50 : GROUND_Y - 150;
      this.items.push(new Item(type, WIDTH + 60, y));
      this.nextItemTime = rand(8, 14);
    }
  }

  moveAndCollide(moved, dt, x2) {
    const p = this.player;
    const pBox = p.hitbox;

    // รัศมีแม่เหล็ก: บัพ > สกิลติดตัว (คอมพิวเตอร์)
    const magnetR = this.buffs.magnet > 0 ? MAGNET_RADIUS : this.mods.passiveMagnet;
    const magnetTarget = { x: p.x, y: p.y - p.h / 2 };

    // สิ่งกีดขวาง
    for (const ob of this.obstacles) {
      ob.x -= moved;
      if (this.invincible <= 0 && rectsOverlap(pBox, ob.hitbox)) {
        this.onHit();
      }
    }
    this.obstacles = this.obstacles.filter((o) => o.x + o.w > -50);

    // เหรียญ
    for (const c of this.coinsList) {
      c.x -= moved;
      c.update(dt, magnetTarget, magnetR);
      if (!c.collected && rectsOverlap(pBox, c.hitbox)) {
        c.collected = true;
        this.coins++;
        this.score += 10 * this.mods.coinScoreMult * x2;
        // สกิลรีไซเคิล (สิ่งแวดล้อม): ครบทุก 10 เหรียญ ฟื้น HP
        if (this.mods.recycleHeal > 0 && this.coins % 10 === 0) {
          this.hp = Math.min(HP_MAX, this.hp + this.mods.recycleHeal);
        }
      }
    }
    this.coinsList = this.coinsList.filter((c) => !c.collected && c.x > -40);

    // ไอเทม
    for (const it of this.items) {
      it.x -= moved;
      it.update(dt);
      if (!it.collected && rectsOverlap(pBox, it.hitbox)) {
        it.collected = true;
        this.applyItem(it.type);
      }
    }
    this.items = this.items.filter((it) => !it.collected && it.x > -60);
  }

  onHit() {
    if (this.shields > 0) {
      this.shields--;
    } else {
      this.hp -= HIT_DAMAGE * this.mods.hitDamageMult;
    }
    this.invincible = INVINCIBLE_TIME;
  }

  applyItem(type) {
    const dur = ITEM_TYPES[type].duration * this.mods.buffDurationMult;
    if (type === 'shield') this.shields = Math.min(this.shields + 1, 3);
    else if (type === 'potion') this.hp = Math.min(HP_MAX, this.hp + 30);
    else this.buffs[type] = dur;
  }

  // ==== วาดทุกอย่าง ====
  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    this.drawBackground(ctx);

    for (const ob of this.obstacles) ob.draw(ctx, INK);
    for (const c of this.coinsList) c.draw(ctx, INK);
    for (const it of this.items) it.draw(ctx, INK);

    if (this.player) {
      const blink = this.invincible > 0 && Math.floor(this.invincible * 10) % 2 === 0;
      this.player.draw(ctx, blink);
      // วงโล่รอบตัว
      if (this.shields > 0) {
        ctx.strokeStyle = '#5f6caf';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(this.player.x, this.player.y - this.player.h / 2, this.player.baseH * 0.72, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  drawBackground(ctx) {
    // เมฆกากๆ เลื่อนช้าๆ (parallax หลอกๆ จากระยะทาง)
    ctx.strokeStyle = 'rgba(58,50,38,.25)';
    ctx.lineWidth = 2.5;
    const cloudShift = (this.distance * 0.15) % (WIDTH + 300);
    for (const [cx, cy, r] of [[200, 70, 26], [560, 110, 20], [860, 60, 30]]) {
      const x = ((cx - cloudShift) % (WIDTH + 300) + WIDTH + 300) % (WIDTH + 300) - 150;
      ctx.beginPath();
      ctx.arc(x, cy, r, Math.PI * 0.9, Math.PI * 2.1);
      ctx.arc(x + r * 0.9, cy - 6, r * 0.75, Math.PI, Math.PI * 2.2);
      ctx.stroke();
    }

    // เส้นพื้นวาดมือสั่นๆ
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    for (let x = 0; x <= WIDTH; x += 28) {
      ctx.lineTo(x + 28, GROUND_Y + Math.sin((x + this.distance * 0.5) * 0.08) * 2.2);
    }
    ctx.stroke();

    // ขีดสั้นๆ บนพื้นให้ดูว่ากำลังเลื่อน
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(58,50,38,.4)';
    const dashShift = this.distance % 90;
    for (let x = -dashShift; x < WIDTH; x += 90) {
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y + 22);
      ctx.lineTo(x + 26, GROUND_Y + 26);
      ctx.stroke();
    }
  }
}
