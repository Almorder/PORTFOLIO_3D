import { site } from '../content/site.mjs';
import { projects } from '../content/projects.mjs';
import { notes } from '../content/journal.mjs';
import { legal } from '../content/legal.mjs';
import { head, header, footer, esc, projectMeta, placeholderVisual } from './components.mjs';

const bol = projects.find(p=>p.slug==='le-bol-den-face');
const visuals = {
  brand: 'https://images.unsplash.com/photo-1768076955015-dd4f057e96f6?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
  story: 'https://images.unsplash.com/photo-1709316132989-55ef2437b920?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=72&w=1800',
  moment: 'https://images.unsplash.com/photo-1770866381405-f47395dd2414?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000'
};

export function homePage(){
  return head({
    title:'Nolan Arc — Réalisateur & directeur artistique',
    description:"Portfolio de Nolan Arc, réalisateur et directeur artistique. Films, direction visuelle et récits conçus à partir d’un objectif clair.",
    path:'/', bodyClass:'page-home'
  }) + header('/') + `
  <main>
    <section class="home-hero scroll-scene" data-scene="hero">
      <div class="home-hero__sticky scene-sticky">
        <div class="home-hero__media" aria-hidden="true"><img src="${visuals.brand}" alt="" fetchpriority="high"><div class="home-hero__shade"></div></div>
        <div class="home-hero__copy motion-reveal">
          <span class="eyebrow">${site.role}</span>
          <h1>Une intention.<br><em>Puis une image.</em></h1>
          <p>Je transforme un besoin, une histoire ou un moment en choix visuels cohérents — du cadrage initial au rendu final.</p>
          <div class="hero-actions"><a class="button" href="/work/">Voir le travail <span>↘</span></a><a class="text-link" href="/services/">Voir comment je peux aider <span>↗</span></a></div>
        </div>
        <div class="home-hero__index"><span>01</span><span>Work · Services · À propos</span></div>
        <div class="orbit orbit--hero" aria-hidden="true"><i></i><i></i><i></i></div>
      </div>
    </section>

    <section class="project-rift" id="work-preview">
      <div class="project-rift__intro motion-reveal"><span class="eyebrow">Travail sélectionné</span><h2>Voir le travail<br><em>avant les promesses.</em></h2><p>Le projet ci-dessous montre à la fois le résultat, mon rôle et les décisions prises derrière l’image.</p></div>
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
      <a class="text-link project-rift__all" href="/work/">Voir tout le Work <span>↗</span></a>
    </section>

    <section class="journey scroll-scene" data-scene="journey">
      <div class="journey__sticky scene-sticky">
        <div class="journey__counter"><span>02</span><b data-journey-count>01 / 03</b></div>
        <div class="journey__stage">
          <div class="journey__object"><div class="journey__halo"></div><figure class="journey__frame"><img src="${visuals.brand}" alt="Coulisses d’une production visuelle" loading="lazy"></figure><div class="journey__ring"></div></div>
          <article class="journey-copy is-active" data-journey-step="0"><small>CLARIFIER</small><h2>Avant de tourner,<br><em>savoir ce que l’image doit accomplir.</em></h2><p>Cette étape évite de produire de belles images qui répondent mal au besoin réel.</p></article>
          <article class="journey-copy" data-journey-step="1"><small>DÉCIDER</small><h2>Chaque choix visuel<br><em>doit servir cet objectif.</em></h2><p>Cadre, lumière, mouvement, son et rythme deviennent des réponses concrètes, pas des effets ajoutés par habitude.</p></article>
          <article class="journey-copy" data-journey-step="2"><small>LIVRER</small><h2>Le résultat reste<br><em>cohérent du brief au rendu.</em></h2><p>En gardant la même direction jusqu’au montage, l’objectif reste lisible entre l’idée de départ et ce qui est finalement livré.</p></article>
        </div>
      </div>
    </section>

    <section class="entry-zone" id="services-preview">
      <div class="entry-zone__head motion-reveal"><div><span class="eyebrow">Votre projet</span><h2>Le besoin d’abord.<br><em>Le format ensuite.</em></h2><p>Choisissez la situation la plus proche de la vôtre. Chaque voie explique ce que je prends en charge et ce que cela vous apporte.</p></div></div>
      <div class="entry-carousel entry-grid" data-entry-carousel>
        <a class="entry-card motion-reveal" href="/services/#marques" style="--card-image:url('${visuals.brand}')"><span>01</span><small>MARQUE / ENTREPRISE</small><strong>Clarifier une image de marque.</strong><p>Film, direction artistique ou contenu : un même fil visuel pour que le message reste cohérent sur les supports utiles.</p><i>Voir les solutions →</i></a>
        <a class="entry-card motion-reveal" href="/services/#recits" style="--card-image:url('${visuals.story}')"><span>02</span><small>RÉCIT / CRÉATION</small><strong>Transformer une idée en film.</strong><p>Écriture, mise en scène et réalisation pour donner une forme précise à une histoire sans la diluer en cours de production.</p><i>Voir les récits →</i></a>
        <a class="entry-card motion-reveal" href="/services/#moments" style="--card-image:url('${visuals.moment}')"><span>03</span><small>MOMENT / ÉVÉNEMENT</small><strong>Garder ce qui ne se rejoue pas.</strong><p>Préparer les moments clés, filmer avec discrétion puis construire un récit qui permet de retrouver les détails et les émotions du jour.</p><i>Voir les moments →</i></a>
      </div>
    </section>

    <section class="proof-tape motion-reveal" aria-label="Clients et preuves">
      <div class="proof-tape__top"><span class="eyebrow">Expériences professionnelles</span><p>${site.clients.map(esc).join(' · ')}</p></div>
      <blockquote>« Il ne se contente pas de filmer. Il réfléchit à ce qu’il veut raconter et pourquoi. »<cite>— Matthieu · Ouilove Proposal</cite></blockquote>
    </section>

    <section class="about-tease motion-reveal">
      <div class="about-tease__word">N</div>
      <div class="about-tease__copy"><span class="eyebrow">Pourquoi travailler avec moi ?</span><h2>Un même regard<br>du brief au rendu.</h2><p>Je peux intervenir avant le tournage, réaliser puis monter. Pour le client, l’intérêt est simple : moins d’écart entre l’objectif de départ et ce qui est finalement livré.</p><a class="text-link" href="/a-propos/">Comprendre mon parcours <span>↗</span></a></div>
    </section>

    <section class="journal-tease motion-reveal">
      <div class="journal-tease__heading"><span class="eyebrow">Notes utiles</span><h2>Trois décisions<br><em>que j’applique au travail.</em></h2></div>
      <div class="journal-tease__rail">${notes.map((n,i)=>`<a href="/journal/#${n.slug}" class="note-card"><span>0${i+1}</span><small>${n.category}</small><strong>${n.title}</strong><p>${n.excerpt}</p></a>`).join('')}</div>
    </section>

    <section class="finale motion-reveal">
      <span class="eyebrow">Commencer</span><h2>Un objectif, une date<br>ou même un problème suffisent.</h2><p>Expliquez-moi ce qui doit changer, être compris ou être conservé. Je vous réponds avec une première direction.</p><a class="button button--light" href="/contact/">Écrire à Nolan <span>↗</span></a>
    </section>
  </main>` + footer();
}

