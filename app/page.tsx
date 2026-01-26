
'use client';
import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CategoryTabs from '@/components/CategoryTabs';
import Filters, { SortOption } from '@/components/Filters';
import ProductGrid from '@/components/ProductGrid';
import CartDrawer from '@/components/CartDrawer';
import { supabase } from '@/lib/supabaseClient';
import type { Category, Product } from '@/lib/types';
import { DEFAULT_CATEGORY_SLUG } from '@/lib/constants';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCatId, setActiveCatId] = useState<number | null>(null);
  const [q, setQ] = useState('');
  const [inStockOnly, setInStockOnly] = useState(true);
  const [sort, setSort] = useState<SortOption>('relevance');

  useEffect(() => {
    async function load() {
      const { data: cats } = await supabase.from('categories').select('*').order('display_order', { ascending: true });
      setCategories(cats || []);
      const defaultCat = (cats || []).find(c => c.slug === DEFAULT_CATEGORY_SLUG) || (cats || [])[0] || null;
      setActiveCatId(defaultCat?.id ?? null);

      const { data: prods } = await supabase.from('products').select('*');
      setProducts(prods || []);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = products;
    if (activeCatId) list = list.filter(p => p.category_id === activeCatId);
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter(p => (p.title?.toLowerCase().includes(needle) || p.description?.toLowerCase().includes(needle) || (p.tags||[]).join(' ').toLowerCase().includes(needle)));
    }
    if (inStockOnly) list = list.filter(p => p.in_stock !== false);

    switch (sort) {
      case 'price-asc': list = [...list].sort((a,b)=> (a.price)-(b.price)); break;
      case 'price-desc': list = [...list].sort((a,b)=> (b.price)-(a.price)); break;
      case 'newest': list = [...list].sort((a,b)=> (b.id)-(a.id)); break; // simple proxy
      default: break; // relevance is current order
    }
    return list;
  }, [products, activeCatId, q, inStockOnly, sort]);

  return (
    <div id="top">
      <Header onSearch={setQ} />
      <Hero />

      <main className="container py-6 space-y-6">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Browse</h2>
          </div>
          <CategoryTabs categories={categories} activeId={activeCatId} onChange={setActiveCatId} />
        </section>

        <section className="space-y-3">
          <Filters inStockOnly={inStockOnly} onInStockChange={setInStockOnly} sort={sort} onSortChange={setSort} />
          <ProductGrid products={filtered} />
        </section>
      </main>

      <CartDrawer />
    </div>
  );
}
