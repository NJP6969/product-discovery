-- Run this in the Supabase SQL Editor to create the required tables.

-- Preferences table: stores like/dislike per product per anonymous session
create table if not exists preferences (
  id uuid default gen_random_uuid() primary key,
  session_id text not null,
  product_id integer not null,
  preference text not null check (preference in ('like', 'dislike')),
  created_at timestamptz default now(),
  unique (session_id, product_id)
);

-- Browsing history table: tracks which product detail pages were visited
create table if not exists browsing_history (
  id uuid default gen_random_uuid() primary key,
  session_id text not null,
  product_id integer not null,
  product_title text not null,
  product_image text,
  product_price numeric,
  visited_at timestamptz default now()
);

-- Index for fast lookups by session
create index if not exists idx_preferences_session on preferences (session_id);
create index if not exists idx_history_session on browsing_history (session_id);

-- Enable Row Level Security but allow anonymous access for this demo
alter table preferences enable row level security;
alter table browsing_history enable row level security;

-- Allow all operations for anon role (this is a demo app with no auth)
create policy "Allow all for anon" on preferences for all using (true) with check (true);
create policy "Allow all for anon" on browsing_history for all using (true) with check (true);
