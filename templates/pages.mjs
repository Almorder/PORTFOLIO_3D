import { site } from '../content/site.mjs';
import { projects } from '../content/projects.mjs';
import { notes } from '../content/journal.mjs';
import { legal } from '../content/legal.mjs';
import { head, header, footer, esc, projectMeta, placeholderVisual, logoPreloader, lineToc, animatedStats, focusTestimonials, glassShowcase, stackedFlow } from './components.mjs';

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
    path:'/', bodyClass:'page-home'
  }) + header('/') + logoPreloader() + `
  <main>
    <section class="home-hero scroll-scene" data-scene="hero">
      <div class="home-hero__sticky scene-sticky">
        <div class="home-hero__media" aria-hidden="true"><img src="${visuals.brand}" alt="" fetchpriority="high"><div class="home-hero__shade"></div></div>
        <div class="home-hero__copy motion-reveal">
          <span class="eyebrow">${site.role}</span>
          <h1>Je ne commence pas<br>par la caméra.<br><em>Je commence par l’intention.</em></h1>
          <p>Une marque à clarifier, une histoire à mettre en scène ou un moment à garder : je construis l’image autour de ce qui compte vraiment.</p>
          <div class="hero-actions"><a class="button" href="/work/">Voir le travail <span>↘</span></a><a class="text-link" href="/contact/">Parler du projet <span>↗</span></a></div>
        </div>
        <div class="home-hero__index"><span>01</span><span>Réalisateur · Direction artistique · Montage</span></div>
        <div class="orbit orbit--hero" aria-hidden="true"><i></i><i></i><i></i></div>
      </div>
    </section>

    <section class="trust-strip motion-reveal" aria-label="Collaborations">
      <span class="eyebrow">Collaborations</span>
      <div>${site.clients.map(esc).join('<i>·</i>')}</div>
    </section>

    ${animatedStats(site.proofStats)}

    <section class="project-rift" id="work-preview">
      <div class="project-rift__intro motion-reveal">
        <div class="project-rift__heading"><span class="eyebrow">Travail sélectionné</span><h2>Je préfère vous montrer<br><em>le travail d’abord.</em></h2></div>
        <div class="project-rift__context"><p>Vous voyez d’abord le résultat. Ensuite, je vous montre mon rôle et les décisions qui ont construit l’image.</p><a class="text-link" href="/work/">Voir tout le Work <span>↗</span></a></div>
      </div>
      <a class="project-slab project-slab--hero motion-reveal" href="/projet/le-bol-den-face/">
        <img src="${bol.poster}" alt="Le bol d’en face — court métrage" loading="lazy">
        <div class="project-slab__overlay"></div><div class="project-slab__number">01</div>
        <div class="project-slab__copy"><small>${bol.type} · ${bol.year}</small><strong>${bol.title}</strong><span>${bol.role}</span></div>
      </a>
      <div class="project-rift__satellites motion-reveal">
        <a href="/services/#ouilove-proof" class="satellite-link"><span>02</span><strong>Ouilove Proposal</strong><small>Direction artistique</small></a>
        <a href="/services/#marques" class="satellite-link"><span>03</span><strong>A One Permis</strong><small>Contenu social</small></a>
        <a href="/services/#moments" class="satellite-link"><span>04</span><strong>Moments</strong><small>Mariages · demandes · événements</small></a>
      </div>
    </section>

    <section class="journey scroll-scene" data-scene="journey">
      <div class="journey__sticky scene-sticky">
        <div class="journey__counter"><span>02</span><b data-journey-count>01 / 03</b></div>
        <div class="journey__stage">
          <div class="journey__object"><div class="journey__halo"></div>${glassShowcase([visuals.brand, visuals.story, visuals.moment])}<div class="journey__ring"></div></div>
          <article class="journey-copy is-active" data-journey-step="0"><small>COMPRENDRE</small><h2>Qu’est-ce que vous voulez<br><em>faire comprendre, ressentir ou garder ?</em></h2><p>C’est la question qui évite de tourner pour tourner.</p></article>
          <article class="journey-copy" data-journey-step="1"><small>CHOISIR</small><h2>Le cadre vient<br><em>après.</em></h2><p>Lumière, mouvement, son et rythme servent l’idée. Pas l’inverse.</p></article>
          <article class="journey-copy" data-journey-step="2"><small>TENIR LE FIL</small><h2>La même idée,<br><em>du brief au montage.</em></h2><p>Je garde la direction jusqu’au rendu final pour éviter qu’elle se dilue en route.</p></article>
        </div>
      </div>
    </section>

    <section class="entry-zone" id="services-preview">
      <div class="entry-zone__head motion-reveal"><div><span class="eyebrow">Votre projet</span><h2>Vous préparez<br><em>quoi ?</em></h2><p>Trois situations. Trois façons d’intervenir. Le format se décide ensuite.</p></div></div>
      <div class="entry-grid">
        <a class="entry-card motion-reveal" href="/services/#marques" style="--card-image:url('${visuals.brand}')"><span>01</span><small>MARQUE / ENTREPRISE</small><strong>Faire comprendre ma marque.</strong><p>Film, direction artistique ou contenu : clarifier le message et garder une image cohérente entre les supports.</p><i>Voir comment →</i></a>
        <a class="entry-card motion-reveal" href="/services/#recits" style="--card-image:url('${visuals.story}')"><span>02</span><small>RÉCIT / CRÉATION</small><strong>Mettre une histoire en scène.</strong><p>Écriture, mise en scène et réalisation pour donner une forme précise à une idée sans la perdre en production.</p><i>Voir les récits →</i></a>
        <a class="entry-card motion-reveal" href="/services/#moments" style="--card-image:url('${visuals.moment}')"><span>03</span><small>MOMENT / ÉVÉNEMENT</small><strong>Garder un moment.</strong><p>Préparer ce qui compte, filmer sans prendre la place, puis construire un souvenir que l’on a envie de revoir.</p><i>Voir les moments →</i></a>
      </div>
    </section>

    ${focusTestimonials(site.testimonials)}

    <section class="about-tease motion-reveal">
      <div class="about-tease__word">N</div>
      <div class="about-tease__copy"><span class="eyebrow">À propos</span><h2>Je n’aime pas<br>créer pour créer.</h2><p>J’ai passé du temps à comprendre ce qui avait vraiment du sens pour moi dans une image. Aujourd’hui, cette exigence me sert surtout à garder un fil clair dans les projets que l’on me confie.</p><a class="text-link" href="/a-propos/">Faire connaissance <span>↗</span></a></div>
    </section>

    <section class="finale motion-reveal motion-gradient">
      <span class="eyebrow">Un projet en tête ?</span><h2>Expliquez-moi<br>ce que vous préparez.</h2><p>Une idée, une date ou un problème à résoudre suffisent pour commencer.</p><a class="button button--light" href="/contact/">Écrire à Nolan <span>↗</span></a>
    </section>
  </main>` + footer();
}

