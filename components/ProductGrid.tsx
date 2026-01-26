
import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';

export default function ProductGrid({ products }: { products: Product[] }) {
  if (!products?.length) return <p className="text-gray-500">No products found.</p>;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(p => (<ProductCard key={p.id} p={p} />))}
    </div>
  );
}
