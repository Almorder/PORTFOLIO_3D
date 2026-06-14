window.addEventListener('scroll', function initGTM() {
      const script = document.createElement('script');
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-EBFDQNBW60';
      script.async = true;
      document.head.appendChild(script);
      window.dataLayer=window.dataLayer||[];
      function gtag(){dataLayer.push(arguments);}
      gtag('js',new Date());
      gtag('config','G-EBFDQNBW60');
      window.removeEventListener('scroll', initGTM);
    }, {once: true, passive: true});

// --- NEXT SCRIPT ---

{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://nolanarc.com/#nolan",
      "name": "Nolan Arc",
      "alternateName": "Nolan Arc",
      "jobTitle": "Réalisateur",
      "description": "Réalisateur freelance spécialisé en films de marque, vidéaste mariage et direction artistique. Basé en France, disponible partout.",
      "url": "https://nolanarc.com",
      "image": "https://nolanarc.com/og-cover.png",
      "sameAs": [
        "https://instagram.com/nolan.arc_",
        "https://youtube.com/@nolanarc",
        "https://www.youtube.com/channel/@nolanarc"
      ],
      "knowsAbout": [
        "Films de marque",
        "Vidéaste mariage",
        "Direction artistique",
        "Réalisation vidéo",
        "Film institutionnel",
        "Demande en mariage filmée",
        "Contenu réseaux sociaux"
      ],
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "FR"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "nolanribcontact&#64;gmail.com",
        "contactType": "customer service",
        "availableLanguage": "French"
      }
    },
    {
      "@type": "ProfessionalService",
      "@id": "https://nolanarc.com/#service",
      "name": "Nolan Arc, Réalisation vidéo",
      "provider": {
        "@id": "https://nolanarc.com/#nolan"
      },
      "description": "Films de marque, vidéaste mariage et direction artistique en France.",
      "areaServed": "France",
      "serviceType": [
        "Film de marque",
        "Vidéaste mariage",
        "Direction artistique"
      ],
      "url": "https://nolanarc.com"
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://nolanarc.com/#business",
      "name": "Nolan Arc",
      "description": "Réalisateur freelance - films de marque, mariages, direction artistique. Basé en France, disponible partout.",
      "url": "https://nolanarc.com",
      "email": "nolanribcontact&#64;gmail.com",
      "priceRange": "À partir de 1500€",
      "currenciesAccepted": "EUR",
      "paymentAccepted": "Virement bancaire",
      "areaServed": "France",
      "serviceType": [
        "Film de marque",
        "Vidéaste mariage",
        "Direction artistique"
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Services de réalisation vidéo",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Film de marque"
            },
            "description": "Film institutionnel, présentation produit, contenu réseaux"
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Film de mariage"
            },
            "priceSpecification": {
              "@type": "PriceSpecification",
              "price": "1500",
              "priceCurrency": "EUR",
              "description": "Film 30 min, captation demi-journée, montage et rendu"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Direction artistique"
            },
            "description": "Stratégie visuelle, cohérence de marque, conseil créatif"
          }
        ]
      },
      "sameAs": [
        "https://instagram.com/nolan.arc_",
        "https://youtube.com/@nolanarc"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://nolanarc.com/#website",
      "url": "https://nolanarc.com",
      "name": "Nolan Arc",
      "description": "Portfolio de Nolan Arc, réalisateur films de marque et événementiel.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://nolanarc.com/?s={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://nolanarc.com/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Comment se passe une collaboration concrètement ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "On commence par un échange pour que je comprenne ton projet, ton univers et ce que tu veux transmettre. Je construis ensuite une vision, pas juste un devis. Tournage, montage, rendu : je gère tout seul, de A à Z. Le résultat, tu le reçois prêt à publier."
          }
        },
        {
          "@type": "Question",
          "name": "Tu travailles partout en France ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Oui. Je suis basé en France et je me déplace sur tout le territoire. Pour les projets à l'étranger, c'est envisageable, dis-moi où tu en es et on voit ensemble."
          }
        },
        {
          "@type": "Question",
          "name": "Quels sont tes délais de livraison ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Pour un film de marque, compte en général 2 à 4 semaines après le tournage. Pour un film de mariage, je livre en 4 à 8 semaines. Je prends le temps qu'il faut, pas question de bâcler le montage."
          }
        },
        {
          "@type": "Question",
          "name": "Est-ce que tu travailles avec des équipes ou seul ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Seul, de la conception au rendu. C'est une décision volontaire, pas une contrainte. Quand une vision passe par trop de mains, elle perd quelque chose. Tu travailles avec moi du début à la fin."
          }
        },
        {
          "@type": "Question",
          "name": "Tu as des tarifs indicatifs ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Chaque projet est différent, je ne travaille pas sur catalogue. Dis-moi ce que tu as en tête et je te fais une proposition adaptée. Ce qui compte, c'est qu'on soit alignés sur la vision avant de parler budget.→ Me parler de ton projet"
          }
        },
        {
          "@type": "Question",
          "name": "C'est quoi le budget pour un film de mariage ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "À partir de 1 500 € pour un film de 30 minutes. Ce tarif comprend la captation le jour J jusqu'à une demi-journée sur place, le montage et le rendu final. Chaque projet est unique, le tarif peut évoluer selon la durée ou le format souhaité. Dis-moi ce que tu as en tête et je te fais une proposition sur mesure.→ Me parler de ton projet"
          }
        },
        {
          "@type": "Question",
          "name": "Est-ce qu'on peut voir des exemples de ton travail ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Remonte jusqu'à la section Work. Tu retrouves aussi mes réalisations sur @nolan.arc_ et sur YouTube @nolanarc. Tout est là."
          }
        }
      ]
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://nolanarc.com/#reviews",
      "name": "Nolan Arc",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5",
        "bestRating": "5",
        "worstRating": "1",
        "ratingCount": "6",
        "reviewCount": "6"
      },
      "review": [
        {
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": "Matthieu"
          },
          "reviewBody": "Franchement Nolan a un vrai mindset de créateur. Il ne se contente pas de filmer, il réfléchit à ce qu'il veut raconter et pourquoi. Il est structuré, il bosse sérieusement et ça se voit dans sa progression.",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5",
            "bestRating": "5"
          },
          "description": "Ouilove · Direction artistique"
        },
        {
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": "Nawel & Yanis"
          },
          "reviewBody": "J'ai enfin regardé le film avec Yanis, franchement merci beaucoup il était incroyable, pile comme je l'imaginais. T'as géré merci beaucoup pour ton travail !",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5",
            "bestRating": "5"
          },
          "description": "Film de mariage"
        },
        {
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": "Anthony Cosmopol"
          },
          "reviewBody": "Salut champion, merci pour hier t'as géré de fou, c'était intense mais franchement cool ! Et merci pour les rush !",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5",
            "bestRating": "5"
          },
          "description": "ISC Paris · Teaser d'association"
        },
        {
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": "Lola"
          },
          "reviewBody": "Elle est vraiment super stylée !! Tes plans nous mettent grave en valeur, ça fait plaisir. Bravoooo et merci encore !",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5",
            "bestRating": "5"
          },
          "description": "Modèle · Création de contenu bijoux"
        },
        {
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": "A One Permis"
          },
          "reviewBody": "Coucou, incroyable la vidéo merci !! Les patrons ont kiffé !",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5",
            "bestRating": "5"
          },
          "description": "Contenu réseaux sociaux"
        },
        {
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": "Reka Force Security"
          },
          "reviewBody": "C'est vraiment fort ce que tu as fait Nolan 💪",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5",
            "bestRating": "5"
          },
          "description": "Direction artistique"
        }
      ]
    },
    {
      "@type": "VideoObject",
      "@id": "https://nolanarc.com/#video-film-de-marque",
      "name": "Film de marque",
      "description": "Film de marque réalisé par Nolan Arc",
      "creator": {
        "@id": "https://nolanarc.com/#nolan-arc"
      },
      "producer": {
        "@id": "https://nolanarc.com/#nolan-arc"
      },
      "genre": "Film de marque",
      "inLanguage": "fr",
      "contentUrl": "https://nolanarc.com/#work",
      "thumbnailUrl": "https://nolanarc.com/og-cover.png",
      "uploadDate": "2024-01-01"
    },
    {
      "@type": "VideoObject",
      "@id": "https://nolanarc.com/#video-film-de-mariage",
      "name": "Film de mariage",
      "description": "Film de mariage réalisé par Nolan Arc",
      "creator": {
        "@id": "https://nolanarc.com/#nolan-arc"
      },
      "producer": {
        "@id": "https://nolanarc.com/#nolan-arc"
      },
      "genre": "Film de mariage",
      "inLanguage": "fr",
      "contentUrl": "https://nolanarc.com/#work",
      "thumbnailUrl": "https://nolanarc.com/og-cover.png",
      "uploadDate": "2024-01-01"
    },
    {
      "@type": "VideoObject",
      "@id": "https://nolanarc.com/#video-direction-artistique",
      "name": "Direction artistique",
      "description": "Projet de direction artistique par Nolan Arc",
      "creator": {
        "@id": "https://nolanarc.com/#nolan-arc"
      },
      "producer": {
        "@id": "https://nolanarc.com/#nolan-arc"
      },
      "genre": "Direction artistique",
      "inLanguage": "fr",
      "contentUrl": "https://nolanarc.com/#work",
      "thumbnailUrl": "https://nolanarc.com/og-cover.png",
      "uploadDate": "2024-01-01"
    },
    {
      "@type": "VideoObject",
      "@id": "https://www.youtube.com/watch?v=GbeOQ-hgrtU&list=PLn7OW-nf3PhrYZLGauIIXV9xRmx_y8on_",
      "name": "Court métrage",
      "description": "Court métrage réalisé pour le festival 1minute2court",
      "creator": {
        "@id": "https://nolanarc.com/#nolan-arc"
      },
      "producer": {
        "@id": "https://nolanarc.com/#nolan-arc"
      },
      "genre": "Film institutionnel",
      "inLanguage": "fr",
      "contentUrl": "https://nolanarc.com/#leboldenface",
      "thumbnailUrl": "https://nolanarc.com/og-cover.png",
      "uploadDate": "2026-06-01"
    },
    {
      "@type": "VideoObject",
      "@id": "https://nolanarc.com/#video-demande-en-mariage-filmée",
      "name": "Demande en mariage filmée",
      "description": "Demande en mariage filmée par Nolan Arc",
      "creator": {
        "@id": "https://nolanarc.com/#nolan-arc"
      },
      "producer": {
        "@id": "https://nolanarc.com/#nolan-arc"
      },
      "genre": "Événementiel",
      "inLanguage": "fr",
      "contentUrl": "https://nolanarc.com/#work",
      "thumbnailUrl": "https://nolanarc.com/og-cover.png",
      "uploadDate": "2024-01-01"
    },
    {
      "@type": "VideoObject",
      "@id": "https://nolanarc.com/#video-contenu-social",
      "name": "Contenu social",
      "description": "Contenu réseaux sociaux réalisé par Nolan Arc",
      "creator": {
        "@id": "https://nolanarc.com/#nolan-arc"
      },
      "producer": {
        "@id": "https://nolanarc.com/#nolan-arc"
      },
      "genre": "Contenu réseaux sociaux",
      "inLanguage": "fr",
      "contentUrl": "https://nolanarc.com/#work",
      "thumbnailUrl": "https://nolanarc.com/og-cover.png",
      "uploadDate": "2024-01-01"
    },
    {
      "@type": "VideoObject",
      "@id": "https://nolanarc.com/#video-stratégie-visuelle",
      "name": "Stratégie visuelle",
      "description": "Stratégie visuelle et direction artistique par Nolan Arc",
      "creator": {
        "@id": "https://nolanarc.com/#nolan-arc"
      },
      "producer": {
        "@id": "https://nolanarc.com/#nolan-arc"
      },
      "genre": "Direction artistique",
      "inLanguage": "fr",
      "contentUrl": "https://nolanarc.com/#work",
      "thumbnailUrl": "https://nolanarc.com/og-cover.png",
      "uploadDate": "2024-01-01"
    },
    {
      "@type": "WebPage",
      "@id": "https://nolanarc.com/#webpage",
      "url": "https://nolanarc.com",
      "name": "Nolan Arc - Réalisateur, Films de marque & Événementiel",
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": [
          ".hero-claim",
          ".hero-kicker",
          ".hero-stats",
          ".sc-desc",
          ".verd-text",
          ".verd-last",
          ".about-quote",
          ".contact-title",
          ".faq-a-inner"
        ]
      },
      "description": "Nolan Arc est réalisateur freelance en France. Spécialisé en films de marque, films de mariage et direction artistique. Seul, de la conception au rendu.",
      "about": {
        "@type": "Person",
        "@id": "https://nolanarc.com/#nolan-arc"
      }
    }
  ]
}