export function workPage(){
  const verified = projects.filter(p=>p.status==='verified');
  const collaborations = projects.filter(p=>p.status!=='verified');
  return head({title:'Work — Nolan Arc', description:'Films, direction artistique et collaborations sélectionnées de Nolan Arc.', path:'/work/', bodyClass:'page-work'}) + header('/work/') + `<main>
    <section class="page-hero page-hero--work motion-reveal"><span class="eyebrow">Work</span><h1>Le travail,<br><em>sans détour.</em></h1><p>Le film d’abord. Puis mon rôle, le contexte et les choix qui ont réellement changé le résultat.</p></section>
    <section class="work-field" data-work-field>
      ${verified.map((p,i)=>`<article class="work-entry is-verified" data-territory="${p.territory}"><div class="work-entry__index">0${i+1}</div><a class="work-entry__visual" href="${p.href}"><img src="${p.poster}" alt="${esc(p.title)}" loading="lazy"></a><div class="work-entry__copy"><span>${p.territory} · ${p.year}</span><h2>${esc(p.title)}</h2><p>${esc(p.summary)}</p><small>${esc(p.role)}</small><a class="text-link" href="${p.href}">Voir le projet <span>↗</span></a></div></article>`).join('')}
    </section>
    <section class="work-collabs"><div class="work-collabs__intro motion-reveal"><span class="eyebrow">Autres collaborations</span><h2>D’autres contextes.<br>Le même besoin de cohérence.</h2><p>Direction artistique, contenu social ou moments personnels : le format change, mais je pars toujours de ce que le projet doit faire comprendre, ressentir ou garder.</p></div>${stackedFlow(collaborations.map((p)=>({href:p.href,kicker:p.type,title:p.title,text:p.summary,image:p.slug==='moments'?visuals.moment:(p.slug==='a-one-permis'?visuals.story:visuals.brand)})))}</section>
  </main>` + footer();
}

