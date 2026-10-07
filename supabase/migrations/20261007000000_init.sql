create or replace function gen_random_uuid() returns uuid language sql as $$ select md5(random()::text || clock_timestamp()::text)::uuid $$;

create or replace function set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

create table if not exists customers (
  id uuid primary key default gen_random_uuid(), name text not null, company text, phone text,
  email text, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (phone is null or phone ~ '^\+[1-9][0-9]{7,14}$')
);
create table if not exists leads (
  id uuid primary key default gen_random_uuid(), name text, phone text not null, email text, company text,
  vehicle_type text, service_slug text, broken_down boolean not null default false, location text, message text,
  status text not null default 'new' check (status in ('new','contacted','converted','closed')), customer_id uuid references customers(id) on delete set null,
  read_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (phone ~ '^\+[1-9][0-9]{7,14}$')
);
create table if not exists payment_requests (
  id uuid primary key default gen_random_uuid(), customer_id uuid not null references customers(id), amount_cents integer not null check (amount_cents >= 100),
  description text not null, kind text not null default 'other' check (kind in ('deposit','full','other')), internal_note text,
  token text unique not null, status text not null default 'open' check (status in ('open','processing','paid','canceled')), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists posts (id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, summary text not null default '', body_md text not null default '', status text not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create index if not exists leads_status_created_idx on leads(status, created_at desc);
create or replace trigger customers_updated_at before update on customers for each row execute function set_updated_at();
create or replace trigger leads_updated_at before update on leads for each row execute function set_updated_at();
create or replace trigger payment_requests_updated_at before update on payment_requests for each row execute function set_updated_at();
create or replace trigger posts_updated_at before update on posts for each row execute function set_updated_at();

alter table customers enable row level security;
alter table leads enable row level security;
alter table payment_requests enable row level security;
alter table posts enable row level security;
