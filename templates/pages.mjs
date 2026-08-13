import { site } from '../content/site.mjs';
import { projects } from '../content/projects.mjs';
import { notes } from '../content/journal.mjs';
import { legal } from '../content/legal.mjs';
import { head, header, footer, arcRail, esc, projectMeta, placeholderVisual } from './components.mjs';

const bol = projects.find(p=>p.slug==='le-bol-den-face');

export function homePage(){
  return head({
    title:'Nolan Arc — Réalisateur & directeur artistique',
    description:"Portfolio de Nolan Arc, réalisateur et directeur artistique. Films de marque, récits et moments construits à partir d’une intention.",
    path:'/', bodyClass:'page-home'
  }) + header('/') + arcRail() + `
  <main>
    <section class="home-hero scroll-scene" data-scene="hero">
      <div class="home-hero__sticky scene-sticky">
        <div class="home-hero__media" aria-hidden="true">
          <img src="${bol.poster}" alt="" fetchpriority="high">
          <div class="home-hero__shade"></div>
        </div>
        <div class="home-hero__ghost home-hero__ghost--a">INTENTION</div>
        <div class="home-hero__ghost home-hero__ghost--b">IMAGE</div>
        <div class="home-hero__copy">
          <span class="eyebrow">${site.role}</span>
          <h1>Je ne commence<br>pas par <em>l’image.</em></h1>
          <p>Je commence par ce qu’elle doit faire comprendre, ressentir ou retenir.</p>
          <div class="hero-actions"><a class="button" href="/work/">Voir le travail <span>↘</span></a><a class="text-link" href="/projet/le-bol-den-face/">Voir un film <span>↗</span></a></div>
        </div>
        <div class="home-hero__index"><span>01</span><span>Scroll to enter</span></div>
        <div class="orbit orbit--hero" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="floating-card floating-card--brand"><small>Pour une marque</small><strong>Construire une perception.</strong></div>
        <div class="floating-card floating-card--story"><small>Pour un récit</small><strong>Faire vivre une intention.</strong></div>
        <div class="floating-card floating-card--moment"><small>Pour un moment</small><strong>Préserver ce qui arrive une fois.</strong></div>
      </div>
    </section>

    <section class="manifesto-break" aria-label="Positionnement">
      <p class="manifesto-break__small">Le même regard,<br>trois territoires.</p>
      <p class="manifesto-break__large">MARQUES <i>/</i> RÉCITS <i>/</i> MOMENTS</p>
    </section>

    <section class="project-rift">
      <div class="project-rift__intro"><span class="eyebrow">Selected work</span><h2>Un seul projet peut<br>en dire plus qu’une liste<br>de compétences.</h2></div>
      <a class="project-slab project-slab--hero" href="/projet/le-bol-den-face/">
        <img src="${bol.poster}" alt="Le bol d’en face — court métrage" loading="lazy">
        <div class="project-slab__overlay"></div>
        <div class="project-slab__number">01</div>
        <div class="project-slab__copy"><small>${bol.type} · ${bol.year}</small><strong>${bol.title}</strong><span>${bol.role}</span></div>
      </a>
      <div class="project-rift__satellites">
        <a href="/services/marques/#ouilove" class="satellite-link"><span>02</span><strong>Ouilove Proposal</strong><small>Direction artistique</small></a>
        <a href="/services/marques/#a-one-permis" class="satellite-link"><span>03</span><strong>A One Permis</strong><small>Contenu social</small></a>
        <a href="/services/moments/" class="satellite-link"><span>04</span><strong>Moments</strong><small>Films de moments</small></a>
      </div>
      <a class="text-link project-rift__all" href="/work/">Tout le Work <span>↗</span></a>
    </section>

    <section class="journey scroll-scene" data-scene="journey">
      <div class="journey__sticky scene-sticky">
        <div class="journey__counter"><span>02</span><b data-journey-count>01 / 03</b></div>
        <div class="journey__stage">
          <div class="journey__object">
            <div class="journey__halo"></div>
            <figure class="journey__frame"><img src="${bol.poster}" alt="Plan du court métrage Le bol d’en face" loading="lazy"></figure>
            <div class="journey__ring"></div>
          </div>
          <article class="journey-copy is-active" data-journey-step="0"><small>INTENTION</small><h2>Avant de cadrer,<br><em>choisir ce qui compte.</em></h2><p>Un projet commence par une question. Le média, le rythme et la technique viennent ensuite.</p></article>
          <article class="journey-copy" data-journey-step="1"><small>DÉCISION</small><h2>Chaque choix<br><em>doit servir l’idée.</em></h2><p>Cadrage, lumière, silence, mouvement : une décision n’est intéressante que si elle change ce que le spectateur reçoit.</p></article>
          <article class="journey-copy" data-journey-step="2"><small>IMAGE</small><h2>Le résultat<br><em>n’explique plus.</em></h2><p>Il fait ressentir. C’est là que l’intention disparaît derrière l’expérience.</p></article>
        </div>
      </div>
    </section>

    <section class="territory-stage scroll-scene" data-scene="territories">
      <div class="territory-stage__sticky scene-sticky">
        <div class="territory-stage__heading"><span class="eyebrow">Choisissez votre entrée</span><h2>Choisissez<br><em>votre trajectoire.</em></h2></div>
        <div class="territory-core" aria-hidden="true"><div class="territory-core__inner">N·A</div></div>
        <a class="territory-node territory-node--brand" href="/services/marques/" data-intent="brand"><span>01</span><strong>MARQUES</strong><small>Films · contenu · direction</small></a>
        <a class="territory-node territory-node--story" href="/work/?territory=Récits" data-intent="story"><span>02</span><strong>RÉCITS</strong><small>Fiction · projets d’auteur</small></a>
        <a class="territory-node territory-node--moment" href="/services/moments/" data-intent="moment"><span>03</span><strong>MOMENTS</strong><small>Mariages · demandes · événements</small></a>
        <svg class="territory-lines" viewBox="0 0 1000 700" aria-hidden="true"><path d="M500 350 C340 280 280 180 150 180"/><path d="M500 350 C500 250 500 180 500 110"/><path d="M500 350 C660 280 720 180 850 180"/></svg>
      </div>
    </section>

    <section class="proof-tape" aria-label="Clients et preuves">
      <div class="proof-tape__top"><span class="eyebrow">Ils m’ont confié une partie de leur image</span><p>Le travail doit rester lisible par le résultat — pas par une liste de logos.</p></div>
      <div class="proof-tape__marquee"><div>${site.clients.map(c=>`<span>${esc(c)}</span>`).join('')} ${site.clients.map(c=>`<span aria-hidden="true">${esc(c)}</span>`).join('')}</div></div>
      <blockquote>« Il ne se contente pas de filmer. Il réfléchit à ce qu’il veut raconter et pourquoi. »<cite>— Matthieu · Ouilove</cite></blockquote>
    </section>

    <section class="about-tease">
      <div class="about-tease__word">ARC</div>
      <div class="about-tease__copy"><span class="eyebrow">Pourquoi Arc ?</span><h2>Une trajectoire<br>entre une intention<br>et ce qu’il en reste.</h2><p>Arc narratif. Arc de lumière. Arc de trajectoire. Une seule idée : chaque décision relie un point à un autre.</p><a class="text-link" href="/a-propos/">Voir la démarche <span>↗</span></a></div>
    </section>

    <section class="journal-tease">
      <div class="journal-tease__heading"><span class="eyebrow">Journal</span><h2>Ce qu’il y a<br><em>derrière l’image.</em></h2></div>
      <div class="journal-tease__rail">${notes.map((n,i)=>`<a href="/journal/#${n.slug}" class="note-card"><span>0${i+1}</span><small>${n.category}</small><strong>${n.title}</strong><p>${n.excerpt}</p></a>`).join('')}</div>
    </section>

    <section class="finale">
      <div class="finale__orbit" aria-hidden="true"><i></i></div>
      <span class="eyebrow">La suite</span><h2>Vous n’avez pas besoin<br>d’avoir <em>la solution.</em></h2><p>Une idée, un brief ou un problème suffisent pour commencer.</p><a class="button button--light" href="/contact/">Parler du projet <span>↗</span></a>
    </section>
  </main>` + footer();
}

