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
      if (willOpen && !d.closest('[data-multi]')) items.forEach(function (o) { if (o !== d && o.open) run(o, false); });
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
  var ppl = document.getElementById('enq-ppl');
  function days() {
    if (!st.value || !en.value) return 0;
    var a = st.value.split('-'), b = en.value.split('-');
    return Math.round((Date.UTC(+b[0], +b[1] - 1, +b[2]) - Date.UTC(+a[0], +a[1] - 1, +a[2])) / 864e5) + 1;
  }
  function build() {
    var d = days(), n = ppl ? +ppl.value : 1;
    msg.value = 'Hi Aone Rental, I want to book the ' + bike + ' in Pokhara.\n\n' +
      'Start date: ' + (nice(st.value) || 'not fixed yet') +
      '\nEnd date: ' + (nice(en.value) || 'not fixed yet') +
      (d ? '\nRental: ' + d + (d > 1 ? ' days' : ' day') : '') +
      '\nNumber of bikes: ' + n +
      '\n\nPlease confirm availability and the price. Thank you!';
    sync();
  }
  if (ppl) ppl.addEventListener('change', build);
  st.addEventListener('change', function () {
    en.min = st.value || iso(new Date());
    if (en.value && en.value < st.value) en.value = st.value;
    build();
  });
  en.addEventListener('change', build);
  document.querySelectorAll('.enq').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      bike = b.dataset.bike;
      document.getElementById('enq-bike').textContent = bike;
      st.value = ''; en.value = ''; if (ppl) ppl.value = '1';
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

// Hero slideshow: crossfades the photos. Each photo is fetched and decoded only
// when its turn comes, and nothing runs while the hero is off screen.
(function () {
  var box = document.querySelector('.hero-show');
  if (!box) return;
  var s = Array.prototype.slice.call(box.querySelectorAll('.hs')), cap = box.querySelector('.hs-cap'), i = 0;
  function label() { var c = s[i].dataset.cap; cap.textContent = c; cap.classList.toggle('show', !!c); }
  label();
  if (s.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var visible = true, busy = false;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(box);
  }
  function prep(img) {
    if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
    if (img.decode) return img.decode();
    return new Promise(function (ok, no) {
      if (img.complete) { if (img.naturalWidth) ok(); else no(); return; }
      img.addEventListener('load', ok, { once: true });
      img.addEventListener('error', no, { once: true });
    });
  }
  setInterval(function () {
    if (!visible || busy || document.hidden) return;
    busy = true;
    var n = (i + 1) % s.length;
    prep(s[n]).then(function () {
      s[i].classList.remove('on'); i = n; s[i].classList.add('on'); label(); busy = false;
    }, function () {
      s.splice(n, 1); if (n < i) i--; busy = false;
    });
  }, 4500);
})();

/* Reviews strip: slow auto-scroll. Runs only while the strip is on screen,
   and steps aside while the page is being scrolled or the strip is touched. */
