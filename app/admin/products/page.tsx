'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getPin } from '@/lib/adminAuth';
import Link from 'next/link';

export default function ProductsList() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const pin = getPin();
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

      setProducts(data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Products</h1>
        <Link href="/admin/products/new" className="btn btn-primary">+ Add Product</Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Image</th>
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">In Stock</th>

              {/* ✅ NEW: Quantity column */}
              <th className="p-2 border">Quantity</th>

              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-2 border">
                  {p.image_urls?.[0] ? (
                    <img src={p.image_urls[0]} className="h-14 w-14 object-cover rounded" />
                  ) : (
                    '—'
                  )}
                </td>
                <td className="p-2 border">{p.title}</td>
                <td className="p-2 border">₹{p.price}</td>
                <td className="p-2 border">{p.in_stock ? 'Yes' : 'No'}</td>

                {/* ✅ NEW: Show quantity */}
                <td className="p-2 border">{p.quantity ?? 0}</td>

                <td className="p-2 border">
                  <Link href={`/admin/products/${p.id}`} className="text-blue-600 underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
