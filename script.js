'use strict';
const data=window.PORTFOLIO;
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const projectId=i=>data.projects[i].id||data.projects[i].github||data.projects[i].title;
let saved=[];try{const s=JSON.parse(localStorage.getItem('sathwik-my-list')||'[]');if(Array.isArray(s))saved=[...new Set(s.map(v=>Number.isInteger(v)&&data.projects[v]?projectId(v):v).filter(v=>data.projects.some((_,i)=>projectId(i)===v)))];}catch{}
let filter='all';let toastTimer;
const posterTitle=p=>esc(p.posterTitle||p.title).replace(/\n/g,'<br>');
const safeLink=url=>{try{const u=new URL(url);return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}};
const safeImage=url=>{if(!url)return '';if(/^(assets\/|images\/)[a-z0-9_./-]+$/i.test(url)&&!url.includes('..'))return url;return safeLink(url);};
let artSerial=0;
function art(index){
 const p=data.projects[index];
 const artwork=['clusters','pulse','city'].includes(p.artwork)?p.artwork:['clusters','pulse','city'][index%3];
 const cover=safeImage(p.image)||'assets/cover-'+artwork+'.svg';
 return `<img src="${esc(cover)}" alt="" loading="lazy" decoding="async">`;
}
function card(i){const p=data.projects[i];return `<article class="project-card"><button class="poster" data-project="${i}" aria-label="Explore ${esc(p.title)}"><div class="poster-art">${art(i)}</div><div class="poster-label"><b>S</b> SELECTED WORK</div><div class="poster-copy"><small>${esc(p.tag.toUpperCase())}</small><h3>${posterTitle(p)}</h3></div><span class="poster-play" aria-hidden="true">▶</span></button><div class="card-info"><span class="number">0${i+1}</span><div><h3>${esc(p.title)}</h3><p>${esc(p.tech.slice(0,3).join(' · '))}</p></div><button class="save-button" data-save="${i}" aria-pressed="${saved.includes(projectId(i))}" aria-label="${saved.includes(projectId(i))?'Remove':'Save'} ${esc(p.title)}">${saved.includes(projectId(i))?'✓':'+'}</button></div></article>`;}
function render(){const ids=data.projects.map((_,i)=>i).filter(i=>filter==='all'||(filter===(data.projects[i].category||'ml')));$('#project-grid').innerHTML=ids.map(card).join('');$('#project-empty').hidden=!!ids.length;$('#saved-grid').innerHTML=saved.map(id=>data.projects.findIndex((_,i)=>projectId(i)===id)).filter(i=>i>=0).map(card).join('');$('#saved-empty').hidden=!!saved.length;$('#list-count').textContent=saved.length;}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2300);}
function toggleSave(i){saved=saved.includes(projectId(i))?saved.filter(x=>x!==projectId(i)):[...saved,projectId(i)];try{localStorage.setItem('sathwik-my-list',JSON.stringify(saved));}catch{toast('Saved for this visit. Browser storage is unavailable.');render();return;}render();toast(saved.includes(projectId(i))?'Added to My List':'Removed from My List');}
function openProject(i){const p=data.projects[i];const metrics=!p.metrics||p.hideMetrics?`<p class="highlight">${esc(p.highlight||'Explore the implementation and architecture in the repository.')}</p>`:`${p.highlight?`<p class="highlight">${esc(p.highlight||'Explore the implementation and architecture in the repository.')}</p>`:''}<div class="metric-row">${Object.entries(p.metrics||{}).map(([k,v])=>`<div><strong>${esc(v)}</strong><small>${esc(k.toUpperCase())}</small></div>`).join('')}</div><p class="metric-note">Project-reported evaluation metrics.</p>`;$('#detail').innerHTML=`<div class="detail-art"><div class="poster-art">${art(i)}</div></div><div class="detail-body"><div class="detail-meta">PROJECT 0${i+1} &nbsp; / &nbsp; ${esc(p.tag)}</div><h2 id="detail-title">${esc(p.title)}</h2><p>${esc(p.description)}</p>${p.problem||p.approach?`<div class="case-study">${p.problem?`<section><h3>THE PROBLEM</h3><p>${esc(p.problem)}</p></section>`:''}${p.approach?`<section><h3>THE APPROACH</h3><p>${esc(p.approach)}</p></section>`:''}</div>`:''}${metrics}<div class="chips">${p.tech.map(t=>`<span>${esc(t)}</span>`).join('')}</div>${safeLink(p.github)?`<a class="button primary" href="${esc(safeLink(p.github))}" target="_blank" rel="noopener">Explore the code ↗</a>`:''} ${safeLink(p.live)?`<a class="button secondary" href="${esc(safeLink(p.live))}" target="_blank" rel="noopener">Live project ↗</a>`:''}</div>`;openDialog($('#project-dialog'));}
document.addEventListener('click',e=>{const project=e.target.closest('[data-project]');if(project)openProject(Number(project.dataset.project));const save=e.target.closest('[data-save]');if(save){const container=save.closest('#saved-grid')?'#saved-grid':'#project-grid';toggleSave(Number(save.dataset.save));const replacement=document.querySelector(`${container} [data-save="${save.dataset.save}"]`);if(replacement)replacement.focus({preventScroll:true});else $('#close-list').focus({preventScroll:true});}});
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});render();}));
document.querySelectorAll('dialog').forEach(d=>{d.querySelector('.dialog-close').addEventListener('click',()=>closeDialog(d));d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(d);}});});
$('#list-nav').addEventListener('click',()=>{$('#saved').hidden=false;$('#saved').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});$('#close-list').addEventListener('click',()=>{$('#saved').hidden=true;$('#list-nav').focus();});
$('#education').innerHTML=data.education.map((e,i)=>`<article class="episode"><span>0${i+1}</span><div><small>${esc(e.duration)}</small><h4>${esc(e.institution)}</h4><p>${esc(e.degree)}${e.specialization?' · '+esc(e.specialization):''}</p></div></article>`).join('');
const groups=['Languages','AI & machine learning','Core foundations','Developer tools'];
const symbols=['{ }','◉','⌘','▤'];
const skillDescriptions=['Python, Java, C++ and Kotlin form the foundation for turning an idea into working software.','From preprocessing with Scikit-Learn to building models with TensorFlow and serving them with Flask.','Data structures, object-oriented programming and model optimization support reliable problem solving.','MySQL and JDBC for data, Jupyter for experiments, and GitHub for sharing the work.'];
$('#skills').innerHTML=Object.values(data.skills).map((items,i)=>`<button class="skill-group" data-skill="${i}" aria-pressed="${i===0}" aria-controls="stack-detail"><span class="skill-visual skill-visual-${i}"><span>${symbols[i]}</span><i></i><i></i><i></i></span><h3><span>0${i+1}</span>${groups[i]} <b>↗</b></h3><div class="chips">${items.map(s=>`<span>${esc(s)}</span>`).join('')}</div></button>`).join('');
function selectSkill(i){$('#stack-detail').innerHTML=`<span class="stack-detail-label">INSIDE THE TOOLKIT / 0${i+1}</span><h3>${groups[i]}</h3><p>${skillDescriptions[i]}</p>`;document.querySelectorAll('[data-skill]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.skill)===i)));}
document.querySelectorAll('[data-skill]').forEach(b=>b.addEventListener('click',()=>selectSkill(Number(b.dataset.skill))));selectSkill(0);
$('#achievements').innerHTML=data.achievements.map((a,i)=>`<article class="achievement"><strong>${i===0?'10':'100+'}</strong><div><small>${esc(a.date)}</small><h3>${esc(a.title)}${a.link?` <a href="${esc(a.link)}" target="_blank" rel="noopener" aria-label="View LeetCode profile">↗</a>`:''}</h3><p>${esc(a.desc)}</p></div></article>`).join('');
$('#certifications').innerHTML=data.certifications.map(c=>{const valid=c.link&&!c.link.includes('YOUR_');return `<${valid?'a':'article'} class="certificate" ${valid?`href="${esc(c.link)}" target="_blank" rel="noopener"`:''}><h4>${esc(c.title)}</h4><p>${esc(c.desc)}</p><small>${esc(c.date)} · ${valid?'View credential ↗':'Certificate link coming soon'}</small></${valid?'a':'article'}>`;}).join('');
$('#resume').href=data.profile.resume;$('#email').href='mailto:'+data.profile.email;$('#socials').innerHTML=`<a href="${esc(data.profile.links.github)}" target="_blank" rel="noopener">GitHub ↗</a><a href="${esc(data.profile.links.linkedin)}" target="_blank" rel="noopener">LinkedIn ↗</a><a href="tel:${esc(data.profile.phone.replace(/[^+\d]/g,''))}">${esc(data.profile.phone)}</a><span>${esc(data.profile.location)}</span>`;
$('#copy-email').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(data.profile.email);toast('Email copied to clipboard');}catch{toast(data.profile.email);}});
const sections=[['My story & education','story','education university background'],['Skills & services','expertise',Object.values(data.skills).flat().join(' ')],['Contact Sathwik','contact','email phone linkedin github resume'],['Achievements & certifications','recognition','oracle hackathon leetcode DSA']];
function search(){const q=$('#search-input').value.trim().toLowerCase();const projects=data.projects.map((p,i)=>({p,i})).filter(({p})=>!q||[p.title,p.description,...p.tech].join(' ').toLowerCase().includes(q));const matching=sections.filter(([name,id,tags])=>!q||(name+' '+tags).toLowerCase().includes(q));$('#search-results').innerHTML=projects.map(({p,i})=>`<button class="search-result" data-search-project="${i}">${esc(p.title)}<span>PROJECT ↗</span></button>`).join('')+matching.map(([name,id])=>`<a class="search-result" href="#${id}" data-search-section>${esc(name)}<span>SECTION ↗</span></a>`).join('')||'<p class="empty">No matches. Try “Python” or “health”.</p>';}
$('#search-open').addEventListener('click',()=>{$('#search-input').value='';search();openDialog($('#search-dialog'));$('#search-input').focus();});$('#search-input').addEventListener('input',search);$('#search-results').addEventListener('click',e=>{const p=e.target.closest('[data-search-project]');if(p){closeDialog($('#search-dialog'));openProject(Number(p.dataset.searchProject));}if(e.target.closest('[data-search-section]'))closeDialog($('#search-dialog'));});
const observer='IntersectionObserver' in window ? new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){document.querySelectorAll('.chapter-nav a').forEach(a=>a.classList.toggle('current',a.hash==='#'+e.target.id));document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));}}),{rootMargin:'-10% 0px -65% 0px'}) : {observe(){}};['home','projects','story','expertise','contact'].forEach(id=>observer.observe(document.getElementById(id)));
render();


