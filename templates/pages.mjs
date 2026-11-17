import { site } from '../content/site.mjs';
import { projects } from '../content/projects.mjs';
import { notes } from '../content/journal.mjs';
import { existsSync } from 'node:fs';
import { legal } from '../content/legal.mjs';
import { instagramPosts } from '../content/instagram.mjs';
import { gearBoard } from './gear.mjs';
import { workAssets } from '../content/work-assets.mjs';
import { focusText, morphTestimonials, bentoFocus } from './showcase.mjs';
import { weddingWall, weddingOffersSection } from './wedding.mjs';
import { weddingOffers } from '../content/wedding.mjs';
import { pricing, pricingHref, pricingMessage } from '../content/pricing.mjs';
import { head, header, footer, esc, projectMeta, lineToc, animatedStats, glassShowcase, stackedFlow, videoSlideShow, pageViewCounter, gradientMotionBackground, faqAccordion, faqSchema } from './components.mjs';

// Le portrait n'est affiché que si le fichier existe : jamais d'image cassée ni de visage de substitution.
const hasPortrait = existsSync(new URL('../public/assets/nolan-portrait.jpg', import.meta.url));
const bol = projects.find(p=>p.slug==='le-bol-den-face');
const projectCards = projects.filter(p=>p.visible && p.card && p.card.image).map(p=>`<a class="fab-project-card motion-reveal" href="${esc(p.card.href)}"><div class="fab-project-card__meta"><strong>${esc(p.title)}.</strong><span>/${esc(p.year)}</span><i>${esc(p.card.label)}</i></div><figure><img src="${esc(p.card.image)}" alt="${esc(p.card.alt)}" loading="lazy"><span>Voir le contexte ↗</span></figure></a>`).join('\n');
// Accueil, « Tarifs » : une carte par offre, sur le modèle d'un mur de témoignages vidéo.

// Accueil, « Trois dimensions » : le besoin du visiteur, dans ses mots, et un repère de prix déjà publié dans les tarifs.
const dimNeeds = {
  realisation: { need: 'J’ai un film à faire.', text: 'Pas besoin d’avoir tout prévu. On part de ce que le film doit faire ressentir ; je m’occupe du tournage jusqu’au montage, et vous gardez la main sur les choix qui comptent.', price: '1 500 €' },
  direction: { need: 'J’ai un univers à rendre cohérent.', text: 'Vos images, vos vidéos et vos supports ne se ressemblent pas toujours. On cherche ensemble ce qui les relie, pour que votre univers se reconnaisse au premier regard.', price: '200 €' },
  strategie: { need: 'J’ai une marque à clarifier.', text: 'Vous savez ce que vous faites, moins comment le dire. On remet à plat ce que vous voulez transmettre, et à qui, pour savoir par quoi commencer.', price: '89 € / h' },
};
const bentoTiles = [
  { title: 'Le bol d’en face', label: 'Court métrage · 2026', text: bol.summary, image: bol.poster, alt: 'Le bol d’en face — court métrage', href: '/projet/le-bol-den-face/', cta: 'Voir le film' },
  ...projects.filter(p=>p.slug!=='le-bol-den-face').map(p=>({ title: p.title, label: p.card?.label||p.type||'', text: p.summary, image: p.card?.image||'', alt: p.card?.alt||'', href: p.href, cta: 'Voir le contexte' })),
  { title: 'Social media', label: 'Vidéos verticales', text: 'Box, Taliri, Polestar 3, une demande en mariage : quatre formats courts, à lire juste en dessous.', image: '', href: '#social', cta: 'Voir les vidéos' },
];
const visuals = {
  brand: 'https://images.unsplash.com/photo-1768076955015-dd4f057e96f6?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=66&w=2000',
  story: 'https://images.unsplash.com/photo-1709316132989-55ef2437b920?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=68&w=1600',
  moment: 'https://images.unsplash.com/photo-1770866381405-f47395dd2414?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=66&w=2000'
};

// Sony France lists this creator film as an Alpha 7 IV showcase. It is used as a silent,
// non-interactive background; the still remains underneath as a resilient fallback.
const homeHeroVideo = {
  id:'xAapoE5OKIk',
  title:'Vidéo de fond — Nolan Arc',
  // Fichier hébergé sur le site (sans extension) : quand il est renseigné, la vidéo démarre seule,
  // sans demande d'autorisation, car aucun service tiers n'est appelé. Fichiers produits par tools/video/hero.sh.
  file:''
};
const heroSelfHosted = Boolean(homeHeroVideo.file);


const workMoodSlides = [
  { poster:'https://images.unsplash.com/photo-1727451139462-cd34008cd50b?auto=format&fit=crop&fm=jpg&q=72&w=1600', position:'center', kicker:'Plateau', title:'Lumière & espace', credit:'Joshua Wann · Unsplash' },
  { poster:'https://images.unsplash.com/photo-1709316132989-55ef2437b920?auto=format&fit=crop&fm=jpg&q=72&w=1600', position:'50% center', kicker:'Image', title:'Caméra & rig', credit:'Redd Francisco · Unsplash' },
  { poster:'https://images.unsplash.com/photo-1740350631567-5d813fe78adf?auto=format&fit=crop&fm=jpg&q=72&w=1600', position:'58% center', kicker:'Tournage', title:'Cadre en situation', credit:'Alex Lam · Unsplash' },
  { poster:'https://images.unsplash.com/photo-1779896412277-c4fd15c7a89c?auto=format&fit=crop&fm=jpg&q=72&w=1600', position:'48% center', kicker:'Post-production', title:'Montage & étalonnage', credit:'SanDisk · Unsplash' },
  { poster:'https://images.unsplash.com/photo-1772945492345-ee8d17e9a74b?auto=format&fit=crop&fm=jpg&q=72&w=1600', position:'center', kicker:'Moment', title:'Événement & émotion', credit:'Brooke Balentine · Unsplash' },
];

const expertiseTabs = [
  {
    key:'realisation', label:'Réalisation', index:'01',
    headline:'Prendre le film du concept au fichier final.',
    text:'Je peux garder une seule direction sur la préparation, le tournage, le montage et la livraison. Le bénéfice n’est pas de multiplier les tâches : c’est d’éviter que l’idée se dilue entre les étapes.',
    value:'Une continuité de vision, une vraie expérience terrain et des fichiers pensés pour leur support final.',
    href:'/services/?expertise=realisation'
  },
  {
    key:'direction', label:'Direction artistique', index:'02',
    headline:'Faire tenir l’univers jusque dans les détails.',
    text:'Je construis un langage visuel cohérent pour que l’image, la typographie, la couleur, le rythme et la matière donnent l’impression de venir de la même idée.',
    value:'Plus de cohérence, des choix créatifs plus simples et une identité plus reconnaissable.',
    href:'/services/?expertise=direction'
  },
  {
    key:'strategie', label:'Stratégie de marque', index:'03',
    headline:'Transformer l’analyse en décisions qui bougent.',
    text:'J’audite ce qui bloque, je priorise ce qui mérite d’être accéléré et je préfère exécuter, mesurer puis ajuster plutôt que laisser une stratégie attendre dans un document.',
    value:'Des priorités plus nettes, une mise en action plus rapide et une création reliée aux objectifs de l’entreprise.',
    href:'/services/?expertise=strategie'
  }
];

const ecosystem = [
  {name:'Sony', role:'Boîtiers · optiques', logo:'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg', logoClass:'is-sony'},
  {name:'Sigma', role:'Optiques', logo:'https://upload.wikimedia.org/wikipedia/commons/8/8f/Sigma%27s_new_updated_logo_revealed%2C_February_2025.svg'},
  {name:'Adobe', role:'Post-production', logo:'https://upload.wikimedia.org/wikipedia/commons/f/fe/Adobe_Logo_Standard.svg'},
  {name:'NiSi', role:'Filtres', logo:'https://images.squarespace-cdn.com/content/v1/5abbd54bd274cb288dbee575/1580147234198-OZKG3ETPSV8IJXDIYUFM/NiSi-logo-2018-01%403x-1.png'},
  {name:'SmallRig', role:'Rig · lumière · accessoires', logo:'https://static.smallrig.com/mall/static/pc/common/svg/logo2023.svg', logoClass:'is-smallrig'},
  {name:'PGYTECH', role:'Workflow média', logo:'/assets/pgytech-logo.png', logoClass:'is-pgytech'}
];