export function workPage(){
  const verified = projects.filter(p=>p.status==='verified');
  const collaborations = projects.filter(p=>p.status!=='verified');
  return head({title:'Work — Nolan Arc', description:'Une sélection de films et projets réellement documentés de Nolan Arc.', path:'/work/', bodyClass:'page-work'}) + header('/work/') + arcRail() + `<main>
    <section class="page-hero page-hero--work"><span class="eyebrow">01 · Work</span><h1>Le travail,<br><em>pas la promesse.</em></h1><p>Les études de cas détaillées n’apparaissent ici que lorsque leur média, leur contexte et mon rôle sont suffisamment vérifiés.</p></section>
    <section class="work-field" data-work-field>
      ${verified.map((p,i)=>`<article class="work-entry is-verified" data-territory="${p.territory}">
        <div class="work-entry__index">0${i+1}</div>
        <div class="work-entry__visual"><img src="${p.poster}" alt="${esc(p.title)}" loading="lazy"></div>
        <div class="work-entry__copy"><span>${p.territory} · ${p.year}</span><h2>${esc(p.title)}</h2><p>${esc(p.summary)}</p><small>${esc(p.role)}</small><a class="text-link" href="${p.href}">Voir le projet <span>↗</span></a></div>
      </article>`).join('')}
    </section>
    <section class="work-collabs"><div class="work-collabs__intro"><span class="eyebrow">Autres collaborations documentées</span><h2>Je préfère montrer moins<br>que fabriquer des case studies.</h2><p>Ces collaborations sont réelles, mais leurs médias ou informations détaillées doivent encore être rattachés avant de devenir des pages projet.</p></div><div class="work-collabs__list">${collaborations.map((p,i)=>`<a href="${p.href}"><span>0${i+2}</span><strong>${esc(p.title)}</strong><small>${esc(p.role)} · ${esc(p.territory)}</small><i>↗</i></a>`).join('')}</div></section>
    <section class="work-end"><p>Vous cherchez une preuve liée à un besoin précis ? Les pages Marques et Moments replacent les collaborations dans leur contexte plutôt que de remplir artificiellement la grille.</p><a class="button" href="/services/">Choisir un chemin <span>↗</span></a></section>
  </main>` + footer();
}

