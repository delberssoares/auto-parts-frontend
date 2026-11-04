import { Link } from "react-router-dom";
import { formatBRL } from "../lib/format";
import { useCart } from "../store/cartStore";
import type { Product } from "../types";
import { CartIcon } from "./icons";
import ProductImage from "./ProductImage";

interface Props {
  product: Product;
  categoryName?: string;
}

export default function ProductCard({ product, categoryName }: Props) {
  const add = useCart((s) => s.add);
  const inCart = useCart((s) => s.items.find((i) => i.product.id === product.id)?.quantity ?? 0);

  const out = product.stock === 0;
  const low = !out && product.stock <= 5;
  const atLimit = inCart >= product.stock;

  const status = out
    ? { dot: "bg-red-600", label: "Sem estoque" }
    : low
      ? { dot: "bg-amber-500", label: product.stock === 1 ? "Resta 1" : `Restam ${product.stock}` }
      : { dot: "bg-green-600", label: "Em estoque" };

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border bg-white transition-colors hover:border-garage-700">
      <Link to={`/produtos/${product.id}`} tabIndex={-1} aria-hidden="true">
        <ProductImage product={product} categoryName={categoryName} />
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-sm text-muted">{product.brand}</p>
        <h2 className="mt-0.5 line-clamp-2 font-medium leading-snug">
          <Link to={`/produtos/${product.id}`} className="hover:underline">
            {product.name}
          </Link>
        </h2>

        <div className="mt-auto pt-3">
          <p className="flex items-center gap-2 text-sm text-muted">
            <span className={`h-2 w-2 rounded-full ${status.dot}`} aria-hidden="true" />
            {status.label}
          </p>

          <div className="mt-2 flex items-end justify-between gap-2">
            <p className="font-display text-2xl font-bold leading-none sm:text-[1.7rem]">
              {formatBRL(product.price)}
            </p>

            <button
              type="button"
              onClick={() => add(product)}
              disabled={out || atLimit}
              aria-label={
                inCart > 0
                  ? `Adicionar mais uma unidade de ${product.name} (${inCart} no carrinho)`
                  : `Adicionar ${product.name} ao carrinho`
              }
              className="relative grid h-11 w-11 shrink-0 place-items-center rounded-md bg-brass text-garage-950 transition-colors hover:bg-brass-dark disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
            >
              <CartIcon className="h-5 w-5" />
              {inCart > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-garage-900 px-1 text-xs font-bold text-white">
                  {inCart}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}