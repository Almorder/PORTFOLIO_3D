const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const clamp = (v,min=0,max=1)=>Math.max(min,Math.min(max,v));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const showcaseState=new WeakMap();

// Logo Preloader — minimal branded entrance on Home only.
// The component follows the public Framer behaviour: entrance → optional hold → fade-out,
// with hard fail-safes so it can never trap navigation.
const preloader=$('[data-brand-preloader]');
if(preloader){
  const navEntry=performance.getEntriesByType?.('navigation')?.[0];
  const internalRef=document.referrer && (()=>{try{return new URL(document.referrer).origin===location.origin}catch{return false}})();
  const skip=internalRef || navEntry?.type==='back_forward' || reduced;
  const hold=Math.max(0,Number(preloader.dataset.preloaderHold||240));
  let removed=false;
  const leave=()=>{
    if(removed) return;
    preloader.classList.add('is-leaving');
    preloader.style.pointerEvents='none';
    setTimeout(()=>{if(document.contains(preloader)) preloader.remove();removed=true;},540);
  };
  if(skip) requestAnimationFrame(leave);
  else setTimeout(leave,620+hold);
  setTimeout(leave,1320);
  addEventListener('pageshow',e=>{if(e.persisted) leave();},{once:true});
}

// Nolan Arc custom cursor — a rounded orange square that becomes transparent on interaction.
const customCursor=$('[data-custom-cursor]');
if(customCursor && matchMedia('(hover:hover) and (pointer:fine)').matches && !reduced){
  document.documentElement.classList.add('has-custom-cursor');
  let cx=-100,cy=-100,tx=-100,ty=-100,raf=0;
  const render=()=>{
    if(document.hidden){raf=0;return;}
    const dx=tx-cx,dy=ty-cy;cx+=dx*.34;cy+=dy*.34;
    customCursor.style.transform=`translate3d(${cx-11}px,${cy-11}px,0)`;
    if(Math.abs(dx)+Math.abs(dy)>.12) raf=requestAnimationFrame(render); else {cx=tx;cy=ty;raf=0;}
  };
  const wake=()=>{if(!raf&&!document.hidden)raf=requestAnimationFrame(render)};
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&raf){cancelAnimationFrame(raf);raf=0;}else wake();});
  addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;customCursor.style.opacity='1';wake();},{passive:true});
  addEventListener('pointerdown',()=>customCursor.classList.add('is-pressed'),{passive:true});
  addEventListener('pointerup',()=>customCursor.classList.remove('is-pressed'),{passive:true});
  document.addEventListener('pointerover',e=>{customCursor.classList.toggle('is-interactive',Boolean(e.target.closest('a,button,input,textarea,select,summary,[role="button"],[data-video-slide-show],[data-stacked-flow]')));});
  document.addEventListener('mouseleave',()=>{customCursor.style.opacity='0';});
  addEventListener('pagehide',()=>cancelAnimationFrame(raf),{once:true});
}

// Route prefetch — contact/work/services/about are warmed before the click without delaying first paint.
const prefetched=new Set();
const prefetchRoute=href=>{
  try{const url=new URL(href,location.href);if(url.origin!==location.origin||prefetched.has(url.pathname)||url.pathname===location.pathname)return;prefetched.add(url.pathname);const link=document.createElement('link');link.rel='prefetch';link.as='document';link.href=url.pathname+url.search;document.head.append(link);}catch{}
};
document.addEventListener('pointerover',e=>{const a=e.target.closest('a[href^="/"]');if(a)prefetchRoute(a.getAttribute('href'));},{passive:true});
document.addEventListener('focusin',e=>{const a=e.target.closest?.('a[href^="/"]');if(a)prefetchRoute(a.getAttribute('href'));});
if('requestIdleCallback' in window){
  const likely=location.pathname==='/'?['/work/','/contact/']:location.pathname.startsWith('/work')||location.pathname.startsWith('/projet')?['/services/','/contact/']:location.pathname.startsWith('/services')?['/work/','/contact/']:['/work/','/contact/'];
  requestIdleCallback(()=>likely.forEach(prefetchRoute),{timeout:1800});
}

// Scroll progress + scene choreography. Native scroll remains the source of truth.
const header = $('[data-header]');
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
      const idx=Math.min(2,Math.floor(p*3));
      const phase=Math.min(2.999,p*3);
      const local=phase-idx;
      scene.dataset.journeyStep=String(idx);
      scene.style.setProperty('--journey-shift',((p-.5)*11).toFixed(3));
      scene.style.setProperty('--journey-y',(Math.sin(p*Math.PI*2)*1.8).toFixed(3));
      scene.style.setProperty('--journey-rot',`${((p-.5)*5.5).toFixed(2)}deg`);
      scene.style.setProperty('--journey-ring',`${(p*220).toFixed(1)}deg`);
      scene.style.setProperty('--journey-energy',(0.35+Math.sin(local*Math.PI)*.65).toFixed(3));
      $$('[data-journey-step]', scene).forEach((el,i)=>el.classList.toggle('is-active',i===idx));
      const count = $('[data-journey-count]', scene);
      if(count) count.textContent = `0${idx+1} / 03`;
      const showcase = $('[data-glass-showcase]', scene);
      if(showcase){ setShowcaseProgress(showcase,p); setShowcaseStep(showcase, idx); }
    }
  });
  header?.classList.toggle('is-scrolled', y > 80);
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

// Navigation remains available throughout the experience.
header?.classList.toggle('is-scrolled', scrollY > 80);

// Navigation flottante : barre large en haut de page, pastille centrée dès qu'on défile.
// On lit la disposition « ouverte », puis la disposition « pastille » (un changement de classe
// jamais affiché), et on transmet l'écart au CSS, qui anime. Adapté du composant gratuit
// « Floating Navbar » d'Annnimate, réécrit sans dépendance.
if(header?.hasAttribute('data-fnb')){
  const bg=$('[data-fnb-bg]',header), items=$$('[data-fnb-item]',header), tail=$('.fnb-tail',header);
  const DOCK_AT=80, RELEASE_AT=56, OFFSET=12, PAD=6, INSET=20;
  let docked=false, lastWidth=0, resizeTimer=0;
  const px=v=>`${v.toFixed(1)}px`;
  const settle=()=>{void header.offsetWidth;header.classList.remove('fnb-instant');};
  const measure=()=>{
    header.classList.add('fnb-instant','is-measuring');
    const width=header.getBoundingClientRect().width, barH=header.offsetHeight, bgH=bg.offsetHeight;
    const tops=items.map(el=>el.getBoundingClientRect().left);
    const tailWidth=tail?tail.getBoundingClientRect().width:0;
    header.classList.add('is-measuring-dock');
    const docks=items.map(el=>el.getClientRects().length?el.getBoundingClientRect():null);
    const live=docks.filter(Boolean);
    header.classList.remove('is-measuring','is-measuring-dock');
    if(live.length){
      const rowLeft=live[0].left, rowRight=live[live.length-1].right;
      const pillH=live[live.length-1].height+PAD*2, pillW=rowRight-rowLeft+INSET+PAD, pillX=(width-pillW)/2;
      const shift=pillX+INSET-rowLeft;
      items.forEach((el,i)=>el.style.setProperty('--dx',docks[i]?px(docks[i].left+shift-tops[i]):'0px'));
      const vars={ct:OFFSET,cx:pillX,cb:Math.max(0,bgH-OFFSET-pillH),cr:pillH/2,ph:pillH,dy:OFFSET+pillH/2-barH/2,t1:tailWidth};
      for(const k in vars) header.style.setProperty(`--fnb-${k}`,px(vars[k]));
    }
    lastWidth=width;
    settle();
  };
  const setDocked=(value,instant)=>{
    if(value===docked) return;
    docked=value;
    if(instant) header.classList.add('fnb-instant');
    header.classList.toggle('is-docked',docked);
    if(instant) settle();
  };
  // Deux seuils : la pastille ne clignote pas quand on s'arrête pile sur la limite.
  const syncDock=instant=>{
    if(!docked&&scrollY>=DOCK_AT) setDocked(true,instant);
    else if(docked&&scrollY<RELEASE_AT) setDocked(false,instant);
  };
  measure();
  syncDock(true);
  addEventListener('scroll',()=>syncDock(false),{passive:true});
  addEventListener('resize',()=>{
    clearTimeout(resizeTimer);
    // Un simple changement de hauteur (barre d'adresse mobile) ne modifie pas la géométrie.
    resizeTimer=setTimeout(()=>{if(header.getBoundingClientRect().width!==lastWidth) measure();},150);
  },{passive:true});
  document.fonts?.ready.then(measure);
  // Le navigateur peut restaurer une position défilée après l'initialisation.
  addEventListener('load',()=>{measure();syncDock(true);},{once:true});
}

