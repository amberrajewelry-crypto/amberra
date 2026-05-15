// ═══════════════════════════════════════════════════════════════════════════
// AMBERRA — Shared App JS (app.js)
// Used on every page: nav, translations, cart, wishlist, modals, chat, cookie
// ═══════════════════════════════════════════════════════════════════════════

// ── ACCOUNT MODAL ─────────────────────────────────────────────────────────
function openAcc(){
  document.getElementById('acc-modal').classList.add('open');
  const sb=window.innerWidth-document.documentElement.clientWidth;
  document.body.style.paddingRight=sb+'px';
  document.body.style.overflow='hidden';
}
function closeAcc(){
  document.getElementById('acc-modal').classList.remove('open');
  document.body.style.overflow='';
  document.body.style.paddingRight='';
}
function switchTab(tab){
  document.getElementById('acc-login').style.display=tab==='login'?'block':'none';
  document.getElementById('acc-register').style.display=tab==='register'?'block':'none';
  document.querySelectorAll('.acc-tab').forEach((t,i)=>t.classList.toggle('act',(tab==='login'&&i===0)||(tab==='register'&&i===1)));
}
function submitAcc(){
  document.getElementById('acc-login').style.display='none';
  document.getElementById('acc-register').style.display='none';
  document.getElementById('acc-thanks').style.display='block';
  setTimeout(closeAcc,2500);
}

// ── FLY TO CART ANIMATION ──────────────────────────────────────────────────
function flyToCart(imgSrc,startEl){
  const cartBtn=document.getElementById('cart-badge');
  if(!cartBtn)return;
  const from=startEl.getBoundingClientRect();
  const to=cartBtn.getBoundingClientRect();
  const img=document.createElement('img');
  img.className='fly-img';
  img.src=imgSrc;
  img.style.left=from.left+'px';
  img.style.top=from.top+'px';
  document.body.appendChild(img);
  const dx=to.left-from.left;
  const dy=to.top-from.top;
  img.animate([
    {transform:'translate(0,0) scale(1)',opacity:1},
    {transform:`translate(${dx}px,${dy}px) scale(.15)`,opacity:0}
  ],{duration:700,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'})
  .onfinish=()=>img.remove();
}

// ── WISHLIST ───────────────────────────────────────────────────────────────
// Load from URL param ?wish=1,2,3 (cross-device sharing)
(function(){const p=new URLSearchParams(location.search).get('wish');if(p){const ids=p.split(',').map(Number).filter(Boolean);if(ids.length){localStorage.setItem('amb_wish',JSON.stringify(ids));history.replaceState(null,'',location.pathname)}}})();
let wishlist=JSON.parse(localStorage.getItem('amb_wish')||'[]');
function isWished(id){return wishlist.includes(id)}
function toggleWish(id,e){
  e&&e.stopPropagation();
  if(isWished(id)){wishlist=wishlist.filter(x=>x!==id)}else{wishlist.push(id)}
  localStorage.setItem('amb_wish',JSON.stringify(wishlist));
  updateWishBadge();
  updateMobBadges();
  document.querySelectorAll(`.pc-wish[data-id="${id}"]`).forEach(b=>{
    b.classList.toggle('on',isWished(id));
  });
}
function updateWishBadge(){
  const b=document.getElementById('wish-badge');
  if(!b)return;
  b.textContent=wishlist.length;
  b.classList.toggle('show',wishlist.length>0);
}
let showingWishlist=false;
function toggleWishView(){openWishPanel();}
function renderWishlist(){
  const body=document.getElementById('wish-body');
  if(!body)return;
  const list=(typeof products!=='undefined'?products:[]).filter(p=>wishlist.includes(p.id));
  if(!list.length){
    body.innerHTML='<div class="cart-empty">YOUR WISHLIST IS EMPTY</div>';
    return;
  }
  const shareUrl=location.origin+'/shop?wish='+wishlist.join(',');
  body.innerHTML=`<button class="wish-share-btn" onclick="navigator.clipboard.writeText('${shareUrl}').then(()=>{this.textContent='Link copied ✦';setTimeout(()=>this.textContent='Share Wishlist',2000)})">Share Wishlist</button>`+list.map(p=>`
    <div class="wish-item" onclick="closeWishPanel();if(typeof openDrawer==='function')openDrawer(${p.id})">
      <img src="${p.img}" alt="${p.name}">
      <div class="wish-item-info">
        <div class="wish-item-name">${p.name}</div>
        <div class="wish-item-mat">${p.material||p.cat}</div>
        <div class="wish-item-bot">
          <span class="wish-item-price">${window.formatPrice?window.formatPrice(p.price):'$'+p.price}</span>
          <button class="wish-item-rm" onclick="event.stopPropagation();toggleWish(${p.id},event);renderWishlist()" title="Remove">
            <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill="var(--amber)" stroke="var(--amber)"/></svg>
          </button>
        </div>
        <button class="wish-add-cart" onclick="event.stopPropagation();addToCart(${p.id})">Add to Cart</button>
      </div>
    </div>`).join('');
}
function openWishPanel(){
  renderWishlist();
  document.getElementById('wish-drop').classList.add('open');
  document.getElementById('wish-panel').classList.add('open');
  document.getElementById('nav-shell').classList.add('nav-hidden');
  const sb=window.innerWidth-document.documentElement.clientWidth;
  document.body.style.paddingRight=sb+'px';
  document.body.style.overflow='hidden';
}
function closeWishPanel(){
  document.getElementById('wish-drop').classList.remove('open');
  document.getElementById('wish-panel').classList.remove('open');
  document.getElementById('nav-shell').classList.remove('nav-hidden');
  document.body.style.overflow='';
  document.body.style.paddingRight='';
}

// ── CART ───────────────────────────────────────────────────────────────────
let cart=JSON.parse(localStorage.getItem('amb_cart')||'[]');
let drawerProductId=null;
function isInCart(id){return cart.some(x=>x.id===id)}
function addToCart(id){
  const p=(typeof products!=='undefined'?products:[]).find(x=>x.id===id);
  if(!p)return;
  const existing=cart.find(x=>x.id===id);
  if(existing){existing.qty=(existing.qty||1)+1;}
  else{cart.push({id:p.id,name:p.name,img:p.img,material:p.material,price:p.price,qty:1});}
  localStorage.setItem('amb_cart',JSON.stringify(cart));
  updateCartBadge();
  updateMobBadges();
}
function addToCartFromDrawer(){
  if(!drawerProductId)return;
  addToCart(drawerProductId);
  const btn=document.getElementById('d-cart');
  if(btn){
    const item=cart.find(x=>x.id===drawerProductId);
    const qty=item?item.qty:1;
    btn.textContent=qty>1?`In Cart (${qty})`:'Added ✓';
    btn.classList.add('in-cart');
    btn.disabled=false;
  }
  const dimg=document.getElementById('d-img');
  if(dimg)flyToCart(dimg.src,dimg);
}
function changeQty(id,delta){
  const item=cart.find(x=>x.id===id);
  if(!item)return;
  item.qty=(item.qty||1)+delta;
  if(item.qty<1){cart=cart.filter(x=>x.id!==id);}
  localStorage.setItem('amb_cart',JSON.stringify(cart));
  updateCartBadge();
  updateMobBadges();
  renderCart();
}
function removeFromCart(id){
  cart=cart.filter(x=>x.id!==id);
  localStorage.setItem('amb_cart',JSON.stringify(cart));
  updateCartBadge();
  updateMobBadges();
  renderCart();
}
function updateCartBadge(){
  const b=document.getElementById('cart-badge');
  if(!b)return;
  const total=cart.reduce((s,x)=>s+(x.qty||1),0);
  b.textContent=total;
  b.classList.toggle('show',total>0);
}
function openCart(){
  renderCart();
  document.getElementById('cart-drop').classList.add('open');
  document.getElementById('cart-panel').classList.add('open');
  document.getElementById('nav-shell').classList.add('nav-hidden');
  const sb=window.innerWidth-document.documentElement.clientWidth;
  document.body.style.paddingRight=sb+'px';
  document.body.style.overflow='hidden';
}
function closeCart(){
  document.getElementById('cart-drop').classList.remove('open');
  document.getElementById('cart-panel').classList.remove('open');
  document.getElementById('nav-shell').classList.remove('nav-hidden');
  document.body.style.overflow='';
  document.body.style.paddingRight='';
}
function renderCart(){
  const body=document.getElementById('cart-body');
  const foot=document.getElementById('cart-foot');
  if(!cart.length){
    body.innerHTML='<div class="cart-empty">YOUR CART IS EMPTY</div>';
    foot.style.display='none';
    return;
  }
  body.innerHTML=cart.map(p=>`
    <div class="cart-item">
      <img src="${p.img}" alt="${p.name}">
      <div class="cart-item-info">
        <div class="cart-item-name">${p.name}</div>
        <div class="cart-item-mat">${p.material}</div>
        <div class="cart-item-bot">
          <span class="cart-item-price">${window.formatPrice?window.formatPrice(p.price*(p.qty||1)):'$'+(p.price*(p.qty||1))}</span>
          <div class="cart-qty">
            <button class="cart-qty-btn" onclick="changeQty(${p.id},-1)">−</button>
            <span class="cart-qty-num">${p.qty||1}</span>
            <button class="cart-qty-btn" onclick="changeQty(${p.id},1)">+</button>
            <button class="cart-item-rm" onclick="removeFromCart(${p.id})">✕</button>
          </div>
        </div>
      </div>
    </div>`).join('');
  const total=cart.reduce((s,p)=>s+(p.price*(p.qty||1)),0);
  document.getElementById('cart-total').textContent=window.formatPrice?window.formatPrice(total):'$'+total;
  foot.style.display='block';
}
function checkoutCart(){
  const names=cart.map(p=>p.name).join(', ');
  closeCart();
  openReq(names);
}
window.cartWiseClick=function(){
  const total=document.getElementById('cart-total');
  const raw=(total?total.textContent:'').replace(/[^0-9.]/g,'');
  const amt=parseFloat(raw)||0;
  const display=document.getElementById('wise-amount-display');
  if(display)display.textContent='$'+amt.toFixed(2);
  const openBtn=document.getElementById('wise-open-btn');
  if(openBtn)openBtn.href='https://wise.com/pay/business/amberra'+(amt?'?amount='+amt+'&currency=USD&description=AMBERRA+Jewelry+Order':'');
  const drop=document.getElementById('wise-modal-drop');
  if(drop)drop.style.display='flex';
};
window.closeWiseModal=function(){
  const drop=document.getElementById('wise-modal-drop');
  if(drop)drop.style.display='none';
};
window.copyWiseAmount=function(btn){
  const display=document.getElementById('wise-amount-display');
  const amt=(display?display.textContent:'').replace(/[^0-9.]/g,'');
  navigator.clipboard.writeText(amt).then(function(){
    btn.textContent='Copied ✓';
    setTimeout(function(){btn.textContent='Copy Amount';},2000);
  });
};
window.openCryptoDisclaimer=function(){
  var cb=document.getElementById('crypto-disc-cb');
  var conf=document.getElementById('crypto-disc-confirm');
  if(cb)cb.checked=false;
  if(conf)conf.disabled=true;
  var drop=document.getElementById('crypto-disclaimer-drop');
  if(drop){drop.style.display='flex';}
};
window.closeCryptoDisclaimer=function(){
  var drop=document.getElementById('crypto-disclaimer-drop');
  if(drop){drop.style.display='none';}
};
async function payCrypto(btn){
  const c=JSON.parse(localStorage.getItem('amb_cart')||'[]');
  const amount=c.reduce((s,p)=>s+(Number(p.price)*(p.qty||1)),0)||1;
  const desc=c.length?c.map(p=>p.name).join(', '):'AMBERRA Jewelry';
  btn.disabled=true;
  btn.innerHTML='CREATING INVOICE…';
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),12000);
  try{
    const r=await fetch('/api/create-payment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount,description:desc,orderId:'AMBERRA-'+Date.now()}),signal:controller.signal});
    clearTimeout(timer);
    const data=await r.json();
    if(data.invoiceUrl){window.location.href=data.invoiceUrl;}
    else throw new Error(data.error||'Failed');
  }catch(e){
    clearTimeout(timer);
    btn.disabled=false;
    btn.innerHTML='&#8383; Pay with Crypto';
    alert(e.name==='AbortError'?'Request timed out. Please try again.':'Payment error: '+e.message);
  }
}

// ── WHOLESALE ──────────────────────────────────────────────────────────────
function openWholesale(){
  document.getElementById('ws-modal-wrap').classList.add('open');
  const sb=window.innerWidth-document.documentElement.clientWidth;
  document.body.style.paddingRight=sb+'px';
  document.body.style.overflow='hidden';
}
function closeWholesale(){
  document.getElementById('ws-modal-wrap').classList.remove('open');
  document.body.style.overflow='';
  document.body.style.paddingRight='';
}
async function submitWholesale(){
  const name=document.getElementById('ws-fname').value.trim();
  const email=document.getElementById('ws-email').value.trim();
  const company=document.getElementById('ws-company').value.trim();
  const country=document.getElementById('ws-country').value;
  const partnerType=document.getElementById('ws-type').value;
  const volume=(document.getElementById('ws-volume')||{}).value||'';
  const message=(document.getElementById('ws-msg')||{}).value||'';
  if(!name||!email||!company||!country||!partnerType){
    alert('Please fill in all required fields.');return;
  }
  const btn=document.querySelector('#ws-form-wrap .btn-s');
  if(btn){btn.disabled=true;btn.textContent='Sending…';}
  try{
    await fetch('/api/contact',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type:'wholesale',name,email,company,country,partnerType,volume,message})
    });
  }catch(e){}
  document.getElementById('ws-form-wrap').style.display='none';
  document.getElementById('ws-thanks').style.display='block';
}

