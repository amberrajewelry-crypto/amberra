// ═══════════════════════════════════════════════════════════════════════════
// AMBERRA — Shop JS (shop.js)
// Shop-specific: products, catalog, drawer, try-on, quiz, search, hover detail
// ═══════════════════════════════════════════════════════════════════════════
const C='https://res.cloudinary.com/dtfq3xq3t/image/upload';
const I='/images';
// WebP delivery with fallback (mirrors app.js; safe if app.js loads first)
if(typeof wsrc!=='function'){window.wsrc=function(p){if(typeof p!=='string')return p;var w=/^\/?images\/.*\.(jpe?g|png)$/i.test(p)?p.replace(/\.(jpe?g|png)$/i,'.webp'):p;return /\/images\/products\/\d+\.webp$/.test(w)?w+'?v=8':w;};}
if(typeof wimg!=='function'){window.wimg=function(el,src){if(!el)return;el.onerror=function(){this.onerror=null;this.src=src;};el.src=wsrc(src);};}

// ── PRODUCTS ──────────────────────────────────────────────────────────────
let products=[];
async function loadProducts(){
  try{
    const r=await fetch('/api/products');
    if(!r.ok)throw new Error('HTTP '+r.status);
    products=await r.json();
  }catch(e){
    console.error('Failed to load products',e);
  }
}

// ── CATALOG STATE ─────────────────────────────────────────────────────────
let activeFilter='all';
let searchQuery='';
let activeSort='featured';
let activeCollection='all';
// Curated collection pages (/collections/*) inject window.COLLECTION_IDS — an
// ordered id list. When present, the grid renders exactly that set (see renderProducts).
const collectionIds=Array.isArray(window.COLLECTION_IDS)?window.COLLECTION_IDS:null;

// Handle URL category params on page load
const urlParams=new URLSearchParams(window.location.search);
const catParam=urlParams.get('cat');
// Also detect category from clean path URLs: /rings, /earrings, /pendants, /bracelets, /chains
const pathCats=['rings','earrings','pendants','bracelets','chains'];
const pathCat=pathCats.find(c=>window.location.pathname==='/' + c)||null;
if(catParam){activeFilter=catParam;}
else if(pathCat){activeFilter=pathCat;}
const qParam=urlParams.get('q');
if(qParam){searchQuery=qParam.toLowerCase();}

// Highlight nav item matching current category
document.querySelectorAll('.nav-main .nl').forEach(a=>{
  a.classList.remove('act');
  if(catParam&&a.href.includes('cat='+catParam))a.classList.add('act');
});

