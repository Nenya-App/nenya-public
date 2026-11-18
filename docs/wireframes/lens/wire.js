// Wireframe behaviour: only enough to show where the live feedback goes. No audio, no network, no storage.
document.querySelectorAll('[data-strength]').forEach((r) => {
  const sw = document.getElementById(r.dataset.strength), out = document.getElementById(r.dataset.out);
  const words = ['skipped (nothing chosen)', 'faint', 'soft', 'medium', 'strong', 'very strong'];
  const set = () => { const v = +r.value; sw.style.filter = v ? `saturate(${0.4 + v * 0.3})` : 'none'; sw.style.boxShadow = v ? `0 0 ${v * 6}px ${v * 2}px currentColor` : 'none'; out.textContent = words[v]; };
  r.addEventListener('input', set); set();
});
document.querySelectorAll('[data-say]').forEach((form) => {
  const out = document.getElementById(form.dataset.say);
  const say = () => { const g = (n) => form.querySelector(`[name=${n}]`); const w = (v, a, b, c) => (+v < 0 ? a : +v > 0 ? c : b); out.textContent = [w(g('pitch').value, 'lower', 'original pitch', 'higher'), w(g('volume').value, 'softer', 'medium volume', 'louder'), w(g('speed').value, 'slower', 'medium speed', 'faster'), form.querySelector('[name=sound]:checked').value, form.querySelector('[name=feel]:checked').value].join(', '); };
  form.addEventListener('input', say); say();
});
document.querySelectorAll('[data-added]').forEach((b) => b.addEventListener('click', () => { const t = document.getElementById(b.dataset.added); t.hidden = false; t.setAttribute('tabindex', '-1'); t.focus(); }));
// Touch: five sliders move one orb (a stand-in for a quick 2D or 3D render of the chosen surface) and a text twin.
document.querySelectorAll('[data-touch]').forEach((form) => {
  const sw = document.getElementById(form.dataset.touch), sh = document.getElementById(form.dataset.shadow), out = document.getElementById(form.dataset.out);
  const W = { texture: ['very smooth', 'smooth', 'lightly textured', 'textured', 'rough'], temp: ['frozen', 'cool', 'neutral', 'warm', 'burning'], pressure: ['loose', 'light', 'firm', 'tight', 'compressed'], weight: ['weightless', 'light', 'medium', 'heavy', 'very heavy'], sharp: ['blunt', 'soft-edged', 'neutral', 'pointed', 'sharp'] };
  const v = (n) => +form.querySelector(`[name=${n}]`).value;
  const star = (inner) => { const pts = []; for (let k = 0; k < 24; k++) { const r = k % 2 ? inner : 50, a = (k / 24) * Math.PI * 2; pts.push(`${(50 + r * Math.cos(a)).toFixed(1)}% ${(50 + r * Math.sin(a)).toFixed(1)}%`); } return `polygon(${pts.join(',')})`; };
  const set = () => {
    const t = v('texture'), c = v('temp'), p = v('pressure'), w = v('weight'), s = v('sharp');
    sw.style.setProperty('--grain', t);
    sw.style.filter = c < 2 ? `hue-rotate(${(2 - c) * 40}deg) saturate(${0.9 - (2 - c) * 0.15})` : `sepia(${(c - 2) * 0.4}) saturate(${1 + (c - 2) * 0.5})`;
    sw.style.transform = `translateY(${w * 5}px) scale(${1 + p * 0.06}, ${1 - p * 0.09})`;
    sw.style.borderRadius = s ? '0' : '50%';
    sw.style.clipPath = s ? star(50 - s * 9) : 'none';
    sh.style.transform = `scaleX(${0.7 + w * 0.15})`; sh.style.opacity = String(0.15 + w * 0.15);
    out.textContent = [W.texture[t], W.temp[c], W.pressure[p], W.weight[w], W.sharp[s]].join(', ');
  };
  form.addEventListener('input', set); set();
});
// Body map: one paint at a time (a color or a texture), applied to regions by the list (the full alternative) or by the drawing; a text twin lists what is where.
document.querySelectorAll('[data-body]').forEach((root) => {
  const out = document.getElementById(root.dataset.out), marks = {};
  const paint = () => root.querySelector('[name=paint]:checked');
  const redraw = () => {
    root.querySelectorAll('[data-region]').forEach((r) => { const m = marks[r.dataset.region]; r.style.fill = m ? m.fill : 'transparent'; });
    root.querySelectorAll('select[data-for]').forEach((sel) => { sel.value = marks[sel.dataset.for] ? marks[sel.dataset.for].label : ''; });
    const list = Object.entries(marks).map(([k, m]) => `${k}: ${m.label}`); out.textContent = list.length ? list.join('. ') + '.' : 'Nothing marked yet.';
  };
  const apply = (region) => { const p = paint(); if (!p) return; if (marks[region] && marks[region].label === p.value) delete marks[region]; else marks[region] = { label: p.value, fill: p.dataset.fill }; redraw(); };
  root.querySelectorAll('[data-region]').forEach((r) => { r.addEventListener('click', () => apply(r.dataset.region)); r.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); apply(r.dataset.region); } }); });
  root.querySelectorAll('select[data-for]').forEach((sel) => sel.addEventListener('change', () => { const p = root.querySelector(`[name=paint][value="${sel.value}"]`); if (!sel.value) delete marks[sel.dataset.for]; else if (p) marks[sel.dataset.for] = { label: sel.value, fill: p.dataset.fill }; redraw(); }));
  root.querySelector('[data-clear]')?.addEventListener('click', () => { Object.keys(marks).forEach((k) => delete marks[k]); redraw(); });
  redraw();
});

