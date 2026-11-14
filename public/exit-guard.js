// Runs before anything is drawn, on every visitor page (a plain file because the site allows no inline scripts).
// After an Emergency Exit, a page reached by Back or Forward must not show for even a moment: hide it and leave again.
// The same rule lives in src/lib/emergencyExit.ts (guardBackAfterExit), which covers the rest and clears a stale note.
(function () {
  try {
    if (!sessionStorage.getItem('nenya.exited')) return;
    var nav = performance.getEntriesByType('navigation')[0];
    if (nav && nav.type === 'back_forward') {
      document.documentElement.style.visibility = 'hidden';
      window.location.replace('https://en.wikipedia.org/wiki/Rings_of_Power#Nenya');
    }
  } catch (e) { /* nothing reachable: the module guard still runs */ }
  window.addEventListener('pageshow', function (e) {
    try {
      if (e.persisted && sessionStorage.getItem('nenya.exited')) {
        document.documentElement.style.visibility = 'hidden';
        window.location.replace('https://en.wikipedia.org/wiki/Rings_of_Power#Nenya');
      }
    } catch (x) { /* as above */ }
  });
})();