// ── RENDER PRODUCTS ────────────────────────────────────────────────────────
function renderProducts(){
  const grid=document.getElementById('prod-grid');
  if(!grid)return;
  let list=showingWishlist
    ? products.filter(p=>wishlist.includes(p.id))
    : collectionIds
      ? collectionIds.map(id=>products.find(p=>p.id===id)).filter(Boolean)
      : (activeFilter==='all'?products:products.filter(p=>p.cat===activeFilter));
  if(searchQuery){
    list=list.filter(p=>
      p.name.toLowerCase().includes(searchQuery)||
      p.cat.toLowerCase().includes(searchQuery)||
      (p.material||'').toLowerCase().includes(searchQuery)||
      (p.desc||'').toLowerCase().includes(searchQuery)
    );
  }
  if(activeCollection!=='all'){
    list=list.filter(p=>(p.props&&p.props.Collection)===activeCollection);
  }
  list=sortList(list,activeSort);
  const cnt=document.getElementById('cat-count');
  if(cnt)cnt.textContent=list.length+(list.length===1?' piece':' pieces');
  if(!list.length){
    grid.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--stone);font-size:11px;letter-spacing:.15em">${showingWishlist?'YOUR WISHLIST IS EMPTY':'NO RESULTS FOUND'}</div>`;
    return;
  }
  grid.innerHTML=list.map((p,i)=>{
    const b=p.badge?`<div class="pbadge ${p.badge}">${p.badge==='bestseller'?'Best Seller':p.badge==='limited'?'Limited':'New'}</div>`:'';
    const wish=`<button class="pc-wish${isWished(p.id)?' on':''}" data-id="${p.id}" onclick="toggleWish(${p.id},event)"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg></button>`;
    const cam=``;
    const props=Object.entries(p.props||{}).slice(0,3).map(([k,v])=>
      `<div class="pc-xprop"><span class="pc-xpk">${k}</span><span class="pc-xpv">${v}</span></div>`).join('');
    const hasMulti=p.imgs&&p.imgs.length>1;
    const imgHtml=hasMulti
      ? `<div class="pc-slides">${p.imgs.map((src,si)=>`<img src="${wsrc(src)}" onerror="this.onerror=null;this.src='${src}'" alt="${p.name}" class="pcs${si===0?' active':''}" loading="lazy" width="400" height="400">`).join('')}</div><div class="pc-sdots">${p.imgs.map((_,si)=>`<span class="pc-sdot${si===0?' on':''}"></span>`).join('')}</div>`
      : `<img src="${wsrc(p.img)}" onerror="this.onerror=null;this.src='${p.img}'" alt="${p.name}" loading="lazy" width="400" height="400">`;
    return `<div class="pc reveal" style="transition-delay:${(i%4)*.06}s"
      onmouseenter="hxOn(this)"
      onmouseleave="hxOff(this)">
      <div class="pc-inner" onclick="${p.slug?`location.href='/products/${p.slug}'`:`openDrawer(${p.id})`}">
        <div class="pc-img" style="position:relative">${b}${wish}${cam}${imgHtml}</div>
        <div class="pc-label">
          <span class="pcat">${p.cat.toUpperCase()}</span>
          <h3 class="pname">${p.name}</h3>
          <p class="pmaterial">${p.material}</p>
          <div class="pfoot"><span class="pprice">${window.formatPrice?window.formatPrice(p.price):'$'+p.price}</span></div>
        </div>
      </div>
      <div class="pc-xpanel" onclick="${p.slug?`location.href='/products/${p.slug}'`:`openDrawer(${p.id})`}">
        <span class="pc-xcat">${p.cat.toUpperCase()}</span>
        <h3 class="pc-xname">${p.name}</h3>
        <p class="pc-xmat">${p.material}</p>
        ${p.desc?`<p class="pc-xdesc">${p.desc}</p>`:''}
        <div>${props}</div>
        <div class="pc-xprice">${window.formatPrice?window.formatPrice(p.price):'$'+p.price}</div>
      </div>
    </div>`;
  }).join('');
  initReveal();
}

// ── FILTER FUNCTIONS ───────────────────────────────────────────────────────
function sf(cat,el){
  activeFilter=cat;
  document.querySelectorAll('.ftab').forEach(t=>t.classList.remove('act'));
  el.classList.add('act');
  const bc=document.getElementById('bc-cat');
  if(bc) bc.textContent=cat==='all'?'All Jewelry':cat.charAt(0).toUpperCase()+cat.slice(1);
  renderProducts();
}

function fac(cat){
  activeFilter=cat;
  document.querySelectorAll('.ftab').forEach((t,i)=>{
    const cats=['all','rings','earrings','pendants','bracelets','chains'];
    t.classList.toggle('act',cats[i]===cat);
  });
  s('catalog');
  setTimeout(renderProducts,300);
}

// ── SORT ──────────────────────────────────────────────────────────────────
// ponytail: deterministic copy-sort, original products order preserved as Featured (Airtable order).
function sortList(list,mode){
  const out=list.slice();
  if(mode==='price-asc')out.sort((a,b)=>(a.price||0)-(b.price||0));
  else if(mode==='price-desc')out.sort((a,b)=>(b.price||0)-(a.price||0));
  else if(mode==='newest')out.sort((a,b)=>(b.badge==='new'?1:0)-(a.badge==='new'?1:0));
  return out; // 'featured' = keep source order
}
function setSort(v){activeSort=v;renderProducts();}

// ── COLLECTION FILTER ──────────────────────────────────────────────────────
// ponytail: populate only collections present in loaded products, sorted by count desc.
function populateCollections(){
  const sel=document.getElementById('cat-collection');
  if(!sel)return;
  const counts={};
  products.forEach(p=>{const c=p.props&&p.props.Collection;if(c)counts[c]=(counts[c]||0)+1;});
  const names=Object.keys(counts).sort((a,b)=>counts[b]-counts[a]||a.localeCompare(b));
  const cur=activeCollection;
  sel.innerHTML='<option value="all">All Collections</option>'+names.map(n=>`<option value="${n}">${n} (${counts[n]})</option>`).join('');
  sel.value=cur&&names.includes(cur)?cur:'all';
}
function setCollection(v){activeCollection=v;renderProducts();}

