// Social media videos hébergées sur Instagram : aucune requête vers Instagram avant le clic du visiteur.
// ratio : format du média (vertical 9/16 par défaut). La hauteur réelle du lecteur est ensuite ajustée automatiquement.
// tags : catégories de la page Work (recits, marques, moments, reseaux, photo).
// Champs facultatifs, affichés seulement s'ils sont remplis (fiche et liste de la page Work) :
//   client, role, year, result (résultat réel et vérifié), cover (image de couverture hébergée sur le site,
//   ex. '/assets/work/box.jpg', format vertical), uploadDate (AAAA-MM-JJ, pour les données VideoObject).
// Depuis l'admin (rubrique « Social media videos »), Nolan ajoute des vidéos Instagram ou ses propres fichiers
// vidéo (copiés sur le site au déploiement, voir tools/fetch-published.mjs) : la version publiée remplace
// alors cette liste (content/social.published.json, non versionné).
import { readFileSync } from 'node:fs';

const codePosts = [
  { id: 'DYriAZ_IKrU', title: 'Box', kind: '', ratio: '9/16', tags: ['reseaux'], client: '', role: '', year: '', result: '', cover: '', uploadDate: '' },
  { id: 'DDNG-AjImks', title: 'Taliri', kind: 'Marque de vêtement', ratio: '9/16', tags: ['marques', 'reseaux'], client: '', role: '', year: '', result: '', cover: '', uploadDate: '' },
  { id: 'DXb1EngoSjI', title: 'Polestar 3', kind: '', ratio: '9/16', tags: ['reseaux'], client: '', role: '', year: '', result: '', cover: '', uploadDate: '' },
  { id: 'DewEcSOCFV2', title: 'Demande en mariage', kind: '', ratio: '9/16', tags: ['moments', 'reseaux'], client: '', role: '', year: '', result: '', cover: '', uploadDate: '' }
];

let published = null;
try { published = JSON.parse(readFileSync(new URL('./social.published.json', import.meta.url), 'utf8')).social; } catch {}
// Chaque vidéo : source 'instagram' (id) ou 'file' (video.src servi par le site), miniature image (envoyée) ou cover.
export const instagramPosts = Array.isArray(published) && published.length ? published : codePosts.map(p => ({ ...p, source: 'instagram', key: p.id }));
