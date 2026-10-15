import { useState } from "react";
import { Link } from "react-router-dom";
import { useCategories, useDeleteProduct, useProducts } from "../hooks/useProducts";
import { formatBRL } from "../lib/format";
import type { Product } from "../types";

export default function AdminProducts() {
  const [search, setSearch] = useState("");

  const { data: products, isLoading, isError, refetch } = useProducts({ search });
  const { data: categories } = useCategories();
  const remove = useDeleteProduct();

  const categoryName = (id: number) => categories?.find((c) => c.id === id)?.name ?? "-";

  function handleDelete(product: Product) {
    if (window.confirm(`Excluir "${product.name}"? Essa ação não pode ser desfeita.`)) {
      remove.mutate(product.id);
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Gerenciar produtos</h1>
        <Link
          to="/admin/produtos/novo"
          className="rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white hover:bg-blue-800"
        >
          + Novo produto
        </Link>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nome ou marca..."
        className="mb-6 w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 md:max-w-sm"
      />

      {remove.isError && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Não foi possível excluir o produto. A lista foi restaurada.
        </p>
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-200" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700">Não foi possível carregar os produtos.</p>
          <button onClick={() => refetch()} className="mt-3 rounded bg-red-600 px-4 py-2 text-white">
            Tentar novamente
          </button>
        </div>
      )}

      {products && products.length === 0 && (
        <p className="py-12 text-center text-slate-500">Nenhum produto encontrado.</p>
      )}

      {products && products.length > 0 && (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3 text-right">Preço</th>
                <th className="px-4 py-3 text-right">Estoque</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image_url} alt="" className="h-10 w-14 rounded object-cover" />
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{categoryName(p.category_id)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatBRL(p.price)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={p.stock === 0 ? "font-semibold text-red-600" : p.stock <= 5 ? "font-semibold text-amber-600" : ""}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3 font-medium">
                      <Link to={`/admin/produtos/${p.id}/editar`} className="text-blue-700 hover:underline">
                        Editar
                      </Link>
                      <button onClick={() => handleDelete(p)} className="text-red-600 hover:underline">
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}