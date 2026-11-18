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