// Featured collection: manual controls keep the visitor in charge.
let featured=0;
function showFeatured(index=0){
 const stage=$('#feature-stage');
 if(!data.projects.length){stage.hidden=true;return;}
 stage.hidden=false;featured=(index+data.projects.length)%data.projects.length;
 const p=data.projects[featured];
 stage.innerHTML=`<div class="feature-copy"><span class="feature-meta">FEATURED RELEASE / ${String(featured+1).padStart(2,'0')}</span><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><div class="chips">${p.tech.slice(0,4).map(t=>`<span>${esc(t)}</span>`).join('')}</div><button class="button primary" data-project="${featured}">Inside the project <span>↗</span></button></div><div class="feature-visual"><div class="poster-art">${art(featured)}</div><span class="visual-caption">${p.image?'PROJECT COVER':'ILLUSTRATIVE PROJECT CONCEPT'}</span></div><div class="feature-controls"><span>${String(featured+1).padStart(2,'0')} / ${String(data.projects.length).padStart(2,'0')}</span><button id="feature-prev" aria-label="Previous featured project" ${data.projects.length<2?'disabled':''}>←</button><button id="feature-next" aria-label="Next featured project" ${data.projects.length<2?'disabled':''}>→</button></div>`;
 $('#feature-prev').addEventListener('click',()=>{showFeatured(featured-1);$('#feature-prev').focus({preventScroll:true});});
 $('#feature-next').addEventListener('click',()=>{showFeatured(featured+1);$('#feature-next').focus({preventScroll:true});});
 stage.classList.remove('changing');requestAnimationFrame(()=>stage.classList.add('changing'));
}
showFeatured();
$('#hero-count').textContent=String(data.projects.length).padStart(2,'0');
$('#collection-count').textContent=`(${String(data.projects.length).padStart(2,'0')})`;
$('#education-count').textContent=`${data.education.length} CHAPTERS`;
$('#intro-projects').innerHTML=data.projects.slice(0,3).map((p,i)=>`<button class="intro-project" data-intro-project="${i}"><span>0${i+1}</span><span><strong>${esc(p.title)}</strong><small>${esc(p.tag)}</small></span><span>↗</span></button>`).join('');
$('#intro-open').addEventListener('click',()=>openDialog($('#intro-dialog')));
$('#intro-resume').href=data.profile.resume;
$('#intro-contact').addEventListener('click',()=>closeDialog($('#intro-dialog')));
$('#intro-projects').addEventListener('click',e=>{const b=e.target.closest('[data-intro-project]');if(b){closeDialog($('#intro-dialog'));openProject(Number(b.dataset.introProject));}});

