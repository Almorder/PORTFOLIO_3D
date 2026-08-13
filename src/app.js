const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const clamp = (v,min=0,max=1)=>Math.max(min,Math.min(max,v));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scroll progress + scene choreography. Native scroll remains the source of truth.
const scenes = $$('.scroll-scene');
let ticking = false;
function updateScroll(){
  const y = window.scrollY;
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  document.documentElement.style.setProperty('--scroll-progress', y/max);
  scenes.forEach(scene=>{
    const rect = scene.getBoundingClientRect();
    const travel = Math.max(1, scene.offsetHeight - innerHeight);
    const p = clamp(-rect.top / travel);
    scene.style.setProperty('--p', p.toFixed(4));
    if(scene.dataset.scene === 'journey'){
      const idx = Math.min(2, Math.floor(p*3));
      $$('[data-journey-step]', scene).forEach((el,i)=>el.classList.toggle('is-active',i===idx));
      const count = $('[data-journey-count]', scene);
      if(count) count.textContent = `0${idx+1} / 03`;
      const showcase = $('[data-glass-showcase]', scene);
      if(showcase) setShowcaseStep(showcase, idx);
    }
  });
  ticking=false;
}
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateScroll);ticking=true;}},{passive:true});
addEventListener('resize',updateScroll,{passive:true});
updateScroll();

// Pointer depth on the hero, deliberately subtle and desktop-only.
if(!reduced && matchMedia('(pointer:fine)').matches){
  const hero = $('.home-hero__sticky');
  if(hero){
    hero.addEventListener('pointermove',e=>{
      const r=hero.getBoundingClientRect();
      hero.style.setProperty('--mx',((e.clientX-r.left)/r.width-.5).toFixed(3));
      hero.style.setProperty('--my',((e.clientY-r.top)/r.height-.5).toFixed(3));
    });
    hero.addEventListener('pointerleave',()=>{hero.style.setProperty('--mx',0);hero.style.setProperty('--my',0);});
  }
}

// Navigation remains available throughout the experience: the page can be immersive without trapping the visitor.
const header = $('[data-header]');
addEventListener('scroll',()=>{
  header?.classList.toggle('is-scrolled', scrollY > 80);
},{passive:true});
header?.classList.toggle('is-scrolled', scrollY > 80);