// --- NEXT SCRIPT ---

(function(){
  var tw=document.getElementById('tw');
  if(!tw)return;
  var words=['Je regarde ce qu\'on ne voit pas.','Même les marques ont une histoire.','Tout s\'estompe, sauf les images.','Les détails qui changent tout.','Le vrai suffit souvent.','Si on filme, c\'est pour raconter.'];
  var i=0,c=0,del=false;
  function tick(){
    var w=words[i];
    if(!del){tw.textContent=w.slice(0,++c);if(c===w.length){del=true;setTimeout(tick,1800);return;}setTimeout(tick,65);}
    else{tw.textContent=w.slice(0,--c);if(c===0){del=false;i=(i+1)%words.length;setTimeout(tick,380);return;}setTimeout(tick,34);}
  }
  tick();
})();

// --- NEXT SCRIPT ---

function switchContactTab(tabId, btn) {
    if (tabId === 'calendly-tab') {
      const iframe = document.querySelector('#calendly-tab iframe');
      if (iframe && iframe.getAttribute('data-src')) {
        iframe.setAttribute('src', iframe.getAttribute('data-src'));
        iframe.removeAttribute('data-src');
      }
    }
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(tabId).classList.add('active');
      }

      function updateFormProgress(step) {
        const bar = document.getElementById('cfProgressBar');
        const steps = document.querySelectorAll('.cf-progress-step');
        if (step === 1) {
          if (bar) bar.style.width = '50%';
          if (steps.length >= 2) {
            steps[0].className = 'cf-progress-step active';
            steps[1].className = 'cf-progress-step';
          }
        } else if (step === 2) {
          if (bar) bar.style.width = '100%';
          if (steps.length >= 2) {
            steps[0].className = 'cf-progress-step done';
            steps[1].className = 'cf-progress-step active';
          }
        }
      }

      function nextFormStep() {
        const type = document.querySelector('input[name="type"]:checked');
        const budget = document.querySelector('input[name="budget"]:checked');
        const timeline = document.querySelector('input[name="timeline"]:checked');

        if (!type || !budget || !timeline) {
          alert("S'il te plaît, sélectionne une option pour chaque question avant de continuer.");
          return;
        }

        document.getElementById('form-step-1').classList.remove('active');
        document.getElementById('form-step-2').classList.add('active');
        updateFormProgress(2);
      }

      function prevFormStep() {
        document.getElementById('form-step-2').classList.remove('active');
        document.getElementById('form-step-1').classList.add('active');
        updateFormProgress(1);
      }

      document.addEventListener('DOMContentLoaded', () => {
        const typeRadios = document.querySelectorAll('input[name="type"]');
        const budgetRadios = document.querySelectorAll('input[name="budget"]');
        const timelineRadios = document.querySelectorAll('input[name="timeline"]');
        
        const checkAutoAdvance = () => {
          const typeChecked = document.querySelector('input[name="type"]:checked');
          const budgetChecked = document.querySelector('input[name="budget"]:checked');
          const timelineChecked = document.querySelector('input[name="timeline"]:checked');
          
          if (typeChecked) typeChecked.closest('.cf-field').classList.add('field-filled');
          if (budgetChecked) budgetChecked.closest('.cf-field').classList.add('field-filled');
          if (timelineChecked) timelineChecked.closest('.cf-field').classList.add('field-filled');

          if (typeChecked && budgetChecked && timelineChecked) {
            setTimeout(nextFormStep, 350); // Auto-advance slightly delayed for premium transition feel
          }
        };

        typeRadios.forEach(r => r.addEventListener('change', checkAutoAdvance));
        budgetRadios.forEach(r => r.addEventListener('change', checkAutoAdvance));
        timelineRadios.forEach(r => r.addEventListener('change', checkAutoAdvance));

        // Required text fields highlight
        const textInputs = document.querySelectorAll('.cf-input');
        textInputs.forEach(input => {
          const field = input.closest('.cf-field');
          if (!field) return;
          const checkVal = () => {
            if (input.value.trim() !== "") {
              field.classList.add('field-filled');
            } else {
              field.classList.remove('field-filled');
            }
          };
          input.addEventListener('input', checkVal);
          input.addEventListener('change', checkVal);
          // Initial check
          checkVal();
        });
      });

