// currency.js — language-aware price formatting (global script)
(function(){
  var LANG_CURRENCY = {
    en:'USD', ru:'RUB', zh:'CNY', ar:'AED', id:'IDR',
    de:'EUR', fr:'EUR', es:'EUR', it:'EUR', pt:'EUR',
    ja:'JPY', ko:'KRW', tr:'TRY', hi:'INR', ka:'GEL'
  };
  var FALLBACK_RATES = {
    USD:1, RUB:92, CNY:7.3, AED:3.67, IDR:15800,
    EUR:0.92, JPY:149, KRW:1320, TRY:32, INR:83, GEL:2.7
  };
  var rates = Object.assign({}, FALLBACK_RATES);
  var activeCurrency = 'USD';
  var activeLang = 'en';

  window.initCurrency = function(lang) {
    activeLang = lang || 'en';
    activeCurrency = LANG_CURRENCY[activeLang] || 'USD';
    return fetch('/api/rates')
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(data){ if(data) rates = data; })
      .catch(function(){});
  };

  window.formatPrice = function(usdPrice) {
    var rate = (rates[activeCurrency] != null) ? rates[activeCurrency] : 1;
    return new Intl.NumberFormat(activeLang, {
      style: 'currency',
      currency: activeCurrency,
      maximumFractionDigits: 0
    }).format(usdPrice * rate);
  };

  window.getCurrency = function(){ return activeCurrency; };
})();
