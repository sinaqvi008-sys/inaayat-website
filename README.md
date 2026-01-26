
# Colony Shop MVP (Next.js + Supabase)

**Hyperlocal Try-Before-You-Buy website** with:
- Landing page (hero + product listing)
- Cart with **max 5 items**
- Schedule a visit form (captures customer details + selected items)
- Global search, category tabs, filter & sort
- Categories: **Ladies Suits (default)**, Jewelry, Bags

## 1) Prerequisites
- Node 18+
- Supabase project (free tier is fine)
- Vercel account (deploy in 1 click)

## 2) Supabase Setup (Tables + Policies)
Open **Supabase → SQL Editor → New Query**, paste and **Run**:

```sql
-- 1) CATEGORIES
create table if not exists categories (
  id bigserial primary key,
  name text not null,
  slug text unique,
  display_order int default 0,
  is_featured boolean default false,
  created_at timestamptz default now()
);

-- 2) PRODUCTS
create table if not exists products (
  id bigserial primary key,
  title text not null,
  description text,
  category_id bigint references categories(id) on delete set null,
  price numeric(10,2) not null,
  mrp numeric(10,2),
  image_url text,
  in_stock boolean default true,
  tags text[] default '{}',
  created_at timestamptz default now()
);

create index if not exists idx_products_search
  on products using gin (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,'')));

-- 3) VISITS (orders)
create table if not exists visits (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  address_line text,
  flat text,
  landmark text,
  google_maps_link text,
  preferred_date date,
  preferred_time_slot text,
  status text default 'new',
  note text,
  created_at timestamptz default now()
);

-- 4) VISIT ITEMS (products in a visit)
create table if not exists visit_items (
  id bigserial primary key,
  visit_id uuid references visits(id) on delete cascade,
  product_id bigint references products(id),
  quantity int default 1
);

-- RLS
alter table categories enable row level security;
alter table products enable row level security;
alter table visits enable row level security;
alter table visit_items enable row level security;

create policy "public read categories" on categories
for select using (true);

create policy "public read products" on products
for select using (true);

create policy "public insert visits" on visits
for insert with check (true);

create policy "no public select visits" on visits
for select using (false);

create policy "public insert visit_items" on visit_items
for insert with check (true);

create policy "no public select visit_items" on visit_items
for select using (false);
```

### Seed Categories & Sample Products
```sql
insert into categories (name, slug, display_order, is_featured) values
('Ladies Suits','ladies-suits',1,true),
('Jewelry','jewelry',2,false),
('Bags','bags',3,false)
on conflict (slug) do nothing;

insert into products (title, description, category_id, price, mrp, image_url, in_stock, tags) values
('Cotton Anarkali Suit - Blue', 'Breathable cotton, daily wear', (select id from categories where slug='ladies-suits'), 1499, 1999, 'https://picsum.photos/seed/suit1/600/800', true, array['cotton','anarkali','blue','summer']),
('Printed Suit Set - Maroon', 'Printed kurta, pants, dupatta', (select id from categories where slug='ladies-suits'), 1799, 2299, 'https://picsum.photos/seed/suit2/600/800', true, array['printed','maroon','set']),
('Silk Partywear Suit - Teal', 'Light silk blend, festive', (select id from categories where slug='ladies-suits'), 2499, 2999, 'https://picsum.photos/seed/suit3/600/800', true, array['silk','party','teal']);

insert into products (title, description, category_id, price, mrp, image_url, in_stock, tags) values
('Gold-plated Jhumka', 'Lightweight daily wear', (select id from categories where slug='jewelry'), 499, 799, 'https://picsum.photos/seed/jewel1/600/800', true, array['jhumka','gold','plated']),
('Kundan Necklace Set', 'With matching earrings', (select id from categories where slug='jewelry'), 1299, 1699, 'https://picsum.photos/seed/jewel2/600/800', true, array['kundan','necklace']);

insert into products (title, description, category_id, price, mrp, image_url, in_stock, tags) values
('Tote Bag - Tan', 'Everyday carry', (select id from categories where slug='bags'), 799, 1099, 'https://picsum.photos/seed/bag1/600/800', true, array['tote','tan']),
('Sling Bag - Black', 'Compact & stylish', (select id from categories where slug='bags'), 599, 899, 'https://picsum.photos/seed/bag2/600/800', true, array['sling','black']);
```

## 3) Local Development
```bash
cp .env.example .env.local
# paste your Supabase URL & anon key
npm install
npm run dev
```
Visit http://localhost:3000

## 4) Deploy on Vercel
- Push this repo to GitHub
- Vercel → New Project → Import from GitHub → Deploy
- Add these **Environment Variables** in Vercel project settings:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Redeploy

## 5) How it Works
- Home page loads categories + products from Supabase (public read policies)
- Users add up to **5** items to cart (stored in browser)
- Schedule form writes **visit** and **visit_items** (public insert policies)
- You can view submissions in **Supabase → Table Editor**

## 6) Customization
- Primary color is **maroon** (`brand` color in Tailwind). Change in `tailwind.config.js`.
- Site name in `lib/constants.ts`

---

**Made for a hyperlocal MVP.**
