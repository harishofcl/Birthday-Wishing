// script.js — desktop mouse dragging behavior (glass cards)
let highestZ = 1;
let dropZoneEl = null;
let dropSlotRegistry = [];
const cardInstances = [];
const dropGridLayout = { cols: 3, rows: 2, padX: 36, padY: 30 };

function fireDropState(node, dropped) {
  document.dispatchEvent(new CustomEvent('paper-drop-state', {
    detail: { node, dropped }
  }));
}

function isCenterInside(rectA, rectB, margin = 0) {
  const centerX = rectA.left + rectA.width / 2;
  const centerY = rectA.top + rectA.height / 2;
  return centerX >= (rectB.left - margin) &&
         centerX <= (rectB.right + margin) &&
         centerY >= (rectB.top - margin) &&
         centerY <= (rectB.bottom + margin);
}

function configureDropGrid(totalCards) {
  const cols = Math.min(3, Math.max(1, totalCards));
  dropGridLayout.cols = cols;
  dropGridLayout.rows = Math.max(1, Math.ceil(totalCards / cols));
}

function getDropSlotPosition(slotIndex) {
  if (!dropZoneEl) return null;
  const zoneRect = dropZoneEl.getBoundingClientRect();
  const usableWidth = Math.max(40, zoneRect.width - dropGridLayout.padX * 2);
  const usableHeight = Math.max(40, zoneRect.height - dropGridLayout.padY * 2);
  const col = slotIndex % dropGridLayout.cols;
  const row = Math.floor(slotIndex / dropGridLayout.cols);
  const slotWidth = usableWidth / dropGridLayout.cols;
  const slotHeight = usableHeight / dropGridLayout.rows;
  const centerX = zoneRect.left + dropGridLayout.padX + slotWidth * col + slotWidth / 2;
  const centerY = zoneRect.top + dropGridLayout.padY + slotHeight * row + slotHeight / 2;
  return { x: centerX, y: centerY };
}

class Paper {
  constructor() {
    this.holdingPaper = false;
    this.mouseTouchX = 0;
    this.mouseTouchY = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.prevMouseX = 0;
    this.prevMouseY = 0;
    this.velX = 0;
    this.velY = 0;
    this.rotation = Math.random() * 20 - 10;
    this.currentPaperX = 0;
    this.currentPaperY = 0;
    this.rotating = false;
    this.paperEl = null;
    this.scale = 1;
    this.slotIndex = null;
  }

  applyTransform(withEase = false) {
    if (!this.paperEl) return;
    if (withEase) {
      this.paperEl.style.transition = 'transform .35s ease, box-shadow .35s ease';
      requestAnimationFrame(() => {
        this.paperEl.style.transform =
          `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg) scale(${this.scale})`;
        setTimeout(() => { if (this.paperEl) this.paperEl.style.transition = ''; }, 360);
      });
    } else {
      this.paperEl.style.transform =
        `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg) scale(${this.scale})`;
    }
  }

  assignSlotIndex() {
    if (this.slotIndex !== null) return this.slotIndex;
    this.slotIndex = dropSlotRegistry.length;
    dropSlotRegistry.push(this.paperEl);
    this.paperEl.dataset.slotIndex = String(this.slotIndex);
    return this.slotIndex;
  }

  snapToSlot(options = {}) {
    if (!this.paperEl) return false;
    const { smooth = true } = options;
    const slotIdx = this.assignSlotIndex();
    const target = getDropSlotPosition(slotIdx);
    if (!target) return false;
    const cardRect = this.paperEl.getBoundingClientRect();
    const cardCenterX = cardRect.left + cardRect.width / 2;
    const cardCenterY = cardRect.top + cardRect.height / 2;
    this.currentPaperX += target.x - cardCenterX;
    this.currentPaperY += target.y - cardCenterY;
    this.scale = 0.86;
    this.paperEl.dataset.locked = 'true';
    this.paperEl.dataset.dropped = 'true';
    this.paperEl.classList.add('in-drop-zone');
    this.applyTransform(smooth);
    const delay = smooth ? 340 : 0;
    setTimeout(() => {
      if (this.paperEl) {
        this.paperEl.classList.add('collected-hidden');
      }
    }, delay);
    return true;
  }