export function homePage(){
  const stats = site.proofStats;
  return head({
    title:'Nolan Arc — Réalisation, direction artistique & stratégie',
    description:'Nolan Ribeiro, réalisateur et directeur artistique : films de marque, films de mariage dès 1 500 €, direction artistique et stratégie de marque. Paris et Île-de-France.',
    extraSchema:faqSchema(site.faqs.home,'/'),
    path:'/', image:`${site.domain}/assets/og-home.png`, imageAlt:'Nolan Arc — halo elliptique noir, blanc et orange', imageWidth:'1024', imageHeight:'1024', bodyClass:'page-home page-fabrica page-v16'
  }) + header('/') + `
  <main id="main-content" class="v16-home">
    <div class="hero-stack" data-hero-stack>
    <section class="v16-hero" aria-labelledby="v16-hero-title">
      ${heroSelfHosted
        ? `<div class="v16-hero__media v16-hero__media--file" aria-hidden="true"><video class="v16-hero__file" data-hero-file autoplay muted loop playsinline disablepictureinpicture preload="auto" poster="${homeHeroVideo.file}.jpg"><source src="${homeHeroVideo.file}.webm" type="video/webm"><source src="${homeHeroVideo.file}.mp4" type="video/mp4"></video><div class="v16-hero__veil"></div></div>`
        : `<div class="v16-hero__media v16-hero__media--video" aria-hidden="true" data-hero-video data-video-src="https://www.youtube-nocookie.com/embed/${homeHeroVideo.id}?autoplay=1&mute=1&loop=1&playlist=${homeHeroVideo.id}&controls=0&rel=0&playsinline=1&iv_load_policy=3&disablekb=1&fs=0&vq=hd2160" data-video-title="${esc(homeHeroVideo.title)}"><img class="v16-hero__poster" src="https://img.youtube.com/vi/${homeHeroVideo.id}/maxresdefault.jpg" data-fallback="https://img.youtube.com/vi/${homeHeroVideo.id}/hqdefault.jpg" alt="" fetchpriority="high" decoding="async"><div class="v16-hero__video-slot" data-hero-video-slot></div><div class="v16-hero__veil"></div>${gradientMotionBackground({style:'mesh',speed:28,blur:72,opacity:.13,size:122,colors:['#17100d','#5f2812','#12100f','#2b1710']})}</div>`}
      <h1 class="sr-only" id="v16-hero-title">Nolan Arc — réalisation, direction artistique et stratégie de marque</h1>
      <div class="hero-copy">
        <p class="hero-roles">Réalisation, direction artistique et stratégie de marque</p>
      </div>
    </section>

    <section class="fab-projects v16-work-preview" id="work-preview">
      <header class="fab-section-heading work-heading motion-reveal"><h2>Work.</h2><p>Mes réalisations et projets</p></header>
      <div class="fab-project-grid">
        <a class="fab-project-card fab-project-card--wide motion-reveal" href="/projet/le-bol-den-face/"><div class="fab-project-card__meta"><strong>Le bol d’en face.</strong><span>/2026</span><i>Réalisation & scénario</i></div><figure><img src="${bol.poster}" alt="Le bol d’en face — court métrage" loading="eager"><span>Voir le film ↗</span></figure></a>
        ${projectCards}
      </div>
      <div class="fab-projects__more"><a class="fab-arrow-link" href="/work/">Tout le Work <span>↗</span></a></div>
    </section>
    </div>

    ${focusText(site.manifesto)}

    <section class="dims" id="dimensions" aria-labelledby="dims-title">
      <header class="dims__head motion-reveal"><h2 id="dims-title">Trois dimensions.<br><em>Une seule vision.</em></h2><p>Partez de votre besoin.</p></header>
      <div class="dims__grid">
        ${expertiseTabs.map((x,i)=>`<a class="folder motion-reveal" href="${x.href}" style="--i:${i}">
          <span class="folder__art" aria-hidden="true"></span>
          <span class="folder__front">
            <span class="folder__tab">${esc(x.label)}</span>
            <span class="folder__top"><strong>${esc(dimNeeds[x.key].need)}</strong><i aria-hidden="true">↗</i></span>
            <span class="folder__more">${esc(dimNeeds[x.key].text)}</span>
            <span class="folder__foot"><span>À partir de</span><b>${esc(dimNeeds[x.key].price)}</b></span>
          </span>
        </a>`).join('')}
      </div>
    </section>

    ${weddingWall()}

    <section class="ring-section" id="journey" aria-labelledby="ring-title" data-ring>
      <div class="ring-section__head motion-reveal"><h2 id="ring-title">Comment je travaille.</h2></div>
      <div class="ring motion-reveal">
        <div class="ring__figure">
          <div class="orb" role="img" aria-label="Trois façons de travailler : comprendre, choisir, tenir le fil"><div class="orb__spin" data-orb-spin><span class="orb__glow"></span><span class="orb__body"></span><span class="orb__rim"></span></div><span class="ring__arc orb__dot" data-ring-arc="0" style="left:85.36%;top:14.64%"></span><span class="ring__arc orb__dot" data-ring-arc="1" style="left:62.94%;top:98.30%"></span><span class="ring__arc orb__dot" data-ring-arc="2" style="left:1.70%;top:37.06%"></span></div>
          <div class="ring__center" aria-hidden="true"><span data-ring-count>1</span><small data-ring-name>Comprendre</small></div>
        </div>
        <div class="ring__side">
          <ul class="ring__legend"><li><button type="button" data-ring-step="0" aria-pressed="true"><b aria-hidden="true"></b>Comprendre</button></li><li><button type="button" data-ring-step="1" aria-pressed="false"><b aria-hidden="true"></b>Choisir</button></li><li><button type="button" data-ring-step="2" aria-pressed="false"><b aria-hidden="true"></b>Tenir le fil</button></li></ul>
          <div class="ring__panels" aria-live="polite"><article class="ring__panel is-active" data-ring-panel="0"><small>Comprendre</small><h3>Qu’est-ce que le projet doit faire comprendre ou ressentir ?</h3><p>Je pars de l’effet recherché avant de choisir le format, le cadre ou le rythme.</p><p class="ring__get"><b>Vous avez</b> mes premières questions utiles, généralement sous 48 h.</p></article><article class="ring__panel" data-ring-panel="1"><small>Choisir</small><h3>Le cadre vient après.</h3><p>Lumière, mouvement, son, typographie ou montage servent cette direction.</p><p class="ring__get"><b>Vous avez</b> une direction claire, ce qu’il faut faire et dans quel ordre.</p></article><article class="ring__panel" data-ring-panel="2"><small>Tenir le fil</small><h3>La même idée, jusqu’au rendu.</h3><p>Je garde la direction entre réflexion, production et livraison pour éviter qu’elle se dilue.</p><p class="ring__get"><b>Vous avez</b> des fichiers pensés pour leur support final.</p></article></div>
        </div>
      </div>
    </section>

    <section class="v16-testimonials" id="retours">
      <header class="fab-section-heading motion-reveal"><div><h2>Avis.</h2></div><p>Ce qu’ils ont apprécié chez moi.</p></header>
      ${morphTestimonials(site.testimonials)}
    </section>

    <section class="v16-proof" aria-labelledby="v16-proof-title">
      <header class="v16-proof__head motion-reveal"><span class="fab-dot-label">Datas utiles</span><h2 id="v16-proof-title">Quelques chiffres pour situer ma pratique.</h2></header>
      ${animatedStats(stats,{theme:'light',layout:'grid',replay:true,animation:'blur'})}
    </section>

    <section class="brand-ecosystem v16-ecosystem v20-ecosystem--breather gear-section motion-reveal" aria-labelledby="brand-ecosystem-title">
      <h2 class="sr-only" id="brand-ecosystem-title">Des outils que je connais vraiment sur le terrain</h2>
      <figure class="gear-photo"><img src="/assets/gear/desk.webp" srcset="/assets/gear/desk-900.webp 900w, /assets/gear/desk.webp 1672w" sizes="100vw" width="1672" height="941" alt="Tablette et stylet, écouteurs, micro canon, boîtier Sony Alpha 7 IV, objectif et stabilisateur DJI RS 3 Pro posés sur un tapis de découpe orange" loading="lazy" decoding="async"></figure>
      <div class="brand-ecosystem__head"><p>Le matériel avec lequel je conçois, je tourne et je monte. Rien n’est laissé au hasard, car chacun d’entre eux me donne les moyens d’exprimer ma vision.</p></div>
      <div class="brand-ecosystem__grid v16-logo-grid" aria-label="Marques et outils de production">${ecosystem.map(b=>`<div class="v16-logo-card ${b.logoClass||''}">${b.logo?`<span class="v16-logo-media"><img src="${b.logo}" alt="Logo ${b.name}" loading="lazy"><b aria-hidden="true">${b.name}</b></span>`:`<strong class="v16-wordmark">${b.wordmark}</strong>`}<small>${b.role}</small></div>`).join('')}</div>
    </section>

    <section class="price-proof" id="pricing" aria-labelledby="pricing-title" data-price-proof>
      <div class="price-proof__grid" aria-hidden="true" data-price-grid></div>
      <header class="price-proof__head motion-reveal"><span class="price-proof__chip"><i aria-hidden="true"></i>Tarifs</span><h2 id="pricing-title">Un ordre de grandeur<br><em>avant de parler.</em></h2><p>Des points de départ clairs. Le reste se décide ensemble, sur devis.</p><small class="price-proof__tip">Attrapez une carte, lancez-la.</small></header>
      <ul class="price-arena" data-price-arena aria-label="Offres et tarifs">
        ${pricing.map((c,i)=>`<li class="price-card price-card--${c.theme}" data-price-card style="--i:${i}">
          <div class="price-card__inner">
            <span class="price-card__tag">${esc(c.tag)}</span>
            <p class="price-card__price">${c.from?'<small>À partir de</small>':''}<strong>${esc(c.price)}</strong></p>
            <h3>${esc(c.title)}</h3>
            <p class="price-card__text">${esc(c.text)}</p>
            ${c.facts?`<ul class="price-card__facts">${c.facts.map(([v,l])=>`<li><b>${esc(v)}</b> ${esc(l)}</li>`).join('')}</ul>`:''}
            <a class="price-card__cta" href="${esc(pricingHref(c))}">${esc(c.cta)} <span aria-hidden="true">↗</span></a>
          </div>
        </li>`).join('')}
      </ul>
    </section>

    ${faqAccordion(site.faqs.home,{id:'faq-home',eyebrow:'FAQ',title:'FAQ.',intro:'Au cas où une question vous passe par la tête.'})}

    <section class="v16-quick-contact final-cta" id="quick-contact">
      <form class="v16-quick-contact__form motion-reveal" data-contact-form action="https://formsubmit.co/ajax/${site.email}" method="POST">
        <input type="text" name="_honey" aria-label="Ne pas remplir" tabindex="-1" autocomplete="off" class="honeypot"><input type="hidden" name="_subject" value="Message rapide — nolanarc.com"><input type="hidden" name="_url" value="https://nolanarc.com/"><input type="hidden" name="_template" value="table">
        <small>Nolan.Arc</small><h2>Un message suffit.</h2>
        <label><span>Nom</span><input required name="nom" autocomplete="name" placeholder="Votre nom"></label>
        <label><span>Email</span><input required type="email" name="email" autocomplete="email" placeholder="vous@exemple.com"></label>
        <label><span>Message</span><textarea required name="message" rows="4" placeholder="Ce que vous préparez, même si c’est encore flou."></textarea></label>
        <button type="submit" data-submit>Envoyer le message <span aria-hidden="true">↗</span></button><p class="form-status" role="status" data-form-status></p><p class="v16-contact-privacy">Vos informations servent uniquement à répondre à votre message. <a href="/confidentialite/">Confidentialité</a>.</p>
      </form>
      <div class="final-cta__copy motion-reveal"><h2>Parlons de votre projet.</h2><p>Un brief précis ou simplement une idée : les deux me vont.</p><ul><li><strong>Réponse généralement sous 48 h</strong><span>Je reviens avec les premières questions utiles.</span></li><li><strong>Une suite claire</strong><span>Si le projet colle, on définit ce qu’il faut faire et dans quel ordre.</span></li></ul><p class="final-cta__alt">Ou par e-mail : <a href="mailto:${site.email}">${site.email}</a></p></div>
    </section>
  </main>` + footer();
}

