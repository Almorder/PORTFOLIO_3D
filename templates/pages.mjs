import { site } from '../content/site.mjs';
import { projects } from '../content/projects.mjs';
import { notes } from '../content/journal.mjs';
import { legal } from '../content/legal.mjs';
import { head, header, footer, esc, projectMeta, logoPreloader, lineToc, animatedStats, focusTestimonials, glassShowcase, stackedFlow, videoSlideShow, pageViewCounter, gradientMotionBackground, faqAccordion } from './components.mjs';

const bol = projects.find(p=>p.slug==='le-bol-den-face');
const visuals = {
  brand: 'https://images.unsplash.com/photo-1768076955015-dd4f057e96f6?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
  story: 'https://images.unsplash.com/photo-1709316132989-55ef2437b920?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=72&w=1800',
  moment: 'https://images.unsplash.com/photo-1770866381405-f47395dd2414?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000'
};

export function homePage(){
  return head({
    title:'Nolan Arc — Réalisateur & directeur artistique',
    description:"Portfolio de Nolan Arc, réalisateur et directeur artistique. Films, direction visuelle et récits construits autour d’une intention claire.",
    path:'/', bodyClass:'page-home page-fabrica'
  }) + header('/') + `
  <main id="main-content" class="fab-home">
    <section class="fab-hero" aria-labelledby="fab-hero-title">
      <div class="fab-hero__media" aria-hidden="true"><img src="${visuals.brand}" alt="" fetchpriority="high"><div class="fab-hero__veil"></div>${gradientMotionBackground({style:'mesh',speed:26,blur:90,opacity:.16,size:132,colors:['#151515','#343434','#6d6d6d','#0a0a0a']})}</div>
      <h1 class="fab-hero__wordmark" id="fab-hero-title"><span>Nolan</span><b>.</b><span>Arc</span><small>Réalisateur</small></h1>
      <ul class="fab-hero__services" aria-label="Domaines d’intervention"><li>Réalisation</li><li>Direction artistique</li><li>Écriture & montage</li><li>Films de moments</li></ul>
      <p class="fab-hero__statement">Pas d’image pour remplir. Chaque choix doit servir ce que vous voulez faire comprendre, ressentir ou garder.</p>
      <div class="fab-hero__contact"><div class="fab-hero__avatar" aria-hidden="true">N</div><div><small>Nolan Ribeiro</small><strong>Réalisateur & DA</strong></div><a href="/contact/">Parler du projet ↗</a></div>
      <span class="fab-hero__copyright">© 2026 Nolan Arc</span>
      <i class="fab-cross fab-cross--1" aria-hidden="true"></i><i class="fab-cross fab-cross--2" aria-hidden="true"></i><i class="fab-cross fab-cross--3" aria-hidden="true"></i>
    </section>

    <section class="fab-clients motion-reveal" aria-label="Collaborations documentées">
      <div class="fab-section-meta"><span>Collaborations</span><small>(2024–26©)</small></div>
      <div class="fab-client-grid">${site.clients.map((name,i)=>`<div><span>0${i+1}</span><strong>${esc(name)}</strong></div>`).join('')}</div>
    </section>

    <section class="fab-projects" id="work-preview">
      <header class="fab-section-heading motion-reveal"><div><small>(04)</small><h2>Work.</h2><span>©2026</span></div><p>Un film documenté en profondeur, puis des collaborations qui montrent d’autres contextes d’intervention.</p></header>
      <div class="fab-project-grid">
        <a class="fab-project-card fab-project-card--wide motion-reveal" href="/projet/le-bol-den-face/"><div class="fab-project-card__meta"><strong>Le bol d’en face.</strong><span>/2026</span><i>Film</i></div><figure><img src="${bol.poster}" alt="Le bol d’en face — court métrage" loading="lazy"><span>Voir le film ↗</span></figure></a>
        <a class="fab-project-card motion-reveal" href="/services/#ouilove-proof"><div class="fab-project-card__meta"><strong>Ouilove Proposal.</strong><span>/2024</span><i>Direction artistique</i></div><figure><img src="${visuals.brand}" alt="Illustration de la collaboration Ouilove Proposal" loading="lazy"><span>Voir la collaboration ↗</span></figure></a>
        <a class="fab-project-card motion-reveal" href="/services/#marques"><div class="fab-project-card__meta"><strong>A One Permis.</strong><span>/2024</span><i>Contenu social</i></div><figure><img src="${visuals.story}" alt="Illustration de la collaboration A One Permis" loading="lazy"><span>Voir le contexte ↗</span></figure></a>
        <a class="fab-project-card motion-reveal" href="/services/#moments"><div class="fab-project-card__meta"><strong>Moments.</strong><span>/2025</span><i>Événement</i></div><figure><img src="${visuals.moment}" alt="Illustration des films de moments" loading="lazy"><span>Voir les moments ↗</span></figure></a>
      </div>
      <div class="fab-projects__more"><a class="fab-arrow-link" href="/work/">Tous les travaux <span>↗</span></a></div>
    </section>

    <section class="fab-proof">
      <div class="fab-proof__intro motion-reveal"><span class="fab-dot-label">Pourquoi travailler ensemble</span><h2>Une direction claire.<br>Moins d’allers-retours inutiles.</h2><p>Je relie préparation, réalisation et montage autour de la même intention. Vous savez ce que l’on cherche, ce qui est décidé et ce qui sera livré.</p><a class="fab-arrow-link" href="/a-propos/">Voir ma manière de travailler <span>↗</span></a></div>
      ${animatedStats(site.proofStats,{theme:'light',layout:'grid',replay:true,animation:'slide'})}
    </section>

    <section class="fab-services" id="services-preview">
      <header class="fab-section-heading motion-reveal"><div><small>(03)</small><h2>Services.</h2></div><p>Le format vient après le besoin. Je pars de ce que votre image doit réellement accomplir.</p></header>
      <div class="fab-service-list">
        <a class="fab-service-row motion-reveal" href="/services/#marques"><span>001</span><div><h3>Marques & organisations</h3><p>Film, direction artistique et contenu pour clarifier un message et tenir une image cohérente.</p></div><ul><li>Film de marque</li><li>Direction artistique</li><li>Contenu social</li></ul><figure><img src="${visuals.brand}" alt="Illustration d’une production pour une marque" loading="lazy"></figure><b>↗</b></a>
        <a class="fab-service-row motion-reveal" href="/services/#recits"><span>002</span><div><h3>Récits & création</h3><p>Écriture, mise en scène, réalisation et montage pour donner une forme précise à une histoire.</p></div><ul><li>Écriture</li><li>Mise en scène</li><li>Réalisation</li></ul><figure><img src="${bol.poster}" alt="Le bol d’en face" loading="lazy"></figure><b>↗</b></a>
        <a class="fab-service-row motion-reveal" href="/services/#moments"><span>003</span><div><h3>Moments</h3><p>Préparer ce qui compte, filmer sans prendre la place et construire un souvenir cohérent.</p></div><ul><li>Mariage</li><li>Demande</li><li>Événement</li></ul><figure><img src="${visuals.moment}" alt="Illustration d’un film de moment" loading="lazy"></figure><b>↗</b></a>
      </div>
    </section>

    <section class="fab-process fab-process--dark">
      <div class="fab-process__head motion-reveal"><span class="fab-dot-label">Comment je travaille</span><h2>L’intention<br>avant l’image.</h2><p>Je préfère décider ce qu’un plan doit accomplir avant de décider comment il doit être tourné.</p></div>
      <div class="fab-process__visual motion-reveal">${glassShowcase([visuals.brand, bol.poster, visuals.moment])}</div>
      <div class="fab-process__steps">
        <article class="motion-reveal"><span>01</span><strong>Comprendre</strong><p>Ce que le public doit comprendre, ressentir ou garder.</p></article>
        <article class="motion-reveal"><span>02</span><strong>Choisir</strong><p>Le cadre, la lumière, le mouvement, le son et le rythme qui servent cette intention.</p></article>
        <article class="motion-reveal"><span>03</span><strong>Tenir le fil</strong><p>La même direction pendant la préparation, le tournage et le montage.</p></article>
      </div>
      <a class="fab-arrow-link fab-arrow-link--light" href="/a-propos/">À propos de Nolan <span>↗</span></a>
    </section>

    <section class="fab-testimonials">
      <header class="fab-section-heading motion-reveal"><div><small>(03)</small><h2>Retours.</h2></div><p>Pas de note artificielle. Seulement des phrases déjà reçues sur le travail et la manière de collaborer.</p></header>
      ${focusTestimonials(site.testimonials,{maxVisible:3})}
    </section>

    ${faqAccordion(site.faqs.home,{id:'faq-home',eyebrow:'FAQ',title:'Avant de commencer.',intro:'Les réponses utiles avant un premier échange.'})}

    <section class="fab-contact-band motion-reveal">
      <div><small>Disponible pour de nouveaux projets</small><h2>Parlons.</h2></div><p>Une idée, une date ou un problème à résoudre suffisent pour commencer.</p><a href="/contact/">Écrire à Nolan <span>↗</span></a>
    </section>
  </main>` + footer();
}

