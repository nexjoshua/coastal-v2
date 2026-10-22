/* ===== Coastal Air & Electrical: hero3d.js =====
   Scroll-driven 3D split system install (Three.js r149) */
(() => {
'use strict';
const sec = document.querySelector('[data-h3d]');
if (!sec) return;
const $ = (s, c = sec) => c.querySelector(s), $$ = (s, c = sec) => [...c.querySelectorAll(s)];
const stage = $('.h3d-stage'), steps = $$('[data-step-at]'), dots = $$('.h3d-rail button');
const intro = $('.h3d-intro'), finale = $('.h3d-final'), bar = $('.h3d-bar i');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p, a, b) => cl((p - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eout = t => 1 - Math.pow(1 - t, 3);
const bounce = x => { const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + .75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + .9375; return n * (x -= 2.625 / d) * x + .984375; };
const track = (event, data = {}) => (window.dataLayer = window.dataLayer || []).push({ event, ...data });

/* ---------- overlay text + progress (works even without 3D) ---------- */
const FINAL_AT = .88;
const getTarget = () => { const r = sec.getBoundingClientRect(); return cl(-r.top / Math.max(1, sec.offsetHeight - innerHeight)); };
let lastIdx = -2;
const syncUI = p => {
  if (intro) intro.classList.toggle('out', p > .05);
  let idx = -1; steps.forEach((s, i) => { if (p >= +s.dataset.stepAt) idx = i; });
  if (p >= FINAL_AT) idx = steps.length;
  steps.forEach((s, i) => s.classList.toggle('on', i === idx));
  dots.forEach((d, i) => d.classList.toggle('on', i <= idx));
  if (finale) finale.classList.toggle('on', idx === steps.length);
  if (bar) bar.style.transform = `scaleX(${p})`;
  if (idx !== lastIdx) { if (idx >= 0) track('hero_step', { step: idx + 1 }); lastIdx = idx; }
};
dots.forEach((d, i) => d.addEventListener('click', () => {
  const at = i < steps.length ? +steps[i].dataset.stepAt + .03 : FINAL_AT + .04;
  scrollTo({ top: sec.offsetTop + at * (sec.offsetHeight - innerHeight), behavior: reduce ? 'auto' : 'smooth' });
}));

/* ---------- WebGL check: fall back to a photo if 3D isn't available ---------- */
const T = window.THREE;
let renderer = null;
if (T) { try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { renderer = null; } }
if (!renderer) { sec.classList.add('no3d'); (function loop() { syncUI(getTarget()); requestAnimationFrame(loop); })(); return; }

const mobile = innerWidth < 860;
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 1.75));
renderer.outputEncoding = T.sRGBEncoding;
renderer.toneMapping = T.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = !mobile;
renderer.shadowMap.type = T.PCFSoftShadowMap;
renderer.domElement.className = 'h3d-canvas';
renderer.domElement.setAttribute('aria-hidden', 'true');
stage.insertBefore(renderer.domElement, stage.firstChild.nextSibling);

const scene = new T.Scene();
const camera = new T.PerspectiveCamera(36, 1, .1, 100);
const world = new T.Group(); scene.add(world);

/* ---------- lights ---------- */
scene.add(new T.HemisphereLight(0xfff4e6, 0x1b1e2a, .85));
const key = new T.DirectionalLight(0xffffff, 1.15);
key.position.set(4, 6, 6); key.castShadow = !mobile;
key.shadow.mapSize.set(1024, 1024);
Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 20 });
key.shadow.bias = -.0005; scene.add(key);
const rim = new T.DirectionalLight(0xffd2a0, .7); rim.position.set(-3, 4, -6); scene.add(rim);

/* ---------- textures ---------- */
const canvasTex = (draw, rep) => {
  const c = document.createElement('canvas'); c.width = c.height = 512; draw(c.getContext('2d'));
  const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t;
};
const brickTex = canvasTex(g => {
  g.fillStyle = '#c9b7a0'; g.fillRect(0, 0, 512, 512);
  const bw = 64, bh = 28;
  for (let y = 0, r = 0; y < 512; y += bh, r++) for (let x = -(r % 2) * bw / 2; x < 512; x += bw) {
    const v = Math.random() * 26; g.fillStyle = `rgb(${172 + v},${92 + v * .6},${62 + v * .4})`; g.fillRect(x + 3, y + 3, bw - 6, bh - 6);
  }
}, [3, 2]);
const boardTex = canvasTex(g => {
  for (let i = 0; i < 8; i++) { const v = Math.random() * 18; g.fillStyle = `rgb(${196 + v},${160 + v},${118 + v * .6})`; g.fillRect(0, i * 64, 512, 64); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, i * 64, 512, 2); }
}, [4, 4]);

