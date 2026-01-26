
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import type { Product } from '@/lib/types';
export default function AdminProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const [q, setQ] = useState('');
  useEffect(()=>{ (async()=>{ const { data } = await supabase.from('products').select('*').order('id', { ascending: false }); setItems(data||[]); })(); },[]);
  const filtered = items.filter(p => { const n=q.toLowerCase(); return !n || p.title.toLowerCase().includes(n) || (p.tags||[]).join(' ').toLowerCase().includes(n); });
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <Link href="/admin/products/new" className="btn btn-primary">Add Product</Link>
      </div>
      <input className="input mt-4 max-w-md" placeholder="Search products" value={q} onChange={e=>setQ(e.target.value)} />
      <div className="mt-4 overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">Title</th>
              <th className="py-2 pr-4">Price</th>
              <th className="py-2 pr-4">Stock</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b">
                <td className="py-2 pr-4">{p.id}</td>
                <td className="py-2 pr-4">{p.title}</td>
                <td className="py-2 pr-4">₹{p.price}</td>
                <td className="py-2 pr-4">{p.in_stock ? 'In stock' : 'Out'}</td>
                <td className="py-2 pr-4"><Link href={`/admin/products/${p.id}`} className="text-brand">Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
