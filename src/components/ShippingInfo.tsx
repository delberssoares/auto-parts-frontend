import { useState } from "react";
import { formatDate, formatDay } from "../lib/format";
import type { Shipping } from "../types";

export default function ShippingInfo({ shipping }: { shipping: Shipping }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(shipping.tracking_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponível: ignora
    }
  }

  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 text-sm">
      <p className="font-semibold text-purple-900">Envio</p>
      <dl className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-slate-500">Transportadora</dt>
          <dd className="font-medium">{shipping.carrier}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Código de rastreio</dt>
          <dd className="flex items-center gap-2 font-mono font-medium">
            {shipping.tracking_code}
            <button onClick={copyCode} className="font-sans text-xs text-blue-700 underline">
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Enviado em</dt>
          <dd>{formatDate(shipping.shipped_at)}</dd>
        </div>
        {shipping.estimated_delivery && !shipping.delivered_at && (
          <div>
            <dt className="text-xs text-slate-500">Previsão de entrega</dt>
            <dd>{formatDay(shipping.estimated_delivery)}</dd>
          </div>
        )}
        {shipping.delivered_at && (
          <div>
            <dt className="text-xs text-slate-500">Entregue em</dt>
            <dd>{formatDate(shipping.delivered_at)}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}