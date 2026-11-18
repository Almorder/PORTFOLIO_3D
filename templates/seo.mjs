// Lisibilité par les moteurs et les assistants IA : une seule source de vérité.
// Les offres du JSON-LD, llms.txt et llms-full.txt sont générés depuis les contenus publiés
// (content/*.mjs) : quand un tarif change dans pricing.mjs, tout suit, rien n'est réécrit à la main.
import { site } from '../content/site.mjs';
import { pricing } from '../content/pricing.mjs';
import { projects } from '../content/projects.mjs';
import { notes } from '../content/journal.mjs';
import { instagramPosts } from '../content/instagram.mjs';
import { legal } from '../content/legal.mjs';

// Comptes officiels : uniquement ceux publiés dans content/site.mjs.
export const officialProfiles = [site.instagram, site.youtube].filter(Boolean);
// Métiers, dans les mots que les gens tapent (« vidéaste », « réalisateur »).
export const jobTitle = 'Vidéaste, photographe, réalisateur, directeur artistique et stratège de marque';

// Page où chaque offre est décrite sur le site.
const offerPage = { mariage: '/services/#mariage', demande: '/services/#demande-en-mariage', direction: '/services/', strategie: '/services/', contenu: '/#pricing', film: '/#pricing' };
// « 1 500 € » -> 1500 ; « Sur devis » -> null ; « 89 € / h » -> 89 de l'heure.
const amount = price => { const digits = String(price).replace(/[^\d]/g, ''); return digits ? Number(digits) : null; };
const perHour = price => /\/\s*h\b/.test(String(price));
const facts = offer => (offer.facts || []).map(([value, label]) => `${value} ${label}`).join(', ');

export const offers = pricing.map(c => ({
  key: c.key,
  tag: c.tag,
  name: c.title,
  amount: amount(c.price),
  from: Boolean(c.from),
  perHour: perHour(c.price),
  price: c.price,
  text: [c.text, facts(c) && `${facts(c)}.`].filter(Boolean).join(' '),
  url: `${site.domain}${offerPage[c.key] || '/services/'}`,
}));

const priceLabel = o => o.amount === null ? o.price.toLowerCase() : `${o.from ? 'à partir de ' : ''}${o.price.replace('€ / h', '€ de l’heure')}`;
const offerName = o => o.name.toLowerCase().includes(o.tag.toLowerCase()) ? o.name : `${o.name} (${o.tag})`;

// Catalogue schema.org (ProfessionalService.hasOfferCatalog).
export function offerCatalog(businessId) {
  return { '@type': 'OfferCatalog', name: 'Prestations et tarifs', itemListElement: offers.map(o => ({
    '@type': 'Offer', name: o.name, description: o.text, url: o.url, priceCurrency: 'EUR',
    ...(o.amount === null ? {} : { priceSpecification: { '@type': 'UnitPriceSpecification', priceCurrency: 'EUR', ...(o.from ? { minPrice: o.amount } : { price: o.amount }), ...(o.perHour ? { unitCode: 'HUR', unitText: 'heure' } : {}) } }),
    itemOffered: { '@type': 'Service', name: o.name, serviceType: o.tag, provider: { '@id': businessId } },
  })) };
}

const visibleProjects = projects.filter(p => p.slug === 'le-bol-den-face' || p.visible);
// Projets passés décrits dans le code (status) mais sans média en ligne ; projets mis en avant depuis l'admin.
const otherProjects = projects.filter(p => !visibleProjects.includes(p) && p.status);
const featuredProjects = projects.filter(p => p.visible && p.slug !== 'le-bol-den-face');
const projectLine = p => `- ${p.title}${p.year ? ` (${p.year})` : ''}${p.type ? `, ${p.type.toLowerCase()}` : ''}${p.summary ? ` : ${p.summary}` : ''}${p.client ? ` Client : ${p.client}.` : ''} ${url('/work/#selection')}`;
const bol = projects.find(p => p.slug === 'le-bol-den-face');
const url = path => `${site.domain}${path}`;

const intro = `Nolan Ribeiro est vidéaste, photographe, réalisateur, directeur artistique et stratège de marque. Il travaille sous le nom Nolan Arc (entrepreneur individuel, micro-entreprise). Il réalise des films de mariage, des demandes en mariage filmées, des films de marque, des contenus pour les réseaux sociaux et des courts métrages, et accompagne des marques en direction artistique et en stratégie. Il intervient à Paris, en Île-de-France et en France. Langue de travail : français.`;

