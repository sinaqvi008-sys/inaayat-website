
'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Product } from '@/lib/types';
import { MAX_CART_ITEMS } from '@/lib/constants';

export type CartItem = Product & { quantity: number };

type CartContextType = {
  items: CartItem[];
  add: (p: Product) => { ok: boolean; reason?: string };
  remove: (id: number) => void;
  clear: () => void;
};

const CartCtx = createContext<CartContextType | null>(null);

const STORAGE_KEY = 'colony-cart-v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const api: CartContextType = useMemo(() => ({
    items,
    add: (p: Product) => {
      if (items.find(i => i.id === p.id)) return { ok: true };
      if (items.length >= MAX_CART_ITEMS) {
        return { ok: false, reason: `You can select up to ${MAX_CART_ITEMS} items.` };
      }
      setItems(prev => [...prev, { ...p, quantity: 1 }]);
      return { ok: true };
    },
    remove: (id: number) => setItems(prev => prev.filter(p => p.id !== id)),
    clear: () => setItems([])
  }), [items]);

  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
