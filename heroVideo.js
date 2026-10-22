/* ===== Coastal Air & Electrical: heroVideo.js =====
   Scroll-scrubbed cinematic hero (image sequence on a canvas) */
(() => {
'use strict';
const sec = document.querySelector('[data-hvid]');
if (!sec) return;

/* ====== SETTINGS ====== */
const CFG = {
  count: 240,                 // number of frames in frames/d (check with Step 1.4)
  desktop: 'frames/d/', mobile: 'frames/m/', ext: 'webp', pad: 4,
  focusX: .68,                // where to crop on tall phone screens (0 = left, 1 = right). .68 keeps the aircon in view
  finalAt: .88                // when the remote dial appears
};
/* ====================== */

const $ = (s, c = sec) => c.querySelector(s), $$ = (s, c = sec) => [...c.querySelectorAll(s)];
const ROOT = document.body.dataset.root || '';
const stage = $('.h3d-stage'), steps = $$('[data-step-at]'), dots = $$('.h3d-rail button');
const intro = $('.h3d-intro'), finale = $('.h3d-final'), bar = $('.h3d-bar i'), loadPill = $('.hvid-load');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = matchMedia('(max-width: 860px)').matches;
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const track = (event, data = {}) => (window.dataLayer = window.dataLayer || []).push({ event, ...data });

/* ---------- overlay text + progress ---------- */
const getTarget = () => { const r = sec.getBoundingClientRect(); return cl(-r.top / Math.max(1, sec.offsetHeight - innerHeight)); };
let lastIdx = -2;
const syncUI = p => {
  if (intro) intro.classList.toggle('out', p > .04);
  let idx = -1; steps.forEach((s, i) => { if (p >= +s.dataset.stepAt) idx = i; });
  if (p >= CFG.finalAt) idx = steps.length;
  steps.forEach((s, i) => s.classList.toggle('on', i === idx));
  dots.forEach((d, i) => d.classList.toggle('on', i <= idx));
  const fin = idx === steps.length;
  if (finale) finale.classList.toggle('on', fin);
  sec.classList.toggle('final', fin);
  if (bar) bar.style.transform = `scaleX(${p})`;
  if (idx !== lastIdx) { if (idx >= 0) track('hero_step', { step: idx + 1 }); lastIdx = idx; }
};
dots.forEach((d, i) => d.addEventListener('click', () => {
  const at = i < steps.length ? +steps[i].dataset.stepAt + .02 : CFG.finalAt + .04;
  scrollTo({ top: sec.offsetTop + at * (sec.offsetHeight - innerHeight), behavior: reduce ? 'auto' : 'smooth' });
}));

/* ---------- canvas ---------- */
const cv = document.createElement('canvas');
cv.className = 'h3d-canvas'; cv.setAttribute('aria-hidden', 'true');
stage.insertBefore(cv, stage.firstChild.nextSibling);
const ctx = cv.getContext('2d');
let W = 0, H = 0, drawn = -1;
const resize = () => {
  const dpr = Math.min(devicePixelRatio || 1, mobile ? 2 : 1.5);
  W = cv.width = Math.round(stage.clientWidth * dpr); H = cv.height = Math.round(stage.clientHeight * dpr);
  drawn = -1;
};
addEventListener('resize', resize); resize();

/* ---------- frame loading (coarse first, then fill in) ---------- */
const base = ROOT + (mobile ? CFG.mobile : CFG.desktop);
const url = i => base + String(i + 1).padStart(CFG.pad, '0') + '.' + CFG.ext;
const imgs = new Array(CFG.count);
let loaded = 0;
const load = i => new Promise(res => {
  if (imgs[i]) return res(true);
  const im = new Image(); im.decoding = 'async';
  im.onload = () => { imgs[i] = im; loaded++; res(true); };
  im.onerror = () => res(false);
  im.src = url(i);
});
const order = []; const seen = new Set();
[16, 8, 4, 2, 1].forEach(stepN => { for (let i = 0; i < CFG.count; i += stepN) if (!seen.has(i)) { seen.add(i); order.push(i); } });
const pump = async () => {
  let k = 0;
  const worker = async () => { while (k < order.length) { const i = order[k++]; await load(i); updatePill(); } };
  await Promise.all(Array.from({ length: 6 }, worker));
  updatePill(true);
};
const updatePill = done => {
  if (!loadPill) return;
  const pct = Math.round(loaded / CFG.count * 100);
  loadPill.textContent = `Loading ${pct}%`;
  if (done || pct > 35) loadPill.classList.add('done');
};

/* nearest loaded frame to the one we want */
const nearest = i => { if (imgs[i]) return imgs[i]; for (let d = 1; d < CFG.count; d++) { if (imgs[i - d]) return imgs[i - d]; if (imgs[i + d]) return imgs[i + d]; } return null; };
const draw = p => {
  const i = Math.min(CFG.count - 1, Math.round(p * (CFG.count - 1)));
  const im = nearest(i); if (!im) return;
  const key = i * 100000 + (imgs[i] ? 1 : 0);
  if (key === drawn) return; drawn = key;
  const iw = im.naturalWidth, ih = im.naturalHeight, s = Math.max(W / iw, H / ih);
  const dw = iw * s, dh = ih * s;
  const dx = (W - dw) * (dw > W ? CFG.focusX : .5), dy = (H - dh) / 2;
  ctx.drawImage(im, dx, dy, dw, dh);
};

/* ---------- start: check the first frame exists, otherwise fall back to a photo ---------- */
load(0).then(ok => {
  if (!ok) { sec.classList.add('no3d'); if (loadPill) loadPill.remove(); (function loop() { syncUI(getTarget()); requestAnimationFrame(loop); })(); console.warn('heroVideo: frames not found at ' + base); return; }
  pump();
  let progress = getTarget(), visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '100px' }).observe(stage);
  (function frame() {
    requestAnimationFrame(frame);
    const target = getTarget();
    progress = reduce ? target : progress + (target - progress) * .12;
    syncUI(progress);
    if (visible) draw(progress);
  })();
});
})();