// ── REQUEST MODAL ──────────────────────────────────────────────────────────
function openReq(piece){
  document.getElementById('f-piece').value=piece||'';
  document.getElementById('req-form').style.display='block';
  document.getElementById('req-ok').style.display='none';
  document.getElementById('req-modal').classList.add('open');
  const sb=window.innerWidth-document.documentElement.clientWidth;
  document.body.style.paddingRight=sb+'px';
  document.body.style.overflow='hidden';
  document.getElementById('nav-shell').classList.add('nav-hidden');
}
function closeReq(){
  document.getElementById('req-modal').classList.remove('open');
  document.getElementById('nav-shell').classList.remove('nav-hidden');
  document.body.style.overflow='';
  document.body.style.paddingRight='';
}
async function submitReq(){
  const piece=document.getElementById('f-piece').value.trim();
  const name=document.getElementById('f-name').value.trim();
  const email=document.getElementById('f-email').value.trim();
  const phone=document.getElementById('f-phone').value.trim();
  const message=document.getElementById('f-msg').value.trim();
  if(!name||!email){alert('Please fill in your name and email.');return}
  const btn=document.querySelector('#req-form .btn-s');
  if(btn){btn.disabled=true;btn.textContent='Sending…';}
  try{
    await fetch('/api/contact',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type:'request',piece,name,email,phone,message})
    });
  }catch(e){}
  document.getElementById('req-form').style.display='none';
  document.getElementById('req-ok').style.display='block';
  setTimeout(closeReq,4000);
}