// ── SIZE SELECTOR ─────────────────────────────────────────────────────────
const RING_SIZE_RANGES={
  'XS–XL':['5','5.5','6','6.5','7','7.5','8','8.5','9'],
  'XS-XL':['5','5.5','6','6.5','7','7.5','8','8.5','9'],
  'XS–L': ['5','5.5','6','6.5','7','7.5','8'],
  'XS-L':  ['5','5.5','6','6.5','7','7.5','8'],
  'M–XL':  ['7','7.5','8','8.5','9'],
  'M-XL':  ['7','7.5','8','8.5','9'],
};
const RING_EU={'5':'49','5.5':'50','6':'52','6.5':'53','7':'54','7.5':'55','8':'57','8.5':'58','9':'60','9.5':'61','10':'62'};

function buildSizeSelector(p){
  const cat=p.cat||'';
  const props=p.props||{};
  if(cat==='rings'){
    const range=props.Size||'XS–XL';
    const sizes=RING_SIZE_RANGES[range]||['5','5.5','6','6.5','7','7.5','8','8.5','9'];
    const defaultIdx=Math.floor(sizes.length/2);
    const btns=sizes.map((s,i)=>
      `<button class="sz-btn${i===defaultIdx?' sel':''}" onclick="selSz(this)" title="EU ${RING_EU[s]||''}">${s}</button>`
    ).join('');
    const defEU=RING_EU[sizes[defaultIdx]]||'';
    return `<div class="d-size">
      <div class="d-size-head"><span class="d-size-lbl">Ring Size <span style="color:var(--stone);font-size:8px">(US)</span></span><span class="d-size-eu" id="d-eu">EU ${defEU}</span></div>
      <div class="sz-btns">${btns}</div>
    </div>`;
  }
  if(cat==='bracelets'){
    const elastic=(props.Length||'').toLowerCase().includes('elastic');
    if(elastic) return `<div class="d-size"><span class="d-size-lbl">Size</span><span class="sz-onesize">One Size · Elastic Fit</span></div>`;
    const sizes=['XS · 15cm','S · 16cm','M · 17cm','L · 18cm','XL · 19cm'];
    const btns=sizes.map((s,i)=>
      `<button class="sz-btn${i===2?' sel':''}" onclick="selSz(this)">${s}</button>`
    ).join('');
    return `<div class="d-size"><span class="d-size-lbl">Bracelet Size</span><div class="sz-btns">${btns}</div></div>`;
  }
  if(cat==='pendants'||cat==='necklaces'||cat==='chains'){
    const chainProp=props.Chain||'';
    const match=chainProp.match(/(\d+)/);
    const defLen=match?match[1]+'cm':'45cm';
    const lengths=['40cm','45cm','50cm','55cm','60cm'];
    const btns=lengths.map(s=>
      `<button class="sz-btn${s===defLen?' sel':''}" onclick="selSz(this)">${s}</button>`
    ).join('');
    return `<div class="d-size">
      <div class="d-size-head"><span class="d-size-lbl">Chain Length</span><a class="d-size-guide" href="javascript:void(0)" title="40cm=choker 45cm=princess 50cm=matinee">ℹ Guide</a></div>
      <div class="sz-btns">${btns}</div>
    </div>`;
  }
  if(cat==='earrings'){
    return `<div class="d-size"><span class="d-size-lbl">Size</span><span class="sz-onesize">One Size · Fits All</span></div>`;
  }
  return '';
}
function selSz(el){
  const wrap=el.closest('.sz-btns');
  wrap.querySelectorAll('.sz-btn').forEach(b=>b.classList.remove('sel'));
  el.classList.add('sel');
  // Update EU display for rings
  const eu=document.getElementById('d-eu');
  if(eu&&RING_EU[el.textContent.trim()]){eu.textContent='EU '+RING_EU[el.textContent.trim()];}
}
function getSelectedSize(){
  const sel=document.querySelector('#d-size .sz-btn.sel');
  return sel?sel.textContent.trim():null;
}