/* ---------- materials ---------- */
const M = {
  wallIn: new T.MeshStandardMaterial({ color: 0xE4DACB, roughness: .95 }),
  wallOut: new T.MeshStandardMaterial({ map: brickTex, roughness: .9 }),
  edge: new T.MeshStandardMaterial({ color: 0xD9CDB8, roughness: .9 }),
  floorIn: new T.MeshStandardMaterial({ map: boardTex, roughness: .8 }),
  ground: new T.MeshStandardMaterial({ color: 0x7d8073, roughness: 1 }),
  white: new T.MeshStandardMaterial({ color: 0xfafaf7, roughness: .5 }),
  glass: new T.MeshStandardMaterial({ color: 0xa9c8e8, emissive: 0x9fc1e6, emissiveIntensity: .35, roughness: .1, metalness: .2 }),
  unit: new T.MeshStandardMaterial({ color: 0xF7F6F2, roughness: .32, metalness: .05 }),
  line: new T.MeshStandardMaterial({ color: 0xcfcfca, roughness: .6 }),
  dark: new T.MeshStandardMaterial({ color: 0x22252f, roughness: .6 }),
  metal: new T.MeshStandardMaterial({ color: 0xb9bcc4, roughness: .35, metalness: .75 }),
  copper: new T.MeshStandardMaterial({ color: 0xC77B48, roughness: .3, metalness: .85 }),
  insul: new T.MeshStandardMaterial({ color: 0x2a2d36, roughness: .85 }),
  cover: new T.MeshStandardMaterial({ color: 0xEDEBE6, roughness: .45 }),
  led: new T.MeshStandardMaterial({ color: 0x111111, emissive: 0x8fc8ff, emissiveIntensity: 0 }),
  sun: new T.MeshStandardMaterial({ color: 0xF49424, emissive: 0xF49424, emissiveIntensity: .25, roughness: .4 }),
  laser: new T.MeshBasicMaterial({ color: 0xff3b2f, transparent: true, opacity: 0, toneMapped: false })
};

/* ---------- helpers ---------- */
const box = (w, h, d, mat, x = 0, y = 0, z = 0, parent = world) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
const rbox = (w, h, d, r, mat) => {
  const b = Math.min(r, d / 2) * .6, W = w - 2 * b, H = h - 2 * b, rr = Math.max(.001, r - b), x = -W / 2, y = -H / 2;
  const s = new T.Shape();
  s.moveTo(x + rr, y); s.lineTo(x + W - rr, y); s.quadraticCurveTo(x + W, y, x + W, y + rr); s.lineTo(x + W, y + H - rr); s.quadraticCurveTo(x + W, y + H, x + W - rr, y + H);
  s.lineTo(x + rr, y + H); s.quadraticCurveTo(x, y + H, x, y + H - rr); s.lineTo(x, y + rr); s.quadraticCurveTo(x, y, x + rr, y);
  const depth = Math.max(.001, d - 2 * b);
  const g = new T.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelSegments: 4, curveSegments: 10 });
  g.translate(0, 0, -depth / 2); g.computeVertexNormals();
  const m = new T.Mesh(g, mat); m.castShadow = m.receiveShadow = true; return m;
};

