let products=[];
let compare=[];
let finderStep=0;
let answers={coffee:null,automation:null,budget:null,cleaning:null};

const questions=[
 {key:'coffee',title:'Vad dricker du mest?',opts:[['black','Svart kaffe','Bryggkaffe, americano eller vanligt kaffe.'],['espresso','Espresso','Kort, intensiv espresso.'],['milk','Cappuccino & latte','Mjölkbaserade kaffedrycker.'],['mixed','Lite av allt','Jag vill kunna göra det mesta.']]},
 {key:'automation',title:'Hur mycket vill du göra själv?',opts:[['easy','Så lite som möjligt','Tryck på en knapp och få kaffe.'],['some','Lite själv','Jag kan tänka mig viss handpåläggning.'],['manual','Jag vill nörda','Jag vill mala, dosera, tampa och skumma själv.']]},
 {key:'budget',title:'Vad är din ungefärliga budget?',opts:[['low','Under 2 000 kr','Så billigt som möjligt.'],['mid','2–5 000 kr','Bra prisvärd nivå.'],['upper','5–10 000 kr','Jag kan betala mer för rätt maskin.'],['premium','10 000+ kr','Jag prioriterar funktion och kvalitet framför pris.']]},
 {key:'cleaning',title:'Hur viktigt är enkel rengöring?',opts:[['high','Väldigt viktigt','Jag vill helst slippa krångel.'],['normal','Ganska viktigt','Lite underhåll är helt okej.'],['low','Spelar liten roll','Kaffe först, rengöring sen.']]}
];

const $=id=>document.getElementById(id);
const currentPrice=p=>{const n=Number(p.feed_price);return Number.isFinite(n)&&n>0?n:(Number.isFinite(Number(p.price))&&Number(p.price)>0?Number(p.price):null)};
const priceVerified=p=>p&&p.needs_review!==true&&currentPrice(p)>0;
const priceText=p=>priceVerified(p)?currentPrice(p).toLocaleString('sv-SE')+' kr':'Pris ej verifierat';
const priceBand=p=>{const v=currentPrice(p); if(!v)return null; if(v<2000)return'low';if(v<5000)return'mid';if(v<10000)return'upper';return'premium'};

function track(event,params={}){const payload={event,...params,ts:new Date().toISOString()};window.dataLayer=window.dataLayer||[];window.dataLayer.push(payload);try{const k='gottjavlakaffe_events',e=JSON.parse(localStorage.getItem(k)||'[]');e.push(payload);localStorage.setItem(k,JSON.stringify(e.slice(-250)))}catch(_){} }

