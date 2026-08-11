// currency.js — USD base; auto-AUD for Australian visitors (geo via Vercel edge header).
// DISPLAY ONLY: cart numeric base stays USD everywhere (amb_cart, data-price, crypto invoice).
// A price node opts in by carrying data-usd="<usdInteger>"; JS-rendered surfaces call formatPrice.
(function () {
  var cur = 'USD', rate = 1;
  var CFG = {
    USD: { locale: 'en-US', code: 'USD' },
    // en-US (not en-AU) so AUD renders the unambiguous "A$" symbol; en-AU would show a bare "$".
    AUD: { locale: 'en-US', code: 'AUD' }
  };

  window.getCurrency = function () { return cur; };

  window.formatPrice = function (usd) {
    var c = CFG[cur] || CFG.USD;
    return new Intl.NumberFormat(c.locale, {
      style: 'currency', currency: c.code, maximumFractionDigits: 0
    }).format(Number(usd) * rate);
  };

  // Reformat every static price node that declares its USD value, then re-render any
  // JS-driven surfaces present. Idempotent: always derives from data-usd, never from text.
  function apply() {
    var nodes = document.querySelectorAll('[data-usd]');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = window.formatPrice(nodes[i].getAttribute('data-usd'));
    }
    try { if (typeof renderProducts === 'function') renderProducts(); } catch (e) {}
    try { if (typeof renderCart === 'function') renderCart(); } catch (e) {}
    document.dispatchEvent(new Event('currencychange'));
  }

  window.initCurrency = function () {
    return fetch('/api/geo').then(function (r) { return r.json(); }).then(function (g) {
      if (!g || g.country !== 'AU') return;            // only AU switches to AUD, for now
      return fetch('/api/rates').then(function (r) { return r.json(); }).then(function (rates) {
        if (rates && rates.AUD > 0) { cur = 'AUD'; rate = rates.AUD; apply(); }
      });
    }).catch(function () { /* any failure → stay USD */ });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initCurrency);
  } else {
    window.initCurrency();
  }
})();