export function projectPage(){
  return head({title:`${bol.title} — Nolan Arc`, description:bol.summary, path:'/projet/le-bol-den-face/', image:bol.poster, bodyClass:'page-project'}) + header() + arcRail() + `<main>
    <section class="project-hero scroll-scene" data-scene="project-hero">
      <div class="project-hero__sticky scene-sticky"><img src="${bol.poster}" alt="${bol.title}" fetchpriority="high"><div class="project-hero__shade"></div><div class="project-hero__copy"><a class="back-link" href="/work/">← Work</a><span class="eyebrow">${bol.type} · ${bol.year}</span><h1>${bol.title}</h1><p>${bol.summary}</p>${projectMeta(bol)}<a class="button" href="https://www.youtube.com/watch?v=${bol.videoId}" target="_blank" rel="noreferrer">Voir le film <span>↗</span></a></div></div>
    </section>
    <section class="case-thread"><div class="case-thread__rail"><span>INTENTION</span><span>DÉCISIONS</span><span>IMAGE</span></div><div class="case-thread__copy"><span class="eyebrow">Intention</span><h2>${bol.intent}</h2><p>Le projet est construit autour de ce qui reste lorsqu’on retire l’explication : les gestes, les objets, les silences et le rituel du repas.</p></div></section>
    <section class="decision-cascade">${bol.decisions.map((d,i)=>`<article><span>0${i+1}</span><h3>${d}</h3><div class="decision-line"></div></article>`).join('')}</section>
    <section class="film-stage"><div class="film-stage__screen external-media" data-external-video data-video-id="${bol.videoId}" data-video-title="${bol.title}"><div class="external-media__gate"><span class="eyebrow">Film externe</span><h2>Voir le film complet</h2><p>La vidéo est hébergée par YouTube. Elle n’est chargée qu’après votre choix afin de ne pas activer de contenu tiers automatiquement.</p><button class="button" type="button" data-load-video>Charger la vidéo YouTube <span>▶</span></button><a class="text-link" href="/cookies/">À propos des contenus externes <span>↗</span></a></div></div><div class="film-stage__caption"><span>Le rendu</span><p>Le film complet reste la preuve centrale. Le reste de la page sert à comprendre les choix qui l’ont construit.</p></div></section>
    <section class="project-next"><span class="eyebrow">Continuer</span><a href="/services/marques/"><small>Pour une marque</small><strong>Voir comment je peux intervenir.</strong><span>↗</span></a><a href="/a-propos/"><small>Comprendre le regard</small><strong>Voir la démarche Nolan Arc.</strong><span>↗</span></a><a href="/contact/"><small>Vous avez un projet</small><strong>Commencer une conversation.</strong><span>↗</span></a></section>
  </main>` + footer();
}