export function workPage(){
  return head({title:'Work — Nolan Arc', description:'Réalisations de Nolan Ribeiro : court métrage « Le bol d’en face », films de mariage, direction artistique et vidéos pour les réseaux sociaux.', path:'/work/', extraSchema:[{ '@type':'ItemList', '@id':`${site.domain}/work/#projets`, name:'Projets', itemListElement:bentoTiles.filter(t=>t.href.startsWith('/')).map((t,i)=>({ '@type':'ListItem', position:i+1, name:t.title, url:`${site.domain}${t.href}` })) }], bodyClass:'page-work page-fabrica page-v16'}) + header('/work/') + `<main id="main-content" class="fab-work-page v16-work-page">
    <section class="fab-page-title motion-reveal"><div><h1>Work.</h1><small>sélection</small></div><p>Le projet passe avant le discours. Ouvrez ce qui vous intéresse ; les fiches gardent seulement le contexte utile.</p></section>
    <section class="bento-section motion-reveal" aria-label="Projets">${bentoFocus(bentoTiles)}</section>
    <section class="ig-section ig-stage motion-reveal" id="social" aria-labelledby="ig-title">
      <header><h2 id="ig-title">Social media videos.</h2><a class="ig-info" href="/cookies/#instagram" aria-label="Informations sur le chargement des vidéos Instagram">i</a></header>
      <div class="phone-stack" data-phone-stack tabindex="0" role="group" aria-roledescription="carrousel" aria-label="Vidéos social media : glissez, utilisez les flèches ou cliquez sur une miniature" style="--sx:${workAssets.phone.screen[0]}%;--sy:${workAssets.phone.screen[1]}%;--sw:${workAssets.phone.screen[2]}%;--sh:${workAssets.phone.screen[3]}%;--pr:${workAssets.phone.w}/${workAssets.phone.h}">
        <div class="phone-stack__stage" data-stack-stage>
          <ul class="phone-stack__cards">${[...instagramPosts,...instagramPosts].map((p,i)=>`<li class="ig-card ps-card" data-instagram-post data-stack-card="${i}"${i>=instagramPosts.length?' data-stack-copy':''} data-post-id="${esc(p.id)}" data-post-title="${esc(p.title)}" aria-label="${i%instagramPosts.length+1} sur ${instagramPosts.length} : ${esc(p.title)}">
            <div class="ps-card__screen"><div class="ig-card__cover"><strong>${esc(p.title)}</strong>${p.kind?`<small>${esc(p.kind)}</small>`:''}<button type="button" class="ig-card__play" data-load-instagram aria-label="Lire la vidéo ${esc(p.title)} (chargée depuis Instagram)">▶</button></div></div>
            <a class="ig-card__link" href="https://www.instagram.com/p/${esc(p.id)}/" target="_blank" rel="noopener noreferrer">Instagram ↗</a>
          </li>`).join('')}</ul>
          <img class="phone-stack__frame" src="/assets/work/phone.webp" alt="" width="${workAssets.phone.w}" height="${workAssets.phone.h}" loading="lazy" decoding="async">
        </div>
        <div class="phone-stack__nav"><button type="button" data-stack-prev aria-label="Vidéo précédente">←</button><span class="phone-stack__dots">${instagramPosts.map((p,i)=>`<button type="button" data-stack-dot="${i}" aria-label="Voir ${esc(p.title)}"></button>`).join('')}</span><button type="button" data-stack-next aria-label="Vidéo suivante">→</button></div>
      </div>
    </section>
    <section class="v16-expertise-switcher motion-reveal" data-expertise-switcher>
      <header><span class="fab-dot-label">Trois casquettes</span><h2>Choisissez celle qui vous concerne.</h2></header>
      <div class="v16-expertise-tabs" role="tablist" aria-label="Choisir une expertise">${expertiseTabs.map((x,i)=>`<button id="work-expertise-tab-${x.key}" type="button" role="tab" data-expertise-tab="${x.key}" aria-selected="${i===0?'true':'false'}" aria-controls="work-expertise-panel-${x.key}"><span>${x.index}</span>${x.label}</button>`).join('')}</div>
      <div class="v16-expertise-panels">${expertiseTabs.map((x,i)=>`<div id="work-expertise-panel-${x.key}" role="tabpanel" aria-labelledby="work-expertise-tab-${x.key}" data-expertise-panel="${x.key}"${i?' hidden':''}><small>${x.label}</small><h3>${x.headline}</h3><p>${x.text}</p><strong>${x.value}</strong><a href="${x.href}">Voir comment j’interviens ↗</a></div>`).join('')}</div>
    </section>
  </main>` + footer();
}