// Native dialogs, with a small fallback for older browsers.
let previousFocus=null;
function openDialog(d){
 previousFocus=document.activeElement;
 if(typeof d.showModal==='function')d.showModal();
 else{d.setAttribute('open','');d.setAttribute('data-fallback','');d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');}
 document.body.classList.add('dialog-open');
 const target=d.querySelector('input,button,a[href]');if(target)target.focus();
}
function closeDialog(d){
 if(typeof d.close==='function')d.close();else d.removeAttribute('open');
 if(!document.querySelector('dialog[open]'))document.body.classList.remove('dialog-open');
 if(previousFocus&&previousFocus.isConnected)previousFocus.focus({preventScroll:true});
}
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.classList.remove('dialog-open');}));
document.addEventListener('keydown',e=>{
 const fallback=document.querySelector('dialog[data-fallback][open]');
 if(fallback){if(e.key==='Escape'){e.preventDefault();closeDialog(fallback);}if(e.key==='Tab'){const items=[...fallback.querySelectorAll('button:not([disabled]),a[href],input')];const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}}
});
// Failed custom image URLs fall back to the bundled vector art.
document.addEventListener('error',e=>{if(e.target instanceof HTMLImageElement&&e.target.closest('.poster-art')&&!e.target.dataset.fallback){e.target.dataset.fallback='true';e.target.src='assets/cover-clusters.svg';}},true);