export function workPage(){
  const collaborations = projects.filter(p=>p.status!=='verified');
  const filmSlides=[
    { videoId: bol.videoId, start: 0, poster: bol.poster, position: '42% center', kicker: '01', title: 'Ouverture' },
    { videoId: bol.videoId, start: 12, poster: bol.poster, position: '35% center', kicker: '02', title: 'Le repas' },
    { videoId: bol.videoId, start: 24, poster: bol.poster, position: '50% center', kicker: '03', title: 'Les indices' },
    { videoId: bol.videoId, start: 36, poster: bol.poster, position: '62% center', kicker: '04', title: 'Le silence' },
    { videoId: bol.videoId, start: 48, poster: bol.poster, position: '72% center', kicker: '05', title: 'La résolution' },
  ];
  return head({title:'Work — Nolan Arc', description:'Films, direction artistique et collaborations sélectionnées de Nolan Arc.', path:'/work/', bodyClass:'page-work page-fabrica'}) + header('/work/') + `<main id="main-content" class="fab-work-page">
    <section class="fab-page-title motion-reveal"><div><span>(04)</span><h1>Work.</h1><small>2024–26©</small></div><p>Un film documenté en profondeur et plusieurs collaborations qui montrent les contextes dans lesquels j’interviens.</p></section>

    <section class="fab-work-grid">
      <a class="fab-project-card fab-project-card--wide motion-reveal" href="/projet/le-bol-den-face/"><div class="fab-project-card__meta"><strong>Le bol d’en face.</strong><span>/2026</span><i>Court métrage</i></div><figure><img src="${bol.poster}" alt="Le bol d’en face — court métrage" loading="eager"><span>Voir le film ↗</span></figure></a>
      <a class="fab-project-card motion-reveal" href="/services/#ouilove-proof"><div class="fab-project-card__meta"><strong>Ouilove Proposal.</strong><span>/2024</span><i>Direction artistique</i></div><figure><img src="${visuals.brand}" alt="Illustration de la collaboration Ouilove Proposal" loading="lazy"><span>Voir la collaboration ↗</span></figure></a>
      <a class="fab-project-card motion-reveal" href="/services/#marques"><div class="fab-project-card__meta"><strong>A One Permis.</strong><span>/2024</span><i>Contenu social</i></div><figure><img src="${visuals.story}" alt="Illustration de la collaboration A One Permis" loading="lazy"><span>Voir le contexte ↗</span></figure></a>
      <a class="fab-project-card motion-reveal" href="/services/#moments"><div class="fab-project-card__meta"><strong>Moments.</strong><span>/2025</span><i>Films de moments</i></div><figure><img src="${visuals.moment}" alt="Illustration de films de moments" loading="lazy"><span>Voir les moments ↗</span></figure></a>
    </section>

    ${videoSlideShow(filmSlides,{autoplay:true,interval:5600,muted:true,sectionId:'work-reels',eyebrow:'Film en mouvement',heading:'Le bol d’en face, en fragments.',intro:'Faites glisser les cartes : la vitesse du geste détermine jusqu’où le carrousel continue.'})}

    <section class="fab-work-collabs">
      <header class="fab-section-heading motion-reveal"><div><small>(03)</small><h2>Collaborations.</h2></div><p>Des contextes différents, avec la même recherche de cohérence entre l’idée, la production et le rendu.</p></header>
      ${stackedFlow(collaborations.map((p)=>({href:p.href,kicker:p.type,title:p.title,text:p.summary,image:p.slug==='moments'?visuals.moment:(p.slug==='a-one-permis'?visuals.story:visuals.brand)})))}
    </section>

    <section class="fab-contact-band motion-reveal"><div><small>Un autre contexte ?</small><h2>Expliquez-moi le besoin.</h2></div><p>Je regarde l’objectif, les contraintes et les livrables avant de vous proposer une façon d’intervenir.</p><a href="/contact/">Parler du projet <span>↗</span></a></section>
  </main>` + footer();
}

