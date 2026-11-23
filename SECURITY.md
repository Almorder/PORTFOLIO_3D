# Sécurité de nolanarc.com

Signaler une faille : nolanribcontact@gmail.com (voir aussi `/.well-known/security.txt`). Réponse sous 7 jours.

## Ce qui protège le site (dans le code)

| Protection | Où | Effet |
|---|---|---|
| Politique de contenu (CSP) | `templates/components.mjs`, balise meta sur chaque page | Le navigateur refuse tout script, cadre, police ou envoi qui ne vient pas d'une source listée. Un script injecté ne s'exécute pas. |
| Aucun script tiers chargé à la volée | `src/app.js` | La vitrine WebGL (Three.js depuis un CDN) est retirée. Seul le script de mesure Cloudflare est autorisé, et seulement s'il n'y a pas d'opposition. |
| Formulaire | `src/app.js`, page Contact | Champ piège anti-robots (un robot qui le remplit n'envoie rien), longueurs bornées, caractères de contrôle retirés, un envoi toutes les 30 secondes au plus. |
| Admin | `public/admin/`, `supabase/admin_schema.sql` | Connexion Google uniquement, liste blanche d'adresses, règles RLS : le navigateur n'a que la clé publique et ne peut rien écrire sans être admin. Aucune clé secrète dans le dépôt. Page exclue des moteurs. |
| Documents clients | `supabase/documents_schema.sql`, `public/admin/doc-templates.js` | Devis, contrats, droits à l'image et factures pro forma réservés à l'admin ; PDF signés dans un stockage Supabase privé (lien temporaire de 5 minutes pour les ouvrir). Aucune coordonnée bancaire ni téléphone dans le code public : ils sont saisis dans les Réglages. |
| Déploiement | `.github/workflows/pages.yml` | Actions figées par empreinte (une action compromise ne peut pas changer de code en silence), identifiants Git non conservés, droits minimum, durée limitée à 10 minutes. |
| Mises à jour | `.github/dependabot.yml` | Une demande de fusion par mois si une action a une nouvelle version. |
| En-têtes HTTP | `public/_headers` (Cloudflare Pages) | HSTS, nosniff, `X-Frame-Options: SAMEORIGIN`, Referrer-Policy, Permissions-Policy, et la même CSP qu'en meta avec `frame-ancestors 'self'` (remplie au build). L'en-tête `Access-Control-Allow-Origin: *` ajouté par défaut par Cloudflare est retiré. |
| Base Supabase | `supabase/*.sql` | RLS sur chaque table, fonctions SECURITY DEFINER à `search_path` vide. Testé sur une base locale (visiteur, compte connecté non admin, admin) : un visiteur ne lit que les versions publiées, rien d'autre ; un compte non admin ne voit ni n'écrit rien. Le compteur de vues, jamais utilisé et appelable par tous, est retiré (`page_views.sql`). |
| Garde-fous | `scripts/check.mjs` | Le build échoue si : CSP manquante, assouplie ou différente entre meta et en-tête ; en-tête de sécurité absent ; fichier interne publié (.env, .git, .map, .sql, .ts, .mjs, .md) ; valeur ressemblant à un secret (jeton GitHub, clé secrète Supabase, JWT, clé privée, deploy hook) dans le dépôt ou le site ; table sans RLS ; écriture ouverte aux visiteurs ; CORS de `publish-site` élargi ; HTML injecté ou journal de débogage dans l'admin ; numéro de téléphone ou adresse postale dans le site ou les contenus (contrôle générique : le dépôt ne contient plus la donnée qu'il protège) ; action non figée ; `security.txt` expiré. |

Le site est statique : pas de serveur, pas de base de données publique en écriture, pas de mot de passe stocké. La surface d'attaque réelle, ce sont les comptes (GitHub, Cloudflare, Google, Supabase). D'où la liste ci-dessous.

## Ce que seul Nolan peut régler (comptes et tableaux de bord)

### 1. Double authentification partout (priorité absolue)
- **Google** : myaccount.google.com > Sécurité > Validation en deux étapes > Activer. Ajouter une clé d'accès (passkey) si possible.
- **GitHub** : github.com > photo de profil > Settings > Password and authentication > Enable two-factor authentication.
- **Cloudflare** : dash.cloudflare.com > icône profil > My Profile > Authentication > Two-Factor Authentication.
- **Supabase** : supabase.com/dashboard > icône profil > Account preferences > Security > Multi-factor authentication.

### 2. Cloudflare, en-têtes de sécurité
Rien à créer : ils sont dans `public/_headers`, appliqués à chaque déploiement Cloudflare Pages.
- Si une règle « En-têtes sécurité » existe dans Rules > Overview (Response Header Transform Rule) : la **supprimer** (elle écraserait la CSP complète par `frame-ancestors 'self'` seul).
- Ne pas activer la règle gérée « Add security headers » (Managed Transforms) : elle impose `Referrer-Policy: same-origin`, ce qui empêche les vidéos YouTube intégrées de se lancer.

### 3. Cloudflare, chiffrement
SSL/TLS > Edge Certificates :
- **Always Use HTTPS** : On.
- **Minimum TLS Version** : TLS 1.2.
- HSTS : déjà envoyé par `public/_headers` (6 mois, sans sous-domaines). Ne pas l'activer une seconde fois ici.

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

### 8. Supabase, à exécuter une fois
- SQL Editor > New query > coller `supabase/page_views.sql` > **Run**. Utile seulement si l'ancien compteur de vues a été installé un jour ; sans effet sinon.
- Authentication > Rate Limits : garder les valeurs par défaut (elles limitent déjà connexions et envois d'e-mails).

### 9. Formulaire de contact (limitation des envois)
Le formulaire écrit directement à FormSubmit, pas à nolanarc.com : une règle de limitation Cloudflare ou Turnstile ne peut pas le protéger (FormSubmit ne vérifie pas les jetons Turnstile). Ce qui existe : champ piège, filtre anti-spam de FormSubmit, un envoi par 30 secondes. Si le spam devient gênant :
- Dans l'e-mail d'activation de FormSubmit, copier l'**alias aléatoire** proposé et remplacer l'adresse dans l'URL d'action du formulaire : l'adresse n'apparaît plus dans le code.
- Étape suivante : une petite fonction Cloudflare Pages (`/api/contact`) avec Turnstile et limitation par adresse IP.

### 10. GitHub, adresse e-mail des commits
Un ancien commit porte l'adresse Gmail personnelle comme auteur (pas l'adresse de contact). github.com > Settings > Emails : cocher **Keep my email addresses private** et **Block command line pushes that expose my email**. Sur l'ordinateur : `git config --global user.email` avec l'adresse `@users.noreply.github.com` affichée sur cette page.

## Vérifier après réglage
securityheaders.com > saisir `https://nolanarc.com` > Scan. Objectif : A (A+ demande de retirer `'unsafe-inline'` des styles, impossible sans réécrire les styles en ligne).