// ── SERVICES MODAL ─────────────────────────────────────────────────────────
function openSrv(){
  const sb=window.innerWidth-document.documentElement.clientWidth;
  document.body.style.paddingRight=sb+'px';
  document.body.style.overflow='hidden';
  document.getElementById('nav-shell').classList.add('nav-hidden');
  const modal=document.getElementById('srv-modal');
  modal.querySelectorAll('.srv-card').forEach(c=>{c.style.animation='none';c.offsetHeight;c.style.animation='';});
  modal.classList.add('open');
}
function closeSrv(){
  document.getElementById('srv-modal').classList.remove('open');
  document.getElementById('nav-shell').classList.remove('nav-hidden');
  document.body.style.overflow='';
  document.body.style.paddingRight='';
  const sg=document.getElementById('size-guide');
  if(sg) sg.classList.remove('open');
}
// ── SERVICE DETAIL PANEL ─────────────────────────────────────────────────────
const SVC={
consultation:{title:'Book a Consultation',body:`
<div class="sg-section">
<div class="sg-section-title">Your Personal Jewellery Appointment</div>
<p class="sg-intro">Every great piece of jewellery begins with a conversation. Our specialists in Bali are available for private one-on-one consultations — by WhatsApp, video call, or in our Ubud atelier.</p>
<div class="sg-method">
<div class="sg-method-step"><span class="sg-method-num">01</span><div class="sg-method-text"><b>Choose Your Format</b>WhatsApp consultation (instant) · Video call via Zoom or FaceTime · In-person visit to our Ubud studio by appointment. All consultations are complimentary and carry no obligation.</div></div>
<div class="sg-method-step"><span class="sg-method-num">02</span><div class="sg-method-text"><b>What to Expect</b>Share your occasion, style references, and budget. Our specialist will guide you through the collection, recommend pieces that suit your proportions and skin tone, and explain the story behind each amber stone.</div></div>
<div class="sg-method-step"><span class="sg-method-num">03</span><div class="sg-method-text"><b>After Your Consultation</b>We will send you a curated selection with high-resolution images and pricing. Reserved pieces are held for 48 hours. Full bespoke proposals are available within 5–7 business days.</div></div>
<div class="sg-method-step"><span class="sg-method-num">04</span><div class="sg-method-text"><b>Book Now</b>Contact us on WhatsApp at +62 878 5386 7120 or email <a href="mailto:hello@amberrajewelry.com" style="color:var(--amber)">hello@amberrajewelry.com</a>. We respond within 4 hours during Bali business hours (08:00–20:00 WITA).</div></div>
</div>
<div class="sg-warranty-box" style="margin-top:32px">
<div class="sg-warranty-seal" style="background:var(--cream);border:1px solid var(--mist)"><svg viewBox="0 0 24 24" stroke="var(--amber)" fill="none" stroke-width="1.2"><path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z"/><path d="M16 2v4M8 2v4M2 10h20"/></svg></div>
<div class="sg-warranty-body"><h4>COMPLIMENTARY SERVICE</h4><p>All consultations at AMBERRA are free of charge, regardless of format. Our philosophy is that exceptional service begins before the purchase — and continues long after.</p></div>
</div>
</div>`},

giftwrap:{title:'Gift Wrapping',body:`
<div class="sg-section">
<div class="sg-section-title">The Art of the Gift</div>
<p class="sg-intro">Every AMBERRA piece is presented in our signature packaging — handcrafted in Bali using materials that honour the natural world from which amber itself comes.</p>
<div class="sg-method">
<div class="sg-method-step"><span class="sg-method-num">01</span><div class="sg-method-text"><b>Signature AMBERRA Box</b>Matte black rigid box with gold foil stamping. Interior lined with cream-coloured velvet. Each box is sealed with our amber-toned wax stamp — a ritual in itself.</div></div>
<div class="sg-method-step"><span class="sg-method-num">02</span><div class="sg-method-text"><b>Luxury Ribbon & Tissue</b>Hand-tied satin ribbon in ivory or deep charcoal. Acid-free tissue paper with the AMBERRA emblem. All packaging is recyclable and plastic-free.</div></div>
<div class="sg-method-step"><span class="sg-method-num">03</span><div class="sg-method-text"><b>Personalised Message Card</b>Include a handwritten message on our cream-laid card stock — engraved with the AMBERRA monogram. Available in English, Russian, Arabic, Indonesian, and French. No extra charge.</div></div>
<div class="sg-method-step"><span class="sg-method-num">04</span><div class="sg-method-text"><b>Bali Gift Set Upgrade</b>Add a hand-painted batik pouch, artisan incense from Ubud, and a small raw amber specimen for $28. A gift that carries the spirit of Bali.</div></div>
</div>
<p class="sg-note">Gift wrapping is complimentary on all orders. Upgrade options available at checkout. For corporate gifting (10+ pieces), contact our team directly for bespoke solutions.</p>
</div>`},

size:{title:'Size Guide',body:`
<div class="sg-section">
<div class="sg-section-title">Ring Size Guide</div>
<p class="sg-intro">Our rings are crafted in Bali to international sizing standards. If you are between sizes, we recommend sizing up. For wide-band rings, consider one half-size larger.</p>
<div class="sg-method">
<div class="sg-method-step"><span class="sg-method-num">01</span><div class="sg-method-text"><b>String Method</b>Wrap a strip of paper or thin string around the base of your finger. Mark where it overlaps and measure the length in millimetres. Use the table below to find your size.</div></div>
<div class="sg-method-step"><span class="sg-method-num">02</span><div class="sg-method-text"><b>Existing Ring Method</b>Place a ring you already wear flat on a ruler. Measure the inner diameter in millimetres (across the widest inner point). Match to the diameter column below.</div></div>
</div>
<table class="sg-table">
<thead><tr><th>Inner Ø mm</th><th>Circumference mm</th><th>US / CA</th><th>EU / RU</th><th>UK</th><th>FR / IT</th><th>JP</th></tr></thead>
<tbody>
<tr><td>14.1</td><td>44.2</td><td>3</td><td>44</td><td>F</td><td>44</td><td>4</td></tr>
<tr><td>14.9</td><td>46.8</td><td>4</td><td>47</td><td>H</td><td>47</td><td>7</td></tr>
<tr><td>15.3</td><td>48.0</td><td>4½</td><td>48</td><td>I½</td><td>48</td><td>8</td></tr>
<tr><td>15.7</td><td>49.3</td><td>5</td><td>49</td><td>J½</td><td>49</td><td>9</td></tr>
<tr><td>16.1</td><td>50.6</td><td>5½</td><td>51</td><td>K½</td><td>51</td><td>10</td></tr>
<tr class="sg-highlight"><td>16.5</td><td>51.9</td><td>6</td><td>52</td><td>L½</td><td>52</td><td>12</td></tr>
<tr class="sg-highlight"><td>16.9</td><td>53.2</td><td>6½</td><td>53</td><td>M½</td><td>53</td><td>13</td></tr>
<tr class="sg-highlight"><td>17.3</td><td>54.4</td><td>7</td><td>55</td><td>N½</td><td>55</td><td>14</td></tr>
<tr class="sg-highlight"><td>17.7</td><td>55.7</td><td>7½</td><td>56</td><td>O</td><td>56</td><td>15</td></tr>
<tr class="sg-highlight"><td>18.1</td><td>57.0</td><td>8</td><td>57</td><td>P½</td><td>57</td><td>16</td></tr>
<tr><td>18.5</td><td>58.3</td><td>8½</td><td>59</td><td>Q</td><td>59</td><td>17</td></tr>
<tr><td>19.0</td><td>59.5</td><td>9</td><td>60</td><td>R½</td><td>60</td><td>18</td></tr>
<tr><td>19.4</td><td>61.0</td><td>9½</td><td>61</td><td>S</td><td>61</td><td>20</td></tr>
<tr><td>19.8</td><td>62.1</td><td>10</td><td>62</td><td>T½</td><td>62</td><td>22</td></tr>
</tbody></table>
<p class="sg-note">Highlighted rows (US 6–8) are our most requested sizes and are available from stock. Other sizes are made to order — allow 7–10 extra days. Measure in the evening when fingers are slightly larger. Knuckles larger than the finger base? Size up.</p>
</div>
<div class="sg-section">
<div class="sg-section-title">Bracelet Size Guide</div>
<p class="sg-intro">Measure your wrist with a soft tape measure or a strip of paper, keeping it snug but not tight. Add the preferred ease (loose or close fit) to find your bracelet length.</p>
<table class="sg-table">
<thead><tr><th>Size</th><th>Wrist Circumference</th><th>Bracelet Length</th><th>Fit Style</th><th>Best For</th></tr></thead>
<tbody>
<tr><td>XS</td><td>13–14 cm</td><td>15 cm</td><td>Snug · close to skin</td><td>Delicate chain styles</td></tr>
<tr><td>S</td><td>14–15 cm</td><td>16 cm</td><td>Fitted · slight movement</td><td>Beaded &amp; link bracelets</td></tr>
<tr class="sg-highlight"><td>M</td><td>15–16.5 cm</td><td>17 cm</td><td>Classic · relaxed drape</td><td>All bracelet styles</td></tr>
<tr class="sg-highlight"><td>M/L</td><td>16–17 cm</td><td>18 cm</td><td>Comfortable · natural hang</td><td>Chunky &amp; statement</td></tr>
<tr><td>L</td><td>17–18 cm</td><td>19 cm</td><td>Relaxed · generous</td><td>Layering looks</td></tr>
<tr><td>XL</td><td>18+ cm</td><td>20 cm</td><td>Loose · stacked</td><td>Multiple bangles</td></tr>
</tbody></table>
<p class="sg-note">Most AMBERRA bracelets come with a 3-link extender (adds up to 1.5 cm). If your wrist measurement falls between two sizes, choose the larger. Custom lengths are available at no extra charge — contact us on WhatsApp.</p>
</div>
<div class="sg-section">
<div class="sg-section-title">Necklace &amp; Chain Length Guide</div>
<p class="sg-intro">Chain length determines where a pendant falls on the body. Below are the standard positions used by all major jewellery houses, including where our pieces naturally sit.</p>
<table class="sg-table">
<thead><tr><th>Length</th><th>Style Name</th><th>Sits At</th><th>Best Worn With</th></tr></thead>
<tbody>
<tr><td>35–38 cm</td><td>Choker</td><td>Base of neck</td><td>Open necklines, strapless, evening</td></tr>
<tr class="sg-highlight"><td>40–42 cm</td><td>Collarbone</td><td>Collarbone</td><td>V-necks, everyday wear — our default length</td></tr>
<tr class="sg-highlight"><td>45 cm</td><td>Princess</td><td>Just below collarbone</td><td>Crew necks, casual &amp; professional</td></tr>
<tr><td>50 cm</td><td>Matinée</td><td>Upper chest</td><td>High necks, layering over blouse</td></tr>
<tr><td>55–60 cm</td><td>Opera</td><td>Bust line</td><td>Long pendants, evening gowns, layering</td></tr>
<tr><td>70+ cm</td><td>Rope / Lariat</td><td>Below bust</td><td>Can be doubled or knotted</td></tr>
</tbody></table>
<p class="sg-note">All AMBERRA pendant chains are 45 cm as standard. Alternative lengths (40 cm, 50 cm, 60 cm) are available. Chain thickness: 1.2 mm fine chain · 1.8 mm standard · 2.4 mm statement. Specify at checkout or via WhatsApp.</p>
</div>
<div class="sg-section">
<div class="sg-section-title">Earring Guide</div>
<p class="sg-intro">Our earrings are designed to complement different face shapes and ear types. All posts are standard 0.8 mm diameter and fit universal ear piercing gauges.</p>
<div class="sg-care-grid">
<div class="sg-care-item"><span class="sg-care-icon">◎</span><span class="sg-care-title">Stud Earrings</span><p class="sg-care-text">Diameter: 6–14 mm. Post length: 10 mm. Butterfly closure. Suitable for first and second piercings. Our amber studs range from 8 mm (everyday) to 12 mm (statement).</p></div>
<div class="sg-care-item"><span class="sg-care-icon">◡</span><span class="sg-care-title">Drop &amp; Dangle</span><p class="sg-care-text">Total length from lobe: 2–5 cm. Hook wire gauge: 0.7 mm. All hooks are nickel-free 925 silver. Lever-back option available on request for added security.</p></div>
<div class="sg-care-item"><span class="sg-care-icon">○</span><span class="sg-care-title">Hoop Earrings</span><p class="sg-care-text">Inner diameter: 15–40 mm. Wire thickness: 1 mm. Hinged closure for easy wear. Our amber hoop collection uses 20 mm (small), 30 mm (medium), and 40 mm (large) inner diameter.</p></div>
<div class="sg-care-item"><span class="sg-care-icon">✦</span><span class="sg-care-title">Clip-On Option</span><p class="sg-care-text">Available on select styles for non-pierced ears. Adjustable tension clip with silicone comfort pad. Suitable for 2–3 hours of continuous wear. Add to any order note or contact us.</p></div>
<div class="sg-care-item"><span class="sg-care-icon">◈</span><span class="sg-care-title">Face Shape Guide</span><p class="sg-care-text">Round face → long drops and angular shapes. Oval face → any style. Square face → soft curves and hoops. Heart face → wider at the bottom (teardrops). Oblong face → short drops and studs.</p></div>
<div class="sg-care-item"><span class="sg-care-icon">◇</span><span class="sg-care-title">Hypoallergenic</span><p class="sg-care-text">All AMBERRA earring posts and wires are 925 sterling silver — hypoallergenic and nickel-free. Gold vermeil options (18k gold over silver) are available across the collection.</p></div>
</div>
</div>`},

care:{title:'Care & Warranty',body:`
<div class="sg-section">
<div class="sg-section-title">Caring for Your Amber</div>
<p class="sg-intro">Baltic amber is an organic gemstone formed over 40 million years. It is warm, light, and alive — and with the right attention, it will remain luminous for generations.</p>
<div class="sg-care-grid">
<div class="sg-care-item"><span class="sg-care-icon">✦</span><span class="sg-care-title">Daily Wear</span><p class="sg-care-text">Remove before swimming, bathing, exercising, or using cleaning products. Apply perfume, hairspray, and lotions before putting on your jewellery — not after. Amber absorbs chemicals.</p></div>
<div class="sg-care-item"><span class="sg-care-icon">◌</span><span class="sg-care-title">Cleaning</span><p class="sg-care-text">Wipe gently with a soft, slightly damp cloth. Dry immediately with a dry cloth. For deeper cleaning: lukewarm water + a drop of pH-neutral soap, then rinse and dry thoroughly. No ultrasonic cleaners. No steam.</p></div>
<div class="sg-care-item"><span class="sg-care-icon">◇</span><span class="sg-care-title">Storage</span><p class="sg-care-text">Store in the provided velvet-lined AMBERRA pouch or box. Keep away from direct sunlight, heat sources, and humidity. Store pieces separately to prevent scratching. Amber's Mohs hardness is 2–2.5 — it scratches easily.</p></div>
<div class="sg-care-item"><span class="sg-care-icon">○</span><span class="sg-care-title">Sterling Silver</span><p class="sg-care-text">Silver naturally oxidises — this is not a defect but a characteristic. Polish gently with a silver polishing cloth (never paper tissue). Avoid chlorine, bleach, rubber bands, and latex gloves, which accelerate tarnish.</p></div>
<div class="sg-care-item"><span class="sg-care-icon">◈</span><span class="sg-care-title">Gold Vermeil</span><p class="sg-care-text">18k gold plated over 925 sterling silver (2.5 microns minimum). Wipe with a dry, soft cloth after each wear. Avoid prolonged water exposure. Do not use abrasive polishes. Gold vermeil will gradually reveal the silver base with heavy daily wear — this is natural.</p></div>
<div class="sg-care-item"><span class="sg-care-icon">✧</span><span class="sg-care-title">Restoring Amber</span><p class="sg-care-text">If your amber has lost its lustre, apply one small drop of food-grade olive oil to a soft cloth and buff gently in circular motions. Wipe off any excess. Never use acetone, alcohol, or commercial jewellery dips on amber — they will permanently cloud the surface.</p></div>
</div>
</div>
<div class="sg-section">
<div class="sg-section-title">1-Year Limited Warranty</div>
<div class="sg-warranty-box">
<div class="sg-warranty-seal"><svg viewBox="0 0 24 24"><path d="M12 2l2.4 4.8L20 8l-4 4 .9 5.5L12 15l-4.9 2.5L8 12 4 8l5.6-1.2L12 2z" stroke="#fff" stroke-width="1.2" fill="none"/></svg></div>
<div class="sg-warranty-body">
<h4>AMBERRA LIMITED WARRANTY — 12 MONTHS</h4>
<p>Every AMBERRA piece is covered by a <strong>12-month limited warranty</strong> from the date of purchase. We stand behind the integrity of every amber stone and the skill of every Balinese craftsman we work with.</p>
<p><strong>Covered under warranty:</strong></p>
<ul>
<li>Manufacturing defects in clasps, settings, and closures</li>
<li>Stone loss caused by a defective setting (not by impact, force, or misuse)</li>
<li>Premature and abnormal discolouration of sterling silver components</li>
<li>Separation of gold vermeil in less than 6 months of normal use</li>
<li>One complimentary professional inspection and clean within the warranty period</li>
</ul>
<p><strong>Not covered:</strong> normal wear and ageing, scratches, dents, accidental damage, loss or theft, chemical damage, or modifications made by third parties.</p>
<p>To make a claim: email <a href="mailto:hello@amberrajewelry.com" style="color:var(--amber)">hello@amberrajewelry.com</a> with your order number and clear photographs of the item and defect. We will respond within 48 hours with a resolution — repair, replacement, or credit.</p>
</div>
</div>
</div>`},

custom:{title:'Custom Orders',body:`
<div class="sg-section">
<div class="sg-section-title">Your Bespoke Piece</div>
<p class="sg-intro">Every amber stone is unique — no two are alike. Our Bali atelier accepts fully bespoke commissions: from a ring made to your exact size and stone preference, to a multi-piece set designed for a special occasion.</p>
<div class="sg-method">
<div class="sg-method-step"><span class="sg-method-num">01</span><div class="sg-method-text"><b>Initial Consultation</b>Share your vision via WhatsApp or email. Reference images, stone colours, metal preferences (sterling silver, gold vermeil, solid 18k), occasion, and budget. No brief is too simple or too ambitious.</div></div>
<div class="sg-method-step"><span class="sg-method-num">02</span><div class="sg-method-text"><b>Stone Selection</b>We will present 3–5 amber specimens matching your specifications — photographed on white and on skin. You select the stone you feel drawn to. This is your piece, beginning with your choice.</div></div>
<div class="sg-method-step"><span class="sg-method-num">03</span><div class="sg-method-text"><b>Design Proposal</b>Our artisan prepares a hand-drawn sketch and, for complex pieces, a 3D render. You review and approve before any metal is touched. One round of revisions is included at no extra cost.</div></div>
<div class="sg-method-step"><span class="sg-method-num">04</span><div class="sg-method-text"><b>Crafting in Bali</b>Your piece is made by hand in our Ubud workshop. Standard completion: 2–3 weeks. Complex or engraved pieces: 4–5 weeks. You will receive progress photographs at each stage.</div></div>
<div class="sg-method-step"><span class="sg-method-num">05</span><div class="sg-method-text"><b>Delivery &amp; Ceremony</b>Shipped in our signature box with a personalised certificate of authenticity. Each custom piece is individually blessed in the Balinese tradition before it leaves the atelier.</div></div>
</div>
<div class="sg-warranty-box" style="margin-top:32px">
<div class="sg-warranty-seal" style="background:var(--cream);border:1px solid var(--mist)"><svg viewBox="0 0 24 24" stroke="var(--amber)" fill="none" stroke-width="1.2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
<div class="sg-warranty-body"><h4>PRICING &amp; TIMELINE</h4><p>Custom pieces start from $180 (simple stone reset) to $2,400+ (full bespoke with solid gold). A 50% deposit is required to begin. The balance is due on approval of the finished piece photograph, before shipping.</p><p>Engraving (Latin script, Arabic, Balinese script) is available on most metal surfaces for $25–$45 depending on complexity.</p></div>
</div>
</div>`},

tryon:{title:'Virtual Try On',body:`
<div class="sg-section">
<div class="sg-section-title">Try Before You Buy</div>
<p class="sg-intro">Our Virtual Try On feature lets you see any AMBERRA piece on your own photo — before you commit. Powered by our augmented reality overlay system, available directly in the browser.</p>
<div class="sg-method">
<div class="sg-method-step"><span class="sg-method-num">01</span><div class="sg-method-text"><b>Upload Your Photo</b>Go to the Try On section on our Shop page. Upload a clear front-facing photo (good lighting, neutral background works best). Your photo is processed locally — it is never stored on our servers.</div></div>
<div class="sg-method-step"><span class="sg-method-num">02</span><div class="sg-method-text"><b>Select a Piece</b>Browse rings, earrings, pendants, and bracelets. Tap any piece to overlay it on your photo. The system automatically positions earrings at the ear, rings on the finger, and pendants at the collarbone.</div></div>
<div class="sg-method-step"><span class="sg-method-num">03</span><div class="sg-method-text"><b>Adjust &amp; Compare</b>Drag to reposition. Use pinch-to-zoom to scale. Compare up to three pieces side by side. Save your look as an image to share with friends or revisit later.</div></div>
<div class="sg-method-step"><span class="sg-method-num">04</span><div class="sg-method-text"><b>Order with Confidence</b>Once you have found your piece, add it directly to your cart from the Try On view. Not sure? Save it to your Wishlist or send us the image on WhatsApp for a personal stylist opinion.</div></div>
</div>
<p class="sg-note">Best results on desktop or tablet. Works on all modern browsers without installation. For the most accurate colour rendering, use natural daylight when taking your source photo. Camera live mode coming soon.</p>
</div>`},

blessing:{title:'The Bali Blessing',body:`
<div class="sg-section">
<div class="sg-section-title">A Sacred Ritual Before Every Piece Leaves Bali</div>
<p class="sg-intro">In Balinese Hindu tradition, objects crafted with intention carry energy — and that energy can be consecrated. Every AMBERRA piece undergoes a blessing ceremony in the Ubud tradition before it is shipped to you.</p>
<div class="sg-method">
<div class="sg-method-step"><span class="sg-method-num">01</span><div class="sg-method-text"><b>The Ceremony</b>Performed by a local Balinese priest (Pemangku) in our atelier courtyard, each piece is laid on a woven offering tray (gebogan) with fresh flowers, incense (dupa), and holy water from the Tirta Empul temple spring in Tampaksiring.</div></div>
<div class="sg-method-step"><span class="sg-method-num">02</span><div class="sg-method-text"><b>The Intention</b>The ceremony calls for protection, clarity, and alignment for the wearer. In Balinese belief, amber — as a stone of ancient light — amplifies positive intention and shields against disharmony.</div></div>
<div class="sg-method-step"><span class="sg-method-num">03</span><div class="sg-method-text"><b>What You Receive</b>Your piece arrives with a small card describing the blessing, the date it was performed, and the name of the priest. A dried frangipani petal from the ceremony is enclosed in a wax-sealed envelope.</div></div>
<div class="sg-method-step"><span class="sg-method-num">04</span><div class="sg-method-text"><b>Wearing Your Blessed Piece</b>Balinese tradition suggests wearing a newly blessed piece for the first time on an auspicious day. We include a short guide with your order on Balinese calendar days most aligned with new beginnings.</div></div>
</div>
<div class="sg-warranty-box" style="margin-top:32px">
<div class="sg-warranty-seal" style="background:var(--cream);border:1px solid var(--mist)"><svg viewBox="0 0 24 24" stroke="var(--amber)" fill="none" stroke-width="1.2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg></div>
<div class="sg-warranty-body"><h4>INCLUDED WITH EVERY ORDER</h4><p>The Bali Blessing is not an optional add-on. It is part of what AMBERRA is. Every piece — from a $45 stud to a $2,400 bespoke commission — is blessed with the same care and the same ceremony. This is not marketing. It is our practice.</p></div>
</div>
</div>`},

certificate:{title:'Certificate of Authenticity',body:`
<div class="sg-section">
<div class="sg-section-title">Your Guarantee of Origin &amp; Authenticity</div>
<p class="sg-intro">Every AMBERRA piece is accompanied by a Certificate of Authenticity — a document that records the origin, composition, and individual character of your amber stone and its setting.</p>
<div class="sg-method">
<div class="sg-method-step"><span class="sg-method-num">01</span><div class="sg-method-text"><b>What Is Certified</b>Baltic amber origin (Bali, Indonesia) · Succinic acid content (2–8%) confirming genuine resinite amber · Metal purity (925 sterling silver or 18k gold vermeil) · Stone colour classification and inclusion description.</div></div>
<div class="sg-method-step"><span class="sg-method-num">02</span><div class="sg-method-text"><b>The Physical Certificate</b>Printed on heavyweight 300gsm cream cotton paper. Bears the AMBERRA embossed seal, the artisan's signature, the date of completion, and a unique piece reference number. Presented in a protective archival sleeve.</div></div>
<div class="sg-method-step"><span class="sg-method-num">03</span><div class="sg-method-text"><b>Digital Verification</b>Each certificate includes a QR code linking to your piece's unique digital record — including high-resolution photography, stone provenance documentation, and the Bali Blessing date. Permanently hosted and accessible at any time.</div></div>
<div class="sg-method-step"><span class="sg-method-num">04</span><div class="sg-method-text"><b>Resale &amp; Inheritance Value</b>AMBERRA certificates are transferable. Should your piece be gifted, inherited, or resold, the certificate travels with it. A re-authentication service is available for $35, updating the certificate with a new owner name and date.</div></div>
</div>
<div class="sg-warranty-box" style="margin-top:32px">
<div class="sg-warranty-seal"><svg viewBox="0 0 24 24"><path d="M12 2l2.4 4.8L20 8l-4 4 .9 5.5L12 15l-4.9 2.5L8 12 4 8l5.6-1.2L12 2z" stroke="#fff" stroke-width="1.2" fill="none"/></svg></div>
<div class="sg-warranty-body"><h4>HOW TO IDENTIFY AUTHENTIC AMBERRA</h4><ul><li>Certificate reference number matches the QR code in the digital record</li><li>The amber passes the saltwater float test (genuine amber floats in saturated saltwater)</li><li>Under UV light, natural Baltic amber fluoresces blue-white or blue-green</li><li>Each piece has a unique amber grain — no two are identical. If yours looks mass-produced, contact us.</li></ul><p>Concerned about authenticity? Email us a photograph of your piece and certificate at <a href="mailto:hello@amberrajewelry.com" style="color:var(--amber)">hello@amberrajewelry.com</a>. Verification is always free.</p></div>
</div>
</div>`}
};

