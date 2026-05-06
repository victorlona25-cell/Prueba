-- Esquema base para WebTrade CRM en Supabase
-- Ejecutar en Supabase SQL Editor

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  country text,
  username text unique not null,
  password text not null,
  status text not null default 'Activo',
  kyc text not null default 'Pendiente',
  advisor text default 'Victor',
  last_access timestamptz,
  created_at timestamptz default now()
);

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  balance numeric not null default 1250,
  credit numeric not null default 0,
  created_at timestamptz default now()
);

create table if not exists positions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  symbol text not null,
  side text not null,
  lots numeric not null,
  open_price numeric not null,
  pnl numeric not null default 0,
  status text not null default 'Abierta',
  opened_at timestamptz default now(),
  closed_at timestamptz
);

create table if not exists money_movements (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  type text not null,
  amount numeric not null,
  status text not null,
  method text,
  destination text,
  reason text,
  created_at timestamptz default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  action text not null,
  created_at timestamptz default now()
);

insert into clients (name,email,phone,country,username,password,status,kyc,advisor)
values ('Cliente Demo','cliente@demo.com','+52 555 000 0000','Mexico','cliente','123456','Activo','Pendiente','Victor')
on conflict (username) do nothing;

insert into accounts (client_id,balance,credit)
select id,1250,0 from clients where username='cliente'
and not exists (select 1 from accounts where client_id = clients.id);