export function projectPage(){
  return head({title:`${bol.title} — Nolan Arc`, description:bol.summary, path:'/projet/le-bol-den-face/', image:bol.poster, bodyClass:'page-project page-fabrica'}) + header('/projet/le-bol-den-face/') + `<main id="main-content" class="fab-project-page">
    <section class="fab-project-title motion-reveal"><a href="/work/">← Work</a><div><span>${bol.type} · ${bol.year}</span><h1>${bol.title}.</h1></div><p>${bol.summary}</p></section>
    ${lineToc([{id:'film',label:'Film'},{id:'story',label:'Intention'},{id:'next',label:'Suite'}])}
    <section class="fab-project-film" id="film"><div class="external-media project-player ambient-video-player" data-ambient-player data-external-video data-video-id="${bol.videoId}" data-video-title="${bol.title}" style="--poster:url('${bol.poster}')"><div class="external-media__gate"><small>Film · ${bol.year}</small><h2>Regarder<br>${bol.title}</h2><button class="hold-confirm" type="button" data-hold-confirm data-hold-ms="650" data-load-video><span>Maintenir pour lire</span><b aria-hidden="true">▶</b><i aria-hidden="true"></i></button></div></div><div class="fab-project-meta-head"><span>Fiche du film</span>${pageViewCounter()}</div>${projectMeta(bol)}</section>
    <section class="fab-project-story" id="story"><header class="fab-section-heading motion-reveal"><div><small>(03)</small><h2>Intention.</h2></div><p>${bol.contextText}</p></header><div class="fab-project-story__statement motion-reveal"><span>Problème narratif</span><h3>${bol.intent}</h3></div><div class="fab-project-decisions">${bol.decisions.map((d,i)=>`<article class="motion-reveal"><span>0${i+1}</span><h3>${d.title}</h3><p>${d.text}</p></article>`).join('')}</div></section>
    <section class="fab-project-next" id="next"><header><small>Continuer</small><h2>Et ensuite ?</h2></header><a href="/work/"><span>01</span><strong>Voir les autres travaux.</strong><b>↗</b></a><a href="/services/"><span>02</span><strong>Voir comment j’interviens.</strong><b>↗</b></a><a href="/contact/"><span>03</span><strong>Parler du projet.</strong><b>↗</b></a></section>
  </main>` + footer();
}

