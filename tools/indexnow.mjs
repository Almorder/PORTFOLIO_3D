// IndexNow : prévient Bing (et Yandex, Seznam, Naver) que des pages ont changé, sans attendre leur passage.
// Bing alimente aussi la recherche de ChatGPT et de Copilot.
// À lancer après un déploiement, une fois la clé en ligne : node tools/indexnow.mjs
// Option : node tools/indexnow.mjs /services/ /a-propos/  (seulement ces adresses)
import { readdir, readFile } from 'node:fs/promises';
import { site } from '../content/site.mjs';

const publicDir = new URL('../public/', import.meta.url);
const keyFile = (await readdir(publicDir)).find(name => /^[0-9a-f]{32}\.txt$/.test(name));
if (!keyFile) throw new Error('Clé IndexNow absente de public/');
const key = keyFile.slice(0, -4);
const keyLocation = `${site.domain}/${keyFile}`;

// La clé doit être servie par le site, sinon Bing refuse la notification.
const online = await fetch(keyLocation).then(r => r.ok ? r.text() : '').catch(() => '');
if (online.trim() !== key) throw new Error(`La clé n'est pas encore en ligne : ${keyLocation}`);

const args = process.argv.slice(2);
const urlList = args.length
  ? args.map(path => new URL(path, site.domain).href)
  : [...(await (await fetch(`${site.domain}/sitemap.xml`)).text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(site.domain).host, key, keyLocation, urlList }),
});
// 200 ou 202 : reçu. 403 : clé non trouvée. 422 : adresse hors du site.
console.log(`IndexNow : ${res.status} pour ${urlList.length} adresse(s).`);
if (!res.ok) process.exit(1);