// --- NEXT SCRIPT ---

/* ── PAGE LOADER */
const loader = document.getElementById('loader');
const MIN_LOAD = 1200;
const startTime = Date.now();
const alreadyVisited = sessionStorage.getItem('nolan_visited');
if(alreadyVisited && loader){
  loader.style.display = 'none';
} else {
  // Plan fixe : 800ms cadre noir pur, puis on révèle l'UI
  setTimeout(() => { if(loader) loader.classList.add('reveal-ui'); }, 800);
  window.addEventListener('load', () => {
    sessionStorage.setItem('nolan_visited','1');
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, MIN_LOAD - elapsed);
    setTimeout(() => {
      loader.classList.add('hide');
      setTimeout(() => { loader.style.display = 'none'; }, 700);
    }, remaining);
  });
}

/* ── PAGE TRANSITIONS */
const pageTransition = document.getElementById('pageTransition');
function doTransition(href) {
  if(pageTransition) pageTransition.classList.add('leaving');
  setTimeout(() => { window.location.href = href; }, 480);
}
// Intercept internal links (project pages etc)
document.addEventListener('click', e => {
  const a = e.target.closest('a');
  if (!a) return;
  const href = a.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto') ||
      href.startsWith('http') || a.target === '_blank') return;
  e.preventDefault();
  doTransition(href);
});
// On page show (back/forward), clear transition
window.addEventListener('pageshow', () => {
  if(pageTransition) pageTransition.classList.remove('leaving');
});

/* ── COOKIE CONSENT */
function acceptCookies() {
  localStorage.setItem('cookie_consent', 'accepted');
  document.getElementById('cookieBanner').classList.remove('show');
}
function rejectCookies() {
  localStorage.setItem('cookie_consent', 'rejected');
  document.getElementById('cookieBanner').classList.remove('show');
}
(function initCookie() {
  const consent = localStorage.getItem('cookie_consent');
  if (!consent) {
    setTimeout(() => document.getElementById('cookieBanner').classList.add('show'), 2000);
  }
})();

/* ── FAQ ACCORDION */
(function(){
  function initFaq() {
    document.querySelectorAll('#faqAccordion .faq-q, .faq-list .faq-q').forEach(btn => {
      btn.addEventListener('click', function() {
        const item = this.closest('.faq-item');
        const isOpen = item.classList.contains('open');
        // Fermer tous
        document.querySelectorAll('.faq-item.open').forEach(i => {
          i.classList.remove('open');
        });
        // Ouvrir si était fermé
        if(!isOpen) {
          item.classList.add('open');
        }
      });
    });
  }
  // Init au chargement
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFaq);
  } else {
    initFaq();
  }
})();

/* ── EASTER EGG, Konami code → ellipse explosion */
(function() {
  const seq = [38,38,40,40,37,39,37,39,66,65];
  let idx = 0;
  document.addEventListener('keydown', e => {
    if (e.keyCode === seq[idx]) {
      idx++;
      if (idx === seq.length) {
        idx = 0;
        triggerEasterEgg();
      }
    } else { idx = 0; }
  });
  function triggerEasterEgg() {
    const msg = document.createElement('div');
    msg.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;
      text-align:center;pointer-events:none;animation:eggAnim 3s ease forwards;`;
    msg.innerHTML = `<div style="font-family:'Yrsa',serif;font-size:clamp(2rem,6vw,4rem);font-style:italic;color:#f0ebe2;line-height:1.2;">
      Tu as trouvé l'arc.<br><em style="color:#cc460c;">Bien joué.</em></div>`;
    const style = document.createElement('style');
    style.textContent = `@keyframes eggAnim{0%{opacity:0;transform:translate(-50%,-50%) scale(.8);}20%{opacity:1;transform:translate(-50%,-50%) scale(1);}80%{opacity:1;}100%{opacity:0;transform:translate(-50%,-50%) scale(1.1);}}`;
    document.head.appendChild(style);
    document.body.appendChild(msg);
    // Spawn orange particles
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      const angle = (i / 18) * Math.PI * 2;
      const dist = 120 + Math.random() * 80;
      p.style.cssText = `position:fixed;top:50%;left:50%;width:4px;height:4px;border-radius:50%;
        background:#cc460c;z-index:9998;pointer-events:none;
        animation:particle${i} 1.5s ease forwards;`;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      style.textContent += `@keyframes particle${i}{0%{transform:translate(-50%,-50%);opacity:1;}100%{transform:translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px));opacity:0;}}`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1600);
    }
    setTimeout(() => { msg.remove(); }, 3100);
  }
})();



