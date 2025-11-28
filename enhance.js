// enhance.js — pages swap in-place and remove floating thumbs from intro
document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------
     Modal + Collect overlay
     -------------------------- */
  const modal = document.createElement('div');
  modal.className = 'modal-slideshow';
  modal.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true">
      <div class="modal-pages">
        <div class="page-stage" id="__pageStage" aria-live="polite"></div>
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

  /* --------------------------
     References (queried later when needed)
     -------------------------- */
  const pageStage = document.getElementById('__pageStage');
  const progressBar = document.querySelector('#__progress > i');
  const dotsRow = document.getElementById('__dots');

  // Ensure the stage is positioned so pages can absolutely stack
  if (pageStage) {
    pageStage.style.position = 'relative';
    pageStage.style.width = '100%';
    pageStage.style.height = '100%';
    pageStage.style.overflow = 'hidden';
  }

  /* --------------------------
     Utility: collect image nodes
     -------------------------- */
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

  /* --------------------------
     Typewriter helper
     -------------------------- */
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

  /* --------------------------
     Build pages data & DOM
     -------------------------- */
  function buildPagesData(){
    const loveMessage = `Happy Birthday, gorgeous. I hope your day is filled with smiles… and I hope I’m the reason behind most of them.
You’re the warmth I crave, the peace I feel, and the love I breathe. Happy Birthday, my everything.

Every part of you feels like poetry written just for me. Wishing a magical birthday to the one my soul adores.`;

    const secondMessage = `You’re the warmth I crave, the peace I feel, and the love I breathe. Happy Birthday, my everything.

Every part of you feels like poetry written just for me. Wishing a magical birthday to the one my soul adores.`;

    const finalText = `Happy Birthday! Wishing you a day as wonderful and radiant as you are. All my love, today and always.`;

    const imagePages = collectImageNodes().map(it => Object.assign({type:'photo'}, it));

    const pages = [
      // note: bg left blank to match your theme; if you want bg.jpg, set bg:'bg.jpg'
      { type:'intro', bg: '', title: 'For You, My girl', text: loveMessage },
      { type:'text2', bg: '', title: 'A Wish for You', text: secondMessage },
      { type:'final', title: 'Happy Birthday!  Rajashree', text: finalText }
    ];
    pages.push(...imagePages);
    return pages;
  }

  function buildPagesDOM(){
    const data = buildPagesData();
    pageStage.innerHTML = ''; dotsRow.innerHTML = '';

    data.forEach((p, idx) => {
      const page = document.createElement('div');
      page.className = 'page';
      // make pages absolutely stacked inside the pageStage
      page.style.position = 'absolute';
      page.style.inset = '0';
      page.style.display = 'flex';
      page.style.alignItems = 'center';
      page.style.justifyContent = 'center';
      page.style.padding = '18px';
      page.style.boxSizing = 'border-box';

      if (p.type === 'intro') {
        page.classList.add('intro-text-page');
        if (p.bg) page.style.backgroundImage = `url('${p.bg}')`;
        // IMPORTANT: removed floating-thumbs to avoid blocking the intro reading
        page.innerHTML = `
          <div class="intro-text-wrap" style="position:relative;z-index:2;max-width:820px;text-align:center">
            <h2 class="intro-title">${p.title}</h2>
            <div class="intro-desc typewriter" data-full="${p.text.replace(/\n/g,'\\n')}"></div>
            <div style="margin-top:18px"><button class="page-nav primary" id="__nextFromIntro">Next</button></div>
          </div>
        `;
      } else if (p.type === 'text2') {
        page.classList.add('text-bg');
        if (p.bg) page.style.backgroundImage = `url('${p.bg}')`;
        page.innerHTML = `
          <div class="text-wrap" style="position:relative;z-index:2;max-width:820px;text-align:center">
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
        // place photo on top and text in a column for mobile friendly view;
        page.innerHTML = `
          <div style="width:100%;max-width:960px;display:flex;flex-direction:row;gap:18px;align-items:center;justify-content:center;flex-wrap:wrap">
            <div class="photo" style="flex:1;min-width:260px;display:flex;align-items:center;justify-content:center">
              ${p.src ? `<img src="${p.src}" alt="photo" style="max-width:100%;border-radius:10px;max-height:70vh;object-fit:cover">` : `<div style="color:rgba(255,255,255,0.7);padding:12px">No photo</div>`}
            </div>
            <div class="text" style="width:360px;min-width:220px;padding:12px;display:flex;flex-direction:column;gap:8px;justify-content:center">
              <h3 class="title">${p.title}</h3>
              <div class="desc typewriter" data-full="${(p.desc||'').replace(/\n/g,'\\n')}"></div>
            </div>
          </div>
        `;
      }

      // hide by default; active page will be toggled later
      page.classList.remove('active');
      pageStage.appendChild(page);

      const dot = document.createElement('div'); dot.className='dot';
      dot.addEventListener('click', ()=> goToPage(idx));
      dotsRow.appendChild(dot);
    });

    // wire inline Next/Celebrate after DOM built
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

  /* --------------------------
     Floating thumbs (NO-OP)
     -------------------------- */
  // we intentionally disable floating thumbs in the intro so text is unobstructed.
  function spawnFloatingThumbs(){
    // no-op on purpose (keeps intro clean for readability).
    return;
  }

  /* --------------------------
     Page state + navigation
     -------------------------- */
  let pages = [];
  let current = 0;

  function setActivePage(i){
    i = Math.max(0, Math.min(i, pages.length - 1));
    pages.forEach((pg, idx) => {
      const isActive = idx === i;
      pg.classList.toggle('active', isActive);
      // animate via opacity & transform (existing CSS .page.active should apply)
      pg.style.pointerEvents = isActive ? 'auto' : 'none';
      if (!isActive) {
        // keep non-active pages visually hidden to avoid layout jump
        pg.style.opacity = '0';
        pg.style.transform = 'translateY(10px) scale(.995)';
      } else {
        pg.style.opacity = '1';
        pg.style.transform = 'translateY(0) scale(1)';
      }
    });
    Array.from(dotsRow.children).forEach((d, idx) => d.classList.toggle('active', idx === i));
    current = i;

    if (progressBar) {
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
    }

    const page = pages[i];
    if (!page) return;
    const typeEl = page.querySelector('.typewriter');

    // typewriter: if present, run it; otherwise immediately fill progress
    if (typeEl) {
      const full = typeEl.dataset.full || '';
      typeText(typeEl, full, 26).then(()=> {
        if (progressBar) {
          progressBar.style.transition = `width 900ms linear`;
          progressBar.style.width = '100%';
        }
      });
    } else {
      if (progressBar) {
        progressBar.style.transition = `width 250ms linear`;
        progressBar.style.width = '100%';
      }
    }
  }

  function goToPage(i){ setActivePage(i); }

  /* --------------------------
     Confetti + finalCelebrate
     -------------------------- */
  function finalCelebrate(){ burstConfetti(); }
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

  /* --------------------------
     Open slideshow flow (robust wiring)
     -------------------------- */
  function openSlideshowFlow(){
    pages = buildPagesDOM();

    // dim others visually (modal overlay)
    document.querySelectorAll('body > *').forEach(el => {
      if (el !== modal && el !== collectOverlay) el.classList.add('dimmed');
    });
    modal.classList.add('open');

    // re-wire controls after DOM ready
    setTimeout(() => {
      const prev = document.getElementById('__prevPage');
      const next = document.getElementById('__nextPage');
      const close = document.getElementById('__closeFlow');

      if (prev) {
        prev.onclick = () => {
          if (current > 0) goToPage(current - 1);
        };
      }
      if (next) {
        next.onclick = () => {
          if (current < pages.length - 1) goToPage(current + 1);
          else finalCelebrate();
        };
      }
      if (close) {
        close.onclick = () => closeSlideshow();
      }

      if (pages && pages.length) setActivePage(0);
      else console.warn('openSlideshowFlow: no pages built');
    }, 120);
  }

  function closeSlideshow(){
    modal.classList.remove('open');
    document.querySelectorAll('.dimmed').forEach(el => el.classList.remove('dimmed'));
    pages = buildPagesDOM(); // rebuild for next open
  }

  window.__openSurpriseFlow = openSlideshowFlow;

  /* --------------------------
     Ensure a dropbox exists (small, responsive)
     -------------------------- */
  function ensureDropbox(){
    let guide = document.querySelector('.paper-guide');
    if (!guide) {
      guide = document.createElement('div');
      guide.className = 'paper-guide';
      document.body.appendChild(guide);
    }
    guide.innerHTML = `
      <div class="guide-text">Drag each card up and <strong>drop here</strong></div>
      <div class="dropbox" id="__dropbox">DROP HERE</div>
    `;
    return document.getElementById('__dropbox');
  }
  const dropbox = ensureDropbox();

  /* --------------------------
     Drop-based collection logic
     -------------------------- */
  let imageNodes = collectImageNodes();
  const collected = new Set();

  function markCollected(node){
    if (!node) return;
    if (node.classList.contains('collected')) return;
    node.classList.add('collected');
    node.style.transition = 'transform 360ms ease, opacity 360ms ease';
    node.style.opacity = '0';
    node.style.transform = 'scale(.86) translateY(-20px)';
    setTimeout(()=> {
      node.style.display = 'none';
      collected.add(node);
      const guideCountEl = document.querySelector('.paper-guide .guide-text');
      if (guideCountEl) guideCountEl.innerHTML = `Collected ${collected.size} / ${imageNodes.length}`;
      if (collected.size === imageNodes.length) {
        collectOverlay.classList.add('open');
        document.querySelectorAll('body > *').forEach(el => { if (el !== collectOverlay) el.classList.add('dimmed-hide'); });
      }
    }, 380);
  }

  function intersectsRect(a, b){
    return !(b.left > a.right || b.right < a.left || b.top > a.bottom || b.bottom < a.top);
  }

  // global handler called by script.js and mobile.js when a paper is released
  window.handlePaperDrop = function(paper){
    try {
      const pRect = paper.getBoundingClientRect();
      const dRect = dropbox.getBoundingClientRect();
      if (intersectsRect(pRect, dRect)) {
        dropbox.classList.add('active');
        setTimeout(()=> dropbox.classList.remove('active'), 420);
        markCollected(paper);
      } else {
        // not dropped in box — small nudge visual
        paper.animate([{transform: getComputedStyle(paper).transform}, {transform: getComputedStyle(paper).transform}], {duration:120});
      }
    } catch (err) {
      console.error('handlePaperDrop error', err);
    }
  };

  /* --------------------------
     Collect overlay click delegation
     -------------------------- */
  collectOverlay.addEventListener('click', function (ev) {
    const target = ev.target;
    if (target && (target.id === '__viewSurpriseBtn' || (target.closest && target.closest('#__viewSurpriseBtn')))) {
      ev.preventDefault();
      collectOverlay.classList.remove('open');
      document.querySelectorAll('.dimmed').forEach(el => el.classList.remove('dimmed'));
      document.querySelectorAll('.dimmed-hide').forEach(el => el.classList.remove('dimmed-hide'));
      openSlideshowFlow();
    }
  });

  function attachViewButtonIfPresent(){
    const btn = collectOverlay.querySelector('#__viewSurpriseBtn');
    if (btn && !btn.__attached) {
      btn.__attached = true;
      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        collectOverlay.classList.remove('open');
        document.querySelectorAll('.dimmed').forEach(el => el.classList.remove('dimmed'));
        document.querySelectorAll('.dimmed-hide').forEach(el => el.classList.remove('dimmed-hide'));
        openSlideshowFlow();
      });
    }
  }
  attachViewButtonIfPresent();

  /* --------------------------
     Intro overlay with zoom hint
     -------------------------- */
  const intro = document.createElement('div'); intro.className='intro-overlay';
  intro.innerHTML = `
    <div class="card">
      <h1> Surprise! 🎁 </h1>
      <p>For best mobile view: pinch to slightly zoom out (if needed), then tap <strong>I'm ready</strong>. Or tap Start anyway.</p>
      <div style="display:flex;gap:10px;justify-content:center;margin-top:14px">
        <button class="page-nav primary" id="__zoomOk">I'm ready</button>
        <button class="page-nav ghost" id="__startAnyway">Start anyway</button>
      </div>
    </div>`;
  document.body.appendChild(intro);

  const zoomOkBtn = document.getElementById('__zoomOk');
  const startAnywayBtn = document.getElementById('__startAnyway');

  function removeIntroAndShowHint(){
    intro.style.opacity='0'; intro.style.transform='scale(.98)';
    setTimeout(()=> intro.remove(), 380);
    const hint = document.createElement('div'); hint.className='drag-hint'; hint.textContent='Tip: Drag any card UP and drop into the box';
    document.body.appendChild(hint);
    setTimeout(()=> hint.remove(), 7000);
    const g = document.querySelector('.paper-guide .guide-text');
    if (g) g.innerHTML = `Drag each card up and <strong>drop here</strong>`;
    document.querySelectorAll('.paper').forEach(p => p.classList.remove('hidden'));
  }

  if (zoomOkBtn) {
    zoomOkBtn.addEventListener('click', ()=> {
      document.body.classList.add('zoom-ok');
      removeIntroAndShowHint();
    });
  }
  if (startAnywayBtn) {
    startAnywayBtn.addEventListener('click', ()=> {
      document.body.classList.add('zoom-ok');
      removeIntroAndShowHint();
    });
  }

  // hide papers until user confirms
  document.querySelectorAll('.paper').forEach(p => p.classList.add('hidden'));

  // highlight dropbox on mouse move over it
  document.addEventListener('mousemove', (e) => {
    if (!dropbox) return;
    const rect = dropbox.getBoundingClientRect();
    if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom){
      dropbox.classList.add('active');
    } else {
      dropbox.classList.remove('active');
    }
  });

  /* --------------------------
     Defensive: update imageNodes if DOM changes
     -------------------------- */
  const observer = new MutationObserver(() => {
    imageNodes = collectImageNodes();
  });
  observer.observe(document.body, {childList:true, subtree:true});

  console.log('enhance.js loaded — modal + dropbox initialized (in-place pages, intro thumbs disabled)');

});
