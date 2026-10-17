import { api } from "../lib/api";
import type { Category, Product, ProductInput } from "../types";

export type SortOption = "name" | "price_asc" | "price_desc";

export interface ProductFilters {
  search?: string;
  categoryId?: number;
  sort?: SortOption;
}

export function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.categoryId) params.set("category_id", String(filters.categoryId));
  if (filters.sort) params.set("sort", filters.sort);

  const query = params.toString();
  return api<Product[]>(`/products${query ? `?${query}` : ""}`, { auth: false });
}

export const getProduct = (id: number) => api<Product>(`/products/${id}`, { auth: false });

export const getCategories = () => api<Category[]>("/categories", { auth: false });

export const createProduct = (input: ProductInput) =>
  api<Product>("/products", { method: "POST", body: input });

export const updateProduct = (id: number, input: ProductInput) =>
  api<Product>(`/products/${id}`, { method: "PUT", body: input });

export const deleteProduct = (id: number) => api<void>(`/products/${id}`, { method: "DELETE" });