/* =====================================================================
   Coastal Air & Electrical: script.js (shared by every page)
   1  Settings ........... business details: edit here
   2  Smooth scroll ...... Lenis (+ GSAP ticker when loaded)
   3  Header, menu, footer, floating buttons
   4  Opening hours
   5  Thermostat dial (air-conditioning.html 3D section)
   6  Tools: finder, sizing, solar, emergency, area checker
   7  Reviews, gallery + lightbox, forms
   8  Premium motion: split text, reveals, pinned services, tilt, count-up
   9  3D scene: the air con unit that travels down the home page
   10 Loading screen
   ===================================================================== */
(() => {
'use strict';
const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobileQ = matchMedia('(max-width: 860px)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/* pages inside a folder (e.g. /middleton/) set data-root="../" on <body> */
const ROOT = document.body.dataset.root || '';
const u = p => ROOT + p;
const PRETTY = location.protocol !== 'file:';   // use /middleton/ online, middleton/index.html when testing locally
const loaderEl = $('#loader');
let isReady = false, sceneDone = false;
const onReady = fn => isReady ? fn() : addEventListener('ca:ready', fn, { once: true });

/* =====================================================================
   1. SETTINGS: edit business details here and the whole site updates
   ===================================================================== */
const SITE = {
  name: 'Coastal Air & Electrical',             // REPLACE (company name)
  email: '',                                    // TODO: add if they want email shown
  enquiry: 'https://book.servicem8.com/request_service_online_booking?strVendorUUID=2e0645ed-f29c-4cfc-a536-2028d63d155b#1a23d33c-3d50-46f4-85f1-2299478c683b',
  facebook: 'https://www.facebook.com/walkerelectricalsolutions',
  instagram: 'https://www.instagram.com/coastal_air_electrical/',
  googleProfile: 'https://www.google.com/maps/place/Coastal+Air+%26+Electrical/data=!4m2!3m1!1s0x0:0xe12a1770890696f0',
  reviewLink: 'https://www.google.com/search?q=coastalairandelectrical#lrd=0x6ab1230b073a2663:0xe12a1770890696f0,3,,,,',
  rating: '5.0', reviewCount: 136, years: 15,
  whatsapp: '',                                 // REPLACE: e.g. '61413784024' (no + or spaces) to show a WhatsApp button
  logo: 'images/logo-mark.png',                 // REPLACE (logo)
  licence: '',                                  // TODO: SA electrical contractor licence number
  arctick: '',                                  // TODO: ARCtick refrigerant authorisation number
  tz: 'Australia/Adelaide',
  gtm: 'GTM-KHB3X7FP'
};
/* Two locations. REPLACE (phone): confirm phone, suburbs and postcodes for each */
const LOCATIONS = {
  seaford: {
    name: 'Seaford', region: 'Southern Adelaide', path: 'index.html', prettyPath: 'index.html',
    phone: '0413 784 024', tel: '0413784024',
    blurb: 'Air con, electrical and solar across Adelaide\u2019s southern suburbs and coast.',
    suburbs: ['Seaford', 'Seaford Rise', 'Seaford Meadows', 'Seaford Heights', 'Moana', 'Maslin Beach', 'Port Noarlunga', 'Port Noarlunga South', 'Christies Beach', 'Noarlunga Downs', 'Hackham', 'Huntfield Heights', 'Morphett Vale', 'Reynella', 'Hallett Cove', 'Aldinga', 'Aldinga Beach', 'Sellicks Beach', 'McLaren Vale', 'Willunga'],
    postcodes: n => n >= 5158 && n <= 5174
  },
  middleton: {
    name: 'Middleton', region: 'Fleurieu Peninsula', path: 'middleton/index.html', prettyPath: 'middleton/',
    phone: '0413 784 024', tel: '0413784024',   // TODO: change if Middleton has its own number
    blurb: 'Your local team for Middleton, Goolwa, Port Elliot, Victor Harbor and the south coast.',
    suburbs: ['Middleton', 'Goolwa', 'Goolwa Beach', 'Goolwa South', 'Hindmarsh Island', 'Port Elliot', 'Victor Harbor', 'Encounter Bay', 'Hayborough', 'McCracken', 'Waitpinga', 'Currency Creek', 'Mount Compass', 'Normanville', 'Yankalilla', 'Strathalbyn'],
    postcodes: n => (n >= 5201 && n <= 5214) || n === 5255
  }
};
const LOCK = LOCATIONS[document.body.dataset.loc] ? document.body.dataset.loc : 'seaford';
const LOC = LOCATIONS[LOCK];
const locHref = k => u(PRETTY ? LOCATIONS[k].prettyPath : LOCATIONS[k].path);
const POSTCODE_MAYBE = n => n >= 5000 && n <= 5299;
/* Opening hours (24h). null = closed. TODO: confirm with the client */
const HOURS = { Mon: [7, 17], Tue: [7, 17], Wed: [7, 17], Thu: [7, 17], Fri: [7, 17], Sat: null, Sun: null };
/* REPLACE (form): paste a Formspree / Make / GoHighLevel webhook URL. Empty = form opens a pre-filled text message */
const FORM_ENDPOINT = 'https://services.leadconnectorhq.com/hooks/sKQj8192Kgs9DasTlSOO/webhook-trigger/9fb84fdd-8e2e-4caf-a522-38ea122527d3';
/* Real Google reviews, copied word for word. Leave empty until you have them */
const REVIEWS = [
  // { name: 'First name', text: 'Exact review text', when: 'March 2026' },
];
const BRANDS = ['Mitsubishi Electric', 'Daikin', 'Panasonic', 'Fujitsu', 'Mitsubishi Heavy Industries', 'Samsung', 'Carrier', 'Haier'];
/* Projects: [file, title, caption, category, era]  REPLACE (images) */
const PROJECTS = [
  // New shoot. REPLACE: confirm suburb, caption and category for each
  ['reno-ducted.jpg', 'Ducted in a renovation', 'Sealing the duct run through new framing on a home extension.', 'ducted', 'Adelaide'],
  ['electrical-rough-in.jpg', 'New build rough-in', 'Cabling run through the frame for power and lighting.', 'electrical', 'Adelaide'],
  ['reno-with-builder.jpg', 'Working with the builder', 'Insulated pipework going in alongside the builder.', 'split', 'Adelaide'],
  ['work-sparks.jpg', 'Commercial ducting supports', 'Cutting unistrut to hang ducting on a commercial fit-out.', 'commercial', 'Adelaide'],
  ['electrical-wiring.jpg', 'Ducted unit wiring', 'Wiring the control board on a commercial ducted unit.', 'commercial', 'Adelaide'],
  // Existing jobs
  ['ducted-westlakes.jpg', '12kW ducted, zero ceiling space', 'A 12kW Mitsubishi Electric ducted system fitted into a home with almost no ceiling space.', 'ducted', 'Adelaide'],
  ['ducted-copper-grilles.jpg', 'Copper-finish ducted grilles', 'Linear grilles scrubbed back to a copper finish against original brick.', 'ducted', 'Adelaide'],
  ['commercial-daikin-freshair.jpg', '12 × Daikin split systems', 'Commercial install with fresh-air intake and seismic restraints on every unit.', 'commercial', 'Adelaide'],
  ['commercial-75kw-handover.jpg', '75kW commercial ducted', 'A 75kW ducted system handed over on a new warehouse.', 'commercial', 'Adelaide'],
  ['ducted-bedroom.jpg', 'Bulkhead ducted apartment', 'Multi-head bulkhead ducted system in a full apartment renovation.', 'ducted', 'Earlier work'],
  ['split-mhi-row.jpg', 'Four split systems, one home', 'Matching outdoor units with tidy pipe covers.', 'split', 'Earlier work'],
  ['ducted-fujitsu-10kw.jpg', '10kW Fujitsu ducted', 'Whole-home ducted heating and cooling.', 'ducted', 'Earlier work'],
  ['split-panasonic-apartment.jpg', 'Split systems for neighbours', 'Two Panasonic units sharing one neat pipe run.', 'split', 'Earlier work'],
  ['electrical-switchboard.jpg', 'Switchboard fit-off', 'A new switchboard wired for a commercial fit-out.', 'electrical', 'Earlier work'],
  ['split-mitsubishi-stacked.jpg', 'Stacked outdoor units', 'Mitsubishi Electric units on wall brackets to save space.', 'split', 'Earlier work'],
  ['commercial-diffuser.jpg', 'Office ducted fit-out', 'Ceiling diffusers going in on a commercial fit-out.', 'commercial', 'Earlier work'],
  ['split-dome-studio.jpg', 'A dome studio in the forest', 'Something a bit different: air conditioning for a photography studio.', 'split', 'Earlier work'],
  ['ducted-samsung-outdoor.jpg', 'Twin ducted outdoor units', 'A matching pair of Samsung units on a new build.', 'ducted', 'Earlier work'],
  ['commercial-headspace.jpg', 'Commercial handover', 'Fit-out finished and handed over.', 'commercial', 'Earlier work'],
  ['maintenance-condensate.jpg', 'Why servicing matters', 'A blocked condensate line. Left alone, it grows algae and mould.', 'maintenance', 'Earlier work']
];
const CATS = { ducted: 'Ducted', split: 'Split systems', commercial: 'Commercial', electrical: 'Electrical', maintenance: 'Maintenance' };

/* ===== analytics (Google Tag Manager) ===== */
window.dataLayer = window.dataLayer || [];
const track = (event, data = {}) => window.dataLayer.push({ event, location: LOCK, ...data });
if (SITE.gtm) {
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const g = document.createElement('script'); g.async = true; g.src = 'https://www.googletagmanager.com/gtm.js?id=' + SITE.gtm; document.head.appendChild(g);
}

/* =====================================================================
   2. SMOOTH SCROLL (Lenis). Works with or without GSAP
   ===================================================================== */
const G = window.gsap, ST = window.ScrollTrigger;
const hasGS = !!(G && ST) && !reduce;
if (hasGS) G.registerPlugin(ST);
let lenis = null;
if (window.Lenis && !reduce) {
  lenis = new window.Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  if (hasGS) { lenis.on('scroll', ST.update); G.ticker.add(t => lenis.raf(t * 1000)); G.ticker.lagSmoothing(0); }
  else { const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
}
const lockScroll = on => { document.documentElement.classList.toggle('no-scroll', on); if (lenis) { if (on) lenis.stop(); else lenis.start(); } };
if (loaderEl) { document.documentElement.classList.add('is-loading'); if (lenis) lenis.stop(); }
/* smooth anchor links on the same page */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href*="#"]'); if (!a || !lenis) return;
  const url = new URL(a.href, location.href); if (url.pathname !== location.pathname || !url.hash) return;
  const t = document.querySelector(url.hash); if (!t) return;
  e.preventDefault(); lenis.scrollTo(t, { offset: -90 }); history.replaceState(null, '', url.hash);
});

/* =====================================================================
   3. HEADER, MENU, FOOTER, FLOATING BUTTONS
   ===================================================================== */
const IC = {
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z"/></svg>',
  fb: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3c-2.8 0-4 1.7-4 4.3V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.3-.6.6-.6z"/></svg>',
  ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  g: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4zM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22zM6.4 14a6 6 0 0 1 0-3.9V7.4H3.1a10 10 0 0 0 0 9.2zM12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.7 9.4 6 12 6z"/></svg>'
};
const page = document.body.dataset.page || '';
const NAV = [['index.html', 'Home', 'home'], ['air-conditioning.html', 'Air Con', 'ac'], ['electrical.html', 'Electrical', 'electrical'], ['solar.html', 'Solar', 'solar'], ['work.html', 'Our Work', 'work'], ['reviews.html', 'Reviews', 'reviews'], ['about.html', 'About', 'about'], ['contact.html', 'Contact', 'contact']];
/* REPLACE (logo + company name) */
const brandHTML = `<a class="brand" href="${u('index.html')}" aria-label="${SITE.name} home"><img src="${u(SITE.logo)}" alt="" width="42" height="42"><span><b>COASTAL</b><small>AIR &amp; ELECTRICAL</small></span></a>`;
const locSwitch = `<div class="loc-switch" role="group" aria-label="Choose your location">${Object.entries(LOCATIONS).map(([k, L]) => `<a href="${locHref(k)}"${k === LOCK ? ' class="on" aria-current="true"' : ''}>${L.name}</a>`).join('')}</div>`;
const socials = `<div class="soc"><a href="${SITE.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${IC.fb}</a><a href="${SITE.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${IC.ig}</a><a href="${SITE.googleProfile}" target="_blank" rel="noopener" aria-label="Google reviews">${IC.g}</a></div>`;

const hd = $('#header');
if (hd) hd.outerHTML = `<a class="skip" href="#main">Skip to content</a>
<header class="nav" id="nav"><div class="nav-pill">
  ${brandHTML}
  <div class="nav-right">
    <span data-open></span>
    <a class="nav-ic" href="tel:${LOC.tel}" aria-label="Call ${LOC.phone}">${IC.phone}</a>
    <a class="btn btn-sun btn-sm" data-book>Book now</a>
    <button class="menu-btn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="menu"><i></i><i></i></button>
  </div>
</div></header>
<div class="menu" id="menu" inert>
  <div class="menu-glow"></div>
  <div class="menu-in">
    <nav class="menu-links" aria-label="Main">${NAV.map((n, i) => `<a href="${u(n[0])}"${n[2] === page ? ' class="on" aria-current="page"' : ''} style="--i:${i}"><span>0${i + 1}</span>${n[1]}</a>`).join('')}</nav>
    <div class="menu-side">
      <span class="menu-label">Your location</span>${locSwitch}
      <span class="menu-label">Talk to us</span><a class="menu-tel" href="tel:${LOC.tel}">${LOC.phone}</a><span data-open></span>
      <div class="btns"><a class="btn btn-sun" data-book></a></div>
      ${socials}
    </div>
  </div>
</div>`;

const ft = $('#footer');
if (ft) ft.outerHTML = `<footer class="foot"><div class="foot-grid">
  <div>${brandHTML}<p>Licensed air conditioning, electrical and solar specialists with local teams in Seaford and Middleton.</p>
    ${SITE.licence ? `<p>Electrical licence ${esc(SITE.licence)}</p>` : ''}${SITE.arctick ? `<p>ARCtick ${esc(SITE.arctick)}</p>` : ''}${socials}</div>
  <div><h4>Services</h4><a href="${u('air-conditioning.html')}">Air conditioning</a><a href="${u('air-conditioning.html#split')}">Split systems</a><a href="${u('air-conditioning.html#ducted')}">Ducted systems</a><a href="${u('air-conditioning.html#maintenance')}">AC maintenance</a><a href="${u('electrical.html')}">Electrical</a><a href="${u('solar.html')}">Solar</a></div>
  <div><h4>Locations</h4>${Object.entries(LOCATIONS).map(([k, L]) => `<a href="${locHref(k)}">${L.name} · ${L.region}</a>`).join('')}
    <h4 style="margin-top:22px">Company</h4><a href="${u('work.html')}">Our work</a><a href="${u('about.html')}">About us</a><a href="${u('reviews.html')}">Reviews</a><a href="${u('contact.html')}">Contact</a></div>
  <div><h4>Get in touch</h4><a href="tel:${LOC.tel}">${LOC.phone}</a>${SITE.email ? `<a href="mailto:${SITE.email}">${SITE.email}</a>` : ''}<a data-book>Get a free quote</a><ul class="hours-list" data-hours></ul><p style="margin-top:10px">24/7 for electrical emergencies</p></div>
</div>
<div class="foot-word" aria-hidden="true">COASTAL</div>
<div class="foot-bot"><span>&copy; ${new Date().getFullYear()} Coastal Air &amp; Electrical Pty Ltd</span><span><a href="${u('privacy.html')}">Privacy</a> &nbsp;·&nbsp; <a href="${u('terms.html')}">Terms</a></span></div></footer>`;

/* floating call (+ optional WhatsApp) button, and a quote pill on phones */
document.body.insertAdjacentHTML('beforeend', `<div class="fab">${SITE.whatsapp ? `<a class="fab-btn wa" href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener" aria-label="Message us on WhatsApp">${IC.chat}</a>` : ''}<a class="fab-btn" href="tel:${LOC.tel}" aria-label="Call ${LOC.phone}">${IC.phone}</a></div><a class="mquote" data-book>${IC.cal}Free quote</a>`);
/* back to top button (with scroll progress ring) */
const fabEl = $('.fab');
if (fabEl) {
  fabEl.insertAdjacentHTML('afterbegin', `<button type="button" class="fab-btn top" aria-label="Back to top"><svg class="top-ring" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22"/><circle class="top-prog" cx="24" cy="24" r="22" pathLength="100"/></svg><svg class="top-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>`);
  const topBtn = $('.fab-btn.top', fabEl), topProg = $('.top-prog', topBtn);
  let topTick = false;
  const topUpd = () => {
    topTick = false;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight), y = scrollY;
    topBtn.classList.toggle('on', y > innerHeight * .8);
    topProg.style.strokeDashoffset = 100 - cl(y / max) * 100;
  };
  addEventListener('scroll', () => { if (!topTick) { topTick = true; requestAnimationFrame(topUpd); } }, { passive: true });
  addEventListener('resize', topUpd); topUpd();
  topBtn.addEventListener('click', () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.6 }); else scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    const b = $('.brand'); if (b) b.focus({ preventScroll: true });   // keyboard users land at the top too
    track('back_to_top', { place: page });
  });
}
/* shared links */
const wireEnquiry = (scope = document, label = 'Get a free quote') => $$('[data-book]', scope).forEach(a => {
  if (a.dataset.wired) return; a.dataset.wired = 1;
  a.href = SITE.enquiry; a.target = '_blank'; a.rel = 'noopener';
  if (!a.textContent.trim()) a.innerHTML = IC.cal + label;
    if (!a.querySelector('.sr-only')) a.insertAdjacentHTML('beforeend', '<span class="sr-only"> (opens in a new tab)</span>');
  a.addEventListener('click', () => track('enquiry_click', { place: page }));
});
wireEnquiry();
$$('[data-call]').forEach(a => { a.href = 'tel:' + LOC.tel; if (!a.textContent.trim()) a.innerHTML = IC.phone + 'Call ' + LOC.phone; });
document.addEventListener('click', e => { const a = e.target.closest('a[href^="tel:"]'); if (a) track('phone_click', { place: page }); });
$$('[data-rating]').forEach(el => el.innerHTML = `<i class="stars">★★★★★</i> ${SITE.rating} from ${SITE.reviewCount} Google reviews`);
$$('[data-brands]').forEach(el => el.innerHTML = `<div class="track">${[...BRANDS, ...BRANDS].map(b => `<span>${b}</span>`).join('')}</div>`);

