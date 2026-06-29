-- ============================================================
-- TAAMA — Migration 002 : Table des demandes de démo
-- ============================================================

create table if not exists demo_requests (
  id          uuid        primary key default gen_random_uuid(),
  prenom      text        not null,
  nom         text        not null,
  email       text        not null,
  entreprise  text        not null,
  filiere     text        not null,
  nb_employes text        not null,
  message     text,
  created_at  timestamptz not null default now()
);

-- Index pour les recherches par email
create index if not exists demo_requests_email_idx on demo_requests (email);
create index if not exists demo_requests_created_at_idx on demo_requests (created_at desc);

-- RLS activé
alter table demo_requests enable row level security;

-- Toute personne peut soumettre une demande de démo (formulaire public)
create policy "allow_public_insert" on demo_requests
  for insert
  with check (true);

-- Lecture réservée au service_role (admins Supabase uniquement)
create policy "deny_public_select" on demo_requests
  for select
  using (false);
