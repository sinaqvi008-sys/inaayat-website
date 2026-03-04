import Image from 'next/image';
export default function ProductCard({ product, onAdd }) {
  return (
    <article className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="relative w-full h-64 bg-gray-100">
        {product.image ? (
          <Image src={product.image} alt={product.name} layout="fill" objectFit="cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
        )}
      </div>
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm font-semibold">₹{product.price}</div>
          <button
            type="button"
            onClick={() => onAdd(product)}
            className="ml-4 px-3 py-1 rounded bg-[#7A1F2B] text-white text-sm"
          >
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
