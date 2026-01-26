
'use client';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { formatINR } from '@/lib/utils';

export default function CartDrawer() {
  const { items, remove } = useCart();

  return (
    <section id="cart" className="fixed bottom-4 right-4 z-40 w-[92vw] max-w-md">
      <div className="card p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Your Selection ({items.length}/5)</h3>
          <a href="#top" className="text-sm text-gray-500">Close</a>
        </div>
        <div className="mt-3 space-y-3 max-h-64 overflow-auto">
          {items.map(i => (
            <div key={i.id} className="flex items-center gap-3">
              {i.image_url && (
                <div className="relative h-14 w-10 overflow-hidden rounded">
                  <Image src={i.image_url} alt={i.title} fill className="object-cover" />
                </div>
              )}
              <div className="flex-1">
                <div className="text-sm font-medium line-clamp-1">{i.title}</div>
                <div className="text-xs text-gray-500">{formatINR(i.price)}</div>
              </div>
              <button className="text-sm text-gray-500 hover:text-gray-800" onClick={()=>remove(i.id)}>Remove</button>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-gray-500">No items yet. Add products to schedule a visit.</p>}
        </div>
        <div className="mt-3">
          <Link href="/schedule" className={`btn btn-primary w-full ${items.length===0 ? 'pointer-events-none opacity-50' : ''}`}>Schedule Visit</Link>
        </div>
      </div>
    </section>
  );
}