$$('[data-locations]').forEach(el => {
  el.innerHTML = `<div class="locs">${Object.entries(LOCATIONS).map(([k, L]) => {
    const here = k === LOCK, tag = here ? 'div' : 'a', href = here ? '' : ` href="${locHref(k)}"`;
    return `<${tag} class="loc-card${here ? ' here' : ''}"${href}><span class="loc-pin">${IC.pin}</span><div><small>${L.region}</small><b>${L.name}</b><p>${L.blurb}</p><span class="more">${here ? 'You\u2019re on the ' + L.name + ' page' : 'Visit our ' + L.name + ' team \u2192'}</span></div></${tag}>`;
  }).join('')}</div>`;
});

/* nav: solid after scrolling, hides on scroll down, returns on scroll up */
const nav = $('#nav');
let lastSY = scrollY;
const onScroll = () => {
  const y = scrollY;
  if (nav) {
    nav.classList.toggle('solid', y > 30);
    if (!document.documentElement.classList.contains('menu-open')) {
      if (y > lastSY + 3 && y > 400) nav.classList.add('hide');
      else if (y < lastSY - 3 || y < 400) nav.classList.remove('hide');
    }
  }
  lastSY = y;
};
addEventListener('scroll', onScroll, { passive: true }); onScroll();

/* full-screen menu */
const menu = $('#menu'), mbtn = $('.menu-btn');
if (menu && mbtn) {
  const setOpen = o => {
    document.documentElement.classList.toggle('menu-open', o);
    menu.inert = !o; lockScroll(o);
    mbtn.setAttribute('aria-expanded', o); mbtn.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
    if (nav) nav.classList.remove('hide');
    if (o) setTimeout(() => { const f = $('.menu-links a', menu); if (f) f.focus(); }, 60);
  };
  mbtn.addEventListener('click', () => setOpen(!document.documentElement.classList.contains('menu-open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setOpen(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && document.documentElement.classList.contains('menu-open')) setOpen(false); });
}

/* =====================================================================
   4. OPENING HOURS + live badge (Adelaide time)
   ===================================================================== */
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const fmt = h => { const hh = Math.floor(h), mm = Math.round((h - hh) * 60), h12 = ((hh + 11) % 12) + 1; return h12 + (mm ? ':' + String(mm).padStart(2, '0') : '') + (hh >= 12 ? 'pm' : 'am'); };
const nowAdl = () => {
  const p = new Intl.DateTimeFormat('en-AU', { timeZone: SITE.tz, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const g = t => (p.find(x => x.type === t) || {}).value;
  return { d: DAYS.indexOf(g('weekday')), h: +g('hour') + +g('minute') / 60 };
};
const status = () => {
  const { d, h } = nowAdl(), t = HOURS[DAYS[d]];
  if (t && h >= t[0] && h < t[1]) return { open: true, txt: `Open now · until ${fmt(t[1])}` };
  for (let i = 0; i < 8; i++) {
    const dd = (d + i) % 7, tt = HOURS[DAYS[dd]];
    if (!tt) continue;
    if (i === 0 && h < tt[0]) return { open: false, txt: `Closed · opens ${fmt(tt[0])} today` };
    if (i > 0) return { open: false, txt: `Closed · opens ${i === 1 ? 'tomorrow' : DAYS[dd]} ${fmt(tt[0])}` };
  }
  return { open: false, txt: 'Call for availability' };
};
const paintStatus = () => {
  const s = status();
  $$('[data-open]').forEach(el => { el.classList.add('open-pill'); el.classList.toggle('on', s.open); el.innerHTML = `<i></i>${s.txt}`; });
  const today = DAYS[nowAdl().d];
  $$('[data-hours]').forEach(ul => ul.innerHTML = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<li${d === today ? ' class="today"' : ''}><span>${d}</span><span>${HOURS[d] ? fmt(HOURS[d][0]) + ' – ' + fmt(HOURS[d][1]) : 'Closed'}</span></li>`).join(''));
};
paintStatus(); setInterval(paintStatus, 60000);

/* =====================================================================
   5. THERMOSTAT DIAL (used by the 3D section on air-conditioning.html)
   ===================================================================== */
const dial = $('[data-dial]');
if (dial) {
  const hero = dial.closest('.hero, .h3d'), svg = $('svg', dial), prog = $('.d-prog', dial), knob = $('.d-knob', dial);
  const out = $('.dial-temp b', dial), mode = $('.dial-temp small', dial), msg = $('.dial-msg', dial);
  const MIN = 16, MAX = 30, A0 = -135, A1 = 135;
  const pt = (a, r = 80) => { const rad = (a - 90) * Math.PI / 180; return [100 + r * Math.cos(rad), 100 + r * Math.sin(rad)]; };
  const arc = (a0, a1, r = 80) => { const [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r); return `M${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`; };
  const mix = t => { const a = [174, 175, 194], b = [244, 148, 36]; return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`; };
  $('.d-track', dial).setAttribute('d', arc(A0, A1));
  let temp = 22, used = false, drag = false;
  const set = (v, user) => {
    temp = Math.min(MAX, Math.max(MIN, Math.round(v * 2) / 2));
    const t = (temp - MIN) / (MAX - MIN), a = A0 + (A1 - A0) * t, col = mix(t);
    prog.setAttribute('d', arc(A0, Math.max(A0 + .5, a))); prog.style.stroke = col;
    const [kx, ky] = pt(a); knob.setAttribute('cx', kx); knob.setAttribute('cy', ky); knob.style.fill = col;
    out.textContent = (temp % 1 ? temp.toFixed(1) : temp) + '°';
    const m = temp < 21 ? ['Cooling', 'Beat the summer heat with quiet, efficient split or ducted cooling.']
      : temp <= 24 ? ['Just right', "That's the sweet spot. We size every system to hold it there, efficiently."]
      : ['Heating', 'Reverse-cycle heating keeps winter nights cosy for less.'];
    mode.textContent = m[0]; msg.textContent = m[1];
    if (hero) hero.style.setProperty('--warm', t.toFixed(3));
    dispatchEvent(new CustomEvent('ca:temp', { detail: { t, temp } }));
    dial.setAttribute('aria-valuenow', temp); dial.setAttribute('aria-valuetext', `${temp} degrees, ${m[0]}`);
    if (user && !used) { used = true; track('tool_used', { tool: 'thermostat' }); }
  };
  const fromPointer = e => {
    const r = svg.getBoundingClientRect();
    let a = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI + 90;
    if (a > 180) a -= 360;
    a = Math.max(A0, Math.min(A1, a));
    set(MIN + (a - A0) / (A1 - A0) * (MAX - MIN), true);
  };
  svg.addEventListener('pointerdown', e => { drag = true; svg.setPointerCapture(e.pointerId); fromPointer(e); });
  svg.addEventListener('pointermove', e => drag && fromPointer(e));
  svg.addEventListener('pointerup', () => drag = false);
  svg.addEventListener('pointercancel', () => drag = false);
  dial.addEventListener('keydown', e => { const k = { ArrowUp: .5, ArrowRight: .5, ArrowDown: -.5, ArrowLeft: -.5 }[e.key]; if (k) { e.preventDefault(); set(temp + k, true); } });
  $$('[data-step]', dial).forEach(b => b.addEventListener('click', () => set(temp + +b.dataset.step, true)));
  if (reduce) set(22);
  else { const t0 = performance.now(); (function intro(t) { const p = Math.min(1, (t - t0) / 1600), e = 1 - Math.pow(1 - p, 3); set(28 - 6 * e); if (p < 1) requestAnimationFrame(intro); })(t0); }
}

/* =====================================================================
   6. TOOLS
   ===================================================================== */
/* ----- split or ducted finder ----- */
const FINDER = [
  { q: 'What do you want to heat and cool?', k: 'area', o: [['One room', 'one'], ['2–3 rooms', 'few'], ['The whole home', 'whole']] },
  { q: 'What type of property is it?', k: 'type', o: [['Apartment or unit', 'apt'], ['Single-storey home', 'single'], ['Two-storey home', 'double'], ['Business or commercial', 'biz']] },
  { q: 'How much ceiling or roof space is there?', k: 'roof', o: [['Plenty of roof space', 'yes'], ['Tight or limited', 'tight'], ["I'm not sure", 'unsure']] },
  { q: 'What matters most to you?', k: 'want', o: [['Lowest upfront cost', 'cost'], ['Hidden and quiet', 'hidden'], ['Control room by room', 'zones']] }
];
const RESULTS = {
  split: { t: 'A split system', img: 'images/split-mhi-row.jpg', p: 'Affordable, energy-efficient heating and cooling for single rooms or open spaces, with reliable performance year-round.', pts: ['Lowest upfront cost', 'Fast install, often in a day', 'Great for bedrooms and living areas'] },
  multi: { t: 'Multiple split systems', img: 'images/split-panasonic-apartment.jpg', p: 'Separate indoor units for each room you use most, so you only heat or cool the spaces you need.', pts: ['Room-by-room control', 'Ideal when roof space is limited', 'Add more rooms later'] },
  ducted: { t: 'Ducted air conditioning', img: 'images/ducted-copper-grilles.jpg', p: 'Whole-home comfort from discreet ceiling vents, with zoning so you can choose which rooms to heat or cool.', pts: ['Hidden, quiet and tidy', 'Zoning to control running costs', 'Adds value to your home'] },
  biz: { t: 'A commercial system', img: 'images/commercial-75kw-handover.jpg', p: "From shops and offices to large warehouses. We've delivered commercial ducted systems up to 75kW. Let's talk through your site.", pts: ['Designed around your building', 'Ducted, split or multi-unit', 'Ongoing maintenance available'] }
};
$$('[data-finder]').forEach(el => {
  let step = 0; const ans = {};
  const pick = () => {
    if (ans.type === 'biz') return 'biz';
    const s = { split: 0, multi: 0, ducted: 0 };
    ({ one: () => s.split += 4, few: () => { s.multi += 3; s.ducted += 1; }, whole: () => { s.ducted += 4; s.multi += 1; } })[ans.area]?.();
    ({ apt: () => { s.split += 2; s.multi += 2; s.ducted -= 1; }, single: () => s.ducted += 1, double: () => { s.ducted += 1; s.multi += 1; } })[ans.type]?.();
    ({ yes: () => s.ducted += 2, tight: () => { s.multi += 2; s.split += 1; }, unsure: () => {} })[ans.roof]?.();
    ({ cost: () => { s.split += 3; s.multi += 1; }, hidden: () => s.ducted += 3, zones: () => { s.multi += 2; s.ducted += 1; } })[ans.want]?.();
    return Object.entries(s).sort((a, b) => b[1] - a[1])[0][0];
  };
  const render = () => {
    if (step >= FINDER.length) {
      const key = pick(), r = RESULTS[key];
      const tight = key === 'ducted' && ans.roof === 'tight' ? '<p><b>Tight ceiling?</b> It can still be done. We recently fitted a 12kW ducted system into a West Lakes home with almost no ceiling space.</p>' : '';
      el.innerHTML = `<div class="result"><div class="result-img"><img src="${u(r.img)}" alt="" loading="lazy"></div><div>
        <span class="eyebrow">Our suggestion</span><h3>${r.t}</h3><p>${r.p}</p>${tight}<ul>${r.pts.map(x => `<li>${x}</li>`).join('')}</ul>
        <div class="btns"><a class="btn btn-sun" data-book></a><a class="btn btn-ghost" href="tel:${LOC.tel}">${IC.phone}Talk it through</a></div>
        <p class="note">A starting point only. We confirm the right system after a free look at your home.</p>
        <button class="link-btn" data-restart type="button">Start again</button></div></div>`;
      wireEnquiry(el);
      $('[data-restart]', el).addEventListener('click', () => { step = 0; Object.keys(ans).forEach(k => delete ans[k]); render(); });
      track('tool_used', { tool: 'finder', result: key });
      return;
    }
    const f = FINDER[step];
    el.innerHTML = `<div class="tool-top"><span>Question ${step + 1} of ${FINDER.length}</span><div class="prog-bar"><i style="width:${(step / FINDER.length) * 100}%"></i></div></div>
      <p class="q">${f.q}</p><div class="opts">${f.o.map(([l, v]) => `<button type="button" class="opt${ans[f.k] === v ? ' on' : ''}" data-v="${v}">${l}</button>`).join('')}</div>
      <div class="tool-nav">${step ? '<button class="link-btn" data-back type="button">← Back</button>' : '<span></span>'}</div>`;
    $$('.opt', el).forEach(b => b.addEventListener('click', () => { ans[f.k] = b.dataset.v; if (f.k === 'type' && b.dataset.v === 'biz') step = FINDER.length; else step++; render(); }));
    const back = $('[data-back]', el); if (back) back.addEventListener('click', () => { step--; render(); });
  };
  render();
});

/* ----- shared helpers for calculators ----- */
const segGroup = (name, opts, def) => `<div class="seg" data-seg="${name}">${opts.map(([l, v]) => `<button type="button" data-v="${v}"${v === def ? ' class="on"' : ''}>${l}</button>`).join('')}</div>`;
const wireSegs = (el, onChange) => $$('.seg', el).forEach(g => g.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('button', g).forEach(x => x.classList.toggle('on', x === b)); onChange(); }));
const segVal = (el, name) => $(`[data-seg="${name}"] .on`, el).dataset.v;
const fillRange = r => r.style.setProperty('--fill', ((r.value - r.min) / (r.max - r.min)) * 100 + '%');

/* ----- room size → kW guide ----- */
$$('[data-kw]').forEach(el => {
  el.innerHTML = `<div class="calc"><div>
    <label class="field"><span>Room length</span><div class="range-row"><input type="range" min="2" max="14" step="0.5" value="5" data-l><output data-lo></output></div></label>
    <label class="field"><span>Room width</span><div class="range-row"><input type="range" min="2" max="12" step="0.5" value="4" data-w><output data-wo></output></div></label>
    <div class="field"><span>Type of room</span>${segGroup('room', [['Bedroom', 'bed'], ['Living room', 'live'], ['Open plan with kitchen', 'open']], 'live')}</div>
    <div class="field"><span>Ceiling</span>${segGroup('ceil', [['Standard', 'std'], ['High (over 2.7m)', 'high'], ['Raked or vaulted', 'raked']], 'std')}</div>
    <div class="field"><span>Afternoon sun</span>${segGroup('sun', [['Shaded', 'shade'], ['Some', 'some'], ['Lots (west facing)', 'lots']], 'some')}</div>
    <div class="field"><span>Insulation</span>${segGroup('ins', [['Good', 'good'], ['Average', 'avg'], ['Poor or unsure', 'poor']], 'avg')}</div>
  </div>
  <div class="out" aria-live="polite"><p>Suggested split system size</p><span class="big" data-kwo>–</span><div class="gauge"><i data-g></i></div><p data-area-txt></p><p data-kwmsg></p>
    <div class="btns"><a class="btn btn-sun" data-book></a></div><p class="note">A rough guide only. We confirm sizing on site, because orientation, windows and layout all matter.</p></div></div>`;
  const L = $('[data-l]', el), W = $('[data-w]', el), SIZES = [2.5, 3.5, 5.0, 6.0, 7.1, 8.0, 9.0];
  const BASE = { bed: 110, live: 125, open: 140 }, CEIL = { std: 1, high: 1.15, raked: 1.25 }, SUN = { shade: .95, some: 1, lots: 1.15 }, INS = { good: .92, avg: 1, poor: 1.12 };
  let used = false;
  const calc = user => {
    [L, W].forEach(fillRange);
    $('[data-lo]', el).textContent = (+L.value).toFixed(1) + ' m'; $('[data-wo]', el).textContent = (+W.value).toFixed(1) + ' m';
    const area = L.value * W.value;
    const kw = area * BASE[segVal(el, 'room')] * CEIL[segVal(el, 'ceil')] * SUN[segVal(el, 'sun')] * INS[segVal(el, 'ins')] / 1000;
    const size = SIZES.find(s => s >= kw);
    $('[data-area-txt]', el).textContent = `${Math.round(area)} m² room · about ${kw.toFixed(1)} kW of cooling needed`;
    $('[data-kwo]', el).textContent = size ? size.toFixed(1) + ' kW' : '9 kW +';
    $('[data-g]', el).style.width = Math.min(100, kw / 9.5 * 100) + '%';
    $('[data-kwmsg]', el).textContent = size ? 'A single split system should handle this room.' : 'A big space. Ducted or more than one split system is likely the better fit.';
    if (user && !used) { used = true; track('tool_used', { tool: 'kw_calculator' }); }
  };
  [L, W].forEach(r => r.addEventListener('input', () => calc(true)));
  wireSegs(el, () => calc(true)); calc();
  wireEnquiry(el);
});

/* ----- solar savings estimator (rough SA assumptions, TODO: check with client) ----- */
const SOLAR = { tariff: 0.42, feedIn: 0.04, yieldPerKw: 4.3, sizes: [6.6, 8, 10, 13.2] };
$$('[data-solar]').forEach(el => {
  el.innerHTML = `<div class="calc"><div>
    <label class="field"><span>Your average quarterly power bill</span><div class="range-row"><input type="range" min="150" max="1500" step="10" value="500" data-bill><output data-billo></output></div></label>
    <div class="field"><span>When is the home used most?</span>${segGroup('day', [['Someone home most days', 'home'], ['A mix', 'mix'], ['Mostly empty during the day', 'away']], 'mix')}<small>Solar saves the most when you use power while the sun is up.</small></div>
    <div class="field"><span>Running air conditioning?</span>${segGroup('ac', [['Yes, a lot', 'lots'], ['Sometimes', 'some'], ['Rarely', 'rare']], 'some')}<small>Running your aircon on sunshine during the day boosts savings.</small></div>
  </div>
  <div class="out" aria-live="polite"><p>Estimated yearly saving</p><span class="big" data-sav>–</span><p data-sys></p><div class="gauge"><i data-g></i></div><p data-pct></p>
    <div class="btns"><a class="btn btn-sun" data-book></a></div>
    <p class="note">Rough estimate using ${Math.round(SOLAR.tariff * 100)}c/kWh power, ${Math.round(SOLAR.feedIn * 100)}c/kWh feed-in and typical South Australian sunshine. Not a quote. Your actual savings depend on your tariff, roof and usage.</p></div></div>`;
  const bill = $('[data-bill]', el); let used = false;
  const calc = user => {
    fillRange(bill); $('[data-billo]', el).textContent = '$' + bill.value;
    const usage = bill.value * 4 / SOLAR.tariff;
    const selfShare = { home: .55, mix: .42, away: .3 }[segVal(el, 'day')] + { lots: .08, some: .04, rare: 0 }[segVal(el, 'ac')];
    const need = usage / (SOLAR.yieldPerKw * 365) * .9;
    const size = SOLAR.sizes.find(s => s >= need) || SOLAR.sizes[SOLAR.sizes.length - 1];
    const gen = size * SOLAR.yieldPerKw * 365, selfUsed = Math.min(gen * selfShare, usage * .8), exported = gen - selfUsed;
    const saving = Math.min(selfUsed * SOLAR.tariff + exported * SOLAR.feedIn, bill.value * 4 * .9);
    const pct = Math.round(saving / (bill.value * 4) * 100);
    $('[data-sav]', el).textContent = '$' + (Math.round(saving / 10) * 10).toLocaleString('en-AU');
    $('[data-sys]', el).textContent = `Based on a ${size}kW system`;
    $('[data-pct]', el).textContent = `About ${pct}% of your yearly power bill`;
    $('[data-g]', el).style.width = pct + '%';
    if (user && !used) { used = true; track('tool_used', { tool: 'solar_estimator' }); }
  };
  bill.addEventListener('input', () => calc(true)); wireSegs(el, () => calc(true)); calc();
  wireEnquiry(el);
});

/* ----- emergency checker ----- */
const EMERG = [
  ['Smoke, sparks or a burning smell', 'crit'], ['Someone has had an electric shock', 'shock'], ['Exposed or damaged wires', 'urgent'],
  ['No power, but neighbours have power', 'urgent'], ['No power in the whole street', 'grid'], ['Safety switch keeps tripping', 'urgent'],
  ['Flickering lights or a faulty power point', 'std'], ['Air conditioner not working or leaking', 'std']
];
$$('[data-emergency]').forEach(el => {
  el.innerHTML = `<p class="q">What's happening?</p><div class="em-opts">${EMERG.map(([l], i) => `<button type="button" class="opt" data-i="${i}">${l}</button>`).join('')}</div><div aria-live="polite" data-out></div>`;
  const out = $('[data-out]', el);
  const call = `<a class="btn btn-sun" href="tel:${LOC.tel}">${IC.phone}Call ${LOC.phone} now</a>`;
  const R = {
    crit: ['crit', 'If there is fire, call 000 now.', 'Get everyone away from the area. Only if it is safe, turn off power at the main switch. Once everyone is safe, call us for an urgent electrician.', `<a class="btn btn-sun" href="tel:000">Call 000</a>${call}`],
    shock: ['crit', 'Call 000 for medical help first.', 'Do not touch the person if they are still in contact with the power source. Turn off power at the main switch if it is safe. Then call us to make the installation safe.', `<a class="btn btn-sun" href="tel:000">Call 000</a>${call}`],
    urgent: ['urgent', 'This needs an electrician urgently.', 'Keep people and pets away, and do not touch anything exposed. We are available 24/7 for electrical emergencies.', call],
    grid: ['urgent', 'This is likely a network outage.', 'If the whole street is out, contact SA Power Networks on 13 13 66. If only your home is affected, call us.', `<a class="btn btn-ghost" href="tel:131366">Call SA Power Networks</a>${call}`],
    std: ['std', "Not an emergency, but let's fix it.", 'Make an enquiry online or give us a call, and we will get it sorted quickly.', `<a class="btn btn-sun" data-book></a><a class="btn btn-ghost" href="tel:${LOC.tel}">${IC.phone}Call us</a>`]
  };
  $$('.opt', el).forEach(b => b.addEventListener('click', () => {
    $$('.opt', el).forEach(x => x.classList.toggle('on', x === b));
    const r = R[EMERG[b.dataset.i][1]];
    out.innerHTML = `<div class="em-res ${r[0]}"><h3>${r[1]}</h3><p>${r[2]}</p><div class="btns">${r[3]}</div></div>`;
    wireEnquiry(out);
    track('tool_used', { tool: 'emergency_checker', answer: EMERG[b.dataset.i][1] });
  }));
});

/* ----- area checker (knows both locations) ----- */
const matchLoc = v => {
  const low = v.toLowerCase(), n = +(v.match(/\b5\d{3}\b/) || [0])[0];
  for (const [k, L] of Object.entries(LOCATIONS)) {
    const sub = L.suburbs.find(s => s.toLowerCase() === low) || (v.length > 2 && L.suburbs.find(s => s.toLowerCase().startsWith(low)));
    if (sub) return { k, L, place: sub, n };
  }
  if (n) for (const [k, L] of Object.entries(LOCATIONS)) if (L.postcodes(n)) return { k, L, place: v, n };
  return { n };
};
$$('[data-area]').forEach(el => {
  const listLoc = LOCATIONS[el.dataset.loc] || LOC;
  const allSubs = Object.values(LOCATIONS).flatMap(L => L.suburbs);
  const id = 'subs-' + Math.random().toString(36).slice(2, 7);
  el.innerHTML = `<form class="area-form" novalidate><input name="where" list="${id}" placeholder="Your suburb or postcode" aria-label="Your suburb or postcode" autocomplete="postal-code"><button class="btn btn-sun" type="submit">Check</button></form>
    <datalist id="${id}">${allSubs.map(s => `<option value="${s}">`).join('')}</datalist><div class="area-res" aria-live="polite"></div>
    ${el.hasAttribute('data-list') ? `<div class="sub-list">${listLoc.suburbs.map(s => `<span>${s}</span>`).join('')}</div>` : ''}`;
  const input = $('input', el), res = $('.area-res', el);
  const check = final => {
    const v = input.value.trim(); if (!v) { res.innerHTML = ''; return; }
    const m = matchLoc(v);
    if (m.L) {
      const other = m.k !== LOCK;
      res.innerHTML = `<div class="res ok"><span><b>Yes, our ${m.L.name} team covers ${esc(m.place)}.</b> ${other ? 'Visit their page or make an enquiry.' : 'Get a free quote or give us a call.'}</span>
        ${other ? `<a class="btn btn-ghost btn-sm" href="${locHref(m.k)}">${m.L.name} page</a>` : ''}<a class="btn btn-sun btn-sm" data-book>Get a free quote</a></div>`;
      wireEnquiry(res);
      if (final) track('area_check', { result: 'yes', team: m.k });
    } else if (final || v.length > 3) {
      res.innerHTML = `<div class="res maybe"><span><b>${POSTCODE_MAYBE(m.n) ? 'Most likely.' : "It's not on our usual list."}</b> We often travel further. Call us to check.</span><a class="btn btn-ghost btn-sm" href="tel:${LOC.tel}">Call ${LOC.phone}</a></div>`;
      if (final) track('area_check', { result: 'maybe' });
    } else res.innerHTML = '';
  };
  input.addEventListener('input', () => check(false));
  $('form', el).addEventListener('submit', e => { e.preventDefault(); check(true); });
});

/* =====================================================================
   7. REVIEWS, GALLERY, FORMS
   ===================================================================== */
$$('[data-reviews]').forEach(el => {
  const list = REVIEWS.slice(0, +el.dataset.limit || 99);
  el.innerHTML = `<div class="rv"><div class="rv-score"><span class="eyebrow">Google reviews</span><b>${SITE.rating}</b><i class="stars">★★★★★</i><p>from ${SITE.reviewCount} reviews by local customers</p>
    <div class="btns"><a class="btn btn-sun" href="${SITE.googleProfile}" target="_blank" rel="noopener">Read our reviews</a><a class="btn btn-ghost" href="${SITE.reviewLink}" target="_blank" rel="noopener" data-track-review>Leave a review</a></div></div>
    ${list.length ? `<div class="rv-list">${list.map(r => `<blockquote class="rv-card"><i class="stars">★★★★★</i><p>${esc(r.text)}</p><cite>${esc(r.name)}${r.when ? ' · ' + esc(r.when) : ''}</cite></blockquote>`).join('')}</div>`
      : `<div class="rv-alt"><div class="rv-card"><b>5/5</b><p>Also rated 5 out of 5 on Facebook.</p></div><div class="rv-card"><b>${SITE.years}+ years</b><p>Of air conditioning and electrical experience, from homes to 75kW commercial systems.</p></div></div>`}</div>`;
  $$('[data-track-review]', el).forEach(a => a.addEventListener('click', () => track('review_click')));
});

/* gallery + lightbox */
let lbItems = [], lbIndex = 0;
const lb = document.createElement('div');
lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Photo viewer');
lb.innerHTML = '<img alt=""><div class="lb-cap"></div><button class="lb-btn lb-x" aria-label="Close">×</button><button class="lb-btn lb-prev" aria-label="Previous">‹</button><button class="lb-btn lb-next" aria-label="Next">›</button>';
document.body.appendChild(lb);
const lbShow = i => { lbIndex = (i + lbItems.length) % lbItems.length; const p = lbItems[lbIndex]; $('img', lb).src = u('images/' + p[0]); $('img', lb).alt = p[1]; $('.lb-cap', lb).innerHTML = `<b>${esc(p[1])}</b>${esc(p[2])}`; };
const lbClose = () => { lb.classList.remove('on'); lockScroll(false); };
$('.lb-x', lb).onclick = lbClose; $('.lb-prev', lb).onclick = () => lbShow(lbIndex - 1); $('.lb-next', lb).onclick = () => lbShow(lbIndex + 1);
lb.addEventListener('click', e => e.target === lb && lbClose());
addEventListener('keydown', e => { if (!lb.classList.contains('on')) return; if (e.key === 'Escape') lbClose(); if (e.key === 'ArrowLeft') lbShow(lbIndex - 1); if (e.key === 'ArrowRight') lbShow(lbIndex + 1); });
let sx = 0; lb.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
lb.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) lbShow(lbIndex + (dx < 0 ? 1 : -1)); });

$$('[data-gallery]').forEach(el => {
  const cats = el.dataset.cat ? el.dataset.cat.split(',') : null, era = el.dataset.era, lim = +el.dataset.limit || 99;
  const list = PROJECTS.filter(p => (!cats || cats.includes(p[3])) && (!era || p[4] === era)).slice(0, lim);
  const used = [...new Set(list.map(p => p[3]))];
  const filters = el.hasAttribute('data-filters') ? `<div class="filters" role="group" aria-label="Filter projects"><button type="button" class="chip on" data-f="">All</button>${used.map(c => `<button type="button" class="chip" data-f="${c}">${CATS[c]}</button>`).join('')}</div>` : '';
  el.innerHTML = filters + `<div class="gallery">${list.map((p, i) => `<button type="button" class="g-item" data-i="${i}" data-c="${p[3]}"><figure><img src="${u('images/' + p[0])}" alt="${esc(p[1])}" loading="lazy"><span class="era${p[4] === 'Adelaide' ? ' adl' : ''}">${p[4]}</span><figcaption><b>${esc(p[1])}</b><span>${esc(p[2])}</span></figcaption></figure></button>`).join('')}</div>`;
  $$('.g-item', el).forEach(b => b.addEventListener('click', () => {
    lbItems = $$('.g-item:not([hidden])', el).map(x => list[+x.dataset.i]);
    lbShow(lbItems.indexOf(list[+b.dataset.i])); lb.classList.add('on'); lockScroll(true);
  }));
  $$('[data-f]', el).forEach(c => c.addEventListener('click', () => {
    $$('[data-f]', el).forEach(x => x.classList.toggle('on', x === c));
    $$('.g-item', el).forEach(g => g.hidden = !!c.dataset.f && g.dataset.c !== c.dataset.f);
    if (hasGS) ST.refresh();
  }));
});

/* contact + quote forms → GoHighLevel inbound webhook */
const smsHref = d => `sms:${LOC.tel}?&body=${encodeURIComponent(`Website enquiry (${LOC.name})\nName: ${d.full_name}\nPhone: ${d.phone}\nSuburb: ${d.suburb}\nService: ${d.service}\n${d.message || ''}`)}`;
$$('form[data-form]').forEach(f => {
  const err = $('.err', f);
  f.addEventListener('submit', async e => {
    e.preventDefault();
    if (f.company && f.company.value) return;   // honeypot: bots fill this hidden field, people don't
    let ok = true;
    $$('[required]', f).forEach(i => { const bad = !i.value.trim(); i.classList.toggle('bad', bad); if (bad) ok = false; });
    err.textContent = ok ? '' : 'Please fill in the highlighted fields.';
    if (!ok) { $('.bad', f).focus(); return; }

    const d = Object.fromEntries(new FormData(f)); delete d.company;
    const full = (d.name || '').trim(), parts = full.split(/\s+/);
    const payload = {
      ...d,
      full_name: full,
      first_name: parts[0] || '',
      last_name: parts.slice(1).join(' '),
      source: 'Website',
      form: f.dataset.form,          // "quote" (home page) or "contact" (contact page)
      team: LOC.name,                // Seaford or Middleton
      page: location.pathname,
      submitted_at: new Date().toISOString()
    };

    const btn = $('button[type=submit]', f), txt = btn.innerHTML;
    btn.disabled = true; btn.textContent = 'Sending…';
    try {
      if (!FORM_ENDPOINT) throw new Error('No form endpoint set');
      const r = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error(r.status);
      f.classList.add('sent'); f.reset();
      track('form_submit', { form: f.dataset.form, service: payload.service });
    } catch (x) {
      // never lose a lead: offer a call or a pre-filled text instead
      err.innerHTML = `Sorry, that didn't send. Please <a href="tel:${LOC.tel}">call ${LOC.phone}</a> or <a href="${smsHref(payload)}">send it as a text</a>.`;
      track('form_error', { form: f.dataset.form });
    } finally { btn.disabled = false; btn.innerHTML = txt; }
  });
});

/* =====================================================================
   8. PREMIUM MOTION
   ===================================================================== */
const blurOn = !mobileQ;                                   // blur is heavy on phones
const fx = (o, n) => { if (blurOn) o.filter = `blur(${n}px)`; return o; };

/* split text into words / characters (screen readers get a hidden plain copy) */
const splitText = (el, mode = 'chars') => {
  if (el.dataset.splitDone) return [];
  el.dataset.splitDone = 1;
  const sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = el.textContent.replace(/\s+/g, ' ').trim();
  const out = [];
  const walk = node => [...node.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
        const w = document.createElement('span'); w.className = 'sw'; w.setAttribute('aria-hidden', 'true');
        if (mode === 'words') { const c = document.createElement('span'); c.className = 'sc'; c.textContent = part; w.appendChild(c); out.push(c); }
        else [...part].forEach(ch => { const c = document.createElement('span'); c.className = 'sc'; c.textContent = ch; w.appendChild(c); out.push(c); });
        frag.appendChild(w);
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
  });
  walk(el); el.appendChild(sr);
  return out;
};

