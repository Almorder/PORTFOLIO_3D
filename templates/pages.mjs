import { site } from '../content/site.mjs';
import { projects } from '../content/projects.mjs';
import { notes } from '../content/journal.mjs';
import { legal } from '../content/legal.mjs';
import { head, header, footer, esc, projectMeta, lineToc, animatedStats, focusTestimonials, glassShowcase, stackedFlow, videoSlideShow, pageViewCounter, gradientMotionBackground, faqAccordion } from './components.mjs';

const bol = projects.find(p=>p.slug==='le-bol-den-face');
const visuals = {
  brand: 'https://images.unsplash.com/photo-1768076955015-dd4f057e96f6?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=66&w=2000',
  story: 'https://images.unsplash.com/photo-1709316132989-55ef2437b920?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=68&w=1600',
  moment: 'https://images.unsplash.com/photo-1770866381405-f47395dd2414?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=66&w=2000'
};

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
  {name:'Sony', role:'Boîtiers · optiques', logo:'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg'},
  {name:'Sigma', role:'Optiques', logo:'https://upload.wikimedia.org/wikipedia/commons/8/8f/Sigma%27s_new_updated_logo_revealed%2C_February_2025.svg'},
  {name:'Adobe', role:'Post-production', logo:'https://upload.wikimedia.org/wikipedia/commons/f/fe/Adobe_Logo_Standard.svg'},
  {name:'NiSi', role:'Filtres', logo:'https://images.squarespace-cdn.com/content/v1/5abbd54bd274cb288dbee575/1580147234198-OZKG3ETPSV8IJXDIYUFM/NiSi-logo-2018-01%403x-1.png'},
  {name:'SmallRig', role:'Rig · lumière · accessoires', logo:'https://www.smallrigreseller.com/img/static/smallrig-logo.png'},
  {name:'PGYTECH', role:'Workflow média', logo:'https://cdn.shopify.com/s/files/1/0252/2395/4525/files/header_logo.png?height=628&pad_color=ffffff&v=1681727276&width=1200'}
];


