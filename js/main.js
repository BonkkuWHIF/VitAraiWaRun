// ==== จุดเริ่มต้น: โหลดรูป ผูก UI + เกมเข้าด้วยกัน ====

import { CHARACTERS, getMods } from './characters.js';
import { createInput } from './input.js';
import { Game } from './game.js';
import { buildCharGrid, showScreen, updateHUD, showGameOver, saveBest, getBest } from './ui.js';

const canvas = document.getElementById('game-canvas');
const btnStart = document.getElementById('btn-start');
const btnRetry = document.getElementById('btn-retry');
const btnChange = document.getElementById('btn-change');

// โหลดรูปตัวละครทั้งหมดล่วงหน้า
const images = {};
for (const ch of CHARACTERS) {
  const img = new Image();
  img.src = ch.img;
  images[ch.id] = img;
}

const input = createInput({
  canvas,
  jumpBtn: document.getElementById('btn-jump'),
  slideBtn: document.getElementById('btn-slide'),
});

let selected = null;

const game = new Game(canvas, input, (score, coins, time) => {
  const isNewBest = saveBest(selected.id, score);
  showGameOver(selected, score, coins, time, isNewBest);
});

// --- จอเลือกตัวละคร ---
buildCharGrid(CHARACTERS, (ch) => {
  selected = ch;
  btnStart.disabled = false;
  btnStart.textContent = `เริ่มวิ่งด้วย ${ch.name}!`;
});

function startGame() {
  showScreen('screen-game');
  game.start(selected, getMods(selected), images[selected.id]);
}

btnStart.addEventListener('click', startGame);
btnRetry.addEventListener('click', startGame);
btnChange.addEventListener('click', () => {
  buildCharGrid(CHARACTERS, (ch) => { // สร้างใหม่ให้สถิติอัปเดต
    selected = ch;
    btnStart.disabled = false;
    btnStart.textContent = `เริ่มวิ่งด้วย ${ch.name}!`;
  });
  // เลือกตัวเดิมค้างไว้ให้
  const card = document.querySelector(`.char-card[data-id="${selected.id}"]`);
  if (card) card.click();
  showScreen('screen-select');
});

// --- game loop ---
let lastTime = null;
function frame(now) {
  if (lastTime !== null && game.running) {
    const dt = Math.min((now - lastTime) / 1000, 0.05); // กัน dt กระโดดตอนแท็บพัก
    game.update(dt);
    game.draw();
    updateHUD(game);
  }
  lastTime = now;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// สลับแท็บแล้วกลับมา ไม่ให้เวลากระโดด
document.addEventListener('visibilitychange', () => {
  lastTime = null;
});

// handle สำหรับ debug ผ่าน console (ขับเกมเองทีละเฟรมได้)
window.__kangpla = {
  game,
  tick(dt = 1 / 60) {
    game.update(dt);
    game.draw();
    updateHUD(game);
  },
};
