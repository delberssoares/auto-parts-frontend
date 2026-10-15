import type { OrderStatus } from "../types";

export const statusMeta: Record<OrderStatus, { label: string; icon: string; title: string }> = {
  pending: { label: "Aguardando pagamento", icon: "⏳", title: "Pedido aguardando pagamento" },
  paid: { label: "Pago", icon: "✅", title: "Pagamento confirmado!" },
  processing: { label: "Em separação", icon: "📦", title: "Pedido em separação" },
  shipped: { label: "Enviado", icon: "🚚", title: "Pedido enviado" },
  delivered: { label: "Entregue", icon: "🎉", title: "Pedido entregue" },
  cancelled: { label: "Cancelado", icon: "❌", title: "Pedido cancelado" },
};

// Transições permitidas a partir de cada status
export const transitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"], // depois de enviado não cancela (seria devolução)
  delivered: [],
  cancelled: [],
};

export const canTransition = (from: OrderStatus, to: OrderStatus) =>
  transitions[from].includes(to);

// O cliente só cancela sozinho antes da separação
export const canCustomerCancel = (status: OrderStatus) =>
  status === "pending" || status === "paid";

export const activeStatuses: OrderStatus[] = ["paid", "processing", "shipped"];