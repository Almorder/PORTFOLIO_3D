import { site } from '../content/site.mjs';
import { projects } from '../content/projects.mjs';
import { notes } from '../content/journal.mjs';
import { legal } from '../content/legal.mjs';
import { head, header, footer, esc, projectMeta, placeholderVisual } from './components.mjs';

const bol = projects.find(p=>p.slug==='le-bol-den-face');
const visuals = {
  brand: 'https://images.unsplash.com/photo-1768076955015-dd4f057e96f6?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
  story: bol.poster,
  moment: 'https://images.unsplash.com/photo-1770866381405-f47395dd2414?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000'
};

export function homePage(){
  return head({
    title:'Nolan Arc — Réalisateur & directeur artistique',
    description:"Portfolio de Nolan Arc, réalisateur et directeur artistique. Films de marque, récits et moments.",
    path:'/', bodyClass:'page-home'
  }) + header('/') + `
  <main>
    <section class="home-hero scroll-scene" data-scene="hero">
      <div class="home-hero__sticky scene-sticky">
        <div class="home-hero__media" aria-hidden="true"><img src="${visuals.brand}" alt="" fetchpriority="high"><div class="home-hero__shade"></div></div>
        <div class="home-hero__ghost home-hero__ghost--a">RÉALISER</div>
        <div class="home-hero__ghost home-hero__ghost--b">RACONTER</div>
        <div class="home-hero__copy">
          <span class="eyebrow">${site.role}</span>
          <h1>Une intention.<br><em>Puis une image.</em></h1>
          <p>Je réalise des films et des directions visuelles en partant de ce que le projet doit faire comprendre, ressentir ou retenir.</p>
          <div class="hero-actions"><a class="button" href="/work/">Voir le travail <span>↘</span></a><a class="text-link" href="/projet/le-bol-den-face/">Voir le film <span>↗</span></a></div>
        </div>
        <div class="home-hero__index"><span>01</span><span>Descendre pour découvrir</span></div>
        <div class="orbit orbit--hero" aria-hidden="true"><i></i><i></i><i></i></div>
      </div>
    </section>

    <section class="project-rift" id="work-preview">
      <div class="project-rift__intro"><span class="eyebrow">Travail sélectionné</span><h2>Des projets pour voir<br><em>ce que je construis.</em></h2></div>
      <a class="project-slab project-slab--hero" href="/projet/le-bol-den-face/">
        <img src="${bol.poster}" alt="Le bol d’en face — court métrage" loading="lazy">
        <div class="project-slab__overlay"></div><div class="project-slab__number">01</div>
        <div class="project-slab__copy"><small>${bol.type} · ${bol.year}</small><strong>${bol.title}</strong><span>${bol.role}</span></div>
      </a>
      <div class="project-rift__satellites">
        <a href="/services/#marques" class="satellite-link"><span>02</span><strong>Ouilove Proposal</strong><small>Direction artistique</small></a>
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
          <article class="journey-copy is-active" data-journey-step="0"><small>INTENTION</small><h2>D’abord, savoir<br><em>ce qu’on veut faire ressentir.</em></h2><p>Je commence par le message, la sensation ou le souvenir que le projet doit laisser.</p></article>
          <article class="journey-copy" data-journey-step="1"><small>DÉCISIONS</small><h2>Ensuite, choisir<br><em>comment le raconter.</em></h2><p>Cadre, lumière, mouvement, son et montage sont des choix de mise en scène — pas une liste d’effets.</p></article>
          <article class="journey-copy" data-journey-step="2"><small>RENDU</small><h2>Puis laisser<br><em>le film faire le reste.</em></h2><p>Le spectateur n’a pas besoin de connaître la méthode. Le film doit simplement faire passer ce qu’on voulait raconter.</p></article>
        </div>
      </div>
    </section>

    <section class="entry-zone" id="services-preview">
      <div class="entry-zone__head"><div><span class="eyebrow">Votre projet</span><h2>Qu’est-ce que vous<br><em>préparez ?</em></h2></div><div class="entry-carousel__controls"><button type="button" data-entry-prev aria-label="Carte précédente">←</button><button type="button" data-entry-next aria-label="Carte suivante">→</button></div></div>
      <div class="entry-carousel" data-entry-carousel>
        <a class="entry-card" href="/services/#marques" style="--card-image:url('${visuals.brand}')"><span>01</span><small>MARQUE / ENTREPRISE</small><strong>Un film ou une direction visuelle.</strong><p>Présenter une activité, construire une image ou produire du contenu avec une vraie cohérence.</p><i>Voir les solutions →</i></a>
        <a class="entry-card" href="/work/?territory=Récits" style="--card-image:url('${visuals.story}')"><span>02</span><small>RÉCIT / CRÉATION</small><strong>Un film à écrire et mettre en scène.</strong><p>Fiction, projet d’auteur ou collaboration narrative.</p><i>Voir les récits →</i></a>
        <a class="entry-card" href="/services/#moments" style="--card-image:url('${visuals.moment}')"><span>03</span><small>MOMENT / ÉVÉNEMENT</small><strong>Un moment que vous voulez garder.</strong><p>Mariage, demande en mariage ou événement personnel, filmé sans prendre la place.</p><i>Voir les moments →</i></a>
      </div>
    </section>

    <section class="proof-tape" aria-label="Clients et preuves">
      <div class="proof-tape__top"><span class="eyebrow">Ils m’ont fait confiance</span><p>Ouilove Proposal, A One Permis, Carat Créations Paris et Reka Security.</p></div>
      <div class="proof-tape__marquee"><div>${site.clients.map(c=>`<span>${esc(c)}</span>`).join('')} ${site.clients.map(c=>`<span aria-hidden="true">${esc(c)}</span>`).join('')}</div></div>
      <blockquote>« Il ne se contente pas de filmer. Il réfléchit à ce qu’il veut raconter et pourquoi. »<cite>— Matthieu · Ouilove</cite></blockquote>
    </section>

    <section class="about-tease">
      <div class="about-tease__word">ARC</div>
      <div class="about-tease__copy"><span class="eyebrow">Pourquoi Arc ?</span><h2>Parce qu’un projet<br>avance toujours<br>d’un point à un autre.</h2><p>Une idée devient un cadre, un tournage, un montage, puis un film. C’est ce chemin qui m’intéresse.</p><a class="text-link" href="/a-propos/">À propos de Nolan <span>↗</span></a></div>
    </section>

    <section class="journal-tease">
      <div class="journal-tease__heading"><span class="eyebrow">Journal</span><h2>Réflexions,<br><em>coulisses, méthode.</em></h2></div>
      <div class="journal-tease__rail">${notes.map((n,i)=>`<a href="/journal/#${n.slug}" class="note-card"><span>0${i+1}</span><small>${n.category}</small><strong>${n.title}</strong><p>${n.excerpt}</p></a>`).join('')}</div>
    </section>

    <section class="finale">
      <div class="finale__orbit" aria-hidden="true"><i></i></div>
      <span class="eyebrow">Un projet ?</span><h2>Expliquez-moi simplement<br><em>ce que vous cherchez.</em></h2><p>Pas besoin d’un brief parfait. Quelques lignes suffisent pour commencer.</p><a class="button button--light" href="/contact/">Écrire à Nolan <span>↗</span></a>
    </section>
  </main>` + footer();
}

