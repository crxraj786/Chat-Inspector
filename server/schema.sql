create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null unique,
  email text unique,
  role text not null default 'admin' check(role in ('admin','viewer')),
  created_at timestamptz not null default now()
);
create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
  account_ref text not null unique,
  display_name text,
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now()
);
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id),
  conversation_ref text not null,
  conversation_name text not null default 'Unknown conversation',
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  unique(account_id, conversation_ref)
);
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id),
  conversation_id uuid not null references conversations(id),
  sender_ref text,
  sender_name text,
  direction text not null check(direction in ('incoming','outgoing','unknown')),
  message_text text not null,
  message_type text not null default 'text',
  source_timestamp timestamptz,
  captured_at timestamptz not null,
  fingerprint text not null unique,
  deleted_status text not null default 'active',
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists messages_conversation_time on messages(conversation_id, captured_at desc);
create index if not exists messages_search on messages using gin(to_tsvector('simple', message_text));
create table if not exists capture_events (
  id bigserial primary key,
  account_id uuid references accounts(id),
  event_type text not null,
  fingerprint_prefix text,
  created_at timestamptz not null default now()
);
create table if not exists settings (
  owner_id text primary key,
  telegram_notifications boolean not null default false,
  timezone text not null default 'Asia/Kolkata',
  updated_at timestamptz not null default now()
);
