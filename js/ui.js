// ==== จัดการจอ + HUD ====

import { ITEM_TYPES } from './entities.js';

const bestKey = (id) => `kangpla-run:best:${id}`;

export function getBest(charId) {
  return Number(localStorage.getItem(bestKey(charId)) || 0);
}

export function saveBest(charId, score) {
  if (score > getBest(charId)) {
    localStorage.setItem(bestKey(charId), String(score));
    return true; // สถิติใหม่
  }
  return false;
}

export function showScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// สร้างกริดเลือกตัวละคร 3x3
export function buildCharGrid(characters, onSelect) {
  const grid = document.getElementById('char-grid');
  grid.innerHTML = '';
  characters.forEach((ch) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'char-card';
    card.dataset.id = ch.id;
    const best = getBest(ch.id);
    card.innerHTML = `
      <img src="${ch.img}" alt="${ch.name}">
      <div class="char-name">${ch.name}</div>
      <div class="char-skill">${ch.skill}</div>
      <div class="char-desc">${ch.desc}</div>
      <div class="char-best">สถิติ: ${best.toLocaleString()}</div>
    `;
    card.addEventListener('click', () => {
      grid.querySelectorAll('.char-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      onSelect(ch);
    });
    grid.appendChild(card);
  });
}

// อัปเดต HUD ระหว่างเล่น
export function updateHUD(game) {
  document.getElementById('hp-bar').style.width = `${Math.max(0, game.hp)}%`;
  document.getElementById('score').textContent = Math.floor(game.score).toLocaleString();
  document.getElementById('shield-icons').textContent = '🛡️'.repeat(game.shields);

  const buffsEl = document.getElementById('buffs');
  const chips = [];
  for (const [k, t] of Object.entries(game.buffs)) {
    if (t > 0) chips.push(`<span class="buff-chip">${ITEM_TYPES[k].emoji} ${t.toFixed(0)}s</span>`);
  }
  buffsEl.innerHTML = chips.join('');
}

// จอ game over
export function showGameOver(character, score, coins, time, isNewBest) {
  document.getElementById('over-char').innerHTML = `
    <img src="${character.img}" alt="${character.name}">
    <div class="char-name">${character.name} (${character.skill})</div>
  `;
  document.getElementById('over-score').textContent =
    `ได้ ${score.toLocaleString()} แต้ม · เก็บ ${coins} เฟือง · วิ่งได้ ${time.toFixed(1)} วิ`;
  const bestEl = document.getElementById('over-best');
  bestEl.classList.toggle('new-record', isNewBest);
  bestEl.textContent = isNewBest
    ? '🎉 สถิติใหม่ของตัวนี้!'
    : `สถิติเดิม: ${getBest(character.id).toLocaleString()}`;
  showScreen('screen-over');
}