export function projectPage(){
  return head({title:`${bol.title} — Nolan Arc`, description:bol.summary, path:'/projet/le-bol-den-face/', image:bol.poster, bodyClass:'page-project'}) + header('/projet/le-bol-den-face/') + `<main>
    <section class="project-intro">
      <a class="back-link" href="/work/">← Work</a><span class="eyebrow">${bol.type} · ${bol.year}</span>
      <div class="project-intro__grid"><h1>${bol.title}</h1><div><p>${bol.summary}</p><span>${bol.role}</span></div></div>
    </section>
    ${lineToc([{id:'film',label:'Film'},{id:'story',label:'Intention'},{id:'next',label:'Suite'}])}
    <section class="project-film-first" id="film">
      <div class="external-media project-player ambient-video-player" data-ambient-player data-external-video data-video-id="${bol.videoId}" data-video-title="${bol.title}" style="--poster:url('${bol.poster}')">
        <div class="external-media__gate"><span class="eyebrow">Film · ${bol.year}</span><h2>Regarder<br>Le bol d’en face</h2><button class="button button--light hold-confirm" type="button" data-hold-confirm data-hold-ms="650" data-load-video><span>Maintenir pour lire</span><b aria-hidden="true">▶</b><i aria-hidden="true"></i></button></div>
      </div>
      <div class="project-meta-head"><span>Fiche du film</span><span class="page-view-counter" data-page-view-counter hidden><b>0</b> vues</span></div>
      ${projectMeta(bol)}
    </section>
    <section class="project-story" id="story">
      <div class="project-story__lead">
        <div class="project-story__heading"><span class="eyebrow">Intention</span><h2>${bol.intent}</h2></div>
        <div class="project-story__context"><p>${bol.contextText}</p></div>
      </div>
      <div class="project-story__decisions">${bol.decisions.map((d,i)=>`<article><span>0${i+1}</span><div><h3>${d.title}</h3><p>${d.text}</p></div></article>`).join('')}</div>
    </section>
    <section class="project-next" id="next"><span class="eyebrow">Continuer</span><a href="/work/"><small>Explorer</small><strong>Voir les autres travaux.</strong><span>↗</span></a><a href="/services/"><small>Comprendre</small><strong>Voir comment je peux intervenir.</strong><span>↗</span></a><a href="/contact/"><small>Commencer</small><strong>Me parler du projet.</strong><span>↗</span></a></section>
  </main>` + footer();
}

