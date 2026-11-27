// Map a product image URL to its normalized version (transparent bg, centered, 80% fill, 1000px)
// when one exists. New "-n" filenames bypass the 1-year immutable cache on /images/*.
const NORM = new Set(require('../data/img-norm.json'));
const RE = /^(.*?\/)?(images\/[^?#"]+?)\.(?:webp|jpe?g|png)(?:\?[^#"]*)?$/i;
module.exports = function nimg(u) {
  const m = String(u || '').match(RE);
  if (!m || !NORM.has(m[2] + '.webp')) return u;
  return (m[1] && m[1] !== '' ? m[1] : '/') + m[2] + '-n.webp';
};
