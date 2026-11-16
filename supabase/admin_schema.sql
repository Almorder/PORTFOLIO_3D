-- Dashboard admin Nolan Arc — Phase B : schéma + sécurité (RLS)
-- À exécuter UNE FOIS dans Supabase > SQL Editor. Réexécutable sans danger (idempotent).
--
-- Principe :
--   * content_drafts    : le contenu en cours d'édition (brouillon), une ligne par bloc (projects, testimonials…).
--   * content_snapshots : les versions publiées, immuables. Le site est construit à partir de la dernière.
--   * admins            : qui a le droit d'écrire. Rempli automatiquement à la première connexion Google
--                         d'une adresse présente dans admin_allowlist (voir fin du fichier).
--   * audit_log         : trace de chaque modification.
-- Le navigateur n'utilise que la clé publique : toute la sécurité repose sur les règles ci-dessous.

-- ---------------------------------------------------------------- Administrateurs
create table if not exists public.admin_allowlist (
  email text primary key check (email = lower(email))
);
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
);
alter table public.admin_allowlist enable row level security;
alter table public.admins enable row level security;
-- Aucune policy sur admin_allowlist : invisible et non modifiable depuis le navigateur.

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.admins where user_id = (select auth.uid())) $$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "admins: lire sa propre ligne" on public.admins;
create policy "admins: lire sa propre ligne" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

-- Inscription automatique : uniquement connexion Google + adresse dans la liste.
-- (app_metadata.provider est fixé par Supabase, l'utilisateur ne peut pas le modifier.)
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.raw_app_meta_data->>'provider' = 'google'
     and exists (select 1 from public.admin_allowlist where email = lower(new.email)) then
    insert into public.admins (user_id) values (new.id) on conflict do nothing;
  end if;
  return new;
end $$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- Brouillons
create table if not exists public.content_drafts (
  key text primary key check (key in ('projects','testimonials','offers','faq','site','legal','instagram')),
  data jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);
alter table public.content_drafts enable row level security;
drop policy if exists "drafts: admin seulement" on public.content_drafts;
create policy "drafts: admin seulement" on public.content_drafts
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------------------------------------------------------------- Versions publiées (immuables)
create table if not exists public.content_snapshots (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  note text check (char_length(note) <= 200),
  content jsonb not null
);
alter table public.content_snapshots enable row level security;
-- Lecture publique : c'est le contenu déjà publié sur le site. Aucune policy d'écriture :
-- la seule porte d'entrée est publish_snapshot() ci-dessous.
drop policy if exists "snapshots: lecture publique" on public.content_snapshots;
create policy "snapshots: lecture publique" on public.content_snapshots
  for select to anon, authenticated using (true);

create or replace function public.publish_snapshot(p_note text default null)
returns bigint
language plpgsql security definer set search_path = ''
as $$
declare new_id bigint;
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  if not exists (select 1 from public.content_drafts) then raise exception 'nothing to publish'; end if;
  insert into public.content_snapshots (created_by, note, content)
    select auth.uid(), left(p_note, 200), jsonb_object_agg(key, data) from public.content_drafts
    returning id into new_id;
  insert into public.audit_log (user_id, action, detail) values (auth.uid(), 'publish', jsonb_build_object('snapshot', new_id));
  return new_id;
end $$;
revoke all on function public.publish_snapshot(text) from public, anon;
grant execute on function public.publish_snapshot(text) to authenticated;

-- ---------------------------------------------------------------- Journal d'audit
create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  user_id uuid,
  action text not null,
  detail jsonb
);
alter table public.audit_log enable row level security;
drop policy if exists "audit: lecture admin" on public.audit_log;
create policy "audit: lecture admin" on public.audit_log
  for select to authenticated using ((select public.is_admin()));

create or replace function public.log_draft_change()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if tg_op <> 'DELETE' then new.updated_at := now(); new.updated_by := auth.uid(); end if;
  insert into public.audit_log (user_id, action, detail)
    values (auth.uid(), 'draft_' || lower(tg_op), jsonb_build_object('key', coalesce(new.key, old.key)));
  return coalesce(new, old);
end $$;
revoke all on function public.log_draft_change() from public, anon, authenticated;
drop trigger if exists content_drafts_audit on public.content_drafts;
create trigger content_drafts_audit before insert or update or delete on public.content_drafts
  for each row execute function public.log_draft_change();

-- ---------------------------------------------------------------- Droits de base (moindre privilège)
revoke all on public.admin_allowlist, public.admins, public.content_drafts, public.content_snapshots, public.audit_log from anon, authenticated;
grant select on public.content_snapshots to anon, authenticated;
grant select on public.admins, public.audit_log to authenticated;
grant select, insert, update, delete on public.content_drafts to authenticated;

-- ---------------------------------------------------------------- À faire juste après (dans le même éditeur SQL)
-- Autoriser TON adresse Google (en minuscules), puis te connecter une première fois via /admin/ :
--   insert into public.admin_allowlist (email) values ('ton-adresse@exemple.com') on conflict do nothing;
