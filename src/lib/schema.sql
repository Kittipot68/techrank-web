-- Create categories table
create table categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create products table
create table products (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references categories(id) not null,
  name text not null,
  slug text not null unique,
  price_min numeric,
  price_max numeric,
  overall_score float,
  sound_score float,
  fps_score float,
  comfort_score float,
  build_score float,
  pros text[],
  cons text[],
  affiliate_url text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create specs table
create table specs (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade not null,
  key text not null,
  value text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Build indexes for performance
create index products_category_id_idx on products(category_id);
create index products_slug_idx on products(slug);
create index categories_slug_idx on categories(slug);

-- View count column on products
alter table products add column if not exists view_count integer default 0;

-- User ratings table (no login required, track by fingerprint hash)
create table product_ratings (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade not null,
  rating smallint not null check (rating >= 1 and rating <= 5),
  fingerprint text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(product_id, fingerprint)
);

create index product_ratings_product_id_idx on product_ratings(product_id);

-- Newsletter subscribers
create table newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Note: The following commands are for Supabase Storage.
-- You should run these in the Supabase SQL editor to enable the image upload bucket.

-- Create a bucket for product images if it doesn't exist
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- Create policy to allow public viewing
create policy "Public Access"
on storage.objects for select
to public
using ( bucket_id = 'images' );

-- Create policy to allow anonymous/service role uploads (modify as needed for security)
create policy "Allow Uploads"
on storage.objects for insert
to public
with check ( bucket_id = 'images' );
