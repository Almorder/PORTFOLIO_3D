// Copie sur le site l'affiche YouTube de chaque film (champ posterFile de content/projects.mjs).
// Lancé au déploiement, avant le build : la page charge ensuite l'affiche depuis nolanarc.com
// (plus rapide, dimensions connues, aucune requête vers YouTube). En cas d'échec, rien ne casse :
// le build garde l'affiche YouTube.
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { projects } from '../content/projects.mjs';

const root = new URL('../', import.meta.url).pathname;
for (const p of projects.filter(p => p.videoId && p.posterFile)) {
  const url = `https://i.ytimg.com/vi/${p.videoId}/maxresdefault.jpg`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    const type = res.headers.get('content-type') || '';
    const body = Buffer.from(await res.arrayBuffer());
    if (!res.ok || !type.startsWith('image/jpeg') || body.length < 10000) throw new Error(`${res.status} ${type} ${body.length} o`);
    const dest = join(root, 'public', p.posterFile);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, body);
    console.log(`Affiche copiée : ${p.posterFile} (${Math.round(body.length / 1024)} Ko)`);
  } catch (error) {
    console.warn(`Affiche non copiée pour ${p.slug} (${error.message}) : l'affiche YouTube reste utilisée.`);
  }
}
