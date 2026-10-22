/* ===== Coastal Air & Electrical: learn.js (Aircon 101 tools) ===== */
(() => {
'use strict';
const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const track = (event, data = {}) => (window.dataLayer = window.dataLayer || []).push({ event, ...data });
const ROOT = document.body.dataset.root || '';
const ENQ = ($('a[data-book]') || {}).href || ROOT + 'contact.html';
const btn = (label, cls = 'btn-sun') => `<a class="btn ${cls}" href="${ENQ}" target="_blank" rel="noopener">${label}</a>`;
const fill = r => r.style.setProperty('--fill', ((r.value - r.min) / (r.max - r.min)) * 100 + '%');

/* ---------- tabs ---------- */
$$('[data-tabs]').forEach(w => {
  const tabs = $$('[role=tab]', w);
  const select = (t, user) => {
    tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !on; });
    if (user) track('learn_tab', { tab: t.id });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t, true));
    t.addEventListener('keydown', e => { const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (d) { e.preventDefault(); const n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); select(n, true); } });
  });
});

/* ---------- time to replace? ---------- */
$$('[data-replace]').forEach(el => {
  const SIGNS = [["It's noisier than it used to be", 1], ['Power bills keep creeping up', 1], ['Some rooms never get comfortable', 1], ["It's needed repairs more than once lately", 1], ["There's a musty smell when it starts up", 1], ["It's an older system that may use R22 gas", 2]];
  const year = new Date().getFullYear();
  el.innerHTML = `<div class="learn-grid">
    <div class="panel-card">
      <h3>Is it time to replace?</h3>
      <p>As a rough rule, many systems last around 10 to 15 years with regular servicing. Tell us roughly when yours went in and tick anything that sounds familiar.</p>
      <label class="field" style="margin-top:20px"><span>Year installed <b class="age" data-age></b></span><div class="range-row"><input type="range" min="1995" max="${year}" value="2012" data-year aria-label="Year installed"><output data-yo></output></div></label>
      <div class="toggles">${SIGNS.map(([l], i) => `<button type="button" class="toggle" data-i="${i}" aria-pressed="false"><i></i>${l}</button>`).join('')}</div>
    </div>
    <div class="panel-card dark" aria-live="polite">
      <div class="meter"><svg viewBox="0 0 300 170" aria-hidden="true">
        <path d="M40 150 A110 110 0 0 1 95 54.7" stroke="#4CD07A" stroke-width="22" fill="none" stroke-linecap="round"/>
        <path d="M100 52 A110 110 0 0 1 200 52" stroke="#F49424" stroke-width="22" fill="none"/>
        <path d="M205 54.7 A110 110 0 0 1 260 150" stroke="#E5533D" stroke-width="22" fill="none" stroke-linecap="round"/>
        <g class="needle"><line x1="150" y1="150" x2="150" y2="52" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="150" cy="150" r="12" fill="#fff"/></g>
      </svg></div>
      <div class="verdict"><b data-v></b><p data-vp></p></div>
      <div class="btns" style="justify-content:center" data-vb></div>
      <p class="note" style="text-align:center">A general guide only. We'll give you an honest recommendation after a look at your system.</p>
    </div></div>`;
  const yr = $('[data-year]', el), needle = $('.needle', el), picked = new Set();
  let used = false;
  const upd = user => {
    fill(yr); const y = +yr.value, age = year - y;
    $('[data-yo]', el).textContent = y; $('[data-age]', el).textContent = `· about ${age} year${age === 1 ? '' : 's'} old`;
    let s = age < 8 ? 0 : age < 12 ? 2 : age < 15 ? 3 : 4;
    picked.forEach(i => s += SIGNS[i][1]);
    needle.style.transform = `rotate(${-90 + 180 * Math.min(1, s / 9)}deg)`;
    const v = s <= 2 ? ['Looking healthy', 'Keep it running well with a regular service.', 'Book a service']
      : s <= 5 ? ['Worth a check-up', 'A service will show whether a repair or a replacement makes more sense.', 'Book a check-up']
      : ['Time to talk replacement', 'Newer inverter systems are typically quieter and more efficient. We can quote a like-for-like swap.', 'Get a replacement quote'];
    $('[data-v]', el).textContent = v[0]; $('[data-vp]', el).textContent = v[1]; $('[data-vb]', el).innerHTML = btn(v[2]);
    if (user && !used) { used = true; track('tool_used', { tool: 'replace_checker' }); }
  };
  yr.addEventListener('input', () => upd(true));
  $$('.toggle', el).forEach(b => b.addEventListener('click', () => { const i = +b.dataset.i, on = !picked.has(i); on ? picked.add(i) : picked.delete(i); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); upd(true); }));
  upd();
});