// ── DRAWER ────────────────────────────────────────────────────────────────
function openDrawer(id){
  const p=products.find(x=>x.id===id);if(!p)return;
  drawerProductId=id;
  const cartBtn=document.getElementById('d-cart');
  if(cartBtn){
    const item=cart.find(x=>x.id===id);
    cartBtn.textContent=item?`In Cart (${item.qty||1}) — Add More`:'Add to Cart';
    cartBtn.classList.toggle('in-cart',!!item);
    cartBtn.disabled=false;
  }
  const imgs=p.imgs||[p.img];
  const dImgEl=document.getElementById('d-img');
  wimg(dImgEl,imgs[0]); if(dImgEl) dImgEl.alt=p.name;
  document.getElementById('d-cat').textContent=p.cat.toUpperCase();
  document.getElementById('d-name').textContent=p.name;
  document.getElementById('d-mat').textContent=p.material;
  document.getElementById('d-price').textContent=window.formatPrice?window.formatPrice(p.price):'$'+p.price;
  document.getElementById('d-desc').textContent=p.desc;
  document.getElementById('d-props').innerHTML=Object.entries(p.props||{}).map(([k,v])=>
    `<div class="d-prop"><span class="d-pk">${k}</span><span class="d-pv">${v}</span></div>`).join('');
  // Show "Request This Piece" only for sold-out / made-to-order items
  const reqBtn=document.getElementById('d-req');
  const soldOut=p.badge==='sold-out'||p.badge==='made-to-order';
  if(reqBtn){
    reqBtn.style.display=soldOut?'':'none';
    reqBtn.onclick=()=>{closeDrawer();openReq(p.name)};
  }
  if(cartBtn) cartBtn.style.display=soldOut?'none':'';
  const gallery=document.getElementById('d-gallery');
  if(imgs.length>1){
    gallery.innerHTML=imgs.map((src,i)=>
      `<img class="d-thumb${i===0?' act':''}" src="${wsrc(src)}" onerror="this.onerror=null;this.src='${src}'" onclick="setDImg(this,'${src}')" alt="${p.name} thumbnail">`
    ).join('');
    gallery.style.display='flex';
  } else {
    gallery.innerHTML='';
    gallery.style.display='none';
  }
  const sizeEl=document.getElementById('d-size');
  if(sizeEl) sizeEl.innerHTML=buildSizeSelector(p);
  // You may also like — 3 pieces from the same category
  const rel=document.getElementById('d-related');
  if(rel){
    const others=products.filter(x=>x.cat===p.cat&&x.id!==id).slice(0,3);
    rel.innerHTML=others.length?`<h3 class="d-rel-h">You May Also Like</h3><div class="d-rel-grid">${others.map(o=>{
      const oi=(o.imgs&&o.imgs[0])||o.img;
      return `<a class="d-rel-card" href="#" onclick="openDrawer(${o.id});return false"><span class="d-rel-imgw"><img src="${wsrc(oi)}" onerror="this.onerror=null;this.src='${oi}'" alt="${o.name}" loading="lazy"></span><span class="d-rel-name">${o.name}</span><span class="d-rel-price">${window.formatPrice?window.formatPrice(o.price):'$'+o.price}</span></a>`;
    }).join('')}</div>`:'';
  }
  const sb=window.innerWidth-document.documentElement.clientWidth;
  document.body.style.paddingRight=sb+'px';
  document.body.style.overflow='hidden';
  document.getElementById('nav-shell').classList.add('nav-hidden');
  const panel = document.querySelector('.d-panel'); if(panel) panel.scrollTop = 0;
  document.getElementById('drawer').classList.add('open');
}
function setDImg(el,src){
  const dEl=document.getElementById('d-img');
  wimg(dEl,src);
  const p=products.find(x=>x.id===drawerProductId);
  if(dEl&&p) dEl.alt=p.name;
  document.querySelectorAll('.d-thumb').forEach(t=>t.classList.remove('act'));
  el.classList.add('act');
}
function closeDrawer(){
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('nav-shell').classList.remove('nav-hidden');
  document.body.style.overflow='';
  document.body.style.paddingRight='';
}