/* stagger delay for plain reveals */
$$('.reveal').forEach((el, i) => el.style.setProperty('--d', (i % 3) * .08 + 's'));

/* count-up numbers */
const countUp = el => {
  const to = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0;
  const f = v => v.toLocaleString('en-AU', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  if (reduce) { el.textContent = f(to); return; }
  const t0 = performance.now(), dur = 1800;
  const step = t => { const p = Math.min(1, (t - t0) / dur); el.textContent = f(to * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
};
const cio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } }), { threshold: .6 });
$$('[data-count]').forEach(el => cio.observe(el));

/* 3D tilt + mouse sheen (desktop only) */
if (fine && !reduce) $$('[data-tilt]').forEach(el => {
  const max = +el.dataset.tilt || 8; let raf = 0;
  el.addEventListener('pointerenter', () => el.classList.add('tilting'));
  el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      el.style.transform = `perspective(900px) rotateX(${((.5 - py) * max).toFixed(2)}deg) rotateY(${((px - .5) * max).toFixed(2)}deg)`;
      el.style.setProperty('--mx', px * 100 + '%'); el.style.setProperty('--my', py * 100 + '%');
      el.style.setProperty('--px', (px - .5).toFixed(3)); el.style.setProperty('--py', (py - .5).toFixed(3));
    });
  });
  el.addEventListener('pointerleave', () => { cancelAnimationFrame(raf); el.classList.remove('tilting'); el.style.transform = ''; el.style.setProperty('--px', 0); el.style.setProperty('--py', 0); });
});

