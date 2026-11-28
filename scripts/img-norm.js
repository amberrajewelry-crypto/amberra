// Map a product image URL to its normalized version (transparent bg, centered, 80% fill, 1000px)
// when one exists. New "-n" filenames bypass the 1-year immutable cache on /images/*.
const NORM = new Set(require('../data/img-norm.json'));
// Replaced photos (Airtable still points at the old file): old .webp path -> new source.
const ALIAS = require('../data/img-alias.json');
const RE = /^(.*?\/)?(images\/[^?#"]+?)\.(?:webp|jpe?g|png)(?:\?[^#"]*)?$/i;
module.exports = function nimg(u) {
  let m = String(u || '').match(RE);
  if (m && ALIAS[m[2] + '.webp']) m = [m[0], m[1], ALIAS[m[2] + '.webp'].replace(/\.webp$/, '')];
  if (!m || !NORM.has(m[2] + '.webp')) return u;
  return (m[1] && m[1] !== '' ? m[1] : '/') + m[2] + '-m.webp';
};
