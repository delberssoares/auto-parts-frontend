import { api } from "../lib/api";
import type {
  CreateOrderPayload,
  Order,
  OrderStatus,
  OrderSummary,
  Page,
  PaymentMethod,
  ShippingInput,
} from "../types";

/* ---------- Cliente ---------- */

export const createOrder = (payload: CreateOrderPayload) =>
  api<Order>("/orders", { method: "POST", body: payload });

export const getOrders = () => api<Order[]>("/orders");

export const getOrder = (id: string) => api<Order>(`/orders/${id}`);

export const payOrder = (id: string, method: PaymentMethod) =>
  api<Order>(`/orders/${id}/pay`, { method: "POST", body: { method } });

export const cancelOrder = (id: string) => api<Order>(`/orders/${id}/cancel`, { method: "POST" });

/* ---------- Admin ---------- */

export interface AdminOrderFilters {
  status?: OrderStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export function getAdminOrders({ status, search, page = 1, pageSize = 10 }: AdminOrderFilters = {}) {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (status) params.set("status", status);
  if (search) params.set("search", search);
  return api<Page<Order>>(`/admin/orders?${params}`);
}

export const getOrderSummary = () => api<OrderSummary>("/admin/orders/summary");

export const startProcessing = (id: string) =>
  api<Order>(`/admin/orders/${id}/start-processing`, { method: "POST" });

export const shipOrder = (id: string, input: ShippingInput) =>
  api<Order>(`/admin/orders/${id}/ship`, {
    method: "POST",
    body: {
      carrier: input.carrier,
      tracking_code: input.tracking_code,
      estimated_delivery: input.estimated_delivery || null,
    },
  });

export const deliverOrder = (id: string) =>
  api<Order>(`/admin/orders/${id}/deliver`, { method: "POST" });

export const adminCancelOrder = (id: string) =>
  api<Order>(`/admin/orders/${id}/cancel`, { method: "POST" });