// AMBERRA i18n core — shared by the browser runtime (i18n.js) and the build step
// (scripts/build-i18n.mjs). A "segment" is the smallest element whose content is
// only text + inline tags; its key is the text with inline tags abstracted to
// numbered placeholders: 'Designed in <0>Bali</0><1/>by artisans'. Translations
// keep the placeholders, so markup survives and the key is parser-independent.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AmbI18nCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'CODE', 'PRE', 'TEXTAREA', 'CANVAS', 'IFRAME', 'VIDEO', 'AUDIO', 'HEAD']);
  const INLINE = new Set(['A', 'ABBR', 'B', 'BDI', 'BDO', 'CITE', 'DFN', 'EM', 'I', 'KBD', 'MARK', 'Q', 'S', 'SMALL', 'SPAN', 'STRONG', 'SUB', 'SUP', 'TIME', 'U', 'DATA', 'LABEL']);
  const ATOM = new Set(['BR', 'WBR', 'IMG', 'SVG', 'INPUT', 'PICTURE']);
  const ATTRS = ['title', 'alt', 'placeholder', 'aria-label'];
  const LETTERS = /\p{L}{2,}/u;
  const NO_TRANSLATE = /^(AMBERRA|AMBERRA\s*JEWELRY|JEWELRY|WhatsApp|Instagram|Pinterest|Facebook|TikTok|PayPal|Visa|Mastercard|Stripe|Google|USD|EUR|GBP|IDR)$/i;

  // adapter: browser DOM nodes and node-html-parser nodes share these shapes
  const isEl = n => n && n.nodeType === 1;
  const isText = n => n && n.nodeType === 3;
  const tag = n => String(n.tagName || n.rawTagName || '').toUpperCase();
  const textOf = n => (n.nodeValue !== undefined && n.nodeValue !== null ? n.nodeValue : (n.text !== undefined ? n.text : n.rawText || ''));
  const kids = n => Array.from(n.childNodes || []);
  const norm = s => String(s).replace(/\s+/g, ' ');
  const translatable = s => LETTERS.test(s) && !NO_TRANSLATE.test(s.trim()) && !/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(s.trim()) && !/^https?:\/\//.test(s.trim());
  const noTr = n => isEl(n) && (n.getAttribute && (n.getAttribute('translate') === 'no' || n.getAttribute('data-no-i18n') !== null && n.getAttribute('data-no-i18n') !== undefined) || (n.classList && n.classList.contains && n.classList.contains('notranslate')));

  function hasBlock(el) {
    for (const c of kids(el)) {
      if (!isEl(c)) continue;
      const t = tag(c);
      if (ATOM.has(t)) continue;
      if (!INLINE.has(t) || SKIP.has(t)) return true;
      if (hasBlock(c)) return true;
    }
    return false;
  }

  // Serialize a leaf element to a key. Returns {key, parts} where parts[i] is the
  // i-th placeholder node (inline element or atom), in document order.
  function serialize(el) {
    const parts = [];
    function ser(n) {
      let out = '';
      for (const c of kids(n)) {
        if (isText(c)) out += norm(textOf(c));
        else if (isEl(c)) {
          const t = tag(c), i = parts.length;
          parts.push(c);
          if (ATOM.has(t)) out += `<${i}/>`;
          else out += `<${i}>${ser(c)}</${i}>`;
        }
      }
      return out;
    }
    const raw = ser(el);
    return { key: raw.replace(/ {2,}/g, ' ').trim(), lead: /^\s/.test(raw), trail: /\s$/.test(raw), parts };
  }

  // Collapse wrappers: <p><a>View</a></p> → segment is the <a>.
  function unwrap(el) {
    for (;;) {
      const ks = kids(el).filter(c => isEl(c) || (isText(c) && textOf(c).trim()));
      if (ks.length === 1 && isEl(ks[0]) && INLINE.has(tag(ks[0]))) el = ks[0];
      else return el;
    }
  }

  // Walk a subtree, calling onSeg(el, ser) for leaf segments and onText(textNode)
  // for bare text nodes inside mixed containers.
  function walk(node, onSeg, onText) {
    if (!node) return;
    if (isText(node)) { const t = textOf(node); if (translatable(t)) onText(node); return; }
    if (!isEl(node)) { for (const c of kids(node)) walk(c, onSeg, onText); return; }
    const t = tag(node);
    if (SKIP.has(t) || t === 'SVG' || noTr(node)) return;
    if (!hasBlock(node) && !ATOM.has(t)) {
      const el = unwrap(node);
      if (noTr(el)) return;
      const s = serialize(el);
      if (s.key && translatable(s.key.replace(/<\/?\d+\/?>/g, ' '))) onSeg(el, s);
      return;
    }
    for (const c of kids(node)) walk(c, onSeg, onText);
  }

  // Tokenize a translated string into a tree: [{t:'text'}|{i, kids:[...]}|{i, atom}]
  function parse(str) {
    const re = /<(\d+)(\/?)>|<\/(\d+)>/g;
    const rootN = { kids: [] }, stack = [rootN];
    let last = 0, m;
    while ((m = re.exec(str))) {
      if (m.index > last) stack[stack.length - 1].kids.push({ t: str.slice(last, m.index) });
      last = re.lastIndex;
      if (m[3] !== undefined) {
        const top = stack.pop();
        if (!top || top.i !== +m[3]) return null;
      } else if (m[2]) stack[stack.length - 1].kids.push({ i: +m[1], atom: true });
      else { const nn = { i: +m[1], kids: [] }; stack[stack.length - 1].kids.push(nn); stack.push(nn); }
    }
    if (stack.length !== 1) return null;
    if (last < str.length) rootN.kids.push({ t: str.slice(last) });
    return rootN;
  }

  // Same placeholder set on both sides — otherwise the translation is unusable.
  function samePlaceholders(a, b) {
    const ids = s => (s.match(/<\/?\d+\/?>/g) || []).sort().join('|');
    return ids(a) === ids(b);
  }

  function lookup(dict, key) {
    const v = dict[key];
    if (typeof v !== 'string' || !v.trim()) return null;
    return samePlaceholders(key, v) ? v : null;
  }

  return { walk, serialize, parse, lookup, samePlaceholders, translatable, norm, ATTRS, INLINE, ATOM, tag, kids, isEl, isText, textOf };
});
