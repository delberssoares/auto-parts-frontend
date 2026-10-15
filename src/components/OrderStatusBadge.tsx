import type { Order } from "../types";

const styles: Record<Order["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
};

const labels: Record<Order["status"], string> = {
  pending: "Aguardando pagamento",
  paid: "Pago",
};

export default function OrderStatusBadge({ status }: { status: Order["status"] }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}