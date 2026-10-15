import { useState } from "react";
import { Link } from "react-router-dom";
import OrderStatusBadge from "../components/OrderStatusBadge";
import { useAllOrders } from "../hooks/useAdminOrders";
import { formatBRL, formatDate } from "../lib/format";
import { statusMeta } from "../lib/orderStatus";
import type { Order, OrderStatus } from "../types";

const PAGE_SIZE = 10;
const STALE_HOURS = 24;

const statusOrder: OrderStatus[] = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];
const queueStatuses: OrderStatus[] = ["paid", "processing", "shipped"];

type Filter = "all" | OrderStatus;

// Pedido pago ou em separação parado há mais de 24h na mesma etapa
function isStale(order: Order, now: number) {
  if (order.status !== "paid" && order.status !== "processing") return false;
  const lastEvent = order.history[order.history.length - 1];
  return now - Date.parse(lastEvent.at) > STALE_HOURS * 60 * 60 * 1000;
}

export default function AdminOrders() {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [now] = useState(() => Date.now());

  const { data: orders, isLoading, isError, refetch } = useAllOrders();

  const counts = statusOrder.reduce(
    (acc, status) => ({ ...acc, [status]: orders?.filter((o) => o.status === status).length ?? 0 }),
    {} as Record<OrderStatus, number>
  );

  const term = search.trim().toLowerCase();
  let filtered = (orders ?? []).filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (!term) return true;
    return [o.id, o.customer.name, o.customer.email, o.customer.city].some((v) =>
      v.toLowerCase().includes(term)
    );
  });

  // Fila de trabalho: mais antigos primeiro. Demais visões: mais recentes primeiro.
  if (filter !== "all" && queueStatuses.includes(filter)) {
    filtered = [...filtered].reverse();
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function changeFilter(next: Filter) {
    setFilter(next);
    setPage(1);
  }

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">Pedidos</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => changeFilter("all")}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
            filter === "all" ? "border-blue-700 bg-blue-700 text-white" : "bg-white hover:bg-slate-100"
          }`}
        >
          Todos ({orders?.length ?? 0})
        </button>
        {statusOrder.map((status) => (
          <button
            key={status}
            onClick={() => changeFilter(status)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              filter === status ? "border-blue-700 bg-blue-700 text-white" : "bg-white hover:bg-slate-100"
            }`}
          >
            {statusMeta[status].label} ({counts[status]})
          </button>
        ))}
      </div>

      <input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
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

      {orders && filtered.length === 0 && (
        <p className="py-12 text-center text-slate-500">Nenhum pedido encontrado.</p>
      )}

      {pageItems.length > 0 && (
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
                {pageItems.map((order) => {
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
              Página {currentPage} de {totalPages} · {filtered.length} pedido(s)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border bg-white px-4 py-1.5 hover:bg-slate-50 disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
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