export function projectPage(){
  return head({title:`${bol.title} — court métrage de Nolan Ribeiro`, description:bol.summary, path:'/projet/le-bol-den-face/', extraSchema:[{ '@type':'Movie', '@id':`${site.domain}/projet/le-bol-den-face/#film`, name:bol.title, description:bol.summary, dateCreated:bol.year, genre:'Court métrage', inLanguage:'fr', countryOfOrigin:{ '@type':'Country', name:'France' }, image:bol.poster, url:`${site.domain}/projet/le-bol-den-face/`, sameAs:'https://www.youtube.com/watch?v=GbeOQ-hgrtU', director:{ '@id':`${site.domain}/#nolan` }, author:{ '@id':`${site.domain}/#nolan` } }], image:bol.poster, bodyClass:'page-project page-fabrica'}) + header('/projet/le-bol-den-face/') + `<main id="main-content" class="fab-project-page">
    <section class="fab-project-title motion-reveal"><a href="/work/">← Work</a><div><span>${bol.type} · ${bol.year}</span><h1>${bol.title}.</h1></div><p>${bol.summary}</p></section>
    ${lineToc([{id:'film',label:'Film'},{id:'story',label:'Intention'},{id:'next',label:'Suite'}])}
    <section class="fab-project-film" id="film"><div class="external-media project-player ambient-video-player" data-ambient-player data-external-video data-video-id="${bol.videoId}" data-video-title="${bol.title}" style="--poster:url('${bol.poster}')"><div class="external-media__gate"><small>Film · ${bol.year}</small><h2>Regarder<br>${bol.title}</h2><button class="hold-confirm" type="button" data-load-video><span>Lire sur YouTube</span><b aria-hidden="true">▶</b></button><p class="external-media__privacy">Ce geste autorise le chargement du lecteur YouTube et de ses traceurs pour cette lecture. <a href="/cookies/">En savoir plus</a>.</p></div></div><div class="fab-project-meta-head"><span>Fiche du film</span>${pageViewCounter()}</div>${projectMeta(bol)}</section>
    <section class="fab-project-story" id="story"><header class="fab-section-heading motion-reveal"><div><h2>Intention.</h2></div><p>${bol.contextText}</p></header><div class="fab-project-story__statement motion-reveal"><span>Problème narratif</span><h3>${bol.intent}</h3></div><div class="fab-project-decisions">${bol.decisions.map((d,i)=>`<article class="motion-reveal"><span>0${i+1}</span><h3>${d.title}</h3><p>${d.text}</p></article>`).join('')}</div></section>
    <section class="fab-project-next" id="next"><header><small>Continuer</small><h2>Et ensuite ?</h2></header><a href="/work/"><span>01</span><strong>Voir les autres travaux.</strong><b>↗</b></a><a href="/services/"><span>02</span><strong>Voir comment j’interviens.</strong><b>↗</b></a><a href="/contact/"><span>03</span><strong>Parler du projet.</strong><b>↗</b></a></section>
  </main>` + footer();
}

export function servicesPage(){
  return head({title:'Services et tarifs — Nolan Arc',description:'Films de mariage dès 1 500 €, direction artistique dès 200 €, stratégie de marque à 89 € de l’heure : prestations et tarifs de Nolan Ribeiro.',path:'/services/',extraSchema:faqSchema(site.faqs.services,'/services/'),bodyClass:'page-services page-fabrica page-v16'}) + header('/services/') + `<main id="main-content" class="v16-services-page">
    <section class="fab-page-title motion-reveal"><div><h1>Services.</h1><small>3 expertises</small></div><p>Trois expertises que je peux utiliser séparément ou réunir dans le même projet.</p></section>
    <section class="v16-service-switcher" data-expertise-switcher data-expertise-query>
      <div class="v16-service-switcher__tabs" role="tablist" aria-label="Choisir une expertise">${expertiseTabs.map((x,i)=>`<button id="services-expertise-tab-${x.key}" type="button" role="tab" data-expertise-tab="${x.key}" aria-selected="${i===0?'true':'false'}" aria-controls="services-expertise-panel-${x.key}"><span>${x.index}</span><strong>${x.label}</strong></button>`).join('')}</div>
      <div class="v16-service-switcher__panels">
        <div id="services-expertise-panel-realisation" role="tabpanel" aria-labelledby="services-expertise-tab-realisation" data-expertise-panel="realisation" class="is-active"><div class="v16-service-copy"><span class="fab-dot-label">Réalisation & vidéo</span><h2>Une seule direction du concept au fichier final.</h2><p>Je peux prendre un film de l’idée au rendu : préparation, production, montage, encodage et livraison restent reliés par la même vision. L’intérêt est simple : moins de pertes entre les étapes et un tournage pensé aussi pour ce qui devra fonctionner au montage.</p><strong>Vous gagnez une continuité de vision, une expertise terrain et des livrables correctement adaptés à leur support.</strong><a href="/contact/?intent=story">Parler d’une réalisation ↗</a></div><figure><img src="${bol.poster}" alt="Le bol d’en face — réalisation Nolan Ribeiro" loading="lazy"></figure></div>
        <div id="services-expertise-panel-direction" role="tabpanel" aria-labelledby="services-expertise-tab-direction" data-expertise-panel="direction" hidden><div class="v16-service-copy"><span class="fab-dot-label">Direction artistique</span><h2>Un univers doit tenir du premier au dernier détail.</h2><p>Je travaille le cadre visuel d’un projet pour que l’image, la typographie, la couleur, le rythme et la matière racontent la même chose. Même lorsque je n’exécute pas tout moi-même, je peux poser les règles qui permettent à l’équipe de rester cohérente.</p><strong>Vous gagnez une identité plus reconnaissable et des décisions créatives plus simples à reproduire.</strong><a href="/contact/?intent=brand">Parler d’une direction artistique ↗</a></div><figure><img src="${visuals.brand}" alt="Illustration d’une direction artistique" loading="lazy"></figure></div>
        <div id="services-expertise-panel-strategie" role="tabpanel" aria-labelledby="services-expertise-tab-strategie" data-expertise-panel="strategie" hidden><div class="v16-service-copy"><span class="fab-dot-label">Stratégie de marque & contenu</span><h2>Une stratégie utile doit finir par devenir une action.</h2><p>J’audite ce qui bloque aujourd’hui, je priorise ce qui peut créer un impact rapidement et je construis un plan que l’on peut réellement exécuter. Ensuite on mesure, on stabilise ce qui fonctionne et on augmente l’échelle.</p><strong>Vous gagnez des priorités plus nettes, moins d’attente entre la décision et l’exécution, et une création reliée au marché.</strong><a href="/contact/?intent=brand">Parler de stratégie ↗</a></div><figure><img src="${visuals.story}" alt="Illustration de stratégie de marque" loading="lazy"></figure></div>
      </div>
    </section>
    ${weddingOffersSection()}
    <section class="v16-combined-expertise motion-reveal"><span class="fab-dot-label">Pourquoi les trois comptent</span><h2>Même quand vous n’en achetez qu’une,<br><em>les autres restent dans la pièce.</em></h2><div><article><span>01</span><strong>Un film de marque</strong><p>La stratégie définit ce qu’il doit accomplir, la direction artistique ce à quoi il doit ressembler, la réalisation comment le produire.</p></article><article><span>02</span><strong>Une direction artistique</strong><p>Elle bénéficie d’une compréhension réelle de ce qui sera faisable sur un plateau et au montage.</p></article><article><span>03</span><strong>Une stratégie</strong><p>Elle reste reliée aux contenus et aux supports que l’entreprise devra réellement produire ensuite.</p></article></div></section>
    ${faqAccordion(site.faqs.services,{id:'faq-services',eyebrow:'FAQ Services',title:'FAQ.',intro:'Questions précises sur la manière dont je peux intervenir.'})}
    <section class="fab-contact-band motion-reveal"><div><small>Vous savez ce qu’il vous faut ?</small><h2>On cadre le périmètre.</h2></div><p>Un message suffit pour vérifier si je suis la bonne personne et sous quelle forme intervenir.</p><a href="/contact/">M’expliquer le projet <span>↗</span></a></section>
  </main>` + footer();
}

