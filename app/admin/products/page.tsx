'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getPin } from '@/lib/adminAuth';
import Link from 'next/link';
import MarkSaleButton from '@/components/admin/MarkSaleButton';

type ProductRow = {
  id: number;
  title: string;
  price: number;
  in_stock: boolean;
  quantity: number | null;
  image_urls?: string[] | null;
};

export default function ProductsList() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // keep existing auth call if you use it elsewhere
      const pin = getPin();
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

      setProducts((data || []) as ProductRow[]);
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
              <th className="p-2 border">Quantity</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-2 border">
                  {p.image_urls?.[0] ? (
                    // keep simple <img> to match your existing code
                    // next/image can be used here if desired
                    // ensure external domains are allowed in next.config.js if using next/image
                    // using plain img avoids build-time issues
                    <img src={p.image_urls![0]} className="h-14 w-14 object-cover rounded" alt={p.title} />
                  ) : (
                    '—'
                  )}
                </td>

                <td className="p-2 border">{p.title}</td>
                <td className="p-2 border">₹{p.price}</td>
                <td className="p-2 border">{p.in_stock ? 'Yes' : 'No'}</td>
                <td className="p-2 border">{p.quantity ?? 0}</td>

                <td className="p-2 border flex items-center gap-3">
                  <Link href={`/admin/products/${p.id}`} className="text-blue-600 underline">
                    Edit
                  </Link>

                  <MarkSaleButton
                    product={{ id: p.id, title: p.title, quantity: p.quantity ?? 0, in_stock: p.in_stock }}
                    onUpdated={(updated) =>
                      setProducts((prev) => prev.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)))
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
