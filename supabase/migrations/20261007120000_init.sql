-- v1 schema.
--
-- The app reads and writes these tables only from server code, connecting as `postgres` (which
-- bypasses RLS). The Supabase Data API roles (anon, authenticated) must see nothing, so every
-- table has RLS enabled, no policies and no privileges for those roles.

create or replace function public.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Customers -------------------------------------------------------------------------------------

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  phone text check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Leads (service requests from the public site) -------------------------------------------------

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  email text,
  company text,
  vehicle_type text check (
    vehicle_type in ('car_light_truck', 'medium_duty', 'heavy_duty', 'trailer', 'fleet')
  ),
  service_slug text,
  -- The vehicle can't be driven right now.
  vehicle_down boolean not null default false,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'converted', 'closed')),
  customer_id uuid references public.customers (id) on delete set null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_status_created_at_idx on public.leads (status, created_at desc);
create index leads_customer_id_idx on public.leads (customer_id);

-- Payment requests ------------------------------------------------------------------------------

create table public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete restrict,
  amount_cents integer not null check (amount_cents >= 100),
  description text not null,
  kind text not null check (kind in ('deposit', 'full', 'other')),
  internal_note text,
  token text not null unique,
  status text not null default 'open' check (status in ('open', 'processing', 'paid', 'canceled')),
  stripe_checkout_session_id text,
  stripe_checkout_expires_at timestamptz,
  stripe_payment_intent_id text,
  amount_received_cents integer,
  receipt_url text,
  viewed_at timestamptz,
  paid_at timestamptz,
  canceled_at timestamptz,
  last_payment_failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payment_requests_customer_id_idx on public.payment_requests (customer_id);

-- Document templates (versioned; only one active version per slug) ------------------------------

create table public.document_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  version integer not null check (version > 0),
  body_md text not null,
  fields jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (slug, version)
);

create unique index document_templates_active_slug_idx
  on public.document_templates (slug) where active;

-- Signature requests ----------------------------------------------------------------------------

create table public.signature_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete restrict,
  template_id uuid not null references public.document_templates (id) on delete restrict,
  template_slug text not null,
  template_name text not null,
  template_version integer not null,
  field_values jsonb not null default '{}'::jsonb,
  -- Immutable snapshot of the filled-in document.
  rendered_blocks jsonb not null,
  content_sha256 text not null,
  token text not null unique,
  status text not null default 'open' check (status in ('open', 'signed', 'voided')),
  expires_at timestamptz not null,
  viewed_at timestamptz,
  consented_at timestamptz,
  signed_at timestamptz,
  voided_at timestamptz,
  signer_name text,
  signer_email text,
  signer_phone text,
  signer_ip text,
  signer_user_agent text,
  consent_text_version text,
  signature_method text check (signature_method in ('draw', 'type')),
  signature_png bytea,
  pdf_path text,
  pdf_sha256 text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index signature_requests_customer_id_idx on public.signature_requests (customer_id);
create index signature_requests_template_id_idx on public.signature_requests (template_id);

-- Link sends (each time a pay or sign link is shared) -------------------------------------------

create table public.link_sends (
  id uuid primary key default gen_random_uuid(),
  payment_request_id uuid references public.payment_requests (id) on delete cascade,
  signature_request_id uuid references public.signature_requests (id) on delete cascade,
  channel text not null check (channel in ('sms', 'email', 'copy', 'share')),
  sent_at timestamptz not null default now(),
  check (num_nonnulls(payment_request_id, signature_request_id) = 1)
);

create index link_sends_payment_request_id_idx on public.link_sends (payment_request_id);
create index link_sends_signature_request_id_idx on public.link_sends (signature_request_id);

-- Portfolio -------------------------------------------------------------------------------------

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  service_slug text,
  vehicle text,
  city text,
  summary text not null default '',
  body_md text not null default '',
  cover_image_id uuid,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status = 'draft' or published_at is not null)
);

create table public.post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  storage_path text not null,
  alt text not null default '',
  width integer,
  height integer,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index post_images_post_id_idx on public.post_images (post_id, position);

alter table public.posts
  add constraint posts_cover_image_id_fkey
  foreign key (cover_image_id) references public.post_images (id) on delete set null;

-- Stripe webhook idempotency (#26) --------------------------------------------------------------

create table public.stripe_events (
  id text primary key, -- Stripe event ID
  type text not null,
  received_at timestamptz not null default now()
);

-- Rate limiting ---------------------------------------------------------------------------------

create table public.rate_limit_hits (
  id bigint generated always as identity primary key,
  bucket text not null, -- for example 'lead' or 'sign'
  key_hash text not null,
  created_at timestamptz not null default now()
);

create index rate_limit_hits_bucket_key_created_at_idx
  on public.rate_limit_hits (bucket, key_hash, created_at);

-- updated_at triggers ---------------------------------------------------------------------------

create trigger customers_set_updated_at before update on public.customers
  for each row execute function public.set_updated_at();
create trigger leads_set_updated_at before update on public.leads
  for each row execute function public.set_updated_at();
create trigger payment_requests_set_updated_at before update on public.payment_requests
  for each row execute function public.set_updated_at();
create trigger signature_requests_set_updated_at before update on public.signature_requests
  for each row execute function public.set_updated_at();
create trigger posts_set_updated_at before update on public.posts
  for each row execute function public.set_updated_at();

-- Lock-down: RLS on, no policies, no Data API privileges ----------------------------------------

alter table public.customers enable row level security;
alter table public.leads enable row level security;
alter table public.payment_requests enable row level security;
alter table public.document_templates enable row level security;
alter table public.signature_requests enable row level security;
alter table public.link_sends enable row level security;
alter table public.posts enable row level security;
alter table public.post_images enable row level security;
alter table public.stripe_events enable row level security;
alter table public.rate_limit_hits enable row level security;

revoke all on
  public.customers,
  public.leads,
  public.payment_requests,
  public.document_templates,
  public.signature_requests,
  public.link_sends,
  public.posts,
  public.post_images,
  public.stripe_events,
  public.rate_limit_hits
from anon, authenticated;

revoke all on all sequences in schema public from anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