/* ---------- room: wall, floors, window ---------- */
const FLOOR = -2.2, WZ = .15;
const wall = new T.Mesh(new T.BoxGeometry(9, 6, .3), [M.edge, M.edge, M.edge, M.edge, M.wallIn, M.wallOut]);
wall.position.y = .8; wall.receiveShadow = true; world.add(wall);
const floorIn = new T.Mesh(new T.PlaneGeometry(9, 6), M.floorIn); floorIn.rotation.x = -Math.PI / 2; floorIn.position.set(0, FLOOR, WZ + 3); floorIn.receiveShadow = true; world.add(floorIn);
const ground = new T.Mesh(new T.PlaneGeometry(9, 6), M.ground); ground.rotation.x = -Math.PI / 2; ground.position.set(0, FLOOR, -WZ - 3); ground.receiveShadow = true; world.add(ground);
box(9, .14, .04, M.white, 0, FLOOR + .07, WZ + .02);
box(1.4, 1.6, .06, M.white, -2.7, 1.1, WZ + .03);
box(1.2, 1.4, .02, M.glass, -2.7, 1.1, WZ + .065);
box(.04, 1.4, .03, M.white, -2.7, 1.1, WZ + .08);

/* ---------- install pieces ---------- */
const laser = new T.Mesh(new T.PlaneGeometry(8, .014), M.laser); laser.position.set(0, 1.52, WZ + .004); world.add(laser);
const bracket = box(1.5, .42, .02, M.metal, .4, 1.52, WZ + .012); bracket.visible = false;

const HX = -.75, HY = 1.3;
const ringG = new T.TorusGeometry(.1, .022, 10, 32);
const rings = [WZ + .002, -WZ - .002].map(z => { const r = new T.Mesh(ringG, M.dark); r.position.set(HX, HY, z); r.scale.setScalar(.001); world.add(r); return r; });

const drill = new T.Group(); world.add(drill);
const bit = new T.Mesh(new T.CylinderGeometry(.075, .075, .55, 16), M.metal); bit.rotation.x = Math.PI / 2; bit.position.z = -.275; drill.add(bit);
const dBody = rbox(.22, .3, .6, .06, M.sun); dBody.position.z = .3; drill.add(dBody);
box(.12, .35, .14, M.dark, 0, -.3, .4, drill);
drill.position.set(HX, HY, 1.6); drill.visible = false;

const curve = pts => new T.CatmullRomCurve3(pts.map(p => new T.Vector3(p[0], p[1], p[2])), false, 'catmullrom', .15);
const tube = (c, r, mat, segs) => { const m = new T.Mesh(new T.TubeGeometry(c, segs, r, 10, false), mat); m.castShadow = true; m.visible = false; world.add(m); return m; };
const drawTube = (m, t) => { const n = m.geometry.index.count; m.geometry.setDrawRange(0, Math.floor(n * t / 3) * 3); m.visible = t > 0; };
const inPts = [[-.35, 1.42, .22], [-.6, 1.36, .2], [HX, HY, .12], [HX, HY, -.2]];
const outPts = [[HX, HY, -.16], [HX, 1.12, -.22], [HX, .2, -.22], [HX, -1.1, -.22], [-.72, -1.4, -.32], [-.52, -1.5, -.58], [-.38, -1.5, -.74]];
const pipeIn = tube(curve(inPts), .045, M.insul, 60);
const pipeIn2 = tube(curve(inPts.map(p => [p[0], p[1] + .07, p[2]])), .018, M.copper, 60);
const pipeOut = tube(curve(outPts), .045, M.insul, 140);
const pipeOut2 = tube(curve(outPts.map(p => [p[0] + .06, p[1], p[2]])), .018, M.copper, 140);

const coverG = new T.BoxGeometry(.18, 2.3, .14); coverG.translate(0, -1.15, 0);
const cover = new T.Mesh(coverG, M.cover); cover.position.set(HX, 1.14, -.22); cover.castShadow = true; cover.scale.y = .001; cover.visible = false; world.add(cover);

/* indoor unit */
const IU = new T.Vector3(.4, 1.5, WZ + .19);
const iu = new T.Group(); world.add(iu);
iu.add(rbox(1.7, .5, .3, .07, M.unit));
box(1.62, .012, .01, M.line, 0, .07, .153, iu);
box(.36, .012, .01, M.sun, -.55, .07, .156, iu);
box(1.5, .07, .16, M.dark, 0, -.22, .03, iu);
const louver = new T.Group(); louver.position.set(0, -.245, .01); iu.add(louver);
box(1.46, .018, .13, M.unit, 0, 0, .065, louver);
box(.05, .018, .008, M.led, .74, -.1, .156, iu);
const dc = document.createElement('canvas'); dc.width = 128; dc.height = 64;
const dx = dc.getContext('2d'), dTex = new T.CanvasTexture(dc); dTex.encoding = T.sRGBEncoding;
const disp = new T.Mesh(new T.PlaneGeometry(.17, .085), new T.MeshBasicMaterial({ map: dTex, transparent: true, opacity: 0, toneMapped: false }));
disp.position.set(.6, -.06, .158); iu.add(disp);
iu.visible = false;