/* magnetic buttons (desktop only) */
if (fine && !reduce) $$('.btn-sun, .menu-btn, .fab-btn').forEach(b => {
  b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.translate = `${((e.clientX - r.left - r.width / 2) * .18).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * .25).toFixed(1)}px`; });
  b.addEventListener('pointerleave', () => b.style.translate = '');
});

if (hasGS) {
  const rise = (sel, trigger, from, stagger = .1) => {
    const t = $$(sel); if (!t.length) return;
    G.from(t, Object.assign({ duration: 1.1, ease: 'power3.out', stagger, scrollTrigger: { trigger: trigger || t[0], start: 'top 85%', toggleActions: 'play none none reverse' } }, from));
  };

  /* reveals play when scrolling down, reverse when scrolling back up */
  $$('.reveal').forEach(el => ST.create({ trigger: el, start: 'top 90%', onEnter: () => el.classList.add('in'), onLeaveBack: () => el.classList.remove('in') }));

  /* home hero: intro after the loader, then drifts away on scroll */
  const hero = $('.hero, [data-hvid]');
  if (hero) {
    const chars = $$('[data-split]', hero).flatMap(el => splitText(el, el.dataset.split));
    const fades = $$('[data-hero-fade]', hero);
    G.set(chars, fx({ opacity: 0, yPercent: 90 }, 14)); G.set(fades, { opacity: 0, y: 28 });
    onReady(() => G.timeline({ delay: .1 })
      .to(chars, fx({ opacity: 1, yPercent: 0, duration: 1.2, ease: 'power4.out', stagger: .022, onComplete: () => G.set(chars, { clearProps: 'filter' }) }, 0))
      .to(fades, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .08 }, .45));
    if ($('.hero-copy', hero)) G.to('.hero-copy', fx({ yPercent: -14, opacity: 0, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 15%', scrub: true } }, 8));
  }

  /* inner page headings */
  $$('.phero h1').forEach(h => { const w = splitText(h, 'words'); G.from(w, fx({ opacity: 0, yPercent: 70, duration: 1.1, ease: 'power4.out', stagger: .06, delay: .15 }, 12)); });

  /* section headings: blur + rise, letter by letter */
  $$('[data-split]').forEach(el => {
    if (el.closest('.hero')) return;
    const parts = splitText(el, el.dataset.split || 'chars'); if (!parts.length) return;
    G.fromTo(parts, fx({ opacity: 0, yPercent: 70 }, 12), fx({ opacity: 1, yPercent: 0, duration: 1, ease: 'power3.out', stagger: el.dataset.split === 'words' ? .05 : .018, scrollTrigger: { trigger: el, start: 'top 86%', toggleActions: 'play none none reverse' } }, 0));
  });

  /* services: pinned, cards fan in from both sides and straighten */
  const svc = $('.svc');
  if (svc) {
    const mm = G.matchMedia();
    mm.add('(min-width: 1024px)', () => {
      const L = $$('.svc-left .svc-card', svc), R = $$('.svc-right .svc-card', svc);
      const fan = side => ({ xPercent: side * 150, rotateY: side * -70, rotateZ: i => side * [14, 4, -8][i], yPercent: i => [70, 0, -70][i], scale: .8, opacity: 0, transformOrigin: side < 0 ? 'right center' : 'left center', stagger: .1, duration: 1, ease: 'power3.out' });
      ST.create({ trigger: svc, start: 'top top', end: '+=100%', pin: true, anticipatePin: 1 });
      G.timeline({ scrollTrigger: { trigger: svc, start: 'top 65%', end: () => '+=' + innerHeight * 1.45, scrub: 1 } })
        .from(L, fan(-1), 0).from(R, fan(1), 0)
        .from('.svc-center', fx({ scale: .86, opacity: 0, duration: .9, ease: 'power3.out' }, 14), .15)
        .to({}, { duration: .4 });
    });
    mm.add('(max-width: 1023px)', () => {
      $$('.svc-card', svc).forEach(c => G.from(c, { y: 60, rotateX: -20, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: c, start: 'top 90%', toggleActions: 'play none none reverse' } }));
    });
  }

  rise('.stat', '.stat-grid', { y: 90, rotateX: -28, opacity: 0, transformOrigin: 'center bottom' });
  rise('.proj', '.proj-row', fx({ y: 120, rotateX: 16, opacity: 0 }, 10), .12);
  $$('.proj .pm-in img').forEach(img => G.fromTo(img, { yPercent: -7, scale: 1.18 }, { yPercent: 7, scale: 1.18, ease: 'none', scrollTrigger: { trigger: img.closest('.proj'), start: 'top bottom', end: 'bottom top', scrub: true } }));
  rise('.rv-score, .rv-card', '[data-reviews]', fx({ y: 80, opacity: 0, scale: .96 }, 16), .12);
  $$('.team-card').forEach((c, i) => {
    const tl = G.timeline({ delay: (i % 4) * .08, scrollTrigger: { trigger: c, start: 'top 85%', toggleActions: 'play none none reverse' } });
    tl.fromTo($('.team-img', c), { clipPath: 'inset(100% 0% 0% 0% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.3, ease: 'power4.inOut' })
      .fromTo($('img', c), { scale: 1.4 }, { scale: 1, duration: 1.6, ease: 'power3.out' }, 0)
      .from($('figcaption', c), { y: 20, opacity: 0, duration: .8, ease: 'power3.out' }, .6);
  });
  rise('.final .form', '.final-grid', fx({ y: 100, rotateX: 14, opacity: 0, transformOrigin: 'center top' }, 12));
  $$('.band-img').forEach(b => G.fromTo(b, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: b.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));

  addEventListener('load', () => ST.refresh());
} else {
  /* fallback when GSAP is not loaded or reduced motion is on */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(el => io.observe(el));
}

/* =====================================================================
   9. 3D SCENE: air con unit that travels down the home page
   ===================================================================== */
const SCENE = {
  model: '',  // REPLACE (3D model): e.g. 'models/aircon.glb', and uncomment the GLTFLoader <script> in index.html
  /* Where the unit sits for each section (data-scene="..."): position x/y/z, rotation rx/ry (radians), scale s, opacity o */
  keys: {
    hero:     { x: 0,    y: -3,   z: -4,   rx: .3,  ry: -1,   s: .6,  o: 0 },   // hidden during the frame hero, flies in for Services
    services: { x: 0,    y: .1,   z: -3.2, rx: .35, ry: .6,   s: .8,  o: .22 },
    stats:    { x: -2.4, y: -.3,  z: -1.2, rx: .18, ry: .95,  s: .82, o: .85 },
    projects: { x: 2.7,  y: 1.5,  z: -3.5, rx: -.2, ry: -1.4, s: .6,  o: .3 },
    learn:    { x: 0,    y: 3.2,  z: -5,   rx: .5,  ry: .2,   s: .5,  o: 0 },
    reviews:  { x: -2.6, y: .9,   z: -2.6, rx: .2,  ry: -2.5, s: .7,  o: .45 },
    team:     { x: 2.8,  y: -1.7, z: -3,   rx: .1,  ry: 2.3,  s: .6,  o: 0 },
    area:     { x: 0,    y: 3,    z: -5,   rx: .3,  ry: 3.3,  s: .5,  o: 0 },
    cta:      { x: -2.1, y: -.5,  z: -.6,  rx: .15, ry: .6,   s: .85, o: 1 }
  }
};
const sceneReady = () => { if (sceneDone) return; sceneDone = true; dispatchEvent(new Event('ca:sceneready')); };
const sceneEl = $('#scene');
if (!sceneEl) sceneReady();
else (() => {
  const T = window.THREE;
  let renderer = null;
  if (T) { try { renderer = new T.WebGLRenderer({ antialias: !mobileQ, alpha: true, powerPreference: 'high-performance' }); } catch (e) { renderer = null; } }
  if (!renderer) { document.body.classList.add('no3d'); sceneEl.remove(); sceneReady(); return; }   // falls back to a photo hero
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobileQ ? 1.4 : 1.8));
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  sceneEl.appendChild(renderer.domElement);

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(35, 1, .1, 60); camera.position.set(0, 0, 7.5);
  const root = new T.Group(); scene.add(root);   // moves between sections
  const unit = new T.Group(); root.add(unit);    // the air con
  const ph = new T.Group(); unit.add(ph);        // placeholder model (hidden if a GLB loads)

  /* lights: white key, orange + rust rims (logo), lavender fill */
  scene.add(new T.HemisphereLight(0xfff3e6, 0x08080b, .65));
  const key = new T.DirectionalLight(0xffffff, 1.5); key.position.set(3, 4, 6); scene.add(key);
  const rim = new T.DirectionalLight(0xF49424, 2.4); rim.position.set(-5, 2.5, -3); scene.add(rim);
  const rim2 = new T.DirectionalLight(0xAA4D28, 1.4); rim2.position.set(5, -1, -4); scene.add(rim2);
  const fill = new T.PointLight(0xAEAFC2, 1.4, 14); fill.position.set(-3, -2, 4); scene.add(fill);

  /* materials (all fadeable) */
  const mats = [];
  const mat = (Type, o) => { const m = new T[Type](Object.assign({ transparent: true }, o)); mats.push(m); return m; };
  const M = {
    body: mat('MeshPhysicalMaterial', { color: 0xf3efe8, roughness: .3, clearcoat: .9, clearcoatRoughness: .2 }),
    dark: mat('MeshStandardMaterial', { color: 0x141418, roughness: .55 }),
    line: mat('MeshStandardMaterial', { color: 0xd8d2c8, roughness: .5 }),
    accent: mat('MeshStandardMaterial', { color: 0xF49424, emissive: 0xF49424, emissiveIntensity: .8, roughness: .4 }),
    blade: mat('MeshPhysicalMaterial', { color: 0xe9e4dc, roughness: .35, clearcoat: .6 })
  };

  /* rounded box + plain box helpers */
  const rbox = (w, h, d, r, m) => {
    const b = Math.min(r, d / 2) * .6, W = w - 2 * b, H = h - 2 * b, rr = Math.max(.001, r - b), x = -W / 2, y = -H / 2;
    const s = new T.Shape();
    s.moveTo(x + rr, y); s.lineTo(x + W - rr, y); s.quadraticCurveTo(x + W, y, x + W, y + rr); s.lineTo(x + W, y + H - rr); s.quadraticCurveTo(x + W, y + H, x + W - rr, y + H);
    s.lineTo(x + rr, y + H); s.quadraticCurveTo(x, y + H, x, y + H - rr); s.lineTo(x, y + rr); s.quadraticCurveTo(x, y, x + rr, y);
    const depth = Math.max(.001, d - 2 * b);
    const g = new T.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelSegments: 5, curveSegments: 12 });
    g.translate(0, 0, -depth / 2); g.computeVertexNormals();
    return new T.Mesh(g, m);
  };
  const box = (w, h, d, m, x, y, z, p = ph) => { const b = new T.Mesh(new T.BoxGeometry(w, h, d), m); b.position.set(x, y, z); p.add(b); return b; };

  /* placeholder wall-split indoor unit (front face sits at z = .3) */
  ph.add(rbox(2.6, .8, .6, .16, M.body));
  box(2.36, .012, .012, M.line, 0, .16, .3);                                       // panel seam
  box(.56, .016, .014, M.accent, -.82, .16, .305);                                 // orange brand strip
  for (let i = 0; i < 18; i++) box(.05, .012, .44, M.dark, -1.02 + i * .12, .4, 0); // top intake slots
  box(2.3, .12, .22, M.dark, 0, -.34, .14);                                        // air outlet
  const louver = new T.Group(); louver.position.set(0, -.36, .27); ph.add(louver);
  box(2.24, .022, .2, M.blade, 0, 0, -.06, louver);

  /* little temperature display: cools from 28° to 21° as you scroll down */
  const dc = document.createElement('canvas'); dc.width = 256; dc.height = 96;
  const dctx = dc.getContext('2d'), dTex = new T.CanvasTexture(dc); dTex.encoding = T.sRGBEncoding;
  const dMat = new T.MeshBasicMaterial({ map: dTex, transparent: true, toneMapped: false }); mats.push(dMat);
  const disp = new T.Mesh(new T.PlaneGeometry(.42, .16), dMat); disp.position.set(.86, -.06, .305); ph.add(disp);
  let shownTemp = -1;
  const drawTemp = t => {
    if (t === shownTemp) return; shownTemp = t;
    dctx.clearRect(0, 0, 256, 96); dctx.fillStyle = '#d4d5ec'; dctx.shadowColor = 'rgba(174,175,194,.9)'; dctx.shadowBlur = 14;
    dctx.font = '600 64px "Space Grotesk", system-ui, sans-serif'; dctx.textAlign = 'center'; dctx.textBaseline = 'middle';
    dctx.fillText(t + '°', 128, 52); dTex.needsUpdate = true;
  };
  drawTemp(28);

  /* soft round sprite textures */
  const radial = stops => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); stops.forEach(([o, col]) => gr.addColorStop(o, col)); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new T.CanvasTexture(c); };
  const dot = radial([[0, 'rgba(255,255,255,1)'], [.4, 'rgba(255,255,255,.35)'], [1, 'rgba(255,255,255,0)']]);
  const glowTex = radial([[0, 'rgba(255,255,255,.9)'], [.35, 'rgba(255,255,255,.25)'], [1, 'rgba(255,255,255,0)']]);

  /* orange glow behind the unit */
  const glow = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xF49424, transparent: true, blending: T.AdditiveBlending, depthWrite: false, opacity: .45 }));
  glow.scale.set(7, 5, 1); glow.position.set(0, 0, -1.2); root.add(glow);

  /* cold-air mist from the louver (fewer particles on phones, none for reduced motion) */
  const N = reduce ? 0 : (mobileQ ? 140 : 420);
  const mp = new Float32Array(N * 3), mv = new Float32Array(N * 3), mc = new Float32Array(N * 3), ml = new Float32Array(N), mlMax = new Float32Array(N);
  const MC = new T.Color(0xc4c6e4);
  const spawn = i => { const k = i * 3; mp[k] = (Math.random() - .5) * 2.1; mp[k + 1] = -.42; mp[k + 2] = .3; mv[k] = (Math.random() - .5) * .25; mv[k + 1] = -(.25 + Math.random() * .45); mv[k + 2] = .45 + Math.random() * .7; mlMax[i] = ml[i] = 1.6 + Math.random() * 1.4; };
  for (let i = 0; i < N; i++) { spawn(i); ml[i] = Math.random() * mlMax[i]; }
  const mGeo = new T.BufferGeometry();
  mGeo.setAttribute('position', new T.BufferAttribute(mp, 3)); mGeo.setAttribute('color', new T.BufferAttribute(mc, 3));
  const mistPts = new T.Points(mGeo, new T.PointsMaterial({ size: mobileQ ? .16 : .13, map: dot, transparent: true, depthWrite: false, blending: T.AdditiveBlending, vertexColors: true }));
  unit.add(mistPts);
  const updateMist = (dt, power) => {
    if (!N) return;
    mistPts.visible = power > .01; if (!mistPts.visible) return;
    for (let i = 0; i < N; i++) {
      const k = i * 3; ml[i] -= dt;
      if (ml[i] <= 0) spawn(i);
      mp[k] += mv[k] * dt; mp[k + 1] += mv[k + 1] * dt; mp[k + 2] += mv[k + 2] * dt; mv[k + 1] *= .992;
      const a = Math.sin(Math.PI * (1 - ml[i] / mlMax[i])) * power * .9;   // fade in and out
      mc[k] = MC.r * a; mc[k + 1] = MC.g * a; mc[k + 2] = MC.b * a;
    }
    mGeo.attributes.position.needsUpdate = true; mGeo.attributes.color.needsUpdate = true;
  };

  /* floating dust in logo colours: drifts up as you scroll, for depth */
  const D = mobileQ ? 110 : 260, dp = new Float32Array(D * 3), dcol = new Float32Array(D * 3), dBase = new Float32Array(D), dSpd = new Float32Array(D);
  const PAL = [0xF49424, 0xD4C09A, 0xAEAFC2, 0xAA4D28].map(h => new T.Color(h));
  for (let i = 0; i < D; i++) {
    const k = i * 3, c = PAL[i % 4], b = .25 + Math.random() * .45;
    dp[k] = (Math.random() - .5) * 18; dp[k + 2] = -10 + Math.random() * 11; dBase[i] = Math.random() * 12; dSpd[i] = .4 + Math.random() * 1.2;
    dcol[k] = c.r * b; dcol[k + 1] = c.g * b; dcol[k + 2] = c.b * b;
  }
  const dGeo = new T.BufferGeometry();
  dGeo.setAttribute('position', new T.BufferAttribute(dp, 3)); dGeo.setAttribute('color', new T.BufferAttribute(dcol, 3));
  scene.add(new T.Points(dGeo, new T.PointsMaterial({ size: .05, map: dot, transparent: true, depthWrite: false, blending: T.AdditiveBlending, vertexColors: true })));
  const updateDust = (t, y) => {
    for (let i = 0; i < D; i++) { const v = dBase[i] + y * .0016 * dSpd[i] + (reduce ? 0 : t * .04 * dSpd[i]); dp[i * 3 + 1] = (v % 12) - 6; }
    dGeo.attributes.position.needsUpdate = true;
  };

  /* optional GLB model (replaces the placeholder) */
  if (SCENE.model && T.GLTFLoader) new T.GLTFLoader().load(u(SCENE.model), g => {
    const m = g.scene, b3 = new T.Box3().setFromObject(m), size = b3.getSize(new T.Vector3()), c = b3.getCenter(new T.Vector3());
    m.position.sub(c);
    const holder = new T.Group(); holder.scale.setScalar(2.6 / Math.max(size.x, size.y, size.z)); holder.add(m); unit.add(holder);
    m.traverse(o => { if (o.isMesh) [].concat(o.material).forEach(mt => { mt.transparent = true; mats.push(mt); }); });
    ph.visible = false;
  }, undefined, e => console.warn('GLB not loaded, using placeholder', e));

  /* section tracking + smoothing */
  const secs = $$('[data-scene]');
  const keyFor = name => {
    const k = SCENE.keys[name] || SCENE.keys.hero;
    if (!mobileQ) return k;
    return name === 'hero' ? { x: 0, y: -2, z: -3, rx: .3, ry: -1, s: .5, o: 0 }
      : { x: k.x * .15, y: k.y * .5 + .9, z: k.z - .6, rx: k.rx, ry: k.ry, s: k.s * .62, o: k.o * .55 };
  };
  const S = Object.assign({}, keyFor('hero'));
  let active = 'hero', mx = 0, my = 0, tmx = 0, tmy = 0, lastY = scrollY, vel = 0, frameN = 0, ready = false, louverT = 0, first = true;
  if (fine && !reduce) addEventListener('pointermove', e => { tmx = e.clientX / innerWidth * 2 - 1; tmy = e.clientY / innerHeight * 2 - 1; }, { passive: true });
  onReady(() => { ready = true; });
  const pickActive = () => { const line = innerHeight * .55; for (const s of secs) { const r = s.getBoundingClientRect(); if (r.top <= line && r.bottom > line) { active = s.dataset.scene; return; } } };
  const resize = () => { const w = sceneEl.clientWidth, h = sceneEl.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < .8 ? 44 : 35; camera.updateProjectionMatrix(); };
  let lw = innerWidth;
  addEventListener('resize', () => { if (mobileQ && innerWidth === lw) return; lw = innerWidth; resize(); });   // ignore phone URL-bar jumps
  resize();

  const clock = new T.Clock();
  (function tick() {
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime, y = scrollY;
    if (frameN++ % 4 === 0) pickActive();
    const v = lenis ? (lenis.velocity || 0) : (y - lastY); lastY = y; vel += (v - vel) * .1;
    const k = keyFor(active), a = reduce ? 1 : 1 - Math.exp(-dt * 2.6);
    for (const p in k) S[p] += (k[p] - S[p]) * a;
    mx += (tmx - mx) * .05; my += (tmy - my) * .05;
    const idle = reduce ? 0 : 1;
    root.position.set(S.x, S.y + Math.sin(t * .9) * .06 * idle, S.z);
    root.rotation.set(S.rx + my * .12, S.ry + Math.sin(t * .35) * .1 * idle + mx * .32, cl(-vel * .004, -.25, .25));   // leans with scroll speed
    root.scale.setScalar(S.s);
    for (const m of mats) m.opacity = S.o;
    glow.material.opacity = S.o * .45;
    drawTemp(Math.round(28 - cl(y / Math.max(1, document.documentElement.scrollHeight - innerHeight)) * 7));
    louverT += ((ready ? 1 : 0) - louverT) * .03; louver.rotation.x = louverT * .9;   // opens after the loader
    updateMist(dt, louverT * S.o); updateDust(t, y);
    camera.position.x += (mx * .35 - camera.position.x) * .05; camera.position.y += (-my * .2 - camera.position.y) * .05; camera.lookAt(0, 0, -1);
    renderer.render(scene, camera);
    if (first) { first = false; sceneReady(); }
  })();
})();