const offerLines = () => offers.map(o => `- ${offerName(o)} : ${priceLabel(o)}. ${o.url}`).join('\n');
const profileLines = () => [`- Site officiel : ${site.domain}/`, ...officialProfiles.map(p => `- ${/instagram/.test(p) ? 'Instagram' : /youtube/.test(p) ? 'YouTube' : 'Profil'} : ${p}`)].join('\n');
const pageLines = () => [
  ['Accueil', '/'], ['Réalisations', '/work/'], ['Le bol d’en face', '/projet/le-bol-den-face/'], ['Services et tarifs', '/services/'],
  ['À propos', '/a-propos/'], ['Journal', '/journal/'], ['Contact', '/contact/'], ['Mentions légales', '/mentions-legales/'],
].map(([label, path]) => `- ${label} : ${url(path)}`).join('\n');
const stat = i => site.proofStats[i];

// Fiche courte, lue en une fois par les assistants IA.
export function llmsTxt() {
  return `# Nolan Arc, Nolan Ribeiro

> ${intro}

## Identité
- Nom : Nolan Ribeiro. Nom de marque : Nolan Arc (aussi écrit Nolan.Arc).
- Métiers : ${jobTitle.toLowerCase()}.
- Zone : Paris, Île-de-France, France.
- Contact : formulaire ${url('/contact/')} (${site.responseTime.toLowerCase()}).

## Prestations et tarifs
${offerLines()}

## Repères
- Pratique de la vidéo depuis ${stat(1).value}, plus de ${stat(0).value} vidéos réalisées, ${stat(3).value} marques accompagnées.
- Matériel : Sony Alpha 7 IV, optiques Sony et Sigma, stabilisateur DJI RS 3 Pro, micro Sennheiser MKE 600, post-production Adobe.

## Projets
- ${bol.title} (${bol.year}) : ${bol.type.toLowerCase()}, ${bol.role.toLowerCase()}, ${bol.context}. ${url(bol.href)}
${[...featuredProjects.map(projectLine), ...otherProjects.map(p => `- ${p.title} (${p.year}) : ${p.role.toLowerCase()}.`)].join('\n')}
- Vidéos verticales : ${instagramPosts.map(p => p.title).join(', ')}. ${url('/work/#social')}

## Pages
${pageLines()}

## Comptes officiels
${profileLines()}

Version détaillée : ${url('/llms-full.txt')}
`;
}

const faqBlock = (title, items) => `### ${title}\n${items.map(f => `Q : ${f.question}\nR : ${f.answer}`).join('\n\n')}`;

// Version longue et factuelle : tout ce qui est publié sur le site, sans mise en page.
export function llmsFullTxt() {
  return `# Nolan Ribeiro (Nolan Arc), fiche détaillée

> ${intro}

Source : ${site.domain}/. Toutes les informations ci-dessous sont publiées sur le site.

## Qui
- Nolan Ribeiro, ${jobTitle.toLowerCase()}.
- Exerce sous l’identité professionnelle Nolan Arc, ${legal.businessForm.toLowerCase()}. SIREN ${legal.siren}.
- Principe de travail : « ${site.principle} »
- Pratique de la vidéo depuis ${stat(1).value} ; plus de ${stat(0).value} vidéos réalisées ; pratique photo et vidéo ; ${stat(3).value} marques accompagnées.
- Présentation : ${url('/a-propos/')}

## Prestations et tarifs
${offers.map(o => `### ${offerName(o)}\n- Tarif : ${priceLabel(o)}\n- ${o.text}\n- Page : ${o.url}`).join('\n\n')}

## Méthode
1. Comprendre : ce que le projet doit faire comprendre ou ressentir, avant le format, le cadre ou le rythme. Premières questions utiles, généralement sous 48 h.
2. Choisir : lumière, mouvement, son, typographie ou montage servent cette direction.
3. Tenir le fil : la même direction entre réflexion, production et livraison.

## Projets
- ${bol.title} (${bol.year}), ${bol.type.toLowerCase()} : ${bol.summary} Rôle : ${bol.role.toLowerCase()}. Contexte : ${bol.context}. Lieu : ${bol.location}. Caméra : ${bol.camera}. ${url(bol.href)}
${[...featuredProjects.map(projectLine), ...otherProjects.map(p => `- ${p.title} (${p.year}), ${p.type.toLowerCase()} : ${p.summary}`)].join('\n')}
- Vidéos verticales pour les réseaux sociaux : ${instagramPosts.map(p => p.kind ? `${p.title} (${p.kind.toLowerCase()})` : p.title).join(', ')}. ${url('/work/#social')}

## Journal
${notes.map(n => `- ${n.title} (${n.category.toLowerCase()}) : ${n.excerpt}`).join('\n')}
${url('/journal/')}

## Avis publiés sur le site
${site.testimonials.map(t => `- « ${t.quote} » ${[t.name, t.role].filter(Boolean).join(', ')}`).join('\n')}

## Questions fréquentes
${faqBlock('Général', site.faqs.home)}

${faqBlock('Services', site.faqs.services)}

${faqBlock('Contact', site.faqs.contact)}

## Contact
- Formulaire : ${url('/contact/')} (${site.responseTime.toLowerCase()}).
- Rendez-vous : ${site.calendly}

## Pages
${pageLines()}

## Comptes officiels
${profileLines()}
`;
}
