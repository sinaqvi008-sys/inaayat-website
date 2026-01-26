
'use client';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();

  const handleAdd = () => {
    const res = add(p);
    if (!res.ok) alert(res.reason || 'Could not add item');
    else alert('Added to cart');
  };

  return (
    <div className="card overflow-hidden">
      {p.image_url && (
        <div className="relative aspect-[3/4]">
          <Image src={p.image_url} alt={p.title} fill className="object-cover" />
        </div>
      )}
      <div className="p-3">
        <div className="font-medium line-clamp-1" title={p.title}>{p.title}</div>
        <div className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">{p.description}</div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-brand font-semibold">{formatINR(p.price)}</span>
          {p.mrp && p.mrp > p.price && (
            <span className="text-xs line-through text-gray-500">{formatINR(p.mrp)}</span>
          )}
        </div>
        <button className="btn btn-primary w-full mt-3 disabled:opacity-50" onClick={handleAdd} disabled={p.in_stock === false}> 
          {p.in_stock === false ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
