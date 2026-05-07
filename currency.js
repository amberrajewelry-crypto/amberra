// currency.js — USD only
window.formatPrice = function(usdPrice) {
  return new Intl.NumberFormat('en-US', {style:'currency',currency:'USD',maximumFractionDigits:0}).format(usdPrice);
};
window.initCurrency = function(){ return Promise.resolve(); };
window.getCurrency = function(){ return 'USD'; };
