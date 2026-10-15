import { Link, useNavigate, useParams } from "react-router-dom";
import { useProduct } from "../hooks/useProducts";
import { formatBRL } from "../lib/format";
import { useCart } from "../store/cartStore";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const productId = Number(id);

  const { data: product, isLoading, isError } = useProduct(productId);
  const add = useCart((s) => s.add);
  const setQuantity = useCart((s) => s.setQuantity);
  const quantity = useCart((s) => s.items.find((i) => i.product.id === productId)?.quantity ?? 0);
  const inCart = quantity > 0;

  if (isLoading) return <div className="h-80 animate-pulse rounded-xl bg-slate-200" />;

  if (isError || !product) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-500">Produto não encontrado.</p>
        <Link to="/" className="mt-4 inline-block text-blue-700 underline">Voltar para a loja</Link>
      </div>
    );
  }

  const outOfStock = product.stock === 0;
  const atLimit = quantity >= product.stock;

  function handleCarrinho() {
    if (!inCart) add(product!);
    navigate("/carrinho");
  }

  return (
    <div>
      <Link to="/" className="mb-6 inline-block text-sm text-blue-700 hover:underline">← Voltar</Link>
      <div className="grid gap-8 md:grid-cols-2">
        <img src={product.image_url} alt={product.name} className="w-full rounded-xl border" />
        <div className="space-y-4">
          <span className="text-sm uppercase tracking-wide text-slate-400">{product.brand}</span>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-slate-600">{product.description}</p>
          <p className="text-3xl font-bold text-blue-700">{formatBRL(product.price)}</p>
          <p className={outOfStock ? "text-red-600" : "text-green-700"}>
            {outOfStock ? "Sem estoque" : `${product.stock} em estoque`}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {inCart ? (
              <div className="flex items-center overflow-hidden rounded-lg border border-green-600 bg-green-50 text-green-800">
                <button
                  onClick={() => setQuantity(productId, quantity - 1)}
                  title={quantity === 1 ? "Remover do carrinho" : "Diminuir quantidade"}
                  aria-label={quantity === 1 ? "Remover do carrinho" : "Diminuir quantidade"}
                  className="px-4 py-3 text-xl font-semibold hover:bg-green-100"
                >
                  −
                </button>
                <span aria-live="polite" className="min-w-28 px-2 text-center font-semibold">
                  {quantity} no carrinho
                </span>
                <button
                  onClick={() => add(product)}
                  disabled={atLimit}
                  title="Aumentar quantidade"
                  aria-label="Aumentar quantidade"
                  className="px-4 py-3 text-xl font-semibold hover:bg-green-100 disabled:cursor-not-allowed disabled:text-green-300 disabled:hover:bg-transparent"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                disabled={outOfStock}
                onClick={() => add(product)}
                className="rounded-lg border border-blue-700 px-6 py-3 font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 disabled:hover:bg-transparent"
              >
                Adicionar ao carrinho
              </button>
            )}

            <button
              disabled={outOfStock && !inCart}
              onClick={handleCarrinho}
              className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Finalizar compra
            </button>
          </div>

          {inCart && (
            <p className="text-sm text-slate-500">
              {atLimit
                ? "Você atingiu o limite de estoque desta peça."
                : "Use + e − para ajustar a quantidade."}{" "}
              <Link to="/carrinho" className="text-blue-700 underline">Ver carrinho</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}