/* Gilbros storefront: state, rendering, routing and events. Depends on js/data.js. */
/* ------------------ State ------------------ */
const store = {get(k,d){try{const v=localStorage.getItem('gb-'+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem('gb-'+k,JSON.stringify(v))}catch(e){}}};
const S = {
  cart: store.get('cart',{dr1820:1, cem40:50}),
  quote: store.get('quote',{rb10:300, chb4:2000, cem40:200}),
  vat: true, branch: store.get('branch','qc'), view: store.get('view','grid'),
  f:{brand:[],volt:[],app:[],avail:false,max:null}, sort:'relevance', q:'', filtersOpen:false, tab:'specs', pdpQty:{},
  rfq:{lines:null, sent:null, delivery:'site'}
};
const save = () => { store.set('cart',S.cart); store.set('quote',S.quote); store.set('branch',S.branch); store.set('view',S.view); };

/* ------------------ Helpers ------------------ */
const $ = s => document.querySelector(s);
const byId = id => P.find(p=>p.id===id);
const bySku = sku => P.find(p=>p.sku.toLowerCase()===String(sku).trim().toLowerCase());
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ico = (n,cls='icon') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const vatX = v => S.vat ? v*1.12 : v;
const peso = (v,dec=2) => '₱' + vatX(v).toLocaleString('en-PH',{minimumFractionDigits:dec,maximumFractionDigits:dec});
const php = v => '₱' + v.toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2});
const vatLbl = () => S.vat ? 'incl. VAT' : 'excl. VAT';
const tierFor = (p,q) => { let t=p.tiers[0]; for (const x of p.tiers) if (q>=x[0]) t=x; return t; };
const unitPrice = (p,q) => p.price*(1-tierFor(p,q)[1]);
const totalStock = p => Object.values(p.stock).reduce((a,b)=>a+b,0);
function stockState(p, branch=S.branch){
  const n = p.stock[branch], all = totalStock(p);
  const lowAt = p.heavy ? 200 : 10;
  if (n > lowAt) return ['b-ok','In stock'];
  if (n > 0) return ['b-warn',`Low · ${n.toLocaleString()} left`];
  if (all > 0) return ['b-info','Transfer · 1–2 days'];
  return ['b-bad','Out of stock'];
}
const badge = p => { const [c,t]=stockState(p); return `<span class="badge ${c}">${t}</span>`; };
const media = (p,dim=true) => `<div class="media" aria-hidden="true">${ico(p.icon)}${dim?`<span class="dim">${p.sku}</span>`:''}</div>`;
function toast(msg){ const t=document.createElement('div'); t.className='toast'; t.setAttribute('role','status'); t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.remove(),2600); }
const qtyCtl = (id,val,unit,lg=false) => `<span class="qty ${lg?'qty-lg':''}"><button type="button" data-step="-1" data-for="${id}" aria-label="Decrease">−</button><input id="${id}" type="number" min="1" value="${val}" aria-label="Quantity" inputmode="numeric"><button type="button" data-step="1" data-for="${id}" aria-label="Increase">+</button>${unit?`<span class="unit">${unit}</span>`:''}</span>`;
const cartCount = () => Object.values(S.cart).reduce((a,b)=>a+b,0);
function updateCounts(){ $('#cartCount').textContent = Object.keys(S.cart).length; $('#quoteCount').textContent = Object.keys(S.quote).length; }

function addCart(id,q){ q=Math.max(1,q|0); S.cart[id]=(S.cart[id]||0)+q; save(); updateCounts(); const p=byId(id); toast(`Added ${q.toLocaleString()} × ${p.name.split(',')[0]} to cart`); }
function addQuote(id,q){ q=Math.max(1,q|0); S.quote[id]=(S.quote[id]||0)+q; save(); updateCounts(); toast(`Added ${q.toLocaleString()} ${byId(id).unit} to your quote list`); }

/* ------------------ Header ------------------ */
function renderHeader(){
  $('#branchSel').innerHTML = BRANCHES.map(b=>`<option value="${b.id}" ${b.id===S.branch?'selected':''}>${b.short}</option>`).join('');
  $('#catNav').innerHTML = CATS.map(c=>`<button class="catbtn" data-cat="${c.id}" aria-expanded="false" aria-controls="mega">${c.name}</button>`).join('') + `<a class="catbtn trade" href="#trade" style="text-decoration:none">Contractor &amp; Bulk Quote</a>`;
  updateCounts();
}
let megaFor=null;
function openMega(id){
  const c = CATS.find(x=>x.id===id); megaFor=id;
  document.querySelectorAll('.catbtn[data-cat]').forEach(b=>b.setAttribute('aria-expanded', b.dataset.cat===id));
  const m=$('#mega');
  m.innerHTML = `<div class="wrap">${Object.entries(c.subs).map(([h,list])=>`<div><h4>${h}</h4>${list.map(s=>`<a href="#cat-${c.id}">${s}</a>`).join('')}</div>`).join('')}
    <div class="promo"><span class="caps">${c.name}</span><b class="h3" style="font-size:17px">${c.count.toLocaleString()} products, ${c.id==='building-materials'?'delivered by boom truck':'stocked at 4 branches'}</b><a class="btn btn-secondary" href="#cat-${c.id}" style="align-self:start">Shop all ${c.name}</a></div></div>`;
  m.hidden=false;
}
function closeMega(){ megaFor=null; $('#mega').hidden=true; document.querySelectorAll('.catbtn[data-cat]').forEach(b=>b.setAttribute('aria-expanded','false')); }

