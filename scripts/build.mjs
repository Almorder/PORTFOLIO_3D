// Point d'entrée du build. Sur Cloudflare Pages (qui sert nolanarc.com), copie d'abord ce qui a été publié
// depuis l'admin (photos, projets, vidéos, images du site) et les affiches de films, puis construit le site.
// Ces deux étapes tournent avant le build pour que les contenus publiés soient lus au chargement des modules.
// Sur GitHub Actions, le workflow les lance déjà lui-même. En local : FETCH_PUBLISHED=1 npm run build.
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const run = file => execFileSync(process.execPath, [join(root, file)], { stdio: 'inherit' });
if (process.env.CF_PAGES || process.env.FETCH_PUBLISHED) {
  for (const tool of ['tools/fetch-published.mjs', 'tools/fetch-posters.mjs']) {
    try { run(tool); } catch { console.warn(`Étape ignorée : ${tool} (le site garde les contenus du code).`); }
  }
}
run('scripts/build-site.mjs');
