// Forget me for the two static pages (about-nenya.html and why-nenya.html). A plain file because the site allows no inline scripts, and it cannot import
// from the app, so it repeats the key names below; tests/forget-me-static.test.mts fails if they differ from src/lib/deviceMemory.ts.
// It does what the app's Forget me does (wipeDevice with keepOwner): erases every localStorage key that starts with "nenya" (any capitals) except the owner's
// three testing keys, and the terms receipt in this tab's session storage. The kept palettes live in the app's memory only, so a static page has none.
// It makes no request, stores nothing, reads no value, and never throws if storage is blocked. It says what it did in a status line (role="status"), with no animation.
(function () {
  var KEEP = ['nenya.coach.owner', 'nenya.coach.ownerToken', 'nenya.coach.overrides'];
  var RECEIPT = 'nenya.terms.receipt';
  var DONE = 'Erased what Nenya saved in this browser.';
  var BLOCKED = 'Nothing to erase: this browser does not let this page reach what Nenya saved.';

  function erase() {
    var reached = true;
    try {
      var mine = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.toLowerCase().indexOf('nenya') === 0 && KEEP.indexOf(k) === -1) mine.push(k);
      }
      for (var j = 0; j < mine.length; j++) localStorage.removeItem(mine[j]);
    } catch (e) { reached = false; }
    try {
      sessionStorage.removeItem(RECEIPT);
    } catch (e) { /* nothing reachable */ }
    return reached;
  }

  function start() {
    var wrap = document.getElementById('forget-me');
    var button = document.getElementById('forget-me-button');
    var status = document.getElementById('forget-me-status');
    if (!button || !status) return;
    button.addEventListener('click', function () {
      status.textContent = erase() ? DONE : BLOCKED;
    });
    if (wrap) wrap.hidden = false;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
