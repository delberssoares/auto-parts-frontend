import { Link, useParams } from "react-router-dom";
import { useProduct } from "../hooks/useProducts";
import { formatBRL } from "../lib/format";

export default function ProductDetail() {
  const { id } = useParams();
  const { data: product, isLoading, isError } = useProduct(Number(id));

  if (isLoading) return <div className="h-80 animate-pulse rounded-xl bg-slate-200" />;

  if (isError || !product) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-500">Produto não encontrado.</p>
        <Link to="/" className="mt-4 inline-block text-blue-700 underline">Voltar para a loja</Link>
      </div>
    );
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
          <p className={product.stock > 0 ? "text-green-700" : "text-red-600"}>
            {product.stock > 0 ? `${product.stock} em estoque` : "Sem estoque"}
          </p>
          {/* O botão de carrinho entra no próximo passo */}
        </div>
      </div>
    </div>
  );
}