/* ------------------ Views ------------------ */
function cardHTML(p){
  const t = p.tiers[p.tiers.length-1];
  return `<article class="card">
    <a href="#p-${p.id}" tabindex="-1" aria-hidden="true">${media(p)}</a>
    <div class="meta"><span class="caps muted">${esc(p.brand)}</span>${badge(p)}</div>
    <a class="title" href="#p-${p.id}">${esc(p.name)}</a>
    <span class="mono muted">${p.sku}</span>
    <div class="pr"><span class="price">${peso(p.price)}</span><span class="muted" style="font-size:13px">/ ${p.unit} · ${vatLbl()}</span></div>
    ${t[1]?`<div class="card-tier">Bulk price ${peso(p.price*(1-t[1]))} at ${t[0].toLocaleString()}+ ${p.unit==='pc'?'pcs':p.unit+'s'}</div>`:''}
    <div class="act"><button class="btn btn-outline" data-add="${p.id}" ${totalStock(p)?'':'disabled'}>${totalStock(p)?'Add to cart':'Out of stock'}</button></div>
  </article>`;
}

function viewHome(){
  const featured = P.filter(p=>p.cat==='power-tools').slice(0,4);
  return `
  <section class="hero">
    <div class="hero-copy">
      <span class="eyebrow">Kumpleto. Matibay. Abot-kaya.</span>
      <h1 class="display">From foundation<br>to roofing</h1>
      <p>Cement, rebar, CHB, roofing, power tools and electrical supplies from four branches. Contractor pricing on every order, boom-truck delivery for heavy materials, and quotes back within two working hours.</p>
      <div class="hero-tools">
        <a class="btn btn-primary btn-lg" href="#cat-power-tools">Shop power tools</a>
        <a class="btn btn-outline btn-lg" href="#trade">Upload a bulk order</a>
      </div>
      <div class="hero-stats">
        <div><b class="num">8,000+</b><span>items in stock</span></div>
        <div><b class="num">4</b><span>branches: QC, Pasig, Cainta, Bacoor</span></div>
        <div><b>2 PM</b><span>same-day cut-off, Metro Manila</span></div>
      </div>
    </div>
    <form class="zone" id="zoneForm">
      <span class="eyebrow">${ico('truck','icon')} Delivery checker</span>
      <h2 class="h2">When can we deliver to site?</h2>
      <div class="field"><label for="zEmirate">Province / region</label>
        <select class="select" id="zEmirate"><option>Metro Manila</option><option>Rizal</option><option>Cavite</option><option>Laguna</option><option>Bulacan</option><option>Rest of Luzon</option><option>Visayas</option><option>Mindanao</option></select></div>
      <div class="field"><label for="zArea">Area or project site</label>
        <input class="input" id="zArea" value="Quezon City, Brgy. Commonwealth" autocomplete="off"></div>
      <label class="chk"><input type="checkbox" id="zHeavy" checked> Order includes heavy materials (cement, rebar, CHB, roofing)</label>
      <button class="btn btn-primary" type="submit">Check delivery</button>
      <div class="zone-result" id="zoneOut" aria-live="polite"></div>
    </form>
    <div class="stripe" aria-hidden="true"></div>
  </section>

  <section class="section">
    <div class="section-head"><h2 class="h1">Shop by trade</h2><span class="muted">${CATS.reduce((a,c)=>a+c.count,0).toLocaleString()} products across ${CATS.length} departments</span></div>
    <div class="tiles">${CATS.map(c=>`<a class="tile" href="#cat-${c.id}">${ico(c.icon)}<b>${c.name}</b><span>${c.count.toLocaleString()} products</span></a>`).join('')}</div>
  </section>

  <section class="section">
    <div class="section-head"><div><span class="eyebrow">Popular with contractors</span><h2 class="h1">Featured power tools</h2></div><a href="#cat-power-tools">View all 1,240 power tools →</a></div>
    <div class="grid-cards">${featured.map(cardHTML).join('')}</div>
  </section>

  <section class="section">
    <div class="trade-banner">
      <div>
        <span class="eyebrow">For contractors &amp; builders</span>
        <h2 class="h1" style="margin-top:6px">Open a contractor account in one working day</h2>
        <ul><li>30-day credit terms</li><li>Project pricing</li><li>BIR Form 2307 accepted</li><li>BOQ upload by CSV</li></ul>
      </div>
      <a class="btn btn-secondary btn-lg" href="#trade">Go to contractor portal</a>
    </div>
  </section>

  <section class="section">
    <div class="section-head"><h2 class="h1">Branches &amp; trade counters</h2><span class="muted">Stock shown on every product is live per branch</span></div>
    <div class="branches">${BRANCHES.map(b=>`<div class="panel branch"><b class="h3">${b.short}</b><span>${b.name}</span><span class="muted">${b.hours}</span><span class="mono">${b.phone}</span>
      <button class="btn btn-${b.id===S.branch?'secondary':'outline'}" data-setbranch="${b.id}" style="margin-top:8px">${b.id===S.branch?'Your branch':'Set as my branch'}</button></div>`).join('')}</div>
  </section>`;
}

