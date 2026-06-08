-- Run this once in the Supabase SQL editor for the Capacity Planner project.
-- This enables a single shared planner dataset for the GitHub Pages frontend.

create table if not exists public.planner_state (
  id text primary key,
  resources jsonb not null default '[]'::jsonb,
  projects jsonb not null default '[]'::jsonb,
  allocations jsonb not null default '[]'::jsonb,
  scenarios jsonb not null default '[]'::jsonb,
  leave_entries jsonb not null default '[]'::jsonb,
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  updated_by text
);

create or replace function public.bump_planner_state_version()
returns trigger
language plpgsql
as $$
begin
  new.version := old.version + 1;
  new.updated_at := coalesce(new.updated_at, now());
  return new;
end;
$$;

drop trigger if exists bump_planner_state_version on public.planner_state;
create trigger bump_planner_state_version
before update on public.planner_state
for each row
execute function public.bump_planner_state_version();

alter table public.planner_state enable row level security;

drop policy if exists "planner_state_read_main" on public.planner_state;
create policy "planner_state_read_main"
on public.planner_state
for select
to anon
using (id = 'main');

drop policy if exists "planner_state_insert_main" on public.planner_state;
create policy "planner_state_insert_main"
on public.planner_state
for insert
to anon
with check (id = 'main');

drop policy if exists "planner_state_update_main" on public.planner_state;
create policy "planner_state_update_main"
on public.planner_state
for update
to anon
using (id = 'main')
with check (id = 'main');

grant select, insert, update on public.planner_state to anon;