export function workPage(){
  const verified = projects.filter(p=>p.status==='verified');
  const collaborations = projects.filter(p=>p.status!=='verified');
  return head({title:'Work — Nolan Arc', description:'Films, direction artistique et collaborations sélectionnées de Nolan Arc.', path:'/work/', bodyClass:'page-work'}) + header('/work/') + `<main>
    <section class="page-hero page-hero--work"><span class="eyebrow">Work</span><h1>Travaux<br><em>sélectionnés.</em></h1><p>Films, direction artistique et collaborations. Les filtres servent uniquement à aller plus vite vers ce qui vous intéresse.</p></section>
    <div class="filter-row" data-filter-row aria-label="Filtrer les projets"><button type="button" data-filter="all" aria-pressed="true">Tout</button><button type="button" data-filter="Marques">Marques</button><button type="button" data-filter="Récits">Récits</button><button type="button" data-filter="Moments">Moments</button></div>
    <section class="work-field" data-work-field>
      ${verified.map((p,i)=>`<article class="work-entry is-verified" data-territory="${p.territory}"><div class="work-entry__index">0${i+1}</div><a class="work-entry__visual" href="${p.href}"><img src="${p.poster}" alt="${esc(p.title)}" loading="lazy"></a><div class="work-entry__copy"><span>${p.territory} · ${p.year}</span><h2>${esc(p.title)}</h2><p>${esc(p.summary)}</p><small>${esc(p.role)}</small><a class="text-link" href="${p.href}">Voir le projet <span>↗</span></a></div></article>`).join('')}
    </section>
    <section class="work-collabs"><div class="work-collabs__intro"><span class="eyebrow">Autres collaborations</span><h2>Des missions qui font aussi<br>partie de mon travail.</h2><p>Direction artistique, création de contenu et films de moments : ces missions font partie de mon travail même si leurs galeries complètes ne sont pas encore publiées ici.</p></div><div class="work-collabs__list">${collaborations.map((p,i)=>`<a href="${p.href}"><span>0${i+2}</span><strong>${esc(p.title)}</strong><small>${esc(p.role)} · ${esc(p.territory)}</small><i>↗</i></a>`).join('')}</div></section>
    <section class="work-end"><p>Vous cherchez plutôt à savoir ce que je peux prendre en charge pour votre projet ?</p><a class="button" href="/services/">Voir les services <span>↗</span></a></section>
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
        <div class="external-media__gate"><span class="eyebrow">Film · ${bol.year}</span><h2>Regarder<br>Le bol d’en face</h2><p>Le lecteur YouTube se charge uniquement après votre clic.</p><button class="button button--light" type="button" data-load-video>Lire le film <span>▶</span></button></div>
      </div>
      ${projectMeta(bol)}
    </section>
    <section class="project-story">
      <div class="project-story__lead"><span class="eyebrow">Contexte</span><h2>${bol.intent}</h2><p>${bol.contextText}</p></div>
      <div class="project-story__decisions">${bol.decisions.map((d,i)=>`<article><span>0${i+1}</span><div><h3>${d.title}</h3><p>${d.text}</p></div></article>`).join('')}</div>
    </section>
    <section class="project-next"><span class="eyebrow">Continuer</span><a href="/work/"><small>Autres projets</small><strong>Retour au Work.</strong><span>↗</span></a><a href="/services/"><small>Vous avez un besoin</small><strong>Voir comment je peux intervenir.</strong><span>↗</span></a><a href="/contact/"><small>Un projet en tête</small><strong>Écrire à Nolan.</strong><span>↗</span></a></section>
  </main>` + footer();
}

