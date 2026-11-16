-- Page View Counter — version durcie
-- À exécuter dans Supabase > SQL Editor, puis renseigner SUPABASE_URL et SUPABASE_ANON_KEY au build.
-- Principe : aucun accès direct à la table pour le navigateur ; tout passe par increment_page_view(),
-- qui renvoie la valeur. Pas de policy = RLS refuse tout accès direct (moindre privilège).
-- Pourquoi : l'ancienne version autorisait insert/update public (USING (true)) ;
-- n'importe qui avec la clé anon pouvait écrire n'importe quelle valeur sur n'importe quelle ligne.

CREATE TABLE IF NOT EXISTS page_views (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  views INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON page_views;
DROP POLICY IF EXISTS "Allow public insert access" ON page_views;
DROP POLICY IF EXISTS "Allow public update access" ON page_views;

-- Aucune policy volontairement : la fonction SECURITY DEFINER ci-dessous est la seule porte d'entrée.

CREATE OR REPLACE FUNCTION public.increment_page_view(p_slug text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_views integer;
BEGIN
  -- Refuse tout slug qui n'a pas la forme d'un chemin du site (évite de polluer la table).
  IF p_slug IS NULL OR p_slug !~ '^/[A-Za-z0-9/_.-]{0,120}$' THEN
    RAISE EXCEPTION 'invalid slug';
  END IF;

  INSERT INTO page_views (slug, views) VALUES (p_slug, 1)
  ON CONFLICT (slug) DO UPDATE
    SET views = page_views.views + 1, updated_at = now()
  RETURNING views INTO new_views;

  RETURN new_views;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_page_view(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_page_view(text) TO anon;
