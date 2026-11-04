import { useEffect, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { CloseIcon, SearchIcon } from "../components/icons";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ProductCardSkeleton";
import { useCategories, useProducts } from "../hooks/useProducts";
import { categoryIcon } from "../lib/categoryIcon";
import type { SortOption } from "../services/productsService";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "name", label: "Nome (A-Z)" },
  { value: "price_asc", label: "Menor preço" },
  { value: "price_desc", label: "Maior preço" },
];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active ? "border-white bg-white text-garage-900" : "border-white/25 text-white/85 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

export default function Products() {
  const [params, setParams] = useSearchParams();

  const search = params.get("q") ?? "";
  const categoryId = params.get("categoria") ? Number(params.get("categoria")) : undefined;
  const sort = (params.get("ordem") as SortOption) ?? "name";

  const [searchInput, setSearchInput] = useState(search);
  const timer = useRef<number | undefined>(undefined);

  const { data: categories } = useCategories();
  const { data: products, isLoading, isError, refetch } = useProducts({ search, categoryId, sort });

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function updateParam(key: string, value: string) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true }
    );
  }

  function handleSearchChange(value: string) {
    setSearchInput(value);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => updateParam("q", value.trim()), 350);
  }

  function clearSearch() {
    window.clearTimeout(timer.current);
    setSearchInput("");
    updateParam("q", "");
  }

  function clearFilters() {
    window.clearTimeout(timer.current);
    setSearchInput("");
    setParams({}, { replace: true });
  }

  const activeCategory = categories?.find((c) => c.id === categoryId);
  const hasFilters = Boolean(search || categoryId);
  const count = products?.length ?? 0;

  const summary = products
    ? `${count} ${count === 1 ? "peça" : "peças"}${activeCategory ? ` em ${activeCategory.name}` : ""}${
        search ? ` para "${search}"` : ""
      }`
    : "Carregando peças...";

  return (
    <div>
      <section className="on-dark blueprint rounded-xl bg-garage-900 px-5 py-8 text-white sm:px-10 sm:py-12">
        <h1 className="max-w-xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
          Ache a peça certa para o seu carro
        </h1>
        <p className="mt-3 max-w-lg text-white/75">
          Busque pelo nome ou pela marca, ou escolha uma categoria.
        </p>

        <form role="search" onSubmit={(e) => e.preventDefault()} className="relative mt-6 max-w-2xl">
          <label htmlFor="busca" className="sr-only">
            Buscar peças
          </label>
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            id="busca"
            type="text"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Ex.: pastilha de freio, Bosch, filtro de óleo"
            className="h-14 w-full rounded-lg bg-white pl-12 pr-12 text-base text-ink outline-none placeholder:text-muted/70 focus-visible:ring-4 focus-visible:ring-brass/60"
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Limpar busca"
              className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-md text-muted hover:text-ink"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          )}
        </form>

        <div className="-mx-5 mt-6 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          <Chip active={!categoryId} onClick={() => updateParam("categoria", "")}>
            Todas
          </Chip>
          {categories?.map((category) => {
            const Icon = categoryIcon(category.name);
            return (
              <Chip
                key={category.id}
                active={categoryId === category.id}
                onClick={() => updateParam("categoria", String(category.id))}
              >
                <Icon className="h-4 w-4" />
                {category.name}
              </Chip>
            );
          })}
        </div>
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm text-muted">
          {summary}
          {hasFilters && (
            <button type="button" onClick={clearFilters} className="ml-3 font-medium text-garage-700 underline">
              Limpar filtros
            </button>
          )}
        </p>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Ordenar por</span>
          <select
            value={sort}
            onChange={(e) => updateParam("ordem", e.target.value === "name" ? "" : e.target.value)}
            className="h-10 rounded-md border bg-white px-3 font-medium"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isError && (
        <div role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-medium text-red-800">Não foi possível carregar as peças.</p>
          <p className="mt-1 text-sm text-red-700">Verifique sua conexão e tente novamente.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-md bg-red-700 px-5 py-2.5 font-semibold text-white hover:bg-red-800"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {isLoading && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      {products && count === 0 && (
        <div className="mt-6 rounded-lg border bg-white px-6 py-14 text-center">
          <p className="font-display text-2xl font-semibold">Nenhuma peça encontrada</p>
          <p className="mt-1 text-muted">Tente outro nome ou marca, ou volte para todas as categorias.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-5 rounded-md bg-brass px-5 py-2.5 font-semibold text-garage-950 hover:bg-brass-dark"
          >
            Limpar filtros
          </button>
        </div>
      )}

      {products && count > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categoryName={categories?.find((c) => c.id === product.category_id)?.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}