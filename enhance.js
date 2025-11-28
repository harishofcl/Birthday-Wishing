// enhance.js — require collecting all photos first, then manual multi-text flow with two background text pages and final wish
document.addEventListener('DOMContentLoaded', () => {

  /* Modal skeleton */
  const modal = document.createElement('div');
  modal.className = 'modal-slideshow';
  modal.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true">
      <div class="modal-pages">
        <div class="page-stage" id="__pageStage"></div>
        <div class="controls-row">
          <button class="page-nav ghost" id="__prevPage">◂ Prev</button>
          <div class="page-progress" id="__progress"><i style="width:0%"></i></div>
          <div class="page-dots" id="__dots"></div>
          <button class="page-nav primary" id="__nextPage">Next Surprise ➜</button>
          <button class="page-nav ghost" id="__closeFlow">Close</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  /* Collect-overlay (shown once all photos collected) */
  const collectOverlay = document.createElement('div');
  collectOverlay.className = 'collect-overlay';
  collectOverlay.innerHTML = `
    <div class="collect-card">
      <h3>You collected all photos!</h3>
      <p>Ready to see the surprise?</p>
      <div style="display:flex;gap:10px;justify-content:center;margin-top:14px">
        <button class="btn" id="__viewSurpriseBtn">View Surprise</button>
      </div>
    </div>
  `;
  document.body.appendChild(collectOverlay);

  // now get viewSurpriseBtn safely
  const viewSurpriseBtn = document.getElementById('__viewSurpriseBtn');

  /* Page stage elements */
  const pageStage = document.getElementById('__pageStage');
  const progressBar = document.querySelector('#__progress > i');
  const dotsRow = document.getElementById('__dots');
  const prevPageBtn = document.getElementById('__prevPage');
  const nextPageBtn = document.getElementById('__nextPage');
  const closeFlowBtn = document.getElementById('__closeFlow');

  /* Utility: read .paper.image nodes (use caption structure) */
  function collectImageNodes(){
    const nodes = Array.from(document.querySelectorAll('.paper.image'));
    return nodes.map((node, idx) => {
      const img = node.querySelector('img');
      const titleEl = node.querySelector('.cap-title');
      const subEl = node.querySelector('.cap-sub');
      return {
        src: img ? img.src : '',
        title: titleEl ? titleEl.innerText : `Memory ${idx+1}`,
        desc: subEl ? subEl.innerText : `Cherished memory ${idx+1}`,
        node
      };
    });
  }

  /* Typewriter */
  function typeText(el, text, speed=28){
    return new Promise(resolve=>{
      el.textContent = '';
      let i=0;
      const run = ()=>{
        if (i <= text.length){
          el.textContent = text.slice(0,i);
          i++;
          setTimeout(run, speed);
        } else resolve();
      };
      run();
    });
  }

  /* Build pages data: intro -> text2 -> final -> photo pages */
  function buildPagesData(){
    const loveMessage = `Happy Birthday, gorgeous. I hope your day is filled with smiles… and I hope I’m the reason behind most of them.
You’re the warmth I crave, the peace I feel, and the love I breathe. Happy Birthday, my everything.

Every part of you feels like poetry written just for me. Wishing a magical birthday to the one my soul adores.`;

    const secondMessage = `You’re the warmth I crave, the peace I feel, and the love I breathe. Happy Birthday, my everything.

Every part of you feels like poetry written just for me. Wishing a magical birthday to the one my soul adores.`;

    const finalText = `Happy Birthday!Wishing you a day as wonderful and radiant as you are. All my love, today and always.`;

    const imagePages = collectImageNodes().map(it => Object.assign({type:'photo'}, it));

    const pages = [
      { type:'intro', bg: 'bg.jpg', title: 'For You, My girl', text: loveMessage },
      { type:'text2', bg: 'bg2.jpg', title: 'A Wish for You', text: secondMessage },
      { type:'final', title: 'Happy Birthday!  Rajashree', text: finalText }
    ];
    pages.push(...imagePages);
    return pages;
  }

  /* Build DOM pages */
  function buildPagesDOM(){
    const data = buildPagesData();
    pageStage.innerHTML = ''; dotsRow.innerHTML = '';
    data.forEach((p, idx) => {
      const page = document.createElement('div'); page.className='page';
      if (p.type === 'intro') {
        page.classList.add('intro-text-page');
        if (p.bg) page.style.backgroundImage = `url('${p.bg}')`;
        page.innerHTML = `
          <div class="intro-text-wrap">
            <h2 class="intro-title">${p.title}</h2>
            <div class="intro-desc typewriter" data-full="${p.text.replace(/\n/g,'\\n')}"></div>
            <div style="margin-top:18px"><button class="page-nav primary" id="__nextFromIntro">Next</button></div>
          </div>
          <div class="floating-thumbs" aria-hidden="true"></div>
        `;
      } else if (p.type === 'text2') {
        page.classList.add('text-bg');
        if (p.bg) page.style.backgroundImage = `url('${p.bg}')`;
        page.innerHTML = `
          <div class="text-wrap">
            <h3 class="text-title">${p.title}</h3>
            <div class="text-desc typewriter" data-full="${p.text.replace(/\n/g,'\\n')}"></div>
            <div style="margin-top:18px"><button class="page-nav primary" id="__nextFromText2">Next</button></div>
          </div>
        `;
      } else if (p.type === 'final') {
        page.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:20px;text-align:center">
            <h1 style="font-size:34px;margin:0;color:var(--accent1)">🎂 ${p.title}</h1>
            <p style="margin:0;color:rgba(255,255,255,0.9);font-size:18px;line-height:1.5">${p.text.replace(/\n/g,'<br>')}</p>
            <div style="margin-top:16px">
              <button class="page-nav primary" id="__celebrateBtn">Celebrate 🎊</button>
            </div>
          </div>
        `;
      } else { // photo page
        page.innerHTML = `
          <div class="photo">${p.src ? `<img src="${p.src}" alt="photo">` : `<div style="color:rgba(255,255,255,0.7);padding:12px">No photo</div>`}</div>
          <div class="text">
            <h3 class="title">${p.title}</h3>
            <div class="desc typewriter" data-full="${(p.desc||'').replace(/\n/g,'\\n')}"></div>
          </div>
        `;
      }
      pageStage.appendChild(page);

      const dot = document.createElement('div'); dot.className='dot';
      dot.addEventListener('click', ()=> goToPage(idx));
      dotsRow.appendChild(dot);
    });

    // add inline Next buttons after DOM built
    setTimeout(()=> {
      const next1 = document.getElementById('__nextFromIntro');
      if (next1) next1.addEventListener('click', ()=> {
        const pagesArr = Array.from(document.querySelectorAll('.page'));
        const idx = pagesArr.indexOf(document.querySelector('.page.intro-text-page'));
        if (idx >= 0) goToPage(idx + 1);
      });
      const next2 = document.getElementById('__nextFromText2');
      if (next2) next2.addEventListener('click', ()=> {
        const pagesArr = Array.from(document.querySelectorAll('.page'));
        const t2 = document.querySelector('.page.text-bg');
        const idx = pagesArr.indexOf(t2);
        if (idx >= 0) goToPage(idx + 1);
      });
      const celebrateBtn = document.getElementById('__celebrateBtn');
      if (celebrateBtn) celebrateBtn.addEventListener('click', ()=> {
        burstConfetti();
      });
    }, 60);

    return Array.from(document.querySelectorAll('.page'));
  }

  /* Floating thumbs for intro */
  function spawnFloatingThumbs(){
    if (!pages || !pages[0]) return;
    const intro = pages[0];
    const holder = intro.querySelector('.floating-thumbs'); if(!holder) return;
    holder.innerHTML='';
    const imgs = collectImageNodes().map(i=>i.src).filter(Boolean);
    if(!imgs.length) return;
    const maxThumbs = Math.min(8, imgs.length);
    for (let i=0;i<maxThumbs;i++){
      const thumb = document.createElement('div'); thumb.className='thumb';
      const img = document.createElement('img'); img.src = imgs[i % imgs.length];
      img.style.width='100%'; img.style.height='100%'; img.style.objectFit='cover';
      thumb.appendChild(img);
      const left = 5 + Math.random()*75; const top = 2 + Math.random()*80;
      thumb.style.left = `${left}%`; thumb.style.top = `${top}%`;
      const delay = Math.random()*2; const duration = 8 + Math.random()*6;
      thumb.style.animationDelay = `${delay}s`; thumb.style.animationDuration = `${duration}s`;
      const rot = Math.random()*40 - 20; thumb.style.transform = `rotate(${rot}deg)`;
      holder.appendChild(thumb);
    }
  }

  /* Page logic: manual-only (no auto-advance) */
  let pages = [];
  let current = 0;

  function setActivePage(i){
    i = Math.max(0, Math.min(i, pages.length - 1));
    pages.forEach((pg, idx) => pg.classList.toggle('active', idx === i));
    Array.from(dotsRow.children).forEach((d, idx) => d.classList.toggle('active', idx === i));
    current = i;

    // reset progress bar
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';

    const page = pages[i];
    if (!page) return;
    const typeEl = page.querySelector('.typewriter');
    if (!typeEl) return;

    // type the text (if any) — for intro and text2 we also spawn thumbs / show Next inline
    const full = typeEl.dataset.full || '';
    typeText(typeEl, full, 26).then(()=> {
      progressBar.style.transition = `width 900ms linear`;
      progressBar.style.width = '100%';
      // if intro spawn thumbs after typing
      if (i === 0) spawnFloatingThumbs();
    });
  }

  function goToPage(i){
    setActivePage(i);
  }

  prevPageBtn.addEventListener('click', ()=> { if (current > 0) goToPage(current - 1); });
  nextPageBtn.addEventListener('click', ()=> { if (current < pages.length - 1) goToPage(current + 1); else finalCelebrate(); });
  closeFlowBtn.addEventListener('click', closeSlideshow);

  /* finalCelebrate simply opens a confetti burst and keeps the final page visible */
  function finalCelebrate(){
    burstConfetti();
  }

  function burstConfetti(){
    const confRoot = document.createElement('div'); confRoot.style.position='fixed'; confRoot.style.inset='0'; confRoot.style.pointerEvents='none'; confRoot.style.zIndex=12000; document.body.appendChild(confRoot);
    const colors = ['#ff7aa2','#ffd47a','#7ae7ff','#b58cff','#8fffb5'];
    for (let i=0;i<90;i++){
      const c = document.createElement('div'); c.className='confetti-piece';
      c.style.left = (10 + Math.random()*80) + '%'; c.style.top = (Math.random()*10) + '%'; c.style.background = colors[Math.floor(Math.random()*colors.length)];
      confRoot.appendChild(c);
      const dx = (Math.random()-0.5)*900; const dur = 1400 + Math.random()*1600;
      c.animate([{transform:`translate(0,0) rotate(0deg)`, opacity:1},{transform:`translate(${dx}px, ${700 + Math.random()*260}px) rotate(${Math.random()*720}deg)`, opacity:0}], {duration:dur, easing:'cubic-bezier(.2,.9,.2,1)'});
      setTimeout(()=> c.remove(), dur+50);
    }
    setTimeout(()=> confRoot.remove(), 3500);
  }

  /* open/close helpers */
  function openSlideshowFlow(){
    pages = buildPagesDOM();
    document.querySelectorAll('body > *').forEach(el => { if (el !== modal && el !== collectOverlay) el.classList.add('dimmed'); });
    modal.classList.add('open');
    setTimeout(()=> setActivePage(0), 140);
  }
  function closeSlideshow(){
    modal.classList.remove('open');
    document.querySelectorAll('.dimmed').forEach(el=> el.classList.remove('dimmed'));
    pages = buildPagesDOM();
  }

  window.__openSurpriseFlow = openSlideshowFlow;

  /* Detect per-card collection (drag up) and show overlay when all collected */
  let imageNodes = collectImageNodes(); // initial list
  let trackedNodes = imageNodes.map(i => i.node);
  const collected = new Set();
  const feedEntries = new Map();
  const guideCountEl = document.querySelector('.paper-guide .collected-count');
  const memoryBoxFeed = document.querySelector('.memory-box-feed');
  if (guideCountEl) guideCountEl.innerText = `0 / ${trackedNodes.length} collected`;
  let overlayShown = false;

  function ensureFeedPlaceholder(){
    if (!memoryBoxFeed) return;
    if (memoryBoxFeed.querySelector('.memory-feed-item')) return;
    if (!memoryBoxFeed.querySelector('.placeholder')) {
      const placeholder = document.createElement('p');
      placeholder.className = 'placeholder';
      placeholder.textContent = 'No memories collected yet.';
      memoryBoxFeed.appendChild(placeholder);
    }
  }

  function addFeedEntry(node){
    if (!memoryBoxFeed || !node) return;
    const title = node.querySelector('.cap-title')?.innerText?.trim() || 'Memory';
    const sub = node.querySelector('.cap-sub')?.innerText?.trim() || 'Captured moment';
    const placeholder = memoryBoxFeed.querySelector('.placeholder');
    if (placeholder) placeholder.remove();
    const entry = document.createElement('div');
    entry.className = 'memory-feed-item';
    entry.innerHTML = `<strong>${title}</strong><p>${sub}</p>`;
    memoryBoxFeed.prepend(entry);
    requestAnimationFrame(()=> entry.classList.add('visible'));
    feedEntries.set(node, entry);
    const items = memoryBoxFeed.querySelectorAll('.memory-feed-item');
    if (items.length > 3) {
      const last = items[items.length - 1];
      feedEntries.forEach((val, key) => {
        if (val === last) feedEntries.delete(key);
      });
      last.remove();
    }
  }

  function removeFeedEntry(node){
    if (!memoryBoxFeed || !node) return;
    const entry = feedEntries.get(node);
    if (entry) {
      entry.classList.remove('visible');
      setTimeout(()=> entry.remove(), 280);
      feedEntries.delete(node);
    }
    setTimeout(()=> ensureFeedPlaceholder(), 300);
  }

  ensureFeedPlaceholder();

  function updateGuide(){
    if (guideCountEl) guideCountEl.innerText = `${collected.size} / ${trackedNodes.length} collected`;
  }

  // mark element visually when collected
  function markCollected(node){
    if (!node || collected.has(node)) return;
    collected.add(node);
    if (!node.querySelector('.collected-badge')) {
      const badge = document.createElement('div');
      badge.className = 'collected-badge';
      badge.innerText = 'Collected';
      node.appendChild(badge);
    }
    updateGuide();
    addFeedEntry(node);
  }

  function unmarkCollected(node){
    if (!node || !collected.has(node)) return;
    collected.delete(node);
    const badge = node.querySelector('.collected-badge');
    if (badge) badge.remove();
    updateGuide();
    removeFeedEntry(node);
  }

  function maybeShowOverlay(){
    if (overlayShown || trackedNodes.length === 0) return;
    if (collected.size === trackedNodes.length) {
      overlayShown = true;
      collectOverlay.classList.add('open');
      document.querySelectorAll('body > *').forEach(el => {
        if (el !== collectOverlay) el.classList.add('dimmed');
      });
    }
  }

  document.addEventListener('paper-drop-state', (event) => {
    const { node, dropped } = event.detail || {};
    if (!node || !trackedNodes.includes(node)) return;
    if (dropped) {
      markCollected(node);
    } else {
      unmarkCollected(node);
    }
    maybeShowOverlay();
  });

  // when user clicks view surprise: hide overlay and open flow
  if (viewSurpriseBtn) {
    viewSurpriseBtn.addEventListener('click', ()=> {
      collectOverlay.classList.remove('open');
      document.querySelectorAll('.dimmed').forEach(el=> el.classList.remove('dimmed'));
      openSlideshowFlow();
    });
  }

  /* initial intro overlay / start */
  const intro = document.createElement('div'); intro.className='intro-overlay';
  intro.innerHTML = `<div class="card"><h1> Surprise, Rajashree! 🎁 </h1><p>Click <strong>Start</strong> to enter. Drag each card into the glowing Memory Box on the right — collect all to view the surprise.</p><button class="page-nav primary" id="__startSurprise">Start</button></div>`;
  document.body.appendChild(intro);
  document.body.classList.add('intro-locked');
  const startBtn = document.getElementById('__startSurprise');
  if (startBtn) {
    startBtn.addEventListener('click', ()=> {
      intro.style.opacity='0'; intro.style.transform='scale(.98)';
      setTimeout(()=> intro.remove(), 420);
      document.body.classList.remove('intro-locked');
      const hint = document.createElement('div'); hint.className='drag-hint'; hint.textContent='Tip: Drag a card toward the Memory Box on the right →';
      document.body.appendChild(hint);
      setTimeout(()=> hint.remove(), 7000);
    });
  }

});
