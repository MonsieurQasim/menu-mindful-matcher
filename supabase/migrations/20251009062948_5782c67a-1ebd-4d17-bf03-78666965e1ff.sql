-- Create menus table
create table public.menus (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS on menus
alter table public.menus enable row level security;

-- RLS policies for menus
create policy "Menus are viewable by everyone"
on public.menus
for select
using (true);

create policy "Restaurant owners can create menus"
on public.menus
for insert
with check (
  auth.uid() in (
    select owner_id from public.restaurants where id = restaurant_id
  )
);

create policy "Restaurant owners can update their menus"
on public.menus
for update
using (
  auth.uid() in (
    select owner_id from public.restaurants where id = restaurant_id
  )
);

create policy "Restaurant owners can delete their menus"
on public.menus
for delete
using (
  auth.uid() in (
    select owner_id from public.restaurants where id = restaurant_id
  )
);

-- Add menu_id to menu_items
alter table public.menu_items
add column menu_id uuid references public.menus(id) on delete cascade;

-- Add certificate_url for halal certification
alter table public.menu_items
add column certificate_url text;

-- Create storage bucket for certificates
insert into storage.buckets (id, name)
values ('certificates', 'certificates')
on conflict (id) do nothing;

-- RLS policies for certificates
create policy "Certificates are publicly accessible"
on storage.objects
for select
using (bucket_id = 'certificates');

create policy "Restaurant owners can upload certificates"
on storage.objects
for insert
with check (
  bucket_id = 'certificates' 
  and auth.uid() is not null
);

create policy "Restaurant owners can update certificates"
on storage.objects
for update
using (
  bucket_id = 'certificates' 
  and auth.uid() is not null
);

create policy "Restaurant owners can delete certificates"
on storage.objects
for delete
using (
  bucket_id = 'certificates' 
  and auth.uid() is not null
);

-- Trigger for updating menus updated_at
create trigger update_menus_updated_at
before update on public.menus
for each row
execute function public.update_updated_at_column();