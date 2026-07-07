// ==== คอนโทรล: คีย์บอร์ด + ปุ่มแตะ + แตะ/ปัดบน canvas ====

export function createInput({ canvas, jumpBtn, slideBtn }) {
  const state = {
    jumpQueued: false,
    slideHeld: false,
  };

  const queueJump = () => { state.jumpQueued = true; };

  // --- คีย์บอร์ด ---
  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') {
      e.preventDefault();
      queueJump();
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      e.preventDefault();
      state.slideHeld = true;
    }
  });
  window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowDown' || e.code === 'KeyS') state.slideHeld = false;
  });

  // --- ปุ่มบนจอ (มือถือ/เมาส์) ---
  jumpBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); queueJump(); });
  slideBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    slideBtn.setPointerCapture(e.pointerId);
    state.slideHeld = true;
  });
  const releaseSlide = () => { state.slideHeld = false; };
  slideBtn.addEventListener('pointerup', releaseSlide);
  slideBtn.addEventListener('pointercancel', releaseSlide);

  // --- บน canvas: แตะ = กระโดด, ปัดลง = สไลด์ชั่วครู่ ---
  let touchStartY = null;
  let swipeSlideTimer = 0;
  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    touchStartY = e.clientY;
  });
  canvas.addEventListener('pointermove', (e) => {
    if (touchStartY === null) return;
    if (e.clientY - touchStartY > 34) { // ปัดลง
      state.slideHeld = true;
      swipeSlideTimer = 0.55; // สไลด์ค้างไว้ครู่หนึ่ง
      touchStartY = null;
    }
  });
  canvas.addEventListener('pointerup', (e) => {
    if (touchStartY !== null) queueJump(); // แตะเฉยๆ = กระโดด
    touchStartY = null;
  });

  return {
    consumeJump() {
      const j = state.jumpQueued;
      state.jumpQueued = false;
      return j;
    },
    isSliding() {
      return state.slideHeld;
    },
    update(dt) { // นับถอยหลังสไลด์จากการปัด
      if (swipeSlideTimer > 0) {
        swipeSlideTimer -= dt;
        if (swipeSlideTimer <= 0) state.slideHeld = false;
      }
    },
    reset() {
      state.jumpQueued = false;
      state.slideHeld = false;
      swipeSlideTimer = 0;
    },
  };
}
