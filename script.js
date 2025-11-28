// script.js — desktop mouse dragging behavior (glass cards)
// Polished, responsive drag + drop integration with window.handlePaperDrop

let highestZ = 1;

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
  }

  init(paper) {
    this.paperEl = paper;

    // start cards scattered slightly for natural look
    const startX = (Math.random() - 0.5) * 640;
    const startY = (Math.random() - 0.5) * 360;
    this.currentPaperX = startX;
    this.currentPaperY = startY;
    paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;

    // Track global mouse for velocity
    document.addEventListener('mousemove', (e) => {
      if (!this.rotating) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        this.velX = this.mouseX - this.prevMouseX;
        this.velY = this.mouseY - this.prevMouseY;
      }

      // compute angle if rotating
      const dirX = e.clientX - this.mouseTouchX;
      const dirY = e.clientY - this.mouseTouchY;
      const dirLength = Math.sqrt(dirX*dirX + dirY*dirY) || 1;
      const angle = Math.atan2(dirY / dirLength, dirX / dirLength);
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
        paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
      }
    });

    // pointer down on a paper
    paper.addEventListener('mousedown', (e) => {
      if (this.holdingPaper) return;
      this.holdingPaper = true;
      paper.style.zIndex = highestZ++;
      // left button: drag; right-button: rotate
      if (e.button === 0) {
        this.mouseTouchX = this.mouseX;
        this.mouseTouchY = this.mouseY;
        this.prevMouseX = this.mouseX;
        this.prevMouseY = this.mouseY;
      }
      if (e.button === 2) this.rotating = true;
      paper.style.cursor = 'grabbing';
    });

    // release: apply momentum and notify drop handler
    window.addEventListener('mouseup', (ev) => {
      if (this.holdingPaper) {
        this.holdingPaper = false;
        this.rotating = false;
        paper.style.cursor = 'grab';

        // small momentum push
        this.currentPaperX += this.velX * 2;
        this.currentPaperY += this.velY * 2;
        paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;

        // notify global drop handler (if present) for dropbox detection
        if (typeof window.handlePaperDrop === 'function') {
          try {
            window.handlePaperDrop(paper);
          } catch (err) {
            console.error('handlePaperDrop threw:', err);
          }
        }
      }
    });

    // prevent context menu on right-click (used for rotate)
    paper.addEventListener('contextmenu', (ev) => ev.preventDefault());
  }
}

// initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const papers = Array.from(document.querySelectorAll('.paper.glass.image, .paper.image'));
  papers.forEach(p => {
    const instance = new Paper();
    instance.init(p);
  });
});