// Accessible mobile menu: Escape, focus containment and focus restoration.
const menuButton=$('[data-menu-button]');
const mobileMenu=$('[data-mobile-menu]');
if(menuButton && mobileMenu){
  let returnFocus=null;
  const focusable=()=>$$('a,button,[tabindex]:not([tabindex="-1"])',mobileMenu).filter(el=>!el.hidden);
  const menuLabel=$('[data-menu-label]',menuButton);
  const closeMenu=()=>{
    menuButton.setAttribute('aria-expanded','false');
    mobileMenu.hidden=true;
    document.body.classList.remove('menu-open');
    if(menuLabel) menuLabel.textContent='Menu';
    returnFocus?.focus?.();
  };
  const openMenu=()=>{
    returnFocus=document.activeElement;
    menuButton.setAttribute('aria-expanded','true');
    mobileMenu.hidden=false;
    document.body.classList.add('menu-open');
    if(menuLabel) menuLabel.textContent='Fermer';
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


// Contact intent adapts only from the URL or an explicit click on the current page.
const form=$('[data-contact-form]');
if(form){
  const buttons=$$('[data-form-intent]',form);
  const input=$('[data-intent-input]',form);
  const initialIntent=new URLSearchParams(location.search).get('intent') || 'other';
  const map={brand:'Marque',moment:'Mariage / moment',story:'Film / récit',other:'Autre'};
  const setIntent=(key='other')=>{
    const safe=map[key]?key:'other';
    if(input) input.value=map[safe];
    buttons.forEach(b=>{
      const active=b.dataset.formIntent===safe;
      b.classList.toggle('is-active',active);
      b.setAttribute('aria-pressed',String(active));
    });
  };
  if(input||buttons.length){setIntent(initialIntent);buttons.forEach(b=>b.addEventListener('click',()=>setIntent(b.dataset.formIntent)));}

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
      form.reset(); if(input||buttons.length) setIntent(initialIntent);
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
  const frame=img.closest('figure') || img.parentElement;
  const missing=()=>frame?.classList.add('is-missing');
  img.addEventListener('error',missing,{once:true});
  if(img.complete && img.naturalWidth===0) missing();
});


// Brand logo fallbacks — preserve clean cards even when a remote brand asset is unavailable.
$$('.v16-logo-media img').forEach(img=>{
  const fallback=img.nextElementSibling;
  const fail=()=>{img.hidden=true;fallback?.classList.add('is-visible');};
  img.addEventListener('error',fail,{once:true});
  if(img.complete&&img.naturalWidth===0) fail();
});

// Audience measurement — Cloudflare Web Analytics (cookieless). Skipped on opt-out, Do Not Track or Global Privacy Control.
const optOutKey='nolanarc_audience_optout';
const audienceOptedOut=()=>{
  if(document.cookie.split('; ').some(v=>v===`${optOutKey}=1`)) return true;
  return navigator.doNotTrack==='1'||window.doNotTrack==='1'||navigator.globalPrivacyControl===true;
};
const audienceToken=document.querySelector('meta[name="nolanarc-audience-token"]')?.content;
if(audienceToken && !audienceOptedOut() && !location.pathname.startsWith('/admin')){
  const beacon=document.createElement('script');
  beacon.defer=true;
  beacon.src='https://static.cloudflareinsights.com/beacon.min.js';
  beacon.dataset.cfBeacon=JSON.stringify({token:audienceToken});
  document.head.append(beacon);
}
$$('[data-audience-optout]').forEach(button=>{
  const label=()=>{
    const off=audienceOptedOut();
    button.textContent=off?'Réactiver la mesure de ma visite':'Ne pas compter ma visite';
    button.setAttribute('aria-pressed',String(off));
  };
  label();
  button.addEventListener('click',()=>{
    const secure=location.protocol==='https:'?'; Secure':'';
    document.cookie=`${optOutKey}=${document.cookie.includes(`${optOutKey}=1`)?'0':'1'}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
    label();
  });
});

// Hero video facade — cinematic when authorised, zero YouTube request before consent.
const heroVideo=$('[data-hero-video]');
const consentBox=$('[data-cookie-consent]');
const consentCookie='nolanarc_external_video';
const readConsent=()=>document.cookie.split('; ').find(v=>v.startsWith(`${consentCookie}=`))?.split('=')[1]||'';
const writeConsent=value=>{const secure=location.protocol==='https:'?'; Secure':'';document.cookie=`${consentCookie}=${value}; Max-Age=15552000; Path=/; SameSite=Lax${secure}`;};
const showConsent=()=>{if(consentBox){consentBox.hidden=false;requestAnimationFrame(()=>consentBox.classList.add('is-visible'));}};
const hideConsent=()=>{if(consentBox){consentBox.classList.remove('is-visible');setTimeout(()=>{consentBox.hidden=true;},220);}};
let mountHeroVideo=()=>{}, unmountHeroVideo=()=>{};
if(heroVideo && !reduced){
  const slot=$('[data-hero-video-slot]',heroVideo);
  let visible=true, mountTimer=0, idleHandle=0;
  unmountHeroVideo=()=>{
    clearTimeout(mountTimer);
    if(idleHandle && 'cancelIdleCallback' in window) cancelIdleCallback(idleHandle);
    idleHandle=0;
    slot?.replaceChildren();
    heroVideo.classList.remove('is-video-ready');
    heroVideo.dataset.videoMounted='false';
  };
  const mount=()=>{
    if(readConsent()!=='accepted' || !visible || !slot || heroVideo.dataset.videoMounted==='true' || document.hidden) return;
    const src=heroVideo.dataset.videoSrc; if(!src) return;
    const iframe=document.createElement('iframe');
    iframe.className='v16-hero__video';
    iframe.src=src;
    iframe.title=heroVideo.dataset.videoTitle || 'Vidéo cinématique Sony';
    iframe.tabIndex=-1;
    iframe.loading='lazy';
    iframe.allow='autoplay; encrypted-media; picture-in-picture';
    iframe.referrerPolicy='strict-origin-when-cross-origin';
    iframe.addEventListener('load',()=>heroVideo.classList.add('is-video-ready'),{once:true});
    slot.append(iframe);
    heroVideo.dataset.videoMounted='true';
  };
  mountHeroVideo=()=>{
    clearTimeout(mountTimer);
    if(readConsent()!=='accepted') return;
    const queue=()=>{'requestIdleCallback' in window
      ? idleHandle=requestIdleCallback(()=>{idleHandle=0;mount();},{timeout:900})
      : mountTimer=setTimeout(mount,320);
    };
    if(document.readyState==='complete') queue();
    else addEventListener('load',queue,{once:true});
  };
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      visible=entry.isIntersecting;
      if(visible) mountHeroVideo();
      else mountTimer=setTimeout(unmountHeroVideo,1200);
    }),{rootMargin:'240px 0px',threshold:0});
    observer.observe(heroVideo);
  }else mountHeroVideo();
  document.addEventListener('visibilitychange',()=>document.hidden?unmountHeroVideo():visible&&mountHeroVideo());
  // Pas de bandeau imposé : le visiteur active le fond vidéo depuis le bouton du hero ou le footer.
  if(readConsent()==='accepted') mountHeroVideo();
}

const syncVideoToggle=()=>$$('[data-hero-video-toggle]').forEach(button=>button.setAttribute('aria-pressed',String(readConsent()==='accepted')));
syncVideoToggle();
consentBox?.addEventListener('click',event=>{
  if(event.target.closest('[data-cookie-accept]')){writeConsent('accepted');hideConsent();mountHeroVideo();syncVideoToggle();}
  if(event.target.closest('[data-cookie-reject]')){writeConsent('rejected');unmountHeroVideo();hideConsent();syncVideoToggle();}
});
$$('[data-cookie-settings]').forEach(button=>button.addEventListener('click',()=>{unmountHeroVideo();showConsent();}));

// V16 pricing switcher — one compact pricing surface, three offers.
$$('[data-pricing-switcher]').forEach(section=>{
  const tabs=$$('[data-pricing-tab]',section), panels=$$('[data-pricing-panel]',section);
  if(!tabs.length||!panels.length) return;
  const keys=new Set(tabs.map(tab=>tab.dataset.pricingTab));
  const initial=tabs.find(tab=>tab.getAttribute('aria-selected')==='true')?.dataset.pricingTab||tabs[0].dataset.pricingTab;
  const set=(key,focus=false)=>{
    if(!keys.has(key)) return;
    tabs.forEach(tab=>{const active=tab.dataset.pricingTab===key;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;if(active&&focus)tab.focus();});
    panels.forEach(panel=>{const active=panel.dataset.pricingPanel===key;panel.hidden=!active;panel.classList.toggle('is-active',active);});
  };
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>set(tab.dataset.pricingTab));
    tab.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) return;
      event.preventDefault();const delta=['ArrowRight','ArrowDown'].includes(event.key)?1:-1;const next=(index+delta+tabs.length)%tabs.length;set(tabs[next].dataset.pricingTab,true);
    });
  });
  set(initial);
});

// V16 expertise switcher — reused in Work and Services. Query string can preselect Services.
$$('[data-expertise-switcher]').forEach(section=>{
  const tabs=$$('[data-expertise-tab]',section),panels=$$('[data-expertise-panel]',section);
  if(!tabs.length||!panels.length) return;
  const keys=new Set(tabs.map(t=>t.dataset.expertiseTab));
  const fromQuery=section.hasAttribute('data-expertise-query')?new URLSearchParams(location.search).get('expertise'):null;
  const initial=keys.has(fromQuery)?fromQuery:tabs.find(t=>t.getAttribute('aria-selected')==='true')?.dataset.expertiseTab||tabs[0].dataset.expertiseTab;
  const set=(key,focus=false)=>{
    if(!keys.has(key)) return;
    tabs.forEach(tab=>{const active=tab.dataset.expertiseTab===key;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;if(active&&focus)tab.focus();});
    panels.forEach(panel=>{const active=panel.dataset.expertisePanel===key;panel.hidden=!active;panel.classList.toggle('is-active',active);});
  };
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>set(tab.dataset.expertiseTab));
    tab.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
      event.preventDefault();const delta=['ArrowRight','ArrowDown'].includes(event.key)?1:-1;const next=(index+delta+tabs.length)%tabs.length;set(tabs[next].dataset.expertiseTab,true);
    });
  });
  set(initial);
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

// Instagram posts are embedded only after an explicit click on the card.
const igFrames=new WeakMap();
addEventListener('message',event=>{
  if(event.origin!=='https://www.instagram.com') return;
  let data=event.data; try{ if(typeof data==='string') data=JSON.parse(data); }catch{ return; }
  const height=data?.type==='MEASURE'?Number(data.details?.height):0;
  const frame=igFrames.get(event.source);
  if(frame && height>100 && height<2000) frame.style.height=`${Math.ceil(height)}px`;
});
$$('[data-instagram-post]').forEach(card=>{
  const button=$('[data-load-instagram]',card);
  button?.addEventListener('click',()=>{
    const id=card.dataset.postId;
    if(!/^[A-Za-z0-9_-]+$/.test(id||'')) return;
    const iframe=document.createElement('iframe');
    iframe.src=`https://www.instagram.com/p/${id}/embed/`;
    iframe.title=`${card.dataset.postTitle||'Publication'} — Instagram`;
    iframe.loading='lazy';
    iframe.allowFullscreen=true;
    iframe.referrerPolicy='strict-origin-when-cross-origin';
    card.classList.add('is-playing');
    const cover=$('.ig-card__cover',card);
    cover.replaceChildren(iframe);
    if(card.classList.contains('ig-phone')){
      // Dans un téléphone, le lecteur garde sa largeur native (326 px) et se met à l'échelle de l'écran.
      const fit=()=>cover.style.setProperty('--ig-s',(cover.clientWidth/326).toFixed(4));
      fit(); if('ResizeObserver' in window) new ResizeObserver(fit).observe(cover);
    } else igFrames.set(iframe.contentWindow,iframe);
  },{once:true});
});

// ---------------------------------------------------------------------------
// Composants vitrine : effets écrits sans dépendance.
// ---------------------------------------------------------------------------
const finePointer=matchMedia('(hover:hover) and (pointer:fine)').matches;

// Phrase encadrée : le défilement fait avancer le cadre d'un mot à l'autre ; le survol prend la main.
$$('[data-focus-text]').forEach(section=>{
  if(reduced) return;
  const stage=$('.focus-text__stage',section), frame=$('[data-ft-frame]',section), words=$$('[data-ft-word]',section);
  if(!frame||!words.length) return;
  section.classList.add('is-live');
  let current=-1, hovered=-1, queued=false;
  const PAD_X=.16, PAD_Y=.02;
  const show=index=>{
    if(index===current) return;
    current=index;
    words.forEach((w,i)=>w.classList.toggle('is-on',i===index));
    place();
  };
  const place=()=>{
    const word=words[current]; if(!word) return;
    const s=stage.getBoundingClientRect(), r=word.getBoundingClientRect(), size=parseFloat(getComputedStyle(word).fontSize);
    const padX=size*PAD_X, padY=size*PAD_Y;
    frame.style.setProperty('--fx',`${(r.left-s.left-padX).toFixed(1)}px`);
    frame.style.setProperty('--fy',`${(r.top-s.top-padY).toFixed(1)}px`);
    frame.style.setProperty('--fw',`${(r.width+padX*2).toFixed(1)}px`);
    frame.style.setProperty('--fh',`${(r.height+padY*2).toFixed(1)}px`);
  };
  const fromScroll=()=>{
    queued=false;
    if(hovered>=0) return;
    const r=section.getBoundingClientRect(), span=r.height-innerHeight;
    const p=span>0?clamp(-r.top/span,0,.9999):0;
    show(Math.floor(p*words.length));
  };
  const queue=()=>{if(!queued){queued=true;requestAnimationFrame(fromScroll);}};
  addEventListener('scroll',queue,{passive:true});
  addEventListener('resize',()=>{place();queue();},{passive:true});
  document.fonts?.ready.then(place);
  if(finePointer) words.forEach((w,i)=>{
    w.addEventListener('pointerenter',()=>{hovered=i;show(i);});
    w.addEventListener('pointerleave',()=>{hovered=-1;queue();});
  });
  fromScroll();
});

// Avis : la ligne cliquée grandit en panneau, puis le panneau se replie dans sa ligne.
$$('[data-morph-open]').forEach(row=>{
  const panel=document.getElementById(row.dataset.morphOpen);
  if(!panel||typeof panel.showModal!=='function') return;
  const EASE='cubic-bezier(.3,.9,.1,1)';
  // Départ : une fenêtre de la taille de la ligne, placée sur la ligne ; arrivée : le panneau entier.
  const frames=()=>{
    const a=row.getBoundingClientRect(), b=panel.getBoundingClientRect();
    const insetX=Math.max(0,(b.width-a.width)/2), insetY=Math.max(0,(b.height-a.height)/2);
    const dx=a.left+a.width/2-(b.left+b.width/2), dy=a.top+a.height/2-(b.top+b.height/2);
    return [
      {transform:`translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px)`,clipPath:`inset(${insetY.toFixed(1)}px ${insetX.toFixed(1)}px round 14px)`,opacity:.4},
      {transform:'translate(0,0)',clipPath:'inset(0px 0px round 28px)',opacity:1}
    ];
  };
  let busy=false;
  const open=()=>{
    if(panel.open||busy) return;
    panel.showModal();
    if(reduced) return;
    panel.animate(frames(),{duration:520,easing:EASE});
    $('.morph-panel__inner',panel).animate([{opacity:0},{opacity:0,offset:.35},{opacity:1}],{duration:520,easing:'ease-out'});
  };
  const close=()=>{
    if(!panel.open||busy) return;
    if(reduced){panel.close();return;}
    busy=true;
    panel.classList.add('is-closing');
    $('.morph-panel__inner',panel).animate([{opacity:1},{opacity:0}],{duration:200,easing:'ease-in',fill:'forwards'});
    const anim=panel.animate(frames().reverse(),{duration:380,easing:'cubic-bezier(.7,0,.16,1)',fill:'forwards'});
    anim.finished.catch(()=>{}).then(()=>{
      panel.close();panel.classList.remove('is-closing');
      panel.getAnimations({subtree:true}).forEach(a=>a.cancel());
      busy=false;
    });
  };
  row.addEventListener('click',open);
  $('[data-morph-close]',panel)?.addEventListener('click',close);
  panel.addEventListener('cancel',event=>{event.preventDefault();close();});
  panel.addEventListener('click',event=>{if(event.target===panel) close();});
});

// Bento : la tuile cliquée prend la grande place, les autres se réinstallent dans l'ordre.
$$('[data-bento]').forEach(bento=>{
  const tiles=$$('[data-bento-tile]',bento);
  let order=tiles.map((_,i)=>i);
  const apply=()=>order.forEach((tileIndex,slot)=>{tiles[tileIndex].dataset.slot=slot;});
  // Double clic sur une tuile : on ouvre directement le projet. Le premier clic peut déjà déplacer la tuile
  // (et la transition masque brièvement la page), donc on retient la tuile visée au premier clic.
  let aimed=null, aimedAt=0;
  const openTile=tile=>{const link=tile&&$('.bento__link',tile);if(link) location.assign(link.href);};
  bento.addEventListener('pointerdown',event=>{
    const tile=event.target.closest('[data-bento-tile]');
    if(tile&&performance.now()-aimedAt>500){aimed=tile;aimedAt=performance.now();}
  });
  bento.addEventListener('dblclick',event=>{if(!event.target.closest('a')) openTile(aimed||event.target.closest('[data-bento-tile]'));});
  document.addEventListener('click',event=>{
    if(event.detail===2&&aimed&&performance.now()-aimedAt<500&&!bento.contains(event.target)) openTile(aimed);
  });
  bento.addEventListener('click',event=>{
    const hit=event.target.closest('[data-bento-focus]'); if(!hit) return;
    const index=tiles.indexOf(hit.closest('[data-bento-tile]'));
    if(index<0||order[0]===index) return;
    order=[index,...order.filter(i=>i!==index)];
    const done=()=>$('.bento__link',tiles[index])?.focus({preventScroll:true});
    if(document.startViewTransition&&!reduced) document.startViewTransition(apply).finished.then(done,done);
    else{apply();done();}
  });
});

// Téléphones : inclinaison 3D, reflet et ombre qui suivent le curseur. On écoute toute la section :
// le téléphone situé dans la colonne du curseur s'incline, même une fois sa vidéo lancée
// (le lecteur Instagram garde le pointeur pour lui, mais le pourtour continue de faire bouger l'appareil).
if(finePointer&&!reduced) $$('.ig-stage').forEach(stage=>{
  const MAX=11, devices=$$('[data-tilt]',stage);
  const reset=device=>{
    device.classList.remove('is-tilting');
    for(const name of ['--rx','--ry','--ts','--shx','--shy','--gx','--gy']) device.style.removeProperty(name);
  };
  stage.addEventListener('pointermove',event=>{
    devices.forEach(device=>{
      const r=device.getBoundingClientRect();
      if(event.clientX<r.left||event.clientX>r.right){reset(device);return;}
      const x=clamp((event.clientX-r.left)/r.width,0,1)-.5, y=clamp((event.clientY-r.top)/r.height,0,1)-.5;
      device.classList.add('is-tilting');
      device.style.setProperty('--ry',`${(x*2*MAX).toFixed(2)}deg`);
      device.style.setProperty('--rx',`${(-y*2*MAX).toFixed(2)}deg`);
      device.style.setProperty('--ts','1.05');
      device.style.setProperty('--shx',`${(-x*34).toFixed(1)}px`);
      device.style.setProperty('--shy',`${(16-y*30).toFixed(1)}px`);
      device.style.setProperty('--gx',`${((x+.5)*100).toFixed(1)}%`);
      device.style.setProperty('--gy',`${((y+.5)*100).toFixed(1)}%`);
    });
  });
  stage.addEventListener('pointerleave',()=>devices.forEach(reset));
});

// Dégradé vivant : des points de couleur dérivent lentement ; le curseur remue les couleurs.
(function(){
  const hosts=$$('[data-gradient-motion]');
  if(!hosts.length||reduced) return;
  const VERT='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FRAG=`precision mediump float;uniform vec2 r;uniform float t;uniform vec3 c0;uniform vec3 c1;uniform vec3 c2;uniform vec3 c3;uniform vec3 m;
float w(vec2 p,vec2 q){float d=distance(p,q);return 1./(pow(d,2.4)+.012);}
void main(){vec2 p=gl_FragCoord.xy/r;p.x*=r.x/r.y;vec2 mm=vec2(m.x*r.x/r.y,m.y);
vec2 d=p-mm;p+=vec2(-d.y,d.x)*m.z*exp(-dot(d,d)*9.)*1.4;
p+=.09*vec2(sin(p.y*2.6+t*.5),cos(p.x*2.9-t*.42));
float a=r.x/r.y;
vec2 q0=vec2(a*(.5+.42*sin(t*.23)),.5+.4*cos(t*.19));
vec2 q1=vec2(a*(.5+.44*cos(t*.17+1.7)),.5+.42*sin(t*.21+.6));
vec2 q2=vec2(a*(.5+.4*sin(t*.14+3.1)),.5+.44*cos(t*.25+2.2));
vec2 q3=vec2(a*(.5+.46*cos(t*.2+4.4)),.5+.38*sin(t*.16+5.));
float w0=w(p,q0),w1=w(p,q1),w2=w(p,q2),w3=w(p,q3);
gl_FragColor=vec4((c0*w0+c1*w1+c2*w2+c3*w3)/(w0+w1+w2+w3),1.);}`;
  const rgb=value=>{const m=/^#?([0-9a-f]{6})$/i.exec(value.trim());if(!m) return null;const n=parseInt(m[1],16);return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255];};
  hosts.forEach(host=>{
    const style=getComputedStyle(host);
    const colors=[1,2,3,4].map(i=>rgb(style.getPropertyValue(`--gm-c${i}`)));
    if(colors.some(c=>!c)) return;
    const canvas=document.createElement('canvas');
    const gl=canvas.getContext('webgl',{antialias:false,alpha:false,powerPreference:'low-power'});
    if(!gl) return;
    const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null;};
    const vs=compile(gl.VERTEX_SHADER,VERT), fs=compile(gl.FRAGMENT_SHADER,FRAG);
    if(!vs||!fs) return;
    const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)) return;
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const loc=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    const U=name=>gl.getUniformLocation(program,name);
    colors.forEach((c,i)=>gl.uniform3fv(U(`c${i}`),c));
    host.append(canvas);host.classList.add('has-mesh');
    // Le dégradé est flou par nature : un petit canvas agrandi suffit et ménage la batterie.
    const resize=()=>{const b=host.getBoundingClientRect();canvas.width=Math.max(2,Math.round(b.width/5));canvas.height=Math.max(2,Math.round(b.height/5));gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(U('r'),canvas.width,canvas.height);};
    resize();addEventListener('resize',resize,{passive:true});
    const mouse={x:.5,y:.5,force:0};
    (host.parentElement||host).addEventListener('pointermove',event=>{
      const b=host.getBoundingClientRect();
      mouse.x=(event.clientX-b.left)/b.width;mouse.y=1-(event.clientY-b.top)/b.height;mouse.force=Math.min(1,mouse.force+.12);
    },{passive:true});
    let visible=false, raf=0, last=0, time=Math.random()*40;
    const frame=now=>{
      raf=0;
      if(!visible||document.hidden) return;
      if(now-last>32){time+=Math.min(.1,(now-last)/1000);last=now;mouse.force*=.94;
        gl.uniform1f(U('t'),time);gl.uniform3f(U('m'),mouse.x,mouse.y,mouse.force);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}
      raf=requestAnimationFrame(frame);
    };
    const start=()=>{if(!raf&&visible&&!document.hidden) raf=requestAnimationFrame(frame);};
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;start();}).observe(host);
    document.addEventListener('visibilitychange',start);
  });
})();

// Accueil : le héros recule doucement pendant que le Work monte par-dessus.
$$('[data-hero-stack]').forEach(stack=>{
  const hero=$('.v16-hero',stack); if(!hero||reduced) return;
  let queued=false;
  const update=()=>{queued=false;stack.style.setProperty('--hero-out',clamp(scrollY/Math.max(1,hero.offsetHeight*.9)).toFixed(3));};
  addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update);}},{passive:true});
  update();
});

// Accueil, « Comment je travaille » : un anneau en trois arcs ; survol, clic ou clavier choisit l'étape.
$$('[data-ring]').forEach(ring=>{
  const arcs=$$('[data-ring-arc]',ring), steps=$$('[data-ring-step]',ring), panels=$$('[data-ring-panel]',ring);
  const count=$('[data-ring-count]',ring), name=$('[data-ring-name]',ring);
  const select=index=>{
    arcs.forEach((arc,i)=>arc.classList.toggle('is-active',i===index));
    steps.forEach((step,i)=>step.setAttribute('aria-pressed',String(i===index)));
    panels.forEach((panel,i)=>panel.classList.toggle('is-active',i===index));
    if(count) count.textContent=String(index+1);
    if(name) name.textContent=steps[index]?.textContent.trim()||'';
  };
  arcs.forEach((arc,i)=>{arc.addEventListener('pointerenter',()=>select(i));arc.addEventListener('click',()=>select(i));});
  steps.forEach((step,i)=>{step.addEventListener('click',()=>select(i));step.addEventListener('pointerenter',()=>select(i));step.addEventListener('focus',()=>select(i));});
  select(0);
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

// Animated Stats Pro — independent implementation of the public behaviour: scroll trigger,
// easeOutExpo, stagger, replay, decimal support and Blur / Slide / Fade / Scale entrance styles.
$$('[data-animated-stats]').forEach(section=>{
  const cards=$$('[data-stat-card]',section);
  const replay=section.dataset.replay==='true';
  const easeOutExpo=p=>p>=1?1:1-Math.pow(2,-10*p);
  let running=false,hasRun=false,runToken=0;
  const prepare=()=>{
    if(reduced) return;
    cards.forEach(card=>{
      const counter=$('[data-counter]',card); if(!counter) return;
      const decimals=Math.max(0,Number(counter.dataset.counterDecimals||0));
      card.classList.remove('is-stat-visible');
      card.classList.add('is-stat-prep');
      if(!counter.hasAttribute('data-counter-static')) counter.textContent=(0).toFixed(decimals);
    });
  };
  const run=()=>{
    if(running || (hasRun&&!replay)) return;
    running=true; hasRun=true; runToken+=1;
    const token=runToken;
    section.classList.add('is-animating');
    cards.forEach((card,index)=>{
      const counter=$('[data-counter]',card); if(!counter) return;
      const target=Number(counter.dataset.counterTarget||0);
      const decimals=Math.max(0,Number(counter.dataset.counterDecimals||0));
      const delay=reduced?0:index*120;
      setTimeout(()=>{
        if(token!==runToken) return;
        card.classList.remove('is-stat-prep');
        card.classList.add('is-stat-visible');
        if(reduced||counter.hasAttribute('data-counter-static')){counter.textContent=target.toFixed(decimals);if(index===cards.length-1){running=false;section.classList.remove('is-animating');}return;}
        const started=performance.now(),duration=1320;
        const tick=now=>{
          if(token!==runToken) return;
          const progress=clamp((now-started)/duration);
          counter.textContent=(target*easeOutExpo(progress)).toFixed(decimals);
          if(progress<1) requestAnimationFrame(tick);
          else if(index===cards.length-1){running=false;section.classList.remove('is-animating');}
        };
        requestAnimationFrame(tick);
      },delay);
    });
  };
  const reset=()=>{
    if(!replay||running) return;
    runToken+=1; running=false; section.classList.remove('is-animating'); prepare();
  };
  prepare();
  if('IntersectionObserver' in window && !reduced){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting) run(); else if(entry.boundingClientRect.bottom<0 || entry.boundingClientRect.top>innerHeight) reset();
    }),{threshold:.52,rootMargin:'0px 0px -6% 0px'});
    observer.observe(section);
  }else run();
});

// Focus Testimonials — continuous reading flow with a robust delegated expander.
$$('[data-focus-testimonials]').forEach(section=>{
  const items=$$('[data-testimonial-index]',section);
  const max=Math.max(1,Number(section.dataset.maxVisible||items.length));
  let expanded=false;
  const applyVisibility=()=>{
    items.forEach((item,i)=>item.hidden=!expanded&&i>=max);
    $$('[data-testimonial-sep]',section).forEach((sep,i)=>sep.hidden=!expanded&&i>=max-1);
    const toggle=$('[data-testimonials-toggle]',section);
    if(toggle){
      toggle.setAttribute('aria-expanded',String(expanded));
      $('span',toggle).textContent=expanded?'Réduire':'Voir tous les retours';
      $('i',toggle).textContent=expanded?'−':'+';
    }
  };
  applyVisibility();
  section.addEventListener('click',event=>{
    const toggle=event.target.closest('[data-testimonials-toggle]');
    if(!toggle || !section.contains(toggle)) return;
    event.preventDefault(); event.stopPropagation();
    expanded=!expanded; applyVisibility();
    if(!expanded) section.scrollIntoView({behavior:reduced?'auto':'smooth',block:'center'});
  });
  if(!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  const positionBadge=item=>{
    const badge=$('.focus-testimonials__author',item); if(!badge) return;
    badge.style.setProperty('--badge-shift','0px');
    requestAnimationFrame(()=>{
      const rect=badge.getBoundingClientRect(); let shift=0;
      if(rect.left<10) shift=10-rect.left;
      if(rect.right>innerWidth-10) shift=(innerWidth-10)-rect.right;
      badge.style.setProperty('--badge-shift',`${shift}px`);
    });
  };
  const focus=item=>{section.classList.add('is-focusing');items.forEach(el=>el.classList.toggle('is-focused',el===item));positionBadge(item);};
  const clear=()=>{section.classList.remove('is-focusing');items.forEach(el=>el.classList.remove('is-focused'));};
  items.forEach(item=>{item.addEventListener('pointerenter',()=>focus(item));item.addEventListener('focus',()=>focus(item));item.addEventListener('blur',clear);});
  section.addEventListener('pointerleave',clear);
});

// Glass Showcase Pro — independent implementation based on the public spec.
// It uses our own Three.js scene for the physical glass layer and a canvas particle transition.
// The paid Framer source is not bundled or reverse-copied. A DOM/image fallback is always present.
async function mountShowcaseWebGL(showcase){
  const mount=$('[data-showcase-webgl]',showcase);
  if(!mount || reduced || !('WebGLRenderingContext' in window)) return;
  try{
    const THREE=await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.min.js');
    if(!document.contains(showcase)) return;
    const renderer=new THREE.WebGLRenderer({alpha:true,antialias:false,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.25));
    renderer.setClearColor(0x000000,0);
    mount.append(renderer.domElement);
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(32,1,.1,100);
    camera.position.set(0,0,7.2);
    const group=new THREE.Group(); scene.add(group);
    const geometry=new THREE.BoxGeometry(3.15,4.05,.34,6,8,1);
    const material=new THREE.MeshPhysicalMaterial({
      color:0xffffff,
      roughness:.08,
      metalness:0,
      transparent:true,
      opacity:.28,
      transmission:clamp(Number(showcase.dataset.transmission||.94),0,1),
      ior:Math.max(1,Number(showcase.dataset.ior||1.45)),
      thickness:Math.max(.05,Number(showcase.dataset.thickness||.7)),
      clearcoat:1,
      clearcoatRoughness:.08,
      specularIntensity:1
    });
    const box=new THREE.Mesh(geometry,material); group.add(box);
    const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geometry,25),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.3})); group.add(edges);
    scene.add(new THREE.AmbientLight(0xffffff,1.8));
    const key=new THREE.PointLight(0xffc7a6,26,14); key.position.set(-3,4,4); scene.add(key);
    const fill=new THREE.PointLight(0xd8e3ff,18,12); fill.position.set(4,-2,3); scene.add(fill);
    const state=showcaseState.get(showcase)||{};
    state.webgl={renderer,scene,camera,group,box,edges,visible:false,raf:0,start:performance.now()};
    showcaseState.set(showcase,state);
    const resize=()=>{
      const r=mount.getBoundingClientRect(); if(!r.width||!r.height) return;
      renderer.setSize(r.width,r.height,false); camera.aspect=r.width/r.height; camera.updateProjectionMatrix();
    };
    new ResizeObserver(resize).observe(mount); resize();
    const float=Math.max(0,Number(showcase.dataset.float||.08));
    const draw=now=>{
      if(!state.webgl?.visible) return;
      const t=(now-state.webgl.start)/1000;
      const p=Number(showcase.dataset.progress||.5);
      group.position.y=Math.sin(t*.85)*float;
      group.rotation.y=(p-.5)*-.18 + Math.sin(t*.55)*.025;
      group.rotation.x=(p-.5)*.04 + Math.cos(t*.7)*.012;
      renderer.render(scene,camera);
      state.webgl.raf=requestAnimationFrame(draw);
    };
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
      state.webgl.visible=entry.isIntersecting;
      cancelAnimationFrame(state.webgl.raf);
      if(entry.isIntersecting) state.webgl.raf=requestAnimationFrame(draw);
    }),{threshold:.05});
    io.observe(showcase);
    showcase.classList.add('has-webgl');
  }catch{
    showcase.classList.add('webgl-fallback');
  }
}
function setShowcaseProgress(showcase,p){
  showcase.dataset.progress=String(clamp(p));
  const state=showcaseState.get(showcase);
  if(state?.webgl?.visible){
    // the continuous render loop consumes the progress value; this branch is intentionally light.
  }
}
function setShowcaseStep(showcase, idx){
  const state=showcaseState.get(showcase) || {idx:-1,particles:[],raf:0};
  if(state.idx===idx) return;
  $$('[data-showcase-frame]',showcase).forEach((frame,i)=>frame.classList.toggle('is-active',i===idx));
  if(state.idx>=0 && !reduced) burstShowcase(showcase,state,idx);
  state.idx=idx;
  showcaseState.set(showcase,state);
}
function burstShowcase(showcase,state,nextIdx){
  const canvas=$('[data-showcase-particles]',showcase); if(!canvas) return;
  const rect=canvas.getBoundingClientRect();
  const dpr=Math.min(devicePixelRatio||1,1.5);
  canvas.width=Math.max(1,Math.round(rect.width*dpr)); canvas.height=Math.max(1,Math.round(rect.height*dpr));
  const ctx=canvas.getContext('2d'); if(!ctx) return;
  const cx=canvas.width/2, cy=canvas.height/2;
  const palettes=[['#ef8b54','#f0ebe2','#5a3326'],['#dcb99f','#ffffff','#3a332d'],['#e97736','#e9d6c6','#7b3d28']];
  const palette=palettes[nextIdx%palettes.length];
  const cols=12, rows=15;
  state.particles=[];
  for(let y=0;y<rows;y++) for(let x=0;x<cols;x++){
    const ox=(x/(cols-1)-.5)*canvas.width*.68, oy=(y/(rows-1)-.5)*canvas.height*.72;
    const angle=Math.atan2(oy,ox)+(Math.random()-.5)*.5;
    const speed=(.004+Math.random()*.01)*Math.min(canvas.width,canvas.height);
    state.particles.push({x:cx+ox*.12,y:cy+oy*.12,tx:cx+ox,ty:cy+oy,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:0,color:palette[(x+y)%palette.length],size:(1+Math.random()*2.4)*dpr});
  }
  cancelAnimationFrame(state.raf);
  const started=performance.now(), duration=820;
  const frame=now=>{
    const p=clamp((now-started)/duration);
    const explode=p<.48 ? p/.48 : 1-(p-.48)/.52;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    state.particles.forEach(pt=>{
      if(p<.48){pt.x+=pt.vx;pt.y+=pt.vy;pt.vx*=.985;pt.vy*=.985;}
      else {const q=(p-.48)/.52;const ease=1-Math.pow(1-q,3);pt.x+=(pt.tx-pt.x)*(.05+.17*ease);pt.y+=(pt.ty-pt.y)*(.05+.17*ease);}
      ctx.globalAlpha=Math.sin(Math.PI*p)*.82;
      ctx.fillStyle=pt.color; ctx.beginPath(); ctx.arc(pt.x,pt.y,pt.size*(.8+explode*.6),0,Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha=1;
    if(p<1) state.raf=requestAnimationFrame(frame); else ctx.clearRect(0,0,canvas.width,canvas.height);
  };
  state.raf=requestAnimationFrame(frame);
}
// WebGL is progressive enhancement: load it only shortly before the showcase is needed,
 // and skip it on constrained/mobile devices. The CSS/image choreography remains identical.
const canUseShowcaseWebGL=!reduced
  && matchMedia('(min-width:901px)').matches
  && !navigator.connection?.saveData
  && (navigator.deviceMemory==null || navigator.deviceMemory>=4);
if(canUseShowcaseWebGL){
  const queueShowcase=showcase=>{
    const run=()=>mountShowcaseWebGL(showcase);
    if('requestIdleCallback' in window) requestIdleCallback(run,{timeout:1200}); else setTimeout(run,120);
  };
  if('IntersectionObserver' in window){
    const lazyShowcaseObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      lazyShowcaseObserver.unobserve(entry.target);
      queueShowcase(entry.target);
    }),{rootMargin:'520px 0px',threshold:0});
    $$('[data-glass-showcase]').forEach(showcase=>lazyShowcaseObserver.observe(showcase));
  }else $$('[data-glass-showcase]').forEach(queueShowcase);
}

// Stacked Flow — actual layered carousel: wheel, arrows, keyboard, tap-to-focus and touch drag.
$$('[data-stacked-flow]').forEach(flow=>{
  const cards=$$('[data-stack-card]',flow); if(!cards.length) return;
  const current=$('[data-stack-current]',flow);
  let active=clamp(Number(flow.dataset.stackIndex||0),0,cards.length-1);
  let touchStart=null, wheelLock=false;
  const deltaFor=(i)=>{
    let d=i-active;
    const half=cards.length/2;
    if(d>half)d-=cards.length;if(d<-half)d+=cards.length;
    return d;
  };
  const render=()=>{
    cards.forEach((card,i)=>{
      const d=deltaFor(i), abs=Math.abs(d);
      card.style.setProperty('--delta',d);
      card.style.setProperty('--abs-delta',abs);
      card.style.setProperty('--stack-z',String(cards.length-abs));
      const on=i===active;
      card.classList.toggle('is-active',on);
      card.setAttribute('aria-current',on?'true':'false');
    });
    if(current) current.textContent=String(active+1).padStart(2,'0');
    flow.dataset.stackIndex=String(active);
  };
  const go=n=>{active=(n+cards.length)%cards.length;render();};
  $('[data-stack-prev]',flow)?.addEventListener('click',()=>go(active-1));
  $('[data-stack-next]',flow)?.addEventListener('click',()=>go(active+1));
  cards.forEach((card,i)=>card.addEventListener('click',e=>{if(i!==active){e.preventDefault();go(i);}}));
  flow.addEventListener('wheel',e=>{
    if(Math.abs(e.deltaY)<8||wheelLock) return;
    wheelLock=true;go(active+(e.deltaY>0?1:-1));setTimeout(()=>wheelLock=false,420);
  },{passive:true});
  flow.addEventListener('pointerdown',e=>{touchStart={x:e.clientX,y:e.clientY,id:e.pointerId};});
  flow.addEventListener('pointerup',e=>{
    if(!touchStart||touchStart.id!==e.pointerId)return;
    const dx=e.clientX-touchStart.x,dy=e.clientY-touchStart.y;touchStart=null;
    const movement=Math.abs(dx)>Math.abs(dy)?dx:dy;
    if(Math.abs(movement)>45) go(active+(movement<0?1:-1));
  });
  flow.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();go(active-1)}if(e.key==='ArrowRight'){e.preventDefault();go(active+1)}});
  flow.tabIndex=0; render();
});

// Video Slide Show — Work-only layered portrait carousel.
// It reproduces the public Framer behaviours (layering, arrows, dots, autoplay) and adds requested velocity-based drag inertia.
$$('[data-video-slide-show]').forEach(slider=>{
  const slides=$$('[data-video-slide]',slider),dots=$$('[data-video-dot]',slider),stage=$('[data-video-stage]',slider); if(!slides.length||!stage)return;
  let active=0,timer=0,paused=false,drag=null,suppressClickUntil=0,wheelLock=false;
  const autoplay=slider.dataset.autoplay==='true'&&!reduced;
  const interval=Math.max(2200,Number(slider.dataset.autoplayInterval||5200));
  const muteButton=$('[data-video-mute]',slider);
  const updateMuteControl=()=>{if(!muteButton)return;const muted=slider.dataset.videoMuted==='true';muteButton.classList.toggle('is-muted',muted);muteButton.setAttribute('aria-pressed',String(muted));muteButton.setAttribute('aria-label',muted?'Activer le son':'Couper le son');};
  const unloadVideos=()=>slides.forEach(slide=>{const frame=$('[data-slide-frame]',slide),poster=$('.video-slide__poster',slide);frame?.replaceChildren();poster?.classList.remove('is-hidden');slide.classList.remove('is-playing')});
  const loadActiveVideo=()=>{
    const slide=slides[active],frame=$('[data-slide-frame]',slide),poster=$('.video-slide__poster',slide);const id=slide?.dataset.videoId,start=Math.max(0,Number(slide?.dataset.videoStart||0));if(!id||!frame)return;
    const muted=slider.dataset.videoMuted==='true',loop=slider.dataset.videoLoop==='true';const iframe=document.createElement('iframe');const params=new URLSearchParams({rel:'0',autoplay:'1',start:String(start),mute:muted?'1':'0',loop:loop?'1':'0'});if(loop)params.set('playlist',id);
    iframe.src=`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?${params}`;iframe.title=`${$('.video-slide__copy strong',slide)?.textContent||'Extrait vidéo'} — ${start}s`;iframe.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';iframe.allowFullscreen=true;frame.replaceChildren(iframe);poster?.classList.add('is-hidden');slide.classList.add('is-playing');
  };
  const clearDragVisual=()=>{slider.style.setProperty('--drag-px','0px');slider.style.setProperty('--drag-tilt','0deg');slider.classList.remove('is-dragging');};
  const render=()=>{
    slides.forEach((slide,index)=>{let delta=index-active;const half=slides.length/2;if(delta>half)delta-=slides.length;if(delta<-half)delta+=slides.length;slide.style.setProperty('--slide-delta',delta);slide.style.setProperty('--slide-abs',Math.abs(delta));slide.style.setProperty('--slide-z',String(slides.length-Math.abs(delta)));const current=index===active;slide.classList.toggle('is-active',current);slide.setAttribute('aria-current',current?'true':'false');const play=$('[data-slide-play]',slide),select=$('[data-slide-select]',slide);if(play)play.tabIndex=current?0:-1;if(select)select.tabIndex=current?-1:0;});
    dots.forEach((dot,index)=>index===active?dot.setAttribute('aria-current','true'):dot.removeAttribute('aria-current'));unloadVideos();updateMuteControl();
  };
  const restart=()=>{clearInterval(timer);if(autoplay&&!paused)timer=setInterval(()=>go(active+1),interval);};
  const go=index=>{active=(index+slides.length)%slides.length;clearDragVisual();render();restart();};
  $('[data-video-prev]',slider)?.addEventListener('click',()=>go(active-1));$('[data-video-next]',slider)?.addEventListener('click',()=>go(active+1));dots.forEach((dot,index)=>dot.addEventListener('click',()=>go(index)));
  $$('[data-slide-select]',slider).forEach((button,index)=>button.addEventListener('click',event=>{if(performance.now()<suppressClickUntil){event.preventDefault();return;}if(index!==active)go(index)}));
  $$('[data-slide-play]',slider).forEach((button,index)=>button.addEventListener('click',()=>{if(index!==active){go(index);return;}clearInterval(timer);paused=true;unloadVideos();loadActiveVideo();}));
  muteButton?.addEventListener('click',()=>{const playing=slides[active]?.classList.contains('is-playing');slider.dataset.videoMuted=slider.dataset.videoMuted==='true'?'false':'true';updateMuteControl();if(playing){unloadVideos();loadActiveVideo();}});
  slider.addEventListener('pointerenter',()=>{paused=true;clearInterval(timer)});slider.addEventListener('pointerleave',()=>{if(!drag){paused=false;restart()}});slider.addEventListener('focusin',()=>{paused=true;clearInterval(timer)});slider.addEventListener('focusout',event=>{if(!slider.contains(event.relatedTarget)&&!drag){paused=false;restart()}});
  const axisValue=event=>slider.dataset.orientation==='vertical'?event.clientY:event.clientX;
  const beginDrag=event=>{
    if(event.button!==undefined&&event.button!==0)return;
    paused=true;clearInterval(timer);const now=performance.now(),axis=axisValue(event);drag={id:event.pointerId,start:axis,last:axis,lastTime:now,delta:0,velocity:0};slider.classList.add('is-dragging');stage.setPointerCapture?.(event.pointerId);
  };
  const moveDrag=event=>{
    if(!drag||drag.id!==event.pointerId)return;const now=performance.now(),axis=axisValue(event),dt=Math.max(8,now-drag.lastTime),instant=(axis-drag.last)/dt;drag.velocity=drag.velocity*.68+instant*.32;drag.delta=axis-drag.start;drag.last=axis;drag.lastTime=now;const visual=clamp(drag.delta,-190,190);slider.style.setProperty('--drag-px',`${visual}px`);slider.style.setProperty('--drag-tilt',`${clamp(drag.velocity*3.2,-6,6).toFixed(2)}deg`);
  };
  const finishDrag=event=>{
    if(!drag||drag.id!==event.pointerId)return;const state=drag;drag=null;stage.releasePointerCapture?.(event.pointerId);const projected=state.delta+state.velocity*240;const threshold=clamp(slider.clientWidth*.14,92,170);let steps=Math.round(-projected/threshold);if(steps===0&&Math.abs(state.delta)>46)steps=state.delta<0?1:-1;steps=clamp(steps,-3,3);if(Math.abs(state.delta)>8)suppressClickUntil=performance.now()+320;if(steps)go(active+steps);else{clearDragVisual();paused=false;restart();}
  };
  stage.addEventListener('pointerdown',beginDrag);stage.addEventListener('pointermove',moveDrag);stage.addEventListener('pointerup',finishDrag);stage.addEventListener('pointercancel',event=>{if(drag?.id===event.pointerId){drag=null;clearDragVisual();paused=false;restart();}});
  slider.addEventListener('wheel',event=>{const movement=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:(event.shiftKey?event.deltaY:0);if(Math.abs(movement)<18||wheelLock)return;wheelLock=true;go(active+(movement>0?1:-1));setTimeout(()=>wheelLock=false,360);},{passive:true});
  slider.tabIndex=0;slider.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();go(active-1)}if(event.key==='ArrowRight'){event.preventDefault();go(active+1)}});
  render();restart();
});

// Dynamic FAQ — accessible accordion, one open answer at a time.
$$('[data-faq-section]').forEach(section=>{
  const items=$$('[data-faq-item]',section);
  items.forEach(item=>$('[data-faq-answer]',item)?.removeAttribute('hidden'));
  const setOpen=(target,open)=>{
    target.classList.toggle('is-open',open);
    const button=$('[data-faq-button]',target), answer=$('[data-faq-answer]',target);
    button?.setAttribute('aria-expanded',String(open));
    if(answer){answer.setAttribute('aria-hidden',String(!open));answer.toggleAttribute('inert',!open);}
  };
  items.forEach(item=>setOpen(item,item.classList.contains('is-open')));
  section.addEventListener('click',event=>{
    const button=event.target.closest('[data-faq-button]');if(!button||!section.contains(button))return;const item=button.closest('[data-faq-item]');const next=!item.classList.contains('is-open');items.forEach(other=>setOpen(other,other===item&&next));
  });
});

// Line Menu TOC — collapsed rail at rest. It opens on hover/focus and closes a moment after the pointer leaves.
$$('[data-line-toc]').forEach(toc=>{
  const links=$$('a[data-toc-target]',toc);
  const targets=links.map(a=>document.getElementById(a.dataset.tocTarget)).filter(Boolean);
  if(!targets.length) return;
  let closeTimer=0;
  const open=()=>{clearTimeout(closeTimer);toc.classList.add('is-open')};
  const scheduleClose=(delay=1800)=>{clearTimeout(closeTimer);closeTimer=setTimeout(()=>toc.classList.remove('is-open'),delay)};
  toc.addEventListener('pointerenter',open);
  toc.addEventListener('pointerleave',()=>scheduleClose(1900));
  toc.addEventListener('focusin',open);
  toc.addEventListener('focusout',e=>{if(!toc.contains(e.relatedTarget))scheduleClose(900)});
  links.forEach(a=>a.addEventListener('click',()=>scheduleClose(1200)));
  const setActive=id=>links.forEach(a=>{
    const active=a.dataset.tocTarget===id;a.classList.toggle('is-active',active);
    if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');
  });
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>{
      const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>Math.abs(a.boundingClientRect.top)-Math.abs(b.boundingClientRect.top));
      if(visible[0]) setActive(visible[0].target.id);
    },{rootMargin:'-20% 0px -64% 0px',threshold:[0,.1,.4]});
    targets.forEach(el=>io.observe(el));
  }
  setActive(targets[0].id);
});

// Hold Confirm — generic hold-to-confirm behaviour with direction, cancel/snap-back, keyboard support and completion state.
// The exact Framer listing URL was not retrievable during this audit, so this is an independent implementation, not copied source.
$$('[data-hold-confirm]').forEach(button=>{
  const duration=Math.max(350,Number(button.dataset.holdMs||650));
  const direction=button.dataset.holdDirection||'ltr';button.dataset.holdDirection=direction;
  let start=0,raf=0,holding=false,completed=false;
  const setProgress=p=>button.style.setProperty('--hold-progress',clamp(p));
  const cancel=()=>{if(completed)return;holding=false;cancelAnimationFrame(raf);button.classList.remove('is-holding');button.classList.add('is-cancelling');setProgress(0);setTimeout(()=>button.classList.remove('is-cancelling'),260)};
  const complete=()=>{holding=false;completed=true;cancelAnimationFrame(raf);setProgress(1);button.classList.remove('is-holding');button.classList.add('is-confirmed');button.setAttribute('aria-label','Action confirmée');button.dispatchEvent(new CustomEvent('holdconfirm',{bubbles:true}))};
  const frame=now=>{if(!holding)return;const p=(now-start)/duration;setProgress(p);if(p>=1)complete();else raf=requestAnimationFrame(frame)};
  const begin=()=>{if(button.disabled||holding||completed)return;holding=true;start=performance.now();button.classList.add('is-holding');button.classList.remove('is-cancelling');raf=requestAnimationFrame(frame)};
  button.addEventListener('pointerdown',e=>{if(e.button===0){button.setPointerCapture?.(e.pointerId);begin()}});
  button.addEventListener('pointerup',()=>{if(holding)cancel()});button.addEventListener('pointercancel',cancel);button.addEventListener('pointerleave',()=>{if(holding)cancel()});
  button.addEventListener('click',e=>e.preventDefault());
  button.addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();begin()}});
  button.addEventListener('keyup',e=>{if((e.key===' '||e.key==='Enter')&&holding){e.preventDefault();cancel()}});
});

// Page View Counter — faithful Supabase-backed wiring from the public component description.
// It stays hidden until the user's own Supabase Project URL + anon public key are supplied at build time.
(async()=>{
  const counters=$$('[data-page-view-counter]'); if(!counters.length) return;
  const url=$('meta[name="nolanarc-supabase-url"]')?.content?.replace(/\/$/,'');
  const key=$('meta[name="nolanarc-supabase-key"]')?.content;
  if(!url||!key){counters.forEach(c=>c.dataset.counterStatus='needs-supabase');return;}
  const slug=location.pathname.replace(/\/+$/,'')||'/';
  const headers={apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'};
  try{
    // Écriture uniquement via la fonction SQL increment_page_view (voir supabase/page_views.sql) :
    // le navigateur n'a plus aucun droit direct d'insert/update sur la table.
    const res=await fetch(`${url}/rest/v1/rpc/increment_page_view`,{method:'POST',headers,body:JSON.stringify({p_slug:slug})});
    if(!res.ok)throw new Error('rpc');
    const views=Number(await res.json());
    if(!Number.isFinite(views))throw new Error('rpc');
    counters.forEach(counter=>{
      counter.hidden=false;counter.dataset.counterStatus='live';const value=$('[data-page-view-value]',counter);if(!value)return;
      if(reduced){value.textContent=Intl.NumberFormat('fr-FR').format(views);return;}
      const start=performance.now(),duration=720;
      const tick=now=>{const p=clamp((now-start)/duration);const eased=1-Math.pow(1-p,4);value.textContent=Intl.NumberFormat('fr-FR').format(Math.round(views*eased));if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick);
    });
  }catch{counters.forEach(c=>c.dataset.counterStatus='error')}
})();
