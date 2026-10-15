import { Link } from "react-router-dom";
import type { Product } from "../types";
import { formatBRL } from "../lib/format";

export default function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.stock === 0;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md">
      <Link to={`/produtos/${product.id}`}>
        <img src={product.image_url} alt={product.name} className="aspect-[3/2] w-full object-cover" />
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs uppercase tracking-wide text-slate-400">{product.brand}</span>
        <Link to={`/produtos/${product.id}`} className="font-semibold hover:text-blue-700">
          {product.name}
        </Link>
        <p className="mt-auto pt-3 text-lg font-bold text-blue-700">{formatBRL(product.price)}</p>
        {outOfStock && <span className="text-sm font-medium text-red-600">Sem estoque</span>}
      </div>
    </article>
  );
}