export function servicesPage(){
  return head({title:'Services — Nolan Arc',description:'Réalisation, direction artistique, contenu et films de moments par Nolan Arc.',path:'/services/',bodyClass:'page-services'}) + header('/services/') + `<main>
    <section class="services-hero motion-reveal motion-gradient"><span class="eyebrow">Services</span><h1>Vous n’avez pas besoin<br>de « plus de contenu ».<br><em>Vous avez besoin du bon.</em></h1><p>Je peux intervenir de la réflexion au montage. L’objectif n’est pas d’ajouter des images : c’est de résoudre le bon problème avec une direction que l’on peut tenir jusqu’au rendu.</p><nav class="services-jump" aria-label="Accès rapide aux services"><a href="#marques">Marques</a><a href="#recits">Récits</a><a href="#moments">Moments</a></nav></section>
    ${lineToc([{id:'marques',label:'Marques'},{id:'recits',label:'Récits'},{id:'moments',label:'Moments'}])}

    <section class="service-chapter service-chapter--brand" id="marques">
      <div class="service-chapter__head motion-reveal"><span class="eyebrow">01 · Marques & organisations</span><h2>Faire comprendre<br>avant de chercher à impressionner.</h2><p>Une vidéo ou une direction artistique n’a de valeur que si elle aide votre public à mieux comprendre, reconnaître ou retenir ce que vous faites.</p></div>
      <figure class="service-chapter__visual motion-reveal"><img src="${visuals.brand}" alt="Illustration d’une production audiovisuelle pour une marque" loading="lazy"></figure>
      <div class="service-value-list">
        <article class="motion-reveal"><span>01</span><div><small>Votre besoin</small><h3>Présenter une activité, une offre ou un positionnement.</h3></div><div><small>Je prends en charge</small><p>Concept, préparation, tournage et montage autour du message à retenir.</p></div><div><small>Ce que vous gagnez</small><p>Un film lisible, pensé pour présenter, rassurer, expliquer ou positionner.</p></div></article>
        <article class="motion-reveal"><span>02</span><div><small>Votre besoin</small><h3>Arrêter de changer de langage visuel d’un support à l’autre.</h3></div><div><small>Je prends en charge</small><p>Cadrage, lumière, couleur, typographie et rythme pour construire une direction commune.</p></div><div><small>Ce que vous gagnez</small><p>Des décisions plus simples à reproduire et une image plus reconnaissable.</p></div></article>
        <article class="motion-reveal"><span>03</span><div><small>Votre besoin</small><h3>Produire du contenu réellement utilisable.</h3></div><div><small>Je prends en charge</small><p>Les formats et déclinaisons sont pensés dès la préparation selon les usages prévus.</p></div><div><small>Ce que vous gagnez</small><p>Des livrables conçus pour leur canal, pas des recadrages improvisés après coup.</p></div></article>
      </div>
      <aside class="service-proof-card motion-reveal" id="ouilove-proof"><div><span class="eyebrow">Ouilove Proposal</span><h3>Direction artistique</h3><p>Une mission où la réflexion sur ce qu’il fallait raconter comptait autant que l’exécution visuelle.</p></div><blockquote>« Il ne se contente pas de filmer. Il réfléchit à ce qu’il veut raconter et pourquoi. »<cite>— Matthieu · Ouilove Proposal</cite></blockquote></aside>
      <a class="button" href="/contact/?intent=brand">Parler d’un projet de marque <span>↗</span></a>
    </section>

    <section class="service-chapter service-chapter--story" id="recits">
      <div class="service-chapter__head motion-reveal"><span class="eyebrow">02 · Récits & création</span><h2>Une idée n’a pas besoin<br>de plus d’effets.<br>Elle a besoin d’une direction.</h2><p>J’interviens sur l’écriture, la mise en scène et la réalisation pour que chaque scène apporte quelque chose à l’histoire.</p></div>
      <a class="service-feature motion-reveal" href="/projet/le-bol-den-face/"><img src="${bol.poster}" alt="Le bol d’en face — court métrage"><div><small>COURT MÉTRAGE · 2026</small><strong>Le bol d’en face</strong><p>Faire comprendre une absence sans l’expliquer frontalement. Le repas, les objets et les silences deviennent les indices.</p><span>Voir le film et les choix →</span></div></a>
    </section>

    <section class="service-chapter service-chapter--moment" id="moments">
      <div class="service-chapter__head motion-reveal"><span class="eyebrow">03 · Moments</span><h2>Préparer assez<br>pour vous laisser vivre le moment.</h2><p>Mariage, demande en mariage ou événement personnel : la préparation sert justement à avoir moins besoin d’intervenir le jour J.</p></div>
      <figure class="service-chapter__visual motion-reveal"><img src="${visuals.moment}" alt="Illustration d’un événement personnel filmé avec discrétion" loading="lazy"></figure>
      <div class="service-value-list service-value-list--dark">
        <article class="motion-reveal"><span>01</span><div><small>Avant</small><h3>Savoir ce qui ne doit pas être manqué.</h3></div><div><small>Je prends en charge</small><p>Déroulé, lieux, personnes et moments clés sont cadrés en amont.</p></div><div><small>Ce que vous gagnez</small><p>Moins de questions et moins d’interruptions le jour même.</p></div></article>
        <article class="motion-reveal"><span>02</span><div><small>Pendant</small><h3>Anticiper plutôt que faire rejouer.</h3></div><div><small>Je prends en charge</small><p>Je cherche les bonnes positions et les bons instants sans transformer la journée en tournage.</p></div><div><small>Ce que vous gagnez</small><p>Une présence plus discrète et des réactions qui restent naturelles.</p></div></article>
        <article class="motion-reveal"><span>03</span><div><small>Après</small><h3>Retrouver plus qu’une chronologie.</h3></div><div><small>Je prends en charge</small><p>Le montage relie voix, regards, gestes et détails autour de ce qui avait de la valeur.</p></div><div><small>Ce que vous gagnez</small><p>Un film qui fait remonter des détails que vous n’aviez pas forcément vus sur le moment.</p></div></article>
      </div>
      <blockquote class="service-quote motion-reveal">« Le résultat était pile comme je l’imaginais. » <cite>— Nawel & Yanis</cite></blockquote>
      <p class="service-practical">Déplacements selon le projet · réponse sous 48 h ouvrées · prix, livrables et droits définis au devis.</p>
      <a class="button" href="/contact/?intent=moment">Parler de votre moment <span>↗</span></a>
    </section>

    <section class="services-end motion-reveal"><h2>Vous ne savez pas encore<br>dans quelle case ranger le projet ?</h2><p>Ce n’est pas grave. Dites-moi simplement ce que vous voulez obtenir ou éviter.</p><a class="button button--light" href="/contact/">M’expliquer le projet <span>↗</span></a></section>
  </main>` + footer();
}