async function init(){
 try{const r=await fetch('data/products.json');if(!r.ok)throw new Error('products.json '+r.status);products=await r.json();}
 catch(e){console.error(e);$('productGrid').innerHTML='<div class="empty">Produktdata kunde inte laddas.</div>';return}
 setupFilters();renderProducts(products);renderQuestion();wireQuickStarts();wireSimulator();track('page_view',{path:location.pathname});
}
function setupFilters(){
 const types=[...new Set(products.map(p=>p.type).filter(Boolean))];
 $('typeFilter').innerHTML='<option value="">Alla typer</option>'+types.map(t=>`<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
 $('search').oninput=filterProducts;$('typeFilter').onchange=filterProducts;$('priceFilter').onchange=filterProducts;
 $('productCount').textContent=`${products.length} maskiner`;
}
function filterProducts(){
 const q=$('search').value.trim().toLowerCase(),type=$('typeFilter').value,range=$('priceFilter').value;
 let [a,b]=range?range.split('-').map(Number):[0,Infinity];
 const out=products.filter(p=>{const text=`${p.brand} ${p.model} ${p.description||''}`.toLowerCase(),v=currentPrice(p);return(!q||text.includes(q))&&(!type||p.type===type)&&(!range||(v!==null&&v>=a&&v<=b));});
 renderProducts(out);track('product_filter',{q,type,range,count:out.length});
}
function renderQuestion(){
 const q=questions[finderStep];$('stepLabel').textContent=`${finderStep+1} / ${questions.length}`;if($('stepProgress'))$('stepProgress').style.width=`${((finderStep+1)/questions.length)*100}%`;
 $('questions').innerHTML=`<h3>${q.title}</h3><div class="finder-option-grid">${q.opts.map(o=>`<button class="finder-option ${answers[q.key]===o[0]?'selected':''}" data-value="${o[0]}"><strong>${o[1]}</strong><small>${o[2]}</small></button>`).join('')}</div>`;
 document.querySelectorAll('.finder-option').forEach(b=>b.onclick=()=>{answers[q.key]=b.dataset.value;track('finder_answer',{question:q.key,value:b.dataset.value});renderQuestion()});
 $('back').disabled=finderStep===0;$('next').textContent=finderStep===questions.length-1?'Visa resultat →':'Nästa →';
}
$('next').onclick=()=>{const key=questions[finderStep].key;if(!answers[key])return;if(finderStep<questions.length-1){finderStep++;track('finder_next',{step:finderStep});renderQuestion()}else{track('finder_complete',answers);showResults()}};
$('back').onclick=()=>{if(finderStep>0){finderStep--;renderQuestion()}};
$('restart').onclick=()=>{finderStep=0;answers={coffee:null,automation:null,budget:null,cleaning:null};$('results').classList.add('hidden');track('finder_restart');$('finder').scrollIntoView({behavior:'smooth'});renderQuestion()};

function priceFit(p,budget){
 if(!budget)return .5;
 const band=priceBand(p);if(!band)return .5;
 const order={low:0,mid:1,upper:2,premium:3},d=Math.abs(order[band]-order[budget]);return d===0?1:d===1?.65:.25;
}
function coffeeFit(p,coffee){const c=(p.coffee||[]).map(x=>String(x).toLowerCase());if(coffee==='black')return c.some(x=>['svart','bryggkaffe','americano'].includes(x))?1:.45;if(coffee==='espresso')return c.includes('espresso')?1:.4;if(coffee==='milk')return c.some(x=>['cappuccino','latte'].includes(x))?1:.45;if(coffee==='mixed')return Math.min(1,c.length/4);return .5}
function automationFit(p,a){const x=Number(p.automation)||0;if(a==='easy')return x>=5?1:x>=4?.75:.35;if(a==='some')return x>=3&&x<=4?1:.65;if(a==='manual'){const c=Number(p.control)||0;return c>=5?1:c>=4?.8:.35}return .5}
function cleaningFit(p,c){const x=Number(p.cleaning)||0;if(c==='high')return x>=5?1:x>=4?.8:.4;if(c==='normal')return x>=4?1:.65;return .7}
function espressoFit(p,a){const x=Number(p.espresso)||0;return a==='manual'?(x/5):a==='easy'?.5:(x/5)}
function versatility(p){const c=(p.coffee||[]).length;return Math.min(1,(c/4)*.7+(Number(p.milk)||0)/5*.15+(Number(p.espresso)||0)/5*.15)}
function weightedScore(p){
 const s=priceFit(p,answers.budget)*.30+coffeeFit(p,answers.coffee)*.22+automationFit(p,answers.automation)*.20+cleaningFit(p,answers.cleaning)*.12+espressoFit(p,answers.automation)*.10+versatility(p)*.06;
 return Math.round(55+s*44);
}
function rankedProducts(budgetOverride=null){const a={...answers};if(budgetOverride)a.budget=budgetOverride;return products.map(p=>({...p,match:weightedScoreWith(p,a)})).sort((x,y)=>y.match-x.match)}
function weightedScoreWith(p,a){const old=answers;answers=a;const s=priceFit(p,a.budget)*.30+coffeeFit(p,a.coffee)*.22+automationFit(p,a.automation)*.20+cleaningFit(p,a.cleaning)*.12+espressoFit(p,a.automation)*.10+versatility(p)*.06;answers=old;return Math.max(55,Math.min(99,Math.round(55+s*44)))}
function profileText(){const coffee={black:'svart kaffe',espresso:'espresso',milk:'cappuccino och latte',mixed:'lite av allt'}[answers.coffee],auto={easy:'så lite handpåläggning som möjligt',some:'lite egen kontroll',manual:'mycket egen kontroll'}[answers.automation],budget={low:'under 2 000 kr',mid:'2–5 000 kr',upper:'5–10 000 kr',premium:'10 000+ kr'}[answers.budget];return `Du prioriterar ${coffee}, vill ha ${auto} och har valt ${budget}.`}
function showResults(){
 const ranked=rankedProducts().slice(0,6);$('results').classList.remove('hidden');$('profile').innerHTML=`<strong>Din profil:</strong> ${profileText()}`;const top=ranked[0];$('matchSummary').innerHTML=top?`<span class="eyebrow">VARFÖR DEN HÄR?</span><p><strong>${escapeHtml(top.brand+' '+top.model)}</strong> ligger först eftersom den bäst balanserar dina svar. Titta gärna på alternativen under om du vill prioritera pris, kontroll eller funktion annorlunda.</p>`:'';renderDNA();renderDecisionMap(ranked);$('resultsGrid').innerHTML=buildRecommendationCards(ranked).map(card).join('');wireCards();updateSimulator();$('results').scrollIntoView({behavior:'smooth'});
}
function renderDNA(){const vals=[['Bekvämlighet',automationValue(),answers.automation==='easy'?90:answers.automation==='some'?65:35],['Kontroll',answers.automation==='manual'?90:answers.automation==='some'?60:30],['Enkel rengöring',answers.cleaning==='high'?90:answers.cleaning==='normal'?65:35]];$('dna').innerHTML=`<div class="dna-head"><div><span class="eyebrow">COFFEE DNA</span><h3>Så här ser dina prioriteringar ut</h3></div></div><div class="dna-bars">${vals.map(v=>`<div class="dna-row"><span>${v[0]}</span><div><i style="width:${v[2]}%"></i></div><b>${v[2]}</b></div>`).join('')}</div>`}
function automationValue(){return answers.automation==='easy'?'Bekvämlighet':answers.automation==='manual'?'Kontroll':'Balans'}
function renderDecisionMap(ranked){$('decisionMap').innerHTML=`<div class="decision-axis x"><span>Mer kontroll</span><span>Mer bekvämlighet</span></div><div class="decision-axis y"><span>Mer espressofokus</span><span>Mer vardagskaffe</span></div>${ranked.slice(0,8).map((p,i)=>{const x=Math.round(((Number(p.automation)||3)/5)*100),y=100-Math.round(((Number(p.espresso)||3)/5)*100);return `<button class="decision-dot" style="left:${x}%;top:${y}%" data-detail="${p.id}" title="${escapeHtml(p.brand+' '+p.model)}"><span>${i+1}</span></button>`}).join('')}`;document.querySelectorAll('[data-detail]').forEach(b=>b.onclick=()=>openModal(b.dataset.detail))}
function buildRecommendationCards(ranked){const top=ranked[0];const topPrice=currentPrice(top);const cheaper=ranked.find(p=>{const a=currentPrice(p);return a&&topPrice&&a<topPrice*.8});const premium=ranked.find(p=>{const a=currentPrice(p);return a&&topPrice&&a>topPrice*1.25});const alt=ranked.find(p=>p.id!==top?.id&&!currentPrice(p));return [top,cheaper,premium||alt].filter((p,i,a)=>p&&a.findIndex(x=>x.id===p.id)===i).map((p,i)=>({...p,recommendationLabel:i===0?'DIN BÄSTA MATCH':i===1?'SAMMA BEHOV · BILLIGARE':currentPrice(p)?'OM DU VILL GÅ UPP EN NIVÅ':'ALTERNATIV · PRIS EJ VERIFIERAT'}))}
function card(p){const reason=p.recommendationLabel?(p.recommendationLabel==='DIN BÄSTA MATCH'?'Matchar flest av dina prioriteringar.':p.recommendationLabel.startsWith('SAMMA BEHOV')?'Ett billigare alternativ med liknande profil.':'Ett alternativ om du vill prioritera mer funktion.') : '';return `<article class="product-card"><div class="product-top"><span class="type">${escapeHtml(p.type||'Kaffemaskin')}</span>${p.recommendationLabel?`<span class="rec-label">${p.recommendationLabel}</span>`:''}</div><div class="product-image">${p.feed_image_url?`<img src="${escapeAttr(p.feed_image_url)}" alt="${escapeAttr(p.brand+' '+p.model)}">`:'☕'}</div><div class="brand">${escapeHtml(p.brand)}</div><h3>${escapeHtml(p.model)}</h3>${p.match?`<div class="match">${p.match}% match</div>`:''}${reason?`<p class="recommendation-reason">${reason}</p>`:''}<div class="price">${priceText(p)}</div><div class="card-copy">${escapeHtml(p.description||'')}</div><div class="card-bottom">${(p.tags||[]).slice(0,3).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join('')}</div><div class="card-actions"><button class="mini-button" data-detail="${p.id}">Se detaljer</button><button class="mini-button" data-compare="${p.id}">Jämför</button></div></article>`}
function renderProducts(list){$('productGrid').innerHTML=list.length?list.map(card).join(''):'<div class="empty">Inga maskiner matchade filtret.</div>';wireCards()}
function wireCards(){document.querySelectorAll('[data-compare]').forEach(b=>b.onclick=e=>{e.stopPropagation();toggleCompare(b.dataset.compare)});document.querySelectorAll('[data-detail]').forEach(b=>b.onclick=e=>{e.stopPropagation();openModal(b.dataset.detail)})}
function toggleCompare(id){if(compare.includes(id))compare=compare.filter(x=>x!==id);else if(compare.length<4)compare.push(id);else return alert('Du kan jämföra högst fyra maskiner.');$('compareCount').textContent=compare.length;track('compare_toggle',{id,active:compare.includes(id)});renderCompare()}
function renderCompare(){if(!compare.length){$('compareEmpty').style.display='block';$('compareTable').innerHTML='';$('tradeoffBox').classList.add('hidden');return}$('compareEmpty').style.display='none';const ps=compare.map(id=>products.find(p=>p.id===id)).filter(Boolean);const row=(label,fn)=>`<tr><td>${label}</td>${ps.map(p=>`<td>${fn(p)}</td>`).join('')}</tr>`;$('compareTable').innerHTML=`<div class="compare-wrap"><table class="compare-table"><thead><tr><th></th>${ps.map(p=>`<th>${escapeHtml(p.brand)}<br><strong>${escapeHtml(p.model)}</strong></th>`).join('')}</tr></thead><tbody>${row('Pris',priceText)}${row('Typ',p=>escapeHtml(p.type))}${row('Automation',p=>stars(p.automation))}${row('Kontroll',p=>stars(p.control))}${row('Espresso',p=>stars(p.espresso))}${row('Mjölkdrycker',p=>stars(p.milk))}${row('Rengöring',p=>stars(p.cleaning))}${row('Inbyggd kvarn',p=>p.grinder?'Ja':'Nej')}</tbody></table></div>`;$('tradeoffBox').classList.remove('hidden');$('tradeoffBox').innerHTML='<strong>Jämför kompromisserna.</strong> Högre automation betyder normalt mindre handpåläggning, medan högre kontroll ofta innebär mer arbete.'}
function stars(n){n=Number(n)||0;return '★'.repeat(n)+'☆'.repeat(Math.max(0,5-n))}
function openModal(id){const p=products.find(x=>x.id===id);if(!p)return;track('product_detail',{id});$('productModal').innerHTML=`<div class="modal-backdrop" data-close-modal><div class="modal-card" role="dialog" aria-modal="true"><button class="modal-close" data-close-modal>×</button><span class="eyebrow">${priceVerified(p)?'PRIS VERIFIERAT':'PRIS EJ VERIFIERAT'}</span><div class="product-image large">${p.feed_image_url?`<img src="${escapeAttr(p.feed_image_url)}" alt="${escapeAttr(p.brand+' '+p.model)}">`:'☕'}</div><div class="brand">${escapeHtml(p.brand)}</div><h2>${escapeHtml(p.model)}</h2><div class="price">${priceText(p)}</div><p>${escapeHtml(p.description||'')}</p><div class="modal-grid"><div><h4>Fördelar</h4><ul>${(p.pros||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></div><div><h4>Nackdelar</h4><ul>${(p.cons||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></div></div><p class="editorial-note">Matchningen är en redaktionell bedömning, inte ett laboratorietest.</p></div></div>`;$('productModal').classList.remove('hidden');document.querySelectorAll('[data-close-modal]').forEach(x=>x.onclick=()=>{$('productModal').classList.add('hidden')})}
function wireQuickStarts(){document.querySelectorAll('[data-quick]').forEach(b=>b.onclick=()=>{const q=b.dataset.quick;const presets={easy:{coffee:'black',automation:'easy',budget:'mid',cleaning:'high'},milk:{coffee:'milk',automation:'easy',budget:'upper',cleaning:'high'},budget:{coffee:'black',automation:'easy',budget:'low',cleaning:'high'},manual:{coffee:'espresso',automation:'manual',budget:'upper',cleaning:'low'}};answers={...presets[q]};track('quick_start',{path:q});showResults()})}
function wireSimulator(){ $('simBudget').oninput=updateSimulator }
function updateSimulator(){if(!$('simBudget'))return;const value=Number($('simBudget').value);$('simBudgetLabel').textContent=value.toLocaleString('sv-SE')+' kr';const band=value<2000?'low':value<5000?'mid':value<10000?'upper':'premium';const p=rankedProducts(band)[0];if(!p)return;$('simulatorResult').innerHTML=`<strong>${escapeHtml(p.brand)} ${escapeHtml(p.model)}</strong><span>${p.match}% match med budget ${value.toLocaleString('sv-SE')} kr.</span><small>${currentPrice(p)?(currentPrice(p)<=value?'Inom budget enligt vår prisdata.':'Över budget enligt vår prisdata.'):'Priset är ännu inte verifierat.'}</small>`}
function escapeHtml(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function escapeAttr(s){return escapeHtml(s)}
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('productModal'))$('productModal').classList.add('hidden')});
init();