function filtered(cat){
  let list = P.filter(p=>!cat || p.cat===cat);
  if (S.q){ const q=S.q.toLowerCase(); list = P.filter(p=>(p.name+' '+p.sku+' '+p.brand).toLowerCase().includes(q)); }
  const f=S.f;
  if (f.brand.length) list=list.filter(p=>f.brand.includes(p.brand));
  if (f.volt.length) list=list.filter(p=>f.volt.includes(p.volt));
  if (f.app.length) list=list.filter(p=>p.app.some(a=>f.app.includes(a)));
  if (f.avail) list=list.filter(p=>p.stock[S.branch]>0);
  if (f.max) list=list.filter(p=>p.price<=f.max);
  const s=S.sort;
  if (s==='price-asc') list=[...list].sort((a,b)=>a.price-b.price);
  if (s==='price-desc') list=[...list].sort((a,b)=>b.price-a.price);
  if (s==='stock') list=[...list].sort((a,b)=>b.stock[S.branch]-a.stock[S.branch]);
  return list;
}
function facet(name,key,values,base){
  if (values.length<2) return '';
  return `<fieldset><legend>${name}</legend>${values.map(v=>{const n=base.filter(p=>key==='app'?p.app.includes(v):p[key]===v).length;
    return `<label class="chk"><input type="checkbox" data-facet="${key}" value="${esc(v)}" ${S.f[key].includes(v)?'checked':''}> ${esc(v)}<span class="muted num">${n}</span></label>`}).join('')}</fieldset>`;
}
function viewCategory(cat){
  const c = CATS.find(x=>x.id===cat);
  const base = S.q ? P : P.filter(p=>p.cat===cat);
  const list = filtered(S.q?null:cat);
  const uniq = k => [...new Set(base.map(p=>p[k]).filter(Boolean))];
  const apps = [...new Set(base.flatMap(p=>p.app))];
  const active = [...S.f.brand,...S.f.volt,...S.f.app].map(v=>`<button class="chip" data-unchip="${esc(v)}">${esc(v)} ${ico('x','icon')}</button>`).join('') + (S.f.avail?`<button class="chip" data-unchip="__avail">At ${BRANCHES.find(b=>b.id===S.branch).short} ${ico('x','icon')}</button>`:'');
  const branch = BRANCHES.find(b=>b.id===S.branch);
  const rows = list.map(p=>`<tr>
      <td class="mono">${p.sku}</td>
      <td style="min-width:240px"><a href="#p-${p.id}">${esc(p.name)}</a><div class="muted" style="font-size:12.5px">${esc(p.brand)}</div></td>
      <td>${badge(p)}</td>
      <td class="num" style="white-space:nowrap"><b>${peso(p.price)}</b><div class="muted" style="font-size:12px">/ ${p.unit}</div></td>
      <td class="num" style="font-size:12.5px;white-space:nowrap">${p.tiers.slice(1).map(t=>`${t[0]}+ −${Math.round(t[1]*100)}%`).join('<br>')||'—'}</td>
      <td>${qtyCtl('tq-'+p.id,p.tiers[1]?p.tiers[1][0]:1,'')}</td>
      <td style="white-space:nowrap"><button class="btn btn-primary" data-add="${p.id}" data-qfrom="tq-${p.id}" ${totalStock(p)?'':'disabled'}>Add</button> <button class="btn btn-ghost" data-addquote="${p.id}" data-qfrom="tq-${p.id}" title="Add to quote list" aria-label="Add to quote list">${ico('clip')}</button></td>
    </tr>`).join('');
  return `
  <div class="crumbs"><a href="#home">Home</a> / ${S.q?'Search':esc(c.name)}</div>
  <div class="section-head" style="margin-bottom:20px">
    <div><h1 class="h1">${S.q?`Results for “${esc(S.q)}”`:esc(c.name)}</h1><span class="muted">${S.q?'':`Showing ${list.length} of ${c.count.toLocaleString()} products (sample catalogue)`}</span></div>
    <button class="btn btn-outline mobile-filter" id="toggleFilters">${ico('filter')} Filters</button>
  </div>
  <div class="plp">
    <aside class="panel filters" data-open="${S.filtersOpen}" aria-label="Filters">
      <fieldset><legend>Availability</legend>
        <label class="chk"><input type="checkbox" id="fAvail" ${S.f.avail?'checked':''}> In stock at ${branch.short}</label>
        <span class="muted" style="font-size:12.5px">Change branch in the top bar</span></fieldset>
      ${facet('Brand','brand',uniq('brand'),base)}
      ${facet('Voltage / Power','volt',uniq('volt'),base)}
      ${facet('Application','app',apps,base)}
      <fieldset><legend>Max price (before VAT)</legend>
        <select class="select" id="fMax"><option value="">Any price</option>${[500,2500,10000,25000].map(v=>`<option value="${v}" ${S.f.max==v?'selected':''}>Up to ₱${v.toLocaleString()}</option>`).join('')}</select></fieldset>
      <button class="linkbtn" id="clearF">Clear all filters</button>
    </aside>
    <section style="min-width:0">
      <div class="toolbar">
        <div class="chips">${active || `<span class="muted">${list.length} products</span>`}</div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <label for="sort" class="sr">Sort</label>
          <select class="select" id="sort" style="width:auto;height:38px">
            <option value="relevance">Sort: Relevance</option><option value="price-asc" ${S.sort==='price-asc'?'selected':''}>Price: low to high</option><option value="price-desc" ${S.sort==='price-desc'?'selected':''}>Price: high to low</option><option value="stock" ${S.sort==='stock'?'selected':''}>Most stock at my branch</option></select>
          <span class="seg" role="group" aria-label="View"><button data-view="grid" aria-pressed="${S.view==='grid'}">${ico('grid')} Grid</button><button data-view="table" aria-pressed="${S.view==='table'}">${ico('list')} Table</button></span>
        </div>
      </div>
      ${!list.length?`<div class="panel empty">No products match these filters. <button class="linkbtn" id="clearF2">Clear filters</button></div>`:
        S.view==='grid'?`<div class="grid-cards">${list.map(cardHTML).join('')}</div>`:
        `<div class="tbl-wrap"><table class="data"><thead><tr><th>SKU</th><th>Product</th><th>Stock · ${branch.short}</th><th>Price ${S.vat?'inc.':'ex.'} VAT</th><th>Bulk tiers</th><th>Qty</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`}
    </section>
  </div>`;
}

