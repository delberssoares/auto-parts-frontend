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
  product_id: number;
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
  user_email: string;
  customer: Customer;
  items: OrderItem[];
  total: number;
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
  estimated_delivery?: string; // formato YYYY-MM-DD
  delivered_at?: string;
}

export type ShippingInput = Pick<Shipping, "carrier" | "tracking_code" | "estimated_delivery">;

export interface StatusEvent {
  status: OrderStatus;
  at: string;
  by: Actor;
  note?: string;
}

export interface Order {
  id: string;
  user_email: string;
  customer: Customer;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  payment_method?: PaymentMethod;
  refunded?: boolean;
  shipping?: Shipping;
  history: StatusEvent[];
  created_at: string;
}