export function servicesPage(){
  return head({title:'Services — Nolan Arc',description:'Deux voies principales pour travailler avec Nolan Arc : marques et moments, plus les collaborations narratives.',path:'/services/',bodyClass:'page-services'}) + header('/services/') + arcRail() + `<main>
    <section class="services-gate"><span class="eyebrow">Services</span><h1>Votre besoin détermine<br><em>le chemin.</em></h1><p>La même exigence d’intention. Des manières de travailler différentes selon ce qui doit être construit ou préservé.</p><div class="services-gate__map"><a href="/services/marques/" data-intent="brand"><span>01</span><strong>MARQUES</strong><p>Films, contenus, direction artistique.</p></a><a href="/work/?territory=Récits" data-intent="story"><span>02</span><strong>RÉCITS</strong><p>Fiction, projets d’auteur, collaborations.</p></a><a href="/services/moments/" data-intent="moment"><span>03</span><strong>MOMENTS</strong><p>Mariages, demandes, événements humains.</p></a></div></section>
    <section class="services-principle"><div class="services-principle__giant">WHY</div><div><span class="eyebrow">Ma logique</span><h2>Je ne vends pas une caméra.<br>Je cherche la forme juste<br>pour votre intention.</h2><a class="text-link" href="/a-propos/">Voir ma démarche <span>↗</span></a></div></section>
  </main>` + footer();
}

export function marquesPage(){
  return head({title:'Pour les marques — Nolan Arc',description:'Films de marque, contenu et direction artistique par Nolan Arc.',path:'/services/marques/',bodyClass:'page-marques'}) + header('/services/') + arcRail() + `<main>
    <section class="commercial-hero scroll-scene" data-scene="commercial"><div class="commercial-hero__sticky scene-sticky"><div class="commercial-hero__copy"><span class="eyebrow">Pour les marques</span><h1>Une image n’a de valeur<br>que si elle change<br><em>la perception.</em></h1><p>J’interviens de la réflexion au rendu sur des films, contenus et directions visuelles.</p><a class="button" href="/contact/?intent=brand">Parler du besoin <span>↗</span></a></div><div class="commercial-hero__stack" aria-hidden="true"><div>IDENTITÉ</div><div>RÉCIT</div><div>IMAGE</div><div>DIFFUSION</div></div></div></section>
    <section class="needs-orbit"><div class="needs-orbit__core">Votre<br>besoin</div><article><span>01</span><h2>Clarifier</h2><p>Faire comprendre ce qui vous distingue.</p></article><article><span>02</span><h2>Désirer</h2><p>Construire une image qui donne envie.</p></article><article><span>03</span><h2>Cohérer</h2><p>Relier le film au reste de votre univers.</p></article><article><span>04</span><h2>Décliner</h2><p>Penser le contenu au-delà d’un format unique.</p></article></section>
    <section class="client-proof" id="ouilove"><span class="eyebrow">Preuve réelle</span><h2>Ouilove Proposal</h2><p>Direction artistique pour Ouilove Proposal : une preuve professionnelle qui confirme la capacité de Nolan à réfléchir au message autant qu’à l’exécution.</p><blockquote>« Il ne se contente pas de filmer. Il réfléchit à ce qu’il veut raconter et pourquoi. »<cite>— Matthieu · Ouilove</cite></blockquote></section>
    <section class="client-proof client-proof--dark" id="a-one-permis"><span class="eyebrow">Preuve réelle</span><h2>A One Permis</h2><p>Création de contenu social pour A One Permis, intégrée au territoire Marques.</p></section>
    <section class="process-wave"><span class="eyebrow">Comment ça se passe</span><div>${['Comprendre','Cadrer','Réaliser','Finaliser'].map((x,i)=>`<article><span>0${i+1}</span><h3>${x}</h3></article>`).join('')}</div></section>
  </main>` + footer();
}

