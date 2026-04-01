// ═══════════════════════════════════════════════════════════════════════════
// AMBERRA — Shared App JS (app.js)
// Used on every page: nav, translations, cart, wishlist, modals, chat, cookie
// ═══════════════════════════════════════════════════════════════════════════

// ── HTML ESCAPE (XSS protection) ──────────────────────────────────────────
function esc(s){
  if(s==null)return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

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
  body.innerHTML=list.map(p=>`
    <div class="wish-item" onclick="closeWishPanel();if(typeof openDrawer==='function')openDrawer(${p.id})">
      <img src="${esc(p.img)}" alt="${esc(p.name)}">
      <div class="wish-item-info">
        <div class="wish-item-name">${esc(p.name)}</div>
        <div class="wish-item-mat">${esc(p.material||p.cat)}</div>
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
      <img src="${esc(p.img)}" alt="${esc(p.name)}">
      <div class="cart-item-info">
        <div class="cart-item-name">${esc(p.name)}</div>
        <div class="cart-item-mat">${esc(p.material)}</div>
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
    const r=await fetch('/api/contact',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type:'wholesale',name,email,company,country,partnerType,volume,message})
    });
    if(!r.ok)throw new Error('send failed');
  }catch(e){
    if(btn){btn.disabled=false;btn.textContent='Send Application';}
    alert('Could not send your request. Please try again or contact us on WhatsApp.');
    return;
  }
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
    const r=await fetch('/api/contact',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type:'request',piece,name,email,phone,message})
    });
    if(!r.ok)throw new Error('send failed');
  }catch(e){
    if(btn){btn.disabled=false;btn.textContent='Send Request';}
    alert('Could not send your request. Please try again or contact us on WhatsApp.');
    return;
  }
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
  document.getElementById('srv-modal').classList.add('open');
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
<p class="sg-intro">Balinese amber is an organic gemstone formed over 40 million years. It is warm, light, and alive — and with the right attention, it will remain luminous for generations.</p>
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
<div class="sg-method-step"><span class="sg-method-num">01</span><div class="sg-method-text"><b>What Is Certified</b>Balinese amber origin (Bali, Indonesia) · Succinic acid content (2–8%) confirming genuine resinite amber · Metal purity (925 sterling silver or 18k gold vermeil) · Stone colour classification and inclusion description.</div></div>
<div class="sg-method-step"><span class="sg-method-num">02</span><div class="sg-method-text"><b>The Physical Certificate</b>Printed on heavyweight 300gsm cream cotton paper. Bears the AMBERRA embossed seal, the artisan's signature, the date of completion, and a unique piece reference number. Presented in a protective archival sleeve.</div></div>
<div class="sg-method-step"><span class="sg-method-num">03</span><div class="sg-method-text"><b>Digital Verification</b>Each certificate includes a QR code linking to your piece's unique digital record — including high-resolution photography, stone provenance documentation, and the Bali Blessing date. Permanently hosted and accessible at any time.</div></div>
<div class="sg-method-step"><span class="sg-method-num">04</span><div class="sg-method-text"><b>Resale &amp; Inheritance Value</b>AMBERRA certificates are transferable. Should your piece be gifted, inherited, or resold, the certificate travels with it. A re-authentication service is available for $35, updating the certificate with a new owner name and date.</div></div>
</div>
<div class="sg-warranty-box" style="margin-top:32px">
<div class="sg-warranty-seal"><svg viewBox="0 0 24 24"><path d="M12 2l2.4 4.8L20 8l-4 4 .9 5.5L12 15l-4.9 2.5L8 12 4 8l5.6-1.2L12 2z" stroke="#fff" stroke-width="1.2" fill="none"/></svg></div>
<div class="sg-warranty-body"><h4>HOW TO IDENTIFY AUTHENTIC AMBERRA</h4><ul><li>Certificate reference number matches the QR code in the digital record</li><li>The amber passes the saltwater float test (genuine amber floats in saturated saltwater)</li><li>Under UV light, natural Balinese amber fluoresces blue-white or blue-green</li><li>Each piece has a unique amber grain — no two are identical. If yours looks mass-produced, contact us.</li></ul><p>Concerned about authenticity? Email us a photograph of your piece and certificate at <a href="mailto:hello@amberrajewelry.com" style="color:var(--amber)">hello@amberrajewelry.com</a>. Verification is always free.</p></div>
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

// ── NAV SCROLL (throttled) ────────────────────────────────────────────────
let _scrollRAF=0;
window.addEventListener('scroll',()=>{
  if(_scrollRAF)return;
  _scrollRAF=requestAnimationFrame(()=>{
    document.getElementById('nav-shell').classList.toggle('sc',scrollY>60);
    document.querySelectorAll('.nl').forEach(n=>n.classList.remove('act'));
    _scrollRAF=0;
  });
});

// ── SPARKLE PARTICLES ─────────────────────────────────────────────────────
const sparkColors=['#D4A832','#E8C84A','#C9A832','#F0D870','#B8941E'];
let lastX=0,lastY=0,lastT=0;
function spawnSparkle(x,y){
  const p=document.createElement('div');p.className='gp';
  const size=Math.random()*10+6;
  const ox=(Math.random()-.5)*18,oy=(Math.random()-.5)*18;
  const color=sparkColors[Math.floor(Math.random()*sparkColors.length)];
  p.style.cssText=`left:${x+ox}px;top:${y+oy}px;width:${size}px;height:${size}px;background:${color};animation-duration:${Math.random()*.3+.55}s`;
  document.body.appendChild(p);
  setTimeout(()=>p.remove(),850);
}
document.addEventListener('mousemove',e=>{
  const now=Date.now();
  const dx=e.clientX-lastX,dy=e.clientY-lastY;
  const dist=Math.sqrt(dx*dx+dy*dy);
  if(dist>8&&now-lastT>25){
    const count=Math.min(3,Math.floor(dist/12)+1);
    for(let i=0;i<count;i++)spawnSparkle(e.clientX,e.clientY);
    lastX=e.clientX;lastY=e.clientY;lastT=now;
  }
});

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
  for(let i=0;i<60;i++)parts.push(new Particle());
  function animate(){
    ctx.clearRect(0,0,W,H);
    parts.forEach(p=>{
      p.y-=p.speed;p.wobble+=p.wobbleSpeed;p.x+=Math.sin(p.wobble)*.4+p.vx;
      if(p.y<-10)p.reset(false);
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=p.color+p.alpha+')';ctx.fill();
    });
    requestAnimationFrame(animate);
  }
  animate();
}catch(e){console.warn('particles error',e)}})();

// ── HERO FULL-PAGE SLIDER ─────────────────────────────────────────────────
(function(){
  const slides=document.querySelectorAll('.hfs');
  const dots=document.querySelectorAll('.hfs-dot');
  if(!slides.length||!dots.length)return;
  let cur=0,anim=false;
  function resetToFirst(){
    slides.forEach(s=>s.style.transition='none');
    slides.forEach((s,i)=>{
      s.classList.remove('active','to-left','from-right');
      if(i!==0)s.classList.add('from-right');
      else s.classList.add('active');
    });
    dots.forEach((d,i)=>d.classList.toggle('act',i===0));
    cur=0;anim=false;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{slides.forEach(s=>s.style.transition='');}));
  }
  function goTo(n){
    if(anim||n===cur)return;
    anim=true;
    const fwd=n>cur;
    slides[n].classList.add('animating');
    slides[cur].classList.remove('active');
    slides[cur].classList.add(fwd?'to-left':'from-right');
    slides[n].classList.remove('from-right','to-left');
    slides[n].classList.add('active');
    dots[cur].classList.remove('act');
    dots[n].classList.add('act');
    cur=n;
    setTimeout(()=>{
      slides.forEach((s,i)=>{
        if(i!==cur){s.classList.remove('to-left','animating');s.classList.add('from-right');}
        else{s.classList.remove('animating');}
      });
      anim=false;
    },1000);
  }
  // Fix bfcache: back-button restores last slide state — always reset to slide 1
  window.addEventListener('pageshow',e=>{if(e.persisted)resetToFirst();});
  dots.forEach((d,i)=>d.addEventListener('click',()=>goTo(i)));
})();

// ── TRANSLATIONS ──────────────────────────────────────────────────────────
const TR={
  en:{util_store:'Find a Store',util_services:'Services',util_contact:'Contact Us',util_account:'My Account',util_wishlist:'Wishlist',search_ph:'Search',nav_collections:'Collections',nav_rings:'Rings',nav_earrings:'Earrings',nav_pendants:'Pendants',nav_bracelets:'Bracelets',nav_journal:'Journal',nav_about:'Our Story',nav_tryon:'Try On',nav_wholesale:'Wholesale',hero_tag:'Bali · New Collection 2026',hero_title:'Amber from the <em>Ancient</em> World',hero_desc:'Natural Balinese amber, millions of years in the making. Handcrafted in Bali with sacred intention.',hero_cta:'Explore Collections',hero_cta2:'All Jewelry',tick1:'Natural Balinese Amber',tick2:'Handcrafted in Bali',tick3:'925 Sterling Silver',tick4:'Sacred Ritual Blessing',tick5:'Free Gift Wrapping',coll_lbl:'Our Universe',coll_title:'Collections',coll_all:'View all pieces',cat_rings:'Collection',cat_earrings:'Collection',cat_pendants:'Collection',cat_bracelets:'Collection',cat_chains:'Collection',col_rings:'Rings',col_earrings:'Earrings',col_pendants:'Pendants',col_bracelets:'Bracelets',col_chains:'Chains',nav_chains:'Chains',f_chains:'Chains',discover:'Discover',ed_lbl:'The Craft',ed_title:'Born from <em>Ancient Earth</em>',ed_body1:'Amber is not merely stone — it is time crystallised. Forty million years of forests, insects, light and rain preserved in a single stone.',ed_body2:'Our artisans in Bali spend lifetimes learning to honour it. Every piece passes through water, fire and prayer before it reaches you.',stat1:'Years of amber',stat2:'Unique pieces',stat3:'Countries',tryon_lbl:'New Feature',tryon_title:'Try On<br><em>Before You Buy</em>',tryon_desc:'Upload your photo and see how each AMBERRA piece looks on you.',tryon_cta:'Upload Your Photo',tryon_badge:'AR Try-On',tryon_hint:'Upload photo to begin',quiz_title:'Find My Amber',quiz_sub:'Answer 5 questions — discover your perfect piece',quiz_cta:'Start Quiz',cat_lbl:'The Collection',cat_title:'All Jewelry',f_all:'All',f_rings:'Rings',f_earrings:'Earrings',f_pendants:'Pendants',f_bracelets:'Bracelets',j_lbl:'Insights',j_title:'The Amber <em>Journal</em>',j_all:'View all articles',j1_date:'March 2026',j1_title:'Balinese Amber Healing Properties: The Science of Succinic Acid',j1_body:'Balinese amber contains up to 8% succinic acid — a natural compound studied for its anti-inflammatory and immune-supporting effects when worn against the skin.',j2_date:'February 2026',j2_title:'How to Clean Amber Jewelry: The Complete Care Guide',j2_body:'Natural amber is softer than most gemstones. Warm water, mild soap, and a soft cloth are all you need to keep it radiant for generations. Avoid chemicals and ultrasound cleaners.',j3_date:'January 2026',j3_title:'From Balinese Forests to Bali: The Journey of Every AMBERRA Stone',j3_body:'Forty million years beneath ancient forests, then a world away in the sacred workshops of Ubud — the remarkable story of each Balinese amber stone.',j4_date:'December 2025',j4_title:'How to Tell Real Balinese Amber from Fake: 5 Simple Tests',j4_body:'With replicas flooding the market, knowing how to identify authentic Balinese amber is essential. Salt water, UV light, and the scent test reveal the truth instantly.',j5_date:'November 2025',j5_title:'5 Ways to Style Amber Jewelry This Season',j5_body:'From layered gold chains to minimalist rings, discover how natural amber complements every aesthetic — from Balinese sunsets to city evenings.',j6_date:'October 2025',j6_title:'The Golden Spectrum: Understanding Amber Colors and Their Meaning',j6_body:'From cognac to cherry, green to milky white — every shade of Balinese amber tells a different geological story and carries its own energy signature.',j7_date:'September 2025',j7_title:'Why Balinese Amber Is the World\'s Most Ancient Gemstone',j7_body:'Unlike diamonds or sapphires, Balinese amber is organic — fossilized resin from forests that disappeared 40 million years ago. Its rarity lies not in hardness, but in time.',j8_date:'August 2025',j8_title:'The Ubud Artisans: Hands Behind Every AMBERRA Piece',j8_body:'In the rice-field studios of Ubud, Balinese silversmiths spend years perfecting the art of setting Balinese amber in sacred geometric forms passed down through generations.',j9_date:'July 2025',j9_title:'Amber and Feminine Energy: The Ancient Spiritual Connection',j9_body:'Baltic cultures associated amber with the goddess of the sea. In Bali it is worn for protection, warmth, and the awakening of feminine power.',c_lbl:'Private Appointments',c_title:'Request a Personal Consultation',c_body:'Our team in Bali will personally guide you to the perfect piece.',fc_coll:'Collections',fc_srv:'Services',fc_contact:'Contact',req_btn:'Request This Piece',req_title:'Request a Piece',req_sub:'Tell us which piece caught your eye.',f_piece:'Piece of Interest',f_name:'Your Name',f_email:'Email',f_phone:'WhatsApp (optional)',f_msg:'Message',req_send:'Send Request',req_thanks:'Thank you ✦',req_thanks_sub:'We will be in touch within 24 hours. Warm regards from Bali.',qm_title:'Find My Amber',qm_sub:'5 questions · 2 minutes · Perfect match',q_next:'Next',ep_title:'A Gift from Amberra',ep_sub:'Join our world — receive 10% off your first order',ep_ph:'Your email address',ep_btn:'Claim Offer',ep_note:'No spam, ever. Unsubscribe anytime.',ep_thanks:'✦ Welcome to Amberra ✦',ep_thanks_sub:'Your 10% code is on its way',chat_lbl:'Ask Us Anything',chat_status:'Online · Bali, Indonesia',chat_welcome:"Hello! I'm your personal Amberra guide. How can I help you find the perfect piece today?",cq1:'Ring sizes',cq2:'Shipping info',cq3:'Care guide',cq4:'Gift ideas',chat_ph:'Ask anything...',cont_btn:'Continue Browsing',to_lbl:'Virtual Try‑On',to_title:'Try On at Home',to_body:'Upload your photo and see how our jewelry looks on you.',to_cam_btn:'Start Camera',to_choose:'Choose a Piece',to_save:'Save Look',to_reset:'Reset',},
  ru:{util_store:'Найти магазин',util_services:'Услуги',util_contact:'Контакт',util_account:'Мой кабинет',util_wishlist:'Избранное',search_ph:'Поиск',nav_collections:'Коллекции',nav_rings:'Кольца',nav_earrings:'Серьги',nav_pendants:'Подвески',nav_bracelets:'Браслеты',nav_journal:'Журнал',nav_about:'О нас',nav_tryon:'Примерка',nav_wholesale:'Опт',hero_tag:'Бали · Новая коллекция 2026',hero_title:'Янтарь из <em>Древнего</em> Мира',hero_desc:'Натуральный балтийский янтарь, созданный миллионы лет назад. Изготовлен вручную на Бали с священным намерением.',hero_cta:'Смотреть коллекции',hero_cta2:'Все украшения',tick1:'Натуральный балтийский янтарь',tick2:'Изготовлено на Бали',tick3:'Серебро 925 пробы',tick4:'Балийское ритуальное благословение',tick5:'Бесплатная подарочная упаковка',coll_lbl:'Наш мир',coll_title:'Коллекции',coll_all:'Все украшения',cat_rings:'Коллекция',cat_earrings:'Коллекция',cat_pendants:'Коллекция',cat_bracelets:'Коллекция',cat_chains:'Коллекция',col_rings:'Кольца',col_earrings:'Серьги',col_pendants:'Подвески',col_bracelets:'Браслеты',col_chains:'Цепочки',nav_chains:'Цепочки',f_chains:'Цепочки',discover:'Открыть',ed_lbl:'Наше мастерство',ed_title:'Рождён из <em>Древней Земли</em>',ed_body1:'Янтарь — это не просто камень, это кристаллизованное время. Сорок миллионов лет лесов, насекомых, света и дождя в одном камне.',ed_body2:'Наши мастера на Бали всю жизнь учатся чтить его. Каждое украшение проходит через воду, огонь и молитву прежде чем попасть к вам.',stat1:'Лет янтаря',stat2:'Уникальных изделий',stat3:'Стран',tryon_lbl:'Новая функция',tryon_title:'Примерьте<br><em>до покупки</em>',tryon_desc:'Загрузите своё фото и посмотрите, как украшение AMBERRA выглядит на вас.',tryon_cta:'Загрузить фото',tryon_badge:'AR Примерка',tryon_hint:'Загрузите фото чтобы начать',quiz_title:'Найди свой янтарь',quiz_sub:'5 вопросов — идеальное украшение',quiz_cta:'Начать квиз',cat_lbl:'Коллекция',cat_title:'Все украшения',f_all:'Все',f_rings:'Кольца',f_earrings:'Серьги',f_pendants:'Подвески',f_bracelets:'Браслеты',j_lbl:'Вдохновение',j_title:'Янтарный <em>Журнал</em>',j_all:'Все статьи',j1_date:'Март 2026',j1_title:'Целебные свойства балийского янтаря: янтарная кислота',j1_body:'Балийский янтарь содержит до 8% янтарной кислоты — природного соединения с противовоспалительным действием при носке у кожи.',j2_date:'Февраль 2026',j2_title:'Как ухаживать за янтарными украшениями: полное руководство',j2_body:'Натуральный янтарь мягче большинства камней. Тёплая вода, мягкое мыло и мягкая ткань — всё, что нужно для его сияния. Избегайте химикатов и ультразвука.',j3_date:'Январь 2026',j3_title:'От балийских лесов до Бали: путь каждого камня AMBERRA',j3_body:'Сорок миллионов лет под древними лесами, затем в священных мастерских Убуда — удивительная история каждого камня.',j4_date:'Декабрь 2025',j4_title:'Как отличить настоящий янтарь от подделки: 5 простых тестов',j4_body:'Солевой раствор, ультрафиолет и тест на запах помогут мгновенно определить подлинность балийского янтаря.',j5_date:'Ноябрь 2025',j5_title:'5 способов носить янтарные украшения этого сезона',j5_body:'От слоёных золотых цепочек до минималистичных колец — натуральный янтарь сочетается с любым стилем.',j6_date:'Октябрь 2025',j6_title:'Золотой спектр: оттенки янтаря и их значение',j6_body:'От коньячного до вишнёвого, от зелёного до молочно-белого — каждый оттенок балийского янтаря рассказывает свою геологическую историю.',j7_date:'Сентябрь 2025',j7_title:'Почему балтийский янтарь — древнейший самоцвет в мире',j7_body:'В отличие от алмазов или сапфиров, янтарь органичен — это окаменевшая смола деревьев, исчезнувших 40 млн лет назад.',j8_date:'Август 2025',j8_title:'Мастера Убуда: руки, создающие каждое украшение AMBERRA',j8_body:'В студиях среди рисовых полей Убуда балийские ювелиры годами совершенствуют искусство оправы янтаря в сакральные формы.',j9_date:'Июль 2025',j9_title:'Янтарь и женская энергия: древняя духовная связь',j9_body:'Балтийские культуры связывали янтарь с богиней моря. На Бали его носят для защиты, тепла и пробуждения женской силы.',c_lbl:'Личные встречи',c_title:'Запросить Консультацию',c_body:'Наша команда на Бали лично поможет вам выбрать идеальное украшение.',fc_coll:'Коллекции',fc_srv:'Услуги',fc_contact:'Контакт',req_btn:'Запросить украшение',req_title:'Запрос украшения',req_sub:'Расскажите, какое украшение вас заинтересовало.',f_piece:'Интересующее украшение',f_name:'Ваше имя',f_email:'Email',f_phone:'WhatsApp (необязательно)',f_msg:'Сообщение',req_send:'Отправить',req_thanks:'Благодарим вас ✦',req_thanks_sub:'Мы свяжемся с вами в течение 24 часов. С теплом из Бали.',qm_title:'Найди свой янтарь',qm_sub:'5 вопросов · 2 минуты · Идеальный выбор',q_next:'Далее',ep_title:'Подарок от Amberra',ep_sub:'Присоединяйтесь — 10% скидка на первый заказ',ep_ph:'Ваш email',ep_btn:'Получить скидку',ep_note:'Без спама. Отписка в любое время.',ep_thanks:'✦ Добро пожаловать в Amberra ✦',ep_thanks_sub:'Ваш промокод уже на пути',chat_lbl:'Задать вопрос',chat_status:'Онлайн · Бали, Индонезия',chat_welcome:'Здравствуйте! Я ваш личный гид по AMBERRA. Чем могу помочь?',cq1:'Размеры колец',cq2:'Доставка',cq3:'Уход',cq4:'Подарочные идеи',chat_ph:'Задайте вопрос...',cont_btn:'Продолжить покупки',to_lbl:'Виртуальная примерка',to_title:'Примерь дома',to_body:'Загрузи фото и посмотри как украшение смотрится на тебе.',to_cam_btn:'Включить камеру',to_choose:'Выбери украшение',to_save:'Сохранить образ',to_reset:'Сбросить',},
  zh:{util_store:"找门店",util_services:"服务",util_contact:"联系我们",util_account:"我的账户",util_wishlist:"收藏夹",search_ph:"搜索",nav_collections:"系列",nav_rings:"戒指",nav_earrings:"耳环",nav_pendants:"吊坠",nav_bracelets:"手链",nav_journal:"杂志",nav_about:"我们的故事",nav_tryon:"虚拟试戴",nav_wholesale:"批发",hero_tag:"巴厘岛 · 2026新系列",hero_title:"来自<br><em>远古</em><br>世界的琥珀",hero_desc:"天然波罗的海琥珀，历经数百万年岁月。在巴厘岛以神圣意念手工打造。",hero_cta:"探索系列",hero_cta2:"全部珠宝",tick1:"天然波罗的海琥珀",tick2:"巴厘岛手工制作",tick3:"925纯银",tick4:"神圣仪式祝福",tick5:"免费精美包装",coll_lbl:"我们的世界",coll_title:"系列",coll_all:"查看所有作品",cat_rings:"系列",cat_earrings:"系列",cat_pendants:"系列",cat_bracelets:"系列",cat_chains:"系列",col_rings:"戒指",col_earrings:"耳环",col_pendants:"吊坠",col_bracelets:"手链",col_chains:"链条",nav_chains:"链条",f_chains:"链条",discover:"探索",ed_lbl:"工艺",ed_title:"诞生于<em>远古大地</em>",ed_body1:"琥珀不仅仅是石头——它是凝固的时光。四千万年的森林、昆虫、光线与雨水，封存于一块石头之中。",ed_body2:"我们在巴厘岛的工匠倾尽一生，学习如何以敬畏之心对待它。每一件作品都经过水、火与祈祷，方才抵达您的手中。",stat1:"琥珀年份",stat2:"独特作品",stat3:"语言",tryon_lbl:"全新功能",tryon_title:"购前<br><em>虚拟试戴</em>",tryon_desc:"上传您的照片，预览每件AMBERRA作品佩戴于您身上的效果。",tryon_cta:"上传您的照片",tryon_badge:"AR虚拟试戴",tryon_hint:"上传照片以开始",quiz_title:"找到我的琥珀",quiz_sub:"回答5个问题——发现您的完美之选",quiz_cta:"开始测试",cat_lbl:"珠宝系列",cat_title:"全部珠宝",f_all:"全部",f_rings:"戒指",f_earrings:"耳环",f_pendants:"吊坠",f_bracelets:"手链",j_lbl:"洞见",j_title:"琥珀<em>日志</em>",j_all:"查看所有文章",j1_date:"2026年3月",j1_title:"琥珀如何承载能量：巴厘岛视角",j1_body:"在巴厘岛，人们相信琥珀承载着太阳本身储存的光芒。",j2_date:"2026年2月",j2_title:"呵护您的琥珀：永恒之美指南",j2_body:"天然琥珀是有生命的材质，它回应光线、触感与呵护。",j3_date:"2026年1月",j3_title:"从波罗的海森林到巴厘岛海岸的旅程",j3_body:"从立陶宛的森林到乌布的工坊——一段非凡的旅程。",j4_date:"2025年12月",j4_title:"如何辨别真假琥珀：5个简单测试",j4_body:"盐水、紫外线和气味测试可即时验证巴里岛琥珀真伪。",j5_date:"2025年11月",j5_title:"本季5种琥珀首饰搭配方案",j5_body:"从叠戴金链到简约戒指，天然琥珀适合一切风格。",j6_date:"2025年10月",j6_title:"黄金光谱：琥珀颜色及其含义",j6_body:"从干邑色到樱桃色，巴里岛琥珀每种色调述说不同地质故事。",j7_date:"2025年9月",j7_title:"巴里岛琥珀为何是世界最古老宝石",j7_body:"与钻石不同，琥珀是有机的——4000万年前森林的化石树脂。",j8_date:"2025年8月",j8_title:"乌布工匠：每件AMBERRA作品背后的双手",j8_body:"在乌布稻田工作室，巴里岛银匠数年如一日地精进镶嵌工艺。",j9_date:"2025年7月",j9_title:"琥珀与女性能量：古老的精神联系",j9_body:"巴里岛文化将琥珀与海洋女神联系起来，用于保护和能量觉醒。",c_lbl:"私人预约",c_title:"预约<br><em>个人咨询</em>",c_body:"我们在巴厘岛的团队将亲自引导您找到完美之作。",fc_coll:"系列",fc_srv:"服务",fc_contact:"联系我们",req_btn:"定制询价",req_title:"定制询价",req_sub:"告诉我们哪件作品吸引了您，我们将在24小时内从巴厘岛与您联系。",f_piece:"感兴趣的作品",f_name:"您的姓名",f_email:"电子邮件",f_phone:"WhatsApp（选填）",f_msg:"留言",req_send:"发送请求",req_thanks:"感谢您 ✦",req_thanks_sub:"我们将在24小时内与您联系。来自巴厘岛的诚挚问候。",qm_title:"找到我的琥珀",qm_sub:"5个问题 · 2分钟 · 完美匹配",q_next:"下一步",ep_title:"AMBERRA的馈赠",ep_sub:"加入我们的世界——首次订单享九折优惠",ep_ph:"您的电子邮件地址",ep_btn:"领取优惠",ep_note:"绝无垃圾邮件。随时可取消订阅。",ep_thanks:"✦ 欢迎来到AMBERRA ✦",ep_thanks_sub:"您的九折优惠码正在发送中",chat_lbl:"随时咨询",chat_status:"在线 · 巴厘岛，印度尼西亚",chat_welcome:"您好！我是您的专属AMBERRA顾问。今天我能如何帮助您找到完美之作？",cq1:"戒指尺寸",cq2:"配送信息",cq3:"保养指南",cq4:"礼品推荐",chat_ph:"随时提问...",cont_btn:"继续浏览"},
  id:{util_store:"Temukan Toko",util_services:"Layanan",util_contact:"Hubungi Kami",util_account:"Akun Saya",util_wishlist:"Favorit",search_ph:"Cari",nav_collections:"Koleksi",nav_rings:"Cincin",nav_earrings:"Anting",nav_pendants:"Liontin",nav_bracelets:"Gelang",nav_journal:"Jurnal",nav_about:"Kisah Kami",nav_tryon:"Coba Virtual",nav_wholesale:"Grosir",hero_tag:"Bali · Koleksi Baru 2026",hero_title:"Amber dari<br>Dunia <em>Purba</em>",hero_desc:"Amber Baltik alami, terbentuk selama jutaan tahun. Diukir tangan di Bali dengan niat suci.",hero_cta:"Jelajahi Koleksi",hero_cta2:"Semua Perhiasan",tick1:"Amber Baltik Alami",tick2:"Buatan Tangan di Bali",tick3:"Perak Sterling 925",tick4:"Berkah Ritual Suci",tick5:"Pembungkus Hadiah Gratis",coll_lbl:"Semesta Kami",coll_title:"Koleksi",coll_all:"Lihat semua karya",cat_rings:"Koleksi",cat_earrings:"Koleksi",cat_pendants:"Koleksi",cat_bracelets:"Koleksi",cat_chains:"Koleksi",col_rings:"Cincin",col_earrings:"Anting",col_pendants:"Liontin",col_bracelets:"Gelang",col_chains:"Rantai",nav_chains:"Rantai",f_chains:"Rantai",discover:"Temukan",ed_lbl:"Keahlian",ed_title:"Lahir dari<em>Bumi Purba</em>",ed_body1:"Amber bukan sekadar batu — ia adalah waktu yang mengkristal. Empat puluh juta tahun hutan, serangga, cahaya, dan hujan tersimpan dalam satu batu.",ed_body2:"Para pengrajin kami di Bali menghabiskan seumur hidup untuk belajar menghormatinya. Setiap karya melewati air, api, dan doa sebelum sampai ke tangan Anda.",stat1:"Tahun amber",stat2:"Karya unik",stat3:"Bahasa",tryon_lbl:"Fitur Baru",tryon_title:"Coba<br><em>Sebelum Membeli</em>",tryon_desc:"Unggah foto Anda dan lihat tampilan setiap karya AMBERRA pada diri Anda.",tryon_cta:"Unggah Foto Anda",tryon_badge:"Coba AR",tryon_hint:"Unggah foto untuk memulai",quiz_title:"Temukan Amber Saya",quiz_sub:"Jawab 5 pertanyaan — temukan karya sempurna Anda",quiz_cta:"Mulai Kuis",cat_lbl:"Koleksi",cat_title:"Semua Perhiasan",f_all:"Semua",f_rings:"Cincin",f_earrings:"Anting",f_pendants:"Liontin",f_bracelets:"Gelang",j_lbl:"Wawasan",j_title:"Jurnal <em>Amber</em>",j_all:"Lihat semua artikel",j1_date:"Maret 2026",j1_title:"Bagaimana Amber Membawa Energi: Perspektif Bali",j1_body:"Di Bali, amber dipercaya membawa cahaya tersimpan dari matahari itu sendiri.",j2_date:"Februari 2026",j2_title:"Merawat Amber Anda: Panduan Kecantikan Abadi",j2_body:"Amber alami adalah material hidup yang merespons cahaya, sentuhan, dan perawatan.",j3_date:"Januari 2026",j3_title:"Perjalanan dari Hutan Baltik ke Pantai Bali",j3_body:"Dari hutan Lithuania hingga bengkel Ubud — perjalanan yang luar biasa.",j4_date:"Desember 2025",j4_title:"Cara Membedakan Amber Asli dari Palsu: 5 Tes Sederhana",j4_body:"Air garam, sinar UV, dan tes bau langsung mengungkap keaslian amber Bali.",j5_date:"November 2025",j5_title:"5 Cara Memadukan Perhiasan Amber Musim Ini",j5_body:"Dari rantai emas berlapis hingga cincin minimalis, amber alami cocok untuk semua gaya.",j6_date:"Oktober 2025",j6_title:"Spektrum Emas: Memahami Warna Amber",j6_body:"Dari cognac hingga ceri, setiap warna amber Bali menceritakan kisah geologis yang berbeda.",j7_date:"September 2025",j7_title:"Mengapa Amber Bali Adalah Batu Permata Tertua di Dunia",j7_body:"Tidak seperti berlian, amber bersifat organik—resin fosil dari hutan yang menghilang 40 juta tahun lalu.",j8_date:"Agustus 2025",j8_title:"Pengrajin Ubud: Tangan di Balik Setiap Perhiasan AMBERRA",j8_body:"Di studio sawah Ubud, pengrajin perak Bali menghabiskan bertahun-tahun menyempurnakan seni menyetel amber.",j9_date:"Juli 2025",j9_title:"Amber dan Energi Feminin: Koneksi Spiritual Kuno",j9_body:"Budaya Baltik menghubungkan amber dengan dewi laut. Di Bali dipakai untuk perlindungan dan pembangkitan energi.",c_lbl:"Janji Temu Pribadi",c_title:"Minta<br><em>Konsultasi Personal</em>",c_body:"Tim kami di Bali akan membimbing Anda secara langsung menuju karya yang sempurna.",fc_coll:"Koleksi",fc_srv:"Layanan",fc_contact:"Kontak",req_btn:"Pesan Karya",req_title:"Pesan Karya",req_sub:"Beritahu kami karya mana yang menarik perhatian Anda dan kami akan menghubungi dari Bali dalam 24 jam.",f_piece:"Karya yang Diminati",f_name:"Nama Anda",f_email:"Email",f_phone:"WhatsApp (opsional)",f_msg:"Pesan",req_send:"Kirim Permintaan",req_thanks:"Terima kasih ✦",req_thanks_sub:"Kami akan menghubungi Anda dalam 24 jam. Salam hangat dari Bali.",qm_title:"Temukan Amber Saya",qm_sub:"5 pertanyaan · 2 menit · Cocok sempurna",q_next:"Berikutnya",ep_title:"Hadiah dari Amberra",ep_sub:"Bergabunglah dengan dunia kami — dapatkan diskon 10% untuk pesanan pertama Anda",ep_ph:"Alamat email Anda",ep_btn:"Klaim Penawaran",ep_note:"Tanpa spam, selamanya. Berhenti berlangganan kapan saja.",ep_thanks:"✦ Selamat Datang di Amberra ✦",ep_thanks_sub:"Kode diskon 10% Anda sedang dalam perjalanan",chat_lbl:"Tanya Apa Saja",chat_status:"Online · Bali, Indonesia",chat_welcome:"Halo! Saya adalah pemandu pribadi AMBERRA Anda. Bagaimana saya bisa membantu Anda menemukan karya sempurna hari ini?",cq1:"Ukuran cincin",cq2:"Info pengiriman",cq3:"Panduan perawatan",cq4:"Ide hadiah",chat_ph:"Tanyakan apa saja...",cont_btn:"Lanjutkan Menjelajah"},
  fr:{util_store:"Trouver un Magasin",util_services:"Services",util_contact:"Contactez-nous",util_account:"Mon Compte",util_wishlist:"Favoris",search_ph:"Rechercher",nav_collections:"Collections",nav_rings:"Bagues",nav_earrings:"Boucles d'Oreilles",nav_pendants:"Pendentifs",nav_bracelets:"Bracelets",nav_journal:"Journal",nav_about:"Notre Histoire",nav_tryon:"Essayage",nav_wholesale:"Vente en Gros",hero_tag:"Bali · Nouvelle Collection 2026",hero_title:"L'Ambre de<br>l'<em>Ancien</em><br>Monde",hero_desc:"Ambre baltique naturel, façonné au fil de millions d'années. Artisanat balinais empreint d'intention sacrée.",hero_cta:"Explorer les Collections",hero_cta2:"Tous les Bijoux",tick1:"Ambre Baltique Naturel",tick2:"Artisanat Balinais",tick3:"Argent Sterling 925",tick4:"Bénédiction Rituelle Sacrée",tick5:"Emballage Cadeau Offert",coll_lbl:"Notre Univers",coll_title:"Collections",coll_all:"Voir toutes les pièces",cat_rings:"Collection",cat_earrings:"Collection",cat_pendants:"Collection",cat_bracelets:"Collection",cat_chains:"Collection",col_rings:"Bagues",col_earrings:"Boucles d'Oreilles",col_pendants:"Pendentifs",col_bracelets:"Bracelets",col_chains:"Chaînes",nav_chains:"Chaînes",f_chains:"Chaînes",discover:"Découvrir",ed_lbl:"Le Savoir-Faire",ed_title:"Né de<em>la Terre Ancienne</em>",ed_body1:"L'ambre n'est pas simplement une pierre — c'est le temps cristallisé. Quarante millions d'années de forêts, d'insectes, de lumière et de pluie, préservés dans un seul et unique joyau.",ed_body2:"Nos artisans à Bali consacrent leur vie entière à l'honorer. Chaque pièce traverse l'eau, le feu et la prière avant de vous rejoindre.",stat1:"Années d'ambre",stat2:"Pièces uniques",stat3:"Langues",tryon_lbl:"Nouvelle Fonctionnalité",tryon_title:"Essayez<br><em>Avant d'Acheter</em>",tryon_desc:"Téléchargez votre photo et découvrez comment chaque pièce AMBERRA vous sied.",tryon_cta:"Télécharger Votre Photo",tryon_badge:"Essai AR",tryon_hint:"Téléchargez une photo pour commencer",quiz_title:"Trouver Mon Ambre",quiz_sub:"Répondez à 5 questions — découvrez votre pièce parfaite",quiz_cta:"Commencer le Quiz",cat_lbl:"La Collection",cat_title:"Tous les Bijoux",f_all:"Tous",f_rings:"Bagues",f_earrings:"Boucles d'Oreilles",f_pendants:"Pendentifs",f_bracelets:"Bracelets",j_lbl:"Regards",j_title:"Le <em>Journal</em> de l'Ambre",j_all:"Voir tous les articles",j1_date:"Mars 2026",j1_title:"Comment l'Ambre Porte l'Énergie : Une Perspective Balinaise",j1_body:"À Bali, on croit que l'ambre porte la lumière emmagasinée du soleil lui-même.",j2_date:"Février 2026",j2_title:"Prendre Soin de Votre Ambre : Un Guide de Beauté Éternelle",j2_body:"L'ambre naturel est un matériau vivant qui répond à la lumière, au toucher et aux soins.",j3_date:"Janvier 2026",j3_title:"Le Voyage des Forêts Baltiques aux Rivages de Bali",j3_body:"Des forêts de Lituanie aux ateliers d'Ubud — un voyage remarquable.",j4_date:"Décembre 2025",j4_title:"Comment distinguer le vrai ambre du faux : 5 tests simples",j4_body:"L'eau salée, la lumière UV et le test d'odeur révèlent instantanément l'authenticité.",j5_date:"Novembre 2025",j5_title:"5 façons de porter des bijoux en ambre cette saison",j5_body:"Des chaînes dorées superposées aux bagues minimalistes, l'ambre naturel s'adapte à tous les styles.",j6_date:"Octobre 2025",j6_title:"Le spectre doré : comprendre les couleurs de l'ambre",j6_body:"Du cognac au cerise, chaque nuance d'ambre de Bali raconte une histoire géologique différente.",j7_date:"Septembre 2025",j7_title:"Pourquoi l'ambre de Bali est la gemme la plus ancienne du monde",j7_body:"Contrairement aux diamants, l'ambre est organique — résine fossilisée de forêts disparues il y a 40 millions d'années.",j8_date:"Août 2025",j8_title:"Les artisans d'Ubud : les mains derrière chaque pièce AMBERRA",j8_body:"Dans les ateliers d'Ubud, les orfèvres balinais passent des années à maîtriser l'art de sertir l'ambre.",j9_date:"Juillet 2025",j9_title:"Ambre et énergie féminine : l'ancienne connexion spirituelle",j9_body:"Les cultures baltiques associaient l'ambre à la déesse de la mer. À Bali, il est porté pour la protection et l'éveil.",c_lbl:"Rendez-vous Privés",c_title:"Demander<br><em>une Consultation Personnelle</em>",c_body:"Notre équipe à Bali vous guidera personnellement vers la pièce parfaite.",fc_coll:"Collections",fc_srv:"Services",fc_contact:"Contact",req_btn:"Demander une Pièce",req_title:"Demander une Pièce",req_sub:"Dites-nous quelle pièce a attiré votre attention et nous vous contacterons depuis Bali sous 24 heures.",f_piece:"Pièce d'Intérêt",f_name:"Votre Nom",f_email:"Email",f_phone:"WhatsApp (optionnel)",f_msg:"Message",req_send:"Envoyer la Demande",req_thanks:"Merci ✦",req_thanks_sub:"Nous vous contacterons dans les 24 heures. Chaleureuses salutations de Bali.",qm_title:"Trouver Mon Ambre",qm_sub:"5 questions · 2 minutes · Correspondance parfaite",q_next:"Suivant",ep_title:"Un Cadeau d'Amberra",ep_sub:"Rejoignez notre univers — bénéficiez de 10% sur votre première commande",ep_ph:"Votre adresse email",ep_btn:"Réclamer l'Offre",ep_note:"Aucun spam, jamais. Désabonnez-vous à tout moment.",ep_thanks:"✦ Bienvenue chez Amberra ✦",ep_thanks_sub:"Votre code de réduction 10% est en route",chat_lbl:"Posez-Nous Vos Questions",chat_status:"En ligne · Bali, Indonésie",chat_welcome:"Bonjour ! Je suis votre guide personnel AMBERRA. Comment puis-je vous aider à trouver la pièce parfaite aujourd'hui ?",cq1:"Tailles de bagues",cq2:"Informations de livraison",cq3:"Guide d'entretien",cq4:"Idées cadeaux",chat_ph:"Posez n'importe quelle question...",cont_btn:"Continuer la Navigation"},
  de:{util_store:"Filiale finden",util_services:"Dienste",util_contact:"Kontakt",util_account:"Mein Konto",util_wishlist:"Wunschliste",search_ph:"Suchen",nav_collections:"Kollektionen",nav_rings:"Ringe",nav_earrings:"Ohrringe",nav_pendants:"Anhänger",nav_bracelets:"Armbänder",nav_journal:"Journal",nav_about:"Unsere Geschichte",nav_tryon:"Anprobe",nav_wholesale:"Großhandel",hero_tag:"Bali · Neue Kollektion 2026",hero_title:"Bernstein aus der<br><em>Alten</em><br>Welt",hero_desc:"Natürlicher Baltischer Bernstein, Millionen von Jahren gereift. In Bali mit heiliger Intention handgefertigt.",hero_cta:"Kollektionen Entdecken",hero_cta2:"Gesamter Schmuck",tick1:"Natürlicher Baltischer Bernstein",tick2:"Handgefertigt in Bali",tick3:"925 Sterlingsilber",tick4:"Heilige Ritualsegnung",tick5:"Kostenlose Geschenkverpackung",coll_lbl:"Unser Universum",coll_title:"Kollektionen",coll_all:"Alle Stücke ansehen",cat_rings:"Kollektion",cat_earrings:"Kollektion",cat_pendants:"Kollektion",cat_bracelets:"Kollektion",cat_chains:"Kollektion",col_rings:"Ringe",col_earrings:"Ohrringe",col_pendants:"Anhänger",col_bracelets:"Armbänder",col_chains:"Ketten",nav_chains:"Ketten",f_chains:"Ketten",discover:"Entdecken",ed_lbl:"Das Handwerk",ed_title:"Geboren aus<em>Uralter Erde</em>",ed_body1:"Bernstein ist nicht bloß ein Stein — er ist kristallisierte Zeit. Vierzig Millionen Jahre Wälder, Insekten, Licht und Regen, bewahrt in einem einzigen Stein.",ed_body2:"Unsere Handwerker in Bali widmen ihr ganzes Leben darin, ihn zu ehren. Jedes Stück durchläuft Wasser, Feuer und Gebet, bevor es zu Ihnen gelangt.",stat1:"Jahre des Bernsteins",stat2:"Einzigartige Stücke",stat3:"Sprachen",tryon_lbl:"Neue Funktion",tryon_title:"Anprobieren<br><em>Vor dem Kauf</em>",tryon_desc:"Laden Sie Ihr Foto hoch und sehen Sie, wie jedes AMBERRA-Stück an Ihnen aussieht.",tryon_cta:"Ihr Foto Hochladen",tryon_badge:"AR-Anprobe",tryon_hint:"Foto hochladen zum Starten",quiz_title:"Meinen Bernstein Finden",quiz_sub:"5 Fragen beantworten — Ihr perfektes Stück entdecken",quiz_cta:"Quiz Starten",cat_lbl:"Die Kollektion",cat_title:"Gesamter Schmuck",f_all:"Alle",f_rings:"Ringe",f_earrings:"Ohrringe",f_pendants:"Anhänger",f_bracelets:"Armbänder",j_lbl:"Einblicke",j_title:"Das Bernstein-<em>Journal</em>",j_all:"Alle Artikel ansehen",j1_date:"März 2026",j1_title:"Wie Bernstein Energie Trägt: Eine Balinesische Perspektive",j1_body:"In Bali glaubt man, dass Bernstein das gespeicherte Licht der Sonne selbst trägt.",j2_date:"Februar 2026",j2_title:"Pflege Ihres Bernsteins: Ein Leitfaden für Ewige Schönheit",j2_body:"Natürlicher Bernstein ist ein lebendiges Material, das auf Licht, Berührung und Pflege reagiert.",j3_date:"Januar 2026",j3_title:"Die Reise von den Baltischen Wäldern an die Küsten Balis",j3_body:"Von den Wäldern Litauens bis zu den Werkstätten von Ubud — eine bemerkenswerte Reise.",j4_date:"Dezember 2025",j4_title:"Echten Bernstein von Falschem unterscheiden: 5 einfache Tests",j4_body:"Salzwasser, UV-Licht und Geruchstest enthüllen sofort die Echtheit von Bali-Bernstein.",j5_date:"November 2025",j5_title:"5 Wege, Bernsteinschmuck diese Saison zu stylen",j5_body:"Von geschichteten Goldketten bis zu minimalistischen Ringen — natürlicher Bernstein passt zu jedem Stil.",j6_date:"Oktober 2025",j6_title:"Das goldene Spektrum: Bernsteinfarben und ihre Bedeutung",j6_body:"Von Cognac bis Kirsche erzählt jede Farbe des Bali-Bernsteins eine andere geologische Geschichte.",j7_date:"September 2025",j7_title:"Warum Bali-Bernstein das älteste Edelstein der Welt ist",j7_body:"Im Gegensatz zu Diamanten ist Bernstein organisch — versteinerte Harzreste aus Wäldern, die vor 40 Millionen Jahren verschwanden.",j8_date:"August 2025",j8_title:"Die Ubud-Handwerker: Hände hinter jedem AMBERRA-Stück",j8_body:"In den Werkstätten von Ubud verbringen balinesische Silberschmiede Jahre damit, die Kunst des Bernsteinfassens zu perfektionieren.",j9_date:"Juli 2025",j9_title:"Bernstein und weibliche Energie: die uralte spirituelle Verbindung",j9_body:"Baltische Kulturen verbanden Bernstein mit der Meeresgöttin. In Bali wird er für Schutz und Erweckung getragen.",c_lbl:"Private Termine",c_title:"Eine<br><em>Persönliche Beratung</em> Anfordern",c_body:"Unser Team in Bali begleitet Sie persönlich zu Ihrem perfekten Stück.",fc_coll:"Kollektionen",fc_srv:"Dienstleistungen",fc_contact:"Kontakt",req_btn:"Stück Anfragen",req_title:"Stück Anfragen",req_sub:"Teilen Sie uns mit, welches Stück Ihr Interesse geweckt hat, und wir melden uns innerhalb von 24 Stunden aus Bali.",f_piece:"Gewünschtes Stück",f_name:"Ihr Name",f_email:"E-Mail",f_phone:"WhatsApp (optional)",f_msg:"Nachricht",req_send:"Anfrage Senden",req_thanks:"Vielen Dank ✦",req_thanks_sub:"Wir melden uns innerhalb von 24 Stunden. Herzliche Grüße aus Bali.",qm_title:"Meinen Bernstein Finden",qm_sub:"5 Fragen · 2 Minuten · Perfekte Übereinstimmung",q_next:"Weiter",ep_title:"Ein Geschenk von Amberra",ep_sub:"Treten Sie unserer Welt bei — 10% Rabatt auf Ihre erste Bestellung",ep_ph:"Ihre E-Mail-Adresse",ep_btn:"Angebot Sichern",ep_note:"Kein Spam, niemals. Jederzeit abmeldbar.",ep_thanks:"✦ Willkommen bei Amberra ✦",ep_thanks_sub:"Ihr 10%-Rabattcode ist auf dem Weg",chat_lbl:"Fragen Sie Uns Alles",chat_status:"Online · Bali, Indonesien",chat_welcome:"Hallo! Ich bin Ihr persönlicher AMBERRA-Guide. Wie kann ich Ihnen heute helfen, das perfekte Stück zu finden?",cq1:"Ringgrößen",cq2:"Versandinfo",cq3:"Pflegeanleitung",cq4:"Geschenkideen",chat_ph:"Stellen Sie beliebige Fragen...",cont_btn:"Weiter Stöbern"},
  es:{util_store:"Encontrar Tienda",util_services:"Servicios",util_contact:"Contáctenos",util_account:"Mi Cuenta",util_wishlist:"Lista de Deseos",search_ph:"Buscar",nav_collections:"Colecciones",nav_rings:"Anillos",nav_earrings:"Pendientes",nav_pendants:"Colgantes",nav_bracelets:"Pulseras",nav_journal:"Revista",nav_about:"Nuestra Historia",nav_tryon:"Prueba Virtual",nav_wholesale:"Mayorista",hero_tag:"Bali · Nueva Colección 2026",hero_title:"Ámbar del<br><em>Antiguo</em><br>Mundo",hero_desc:"Ámbar báltico natural, formado durante millones de años. Elaborado artesanalmente en Bali con intención sagrada.",hero_cta:"Explorar Colecciones",hero_cta2:"Toda la Joyería",tick1:"Ámbar Báltico Natural",tick2:"Artesanía de Bali",tick3:"Plata de Ley 925",tick4:"Bendición Ritual Sagrada",tick5:"Envoltura de Regalo Gratuita",coll_lbl:"Nuestro Universo",coll_title:"Colecciones",coll_all:"Ver todas las piezas",cat_rings:"Colección",cat_earrings:"Colección",cat_pendants:"Colección",cat_bracelets:"Colección",cat_chains:"Colección",col_rings:"Anillos",col_earrings:"Pendientes",col_pendants:"Colgantes",col_bracelets:"Pulseras",col_chains:"Cadenas",nav_chains:"Cadenas",f_chains:"Cadenas",discover:"Descubrir",ed_lbl:"La Artesanía",ed_title:"Nacido de<em>la Tierra Antigua</em>",ed_body1:"El ámbar no es simplemente una piedra — es el tiempo cristalizado. Cuarenta millones de años de bosques, insectos, luz y lluvia preservados en una sola piedra.",ed_body2:"Nuestros artesanos en Bali dedican toda una vida a honrarlo. Cada pieza pasa por el agua, el fuego y la oración antes de llegar a sus manos.",stat1:"Años de ámbar",stat2:"Piezas únicas",stat3:"Idiomas",tryon_lbl:"Nueva Función",tryon_title:"Pruébate<br><em>Antes de Comprar</em>",tryon_desc:"Sube tu foto y descubre cómo luce cada pieza AMBERRA en ti.",tryon_cta:"Subir Tu Foto",tryon_badge:"Prueba AR",tryon_hint:"Sube una foto para comenzar",quiz_title:"Encontrar Mi Ámbar",quiz_sub:"Responde 5 preguntas — descubre tu pieza perfecta",quiz_cta:"Iniciar Quiz",cat_lbl:"La Colección",cat_title:"Toda la Joyería",f_all:"Todas",f_rings:"Anillos",f_earrings:"Pendientes",f_pendants:"Colgantes",f_bracelets:"Pulseras",j_lbl:"Perspectivas",j_title:"El <em>Diario</em> del Ámbar",j_all:"Ver todos los artículos",j1_date:"Marzo 2026",j1_title:"Cómo el Ámbar Transporta Energía: Una Perspectiva Balinesa",j1_body:"En Bali, se cree que el ámbar lleva la luz almacenada del propio sol.",j2_date:"Febrero 2026",j2_title:"Cuidado de Tu Ámbar: Una Guía de Belleza Eterna",j2_body:"El ámbar natural es un material vivo que responde a la luz, el tacto y los cuidados.",j3_date:"Enero 2026",j3_title:"El Viaje desde los Bosques Bálticos hasta las Costas de Bali",j3_body:"Desde los bosques de Lituania hasta los talleres de Ubud — un viaje extraordinario.",j4_date:"Diciembre 2025",j4_title:"Cómo distinguir el ámbar auténtico del falso: 5 pruebas simples",j4_body:"El agua salada, la luz UV y la prueba del olfato revelan al instante la autenticidad del ámbar.",j5_date:"Noviembre 2025",j5_title:"5 formas de combinar joyas de ámbar esta temporada",j5_body:"Desde cadenas doradas superpuestas hasta anillos minimalistas, el ámbar natural complementa cualquier estilo.",j6_date:"Octubre 2025",j6_title:"El espectro dorado: entendiendo los colores del ámbar",j6_body:"Del coñac al cereza, cada tono del ámbar de Bali cuenta una historia geológica diferente.",j7_date:"Septiembre 2025",j7_title:"Por qué el ámbar de Bali es la gema más antigua del mundo",j7_body:"A diferencia de los diamantes, el ámbar es orgánico: resina fosilizada de bosques que desaparecieron hace 40 millones de años.",j8_date:"Agosto 2025",j8_title:"Los artesanos de Ubud: las manos detrás de cada pieza AMBERRA",j8_body:"En los talleres de Ubud, los plateros balineses pasan años perfeccionando el arte de engarce del ámbar.",j9_date:"Julio 2025",j9_title:"Ámbar y energía femenina: la antigua conexión espiritual",j9_body:"Las culturas bálticas asociaban el ámbar con la diosa del mar. En Bali se usa para protección y despertar.",c_lbl:"Citas Privadas",c_title:"Solicitar<br><em>una Consulta Personal</em>",c_body:"Nuestro equipo en Bali le guiará personalmente hacia la pieza perfecta.",fc_coll:"Colecciones",fc_srv:"Servicios",fc_contact:"Contacto",req_btn:"Solicitar una Pieza",req_title:"Solicitar una Pieza",req_sub:"Cuéntenos qué pieza le llamó la atención y le contactaremos desde Bali en 24 horas.",f_piece:"Pieza de Interés",f_name:"Tu Nombre",f_email:"Email",f_phone:"WhatsApp (opcional)",f_msg:"Mensaje",req_send:"Enviar Solicitud",req_thanks:"Gracias ✦",req_thanks_sub:"Nos pondremos en contacto en 24 horas. Saludos cordiales desde Bali.",qm_title:"Encontrar Mi Ámbar",qm_sub:"5 preguntas · 2 minutos · Combinación perfecta",q_next:"Siguiente",ep_title:"Un Regalo de Amberra",ep_sub:"Únete a nuestro mundo — recibe un 10% de descuento en tu primer pedido",ep_ph:"Tu dirección de email",ep_btn:"Reclamar Oferta",ep_note:"Sin spam, nunca. Cancela la suscripción cuando quieras.",ep_thanks:"✦ Bienvenido a Amberra ✦",ep_thanks_sub:"Tu código del 10% está en camino",chat_lbl:"Pregúntanos Todo",chat_status:"En línea · Bali, Indonesia",chat_welcome:"¡Hola! Soy tu guía personal de AMBERRA. ¿Cómo puedo ayudarte a encontrar la pieza perfecta hoy?",cq1:"Tallas de anillos",cq2:"Información de envío",cq3:"Guía de cuidado",cq4:"Ideas de regalo",chat_ph:"Pregunta lo que quieras...",cont_btn:"Continuar Navegando"},
  pt:{util_store:"Encontrar Loja",util_services:"Serviços",util_contact:"Contate-nos",util_account:"Minha Conta",util_wishlist:"Lista de Desejos",search_ph:"Pesquisar",nav_collections:"Coleções",nav_rings:"Anéis",nav_earrings:"Brincos",nav_pendants:"Pingentes",nav_bracelets:"Pulseiras",nav_journal:"Revista",nav_about:"Nossa História",nav_tryon:"Experimentar",nav_wholesale:"Atacado",hero_tag:"Bali · Nova Coleção 2026",hero_title:"Âmbar do<br><em>Antigo</em><br>Mundo",hero_desc:"Âmbar báltico natural, formado ao longo de milhões de anos. Artesanato balinês imbuído de intenção sagrada.",hero_cta:"Explorar Coleções",hero_cta2:"Todas as Joias",tick1:"Âmbar Báltico Natural",tick2:"Artesanato em Bali",tick3:"Prata Esterlina 925",tick4:"Bênção Ritual Sagrada",tick5:"Embrulho para Presente Grátis",coll_lbl:"Nosso Universo",coll_title:"Coleções",coll_all:"Ver todas as peças",cat_rings:"Coleção",cat_earrings:"Coleção",cat_pendants:"Coleção",cat_bracelets:"Coleção",cat_chains:"Coleção",col_rings:"Anéis",col_earrings:"Brincos",col_pendants:"Pingentes",col_bracelets:"Pulseiras",col_chains:"Correntes",nav_chains:"Correntes",f_chains:"Correntes",discover:"Descobrir",ed_lbl:"O Ofício",ed_title:"Nascido da<em>Terra Antiga</em>",ed_body1:"O âmbar não é simplesmente uma pedra — é o tempo cristalizado. Quarenta milhões de anos de florestas, insetos, luz e chuva preservados em uma única pedra.",ed_body2:"Nossos artesãos em Bali dedicam a vida inteira a honrá-lo. Cada peça passa pela água, pelo fogo e pela oração antes de chegar até você.",stat1:"Anos de âmbar",stat2:"Peças únicas",stat3:"Idiomas",tryon_lbl:"Nova Funcionalidade",tryon_title:"Experimente<br><em>Antes de Comprar</em>",tryon_desc:"Envie sua foto e veja como cada peça AMBERRA fica em você.",tryon_cta:"Enviar Sua Foto",tryon_badge:"Experimentar em AR",tryon_hint:"Envie uma foto para começar",quiz_title:"Encontrar Meu Âmbar",quiz_sub:"Responda 5 perguntas — descubra sua peça perfeita",quiz_cta:"Iniciar Quiz",cat_lbl:"A Coleção",cat_title:"Todas as Joias",f_all:"Todas",f_rings:"Anéis",f_earrings:"Brincos",f_pendants:"Pingentes",f_bracelets:"Pulseiras",j_lbl:"Perspectivas",j_title:"O <em>Diário</em> do Âmbar",j_all:"Ver todos os artigos",j1_date:"Março 2026",j1_title:"Como o Âmbar Carrega Energia: Uma Perspectiva Balinesa",j1_body:"Em Bali, acredita-se que o âmbar carrega a luz armazenada do próprio sol.",j2_date:"Fevereiro 2026",j2_title:"Cuidando do Seu Âmbar: Um Guia de Beleza Eterna",j2_body:"O âmbar natural é um material vivo que responde à luz, ao toque e aos cuidados.",j3_date:"Janeiro 2026",j3_title:"A Jornada das Florestas Bálticas até as Praias de Bali",j3_body:"Das florestas da Lituânia às oficinas de Ubud — uma jornada extraordinária.",j4_date:"Dezembro 2025",j4_title:"Como distinguir âmbar autêntico do falso: 5 testes simples",j4_body:"Água salgada, luz UV e teste de odor revelam instantaneamente a autenticidade.",j5_date:"Novembro 2025",j5_title:"5 maneiras de usar joias de âmbar nesta temporada",j5_body:"Das correntes douradas sobrepostas aos anéis minimalistas, o âmbar natural complementa qualquer estilo.",j6_date:"Outubro 2025",j6_title:"O espectro dourado: entendendo as cores do âmbar",j6_body:"Do conhaque ao cereja, cada tonalidade do âmbar de Bali conta uma história geológica diferente.",j7_date:"Setembro 2025",j7_title:"Por que o âmbar de Bali é a gema mais antiga do mundo",j7_body:"Ao contrário dos diamantes, o âmbar é orgânico — resina fossilizada de florestas que desapareceram há 40 milhões de anos.",j8_date:"Agosto 2025",j8_title:"Os artesãos de Ubud: as mãos por trás de cada peça AMBERRA",j8_body:"Nos ateliês de Ubud, os ourives balineses passam anos aperfeiçoando a arte de engastar o âmbar.",j9_date:"Julho 2025",j9_title:"Âmbar e energia feminina: a antiga conexão espiritual",j9_body:"As culturas bálticas associavam o âmbar à deusa do mar. Em Bali é usado para proteção e despertar.",c_lbl:"Consultas Privadas",c_title:"Solicitar<br><em>uma Consulta Pessoal</em>",c_body:"Nossa equipe em Bali irá guiá-lo pessoalmente até a peça perfeita.",fc_coll:"Coleções",fc_srv:"Serviços",fc_contact:"Contato",req_btn:"Solicitar uma Peça",req_title:"Solicitar uma Peça",req_sub:"Diga-nos qual peça chamou sua atenção e entraremos em contato de Bali em 24 horas.",f_piece:"Peça de Interesse",f_name:"Seu Nome",f_email:"Email",f_phone:"WhatsApp (opcional)",f_msg:"Mensagem",req_send:"Enviar Solicitação",req_thanks:"Obrigado ✦",req_thanks_sub:"Entraremos em contato em 24 horas. Calorosas saudações de Bali.",qm_title:"Encontrar Meu Âmbar",qm_sub:"5 perguntas · 2 minutos · Combinação perfeita",q_next:"Próximo",ep_title:"Um Presente da Amberra",ep_sub:"Junte-se ao nosso mundo — receba 10% de desconto no seu primeiro pedido",ep_ph:"Seu endereço de email",ep_btn:"Resgatar Oferta",ep_note:"Sem spam, nunca. Cancele a inscrição a qualquer momento.",ep_thanks:"✦ Bem-vindo à Amberra ✦",ep_thanks_sub:"Seu código de 10% está a caminho",chat_lbl:"Pergunte-nos Tudo",chat_status:"Online · Bali, Indonésia",chat_welcome:"Olá! Sou seu guia pessoal da AMBERRA. Como posso ajudá-lo a encontrar a peça perfeita hoje?",cq1:"Tamanhos de anéis",cq2:"Informações de envio",cq3:"Guia de cuidados",cq4:"Ideias de presente",chat_ph:"Pergunte o que quiser...",cont_btn:"Continuar Navegando"},
  ar:{util_store:"ابحث عن متجر",util_services:"الخدمات",util_contact:"اتصل بنا",util_account:"حسابي",util_wishlist:"قائمة الرغبات",search_ph:"بحث",nav_collections:"المجموعات",nav_rings:"خواتم",nav_earrings:"أقراط",nav_pendants:"قلائد",nav_bracelets:"أساور",nav_journal:"المجلة",nav_about:"قصتنا",nav_tryon:"تجربة افتراضية",nav_wholesale:"البيع بالجملة",hero_tag:"بالي · مجموعة جديدة 2026",hero_title:"العنبر من<br>العالم <em>القديم</em>",hero_desc:"عنبر بلطيقي طبيعي، تشكّل على مدى ملايين السنين. صُنع يدوياً في بالي بنيّة مقدسة.",hero_cta:"استكشف المجموعات",hero_cta2:"جميع المجوهرات",tick1:"عنبر بلطيقي طبيعي",tick2:"صناعة يدوية في بالي",tick3:"فضة إسترليني 925",tick4:"بركة طقوس مقدسة",tick5:"تغليف هدايا مجاني",coll_lbl:"عالمنا",coll_title:"المجموعات",coll_all:"عرض جميع القطع",cat_rings:"مجموعة",cat_earrings:"مجموعة",cat_pendants:"مجموعة",cat_bracelets:"مجموعة",cat_chains:"مجموعة",col_rings:"خواتم",col_earrings:"أقراط",col_pendants:"قلائد معلقة",col_bracelets:"أساور",col_chains:"سلاسل",nav_chains:"سلاسل",f_chains:"سلاسل",discover:"اكتشف",ed_lbl:"الحرفية",ed_title:"وُلد من<em>الأرض القديمة</em>",ed_body1:"العنبر ليس مجرد حجر — إنه الزمن في صورة بلور. أربعون مليون سنة من الغابات والحشرات والضوء والمطر محفوظة في حجر واحد.",ed_body2:"يُكرّس حرفيونا في بالي حياتهم لتكريمه. تمر كل قطعة بالماء والنار والصلاة قبل أن تصل إليك.",stat1:"سنوات العنبر",stat2:"قطع فريدة",stat3:"لغات",tryon_lbl:"ميزة جديدة",tryon_title:"جرّب<br><em>قبل الشراء</em>",tryon_desc:"ارفع صورتك وشاهد كيف تبدو كل قطعة من AMBERRA عليك.",tryon_cta:"ارفع صورتك",tryon_badge:"تجربة AR",tryon_hint:"ارفع صورة للبدء",quiz_title:"اعثر على عنبري",quiz_sub:"أجب على 5 أسئلة — اكتشف قطعتك المثالية",quiz_cta:"ابدأ الاختبار",cat_lbl:"المجموعة",cat_title:"جميع المجوهرات",f_all:"الكل",f_rings:"خواتم",f_earrings:"أقراط",f_pendants:"قلائد معلقة",f_bracelets:"أساور",j_lbl:"رؤى",j_title:"<em>مجلة</em> العنبر",j_all:"عرض جميع المقالات",j1_date:"مارس 2026",j1_title:"كيف يحمل العنبر الطاقة: منظور بالينيزي",j1_body:"في بالي، يُعتقد أن العنبر يحمل الضوء المخزون للشمس ذاتها.",j2_date:"فبراير 2026",j2_title:"العناية بعنبرك: دليل الجمال الأبدي",j2_body:"العنبر الطبيعي مادة حية تستجيب للضوء واللمس والعناية.",j3_date:"يناير 2026",j3_title:"الرحلة من غابات البلطيق إلى شواطئ بالي",j3_body:"من غابات ليتوانيا إلى ورش أوبود — رحلة استثنائية.",j4_date:"ديسمبر 2025",j4_title:"كيف تميّز العنبر الحقيقي من المزيف: 5 اختبارات بسيطة",j4_body:"الماء المالح والأشعة فوق البنفسجية واختبار الرائحة تكشف فوراً عن الأصالة.",j5_date:"نوفمبر 2025",j5_title:"5 طرق لارتداء مجوهرات العنبر هذا الموسم",j5_body:"من السلاسل الذهبية المتعددة إلى الخواتم البسيطة، العنبر الطبيعي يناسب جميع الأساليب.",j6_date:"أكتوبر 2025",j6_title:"الطيف الذهبي: فهم ألوان العنبر ومعانيها",j6_body:"من الكونياك إلى الكرز، كل درجة من درجات العنبر الباليزي تحكي قصة جيولوجية مختلفة.",j7_date:"سبتمبر 2025",j7_title:"لماذا عنبر بالي هو أقدم الأحجار الكريمة في العالم",j7_body:"على عكس الماس، العنبر عضوي — راتنج متحجر من غابات اختفت منذ 40 مليون سنة.",j8_date:"أغسطس 2025",j8_title:"حرفيو أوبود: الأيدي خلف كل قطعة AMBERRA",j8_body:"في ورش أوبود، يقضي صاغة الفضة البالينيون سنوات في إتقان فن تطعيم العنبر.",j9_date:"يوليو 2025",j9_title:"العنبر والطاقة الأنثوية: الروابط الروحية القديمة",j9_body:"ربطت الثقافات البلطيقية العنبر بإلهة البحر. في بالي يُرتدى للحماية وإيقاظ الطاقة.",c_lbl:"مواعيد خاصة",c_title:"طلب<br><em>استشارة شخصية</em>",c_body:"سيرشدك فريقنا في بالي شخصياً إلى القطعة المثالية.",fc_coll:"المجموعات",fc_srv:"الخدمات",fc_contact:"تواصل معنا",req_btn:"طلب قطعة",req_title:"طلب قطعة",req_sub:"أخبرنا بالقطعة التي لفتت انتباهك وسنتواصل معك من بالي خلال 24 ساعة.",f_piece:"القطعة المطلوبة",f_name:"اسمك",f_email:"البريد الإلكتروني",f_phone:"واتساب (اختياري)",f_msg:"الرسالة",req_send:"إرسال الطلب",req_thanks:"شكراً لك ✦",req_thanks_sub:"سنتواصل معك خلال 24 ساعة. أطيب التحيات من بالي.",qm_title:"اعثر على عنبري",qm_sub:"5 أسئلة · دقيقتان · تطابق مثالي",q_next:"التالي",ep_title:"هدية من Amberra",ep_sub:"انضم إلى عالمنا — احصل على خصم 10% على طلبك الأول",ep_ph:"عنوان بريدك الإلكتروني",ep_btn:"احصل على العرض",ep_note:"لا بريد مزعج أبداً. إلغاء الاشتراك في أي وقت.",ep_thanks:"✦ مرحباً بك في Amberra ✦",ep_thanks_sub:"كود خصم 10% في طريقه إليك",chat_lbl:"اسألنا أي شيء",chat_status:"متصل · بالي، إندونيسيا",chat_welcome:"مرحباً! أنا مرشدك الشخصي في AMBERRA. كيف يمكنني مساعدتك في العثور على القطعة المثالية اليوم؟",cq1:"مقاسات الخواتم",cq2:"معلومات الشحن",cq3:"دليل العناية",cq4:"أفكار الهدايا",chat_ph:"اسأل أي شيء...",cont_btn:"متابعة التصفح"},
  ja:{util_store:"店舗を探す",util_services:"サービス",util_contact:"お問い合わせ",util_account:"マイアカウント",util_wishlist:"ウィッシュリスト",search_ph:"検索",nav_collections:"コレクション",nav_rings:"リング",nav_earrings:"ピアス",nav_pendants:"ペンダント",nav_bracelets:"ブレスレット",nav_journal:"ジャーナル",nav_about:"私たちのストーリー",nav_tryon:"バーチャル試着",nav_wholesale:"卸売",hero_tag:"バリ島 · 2026年新コレクション",hero_title:"<em>太古の</em><br>世界から<br>届く琥珀",hero_desc:"数百万年の時を経て生まれた天然バルト海琥珀。バリ島にて、聖なる意図をもって丁寧に手作りされています。",hero_cta:"コレクションを探る",hero_cta2:"全ジュエリー",tick1:"天然バルト海琥珀",tick2:"バリ島手作り",tick3:"925スターリングシルバー",tick4:"神聖な儀式の祝福",tick5:"無料ギフトラッピング",coll_lbl:"私たちの世界",coll_title:"コレクション",coll_all:"全作品を見る",cat_rings:"コレクション",cat_earrings:"コレクション",cat_pendants:"コレクション",cat_bracelets:"コレクション",cat_chains:"コレクション",col_rings:"リング",col_earrings:"ピアス",col_pendants:"ペンダント",col_bracelets:"ブレスレット",col_chains:"チェーン",nav_chains:"チェーン",f_chains:"チェーン",discover:"発見する",ed_lbl:"職人技",ed_title:"<em>太古の大地</em>から生まれた",ed_body1:"琥珀はただの石ではありません――それは結晶化した時間です。森、虫、光、そして雨が刻まれた四千万年の歳月が、ひとつの石に封じ込められています。",ed_body2:"バリ島の職人たちは、琥珀を敬うことを学ぶために一生を捧げています。すべての作品は、あなたの手元に届く前に、水と火と祈りを通り抜けます。",stat1:"琥珀の年数",stat2:"唯一無二の作品",stat3:"言語",tryon_lbl:"新機能",tryon_title:"購入前に<br><em>バーチャル試着</em>",tryon_desc:"写真をアップロードして、各AMBERRA作品があなたにどのように見えるか確認できます。",tryon_cta:"写真をアップロード",tryon_badge:"AR試着",tryon_hint:"写真をアップロードして開始",quiz_title:"私の琥珀を見つける",quiz_sub:"5つの質問に答えて、あなたにぴったりの作品を見つけましょう",quiz_cta:"クイズを始める",cat_lbl:"コレクション",cat_title:"全ジュエリー",f_all:"すべて",f_rings:"リング",f_earrings:"ピアス",f_pendants:"ペンダント",f_bracelets:"ブレスレット",j_lbl:"インサイト",j_title:"琥珀の<em>ジャーナル</em>",j_all:"全記事を見る",j1_date:"2026年3月",j1_title:"琥珀がエネルギーを運ぶ方法：バリ島の視点",j1_body:"バリ島では、琥珀は太陽そのものの蓄えられた光を運ぶと信じられています。",j2_date:"2026年2月",j2_title:"琥珀のお手入れ：永遠の美しさへのガイド",j2_body:"天然琥珀は光、触れ合い、そしてケアに応える生きた素材です。",j3_date:"2026年1月",j3_title:"バルト海の森からバリ島の海岸への旅",j3_body:"リトアニアの森からウブドの工房へ――驚くべき旅の物語。",j4_date:"2025年12月",j4_title:"本物のバリ琥珀と偽物の見分け方：5つの簡単なテスト",j4_body:"塩水、紫外線、匂いのテストでバリ産琥珀の真偽をすぐに確認できます。",j5_date:"2025年11月",j5_title:"今シーズンの琥珀ジュエリースタイル5選",j5_body:"重ねつけゴールドチェーンからミニマルリングまで、天然琥珀はあらゆるスタイルに映えます。",j6_date:"2025年10月",j6_title:"黄金のスペクトル：琥珀の色とその意味",j6_body:"コニャックからチェリーまで、バリ産琥珀の各色調は異なる地質学的物語を語ります。",j7_date:"2025年9月",j7_title:"なぜバリ産琥珀が世界最古の宝石なのか",j7_body:"ダイヤモンドと異なり、琥珀は有機的——4000万年前の森の化石樹脂です。",j8_date:"2025年8月",j8_title:"ウブドの職人：すべてのAMBERRA作品の背後にある手",j8_body:"ウブドの田んぼスタジオで、バリのシルバースミスたちは琥珀の装飾技術を磨いています。",j9_date:"2025年7月",j9_title:"琥珀と女性エネルギー：古代の霊的なつながり",j9_body:"バルト文化では琥珀を海の女神と結びつけました。バリでは保護と女性エネルギー覚醒のために着用されます。",c_lbl:"プライベート予約",c_title:"<em>パーソナル相談</em>を<br>リクエスト",c_body:"バリ島のチームが、あなただけの完璧な一品へ個別にご案内いたします。",fc_coll:"コレクション",fc_srv:"サービス",fc_contact:"お問い合わせ",req_btn:"作品をリクエスト",req_title:"作品をリクエスト",req_sub:"気になった作品を教えてください。24時間以内にバリよりご連絡いたします。",f_piece:"ご興味のある作品",f_name:"お名前",f_email:"メールアドレス",f_phone:"WhatsApp（任意）",f_msg:"メッセージ",req_send:"リクエストを送信",req_thanks:"ありがとうございます ✦",req_thanks_sub:"24時間以内にご連絡いたします。バリ島より心を込めて。",qm_title:"私の琥珀を見つける",qm_sub:"5つの質問 · 2分間 · 完璧なマッチング",q_next:"次へ",ep_title:"Amberraからの贈り物",ep_sub:"私たちの世界へようこそ――初回ご注文10%オフ",ep_ph:"メールアドレス",ep_btn:"オファーを受け取る",ep_note:"迷惑メールは一切ありません。いつでも配信停止可能。",ep_thanks:"✦ Amberraへようこそ ✦",ep_thanks_sub:"10%割引コードをお送りしました",chat_lbl:"何でもお聞きください",chat_status:"オンライン · バリ島、インドネシア",chat_welcome:"こんにちは！私はあなた専属のAMBERRAガイドです。今日、完璧な一品をお探しするお手伝いをさせてください。",cq1:"リングサイズ",cq2:"配送情報",cq3:"お手入れガイド",cq4:"ギフトアイデア",chat_ph:"何でもお気軽に...",cont_btn:"ショッピングを続ける"},
  ko:{util_store:"매장 찾기",util_services:"서비스",util_contact:"문의하기",util_account:"내 계정",util_wishlist:"위시리스트",search_ph:"검색",nav_collections:"컬렉션",nav_rings:"링",nav_earrings:"귀걸이",nav_pendants:"펜던트",nav_bracelets:"브레이슬릿",nav_journal:"저널",nav_about:"우리 이야기",nav_tryon:"가상 착용",nav_wholesale:"도매",hero_tag:"발리 · 2026 신규 컬렉션",hero_title:"<em>고대</em><br>세계의<br>호박",hero_desc:"수백만 년의 세월이 빚어낸 천연 발트해 호박. 발리에서 신성한 의도를 담아 손수 제작되었습니다.",hero_cta:"컬렉션 탐색",hero_cta2:"전체 주얼리",tick1:"천연 발트해 호박",tick2:"발리 핸드크래프트",tick3:"925 스털링 실버",tick4:"신성한 의식 축복",tick5:"무료 선물 포장",coll_lbl:"우리의 세계",coll_title:"컬렉션",coll_all:"모든 작품 보기",cat_rings:"컬렉션",cat_earrings:"컬렉션",cat_pendants:"컬렉션",cat_bracelets:"컬렉션",cat_chains:"컬렉션",col_rings:"링",col_earrings:"귀걸이",col_pendants:"펜던트",col_bracelets:"브레이슬릿",col_chains:"체인",nav_chains:"체인",f_chains:"체인",discover:"발견하기",ed_lbl:"장인 정신",ed_title:"<em>고대 대지</em>에서탄생하다",ed_body1:"호박은 단순한 돌이 아닙니다 — 그것은 결정화된 시간입니다. 사천만 년의 숲과 곤충, 빛과 비가 하나의 돌 안에 고스란히 보존되어 있습니다.",ed_body2:"발리의 장인들은 호박을 경외하는 법을 배우기 위해 평생을 바칩니다. 모든 작품은 물과 불과 기도를 거쳐 당신의 손에 닿습니다.",stat1:"호박의 연수",stat2:"유니크한 작품",stat3:"언어",tryon_lbl:"새로운 기능",tryon_title:"구매 전<br><em>가상 착용</em>",tryon_desc:"사진을 업로드하여 각 AMBERRA 작품이 당신에게 어떻게 어울리는지 확인하세요.",tryon_cta:"사진 업로드",tryon_badge:"AR 착용",tryon_hint:"시작하려면 사진을 업로드하세요",quiz_title:"나의 호박 찾기",quiz_sub:"5가지 질문에 답하고 완벽한 작품을 발견하세요",quiz_cta:"퀴즈 시작",cat_lbl:"컬렉션",cat_title:"전체 주얼리",f_all:"전체",f_rings:"링",f_earrings:"귀걸이",f_pendants:"펜던트",f_bracelets:"브레이슬릿",j_lbl:"인사이트",j_title:"호박 <em>저널</em>",j_all:"모든 기사 보기",j1_date:"2026년 3월",j1_title:"호박이 에너지를 담는 방법: 발리의 시각",j1_body:"발리에서는 호박이 태양 자체의 저장된 빛을 담고 있다고 믿습니다.",j2_date:"2026년 2월",j2_title:"호박 관리 방법: 영원한 아름다움 가이드",j2_body:"천연 호박은 빛, 촉감, 관리에 반응하는 살아있는 소재입니다.",j3_date:"2026년 1월",j3_title:"발트해 숲에서 발리 해안까지의 여정",j3_body:"리투아니아의 숲에서 우붓의 작업실까지 — 놀라운 여정.",j4_date:"2025년 12월",j4_title:"진짜 발리 호박 vs 가짜 구별법: 5가지 간단한 테스트",j4_body:"소금물, 자외선, 냄새 테스트로 발리 호박의 진품 여부를 즉시 확인하세요.",j5_date:"2025년 11월",j5_title:"이번 시즌 호박 주얼리 5가지 스타일링 방법",j5_body:"레이어드 골드 체인부터 미니멀 링까지, 천연 호박은 어떤 스타일과도 잘 어울립니다.",j6_date:"2025년 10월",j6_title:"황금빛 스펙트럼: 호박의 색상과 의미 이해하기",j6_body:"코냑부터 체리까지, 발리 호박의 각 색조는 서로 다른 지질학적 이야기를 담고 있습니다.",j7_date:"2025년 9월",j7_title:"발리 호박이 세계에서 가장 오래된 보석인 이유",j7_body:"다이아몬드와 달리 호박은 유기물——4000만 년 전 사라진 숲의 화석 수지입니다.",j8_date:"2025년 8월",j8_title:"우붓의 장인들: 모든 AMBERRA 작품 뒤에 있는 손",j8_body:"우붓의 논밭 스튜디오에서 발리 은세공사들은 호박을 세팅하는 기술을 연마하고 있습니다.",j9_date:"2025년 7월",j9_title:"호박과 여성적 에너지: 고대 영적 연결",j9_body:"발트 문화는 호박을 바다의 여신과 연결했습니다. 발리에서는 보호와 여성 에너지 각성을 위해 착용합니다.",c_lbl:"프라이빗 예약",c_title:"<em>개인 상담</em><br>요청",c_body:"발리에 있는 저희 팀이 완벽한 작품으로 직접 안내해 드립니다.",fc_coll:"컬렉션",fc_srv:"서비스",fc_contact:"문의",req_btn:"작품 문의",req_title:"작품 문의",req_sub:"어떤 작품이 마음에 드셨는지 알려주세요. 24시간 내에 발리에서 연락드리겠습니다.",f_piece:"관심 있는 작품",f_name:"성함",f_email:"이메일",f_phone:"WhatsApp (선택)",f_msg:"메시지",req_send:"요청 보내기",req_thanks:"감사합니다 ✦",req_thanks_sub:"24시간 이내에 연락드리겠습니다. 발리에서 따뜻한 안부를 전합니다.",qm_title:"나의 호박 찾기",qm_sub:"5가지 질문 · 2분 · 완벽한 매칭",q_next:"다음",ep_title:"Amberra의 선물",ep_sub:"우리의 세계에 합류하세요 — 첫 주문 10% 할인",ep_ph:"이메일 주소",ep_btn:"혜택 받기",ep_note:"스팸은 절대 없습니다. 언제든지 구독 취소 가능.",ep_thanks:"✦ Amberra에 오신 것을 환영합니다 ✦",ep_thanks_sub:"10% 할인 코드가 발송되었습니다",chat_lbl:"무엇이든 물어보세요",chat_status:"온라인 · 발리, 인도네시아",chat_welcome:"안녕하세요! 저는 당신의 전담 AMBERRA 가이드입니다. 오늘 완벽한 작품을 찾는 데 어떻게 도움을 드릴까요?",cq1:"반지 사이즈",cq2:"배송 정보",cq3:"관리 가이드",cq4:"선물 아이디어",chat_ph:"무엇이든 물어보세요...",cont_btn:"계속 쇼핑하기"},
  it:{util_store:"Trova un Negozio",util_services:"Servizi",util_contact:"Contattaci",util_account:"Il Mio Account",util_wishlist:"Lista Desideri",search_ph:"Cerca",nav_collections:"Collezioni",nav_rings:"Anelli",nav_earrings:"Orecchini",nav_pendants:"Ciondoli",nav_bracelets:"Bracciali",nav_journal:"Rivista",nav_about:"La Nostra Storia",nav_tryon:"Prova Virtuale",nav_wholesale:"Vendita Ingrosso",hero_tag:"Bali · Nuova Collezione 2026",hero_title:"Ambra dall'<br><em>Antico</em><br>Mondo",hero_desc:"Ambra baltica naturale, formata nel corso di milioni di anni. Lavorata artigianalmente a Bali con sacra intenzione.",hero_cta:"Esplora le Collezioni",hero_cta2:"Tutti i Gioielli",tick1:"Ambra Baltica Naturale",tick2:"Artigianato Balinese",tick3:"Argento Sterling 925",tick4:"Benedizione Rituale Sacra",tick5:"Confezione Regalo Gratuita",coll_lbl:"Il Nostro Universo",coll_title:"Collezioni",coll_all:"Vedi tutti i pezzi",cat_rings:"Collezione",cat_earrings:"Collezione",cat_pendants:"Collezione",cat_bracelets:"Collezione",cat_chains:"Collezione",col_rings:"Anelli",col_earrings:"Orecchini",col_pendants:"Ciondoli",col_bracelets:"Bracciali",col_chains:"Catene",nav_chains:"Catenine",f_chains:"Catene",discover:"Scopri",ed_lbl:"L'Artigianato",ed_title:"Nato dalla<em>Terra Antica</em>",ed_body1:"L'ambra non è semplicemente una pietra — è il tempo cristallizzato. Quaranta milioni di anni di foreste, insetti, luce e pioggia conservati in un'unica pietra.",ed_body2:"I nostri artigiani a Bali dedicano una vita intera a onorarla. Ogni pezzo attraversa acqua, fuoco e preghiera prima di giungere a voi.",stat1:"Anni dell'ambra",stat2:"Pezzi unici",stat3:"Lingue",tryon_lbl:"Nuova Funzione",tryon_title:"Prova<br><em>Prima di Acquistare</em>",tryon_desc:"Carica la tua foto e scopri come ogni pezzo AMBERRA ti si addice.",tryon_cta:"Carica la Tua Foto",tryon_badge:"Prova AR",tryon_hint:"Carica una foto per iniziare",quiz_title:"Trova la Mia Ambra",quiz_sub:"Rispondi a 5 domande — scopri il tuo pezzo perfetto",quiz_cta:"Inizia il Quiz",cat_lbl:"La Collezione",cat_title:"Tutti i Gioielli",f_all:"Tutti",f_rings:"Anelli",f_earrings:"Orecchini",f_pendants:"Ciondoli",f_bracelets:"Bracciali",j_lbl:"Approfondimenti",j_title:"Il <em>Giornale</em> dell'Ambra",j_all:"Vedi tutti gli articoli",j1_date:"Marzo 2026",j1_title:"Come l'Ambra Porta Energia: Una Prospettiva Balinese",j1_body:"A Bali, si crede che l'ambra porti la luce immagazzinata del sole stesso.",j2_date:"Febbraio 2026",j2_title:"Prendersi Cura della Tua Ambra: Una Guida alla Bellezza Eterna",j2_body:"L'ambra naturale è un materiale vivo che risponde alla luce, al tocco e alle cure.",j3_date:"Gennaio 2026",j3_title:"Il Viaggio dalle Foreste Baltiche alle Coste di Bali",j3_body:"Dalle foreste della Lituania ai laboratori di Ubud — un viaggio straordinario.",j4_date:"Dicembre 2025",j4_title:"Come distinguere il vero ambra dal falso: 5 test semplici",j4_body:"L'acqua salata, la luce UV e il test dell'odore rivelano istantaneamente l'autenticità.",j5_date:"Novembre 2025",j5_title:"5 modi per abbinare i gioielli in ambra questa stagione",j5_body:"Dalle catene dorate sovrapposte agli anelli minimalisti, l'ambra naturale si abbina a qualsiasi stile.",j6_date:"Ottobre 2025",j6_title:"Lo spettro dorato: capire i colori dell'ambra",j6_body:"Dal cognac al ciliegio, ogni sfumatura dell'ambra di Bali racconta una diversa storia geologica.",j7_date:"Settembre 2025",j7_title:"Perché l'ambra di Bali è la gemma più antica del mondo",j7_body:"A differenza dei diamanti, l'ambra è organica — resina fossilizzata di foreste scomparse 40 milioni di anni fa.",j8_date:"Agosto 2025",j8_title:"Gli artigiani di Ubud: le mani dietro ogni pezzo AMBERRA",j8_body:"Nei laboratori di Ubud, gli argentieri balinesi trascorrono anni a perfezionare l'arte di incastonare l'ambra.",j9_date:"Luglio 2025",j9_title:"Ambra ed energia femminile: l'antica connessione spirituale",j9_body:"Le culture baltiche associavano l'ambra alla dea del mare. A Bali viene indossata per protezione e risveglio.",c_lbl:"Appuntamenti Privati",c_title:"Richiedi<br><em>una Consulenza Personale</em>",c_body:"Il nostro team a Bali ti guiderà personalmente verso il pezzo perfetto.",fc_coll:"Collezioni",fc_srv:"Servizi",fc_contact:"Contatti",req_btn:"Richiedi un Pezzo",req_title:"Richiedi un Pezzo",req_sub:"Dicci quale pezzo ha catturato la tua attenzione e ti contatteremo da Bali entro 24 ore.",f_piece:"Pezzo d'Interesse",f_name:"Il Tuo Nome",f_email:"Email",f_phone:"WhatsApp (opzionale)",f_msg:"Messaggio",req_send:"Invia Richiesta",req_thanks:"Grazie ✦",req_thanks_sub:"Ti contatteremo entro 24 ore. Cordiali saluti da Bali.",qm_title:"Trova la Mia Ambra",qm_sub:"5 domande · 2 minuti · Abbinamento perfetto",q_next:"Avanti",ep_title:"Un Dono di Amberra",ep_sub:"Entra nel nostro mondo — ricevi il 10% di sconto sul tuo primo ordine",ep_ph:"Il tuo indirizzo email",ep_btn:"Ottieni l'Offerta",ep_note:"Nessuno spam, mai. Annulla l'iscrizione in qualsiasi momento.",ep_thanks:"✦ Benvenuto in Amberra ✦",ep_thanks_sub:"Il tuo codice sconto del 10% è in arrivo",chat_lbl:"Chiedici Tutto",chat_status:"Online · Bali, Indonesia",chat_welcome:"Ciao! Sono la tua guida personale AMBERRA. Come posso aiutarti a trovare il pezzo perfetto oggi?",cq1:"Taglie anelli",cq2:"Informazioni spedizione",cq3:"Guida alla cura",cq4:"Idee regalo",chat_ph:"Chiedi qualsiasi cosa...",cont_btn:"Continua a Navigare"},
  tr:{util_store:"Mağaza Bul",util_services:"Hizmetler",util_contact:"İletişim",util_account:"Hesabım",util_wishlist:"İstek Listesi",search_ph:"Ara",nav_collections:"Koleksiyonlar",nav_rings:"Yüzükler",nav_earrings:"Küpeler",nav_pendants:"Kolyeler",nav_bracelets:"Bilezikler",nav_journal:"Dergi",nav_about:"Hikayemiz",nav_tryon:"Sanal Deneme",nav_wholesale:"Toptan Satış",hero_tag:"Bali · Yeni Koleksiyon 2026",hero_title:"<em>Antik</em><br>Dünyadan<br>Kehribar",hero_desc:"Milyonlarca yılda oluşan doğal Baltık kehribarı. Bali'de kutsal bir niyetle el işçiliğiyle yaratıldı.",hero_cta:"Koleksiyonları Keşfet",hero_cta2:"Tüm Mücevherler",tick1:"Doğal Baltık Kehribarı",tick2:"Bali El İşçiliği",tick3:"925 Ayar Gümüş",tick4:"Kutsal Ritüel Kutsama",tick5:"Ücretsiz Hediye Paketleme",coll_lbl:"Evrenimiz",coll_title:"Koleksiyonlar",coll_all:"Tüm parçaları görüntüle",cat_rings:"Koleksiyon",cat_earrings:"Koleksiyon",cat_pendants:"Koleksiyon",cat_bracelets:"Koleksiyon",cat_chains:"Koleksiyon",col_rings:"Yüzükler",col_earrings:"Küpeler",col_pendants:"Kolyeler",col_bracelets:"Bilezikler",col_chains:"Zincirler",nav_chains:"Zincirler",f_chains:"Zincirler",discover:"Keşfet",ed_lbl:"Zanaat",ed_title:"<em>Kadim Topraklardan</em>Doğan",ed_body1:"Kehribar yalnızca bir taş değildir — kristalleşmiş zamandır. Kırk milyon yıllık ormanlar, böcekler, ışık ve yağmur tek bir taşta korunmuştur.",ed_body2:"Bali'deki ustalarımız, ona saygı göstermeyi öğrenmek için ömürlerini harcarlar. Her parça size ulaşmadan önce su, ateş ve duadan geçer.",stat1:"Kehribar yılları",stat2:"Eşsiz parçalar",stat3:"Diller",tryon_lbl:"Yeni Özellik",tryon_title:"Satın Almadan<br><em>Önce Dene</em>",tryon_desc:"Fotoğrafınızı yükleyin ve her AMBERRA parçasının size nasıl göründüğünü görün.",tryon_cta:"Fotoğrafınızı Yükleyin",tryon_badge:"AR Deneme",tryon_hint:"Başlamak için fotoğraf yükleyin",quiz_title:"Kehribarımı Bul",quiz_sub:"5 soruyu yanıtla — mükemmel parçanı keşfet",quiz_cta:"Quizi Başlat",cat_lbl:"Koleksiyon",cat_title:"Tüm Mücevherler",f_all:"Tümü",f_rings:"Yüzükler",f_earrings:"Küpeler",f_pendants:"Kolyeler",f_bracelets:"Bilezikler",j_lbl:"Bakış Açıları",j_title:"Kehribar <em>Dergisi</em>",j_all:"Tüm makaleleri görüntüle",j1_date:"Mart 2026",j1_title:"Kehribar Enerjiyi Nasıl Taşır: Balinezce Bir Perspektif",j1_body:"Bali'de kehribarın güneşin depolanmış ışığını taşıdığına inanılır.",j2_date:"Şubat 2026",j2_title:"Kehribarınıza Nasıl Bakılır: Ebedi Güzellik Rehberi",j2_body:"Doğal kehribar, ışığa, dokunuşa ve bakıma tepki veren canlı bir malzemedir.",j3_date:"Ocak 2026",j3_title:"Baltık Ormanlarından Bali Kıyılarına Yolculuk",j3_body:"Litvanya ormanlarından Ubud atölyelerine — olağanüstü bir yolculuk.",j4_date:"Aralık 2025",j4_title:"Gerçek Bali Kehribarını Sahte Olandan Ayırt Etme: 5 Basit Test",j4_body:"Tuzlu su, UV ışığı ve koku testi gerçek Bali kehribarının özgünlüğünü anında ortaya çıkarır.",j5_date:"Kasım 2025",j5_title:"Bu Sezon Kehribar Takıları Stilize Etmenin 5 Yolu",j5_body:"Katmanlı altın zincirlerden minimalist yüzüklere kadar doğal kehribar her tarza uyum sağlar.",j6_date:"Ekim 2025",j6_title:"Altın Spektrum: Kehribar Renklerini ve Anlamlarını Anlamak",j6_body:"Konyaktan kirazya kadar Bali kehribarının her tonu farklı bir jeolojik hikaye anlatır.",j7_date:"Eylül 2025",j7_title:"Bali Kehribarı Neden Dünyanın En Eski Taşıdır",j7_body:"Elmasların aksine kehribar organiktir — 40 milyon yıl önce yok olan ormanların fosilleşmiş reçinesi.",j8_date:"Ağustos 2025",j8_title:"Ubud Zanaatkarları: Her AMBERRA Parçasının Arkasındaki Eller",j8_body:"Ubud'un stüdyolarında Balili gümüş ustalar, kehribar yuvarlama sanatında yıllarını geçirir.",j9_date:"Temmuz 2025",j9_title:"Kehribar ve Kadın Enerjisi: Kadim Ruhsal Bağlantı",j9_body:"Baltık kültürleri kehribarı deniz tanrıçasıyla ilişkilendirdi. Bali'de koruma ve enerjinin uyanışı için giyilir.",c_lbl:"Özel Randevular",c_title:"Kişisel Danışma<br><em>Talebi</em>",c_body:"Bali'deki ekibimiz sizi kişisel olarak mükemmel parçaya yönlendirecek.",fc_coll:"Koleksiyonlar",fc_srv:"Hizmetler",fc_contact:"İletişim",req_btn:"Parça Talep Et",req_title:"Parça Talep Et",req_sub:"Hangi parçanın ilginizi çektiğini bize söyleyin, 24 saat içinde Bali'den sizinle iletişime geçeceğiz.",f_piece:"İlgilendiğiniz Parça",f_name:"Adınız",f_email:"E-posta",f_phone:"WhatsApp (isteğe bağlı)",f_msg:"Mesaj",req_send:"Talep Gönder",req_thanks:"Teşekkürler ✦",req_thanks_sub:"24 saat içinde sizinle iletişime geçeceğiz. Bali'den sıcak selamlar.",qm_title:"Kehribarımı Bul",qm_sub:"5 soru · 2 dakika · Mükemmel eşleşme",q_next:"İleri",ep_title:"Amberra'dan Bir Hediye",ep_sub:"Dünyamıza katılın — ilk siparişinizde %10 indirim",ep_ph:"E-posta adresiniz",ep_btn:"Teklifi Al",ep_note:"Asla spam yok. İstediğiniz zaman aboneliği iptal edin.",ep_thanks:"✦ Amberra'ya Hoş Geldiniz ✦",ep_thanks_sub:"%10 indirim kodunuz yolda",chat_lbl:"Her Şeyi Sorun",chat_status:"Çevrimiçi · Bali, Endonezya",chat_welcome:"Merhaba! Ben sizin kişisel AMBERRA rehberinizim. Bugün mükemmel parçayı bulmanıza nasıl yardımcı olabilirim?",cq1:"Yüzük bedenleri",cq2:"Kargo bilgisi",cq3:"Bakım rehberi",cq4:"Hediye fikirleri",chat_ph:"Her şeyi sorabilirsiniz...",cont_btn:"Gezmeye Devam Et"},
  hi:{util_store:"स्टोर खोजें",util_services:"सेवाएं",util_contact:"संपर्क करें",util_account:"मेरा खाता",util_wishlist:"विशलिस्ट",search_ph:"खोजें",nav_collections:"संग्रह",nav_rings:"अंगूठियाँ",nav_earrings:"कर्णफूल",nav_pendants:"लटकन",nav_bracelets:"कंगन",nav_journal:"पत्रिका",nav_about:"हमारी कहानी",nav_tryon:"वर्चुअल ट्राय-ऑन",nav_wholesale:"थोक",hero_tag:"बाली · नया संग्रह 2026",hero_title:"<em>प्राचीन</em><br>विश्व का<br>एम्बर",hero_desc:"लाखों वर्षों में निर्मित प्राकृतिक बाल्टिक एम्बर। बाली में पवित्र भावना के साथ हस्तनिर्मित।",hero_cta:"संग्रह देखें",hero_cta2:"सभी आभूषण",tick1:"प्राकृतिक बाल्टिक एम्बर",tick2:"बाली में हस्तनिर्मित",tick3:"925 स्टर्लिंग सिल्वर",tick4:"पवित्र अनुष्ठान आशीर्वाद",tick5:"निःशुल्क उपहार रैपिंग",coll_lbl:"हमारा संसार",coll_title:"संग्रह",coll_all:"सभी कृतियाँ देखें",cat_rings:"संग्रह",cat_earrings:"संग्रह",cat_pendants:"संग्रह",cat_bracelets:"संग्रह",cat_chains:"संग्रह",col_rings:"अंगूठियाँ",col_earrings:"कर्णफूल",col_pendants:"लटकन",col_bracelets:"कंगन",col_chains:"चेन",nav_chains:"चेन",f_chains:"चेन",discover:"खोजें",ed_lbl:"शिल्पकारिता",ed_title:"<em>प्राचीन पृथ्वी</em> सेजन्मा",ed_body1:"एम्बर केवल एक पत्थर नहीं है — यह क्रिस्टलीकृत समय है। चार करोड़ वर्षों के वन, कीट, प्रकाश और वर्षा एक ही पत्थर में संरक्षित हैं।",ed_body2:"बाली के हमारे कारीगर इसे सम्मान देना सीखने में अपना जीवन समर्पित करते हैं। प्रत्येक कृति आप तक पहुँचने से पहले जल, अग्नि और प्रार्थना से गुज़रती है।",stat1:"एम्बर के वर्ष",stat2:"अद्वितीय कृतियाँ",stat3:"भाषाएँ",tryon_lbl:"नई सुविधा",tryon_title:"खरीदने से पहले<br><em>पहनकर देखें</em>",tryon_desc:"अपनी फ़ोटो अपलोड करें और देखें कि AMBERRA की प्रत्येक कृति आप पर कैसी दिखती है।",tryon_cta:"अपनी फ़ोटो अपलोड करें",tryon_badge:"AR ट्राय-ऑन",tryon_hint:"शुरू करने के लिए फ़ोटो अपलोड करें",quiz_title:"मेरा एम्बर खोजें",quiz_sub:"5 प्रश्नों के उत्तर दें — अपनी परफेक्ट कृति खोजें",quiz_cta:"क्विज़ शुरू करें",cat_lbl:"संग्रह",cat_title:"सभी आभूषण",f_all:"सभी",f_rings:"अंगूठियाँ",f_earrings:"कर्णफूल",f_pendants:"लटकन",f_bracelets:"कंगन",j_lbl:"अंतर्दृष्टि",j_title:"एम्बर <em>पत्रिका</em>",j_all:"सभी लेख देखें",j1_date:"मार्च 2026",j1_title:"एम्बर ऊर्जा कैसे वहन करता है: एक बालीनी दृष्टिकोण",j1_body:"बाली में माना जाता है कि एम्बर सूर्य के संचित प्रकाश को वहन करता है।",j2_date:"फरवरी 2026",j2_title:"अपने एम्बर की देखभाल: शाश्वत सौंदर्य की मार्गदर्शिका",j2_body:"प्राकृतिक एम्बर एक जीवंत सामग्री है जो प्रकाश, स्पर्श और देखभाल के प्रति संवेदनशील है।",j3_date:"जनवरी 2026",j3_title:"बाल्टिक वनों से बाली के तटों तक की यात्रा",j3_body:"लिथुआनिया के वनों से उबुद की कार्यशालाओं तक — एक अविस्मरणीय यात्रा।",j4_date:"दिसंबर 2025",j4_title:"असली बाली एम्बर को नकली से कैसे पहचानें: 5 सरल परीक्षण",j4_body:"नमक पानी, UV प्रकाश और गंध परीक्षण तुरंत असलियत उजागर कर देते हैं।",j5_date:"नवंबर 2025",j5_title:"इस सीज़न एम्बर ज्वेलरी पहनने के 5 तरीके",j5_body:"लेयर्ड गोल्ड चेन से लेकर मिनिमलिस्ट रिंग तक, प्राकृतिक एम्बर हर स्टाइल में फिट बैठता है।",j6_date:"अक्टूबर 2025",j6_title:"सुनहरा स्पेक्ट्रम: एम्बर रंगों को समझना",j6_body:"कॉन्यैक से चेरी तक, बाली एम्बर का हर रंग एक अलग भूवैज्ञानिक कहानी कहता है।",j7_date:"सितंबर 2025",j7_title:"बाली एम्बर दुनिया का सबसे पुराना रत्न क्यों है",j7_body:"हीरों के विपरीत, एम्बर जैविक है — 4 करोड़ साल पहले गायब हुए जंगलों का जीवाश्म राल।",j8_date:"अगस्त 2025",j8_title:"उबुड के कारीगर: प्रत्येक AMBERRA टुकड़े के पीछे के हाथ",j8_body:"उबुड के स्टूडियो में बाली के चांदी-कारीगर एम्बर जड़ाई की कला में वर्षों लगाते हैं।",j9_date:"जुलाई 2025",j9_title:"एम्बर और स्त्री ऊर्जा: प्राचीन आध्यात्मिक संबंध",j9_body:"बाल्टिक संस्कृतियां एम्बर को समुद्री देवी से जोड़ती थीं। बाली में इसे सुरक्षा और शक्ति के लिए पहना जाता है।",c_lbl:"निजी नियुक्तियाँ",c_title:"<em>व्यक्तिगत परामर्श</em><br>का अनुरोध करें",c_body:"बाली में हमारी टीम आपको व्यक्तिगत रूप से परफेक्ट कृति की ओर मार्गदर्शन करेगी।",fc_coll:"संग्रह",fc_srv:"सेवाएँ",fc_contact:"संपर्क",req_btn:"कृति का अनुरोध करें",req_title:"कृति का अनुरोध करें",req_sub:"हमें बताएं कि आपको कौन सा टुकड़ा पसंद आया और हम 24 घंटे के भीतर बाली से संपर्क करेंगे।",f_piece:"रुचि की कृति",f_name:"आपका नाम",f_email:"ईमेल",f_phone:"WhatsApp (वैकल्पिक)",f_msg:"संदेश",req_send:"अनुरोध भेजें",req_thanks:"धन्यवाद ✦",req_thanks_sub:"हम 24 घंटों के भीतर संपर्क करेंगे। बाली से हार्दिक शुभकामनाएँ।",qm_title:"मेरा एम्बर खोजें",qm_sub:"5 प्रश्न · 2 मिनट · परफेक्ट मैच",q_next:"अगला",ep_title:"Amberra की ओर से एक उपहार",ep_sub:"हमारी दुनिया में शामिल हों — अपने पहले ऑर्डर पर 10% छूट पाएँ",ep_ph:"आपका ईमेल पता",ep_btn:"ऑफर प्राप्त करें",ep_note:"कभी स्पैम नहीं। कभी भी सदस्यता रद्द करें।",ep_thanks:"✦ Amberra में आपका स्वागत है ✦",ep_thanks_sub:"आपका 10% कोड रास्ते में है",chat_lbl:"कुछ भी पूछें",chat_status:"ऑनलाइन · बाली, इंडोनेशिया",chat_welcome:"नमस्ते! मैं आपका व्यक्तिगत AMBERRA मार्गदर्शक हूँ। आज मैं आपको परफेक्ट कृति खोजने में कैसे मदद कर सकता हूँ?",cq1:"अंगूठी के आकार",cq2:"शिपिंग जानकारी",cq3:"देखभाल मार्गदर्शिका",cq4:"उपहार विचार",chat_ph:"कुछ भी पूछें...",cont_btn:"ब्राउज़ करना जारी रखें"},
  ka:{util_store:"მაღაზიის პოვნა",util_services:"სერვისები",util_contact:"კონტაქტი",util_account:"ჩემი ანგარიში",util_wishlist:"სასურველი",search_ph:"ძებნა",nav_collections:"კოლექციები",nav_rings:"ბეჭდები",nav_earrings:"საყურეები",nav_pendants:"გულსაკიდები",nav_bracelets:"სამაჯურები",nav_journal:"ჟურნალი",nav_about:"ჩვენი ისტორია",nav_tryon:"ვირტუალური მოსინჯვა",nav_wholesale:"საბითუმო",hero_tag:"ბალი · ახალი კოლექცია 2026",hero_title:"ქარვა<br><em>უძველესი</em><br>სამყაროდან",hero_desc:"ბუნებრივი ბალტიისპირეთის ქარვა, მილიონობით წლის განმავლობაში ჩამოყალიბებული. ხელნაკეთი ბალიში, წმინდა განზრახვით.",hero_cta:"კოლექციების დათვალიერება",hero_cta2:"ყველა სამკაული",tick1:"ბუნებრივი ბალტიისპირეთის ქარვა",tick2:"ხელნაკეთი ბალიში",tick3:"925 სტერლინგის ვერცხლი",tick4:"წმინდა რიტუალური კურთხევა",tick5:"უფასო სასაჩუქრე შეფუთვა",coll_lbl:"ჩვენი სამყარო",coll_title:"კოლექციები",coll_all:"ყველა ნამუშევრის ნახვა",cat_rings:"კოლექცია",cat_earrings:"კოლექცია",cat_pendants:"კოლექცია",cat_bracelets:"კოლექცია",cat_chains:"კოლექცია",col_rings:"ბეჭდები",col_earrings:"საყურეები",col_pendants:"გულსაკიდები",col_bracelets:"სამაჯურები",col_chains:"ჯაჭვები",nav_chains:"ჯაჭვები",f_chains:"ჯაჭვები",discover:"აღმოჩენა",ed_lbl:"ხელოსნობა",ed_title:"დაბადებული<em>უძველეს დედამიწაზე</em>",ed_body1:"ქარვა მხოლოდ ქვა არ არის — ეს არის კრისტალიზებული დრო. ორმოცი მილიონი წლის ტყეები, მწერები, სინათლე და წვიმა შენახულია ერთ ქვაში.",ed_body2:"ჩვენი ხელოსნები ბალიში მთელ სიცოცხლეს უძღვნიან მის პატივისცემას. ყოველი ნამუშევარი გადის წყალს, ცეცხლსა და ლოცვას, სანამ თქვენამდე მიაღწევს.",stat1:"ქარვის წლები",stat2:"უნიკალური ნამუშევრები",stat3:"ენები",tryon_lbl:"ახალი ფუნქცია",tryon_title:"სცადე<br><em>ყიდვამდე</em>",tryon_desc:"ატვირთეთ თქვენი ფოტო და ნახეთ, როგორ გამოიყურება AMBERRA-ს ყოველი ნამუშევარი თქვენზე.",tryon_cta:"ატვირთეთ თქვენი ფოტო",tryon_badge:"AR მოსინჯვა",tryon_hint:"დაწყებისთვის ატვირთეთ ფოტო",quiz_title:"ჩემი ქარვის პოვნა",quiz_sub:"უპასუხეთ 5 კითხვას — აღმოაჩინეთ თქვენი სრულყოფილი ნამუშევარი",quiz_cta:"ვიქტორინის დაწყება",cat_lbl:"კოლექცია",cat_title:"ყველა სამკაული",f_all:"ყველა",f_rings:"ბეჭდები",f_earrings:"საყურეები",f_pendants:"გულსაკიდები",f_bracelets:"სამაჯურები",j_lbl:"შეხედულებები",j_title:"ქარვის <em>ჟურნალი</em>",j_all:"ყველა სტატიის ნახვა",j1_date:"მარტი 2026",j1_title:"როგორ ატარებს ქარვა ენერგიას: ბალიური პერსპექტივა",j1_body:"ბალიში სჯერათ, რომ ქარვა თავად მზის შენახულ სინათლეს ატარებს.",j2_date:"თებერვალი 2026",j2_title:"თქვენი ქარვის მოვლა: მარადიული სილამაზის სახელმძღვანელო",j2_body:"ბუნებრივი ქარვა ცოცხალი მასალაა, რომელიც სინათლეს, შეხებას და მოვლას პასუხობს.",j3_date:"იანვარი 2026",j3_title:"მოგზაურობა ბალტიის ტყეებიდან ბალის სანაპიროებამდე",j3_body:"ლიტვის ტყეებიდან უბუდის სახელოსნოებამდე — განსაცვიფრებელი მოგზაურობა.",j4_date:"დეკემბერი 2025",j4_title:"ნამდვილი ბალიური ქარვა ყალბისგან გასარჩევად: 5 მარტივი ტესტი",j4_body:"მარილიანი წყალი, UV შუქი და სუნის ტესტი მყისიერად ავლენს ავთენტურობას.",j5_date:"ნოემბერი 2025",j5_title:"ქარვის სამკაულების 5 სტაილი ამ სეზონში",j5_body:"ოქროს ჯაჭვებიდან მინიმალისტურ ბეჭდებამდე — ბუნებრივი ქარვა ყველა სტილს ემთხვევა.",j6_date:"ოქტომბერი 2025",j6_title:"ოქროს სპექტრი: ქარვის ფერების გაგება",j6_body:"კონიაკიდან ალუბლამდე, ბალიური ქარვის თითოეული ელფერი განსხვავებულ გეოლოგიურ ამბავს ყვება.",j7_date:"სექტემბერი 2025",j7_title:"რატომ არის ბალიური ქარვა მსოფლიოს უძველესი ძვირფასი ქვა",j7_body:"განსხვავებით ბრილიანტებისაგან, ქარვა ორგანულია — 40 მილიონი წლის წინ გაქრობილი ტყეების გაქვავებული ფისი.",j8_date:"აგვისტო 2025",j8_title:"უბუდის ოსტატები: თითოეული AMBERRA ნაჭრის მიღმა",j8_body:"უბუდის სახელოსნოებში ბალიელი ოქრომჭედლები წლობით სრულყოფენ ქარვის ჩასმის ხელოვნებას.",j9_date:"ივლისი 2025",j9_title:"ქარვა და ქალის ენერგია: უძველესი სულიერი კავშირი",j9_body:"ბალტიური კულტურები ქარვას ზღვის ქალღმერთთან აკავშირებდნენ. ბალიზე მას ეცვამთ დაცვისა და სიფხიზლისათვის.",c_lbl:"პირადი შეხვედრები",c_title:"<em>პერსონალური კონსულტაციის</em><br>მოთხოვნა",c_body:"ჩვენი გუნდი ბალიში პირადად გაგიძღვებათ სრულყოფილი ნამუშევრისკენ.",fc_coll:"კოლექციები",fc_srv:"სერვისები",fc_contact:"კონტაქტი",req_btn:"ნამუშევრის მოთხოვნა",req_title:"ნამუშევრის მოთხოვნა",req_sub:"მოგვიყევით, რომელი ნივთი მოგეწონათ და ჩვენ 24 საათის განმავლობაში დაგიკავშირდებით ბალიდან.",f_piece:"საინტერესო ნამუშევარი",f_name:"თქვენი სახელი",f_email:"ელ.ფოსტა",f_phone:"WhatsApp (არასავალდებულო)",f_msg:"შეტყობინება",req_send:"მოთხოვნის გაგზავნა",req_thanks:"გმადლობთ ✦",req_thanks_sub:"24 საათში დაგიკავშირდებით. გულთბილი მისალმებები ბალიდან.",qm_title:"ჩემი ქარვის პოვნა",qm_sub:"5 კითხვა · 2 წუთი · სრულყოფილი შესაბამისობა",q_next:"შემდეგი",ep_title:"საჩუქარი Amberra-სგან",ep_sub:"შემოგვიერთდით — მიიღეთ 10% ფასდაკლება პირველ შეკვეთაზე",ep_ph:"თქვენი ელ.ფოსტის მისამართი",ep_btn:"შეთავაზების მიღება",ep_note:"სპამი არასოდეს. გამოწერის გაუქმება ნებისმიერ დროს.",ep_thanks:"✦ კეთილი იყოს თქვენი მობრძანება Amberra-ში ✦",ep_thanks_sub:"თქვენი 10%-იანი კოდი გზაშია",chat_lbl:"გვკითხეთ ნებისმიერი კითხვა",chat_status:"ონლაინ · ბალი, ინდონეზია",chat_welcome:"გამარჯობა! მე ვარ თქვენი პირადი AMBERRA გიდი. როგორ შემიძლია დაგეხმაროთ სრულყოფილი ნამუშევრის პოვნაში დღეს?",cq1:"ბეჭდის ზომები",cq2:"მიწოდების ინფო",cq3:"მოვლის სახელმძღვანელო",cq4:"საჩუქრის იდეები",chat_ph:"კითხეთ ნებისმიერი...",cont_btn:"დათვალიერების გაგრძელება"},
};

// Map hero slide 2 keys to editorial keys for all languages
Object.keys(TR).forEach(l=>{TR[l].hero2_lbl=TR[l].ed_lbl;TR[l].hero2_title=TR[l].ed_title;TR[l].hero2_desc=TR[l].ed_body1;});
let currentLang='en';
const I18N_LANGS=['en','ru','zh','ar','id','fr','de','es','pt','ja','ko','it','tr','hi','ka'];
const I18N_NON_EN=['ru','zh','ar','id','fr','de','es','pt','ja','ko','it','tr','hi','ka'];
function getLangFromPath(){const seg=location.pathname.split('/')[1];return I18N_NON_EN.includes(seg)?seg:null;}
function getBasePath(){const seg=location.pathname.split('/')[1];if(I18N_NON_EN.includes(seg)){const rest='/'+location.pathname.split('/').slice(2).join('/');return rest==='/'?'/':rest.replace(/\/$/,'')||'/';}return location.pathname||'/';}
function navTo(path){location.href=currentLang!=='en'?'/'+currentLang+path:path;}
function updateLinks(lang){document.querySelectorAll('a[href]').forEach(a=>{let h=a.getAttribute('href');if(!h||!h.startsWith('/')||h.startsWith('//'))return;const cur=I18N_NON_EN.find(l=>h.startsWith('/'+l+'/')||h==='/'+l);if(cur)h=h==='/'+cur?'/':h.slice('/'.length+cur.length);if(!h.startsWith('/'))h='/'+h;if(lang!=='en')h='/'+lang+(h==='/'?'':h);a.setAttribute('href',h);});}
function injectHreflang(){const canon=document.querySelector('link[rel="canonical"]');const base='https://www.amberrajewelry.com';const path=(getBasePath().replace(/\/$/,'')||'/');if(canon)canon.href=currentLang==='en'?base+path:base+'/'+currentLang+path;}
function t(k){return(TR[currentLang]||TR.en)[k]||TR.en[k]||k}
function setLang(lang,pushUrl=true){
  currentLang=lang;
  const tr=TR[lang]||TR.en;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k=el.dataset.i18n;const v=tr[k]||TR.en[k];
    if(v!==undefined)el.innerHTML=v;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{
    const k=el.dataset.i18nPh;const v=tr[k]||TR.en[k];
    if(v!==undefined)el.placeholder=v;
  });
  document.querySelectorAll('.lb').forEach(b=>b.classList.toggle('al',b.dataset.lang===lang));
  const lct=document.getElementById('lang-cur-txt');
  if(lct)lct.textContent=lang.toUpperCase();
  document.documentElement.lang=lang;
  document.documentElement.setAttribute('dir',lang==='ar'?'rtl':'ltr');
  closeLang();
  if(typeof renderProducts==='function') renderProducts();
  localStorage.setItem('amb_lang',lang);
  const base=getBasePath().replace(/\/$/,'')||'/';
  const newPath=lang==='en'?base:'/'+lang+base;
  if(location.pathname!==newPath){if(pushUrl)history.pushState({lang},'',newPath+location.search);else history.replaceState({lang},'',newPath+location.search);}
  updateLinks(lang);
  injectHreflang();
  if(window.initCurrency) window.initCurrency(lang).then(function(){if(typeof renderProducts==='function')renderProducts();});
}
function toggleLang(){document.getElementById('lang-drop').classList.toggle('open')}
function closeLang(){
  const ld=document.getElementById('lang-drop');
  if(ld)ld.classList.remove('open');
}
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
const quizRecs=[{id:57},{id:86},{id:10},{id:71},{id:25}];
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
  const rec=quizRecs[qStep%quizRecs.length]||quizRecs[0];
  const prods=typeof products!=='undefined'?products:[];
  const p=prods.find(x=>x.id===rec.id)||prods[0];
  if(!p){closeQuiz();return;}
  document.getElementById('quiz-modal').innerHTML=`
    <div class="qbdrop" onclick="closeQuiz()"></div>
    <div class="qbox">
      <div class="q-head"><h2 style="font-style:italic">Your Perfect Match</h2><p>Based on your answers</p></div>
      <div class="q-body">
        <img src="${p.img}" style="width:100%;aspect-ratio:1;object-fit:cover;margin-bottom:20px" alt="${p.name}">
        <div class="pcat">${p.cat}</div>
        <h3 style="font-family:var(--serif);font-size:22px;margin-bottom:8px">${p.name}</h3>
        <p style="font-size:12px;color:var(--gray);line-height:1.7;margin-bottom:20px">${p.desc}</p>
        <div style="display:flex;gap:10px">
          <button class="btn-s" style="flex:1;padding:12px" onclick="closeQuiz();if(typeof openDrawer==='function')openDrawer(${p.id})">View Details</button>
          <button class="btn-o" style="padding:12px 16px" onclick="closeQuiz()">Close</button>
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
    <p>All prices displayed are in USD and subject to change without notice. Product photographs aim to accurately represent items; however, colors may vary slightly due to screen calibration. Each piece of Balinese amber is unique — natural variations in color, inclusions, and texture are inherent to the stone.</p>
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
    var o=document.getElementById('cookie-overlay');
    if(o){
      o.style.display='flex';
      setTimeout(function(){o.classList.remove('hide')},10);
    }
  }
})();
function ckClose(){
  var o=document.getElementById('cookie-overlay');
  if(!o)return;
  o.classList.add('hide');
  setTimeout(function(){o.style.display='none'},400);
}
function ckAccept(){localStorage.setItem('ck_choice','accepted');ckClose();}
function ckReject(){localStorage.setItem('ck_choice','rejected');ckClose();}

// ── MOBILE NAV ────────────────────────────────────────────────────────────
function openMobNav(){
  document.getElementById('mob-nav-overlay').classList.add('open');
  document.getElementById('mob-nav-drawer').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeMobNav(){
  document.getElementById('mob-nav-overlay').classList.remove('open');
  document.getElementById('mob-nav-drawer').classList.remove('open');
  document.body.style.overflow='';
}

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

document.addEventListener('DOMContentLoaded',()=>{
  const urlLang=getLangFromPath();
  const storedLang=localStorage.getItem('amb_lang');
  const navLang=navigator.language.split('-')[0];
  const initLang=urlLang||(storedLang&&I18N_LANGS.includes(storedLang)?storedLang:null)||(I18N_LANGS.includes(navLang)?navLang:'en');
  setLang(initLang,false);
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
  // Editorial model reveal
  const edm=document.querySelector('.ed-model-wrap');
  if(edm){
    const io=new IntersectionObserver(es=>{
      if(es[0].isIntersecting){edm.classList.add('ed-on');io.disconnect();}
    },{threshold:.15});
    io.observe(edm);
  }
});
