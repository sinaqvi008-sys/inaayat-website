
-- PRODUCT IMAGES (multiple photos per product)
create table if not exists product_images (
  id bigserial primary key,
  product_id bigint references products(id) on delete cascade,
  url text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table product_images enable row level security;

create policy if not exists "public read product_images" on product_images
for select using (true);

create policy if not exists "no public insert product_images" on product_images
for insert with check (false);