export function homePage(){
  const stats = site.proofStats;
  return head({
    title:'Nolan Arc — Réalisation, direction artistique & stratégie',
    description:'Portfolio de Nolan Ribeiro : réalisation photo/vidéo, direction artistique et stratégie de marque.',
    path:'/', bodyClass:'page-home page-fabrica page-v16'
  }) + header('/') + `
  <main id="main-content" class="v16-home">
    <section class="v16-hero" aria-labelledby="v16-hero-title">
      <div class="v16-hero__media" aria-hidden="true"><img src="${visuals.brand}" alt="" fetchpriority="high"><div class="v16-hero__veil"></div>${gradientMotionBackground({style:'mesh',speed:24,blur:86,opacity:.17,size:130,colors:['#17100d','#5f2812','#12100f','#2b1710']})}</div>
      <h1 class="sr-only" id="v16-hero-title">Nolan Arc — réalisation, direction artistique et stratégie de marque</h1>
      <div class="v16-hero__roles" aria-label="Expertises"><span>Réalisation</span><span>Direction artistique</span><span>Stratégie de marque</span></div>
      <div class="v16-hero__actions"><a href="#work-preview">Voir le Work <span>↘</span></a><a href="#quick-contact">Parler d’un projet <span>↗</span></a></div>
      <span class="v16-hero__copyright">© 2026 Nolan Arc</span>
    </section>

    <section class="fab-projects v16-work-preview" id="work-preview">
      <header class="fab-section-heading motion-reveal"><div><small>(01)</small><h2>Work.</h2><span>sélection</span></div><p>Le projet parle d’abord. Si vous voulez aller plus loin, la fiche donne simplement mon rôle, le contexte et les choix qui ont compté.</p></header>
      <div class="fab-project-grid">
        <a class="fab-project-card fab-project-card--wide motion-reveal" href="/projet/le-bol-den-face/"><div class="fab-project-card__meta"><strong>Le bol d’en face.</strong><span>/2026</span><i>Réalisation & scénario</i></div><figure><img src="${bol.poster}" alt="Le bol d’en face — court métrage" loading="eager"><span>Voir le film ↗</span></figure></a>
        <a class="fab-project-card motion-reveal" href="/services/?expertise=direction"><div class="fab-project-card__meta"><strong>Ouilove Proposal.</strong><span>/2024</span><i>Direction artistique</i></div><figure><img src="${visuals.brand}" alt="Illustration temporaire du projet Ouilove Proposal" loading="lazy"><span>Voir le contexte ↗</span></figure></a>
        <a class="fab-project-card motion-reveal" href="/services/?expertise=strategie"><div class="fab-project-card__meta"><strong>A One Permis.</strong><span>/2024</span><i>Contenu & stratégie</i></div><figure><img src="${visuals.story}" alt="Illustration temporaire du projet A One Permis" loading="lazy"><span>Voir le contexte ↗</span></figure></a>
        <a class="fab-project-card motion-reveal" href="/services/?expertise=realisation"><div class="fab-project-card__meta"><strong>Moments.</strong><span>/2025</span><i>Réalisation</i></div><figure><img src="${visuals.moment}" alt="Illustration temporaire de films de moments" loading="lazy"><span>Voir le contexte ↗</span></figure></a>
      </div>
      <div class="fab-projects__more"><a class="fab-arrow-link" href="/work/">Tout le Work <span>↗</span></a></div>
    </section>

    <section class="v16-proof" aria-labelledby="v16-proof-title">
      <header class="v16-proof__head motion-reveal"><span class="fab-dot-label">Repères</span><h2 id="v16-proof-title">Quelques chiffres pour situer le niveau d’expérience.</h2></header>
      ${animatedStats(stats,{theme:'light',layout:'grid',replay:true,animation:'blur'})}
      <p class="v16-proof__note motion-reveal">Le +105 % correspond à une croissance de chiffre d’affaires observée sur Ouilove ; ce n’est pas une promesse généralisée à tous les projets.</p>
    </section>

    <section class="v16-dimensions" id="dimensions">
      <header class="fab-section-heading motion-reveal"><div><small>(03)</small><h2>Trois dimensions.<br><em>Une seule vision.</em></h2></div><p>Vous pouvez me solliciter pour une seule expertise. Les deux autres continuent malgré tout d’influencer mes décisions.</p></header>
      <div class="v16-dimensions__grid">
        ${expertiseTabs.map(x=>`<article class="v16-dimension motion-reveal"><span>${x.index}</span><h3>${x.label}</h3><p>${x.text}</p><strong>${x.value}</strong><a href="${x.href}">Voir l’expertise ↗</a></article>`).join('')}
      </div>
    </section>

    <section class="v16-journey scroll-scene" data-scene="journey" id="journey">
      <div class="v16-journey__sticky">
        <div class="v16-journey__copy">
          <span class="fab-dot-label">Une même direction du début à la fin</span>
          <div class="v16-journey__steps">
            <article data-journey-step class="is-active"><small>01</small><h2>Comprendre.</h2><p>Quel résultat le projet doit réellement produire.</p></article>
            <article data-journey-step><small>02</small><h2>Choisir.</h2><p>Les décisions qui servent cet objectif — pas celles qui décorent.</p></article>
            <article data-journey-step><small>03</small><h2>Tenir le fil.</h2><p>Préserver cette direction entre stratégie, production et livraison.</p></article>
          </div>
        </div>
        <div class="v16-journey__visual">${glassShowcase([visuals.brand,bol.poster,visuals.moment])}<span class="v16-journey__count" data-journey-count>01 / 03</span></div>
      </div>
    </section>

    <section class="brand-ecosystem v16-ecosystem motion-reveal" aria-labelledby="brand-ecosystem-title">
      <div class="brand-ecosystem__head"><span class="fab-dot-label">Écosystème de production</span><h2 id="brand-ecosystem-title">Des outils que je connais vraiment sur le terrain.</h2><p>Matériel de prise de vue, optiques, accessoires et post-production. Ce bloc montre mon environnement de travail, pas une liste de clients.</p></div>
      <div class="brand-ecosystem__grid v16-logo-grid" aria-label="Marques et outils de production">${ecosystem.map(b=>`<div class="v16-logo-card">${b.logo?`<img src="${b.logo}" alt="Logo ${b.name}" loading="lazy" referrerpolicy="no-referrer">`:`<strong class="v16-wordmark">${b.wordmark}</strong>`}<small>${b.role}</small></div>`).join('')}</div>
    </section>

    <section class="home-pricing v16-pricing motion-reveal" id="pricing" data-pricing-switcher>
      <div class="home-pricing__backdrop" aria-hidden="true"><img src="${visuals.moment}" alt=""><i></i></div>
      <div class="v16-pricing__intro"><span class="fab-dot-label">Tarifs</span><h2>Un ordre de grandeur<br><em>avant de parler.</em></h2><p>Mon temps et mon travail ont un prix. Les projets plus larges restent sur devis, mais vous devez pouvoir savoir rapidement si l’on joue dans la même zone.</p></div>
      <div class="v16-pricing__tabs" role="tablist" aria-label="Choisir une offre"><button type="button" role="tab" aria-selected="true" data-pricing-tab="wedding">Mariage</button><button type="button" role="tab" aria-selected="false" data-pricing-tab="direction">Direction artistique</button><button type="button" role="tab" aria-selected="false" data-pricing-tab="strategy">Stratégie de marque</button></div>
      <div class="v16-pricing__panels">
        <article data-pricing-panel="wedding" class="is-active"><small>Film de mariage</small><strong>À partir de 1 500 €</strong><ul><li><b>30 min</b><span>film final</span></li><li><b>12 h → 00 h</b><span>couverture de la journée</span></li><li><b>Sur devis</b><span>options et besoins supplémentaires</span></li></ul><a href="/contact/?intent=moment">Parler du mariage ↗</a></article>
        <article data-pricing-panel="direction" hidden><small>Direction artistique</small><strong>À partir de 200 €</strong><p>Minimum pour un projet ciblé. Le périmètre et les livrables évoluent ensuite selon ce qu’il faut créer, corriger ou harmoniser.</p><a href="/contact/?intent=brand">Présenter le projet ↗</a></article>
        <article data-pricing-panel="strategy" hidden><small>Conseil en stratégie de marque</small><strong>89 € / heure</strong><p>Audit, priorisation ou session de travail ciblée. Les accompagnements plus larges sont chiffrés sur devis.</p><a href="/contact/?intent=brand">Réserver une session ↗</a></article>
      </div>
    </section>

    <section class="v16-testimonials" id="retours">
      <header class="fab-section-heading motion-reveal"><div><small>(03)</small><h2>Retours.</h2></div><p>Des phrases reçues après le travail. Pas une note de plateforme inventée.</p></header>
      <div class="v16-testimonial-bento">${site.testimonials.map((t,i)=>`<article class="motion-reveal ${i===0?'is-featured':''}"><div class="v16-stars" aria-label="Retour client positif">★★★★★</div><blockquote>« ${esc(t.quote)} »</blockquote><footer><strong>${esc(t.name)}</strong><span>${esc(t.role)}</span></footer></article>`).join('')}</div>
    </section>

    ${faqAccordion(site.faqs.home,{id:'faq-home',eyebrow:'FAQ',title:'FAQ.',intro:'Les réponses utiles avant de passer à l’étape suivante.'})}

    <section class="v16-quick-contact motion-reveal" id="quick-contact">
      <form class="v16-quick-contact__form" data-contact-form action="https://formsubmit.co/ajax/${site.email}" method="POST">
        <input type="text" name="_honey" tabindex="-1" autocomplete="off" class="honeypot"><input type="hidden" name="_subject" value="Message rapide — nolanarc.com"><input type="hidden" name="_url" value="https://nolanarc.com/"><input type="hidden" name="_template" value="table">
        <small>Nolan.Arc</small><h2>Un message suffit.</h2>
        <label><span>Nom</span><input required name="nom" autocomplete="name" placeholder="Votre nom"></label>
        <label><span>Email</span><input required type="email" name="email" autocomplete="email" placeholder="vous@exemple.com"></label>
        <label><span>Message</span><textarea required name="message" rows="4" placeholder="Ce que vous préparez, même si c’est encore flou."></textarea></label>
        <button type="submit" data-submit>Envoyer <span>↗</span></button><p class="form-status" role="status" data-form-status></p><p class="v16-contact-privacy">Vos informations servent uniquement à répondre à votre message. <a href="/confidentialite/">Confidentialité</a>.</p>
      </form>
      <div class="v16-quick-contact__copy">${gradientMotionBackground({style:'radial',speed:22,blur:84,opacity:.28,size:126,colors:['#CC460C','#E97736','#2B1710','#080706']})}<span class="fab-dot-label">Contact direct</span><h2>Parlons.</h2><p>Vous pouvez arriver avec un brief précis ou simplement une idée. Les deux me vont.</p><div class="v16-contact-points"><div><strong>Réponse généralement sous 48 h</strong><span>Je reviens avec les premières questions utiles.</span></div><div><strong>Une suite claire</strong><span>Si le projet colle, on définit ce qu’il faut faire et dans quel ordre.</span></div></div><div class="v16-nolan-card"><div class="v16-nolan-card__photo"><img src="/assets/nolan-portrait.jpg" alt="Portrait de Nolan Ribeiro" loading="lazy"></div><div><strong>Nolan Ribeiro</strong><span>Réalisation · DA · stratégie</span><a href="mailto:${site.email}">${site.email}</a></div></div></div>
    </section>
  </main>` + footer();
}