export function servicesPage(){
  return head({title:'Services — Nolan Arc',description:'Réalisation, direction artistique, contenu et films de moments par Nolan Arc.',path:'/services/',bodyClass:'page-services page-fabrica'}) + header('/services/') + `<main id="main-content" class="fab-services-page">
    <section class="fab-page-title motion-reveal"><div><span>(03)</span><h1>Services.</h1><small>Du besoin au rendu</small></div><p>Je ne pars pas d’un format. Je pars de ce que votre image doit réellement accomplir, puis je construis la bonne réponse.</p></section>
    ${lineToc([{id:'marques',label:'Marques'},{id:'recits',label:'Récits'},{id:'moments',label:'Moments'}])}

    <section class="fab-services-index motion-reveal" aria-label="Choisir un contexte"><a href="#marques"><span>001</span><strong>Marques & organisations</strong><small>Film · DA · contenu</small></a><a href="#recits"><span>002</span><strong>Récits & création</strong><small>Écriture · réalisation · montage</small></a><a href="#moments"><span>003</span><strong>Moments</strong><small>Mariage · demande · événement</small></a></section>

    <section class="fab-service-section" id="marques">
      <div class="fab-service-section__meta"><span>001</span><small>Marques & organisations</small></div>
      <div class="fab-service-section__main motion-reveal"><div><h2>Faire comprendre<br>avant d’impressionner.</h2><p>Film, direction artistique ou contenu : je cherche d’abord ce que votre public doit comprendre, reconnaître ou retenir.</p></div><ul><li>Film de marque</li><li>Direction artistique</li><li>Contenu social</li><li>Déclinaisons</li></ul></div>
      <div class="fab-service-media motion-reveal"><img src="${visuals.brand}" alt="Illustration d’une production audiovisuelle pour une marque" loading="lazy"><div><span>Ce que vous gagnez</span><strong>Un message plus clair, une image plus cohérente et des livrables pensés pour leurs usages.</strong></div></div>
      <div class="fab-service-points"><article><span>01</span><h3>Clarifier</h3><p>Relier concept, préparation et réalisation autour de ce que le public doit retenir.</p></article><article><span>02</span><h3>Unifier</h3><p>Faire suivre au cadrage, à la lumière, à la couleur et au rythme une même direction.</p></article><article><span>03</span><h3>Prévoir</h3><p>Anticiper formats et déclinaisons avant le tournage plutôt que recadrer au hasard après.</p></article></div>
      <aside class="fab-quote-card motion-reveal" id="ouilove-proof"><div><small>Ouilove Proposal · Direction artistique</small><p>La mission demandait autant de réflexion sur le message que de cohérence dans son exécution visuelle.</p></div><blockquote>« Il ne se contente pas de filmer. Il réfléchit à ce qu’il veut raconter et pourquoi. »<cite>Matthieu · Ouilove Proposal</cite></blockquote></aside>
      <a class="fab-arrow-link" href="/contact/?intent=brand">Parler d’un projet de marque <span>↗</span></a>
    </section>

    <section class="fab-service-section fab-service-section--dark" id="recits">
      <div class="fab-service-section__meta"><span>002</span><small>Récits & création</small></div>
      <div class="fab-service-section__main motion-reveal"><div><h2>Une histoire a besoin<br>d’une direction.</h2><p>J’interviens sur l’écriture, la mise en scène, la réalisation et le montage pour que chaque scène fasse avancer la compréhension ou l’émotion.</p></div><ul><li>Écriture</li><li>Mise en scène</li><li>Réalisation</li><li>Montage</li></ul></div>
      <a class="fab-service-media fab-service-media--project motion-reveal" href="/projet/le-bol-den-face/"><img src="${bol.poster}" alt="Le bol d’en face — court métrage" loading="lazy"><div><span>Court métrage · 2026</span><strong>Le bol d’en face.</strong><small>Voir le film et les décisions ↗</small></div></a>
      <div class="fab-service-points"><article><span>01</span><h3>Écrire</h3><p>Savoir ce que chaque scène apporte avant de chercher l’effet.</p></article><article><span>02</span><h3>Mettre en scène</h3><p>Transformer une intention en décisions visibles : position, mouvement, lumière et son.</p></article><article><span>03</span><h3>Monter</h3><p>Garder le même fil jusqu’à la dernière coupe.</p></article></div>
      <a class="fab-arrow-link fab-arrow-link--light" href="/contact/?intent=story">Parler d’un récit <span>↗</span></a>
    </section>

    <section class="fab-service-section" id="moments">
      <div class="fab-service-section__meta"><span>003</span><small>Moments</small></div>
      <div class="fab-service-section__main motion-reveal"><div><h2>Préparer assez<br>pour vous laisser vivre.</h2><p>Mariage, demande en mariage ou événement personnel : la préparation sert à réduire les interruptions le jour même.</p></div><ul><li>Préparation</li><li>Captation</li><li>Son</li><li>Montage</li></ul></div>
      <div class="fab-service-media motion-reveal"><img src="${visuals.moment}" alt="Illustration d’un événement personnel filmé avec discrétion" loading="lazy"><div><span>Ce que vous gagnez</span><strong>Moins de questions le jour même, moins de moments manqués et un film construit autour de ce qui a réellement compté.</strong></div></div>
      <div class="fab-service-points"><article><span>01</span><h3>Avant</h3><p>Repérer les lieux, personnes et moments qui ne doivent pas être manqués.</p></article><article><span>02</span><h3>Pendant</h3><p>Anticiper les bonnes positions sans transformer la journée en tournage.</p></article><article><span>03</span><h3>Après</h3><p>Relier voix, regards, gestes et détails autour du souvenir que vous voulez garder.</p></article></div>
      <aside class="fab-quote-card motion-reveal"><div><small>Film de moment</small><p>Le format exact, les livrables, la durée et les droits sont définis au devis.</p></div><blockquote>« Le résultat était pile comme je l’imaginais. »<cite>Nawel & Yanis</cite></blockquote></aside>
      <a class="fab-arrow-link" href="/contact/?intent=moment">Parler de votre moment <span>↗</span></a>
    </section>

    <section class="fab-contact-band motion-reveal"><div><small>Vous hésitez sur la catégorie ?</small><h2>Décrivez simplement le besoin.</h2></div><p>Je vous dirai ensuite la forme d’intervention qui a le plus de sens.</p><a href="/contact/">M’expliquer le projet <span>↗</span></a></section>
  </main>` + footer();
}