export function aboutPage(){
  return head({title:'À propos — Nolan Ribeiro, Nolan Arc',description:'Nolan Ribeiro, réalisateur et directeur artistique : parcours, pratique de la vidéo depuis 2022 et manière de travailler.',path:'/a-propos/',extraSchema:[{ '@type':'AboutPage', '@id':`${site.domain}/a-propos/#about`, url:`${site.domain}/a-propos/`, mainEntity:{ '@id':`${site.domain}/#nolan` } }],bodyClass:'page-about page-fabrica page-v17'}) + header('/a-propos/') + `<main id="main-content" class="v17-about-page">
    <section class="v17-about-hero" id="nolan">
      <figure class="v17-about-portrait"><img src="/assets/nolan-portrait.jpg" alt="Portrait de Nolan Ribeiro" data-nolan-portrait></figure>
      <div class="v17-about-hero__copy"><span class="fab-dot-label">Nolan Ribeiro · Nolan Arc</span><h1>Je ne suis pas arrivé à ces trois disciplines <em>par plan de carrière.</em></h1><p>J’ai surtout continué à suivre les problèmes que j’avais envie de résoudre : raconter mieux, rendre un univers cohérent, puis comprendre pourquoi certaines idées fonctionnent réellement.</p><div class="v17-about-hero__links"><a href="/work/">Voir le Work ↗</a><a href="/contact/">Parler d’un projet ↗</a></div></div>
    </section>

    <section class="v17-about-origin motion-reveal"><span class="fab-dot-label">Depuis 2022</span><div><h2>La vidéo m’a appris à penser avant, pendant et après l’image.</h2><p>Plus de cinquante vidéos plus tard, ce que je retiens n’est pas seulement la technique. C’est la capacité à anticiper ce qu’il faudra obtenir sur le terrain, à décider vite quand le réel ne suit pas le plan et à garder assez de matière pour réécrire proprement au montage.</p></div></section>

    <section class="v17-about-turn motion-reveal"><div class="v17-about-turn__statement"><small>Le tournant</small><h2>À force de produire des images, j’ai commencé à regarder ce qu’il y avait <em>autour.</em></h2></div><div class="v17-about-turn__copy"><p>Pourquoi une marque paraît cohérente avant même qu’on lise son nom ? Pourquoi deux contenus techniquement corrects ne racontent pas la même chose ? Pourquoi certaines idées avancent vite alors que d’autres restent bloquées dans une présentation ?</p><p>C’est ce qui m’a amené vers la direction artistique puis la stratégie : pas pour empiler des titres, mais parce que ces questions apparaissaient déjà dans mes projets.</p></div></section>

    <section class="v17-about-lenses"><header class="fab-section-heading motion-reveal"><div><h2>Trois angles.<br><em>La même personne.</em></h2></div><p>Les prestations sont détaillées dans Services. Ici, l’important est ce que ces trois regards changent dans ma manière d’aborder un sujet.</p></header><div class="v17-about-lenses__grid">
      <article class="motion-reveal"><span>01</span><h3>Construire</h3><p>J’aime partir d’une idée et lui donner une forme réelle, avec les contraintes du terrain plutôt qu’en restant au stade du concept.</p></article>
      <article class="motion-reveal"><span>02</span><h3>Relier</h3><p>Je remarque vite quand une image, un ton, une couleur ou un support ne semble plus appartenir au même univers.</p></article>
      <article class="motion-reveal"><span>03</span><h3>Décider</h3><p>Quand la direction est suffisamment claire, je préfère avancer, mesurer puis corriger plutôt que prolonger une réflexion qui n’ajoute plus de valeur.</p></article>
    </div></section>

    <section class="v17-about-curiosity motion-reveal"><div><span class="fab-dot-label">Curieux par nature</span><h2>Entrer dans un nouvel univers est souvent la partie qui m’intéresse le plus.</h2></div><div class="v17-about-curiosity__bento"><article><strong>Je creuse vite.</strong><p>Quand un sujet m’intéresse, comprendre son vocabulaire, ses références et ses contraintes ne ressemble pas à une corvée.</p></article><article><strong>Je change d’échelle.</strong><p>Je peux regarder un détail de cadre puis revenir à la perception globale d’une marque ou à son objectif business.</p></article><article><strong>Je reste concret.</strong><p>Une idée devient intéressante lorsqu’on sait comment la produire, où la diffuser et ce qu’elle doit améliorer.</p></article><article><strong>Je m’adapte sans lisser.</strong><p>Comprendre un nouvel univers ne veut pas dire le rendre générique : l’objectif est justement d’identifier ce qui lui appartient.</p></article></div></section>

    <section class="v17-about-workstyle motion-reveal"><span class="fab-dot-label">Travailler avec moi</span><h2>Direct quand il faut trancher.<br>Autonome quand il faut avancer.</h2><div><p>Je peux rejoindre un projet déjà lancé, travailler avec une équipe existante ou prendre davantage de responsabilités quand il faut garder une cohérence de bout en bout.</p><p>Je n’ai pas besoin qu’un projet soit parfaitement défini pour commencer à réfléchir. En revanche, une fois la direction choisie, j’aime que les décisions deviennent rapidement des actions.</p></div></section>

    <section class="v17-about-proof motion-reveal"><small>Vu de l’extérieur</small><blockquote>« Il ne se contente pas de filmer. Il réfléchit à ce qu’il veut raconter et pourquoi. »</blockquote><span>Matthieu · Ouilove Proposal</span></section>
    <section class="fab-contact-band motion-reveal"><div><small>La suite dépend de ce que vous cherchez</small><h2>Regarder ou parler.</h2></div><p>Le Work montre ce que je produis. Services précise ce que je peux prendre en charge. Le contact sert à voir ce que cela peut devenir dans votre contexte.</p><div class="fab-contact-band__actions"><a href="/work/">Voir le Work <span>↗</span></a><a href="/services/">Voir les Services <span>↗</span></a><a href="/contact/">Parler du projet <span>↗</span></a></div></section>
  </main>` + footer();
}

export function journalPage(){
  return head({title:'Journal — Nolan Arc',description:'Notes pratiques de Nolan Arc sur la préparation, le cadrage et le montage.',path:'/journal/',bodyClass:'page-journal'}) + header('/journal/') + `<main id="main-content">
    <section class="journal-hero motion-reveal"><span class="eyebrow">Journal</span><h1>Ce que je regarde<br><em>avant d’appuyer sur REC.</em></h1><p>Préparation, cadrage, rythme : des décisions concrètes que j’utilise pour éviter de tourner ou monter au hasard.</p></section>
    <section class="journal-stack">${notes.map((n,i)=>`<article id="${n.slug}" class="motion-reveal"><span>0${i+1}</span><small>${n.category} · ${n.date}</small><h2>${n.title}</h2><p>${n.excerpt}</p></article>`).join('')}</section>
    <section class="journal-bridge motion-reveal"><span class="eyebrow">Dans un vrai projet</span><div><h2>Voir ces choix appliqués dans un film.</h2><a class="text-link" href="/projet/le-bol-den-face/">Le bol d’en face <span>↗</span></a></div></section>
  </main>` + footer();
}