// Entrance: brief, once per session, never a blocking loading screen.
const entrance=document.querySelector('.entrance');
try{if(sessionStorage.getItem('sathwik-entered'))document.body.classList.add('entrance-skipped');sessionStorage.setItem('sathwik-entered','yes');}catch{}
setTimeout(()=>entrance?.remove(),1700);
document.addEventListener('keydown',()=>entrance?.remove(),{once:true});

// Native scrolling; transforms/opacity only. No perpetual JS animation loop.
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused=false;try{motionPaused=localStorage.getItem('sathwik-motion')==='paused';}catch{}
let framePending=false,heroVisible=true;
const hero=$('#home');
function requestFrame(){if(!framePending){framePending=true;requestAnimationFrame(updateScene);}}
function updateScene(){
 framePending=false;const y=window.scrollY||window.pageYOffset||0;
 const distance=document.documentElement.scrollHeight-window.innerHeight;
 document.documentElement.style.setProperty('--scroll-progress',String(distance>0?Math.min(1,y/distance):0));
 if(heroVisible&&!reducedMotion.matches&&!motionPaused&&innerWidth>760){const progress=Math.min(1,y/hero.offsetHeight);document.documentElement.style.setProperty('--hero-depth',`${Math.round(y*.1)}px`);document.documentElement.style.setProperty('--hero-opacity',String(Math.max(0,1-progress*1.2)));}
 else{document.documentElement.style.setProperty('--hero-depth','0px');document.documentElement.style.setProperty('--hero-opacity','1');}
}
function syncMotion(){
 document.body.classList.toggle('motion-paused',motionPaused);document.documentElement.classList.toggle('motion-paused',motionPaused);
 $('#motion-toggle').setAttribute('aria-pressed',String(motionPaused));$('#motion-toggle').setAttribute('aria-label',motionPaused?'Resume decorative motion':'Pause decorative motion');$('#motion-toggle').innerHTML=motionPaused?'<span>▶</span> Motion off':'<span>Ⅱ</span> Motion on';requestFrame();
}
$('#motion-toggle').addEventListener('click',()=>{motionPaused=!motionPaused;try{localStorage.setItem('sathwik-motion',motionPaused?'paused':'on');}catch{}syncMotion();});
window.addEventListener('scroll',requestFrame,{passive:true});window.addEventListener('resize',requestFrame,{passive:true});
const motionChange=()=>{if(reducedMotion.matches)document.querySelectorAll('.reveal-pending').forEach(e=>e.classList.add('in-view'));requestFrame();};
if(reducedMotion.addEventListener)reducedMotion.addEventListener('change',motionChange);else if(reducedMotion.addListener)reducedMotion.addListener(motionChange);
if('IntersectionObserver' in window){
 const sceneObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.target===hero){heroVisible=entry.isIntersecting;document.body.classList.toggle('hero-visible',heroVisible);requestFrame();}else entry.target.classList.toggle('scene-visible',entry.isIntersecting);}),{rootMargin:'60px'});
 sceneObserver.observe(hero);sceneObserver.observe($('#contact'));sceneObserver.observe($('.ticker'));
 if(!reducedMotion.matches){
  const reveals=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');reveals.unobserve(entry.target);}}),{threshold:.05,rootMargin:'0px 0px -25px 0px'});
  document.querySelectorAll('.section-heading,.feature-stage,.portrait-stage,.project-card,.story-title>h2,.identity-card,.story-title>p,.story-title>.text-link,.episode,.skill-group,.stack-detail,.achievement,.certificate,.contact h2,.contact-bottom').forEach((el,i)=>{if(el.getBoundingClientRect().top<innerHeight)return;el.classList.add('reveal-pending');el.style.setProperty('--reveal-delay',`${(i%3)*55}ms`);reveals.observe(el);});
 }
}else{document.body.classList.add('hero-visible');document.querySelectorAll('.ticker,.contact').forEach(el=>el.classList.add('scene-visible'));}
if(matchMedia('(hover: hover) and (pointer: fine)').matches){
 let pointerFrame=false,px=0,py=0;
 hero.addEventListener('pointermove',e=>{if(motionPaused||reducedMotion.matches)return;const rect=hero.getBoundingClientRect();px=((e.clientX-rect.left)/rect.width-.5)*18;py=((e.clientY-rect.top)/rect.height-.5)*12;if(!pointerFrame){pointerFrame=true;requestAnimationFrame(()=>{hero.style.setProperty('--pointer-x',px+'px');hero.style.setProperty('--pointer-y',py+'px');pointerFrame=false;});}},{passive:true});
 hero.addEventListener('pointerleave',()=>{hero.style.setProperty('--pointer-x','0px');hero.style.setProperty('--pointer-y','0px');});
}
document.addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('tab-hidden',document.hidden));
syncMotion();

