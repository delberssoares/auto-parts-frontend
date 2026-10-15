import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import OrderStatusBadge from "../components/OrderStatusBadge";
import OrderTimeline from "../components/OrderTimeline";
import ShipModal from "../components/ShipModal";
import ShippingInfo from "../components/ShippingInfo";
import {
  useAdminCancelOrder,
  useDeliverOrder,
  useShipOrder,
  useStartProcessing,
} from "../hooks/useAdminOrders";
import { useOrder } from "../hooks/useOrders";
import { formatBRL, formatDate } from "../lib/format";
import { transitions } from "../lib/orderStatus";
import type { OrderStatus } from "../types";

// Ações que o admin pode disparar (pagar é do cliente/gateway)
const actionLabels: Partial<Record<OrderStatus, string>> = {
  processing: "Iniciar separação",
  shipped: "Informar envio",
  delivered: "Marcar como entregue",
};

export default function AdminOrderDetail() {
  const { id = "" } = useParams();
  const [shipOpen, setShipOpen] = useState(false);

  const { data: order, isLoading, isError } = useOrder(id);
  const start = useStartProcessing();
  const ship = useShipOrder();
  const deliver = useDeliverOrder();
  const cancel = useAdminCancelOrder();

  if (isLoading) return <div className="h-96 animate-pulse rounded-xl bg-slate-200" />;

  if (isError || !order) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-500">Pedido não encontrado.</p>
        <Link to="/admin/pedidos" className="mt-4 inline-block text-blue-700 underline">
          Voltar para a lista
        </Link>
      </div>
    );
  }

  const allowed = transitions[order.status];
  const actions = allowed.filter((status) => actionLabels[status]);
  const canCancel = allowed.includes("cancelled");
  const busy = start.isPending || deliver.isPending || cancel.isPending;
  const actionError = (start.error ?? deliver.error ?? cancel.error) as Error | null;

  function handleAction(target: OrderStatus) {
    if (target === "processing") start.mutate(id);
    if (target === "shipped") setShipOpen(true);
    if (target === "delivered") deliver.mutate(id);
  }

  function handleCancel() {
    const message =
      order!.status === "pending"
        ? `Cancelar o pedido ${id}?`
        : `Cancelar o pedido ${id}? O valor de ${formatBRL(order!.total)} será estornado e o estoque devolvido.`;
    if (window.confirm(message)) cancel.mutate(id);
  }

  return (
    <section className="space-y-6">
      <Link to="/admin/pedidos" className="inline-block text-sm text-blue-700 hover:underline">
        ← Voltar para pedidos
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pedido {order.id}</h1>
          <p className="text-sm text-slate-500">Realizado em {formatDate(order.created_at)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {actionError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{actionError.message}</p>
      )}

      {(actions.length > 0 || canCancel) && (
        <div className="flex flex-wrap gap-3 rounded-xl border bg-white p-4">
          {actions.map((status) => (
            <button
              key={status}
              onClick={() => handleAction(status)}
              disabled={busy}
              className="rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {actionLabels[status]}
            </button>
          ))}
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={busy}
              className="rounded-lg border border-red-200 px-5 py-2.5 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {cancel.isPending ? "Cancelando..." : "Cancelar pedido"}
            </button>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border bg-white p-5">
            <h2 className="mb-3 font-semibold">Itens</h2>
            <ul className="divide-y text-sm">
              {order.items.map((item) => (
                <li key={item.product_id} className="flex justify-between py-2">
                  <span>{item.quantity}× {item.name}</span>
                  <span>{formatBRL(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 flex justify-between border-t pt-3 text-lg font-bold">
              <span>Total</span>
              <span>{formatBRL(order.total)}</span>
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Pagamento:{" "}
              {order.payment_method === "pix" ? "Pix" : order.payment_method === "card" ? "Cartão" : "ainda não realizado"}
              {order.refunded && " · estornado"}
            </p>
          </div>

          {order.shipping && <ShippingInfo shipping={order.shipping} />}

          <div className="rounded-xl border bg-white p-5 text-sm">
            <h2 className="mb-3 font-semibold">Cliente e entrega</h2>
            <p className="font-medium">{order.customer.name}</p>
            <p className="text-slate-600">{order.customer.email} · {order.customer.phone}</p>
            <p className="mt-2 text-slate-600">
              {order.customer.address} · {order.customer.city} · CEP {order.customer.cep}
            </p>
          </div>
        </div>

        <div className="h-fit rounded-xl border bg-white p-5">
          <h2 className="mb-4 font-semibold">Histórico</h2>
          <OrderTimeline history={order.history} showActor />
        </div>
      </div>

      {shipOpen && (
        <ShipModal
          isPending={ship.isPending}
          errorMessage={ship.isError ? (ship.error as Error).message : undefined}
          onClose={() => setShipOpen(false)}
          onSubmit={(input) =>
            ship.mutate({ id, input }, { onSuccess: () => setShipOpen(false) })
          }
        />
      )}
    </section>
  );
}