export function contactPage(){
  return head({title:'Contact — Nolan Arc',description:'Écrire à Nolan Ribeiro pour un film, une direction artistique ou un projet de marque. Réponse généralement sous 48 h.',path:'/contact/',extraSchema:[{ '@type':'ContactPage', '@id':`${site.domain}/contact/#contact`, url:`${site.domain}/contact/`, about:{ '@id':`${site.domain}/#business` } },...faqSchema(site.faqs.contact,'/contact/')],bodyClass:'page-contact page-fabrica page-v17'}) + header('/contact/') + `<main id="main-content" class="contact-page v17-contact-page">
    <section class="contact-composer motion-gradient" data-gradient-host>
      ${gradientMotionBackground({style:'diamond',speed:19,blur:82,opacity:.46,size:130,colors:['#E97736','#F0C7A5','#CC460C','#7D4A34']})}
      <div class="contact-composer__intro motion-reveal">
        <span class="eyebrow">Contact</span>
        <h1>Dites-moi simplement<br><em>ce que vous préparez.</em></h1>
        <p>Pas besoin d’un brief parfait. Une idée, une date ou un problème à résoudre suffisent pour commencer. Je vous réponds généralement sous 48 h ouvrées.</p>
        <div class="contact-direct-mini"><a href="mailto:${site.email}">${site.email}</a><span>ou</span><a href="${site.calendly}" target="_blank" rel="noreferrer">30 min ensemble ↗</a></div>
      </div>
      <form class="contact-form contact-form--composer motion-reveal" data-contact-form data-offers="${esc(JSON.stringify(Object.fromEntries(pricing.map(o=>[o.key,{title:o.title,intent:o.intent,message:pricingMessage(o)}]))))}" action="https://formsubmit.co/ajax/${site.email}" method="POST">
        <input type="text" name="_honey" aria-label="Ne pas remplir" tabindex="-1" autocomplete="off" class="honeypot">
        <input type="hidden" name="_subject" value="Nouveau projet — nolanarc.com"><input type="hidden" name="_url" value="https://nolanarc.com/contact/"><input type="hidden" name="_template" value="table">
        <fieldset class="contact-intent-card"><legend>Ça concerne quoi ?</legend><div class="form-intent form-intent--pills"><button type="button" data-form-intent="brand">Marque</button><button type="button" data-form-intent="story">Film / récit</button><button type="button" data-form-intent="moment">Mariage / moment</button><button type="button" data-form-intent="other">Autre</button><input type="hidden" name="type_de_projet" data-intent-input value="Autre"><input type="hidden" name="offre" data-offer-input value=""></div></fieldset>
        <label class="contact-message contact-message--composer"><span>Votre message</span><textarea required name="message" rows="5" placeholder="L’idée, la date si elle existe, le lieu et ce que vous attendez de moi."></textarea></label>
        <div class="contact-fields contact-fields--identity"><label><span>Nom</span><input required name="nom" autocomplete="name" placeholder="Votre nom"></label><label><span>Email</span><input required type="email" name="email" autocomplete="email" placeholder="vous@exemple.com"></label></div>
        <details class="contact-more contact-more--composer"><summary>Budget / entreprise <span>optionnel</span></summary><div class="contact-fields"><label><span>Entreprise</span><input name="entreprise" autocomplete="organization" placeholder="Nom de l’entreprise"></label><label><span>Budget</span><select name="budget"><option value="">Pas encore défini</option><option>&lt; 1 500 €</option><option>1 500 – 3 000 €</option><option>3 000 – 7 500 €</option><option>7 500 € +</option></select></label></div></details>
        <div class="contact-submit contact-submit--composer"><p class="form-privacy">Vos informations servent uniquement à répondre à votre demande. <a href="/confidentialite/">Confidentialité</a>.</p><button class="button button--light" type="submit" data-submit>Envoyer le projet <span>↗</span></button><p class="form-status" role="status" data-form-status></p></div>
      </form>
    </section>
    ${faqAccordion(site.faqs.contact,{id:'faq-contact',eyebrow:'FAQ Contact',title:'FAQ.',intro:'Ce qu’il est utile de savoir avant d’envoyer votre message.'})}
  </main>` + footer();
}

const legalNav = `<nav class="legal-tabs" aria-label="Pages légales"><a href="/mentions-legales/">Mentions</a><a href="/confidentialite/">Confidentialité</a><a href="/cgv/">CGV</a><a href="/cookies/">Cookies</a><a href="/retractation/">Rétractation</a></nav>`;

const legalValue = (value, fallback='À compléter avant publication') => value ? esc(value) : `<strong class="legal-missing">${fallback}</strong>`;

export function legalPage(){
  const vat = legal.vat ? esc(legal.vat) : 'Non renseigné / à confirmer selon le régime fiscal réel';
  return head({title:'Mentions légales — Nolan Arc',description:'Mentions légales du site Nolan Arc.',path:'/mentions-legales/',bodyClass:'page-legal'}) + header() + `<main id="main-content" class="legal-page-shell">${legalNav}<article class="legal-content"><span class="eyebrow">Informations légales</span><h1>Mentions légales</h1>
  <h2>Éditeur du site</h2><p><strong>${esc(site.legalName)}</strong>${legal.businessForm ? ` — ${esc(legal.businessForm)}` : ''}, exerçant sous l’identité professionnelle <strong>${esc(site.name)}</strong>.<br>Email : <a href="mailto:${site.email}">${esc(site.email)}</a>.${legal.publicLegalContactsConfirmed && legal.professionalAddress ? `<br>Adresse professionnelle : ${esc(legal.professionalAddress)}.` : ''}${legal.publicLegalContactsConfirmed && legal.professionalPhone ? `<br>Téléphone professionnel : ${esc(legal.professionalPhone)}.` : ''}<br>SIREN : ${legalValue(legal.siren)}.<br>SIRET : ${legalValue(legal.siret)}.<br>Code APE : ${legalValue(legal.ape)}.<br>TVA : ${vat}.</p>
  <h2>Directeur de la publication</h2><p>${esc(legal.publicationDirector)}.</p>
  <h2>Hébergement</h2><p>${esc(legal.host.name)}, ${esc(legal.host.address)} — <a href="${esc(legal.host.website)}" rel="noreferrer">${esc(legal.host.website)}</a>.${legal.host.phone ? ` Téléphone : ${esc(legal.host.phone)}.` : legal.host.phoneNote ? ` ${esc(legal.host.phoneNote)}` : ''}</p>
  <h2>Propriété intellectuelle</h2><p>Sauf mention contraire, les textes, photographies, films, éléments graphiques et créations présentés sur ce site sont protégés par les droits de propriété intellectuelle de leurs auteurs et ayants droit. Toute réutilisation dépassant les exceptions prévues par la loi nécessite l’autorisation préalable du titulaire concerné.</p>
  <h2>Données personnelles et traceurs</h2><p>Les informations détaillées sur les traitements de données sont disponibles dans la <a href="/confidentialite/">politique de confidentialité</a>. Les choix relatifs aux contenus externes sont décrits dans la page <a href="/cookies/">Cookies et contenus externes</a>.</p>
  <h2>Conditions commerciales</h2><p>Les prestations sont encadrées par les <a href="/cgv/">Conditions générales de vente et de prestation de services</a>, complétées par le devis ou contrat accepté pour chaque projet.</p>
  </article></main>` + footer();
}