export function momentsPage(){
  return head({title:'Moments — Nolan Arc',description:'Films de mariage, demandes en mariage et moments humains par Nolan Arc.',path:'/services/moments/',bodyClass:'page-moments'}) + header('/services/') + arcRail() + `<main>
    <section class="moments-hero"><div class="moments-hero__void"><span class="eyebrow">Moments</span><h1>Ce qui ne se revit pas,<br><em>je ne le rejoue pas.</em></h1><p>Je cherche à être au bon endroit sans transformer votre moment en tournage.</p><a class="button" href="/contact/?intent=moment">Parler du moment <span>↗</span></a></div><div class="moments-hero__line" aria-hidden="true"></div></section>
    <section class="moments-flow"><article><span>01</span><h2>Être là.</h2><p>Anticiper sans interrompre.</p></article><article><span>02</span><h2>Regarder.</h2><p>Les gestes, les silences, ce qui se passe entre deux actions.</p></article><article><span>03</span><h2>Préserver.</h2><p>Construire un film qui ne remplace pas le souvenir mais le réactive.</p></article></section>
    <section class="moments-proof"><div><span class="eyebrow">Retour client</span><blockquote>« Le résultat était pile comme je l’imaginais. »<cite>— Nawel & Yanis</cite></blockquote></div><aside><strong>Une présence discrète</strong><p>Le dispositif doit s’adapter au moment, pas l’inverse : préparation, placement et anticipation servent à rester présent sans prendre la place.</p></aside></section>
    <section class="practical-ribbon"><span>France entière</span><span>Déplacements possibles</span><span>Réponse sous 48 h ouvrées</span><span>Tarif sur devis selon durée de présence, préparation, lieu, livrables et options · frais annoncés avant engagement</span></section>
  </main>` + footer();
}

export function aboutPage(){
  return head({title:'À propos — Nolan Arc',description:'Le regard, la démarche et le sens du nom Nolan Arc.',path:'/a-propos/',bodyClass:'page-about'}) + header('/a-propos/') + arcRail() + `<main>
    <section class="about-hero"><span class="eyebrow">À propos</span><h1>Je cherche moins<br>à rendre une image belle<br>qu’à comprendre<br><em>pourquoi elle existe.</em></h1><div class="about-hero__sig">Nolan Ribeiro · Nolan Arc</div></section>
    <section class="arc-meaning scroll-scene" data-scene="arc-meaning"><div class="arc-meaning__sticky scene-sticky"><div class="arc-meaning__word">ARC</div><div class="arc-meaning__items"><article><span>01</span><h2>Arc narratif</h2><p>Une histoire se transforme.</p></article><article><span>02</span><h2>Arc de lumière</h2><p>Une image révèle en choisissant.</p></article><article><span>03</span><h2>Arc de trajectoire</h2><p>Un point mène à un autre.</p></article><article><span>04</span><h2>Arc architectural</h2><p>Une forme tient parce que ses parties travaillent ensemble.</p></article></div></div></section>
    <section class="principles-grid"><article><span>01</span><h2>Intention</h2><p>Comprendre avant d’exécuter.</p></article><article><span>02</span><h2>Authenticité</h2><p>Révéler plutôt que fabriquer lorsque le réel suffit.</p></article><article><span>03</span><h2>Invisible</h2><p>Une bonne décision n’a pas besoin de se faire remarquer.</p></article><article><span>04</span><h2>Cohérence</h2><p>Le cadre, le son, le rythme et le message doivent raconter la même chose.</p></article></section>
  </main>` + footer();
}

export function journalPage(){
  return head({title:'Journal — Nolan Arc',description:'Notes de Nolan Arc sur le cadrage, la mise en scène, le rythme et l’intention.',path:'/journal/',bodyClass:'page-journal'}) + header('/journal/') + arcRail() + `<main>
    <section class="journal-hero"><span class="eyebrow">Journal</span><h1>Des notes sur<br><em>ce qu’on ne voit pas.</em></h1><p>Pas une usine SEO. Des réflexions qui prolongent les projets et rendent les décisions lisibles.</p></section>
    <section class="journal-stack">${notes.map((n,i)=>`<article id="${n.slug}"><span>0${i+1}</span><small>${n.category} · ${n.date}</small><h2>${n.title}</h2><p>${n.excerpt}</p><a class="text-link" href="/contact/?intent=other">Discuter de cette réflexion <span>↗</span></a></article>`).join('')}</section>
    <section class="journal-to-work"><h2>La réflexion ne vaut que si elle revient à l’image.</h2><a class="button" href="/work/">Retour au Work <span>↗</span></a></section>
  </main>` + footer();
}