export function workPage(){
  const verified = projects.filter(p=>p.status==='verified');
  const collaborations = projects.filter(p=>p.status!=='verified');
  return head({title:'Work — Nolan Arc', description:'Films, direction artistique et collaborations sélectionnées de Nolan Arc.', path:'/work/', bodyClass:'page-work'}) + header('/work/') + `<main>
    <section class="page-hero page-hero--work motion-reveal"><span class="eyebrow">Work</span><h1>Du travail réel.<br><em>Un rôle identifiable.</em></h1><p>Chaque entrée précise mon rôle. Quand un projet est suffisamment documenté, vous pouvez ouvrir le film et les décisions qui ont guidé sa réalisation.</p></section>
    <section class="work-field" data-work-field>
      ${verified.map((p,i)=>`<article class="work-entry is-verified" data-territory="${p.territory}"><div class="work-entry__index">0${i+1}</div><a class="work-entry__visual" href="${p.href}"><img src="${p.poster}" alt="${esc(p.title)}" loading="lazy"></a><div class="work-entry__copy"><span>${p.territory} · ${p.year}</span><h2>${esc(p.title)}</h2><p>${esc(p.summary)}</p><small>${esc(p.role)}</small><a class="text-link" href="${p.href}">Voir le projet <span>↗</span></a></div></article>`).join('')}
    </section>
    <section class="work-collabs"><div class="work-collabs__intro motion-reveal"><span class="eyebrow">Autres collaborations</span><h2>Direction, contenu<br>et moments.</h2><p>Ces missions montrent les autres contextes dans lesquels j’interviens au-delà de la fiction.</p></div><div class="work-collabs__list">${collaborations.map((p,i)=>`<a href="${p.href}"><span>0${i+2}</span><strong>${esc(p.title)}</strong><small>${esc(p.type)}</small><p>${esc(p.summary)}</p></a>`).join('')}</div></section>
  </main>` + footer();
}

