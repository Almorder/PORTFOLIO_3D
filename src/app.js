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
  const map={brand:'Marque / Organisation',moment:'Moment',story:'Récit / Collaboration',other:'Autre'};
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

// External video is activated only after an explicit contextual choice.
$$('[data-external-video]').forEach(gate=>{
  const button=$('[data-load-video]',gate);
  button?.addEventListener('click',()=>{
    const id=gate.dataset.videoId;
    if(!id) return;
    const iframe=document.createElement('iframe');
    iframe.src=`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0&autoplay=1`;
    iframe.title=gate.dataset.videoTitle || 'Vidéo YouTube';
    iframe.loading='lazy';
    iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen=true;
    gate.replaceChildren(iframe);
  });
});

// Reveal elements only when JS is present; no content is hidden without JS.
const revealTargets=$$('.work-entry,.satellite-link,.note-card,.client-proof,.decision-cascade article');
if('IntersectionObserver' in window && !reduced){
  document.documentElement.classList.add('reveal-enabled');
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('is-revealed');io.unobserve(entry.target);}
  }),{threshold:.12});
  revealTargets.forEach(el=>io.observe(el));
}

// Home entry carousel: tactile first, with optional desktop controls.
const entryCarousel=$('[data-entry-carousel]');
if(entryCarousel){
  const move=(dir)=>{
    const card=$('.entry-card',entryCarousel);
    const gap=20;
    const amount=(card?.getBoundingClientRect().width || entryCarousel.clientWidth*.8)+gap;
    entryCarousel.scrollBy({left:dir*amount,behavior:reduced?'auto':'smooth'});
  };
  $('[data-entry-prev]')?.addEventListener('click',()=>move(-1));
  $('[data-entry-next]')?.addEventListener('click',()=>move(1));
}