// Accessible mobile menu: Escape, focus containment and focus restoration.
const menuButton=$('[data-menu-button]');
const mobileMenu=$('[data-mobile-menu]');
if(menuButton && mobileMenu){
  let returnFocus=null;
  const focusable=()=>$$('a,button,[tabindex]:not([tabindex="-1"])',mobileMenu).filter(el=>!el.hidden);
  const closeMenu=()=>{
    menuButton.setAttribute('aria-expanded','false');
    mobileMenu.hidden=true;
    document.body.classList.remove('menu-open');
    returnFocus?.focus?.();
  };
  const openMenu=()=>{
    returnFocus=document.activeElement;
    menuButton.setAttribute('aria-expanded','true');
    mobileMenu.hidden=false;
    document.body.classList.add('menu-open');
    requestAnimationFrame(()=>focusable()[0]?.focus());
  };
  menuButton.addEventListener('click',()=>menuButton.getAttribute('aria-expanded')==='true'?closeMenu():openMenu());
  $$('a',mobileMenu).forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{
    if(mobileMenu.hidden) return;
    if(e.key==='Escape'){e.preventDefault();closeMenu();return;}
    if(e.key==='Tab'){
      const list=focusable(); if(!list.length) return;
      const first=list[0], last=list.at(-1);
      if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
}

// Work filtering + deep link ?territory=. No terminal storage is used.
const filterRow=$('[data-filter-row]');
if(filterRow){
  const entries=$$('.work-entry');
  const apply=(value)=>{
    entries.forEach(e=>e.classList.toggle('is-hidden', value!=='all' && e.dataset.territory!==value));
    $$('button',filterRow).forEach(b=>{
      const active=b.dataset.filter===value;
      b.classList.toggle('is-active',active);
      b.setAttribute('aria-pressed',String(active));
    });
  };
  $$('button',filterRow).forEach(b=>b.addEventListener('click',()=>apply(b.dataset.filter)));
  const requested=new URLSearchParams(location.search).get('territory');
  apply(requested && ['Marques','Récits','Moments'].includes(requested) ? requested : 'all');
}

// Contact intent adapts only from the URL or an explicit click on the current page.
const form=$('[data-contact-form]');
if(form){
  const buttons=$$('[data-form-intent]',form);
  const input=$('[data-intent-input]',form);
  const initialIntent=new URLSearchParams(location.search).get('intent') || 'other';
  const map={brand:'Film / image de marque',moment:'Mariage / moment',story:'Récit / collaboration',other:'Autre projet'};
  const setIntent=(key='other')=>{
    const safe=map[key]?key:'other';
    input.value=map[safe];
    buttons.forEach(b=>{
      const active=b.dataset.formIntent===safe;
      b.classList.toggle('is-active',active);
      b.setAttribute('aria-pressed',String(active));
    });
  };
  setIntent(initialIntent);
  buttons.forEach(b=>b.addEventListener('click',()=>setIntent(b.dataset.formIntent)));

  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const submit=$('[data-submit]',form); const status=$('[data-form-status]',form);
    if(!form.reportValidity()) return;
    submit.disabled=true; submit.dataset.original=submit.innerHTML; submit.textContent='Envoi…'; status.textContent='';
    try{
      const payload=Object.fromEntries(new FormData(form).entries());
      const res=await fetch(form.action,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload)});
      const data=await res.json().catch(()=>({success:res.ok}));
      if(!res.ok || data.success===false) throw new Error('submit');
      form.reset(); setIntent(initialIntent);
      status.textContent='Message envoyé. Je reviens vers vous sous 48 h ouvrées.';
    }catch{
      status.innerHTML='L’envoi a échoué. Vous pouvez écrire directement à <a href="mailto:nolanribcontact@gmail.com">nolanribcontact@gmail.com</a>.';
    }finally{
      submit.disabled=false; submit.innerHTML=submit.dataset.original || 'Envoyer ↗';
    }
  });
}

// About portrait: never substitute a stock face for Nolan. If the real asset is absent, show the designed fallback instead.
$$('[data-nolan-portrait]').forEach(img=>{
  const frame=img.closest('.about-story-hero__portrait');
  const missing=()=>frame?.classList.add('is-missing');
  img.addEventListener('error',missing,{once:true});
  if(img.complete && img.naturalWidth===0) missing();
});

// External video is activated only after an explicit contextual choice.
$$('[data-external-video]').forEach(gate=>{
  const button=$('[data-load-video]',gate);
  const activate=()=>{
    const id=gate.dataset.videoId;
    if(!id) return;
    const iframe=document.createElement('iframe');
    iframe.src=`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0&autoplay=1`;
    iframe.title=gate.dataset.videoTitle || 'Vidéo YouTube';
    iframe.loading='lazy';
    iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen=true;
    gate.closest('[data-ambient-player]')?.classList.add('is-playing');
    gate.replaceChildren(iframe);
  };
  if(button?.matches('[data-hold-confirm]')) button.addEventListener('holdconfirm',activate,{once:true});
  else button?.addEventListener('click',activate,{once:true});
});

// Reveal elements only when JS is present; no content is hidden without JS.
const revealTargets=$$('.motion-reveal,.work-entry,.satellite-link,.note-card,.client-proof,.decision-cascade article');
if('IntersectionObserver' in window && !reduced){
  document.documentElement.classList.add('reveal-enabled');
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('is-revealed');io.unobserve(entry.target);}
  }),{threshold:.12});
  revealTargets.forEach(el=>io.observe(el));
}

// Home entry cards use a three-column desktop grid and native horizontal swipe on narrow screens.