export function workPage(){
  const filmSlides=[
    { videoId: bol.videoId, start: 0, poster: bol.poster, position: '42% center', kicker: '01', title: 'Ouverture' },
    { videoId: bol.videoId, start: 12, poster: bol.poster, position: '35% center', kicker: '02', title: 'Le repas' },
    { videoId: bol.videoId, start: 24, poster: bol.poster, position: '50% center', kicker: '03', title: 'Les indices' },
    { videoId: bol.videoId, start: 36, poster: bol.poster, position: '62% center', kicker: '04', title: 'Le silence' },
    { videoId: bol.videoId, start: 48, poster: bol.poster, position: '72% center', kicker: '05', title: 'La résolution' },
  ];
  return head({title:'Work — Nolan Arc', description:'Films et projets sélectionnés de Nolan Ribeiro.', path:'/work/', bodyClass:'page-work page-fabrica page-v16'}) + header('/work/') + `<main id="main-content" class="fab-work-page v16-work-page">
    <section class="fab-page-title motion-reveal"><div><span>(04)</span><h1>Work.</h1><small>sélection</small></div><p>Le projet passe avant le discours. Ouvrez ce qui vous intéresse ; les fiches gardent seulement le contexte utile.</p></section>
    ${videoSlideShow(filmSlides,{autoplay:true,interval:5600,muted:true,sectionId:'work-reels',eyebrow:'En mouvement',heading:'Le film avant l’explication.',intro:'Faites glisser les cartes. Plus le geste est rapide, plus le carrousel prend de l’inertie.'})}
    <section class="fab-work-grid v16-project-gallery">
      <a class="fab-project-card fab-project-card--wide motion-reveal" href="/projet/le-bol-den-face/"><div class="fab-project-card__meta"><strong>Le bol d’en face.</strong><span>/2026</span><i>Réalisation & scénario</i></div><figure><img src="${bol.poster}" alt="Le bol d’en face — court métrage" loading="eager"><span>Voir le film ↗</span></figure></a>
      <a class="fab-project-card motion-reveal" href="/services/?expertise=direction"><div class="fab-project-card__meta"><strong>Ouilove Proposal.</strong><span>/2024</span><i>Direction artistique</i></div><figure><img src="${visuals.brand}" alt="Illustration temporaire Ouilove Proposal" loading="lazy"><span>Voir le contexte ↗</span></figure></a>
      <a class="fab-project-card motion-reveal" href="/services/?expertise=strategie"><div class="fab-project-card__meta"><strong>A One Permis.</strong><span>/2024</span><i>Contenu & stratégie</i></div><figure><img src="${visuals.story}" alt="Illustration temporaire A One Permis" loading="lazy"><span>Voir le contexte ↗</span></figure></a>
      <a class="fab-project-card motion-reveal" href="/services/?expertise=realisation"><div class="fab-project-card__meta"><strong>Moments.</strong><span>/2025</span><i>Réalisation</i></div><figure><img src="${visuals.moment}" alt="Illustration temporaire Films de moments" loading="lazy"><span>Voir le contexte ↗</span></figure></a>
    </section>
    <section class="v16-expertise-switcher motion-reveal" data-expertise-switcher>
      <header><span class="fab-dot-label">Trois casquettes</span><h2>Choisissez celle qui vous concerne.</h2></header>
      <div class="v16-expertise-tabs" role="tablist">${expertiseTabs.map((x,i)=>`<button type="button" role="tab" data-expertise-tab="${x.key}" aria-selected="${i===0?'true':'false'}"><span>${x.index}</span>${x.label}</button>`).join('')}</div>
      <div class="v16-expertise-panels">${expertiseTabs.map((x,i)=>`<article data-expertise-panel="${x.key}"${i?' hidden':''}><small>${x.label}</small><h3>${x.headline}</h3><p>${x.text}</p><strong>${x.value}</strong><a href="${x.href}">Voir comment j’interviens ↗</a></article>`).join('')}</div>
    </section>
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
  return head({title:'Services — Nolan Arc',description:'Réalisation, direction artistique et stratégie de marque par Nolan Ribeiro.',path:'/services/',bodyClass:'page-services page-fabrica page-v16'}) + header('/services/') + `<main id="main-content" class="v16-services-page">
    <section class="fab-page-title motion-reveal"><div><span>(03)</span><h1>Services.</h1><small>3 expertises</small></div><p>Trois expertises que je peux utiliser séparément ou réunir dans le même projet.</p></section>
    <section class="v16-service-switcher" data-expertise-switcher data-expertise-query>
      <div class="v16-service-switcher__tabs" role="tablist">${expertiseTabs.map((x,i)=>`<button type="button" role="tab" data-expertise-tab="${x.key}" aria-selected="${i===0?'true':'false'}"><span>${x.index}</span><strong>${x.label}</strong></button>`).join('')}</div>
      <div class="v16-service-switcher__panels">
        <article data-expertise-panel="realisation" class="is-active"><div class="v16-service-copy"><span class="fab-dot-label">Réalisation & vidéo</span><h2>Une seule direction du concept au fichier final.</h2><p>Je peux prendre un film de l’idée au rendu : préparation, production, montage, encodage et livraison restent reliés par la même vision. L’intérêt est simple : moins de pertes entre les étapes et un tournage pensé aussi pour ce qui devra fonctionner au montage.</p><strong>Vous gagnez une continuité de vision, une expertise terrain et des livrables correctement adaptés à leur support.</strong><a href="/contact/?intent=story">Parler d’une réalisation ↗</a></div><figure><img src="${bol.poster}" alt="Le bol d’en face — réalisation Nolan Ribeiro" loading="lazy"></figure></article>
        <article data-expertise-panel="direction" hidden><div class="v16-service-copy"><span class="fab-dot-label">Direction artistique</span><h2>Un univers doit tenir du premier au dernier détail.</h2><p>Je travaille le cadre visuel d’un projet pour que l’image, la typographie, la couleur, le rythme et la matière racontent la même chose. Même lorsque je n’exécute pas tout moi-même, je peux poser les règles qui permettent à l’équipe de rester cohérente.</p><strong>Vous gagnez une identité plus reconnaissable et des décisions créatives plus simples à reproduire.</strong><a href="/contact/?intent=brand">Parler d’une direction artistique ↗</a></div><figure><img src="${visuals.brand}" alt="Illustration d’une direction artistique" loading="lazy"></figure></article>
        <article data-expertise-panel="strategie" hidden><div class="v16-service-copy"><span class="fab-dot-label">Stratégie de marque & contenu</span><h2>Une stratégie utile doit finir par devenir une action.</h2><p>J’audite ce qui bloque aujourd’hui, je priorise ce qui peut créer un impact rapidement et je construis un plan que l’on peut réellement exécuter. Ensuite on mesure, on stabilise ce qui fonctionne et on augmente l’échelle.</p><strong>Vous gagnez des priorités plus nettes, moins d’attente entre la décision et l’exécution, et une création reliée au marché.</strong><a href="/contact/?intent=brand">Parler de stratégie ↗</a></div><figure><img src="${visuals.story}" alt="Illustration de stratégie de marque" loading="lazy"></figure></article>
      </div>
    </section>
    <section class="v16-combined-expertise motion-reveal"><span class="fab-dot-label">Pourquoi les trois comptent</span><h2>Même quand vous n’en achetez qu’une,<br><em>les autres restent dans la pièce.</em></h2><div><article><span>01</span><strong>Un film de marque</strong><p>La stratégie définit ce qu’il doit accomplir, la direction artistique ce à quoi il doit ressembler, la réalisation comment le produire.</p></article><article><span>02</span><strong>Une direction artistique</strong><p>Elle bénéficie d’une compréhension réelle de ce qui sera faisable sur un plateau et au montage.</p></article><article><span>03</span><strong>Une stratégie</strong><p>Elle reste reliée aux contenus et aux supports que l’entreprise devra réellement produire ensuite.</p></article></div></section>
    ${faqAccordion(site.faqs.services,{id:'faq-services',eyebrow:'FAQ Services',title:'FAQ.',intro:'Questions précises sur la manière dont je peux intervenir.'})}
    <section class="fab-contact-band motion-reveal"><div><small>Vous savez ce qu’il vous faut ?</small><h2>On cadre le périmètre.</h2></div><p>Un message suffit pour vérifier si je suis la bonne personne et sous quelle forme intervenir.</p><a href="/contact/">M’expliquer le projet <span>↗</span></a></section>
  </main>` + footer();
}

export function aboutPage(){
  return head({title:'À propos — Nolan Arc',description:'Nolan Ribeiro : parcours, curiosité et manière de travailler.',path:'/a-propos/',bodyClass:'page-about page-fabrica page-v16'}) + header('/a-propos/') + `<main id="main-content" class="v16-about-page">
    <section class="v16-about-hero" id="nolan"><figure><img src="/assets/nolan-portrait.jpg" alt="Portrait de Nolan Ribeiro" data-nolan-portrait></figure><div><span class="fab-dot-label">Nolan Ribeiro</span><h1>Nolan.</h1><p>Réalisateur, directeur artistique et stratège de marque. Trois disciplines différentes, mais une même façon de regarder un projet : comprendre ce qui compte avant de choisir comment le montrer.</p></div></section>
    <section class="v16-about-story motion-reveal"><span class="fab-dot-label">Le point de départ</span><h2>Curieux par nature.</h2><p>Je passe facilement d’un sujet à un autre parce que j’aime comprendre comment les choses fonctionnent et pourquoi certaines réussissent mieux que d’autres. Entrer dans un nouvel univers n’est pas une contrainte pour moi : c’est généralement la partie qui m’intéresse le plus.</p><p>Quand un sujet devient une vraie passion, apprendre n’est plus un effort. C’est ce qui m’a amené à développer plusieurs façons de regarder le même problème — par l’image, par la direction d’un univers et par la stratégie.</p></section>
    <section class="v16-about-why"><header class="fab-section-heading motion-reveal"><div><small>(03)</small><h2>Pourquoi ces trois disciplines ?</h2></div><p>Les détails sont dans Services. Ici, le plus important est pourquoi elles se sont retrouvées au même endroit.</p></header><div>${expertiseTabs.map(x=>`<article class="motion-reveal"><span>${x.index}</span><h3>${x.label}</h3><p>${x.key==='realisation'?'Parce que j’aime construire et donner vie à une idée.':x.key==='direction'?'Parce que j’aime les univers qui tiennent ensemble.':'Parce que créer quelque chose de beau qui ne sert pas le projet ne m’intéresse pas.'}</p></article>`).join('')}</div></section>
    <section class="v16-about-workstyle motion-reveal"><span class="fab-dot-label">Travailler avec moi</span><h2>Direct. Curieux. Autonome.</h2><div><p>Quand la direction est claire, j’aime avancer vite. Je préfère une décision appliquée puis mesurée à une longue phase d’attente qui n’améliore pas le résultat.</p><p>Je peux aussi entrer dans un projet déjà lancé, travailler avec une équipe existante ou prendre davantage de responsabilités quand il faut garder une cohérence de bout en bout.</p></div></section>
    <section class="fab-about-quote motion-reveal"><small>Vu de l’extérieur</small><blockquote>« Il ne se contente pas de filmer. Il réfléchit à ce qu’il veut raconter et pourquoi. »</blockquote><span>Matthieu · Ouilove Proposal</span></section>
    <section class="fab-contact-band motion-reveal"><div><small>Deux façons de continuer</small><h2>Regarder ou parler.</h2></div><p>Le Work montre ce que je produis. Le contact permet de voir ce que cela peut devenir dans votre contexte.</p><div class="fab-contact-band__actions"><a href="/work/">Voir le Work <span>↗</span></a><a href="/contact/">Parler du projet <span>↗</span></a></div></section>
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
  return head({title:'Contact — Nolan Arc',description:'Parler d’un projet à Nolan Ribeiro.',path:'/contact/',bodyClass:'page-contact page-fabrica page-v16'}) + header('/contact/') + `<main id="main-content" class="v16-contact-page">
    <section class="v16-contact-split">
      <form class="v16-contact-card motion-reveal" data-contact-form action="https://formsubmit.co/ajax/${site.email}" method="POST">
        <input type="text" name="_honey" tabindex="-1" autocomplete="off" class="honeypot"><input type="hidden" name="_subject" value="Nouveau projet — nolanarc.com"><input type="hidden" name="_url" value="https://nolanarc.com/contact/"><input type="hidden" name="_template" value="table">
        <small>Nolan.Arc</small><h1>Un projet en tête ?</h1>
        <label><span>Votre nom</span><input required name="nom" autocomplete="name" placeholder="Votre nom"></label>
        <label><span>Email</span><input required type="email" name="email" autocomplete="email" placeholder="vous@exemple.com"></label>
        <label><span>Message</span><textarea required name="message" rows="5" placeholder="Votre message"></textarea></label>
        <details><summary>Ajouter des précisions <span>optionnel</span></summary><div><label><span>Type de projet</span><select name="type_de_projet"><option>Réalisation</option><option>Direction artistique</option><option>Stratégie de marque</option><option>Autre</option></select></label><label><span>Entreprise</span><input name="entreprise" autocomplete="organization"></label><label><span>Budget</span><select name="budget"><option value="">À définir</option><option>&lt; 500 €</option><option>500 – 1 500 €</option><option>1 500 – 3 000 €</option><option>3 000 € +</option></select></label></div></details>
        <button type="submit" data-submit>Envoyer <span>↗</span></button><p class="form-status" role="status" data-form-status></p><p class="v16-contact-privacy">En envoyant, vous acceptez que les informations servent uniquement à répondre à votre demande. <a href="/confidentialite/">Confidentialité</a>.</p>
      </form>
      <div class="v16-contact-story">${gradientMotionBackground({style:'diamond',speed:20,blur:88,opacity:.34,size:130,colors:['#E97736','#CC460C','#2B1710','#080706']})}<span class="fab-dot-label">Contact</span><h2>Parlons.</h2><p>Un brief précis ou juste le début d’une réflexion : les deux me vont.</p><div class="v16-contact-story__points"><article><strong>Réponse généralement sous 48 h</strong><p>Je reviens avec les premières questions utiles.</p></article><article><strong>Une suite claire</strong><p>Si le projet colle, on cadre les livrables, le calendrier, le prix et les droits.</p></article></div><div class="v16-nolan-card v16-nolan-card--contact"><div class="v16-nolan-card__photo"><img src="/assets/nolan-portrait.jpg" alt="Portrait de Nolan Ribeiro"></div><div><strong>Nolan Ribeiro</strong><span>Réalisation · DA · stratégie</span><a href="mailto:${site.email}">${site.email}</a><a href="${site.calendly}" target="_blank" rel="noreferrer">30 min ensemble ↗</a></div></div></div>
    </section>
    ${faqAccordion(site.faqs.contact,{id:'faq-contact',eyebrow:'FAQ Contact',title:'FAQ.',intro:'Les dernières questions avant d’envoyer votre message.'})}
  </main>` + footer();
}

