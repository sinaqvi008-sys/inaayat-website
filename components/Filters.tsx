
'use client';

export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'newest';

export default function Filters({
  inStockOnly, onInStockChange,
  sort, onSortChange
}: {
  inStockOnly: boolean; onInStockChange: (v: boolean)=>void;
  sort: SortOption; onSortChange: (s: SortOption)=>void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={inStockOnly} onChange={e=>onInStockChange(e.target.checked)} />
        In stock only
      </label>

      <div className="ml-auto" />

      <label className="text-sm">Sort: </label>
      <select className="input max-w-40" value={sort} onChange={e=>onSortChange(e.target.value as SortOption)}>
        <option value="relevance">Relevance</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="newest">Newest</option>
      </select>
    </div>
  );
}