// Logo preloader: only on a genuine entry to the homepage. Internal navigation and back/forward are not delayed.
const preloader=$('[data-brand-preloader]');
if(preloader){
  const navEntry=performance.getEntriesByType?.('navigation')?.[0];
  const internalRef=document.referrer && (()=>{try{return new URL(document.referrer).origin===location.origin}catch{return false}})();
  const skip=internalRef || navEntry?.type==='back_forward' || reduced;
  const leave=()=>preloader.classList.add('is-leaving');
  if(skip) leave();
  else setTimeout(leave,920);
  preloader.addEventListener('transitionend',()=>{if(preloader.classList.contains('is-leaving')) preloader.remove();},{once:true});
}

// Scroll-triggered stats. Values are factual site data; no invented business KPIs.
$$('[data-counter]').forEach(counter=>{
  const target=Number(counter.dataset.counter||0);
  const run=()=>{
    if(reduced){counter.textContent=String(target);return;}
    const start=performance.now(), duration=900;
    const tick=now=>{
      const p=clamp((now-start)/duration);
      const eased=1-Math.pow(1-p,4);
      counter.textContent=String(Math.round(target*eased));
      if(p<1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if('IntersectionObserver' in window && !reduced){
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){run();io.disconnect();}}),{threshold:.45});
    io.observe(counter);
  }else run();
});

// Focus Testimonials: desktop/fine pointer follows the marketplace interaction principle;
// mobile keeps every quote readable and does not depend on hover.
$$('[data-focus-testimonials]').forEach(section=>{
  const items=$$('[data-testimonial-index]',section);
  if(!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  const focus=item=>{
    section.classList.add('is-focusing');
    items.forEach(el=>el.classList.toggle('is-focused',el===item));
  };
  const clear=()=>{section.classList.remove('is-focusing');items.forEach(el=>el.classList.remove('is-focused'));};
  items.forEach(item=>{
    item.addEventListener('pointerenter',()=>focus(item));
    item.addEventListener('focus',()=>focus(item));
    item.addEventListener('blur',clear);
  });
  section.addEventListener('pointerleave',clear);
});

// Lightweight particle handoff for the glass showcase. It recreates the public interaction idea
// without importing the paid Framer/Three.js component or its implementation.
const showcaseState=new WeakMap();
function setShowcaseStep(showcase, idx){
  const state=showcaseState.get(showcase) || {idx:-1,particles:[],raf:0};
  if(state.idx===idx) return;
  $$('[data-showcase-frame]',showcase).forEach((frame,i)=>frame.classList.toggle('is-active',i===idx));
  if(state.idx>=0 && !reduced) burstShowcase(showcase,state);
  state.idx=idx;
  showcaseState.set(showcase,state);
}
function burstShowcase(showcase,state){
  const canvas=$('[data-showcase-particles]',showcase); if(!canvas) return;
  const rect=canvas.getBoundingClientRect();
  const dpr=Math.min(devicePixelRatio||1,1.5);
  canvas.width=Math.max(1,Math.round(rect.width*dpr)); canvas.height=Math.max(1,Math.round(rect.height*dpr));
  const ctx=canvas.getContext('2d'); if(!ctx) return;
  const cx=canvas.width/2, cy=canvas.height/2;
  const palette=['#e97736','#f0ebe2','#9b6a52'];
  state.particles=Array.from({length:54},(_,i)=>({
    x:cx+(Math.random()-.5)*canvas.width*.18,
    y:cy+(Math.random()-.5)*canvas.height*.18,
    vx:(Math.random()-.5)*canvas.width*.012,
    vy:(Math.random()-.5)*canvas.height*.012,
    life:1,
    size:(1.5+Math.random()*3)*dpr,
    color:palette[i%palette.length]
  }));
  cancelAnimationFrame(state.raf);
  const frame=()=>{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    let alive=false;
    state.particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.vx*=.986; p.vy*=.986; p.life-=.026;
      if(p.life<=0) return; alive=true;
      ctx.globalAlpha=Math.max(0,p.life)*.78; ctx.fillStyle=p.color;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha=1;
    if(alive) state.raf=requestAnimationFrame(frame); else ctx.clearRect(0,0,canvas.width,canvas.height);
  };
  frame();
}

// Line Menu TOC: tracks the closest visible section and keeps the component purely navigational.
$$('[data-line-toc]').forEach(toc=>{
  const links=$$('a[data-toc-target]',toc);
  const targets=links.map(a=>document.getElementById(a.dataset.tocTarget)).filter(Boolean);
  if(!targets.length) return;
  const setActive=id=>links.forEach(a=>{
    const active=a.dataset.tocTarget===id;
    a.classList.toggle('is-active',active);
    if(active) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current');
  });
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>{
      const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>Math.abs(a.boundingClientRect.top)-Math.abs(b.boundingClientRect.top));
      if(visible[0]) setActive(visible[0].target.id);
    },{rootMargin:'-22% 0px -62% 0px',threshold:[0,.1,.4]});
    targets.forEach(el=>io.observe(el));
  }
  setActive(targets[0].id);
});

