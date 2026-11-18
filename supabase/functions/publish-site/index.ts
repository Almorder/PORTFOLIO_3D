// Fonction Supabase « publish-site » : lance tout de suite la mise en ligne de nolanarc.com après
// « Enregistrer et publier » dans l'admin.
//
// 1. Vérifie que l'appel vient de l'administrateur : le jeton de connexion envoyé par l'admin est
//    présenté à la base, qui répond avec public.is_admin() (même règle que tout le reste de l'admin).
// 2. Demande à GitHub de relancer le déploiement (workflow « pages.yml », branche main).
//
// Le jeton GitHub n'est jamais dans le dépôt : il est rangé dans les secrets Supabase sous le nom
// GITHUB_DISPATCH_TOKEN. Jeton « fine-grained » limité au seul dépôt Almorder/PORTFOLIO_3D, permission
// Actions : lecture et écriture, rien d'autre. Sans ce secret, la fonction répond 503 et l'admin indique que
// la vérification automatique (toutes les 10 minutes) prendra le relais.
//
// Déploiement : Supabase > Edge Functions > « Deploy a new function » > « Via Editor », nom publish-site,
// coller ce fichier. Aucune dépendance : le fichier se suffit à lui-même.

const REPO = 'Almorder/PORTFOLIO_3D';
const WORKFLOW = 'pages.yml';
const ORIGINS = ['https://nolanarc.com', 'https://www.nolanarc.com'];

type Env = Record<string, string | undefined>;
type Fetch = typeof fetch;

export async function handle(req: Request, env: Env, fetcher: Fetch = fetch): Promise<Response> {
  const origin = req.headers.get('origin') || '';
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': ORIGINS.includes(origin) ? origin : ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
    'Content-Type': 'application/json'
  };
  const reply = (status: number, body: Record<string, unknown>) => new Response(JSON.stringify(body), { status, headers });
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return reply(405, { error: 'method' });

  // 1. Administrateur seulement.
  const auth = req.headers.get('authorization') || '';
  const url = (env.SUPABASE_URL || '').replace(/\/$/, '');
  const anon = env.SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY || '';
  if (!/^Bearer [\w-]+\.[\w-]+\.[\w-]+$/.test(auth) || !url || !anon) return reply(401, { error: 'unauthorized' });
  let admin = false;
  try {
    const res = await fetcher(`${url}/rest/v1/rpc/is_admin`, { method: 'POST', headers: { apikey: anon, authorization: auth, 'content-type': 'application/json' }, body: '{}' });
    admin = res.ok && (await res.json()) === true;
  } catch { admin = false; }
  if (!admin) return reply(403, { error: 'forbidden' });

  // 2. Déploiement GitHub.
  const token = env.GITHUB_DISPATCH_TOKEN || '';
  if (!token) return reply(503, { error: 'missing GITHUB_DISPATCH_TOKEN' });
  const res = await fetcher(`https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28', 'user-agent': 'nolanarc-admin', 'content-type': 'application/json' },
    body: JSON.stringify({ ref: 'main' })
  });
  if (res.status !== 204) return reply(502, { error: `github ${res.status}` });
  return reply(202, { ok: true, at: new Date().toISOString() });
}

// Sur Supabase (Deno) : sert la fonction. Ailleurs (tests sous Node) : rien ne démarre.
const deno = (globalThis as { Deno?: { serve: (h: (r: Request) => Promise<Response>) => void; env: { toObject: () => Env } } }).Deno;
if (deno) deno.serve(req => handle(req, deno.env.toObject()));
