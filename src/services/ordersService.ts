import type { CreateOrderPayload, Order, PaymentMethod } from "../types";

const STORAGE_KEY = "auto-parts-orders";
const delay = (ms = 800) => new Promise((r) => setTimeout(r, ms));

function readOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  await delay();

  const order: Order = {
    id: Math.random().toString(36).slice(2, 8).toUpperCase(),
    ...payload,
    status: "pending",
    created_at: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify([order, ...readOrders()]));
  return order;
}

export async function getOrder(id: string): Promise<Order> {
  await delay(300);
  const order = readOrders().find((o) => o.id === id);
  if (!order) throw new Error("Pedido não encontrado");
  return order;
}

export async function payOrder(id: string, method: PaymentMethod): Promise<Order> {
  await delay(1500);

  const orders = readOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) throw new Error("Pedido não encontrado");

  const paid: Order = { ...orders[index], status: "paid", payment_method: method };
  orders[index] = paid;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  return paid;
}