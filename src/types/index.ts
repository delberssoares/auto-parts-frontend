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
  name: string;
  email: string;
  role: "admin" | "customer";
}



export type PaymentMethod = "pix" | "card";

export interface Order {
  id: string;
  user_email: string;
  customer: Customer;
  items: OrderItem[];
  total: number;
  status: "pending" | "paid" | "cancelled";
  payment_method?: PaymentMethod;
  created_at: string;
}

export interface CreateOrderPayload {
  user_email: string;
  customer: Customer;
  items: OrderItem[];
  total: number;
}