export function privacyPage(){
  return head({title:'Confidentialité — Nolan Arc',description:'Politique de confidentialité et traitement des données personnelles sur nolanarc.com.',path:'/confidentialite/',bodyClass:'page-legal'}) + header() + `<main id="main-content" class="legal-page-shell">${legalNav}<article class="legal-content"><span class="eyebrow">Vie privée</span><h1>Politique de confidentialité</h1>
  <h2>Responsable du traitement</h2><p>${esc(site.legalName)}${legal.businessForm ? ` — ${esc(legal.businessForm)}` : ''}. Contact pour toute demande relative aux données personnelles : <a href="mailto:${legal.privacyContact}">${esc(legal.privacyContact)}</a>.</p>
  <h2>Formulaire de contact</h2><p>Lorsque vous utilisez le formulaire, sont traitées les informations que vous renseignez : nom, adresse email, entreprise éventuelle, catégorie et description du projet, budget éventuel, ainsi que les informations librement ajoutées dans le message. La finalité est de répondre à votre demande, d’évaluer la possibilité d’une collaboration et, le cas échéant, de prendre des mesures précontractuelles à votre demande.</p>
  <p>Les champs obligatoires sont signalés dans le formulaire. Sans nom, adresse email et description du projet, il n’est pas possible de traiter correctement la demande.</p>
  <h2>Base juridique</h2><p>Lorsqu’une demande concerne la préparation d’un projet ou d’un devis, le traitement est fondé sur les mesures précontractuelles prises à votre demande. Pour une sollicitation générale sans perspective contractuelle immédiate, la réponse peut reposer sur l’intérêt légitime de Nolan Arc à traiter les messages qui lui sont adressés.</p>
  <h2>Destinataires et sous-traitant du formulaire</h2><p>Les données sont accessibles à Nolan Arc et transitent, pour l’envoi technique du formulaire, par ${esc(legal.formProcessor.name)}. Ce service agit comme intermédiaire technique pour transmettre le message ; ses propres conditions de traitement et de sécurité s’appliquent également. Aucune donnée du formulaire n’est utilisée par Nolan Arc à des fins publicitaires.</p>
  <h2>Durées de conservation</h2><p>Les demandes de prospects qui ne débouchent pas sur une relation contractuelle sont conservées au maximum selon la règle suivante : ${esc(legal.prospectRetention)}. Lorsqu’une relation contractuelle est conclue, les données nécessaires à l’exécution, à la facturation et à la défense des droits sont conservées selon les durées légales applicables : ${esc(legal.clientRetention)}.</p>
  <h2>Vos droits</h2><p>Vous pouvez demander l’accès, la rectification, l’effacement ou la limitation de vos données et exercer, selon le fondement du traitement, vos droits d’opposition et de portabilité. Pour exercer vos droits : <a href="mailto:${legal.privacyContact}">${esc(legal.privacyContact)}</a>. Vous pouvez également introduire une réclamation auprès de la CNIL.</p>
  <h2>Contenus et services tiers</h2><p>${heroSelfHosted ? 'Le fond vidéo de l’accueil est hébergé sur ce site : il ne fait appel à aucun service tiers. Les lecteurs YouTube' : 'Le fond vidéo YouTube de l’accueil reste désactivé tant que vous n’avez pas autorisé les contenus vidéo externes. Les autres lecteurs YouTube'} et les vidéos hébergées sur Instagram (pages Work et Services) sont chargés uniquement après une action explicite dans leur emplacement ; Instagram est un service de Meta et ses propres conditions s’appliquent alors. Les polices Yrsa, Syne et DM Sans sont chargées via Google Fonts afin de respecter l’identité graphique du site ; votre navigateur contacte donc les serveurs de ce prestataire lors du chargement des polices. La fréquentation du site est mesurée avec Cloudflare Web Analytics, sans cookie et de façon agrégée ; vous pouvez vous y opposer depuis la page Cookies. Les liens vers Instagram, YouTube et Calendly ouvrent les services concernés ; leurs propres politiques s’appliquent lorsque vous quittez nolanarc.com.</p>
  <h2>Sécurité</h2><p>Le site limite les données collectées au nécessaire et n’embarque aucun outil publicitaire ; seule une mesure d’audience sans cookie (Cloudflare Web Analytics) est utilisée, avec possibilité de s’y opposer. Les échanges avec les services externes restent soumis aux mesures de sécurité et aux conditions propres de ces prestataires.</p>
  <p class="legal-update">Dernière mise à jour : 16 novembre 2026.</p></article></main>` + footer();
}

export function cookiesPage(){
  return head({title:'Cookies et contenus externes — Nolan Arc',description:'Informations sur les cookies, traceurs et contenus externes utilisés sur nolanarc.com.',path:'/cookies/',bodyClass:'page-legal'}) + header() + `<main id="main-content" class="legal-page-shell">${legalNav}<article class="legal-content"><span class="eyebrow">Traceurs</span><h1>Cookies & contenus externes</h1>
  <h2>Principe</h2><p>Nolanarc.com n’utilise ni outil publicitaire ni profilage. Le site mesure uniquement son audience avec un outil sans cookie (voir ci-dessous) et n’enregistre pas votre parcours pour personnaliser la visite.</p>
  <h2>Vidéo YouTube</h2><p>${heroSelfHosted ? 'Aucun lecteur YouTube n’est chargé avant votre choix. Le fond vidéo de l’accueil est un fichier hébergé sur ce site : il ne dépose aucun cookie et ne contacte aucun service tiers. Sur les pages projet' : 'Aucun lecteur YouTube n’est chargé avant votre choix. Sur l’accueil, vous pouvez autoriser ou refuser le fond vidéo ; votre préférence est conservée dans un cookie fonctionnel pendant six mois et peut être modifiée à tout moment depuis « Préférences vidéo » dans le footer. Sur les pages projet'}, l’activation du lecteur constitue un choix contextuel pour la lecture demandée. Après autorisation, votre navigateur communique avec YouTube et ce service peut utiliser des traceurs selon ses propres règles.</p>
  <h2>Mesure d’audience</h2><p>Le site utilise Cloudflare Web Analytics pour savoir combien de personnes le visitent et quelles pages sont consultées. Cet outil ne dépose aucun cookie, n’utilise pas d’identifiant publicitaire et ne vous suit pas d’un site à l’autre. Les statistiques sont agrégées et servent uniquement à améliorer le site. Vous pouvez vous y opposer à tout moment : le bouton ci-dessous désactive la mesure sur cet appareil en enregistrant un petit cookie fonctionnel d’opposition, conservé un an (le signal « Ne pas suivre » de votre navigateur est aussi respecté).</p><p><button type="button" class="legal-optout" data-audience-optout aria-pressed="false">Ne pas compter ma visite</button></p>
  <h2 id="instagram">Vidéos Instagram (Social media videos)</h2><p>Sur les pages Work et Services, des vidéos sont hébergées sur Instagram. Aucune connexion à Instagram n’est établie au chargement de la page. Le lecteur n’est créé qu’après votre clic sur le bouton de lecture de la vidéo ; votre navigateur communique alors avec Instagram (Meta), qui peut utiliser des cookies et traceurs selon ses propres règles. Sans clic, vous pouvez aussi ouvrir chaque publication directement sur Instagram.</p>
  <h2>Polices et liens externes</h2><p>Les polices Yrsa, Syne et DM Sans sont chargées via Google Fonts. Ce chargement crée une connexion vers les serveurs du fournisseur afin de récupérer les fichiers nécessaires. Les liens vers Instagram, YouTube et Calendly n’activent pas ces services tant que vous ne les ouvrez pas. Une fois le site tiers ouvert, ses propres règles en matière de cookies et de données personnelles s’appliquent.</p>
  <h2>Votre choix</h2><p>Le refus est aussi simple que l’acceptation. Vous pouvez rouvrir le choix depuis « Préférences vidéo » dans le footer, à tout moment. Si vous retirez votre autorisation, le lecteur externe du fond d’accueil est déchargé et n’est plus recréé lors des visites suivantes.</p><h2>Évolution du site</h2><p>Si un traceur non exempté (publicité, profilage, mesure avec cookie) devait être ajouté ultérieurement, le mécanisme de consentement serait adapté avant son activation.</p>
  <p class="legal-update">Dernière mise à jour : 16 novembre 2026.</p></article></main>` + footer();
}

