import { useState } from "react";
import { Link } from "react-router-dom";
import OrderStatusBadge from "../components/OrderStatusBadge";
import { useCancelOrder, useMyOrders } from "../hooks/useOrders";
import { formatBRL, formatDate } from "../lib/format";
import type { Order } from "../types";

type Filter = "all" | Order["status"];

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendentes" },
  { value: "paid", label: "Pagos" },
  { value: "cancelled", label: "Cancelados" },
];

export default function MyOrders() {
  const [filter, setFilter] = useState<Filter>("all");
  const { data: orders, isLoading, isError, refetch } = useMyOrders();
  const cancel = useCancelOrder();

  const visible = orders?.filter((o) => filter === "all" || o.status === filter);

  function handleCancel(id: string) {
    if (window.confirm(`Cancelar o pedido ${id}?`)) cancel.mutate(id);
  }

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">Meus pedidos</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              filter === f.value
                ? "border-blue-700 bg-blue-700 text-white"
                : "bg-white hover:bg-slate-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {cancel.isError && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {(cancel.error as Error).message}
        </p>
      )}

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700">Não foi possível carregar seus pedidos.</p>
          <button onClick={() => refetch()} className="mt-3 rounded bg-red-600 px-4 py-2 text-white">
            Tentar novamente
          </button>
        </div>
      )}

      {orders && orders.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-slate-500">Você ainda não fez nenhum pedido.</p>
          <Link to="/" className="mt-4 inline-block text-blue-700 underline">Ver peças</Link>
        </div>
      )}

      {orders && orders.length > 0 && visible?.length === 0 && (
        <p className="py-12 text-center text-slate-500">Nenhum pedido neste filtro.</p>
      )}

      {visible && visible.length > 0 && (
        <ul className="space-y-4">
          {visible.map((order) => {
            const itemsCount = order.items.reduce((acc, i) => acc + i.quantity, 0);
            const cancelling = cancel.isPending && cancel.variables === order.id;

            return (
              <li key={order.id} className="rounded-xl border bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">Pedido {order.id}</p>
                    <p className="text-sm text-slate-500">{formatDate(order.created_at)}</p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                <p className="mt-3 text-sm text-slate-600">
                  {itemsCount} {itemsCount === 1 ? "item" : "itens"}:{" "}
                  {order.items.map((i) => i.name).join(", ")}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className={`text-lg font-bold ${order.status === "cancelled" ? "text-slate-400 line-through" : "text-blue-700"}`}>
                    {formatBRL(order.total)}
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm font-medium">
                    {order.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleCancel(order.id)}
                          disabled={cancelling}
                          className="rounded-lg border border-red-200 px-4 py-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {cancelling ? "Cancelando..." : "Cancelar"}
                        </button>
                        <Link
                          to={`/pagamento/${order.id}`}
                          className="rounded-lg bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
                        >
                          Pagar agora
                        </Link>
                      </>
                    )}
                    <Link to={`/pedido/${order.id}`} className="rounded-lg border px-4 py-2 hover:bg-slate-50">
                      Ver detalhes
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}