export function contactPage(){
  return head({title:'Contact — Nolan Arc',description:'Parler d’un film, d’une direction artistique ou d’un moment à Nolan Arc.',path:'/contact/',bodyClass:'page-contact'}) + header() + arcRail() + `<main>
    <section class="contact-hero"><span class="eyebrow">Contact</span><h1>Parlons de<br>votre <em>intention.</em></h1><p>Vous pouvez arriver avec un brief complet, une idée floue ou simplement un problème à résoudre.</p></section>
    <section class="contact-shell"><form class="contact-form" data-contact-form action="https://formsubmit.co/ajax/${site.email}" method="POST"><input type="text" name="_honey" tabindex="-1" autocomplete="off" class="honeypot"><input type="hidden" name="_subject" value="Nouveau projet — nolanarc.com"><input type="hidden" name="_url" value="https://nolanarc.com/contact/"><input type="hidden" name="_template" value="table"><div class="form-intent"><button type="button" data-form-intent="brand">Marque</button><button type="button" data-form-intent="moment">Moment</button><button type="button" data-form-intent="other">Autre</button><input type="hidden" name="type_de_projet" data-intent-input value="Autre"></div><label>Votre nom<input required name="nom" autocomplete="name"></label><label>Votre email<input required type="email" name="email" autocomplete="email"></label><label>Entreprise <small>optionnel</small><input name="entreprise" autocomplete="organization"></label><label>Budget <small>optionnel</small><select name="budget"><option value="">Non défini</option><option>&lt; 1 500 €</option><option>1 500 – 3 000 €</option><option>3 000 – 7 500 €</option><option>7 500 € +</option></select></label><label class="form-wide">Votre projet<textarea required name="message" rows="6" placeholder="Contexte, objectif, date, ce que vous avez déjà…"></textarea></label><p class="form-privacy form-wide">Les informations envoyées servent uniquement à répondre à votre demande et à préparer, si nécessaire, une relation contractuelle. Elles transitent par notre prestataire de formulaire. <a href="/confidentialite/">Voir la politique de confidentialité</a>.</p><button class="button" type="submit" data-submit>Envoyer <span>↗</span></button><p class="form-status" role="status" data-form-status></p></form><aside class="contact-direct"><span class="eyebrow">Plus direct</span><a href="mailto:${site.email}">${site.email}</a><p>${site.responseTime}</p><a href="${site.calendly}" target="_blank" rel="noreferrer">Réserver 30 min ↗</a><a href="${site.instagram}" target="_blank" rel="noreferrer">Instagram ↗</a></aside></section>
  </main>` + footer();
}

const legalValue = (value, fallback='À compléter avant publication') => value ? esc(value) : `<strong class="legal-missing">${fallback}</strong>`;

export function legalPage(){
  const vat = legal.vat ? esc(legal.vat) : 'Non renseigné / à confirmer selon le régime fiscal réel';
  return head({title:'Mentions légales — Nolan Arc',description:'Mentions légales du site Nolan Arc.',path:'/mentions-legales/',bodyClass:'page-legal'}) + header() + `<main><article class="legal-content"><span class="eyebrow">Informations légales</span><h1>Mentions légales</h1>
  <h2>Éditeur du site</h2><p><strong>${esc(site.legalName)}</strong>${legal.businessForm ? ` — ${esc(legal.businessForm)}` : ''}, exerçant sous l’identité professionnelle <strong>${esc(site.name)}</strong>.<br>Adresse professionnelle : ${legalValue(legal.registeredAddress)}.<br>Téléphone : ${legalValue(legal.phone)}.<br>Email : <a href="mailto:${site.email}">${esc(site.email)}</a>.<br>SIREN : ${legalValue(legal.siren)}.<br>SIRET : ${legalValue(legal.siret)}.<br>Code APE : ${legalValue(legal.ape)}.<br>TVA : ${vat}.</p>
  <h2>Directeur de la publication</h2><p>${esc(legal.publicationDirector)}.</p>
  <h2>Hébergement</h2><p>${esc(legal.host.name)}, ${esc(legal.host.address)} — <a href="${esc(legal.host.website)}" rel="noreferrer">${esc(legal.host.website)}</a>.</p>
  <h2>Propriété intellectuelle</h2><p>Sauf mention contraire, les textes, photographies, films, éléments graphiques et créations présentés sur ce site sont protégés par les droits de propriété intellectuelle de leurs auteurs et ayants droit. Toute réutilisation dépassant les exceptions prévues par la loi nécessite l’autorisation préalable du titulaire concerné.</p>
  <h2>Données personnelles et traceurs</h2><p>Les informations détaillées sur les traitements de données sont disponibles dans la <a href="/confidentialite/">politique de confidentialité</a>. Les choix relatifs aux contenus externes sont décrits dans la page <a href="/cookies/">Cookies et contenus externes</a>.</p>
  <h2>Conditions commerciales</h2><p>Les prestations sont encadrées par les <a href="/cgv/">Conditions générales de vente et de prestation de services</a>, complétées par le devis ou contrat accepté pour chaque projet.</p>
  </article></main>` + footer();
}

