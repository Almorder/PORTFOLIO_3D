-- Compteur de vues : RETIRÉ (audit sécurité du 24/11/2026).
-- Le site ne l'a jamais appelé (la mesure d'audience passe par Cloudflare Web Analytics). Pourtant, une fois ce
-- fichier exécuté, n'importe qui pouvait appeler increment_page_view() avec la clé publique et créer autant de
-- lignes qu'il voulait dans la base (une par adresse inventée). Code inutile + porte ouverte = on retire.
--
-- À exécuter dans Supabase > SQL Editor SEULEMENT si l'ancienne version a été exécutée un jour (sinon, rien à faire).
-- Réexécutable sans danger. La table page_views, si elle existe, est gardée (aucune donnée effacée) mais devient
-- inaccessible depuis le navigateur ; tu peux la supprimer à la main (Table Editor > page_views > Delete table).

drop function if exists public.increment_page_view(text);

do $$
begin
  if to_regclass('public.page_views') is not null then
    execute 'alter table public.page_views enable row level security';
    execute 'revoke all on public.page_views from anon, authenticated';
  end if;
end $$;
