# Sécurité de nolanarc.com

Signaler une faille : nolanribcontact@gmail.com (voir aussi `/.well-known/security.txt`). Réponse sous 7 jours.

## Ce qui protège le site (dans le code)

| Protection | Où | Effet |
|---|---|---|
| Politique de contenu (CSP) | `templates/components.mjs`, balise meta sur chaque page | Le navigateur refuse tout script, cadre, police ou envoi qui ne vient pas d'une source listée. Un script injecté ne s'exécute pas. |
| Aucun script tiers chargé à la volée | `src/app.js` | La vitrine WebGL (Three.js depuis un CDN) est retirée. Seul le script de mesure Cloudflare est autorisé, et seulement s'il n'y a pas d'opposition. |
| Formulaire | `src/app.js`, page Contact | Champ piège anti-robots, validation, un envoi toutes les 30 secondes au plus. |
| Admin | `public/admin/`, `supabase/admin_schema.sql` | Connexion Google uniquement, liste blanche d'adresses, règles RLS : le navigateur n'a que la clé publique et ne peut rien écrire sans être admin. Aucune clé secrète dans le dépôt. Page exclue des moteurs. |
| Documents clients | `supabase/documents_schema.sql`, `public/admin/doc-templates.js` | Devis, contrats, droits à l'image et factures pro forma réservés à l'admin ; PDF signés dans un stockage Supabase privé (lien temporaire de 5 minutes pour les ouvrir). Aucune coordonnée bancaire ni téléphone dans le code public : ils sont saisis dans les Réglages. |
| Déploiement | `.github/workflows/pages.yml` | Actions figées par empreinte (une action compromise ne peut pas changer de code en silence), identifiants Git non conservés, droits minimum, durée limitée à 10 minutes. |
| Mises à jour | `.github/dependabot.yml` | Une demande de fusion par mois si une action a une nouvelle version. |
| Garde-fous | `scripts/check.mjs` | Le build échoue si la CSP manque ou s'assouplit, si un import CDN revient, si une action n'est plus figée, si `security.txt` expire. |

Le site est statique : pas de serveur, pas de base de données publique en écriture, pas de mot de passe stocké. La surface d'attaque réelle, ce sont les comptes (GitHub, Cloudflare, Google, Supabase). D'où la liste ci-dessous.

## Ce que seul Nolan peut régler (comptes et tableaux de bord)

### 1. Double authentification partout (priorité absolue)
- **Google** : myaccount.google.com > Sécurité > Validation en deux étapes > Activer. Ajouter une clé d'accès (passkey) si possible.
- **GitHub** : github.com > photo de profil > Settings > Password and authentication > Enable two-factor authentication.
- **Cloudflare** : dash.cloudflare.com > icône profil > My Profile > Authentication > Two-Factor Authentication.
- **Supabase** : supabase.com/dashboard > icône profil > Account preferences > Security > Multi-factor authentication.

### 2. Cloudflare, en-têtes de sécurité (une règle, 5 en-têtes)
Vérifier d'abord : DNS > Records : les lignes `nolanarc.com` et `www` ont le nuage **orange** (proxied). Sinon, rien de ce qui suit ne s'applique.

Rules > Overview > **Create rule** > **Response Header Transform Rule** :
- Rule name : `En-têtes sécurité`
- When incoming requests match : **All incoming requests**
- Modify response header, choisir **Set static** pour chacun (bouton **Set new header** entre chaque) :

| Header name | Value |
|---|---|
| `X-Frame-Options` | `DENY` |
| `Content-Security-Policy` | `frame-ancestors 'none'` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()` |

- **Deploy**.

Ne pas activer la règle gérée « Add security headers » (Managed Transforms) : elle impose `Referrer-Policy: same-origin`, ce qui empêche les vidéos YouTube intégrées de se lancer.

### 3. Cloudflare, chiffrement
SSL/TLS > Edge Certificates :
- **Always Use HTTPS** : On.
- **Minimum TLS Version** : TLS 1.2.
- **HTTP Strict Transport Security (HSTS)** > Enable HSTS > cocher l'avertissement > Max Age **6 months**, Apply HSTS policy to subdomains **Off**, Preload **Off**, No-Sniff **On** > Save.

SSL/TLS > Overview : si le mode est **Flexible**, passer en **Full**. Essayer ensuite **Full (strict)** ; si le site affiche une erreur 526, revenir à **Full**.

DNS > Settings > **DNSSEC** > Enable, puis copier les valeurs DS chez le registraire du domaine si Cloudflare le demande (si le domaine est acheté chez Cloudflare, c'est automatique).

### 4. Cloudflare, robots
Security > Bots : **Bot Fight Mode** peut rester activé. Ne pas activer « Block AI bots » : le site veut être lu par ChatGPT, Claude, Gemini et Perplexity.

### 5. GitHub, protéger la branche publiée
Dépôt PORTFOLIO_3D > Settings > Rules > Rulesets > **New ruleset** > **New branch ruleset** :
- Ruleset Name : `main protégée`, Enforcement status : **Active**.
- Target branches > Add target > **Include default branch**.
- Cocher **Restrict deletions**, **Block force pushes**, **Require a pull request before merging** (Required approvals : 0).
- **Create**.

Settings > Actions > General > Workflow permissions : **Read repository contents and packages permissions** > Save.
Settings > Code security : **Dependabot alerts** On (le secret scanning et la protection au push sont déjà actifs).

### 6. Supabase, admin
- Authentication > URL Configuration : Site URL `https://nolanarc.com`, Redirect URLs : seulement `https://nolanarc.com/admin/`.
- Après ta première connexion réussie à `/admin/` : Authentication > Sign In / Providers > **Allow new users to sign up** : Off. Plus personne ne peut créer de compte.
- Authentication > Sign In / Providers > Email : désactiver si tu ne t'en sers pas (seul Google est utilisé).

### 7. Google Cloud (connexion Google de l'admin)
console.cloud.google.com > APIs & Services > Credentials > ton client OAuth : dans Authorized JavaScript origins garder seulement `https://nolanarc.com` ; dans Authorized redirect URIs seulement l'adresse de rappel Supabase (`https://gpvmnwidbazvaleuviyr.supabase.co/auth/v1/callback`).

## Vérifier après réglage
securityheaders.com > saisir `https://nolanarc.com` > Scan. Objectif : A ou A+.