/* outdoor unit */
const OU_Y = -1.62;
const ou = new T.Group(); ou.position.set(.35, OU_Y, -.78); world.add(ou);
ou.add(rbox(1.4, .95, .5, .05, M.unit));
const fz = -.255;
const disc = new T.Mesh(new T.CircleGeometry(.33, 40), M.dark); disc.position.set(-.18, 0, fz); disc.rotation.y = Math.PI; ou.add(disc);
[[.33, .016], [.2, .01]].forEach(([r, t]) => { const g = new T.Mesh(new T.TorusGeometry(r, t, 8, 48), M.metal); g.position.set(-.18, 0, fz - .006); ou.add(g); });
const fan = new T.Group(); fan.position.set(-.18, 0, fz - .012); ou.add(fan);
for (let i = 0; i < 3; i++) { const piv = new T.Group(); piv.rotation.z = i * 2.094; const bl = new T.Mesh(new T.BoxGeometry(.26, .09, .01), M.metal); bl.position.x = .14; piv.add(bl); fan.add(piv); }
for (let i = 0; i < 7; i++) box(.34, .018, .01, M.line, .42, -.3 + i * .1, fz, ou);
box(.2, .05, .01, M.sun, .42, .38, fz, ou);
[-.5, .5].forEach(x => box(.12, .08, .5, M.dark, x, -.515, 0, ou));
ou.visible = false;

/* airflow particles */
const N = mobile ? 220 : 420, AP = new Float32Array(N * 3), AV = new Float32Array(N * 3), AL = new Float32Array(N);
const spawn = i => { const k = i * 3; AP[k] = IU.x + (Math.random() - .5) * 1.3; AP[k + 1] = IU.y - .28; AP[k + 2] = IU.z + .14; AV[k] = (Math.random() - .5) * .18; AV[k + 1] = -(.28 + Math.random() * .32); AV[k + 2] = .75 + Math.random() * .6; AL[i] = 1.2 + Math.random() * .9; };
for (let i = 0; i < N; i++) { spawn(i); AL[i] = Math.random() * 2; }
const aGeo = new T.BufferGeometry(); aGeo.setAttribute('position', new T.BufferAttribute(AP, 3));
const sprite = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new T.CanvasTexture(c); })();
const aMat = new T.PointsMaterial({ size: .09, map: sprite, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, color: 0x8fc8ff });
const air = new T.Points(aGeo, aMat); air.visible = false; world.add(air);
const updateAir = (dt, on) => {
  aMat.opacity = on * .8; air.visible = on > 0; if (!on) return;
  for (let i = 0; i < N; i++) { AL[i] -= dt; if (AL[i] <= 0) { spawn(i); continue; } const k = i * 3; AP[k] += AV[k] * dt; AP[k + 1] += AV[k + 1] * dt; AP[k + 2] += AV[k + 2] * dt; }
  aGeo.attributes.position.needsUpdate = true;
};
const glow = new T.PointLight(0x8fc8ff, 0, 5); glow.position.set(IU.x, IU.y - .5, IU.z + 1); world.add(glow);

/* ---------- temperature from the remote dial (script.js sends 'ca:temp') ---------- */
const COOL = new T.Color(0x8fc8ff), MID = new T.Color(0xf4f6ff), WARM = new T.Color(0xffad5c), tint = new T.Color();
let warm = .43, temp = 22;
const drawDisp = () => { dx.clearRect(0, 0, 128, 64); dx.fillStyle = '#' + tint.getHexString(); dx.font = '700 40px Figtree, system-ui, sans-serif'; dx.textAlign = 'center'; dx.textBaseline = 'middle'; dx.fillText((temp % 1 ? temp.toFixed(1) : temp) + '°', 64, 34); dTex.needsUpdate = true; };
const applyWarm = () => {
  if (warm < .5) tint.copy(COOL).lerp(MID, warm / .5); else tint.copy(MID).lerp(WARM, (warm - .5) / .5);
  aMat.color.copy(tint); glow.color.copy(tint); M.led.emissive.copy(tint); drawDisp();
};
addEventListener('ca:temp', e => { warm = e.detail.t; temp = e.detail.temp; applyWarm(); });
applyWarm();