/* ---------- why clean it? ---------- */
$$('[data-clean]').forEach(el => {
  el.innerHTML = `<div class="learn-grid">
    <div class="panel-card">
      <h3>What builds up inside</h3>
      <p>Slide to see what happens when filters aren't cleaned. Illustration only.</p>
      <svg class="filter-svg" viewBox="0 0 300 190" aria-hidden="true">
        <defs>
          <pattern id="mesh" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M8 0H0V8" fill="none" stroke="#c9ccd6" stroke-width="1"/></pattern>
          <filter id="dustF" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" seed="7"/><feColorMatrix values="0 0 0 0 .42  0 0 0 0 .35  0 0 0 0 .25  0 0 0 2.2 -.9"/></filter>
        </defs>
        <rect width="300" height="190" rx="14" fill="#EFE4D0"/>
        <rect x="24" y="22" width="200" height="146" rx="10" fill="#fbfaf7" stroke="#d6d1c6" stroke-width="4"/>
        <rect x="32" y="30" width="184" height="130" fill="url(#mesh)"/>
        <rect class="tint" x="32" y="30" width="184" height="130" fill="#8a6d47" opacity="0"/>
        <rect class="dust" x="32" y="30" width="184" height="130" filter="url(#dustF)" opacity="0"/>
        <g class="air" stroke="#6E9BD1" stroke-width="4" stroke-linecap="round" fill="none"><path d="M236 60h44m-10-8 10 8-10 8"/><path d="M236 95h44m-10-8 10 8-10 8"/><path d="M236 130h44m-10-8 10 8-10 8"/></g>
      </svg>
      <label class="field" style="margin-top:16px"><span>Months since the last clean</span><div class="range-row"><input type="range" min="0" max="24" value="3" data-m aria-label="Months since last clean"><output data-mo></output></div></label>
      <div class="flow"><div class="flow-row">Airflow<div class="gauge"><i data-air></i></div></div><div class="flow-row">Build-up<div class="gauge"><i data-dirt></i></div></div></div>
      <span class="state" data-state></span>
    </div>
    <div class="panel-card">
      <h3>Why it matters</h3>
      <div class="reasons">
        <div class="reason"><h4>Healthier air</h4><p>Filters trap dust, pollen and pet hair. Once they're full, it gets blown back around your home.</p></div>
        <div class="reason"><h4>Stop mould growing</h4><p>Blocked condensate lines can grow algae and mould, which can be hazardous to your family.</p></div>
        <div class="reason"><h4>Lower running costs</h4><p>Clogged filters choke airflow, so your system works harder to reach the same temperature.</p></div>
        <div class="reason"><h4>Fewer breakdowns</h4><p>A service catches small problems early, before they become expensive repairs.</p></div>
      </div>
      <figure class="ph wide" style="margin-top:18px"><img src="${ROOT}images/maintenance-condensate.jpg" alt="A blocked air conditioner condensate line" loading="lazy"><figcaption><b>Real job</b>A blocked condensate line, full of grime.</figcaption></figure>
      <p class="tip"><b>You:</b> rinse the filters regularly. <b>Us:</b> a full service at least once a year, covering coils, drains and electrical checks.</p>
      <div class="btns">${btn('Book a service')}</div>
    </div></div>`;
  const m = $('[data-m]', el), dust = $('.dust', el), tintR = $('.tint', el), airG = $('.air', el);
  let used = false;
  const upd = user => {
    fill(m); const v = +m.value;
    $('[data-mo]', el).textContent = v === 0 ? 'Just cleaned' : v + (v === 1 ? ' month' : ' months');
    const dirt = Math.min(1, v / 18), flow = 1 - dirt * .65;
    dust.setAttribute('opacity', (dirt * .95).toFixed(2)); tintR.setAttribute('opacity', (dirt * .35).toFixed(2));
    airG.style.opacity = (.25 + flow * .75).toFixed(2); airG.style.transform = `scaleX(${(.4 + flow * .6).toFixed(2)})`;
    $('[data-air]', el).style.width = flow * 100 + '%'; $('[data-dirt]', el).style.width = dirt * 100 + '%';
    const st = $('[data-state]', el);
    if (dirt < .3) { st.className = 'state'; st.textContent = 'Fresh and flowing'; }
    else if (dirt < .65) { st.className = 'state mid'; st.textContent = 'Getting dusty. Time for a clean'; }
    else { st.className = 'state bad'; st.textContent = 'Clogged. Book a service'; }
    if (user && !used) { used = true; track('tool_used', { tool: 'clean_meter' }); }
  };
  m.addEventListener('input', () => upd(true)); upd();
});

/* ---------- myth vs fact flip cards ---------- */
$$('.flip').forEach(f => f.addEventListener('click', () => { const on = f.classList.toggle('on'); f.setAttribute('aria-pressed', on); if (on) track('myth_flip'); }));
})();