export function privacyPage(){
  return head({title:'Confidentialité — Nolan Arc',description:'Politique de confidentialité et traitement des données personnelles sur nolanarc.com.',path:'/confidentialite/',bodyClass:'page-legal'}) + header() + `<main><article class="legal-content"><span class="eyebrow">Vie privée</span><h1>Politique de confidentialité</h1>
  <h2>Responsable du traitement</h2><p>${esc(site.legalName)}${legal.businessForm ? ` — ${esc(legal.businessForm)}` : ''}, adresse : ${legalValue(legal.registeredAddress)}, contact : <a href="mailto:${legal.privacyContact}">${esc(legal.privacyContact)}</a>.</p>
  <h2>Formulaire de contact</h2><p>Lorsque vous utilisez le formulaire, sont traitées les informations que vous renseignez : nom, adresse email, entreprise éventuelle, catégorie et description du projet, budget éventuel, ainsi que les informations librement ajoutées dans le message. La finalité est de répondre à votre demande, d’évaluer la possibilité d’une collaboration et, le cas échéant, de prendre des mesures précontractuelles à votre demande.</p>
  <p>Les champs obligatoires sont signalés dans le formulaire. Sans nom, adresse email et description du projet, il n’est pas possible de traiter correctement la demande.</p>
  <h2>Base juridique</h2><p>Lorsqu’une demande concerne la préparation d’un projet ou d’un devis, le traitement est fondé sur les mesures précontractuelles prises à votre demande. Pour une sollicitation générale sans perspective contractuelle immédiate, la réponse peut reposer sur l’intérêt légitime de Nolan Arc à traiter les messages qui lui sont adressés.</p>
  <h2>Destinataires</h2><p>Les données sont accessibles à Nolan Arc et transitent, pour l’envoi technique du formulaire, par ${esc(legal.formProcessor.name)}. Ce prestataire indique conserver les soumissions pendant 30 jours. Les informations relatives à ce prestataire et à ses propres traitements doivent être vérifiées avant toute activation du formulaire en production.</p>
  <h2>Durées de conservation</h2><p>Les demandes de prospects qui ne débouchent pas sur une relation contractuelle sont conservées au maximum selon la règle suivante : ${esc(legal.prospectRetention)}. Lorsqu’une relation contractuelle est conclue, les données nécessaires à l’exécution, à la facturation et à la défense des droits sont conservées selon les durées légales applicables : ${esc(legal.clientRetention)}.</p>
  <h2>Vos droits</h2><p>Vous pouvez demander l’accès, la rectification, l’effacement ou la limitation de vos données et exercer, selon le fondement du traitement, vos droits d’opposition et de portabilité. Pour exercer vos droits : <a href="mailto:${legal.privacyContact}">${esc(legal.privacyContact)}</a>. Vous pouvez également introduire une réclamation auprès de la CNIL.</p>
  <h2>Contenus et services tiers</h2><p>Les vidéos YouTube intégrées ne sont pas chargées automatiquement : une action explicite est demandée avant l’activation du lecteur externe. Les liens vers Instagram, YouTube et Calendly ouvrent les services concernés ; leurs propres politiques s’appliquent lorsque vous quittez nolanarc.com.</p>
  <h2>Sécurité</h2><p>Le site limite les données collectées au nécessaire et n’embarque pas d’outil publicitaire ou d’analytics tiers dans cette version. Les échanges avec les services externes restent soumis aux mesures de sécurité et aux conditions propres de ces prestataires.</p>
  <p class="legal-update">Dernière mise à jour : 13 août 2026.</p></article></main>` + footer();
}

