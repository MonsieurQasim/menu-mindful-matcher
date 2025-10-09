-- Create storage bucket for menu item images
insert into storage.buckets (id, name)
values ('menu-items', 'menu-items')
on conflict (id) do nothing;

-- Create RLS policies for menu item images
create policy "Menu item images are publicly accessible"
on storage.objects
for select
using (bucket_id = 'menu-items');

create policy "Restaurant owners can upload menu item images"
on storage.objects
for insert
with check (
  bucket_id = 'menu-items' 
  and auth.uid() is not null
);

create policy "Restaurant owners can update their menu item images"
on storage.objects
for update
using (
  bucket_id = 'menu-items' 
  and auth.uid() is not null
);

create policy "Restaurant owners can delete their menu item images"
on storage.objects
for delete
using (
  bucket_id = 'menu-items' 
  and auth.uid() is not null
);

-- Add image_url column to menu_items table if it doesn't exist
alter table menu_items 
add column if not exists image_url text;