function viewProduct(id){
  const p = byId(id); if (!p) return `<div class="panel empty">That product could not be found. <a href="#home">Back to home</a></div>`;
  const c = CATS.find(x=>x.id===p.cat);
  const q = S.pdpQty[id] || 1;
  const t = tierFor(p,q), up = unitPrice(p,q);
  const next = p.tiers.find(x=>x[0]>q);
  const related = P.filter(x=>x.cat===p.cat && x.id!==p.id).slice(0,4);
  const docs = DOCS(id);
  const tabBody = S.tab==='specs'
    ? `<table class="specs"><tbody><tr><th>SKU</th><td>${p.sku}</td></tr><tr><th>Brand</th><td>${esc(p.brand)}</td></tr>${Object.entries(p.specs).map(([k,v])=>`<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table>`
    : S.tab==='docs'
    ? `<div class="docs">${docs.map(d=>`<div class="panel doc"><span class="ft">PDF</span><span class="info"><b>${d[0]}</b><span>${d[1]}</span></span><button class="btn btn-ghost" data-doc="${esc(d[0])}">Download</button></div>`).join('')}<p class="demo-note">Documents are placeholders in this prototype.</p></div>`
    : `<div style="display:grid;gap:10px;max-width:760px;font-size:14.5px">
        <p style="margin:0"><b>${p.heavy?'Boom-truck delivery':'Standard truck delivery'}.</b> ${p.heavy?'Minimum one truckload or ₱10,000 order. Site must allow 6- or 10-wheeler access; offloading by boom crane is included within Metro Manila.':'Free within Metro Manila on orders ₱5,000 and up. Same-day when ordered before 2 PM.'}</p>
        <p style="margin:0"><b>Store pick-up.</b> Ready in one hour at any branch with stock. Show your order number at the counter.</p>
        <p style="margin:0"><b>Returns.</b> Within 7 days, unused, with the official receipt or sales invoice. ${p.heavy?'Cut-to-order roofing and bulk materials are non-returnable.':''}</p></div>`;
  return `
  <div class="crumbs"><a href="#home">Home</a> / <a href="#cat-${c.id}">${c.name}</a> / ${esc(p.brand)}</div>
  <div class="pdp">
    <div>
      ${media(p)}
      <div class="thumbs">${[0,1,2,3].map(()=>`<div class="media">${ico(p.icon)}</div>`).join('')}</div>
    </div>
    <div class="buybox">
      <div style="display:grid;gap:8px">
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="caps muted">${esc(p.brand)}</span>${badge(p)}</div>
        <h1 class="h1">${esc(p.name)}</h1>
        <span class="mono muted">SKU ${p.sku}</span>
      </div>
      <div style="display:flex;gap:10px;align-items:baseline;flex-wrap:wrap">
        <span class="price" style="font-size:36px">${peso(up)}</span>
        <span class="muted">/ ${p.unit} · ${vatLbl()}</span>
        ${t[1]?`<span class="badge b-ok" style="text-transform:none;letter-spacing:0">Bulk price applied · −${Math.round(t[1]*100)}%</span>`:''}
      </div>
      ${p.tiers.length>1?`<div class="panel" style="overflow:hidden"><table class="tiers num"><thead><tr><th>Quantity</th><th>Price / ${p.unit}</th><th>You save</th></tr></thead><tbody>
        ${p.tiers.map((x,i)=>{const hi=p.tiers[i+1]?p.tiers[i+1][0]-1:null;return `<tr class="${x===t?'on':''}"><td>${x[0].toLocaleString()}${hi?'–'+hi.toLocaleString():'+'}</td><td><b>${peso(p.price*(1-x[1]))}</b></td><td>${x[1]?Math.round(x[1]*100)+'%':'—'}</td></tr>`}).join('')}
      </tbody></table></div>`:''}
      ${next?`<div class="tier">Add ${(next[0]-q).toLocaleString()} more to unlock ${peso(p.price*(1-next[1]))} / ${p.unit}</div>`:''}
      <div class="buyrow">
        ${qtyCtl('pq',q,p.unit,true)}
        <button class="btn btn-primary btn-lg" data-add="${p.id}" data-qfrom="pq" ${totalStock(p)?'':'disabled'}>${totalStock(p)?'Add to cart':'Out of stock'}</button>
        <button class="btn btn-outline btn-lg" data-addquote="${p.id}" data-qfrom="pq">Add to quote</button>
      </div>
      <div class="line-total"><span class="muted">Line total for ${q.toLocaleString()} ${p.unit}</span><span class="price num">${peso(up*q)}</span></div>
      <div class="panel" style="padding:4px 16px">
        <div class="stock-list">
          <div style="border-bottom-color:var(--line)"><span class="caps muted">Branch stock</span><span class="caps muted">Updated 4 min ago</span></div>
          ${BRANCHES.map(b=>{const n=p.stock[b.id];const st=stockState(p,b.id);return `<div><span>${b.id===S.branch?'<b>':''}${b.short}${b.id===S.branch?' (your branch)</b>':''}</span><span style="display:flex;gap:10px;align-items:center"><span class="mono num">${n.toLocaleString()} ${p.unit}</span><span class="badge ${n>0?st[0]:'b-bad'}">${n>0?(st[0]==='b-warn'?'Low':'Available'):'None'}</span></span></div>`}).join('')}
        </div>
      </div>
    </div>
  </div>
  <div class="tabs" role="tablist">
    ${[['specs','Specifications'],['docs',`Documents (${docs.length})`],['delivery','Delivery & returns']].map(([k,l])=>`<button role="tab" data-tab="${k}" aria-selected="${S.tab===k}">${l}</button>`).join('')}
  </div>
  <div class="tabpanel" role="tabpanel">${tabBody}</div>
  ${related.length?`<section class="section"><h2 class="h1">More in ${c.name}</h2><div class="grid-cards">${related.map(cardHTML).join('')}</div></section>`:''}`;
}

function parseLines(text){
  const out=[];
  text.split(/\r?\n/).forEach((raw,i)=>{
    const line=raw.trim(); if(!line || /^sku\b/i.test(line)) return;
    const parts=line.split(/[,;\t]|\s{2,}|\s+(?=\d+\s*$)/).map(s=>s.trim()).filter(Boolean);
    const sku=parts[0]; const qty=parseInt((parts[1]||'1').replace(/[^\d]/g,''))||1;
    out.push({sku,qty,p:bySku(sku),line:i+1});
  });
  return out;
}
function viewTrade(){
  const qItems = Object.entries(S.quote).map(([id,q])=>({p:byId(id),q})).filter(x=>x.p);
  const qTotal = qItems.reduce((a,x)=>a+unitPrice(x.p,x.q)*x.q,0);
  const lines = S.rfq.lines;
  const found = lines?lines.filter(l=>l.p):[]; const missing = lines?lines.filter(l=>!l.p):[];
  if (S.rfq.sent){ const r=S.rfq.sent; return `
    <div class="crumbs"><a href="#home">Home</a> / Contractor portal</div>
    <div class="panel confirm" style="max-width:760px">
      <span class="caps" style="color:var(--ok)">Quote request ready</span>
      <h1 class="h1">Reference ${r.ref}</h1>
      <p style="margin:0">${r.items} line items for <b>${esc(r.project)}</b>, delivery to ${esc(r.site)} by ${esc(r.date)}. Indicative value ${peso(r.value)} ${vatLbl()}.</p>
      <p class="demo-note" style="margin:0">This is a prototype: nothing was sent. In production this creates the RFQ in your ERP and emails the account manager.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px"><button class="btn btn-secondary" id="newRfq">Start another quote</button><a class="btn btn-outline" href="#home">Back to shop</a></div>
    </div>`;}
  return `
  <div class="crumbs"><a href="#home">Home</a> / Contractor portal</div>
  <div class="section-head" style="margin-bottom:20px"><div><span class="eyebrow">Contractors &amp; bulk orders</span><h1 class="h1">Request a project quote</h1></div>
    <span class="muted" style="max-width:52ch">Paste SKUs or upload your BOQ as CSV. We confirm pricing, stock and delivery slots within two working hours.</span></div>
  <div class="portal">
    <div style="display:grid;gap:16px;min-width:0">
      <div class="panel step">
        <h2 class="h3"><span class="step-n">1</span>Add products by SKU</h2>
        <div class="field"><label for="skuText">One line per item: <span class="mono">SKU, quantity</span></label>
          <textarea class="input" id="skuText" rows="6" spellcheck="false">GB-RBR-G40-10, 450
GB-CEM-T1-40, 300
GB-RFG-LS-04, 180
GB-PPE-HAT-01, 25
GB-XYZ-0000, 5</textarea></div>
        <div class="drop" id="drop">${ico('upload')}<span>Or drop a CSV file here (columns: SKU, Qty)</span>
          <label class="btn btn-outline" for="csvFile" style="margin-left:auto">Choose CSV</label><input type="file" id="csvFile" accept=".csv,text/csv,.txt" class="sr"></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-secondary" id="checkSkus">Check SKUs</button>
          <button class="linkbtn" id="sampleCsv">Show CSV format</button></div>
        <pre class="mono panel" id="csvHelp" hidden style="margin:0;padding:12px;overflow-x:auto">SKU,Qty
GB-RBR-G40-10,450
GB-CHB-4IN,2500</pre>
        ${lines?`<div class="tbl-wrap"><table class="data" style="min-width:560px"><thead><tr><th>Line</th><th>SKU</th><th>Product</th><th>Qty</th><th>Status</th></tr></thead><tbody>
          ${lines.map(l=>`<tr><td class="num">${l.line}</td><td class="mono">${esc(l.sku)}</td><td>${l.p?esc(l.p.name):'<span class="muted">Not found in catalogue</span>'}</td><td class="num">${l.qty.toLocaleString()}</td><td>${l.p?`<span class="badge b-ok">Matched</span>`:`<span class="badge b-bad">Check SKU</span>`}</td></tr>`).join('')}
          </tbody></table></div>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><button class="btn btn-primary" id="addFound" ${found.length?'':'disabled'}>Add ${found.length} matched item${found.length===1?'':'s'} to quote</button>
          ${missing.length?`<span class="muted" style="font-size:13px">${missing.length} line${missing.length===1?'':'s'} not matched. Our team can source non-catalogue items: list them in the notes.</span>`:''}</div>`:''}
      </div>
      <div class="panel step">
        <h2 class="h3"><span class="step-n">2</span>Your quote list <span class="muted" style="font-weight:400;font-size:14px">· ${qItems.length} items</span></h2>
        ${qItems.length?`<div class="tbl-wrap"><table class="data" style="min-width:620px"><thead><tr><th>Product</th><th>Qty</th><th>Tier price</th><th>Line total</th><th></th></tr></thead><tbody>
          ${qItems.map(({p,q})=>`<tr><td><a href="#p-${p.id}">${esc(p.name)}</a><div class="mono muted">${p.sku}</div></td><td>${qtyCtl('qq-'+p.id,q,p.unit)}</td><td class="num">${peso(unitPrice(p,q))}${tierFor(p,q)[1]?`<div style="font-size:12px;color:var(--ok)">−${Math.round(tierFor(p,q)[1]*100)}% bulk</div>`:''}</td><td class="num"><b>${peso(unitPrice(p,q)*q)}</b></td><td><button class="btn btn-ghost" data-rmquote="${p.id}" aria-label="Remove ${esc(p.name)}">${ico('x')}</button></td></tr>`).join('')}
          </tbody></table></div>
          <div class="line-total"><span class="muted">Indicative total before account pricing</span><span class="price">${peso(qTotal)}</span></div>`
          :`<div class="empty panel">Your quote list is empty. Add products by SKU above, or use <b>Add to quote</b> on any product page.</div>`}
      </div>
    </div>
    <form class="panel step" id="rfqForm" style="position:sticky;top:calc(env(safe-area-inset-top,0px) + 132px)">
      <h2 class="h3"><span class="step-n">3</span>Project &amp; delivery details</h2>
      <div class="form-grid">
        <div class="field full"><label for="rCompany">Company</label><input class="input" id="rCompany" required value="JDR Builders &amp; Construction Inc."></div>
        <div class="field"><label for="rTrn">TIN (for BIR sales invoice)</label><input class="input" id="rTrn" inputmode="numeric" placeholder="000-000-000-000" value="123-456-789-000"></div>
        <div class="field"><label for="rPhone">Site contact mobile</label><input class="input" id="rPhone" inputmode="tel" value="+63 917 000 0000"></div>
        <div class="field full"><label for="rProject">Project name</label><input class="input" id="rProject" required value="2-Storey Residence, Lot 5 Blk 3"></div>
        <div class="field"><label for="rSite">Site location</label><input class="input" id="rSite" required value="Antipolo City, Rizal"></div>
        <div class="field"><label for="rDate">Required by</label><input class="input" id="rDate" type="date" required></div>
        <div class="field full"><span style="font-size:13px;font-weight:600;color:var(--ink-2)">Delivery method</span>
          <div class="radio-row">${[['site','Site delivery','Truck drop-off'],['crane','Boom truck','Crane offload'],['collect','Pick-up','From branch']].map(([v,l,d])=>`<label><input type="radio" name="rDel" value="${v}" ${S.rfq.delivery===v?'checked':''}><span><b>${l}</b><br><span class="muted">${d}</span></span></label>`).join('')}</div></div>
        <div class="field full"><label for="rNotes">Notes for the estimator</label><textarea class="input" id="rNotes" rows="3" style="font-family:var(--f-body)" placeholder="Phased deliveries, non-catalogue items, payment terms…">Deliver rebar and cement first, CHB in two drops. We will issue BIR 2307 for 1% EWT.</textarea></div>
      </div>
      <button class="btn btn-primary btn-lg" type="submit" ${qItems.length?'':'disabled'}>Submit quote request</button>
      <span class="demo-note">Prototype: submitting shows a confirmation; nothing is sent.</span>
    </form>
  </div>`;
}

/* ------------------ Cart drawer ------------------ */
function renderDrawer(){
  const items = Object.entries(S.cart).map(([id,q])=>({p:byId(id),q})).filter(x=>x.p);
  const sub = items.reduce((a,x)=>a+unitPrice(x.p,x.q)*x.q,0);
  const delivery = sub>=5000||!items.length?0:150;
  $('#layer').innerHTML = `<div class="scrim" data-close></div>
  <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="cartTitle">
    <header><h2 class="h2" id="cartTitle">Cart · ${items.length} item${items.length===1?'':'s'}</h2><button class="btn btn-ghost" data-close aria-label="Close cart">${ico('x')}</button></header>
    <div class="items">${items.length?items.map(({p,q})=>`<div class="ditem">${media(p,false)}<div style="min-width:0">
        <a href="#p-${p.id}" data-close style="color:var(--ink);font-weight:600;text-decoration:none;font-size:14px">${esc(p.name)}</a>
        <div class="mono muted">${p.sku}</div>
        ${tierFor(p,q)[1]?`<div style="font-size:12px;color:var(--ok);font-weight:600">Bulk price −${Math.round(tierFor(p,q)[1]*100)}%</div>`:''}
        <div class="row">${qtyCtl('dq-'+p.id,q,p.unit)}<b class="num">${peso(unitPrice(p,q)*q)}</b></div>
        <button class="linkbtn" data-rmcart="${p.id}" style="margin-top:6px">Remove</button></div></div>`).join(''):`<div class="empty">Your cart is empty.</div>`}</div>
    <footer>
      <div class="sum"><span>Subtotal (before VAT)</span><span class="num">${php(sub)}</span></div>
      <div class="sum"><span>Delivery</span><span class="num">${delivery?php(delivery):'Free'}</span></div>
      <div class="sum"><span>VAT 12%</span><span class="num">${php((sub+delivery)*.12)}</span></div>
      <div class="sum total"><span>Total</span><span class="num">${php((sub+delivery)*1.12)}</span></div>
      <div class="pay" aria-label="Payment methods"><span>GCash</span><span>Maya</span><span>Card</span><span>Bank transfer</span><span>COD</span></div>
      <button class="btn btn-primary btn-lg" id="checkout" ${items.length?'':'disabled'}>Checkout</button>
      <button class="btn btn-outline" id="cartToQuote" ${items.length?'':'disabled'}>Move cart to quote request</button>
    </footer>
  </aside>`;
  $('.drawer button[data-close]').focus();
}
const closeDrawer = () => { $('#layer').innerHTML=''; };

/* ------------------ Router ------------------ */
function route(){
  const h = location.hash.slice(1) || 'home';
  closeMega();
  let html;
  if (h.startsWith('cat-')) { let cat=h.slice(4); if(!CATS.some(c=>c.id===cat)) cat='power-tools'; if(S._cat!==cat){S.f={brand:[],volt:[],app:[],avail:false,max:null};S._cat=cat;} S.q=''; html=viewCategory(cat); }
  else if (h==='search' && S.q) html=viewCategory(null);
  else if (h.startsWith('p-')) html=viewProduct(h.slice(2));
  else if (h==='trade') html=viewTrade();
  else html=viewHome();
  $('#app').innerHTML = html;
  if (h==='home'||h==='') zoneCheck();
  const d=$('#rDate'); if (d && !d.value){ const t=new Date(Date.now()+5*864e5); d.value=t.toISOString().slice(0,10); }
}
const rerender = () => { const y=scrollY; route(); scrollTo(0,y); };
window.addEventListener('hashchange',()=>{ S.tab='specs'; route(); scrollTo(0,0); });

/* ------------------ Delivery checker ------------------ */
function zoneCheck(){
  const out=$('#zoneOut'); if(!out) return;
  const em=$('#zEmirate').value, heavy=$('#zHeavy').checked, area=$('#zArea').value.trim()||em;
  const Z={'Metro Manila':['Zone 1 · Same day','Order by 2 PM for same-day delivery from Quezon City or Pasig.',150],'Rizal':['Zone 1 · Same day or next day','Delivered from our Cainta branch.',200],'Cavite':['Zone 2 · Next day','Delivered from our Bacoor branch.',250],'Laguna':['Zone 2 · Next day','Delivered from our Bacoor branch.',350],'Bulacan':['Zone 2 · Next day','Delivered from our Quezon City branch.',350],'Rest of Luzon':['Zone 3 · 2–4 working days','Shipped through partner trucking. We confirm the schedule by phone.',null],'Visayas':['Zone 4 · 5–8 days','Sea freight from Manila port. Freight is quoted per order.',null],'Mindanao':['Zone 4 · 7–10 days','Sea freight from Manila port. Freight is quoted per order.',null]};
  const [z,txt,fee]=Z[em];
  out.innerHTML = `<strong>${esc(area)}: ${z}</strong><span>${txt}</span><span class="muted">${fee?`Delivery ₱${fee}, free on orders ₱5,000 and up.`:'Ask for a freight quote in the contractor portal.'}${heavy&&fee?' Heavy materials go by boom truck: ₱1,500 per drop, booked at checkout.':''}</span>`;
}

/* ------------------ Events ------------------ */
document.addEventListener('click',e=>{
  const t=e.target.closest('button,a,[data-close]'); if(!t) { if(megaFor && !e.target.closest('#mega')) closeMega(); return; }
  if (t.dataset.cat){ e.preventDefault(); megaFor===t.dataset.cat?closeMega():openMega(t.dataset.cat); return; }
  if (megaFor && !t.closest('#mega')) closeMega();
  if (t.dataset.step){ const i=document.getElementById(t.dataset.for); i.value=Math.max(1,(parseInt(i.value)||1)+parseInt(t.dataset.step)); i.dispatchEvent(new Event('change',{bubbles:true})); return; }
  if (t.dataset.add){ const q=parseInt(document.getElementById(t.dataset.qfrom)?.value)||1; addCart(t.dataset.add,q); return; }
  if (t.dataset.addquote){ const q=parseInt(document.getElementById(t.dataset.qfrom)?.value)||1; addQuote(t.dataset.addquote,q); return; }
  if (t.dataset.view){ S.view=t.dataset.view; save(); rerender(); return; }
  if (t.dataset.tab){ S.tab=t.dataset.tab; rerender(); return; }
  if (t.dataset.unchip){ const v=t.dataset.unchip; if(v==='__avail') S.f.avail=false; else for(const k of ['brand','volt','app']) S.f[k]=S.f[k].filter(x=>x!==v); rerender(); return; }
  if (t.dataset.setbranch){ S.branch=t.dataset.setbranch; save(); renderHeader(); rerender(); toast(`Branch set to ${BRANCHES.find(b=>b.id===S.branch).short}`); return; }
  if (t.dataset.doc){ toast(`${t.dataset.doc}: download available in the production build`); return; }
  if (t.dataset.rmquote){ delete S.quote[t.dataset.rmquote]; save(); updateCounts(); rerender(); return; }
  if (t.dataset.rmcart){ delete S.cart[t.dataset.rmcart]; save(); updateCounts(); renderDrawer(); return; }
  if (t.hasAttribute('data-close')){ closeDrawer(); return; }
  switch(t.id){
    case 'cartBtn': renderDrawer(); break;
    case 'checkout': toast('Checkout connects to the payment provider in the production build'); break;
    case 'cartToQuote': for (const [id,q] of Object.entries(S.cart)) S.quote[id]=(S.quote[id]||0)+q; S.cart={}; save(); updateCounts(); closeDrawer(); location.hash='trade'; if(location.hash==='#trade') rerender(); break;
    case 'clearF': case 'clearF2': S.f={brand:[],volt:[],app:[],avail:false,max:null}; rerender(); break;
    case 'toggleFilters': S.filtersOpen=!S.filtersOpen; rerender(); break;
    case 'vatEx': case 'vatInc': S.vat=t.id==='vatInc'; $('#vatEx').setAttribute('aria-pressed',!S.vat); $('#vatInc').setAttribute('aria-pressed',S.vat); rerender(); if($('.drawer')) renderDrawer(); break;
    case 'themeBtn': { const r=document.documentElement; const dark = r.dataset.theme ? r.dataset.theme==='dark' : matchMedia('(prefers-color-scheme: dark)').matches; r.dataset.theme = dark?'light':'dark'; break; }
    case 'checkSkus': S.rfq.lines=parseLines($('#skuText').value); S._sku=$('#skuText').value; rerender(); $('#skuText').value=S._sku; break;
    case 'addFound': S.rfq.lines.filter(l=>l.p).forEach(l=>S.quote[l.p.id]=(S.quote[l.p.id]||0)+l.qty); const n=S.rfq.lines.filter(l=>l.p).length; S.rfq.lines=null; save(); updateCounts(); rerender(); toast(`${n} items added to your quote list`); break;
    case 'sampleCsv': $('#csvHelp').hidden=!$('#csvHelp').hidden; break;
    case 'newRfq': S.rfq.sent=null; rerender(); break;
  }
});
document.addEventListener('change',e=>{
  const t=e.target;
  if (t.id==='branchSel'){ S.branch=t.value; save(); rerender(); return; }
  if (t.dataset.facet){ const k=t.dataset.facet; S.f[k]= t.checked ? [...S.f[k],t.value] : S.f[k].filter(x=>x!==t.value); rerender(); return; }
  if (t.id==='fAvail'){ S.f.avail=t.checked; rerender(); return; }
  if (t.id==='fMax'){ S.f.max=t.value?+t.value:null; rerender(); return; }
  if (t.id==='sort'){ S.sort=t.value; rerender(); return; }
  if (t.name==='rDel'){ S.rfq.delivery=t.value; return; }
  if (t.id==='zEmirate'||t.id==='zHeavy'){ zoneCheck(); return; }
  if (t.id==='csvFile' && t.files[0]) readCsv(t.files[0]);
  if (t.type==='number'){
    const v=Math.max(1,parseInt(t.value)||1); t.value=v;
    if (t.id==='pq'){ const id=location.hash.slice(3); S.pdpQty[id]=v; rerender(); const i=$('#pq'); i&&i.focus(); }
    else if (t.id.startsWith('qq-')){ S.quote[t.id.slice(3)]=v; save(); rerender(); }
    else if (t.id.startsWith('dq-')){ S.cart[t.id.slice(3)]=v; save(); renderDrawer(); }
  }
});
document.addEventListener('submit',e=>{
  e.preventDefault();
  if (e.target.id==='searchForm'){ S.q=$('#q').value.trim(); if(!S.q) return; const hit=bySku(S.q); if(hit){ location.hash='p-'+hit.id; return;} S.f={brand:[],volt:[],app:[],avail:false,max:null}; if(location.hash==='#search') rerender(); else location.hash='search'; }
  if (e.target.id==='zoneForm') zoneCheck();
  if (e.target.id==='rfqForm'){
    const qItems=Object.entries(S.quote).map(([id,q])=>({p:byId(id),q})).filter(x=>x.p);
    const d=new Date(); const ref=`RFQ-${String(d.getFullYear()).slice(2)}${String(d.getMonth()+1).padStart(2,'0')}-${String(Math.floor(1000+Math.random()*9000))}`;
    S.rfq.sent={ref,project:$('#rProject').value,site:$('#rSite').value,date:new Date($('#rDate').value).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}),items:qItems.length,value:qItems.reduce((a,x)=>a+unitPrice(x.p,x.q)*x.q,0)};
    S.quote={}; save(); updateCounts(); route(); scrollTo(0,0);
  }
});
document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ closeDrawer(); closeMega(); } });
function readCsv(file){
  const r=new FileReader();
  r.onload=()=>{ S._sku=String(r.result); S.rfq.lines=parseLines(S._sku); rerender(); $('#skuText').value=S._sku; toast(`Read ${S.rfq.lines.length} lines from ${file.name}`); };
  r.readAsText(file);
}
document.addEventListener('dragover',e=>{ const d=e.target.closest&&e.target.closest('#drop'); if(d){e.preventDefault(); d.classList.add('over');} });
document.addEventListener('dragleave',e=>{ const d=e.target.closest&&e.target.closest('#drop'); if(d) d.classList.remove('over'); });
document.addEventListener('drop',e=>{ const d=e.target.closest&&e.target.closest('#drop'); if(d){ e.preventDefault(); d.classList.remove('over'); const f=e.dataTransfer.files[0]; if(f) readCsv(f);} });

renderHeader();
route();