export function servicesPage(){
  return head({title:'Services — Nolan Arc',description:'Films, direction artistique, contenu et captation de moments par Nolan Arc.',path:'/services/',bodyClass:'page-services'}) + header('/services/') + `<main>
    <section class="services-hero"><span class="eyebrow">Services</span><h1>Ce que je peux<br><em>prendre en charge.</em></h1><p>Pas de catalogue compliqué : trois situations, trois façons de travailler avec moi.</p><nav class="services-jump" aria-label="Accès rapide aux services"><a href="#marques">Marques</a><a href="#recits">Récits</a><a href="#moments">Moments</a></nav></section>

    <section class="service-chapter service-chapter--brand" id="marques">
      <div class="service-chapter__number">01</div><div class="service-chapter__head"><span class="eyebrow">Marques & organisations</span><h2>Donner une forme claire<br>à ce que vous voulez montrer.</h2><p>Je peux intervenir dès la réflexion, puis prendre en charge la direction visuelle et la réalisation des contenus.</p></div>
      <div class="service-capabilities"><article><small>FILM</small><h3>Film de marque ou institutionnel</h3><p>Concept, préparation, tournage, montage et déclinaisons selon le besoin.</p></article><article><small>DIRECTION</small><h3>Direction artistique</h3><p>Construire un langage visuel cohérent pour un film, une campagne ou une présence digitale.</p></article><article><small>CONTENU</small><h3>Contenu social</h3><p>Formats courts pensés pour les usages réels de la marque, pas seulement recadrés après coup.</p></article></div>
      <div class="service-proof"><strong>Ouilove Proposal · Direction artistique</strong><blockquote>« Il ne se contente pas de filmer. Il réfléchit à ce qu’il veut raconter et pourquoi. » <cite>— Matthieu</cite></blockquote><strong>A One Permis · Création de contenu</strong></div>
      <div class="service-process"><span>01 Comprendre le besoin</span><span>02 Cadrer la réponse</span><span>03 Produire</span><span>04 Finaliser & livrer</span></div>
      <a class="button" href="/contact/?intent=brand">Parler d’un projet de marque <span>↗</span></a>
    </section>

    <section class="service-chapter service-chapter--story" id="recits">
      <div class="service-chapter__number">02</div><div class="service-chapter__head"><span class="eyebrow">Récits & création</span><h2>Écrire, mettre en scène<br>et réaliser un récit.</h2><p>Fiction, projet d’auteur ou collaboration narrative : ici, la mise en scène et le rythme prennent le premier rôle.</p></div>
      <a class="service-feature" href="/projet/le-bol-den-face/"><img src="${visuals.story}" alt="Illustration de réalisation audiovisuelle"><div><small>COURT MÉTRAGE · 2026</small><strong>Le bol d’en face</strong><span>Réalisation & scénario →</span></div></a>
    </section>

    <section class="service-chapter service-chapter--moment" id="moments">
      <div class="service-chapter__number">03</div><div class="service-chapter__head"><span class="eyebrow">Moments</span><h2>Filmer ce qui compte<br>sans prendre la place.</h2><p>Mariages, demandes en mariage et événements personnels : je prépare suffisamment pour pouvoir rester discret le jour venu.</p></div>
      <div class="service-capabilities"><article><small>PRÉSENCE</small><h3>Une captation discrète</h3><p>Anticiper les moments importants et limiter les interruptions inutiles.</p></article><article><small>FILM</small><h3>Un rendu construit</h3><p>Image, son et montage sont pensés comme un film, pas comme une simple compilation chronologique.</p></article><article><small>ORGANISATION</small><h3>Un cadre clair avant le jour J</h3><p>Horaires, lieux, moments clés, livrables et options sont cadrés dans le devis ou le contrat.</p></article></div>
      <blockquote class="service-quote">« Le résultat était pile comme je l’imaginais. » <cite>— Nawel & Yanis</cite></blockquote>
      <p class="service-practical">France entière · déplacements possibles · réponse sous 48 h ouvrées · tarif sur devis selon la durée, le lieu et les livrables.</p>
      <a class="button" href="/contact/?intent=moment">Parler de votre moment <span>↗</span></a>
    </section>

    <section class="services-end"><h2>Votre projet ne rentre pas<br>exactement dans une case ?</h2><p>Écrivez-moi. Je préfère comprendre le besoin avant de décider du format.</p><a class="button button--light" href="/contact/">M’expliquer le projet <span>↗</span></a></section>
  </main>` + footer();
}