// ── HOVER DETAIL ──────────────────────────────────────────────────────────
let hdTimer=null;
let slideTimer=null;
function hxOn(el){
  document.querySelectorAll('.pc').forEach(c=>{
    c.classList.remove('hx','hx-l');
    c.style.pointerEvents=c===el?'':'none';
  });
  const rect=el.getBoundingClientRect();
  const panelW=rect.width;
  el.classList.add('hx');
  if(rect.right+panelW+10>window.innerWidth) el.classList.add('hx-l');
  // auto-cycle card slides on hover
  clearInterval(slideTimer);
  const slides=el.querySelectorAll('.pcs');
  const dots=el.querySelectorAll('.pc-sdot');
  if(slides.length>1){
    let si=0;
    slideTimer=setInterval(()=>{
      slides[si].classList.remove('active');
      dots[si]&&dots[si].classList.remove('on');
      si=(si+1)%slides.length;
      slides[si].classList.add('active');
      dots[si]&&dots[si].classList.add('on');
    },1400);
  }
}
function hxOff(el){
  el.classList.remove('hx','hx-l');
  document.querySelectorAll('.pc').forEach(c=>c.style.pointerEvents='');
  clearInterval(slideTimer);slideTimer=null;
  // reset to first slide
  const slides=el.querySelectorAll('.pcs');
  const dots=el.querySelectorAll('.pc-sdot');
  slides.forEach((s,i)=>{s.classList.toggle('active',i===0);});
  dots.forEach((d,i)=>{d.classList.toggle('on',i===0);});
}

function showHD(id){
  clearTimeout(hdTimer);
  const p=products.find(x=>x.id===id);if(!p)return;
  const hdEl=document.getElementById('hd-img');
  wimg(hdEl,p.img); if(hdEl) hdEl.alt=p.name;
  document.getElementById('hd-cat').textContent=p.cat.toUpperCase();
  document.getElementById('hd-name').textContent=p.name;
  const mat=document.getElementById('hd-material');
  mat.textContent=p.material||'';mat.style.display=p.material?'':'none';
  const desc=document.getElementById('hd-desc');
  desc.textContent=p.desc||'';desc.style.display=p.desc?'':'none';
  document.getElementById('hd-price').textContent=window.formatPrice?window.formatPrice(p.price):'$'+p.price;
  document.getElementById('hd-props').innerHTML=Object.entries(p.props||{}).slice(0,4).map(([k,v])=>
    `<div class="hd-prop"><span class="hd-pk">${k}</span><span class="hd-pv">${v}</span></div>`).join('');
  document.getElementById('hover-detail').classList.add('show');
}
function hideHD(){
  hdTimer=setTimeout(()=>document.getElementById('hover-detail').classList.remove('show'),180);
}

// ── SHOP PAGE INIT ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',()=>{
  const grid=document.getElementById('prod-grid');
  if(grid){
    grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--gray);letter-spacing:.1em;font-size:12px">LOADING…</div>';
  }

  loadProducts().then(()=>{
    // Apply URL category filter after products load
    if(catParam){
      activeFilter=catParam;
      document.querySelectorAll('.ftab').forEach((t,i)=>{
        const cats=['all','rings','earrings','pendants','bracelets','chains'];
        t.classList.toggle('act',cats[i]===catParam);
      });
    }
    renderProducts();
    populateCollections();
    // Trigger reveal after load
    setTimeout(()=>{
      document.querySelectorAll('.reveal').forEach(el=>{
        el.classList.remove('pre');el.classList.add('on');
      });
    },2000);
  });

  const inp=document.querySelector('.nav-search-inp');
  if(inp){
    if(qParam)inp.value=qParam;
    inp.addEventListener('input',e=>{
      searchQuery=e.target.value.trim().toLowerCase();
      renderProducts();
    });
    inp.addEventListener('keydown',e=>{
      if(e.key==='Escape'){inp.value='';searchQuery='';renderProducts();}
    });
  }

  // Handle hash-based navigation
  if(window.location.hash){
    const hash=window.location.hash.replace('#','');
    const validCats=['rings','earrings','pendants','bracelets','chains'];
    if(validCats.includes(hash)){
      activeFilter=hash;
    }
  }
});