export function aboutPage(){
  return head({title:'À propos — Nolan Arc',description:'Nolan Ribeiro : parcours, manière de créer et ce que cette approche apporte aux projets.',path:'/a-propos/',bodyClass:'page-about page-fabrica'}) + header('/a-propos/') + `<main id="main-content" class="fab-about-page">
    <section class="fab-page-title motion-reveal" id="nolan"><div><span>(01)</span><h1>À propos.</h1><small>Nolan Ribeiro</small></div><p>Je réalise, j’écris et je construis des directions visuelles. Le point commun : je veux savoir pourquoi une image doit exister avant de décider comment la produire.</p></section>
    ${lineToc([{id:'nolan',label:'Nolan'},{id:'parcours',label:'Parcours'},{id:'regard',label:'Regard'},{id:'methode',label:'Méthode'}])}

    <section class="fab-about-intro" id="parcours">
      <figure class="fab-about-intro__portrait motion-reveal"><img src="/assets/nolan-portrait.jpg" alt="Portrait de Nolan Ribeiro" data-nolan-portrait><div class="about-story-hero__fallback" aria-hidden="true"><span>N</span><small>Portrait de Nolan à ajouter</small></div></figure>
      <div class="fab-about-intro__copy motion-reveal"><span class="fab-dot-label">Moi, c’est Nolan</span><h2>Je n’aime pas créer<br>juste pour remplir.</h2><p>Depuis petit, ce qui m’attire, c’est de créer des vidéos, raconter mes propres histoires et mettre une vision derrière ce que je montre.</p><p>J’ai aussi connu l’excès inverse : passer tellement de temps à réfléchir et à me structurer que je créais moins. Ça m’a ralenti. Aujourd’hui, cette exigence me sert surtout à poser les bonnes questions plus tôt et à garder un fil clair jusqu’au rendu.</p></div>
    </section>

    <section class="fab-about-stats motion-reveal">${animatedStats(site.proofStats,{theme:'light',layout:'grid',replay:true,animation:'fade'})}</section>

    <section class="fab-about-view" id="regard">
      <header class="fab-section-heading motion-reveal"><div><small>(02)</small><h2>Le regard.</h2></div><p>Je remarque vite quand un univers tient jusque dans ses détails : cadrage, matière, rythme, manière de parler ou de montrer les choses.</p></header>
      <div class="fab-about-view__grid"><article class="motion-reveal"><span>01</span><h3>Pas simplement « beau ».</h3><p>Je cherche les décisions qui donnent au projet une identité juste pour son contexte.</p></article><article class="motion-reveal"><span>02</span><h3>Pas de technique pour la technique.</h3><p>Caméra, lumière ou mouvement servent une idée. Ils ne remplacent pas l’idée.</p></article><article class="motion-reveal"><span>03</span><h3>Un seul fil.</h3><p>Ce qui est décidé au départ doit encore se sentir au montage et dans les livrables.</p></article></div>
    </section>

    <section class="fab-process fab-process--dark" id="methode">
      <div class="fab-process__head motion-reveal"><span class="fab-dot-label">Ma méthode</span><h2>Comprendre.<br>Choisir.<br>Tenir le fil.</h2><p>Trois temps simples pour éviter de tourner trop tôt ou de chercher une cohérence uniquement en post-production.</p></div>
      <div class="fab-process__visual motion-reveal">${glassShowcase([visuals.brand, bol.poster, visuals.moment])}</div>
      <div class="fab-process__steps"><article><span>01</span><strong>Comprendre</strong><p>Ce que l’image doit accomplir.</p></article><article><span>02</span><strong>Choisir</strong><p>Les moyens qui servent cette intention.</p></article><article><span>03</span><strong>Tenir le fil</strong><p>La même direction jusqu’au rendu.</p></article></div>
    </section>

    <section class="fab-about-quote motion-reveal"><small>Vu de l’extérieur</small><blockquote>« Il ne se contente pas de filmer. Il réfléchit à ce qu’il veut raconter et pourquoi. »</blockquote><span>Matthieu · Ouilove Proposal</span></section>

    <section class="fab-contact-band motion-reveal"><div><small>Le travail avant les promesses</small><h2>Voir ce que ça donne.</h2></div><p>Le plus simple reste de regarder un projet puis de me dire ce que vous préparez.</p><a href="/work/">Voir le Work <span>↗</span></a></section>
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
  return head({title:'Contact — Nolan Arc',description:'Parler d’un film, d’une direction artistique ou d’un moment à Nolan Arc.',path:'/contact/',bodyClass:'page-contact page-fabrica'}) + header('/contact/') + `<main id="main-content" class="contact-page">
    <section class="contact-composer motion-gradient" data-gradient-host>
      ${gradientMotionBackground({style:'diamond',speed:19,blur:82,opacity:.46,size:130,colors:['#E97736','#F0C7A5','#CC460C','#7D4A34']})}
      <div class="contact-composer__intro motion-reveal">
        <span class="eyebrow">Contact</span>
        <h1>Dites-moi simplement<br><em>ce que vous préparez.</em></h1>
        <p>Pas besoin d’un brief parfait. Une idée, une date ou un problème à résoudre suffisent pour commencer. Je vous réponds sous 48 h ouvrées.</p>
        <div class="contact-direct-mini"><a href="mailto:${site.email}">${site.email}</a><span>ou</span><a href="${site.calendly}" target="_blank" rel="noreferrer">30 min ensemble ↗</a></div>
      </div>
      <form class="contact-form contact-form--composer motion-reveal" data-contact-form action="https://formsubmit.co/ajax/${site.email}" method="POST">
        <input type="text" name="_honey" tabindex="-1" autocomplete="off" class="honeypot">
        <input type="hidden" name="_subject" value="Nouveau projet — nolanarc.com"><input type="hidden" name="_url" value="https://nolanarc.com/contact/"><input type="hidden" name="_template" value="table">
        <fieldset class="contact-intent-card"><legend>Ça concerne quoi ?</legend><div class="form-intent form-intent--pills"><button type="button" data-form-intent="brand">Marque</button><button type="button" data-form-intent="story">Film / récit</button><button type="button" data-form-intent="moment">Mariage / moment</button><button type="button" data-form-intent="other">Autre</button><input type="hidden" name="type_de_projet" data-intent-input value="Autre"></div></fieldset>
        <label class="contact-message contact-message--composer"><span>Votre message</span><textarea required name="message" rows="5" placeholder="L’idée, la date si elle existe, le lieu et ce que vous attendez de moi."></textarea></label>
        <div class="contact-fields contact-fields--identity"><label><span>Nom</span><input required name="nom" autocomplete="name" placeholder="Votre nom"></label><label><span>Email</span><input required type="email" name="email" autocomplete="email" placeholder="vous@exemple.com"></label></div>
        <details class="contact-more contact-more--composer"><summary>Budget / entreprise <span>optionnel</span></summary><div class="contact-fields"><label><span>Entreprise</span><input name="entreprise" autocomplete="organization" placeholder="Nom de l’entreprise"></label><label><span>Budget</span><select name="budget"><option value="">Pas encore défini</option><option>&lt; 1 500 €</option><option>1 500 – 3 000 €</option><option>3 000 – 7 500 €</option><option>7 500 € +</option></select></label></div></details>
        <div class="contact-submit contact-submit--composer"><p class="form-privacy">Vos informations servent uniquement à répondre à votre demande. <a href="/confidentialite/">Confidentialité</a>.</p><button class="button button--light" type="submit" data-submit>Envoyer le projet <span>↗</span></button><p class="form-status" role="status" data-form-status></p></div>
      </form>
    </section>
    ${faqAccordion(site.faqs.contact,{id:'faq-contact',eyebrow:'FAQ',title:'Avant d’envoyer.',intro:'Les réponses utiles sans rallonger le formulaire.'})}
  </main>` + footer();
}

const legalNav = `<nav class="legal-tabs" aria-label="Pages légales"><a href="/mentions-legales/">Mentions</a><a href="/confidentialite/">Confidentialité</a><a href="/cgv/">CGV</a><a href="/cookies/">Cookies</a><a href="/retractation/">Rétractation</a></nav>`;

const legalValue = (value, fallback='À compléter avant publication') => value ? esc(value) : `<strong class="legal-missing">${fallback}</strong>`;

export function legalPage(){
  const vat = legal.vat ? esc(legal.vat) : 'Non renseigné / à confirmer selon le régime fiscal réel';
  return head({title:'Mentions légales — Nolan Arc',description:'Mentions légales du site Nolan Arc.',path:'/mentions-legales/',bodyClass:'page-legal'}) + header() + `<main id="main-content" class="legal-page-shell">${legalNav}<article class="legal-content"><span class="eyebrow">Informations légales</span><h1>Mentions légales</h1>
  <h2>Éditeur du site</h2><p><strong>${esc(site.legalName)}</strong>${legal.businessForm ? ` — ${esc(legal.businessForm)}` : ''}, exerçant sous l’identité professionnelle <strong>${esc(site.name)}</strong>.<br>Adresse professionnelle : ${legalValue(legal.registeredAddress)}.<br>Téléphone : ${legalValue(legal.phone)}.<br>Email : <a href="mailto:${site.email}">${esc(site.email)}</a>.<br>SIREN : ${legalValue(legal.siren)}.<br>SIRET : ${legalValue(legal.siret)}.<br>Code APE : ${legalValue(legal.ape)}.<br>TVA : ${vat}.</p>
  <h2>Directeur de la publication</h2><p>${esc(legal.publicationDirector)}.</p>
  <h2>Hébergement</h2><p>${esc(legal.host.name)}, ${esc(legal.host.address)} — <a href="${esc(legal.host.website)}" rel="noreferrer">${esc(legal.host.website)}</a>.</p>
  <h2>Propriété intellectuelle</h2><p>Sauf mention contraire, les textes, photographies, films, éléments graphiques et créations présentés sur ce site sont protégés par les droits de propriété intellectuelle de leurs auteurs et ayants droit. Toute réutilisation dépassant les exceptions prévues par la loi nécessite l’autorisation préalable du titulaire concerné.</p>
  <h2>Données personnelles et traceurs</h2><p>Les informations détaillées sur les traitements de données sont disponibles dans la <a href="/confidentialite/">politique de confidentialité</a>. Les choix relatifs aux contenus externes sont décrits dans la page <a href="/cookies/">Cookies et contenus externes</a>.</p>
  <h2>Conditions commerciales</h2><p>Les prestations sont encadrées par les <a href="/cgv/">Conditions générales de vente et de prestation de services</a>, complétées par le devis ou contrat accepté pour chaque projet.</p>
  </article></main>` + footer();
}

export function privacyPage(){
  return head({title:'Confidentialité — Nolan Arc',description:'Politique de confidentialité et traitement des données personnelles sur nolanarc.com.',path:'/confidentialite/',bodyClass:'page-legal'}) + header() + `<main id="main-content" class="legal-page-shell">${legalNav}<article class="legal-content"><span class="eyebrow">Vie privée</span><h1>Politique de confidentialité</h1>
  <h2>Responsable du traitement</h2><p>${esc(site.legalName)}${legal.businessForm ? ` — ${esc(legal.businessForm)}` : ''}, adresse : ${legalValue(legal.registeredAddress)}, contact : <a href="mailto:${legal.privacyContact}">${esc(legal.privacyContact)}</a>.</p>
  <h2>Formulaire de contact</h2><p>Lorsque vous utilisez le formulaire, sont traitées les informations que vous renseignez : nom, adresse email, entreprise éventuelle, catégorie et description du projet, budget éventuel, ainsi que les informations librement ajoutées dans le message. La finalité est de répondre à votre demande, d’évaluer la possibilité d’une collaboration et, le cas échéant, de prendre des mesures précontractuelles à votre demande.</p>
  <p>Les champs obligatoires sont signalés dans le formulaire. Sans nom, adresse email et description du projet, il n’est pas possible de traiter correctement la demande.</p>
  <h2>Base juridique</h2><p>Lorsqu’une demande concerne la préparation d’un projet ou d’un devis, le traitement est fondé sur les mesures précontractuelles prises à votre demande. Pour une sollicitation générale sans perspective contractuelle immédiate, la réponse peut reposer sur l’intérêt légitime de Nolan Arc à traiter les messages qui lui sont adressés.</p>
  <h2>Destinataires</h2><p>Les données sont accessibles à Nolan Arc et transitent, pour l’envoi technique du formulaire, par ${esc(legal.formProcessor.name)}. Ce prestataire indique conserver les soumissions pendant 30 jours. Les informations relatives à ce prestataire et à ses propres traitements doivent être vérifiées avant toute activation du formulaire en production.</p>
  <h2>Durées de conservation</h2><p>Les demandes de prospects qui ne débouchent pas sur une relation contractuelle sont conservées au maximum selon la règle suivante : ${esc(legal.prospectRetention)}. Lorsqu’une relation contractuelle est conclue, les données nécessaires à l’exécution, à la facturation et à la défense des droits sont conservées selon les durées légales applicables : ${esc(legal.clientRetention)}.</p>
  <h2>Vos droits</h2><p>Vous pouvez demander l’accès, la rectification, l’effacement ou la limitation de vos données et exercer, selon le fondement du traitement, vos droits d’opposition et de portabilité. Pour exercer vos droits : <a href="mailto:${legal.privacyContact}">${esc(legal.privacyContact)}</a>. Vous pouvez également introduire une réclamation auprès de la CNIL.</p>
  <h2>Contenus et services tiers</h2><p>Les vidéos YouTube intégrées ne sont pas chargées automatiquement : une action explicite est demandée avant l’activation du lecteur externe. Les polices Yrsa, Syne et DM Sans sont chargées via Google Fonts afin de respecter l’identité graphique du site ; votre navigateur contacte donc les serveurs de ce prestataire lors du chargement des polices. Les liens vers Instagram, YouTube et Calendly ouvrent les services concernés ; leurs propres politiques s’appliquent lorsque vous quittez nolanarc.com.</p>
  <h2>Sécurité</h2><p>Le site limite les données collectées au nécessaire et n’embarque pas d’outil publicitaire ou d’analytics tiers dans cette version. Les échanges avec les services externes restent soumis aux mesures de sécurité et aux conditions propres de ces prestataires.</p>
  <p class="legal-update">Dernière mise à jour : 13 août 2026.</p></article></main>` + footer();
}

export function cookiesPage(){
  return head({title:'Cookies et contenus externes — Nolan Arc',description:'Informations sur les cookies, traceurs et contenus externes utilisés sur nolanarc.com.',path:'/cookies/',bodyClass:'page-legal'}) + header() + `<main id="main-content" class="legal-page-shell">${legalNav}<article class="legal-content"><span class="eyebrow">Traceurs</span><h1>Cookies & contenus externes</h1>
  <h2>Principe</h2><p>Cette version de nolanarc.com n’utilise pas d’outil publicitaire, de profilage ni d’analytics tiers. Le site n’enregistre pas votre parcours dans le navigateur pour personnaliser la visite.</p>
  <h2>Vidéo YouTube</h2><p>Le lecteur vidéo externe n’est créé qu’après votre clic sur le bouton permettant de charger YouTube. Avant cette action, aucun iframe YouTube n’est présent dans la page. En activant le lecteur, votre navigateur communique avec YouTube et ce service peut traiter des informations conformément à ses propres règles.</p>
  <h2>Polices et liens externes</h2><p>Les polices Yrsa, Syne et DM Sans sont chargées via Google Fonts. Ce chargement crée une connexion vers les serveurs du fournisseur afin de récupérer les fichiers nécessaires. Les liens vers Instagram, YouTube et Calendly n’activent pas ces services tant que vous ne les ouvrez pas. Une fois le site tiers ouvert, ses propres règles en matière de cookies et de données personnelles s’appliquent.</p>
  <h2>Évolution du site</h2><p>Si un outil de mesure d’audience ou tout autre traceur non exempté devait être ajouté ultérieurement, le mécanisme de consentement devra être adapté avant son activation.</p>
  <p class="legal-update">Dernière mise à jour : 13 août 2026.</p></article></main>` + footer();
}

export function cgvPage(){
  const mediator = legal.mediator.name ? `${esc(legal.mediator.name)} — ${esc(legal.mediator.address)} — <a href="${esc(legal.mediator.website)}" rel="noreferrer">${esc(legal.mediator.website)}</a>` : `Coordonnées du médiateur de la consommation non encore renseignées. Pour toute réclamation préalable : <a href="mailto:${site.email}">${esc(site.email)}</a>.`;
  return head({title:'CGV — Nolan Arc',description:'Conditions générales de vente et de prestation de services Nolan Arc.',path:'/cgv/',bodyClass:'page-legal'}) + header() + `<main id="main-content" class="legal-page-shell">${legalNav}<article class="legal-content"><span class="eyebrow">Conditions commerciales</span><h1>Conditions générales de vente et de prestation de services</h1>
  <h2>1. Prestataire et champ d’application</h2><p>Les présentes conditions encadrent les prestations proposées par ${esc(site.legalName)}${legal.businessForm ? ` — ${esc(legal.businessForm)}` : ''}, sous l’identité professionnelle ${esc(site.name)}. Elles s’appliquent aux clients professionnels et, lorsqu’une prestation est conclue avec un consommateur, sous réserve des dispositions impératives du Code de la consommation. Le devis ou contrat accepté précise le périmètre du projet et prévaut sur les présentes conditions pour les modalités particulières.</p>
  <h2>2. Formation du contrat</h2><p>La prise de contact via le site ne vaut pas commande. Le contrat est formé lorsque le devis, bon de commande ou contrat transmis par Nolan Arc est accepté selon les modalités qui y sont indiquées. Le document accepté précise au minimum la nature de la mission, les livrables, le calendrier estimatif et le prix ou son mode de calcul.</p>
  <h2>3. Prix</h2><p>Les prestations sont principalement réalisées sur devis, en fonction du périmètre, de la durée de production, des livrables, des droits demandés et des frais éventuels. Lorsque le prix exact ne peut être calculé à l’avance, son mode de calcul et les frais connus sont communiqués avant l’engagement du client. Pour les consommateurs, les montants communiqués sont exprimés TTC lorsque la TVA est applicable.</p>
  <h2>4. Paiement</h2><p>${legalValue(legal.paymentTerms, 'Conditions de paiement à définir : échéancier, acompte éventuel et date d’exigibilité.')}</p><p><strong>Clients professionnels :</strong> pénalités de retard : ${legalValue(legal.latePenaltyB2B, 'Taux de pénalités de retard B2B à définir dans le respect du minimum légal.')}. Une indemnité forfaitaire de 40 € pour frais de recouvrement est due dans les conditions prévues par la loi. Escompte : ${legalValue(legal.discountTerms, 'Conditions d’escompte à définir, ou indiquer explicitement « aucun escompte ».')}.</p>
  <h2>5. Organisation, délais et collaboration</h2><p>Le calendrier est défini au devis et dépend notamment de la remise des éléments par le client, des validations, des disponibilités de tournage et des éventuels prestataires tiers. Les retards causés par l’absence de validation ou de fourniture des éléments nécessaires peuvent entraîner un décalage raisonnable du calendrier.</p>
  <h2>6. Modifications et validations</h2><p>Le nombre de versions, allers-retours et modifications inclus est celui prévu au devis. Toute demande hors périmètre peut faire l’objet d’un devis complémentaire avant exécution.</p>
  <h2>7. Annulation ou report</h2><p>${legalValue(legal.cancellationPolicy, 'Politique d’annulation/report et sort des sommes versées à définir selon votre pratique commerciale.')} Les droits impératifs du consommateur, notamment le droit de rétractation lorsqu’il s’applique, restent réservés.</p>
  <h2>8. Propriété intellectuelle et droit à l’image</h2><p>${legalValue(legal.ipPolicy, 'Étendue de la cession/licence : supports, durée, territoire, exclusivité et usages à définir dans le devis ou contrat.')} Les éléments appartenant au client ou à des tiers restent la propriété de leurs titulaires. Le client garantit disposer des autorisations nécessaires pour les éléments qu’il fournit et informe Nolan Arc des contraintes spécifiques liées au droit à l’image, aux marques ou aux lieux.</p>
  <h2>9. Droit de rétractation des consommateurs</h2><p>Lorsqu’un contrat de prestation est conclu à distance avec un consommateur et qu’aucune exception légale ne s’applique, celui-ci dispose en principe d’un délai de quatorze jours à compter de la conclusion du contrat pour exercer son droit de rétractation. Les modalités et un modèle de formulaire sont disponibles sur la page <a href="/retractation/">Rétractation</a>. Une exécution avant la fin du délai ne peut être organisée que dans le respect des conditions légales applicables.</p>
  <h2>10. Réclamations et médiation de la consommation</h2><p>Pour toute réclamation : <a href="mailto:${site.email}">${esc(site.email)}</a>. Lorsqu’un litige avec un consommateur n’a pas pu être résolu directement, le consommateur peut saisir gratuitement le médiateur de la consommation désigné par le prestataire : ${mediator}</p>
  <h2>11. Force majeure et responsabilité</h2><p>Aucune partie n’est responsable d’un retard ou d’une inexécution résultant d’un événement de force majeure au sens du droit français. La responsabilité de Nolan Arc s’apprécie au regard de la mission effectivement convenue, sans priver un consommateur des droits que la loi lui reconnaît.</p>
  <h2>12. Droit applicable et litiges</h2><p>Les contrats sont soumis au droit français, sous réserve des protections impératives dont bénéficie un consommateur. Pour les clients professionnels, les modalités de règlement des litiges peuvent être précisées dans le devis ou contrat. Aucune clause ne peut priver un consommateur des règles de compétence juridictionnelle qui lui sont applicables.</p>
  <p class="legal-update">Dernière mise à jour : 13 août 2026.</p></article></main>` + footer();
}

export function withdrawalPage(){
  return head({title:'Rétractation — Nolan Arc',description:'Informations et modèle de formulaire de rétractation pour les contrats à distance conclus avec un consommateur.',path:'/retractation/',bodyClass:'page-legal'}) + header() + `<main id="main-content" class="legal-page-shell">${legalNav}<article class="legal-content"><span class="eyebrow">Consommateurs</span><h1>Droit de rétractation</h1>
  <h2>Principe</h2><p>Pour un contrat de prestation de services conclu à distance avec un consommateur, un droit de rétractation de quatorze jours à compter de la conclusion du contrat s’applique en principe, sauf exception prévue par la loi. Les conditions particulières applicables à votre projet sont rappelées avant la conclusion du contrat.</p>
  <h2>Demande d’exécution anticipée</h2><p>Si vous souhaitez que la prestation commence avant l’expiration du délai de rétractation, une demande expresse peut être nécessaire. Lorsque les conditions légales d’une perte du droit de rétractation sont réunies après exécution complète, une information et un accord spécifiques sont recueillis avant le commencement de la prestation.</p>
  <h2>Exercer votre droit</h2><p>Vous pouvez envoyer une déclaration dénuée d’ambiguïté à <a href="mailto:${site.email}">${esc(site.email)}</a>, ou utiliser le modèle ci-dessous.</p>
  <div class="withdrawal-model"><h3>Modèle de formulaire</h3><p>À l’attention de ${esc(site.legalName)}, ${legalValue(legal.registeredAddress)}, ${esc(site.email)} :</p><p>Je vous notifie par la présente ma rétractation du contrat portant sur la prestation suivante : […]</p><p>Contrat/devis accepté le : […]<br>Nom du consommateur : […]<br>Adresse du consommateur : […]<br>Date : […]<br>Signature (uniquement en cas de formulaire papier) : […]</p></div>
  <p class="legal-update">Dernière mise à jour : 13 août 2026.</p></article></main>` + footer();
}

export function notFoundPage(){
  return head({title:'404 — Nolan Arc',description:'Cette page n’existe pas.',path:'/404/',bodyClass:'page-404'}) + header() + `<main id="main-content" class="not-found"><span>404</span><h1>Ce plan<br><em>n’existe pas.</em></h1><a class="button" href="/work/">Retour au Work <span>↗</span></a></main>` + footer();
}