export function projectPage(){
  return head({title:`${bol.title} — Nolan Arc`, description:bol.summary, path:'/projet/le-bol-den-face/', image:bol.poster, bodyClass:'page-project'}) + header('/projet/le-bol-den-face/') + `<main>
    <section class="project-intro">
      <a class="back-link" href="/work/">← Work</a><span class="eyebrow">${bol.type} · ${bol.year}</span>
      <div class="project-intro__grid"><h1>${bol.title}</h1><div><p>${bol.summary}</p><span>${bol.role}</span></div></div>
    </section>
    <section class="project-film-first">
      <div class="external-media project-player" data-external-video data-video-id="${bol.videoId}" data-video-title="${bol.title}" style="--poster:url('${bol.poster}')">
        <div class="external-media__gate"><span class="eyebrow">Film · ${bol.year}</span><h2>Regarder<br>Le bol d’en face</h2><button class="button button--light" type="button" data-load-video>Lire le film <span>▶</span></button></div>
      </div>
      ${projectMeta(bol)}
    </section>
    <section class="project-story">
      <div class="project-story__lead"><span class="eyebrow">Problème narratif</span><h2>${bol.intent}</h2><p>${bol.contextText}</p></div>
      <div class="project-story__decisions">${bol.decisions.map((d,i)=>`<article><span>0${i+1}</span><div><h3>${d.title}</h3><p>${d.text}</p></div></article>`).join('')}</div>
    </section>
    <section class="project-next"><span class="eyebrow">Continuer</span><a href="/work/"><small>Autres projets</small><strong>Retour au Work.</strong><span>↗</span></a><a href="/services/"><small>Vous avez un besoin</small><strong>Voir comment je peux intervenir.</strong><span>↗</span></a><a href="/contact/"><small>Un projet en tête</small><strong>Écrire à Nolan.</strong><span>↗</span></a></section>
  </main>` + footer();
}