export function cookiesPage(){
  return head({title:'Cookies et contenus externes — Nolan Arc',description:'Informations sur les cookies, traceurs et contenus externes utilisés sur nolanarc.com.',path:'/cookies/',bodyClass:'page-legal'}) + header() + `<main><article class="legal-content"><span class="eyebrow">Traceurs</span><h1>Cookies & contenus externes</h1>
  <h2>Principe</h2><p>Cette version de nolanarc.com n’utilise pas d’outil publicitaire, de profilage ni d’analytics tiers. Le site n’enregistre pas votre parcours dans le navigateur pour personnaliser la visite.</p>
  <h2>Vidéo YouTube</h2><p>Le lecteur vidéo externe n’est créé qu’après votre clic sur le bouton permettant de charger YouTube. Avant cette action, aucun iframe YouTube n’est présent dans la page. En activant le lecteur, votre navigateur communique avec YouTube et ce service peut traiter des informations conformément à ses propres règles.</p>
  <h2>Liens externes</h2><p>Les liens vers Instagram, YouTube et Calendly n’activent pas ces services tant que vous ne les ouvrez pas. Une fois le site tiers ouvert, ses propres règles en matière de cookies et de données personnelles s’appliquent.</p>
  <h2>Évolution du site</h2><p>Si un outil de mesure d’audience ou tout autre traceur non exempté devait être ajouté ultérieurement, le mécanisme de consentement devra être adapté avant son activation.</p>
  <p class="legal-update">Dernière mise à jour : 13 août 2026.</p></article></main>` + footer();
}

export function cgvPage(){
  const mediator = legal.mediator.name ? `${esc(legal.mediator.name)} — ${esc(legal.mediator.address)} — <a href="${esc(legal.mediator.website)}" rel="noreferrer">${esc(legal.mediator.website)}</a>` : `Coordonnées du médiateur de la consommation non encore renseignées. Pour toute réclamation préalable : <a href="mailto:${site.email}">${esc(site.email)}</a>.`;
  return head({title:'CGV — Nolan Arc',description:'Conditions générales de vente et de prestation de services Nolan Arc.',path:'/cgv/',bodyClass:'page-legal'}) + header() + `<main><article class="legal-content"><span class="eyebrow">Conditions commerciales</span><h1>Conditions générales de vente et de prestation de services</h1>
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
  return head({title:'Rétractation — Nolan Arc',description:'Informations et modèle de formulaire de rétractation pour les contrats à distance conclus avec un consommateur.',path:'/retractation/',bodyClass:'page-legal'}) + header() + `<main><article class="legal-content"><span class="eyebrow">Consommateurs</span><h1>Droit de rétractation</h1>
  <h2>Principe</h2><p>Pour un contrat de prestation de services conclu à distance avec un consommateur, un droit de rétractation de quatorze jours à compter de la conclusion du contrat s’applique en principe, sauf exception prévue par la loi. Les conditions particulières applicables à votre projet sont rappelées avant la conclusion du contrat.</p>
  <h2>Demande d’exécution anticipée</h2><p>Si vous souhaitez que la prestation commence avant l’expiration du délai de rétractation, une demande expresse peut être nécessaire. Lorsque les conditions légales d’une perte du droit de rétractation sont réunies après exécution complète, une information et un accord spécifiques sont recueillis avant le commencement de la prestation.</p>
  <h2>Exercer votre droit</h2><p>Vous pouvez envoyer une déclaration dénuée d’ambiguïté à <a href="mailto:${site.email}">${esc(site.email)}</a>, ou utiliser le modèle ci-dessous.</p>
  <div class="withdrawal-model"><h3>Modèle de formulaire</h3><p>À l’attention de ${esc(site.legalName)}, ${legalValue(legal.registeredAddress)}, ${esc(site.email)} :</p><p>Je vous notifie par la présente ma rétractation du contrat portant sur la prestation suivante : […]</p><p>Contrat/devis accepté le : […]<br>Nom du consommateur : […]<br>Adresse du consommateur : […]<br>Date : […]<br>Signature (uniquement en cas de formulaire papier) : […]</p></div>
  <p class="legal-update">Dernière mise à jour : 13 août 2026.</p></article></main>` + footer();
}

export function notFoundPage(){
  return head({title:'404 — Nolan Arc',description:'Cette page n’existe pas.',path:'/404/',bodyClass:'page-404'}) + header() + `<main class="not-found"><span>404</span><h1>Ce plan<br><em>n’existe pas.</em></h1><a class="button" href="/work/">Retour au Work <span>↗</span></a></main>` + footer();
}
