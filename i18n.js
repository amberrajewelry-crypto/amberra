// AMBERRA i18n runtime — only on /ru/ /de/ /fr/ /es/ pages. The page is already
// translated at build time; this layer translates what JS renders later (product
// cards, drawer, cart, modals) from the same translation memory /i18n/<lang>.json.
(function () {
  const core = window.AmbI18nCore;
  const lang = document.documentElement.lang;
  if (!core || !/^(ru|de|fr|es)$/.test(lang)) return;
  let dict = null;
  const pending = new Set();
  let scheduled = false;

  function applySeg(el, s, v) {
    const tree = core.parse(v);
    if (!tree) return;
    const used = new Set();
    function build(container, nodes) {
      const out = [];
      for (const n of nodes) {
        if (n.t !== undefined) { out.push(document.createTextNode(n.t)); continue; }
        const p = s.parts[n.i];
        if (!p || used.has(n.i)) return null;
        used.add(n.i);
        if (!n.atom) { const inner = build(p, n.kids); if (!inner) return null; p.replaceChildren(...inner); }
        out.push(p);
      }
      return out;
    }
    const nodes = build(el, tree.kids);
    if (!nodes) return;
    if (s.lead) nodes.unshift(document.createTextNode(' '));
    if (s.trail) nodes.push(document.createTextNode(' '));
    el.replaceChildren(...nodes);
  }

  function translate(root) {
    if (!dict || !root) return;
    if (root.nodeType === 3) root = root.parentElement;
    if (!root || root.nodeType !== 1 || root.closest('script,style,svg,[translate="no"]')) return;
    const textNode = n => {
      const raw = n.nodeValue, v = core.lookup(dict, core.norm(raw).trim());
      if (v) n.nodeValue = (/^\s/.test(raw) ? ' ' : '') + v + (/\s$/.test(raw) ? ' ' : '');
    };
    core.walk(root, (el, s) => {
      const v = core.lookup(dict, s.key);
      if (v) { if (v !== s.key) applySeg(el, s, v); return; }
      // unknown combination (e.g. 'Stone' + a new stone name from Airtable):
      // translate each inline part and text run on its own
      const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const runs = [];
      for (let n = tw.nextNode(); n; n = tw.nextNode()) runs.push(n);
      runs.forEach(textNode);
    }, textNode);
    const els = root.querySelectorAll ? [root, ...root.querySelectorAll('[title],[alt],[placeholder],[aria-label]')] : [];
    for (const el of els) for (const a of core.ATTRS) {
      const val = el.getAttribute && el.getAttribute(a);
      if (!val) continue;
      const v = core.lookup(dict, core.norm(val).trim());
      if (v) el.setAttribute(a, v);
    }
  }

  function flush() {
    scheduled = false;
    const list = [...pending];
    pending.clear();
    obs.disconnect();
    for (const n of list) if (n.isConnected) translate(n);
    const t = core.lookup(dict, core.norm(document.title).trim());
    if (t) document.title = t;
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  const obs = new MutationObserver(muts => {
    for (const m of muts) pending.add(m.type === 'characterData' ? m.target : m.target);
    if (!scheduled && dict) { scheduled = true; requestAnimationFrame(flush); }
  });

  fetch(`/i18n/${lang}.json?v=${document.documentElement.dataset.i18nv||1}`, { cache: 'force-cache' })
    .then(r => (r.ok ? r.json() : {}))
    .then(d => { dict = d; pending.add(document.body); flush(); })
    .catch(() => {});
  obs.observe(document.body, { childList: true, subtree: true, characterData: true });
})();
