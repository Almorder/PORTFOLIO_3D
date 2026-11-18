-- Photos de la page Work : stockage des fichiers et brouillon « photos » dans l'admin.
-- À exécuter UNE FOIS dans Supabase > SQL Editor, APRÈS admin_schema.sql (il utilise public.is_admin()).
-- Réexécutable sans danger : rien n'est effacé, le bucket et les règles sont simplement remis à jour.
--
-- Ce que fait ce fichier, concrètement :
-- 1. Autorise un nouveau bloc de brouillon « photos » (la liste des photos, leur ordre, leurs légendes).
-- 2. Crée l'espace de fichiers « site-photos » : public en lecture (ce sont les photos publiées sur le site),
--    uniquement des images WebP, 3 Mo maximum par fichier.
-- 3. Sécurité : seul l'administrateur peut envoyer, remplacer, lister ou supprimer un fichier.
--    Un visiteur peut seulement ouvrir une photo dont il connaît l'adresse exacte ; il ne peut pas lister l'espace.
--
-- Les visiteurs du site ne contactent jamais Supabase : au déploiement, le site copie les photos publiées
-- chez lui (tools/fetch-photos.mjs) et les sert depuis nolanarc.com.

-- ---------------------------------------------------------------- 1. Brouillon « photos »
alter table public.content_drafts drop constraint if exists content_drafts_key_check;
alter table public.content_drafts add constraint content_drafts_key_check
  check (key in ('projects','testimonials','offers','faq','site','legal','instagram','photos'));

-- ---------------------------------------------------------------- 2. Espace de fichiers public en lecture
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-photos', 'site-photos', true, 3145728, array['image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------- 3. Écriture et liste réservées à l'administrateur
drop policy if exists "site-photos : admin seulement (lecture)" on storage.objects;
drop policy if exists "site-photos : admin seulement (ajout)" on storage.objects;
drop policy if exists "site-photos : admin seulement (modification)" on storage.objects;
drop policy if exists "site-photos : admin seulement (suppression)" on storage.objects;
create policy "site-photos : admin seulement (lecture)" on storage.objects for select to authenticated
  using (bucket_id = 'site-photos' and (select public.is_admin()));
create policy "site-photos : admin seulement (ajout)" on storage.objects for insert to authenticated
  with check (bucket_id = 'site-photos' and (select public.is_admin()));
create policy "site-photos : admin seulement (modification)" on storage.objects for update to authenticated
  using (bucket_id = 'site-photos' and (select public.is_admin())) with check (bucket_id = 'site-photos' and (select public.is_admin()));
create policy "site-photos : admin seulement (suppression)" on storage.objects for delete to authenticated
  using (bucket_id = 'site-photos' and (select public.is_admin()));