function openService(slug){
  const data=SVC[slug];
  if(!data)return;
  const sg=document.getElementById('size-guide');
  if(!sg)return;
  const titleEl=sg.querySelector('.sg-head-title');
  const bodyEl=sg.querySelector('.sg-body');
  if(titleEl)titleEl.textContent=data.title;
  if(bodyEl)bodyEl.innerHTML=data.body;
  sg.classList.add('open');
  sg.scrollTop=0;
}
function openSizeGuide(){openService('size');}
function closeSizeGuide(){
  const sg=document.getElementById('size-guide');
  if(sg) sg.classList.remove('open');
}

// ── SMOOTH SCROLL ──────────────────────────────────────────────────────────
function s(id){const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:'smooth'})}

// ── REVEAL ────────────────────────────────────────────────────────────────
function initReveal(){
  const vph=window.innerHeight;
  const obs=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting)return;
    const el=e.target;
    el.classList.remove('pre');
    el.classList.add('on','vis');
    obs.unobserve(el);
  }),{threshold:0,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal,.rv,.rv-line').forEach(el=>{
    const r=el.getBoundingClientRect();
    if(r.bottom<0||r.top>vph-40){
      if(el.classList.contains('reveal'))el.classList.add('pre');
    }else{
      el.classList.add('on','vis');
      return;
    }
    obs.observe(el);
  });
  // auto-stagger: children of [data-stagger] get sequential delays
  document.querySelectorAll('[data-stagger]').forEach(wrap=>{
    const kids=[...wrap.children].filter(c=>c.classList.contains('rv'));
    kids.forEach((c,i)=>{c.style.transitionDelay=(i*0.1)+'s'});
  });
}

