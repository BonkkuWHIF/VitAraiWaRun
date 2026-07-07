// ==== ตัวละคร สิ่งกีดขวาง เหรียญ ไอเทม + ฟิสิกส์ ====

export const WIDTH = 960;
export const HEIGHT = 420;
export const GROUND_Y = 360; // เส้นพื้น

const GRAVITY = 2400;
const JUMP_VY = -800;
const AIR_JUMP_VY = -720;
const FAST_FALL = 2600; // กดลงกลางอากาศ = ร่วงเร็ว

export class Player {
  constructor(character, mods, image) {
    this.character = character;
    this.mods = mods;
    this.image = image;

    this.baseW = 58 * mods.sizeMult;
    this.baseH = 78 * mods.sizeMult;
    this.slideH = 42 * mods.sizeMult;

    this.x = 130;
    this.y = GROUND_Y; // ตำแหน่งเท้า
    this.vy = 0;
    this.jumpsUsed = 0;
    this.sliding = false;
    this.runTime = 0; // ไว้ทำท่าเด้งๆ
  }

  get grounded() {
    return this.y >= GROUND_Y - 0.5;
  }

  get h() {
    return this.sliding ? this.slideH : this.baseH;
  }

  // hitbox หดเข้านิดหน่อยให้เกมใจดีขึ้น
  get hitbox() {
    const w = this.baseW * 0.72;
    const h = this.h * 0.88;
    return { x: this.x - w / 2, y: this.y - h, w, h };
  }

  jump() {
    if (this.jumpsUsed >= this.mods.maxJumps) return false;
    this.vy = this.jumpsUsed === 0 && this.grounded ? JUMP_VY : AIR_JUMP_VY;
    this.jumpsUsed++;
    this.sliding = false;
    return true;
  }

  update(dt, slideHeld) {
    this.runTime += dt;

    if (this.grounded && this.vy >= 0) {
      this.y = GROUND_Y;
      this.vy = 0;
      this.jumpsUsed = 0;
      this.sliding = slideHeld;
    } else {
      // กลางอากาศ: กดลง = ร่วงเร็ว
      this.sliding = false;
      this.vy += (slideHeld ? FAST_FALL : GRAVITY) * dt;
      this.y += this.vy * dt;
      if (this.y >= GROUND_Y) {
        this.y = GROUND_Y;
        this.vy = 0;
        this.jumpsUsed = 0;
      }
    }
  }

