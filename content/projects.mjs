// Projets du portfolio. Ce fichier est la version de départ ; depuis l'admin (rubrique « Projets du portfolio »),
// Nolan ajoute, modifie, ordonne et masque les projets de « Ma sélection » (page Work). Au déploiement,
// tools/fetch-published.mjs écrit la version publiée dans content/projects.published.json (non versionné) :
// elle remplace alors cette liste, dans son ordre. Les champs techniques (slug, href, affiche, statut, card)
// restent ceux d'ici pour les projets déjà connus, et Le bol d'en face (page dédiée) existe toujours.
import { readFileSync } from 'node:fs';
import { legacyMedia } from '../tools/fetch-published.mjs';

const codeProjects = [
  {
    slug: 'le-bol-den-face',
    title: "Le bol d’en face",
    territory: 'Récits',
    type: 'Court métrage',
    role: 'Réalisation & scénario',
    year: '2026',
    context: 'Festival 1minute2court',
    location: 'Paris, France',
    format: '16:9 · 4K UHD',
    camera: 'Lumix S1 II',
    status: 'verified',
visible: true,
    href: '/projet/le-bol-den-face/',
    videoId: 'GbeOQ-hgrtU',
    poster: 'https://img.youtube.com/vi/GbeOQ-hgrtU/maxresdefault.jpg',
    // Affiche hébergée sur le site : récupérée au déploiement (.github/workflows/pages.yml), utilisée dès qu'elle existe.
    posterFile: '/assets/work/le-bol-den-face.jpg',
    // Champs facultatifs, affichés seulement s'ils sont remplis (page Work, fiche du projet) :
    // result : sélection, diffusion ou chiffre réel et vérifié (jamais une promesse) ;
    // uploadDate (AAAA-MM-JJ) et duration (ex. PT1M) : date de mise en ligne et durée du film,
    // nécessaires aux données VideoObject lues par Google.
    result: '',
    uploadDate: '',
    duration: '',
    summary: "Un court métrage sur le deuil, raconté par un repas, des gestes, des objets et une place qui reste vide.",
    contextText: "Réalisé dans le cadre de 1minute2court, le film suit un repas de Nouvel An lunaire marqué par une absence. Je voulais que le spectateur la comprenne avant qu’on la lui explique : par une place, un bol, des gestes qui se répètent et des silences.",
    intent: "Faire sentir l’absence avant de l’expliquer.",
    decisions: [
      {
        title: 'Faire du repas un rituel de mémoire.',
        text: "Le repas ne sert pas seulement de décor. Il devient l’endroit où les habitudes continuent malgré l’absence, et où chaque geste prend un autre poids."
      },
      {
        title: 'Laisser les objets donner les indices.',
        text: "Je ne voulais pas résoudre le deuil par le dialogue. Une place, un bol, un geste répété et un temps d’attente suffisent à faire avancer la compréhension."
      },
      {
        title: 'Rester proche, sans surjouer.',
        text: "Le cadre reste proche des corps et du repas. Je cherche moins l’effet que la tension discrète entre ce que le personnage fait et ce que le spectateur finit par comprendre."
      }
    ]
  },
  {
    slug: 'ouilove',
    title: 'Ouilove Proposal',
    territory: 'Marques',
    type: 'Direction artistique',
    role: 'Direction artistique',
    year: '2024',
    context: 'Ouilove Proposal',
    status: 'partial',
visible: false, // masqué tant qu'il n'y a pas de média réel (règle R1) ; passer à true seulement avec card.image réel
card: { href: '/services/?expertise=direction', label: 'Direction artistique', image: '', alt: '' },
    href: '/services/?expertise=direction',
    summary: 'Direction artistique pour Ouilove Proposal : cadrer le message et maintenir une cohérence visuelle jusqu’au rendu.'
  },
  {
    slug: 'a-one-permis',
    title: 'A One Permis',
    territory: 'Marques',
    type: 'Contenu social',
    role: 'Création de contenu',
    year: '2024',
    context: 'A One Permis',
    status: 'partial',
visible: false, // masqué tant qu'il n'y a pas de média réel (règle R1) ; passer à true seulement avec card.image réel
card: { href: '/services/?expertise=strategie', label: 'Contenu & stratégie', image: '', alt: '' },
    href: '/services/?expertise=strategie',
    summary: 'Création de contenus sociaux pensés pour les usages de A One Permis, de la préparation au rendu.'
  },
  {
    slug: 'moments',
    title: 'Moments',
    territory: 'Moments',
    type: 'Films de moments',
    role: 'Réalisation · image · son',
    year: '2025',
    context: 'Mariages · demandes · événements',
    status: 'partial',
visible: false, // masqué tant qu'il n'y a pas de média réel (règle R1) ; passer à true seulement avec card.image réel
card: { href: '/services/?expertise=realisation', label: 'Réalisation', image: '', alt: '' },
    href: '/services/#mariage',
    summary: 'Préparer les moments clés, capter sans interrompre et construire un film cohérent à partir de ce qui s’est réellement passé.'
  }
];

let published = null;
try { published = JSON.parse(readFileSync(new URL('./projects.published.json', import.meta.url), 'utf8')).projects; } catch {}
const CODE_ONLY = ['slug', 'href', 'poster', 'posterFile', 'status', 'card'];
const bySlug = new Map(codeProjects.map(p => [p.slug, p]));
const merge = p => {
  const base = bySlug.get(p.slug);
  if (!base) return { ...p, href: '', posterFile: p.videoId ? `/assets/work/yt-${p.videoId}.jpg` : '' };
  const out = { ...base, ...p };
  for (const k of CODE_ONLY) if (k in base) out[k] = base[k]; else delete out[k];
  // Un projet déjà connu sans média publié garde sa vidéo du code (le film, son affiche).
  if (!out.videoId && base.videoId && p.mediaKind !== 'photo' && p.mediaKind !== 'instagram') {
    out.videoId = base.videoId;
    if (!out.media?.length) { out.media = legacyMedia({ ...base, mediaKind: 'youtube' }); out.cover = out.media[0]?.key || ''; out.mediaKind = 'youtube'; }
  }
  return out;
};
// Projets du code (avant toute publication) : un seul média, au format de l'admin.
const withMedia = p => p.media ? p : { ...p, media: legacyMedia(p), cover: 'm-1', pageMode: p.pageMode || 'auto', pageSlug: p.slug };
const list = Array.isArray(published)
  ? [...published.map(merge), ...codeProjects.filter(p => p.slug === 'le-bol-den-face' && !published.some(x => x.slug === p.slug)).map(p => ({ ...p, visible: false }))]
  : codeProjects;
export const projects = list.map(withMedia);