(function () {
  var el = document.querySelector('#reviews .rv-list');
  if (!el || el.closest('.rv-feed') || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  var paused = false, pos = 0, dir = 1, last = 0, max = 0, raf = 0, quietAt = 0;
  ['mouseenter', 'touchstart', 'focusin', 'pointerdown'].forEach(function (e) { el.addEventListener(e, function () { paused = true; el.style.scrollSnapType = ''; }, { passive: true }); });
  ['mouseleave', 'touchend', 'focusout'].forEach(function (e) { el.addEventListener(e, function () { pos = el.scrollLeft; paused = false; el.style.scrollSnapType = 'none'; }, { passive: true }); });
  el.addEventListener('wheel', function () { pos = el.scrollLeft; }, { passive: true });
  window.addEventListener('scroll', function () { quietAt = performance.now() + 250; }, { passive: true });
  el.style.scrollSnapType = 'none'; // snapping fights the slow drift and makes it jump
  function measure() { max = el.scrollWidth - el.clientWidth; }
  window.addEventListener('resize', measure, { passive: true });
  function tick(t) {
    if (!paused && max > 0 && last && t >= quietAt) {
      pos += dir * 0.025 * (t - last);
      if (pos >= max) { pos = max; dir = -1; } else if (pos <= 0) { pos = 0; dir = 1; }
      el.scrollLeft = pos;
    }
    last = t; raf = requestAnimationFrame(tick);
  }
  function start() { if (!raf) { last = 0; measure(); raf = requestAnimationFrame(tick); } }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { if (e[0].isIntersecting) start(); else stop(); }).observe(el);
  } else start();
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

// Tour pages: highlight the section chip in the sticky jump bar.
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll('.jump a'));
  if (!links.length || !('IntersectionObserver' in window)) return;
  var map = {};
  links.forEach(function (a) { var el = document.querySelector(a.getAttribute('href')); if (el) map[el.id] = a; });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      links.forEach(function (a) { a.classList.remove('on'); });
      var a = map[en.target.id];
      // Scroll only the chip bar sideways. scrollIntoView also moved the page
      // vertically and broke the user's scroll mid-swipe.
      if (a) {
        a.classList.add('on');
        var bar = a.parentNode, ar = a.getBoundingClientRect(), br = bar.getBoundingClientRect();
        var l = ar.left - br.left + bar.scrollLeft, r = l + ar.width;
        if (l < bar.scrollLeft) bar.scrollTo({ left: l - 16, behavior: 'smooth' });
        else if (r > bar.scrollLeft + bar.clientWidth) bar.scrollTo({ left: r - bar.clientWidth + 16, behavior: 'smooth' });
      }
    });
  }, { rootMargin: '-35% 0px -60% 0px' });
  Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });
})();

// Tour pages: interactive route line (draw-in on scroll, hover/tap a stop for details).
(function () {
  document.querySelectorAll('.rt').forEach(function (fig) {
    var data; try { data = JSON.parse(fig.querySelector('.rt-data').textContent); } catch (e) { return; }
    var pts = Array.prototype.slice.call(fig.querySelectorAll('.rt-p'));
    var card = fig.querySelector('.rt-card');
    var sc = fig.querySelector('.rt-scroll');
    var cur = -1;
    function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
    function center(k) {
      var b = pts[k].getBoundingClientRect(), r = sc.getBoundingClientRect();
      var dx = b.left + b.width / 2 - (r.left + r.width / 2);
      if (Math.abs(dx) > 4) sc.scrollBy({ left: dx, behavior: 'smooth' });
    }
    function set(k, scroll) {
      if (k === cur) { if (scroll) center(k); return; }
      cur = k;
      pts.forEach(function (p, i) { p.classList.toggle('on', i === k); });
      var d = data[k];
      card.innerHTML = '<p class="rt-k">' + esc(d.k) + ' · ' + esc(d.p) + ' · ' + esc(d.a) + '</p>' +
        '<h3>' + esc(d.t) + '</h3>' + (d.c ? '<ul class="chips">' + d.c + '</ul>' : '') +
        (d.h ? '<a class="rt-go" href="' + d.h + '">See day details</a>' : '');
      card.classList.remove('swap'); void card.offsetWidth; card.classList.add('swap');
      if (scroll) center(k);
    }
    pts.forEach(function (p, i) {
      p.addEventListener('mouseenter', function () { set(i, false); });
      p.addEventListener('click', function () { set(i, true); });
      p.addEventListener('focus', function () { set(i, true); });
      p.addEventListener('keydown', function (e) {
        var k = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : -1;
        if (k >= 0 && k < pts.length) { e.preventDefault(); pts[k].focus(); }
        else if ((e.key === 'Enter' || e.key === ' ') && data[i].h) { e.preventDefault(); location.hash = data[i].h; }
      });
    });
    set(0, false);
    var done = function () { fig.classList.add('in'); setTimeout(function () { fig.classList.add('ready'); }, 2000); };
    if (!('IntersectionObserver' in window)) return done();
    var io = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { done(); io.disconnect(); }
    }, { threshold: 0.2 });
    io.observe(fig);
  });
})();

