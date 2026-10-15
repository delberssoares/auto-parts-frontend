import { Link, useParams } from "react-router-dom";
import OrderStatusBadge from "../components/OrderStatusBadge";
import { useOrder } from "../hooks/useOrders";
import { formatBRL } from "../lib/format";

const headers = {
  paid: { icon: "✅", title: "Pagamento confirmado!" },
  pending: { icon: "⏳", title: "Pedido aguardando pagamento" },
  cancelled: { icon: "❌", title: "Pedido cancelado" },
} as const;

export default function OrderSuccess() {
  const { id } = useParams();
  const { data: order, isLoading, isError } = useOrder(id);

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl bg-slate-200" />;

  if (isError || !order) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-500">Pedido não encontrado.</p>
        <Link to="/" className="mt-4 inline-block text-blue-700 underline">Voltar para a loja</Link>
      </div>
    );
  }

  const header = headers[order.status];

  return (
    <div className="mx-auto max-w-2xl rounded-xl border bg-white p-8">
      <div className="mb-6 text-center">
        <div className="text-5xl">{header.icon}</div>
        <h1 className="mt-2 text-2xl font-bold">{header.title}</h1>
        <p className="text-slate-500">
          Código do pedido: <strong className="text-slate-800">{order.id}</strong>
        </p>
        <div className="mt-2"><OrderStatusBadge status={order.status} /></div>

        {order.status === "pending" && (
          <Link to={`/pagamento/${order.id}`} className="mt-3 inline-block text-blue-700 underline">
            Ir para o pagamento
          </Link>
        )}
      </div>

      {order.refunded && (
        <p className="mb-6 rounded-lg bg-green-50 p-4 text-center text-sm text-green-800">
          O valor de <strong>{formatBRL(order.total)}</strong> será estornado
          {order.payment_method === "pix"
            ? " via Pix"
            : order.payment_method === "card"
              ? " no cartão utilizado"
              : ""}
          .
        </p>
      )}

      <ul className="divide-y text-sm">
        {order.items.map((item) => (
          <li key={item.product_id} className="flex justify-between py-2">
            <span>{item.quantity}× {item.name}</span>
            <span>{formatBRL(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 flex justify-between border-t pt-4 text-lg font-bold">
        <span>Total</span>
        <span>{formatBRL(order.total)}</span>
      </p>

      <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-medium text-slate-800">Entrega para</p>
        <p>{order.customer.name}</p>
        <p>{order.customer.address} · {order.customer.city} · CEP {order.customer.cep}</p>
        <p>Enviaremos atualizações para {order.customer.email}</p>
      </div>

      <div className="mt-8 text-center">
        <Link to="/pedidos" className="mr-3 rounded-lg border px-6 py-3 font-semibold hover:bg-slate-50">
          Meus pedidos
        </Link>
        <Link to="/" className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800">
          Continuar comprando
        </Link>
      </div>
    </div>
  );
}