// script.js — desktop mouse dragging behavior (glass cards)
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
    const startX = (Math.random() - 0.5) * 640;
    const startY = (Math.random() - 0.5) * 360;
    this.currentPaperX = startX;
    this.currentPaperY = startY;
    paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;

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
        paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
      }
    });

    paper.addEventListener('mousedown', (e) => {
      if (this.holdingPaper) return;
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

    window.addEventListener('mouseup', (ev) => {
      if (this.holdingPaper) {
        this.holdingPaper = false;
        this.rotating = false;
        paper.style.cursor = 'grab';
        this.currentPaperX += this.velX * 2;
        this.currentPaperY += this.velY * 2;
        paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
        // call global drop handler if present
        if (typeof window.handlePaperDrop === 'function') {
          try { window.handlePaperDrop(paper); } catch (err) { console.error(err); }
        }
      }
    });

    paper.addEventListener('contextmenu', (ev) => ev.preventDefault());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // only initialize draggable behavior for the actual photo cards
  const papers = Array.from(document.querySelectorAll('.paper.glass.image, .paper.image'));
  papers.forEach(p => {
    const instance = new Paper();
    instance.init(p);
  });
});