/* ── PAGE TRANSITIONS, disabled in preview, enable on real domain */
// Uncomment below when deployed to nolanarc.com
/*
const pt = document.getElementById('page-transition');
document.querySelectorAll('a[href]:not([href^="#"]):not([href^="mailto"]):not([href^="http"]):not([href^="tel"])').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const href = link.getAttribute('href');
    pt.classList.add('entering');
    setTimeout(()=>{ window.location.href = href; }, 480);
  });
});
*/

/* CURSOR */
const cur=document.getElementById('cur'),ring=document.getElementById('cur-ring');
if(cur){
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx+'px';cur.style.top=my+'px';});
  (function loop(){rx+=(mx-rx)*.1;ry+=(my-ry)*.1;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(loop);})();
}

/* PROGRESS */
const prog=document.getElementById('prog');
const scrollBar=document.getElementById('scrollProgress');
function updateProgress(){
  const pct=(window.scrollY/(document.body.scrollHeight-window.innerHeight)*100)+'%';
  if(prog) prog.style.width=pct;
  if(scrollBar) scrollBar.style.width=pct;
}
window.addEventListener('scroll', updateProgress, {passive:true});

/* REVEAL */
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)setTimeout(()=>e.target.classList.add('on'),parseInt(e.target.dataset.delay)||0);});
},{threshold:.06});
document.querySelectorAll('.reveal').forEach((el,i)=>{el.dataset.delay=(i%4)*80;io.observe(el);});

/* PARALLAX */
window.addEventListener('scroll',()=>{
  const sy=window.scrollY;
  document.querySelectorAll('.parallax-bg').forEach(el=>{
    el.style.transform=`translateY(${sy*(parseFloat(el.dataset.speed)||.2)}px)`;
  });
},{ passive:true });

/* counter handled above */

/* TILT 3D */
document.querySelectorAll('.tilt-card').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    card.style.transform=`perspective(800px) rotateY(${x*12}deg) rotateX(${-y*10}deg) translateZ(6px)`;
    card.style.boxShadow=`${-x*20}px ${y*20}px 40px rgba(0,0,0,.4),0 0 30px rgba(204,70,12,.08)`;
  });
  card.addEventListener('mouseleave',()=>{
    card.style.transform='perspective(800px) rotateY(0) rotateX(0) translateZ(0)';
    card.style.boxShadow='none';
    card.style.transition='transform .6s cubic-bezier(.16,1,.3,1),box-shadow .6s';
    setTimeout(()=>card.style.transition='',600);
  });
});

/* WORK FILTER handled via unified controller in section V2 */

/* MOBILE MENU */
const menuBtn=document.getElementById('menuBtn');
const mobileNav=document.getElementById('mobileNav');
function closeMobile(){mobileNav.classList.remove('open');document.body.classList.remove('menu-open');menuBtn.querySelectorAll('span')[0].style.transform='';menuBtn.querySelectorAll('span')[1].style.opacity='1';menuBtn.querySelectorAll('span')[2].style.transform='';}
menuBtn.addEventListener('click',()=>{
  const open=mobileNav.classList.toggle('open');
  document.body.classList.toggle('menu-open', open);
  const spans=menuBtn.querySelectorAll('span');
  if(open){spans[0].style.transform='translateY(6px) rotate(45deg)';spans[1].style.opacity='0';spans[2].style.transform='translateY(-6px) rotate(-45deg)';}
  else{spans[0].style.transform='';spans[1].style.opacity='1';spans[2].style.transform='';}
});

/* ── VIDEO THUMBNAILS, auto-load when IDs are set */
document.querySelectorAll('.work-item[data-video]').forEach(item=>{
  const id=item.dataset.video;
  const platform=item.dataset.platform||'youtube';
  const img=item.querySelector('.work-thumb-img');
  if(!id||id.includes('_ICI'))return; // skip placeholders
  if(platform==='youtube'){
    img.style.backgroundImage=`url(https://img.youtube.com/vi/${id}/maxresdefault.jpg)`;
  } else {
    img.style.backgroundImage=`url(https://vumbnail.com/${id}.jpg)`;
  }
  item.classList.add('has-thumb');
  // update overlay text from data attrs
  const tag=item.dataset.tag,title=item.dataset.title,sub=item.dataset.sub;
  if(tag)item.querySelector('.work-tag').textContent=tag;
  if(title)item.querySelector('.work-title').textContent=title;
  if(sub)item.querySelector('.work-sub').textContent=sub;
  // Mettre à jour le lien "Voir le projet"
  const slug=item.dataset.projet;
  const voirBtn=item.querySelector('.work-voir');
  if(voirBtn&&slug&&!slug.includes('NOM-DU')){
    voirBtn.href='/projet/'+slug+'/';
  }
});

/* ── VIDEO MODAL */
const modal=document.getElementById('videoModal');
const modalFrame=document.getElementById('modalFrame');
const modalBackdrop=document.getElementById('modalBackdrop');
const modalClose=document.getElementById('modalClose');

function openModal(id,platform){
  let src='';
  if(platform==='youtube') src=`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
  else src=`https://player.vimeo.com/video/${id}?autoplay=1`;
  modalFrame.src=src;
  modal.classList.add('open');
  document.body.style.overflow='hidden';
}
function closeModal(){
  modal.classList.remove('open');
  modalFrame.src='';
  document.body.style.overflow='';
}
// Old modal trigger removed to let cinemaLightbox handle clicks cleanly
modalBackdrop.addEventListener('click',closeModal);
modalClose.addEventListener('click',closeModal);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

/* ── TESTIMONIALS SLIDER (with touch swipe) */
const testiTrack=document.getElementById('testiTrack');
const testiBar=document.getElementById('testiBar');
if(testiTrack){
  const cards=testiTrack.querySelectorAll('.testi-card');
  const total=cards.length;
  let tIdx=0;
  function getVisible(){return window.innerWidth<=768?1:3;}
  function goTesti(n){
    const vis=getVisible();
    const max=Math.max(0,total-vis);
    tIdx=Math.max(0,Math.min(n,max));
    const cardW=cards[0].offsetWidth+parseInt(getComputedStyle(testiTrack).gap||0);
    testiTrack.style.transform=`translateX(-${tIdx*cardW}px)`;
    const pct=total<=vis?100:((tIdx/(total-vis))*100);
    testiBar.style.width=pct+'%';
  }
  document.getElementById('testiNext').addEventListener('click',()=>goTesti(tIdx+1));
  document.getElementById('testiPrev').addEventListener('click',()=>goTesti(tIdx-1));
  window.addEventListener('resize',()=>goTesti(0));
  // Touch swipe
  let tsX=0,tsScroll=0;
  testiTrack.addEventListener('touchstart',e=>{tsX=e.touches[0].clientX;},{passive:true});
  testiTrack.addEventListener('touchend',e=>{
    const dx=tsX-e.changedTouches[0].clientX;
    if(Math.abs(dx)>40) goTesti(dx>0?tIdx+1:tIdx-1);
  },{passive:true});
  // Mouse drag
  let mdDown=false,mdX=0;
  testiTrack.addEventListener('mousedown',e=>{mdDown=true;mdX=e.clientX;testiTrack.style.cursor='grabbing';});
  testiTrack.addEventListener('mouseup',e=>{
    if(!mdDown) return;
    mdDown=false;testiTrack.style.cursor='';
    const dx=mdX-e.clientX;
    if(Math.abs(dx)>40) goTesti(dx>0?tIdx+1:tIdx-1);
  });
  testiTrack.addEventListener('mouseleave',()=>{mdDown=false;testiTrack.style.cursor='';});
}