// Vibration (Touch): shown only where the device can vibrate; the pattern follows the sliders; the text twin always says the same.
(() => {
  const box = document.getElementById('vibe'); if (!box) return;
  if (typeof navigator.vibrate === 'function') box.hidden = false;
  const form = document.querySelector('[data-touch]'), out = document.getElementById('vibout');
  const v = (n) => +form.querySelector(`[name=${n}]`).value;
  box.querySelector('[data-vibrate]').addEventListener('click', () => {
    if (!document.getElementById('vibon').checked) { out.textContent = 'Switch the vibration on first.'; return; }
    const rough = v('texture'), strength = 20 + v('pressure') * 25, len = 60 + v('weight') * 60;
    const pattern = rough > 2 ? [strength, 40, strength, 40, strength, 40, strength] : [len * 2];
    navigator.vibrate(pattern); out.textContent = rough > 2 ? 'Quick short pulses (rough).' : 'One long soft pulse (smooth).';
  });
})();

// Body brush: pointer-drawn dabs in the chosen paint, counted in words; places still work from the list and the drawing.
(() => {
  const svg = document.getElementById('bodysvg'); if (!svg) return;
  const on = document.getElementById('brushon'), size = document.getElementById('brushsize'), root = svg.closest('[data-body]'), say = document.getElementById(root.dataset.out);
  const strokes = []; let current = null, down = false;
  const note = () => { const c = {}; strokes.flat().forEach((d) => (c[d.label] = (c[d.label] || 0) + 1)); const t = Object.entries(c).map(([k, n]) => `${n} dab${n > 1 ? 's' : ''} of ${k}`).join(', '); let span = document.getElementById('brush-note'); if (!span) { span = document.createElement('span'); span.id = 'brush-note'; say.after(span); } span.textContent = t ? ` Brush: ${t}.` : ''; };
  const at = (e) => { const r = svg.getBoundingClientRect(), p = svg.viewBox.baseVal; return { x: (e.clientX - r.left) * p.width / r.width, y: (e.clientY - r.top) * p.height / r.height }; };
  const dab = (e) => { const p = root.querySelector('[name=paint]:checked'); const { x, y } = at(e); const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', size.value); c.setAttribute('fill', p.dataset.fill); c.setAttribute('aria-hidden', 'true'); c.dataset.brush = '1'; svg.appendChild(c); current.push({ el: c, label: p.value }); };
  svg.addEventListener('pointerdown', (e) => { if (!on.checked) return; down = true; current = []; strokes.push(current); svg.setPointerCapture(e.pointerId); dab(e); });
  svg.addEventListener('pointermove', (e) => { if (down) dab(e); });
  svg.addEventListener('pointerup', () => { down = false; note(); });
  root.querySelector('[data-undo]').addEventListener('click', () => { const s = strokes.pop(); if (s) s.forEach((d) => d.el.remove()); note(); });
  root.querySelector('[data-clear]').addEventListener('click', () => { strokes.splice(0).forEach((s) => s.forEach((d) => d.el.remove())); note(); });
  on.addEventListener('change', () => { svg.style.touchAction = on.checked ? 'none' : 'auto'; svg.style.cursor = on.checked ? 'crosshair' : 'default'; });
})();

// Touch landscape: five labelled lists fill the parts of a small landscape; a text twin says the same.
(() => {
  const form = document.querySelector('[data-landscape]'); if (!form) return;
  const out = document.getElementById(form.dataset.landscape), cls = { Wool: 'w', Silk: 's', Bark: 'b', Slate: 'd' };
  const parts = ['sky', 'hills', 'ground', 'water', 'path'], names = { sky: 'sky', hills: 'far hills', ground: 'near ground', water: 'water', path: 'path' };
  const set = () => {
    const said = [];
    parts.forEach((p) => { const el = document.getElementById('L-' + p), v = form.querySelector(`[name=${p}]`).value; el.className = 'l-' + p + (v ? ' ' + cls[v] : ''); if (v) said.push(`${names[p]} ${v.toLowerCase()}`); });
    out.textContent = said.length ? said.join(', ') + '.' : 'nothing yet.';
  };
  form.addEventListener('input', set);
  document.querySelector('[data-landscape-random]').addEventListener('click', () => { parts.forEach((p) => { const s = form.querySelector(`[name=${p}]`); s.selectedIndex = 1 + Math.floor(Math.random() * 4); }); set(); });
  document.querySelector('[data-landscape-clear]').addEventListener('click', () => { parts.forEach((p) => { form.querySelector(`[name=${p}]`).selectedIndex = 0; }); set(); });
  set();
})();

// Landscape: shape one part with temperature and weight; each part keeps its own.
(() => {
  const box = document.querySelector('[data-shape]'); if (!box) return;
  const part = document.getElementById('shape-part'), tp = document.getElementById('shape-temp'), wt = document.getElementById('shape-weight'), out = document.getElementById('shape-out');
  const kept = {}, T = ['frozen', 'cool', 'neutral', 'warm', 'burning'], Wd = ['weightless', 'light', 'medium', 'heavy', 'very heavy'];
  const apply = (p) => { const k = kept[p] || { t: 2, w: 2 }, el = document.getElementById('L-' + p); el.style.filter = k.t < 2 ? `hue-rotate(${(2 - k.t) * 40}deg) saturate(${0.9 - (2 - k.t) * 0.15})` : `sepia(${(k.t - 2) * 0.4}) saturate(${1 + (k.t - 2) * 0.5})`; el.style.transform = `translateY(${(k.w - 2) * 4}px)`; };
  const say = () => { const s = Object.entries(kept).filter(([, k]) => k.t !== 2 || k.w !== 2).map(([p, k]) => `${p}: ${T[k.t]}, ${Wd[k.w]}`); out.textContent = s.length ? s.join('; ') + '.' : ''; };
  const load = () => { const k = kept[part.value] || { t: 2, w: 2 }; tp.value = k.t; wt.value = k.w; };
  part.addEventListener('change', load);
  [tp, wt].forEach((r) => r.addEventListener('input', () => { kept[part.value] = { t: +tp.value, w: +wt.value }; apply(part.value); say(); }));
})();
// Essence: five taste dials draw a shape (a radar of your answers); a second shape for the flavor you want; a composed tasting note says it in words.
(() => {
  const root = document.querySelector('[data-essence]'); if (!root) return;
  const T = ['sweet', 'sour', 'salty', 'bitter', 'umami'], level = ['none', 'a hint', 'mild', 'strong', 'very strong'];
  const val = (set, k) => +root.querySelector(`[name=${set}-${k}]`).value;
  const pts = (set) => T.map((k, i) => { const a = (i / 5) * Math.PI * 2 - Math.PI / 2, r = 20 + val(set, k) * 20; return [150 + r * Math.cos(a), 150 + r * Math.sin(a)]; });
  const draw = () => {
    root.querySelectorAll('svg.radar').forEach((svg) => {
      const sets = svg.dataset.sets.split(','); svg.querySelectorAll('.poly').forEach((p) => p.remove());
      sets.forEach((s) => { const p = document.createElementNS('http://www.w3.org/2000/svg', 'polygon'); p.setAttribute('class', 'poly poly-' + s); p.setAttribute('points', pts(s).map((q) => q.join(',')).join(' ')); svg.appendChild(p); });
    });
    root.querySelectorAll('[data-say-taste]').forEach((el) => { const s = el.dataset.sayTaste, parts = T.filter((k) => val(s, k) > 0).map((k) => `${k} ${level[val(s, k)]}`); el.textContent = parts.length ? parts.join(', ') + '.' : 'nothing chosen yet.'; });
    const diff = T.map((k) => [k, val('wish', k) - val('now', k)]).filter(([, d]) => d !== 0).map(([k, d]) => `${d > 0 ? 'more' : 'less'} ${k}`);
    const dEl = document.getElementById('ess-diff'); if (dEl) dEl.textContent = diff.length ? 'From now to what you want: ' + diff.join(', ') + '.' : 'Nothing changes between now and what you want.';
    const top = (s) => T.filter((k) => val(s, k) >= 3), nm = (s) => { const t = top(s); return t.length ? 'mostly ' + t.join(' and ') : 'mild and even'; };
    const notes = [...root.querySelectorAll('[name=note]:checked')].map((x) => x.value), feel = root.querySelector('[name=feel]').value, fin = root.querySelector('[name=finish]').value;
    const sentence = `${nm('now')}${notes.length ? ', with notes of ' + notes.join(' and ') : ''}${feel ? ', ' + feel : ''}${fin ? ', and ' + fin + ' that lingers' : ''}.`;
    root.querySelectorAll('[data-tasting-now]').forEach((el) => { el.textContent = sentence.charAt(0).toUpperCase() + sentence.slice(1); });
    root.querySelectorAll('[data-tasting-wish]').forEach((el) => { const t = top('wish'); el.textContent = ('It would be ' + nm('wish') + (diff.length ? '; ' + diff.join(', ') : '') + '.'); });
  };
  root.addEventListener('input', draw); draw();
})();

// Essence: the starting point changes the first question and says which flavor comes first.
(() => {
  const radios = document.querySelectorAll('[name=basis]'); if (!radios.length) return;
  const title = document.querySelector('[data-basis-title]'), text = document.querySelector('[data-basis-text]');
  const V = {
    memory: ['Think of a time that tasted good. What was the flavor of it?', 'Pick a smell or taste that takes you back. Then say how much of each taste was in that time. You can’t taste or smell right now? Imagine it.'],
    mood: ['What is the flavor of your life right now?', 'If your life were a flavor, how much of each taste is in it? You can’t taste or smell right now? Imagine it. That works too.'],
    try: ['What is the flavor you would like your life to have?', 'Start with the flavor you want. You can’t taste or smell right now? Imagine it. At the end you can pick one small thing to bring a little of it into today.']
  };
  const set = () => { const v = document.querySelector('[name=basis]:checked').value; title.textContent = V[v][0]; text.textContent = V[v][1]; };
  radios.forEach((r) => r.addEventListener('change', set)); set();
})();

// Soft limit (every lens): choosing fewer can be more helpful. A warning comes before a fourth choice; "Add it anyway" lets it through; nothing is ever blocked.
document.querySelectorAll('[data-limit]').forEach((group) => {
  const note = document.getElementById(group.dataset.limit), key = group.dataset.limit.split('-')[0];
  const boxes = [...group.querySelectorAll('input[type=checkbox]')], count = document.getElementById(key + '-count');
  let pending = null, allowed = false;
  const names = () => boxes.filter((b) => b.checked).map((b) => b.value);
  const sum = () => { const n = names(); if (count) count.textContent = n.length ? `${n.length}: ${n.join(', ')}` : 'none yet'; document.querySelectorAll(`[data-sum="${key}"]`).forEach((s) => { s.textContent = n.length ? n.join(', ') : 'no shape chosen'; }); if (key === 'A') document.querySelectorAll('#c3-now').forEach((s) => { s.textContent = n.length ? n.join(', ') : 'none chosen'; }); };
  boxes.forEach((b) => b.addEventListener('change', () => {
    if (b.checked && names().length > 3 && !allowed) { b.checked = false; pending = b; note.hidden = false; note.querySelector('[data-limit-yes]').focus(); return; }
    sum();
  }));
  note.querySelector('[data-limit-yes]').addEventListener('click', () => { allowed = true; if (pending) pending.checked = true; note.hidden = true; sum(); pending && pending.focus(); });
  note.querySelector('[data-limit-no]').addEventListener('click', () => { note.hidden = true; pending && pending.focus(); });
  // Layout: all shapes, or one at a time with Previous and Next.
  const card = group.closest('.frame'), cards = [...group.querySelectorAll('.shapecard')]; let cur = 0;
  const show = () => cards.forEach((c, i) => { c.hidden = card.dataset.one === '1' && i !== cur; });
  const nav = document.createElement('div'); nav.className = 'row'; nav.hidden = true;
  nav.innerHTML = '<button type="button" data-prev>Previous shape</button><button type="button" data-next>Next shape</button>'; group.after(nav);
  nav.querySelector('[data-prev]').addEventListener('click', () => { cur = (cur + cards.length - 1) % cards.length; show(); });
  nav.querySelector('[data-next]').addEventListener('click', () => { cur = (cur + 1) % cards.length; show(); });
  card.querySelectorAll('[data-layout]').forEach((b) => b.addEventListener('click', () => { card.dataset.one = b.dataset.layout === 'one' ? '1' : '0'; card.querySelectorAll('[data-layout]').forEach((o) => o.setAttribute('aria-pressed', String(o === b))); nav.hidden = card.dataset.one !== '1'; show(); }));
  sum();
});

// Movement and Pattern: the words and sliders act on one preview and a text twin; reduced motion gives a still.
document.querySelectorAll('[data-move-form],[data-pattern-form]').forEach((form) => {
  const move = form.hasAttribute('data-move-form'), prev = document.getElementById(form.dataset.prev), out = document.getElementById(form.dataset.out);
  const WS = move ? ['glacial', 'slow', 'steady', 'fast', 'frenetic'] : ['foggy', 'hazy', 'fairly clear', 'sharp', 'crystal clear'], WE = move ? ['depleted', 'low', 'moderate', 'strong', 'surging'] : ['surface', 'shallow', 'middling', 'deep', 'profound'];
  const DIR = { upward: [0, -1], downward: [0, 1], inward: [0, 0], outward: [0, 0], spiraling: [1, -1], oscillating: [1, 0], flowing: [1, 0], stuck: [0, 0], still: [0, 0] };
  const set = () => {
    const a = +form.querySelector('[name=' + (move ? 'speed' : 'clarity') + ']').value, b = +form.querySelector('[name=' + (move ? 'energy' : 'depth') + ']').value;
    const words = [...form.querySelectorAll('input[type=checkbox]:checked')].filter((c) => !c.closest('details')).map((c) => c.value.toLowerCase());
    if (move) {
      const d = DIR[words[0]] || [0, 0];
      prev.style.setProperty('--dur', `${[9, 5, 2.5, 1.2, 0.5][a]}s`); prev.style.setProperty('--amp', `${8 + b * 10}px`); prev.style.setProperty('--dx', String(d[0])); prev.style.setProperty('--dy', String(d[1]));
      prev.style.opacity = String(0.45 + b * 0.14); prev.classList.toggle('still', words[0] === 'still' || words[0] === 'stuck');
    } else {
      prev.style.filter = `blur(${(4 - a) * 1.5}px)`; [...prev.children].forEach((s, i) => { s.hidden = i >= 1 + Math.floor(b / 2); });
    }
    out.textContent = [...words.slice(0, 3), WS[a], WE[b]].join(', ');
  };
  form.addEventListener('input', set); set();
});

// Pattern tapestry (optional activity): a base and layers above it, drawn as stacked bands and said in words. Soft limit of three layers above the base.
document.querySelectorAll('[data-tapestry]').forEach((box) => {
  const art = box.querySelector('.tapestry'), out = document.getElementById(box.dataset.out), note = document.getElementById(box.dataset.limitNote), count = document.getElementById(box.dataset.count), list = document.getElementById(box.dataset.list);
  const base = box.querySelector('select[id$="-base"]'), next = box.querySelector('select[id$="-next"]'), add = box.querySelector('[data-tap-add]');
  let layers = [], allowed = false;
  const words = () => (layers.length ? `base: ${layers[0]}${layers.slice(1).map((l) => `, then ${l}`).join('')}` : 'nothing woven yet');
  const draw = () => {
    art.replaceChildren(...layers.map((l, i) => { const d = document.createElement('div'); d.className = 'tl'; d.dataset.pat = l; d.style.inset = `${i * 14}px`; return d; }));
    list.replaceChildren(...layers.map((l, i) => { const li = document.createElement('li'); li.append(`${i ? `Layer ${i}` : 'Base'}: ${l} `); const b = document.createElement('button'); b.type = 'button'; b.textContent = 'Remove'; b.setAttribute('aria-label', `Remove ${i ? `layer ${i}` : 'the base'}: ${l}`); b.addEventListener('click', () => { layers.splice(i, 1); base.value = layers[0] || ''; draw(); add.focus(); }); li.append(b); return li; }));
    out.textContent = words(); count.textContent = layers.length ? `${layers.length - 1 < 0 ? 0 : layers.length - 1} above the base` : 'none yet';
    document.querySelectorAll('[data-sum="' + box.dataset.tapestry + '"]').forEach((s) => { s.textContent = words(); });
  };
  const push = (v) => { if (!layers.length) { layers = [v]; base.value = v; } else layers.push(v); draw(); };
  base.addEventListener('change', () => { if (base.value) { if (layers.length) layers[0] = base.value; else layers = [base.value]; } else layers = layers.slice(1); draw(); });
  add.addEventListener('click', () => { if (layers.length > 3 && !allowed) { note.hidden = false; note.querySelector('[data-limit-yes]').focus(); return; } push(next.value); });
  note.querySelector('[data-limit-yes]').addEventListener('click', () => { allowed = true; note.hidden = true; push(next.value); add.focus(); });
  note.querySelector('[data-limit-no]').addEventListener('click', () => { note.hidden = true; add.focus(); });
  box.querySelector('[data-tap-undo]').addEventListener('click', () => { layers.pop(); base.value = layers[0] || ''; draw(); });
  box.querySelector('[data-tap-clear]').addEventListener('click', () => { layers = []; base.value = ''; allowed = false; note.hidden = true; draw(); });
  draw();
});

// Path of movement (optional activity): a pointer line or step buttons make the same path and the same words. Reduced motion shows the finished line, not a moving dot.
document.querySelectorAll('[data-path]').forEach((box) => {
  const pad = box.querySelector('svg'), line = pad.querySelector('polyline'), dot = pad.querySelector('circle'), out = document.getElementById(box.dataset.out), feel = box.querySelector('select');
  let pts = [], drawing = false, timer = 0;
  const at = (e) => { const r = pad.getBoundingClientRect(); return [Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)), Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100))]; };
  const dir = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1]; return Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); };
  const FEEL = { jerky: '4 3', hesitant: '2 4' }, WIDTH = { forceful: 4, gentle: 1 };
  const words = () => {
    if (pts.length < 2) return pts.length ? 'a start, and no steps yet' : 'nothing drawn yet';
    const keep = [pts[0]]; pts.forEach((p) => { const l = keep[keep.length - 1]; if (Math.hypot(p[0] - l[0], p[1] - l[1]) >= 12) keep.push(p); });
    const runs = []; for (let i = 1; i < keep.length; i++) { const d = dir(keep[i - 1], keep[i]); if (runs[runs.length - 1] !== d) runs.push(d); }
    const x = pts[0][0], where = x < 34 ? 'left' : x > 66 ? 'right' : 'middle', shown = runs.slice(0, 6);
    return `starts at the ${where}, goes ${shown.join(', then ')}${runs.length > 6 ? ', and more' : ''}${feel.value ? `; ${feel.value}` : ''}`;
  };
  const draw = () => {
    line.setAttribute('points', pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' '));
    line.setAttribute('stroke-dasharray', FEEL[feel.value] || 'none'); line.setAttribute('stroke-width', String(WIDTH[feel.value] || 2));
    dot.hidden = true; out.textContent = words();
    document.querySelectorAll('[data-sum="' + box.dataset.path + '"]').forEach((s) => { s.textContent = words(); });
  };
  pad.style.touchAction = 'none';
  pad.addEventListener('pointerdown', (e) => { drawing = true; pad.setPointerCapture(e.pointerId); pts = [at(e)]; draw(); });
  pad.addEventListener('pointermove', (e) => { if (drawing) { pts.push(at(e)); draw(); } });
  const end = () => { drawing = false; };
  pad.addEventListener('pointerup', end); pad.addEventListener('pointercancel', end);
  box.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => {
    const l = pts[pts.length - 1] || [10, 50], d = { up: [0, -20], down: [0, 20], left: [-20, 0], right: [20, 0] }[b.dataset.step];
    if (!pts.length) pts = [l]; pts.push([Math.max(0, Math.min(100, l[0] + d[0])), Math.max(0, Math.min(100, l[1] + d[1]))]); draw();
  }));
  feel.addEventListener('change', draw);
  box.querySelector('[data-path-undo]').addEventListener('click', () => { pts.pop(); draw(); });
  box.querySelector('[data-path-clear]').addEventListener('click', () => { pts = []; draw(); });
  box.querySelector('[data-path-replay]').addEventListener('click', () => {
    if (pts.length < 2) return; clearInterval(timer); dot.hidden = false;
    const place = (i) => { dot.setAttribute('cx', pts[i][0]); dot.setAttribute('cy', pts[i][1]); };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { place(pts.length - 1); return; }
    let i = 0; place(0); timer = setInterval(() => { i += 1; if (i >= pts.length) { clearInterval(timer); return; } place(i); }, Math.max(8, 2500 / pts.length));
  });
  draw();
});
