import { categories, products } from "./mockData";
import type { Category, Product } from "../types";

const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

export type SortOption = "name" | "price_asc" | "price_desc";

export interface ProductFilters {
  search?: string;
  categoryId?: number;
  sort?: SortOption;
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  await delay();
  let list = [...products];

  if (filters.search) {
    const s = filters.search.toLowerCase();
    list = list.filter(
      (p) => p.name.toLowerCase().includes(s) || p.brand.toLowerCase().includes(s)
    );
  }
  if (filters.categoryId) {
    list = list.filter((p) => p.category_id === filters.categoryId);
  }

  switch (filters.sort) {
    case "price_asc": list.sort((a, b) => a.price - b.price); break;
    case "price_desc": list.sort((a, b) => b.price - a.price); break;
    default: list.sort((a, b) => a.name.localeCompare(b.name));
  }
  return list;
}

export async function getProduct(id: number): Promise<Product> {
  await delay(400);
  const product = products.find((p) => p.id === id);
  if (!product) throw new Error("Produto não encontrado");
  return product;
}

export async function getCategories(): Promise<Category[]> {
  await delay(200);
  return categories;
}