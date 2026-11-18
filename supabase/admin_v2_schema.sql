-- Admin Nolan Arc, version 2 : fiches clients complètes (prénom, nom, type, SIRET) et suivi des messages envoyés.
-- À exécuter UNE FOIS dans Supabase > SQL Editor, APRÈS cockpit_schema.sql et documents_schema.sql.
-- Réexécutable sans danger : rien n'est effacé, les colonnes et la table ne sont créées que si elles manquent.
--
-- Ce que fait ce fichier, concrètement :
-- 1. Ajoute aux clients : civilité, prénom, nom, type (particulier ou professionnel) et SIRET.
-- 2. Remplit prénom et nom pour les clients déjà enregistrés, à partir du nom actuel
--    (premier mot = prénom, le reste = nom). Un client qui a une entreprise devient « professionnel ».
-- 3. Garde la colonne « name » à jour toute seule (« Prénom Nom »), pour que rien d'existant ne casse.
-- 4. Crée la table des messages envoyés (crm_messages) : quel message, à quel client, pour quel projet, quand.
-- 5. Sécurité : tout reste réservé à l'administrateur (même règle que le reste du cockpit).

-- ---------------------------------------------------------------- 1. Clients : nouveaux champs
alter table public.crm_contacts add column if not exists civility text;
alter table public.crm_contacts add column if not exists first_name text;
alter table public.crm_contacts add column if not exists last_name text;
alter table public.crm_contacts add column if not exists client_type text;
alter table public.crm_contacts add column if not exists siret text;

alter table public.crm_contacts drop constraint if exists crm_contacts_civility_check;
alter table public.crm_contacts add constraint crm_contacts_civility_check check (civility is null or civility in ('Mme', 'M.'));
alter table public.crm_contacts drop constraint if exists crm_contacts_first_name_check;
alter table public.crm_contacts add constraint crm_contacts_first_name_check check (char_length(first_name) <= 80);
alter table public.crm_contacts drop constraint if exists crm_contacts_last_name_check;
alter table public.crm_contacts add constraint crm_contacts_last_name_check check (char_length(last_name) <= 120);
alter table public.crm_contacts drop constraint if exists crm_contacts_siret_check;
alter table public.crm_contacts add constraint crm_contacts_siret_check check (siret is null or siret ~ '^[0-9 ]{9,20}$');

-- ---------------------------------------------------------------- 2. Reprise des clients existants (une seule fois par client)
update public.crm_contacts
   set first_name = split_part(btrim(name), ' ', 1),
       last_name = nullif(btrim(substr(btrim(name), char_length(split_part(btrim(name), ' ', 1)) + 1)), '')
 where first_name is null and last_name is null and btrim(coalesce(name, '')) <> '';
update public.crm_contacts
   set client_type = case when btrim(coalesce(company, '')) <> '' then 'professionnel' else 'particulier' end
 where client_type is null;
alter table public.crm_contacts alter column client_type set default 'particulier';
alter table public.crm_contacts alter column client_type set not null;
alter table public.crm_contacts drop constraint if exists crm_contacts_client_type_check;
alter table public.crm_contacts add constraint crm_contacts_client_type_check check (client_type in ('particulier', 'professionnel'));

-- ---------------------------------------------------------------- 3. « name » toujours synchronisé : « Prénom Nom », sinon l'entreprise
create or replace function public.crm_contact_sync_name()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare full_name text;
begin
  new.first_name := nullif(btrim(new.first_name), '');
  new.last_name := nullif(btrim(new.last_name), '');
  full_name := btrim(concat_ws(' ', new.first_name, new.last_name));
  if full_name <> '' then new.name := left(full_name, 160);
  elsif btrim(coalesce(new.name, '')) = '' and btrim(coalesce(new.company, '')) <> '' then new.name := left(btrim(new.company), 160);
  end if;
  return new;
end $$;
revoke all on function public.crm_contact_sync_name() from public, anon, authenticated;
drop trigger if exists crm_contacts_sync_name on public.crm_contacts;
create trigger crm_contacts_sync_name before insert or update on public.crm_contacts
  for each row execute function public.crm_contact_sync_name();

-- ---------------------------------------------------------------- 4. Messages envoyés (suivi du parcours client)
create table if not exists public.crm_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  contact_id uuid not null references public.crm_contacts(id) on delete cascade,
  deal_id uuid references public.crm_deals(id) on delete set null,
  message_id text not null check (char_length(message_id) between 1 and 80),
  channel text not null default 'email' check (channel in ('email', 'whatsapp', 'autre')),
  sent_at timestamptz not null default now(),
  note text check (char_length(note) <= 1000)
);
create index if not exists crm_messages_contact on public.crm_messages (contact_id, sent_at);

-- ---------------------------------------------------------------- 5. Sécurité : administrateur uniquement, comme le reste du cockpit
alter table public.crm_messages enable row level security;
drop policy if exists "admin seulement" on public.crm_messages;
create policy "admin seulement" on public.crm_messages for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
revoke all on public.crm_messages from anon, authenticated;
grant select, insert, update, delete on public.crm_messages to authenticated;

-- Journal : chaque message marqué comme envoyé est tracé (même fonction que les autres tables du cockpit).
drop trigger if exists crm_messages_log on public.crm_messages;
create trigger crm_messages_log before insert or update or delete on public.crm_messages
  for each row execute function public.crm_touch_and_log();