/* ---------- camera path ---------- */
const camAt = (p, wide) => {
  const orbit = eio(seg(p, .52, .62)) * Math.PI + eio(seg(p, .76, .86)) * Math.PI;
  const front = (1 + Math.cos(orbit)) / 2;
  let R = p < .1 ? lerp(14, 8.6, eout(seg(p, 0, .1))) : lerp(8.6, 6.8, eio(seg(p, .1, .45)));
  R += (1 - front) * .6 + eio(seg(p, .86, 1)) * 1.4;
  if (!wide) R *= 1.3;
  return [Math.sin(orbit) * R, lerp(-.55, 1.35, front) + .25, Math.cos(orbit) * R, 0, lerp(-1.25, 1.05, front), 0];
};

/* ---------- resize ---------- */
const resize = () => {
  const w = stage.clientWidth, h = stage.clientHeight, wide = w > 860;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.fov = wide ? 36 : 50;
  camera.setViewOffset(w, h, wide ? -w * .22 : 0, wide ? 0 : h * .14, w, h);
  camera.updateProjectionMatrix();
};
addEventListener('resize', resize); resize();

/* ---------- animate ---------- */
const clock = new T.Clock();
let visible = true, progress = getTarget();
new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '100px' }).observe(stage);
(function frame() {
  requestAnimationFrame(frame);
  const target = getTarget();
  progress = reduce ? target : lerp(progress, target, .09);
  syncUI(progress);
  if (!visible) { clock.getDelta(); return; }
  const p = progress, dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime, wide = stage.clientWidth > 860;

  /* 1. measure: laser + bracket */
  M.laser.opacity = Math.sin(Math.PI * seg(p, .04, .17)) * .9;
  const b = eout(seg(p, .08, .16));
  bracket.visible = b > 0; bracket.position.z = lerp(1.2, WZ + .012, b); bracket.rotation.y = lerp(.6, 0, b);
  /* 2. core drill */
  const d = seg(p, .16, .28);
  drill.visible = d > 0 && d < 1; drill.position.z = lerp(1.6, .45, Math.sin(Math.PI * d)); bit.rotation.y += dt * 40;
  const rg = eout(seg(p, .2, .26)); rings.forEach(r => r.scale.setScalar(Math.max(.001, rg)));
  /* 3. pipework inside */
  const pin = seg(p, .26, .36); drawTube(pipeIn, pin); drawTube(pipeIn2, pin);
  /* 4. indoor unit */
  const k = seg(p, .35, .5), ke = eout(k);
  iu.visible = k > 0;
  iu.position.set(IU.x, lerp(IU.y - 1.8, IU.y, ke), lerp(IU.z + 2.6, IU.z, ke));
  iu.rotation.set(lerp(.45, 0, ke), lerp(-.7, 0, ke), 0);
  /* 5. outside: outdoor unit, pipes, cover */
  const o = seg(p, .62, .72); ou.visible = o > 0; ou.position.y = lerp(OU_Y + 3, OU_Y, bounce(o));
  const po = seg(p, .64, .73); drawTube(pipeOut, po); drawTube(pipeOut2, po);
  const cv = eout(seg(p, .7, .76)); cover.visible = cv > 0; cover.scale.y = Math.max(.001, cv);
  /* 6. power on */
  const on = seg(p, .86, .92);
  M.led.emissiveIntensity = on * 2.4; louver.rotation.x = .8 * eout(on); fan.rotation.z -= dt * on * 16;
  disp.material.opacity = on; glow.intensity = on * 1.4;
  updateAir(dt, on);
  /* camera */
  const c = camAt(p, wide);
  camera.position.set(c[0] + Math.sin(t * .4) * .05, c[1], c[2]);
  camera.lookAt(c[3], c[4], c[5]);
  renderer.render(scene, camera);
})();
})();