// Hold Confirm — used only for loading third-party video, where a deliberate gesture also has privacy meaning.
$$('[data-hold-confirm]').forEach(button=>{
  const duration=Math.max(350,Number(button.dataset.holdMs||650));
  let start=0, raf=0, holding=false;
  const setProgress=p=>button.style.setProperty('--hold-progress',clamp(p));
  const cancel=()=>{holding=false;cancelAnimationFrame(raf);setProgress(0);button.classList.remove('is-holding');};
  const complete=()=>{
    holding=false;cancelAnimationFrame(raf);setProgress(1);button.classList.remove('is-holding');button.classList.add('is-confirmed');
    button.dispatchEvent(new CustomEvent('holdconfirm',{bubbles:true}));
  };
  const frame=now=>{
    if(!holding) return;
    const p=(now-start)/duration; setProgress(p);
    if(p>=1) complete(); else raf=requestAnimationFrame(frame);
  };
  const begin=()=>{
    if(button.disabled||holding||button.classList.contains('is-confirmed')) return;
    holding=true;start=performance.now();button.classList.add('is-holding');raf=requestAnimationFrame(frame);
  };
  button.addEventListener('pointerdown',e=>{if(e.button===0){button.setPointerCapture?.(e.pointerId);begin();}});
  button.addEventListener('pointerup',cancel);button.addEventListener('pointercancel',cancel);button.addEventListener('pointerleave',()=>{if(holding) cancel();});
  button.addEventListener('click',e=>e.preventDefault());
  button.addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();begin();}});
  button.addEventListener('keyup',e=>{if((e.key===' '||e.key==='Enter')&&holding){e.preventDefault();cancel();}});
});

// Optional Page View Counter. Disabled unless Supabase public credentials are injected at build time.
// If enabled later, the privacy/cookies copy must be reviewed before production activation.
(async()=>{
  const counter=$('[data-page-view-counter]'); if(!counter) return;
  const url=$('meta[name="nolanarc-supabase-url"]')?.content?.replace(/\/$/,'');
  const key=$('meta[name="nolanarc-supabase-key"]')?.content;
  if(!url||!key) return;
  const slug=location.pathname.replace(/\/+$/,'')||'/';
  const headers={apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'};
  try{
    const endpoint=`${url}/rest/v1/page_views?slug=eq.${encodeURIComponent(slug)}&select=views`;
    const read=await fetch(endpoint,{headers:{...headers,Accept:'application/json'}});
    if(!read.ok) return;
    const rows=await read.json();
    let views=1;
    if(rows[0]){
      views=Number(rows[0].views||0)+1;
      await fetch(`${url}/rest/v1/page_views?slug=eq.${encodeURIComponent(slug)}`,{method:'PATCH',headers:{...headers,Prefer:'return=minimal'},body:JSON.stringify({views,updated_at:new Date().toISOString()})});
    }else{
      await fetch(`${url}/rest/v1/page_views`,{method:'POST',headers:{...headers,Prefer:'return=minimal'},body:JSON.stringify({slug,views})});
    }
    const value=$('b',counter); if(value) value.textContent=Intl.NumberFormat('fr-FR').format(views);
    counter.hidden=false;
  }catch{}
})();