export function servicesPage(){
  return head({title:'Services — Nolan Arc',description:'Réalisation, direction artistique, contenu et films de moments par Nolan Arc.',path:'/services/',bodyClass:'page-services'}) + header('/services/') + `<main>
    <section class="services-hero motion-reveal"><span class="eyebrow">Services</span><h1>Vous avez un objectif.<br><em>Je le traduis en images.</em></h1><p>Je peux prendre en charge la réflexion visuelle, la préparation, le tournage et le montage. L’intérêt : garder une direction cohérente au lieu de faire circuler l’idée entre plusieurs étapes déconnectées.</p><nav class="services-jump" aria-label="Accès rapide aux services"><a href="#marques">Marques</a><a href="#recits">Récits</a><a href="#moments">Moments</a></nav></section>

    <section class="service-chapter service-chapter--brand" id="marques">
      <div class="service-chapter__head motion-reveal"><span class="eyebrow">01 · Marques & organisations</span><h2>Le besoin n’est pas toujours<br>« faire une vidéo ».</h2><p>Il peut s’agir de faire comprendre une offre, rendre sa communication plus cohérente ou produire du contenu sans perdre son identité. Je pars de ce problème avant de choisir le format.</p></div>
      <div class="service-value-grid">
        <article class="motion-reveal"><small>FILM</small><h3>Faire comprendre une offre ou une activité.</h3><p>Concept, préparation, tournage et montage sont organisés autour du message à retenir, pas autour d’une liste de plans à produire.</p><b>Bénéfice</b><span>Un film construit pour une fonction précise : présenter, rassurer, expliquer ou positionner.</span></article>
        <article class="motion-reveal"><small>DIRECTION ARTISTIQUE</small><h3>Éviter une image différente à chaque support.</h3><p>Je définis les choix de cadrage, lumière, typographie, couleur et rythme qui doivent rester cohérents entre les contenus.</p><b>Bénéfice</b><span>Une identité plus reconnaissable et des décisions plus simples à reproduire.</span></article>
        <article class="motion-reveal"><small>CONTENU</small><h3>Produire pour l’usage réel du contenu.</h3><p>Les formats sont pensés dès la préparation pour leur canal de diffusion au lieu d’être seulement recadrés après le tournage.</p><b>Bénéfice</b><span>Des livrables directement exploitables pour les usages prévus.</span></article>
      </div>
      <aside class="service-proof-card motion-reveal" id="ouilove-proof"><div><span class="eyebrow">Preuve · Ouilove Proposal</span><h3>Direction artistique</h3><p>Intervenir avant l’exécution pour réfléchir à ce qui doit être raconté, puis maintenir cette intention dans les choix visuels.</p></div><blockquote>« Il ne se contente pas de filmer. Il réfléchit à ce qu’il veut raconter et pourquoi. »<cite>— Matthieu · Ouilove Proposal</cite></blockquote></aside>
      <div class="service-process motion-reveal"><span><b>01</b> Besoin & objectif</span><span><b>02</b> Direction & préparation</span><span><b>03</b> Production</span><span><b>04</b> Montage & livraison</span></div>
      <a class="button" href="/contact/?intent=brand">Parler d’un projet de marque <span>↗</span></a>
    </section>

    <section class="service-chapter service-chapter--story" id="recits">
      <div class="service-chapter__head motion-reveal"><span class="eyebrow">02 · Récits & création</span><h2>Une idée devient un récit<br>quand chaque scène a une fonction.</h2><p>J’interviens sur l’écriture, la mise en scène et la réalisation pour transformer une intention en progression narrative, puis en images.</p></div>
      <a class="service-feature motion-reveal" href="/projet/le-bol-den-face/"><img src="${bol.poster}" alt="Le bol d’en face — court métrage"><div><small>COURT MÉTRAGE · 2026</small><strong>Le bol d’en face</strong><p>Raconter le deuil sans l’expliquer frontalement : le repas, les objets et les silences deviennent les informations du récit.</p><span>Voir le film et les choix de mise en scène →</span></div></a>
    </section>

    <section class="service-chapter service-chapter--moment" id="moments">
      <div class="service-chapter__head motion-reveal"><span class="eyebrow">03 · Moments</span><h2>Préparer suffisamment<br>pour moins intervenir le jour J.</h2><p>Mariage, demande en mariage ou événement personnel : l’objectif est de ne pas transformer le moment en tournage permanent.</p></div>
      <div class="service-value-grid">
        <article class="motion-reveal"><small>AVANT</small><h3>Identifier ce qui ne doit pas être manqué.</h3><p>Date, lieux, personnes, déroulé et moments clés sont cadrés avant la prestation.</p><b>Bénéfice</b><span>Moins de questions et d’interruptions pendant l’événement.</span></article>
        <article class="motion-reveal"><small>PENDANT</small><h3>Anticiper plutôt que faire rejouer.</h3><p>Je cherche les positions et les moments utiles sans multiplier les demandes de pose ou de répétition.</p><b>Bénéfice</b><span>Une présence plus discrète et des réactions qui restent naturelles.</span></article>
        <article class="motion-reveal"><small>APRÈS</small><h3>Construire un souvenir, pas une chronologie brute.</h3><p>Le montage relie voix, regards, gestes et détails pour restituer ce qui avait de la valeur dans la journée.</p><b>Bénéfice</b><span>Un film qui permet de retrouver des éléments que l’on n’a pas forcément perçus sur le moment.</span></article>
      </div>
      <blockquote class="service-quote motion-reveal">« Le résultat était pile comme je l’imaginais. » <cite>— Nawel & Yanis</cite></blockquote>
      <p class="service-practical">Déplacements selon le projet · réponse sous 48 h ouvrées · prix et livrables définis au devis selon la durée, les lieux et le périmètre.</p>
      <a class="button" href="/contact/?intent=moment">Parler de votre moment <span>↗</span></a>
    </section>

    <section class="services-end motion-reveal"><h2>Votre besoin ne rentre pas<br>dans ces trois cas ?</h2><p>Décrivez le résultat attendu. Je vous dirai si je peux le prendre en charge et sous quelle forme.</p><a class="button button--light" href="/contact/">M’expliquer le besoin <span>↗</span></a></section>
  </main>` + footer();
}

