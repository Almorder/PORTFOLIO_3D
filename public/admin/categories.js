// Catégories du catalogue (page Work) : une seule source, lue par l'admin (cases à cocher) et par le build du site.
// Un projet, une vidéo ou une photo peut appartenir à plusieurs catégories.
// Ce qui est coché dans l'admin fait foi (champ categories). Tant que rien n'a été coché (contenus publiés avant
// les catégories), le classement est proposé d'après les champs existants : type de média, ancienne catégorie,
// type, rôle et texte. L'admin affiche cette proposition, cochée, pour qu'elle soit vérifiée puis enregistrée.
// Script classique côté admin (window.NolanCategories), importé tel quel par Node au build (globalThis).
(root => {
  const LIST = [['photo', 'Photo'], ['video', 'Vidéo'], ['reseaux-sociaux', 'Réseaux sociaux'], ['mariage', 'Mariage'], ['direction-artistique', 'Direction artistique']];
  const KEYS = LIST.map(([key]) => key);
  const valid = list => KEYS.filter(key => Array.isArray(list) && list.includes(key));
  // Mariages et demandes en mariage : une seule catégorie, Mariage.
  const WEDDING = /mariage|wedding|proposal|fian[cç]ailles/i;
  const DIRECTION = /direction artistique/i;
  const text = (...values) => values.filter(v => typeof v === 'string').join(' ');

  // Projet du portfolio : médias (photo, vidéo), ancienne catégorie (territory), type, rôle, titre, contexte.
  const project = p => {
    if (Array.isArray(p?.categories)) return valid(p.categories);
    const out = new Set();
    const kinds = (Array.isArray(p?.media) && p.media.length ? p.media.map(m => m?.kind) : [p?.mediaKind || (p?.videoId ? 'youtube' : '')]);
    if (kinds.includes('photo')) out.add('photo');
    if (kinds.some(k => ['youtube', 'instagram', 'file'].includes(k))) out.add('video');
    const old = { Photographie: 'photo', 'Récits': 'video', Moments: 'mariage', 'Réseaux': 'reseaux-sociaux' }[p?.territory];
    if (old) out.add(old);
    if (DIRECTION.test(text(p?.type, p?.role))) out.add('direction-artistique');
    if (WEDDING.test(text(p?.title, p?.type, p?.context))) out.add('mariage');
    return KEYS.filter(k => out.has(k));
  };
  // Vidéo courte (Social media videos) : toujours une vidéo ; anciennes catégories (tags) et titre.
  const social = p => {
    if (Array.isArray(p?.categories)) return valid(p.categories);
    const tags = Array.isArray(p?.tags) ? p.tags : ['reseaux'];
    const out = new Set(['video']);
    if (tags.includes('reseaux')) out.add('reseaux-sociaux');
    if (tags.includes('moments') || WEDDING.test(text(p?.title, p?.kind))) out.add('mariage');
    return KEYS.filter(k => out.has(k));
  };
  // Photo de la section Photographie : toujours une photo ; Mariage si sa description le dit.
  const photo = p => {
    if (Array.isArray(p?.categories)) return valid(p.categories);
    const out = new Set(['photo']);
    if (WEDDING.test(text(p?.alt, p?.series, p?.place))) out.add('mariage');
    return KEYS.filter(k => out.has(k));
  };
  root.NolanCategories = { LIST, KEYS, valid, project, social, photo, label: key => (LIST.find(([k]) => k === key) || [])[1] || '' };
})(typeof window !== 'undefined' ? window : globalThis);
