-- Run this in the Supabase SQL Editor to create the canvas stash tables.

-- Canvases table
create table if not exists public.canvases (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  designer text,
  retailer text,
  mesh_count text check (mesh_count in ('13', '18', 'other')),
  status text not null check (status in ('wishlist', 'in stash', 'WIP', 'to finish', 'complete')),
  notes text,
  created_at timestamptz default now()
);

-- Threads linked to a canvas
create table if not exists public.canvas_threads (
  id uuid primary key default gen_random_uuid(),
  canvas_id uuid not null references public.canvases(id) on delete cascade,
  brand text,
  color_number text,
  color_name text,
  lot_number text,
  quantity integer default 1,
  created_at timestamptz default now()
);

-- Enable RLS (optional; allow anon for now for simplicity)
alter table public.canvases enable row level security;
alter table public.canvas_threads enable row level security;

-- Allow anon read/write for development (tighten in production)
create policy "Allow anon all on canvases" on public.canvases for all using (true) with check (true);
create policy "Allow anon all on canvas_threads" on public.canvas_threads for all using (true) with check (true);

-- Tags on canvases (run after initial schema if needed)
alter table public.canvases add column if not exists tags text[] default '{}';
