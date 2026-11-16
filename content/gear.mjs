// Planche matériel de l'accueil. `category` = mot simple pour un visiteur non technicien, `name` = modèle exact.
// Positions en % de la planche : x, y, w (largeur), r (rotation en degrés) — une série pour ordinateur, une pour mobile.
export const gearItems = [
  { key: 'tablet',  category: 'Tablette et stylet', name: 'Galaxy Tab S11 Ultra · S Pen', desk: { x: 3,  y: 8,  w: 27, r: -6 },  mobile: { x: 4,  y: 2.5, w: 56, r: -5 } },
  { key: 'camera',  category: 'Caméra',             name: 'Sony A7 IV',                   desk: { x: 71, y: 8,  w: 19, r: 5 },   mobile: { x: 50, y: 47,  w: 44, r: 5 } },
  { key: 'lens',    category: 'Objectif',           name: 'Sony 24-70 mm f/2.8',          desk: { x: 76, y: 52, w: 17, r: -14 }, mobile: { x: 5,  y: 49,  w: 37, r: -10 } },
  { key: 'mic',     category: 'Micro',              name: 'Sennheiser MKE 600',           desk: { x: 4,  y: 73, w: 27, r: 3 },   mobile: { x: 5,  y: 86,  w: 58, r: -3 } },
  { key: 'gimbal',  category: 'Stabilisateur',      name: 'DJI RS 3 Pro',                 desk: { x: 58, y: 50, w: 14, r: 10 },  mobile: { x: 67, y: 70,  w: 25, r: 9 } },
  { key: 'earbuds', category: 'Écouteurs',          name: 'AirPods',                      desk: { x: 41, y: 70, w: 6,  r: -10 }, mobile: { x: 8,  y: 68.5, w: 15, r: -9 } }
];

// Les trois temps de la méthode (repris de la section « Comment je travaille »), écrits sur des post-its.
export const gearNotes = [
  { text: 'Comprendre',   tone: 'sun',   desk: { x: 35, y: 6,  w: 8, r: -6 }, mobile: { x: 70, y: 3,  w: 23, r: 6 } },
  { text: 'Choisir',      tone: 'teal',  desk: { x: 44, y: 10, w: 8, r: 5 },  mobile: { x: 72, y: 15, w: 23, r: -4 } },
  { text: 'Tenir le fil', tone: 'paper', desk: { x: 88, y: 77, w: 8, r: 8 },  mobile: { x: 33, y: 70, w: 22, r: 7 } }
];

export const gearTitle = ['Des outils', 'que je connais vraiment', 'sur le terrain.'];