export function marquesPage(){ return servicesPage(); }

export function momentsPage(){ return servicesPage(); }

export function aboutPage(){
  return head({title:'À propos — Nolan Arc',description:'Nolan Ribeiro : parcours, manière de travailler et ce que cette approche apporte aux projets.',path:'/a-propos/',bodyClass:'page-about'}) + header('/a-propos/') + `<main>
    <section class="about-story-hero">
      <div class="about-story-hero__portrait motion-reveal"><img src="/assets/nolan-portrait.jpg" alt="Portrait de Nolan Ribeiro" data-nolan-portrait><div class="about-story-hero__fallback" aria-hidden="true"><span>N</span><small>Portrait de Nolan</small></div></div>
      <div class="about-story-hero__copy motion-reveal"><span class="eyebrow">Nolan Ribeiro · Nolan Arc</span><h1>Je pourrais commencer<br>par le matériel.<br><em>Ce n’est pas ce qui explique mon travail.</em></h1><p class="about-hook">Depuis petit, je reviens toujours à la même chose : créer des vidéos, raconter mes propres histoires et chercher des univers qui ont une identité propre.</p><a class="text-link" href="#tension">Ce que ça change pour un projet <span>↓</span></a></div>
    </section>

    <section class="about-tension" id="tension">
      <div class="about-tension__lead motion-reveal"><span class="eyebrow">Le point de bascule</span><h2>J’ai parfois passé plus de temps<br>à me structurer qu’à créer.</h2></div>
      <div class="about-tension__body motion-reveal"><p>Le défaut de cette exigence, c’est qu’elle peut ralentir. Son utilité, aujourd’hui, est ailleurs : je préfère clarifier pourquoi un projet existe avant d’accumuler les idées, les plans ou les effets.</p><p>Pour un client, cette manière de travailler sert surtout à <strong>éviter les choix visuels qui n’aident pas le projet</strong> et à garder un fil entre le besoin de départ, le tournage et le rendu final.</p></div>
    </section>

    <section class="about-value">
      <header class="motion-reveal"><span class="eyebrow">Ce que vous gagnez concrètement</span><h2>Une personne qui pense<br>avant, pendant et après le tournage.</h2></header>
      <div class="about-value__grid"><article class="motion-reveal"><span>01</span><h3>Avant</h3><p>Je questionne le besoin, la cible, le contexte et l’usage attendu pour éviter de produire un format qui répond à la mauvaise question.</p></article><article class="motion-reveal"><span>02</span><h3>Pendant</h3><p>Je garde la direction visuelle en tête au moment du cadre, de la lumière et de la mise en scène, au lieu de compter sur le montage pour réparer la cohérence.</p></article><article class="motion-reveal"><span>03</span><h3>Après</h3><p>Je monte avec la même intention de départ afin que le résultat final ne soit pas déconnecté de ce qui avait été validé au début.</p></article></div>
    </section>

    <section class="about-personal-lens">
      <div class="about-personal-lens__visual motion-reveal"><div class="about-lens-card"><small>CE QUI M’ATTIRE</small><strong>Les univers qui ont une identité, une histoire, quelque chose qui leur est propre.</strong></div></div>
      <div class="about-personal-lens__copy motion-reveal"><span class="eyebrow">Mon filtre personnel</span><h2>Je ne cherche pas à rendre tous les projets « cinématographiques ».</h2><p>Je cherche ce qui peut les rendre reconnaissables et justes pour leur contexte. C’est aussi pour cela que je préfère les univers de niche aux recettes visuelles que l’on peut déplacer d’un projet à l’autre sans rien changer.</p></div>
    </section>

    <section class="about-arc motion-reveal"><span class="eyebrow">Pourquoi « Arc » ?</span><div><h2>Une trajectoire,<br>pas un effet graphique.</h2><p>Le nom résume la continuité que je cherche : une intention au départ, des décisions qui la font évoluer, puis un résultat qui reste relié à cette origine.</p></div></section>

    <section class="about-proof motion-reveal"><div><span class="eyebrow">Une phrase qui résume bien mon travail</span><blockquote>« Il ne se contente pas de filmer. Il réfléchit à ce qu’il veut raconter et pourquoi. »<cite>— Matthieu · Ouilove Proposal</cite></blockquote></div><a class="button button--light" href="/work/">Voir ce que cela produit <span>↗</span></a></section>
  </main>` + footer();
}

