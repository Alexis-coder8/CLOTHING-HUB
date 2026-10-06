create table if not exists public.community_looks (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(display_name) between 1 and 40),
  title text not null check (char_length(title) between 1 and 80),
  category text not null check (category in (
    'elegant', 'african', 'corporate', 'casual', 'feminine',
    'old-money', 'university', 'romantic', 'streetwear', 'cozy'
  )),
  image_url text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  look_id text not null,
  display_name text not null check (char_length(display_name) between 1 and 40),
  body text not null check (char_length(body) between 1 and 300),
  created_at timestamptz not null default now()
);

alter table public.community_looks enable row level security;
alter table public.community_comments enable row level security;

grant select, insert on public.community_looks to anon, authenticated;
grant select, insert on public.community_comments to anon, authenticated;

drop policy if exists "Anyone can view community looks" on public.community_looks;
create policy "Anyone can view community looks"
  on public.community_looks for select to anon, authenticated using (true);

drop policy if exists "Anyone can share community looks" on public.community_looks;
drop policy if exists "Authenticated users can share community looks" on public.community_looks;
create policy "Anyone can share community looks"
  on public.community_looks for insert to anon, authenticated with check (
    char_length(display_name) between 1 and 40
    and char_length(title) between 1 and 80
  );

drop policy if exists "Anyone can view community comments" on public.community_comments;
create policy "Anyone can view community comments"
  on public.community_comments for select to anon, authenticated using (true);

drop policy if exists "Anyone can post community comments" on public.community_comments;
drop policy if exists "Authenticated users can post community comments" on public.community_comments;
create policy "Anyone can post community comments"
  on public.community_comments for insert to anon, authenticated with check (
    char_length(display_name) between 1 and 40
    and char_length(body) between 1 and 300
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('luveria-looks', 'luveria-looks', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can view shared look pictures" on storage.objects;
create policy "Anyone can view shared look pictures"
  on storage.objects for select to anon, authenticated using (bucket_id = 'luveria-looks');

drop policy if exists "Anyone can upload shared look pictures" on storage.objects;
drop policy if exists "Authenticated users can upload shared look pictures" on storage.objects;
create policy "Anyone can upload shared look pictures"
  on storage.objects for insert to anon, authenticated with check (bucket_id = 'luveria-looks');
