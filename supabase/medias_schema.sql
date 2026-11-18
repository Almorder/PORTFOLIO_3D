-- Médias du site : « Images du site » (accueil) et fichiers vidéo des Social media videos.
-- À exécuter UNE FOIS dans Supabase > SQL Editor, APRÈS admin_schema.sql et photos_schema.sql.
-- Réexécutable sans danger : rien n'est effacé, les règles sont simplement remises à jour.
--
-- Ce que fait ce fichier, concrètement :
-- 1. Autorise un nouveau bloc de brouillon « images » (images remplacées de l'accueil : Trois dimensions, Mariage).
-- 2. Crée l'espace de fichiers « site-videos » : public en lecture, uniquement MP4, MOV ou WebM, 50 Mo maximum
--    par fichier (limite du forfait gratuit de Supabase).
-- 3. Sécurité : seul l'administrateur peut envoyer, remplacer, lister ou supprimer une vidéo.
--
-- Les visiteurs du site ne contactent jamais Supabase : au déploiement, le site copie les vidéos publiées
-- chez lui (tools/fetch-published.mjs) et les sert depuis nolanarc.com.

-- ---------------------------------------------------------------- 1. Brouillon « images »
alter table public.content_drafts drop constraint if exists content_drafts_key_check;
alter table public.content_drafts add constraint content_drafts_key_check
  check (key in ('projects','testimonials','offers','faq','site','legal','instagram','photos','images'));

-- ---------------------------------------------------------------- 2. Espace de fichiers vidéo, public en lecture
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-videos', 'site-videos', true, 52428800, array['video/mp4','video/quicktime','video/webm'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------- 3. Écriture et liste réservées à l'administrateur
drop policy if exists "site-videos : admin seulement (lecture)" on storage.objects;
drop policy if exists "site-videos : admin seulement (ajout)" on storage.objects;
drop policy if exists "site-videos : admin seulement (modification)" on storage.objects;
drop policy if exists "site-videos : admin seulement (suppression)" on storage.objects;
create policy "site-videos : admin seulement (lecture)" on storage.objects for select to authenticated
  using (bucket_id = 'site-videos' and (select public.is_admin()));
create policy "site-videos : admin seulement (ajout)" on storage.objects for insert to authenticated
  with check (bucket_id = 'site-videos' and (select public.is_admin()));
create policy "site-videos : admin seulement (modification)" on storage.objects for update to authenticated
  using (bucket_id = 'site-videos' and (select public.is_admin())) with check (bucket_id = 'site-videos' and (select public.is_admin()));
create policy "site-videos : admin seulement (suppression)" on storage.objects for delete to authenticated
  using (bucket_id = 'site-videos' and (select public.is_admin()));