export function marquesPage(){ return servicesPage(); }

export function momentsPage(){ return servicesPage(); }

export function aboutPage(){
  return head({title:'À propos — Nolan Arc',description:'Nolan Ribeiro : parcours, manière de créer et ce que cette approche apporte aux projets.',path:'/a-propos/',bodyClass:'page-about'}) + header('/a-propos/') + `<main>
    <section class="about-story-hero motion-gradient" id="nolan">
      <div class="about-story-hero__portrait motion-reveal"><img src="/assets/nolan-portrait.jpg" alt="Portrait de Nolan Ribeiro" data-nolan-portrait><div class="about-story-hero__fallback" aria-hidden="true"><span>N</span><small>Ajoutez ici un portrait de Nolan</small></div></div>
      <div class="about-story-hero__copy motion-reveal"><span class="eyebrow">Nolan Ribeiro · réalisateur & directeur artistique</span><h1>Je n’aime pas forcément<br>faire de longs discours.<br><em>Mais j’aime parler quand il le faut.</em></h1><p class="about-hook">Moi, c’est Nolan. Depuis petit, ce qui m’attire, c’est de créer des vidéos, raconter mes propres histoires et mettre ma vision du monde en avant.</p><a class="text-link" href="#about-turn">Continuer <span>↓</span></a></div>
    </section>
    ${lineToc([{id:'nolan',label:'Nolan'},{id:'about-turn',label:'Déclic'},{id:'about-identity',label:'Regard'},{id:'about-value',label:'Valeur'}])}

    <section class="about-turn" id="about-turn">
      <div class="about-turn__statement motion-reveal"><span class="eyebrow">Le truc moins joli</span><h2>J’ai parfois passé plus de temps<br>à me structurer qu’à réellement créer.</h2></div>
      <div class="about-turn__copy motion-reveal"><p>J’aurais pu créer pour créer, produire des choses sans forcément réfléchir derrière. Mais si je ne trouve pas de sens dans quelque chose, si je ne ressens pas d’impact, j’ai du mal à le faire juste pour remplir.</p><p><strong>Ça m’a ralenti.</strong> Aujourd’hui, c’est aussi devenu une force dans mon travail : je cherche d’abord pourquoi une image doit exister avant de décider comment la produire.</p></div>
    </section>

    <section class="about-identity" id="about-identity">
      <div class="about-identity__visual motion-reveal"><div><small>CE QUI M’ATTIRE</small><strong>Les univers qui ont une identité, une histoire, quelque chose qui leur est propre.</strong></div></div>
      <div class="about-identity__copy motion-reveal"><span class="eyebrow">Ce qui relie mes goûts à mon travail</span><h2>Je peux passer d’un animé à un parfum de niche pour la même raison.</h2><p>Ce qui m’accroche n’est pas seulement le format ou ce qui est populaire. C’est l’univers derrière : sa personnalité, ses détails, sa cohérence.</p><p>Sur un projet, je cherche la même chose. <strong>Pas simplement faire « beau », mais trouver ce qui peut le rendre identifiable et juste pour son contexte.</strong></p></div>
    </section>

    <section class="about-client-value" id="about-value">
      <header class="motion-reveal"><span class="eyebrow">Et pour vous, concrètement ?</span><h2>Un seul fil<br>du besoin au rendu.</h2></header>
      <div class="about-client-value__list">
        <article class="motion-reveal"><span>01</span><h3>Avant</h3><p>On clarifie ce qu’il faut faire comprendre, ressentir ou garder. Ça évite de partir trop vite sur un format ou une idée qui répond mal au besoin.</p></article>
        <article class="motion-reveal"><span>02</span><h3>Pendant</h3><p>Le cadre, la lumière et la mise en scène restent reliés à cette intention. Les choix sont plus simples à défendre et plus cohérents entre eux.</p></article>
        <article class="motion-reveal"><span>03</span><h3>Après</h3><p>Je garde le même fil au montage et dans les livrables, pour éviter l’écart entre ce qui avait été imaginé et ce qui est finalement livré.</p></article>
      </div>
    </section>

    <section class="about-arc motion-reveal"><span class="eyebrow">Pourquoi « Arc » ?</span><div><h2>Parce qu’une image<br>n’est jamais seule.</h2><p>Il y a un point de départ, des choix, une évolution et un résultat. « Arc » me rappelle cette trajectoire : ce que l’on décide au début doit encore se sentir à la fin.</p></div></section>

    <section class="about-proof motion-reveal"><div><span class="eyebrow">Vu de l’extérieur</span><blockquote>« Il ne se contente pas de filmer. Il réfléchit à ce qu’il veut raconter et pourquoi. »<cite>— Matthieu · Ouilove Proposal</cite></blockquote></div><a class="button button--light" href="/work/">Voir le travail <span>↗</span></a></section>
  </main>` + footer();
}

