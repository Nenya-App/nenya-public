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
// Touch: five sliders move one swatch and a text twin. (The real card shows the chosen surface; here a pattern stands in for the photograph.)
document.querySelectorAll('[data-touch]').forEach((form) => {
  const sw = document.getElementById(form.dataset.touch), out = document.getElementById(form.dataset.out);
  const W = { texture: ['very smooth', 'smooth', 'lightly textured', 'textured', 'rough'], temp: ['frozen', 'cool', 'neutral', 'warm', 'burning'], pressure: ['loose', 'light', 'firm', 'tight', 'compressed'], weight: ['weightless', 'light', 'medium', 'heavy', 'very heavy'], sharp: ['blunt', 'soft-edged', 'neutral', 'pointed', 'sharp'] };
  const v = (n) => +form.querySelector(`[name=${n}]`).value;
  const set = () => {
    const t = v('texture'), c = v('temp'), p = v('pressure'), w = v('weight'), s = v('sharp');
    sw.style.setProperty('--grain', t);
    sw.style.filter = c < 2 ? `hue-rotate(${(2 - c) * 40}deg) saturate(${0.9 - (2 - c) * 0.15})` : `sepia(${(c - 2) * 0.4}) saturate(${1 + (c - 2) * 0.5})`;
    sw.style.transform = `translateY(${w * 5}px) scale(${1 - p * 0.04})`;
    sw.style.boxShadow = `inset 0 0 ${p * 7}px rgba(0,0,0,.45)`;
    sw.style.borderRadius = `${50 - s * 11}%`;
    out.textContent = [W.texture[t], W.temp[c], W.pressure[p], W.weight[w], W.sharp[s]].join(', ');
  };
  form.addEventListener('input', set); set();
});
