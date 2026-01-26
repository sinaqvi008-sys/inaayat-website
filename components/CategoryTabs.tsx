
'use client';
import type { Category } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function CategoryTabs({
  categories,
  activeId,
  onChange
}: {
  categories: Category[];
  activeId?: number | null;
  onChange: (id: number | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.sort((a,b)=> (a.display_order??0)-(b.display_order??0)).map(cat => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={cn('btn px-3 py-1.5 border rounded-full', activeId===cat.id ? 'bg-brand text-white border-brand' : 'border-gray-300 hover:border-gray-400')}
          id={(cat.slug ?? undefined)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