  releaseFromSlot() {
    if (!this.paperEl) return;
    this.paperEl.dataset.locked = 'false';
    this.paperEl.dataset.dropped = 'false';
    this.paperEl.classList.remove('in-drop-zone');
    this.paperEl.classList.remove('collected-hidden');
    this.scale = 1;
    this.applyTransform();
  }

  checkDropZoneSnap() {
    if (!dropZoneEl || !this.paperEl) return false;
    const cardRect = this.paperEl.getBoundingClientRect();
    const zoneRect = dropZoneEl.getBoundingClientRect();
    const bufferPx = 90;
    const isInside = isCenterInside(cardRect, zoneRect, bufferPx);

    if (isInside) {
      const newlyDropped = this.paperEl.dataset.dropped !== 'true';
      const snapped = this.snapToSlot({ smooth: newlyDropped });
      if (snapped && newlyDropped) {
        fireDropState(this.paperEl, true);
      }
      return true;
    }
    if (dropZoneEl) dropZoneEl.classList.remove('active');
    return false;
  }

  init(paper) {
    this.paperEl = paper;
    const isNarrow = window.matchMedia('(max-width: 768px)').matches;
    const startX = isNarrow ? (Math.random() * 160 - 80) : (-180 - Math.random() * 360);
    const startY = isNarrow ? (Math.random() * 140 - 60) : ((Math.random() * 320) - 200);
    this.currentPaperX = startX;
    this.currentPaperY = startY;
    this.scale = 1;
    this.applyTransform();

    document.addEventListener('mousemove', (e) => {
      if (!this.rotating) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        this.velX = this.mouseX - this.prevMouseX;
        this.velY = this.mouseY - this.prevMouseY;
      }

      const dirX = e.clientX - this.mouseTouchX;
      const dirY = e.clientY - this.mouseTouchY;
      const dirLength = Math.sqrt(dirX*dirX + dirY*dirY) || 1;
      const angle = Math.atan2(dirY/dirLength, dirX/dirLength);
      let degrees = 180 * angle / Math.PI;
      degrees = (360 + Math.round(degrees)) % 360;
      if (this.rotating) this.rotation = degrees;

      if (this.holdingPaper) {
        if (!this.rotating) {
          this.currentPaperX += this.velX;
          this.currentPaperY += this.velY;
        }
        this.prevMouseX = this.mouseX;
        this.prevMouseY = this.mouseY;
        this.applyTransform();

        if (dropZoneEl) {
          const cardRect = paper.getBoundingClientRect();
          const zoneRect = dropZoneEl.getBoundingClientRect();
          const highlighted = isCenterInside(cardRect, zoneRect, 100);
          dropZoneEl.classList.toggle('active', highlighted);
        }
      }
    });

    paper.addEventListener('mousedown', (e) => {
      if (this.holdingPaper || paper.dataset.locked === 'true') return;
      this.holdingPaper = true;
      paper.style.zIndex = highestZ++;
      if (e.button === 0) {
        this.mouseTouchX = this.mouseX;
        this.mouseTouchY = this.mouseY;
        this.prevMouseX = this.mouseX;
        this.prevMouseY = this.mouseY;
      }
      if (e.button === 2) this.rotating = true;
      paper.style.cursor = 'grabbing';
    });

    window.addEventListener('mouseup', () => {
      if (this.holdingPaper) {
        this.holdingPaper = false;
        this.rotating = false;
        paper.style.cursor = 'grab';
        if (paper.dataset.locked !== 'true') {
          this.currentPaperX += this.velX * 0.6;
          this.currentPaperY += this.velY * 0.6;
          this.scale = 1;
          this.applyTransform();
        }
        const snapped = this.checkDropZoneSnap();
        if (!snapped && dropZoneEl) {
          dropZoneEl.classList.remove('active');
        }
      } else if (dropZoneEl) {
        dropZoneEl.classList.remove('active');
      }
    });

    paper.addEventListener('contextmenu', (ev) => ev.preventDefault());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  dropZoneEl = document.querySelector('.memory-box');
  // only initialize draggable behavior for the actual photo cards
  const papers = Array.from(document.querySelectorAll('.paper.glass.image, .paper.image'));
  configureDropGrid(papers.length);
  papers.forEach(p => {
    const instance = new Paper();
    instance.init(p);
    cardInstances.push(instance);
  });

  window.addEventListener('resize', () => {
    cardInstances.forEach(instance => {
      if (instance.paperEl?.dataset.dropped === 'true') {
        instance.snapToSlot({ smooth: false });
      }
    });
  });
});
