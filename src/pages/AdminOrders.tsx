import { useState } from "react";
import { Link } from "react-router-dom";
import OrderStatusBadge from "../components/OrderStatusBadge";
import { useAdminOrders, useOrderSummary } from "../hooks/useAdminOrders";
import { useDebounce } from "../hooks/useDebounce";
import { formatBRL, formatDate } from "../lib/format";
import { statusMeta } from "../lib/orderStatus";
import type { Order, OrderStatus } from "../types";

const PAGE_SIZE = 10;
const STALE_HOURS = 24;

const statusOrder: OrderStatus[] = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];

type Filter = "all" | OrderStatus;

// Pedido pago ou em separação parado há mais de 24h na mesma etapa
function isStale(order: Order, now: number) {
  if (order.status !== "paid" && order.status !== "processing") return false;
  const lastEvent = order.history[order.history.length - 1];
  return now - Date.parse(lastEvent.at) > STALE_HOURS * 60 * 60 * 1000;
}

const chipClass = (active: boolean) =>
  `rounded-full border px-4 py-1.5 text-sm font-medium ${
    active ? "border-blue-700 bg-blue-700 text-white" : "bg-white hover:bg-slate-100"
  }`;

export default function AdminOrders() {
  const [filter, setFilter] = useState<Filter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [now] = useState(() => Date.now());

  const search = useDebounce(searchInput.trim(), 300);

  const { data, isLoading, isError, refetch } = useAdminOrders({
    status: filter === "all" ? undefined : filter,
    search: search || undefined,
    page,
    pageSize: PAGE_SIZE,
  });
  const { data: summary } = useOrderSummary();

  const counts = summary?.counts;
  const allCount = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0;

  const orders = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  function changeFilter(next: Filter) {
    setFilter(next);
    setPage(1);
  }

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">Pedidos</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => changeFilter("all")} className={chipClass(filter === "all")}>
          Todos ({allCount})
        </button>
        {statusOrder.map((status) => (
          <button key={status} onClick={() => changeFilter(status)} className={chipClass(filter === status)}>
            {statusMeta[status].label} ({counts?.[status] ?? 0})
          </button>
        ))}
      </div>

      <input
        value={searchInput}
        onChange={(e) => {
          setSearchInput(e.target.value);
          setPage(1);
        }}
        placeholder="Buscar por código, nome, e-mail ou cidade..."
        className="mb-6 w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 md:max-w-md"
      />

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-200" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700">Não foi possível carregar os pedidos.</p>
          <button onClick={() => refetch()} className="mt-3 rounded bg-red-600 px-4 py-2 text-white">
            Tentar novamente
          </button>
        </div>
      )}

      {data && orders.length === 0 && (
        <p className="py-12 text-center text-slate-500">Nenhum pedido encontrado.</p>
      )}

      {orders.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Pedido</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3 text-right">Itens</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => {
                  const itemsCount = order.items.reduce((acc, i) => acc + i.quantity, 0);
                  const stale = isStale(order, now);

                  return (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold">{order.id}</p>
                        <p className="text-xs text-slate-400">{formatDate(order.created_at)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{order.customer.name}</p>
                        <p className="text-xs text-slate-400">{order.customer.city}</p>
                      </td>
                      <td className="px-4 py-3 text-right">{itemsCount}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatBRL(order.total)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <OrderStatusBadge status={order.status} />
                          {stale && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                              +{STALE_HOURS}h parado
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`/admin/pedidos/${order.id}`} className="font-medium text-blue-700 hover:underline">
                          Abrir
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Página {page} de {totalPages} · {data?.total ?? 0} pedido(s)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="rounded-lg border bg-white px-4 py-1.5 hover:bg-slate-50 disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="rounded-lg border bg-white px-4 py-1.5 hover:bg-slate-50 disabled:opacity-40"
              >
                Próxima
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}