import { Link } from "react-router-dom";
import { selectTotal, useCart } from "../store/cartStore";
import { formatBRL } from "../lib/format";

export default function Cart() {
  const items = useCart((s) => s.items);
  const total = useCart(selectTotal);
  const { setQuantity, remove } = useCart.getState();

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-500">Seu carrinho está vazio.</p>
        <Link to="/" className="mt-4 inline-block text-blue-700 underline">Ver peças</Link>
      </div>
    );
  }

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">Carrinho</h1>
      <ul className="divide-y rounded-xl border bg-white">
        {items.map(({ product, quantity }) => (
          <li key={product.id} className="flex items-center gap-4 p-4">
            <img src={product.image_url} alt="" className="h-16 w-24 rounded object-cover" />
            <div className="flex-1">
              <p className="font-semibold">{product.name}</p>
              <p className="text-sm text-slate-500">{formatBRL(product.price)}</p>
            </div>
            <input
              type="number"
              min={1}
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(product.id, Number(e.target.value))}
              className="w-16 rounded border px-2 py-1"
            />
            <p className="w-28 text-right font-semibold">{formatBRL(product.price * quantity)}</p>
            <button onClick={() => remove(product.id)} className="text-sm text-red-600 hover:underline">
              Remover
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-xl font-bold">Total: {formatBRL(total)}</p>
        <Link to="/checkout" className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800">
          Finalizar pedido
        </Link>
      </div>
    </section>
  );
}