// ── NAV SCROLL ────────────────────────────────────────────────────────────
const HAS_HERO=!!document.getElementById('hero');
const nav=document.getElementById('nav-shell');
// Nav stays transparent always — no solid/color logic needed
// Keep scroll listener minimal for lang dropdown close
window.addEventListener('scroll',()=>{
  closeLang();
},{passive:true});


// ── CANVAS PARTICLES ──────────────────────────────────────────────────────
(function(){try{
  const canvas=document.getElementById('particles-canvas');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  if(!ctx)return;
  let W,H,parts=[];
  function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight}
  resize();window.addEventListener('resize',resize);
  const COLORS=['rgba(201,168,50,','rgba(212,184,74,','rgba(184,148,30,'];
  function Particle(){this.reset(true)}
  Particle.prototype.reset=function(init){
    this.x=Math.random()*W;
    this.y=init?Math.random()*H:Math.random()*H+H;
    this.r=Math.random()*2+.5;
    this.speed=Math.random()*.4+.15;
    this.vx=(Math.random()-.5)*.3;
    this.alpha=Math.random()*.5+.1;
    this.color=COLORS[Math.floor(Math.random()*COLORS.length)];
    this.wobble=Math.random()*Math.PI*2;
    this.wobbleSpeed=Math.random()*.015+.005;
  };
  for(let i=0;i<35;i++)parts.push(new Particle());
  let rafId=null;
  function animate(){
    ctx.clearRect(0,0,W,H);
    parts.forEach(p=>{
      p.y-=p.speed;p.wobble+=p.wobbleSpeed;p.x+=Math.sin(p.wobble)*.4+p.vx;
      if(p.y<-10)p.reset(false);
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=p.color+p.alpha+')';ctx.fill();
    });
    rafId=requestAnimationFrame(animate);
  }
  animate();
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){if(rafId){cancelAnimationFrame(rafId);rafId=null;}}
    else{if(!rafId)animate();}
  });
}catch(e){console.warn('particles error',e)}})();

// ── HERO FADE-IN ─────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded',()=>{
  setTimeout(()=>{
    document.querySelectorAll('.hero-fade').forEach(el=>el.classList.add('on'))
  },200)
});

// ── TRANSLATIONS ──────────────────────────────────────────────────────────
const TR={nav_home:'Home',nav_shop:'Shop All',util_store:'Find a Store',util_services:'Services',util_contact:'Contact Us',util_account:'My Account',util_wishlist:'Wishlist',search_ph:'Search',nav_collections:'Collections',nav_rings:'Rings',nav_earrings:'Earrings',nav_pendants:'Pendants',nav_bracelets:'Bracelets',nav_journal:'Journal',nav_about:'Our Story',nav_tryon:'Try On',nav_wholesale:'Wholesale',hero_tag:'Bali · New Collection 2026',hero_title:'Amber from the <em>Ancient</em> World',hero_desc:'Natural Baltic amber, millions of years in the making. Handcrafted in Bali with sacred intention.',hero_cta:'Explore Collections',hero_cta2:'All Jewelry',tick1:'Natural Baltic Amber',tick2:'Handcrafted in Bali',tick3:'925 Sterling Silver',tick4:'Sacred Ritual Blessing',tick5:'Free Gift Wrapping',coll_lbl:'Our Universe',coll_title:'Collections',coll_all:'View all pieces',cat_rings:'Collection',cat_earrings:'Collection',cat_pendants:'Collection',cat_bracelets:'Collection',cat_chains:'Collection',col_rings:'Rings',col_earrings:'Earrings',col_pendants:'Pendants',col_bracelets:'Bracelets',col_chains:'Chains',nav_chains:'Chains',f_chains:'Chains',discover:'Discover',ed_lbl:'The Craft',ed_title:'Born from <em>Ancient Earth</em>',ed_body1:'Amber is not merely stone — it is time crystallised. Forty million years of forests, insects, light and rain preserved in a single stone.',ed_body2:'Our artisans in Bali spend lifetimes learning to honour it. Every piece passes through water, fire and prayer before it reaches you.',stat1:'Years of amber',stat2:'Unique pieces',stat3:'Countries',tryon_lbl:'New Feature',tryon_title:'Try On<br><em>Before You Buy</em>',tryon_desc:'Upload your photo and see how each AMBERRA piece looks on you.',tryon_cta:'Upload Your Photo',tryon_badge:'AR Try-On',tryon_hint:'Upload photo to begin',quiz_title:'Find My Amber',quiz_sub:'Answer 5 questions — discover your perfect piece',quiz_cta:'Start Quiz',cat_lbl:'The Collection',cat_title:'All Jewelry',f_all:'All',f_rings:'Rings',f_earrings:'Earrings',f_pendants:'Pendants',f_bracelets:'Bracelets',j_lbl:'Insights',j_title:'The Amber <em>Journal</em>',j_all:'View all articles',j1_date:'March 2026',j1_title:'Baltic Amber Healing Properties: The Science of Succinic Acid',j1_body:'Baltic amber contains up to 8% succinic acid — a natural compound studied for its anti-inflammatory and immune-supporting effects when worn against the skin.',j2_date:'February 2026',j2_title:'How to Clean Amber Jewelry: The Complete Care Guide',j2_body:'Natural amber is softer than most gemstones. Warm water, mild soap, and a soft cloth are all you need to keep it radiant for generations. Avoid chemicals and ultrasound cleaners.',j3_date:'January 2026',j3_title:'From Balinese Forests to Bali: The Journey of Every AMBERRA Stone',j3_body:'Forty million years beneath ancient forests, then a world away in the sacred workshops of Ubud — the remarkable story of each Baltic amber stone.',j4_date:'December 2025',j4_title:'How to Tell Real Baltic Amber from Fake: 5 Simple Tests',j4_body:'With replicas flooding the market, knowing how to identify authentic Baltic amber is essential. Salt water, UV light, and the scent test reveal the truth instantly.',j5_date:'November 2025',j5_title:'5 Ways to Style Amber Jewelry This Season',j5_body:'From layered gold chains to minimalist rings, discover how natural amber complements every aesthetic — from Balinese sunsets to city evenings.',j6_date:'October 2025',j6_title:'The Golden Spectrum: Understanding Amber Colors and Their Meaning',j6_body:'From cognac to cherry, green to milky white — every shade of Baltic amber tells a different geological story and carries its own energy signature.',j7_date:'September 2025',j7_title:'Why Baltic Amber Is the World\'s Most Ancient Gemstone',j7_body:'Unlike diamonds or sapphires, Baltic amber is organic — fossilized resin from forests that disappeared 40 million years ago. Its rarity lies not in hardness, but in time.',j8_date:'August 2025',j8_title:'The Ubud Artisans: Hands Behind Every AMBERRA Piece',j8_body:'In the rice-field studios of Ubud, Balinese silversmiths spend years perfecting the art of setting Baltic amber in sacred geometric forms passed down through generations.',j9_date:'July 2025',j9_title:'Amber and Feminine Energy: The Ancient Spiritual Connection',j9_body:'Baltic cultures associated amber with the goddess of the sea. In Bali it is worn for protection, warmth, and the awakening of feminine power.',c_lbl:'Private Appointments',c_title:'Request a Personal Consultation',c_body:'Our team in Bali will personally guide you to the perfect piece.',fc_coll:'Collections',fc_srv:'Services',fc_contact:'Contact',req_btn:'Request This Piece',req_title:'Request a Piece',req_sub:'Tell us which piece caught your eye.',f_piece:'Piece of Interest',f_name:'Your Name',f_email:'Email',f_phone:'WhatsApp (optional)',f_msg:'Message',req_send:'Send Request',req_thanks:'Thank you ✦',req_thanks_sub:'We will be in touch within 24 hours. Warm regards from Bali.',qm_title:'Find My Amber',qm_sub:'5 questions · 2 minutes · Perfect match',q_next:'Next',ep_title:'A Gift from Amberra',ep_sub:'Join our world — receive 10% off your first order',ep_ph:'Your email address',ep_btn:'Claim Offer',ep_note:'No spam, ever. Unsubscribe anytime.',ep_thanks:'✦ Welcome to Amberra ✦',ep_thanks_sub:'Your 10% code is on its way',chat_lbl:'Ask Us Anything',chat_status:'Online · Bali, Indonesia',chat_welcome:"Hello! I'm your personal Amberra guide. How can I help you find the perfect piece today?",cq1:'Ring sizes',cq2:'Shipping info',cq3:'Care guide',cq4:'Gift ideas',chat_ph:'Ask anything...',cont_btn:'Continue Browsing',to_lbl:'Virtual Try‑On',to_title:'Try On at Home',to_body:'Upload your photo and see how our jewelry looks on you.',to_cam_btn:'Start Camera',to_choose:'Choose a Piece',to_save:'Save Look',to_reset:'Reset',
fd:'Natural Baltic amber jewelry,<br>handcrafted in Bali with sacred intention.<br>Each piece is unique — like its wearer.',
fc_all:'All Jewelry',fc_consultation:'Consultation',fc_gift:'Gift Wrapping',fc_custom:'Custom Orders',
ws_lbl:'B2B Program',ws_title:'Partner With <em>Amberra</em>',ws_body:'We welcome boutiques, concept stores, and jewelry retailers worldwide. Our wholesale program offers exclusive pricing, full product range access, and dedicated account support from Bali.',
ws_t1:'Starter',ws_t2:'Partner',ws_t3:'Exclusive',ws_ppo:'pieces per order',
ws_n1:'Access to full catalog<br>Standard wholesale pricing<br>WhatsApp support',
ws_n2:'Priority access to new drops<br>Enhanced pricing tiers<br>Dedicated account manager',
ws_n3:'Custom packaging options<br>Best pricing available<br>Co-branding opportunities',};