export function journalPage(){
  return head({title:'Journal — Nolan Arc',description:'Notes pratiques de Nolan Arc sur la préparation, le cadrage et le montage.',path:'/journal/',bodyClass:'page-journal'}) + header('/journal/') + `<main>
    <section class="journal-hero motion-reveal"><span class="eyebrow">Journal</span><h1>Ce que je regarde<br><em>avant d’appuyer sur REC.</em></h1><p>Préparation, cadrage, rythme : des décisions concrètes que j’utilise pour éviter de tourner ou monter au hasard.</p></section>
    <section class="journal-stack">${notes.map((n,i)=>`<article id="${n.slug}" class="motion-reveal"><span>0${i+1}</span><small>${n.category} · ${n.date}</small><h2>${n.title}</h2><p>${n.excerpt}</p></article>`).join('')}</section>
  </main>` + footer();
}

export function contactPage(){
  return head({title:'Contact — Nolan Arc',description:'Parler d’un film, d’une direction artistique ou d’un moment à Nolan Arc.',path:'/contact/',bodyClass:'page-contact'}) + header('/contact/') + `<main>
    <section class="contact-hero contact-hero--compact motion-gradient"><span class="eyebrow">Contact</span><h1>Qu’est-ce que<br><em>vous préparez ?</em></h1><p>Pas besoin d’un brief parfait. Une idée, une date ou un problème à résoudre suffisent pour commencer.</p></section>
    <section class="contact-experience contact-experience--compact"><form class="contact-form contact-form--glass" data-contact-form action="https://formsubmit.co/ajax/${site.email}" method="POST"><input type="text" name="_honey" tabindex="-1" autocomplete="off" class="honeypot"><input type="hidden" name="_subject" value="Nouveau projet — nolanarc.com"><input type="hidden" name="_url" value="https://nolanarc.com/contact/"><input type="hidden" name="_template" value="table">
      <div class="contact-glass__head"><span class="eyebrow">Quel projet préparez-vous ?</span><div class="form-intent form-intent--pills"><button type="button" data-form-intent="brand">Film / image de marque</button><button type="button" data-form-intent="moment">Mariage / moment</button><button type="button" data-form-intent="story">Récit / collaboration</button><button type="button" data-form-intent="other">Autre projet</button><input type="hidden" name="type_de_projet" data-intent-input value="Autre"></div></div>
      <label class="contact-message"><span>Votre message</span><textarea required name="message" rows="5" placeholder="Le projet, la date si vous l’avez, le lieu et ce que vous attendez de moi…"></textarea></label>
      <div class="contact-fields contact-fields--essential"><label>Votre nom<input required name="nom" autocomplete="name" placeholder="Votre nom"></label><label>Votre email<input required type="email" name="email" autocomplete="email" placeholder="vous@exemple.com"></label></div>
      <details class="contact-more"><summary>Ajouter des précisions <span>optionnel</span></summary><div class="contact-fields"><label>Entreprise<input name="entreprise" autocomplete="organization" placeholder="Nom de l’entreprise"></label><label>Budget<select name="budget"><option value="">Pas encore défini</option><option>&lt; 1 500 €</option><option>1 500 – 3 000 €</option><option>3 000 – 7 500 €</option><option>7 500 € +</option></select></label></div></details>
      <div class="contact-submit contact-submit--compact"><button class="button button--light" type="submit" data-submit>Envoyer <span>↗</span></button><p class="form-privacy">Vos informations servent uniquement à répondre à votre demande. <a href="/confidentialite/">Confidentialité</a>.</p><p class="form-status" role="status" data-form-status></p></div>
    </form><aside class="contact-direct contact-direct--glass"><span class="eyebrow">Direct</span><a href="mailto:${site.email}">${site.email}</a><p>${site.responseTime}</p><div><a href="${site.calendly}" target="_blank" rel="noreferrer">Réserver 30 min ↗</a><a href="${site.instagram}" target="_blank" rel="noreferrer">Instagram ↗</a></div></aside></section>
  </main>` + footer();
}

