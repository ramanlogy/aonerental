(function () {
  document.documentElement.classList.add('js');
  var y = document.getElementById('yr');
  if (y) y.textContent = new Date().getFullYear();
  var els = document.querySelectorAll('.reveal, .rail-photos');
  if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  els.forEach(function (e) { io.observe(e); });
})();
// Until real photos are added, hide broken image icons and keep the neutral placeholder.
document.querySelectorAll('img').forEach(function (img) {
  var hide = function () { img.style.visibility = 'hidden'; };
  img.addEventListener('error', hide);
  if (img.getAttribute('src') && img.complete && img.naturalWidth === 0) hide();
});

// Fleet tiles whose photo has not been added yet drop the empty image box.
document.querySelectorAll('.tile-img img').forEach(function (img) {
  var box = img.closest('.tile-img');
  var miss = function () { box.classList.add('missing'); };
  img.addEventListener('error', miss);
  if (img.complete && img.naturalWidth === 0) miss();
});

// Mobile menu
(function () {
  var btn = document.querySelector('.menu-btn');
  var sheet = document.getElementById('sheet');
  if (!btn || !sheet) return;
  function set(open) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    sheet.hidden = !open;
    document.body.classList.toggle('menu-open', open);
  }
  btn.addEventListener('click', function () { set(sheet.hidden); });
  sheet.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) { set(false); btn.focus(); } });
  window.matchMedia('(min-width:901px)').addEventListener('change', function (m) { if (m.matches) set(false); });
})();

// Chapter nav: highlight the chapter in view and keep it visible in the sideways list.
(function () {
  var links = document.querySelectorAll('.chapters a');
  if (!links.length || !('IntersectionObserver' in window)) return;
  var map = {};
  links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      links.forEach(function (a) { a.classList.remove('is-active'); });
      var a = map[en.target.id];
      if (!a) return;
      a.classList.add('is-active');
      var box = a.parentElement;
      box.scrollTo({ left: a.offsetLeft - box.clientWidth / 2 + a.clientWidth / 2, behavior: 'smooth' });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
})();

// Review photo lightbox
(function () {
  var lb = document.getElementById('lb');
  if (!lb || typeof lb.showModal !== 'function') return;
  var img = document.getElementById('lb-img'), by = document.getElementById('lb-by'), lnk = document.getElementById('lb-link');
  var group = [], idx = 0, opener = null;
  function show(i) {
    idx = (i + group.length) % group.length;
    var b = group[idx];
    img.style.visibility = '';
    img.src = b.dataset.full;
    img.alt = b.querySelector('img').alt;
    by.textContent = 'Photo from ' + b.dataset.by + "'s review.";
    lnk.href = b.dataset.link;
  }
  document.querySelectorAll('.rp').forEach(function (b) {
    b.addEventListener('click', function () {
      group = Array.prototype.slice.call(b.parentElement.querySelectorAll('.rp'));
      opener = b;
      show(group.indexOf(b));
      lb.showModal();
    });
  });
  lb.querySelector('.lb-x').addEventListener('click', function () { lb.close(); });
  lb.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
  lb.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  lb.addEventListener('close', function () { if (opener) opener.focus(); });
  lb.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
})();

