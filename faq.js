// FAQ page: show one topic at a time. Links like faq.html#deposit open that answer.
(function () {
  var cats = Array.prototype.slice.call(document.querySelectorAll('.fq-cats a'));
  var topics = Array.prototype.slice.call(document.querySelectorAll('.fq-topic'));
  if (!cats.length || !topics.length) return;

  function pick(id) {
    topics.forEach(function (t) { t.hidden = t.id !== id; });
    cats.forEach(function (a) {
      if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    document.querySelectorAll('.fq-topic details[open]').forEach(function (d) {
      if (d._anim) d._anim.cancel();
      d.open = false;
      d.classList.remove('closing');
    });
  }

  function fromHash() {
    var el = location.hash ? document.getElementById(location.hash.slice(1)) : null;
    if (!el) return false;
    if (el.classList.contains('fq-topic')) { pick(el.id); return true; }
    if (el.tagName === 'DETAILS') {
      pick(el.closest('.fq-topic').id);
      el.open = true;
      el.scrollIntoView();
      return true;
    }
    return false;
  }

  cats.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var id = a.getAttribute('href').slice(1);
      pick(id);
      history.replaceState(null, '', '#' + id);
    });
  });
  window.addEventListener('hashchange', fromHash);
  if (!fromHash()) pick(topics[0].id);
})();