function navTo(path){location.href=path;}
// Active translation table — starts as EN, replaced by setLang()
let TR_ACTIVE=TR;
function t(k){return TR_ACTIVE[k]||TR[k]||k}
function detectLang(){
  const saved=localStorage.getItem('amb_lang');
  if(saved&&typeof TRANSLATIONS!=='undefined'&&TRANSLATIONS[saved])return saved;
  const nav=(navigator.language||navigator.userLanguage||'en').split('-')[0].toLowerCase();
  if(typeof TRANSLATIONS!=='undefined'&&TRANSLATIONS[nav])return nav;
  return 'en';
}
function setLang(lang){
  // Merge: TR (full EN base) + TRANSLATIONS[lang] overrides
  const overrides=(typeof TRANSLATIONS!=='undefined'&&TRANSLATIONS[lang])||{};
  const dict=Object.assign({},TR,overrides);
  TR_ACTIVE=dict;
  document.documentElement.lang=lang;
  document.dir=(lang==='ar')?'rtl':'ltr';
  localStorage.setItem('amb_lang',lang);
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k=el.dataset.i18n;const v=dict[k];
    if(v!==undefined)el.innerHTML=v;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{
    const k=el.dataset.i18nPh;const v=dict[k];
    if(v!==undefined)el.placeholder=v;
  });
  if(typeof renderProducts==='function') renderProducts();
}
function toggleLang(){}
function closeLang(){}
document.addEventListener('click',e=>{if(!e.target.closest('#lang-sw'))closeLang()});

// ── JOURNAL TOGGLE ────────────────────────────────────────────────────────
function toggleJournal(){
  const extras=document.querySelectorAll('.j-extra');
  const btn=document.getElementById('j-toggle-btn');
  if(!extras.length)return;
  const isHidden=extras[0].style.display==='none'||extras[0].style.display==='';
  extras.forEach(el=>el.style.display=isHidden?'flex':'none');
  if(btn){btn.textContent=isHidden?'Show less':'View all articles';}
  if(isHidden){initReveal();}
}

// ── QUIZ ──────────────────────────────────────────────────────────────────
const quizData=[
  {q:'What draws you most to amber jewelry?',opts:['The ancient history','The warm golden colour','The spiritual energy','The uniqueness of each stone']},
  {q:'How would you describe your personal style?',opts:['Minimalist & refined','Bold & expressive','Earthy & natural','Classic & timeless']},
  {q:'When do you most often wear jewelry?',opts:['Every day, always','Special occasions only','Work & professional settings','Meditation & wellness moments']},
  {q:'Which metal feels most like you?',opts:['Pure sterling silver','Gold-plated glamour','Oxidized & rustic','Mixed metals']},
  {q:'What is this piece for?',opts:['A gift for someone special','Treating myself','A meaningful occasion','Building my collection']},
];
// Quiz scoring: each answer[question][option] = {rings, earrings, pendants, bracelets}
const quizMatrix=[
  [{rings:2,earrings:0,pendants:3,bracelets:1},{rings:1,earrings:3,pendants:1,bracelets:1},{rings:0,earrings:1,pendants:3,bracelets:2},{rings:2,earrings:2,pendants:2,bracelets:0}],
  [{rings:3,earrings:1,pendants:1,bracelets:1},{rings:0,earrings:3,pendants:1,bracelets:2},{rings:1,earrings:1,pendants:2,bracelets:3},{rings:2,earrings:2,pendants:1,bracelets:1}],
  [{rings:2,earrings:3,pendants:1,bracelets:2},{rings:1,earrings:3,pendants:2,bracelets:0},{rings:2,earrings:1,pendants:1,bracelets:2},{rings:0,earrings:0,pendants:3,bracelets:1}],
  [{rings:2,earrings:2,pendants:2,bracelets:1},{rings:1,earrings:3,pendants:1,bracelets:1},{rings:1,earrings:1,pendants:2,bracelets:3},{rings:2,earrings:2,pendants:1,bracelets:2}],
  [{rings:1,earrings:3,pendants:2,bracelets:1},{rings:2,earrings:2,pendants:2,bracelets:1},{rings:1,earrings:3,pendants:2,bracelets:1},{rings:2,earrings:1,pendants:1,bracelets:3}],
];
let qStep=0;const qAnswers=[];
function openQuiz(){qStep=0;qAnswers.length=0;renderQ();document.getElementById('quiz-modal').classList.add('open')}
function closeQuiz(){document.getElementById('quiz-modal').classList.remove('open')}
function renderQ(){
  if(qStep>=quizData.length){showQuizResult();return}
  const q=quizData[qStep];
  document.getElementById('q-question').textContent=q.q;
  document.getElementById('q-opts').innerHTML=q.opts.map((o,i)=>
    `<div class="q-opt" onclick="selectOpt(this,${i})"><div class="q-dot"></div>${o}</div>`).join('');
  document.getElementById('q-step').textContent=`${qStep+1} / ${quizData.length}`;
  document.getElementById('q-prog').style.width=((qStep/quizData.length)*100)+'%';
  document.getElementById('q-next').textContent=qStep===quizData.length-1?'See My Match →':t('q_next');
}
function selectOpt(el,i){
  document.querySelectorAll('.q-opt').forEach(o=>o.classList.remove('ch'));
  el.classList.add('ch');qAnswers[qStep]=i;
}
function nextQ(){if(qAnswers[qStep]===undefined)qAnswers[qStep]=0;qStep++;renderQ()}
function showQuizResult(){
  // Tally scores by category
  const score={rings:0,earrings:0,pendants:0,bracelets:0};
  qAnswers.forEach((ans,qi)=>{
    const row=quizMatrix[qi]&&quizMatrix[qi][ans];
    if(row)Object.keys(score).forEach(k=>score[k]+=(row[k]||0));
  });
  const winCat=Object.keys(score).reduce((a,b)=>score[a]>=score[b]?a:b);
  const prods=typeof products!=='undefined'?products:[];
  const pool=prods.filter(p=>p.cat===winCat);
  const p=pool[Math.floor(Math.random()*Math.min(pool.length,5))]||prods[0];
  if(!p){closeQuiz();return;}
  const catLabel={rings:'Ring',earrings:'Earring',pendants:'Pendant',bracelets:'Bracelet'}[winCat]||winCat;
  document.getElementById('quiz-modal').innerHTML=`
    <div class="qbdrop" onclick="closeQuiz()"></div>
    <div class="qbox">
      <div class="q-head">
        <p style="font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--amber);margin-bottom:8px">Your Perfect Match</p>
        <h2 style="font-family:var(--serif);font-size:26px;font-weight:400">We found your <em>${catLabel}</em></h2>
        <p style="font-size:12px;color:var(--gray);margin-top:4px">Based on your unique style profile</p>
      </div>
      <div class="q-body">
        <img src="${p.img}" style="width:100%;aspect-ratio:1;object-fit:contain;background:var(--silk);padding:20px;margin-bottom:16px" alt="${p.name}">
        <div class="pcat" style="margin-bottom:4px">${p.cat.toUpperCase()}</div>
        <h3 style="font-family:var(--serif);font-size:20px;margin-bottom:6px">${p.name}</h3>
        <p style="font-size:11px;color:var(--gray);margin-bottom:6px">${p.material}</p>
        <p style="font-family:var(--serif);font-size:18px;color:var(--amber);margin-bottom:18px">$${p.price}</p>
        <div style="display:flex;gap:10px">
          <button class="btn-s" style="flex:1;padding:12px" onclick="closeQuiz();if(typeof openDrawer==='function')openDrawer(${p.id})">View Details</button>
          <button class="btn-o" style="padding:12px 16px" onclick="closeQuiz();location.href='/shop?cat='+encodeURIComponent('${winCat}')">See All ${catLabel}s</button>
        </div>
      </div>
    </div>`;
}