  draw(ctx, invincibleBlink) {
    if (invincibleBlink) ctx.globalAlpha = 0.4;

    const w = this.baseW;
    const h = this.h;
    // เด้งขึ้นลง + เอียงนิดๆ ตอนวิ่งบนพื้น ให้ภาพนิ่งดูมีชีวิต
    const bob = this.grounded && !this.sliding ? Math.abs(Math.sin(this.runTime * 12)) * 5 : 0;
    const tilt = this.grounded ? Math.sin(this.runTime * 12) * 0.06 : (this.vy < 0 ? -0.15 : 0.12);

    ctx.save();
    ctx.translate(this.x, this.y - bob);
    ctx.rotate(tilt);
    if (this.image && this.image.complete && this.image.naturalWidth > 0) {
      if (this.sliding) {
        // ท่าสไลด์: บี้รูปให้แบนกว้าง
        ctx.drawImage(this.image, -w * 0.75, -h, w * 1.5, h);
      } else {
        ctx.drawImage(this.image, -w / 2, -h, w, h);
      }
    } else {
      // เผื่อรูปโหลดไม่ขึ้น วาดกล่องสีแทน
      ctx.fillStyle = this.character.color;
      ctx.fillRect(-w / 2, -h, w, h);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

// ---- สิ่งกีดขวาง ----
// type: 'box' | 'spike' (กระโดดข้าม), 'bar' (สไลด์ลอด)
export class Obstacle {
  constructor(type, x, rng) {
    this.type = type;
    this.x = x;
    if (type === 'box') {
      this.w = 40 + rng() * 26;
      this.h = 46 + rng() * 28;
      this.y = GROUND_Y - this.h;
    } else if (type === 'spike') {
      this.w = 48;
      this.h = 42;
      this.y = GROUND_Y - this.h;
    } else { // bar: คานลอยต่ำ ต้องสไลด์ลอด (ช่องว่างใต้คาน 58px)
      this.w = 100 + rng() * 60;
      this.h = 26;
      this.y = GROUND_Y - 58 - this.h;
    }
  }

  get hitbox() {
    const pad = this.type === 'spike' ? 8 : 3;
    return { x: this.x + pad, y: this.y + pad, w: this.w - pad * 2, h: this.h - pad };
  }

  draw(ctx, ink) {
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3;
    if (this.type === 'box') {
      ctx.fillStyle = '#d9c8a9';
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.strokeRect(this.x, this.y, this.w, this.h);
      // ขีดๆ กากๆ ในกล่อง
      ctx.beginPath();
      ctx.moveTo(this.x + 4, this.y + this.h - 6);
      ctx.lineTo(this.x + this.w - 6, this.y + 5);
      ctx.stroke();
    } else if (this.type === 'spike') {
      ctx.fillStyle = '#c97b63';
      ctx.beginPath();
      ctx.moveTo(this.x, GROUND_Y);
      ctx.lineTo(this.x + this.w / 2, this.y);
      ctx.lineTo(this.x + this.w, GROUND_Y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else { // bar
      ctx.fillStyle = '#a5a58d';
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.strokeRect(this.x, this.y, this.w, this.h);
      // เสาแขวนคาน
      ctx.beginPath();
      ctx.moveTo(this.x + this.w / 2, this.y);
      ctx.lineTo(this.x + this.w / 2, 0);
      ctx.stroke();
      ctx.font = '16px sans-serif';
      ctx.fillStyle = ink;
      ctx.fillText('ลอด!', this.x + this.w / 2 - 16, this.y + 18);
    }
  }
}

// ---- เหรียญ (เฟือง) ----
export class Coin {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 13;
    this.collected = false;
    this.spin = Math.random() * Math.PI;
  }

  get hitbox() {
    return { x: this.x - this.r, y: this.y - this.r, w: this.r * 2, h: this.r * 2 };
  }

  update(dt, magnetTarget, magnetRadius) {
    this.spin += dt * 4;
    if (magnetTarget && magnetRadius > 0) {
      const dx = magnetTarget.x - this.x;
      const dy = magnetTarget.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist < magnetRadius && dist > 1) {
        const pull = 520 * dt;
        this.x += (dx / dist) * pull;
        this.y += (dy / dist) * pull;
      }
    }
  }

  draw(ctx, ink) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.spin);
    // เฟืองกากๆ: วงกลม + ฟัน 6 ซี่
    ctx.fillStyle = '#f2cc8f';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.fillRect(Math.cos(a) * this.r - 3, Math.sin(a) * this.r - 3, 6, 6);
    }
    ctx.beginPath();
    ctx.arc(0, 0, this.r - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

// ---- ไอเทมบัพ ----
export const ITEM_TYPES = {
  magnet: { emoji: '🧲', label: 'แม่เหล็ก', duration: 8 },
  shield: { emoji: '🛡️', label: 'โล่', duration: 0 },
  potion: { emoji: '⚗️', label: 'ยาฟื้นฟู', duration: 0 },
  x2: { emoji: '✖️2', label: 'แต้มคูณสอง', duration: 8 },
  slow: { emoji: '🐌', label: 'สโลว์', duration: 5 },
};

export class Item {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.baseY = y;
    this.y = y;
    this.t = Math.random() * 10;
    this.collected = false;
    this.size = 40;
  }

  get hitbox() {
    const s = this.size;
    return { x: this.x - s / 2, y: this.y - s / 2, w: s, h: s };
  }

  update(dt) {
    this.t += dt;
    this.y = this.baseY + Math.sin(this.t * 3) * 8; // ลอยขึ้นลง
  }

  draw(ctx, ink) {
    ctx.save();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.5;
    ctx.fillStyle = 'rgba(255,253,245,.92)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size / 2 + 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.font = '26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ITEM_TYPES[this.type].emoji, this.x, this.y + 2);
    ctx.restore();
  }
}

export function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