/* ── SHOWREEL HERO */
(function(){
  const frame = document.getElementById('heroReelFrame');
  if(!frame) return;
  const src = frame.dataset.src || '';
  // Only activate if real ID is set (not placeholder)
  if(src && !src.includes('YOUTUBE_SHOWREEL_ID')){
    // Load after page ready to not block LCP
    setTimeout(()=>{
      frame.src = src;
      frame.addEventListener('load', ()=>{
        document.getElementById('heroReel').classList.add('loaded');
      });
    }, 800);
  }
})();

/* ── FORMSPREE FORM */
const contactForm = document.getElementById('contactForm');
if(contactForm){
  contactForm.addEventListener('submit', async function(e){
    e.preventDefault();
    // Validate
    let valid = true;
    contactForm.querySelectorAll('[required]').forEach(field=>{
      if(!field.value.trim()){
        field.classList.add('cf-error');
        valid = false;
      } else {
        field.classList.remove('cf-error');
      }
    });
    // Check radio
    const radioChecked = contactForm.querySelector('input[name="type"]:checked');
    if(!radioChecked){ valid = false; }
    if(!valid) return;

    const btn = document.getElementById('cfSubmit');
    const txtEl = btn.querySelector('.cf-submit-text');
    const arrEl = btn.querySelector('.cf-submit-arrow');
    const loadEl = btn.querySelector('.cf-submit-loading');
    txtEl.style.display='none'; arrEl.style.display='none'; loadEl.style.display='inline';
    btn.disabled = true;

    try {
      const data = new FormData(contactForm);
      const resp = await fetch(contactForm.action, {
        method:'POST', body:data,
        headers:{'Accept':'application/json'}
      });
      if(resp.ok){
        contactForm.style.display='none';
        document.getElementById('cfSuccess').style.display='block';
      } else {
        throw new Error('error');
      }
    } catch(err){
      txtEl.textContent='Réessaie';
      txtEl.style.display='inline'; loadEl.style.display='none';
      btn.disabled=false;
    }
  });

  // Live clear error
  contactForm.querySelectorAll('.cf-input').forEach(inp=>{
    inp.addEventListener('input',()=>inp.classList.remove('cf-error'));
  });
}

/* ── VIEW TOGGLE grid/list */
function setView(mode, btn) {
  const grid = document.getElementById('workGrid');
  document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (mode === 'list') {
    grid.classList.add('list-view');
  } else {
    grid.classList.remove('list-view');
  }
}

/* faq handled by toggleFaq */

/* ── COOKIE CONSENT */
(function(){
  const banner = document.getElementById('cookieBanner');
  const accept = document.getElementById('cookieAccept');
  const refuse = document.getElementById('cookieRefuse');
  if(!banner) return;

  const consent = localStorage.getItem('na_cookie_consent');
  if(!consent){
    setTimeout(()=> banner.classList.add('show'), 2000);
  }

  function dismiss(val){
    localStorage.setItem('na_cookie_consent', val);
    banner.style.transform = 'translateX(-50%) translateY(120%)';
    setTimeout(()=> banner.remove(), 700);
  }

  accept.addEventListener('click', ()=> dismiss('accepted'));
  refuse.addEventListener('click', ()=> dismiss('refused'));
})();

/* ── EASTER EGG, Konami code: ↑↑↓↓←→←→BA + logo triple click */
(function(){
  const ee = document.getElementById('easterEgg');
  if(!ee) return;

  // Konami code
  const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let ki = 0;
  document.addEventListener('keydown', e => {
    if(e.key === konami[ki]){ ki++; } else { ki = 0; }
    if(ki === konami.length){ ki = 0; ee.classList.add('show'); }
  });

  // Triple click on nav logo
  let clicks = 0, clickTimer;
  const logo = document.querySelector('.nav-logo');
  if(logo){
    logo.addEventListener('click', e => {
      if(logo.getAttribute('href') === '#hero'){ e.preventDefault(); }
      clicks++;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(()=>{ clicks = 0; }, 600);
      if(clicks >= 3){ clicks = 0; ee.classList.add('show'); }
    });
  }

  // Close on backdrop click
  ee.addEventListener('click', e => { if(e.target === ee) ee.classList.remove('show'); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') ee.classList.remove('show'); });
})();

/* ── COUNTER - valeurs affichées directement en HTML */
/* ── TYPEWRITER - script inline dans le HTML */
/* ── NAV SCROLL STATE */
(function(){
  const nav = document.querySelector('nav');
  const hero = document.getElementById('hero');
  if(!nav || !hero) return;
  const io = new IntersectionObserver(entries => {
    nav.classList.toggle('scrolled', !entries[0].isIntersecting);
  }, { threshold: 0.1 });
  io.observe(hero);
})();

/* ── HERO TITLE MOUSE PARALLAX */
(function(){
  const title = document.getElementById('heroTitle');
  const hero = document.getElementById('hero');
  if(!title || !hero) return;
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;   // -0.5 → 0.5
    const y = (e.clientY - r.top) / r.height - 0.5;
    title.style.transform = `translate(${x * 14}px, ${y * 7}px)`;
  });
  hero.addEventListener('mouseleave', () => {
    title.style.transform = '';
    title.style.transition = 'transform .8s cubic-bezier(.16,1,.3,1)';
    setTimeout(() => { title.style.transition = ''; }, 800);
  });
})();

/* ── TYPEWRITER - voir script inline dans le HTML */


/* ── PRESELECT FORM */
function preselectForm(type){
  var radios = document.querySelectorAll('input[name="type"]');
  radios.forEach(function(r){ r.checked = (r.value === type); });
  const s1 = document.getElementById('form-step-1');
  const s2 = document.getElementById('form-step-2');
  if (s1) s1.classList.add('active');
  if (s2) s2.classList.remove('active');
  var form = document.getElementById('contactFormWrap');
  if(form){ setTimeout(function(){ form.scrollIntoView({behavior:'smooth', block:'start'}); }, 120); }
}
/* ── MOOD FILTERS */
document.querySelectorAll('.mood-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const mood = btn.dataset.mood;
    document.querySelectorAll('.work-item').forEach(item => {
      const itemMood = item.dataset.mood || 'all';
      if(mood === 'all' || itemMood === mood) {
        item.style.opacity = '1';
        item.style.pointerEvents = '';
      } else {
        item.style.opacity = '.2';
        item.style.pointerEvents = 'none';
      }
    });
  });
});

/* NAV ACTIVE LINK */
(function(){
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-links a');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => io.observe(s));
})();

/* KONAMI CODE easter egg */
(function(){
  const k=[38,38,40,40,37,39,37,39,66,65];
  let i=0;
  document.addEventListener('keydown',e=>{
    i = e.keyCode === k[i] ? i+1 : 0;
    if(i === k.length){
      document.body.style.transition='filter 1s';
      document.body.style.filter='hue-rotate(180deg) saturate(2)';
      setTimeout(()=>{document.body.style.filter='';},2000);
      i=0;
    }
  });
})();