const legalNav = `<nav class="legal-tabs" aria-label="Pages légales"><a href="/mentions-legales/">Mentions</a><a href="/confidentialite/">Confidentialité</a><a href="/cgv/">CGV</a><a href="/cookies/">Cookies</a><a href="/retractation/">Rétractation</a></nav>`;

const legalValue = (value, fallback='À compléter avant publication') => value ? esc(value) : `<strong class="legal-missing">${fallback}</strong>`;

export function legalPage(){
  const vat = legal.vat ? esc(legal.vat) : 'Non renseigné / à confirmer selon le régime fiscal réel';
  return head({title:'Mentions légales — Nolan Arc',description:'Mentions légales du site Nolan Arc.',path:'/mentions-legales/',bodyClass:'page-legal'}) + header() + `<main id="main-content" class="legal-page-shell">${legalNav}<article class="legal-content"><span class="eyebrow">Informations légales</span><h1>Mentions légales</h1>
  <h2>Éditeur du site</h2><p><strong>${esc(site.legalName)}</strong>${legal.businessForm ? ` — ${esc(legal.businessForm)}` : ''}, exerçant sous l’identité professionnelle <strong>${esc(site.name)}</strong>.<br>Email : <a href="mailto:${site.email}">${esc(site.email)}</a>.<br>SIREN : ${legalValue(legal.siren)}.<br>SIRET : ${legalValue(legal.siret)}.<br>Code APE : ${legalValue(legal.ape)}.<br>TVA : ${vat}.</p>
  <h2>Directeur de la publication</h2><p>${esc(legal.publicationDirector)}.</p>
  <h2>Hébergement</h2><p>${esc(legal.host.name)}, ${esc(legal.host.address)} — <a href="${esc(legal.host.website)}" rel="noreferrer">${esc(legal.host.website)}</a>.</p>
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
  <div class="withdrawal-model"><h3>Modèle de formulaire</h3><p>À l’attention de ${esc(site.legalName)}, ${esc(site.email)} :</p><p>Je vous notifie par la présente ma rétractation du contrat portant sur la prestation suivante : […]</p><p>Contrat/devis accepté le : […]<br>Nom du consommateur : […]<br>Adresse du consommateur : […]<br>Date : […]<br>Signature (uniquement en cas de formulaire papier) : […]</p></div>
  <p class="legal-update">Dernière mise à jour : 13 août 2026.</p></article></main>` + footer();
}

export function notFoundPage(){
  return head({title:'404 — Nolan Arc',description:'Cette page n’existe pas.',path:'/404/',bodyClass:'page-404'}) + header() + `<main id="main-content" class="not-found"><span>404</span><h1>Ce plan<br><em>n’existe pas.</em></h1><a class="button" href="/work/">Retour au Work <span>↗</span></a></main>` + footer();
}