const legalNav = `<nav class="legal-tabs" aria-label="Pages légales"><a href="/mentions-legales/">Mentions</a><a href="/confidentialite/">Confidentialité</a><a href="/cgv/">CGV</a><a href="/cookies/">Cookies</a><a href="/retractation/">Rétractation</a></nav>`;

const legalValue = (value, fallback='À compléter avant publication') => value ? esc(value) : `<strong class="legal-missing">${fallback}</strong>`;

export function legalPage(){
  const vat = legal.vat ? esc(legal.vat) : 'Non renseigné / à confirmer selon le régime fiscal réel';
  return head({title:'Mentions légales — Nolan Arc',description:'Mentions légales du site Nolan Arc.',path:'/mentions-legales/',bodyClass:'page-legal'}) + header() + `<main class="legal-page-shell">${legalNav}<article class="legal-content"><span class="eyebrow">Informations légales</span><h1>Mentions légales</h1>
  <h2>Éditeur du site</h2><p><strong>${esc(site.legalName)}</strong>${legal.businessForm ? ` — ${esc(legal.businessForm)}` : ''}, exerçant sous l’identité professionnelle <strong>${esc(site.name)}</strong>.<br>Adresse professionnelle : ${legalValue(legal.registeredAddress)}.<br>Téléphone : ${legalValue(legal.phone)}.<br>Email : <a href="mailto:${site.email}">${esc(site.email)}</a>.<br>SIREN : ${legalValue(legal.siren)}.<br>SIRET : ${legalValue(legal.siret)}.<br>Code APE : ${legalValue(legal.ape)}.<br>TVA : ${vat}.</p>
  <h2>Directeur de la publication</h2><p>${esc(legal.publicationDirector)}.</p>
  <h2>Hébergement</h2><p>${esc(legal.host.name)}, ${esc(legal.host.address)} — <a href="${esc(legal.host.website)}" rel="noreferrer">${esc(legal.host.website)}</a>.</p>
  <h2>Propriété intellectuelle</h2><p>Sauf mention contraire, les textes, photographies, films, éléments graphiques et créations présentés sur ce site sont protégés par les droits de propriété intellectuelle de leurs auteurs et ayants droit. Toute réutilisation dépassant les exceptions prévues par la loi nécessite l’autorisation préalable du titulaire concerné.</p>
  <h2>Données personnelles et traceurs</h2><p>Les informations détaillées sur les traitements de données sont disponibles dans la <a href="/confidentialite/">politique de confidentialité</a>. Les choix relatifs aux contenus externes sont décrits dans la page <a href="/cookies/">Cookies et contenus externes</a>.</p>
  <h2>Conditions commerciales</h2><p>Les prestations sont encadrées par les <a href="/cgv/">Conditions générales de vente et de prestation de services</a>, complétées par le devis ou contrat accepté pour chaque projet.</p>
  </article></main>` + footer();
}