/* COOKIE CONSENT */
(function(){
  const banner = document.getElementById('cookieBanner');
  if(!banner) return;
  // Check both localStorage and sessionStorage for compatibility
  try { if(localStorage.getItem('cookieOk')) return; } catch(e) {}
  setTimeout(()=>{ banner.classList.add('show'); }, 2500);
  function hide(){
    banner.classList.remove('show');
    try { localStorage.setItem('cookieOk','1'); } catch(e) {}
  }
  const accept = document.getElementById('cookieAccept');
  const refuse = document.getElementById('cookieDecline');
  if(accept) accept.addEventListener('click', hide);
  if(refuse) refuse.addEventListener('click', () => { banner.classList.remove('show'); });
})();

/* TRIPLE CLICK LOGO easter egg */
(function(){
  const logo = document.querySelector('.nav-logo');
  if(!logo) return;
  let clicks=0, t;
  logo.addEventListener('click',()=>{
    clicks++;
    clearTimeout(t);
    t = setTimeout(()=>{ clicks=0; },500);
    if(clicks>=3){
      document.body.insertAdjacentHTML('beforeend','<div style="position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(8,7,6,.95);font-family:Georgia,serif;font-size:4rem;font-style:italic;color:#cc460c;cursor:pointer;" onclick="this.remove()">Nolan<span style="color:#f0ebe2">.Arc</span></div>');
      clicks=0;
    }
  });
})();

// --- NEXT SCRIPT ---

// ─── UNIVERSAL TOUCH/DRAG CAROUSEL ───
(function(){
  // Selectors for all carousel containers
  const CAROUSEL_SELECTORS = [
    '.services-grid',
    '.testi-track', 
    '.manifeste-grid',
    '.nom-senses',
    '.about-details',
    '.process-steps',
    '.valeurs-layout'
  ];

  function initDrag(el){
    if(!el) return;
    let isDown = false, startX, scrollLeft;

    // Mouse drag
    el.addEventListener('mousedown', e => {
      isDown = true;
      el.style.cursor = 'grabbing';
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    });
    el.addEventListener('mouseleave', () => { isDown = false; el.style.cursor = ''; });
    el.addEventListener('mouseup', () => { isDown = false; el.style.cursor = ''; });
    el.addEventListener('mousemove', e => {
      if(!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    });

    // Touch — native scroll-snap handles this, but add momentum
    let touchStartX = 0, touchScrollLeft = 0;
    el.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].pageX;
      touchScrollLeft = el.scrollLeft;
    }, {passive: true});
    el.addEventListener('touchmove', e => {
      const x = e.touches[0].pageX;
      const walk = (touchStartX - x);
      el.scrollLeft = touchScrollLeft + walk;
    }, {passive: true});
  }

  function initAll(){
    CAROUSEL_SELECTORS.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => initDrag(el));
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();

// ─── UPDATE CAROUSEL DOTS ON SCROLL ───
(function(){
  function watchDots(gridSel, dotsSel){
    const grid = document.querySelector(gridSel);
    const dots = document.querySelectorAll(dotsSel);
    if(!grid || !dots.length) return;
    grid.addEventListener('scroll', function(){
      const idx = Math.round(grid.scrollLeft / (grid.clientWidth * .82));
      Array.from(dots || []).forEach((d, i) => d.classList.toggle('active', i === Math.min(idx, dots.length-1)));
    }, {passive:true});
  }
  document.addEventListener('DOMContentLoaded', function(){
    watchDots('.services-grid', '.mobile-scroll-hint .scroll-dot');
  });
})();

/* ── ABOUT SLIDESHOW AUTO-SWITCH ── */
(function(){
  var slides = document.querySelectorAll('.asl-slide');
  var dots   = document.querySelectorAll('.asl-dot');
  if(!slides.length) return;
  var cur = 0, timer;

  function goTo(n){
    slides[cur].classList.remove('active');
    dots[cur].classList.remove('active');
    cur = (n + slides.length) % slides.length;
    slides[cur].classList.add('active');
    dots[cur].classList.add('active');
  }

  function startAuto(){ timer = setInterval(function(){ goTo(cur+1); }, 3500); }
  function stopAuto(){ clearInterval(timer); }

  Array.from(dots || []).forEach(function(d){
    d.addEventListener('click', function(){
      stopAuto();
      goTo(parseInt(d.dataset.idx));
      startAuto();
    });
  })();

  startAuto();
})();

