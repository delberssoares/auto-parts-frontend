import { releaseStock, reserveStock } from "./productsService";
import { canCustomerCancel, canTransition, statusMeta } from "../lib/orderStatus";
import type {
  Actor,
  CreateOrderPayload,
  Order,
  OrderStatus,
  PaymentMethod,
  ShippingInput,
  StatusEvent,
} from "../types";

const STORAGE_KEY = "auto-parts-orders";
const delay = (ms = 800) => new Promise((r) => setTimeout(r, ms));

type StoredOrder = Omit<Order, "history"> & { history?: StatusEvent[] };

// Pedidos antigos (sem histórico) ganham um evento com o status atual
const normalize = (o: StoredOrder): Order => ({
  ...o,
  history: o.history ?? [{ status: o.status, at: o.created_at, by: "system" }],
});

function readOrders(): Order[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.map(normalize) : [];
  } catch {
    return [];
  }
}

function writeOrders(orders: Order[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

// Único ponto que muda status: valida a transição e registra o evento
function transition(
  order: Order,
  to: OrderStatus,
  by: Actor,
  patch: Partial<Order> = {},
  note?: string
): Order {
  if (!canTransition(order.status, to)) {
    throw new Error(
      `Transição inválida: ${statusMeta[order.status].label} → ${statusMeta[to].label}`
    );
  }
  return {
    ...order,
    ...patch,
    status: to,
    history: [...order.history, { status: to, at: new Date().toISOString(), by, note }],
  };
}

function updateOrder(id: string, fn: (order: Order) => Order): Order {
  const orders = readOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) throw new Error("Pedido não encontrado");

  const updated = fn(orders[index]);
  orders[index] = updated;
  writeOrders(orders);
  return updated;
}

/* ---------- Cliente ---------- */

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  await delay();

  // Lança erro se não houver estoque; nesse caso o pedido não é criado
  reserveStock(payload.items);

  const now = new Date().toISOString();
  const order: Order = {
    id: Math.random().toString(36).slice(2, 8).toUpperCase(),
    ...payload,
    status: "pending",
    created_at: now,
    history: [{ status: "pending", at: now, by: "customer" }],
  };

  writeOrders([order, ...readOrders()]);
  return order;
}

export async function getOrder(id: string): Promise<Order> {
  await delay(300);
  const order = readOrders().find((o) => o.id === id);
  if (!order) throw new Error("Pedido não encontrado");
  return order;
}

export async function getOrders(email: string): Promise<Order[]> {
  await delay(400);
  return readOrders().filter((o) => o.user_email === email);
}

export async function payOrder(id: string, method: PaymentMethod): Promise<Order> {
  await delay(1500);
  return updateOrder(id, (o) => transition(o, "paid", "customer", { payment_method: method }));
}

// `by` indica quem cancelou: o cliente tem mais restrições que o admin
export async function cancelOrder(id: string, by: Actor = "customer"): Promise<Order> {
  await delay(600);

  const cancelled = updateOrder(id, (o) => {
    if (by === "customer" && !canCustomerCancel(o.status)) {
      throw new Error("Este pedido já está em andamento e não pode mais ser cancelado.");
    }
    const needsRefund = o.status !== "pending";
    return transition(
      o,
      "cancelled",
      by,
      { refunded: needsRefund },
      needsRefund ? "Estorno solicitado" : undefined
    );
  });

  releaseStock(cancelled.items);
  return cancelled;
}

/* ---------- Admin ---------- */

export async function getAllOrders(): Promise<Order[]> {
  await delay(500);
  return readOrders();
}

export async function startProcessing(id: string): Promise<Order> {
  await delay(500);
  return updateOrder(id, (o) => transition(o, "processing", "admin"));
}

export async function shipOrder(id: string, input: ShippingInput): Promise<Order> {
  await delay(700);
  const code = input.tracking_code.trim().toUpperCase();

  return updateOrder(id, (o) =>
    transition(
      o,
      "shipped",
      "admin",
      {
        shipping: {
          carrier: input.carrier,
          tracking_code: code,
          estimated_delivery: input.estimated_delivery || undefined,
          shipped_at: new Date().toISOString(),
        },
      },
      `${input.carrier} · ${code}`
    )
  );
}

export async function deliverOrder(id: string): Promise<Order> {
  await delay(500);
  const now = new Date().toISOString();

  return updateOrder(id, (o) =>
    transition(o, "delivered", "admin", {
      shipping: o.shipping && { ...o.shipping, delivered_at: now },
    })
  );
}