export function journalPage(){
  return head({title:'Journal — Nolan Arc',description:'Notes pratiques de Nolan Arc sur la préparation, le cadrage et le montage.',path:'/journal/',bodyClass:'page-journal'}) + header('/journal/') + `<main>
    <section class="journal-hero motion-reveal"><span class="eyebrow">Journal</span><h1>Des notes<br><em>directement applicables.</em></h1><p>Pas de théorie pour remplir une page : chaque note décrit une décision que j’utilise réellement pour préparer, cadrer ou monter.</p></section>
    <section class="journal-stack">${notes.map((n,i)=>`<article id="${n.slug}" class="motion-reveal"><span>0${i+1}</span><small>${n.category} · ${n.date}</small><h2>${n.title}</h2><p>${n.excerpt}</p></article>`).join('')}</section>
  </main>` + footer();
}

export function contactPage(){
  return head({title:'Contact — Nolan Arc',description:'Parler d’un film, d’une direction artistique ou d’un moment à Nolan Arc.',path:'/contact/',bodyClass:'page-contact'}) + header('/contact/') + `<main>
    <section class="contact-hero contact-hero--compact"><span class="eyebrow">Contact</span><h1>Parlons de<br><em>votre projet.</em></h1><p>Pas besoin d’un brief parfait. Dites-moi simplement ce que vous préparez.</p></section>
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