// Small pointer-driven accents. Delegation also supports newly filtered cards.
// One pending animation frame at most; never a continuous pointer loop.
const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
let hoverTarget=null,hoverFrame=0,pointerClientX=0,pointerClientY=0;
function resetHover(){
 if(hoverFrame){cancelAnimationFrame(hoverFrame);hoverFrame=0;}
 if(hoverTarget){hoverTarget.classList.remove('is-hovered');['--tilt-x','--tilt-y','--mag-x','--mag-y'].forEach(key=>hoverTarget.style.removeProperty(key));}
 hoverTarget=null;
}
function applyPointer(){
 hoverFrame=0;
 if(!hoverTarget||!hoverTarget.isConnected||motionPaused||reducedMotion.matches||!finePointer.matches){resetHover();return;}
 const box=hoverTarget.getBoundingClientRect();
 const x=Math.max(0,Math.min(1,(pointerClientX-box.left)/Math.max(box.width,1)));
 const y=Math.max(0,Math.min(1,(pointerClientY-box.top)/Math.max(box.height,1)));
 hoverTarget.style.setProperty('--spot-x',`${x*100}%`);hoverTarget.style.setProperty('--spot-y',`${y*100}%`);
 if(hoverTarget.classList.contains('portrait-card')){
  hoverTarget.style.setProperty('--tilt-x',`${(0.5-y)*8}deg`);hoverTarget.style.setProperty('--tilt-y',`${(x-0.5)*10}deg`);
 }
 if(hoverTarget.classList.contains('button')){hoverTarget.style.setProperty('--mag-x',`${(x-.5)*7}px`);hoverTarget.style.setProperty('--mag-y',`${(y-.5)*5}px`);}
}
document.addEventListener('pointermove',e=>{
 if(e.pointerType==='touch'||!finePointer.matches||reducedMotion.matches||motionPaused){resetHover();return;}
 const target=e.target.closest('.portrait-card,.poster,.button');
 if(target!==hoverTarget){resetHover();hoverTarget=target;if(target){target.classList.add('is-hovered');if(target.classList.contains('poster')&&!target.querySelector('.hover-follow')){const label=document.createElement('span');label.className='hover-follow';label.textContent='EXPLORE ↗';label.setAttribute('aria-hidden','true');target.append(label);}}}
 if(!target)return;pointerClientX=e.clientX;pointerClientY=e.clientY;if(!hoverFrame)hoverFrame=requestAnimationFrame(applyPointer);
},{passive:true});
document.documentElement.addEventListener('pointerleave',resetHover);
window.addEventListener('blur',resetHover);
window.addEventListener('scroll',resetHover,{passive:true});
document.addEventListener('focusin',resetHover);
document.addEventListener('visibilitychange',()=>{if(document.hidden)resetHover();});
$('#motion-toggle').addEventListener('click',resetHover);
const pointerChange=()=>{resetHover();document.body.classList.toggle('pointer-effects',finePointer.matches&&!reducedMotion.matches);};
if(finePointer.addEventListener)finePointer.addEventListener('change',pointerChange);else if(finePointer.addListener)finePointer.addListener(pointerChange);
if(reducedMotion.addEventListener)reducedMotion.addEventListener('change',pointerChange);else if(reducedMotion.addListener)reducedMotion.addListener(pointerChange);
pointerChange();