/* =====================================================================
   10. LOADING SCREEN (home page only)
   ===================================================================== */
const finishReady = () => {
  if (isReady) return; isReady = true;
  document.documentElement.classList.remove('is-loading');
  if (lenis) lenis.start();
  dispatchEvent(new Event('ca:ready'));
  if (hasGS) ST.refresh();
};
if (!loaderEl) finishReady();
else {
  const num = $('[data-load-num]', loaderEl), bar = $('.loader-bar i', loaderEl);
  let target = 10, shown = 0;
  const bump = n => { target = Math.min(100, target + n); };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => bump(25));
  if (document.readyState === 'complete') bump(35); else addEventListener('load', () => bump(35), { once: true });
  if (sceneDone) bump(30); else addEventListener('ca:sceneready', () => bump(30), { once: true });
  setTimeout(() => { target = 100; }, 5000);   // never wait longer than 5 seconds
  const t0 = performance.now();
  (function step() {
    shown = Math.min(target, shown + (target - shown) * .08 + .2);
    num.textContent = Math.floor(shown); bar.style.transform = `scaleX(${shown / 100})`;
    if (shown >= 99.5 && performance.now() - t0 > 700) {
      num.textContent = 100; loaderEl.classList.add('done');
      setTimeout(() => loaderEl.remove(), 1200);
      finishReady(); return;
    }
    requestAnimationFrame(step);
  })();
}
})();