export function cgvPage(){
  const mediator = legal.mediator.name ? `${esc(legal.mediator.name)} — ${esc(legal.mediator.address)} — <a href="${esc(legal.mediator.website)}" rel="noreferrer">${esc(legal.mediator.website)}</a>` : `Aucun médiateur de la consommation n’est actuellement indiqué, l’adhésion devant être conclue par le professionnel avant que ses coordonnées puissent être publiées. Pour toute réclamation préalable : <a href="mailto:${site.email}">${esc(site.email)}</a>.`;
  return head({title:'CGV — Nolan Arc',description:'Conditions générales de vente et de prestation de services Nolan Arc.',path:'/cgv/',bodyClass:'page-legal'}) + header() + `<main id="main-content" class="legal-page-shell">${legalNav}<article class="legal-content"><span class="eyebrow">Conditions commerciales</span><h1>Conditions générales de vente et de prestation de services</h1>
  <h2>1. Prestataire et champ d’application</h2><p>Les présentes conditions encadrent les prestations proposées par ${esc(site.legalName)}${legal.businessForm ? ` — ${esc(legal.businessForm)}` : ''}, sous l’identité professionnelle ${esc(site.name)}. Elles s’appliquent aux clients professionnels et, lorsqu’une prestation est conclue avec un consommateur, sous réserve des dispositions impératives du Code de la consommation. Le devis ou contrat accepté précise le périmètre du projet et prévaut sur les présentes conditions pour les modalités particulières.</p>
  <h2>2. Formation du contrat</h2><p>La prise de contact via le site ne vaut pas commande. Le contrat est formé lorsque le devis, bon de commande ou contrat transmis par Nolan Arc est accepté selon les modalités qui y sont indiquées. Le document accepté précise au minimum la nature de la mission, les livrables, le calendrier estimatif et le prix ou son mode de calcul.</p>
  <h2>3. Prix</h2><p>Les prestations sont principalement réalisées sur devis, en fonction du périmètre, de la durée de production, des livrables, des droits demandés et des frais éventuels. Lorsque le prix exact ne peut être calculé à l’avance, son mode de calcul et les frais connus sont communiqués avant l’engagement du client. Pour les consommateurs, les montants communiqués sont exprimés TTC lorsque la TVA est applicable.</p>
  <h2>4. Paiement</h2><p>${legalValue(legal.paymentTerms, 'Conditions de paiement à définir : échéancier, acompte éventuel et date d’exigibilité.')}</p><p><strong>Clients professionnels :</strong> pénalités de retard : ${legalValue(legal.latePenaltyB2B, 'Taux de pénalités de retard B2B à définir dans le respect du minimum légal.')}. Une indemnité forfaitaire de 40 € pour frais de recouvrement est due dans les conditions prévues par la loi. Escompte : ${legalValue(legal.discountTerms, 'Conditions d’escompte à définir, ou indiquer explicitement « aucun escompte ».')}.</p><p><strong>Clients consommateurs :</strong> Nolan Arc n’applique pas de doublement automatique du prix ni de pénalité punitive forfaitaire. En cas d’impayé, Nolan Arc peut suspendre la prestation et/ou la livraison et exercer les voies de recouvrement permises par le droit applicable.</p>
  <h2>5. Organisation, délais, livrables et collaboration</h2><p>Le calendrier est défini au devis et dépend notamment de la remise des éléments par le client, des validations, des disponibilités de tournage et des éventuels prestataires tiers. Les retards causés par l’absence de validation ou de fourniture des éléments nécessaires peuvent entraîner un décalage raisonnable du calendrier.</p><p>${esc(legal.archivalPolicy)}</p>
  <h2>6. Modifications et validations</h2><p>Le nombre de versions, allers-retours et modifications inclus est celui prévu au devis. Toute demande hors périmètre peut faire l’objet d’un devis complémentaire avant exécution.</p>
  <h2>7. Annulation, report ou fin anticipée</h2><p>${legalValue(legal.cancellationPolicy, 'Politique d’annulation/report et sort des sommes versées à définir selon votre pratique commerciale.')}</p><p><strong>Missions continues :</strong> ${esc(legal.continuousCancellationPolicy)}</p><p>Les droits impératifs du consommateur, notamment le droit de rétractation lorsqu’il s’applique, restent réservés.</p>
  <h2>8. Propriété intellectuelle et droit à l’image</h2><p>${legalValue(legal.ipPolicy, 'Étendue de la cession/licence : supports, durée, territoire, exclusivité et usages à définir dans le devis ou contrat.')} Les éléments appartenant au client ou à des tiers restent la propriété de leurs titulaires. Le client garantit disposer des autorisations nécessaires pour les éléments qu’il fournit et informe Nolan Arc des contraintes spécifiques liées au droit à l’image, aux marques ou aux lieux.</p>
  <h2>9. Droit de rétractation des consommateurs</h2><p>Lorsqu’un contrat de prestation est conclu à distance avec un consommateur et qu’aucune exception légale ne s’applique, celui-ci dispose en principe d’un délai de quatorze jours à compter de la conclusion du contrat pour exercer son droit de rétractation. Les modalités et un modèle de formulaire sont disponibles sur la page <a href="/retractation/">Rétractation</a>. Une exécution avant la fin du délai ne peut être organisée que dans le respect des conditions légales applicables.</p>
  <h2>10. Réclamations et médiation de la consommation</h2><p>Pour toute réclamation : <a href="mailto:${site.email}">${esc(site.email)}</a>. Lorsqu’un litige avec un consommateur n’a pas pu être résolu directement, le consommateur peut saisir gratuitement le médiateur de la consommation désigné par le prestataire : ${mediator}</p>
  <h2>11. Force majeure et responsabilité</h2><p>${esc(legal.forceMajeurePolicy)}</p><p>La responsabilité de Nolan Arc s’apprécie au regard de la mission effectivement convenue, sans priver un consommateur des droits que la loi lui reconnaît.</p>
  <h2>12. Droit applicable et litiges</h2><p>Les contrats sont soumis au droit français, sous réserve des protections impératives dont bénéficie un consommateur. Pour les clients professionnels, les modalités de règlement des litiges peuvent être précisées dans le devis ou contrat. Aucune clause ne peut priver un consommateur des règles de compétence juridictionnelle qui lui sont applicables.</p>
  <p class="legal-update">Dernière mise à jour : 16 novembre 2026.</p></article></main>` + footer();
}

export function withdrawalPage(){
  return head({title:'Rétractation — Nolan Arc',description:'Informations et modèle de formulaire de rétractation pour les contrats à distance conclus avec un consommateur.',path:'/retractation/',bodyClass:'page-legal'}) + header() + `<main id="main-content" class="legal-page-shell">${legalNav}<article class="legal-content"><span class="eyebrow">Consommateurs</span><h1>Droit de rétractation</h1>
  <h2>Principe</h2><p>Pour un contrat de prestation de services conclu à distance avec un consommateur, un droit de rétractation de quatorze jours à compter de la conclusion du contrat s’applique en principe, sauf exception prévue par la loi. Les conditions particulières applicables à votre projet sont rappelées avant la conclusion du contrat.</p>
  <h2>Demande d’exécution anticipée</h2><p>Si vous souhaitez que la prestation commence avant l’expiration du délai de rétractation, une demande expresse peut être nécessaire. Lorsque les conditions légales d’une perte du droit de rétractation sont réunies après exécution complète, une information et un accord spécifiques sont recueillis avant le commencement de la prestation.</p>
  <h2>Exercer votre droit</h2><p>Vous pouvez envoyer une déclaration dénuée d’ambiguïté à <a href="mailto:${site.email}">${esc(site.email)}</a>, ou utiliser le modèle ci-dessous.</p>
  <div class="withdrawal-model"><h3>Modèle de formulaire</h3><p>À l’attention de ${esc(site.legalName)}, ${esc(site.email)} :</p><p>Je vous notifie par la présente ma rétractation du contrat portant sur la prestation suivante : […]</p><p>Contrat/devis accepté le : […]<br>Nom du consommateur : […]<br>Adresse du consommateur : […]<br>Date : […]<br>Signature (uniquement en cas de formulaire papier) : […]</p></div>
  <p class="legal-update">Dernière mise à jour : 16 novembre 2026.</p></article></main>` + footer();
}

export function adminPage(){
  return head({title:'Tableau de bord — Nolan Arc',description:'Espace d’administration réservé de nolanarc.com.',path:'/admin/',bodyClass:'page-admin'}).replace('<title>','<meta name="robots" content="noindex,nofollow">\n<title>') + `<a class="skip-link" href="#main-content">Aller au contenu</a>
<main id="main-content" class="admin-ui"><h1 class="admin-sr">Tableau de bord Nolan Arc</h1>
<div class="admin-app" data-admin-app data-supabase-url="${esc(site.supabaseUrl)}" data-supabase-key="${esc(site.supabasePublishableKey)}"><noscript><p>JavaScript est nécessaire pour cette page.</p></noscript></div>
</main><script src="/admin/supabase.js?v=2.119.0" defer></script><script src="/admin/admin.js?v=__ADMIN_V__" defer></script></body></html>`;
}

export function notFoundPage(){
  return head({title:'404 — Nolan Arc',description:'Cette page n’existe pas.',path:'/404/',bodyClass:'page-404'}) + header() + `<main id="main-content" class="black-hole" data-black-hole>
    <canvas class="black-hole__canvas" aria-hidden="true"></canvas>
    <div class="black-hole__copy">
      <span class="black-hole__code">Erreur 404</span>
      <h1 class="black-hole__line" data-bh-line aria-live="polite">Mince, il semblerait que vous vous êtes fait aspirer jusqu’ici.</h1>
      <div class="black-hole__actions"><a class="black-hole__primary" href="/">Revenir à l’accueil <span aria-hidden="true">↗</span></a><a class="black-hole__secondary" href="/work/">ou voir le Work</a></div>
      <p class="black-hole__hint">Bougez la souris pour incliner la galaxie. Maintenez le clic, ou le doigt, pour accélérer la chute.</p>
    </div>
  </main>` + footer();
}