// ── EMAIL POPUP ───────────────────────────────────────────────────────────
let popShown=false;
function showEpop(){
  if(popShown||sessionStorage.getItem('amb_pop'))return;
  popShown=true;
  document.getElementById('epop').classList.add('open');
}
function closeEpop(){document.getElementById('epop').classList.remove('open');sessionStorage.setItem('amb_pop','1')}
async function submitEpop(){
  const inp=document.getElementById('epop-email');
  if(!inp.value||!inp.value.includes('@'))return;
  document.getElementById('epop-form').style.display='none';
  document.getElementById('epop-thanks').style.display='block';
  sessionStorage.setItem('amb_pop','1');
  setTimeout(closeEpop,2800);
  try{
    await fetch('/api/contact',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type:'request',piece:'Newsletter subscription',name:'Subscriber',email:inp.value,phone:'',message:'New newsletter subscriber from popup.'})
    });
  }catch(e){}
}
// Email popup disabled
// setTimeout(showEpop,18000);
// window.addEventListener('scroll',()=>{if(window.scrollY>window.innerHeight*.65)showEpop()});

// ── CHAT ──────────────────────────────────────────────────────────────────
let chatOpen=false;
const chatAnswers={
  'ring sizes':'We offer ring sizes XS (14mm) through XL (19mm). Measure your finger with a string for the best fit. Our team can also help.',
  'shipping info':'We ship worldwide from Bali, Indonesia. Standard shipping 7–14 days. Express 3–5 days. Free shipping on orders over $200.',
  'care guide':'Keep amber away from perfume and chemicals. Clean with a soft dry cloth. Store separately to avoid scratches. Amber loves to be worn.',
  'gift ideas':'Popular gifts: Sacred Drop Pendant ($165), Solar Thread Ring ($99), Bali Dusk Drops earrings ($145). Free gift wrapping with every order.',
  'размеры колец':'Предлагаем размеры от XS (14мм) до XL (19мм). Измерьте палец ниткой для точного размера.',
  'доставка':'Отправляем по всему миру с Бали. Стандарт 7–14 дней. Экспресс 3–5 дней. Бесплатно при заказе от $200.',
  'уход':'Избегайте парфюма и химикатов. Протирайте мягкой тканью. Храните отдельно. Янтарь любит, когда его носят.',
  'подарочные идеи':'Популярные подарки: подвеска Sacred Drop ($165), кольцо Solar Thread ($99), серьги Bali Dusk Drops ($145).',
};
function toggleChat(){
  chatOpen=!chatOpen;
  document.getElementById('chat-pop').classList.toggle('open',chatOpen);
  const btn=document.getElementById('chat-btn');
  btn.querySelector('.chat-ico').style.display=chatOpen?'none':'block';
  btn.querySelector('.chat-x').style.display=chatOpen?'block':'none';
}
function chatSend(text){
  const inp=document.getElementById('chat-input');
  const msg=(text||inp.value).trim();if(!msg)return;
  inp.value='';
  addMsg(msg,'user');
  document.getElementById('chat-quick').style.display='none';
  const typing=document.getElementById('chat-typing');
  typing.style.display='flex';
  setTimeout(()=>{
    typing.style.display='none';
    const key=Object.keys(chatAnswers).find(k=>msg.toLowerCase().includes(k));
    addMsg(key?chatAnswers[key]:`Thank you for your question! Our team in Bali is happy to help. Please email us at amberrajewelry@gmail.com`,'bot');
  },1200);
}
function addMsg(text,type){
  const msgs=document.getElementById('chat-msgs');
  const div=document.createElement('div');
  div.className=`chat-msg chat-${type}`;
  div.textContent=text;
  msgs.appendChild(div);
  msgs.scrollTop=msgs.scrollHeight;
}

// ── LEGAL MODAL ───────────────────────────────────────────────────────────
const legalContent={
  privacy:`
    <h3>Privacy Policy</h3>
    <p>Last updated: March 2026</p>
    <p>AMBERRA ("we", "our", or "us") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit amberrajewelry.com.</p>
    <h3>Information We Collect</h3>
    <ul>
      <li><strong>Contact information</strong> — name, email address, phone number when you submit an inquiry or request form.</li>
      <li><strong>Usage data</strong> — pages visited, time spent, browser type, collected automatically via cookies and analytics tools (PostHog, Sentry).</li>
      <li><strong>Wishlist &amp; cart data</strong> — stored locally in your browser (localStorage) and never transmitted to our servers.</li>
    </ul>
    <h3>How We Use Your Information</h3>
    <ul>
      <li>To respond to your jewelry inquiries and wholesale partnership requests.</li>
      <li>To improve our website performance and user experience.</li>
      <li>To monitor and fix technical errors (Sentry error tracking).</li>
    </ul>
    <h3>Data Sharing</h3>
    <p>We do not sell, trade, or transfer your personal information to third parties. We use the following trusted service providers: Resend (email delivery), PostHog (analytics), Sentry (error monitoring), Vercel (hosting), Airtable (product catalog).</p>
    <h3>Data Retention</h3>
    <p>Inquiry data is retained for up to 2 years. You may request deletion at any time by emailing us at amberrajewelry@gmail.com.</p>
    <h3>Your Rights</h3>
    <p>You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at amberrajewelry@gmail.com.</p>
    <h3>Contact</h3>
    <p>AMBERRA · Bali, Indonesia · amberrajewelry@gmail.com</p>`,

  terms:`
    <h3>Terms of Use</h3>
    <p>Last updated: March 2026</p>
    <p>By accessing and using amberrajewelry.com, you agree to the following terms and conditions.</p>
    <h3>Use of Website</h3>
    <p>This website is for informational and commercial inquiry purposes only. You may browse our jewelry catalog, submit inquiries, and explore our services. Any unauthorized use, reproduction, or redistribution of site content is prohibited.</p>
    <h3>Products &amp; Pricing</h3>
    <p>All prices displayed are in USD and subject to change without notice. Product photographs aim to accurately represent items; however, colors may vary slightly due to screen calibration. Each piece of Baltic amber is unique — natural variations in color, inclusions, and texture are inherent to the stone.</p>
    <h3>Inquiries &amp; Orders</h3>
    <p>Submitting a request form does not constitute a binding order. Our team will contact you within 24–48 hours to confirm availability, pricing, and shipping details. Orders are confirmed only upon written agreement and receipt of payment.</p>
    <h3>Intellectual Property</h3>
    <p>All content on this website — including photographs, text, logos, and design — is the property of AMBERRA and protected by copyright. You may not use our content without prior written permission.</p>
    <h3>Limitation of Liability</h3>
    <p>AMBERRA shall not be liable for any indirect, incidental, or consequential damages arising from the use of this website or our products.</p>
    <h3>Governing Law</h3>
    <p>These terms are governed by the laws of Indonesia. Any disputes shall be resolved in the courts of Bali, Indonesia.</p>
    <h3>Contact</h3>
    <p>AMBERRA · Bali, Indonesia · amberrajewelry@gmail.com</p>`,

  cookies:`
    <h3>Cookie Policy</h3>
    <p>Last updated: March 2026</p>
    <p>This Cookie Policy explains how AMBERRA uses cookies and similar technologies on amberrajewelry.com.</p>
    <h3>What Are Cookies</h3>
    <p>Cookies are small text files placed on your device when you visit a website. They help the site remember your preferences and improve your experience.</p>
    <h3>Cookies We Use</h3>
    <ul>
      <li><strong>Essential cookies</strong> — necessary for the site to function (e.g., remembering your cookie preference, cart, and wishlist). Cannot be disabled.</li>
      <li><strong>Analytics cookies</strong> — PostHog collects anonymized data about pages visited and interactions to help us improve the site. Only set if you accept cookies.</li>
      <li><strong>Error monitoring</strong> — Sentry collects technical error data to help us identify and fix bugs. Active on all sessions for site stability.</li>
    </ul>
    <h3>localStorage (Not Cookies)</h3>
    <p>Your cart and wishlist are stored in your browser's localStorage — this data never leaves your device and is not tracked by us.</p>
    <h3>Managing Cookies</h3>
    <p>You can reject non-essential cookies using the "Reject All" button on our cookie banner. You can also clear cookies at any time through your browser settings. Note that rejecting cookies may affect certain site features.</p>
    <h3>Third-Party Services</h3>
    <p>PostHog (analytics) and Sentry (error monitoring) may set their own cookies. Please refer to their respective privacy policies for details.</p>
    <h3>Contact</h3>
    <p>Questions about our cookie use? Email us at amberrajewelry@gmail.com</p>`
};

let currentLegalTab='privacy';
function openLegal(tab){
  currentLegalTab=tab||'privacy';
  document.getElementById('legal-modal').classList.add('open');
  document.getElementById('nav-shell').classList.add('nav-hidden');
  document.body.style.overflow='hidden';
  legalTab(currentLegalTab);
}
function closeLegal(){
  document.getElementById('legal-modal').classList.remove('open');
  document.getElementById('nav-shell').classList.remove('nav-hidden');
  document.body.style.overflow='';
}
function legalTab(tab){
  currentLegalTab=tab;
  document.getElementById('legal-body').innerHTML=legalContent[tab]||'';
  document.querySelectorAll('.legal-tab').forEach((t,i)=>{
    t.classList.toggle('act',['privacy','terms','cookies'][i]===tab);
  });
}

// ── COOKIE BANNER ─────────────────────────────────────────────────────────
(function(){
  if(!localStorage.getItem('ck_choice')){
    setTimeout(function(){
      var o=document.getElementById('cookie-overlay');
      if(o){o.style.display='flex';setTimeout(function(){o.classList.remove('hide')},10);}
    },1500);
  }
})();
function ckClose(){
  var o=document.getElementById('cookie-overlay');
  if(!o)return;
  o.classList.add('hide');
  setTimeout(function(){o.style.display='none'},400);
}
function ckAccept(){
  localStorage.setItem('ck_choice','accepted');
  ckClose();
  // Init PostHog analytics now that user has consented
  if(window.posthog && typeof posthog._i!=='undefined' && !posthog.__loaded){
    posthog.init('phc_UqL7ychAdg6sU0vOBr2z8ACypL6NgvRUKQ9u9If99Il',{
      api_host:'https://app.posthog.com',
      autocapture:false,
      capture_pageview:true,
      session_recording:false
    });
  }
}
function ckReject(){localStorage.setItem('ck_choice','rejected');ckClose();}