// Smooth FAQ accordion: opening one question closes the others.
(function () {
  var items = document.querySelectorAll('.faq-list details');
  if (!items.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DUR = 380, EASE = 'cubic-bezier(.22,.61,.36,1)';

  function run(d, open) {
    if (d._anim) d._anim.cancel();
    var s = d.querySelector('summary');
    var head = s.offsetHeight, cur = d.offsetHeight;
    if (open) { d.open = true; d.style.height = ''; }
    var to = open ? d.scrollHeight : head, from = cur;
    if (!open) d.classList.add('closing');
    if (reduce) { d.open = open; d.classList.remove('closing'); return; }
    d.style.height = from + 'px';
    var a = d._anim = d.animate({ height: [from + 'px', to + 'px'] }, { duration: DUR, easing: EASE });
    var done = function () {
      d._anim = null; d.style.height = ''; d.classList.remove('closing');
      if (!open) d.open = false;
    };
    a.onfinish = done;
    a.oncancel = function () { d.style.height = ''; };
  }

  items.forEach(function (d) {
    d.querySelector('summary').addEventListener('click', function (e) {
      e.preventDefault();
      var willOpen = !d.open || d.classList.contains('closing');
      if (willOpen) items.forEach(function (o) { if (o !== d && o.open) run(o, false); });
      run(d, willOpen);
    });
  });
})();

// Bike enquiry: ready-made message to WhatsApp, Messenger or Viber.
(function () {
  var dlg = document.getElementById('enq');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  var NUM = '9779815139239', FB = 'aonemotorbikerental';
  var msg = document.getElementById('enq-msg'), note = document.getElementById('enq-note');
  var wa = document.getElementById('enq-wa'), fb = document.getElementById('enq-fb'), vb = document.getElementById('enq-vb');
  function copy() {
    try { if (navigator.clipboard) return navigator.clipboard.writeText(msg.value); } catch (e) {}
    msg.select(); try { document.execCommand('copy'); } catch (e) {}
    return Promise.resolve();
  }
  function sync() { wa.href = 'https://wa.me/' + NUM + '?text=' + encodeURIComponent(msg.value); }
  var st = document.getElementById('enq-start'), en = document.getElementById('enq-end'), bike = '';
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function nice(v) {
    if (!v) return '';
    var p = v.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function build() {
    msg.value = 'Hi Aone Rental, I would like to rent the ' + bike + ' in Pokhara.\n\nStart date: ' + nice(st.value) +
      '\nEnd date: ' + nice(en.value) + '\n\nPlease send availability and pricing. Thank you!';
    sync();
  }
  st.addEventListener('change', function () {
    en.min = st.value || iso(new Date());
    if (en.value && en.value < st.value) en.value = st.value;
    build();
  });
  en.addEventListener('change', build);
  document.querySelectorAll('.enq').forEach(function (b) {
    b.addEventListener('click', function () {
      bike = b.dataset.bike;
      document.getElementById('enq-bike').textContent = bike;
      st.value = ''; en.value = '';
      st.min = en.min = iso(new Date());
      note.textContent = '';
      fb.href = 'https://m.me/' + FB;
      vb.href = 'viber://chat?number=%2B' + NUM;
      build();
      dlg.showModal();
    });
  });
  msg.addEventListener('input', sync);
  [fb, vb].forEach(function (a) {
    a.addEventListener('click', function () {
      copy();
      note.textContent = 'Message copied. Paste it into the chat and send.';
    });
  });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
})();

// Hero slideshow: crossfades the photos until a hero video replaces it.
(function () {
  var box = document.querySelector('.hero-show');
  if (!box) return;
  var s = box.querySelectorAll('.hs'), cap = box.querySelector('.hs-cap'), i = 0;
  function label() { var c = s[i].dataset.cap; cap.textContent = c; cap.classList.toggle('show', !!c); }
  label();
  if (s.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  setInterval(function () {
    s[i].classList.remove('on'); i = (i + 1) % s.length; s[i].classList.add('on'); label();
  }, 4500);
})();

/* Reviews strip: slow auto-scroll, pauses on interaction */
(function () {
  var el = document.querySelector('#reviews .rv-list');
  if (!el || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  var paused = false, pos = 0, dir = 1, last = 0;
  ['mouseenter', 'touchstart', 'focusin', 'pointerdown'].forEach(function (e) { el.addEventListener(e, function () { paused = true; }, { passive: true }); });
  ['mouseleave', 'touchend', 'focusout'].forEach(function (e) { el.addEventListener(e, function () { pos = el.scrollLeft; paused = false; }, { passive: true }); });
  el.addEventListener('wheel', function () { pos = el.scrollLeft; }, { passive: true });
  function tick(t) {
    var max = el.scrollWidth - el.clientWidth;
    if (!paused && max > 0 && last) {
      pos += dir * 0.025 * (t - last);
      if (pos >= max) { pos = max; dir = -1; } else if (pos <= 0) { pos = 0; dir = 1; }
      el.scrollLeft = pos;
    }
    last = t; requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

// Colour options: swap the bike photo and backdrop.
document.querySelectorAll('.sws').forEach(function (g) {
  var box = g.parentElement, img = box.querySelector('img');
  g.addEventListener('click', function (e) {
    var b = e.target.closest('.sw');
    if (!b || !img) return;
    g.querySelectorAll('.sw').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    img.style.visibility = '';
    img.src = decodeURIComponent(b.dataset.src);
    img.alt = b.dataset.alt;
    box.style.background = b.dataset.bg;
  });
});

/* Close the desktop "More" menu on outside click or Escape */
(function () {
  var d = document.querySelector('.more');
  if (!d) return;
  document.addEventListener('click', function (e) { if (d.open && !d.contains(e.target)) d.open = false; });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') d.open = false; });
})();
