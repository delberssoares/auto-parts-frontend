export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category_id: number;
  brand: string;
}

export type ProductInput = Omit<Product, "id">;

export interface Customer {
  name: string;
  email: string;
  phone: string;
  cep: string;
  address: string;
  city: string;
}

export interface OrderItem {
  id: number;
  product_id: number | null; // null se o produto foi excluído depois da compra
  name: string;
  price: number;
  quantity: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "customer";
}

export type PaymentMethod = "pix" | "card";

export interface CreateOrderPayload {
  customer: Customer;
  items: { product_id: number; quantity: number }[];
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface OrderSummary {
  counts: Record<OrderStatus, number>;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type Actor = "customer" | "admin" | "system";

export interface Shipping {
  carrier: string;
  tracking_code: string;
  shipped_at: string;
  estimated_delivery: string | null; // YYYY-MM-DD
  delivered_at: string | null;
}

export type ShippingInput = {
  carrier: string;
  tracking_code: string;
  estimated_delivery?: string;
};

export interface StatusEvent {
  status: OrderStatus;
  at: string;
  by: Actor;
  note: string | null;
}

export interface Order {
  id: string;
  status: OrderStatus;
  total: number;
  payment_method: PaymentMethod | null;
  refunded: boolean;
  customer: Customer;
  items: OrderItem[];
  shipping: Shipping | null;
  history: StatusEvent[];
  created_at: string;
}