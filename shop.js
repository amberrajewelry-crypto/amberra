// ═══════════════════════════════════════════════════════════════════════════
// AMBERRA — Shop JS (shop.js)
// Shop-specific: products, catalog, drawer, try-on, quiz, search, hover detail
// ═══════════════════════════════════════════════════════════════════════════
const C='https://res.cloudinary.com/dtfq3xq3t/image/upload';
const I='https://amberra-jewelry.com/img';

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

// Handle URL category params on page load
const urlParams=new URLSearchParams(window.location.search);
const catParam=urlParams.get('cat');
if(catParam){activeFilter=catParam;}
const qParam=urlParams.get('q');
if(qParam){searchQuery=qParam.toLowerCase();}

// ── RENDER PRODUCTS ────────────────────────────────────────────────────────
function renderProducts(){
  const grid=document.getElementById('prod-grid');
  if(!grid)return;
  let list=showingWishlist
    ? products.filter(p=>wishlist.includes(p.id))
    : (activeFilter==='all'?products:products.filter(p=>p.cat===activeFilter));
  if(searchQuery){
    list=list.filter(p=>
      p.name.toLowerCase().includes(searchQuery)||
      p.cat.toLowerCase().includes(searchQuery)||
      (p.material||'').toLowerCase().includes(searchQuery)||
      (p.desc||'').toLowerCase().includes(searchQuery)
    );
  }
  if(!list.length){
    grid.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--stone);font-size:11px;letter-spacing:.15em">${showingWishlist?'YOUR WISHLIST IS EMPTY':'NO RESULTS FOUND'}</div>`;
    return;
  }
  grid.innerHTML=list.map((p,i)=>{
    const b=p.badge?`<div class="pbadge ${p.badge}">${p.badge==='bestseller'?'Best Seller':p.badge==='limited'?'Limited':'New'}</div>`:'';
    const cnt=p.imgs&&p.imgs.length>1?`<span class="pc-cnt">${p.imgs.length} colors</span>`:'';
    const wish=`<button class="pc-wish${isWished(p.id)?' on':''}" data-id="${p.id}" onclick="toggleWish(${p.id},event)"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg></button>`;
    const cam=`<button class="pc-cam" onclick="quickTryon(${p.id},event)" title="Try On"><svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg></button>`;
    const props=Object.entries(p.props||{}).slice(0,3).map(([k,v])=>
      `<div class="pc-xprop"><span class="pc-xpk">${k}</span><span class="pc-xpv">${v}</span></div>`).join('');
    return `<div class="pc reveal" style="transition-delay:${(i%4)*.06}s"
      onmouseenter="hxOn(this)"
      onmouseleave="hxOff(this)">
      <div class="pc-inner" onclick="openDrawer(${p.id})">
        <div class="pc-img" style="position:relative">${b}${cnt}${wish}${cam}<img src="${p.img}" alt="${p.name}" loading="lazy"></div>
        <div class="pc-label">
          <span class="pcat">${p.cat.toUpperCase()}</span>
          <h3 class="pname">${p.name}</h3>
          <p class="pmaterial">${p.material}</p>
          <div class="pfoot"><span class="pprice">$${p.price}</span></div>
        </div>
      </div>
      <div class="pc-xpanel" onclick="openDrawer(${p.id})">
        <span class="pc-xcat">${p.cat.toUpperCase()}</span>
        <h3 class="pc-xname">${p.name}</h3>
        <p class="pc-xmat">${p.material}</p>
        ${p.desc?`<p class="pc-xdesc">${p.desc}</p>`:''}
        <div>${props}</div>
        <div class="pc-xprice">$${p.price}</div>
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
  document.getElementById('d-img').src=imgs[0];
  document.getElementById('d-cat').textContent=p.cat.toUpperCase();
  document.getElementById('d-name').textContent=p.name;
  document.getElementById('d-mat').textContent=p.material;
  document.getElementById('d-price').textContent='$'+p.price;
  document.getElementById('d-desc').textContent=p.desc;
  document.getElementById('d-props').innerHTML=Object.entries(p.props||{}).map(([k,v])=>
    `<div class="d-prop"><span class="d-pk">${k}</span><span class="d-pv">${v}</span></div>`).join('');
  document.getElementById('d-req').onclick=()=>{closeDrawer();openReq(p.name)};
  const gallery=document.getElementById('d-gallery');
  if(imgs.length>1){
    gallery.innerHTML=imgs.map((src,i)=>
      `<img class="d-thumb${i===0?' act':''}" src="${src}" onclick="setDImg(this,'${src}')" alt="">`
    ).join('');
    gallery.style.display='flex';
  } else {
    gallery.innerHTML='';
    gallery.style.display='none';
  }
  const sizeEl=document.getElementById('d-size');
  if(sizeEl) sizeEl.innerHTML=buildSizeSelector(p);
  const sb=window.innerWidth-document.documentElement.clientWidth;
  document.body.style.paddingRight=sb+'px';
  document.body.style.overflow='hidden';
  document.getElementById('nav-shell').classList.add('nav-hidden');
  const panel = document.querySelector('.d-panel'); if(panel) panel.scrollTop = 0;
  document.getElementById('drawer').classList.add('open');
}
function setDImg(el,src){
  document.getElementById('d-img').src=src;
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
function hxOn(el){
  document.querySelectorAll('.pc').forEach(c=>{
    c.classList.remove('hx','hx-l');
    c.style.pointerEvents=c===el?'':'none';
  });
  const rect=el.getBoundingClientRect();
  const panelW=rect.width;
  el.classList.add('hx');
  if(rect.right+panelW+10>window.innerWidth) el.classList.add('hx-l');
}
function hxOff(el){
  el.classList.remove('hx','hx-l');
  document.querySelectorAll('.pc').forEach(c=>c.style.pointerEvents='');
}

function showHD(id){
  clearTimeout(hdTimer);
  const p=products.find(x=>x.id===id);if(!p)return;
  document.getElementById('hd-img').src=p.img;
  document.getElementById('hd-cat').textContent=p.cat.toUpperCase();
  document.getElementById('hd-name').textContent=p.name;
  const mat=document.getElementById('hd-material');
  mat.textContent=p.material||'';mat.style.display=p.material?'':'none';
  const desc=document.getElementById('hd-desc');
  desc.textContent=p.desc||'';desc.style.display=p.desc?'':'none';
  document.getElementById('hd-price').textContent='$'+p.price;
  document.getElementById('hd-props').innerHTML=Object.entries(p.props||{}).slice(0,4).map(([k,v])=>
    `<div class="hd-prop"><span class="hd-pk">${k}</span><span class="hd-pv">${v}</span></div>`).join('');
  document.getElementById('hover-detail').classList.add('show');
}
function hideHD(){
  hdTimer=setTimeout(()=>document.getElementById('hover-detail').classList.remove('show'),180);
}

// ── TRY-ON ────────────────────────────────────────────────────────────────
let tryonPhoto=null;
let cameraStream=null;
let selectedTryonProduct=null;

function initTryonItems(){
  const container=document.getElementById('tryon-items');
  if(!container)return;
  const list=products.slice(0,8);
  container.innerHTML=list.map((p,i)=>
    `<div class="tryon-item${i===0?' sel':''}" data-tid="${p.id}" onclick="selectTryonItem(${p.id},this)">
      <img src="${p.img}" alt="${p.name}" loading="lazy">
      <div class="tryon-item-name">${p.name.substring(0,18)}</div>
    </div>`).join('');
  selectedTryonProduct=list[0]||null;
}

function selectTryonItem(id,el){
  document.querySelectorAll('.tryon-item').forEach(t=>t.classList.remove('sel'));
  el.classList.add('sel');
  selectedTryonProduct=products.find(p=>p.id===id);
  if(tryonPhoto||cameraStream) applyTryonJewel();
}

function quickTryon(id,ev){
  ev.stopPropagation();
  const p=products.find(q=>q.id===id);
  if(!p) return;
  selectedTryonProduct=p;
  const container=document.getElementById('tryon-items');
  if(container){
    const existing=container.querySelector(`[data-tid="${id}"]`);
    if(existing){
      container.querySelectorAll('.tryon-item').forEach(t=>t.classList.remove('sel'));
      existing.classList.add('sel');
    } else {
      const list=[p,...products.filter(q=>q.id!==id).slice(0,7)];
      container.innerHTML=list.map((item,i)=>
        `<div class="tryon-item${i===0?' sel':''}" data-tid="${item.id}" onclick="selectTryonItem(${item.id},this)">
          <img src="${item.img}" alt="${item.name}" loading="lazy">
          <div class="tryon-item-name">${item.name.substring(0,18)}</div>
        </div>`).join('');
    }
  }
  const sec=document.getElementById('tryon-sec');
  if(sec) sec.scrollIntoView({behavior:'smooth'});
  if(tryonPhoto||cameraStream) applyTryonJewel();
}

async function initCamera(){
  if(cameraStream){stopCamera();return;}
  try{
    const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:960}}});
    cameraStream=stream;
    const video=document.getElementById('tryon-video');
    const empty=document.getElementById('tryon-empty');
    video.srcObject=stream;
    video.style.display='block';
    empty.style.display='none';
    const btn=document.getElementById('tryon-main-btn');
    if(btn){btn.textContent='Stop Camera';btn.onclick=stopCamera;}
    document.getElementById('tryon-controls').style.display='flex';
    document.getElementById('tryon-opacity-row').style.display='flex';
    if(selectedTryonProduct) applyTryonJewel();
  }catch(e){
    alert('Camera access denied. Please allow camera access in your browser settings.');
  }
}

function stopCamera(){
  if(cameraStream){cameraStream.getTracks().forEach(t=>t.stop());cameraStream=null;}
  const video=document.getElementById('tryon-video');
  video.style.display='none';video.srcObject=null;
  document.getElementById('tryon-empty').style.display='flex';
  document.getElementById('tryon-jewel-wrap').style.display='none';
  document.getElementById('tryon-controls').style.display='none';
  document.getElementById('tryon-opacity-row').style.display='none';
  const btn=document.getElementById('tryon-main-btn');
  if(btn){btn.textContent='Start Camera';btn.onclick=initCamera;}
}

function handleTryonUpload(e){
  const file=e.target.files[0]; if(!file)return;
  // Stop camera if running
  if(cameraStream){cameraStream.getTracks().forEach(t=>t.stop());cameraStream=null;
    document.getElementById('tryon-video').style.display='none';}
  const reader=new FileReader();
  reader.onload=ev=>{
    const canvas=document.getElementById('tryon-canvas');
    const empty=document.getElementById('tryon-empty');
    const img=new Image();
    img.onload=()=>{
      const mock=document.getElementById('tryon-mock');
      canvas.width=mock.offsetWidth*2;
      canvas.height=mock.offsetHeight*2;
      canvas.style.display='block';
      const ctx=canvas.getContext('2d');
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      tryonPhoto=img;
      empty.style.display='none';
      applyTryonJewel();
      document.getElementById('tryon-controls').style.display='flex';
      document.getElementById('tryon-opacity-row').style.display='flex';
      const btn=document.getElementById('tryon-main-btn');
      if(btn){btn.textContent='Start Camera';btn.onclick=initCamera;}
    };
    img.src=ev.target.result;
  };
  reader.readAsDataURL(file);
}

function getJewelPos(cat,mw,mh){
  switch(cat){
    case 'earrings':
      return{x:Math.round(mw*.68),y:Math.round(mh*.34),sz:Math.round(mw*.13)};
    case 'rings':
      return{x:Math.round(mw*.30),y:Math.round(mh*.76),sz:Math.round(mw*.11)};
    case 'bracelets':
      return{x:Math.round(mw*.40),y:Math.round(mh*.80),sz:Math.round(mw*.21)};
    case 'pendants':
    case 'necklaces':
    case 'chains':
    default:
      return{x:Math.round(mw*.50),y:Math.round(mh*.60),sz:Math.round(mw*.19)};
  }
}

function applyTryonJewel(){
  if(!selectedTryonProduct)return;
  const wrap=document.getElementById('tryon-jewel-wrap');
  const img=document.getElementById('tryon-jewel-img');
  img.src=selectedTryonProduct.img;
  wrap.style.display='block';
  const mock=document.getElementById('tryon-mock');
  const mw=mock.offsetWidth, mh=mock.offsetHeight;
  const pos=getJewelPos(selectedTryonProduct.cat||'',mw,mh);
  wrap.style.width=pos.sz+'px';
  wrap.style.height=pos.sz+'px';
  wrap.style.left=(pos.x-pos.sz/2)+'px';
  wrap.style.top=(pos.y-pos.sz/2)+'px';
  wrap.style.transform='none';
  initTryonDrag();
}

function initTryonDrag(){
  const wrap=document.getElementById('tryon-jewel-wrap');
  const handle=document.getElementById('tryon-resize-handle');
  let dragging=false,resizing=false,sx=0,sy=0,ox=0,oy=0,ow=0,oh=0;

  wrap.onmousedown=e=>{
    if(e.target===handle)return;
    dragging=true;
    sx=e.clientX; sy=e.clientY;
    ox=parseInt(wrap.style.left)||0; oy=parseInt(wrap.style.top)||0;
    e.preventDefault();
  };
  handle.onmousedown=e=>{
    resizing=true;
    sx=e.clientX; sy=e.clientY;
    ow=wrap.offsetWidth; oh=wrap.offsetHeight;
    e.preventDefault(); e.stopPropagation();
  };
  document.addEventListener('mousemove',e=>{
    if(dragging){
      wrap.style.left=(ox+e.clientX-sx)+'px';
      wrap.style.top=(oy+e.clientY-sy)+'px';
    }
    if(resizing){
      const d=e.clientX-sx;
      const nw=Math.max(40,ow+d);
      wrap.style.width=nw+'px';
      wrap.style.height=nw+'px';
    }
  });
  document.addEventListener('mouseup',()=>{dragging=false;resizing=false;});

  // Touch support
  wrap.ontouchstart=e=>{
    if(e.touches.length===1){
      const t=e.touches[0];
      dragging=true;
      sx=t.clientX; sy=t.clientY;
      ox=parseInt(wrap.style.left)||0; oy=parseInt(wrap.style.top)||0;
    }
    e.preventDefault();
  };
  handle.ontouchstart=e=>{
    const t=e.touches[0];
    resizing=true;
    sx=t.clientX; sy=t.clientY;
    ow=wrap.offsetWidth; oh=wrap.offsetHeight;
    e.stopPropagation(); e.preventDefault();
  };
  wrap.ontouchmove=e=>{
    const t=e.touches[0];
    if(dragging){
      wrap.style.left=(ox+t.clientX-sx)+'px';
      wrap.style.top=(oy+t.clientY-sy)+'px';
    }
    if(resizing){
      const d=t.clientX-sx;
      const nw=Math.max(40,ow+d);
      wrap.style.width=nw+'px'; wrap.style.height=nw+'px';
    }
    e.preventDefault();
  };
  wrap.ontouchend=()=>{dragging=false;resizing=false;};
}

function tryonScale(factor){
  const wrap=document.getElementById('tryon-jewel-wrap');
  if(wrap.style.display==='none')return;
  const nw=Math.max(40,Math.round(wrap.offsetWidth*factor));
  const cx=parseInt(wrap.style.left)+wrap.offsetWidth/2;
  const cy=parseInt(wrap.style.top)+wrap.offsetHeight/2;
  wrap.style.width=nw+'px'; wrap.style.height=nw+'px';
  wrap.style.left=Math.round(cx-nw/2)+'px';
  wrap.style.top=Math.round(cy-nw/2)+'px';
}

function tryonCenter(){
  const wrap=document.getElementById('tryon-jewel-wrap');
  const mock=document.getElementById('tryon-mock');
  if(wrap.style.display==='none')return;
  wrap.style.left=Math.round(mock.offsetWidth/2-wrap.offsetWidth/2)+'px';
  wrap.style.top=Math.round(mock.offsetHeight*0.38-wrap.offsetHeight/2)+'px';
}

function tryonOpacity(val){
  const img=document.getElementById('tryon-jewel-img');
  img.style.opacity=val/100;
}

function tryonSave(){
  const mock=document.getElementById('tryon-mock');
  const wrap=document.getElementById('tryon-jewel-wrap');
  if(wrap.style.display==='none')return;
  if(!tryonPhoto&&!cameraStream)return;

  const out=document.createElement('canvas');
  const mw=mock.offsetWidth, mh=mock.offsetHeight;
  out.width=mw*2; out.height=mh*2;
  const ctx=out.getContext('2d');

  if(cameraStream){
    const video=document.getElementById('tryon-video');
    // Mirror to match what user sees
    ctx.save();ctx.scale(-1,1);
    ctx.drawImage(video,-out.width,0,out.width,out.height);
    ctx.restore();
  } else {
    ctx.drawImage(tryonPhoto,0,0,out.width,out.height);
  }

  const jimg=document.getElementById('tryon-jewel-img');
  const jx=parseInt(wrap.style.left)*2;
  const jy=parseInt(wrap.style.top)*2;
  const jw=wrap.offsetWidth*2;
  const jh=wrap.offsetHeight*2;
  ctx.globalAlpha=parseFloat(jimg.style.opacity||1);
  ctx.drawImage(jimg,jx,jy,jw,jh);
  ctx.globalAlpha=1;

  const a=document.createElement('a');
  a.download='amberra-tryon.jpg';
  out.toBlob(blob=>{
    a.href=URL.createObjectURL(blob);
    a.click();
  },'image/jpeg',0.92);
}

function tryonReset(){
  tryonPhoto=null;
  if(cameraStream){cameraStream.getTracks().forEach(t=>t.stop());cameraStream=null;}
  const video=document.getElementById('tryon-video');
  video.style.display='none';video.srcObject=null;
  document.getElementById('tryon-canvas').style.display='none';
  document.getElementById('tryon-empty').style.display='flex';
  document.getElementById('tryon-jewel-wrap').style.display='none';
  document.getElementById('tryon-controls').style.display='none';
  document.getElementById('tryon-opacity-row').style.display='none';
  const up=document.getElementById('tryon-upload');if(up)up.value='';
  const btn=document.getElementById('tryon-main-btn');
  if(btn){btn.textContent='Start Camera';btn.onclick=initCamera;}
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
    initTryonItems();
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

  // Handle hash-based category (e.g. /shop#rings)
  if(window.location.hash){
    const hash=window.location.hash.replace('#','');
    const validCats=['rings','earrings','pendants','bracelets','chains'];
    if(validCats.includes(hash)){
      activeFilter=hash;
    }
  }
});
