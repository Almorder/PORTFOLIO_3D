-- Cockpit d'activité Nolan Arc : demandes, clients, devis, factures, agenda, réglages.
-- À exécuter UNE FOIS dans Supabase > SQL Editor, APRÈS admin_schema.sql. Réexécutable sans danger.
--
-- Sécurité : tout est réservé à l'administrateur (fonction is_admin() de admin_schema.sql).
-- Aucune écriture publique : les demandes du site arrivent par email (FormSubmit) et sont saisies
-- dans le cockpit, ou collées depuis l'email (le cockpit lit le texte et remplit les champs).

-- ---------------------------------------------------------------- Contacts (clients et prospects)
create table if not exists public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 160),
  email text check (char_length(email) <= 254),
  phone text check (char_length(phone) <= 40),
  company text check (char_length(company) <= 160),
  address text check (char_length(address) <= 400),
  source text check (char_length(source) <= 60),
  notes text check (char_length(notes) <= 4000)
);

-- ---------------------------------------------------------------- Demandes et projets (pipeline)
create table if not exists public.crm_deals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  contact_id uuid references public.crm_contacts(id) on delete set null,
  title text not null check (char_length(title) between 1 and 200),
  offer text check (char_length(offer) <= 40),
  stage text not null default 'nouveau'
    check (stage in ('nouveau','qualifie','devis','signe','production','livre','paye','perdu')),
  amount numeric(10,2) not null default 0 check (amount >= 0),
  event_date date,
  next_action text check (char_length(next_action) <= 300),
  next_action_date date,
  lost_reason text check (char_length(lost_reason) <= 300),
  notes text check (char_length(notes) <= 8000)
);

-- ---------------------------------------------------------------- Devis et factures
create table if not exists public.crm_documents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  kind text not null check (kind in ('devis','facture')),
  number text not null unique check (char_length(number) <= 30),
  contact_id uuid references public.crm_contacts(id) on delete set null,
  deal_id uuid references public.crm_deals(id) on delete set null,
  title text check (char_length(title) <= 200),
  issue_date date not null default current_date,
  due_date date,
  status text not null default 'brouillon'
    check (status in ('brouillon','envoye','accepte','refuse','paye','annule')),
  lines jsonb not null default '[]'::jsonb check (jsonb_typeof(lines) = 'array'),
  total numeric(10,2) not null default 0 check (total >= 0),
  paid_amount numeric(10,2) not null default 0 check (paid_amount >= 0),
  paid_at date,
  payment_method text check (char_length(payment_method) <= 40),
  notes text check (char_length(notes) <= 4000)
);
create index if not exists crm_documents_paid_at on public.crm_documents (paid_at);

-- Une facture émise ne se supprime pas (obligation de numérotation continue) : on l'annule par un avoir.
create or replace function public.crm_protect_invoice()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if old.kind = 'facture' and old.status <> 'brouillon' then
    raise exception 'Une facture émise ne peut pas être supprimée. Passe-la en « annulée » et émets un avoir.' using errcode = '42501';
  end if;
  return old;
end $$;
revoke all on function public.crm_protect_invoice() from public, anon, authenticated;
drop trigger if exists crm_documents_protect on public.crm_documents;
create trigger crm_documents_protect before delete on public.crm_documents
  for each row execute function public.crm_protect_invoice();

-- Numéro suivant : D-2026-001 pour un devis, F-2026-001 pour une facture (suite continue par année).
create or replace function public.crm_next_number(p_kind text)
returns text
language plpgsql security definer set search_path = ''
as $$
declare prefix text; seq int;
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  if p_kind not in ('devis','facture') then raise exception 'kind'; end if;
  prefix := case p_kind when 'devis' then 'D-' else 'F-' end || to_char(current_date, 'YYYY') || '-';
  select coalesce(max(substring(number from char_length(prefix) + 1)::int), 0) + 1 into seq
    from public.crm_documents where number like prefix || '%' and substring(number from char_length(prefix) + 1) ~ '^[0-9]+$';
  return prefix || lpad(seq::text, 3, '0');
end $$;
revoke all on function public.crm_next_number(text) from public, anon;
grant execute on function public.crm_next_number(text) to authenticated;

-- ---------------------------------------------------------------- Agenda
create table if not exists public.crm_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null default 'tournage' check (kind in ('tournage','livraison','rendez-vous','autre')),
  title text not null check (char_length(title) between 1 and 200),
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text check (char_length(location) <= 300),
  deal_id uuid references public.crm_deals(id) on delete set null,
  done boolean not null default false,
  notes text check (char_length(notes) <= 4000)
);

-- ---------------------------------------------------------------- Réglages (objectifs, taux, coordonnées de facturation)
create table if not exists public.crm_settings (
  key text primary key check (key = 'cockpit'),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- Sécurité : administrateur uniquement
do $$
declare t text;
begin
  foreach t in array array['crm_contacts','crm_deals','crm_documents','crm_events','crm_settings'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "admin seulement" on public.%I', t);
    execute format('create policy "admin seulement" on public.%I for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

-- ---------------------------------------------------------------- Journal : chaque modification est tracée
create or replace function public.crm_touch_and_log()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and tg_table_name in ('crm_deals','crm_documents') then new.updated_at := now(); end if;
  insert into public.audit_log (user_id, action, detail)
    values (auth.uid(), 'crm_' || lower(tg_op), jsonb_build_object('table', tg_table_name, 'id', coalesce(new.id, old.id)::text));
  return coalesce(new, old);
end $$;
revoke all on function public.crm_touch_and_log() from public, anon, authenticated;
do $$
declare t text;
begin
  foreach t in array array['crm_contacts','crm_deals','crm_documents','crm_events'] loop
    execute format('drop trigger if exists %I on public.%I', t || '_log', t);
    execute format('create trigger %I before insert or update or delete on public.%I for each row execute function public.crm_touch_and_log()', t || '_log', t);
  end loop;
end $$;
