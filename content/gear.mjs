// Planche matériel de l'accueil. `category` = mot simple pour un visiteur non technicien, `name` = modèle exact.
// Les visuels sont des rendus 3D (public/assets/gear/), tous éclairés de la même façon.
// La largeur de chaque objet est calculée depuis sa taille réelle : `scale` permet de tricher légèrement
// pour l'équilibre de la composition. Positions x, y en % de la planche (coin haut-gauche du visuel).
// `tag` : où se place l'étiquette — 'below' (dessous), 'right', 'left' ou 'inside' (sur le bas de l'objet).
// Sur téléphone, `scale` peut être redéfini dans `mobile` : la planche y est verticale et plus serrée.
export const gearBoardMm = { desk: 900, mobile: 470 };

export const gearItems = [
  { key: 'tablet',  category: 'Tablette et stylet', name: 'Galaxy Tab S11 Ultra · S Pen', scale: 0.85, desk: { x: 2,    y: 5,    tag: 'inside' }, mobile: { x: 3,  y: 2,    tag: 'inside' } },
  { key: 'camera',  category: 'Caméra',             name: 'Sony A7 IV',                   scale: 1.2,  desk: { x: 60.5, y: 4,    tag: 'below' },  mobile: { x: 4,  y: 48,   tag: 'below',  scale: 1.35 } },
  { key: 'gimbal',  category: 'Stabilisateur',      name: 'DJI RS 3 Pro',                 scale: 0.7,  desk: { x: 82,   y: 5,    tag: 'below' },  mobile: { x: 61, y: 46.5, tag: 'below' } },
  { key: 'lens',    category: 'Objectif',           name: 'Sony 24-70 mm f/2.8',          scale: 0.85, desk: { x: 82,   y: 69,   tag: 'left' },   mobile: { x: 5,  y: 85.5, tag: 'right',  scale: 1.1 } },
  { key: 'earbuds', category: 'Écouteurs',          name: 'AirPods',                      scale: 1.15, desk: { x: 4,    y: 56,   tag: 'below' },  mobile: { x: 62, y: 73.5, tag: 'below',  scale: 1.25 } },
  { key: 'mic',     category: 'Micro',              name: 'Sennheiser MKE 600',           scale: 0.95, desk: { x: 3,    y: 85.5, tag: 'right' },  mobile: { x: 4,  y: 74,   tag: 'below' } }
];

// Les trois temps de la méthode (repris de la section « Comment je travaille »), écrits sur des post-its.
export const gearNotes = [
  { text: 'Comprendre',   sprite: 'note-sun',   ink: '#2a2208', r: -6, desk: { x: 40, y: 4 },  mobile: { x: 74, y: 2.5,  scale: 1.35 } },
  { text: 'Choisir',      sprite: 'note-teal',  ink: '#f0ebe2', r: 5,  desk: { x: 50, y: 9 },  mobile: { x: 76, y: 11.5, scale: 1.35 } },
  { text: 'Tenir le fil', sprite: 'note-paper', ink: '#080706', r: 8,  desk: { x: 24, y: 55 }, mobile: { x: 76, y: 88,   scale: 1.35 } }
];

export const gearTitle = ['Des outils', 'que je connais vraiment', 'sur le terrain.'];
