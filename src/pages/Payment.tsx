import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useOrder, usePayOrder } from "../hooks/useOrders";
import { formatBRL } from "../lib/format";
import type { PaymentMethod } from "../types";

const methods: { value: PaymentMethod; label: string; hint: string }[] = [
  { value: "pix", label: "Pix", hint: "Aprovação imediata" },
  { value: "card", label: "Cartão de crédito", hint: "Em até 3x sem juros" },
];

export default function Payment() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [method, setMethod] = useState<PaymentMethod>("pix");

  const { data: order, isLoading, isError } = useOrder(id);
  const { mutate, isPending, isError: payError } = usePayOrder(id);

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl bg-slate-200" />;

  if (isError || !order) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-500">Pedido não encontrado.</p>
        <Link to="/" className="mt-4 inline-block text-blue-700 underline">Voltar para a loja</Link>
      </div>
    );
  }

  if (order.status === "paid") return <Navigate to={`/pedido/${order.id}`} replace />;

  function handlePay() {
    mutate(method, {
      onSuccess: () => navigate(`/pedido/${id}`, { replace: true }),
    });
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Pagamento</h1>

      <div className="rounded-xl border bg-white p-6">
        <p className="text-sm text-slate-500">Pedido {order.id}</p>
        <p className="text-3xl font-bold text-blue-700">{formatBRL(order.total)}</p>
      </div>

      <fieldset className="space-y-3 rounded-xl border bg-white p-6">
        <legend className="px-1 text-sm font-medium">Forma de pagamento</legend>
        {methods.map((m) => (
          <label
            key={m.value}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${
              method === m.value ? "border-blue-600 bg-blue-50" : "hover:bg-slate-50"
            }`}
          >
            <input
              type="radio"
              name="method"
              value={m.value}
              checked={method === m.value}
              onChange={() => setMethod(m.value)}
            />
            <span>
              <span className="block font-medium">{m.label}</span>
              <span className="text-sm text-slate-500">{m.hint}</span>
            </span>
          </label>
        ))}
      </fieldset>

      {method === "pix" && (
        <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
          Aqui apareceria o QR Code do Pix gerado pelo gateway de pagamento.
        </p>
      )}
      {method === "card" && (
        <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
          Aqui entrariam os campos do cartão (normalmente renderizados pelo próprio gateway).
        </p>
      )}

      {payError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Não foi possível processar o pagamento. Tente novamente.
        </p>
      )}

      <button
        onClick={handlePay}
        disabled={isPending}
        className="w-full rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isPending ? "Processando pagamento..." : "Simular pagamento"}
      </button>
      <p className="text-center text-xs text-slate-400">
        Ambiente de demonstração: nenhum pagamento real é realizado.
      </p>
    </div>
  );
}