/* ── BACK TO TOP ── */
(function(){
  var btn = document.getElementById('backTop');
  if(!btn) return;
  window.addEventListener('scroll', function(){
    btn.classList.toggle('show', window.scrollY > 500);
  }, {passive:true});
  btn.addEventListener('click', function(){
    var anchor = document.getElementById('scroll-top-anchor');
    if(!anchor) return;
    var startY = window.pageYOffset;
    var navEl = document.querySelector('nav');
    var navOffset = navEl ? navEl.offsetHeight : 70;
    var targetY = anchor.offsetTop - navOffset - 16;
    var dist = targetY - startY;
    var duration = 400;
    var startTime = null;
    function ease(t){ return t<.5?2*t*t:-1+(4-2*t)*t; }
    function step(ts){
      if(!startTime) startTime = ts;
      var p = Math.min((ts-startTime)/duration,1);
      window.scrollTo(0, startY + dist*ease(p));
      if(p<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
})();

/* ── NAV LATÉRALE ─────────────────────────────────────────────── */
(function(){
  var nav   = document.getElementById('side-nav');
  var line  = document.getElementById('sn-line');
  var items = Array.from(document.querySelectorAll('#side-nav .sn-item'));
  var dots  = items.map(function(item){ return item.querySelector('.sn-dot'); });
  var sectionIds = items.map(function(a){ return (a.getAttribute('href')||'').replace('#',''); });
  var sections = sectionIds.map(function(id){ return document.getElementById(id); });
  if(!nav || !items.length) return;

  function getIdx(){
    var scrollTop = window.pageYOffset;
    var threshold = scrollTop + window.innerHeight * 0.45;
    for(var i = sections.length - 1; i >= 0; i--){
      if(!sections[i]) continue;
      // Calculer l'offsetTop réel en remontant les parents
      var el = sections[i], top = 0;
      while(el){ top += el.offsetTop; el = el.offsetParent; }
      if(top <= threshold) return i;
    }
    return 0;
  }

  function update(){
    var idx = getIdx();
    items.forEach(function(item, i){
      item.classList.toggle('active', i === idx);
      item.classList.toggle('passed', i < idx);
    });
    // Ligne orange du premier dot au dot actif
    if(line && dots[0] && dots[idx]){
      var nr = nav.getBoundingClientRect();
      var r0 = dots[0].getBoundingClientRect();
      var ri = dots[idx].getBoundingClientRect();
      var y0 = r0.top + r0.height/2 - nr.top;
      var yi = ri.top + ri.height/2 - nr.top;
      line.style.top    = y0 + 'px';
      line.style.height = Math.max(0, yi - y0) + 'px';
    }
  }

  var ticking = false;
  function onScroll(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(function(){ ticking=false; update(); });
  }

  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll, {passive:true});

  // Clic/tap : scroll + label visible 1.6s
  var labelTimer = {};
  function handleTap(item, i, e){
    if(e && e.cancelable) e.preventDefault();
    // Scroll vers la section
    var sec = sections[i];
    if(sec){
      var offset = (i === 0) ? -120 : -70;
      var el = sec, absTop = 0;
      while(el){ absTop += el.offsetTop; el = el.offsetParent; }
      window.scrollTo({top: absTop + offset, behavior:'smooth'});
    }
    // Label visible 1.6s
    item.classList.add('label-visible');
    clearTimeout(labelTimer[i]);
    labelTimer[i] = setTimeout(function(){
      item.classList.remove('label-visible');
    }, 1600);
  }
  var touched = {};
  items.forEach(function(item, i){
    // touchend : robuste sur Android (avant que click soit émis)
    item.addEventListener('touchend', function(e){
      touched[i] = Date.now();
      handleTap(item, i, e);
    }, {passive:false});
    // click : desktop + fallback si touchend ne couvrait pas
    item.addEventListener('click', function(e){
      if(Date.now() - (touched[i]||0) < 500) return; // déjà géré par touchend
      handleTap(item, i, e);
    });
  });

  update();
  setTimeout(update, 500);
  setTimeout(update, 1200);
})();

/* ── HERO SHOWREEL AU CLIC ─────────────────────────────────────── */
(function(){
  var playBtn = document.getElementById('heroReelPlay');
  var frame = document.getElementById('heroReelFrame');
  var reel = document.getElementById('heroReel');
  if(!playBtn || !frame) return;
  // Vérifier si showreel dispo (ID renseigné)
  var src = frame.dataset.src || '';
  if(src && !src.includes('YOUTUBE_SHOWREEL_ID')){
    document.getElementById('hero').classList.add('has-reel');
    playBtn.addEventListener('click', function(){
      frame.src = src;
      reel.classList.add('loaded');
      playBtn.classList.add('hidden');
    });
  }
})();

/* ── PROCESS CARROUSEL DOTS ────────────────────────────────────── */
(function(){
  var tl    = document.querySelector('#process .process-timeline');
  var pdots = Array.from(document.querySelectorAll('#processDots .process-dot'));
  var steps = Array.from(document.querySelectorAll('#process .process-step'));
  if(!tl || !pdots.length || !steps.length) return;

  function setActive(idx){
    pArray.from(dots || []).forEach(function(d,i){ d.classList.toggle('active', i===idx); });
  }

  function calcActive(){
    // Comparer le centre de chaque carte avec le centre visible du conteneur
    var tlRect = tl.getBoundingClientRect();
    var center = tlRect.left + tlRect.width / 2;
    var best = 0, bestDist = Infinity;
    steps.forEach(function(s, i){
      var r = s.getBoundingClientRect();
      var dist = Math.abs((r.left + r.width / 2) - center);
      if(dist < bestDist){ bestDist = dist; best = i; }
    });
    setActive(best);
  }

  tl.addEventListener('scroll', calcActive, {passive:true});
  tl.addEventListener('scrollend', calcActive, {passive:true});

  // Clic sur dot → scroll vers la carte
  pArray.from(dots || []).forEach(function(dot, i){
    dot.addEventListener('click', function(){
      var s = steps[i];
      var tlRect = tl.getBoundingClientRect();
      var sRect  = s.getBoundingClientRect();
      var diff = (sRect.left + sRect.width/2) - (tlRect.left + tlRect.width/2);
      tl.scrollTo({left: tl.scrollLeft + diff, behavior:'smooth'});
    });
  });

  setTimeout(calcActive, 300);
  var io2 = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting) setTimeout(calcActive, 150); });
  }, {threshold:0.1});
  io2.observe(tl);
})();

/* ── TEXTAREA AUTO-GROW ────────────────────────────────────────── */
(function(){
  var ta = document.querySelector('textarea.auto-grow');
  if(!ta) return;
  var minH = 0;
  function resize(){
    ta.style.height = '0';
    var sh = ta.scrollHeight;
    if(!minH) minH = sh;
    ta.style.height = Math.max(minH, sh) + 'px';
  }
  // Init après rendu complet
  setTimeout(function(){
    minH = ta.scrollHeight;
    ta.style.height = minH + 'px';
  }, 100);
  ta.addEventListener('input', resize);
  ta.addEventListener('keyup', resize);
  ta.addEventListener('paste', function(){ setTimeout(resize, 0); });
})();


/* ────────────────────────────────────────────────────────
   V2 CUSTOM JS CONTROLLERS (SEARCH, CINEMA MODE, COMMAND PALETTE)
   ──────────────────────────────────────────────────────── */

