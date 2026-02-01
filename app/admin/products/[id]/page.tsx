'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getPin } from '@/lib/adminAuth';
import { useRouter } from 'next/navigation';

export default function EditProduct({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const [product, setProduct] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(error);
        alert('Could not load product');
        return;
      }

      setProduct(data);
    })();
  }, [id]);

  async function save() {
    if (!product) return;

    setBusy(true);
    try {
      const pin = getPin();

      const res = await fetch('/api/admin/products/' + id, {
        // ✅ use PUT because the API route is PUT
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin || '',
        },
        // we send the whole product object, which includes quantity
        body: JSON.stringify(product),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Error updating');
      }

      alert('Updated!');
      router.replace('/admin/products');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error updating');
    } finally {
      setBusy(false);
    }
  }

  if (!product) return <p className="p-6">Loading...</p>;

  return (
    <div className="container py-6 max-w-3xl">
      <h1 className="text-xl font-semibold">Edit Product</h1>

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="text-sm">Title</label>
          <input
            className="input"
            value={product.title || ''}
            onChange={(e) =>
              setProduct({ ...product, title: e.target.value })
            }
          />
        </div>

        <div>
          <label className="text-sm">Price</label>
          <input
            className="input"
            type="number"
            value={product.price ?? ''}
          onChange={(e) =>
              setProduct({
                ...product,
                price: e.target.value === '' ? null : Number(e.target.value),
              })
            }
          />
        </div>

        <div>
          <label className="text-sm">MRP</label>
          <input
            className="input"
            type="number"
            value={product.mrp ?? ''}
            onChange={(e) =>
              setProduct({
                ...product,
                mrp: e.target.value === '' ? null : Number(e.target.value),
              })
            }
          />
        </div>

        <div>
          <label className="text-sm">In Stock</label>
          <select
            className="input"
            value={product.in_stock ? 'true' : 'false'}
            onChange={(e) =>
              setProduct({
                ...product,
                in_stock: e.target.value === 'true',
              })
            }
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* ✅ Quantity field */}
        <div>
          <label className="text-sm">Quantity Available</label>
          <input
            className="input"
            type="number"
            min={0}
            value={product.quantity ?? 0}
            onChange={(e) =>
              setProduct({
                ...product,
                quantity:
                  e.target.value === '' ? 0 : Number(e.target.value),
              })
            }
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm">Description</label>
          <textarea
            className="input"
            rows={3}
            value={product.description || ''}
            onChange={(e) =>
              setProduct({ ...product, description: e.target.value })
            }
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          className="btn btn-primary"
          onClick={save}
          disabled={busy}
        >
          {busy ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
``