// ── MENU OVERLAY ──────────────────────────────────────────────────────────
function openMenu(){
  document.getElementById('menu-overlay').style.display='block';
  document.body.style.overflow='hidden';
}
function closeMenu(){
  document.getElementById('menu-overlay').style.display='none';
  document.body.style.overflow='';
}
// Legacy aliases for backwards compatibility
function openMobNav(){openMenu();}
function closeMobNav(){closeMenu();}

// ── MOB BAR BADGES ────────────────────────────────────────────────────────
function updateMobBadges(){
  const cb=document.getElementById('mob-cart-badge');
  const wb=document.getElementById('mob-wish-badge');
  if(cb){cb.textContent=cart.length;cb.classList.toggle('show',cart.length>0)}
  if(wb){wb.textContent=wishlist.length;wb.classList.toggle('show',wishlist.length>0)}
}

// ── INIT ──────────────────────────────────────────────────────────────────
window.addEventListener('load',()=>{
  if(location.hash){
    const el=document.querySelector(location.hash);
    if(el){
      const nav=document.getElementById('nav-shell');
      const navH=nav?nav.offsetHeight:110;
      window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY-navH,behavior:'instant'});
    }
  }
});

// Journal is now a static 3-card CSS grid — no JS needed.

document.addEventListener('DOMContentLoaded',()=>{
  setLang(detectLang());
  initReveal();
  updateWishBadge();
  updateCartBadge();
  updateMobBadges();
  // Search input — redirect to shop on index pages (shop.html handles its own search via shop.js)
  const si=document.querySelector('.nav-search-inp');
  if(si&&typeof renderProducts==='undefined'){
    si.addEventListener('keydown',e=>{
      if(e.key==='Enter'&&si.value.trim()){
        navTo('/shop?q='+encodeURIComponent(si.value.trim()));
      }
    });
  }
  // Ensure hero video plays
  const heroVid=document.getElementById('hero-video');
  if(heroVid) heroVid.addEventListener('canplay',()=>{heroVid.play().catch(()=>{});},{once:true});
  // About video lazy loading (20.5MB - load only when in viewport)
  const abVid=document.querySelector('.ab-video');
  if(abVid&&abVid.dataset.src){
    const abIo=new IntersectionObserver(es=>{
      if(es[0].isIntersecting){
        const s=document.createElement('source');
        s.src=abVid.dataset.src; s.type='video/mp4';
        abVid.appendChild(s);
        abVid.load(); abVid.play().catch(()=>{});
        abIo.disconnect();
      }
    },{rootMargin:'200px'});
    abIo.observe(abVid);
  }
  // Align PENDANTS link directly under JEWELRY text in logo
  function alignPendants(){
    const sub=document.querySelector('.nav-logo-sub');
    const pendants=document.querySelector('.nl[data-i18n="nav_pendants"]');
    const navMain=document.querySelector('.nav-main');
    if(!sub||!pendants||!navMain)return;
    navMain.style.paddingLeft='';
    requestAnimationFrame(()=>{
      const jR=sub.getBoundingClientRect();
      const pR=pendants.getBoundingClientRect();
      const shift=(jR.left+jR.right)/2-(pR.left+pR.right)/2;
      if(Math.abs(shift)<1)return;
      const cur=parseFloat(getComputedStyle(navMain).paddingLeft)||0;
      navMain.style.paddingLeft=Math.max(0,cur+shift*2)+'px';
    });
  }
  document.fonts.ready.then(alignPendants);
  window.addEventListener('resize',alignPendants);
});

// ── PRODUCT SHOWCASE (index.html) ─────────────────────────────────────────
function buildProductShowcase(products) {
  const container = document.getElementById('prod-scroll')
  if (!container || !products || !products.length) return
  const items = products.filter(p => p.img).slice(0, 8)
  container.innerHTML = items.map(p => `
    <div class="prod-card" onclick="prodCardClick(${p.id})">
      <img src="${p.img}" alt="${p.name}" loading="lazy" width="320" height="427">
      <div class="prod-card-info">
        <div class="prod-card-name">${p.name}</div>
        <span class="prod-card-cta">DISCOVER</span>
      </div>
    </div>
  `).join('')

  const bar = document.querySelector('.prod-progress-fill')
  if (bar) {
    container.addEventListener('scroll', () => {
      const pct = container.scrollLeft / (container.scrollWidth - container.clientWidth) * 100
      bar.style.width = pct + '%'
    }, { passive: true })
  }
}

// On index.html, openDrawer is in shop.js which is not loaded — redirect to shop page instead
function prodCardClick(id) {
  if (typeof openDrawer === 'function') {
    openDrawer(id)
  } else {
    location.href = '/shop?open=' + id
  }
}

// Load products for homepage showcase
(async function initHomeShowcase() {
  const container = document.getElementById('prod-scroll')
  if (!container) return
  try {
    const r = await fetch('/api/products')
    if (!r.ok) throw new Error('HTTP ' + r.status)
    const prods = await r.json()
    buildProductShowcase(prods)
  } catch (e) {
    console.warn('Product showcase load failed', e)
  }
})()

// ── EDITORIAL SCROLL SCRUB — 183 frames (61 per morph) ──────────────────
;(function initScrollScrub(){
  const editorial = document.getElementById('editorial')
  const wrap = document.getElementById('ed-scrub-wrap')
  const img = document.getElementById('ed-scrub-img')
  if (!editorial || !wrap || !img) return

  const FPM = 61 // frames per morph
  const TOTAL = FPM * 3 // 183
  const frames = []
  const slides = [
    { label: 'BALTIC AMBER JEWELRY', heading: 'Forty million years in the making', cta: false },
    { label: 'THE CRAFT', heading: 'Shaped by artisan hands', cta: false },
    { label: 'THE CREATION', heading: 'Where nature meets craft', cta: false },
    { label: 'THE COLLECTION', heading: 'Wear your story', cta: true }
  ]

  // Preload frames
  for (let m = 1; m <= 3; m++) {
    for (let f = 1; f <= FPM; f++) {
      const i = new Image()
      i.src = `/images/editorial/frames/morph${m}_${String(f).padStart(3,'0')}.webp`
      frames.push(i)
    }
  }

  let currentSlide = -1
  let lastFrame = -1

  function scrubOnScroll() {
    const edTop = editorial.offsetTop
    const edH = editorial.offsetHeight
    const scrolled = window.scrollY - edTop
    const progress = Math.max(0, Math.min(1, scrolled / edH))

    // Show scrub when in editorial zone
    if (scrolled > -window.innerHeight * 0.5 && scrolled < edH) {
      wrap.style.opacity = progress < 0.01 ? Math.min(1, (scrolled + window.innerHeight * 0.5) / (window.innerHeight * 0.3)) : 1
      wrap.style.pointerEvents = 'auto'
    } else {
      wrap.style.opacity = 0
      wrap.style.pointerEvents = 'none'
      return
    }

    // Fade out at end
    if (progress > 0.9) {
      wrap.style.opacity = 1 - (progress - 0.9) / 0.1
    }

    // Map to frame
    const frameIdx = Math.min(TOTAL - 1, Math.max(0, Math.floor(progress * TOTAL)))
    if (frameIdx !== lastFrame) {
      lastFrame = frameIdx
      img.src = frames[frameIdx].src
    }

    // Text
    const section = progress * 4
    const slideIdx = Math.min(3, Math.floor(section))
    const local = section - slideIdx
    const inTransition = local > 0.7 && slideIdx < 3
    const textEl = document.getElementById('ed-scrub-text')

    if (inTransition) {
      textEl.style.opacity = 0
      textEl.style.transform = 'translateY(-20px)'
    } else {
      textEl.style.opacity = 1
      textEl.style.transform = 'translateY(0)'
    }

    if (slideIdx !== currentSlide && !inTransition) {
      currentSlide = slideIdx
      const s = slides[slideIdx]
      document.getElementById('ed-scrub-label').textContent = s.label
      document.getElementById('ed-scrub-heading').textContent = s.heading
      document.getElementById('ed-scrub-cta').style.display = s.cta ? 'inline-block' : 'none'

      document.querySelectorAll('.ed-dot').forEach((d, i) => {
        d.style.background = i === slideIdx ? 'rgba(201,168,50,0.8)' : 'rgba(255,255,255,0.15)'
        d.style.transform = i === slideIdx ? 'scale(1.8)' : 'scale(1)'
      })
    }
  }

  window.addEventListener('scroll', scrubOnScroll, { passive: true })
})()

// ── MOTION SCROLL ANIMATIONS ─────────────────────────────────────────────
;(function initMotionEffects(){
  const M = window.Motion
  if (!M) return

  // Collections cards: stagger fade on enter
  const colls = document.querySelector('#colls')
  if (colls) {
    M.inView(colls, () => {
      M.animate(colls.querySelectorAll('.cc'), { opacity: [0, 1], y: [40, 0] }, {
        delay: M.stagger(0.12), duration: 0.7, easing: [0.25, 0.46, 0.45, 0.94]
      })
    }, { amount: 0.2 })
  }

  // Footer: gentle fade up
  const footer = document.querySelector('footer')
  if (footer) {
    M.inView(footer, () => {
      M.animate(footer.querySelectorAll('.footer-cols > div'), { opacity: [0, 1], y: [24, 0] }, {
        delay: M.stagger(0.1), duration: 0.6, easing: [0.25, 0.46, 0.45, 0.94]
      })
    }, { amount: 0.15 })
  }

  // Product showcase: fade in progress bar
  const prodSection = document.getElementById('products')
  if (prodSection) {
    const bar = prodSection.querySelector('.prod-progress')
    if (bar) {
      M.inView(prodSection, () => {
        M.animate(bar, { opacity: [0, 1] }, { duration: 0.8, delay: 0.3 })
      }, { amount: 0.3 })
    }
  }
})()
