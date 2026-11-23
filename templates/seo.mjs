// Lisibilité par les moteurs et les assistants IA : une seule source de vérité.
// Les offres du JSON-LD, llms.txt et llms-full.txt sont générés depuis les contenus publiés
// (content/*.mjs) : quand un tarif change dans pricing.mjs, tout suit, rien n'est réécrit à la main.
import { site } from '../content/site.mjs';
import { pricing } from '../content/pricing.mjs';
import { projects } from '../content/projects.mjs';
import { testimonials } from '../content/testimonials.mjs';
import { notes } from '../content/journal.mjs';
import { instagramPosts } from '../content/instagram.mjs';
import { legal } from '../content/legal.mjs';

// Comptes officiels : uniquement ceux publiés dans content/site.mjs.
export const officialProfiles = [site.instagram, site.youtube].filter(Boolean);
// Métiers, dans les mots que les gens tapent (« vidéaste », « réalisateur »).
export const jobTitle = 'Vidéaste, photographe, réalisateur, directeur artistique et stratège de marque';

// Page où chaque offre est décrite sur le site.
const offerPage = { mariage: '/services/#mariage', demande: '/services/#demande-en-mariage', direction: '/services/#direction-artistique', strategie: '/services/#strategie-de-marque', contenu: '/#pricing', film: '/services/#realisation' };
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

const otherProjects = projects.filter(p => !p.visible && p.slug !== 'le-bol-den-face' && p.status);
const bol = projects.find(p => p.slug === 'le-bol-den-face');
const url = path => `${site.domain}${path}`;
// Lien Markdown (format attendu par llms.txt : [nom](adresse absolue): note).
const md = (label, href, note = '') => `- [${label.replace(/[[\]]/g, '')}](${href})${note ? `: ${note}` : ''}`;

const intro = `Nolan Ribeiro est vidéaste, photographe, réalisateur, directeur artistique et stratège de marque. Il travaille sous le nom Nolan Arc (entrepreneur individuel, micro-entreprise). Il réalise des films de mariage, des demandes en mariage filmées, des films de marque, des contenus pour les réseaux sociaux et des courts métrages, et accompagne des marques en direction artistique et en stratégie. Il intervient à Paris, en Île-de-France et en France. Langue de travail : français.`;

const pages = [
  ['Accueil', '/', 'présentation, sélection de réalisations, tarifs, méthode, avis et FAQ'],
  ['Work', '/work/', 'catalogue de toutes les réalisations, filtrable par catégorie'],
  ['Services', '/services/', 'réalisation, direction artistique, stratégie de marque, mariage et demande en mariage'],
  ['À propos', '/a-propos/', 'parcours et manière de travailler'],
  ['Contact', '/contact/', `formulaire de demande de projet (${site.responseTime.toLowerCase()})`],
  ['Journal', '/journal/', 'notes sur la préparation, le cadrage et le montage'],
];
const offerLines = () => offers.map(o => md(offerName(o), o.url, `${priceLabel(o)}.`)).join('\n');
const profileLines = () => officialProfiles.map(p => md(/instagram/.test(p) ? 'Instagram' : /youtube/.test(p) ? 'YouTube' : 'Profil', p)).join('\n');
const stat = i => site.proofStats[i];
const projectNote = p => [[p.type, p.year].filter(Boolean).join(', '), p.client && `client : ${p.client}`].filter(Boolean).join(' ; ');

// Fiche courte (https://llmstxt.org/) : titre H1, résumé en citation, faits, puis des listes de liens Markdown
// vers des pages réelles. Générée depuis les contenus publiés : projets visibles, catalogue, tarifs.
export function llmsTxt({ projects: shown = [], catalog = [] } = {}) {
  return `# Nolan Arc

> ${intro}

- Nom : Nolan Ribeiro. Nom de marque : Nolan Arc (aussi écrit Nolan.Arc).
- Métiers : ${jobTitle.toLowerCase()}.
- Zone : Paris, Île-de-France, France.
- Repères : pratique de la vidéo depuis ${stat(1).value}, plus de ${stat(0).value} vidéos réalisées, ${stat(3).value} marques accompagnées.
- Contact : ${url('/contact/')} (${site.responseTime.toLowerCase()}).

## Pages
${pages.map(([label, path, note]) => md(label, url(path), note)).join('\n')}

## Prestations et tarifs
${offerLines()}

## Réalisations
${shown.map(p => md(p.title, p.url, projectNote(p))).join('\n')}
${catalog.map(c => md(`Catalogue : ${c.label}`, c.url, `${c.count} réalisation${c.count > 1 ? 's' : ''}`)).join('\n')}

## Comptes officiels
${profileLines()}

## Optional
${md('Fiche détaillée', url('/llms-full.txt'), 'prestations, méthode, projets, FAQ et avis publiés')}
${md('Conditions générales de vente', url('/cgv/'))}
${md('Mentions légales', url('/mentions-legales/'))}
`;
}