export function marquesPage(){ return servicesPage(); }

export function momentsPage(){ return servicesPage(); }

export function aboutPage(){
  return head({title:'À propos — Nolan Arc',description:'Le regard, la démarche et le sens du nom Nolan Arc.',path:'/a-propos/',bodyClass:'page-about'}) + header('/a-propos/') + `<main>
    <section class="about-hero"><span class="eyebrow">À propos</span><h1>Je m’appelle Nolan.<br>Je réalise des films<br>et je construis<br><em>des directions visuelles.</em></h1><p>J’aime intervenir assez tôt pour comprendre ce qu’un projet doit raconter, puis rester impliqué jusqu’au rendu final.</p><div class="about-hero__sig">Nolan Ribeiro · Nolan Arc</div></section>
    <section class="arc-meaning scroll-scene" data-scene="arc-meaning"><div class="arc-meaning__sticky scene-sticky"><div class="arc-meaning__word">ARC</div><div class="arc-meaning__items"><article><span>01</span><h2>Récit</h2><p>Une histoire avance d’un point à un autre.</p></article><article><span>02</span><h2>Lumière</h2><p>Le cadre choisit ce qu’on montre et ce qu’on laisse de côté.</p></article><article><span>03</span><h2>Trajectoire</h2><p>Une idée de départ devient une série de décisions concrètes.</p></article><article><span>04</span><h2>Ensemble</h2><p>Image, son, rythme et texte doivent appartenir au même projet.</p></article></div></div></section>
    <section class="principles-grid"><article><span>01</span><h2>Comprendre</h2><p>Clarifier le besoin avant de choisir le format.</p></article><article><span>02</span><h2>Préparer</h2><p>Arriver au tournage avec une direction claire, sans figer ce qui doit rester vivant.</p></article><article><span>03</span><h2>Réaliser</h2><p>Faire des choix de cadre, de lumière et de rythme qui servent réellement le projet.</p></article><article><span>04</span><h2>Finir</h2><p>Garder la même direction jusqu’au montage et à la livraison.</p></article></section>
  </main>` + footer();
}

export function journalPage(){
  return head({title:'Journal — Nolan Arc',description:'Notes de Nolan Arc sur le cadrage, la mise en scène, le rythme et l’intention.',path:'/journal/',bodyClass:'page-journal'}) + header('/journal/') + `<main>
    <section class="journal-hero"><span class="eyebrow">Journal</span><h1>Notes de travail,<br><em>coulisses et méthode.</em></h1><p>Cadrage, lumière, montage, préparation : des notes courtes autour de la fabrication des images.</p></section>
    <section class="journal-stack">${notes.map((n,i)=>`<article id="${n.slug}"><span>0${i+1}</span><small>${n.category} · ${n.date}</small><h2>${n.title}</h2><p>${n.excerpt}</p><a class="text-link" href="/contact/?intent=other">Discuter de cette réflexion <span>↗</span></a></article>`).join('')}</section>
    <section class="journal-to-work"><h2>Envie de voir le résultat plutôt que les notes ?</h2><a class="button" href="/work/">Voir le Work <span>↗</span></a></section>
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
