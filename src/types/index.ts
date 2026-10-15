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

export type PaymentMethod = "pix" | "card";

export interface Order {
  id: string;
  customer: Customer;
  items: OrderItem[];
  total: number;
  status: "pending" | "paid";
  payment_method?: PaymentMethod;
  created_at: string;
}

export interface CreateOrderPayload {
  customer: Customer;
  items: OrderItem[];
  total: number;
}