const faqBlock = (title, items) => `### ${title}\n${items.map(f => `Q : ${f.question}\nR : ${f.answer}`).join('\n\n')}`;

// Version longue et factuelle : tout ce qui est publié sur le site, sans mise en page.
export function llmsFullTxt({ projects: shown = [], catalog = [] } = {}) {
  return `# Nolan Ribeiro (Nolan Arc), fiche détaillée

> ${intro}

Source : [nolanarc.com](${site.domain}/). Toutes les informations ci-dessous sont publiées sur le site.

## Qui
- Nolan Ribeiro, ${jobTitle.toLowerCase()}.
- Exerce sous l’identité professionnelle Nolan Arc, ${legal.businessForm.toLowerCase()}. SIREN ${legal.siren}.
- Principe de travail : « ${site.principle} »
- Pratique de la vidéo depuis ${stat(1).value} ; plus de ${stat(0).value} vidéos réalisées ; pratique photo et vidéo ; ${stat(3).value} marques accompagnées.
- Matériel : Sony Alpha 7 IV, optiques Sony et Sigma, stabilisateur DJI RS 3 Pro, micro Sennheiser MKE 600, post-production Adobe.
${md('Présentation', url('/a-propos/'))}

## Prestations et tarifs
${offers.map(o => `### ${offerName(o)}\n- Tarif : ${priceLabel(o)}\n- ${o.text}\n${md('Page', o.url)}`).join('\n\n')}

## Méthode
1. Comprendre : ce que le projet doit faire comprendre ou ressentir, avant le format, le cadre ou le rythme. Premières questions utiles, généralement sous 48 h.
2. Choisir : lumière, mouvement, son, typographie ou montage servent cette direction.
3. Tenir le fil : la même direction entre réflexion, production et livraison.

## Réalisations
- ${bol.title} (${bol.year}), ${bol.type.toLowerCase()} : ${bol.summary} Rôle : ${bol.role.toLowerCase()}. Contexte : ${bol.context}. Lieu : ${bol.location}. Caméra : ${bol.camera}.
${shown.filter(p => p.title !== bol.title).map(p => md(p.title, p.url, [projectNote(p), p.summary].filter(Boolean).join('. '))).join('\n')}
${otherProjects.map(p => `- ${p.title} (${p.year}), ${p.type.toLowerCase()} : ${p.summary}`).join('\n')}
- Vidéos verticales pour les réseaux sociaux : ${instagramPosts.map(p => p.kind ? `${p.title} (${p.kind.toLowerCase()})` : p.title).join(', ')}.
${catalog.map(c => md(`Catalogue : ${c.label}`, c.url, `${c.count} réalisation${c.count > 1 ? 's' : ''}`)).join('\n')}

## Journal
${notes.map(n => `- ${n.title} (${n.category.toLowerCase()}) : ${n.excerpt}`).join('\n')}
${md('Journal', url('/journal/'))}

## Avis publiés sur le site
${testimonials.map(t => `- « ${t.quote} » ${[t.name, t.role].filter(Boolean).join(', ')}`).join('\n')}

## Questions fréquentes
${faqBlock('Général', site.faqs.home)}

${faqBlock('Services', site.faqs.services)}

${faqBlock('Contact', site.faqs.contact)}

## Contact
${md('Formulaire', url('/contact/'), site.responseTime.toLowerCase())}
${md('Rendez-vous de 30 min', site.calendly)}

## Pages
${pages.map(([label, path, note]) => md(label, url(path), note)).join('\n')}

## Comptes officiels
${profileLines()}
`;
}