/* Reviews page: Google Maps style "More" toggle on long reviews */
document.querySelectorAll('.rv-feed .rv-text').forEach(function (t) {
  if (t.scrollHeight <= t.clientHeight + 2) return;
  var b = document.createElement('button');
  b.type = 'button'; b.className = 'rv-more'; b.textContent = 'More';
  b.setAttribute('aria-expanded', 'false');
  b.addEventListener('click', function () {
    var open = t.classList.toggle('open');
    b.textContent = open ? 'Less' : 'More';
    b.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  t.after(b);
});

/* Tour booking card: date, group size and bike fill a ready-made WhatsApp
   message. Without JS the button still opens WhatsApp with the short text. */
document.querySelectorAll('.bk-form').forEach(function (f) {
  var card = f.closest('.bookcard'), btn = card && card.querySelector('.bk-wa');
  if (!btn) return;
  var NUM = '9779815139239', tour = f.dataset.tour, price = +f.dataset.price || 0;
  var date = f.querySelector('[name=date]'), riders = f.querySelector('[name=riders]'), bike = f.querySelector('[name=bike]');
  var total = f.querySelector('.bk-total'), label = date.closest('label').firstChild.textContent;
  var t = new Date();
  date.min = t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2);
  function usd(n) { return '$' + n.toLocaleString('en-US'); }
  function nice(v) {
    if (!v) return 'not fixed yet';
    var p = v.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }
  function build() {
    var n = +riders.value;
    var lines = ['Hi Aone Rental, I want to book the ' + tour + ' tour (' + f.dataset.days + ').', '',
      label + ': ' + nice(date.value),
      'Riders: ' + n,
      'Bike: ' + (bike.value || 'not sure, please suggest one')];
    var min = +f.dataset.min || 1;
    if (price && n < min) {
      lines.push('Price: please quote for ' + n + (n > 1 ? ' riders' : ' rider'));
      total.textContent = usd(price) + ' per rider is for groups of ' + min + '+. For ' + n + (n > 1 ? ' riders' : ' rider') + ', we send the price on WhatsApp.';
    } else if (price) {
      lines.push('Price: ' + usd(price) + ' x ' + n + ' = ' + usd(price * n) + ' USD');
      total.textContent = 'Total for ' + n + (n > 1 ? ' riders: ' : ' rider: ') + usd(price * n) + ' USD';
    } else {
      total.textContent = 'We send the price on WhatsApp.';
    }
    lines.push('', 'Please confirm availability and the final price. Thank you!');
    btn.href = 'https://wa.me/' + NUM + '?text=' + encodeURIComponent(lines.join('\n'));
  }
  [date, riders, bike].forEach(function (el) { el.addEventListener('change', build); });
  build();
});

/* Bike page booking card: dates and number of bikes fill a ready-made WhatsApp
   message. Without JS the button still opens WhatsApp with the short text. */
document.querySelectorAll('.rk-form').forEach(function (f) {
  var btn = f.closest('.bookcard').querySelector('.rk-wa');
  var st = f.querySelector('[name=start]'), en = f.querySelector('[name=end]'), ppl = f.querySelector('[name=bikes]');
  var total = f.querySelector('.bk-total'), bike = f.dataset.bike;
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function utc(v) { var p = v.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
  function nice(v) {
    if (!v) return 'not fixed yet';
    var p = v.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }
  st.min = en.min = iso(new Date());
  function build() {
    var d = st.value && en.value ? Math.round((utc(en.value) - utc(st.value)) / 864e5) + 1 : 0, n = +ppl.value;
    total.textContent = d ? 'Rental: ' + d + (d > 1 ? ' days' : ' day') : '';
    var text = 'Hi Aone Rental, I want to book the ' + bike + ' in Pokhara.\n\n' +
      'Start date: ' + nice(st.value) + '\nEnd date: ' + nice(en.value) +
      (d ? '\nRental: ' + d + (d > 1 ? ' days' : ' day') : '') +
      '\nNumber of bikes: ' + n + '\n\nPlease confirm availability and the price. Thank you!';
    btn.href = 'https://wa.me/9779815139239?text=' + encodeURIComponent(text);
  }
  st.addEventListener('change', function () {
    en.min = st.value || iso(new Date());
    if (en.value && en.value < st.value) en.value = st.value;
    build();
  });
  en.addEventListener('change', build);
  ppl.addEventListener('change', build);
  build();
});

/* Tour pages, phone: hide the bottom Book bar while the booking card is on screen. */
(function () {
  var bar = document.querySelector('.mbar'), card = document.querySelector('.tp-side .bookcard');
  if (!bar || !card || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function (en) { bar.classList.toggle('hide', en[0].isIntersecting); }).observe(card);
})();