// 1. DUAL SYSTEM: SEARCH & FILTER
(function() {
  const searchInput = document.getElementById('portfolioSearch');
  const filterButtons = document.querySelectorAll('.wf-btn');

  function applyFilters() {
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const activeCatBtn = document.querySelector('.wf-btn.active');
    const activeCat = activeCatBtn ? activeCatBtn.dataset.filter : 'all';

    document.querySelectorAll('.work-item').forEach(item => {
      const catMatches = (activeCat === 'all' || item.dataset.cat === activeCat);
      
      const title = (item.dataset.title || '').toLowerCase();
      const tag = (item.dataset.tag || '').toLowerCase();
      const sub = (item.dataset.sub || '').toLowerCase();
      const searchMatches = !query || title.includes(query) || tag.includes(query) || sub.includes(query);

      item.classList.toggle('filtered-out', !(catMatches && searchMatches));
      if (catMatches && searchMatches) {
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
      } else {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.95)';
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });
})();

// 2. CINEMA MODE LIGHTBOX
let cinemaActiveIdx = -1;
let cinemaFilteredItems = [];

function openCinema(id, platform, title, tag, itemIndex) {
  const lightbox = document.getElementById('cinemaLightbox');
  const iframeContainer = document.getElementById('cinemaIframeContainer');
  const placeholder = document.getElementById('cinemaPlaceholder');
  const titleEl = document.getElementById('cinemaTitle');
  const tagEl = document.getElementById('cinemaTag');

  if (!lightbox) return;

  // Track filtered items index to navigate prev/next inside current filter view
  cinemaFilteredItems = Array.from(document.querySelectorAll('.work-item')).filter(el => el.style.display !== 'none');
  cinemaActiveIdx = cinemaFilteredItems.findIndex(el => el.dataset.video === id);

  titleEl.textContent = title;
  tagEl.textContent = tag;

  if (id.includes('_ICI') || !id) {
    iframeContainer.style.display = 'none';
    iframeContainer.innerHTML = '';
    placeholder.style.display = 'flex';
    document.getElementById('cinemaPlaceholderTitle').textContent = title;
  } else {
    placeholder.style.display = 'none';
    iframeContainer.style.display = 'block';
    if (platform === 'youtube') {
      iframeContainer.innerHTML = `<iframe title="Vidéo YouTube"  src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
    } else {
      iframeContainer.innerHTML = `<iframe title="Vidéo Vimeo"  src="https://player.vimeo.com/video/${id}?autoplay=1" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
    }
  }

  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCinema() {
  const lightbox = document.getElementById('cinemaLightbox');
  const iframeContainer = document.getElementById('cinemaIframeContainer');
  if (lightbox) {
    lightbox.classList.remove('active');
    if (iframeContainer) iframeContainer.innerHTML = '';
  }
  document.body.style.overflow = '';
}

function navigateCinema(dir) {
  if (cinemaActiveIdx === -1 || !cinemaFilteredItems.length) return;
  let nextIdx = cinemaActiveIdx + dir;
  if (nextIdx < 0) nextIdx = cinemaFilteredItems.length - 1;
  if (nextIdx >= cinemaFilteredItems.length) nextIdx = 0;

  const nextItem = cinemaFilteredItems[nextIdx];
  const id = nextItem.dataset.video;
  const platform = nextItem.dataset.platform || 'youtube';
  const title = nextItem.dataset.title || nextItem.querySelector('.work-title')?.textContent || '';
  const tag = nextItem.dataset.tag || nextItem.querySelector('.work-tag')?.textContent || '';

  openCinema(id, platform, title, tag);
}

document.addEventListener('DOMContentLoaded', () => {
  const lightbox = document.getElementById('cinemaLightbox');
  const closeBtn = document.getElementById('cinemaClose');
  const prevBtn = document.getElementById('cinemaPrev');
  const nextBtn = document.getElementById('cinemaNext');

  // Wire play clicks to open Cinema Mode
  document.querySelectorAll('.work-item[data-video]').forEach((item, idx) => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = item.dataset.video;
      const platform = item.dataset.platform || 'youtube';
      const title = item.dataset.title || item.querySelector('.work-title')?.textContent || '';
      const tag = item.dataset.tag || item.querySelector('.work-tag')?.textContent || '';
      openCinema(id, platform, title, tag, idx);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeCinema);
  if (prevBtn) prevBtn.addEventListener('click', () => navigateCinema(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => navigateCinema(1));

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (lightbox && lightbox.classList.contains('active')) {
      if (e.key === 'Escape') closeCinema();
      else if (e.key === 'ArrowLeft') navigateCinema(-1);
      else if (e.key === 'ArrowRight') navigateCinema(1);
    }
  });
});

// 3. COMMAND PALETTE (⌘K / CTRL+K)
(function() {
  const palette = document.getElementById('cmdPalette');
  const input = document.getElementById('cmdSearchInput');
  const results = document.getElementById('cmdResults');
  let items = [];
  let selectedIndex = 0;

  function initItems() {
    items = [];
    
    items.push({ name: 'Naviguer : Portfolio / Réalisations', type: 'navigation', action: () => scrollToId('work') });
    items.push({ name: 'Naviguer : Prestations & Services', type: 'navigation', action: () => scrollToId('services') });
    items.push({ name: 'Naviguer : À propos de Nolan', type: 'navigation', action: () => scrollToId('about') });
    items.push({ name: 'Naviguer : Prendre contact / Devis', type: 'navigation', action: () => scrollToId('contact') });
    items.push({ name: 'Naviguer : Lire ma démarche créative', type: 'navigation', action: () => window.location.href = '/ma-demarche.html' });

    document.querySelectorAll('.work-item').forEach(el => {
      const title = el.dataset.title || el.querySelector('.work-title')?.textContent || 'Projet';
      const cat = el.dataset.tag || 'Projet';
      const slug = el.dataset.projet;
      items.push({
        name: `Visionner : ${title} (${cat})`,
        type: 'projet',
        action: () => {
          const id = el.dataset.video;
          const platform = el.dataset.platform || 'youtube';
          openCinema(id, platform, title, cat);
        }
      });
      if (slug && !slug.includes('NOM-DU')) {
        items.push({
          name: `Détails : Étude de cas - ${title}`,
          type: 'etude',
          action: () => window.location.href = '/projet/' + slug + '/'
        });
      }
    });

    items.push({
      name: 'Copier l\'adresse email de Nolan',
      type: 'action',
      action: () => {
        navigator.clipboard.writeText('nolanribcontact&#64;gmail.com')
          .then(() => {
            results.innerHTML = '<div class="cmd-item" style="color:var(--color-orange);text-align:center;">✓ Email copié avec succès !</div>';
            setTimeout(() => renderResults(input.value), 1500);
          });
      }
    });
  }

  function scrollToId(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function renderResults(filterText = '') {
    const query = filterText.toLowerCase().trim();
    const filtered = items.filter(item => item.name.toLowerCase().includes(query));
    
    results.innerHTML = '';
    
    if (filtered.length === 0) {
      results.innerHTML = '<div class="cmd-item" style="opacity:0.5;justify-content:center;">Aucun résultat trouvé...</div>';
      return;
    }

    selectedIndex = Math.min(selectedIndex, filtered.length - 1);
    selectedIndex = Math.max(0, selectedIndex);

    filtered.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = `cmd-item ${idx === selectedIndex ? 'selected' : ''}`;
      
      let typeLabel = 'Action';
      if (item.type === 'projet') typeLabel = 'Vidéo';
      else if (item.type === 'etude') typeLabel = 'Étude';
      else if (item.type === 'navigation') typeLabel = 'Lien';

      div.innerHTML = `
        <div class="cmd-item-left">
          <svg class="cmd-item-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          <span class="cmd-item-name">${item.name}</span>
        </div>
        <span class="cmd-item-badge">${typeLabel}</span>
      `;
      
      div.addEventListener('click', () => {
        item.action();
        closePalette();
      });

      results.appendChild(div);
    });
  }

  function openPalette() {
    if (!palette) return;
    initItems();
    selectedIndex = 0;
    renderResults();
    palette.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => { if (input) input.focus(); }, 50);
  }

  function closePalette() {
    if (palette) {
      palette.classList.remove('active');
      if (input) input.value = '';
    }
    document.body.style.overflow = '';
  }

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (palette && palette.classList.contains('active')) closePalette();
      else openPalette();
    }

    if (palette && palette.classList.contains('active')) {
      if (e.key === 'Escape') {
        closePalette();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const max = results.querySelectorAll('.cmd-item').length;
        selectedIndex = (selectedIndex + 1) % max;
        renderResults(input.value);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const max = results.querySelectorAll('.cmd-item').length;
        selectedIndex = (selectedIndex - 1 + max) % max;
        renderResults(input.value);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const itemsList = results.querySelectorAll('.cmd-item');
        if (itemsList[selectedIndex]) {
          const query = input.value.toLowerCase().trim();
          const filtered = items.filter(item => item.name.toLowerCase().includes(query));
          if (filtered[selectedIndex]) {
            filtered[selectedIndex].action();
            closePalette();
          }
        }
      }
    }
  });

  if (input) {
    input.addEventListener('input', () => {
      selectedIndex = 0;
      renderResults(input.value);
    });
  }

  if (palette) {
    palette.addEventListener('click', (e) => {
      if (e.target === palette) closePalette();
    });
  }

  const navLinksList = document.querySelector('.nav-links');
  if (navLinksList) {
    const li = document.createElement('li');
    li.innerHTML = `<a href="#" id="navCmdSearch" aria-label="Recherche globale (Ctrl+K)">Recherche</a>`;
    navLinksList.appendChild(li);
    document.getElementById('navCmdSearch').addEventListener('click', (e) => {
      e.preventDefault();
      openPalette();
    });
  }
})();