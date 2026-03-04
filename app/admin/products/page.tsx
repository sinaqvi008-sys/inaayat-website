'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { getPin } from '@/lib/adminAuth';
import MarkSaleButton from '@/components/admin/MarkSaleButton';
import { useToast } from '@/context/ToastContext';

type ProductRow = {
  id: number;
  title: string;
  price: number;
  in_stock?: boolean | null;
  quantity?: number | null;
  image_urls?: string[] | null;
  created_at?: string | null;
};

const PER_PAGE_OPTIONS = [10, 20, 50];

export default function ProductsList() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'title' | 'price' | 'quantity' | 'created_at'>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<number>(20);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const { show } = useToast();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

      setProducts((data || []) as ProductRow[]);
      setLoading(false);
    })();
  }, []);

  // Derived filtered + sorted list
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.slice();

    if (q) {
      list = list.filter(
        (p) =>
          String(p.id).includes(q) ||
          (p.title || '').toLowerCase().includes(q) ||
          (p.price !== undefined && String(p.price).includes(q))
      );
    }

    list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'title':
          return dir * ((a.title || '').localeCompare(b.title || ''));
        case 'price':
          return dir * ((Number(a.price) || 0) - (Number(b.price) || 0));
        case 'quantity':
          return dir * ((Number(a.quantity) || 0) - (Number(b.quantity) || 0));
        case 'created_at':
          return dir * (Number(new Date(a.created_at || 0)) - Number(new Date(b.created_at || 0)));
        default:
          return dir * (Number(a.id) - Number(b.id));
      }
    });

    return list;
  }, [products, query, sortBy, sortDir]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  function toggleSelect(id: number) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  function selectAllOnPage() {
    const newSel = { ...selected };
    pageItems.forEach((p) => (newSel[p.id] = true));
    setSelected(newSel);
  }

  function clearSelection() {
    setSelected({});
  }

  async function bulkMarkSale() {
    const ids = Object.keys(selected).filter((k) => selected[Number(k)]).map(Number);
    if (!ids.length) {
      show('No products selected', 'error');
      return;
    }
    if (!confirm(`Mark one unit sold for ${ids.length} product(s)?`)) return;

    const pin = getPin();
    setLoading(true);
    try {
      // Call mark-sale for each selected id sequentially to keep UI predictable.
      // For performance you can parallelize, but sequential avoids race UI issues.
      const updatedProducts: ProductRow[] = [];
      for (const id of ids) {
        const res = await fetch('/api/admin/mark-sale', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(pin ? { 'x-admin-pin': pin } : {}),
          },
          body: JSON.stringify({ productId: id }),
        });
        const json = await res.json();
        if (res.ok && json.ok) {
          updatedProducts.push(json.product);
        } else {
          // show first error and continue
          if (res.status === 409) show(`Product ${id} is already out of stock`, 'error');
          else if (res.status === 404) show(`Product ${id} not found`, 'error');
          else show(json.error || `Could not mark sale for ${id}`, 'error');
        }
      }

      // Merge updates into local state
      if (updatedProducts.length) {
        setProducts((prev) =>
          prev.map((p) => {
            const upd = updatedProducts.find((u) => u.id === p.id);
            return upd ? { ...p, ...upd } : p;
          })
        );
        show('Marked sale for selected products', 'success');
      }
      clearSelection();
    } catch (err) {
      console.error(err);
      show('Network error while marking sales', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleSort(field: typeof sortBy) {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage inventory — quick actions, bulk updates, and search.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/products/new" className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-800 rounded-md shadow-sm hover:shadow-md">
            + Add Product
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search by id, title or price..."
            className="w-full md:w-72 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-200"
          />

          <select
            value={perPage}
            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
            className="px-3 py-2 border rounded-md"
          >
            {PER_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n} / page</option>)}
          </select>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Sort:</span>
            <button onClick={() => handleSort('id')} className={`px-2 py-1 rounded ${sortBy === 'id' ? 'bg-amber-50' : ''}`}>ID</button>
            <button onClick={() => handleSort('title')} className={`px-2 py-1 rounded ${sortBy === 'title' ? 'bg-amber-50' : ''}`}>Title</button>
            <button onClick={() => handleSort('price')} className={`px-2 py-1 rounded ${sortBy === 'price' ? 'bg-amber-50' : ''}`}>Price</button>
            <button onClick={() => handleSort('quantity')} className={`px-2 py-1 rounded ${sortBy === 'quantity' ? 'bg-amber-50' : ''}`}>Qty</button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={selectAllOnPage}
            className="px-3 py-2 bg-gray-50 rounded-md text-sm hover:bg-gray-100"
          >
            Select page
          </button>

          <button
            onClick={clearSelection}
            className="px-3 py-2 bg-gray-50 rounded-md text-sm hover:bg-gray-100"
          >
            Clear
          </button>

          <button
            onClick={bulkMarkSale}
            disabled={Object.values(selected).filter(Boolean).length === 0 || loading}
            className={`px-3 py-2 rounded-md text-sm ${Object.values(selected).filter(Boolean).length ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
          >
            Mark Sale ({Object.values(selected).filter(Boolean).length})
          </button>
        </div>
      </div>

      {/* List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="p-6 bg-white rounded-lg shadow-sm text-gray-500">Loading...</div>
        ) : pageItems.length === 0 ? (
          <div className="p-6 bg-white rounded-lg shadow-sm text-gray-500">No products found.</div>
        ) : (
          pageItems.map((p) => {
            const outOfStock = p.in_stock === false || (p.quantity ?? 0) <= 0;
            return (
              <div key={p.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4">
                <div className="flex items-center gap-4 w-full">
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <input
                      type="checkbox"
                      checked={!!selected[p.id]}
                      onChange={() => toggleSelect(p.id)}
                      className="h-4 w-4"
                    />

                    <div className="h-16 w-16 rounded-md bg-gray-50 overflow-hidden flex items-center justify-center border">
                      {p.image_urls?.[0] ? (
                        // plain img to avoid next/image layout issues in admin
                        <img src={p.image_urls[0]} alt={p.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="text-xs text-gray-400">No image</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">{p.title}</div>
                          <div className="text-xs text-gray-500 mt-1">ID: {p.id} • Added: {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold text-amber-700">₹{p.price}</div>

                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${outOfStock ? 'bg-gray-100 text-gray-600' : 'bg-emerald-50 text-emerald-800'}`}>
                            {outOfStock ? 'Out of stock' : `In stock • ${p.quantity ?? 0}`}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-3">
                        <Link href={`/admin/products/${p.id}`} className="text-sm text-blue-600 underline">Edit</Link>

                        <MarkSaleButton
                          product={{ id: p.id, title: p.title, quantity: p.quantity ?? 0, in_stock: !!p.in_stock }}
                          onUpdated={(updated) =>
                            setProducts((prev) => prev.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing <strong>{(page - 1) * perPage + 1}</strong> to <strong>{Math.min(page * perPage, total)}</strong> of <strong>{total}</strong> products
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded-md bg-white border hover:bg-gray-50 disabled:opacity-50"
          >
            Prev
          </button>

          <div className="px-3 py-1 rounded-md bg-white border">
            Page {page} / {pages}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-3 py-1 rounded-md bg-white border hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