export function privacyPage(){
  return head({title:'Confidentialité — Nolan Arc',description:'Politique de confidentialité et traitement des données personnelles sur nolanarc.com.',path:'/confidentialite/',bodyClass:'page-legal'}) + header() + `<main class="legal-page-shell">${legalNav}<article class="legal-content"><span class="eyebrow">Vie privée</span><h1>Politique de confidentialité</h1>
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
  return head({title:'Cookies et contenus externes — Nolan Arc',description:'Informations sur les cookies, traceurs et contenus externes utilisés sur nolanarc.com.',path:'/cookies/',bodyClass:'page-legal'}) + header() + `<main class="legal-page-shell">${legalNav}<article class="legal-content"><span class="eyebrow">Traceurs</span><h1>Cookies & contenus externes</h1>
  <h2>Principe</h2><p>Cette version de nolanarc.com n’utilise pas d’outil publicitaire, de profilage ni d’analytics tiers. Le site n’enregistre pas votre parcours dans le navigateur pour personnaliser la visite.</p>
  <h2>Vidéo YouTube</h2><p>Le lecteur vidéo externe n’est créé qu’après votre clic sur le bouton permettant de charger YouTube. Avant cette action, aucun iframe YouTube n’est présent dans la page. En activant le lecteur, votre navigateur communique avec YouTube et ce service peut traiter des informations conformément à ses propres règles.</p>
  <h2>Polices et liens externes</h2><p>Les polices Yrsa, Syne et DM Sans sont chargées via Google Fonts. Ce chargement crée une connexion vers les serveurs du fournisseur afin de récupérer les fichiers nécessaires. Les liens vers Instagram, YouTube et Calendly n’activent pas ces services tant que vous ne les ouvrez pas. Une fois le site tiers ouvert, ses propres règles en matière de cookies et de données personnelles s’appliquent.</p>
  <h2>Évolution du site</h2><p>Si un outil de mesure d’audience ou tout autre traceur non exempté devait être ajouté ultérieurement, le mécanisme de consentement devra être adapté avant son activation.</p>
  <p class="legal-update">Dernière mise à jour : 13 août 2026.</p></article></main>` + footer();
}

export function cgvPage(){
  const mediator = legal.mediator.name ? `${esc(legal.mediator.name)} — ${esc(legal.mediator.address)} — <a href="${esc(legal.mediator.website)}" rel="noreferrer">${esc(legal.mediator.website)}</a>` : `Coordonnées du médiateur de la consommation non encore renseignées. Pour toute réclamation préalable : <a href="mailto:${site.email}">${esc(site.email)}</a>.`;
  return head({title:'CGV — Nolan Arc',description:'Conditions générales de vente et de prestation de services Nolan Arc.',path:'/cgv/',bodyClass:'page-legal'}) + header() + `<main class="legal-page-shell">${legalNav}<article class="legal-content"><span class="eyebrow">Conditions commerciales</span><h1>Conditions générales de vente et de prestation de services</h1>
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
  return head({title:'Rétractation — Nolan Arc',description:'Informations et modèle de formulaire de rétractation pour les contrats à distance conclus avec un consommateur.',path:'/retractation/',bodyClass:'page-legal'}) + header() + `<main class="legal-page-shell">${legalNav}<article class="legal-content"><span class="eyebrow">Consommateurs</span><h1>Droit de rétractation</h1>
  <h2>Principe</h2><p>Pour un contrat de prestation de services conclu à distance avec un consommateur, un droit de rétractation de quatorze jours à compter de la conclusion du contrat s’applique en principe, sauf exception prévue par la loi. Les conditions particulières applicables à votre projet sont rappelées avant la conclusion du contrat.</p>
  <h2>Demande d’exécution anticipée</h2><p>Si vous souhaitez que la prestation commence avant l’expiration du délai de rétractation, une demande expresse peut être nécessaire. Lorsque les conditions légales d’une perte du droit de rétractation sont réunies après exécution complète, une information et un accord spécifiques sont recueillis avant le commencement de la prestation.</p>
  <h2>Exercer votre droit</h2><p>Vous pouvez envoyer une déclaration dénuée d’ambiguïté à <a href="mailto:${site.email}">${esc(site.email)}</a>, ou utiliser le modèle ci-dessous.</p>
  <div class="withdrawal-model"><h3>Modèle de formulaire</h3><p>À l’attention de ${esc(site.legalName)}, ${legalValue(legal.registeredAddress)}, ${esc(site.email)} :</p><p>Je vous notifie par la présente ma rétractation du contrat portant sur la prestation suivante : […]</p><p>Contrat/devis accepté le : […]<br>Nom du consommateur : […]<br>Adresse du consommateur : […]<br>Date : […]<br>Signature (uniquement en cas de formulaire papier) : […]</p></div>
  <p class="legal-update">Dernière mise à jour : 13 août 2026.</p></article></main>` + footer();
}

export function notFoundPage(){
  return head({title:'404 — Nolan Arc',description:'Cette page n’existe pas.',path:'/404/',bodyClass:'page-404'}) + header() + `<main class="not-found"><span>404</span><h1>Ce plan<br><em>n’existe pas.</em></h1><a class="button" href="/work/">Retour au Work <span>↗</span></a></main>` + footer();
}
