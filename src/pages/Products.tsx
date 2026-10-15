import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ProductCardSkeleton";
import { useCategories, useProducts } from "../hooks/useProducts";
import type { SortOption } from "../services/productsService";

export default function Products() {
  const [params, setParams] = useSearchParams();

  const search = params.get("q") ?? "";
  const categoryId = params.get("categoria") ? Number(params.get("categoria")) : undefined;
  const sort = (params.get("ordem") as SortOption) ?? "name";

  const { data: categories } = useCategories();
  const { data: products, isLoading, isError, refetch } = useProducts({ search, categoryId, sort });

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">Peças disponíveis</h1>

      <div className="mb-8 grid gap-3 md:grid-cols-3">
        <input
          value={search}
          onChange={(e) => updateParam("q", e.target.value)}
          placeholder="Buscar por nome ou marca..."
          className="rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={categoryId ?? ""}
          onChange={(e) => updateParam("categoria", e.target.value)}
          className="rounded-lg border bg-white px-3 py-2"
        >
          <option value="">Todas as categorias</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => updateParam("ordem", e.target.value)}
          className="rounded-lg border bg-white px-3 py-2"
        >
          <option value="name">Nome (A-Z)</option>
          <option value="price_asc">Menor preço</option>
          <option value="price_desc">Maior preço</option>
        </select>
      </div>

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700">Não foi possível carregar as peças.</p>
          <button onClick={() => refetch()} className="mt-3 rounded bg-red-600 px-4 py-2 text-white">
            Tentar novamente
          </button>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      )}

      {products && products.length === 0 && (
        <p className="py-16 text-center text-slate-500">Nenhuma peça encontrada para esse filtro.</p>
      )}

      {products && products.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </section>
  );
}