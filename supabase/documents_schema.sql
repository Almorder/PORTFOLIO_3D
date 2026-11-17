-- Documents de l'admin Nolan Arc : devis, contrats, factures pro forma, droits à l'image, rétractations,
-- et stockage privé des PDF signés ou des factures Indy.
-- À exécuter UNE FOIS dans Supabase > SQL Editor, APRÈS cockpit_schema.sql. Réexécutable sans danger.

-- ---------------------------------------------------------------- Nouveaux types et champs
alter table public.crm_documents add column if not exists template text check (char_length(template) <= 40);
alter table public.crm_documents add column if not exists data jsonb not null default '{}'::jsonb;
alter table public.crm_documents add column if not exists indy_number text check (char_length(indy_number) <= 60);
alter table public.crm_documents add column if not exists file_path text check (char_length(file_path) <= 300);
alter table public.crm_documents add column if not exists signed_at date;

alter table public.crm_documents drop constraint if exists crm_documents_kind_check;
alter table public.crm_documents add constraint crm_documents_kind_check
  check (kind in ('devis','facture','contrat','droit_image','retractation'));
alter table public.crm_documents drop constraint if exists crm_documents_status_check;
alter table public.crm_documents add constraint crm_documents_status_check
  check (status in ('brouillon','envoye','accepte','refuse','signe','paye','annule'));
alter table public.crm_documents drop constraint if exists crm_documents_data_check;
alter table public.crm_documents add constraint crm_documents_data_check check (jsonb_typeof(data) = 'object' and pg_column_size(data) < 200000);

-- Numérotation : D- devis, PF- facture pro forma (la facture officielle est émise sur Indy), C- contrat,
-- DI- droit à l'image, R- rétractation. Suite continue par année et par type.
create or replace function public.crm_next_number(p_kind text)
returns text
language plpgsql security definer set search_path = ''
as $$
declare prefix text; seq int;
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  prefix := case p_kind when 'devis' then 'D-' when 'facture' then 'PF-' when 'contrat' then 'C-'
                        when 'droit_image' then 'DI-' when 'retractation' then 'R-' end;
  if prefix is null then raise exception 'kind'; end if;
  prefix := prefix || to_char(current_date, 'YYYY') || '-';
  select coalesce(max(substring(number from char_length(prefix) + 1)::int), 0) + 1 into seq
    from public.crm_documents where number like prefix || '%' and substring(number from char_length(prefix) + 1) ~ '^[0-9]+$';
  return prefix || lpad(seq::text, 3, '0');
end $$;
revoke all on function public.crm_next_number(text) from public, anon;
grant execute on function public.crm_next_number(text) to authenticated;

-- ---------------------------------------------------------------- Stockage privé des fichiers (PDF signés, factures Indy, scans)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 20971520, array['application/pdf','image/jpeg','image/png'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "documents : admin seulement (lecture)" on storage.objects;
drop policy if exists "documents : admin seulement (ajout)" on storage.objects;
drop policy if exists "documents : admin seulement (modification)" on storage.objects;
drop policy if exists "documents : admin seulement (suppression)" on storage.objects;
create policy "documents : admin seulement (lecture)" on storage.objects for select to authenticated
  using (bucket_id = 'documents' and (select public.is_admin()));
create policy "documents : admin seulement (ajout)" on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and (select public.is_admin()));
create policy "documents : admin seulement (modification)" on storage.objects for update to authenticated
  using (bucket_id = 'documents' and (select public.is_admin())) with check (bucket_id = 'documents' and (select public.is_admin()));
create policy "documents : admin seulement (suppression)" on storage.objects for delete to authenticated
  using (bucket_id = 'documents' and (select public.is_admin()));
