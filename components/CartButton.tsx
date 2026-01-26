
'use client';
import { useCart } from '@/context/CartContext';

export default function CartButton() {
  const { items } = useCart();
  return (
    <a href="#cart" className="btn btn-outline">
      Cart <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand text-white text-xs px-1">{items.length}</span>
    </a>
  );
}
