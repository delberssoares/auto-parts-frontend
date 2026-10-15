import { categories, products as seed } from "./mockData";
import type { Category, Product, ProductInput } from "../types";

const STORAGE_KEY = "auto-parts-products";
const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

const placeholder = (text: string) =>
  `https://placehold.co/600x400/e2e8f0/334155?text=${encodeURIComponent(text)}`;

function readProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // dados corrompidos: recomeça do seed
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return [...seed];
}

function writeProducts(list: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export type SortOption = "name" | "price_asc" | "price_desc";

export interface ProductFilters {
  search?: string;
  categoryId?: number;
  sort?: SortOption;
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  await delay();
  let list = readProducts();

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
  const product = readProducts().find((p) => p.id === id);
  if (!product) throw new Error("Produto não encontrado");
  return product;
}

export async function getCategories(): Promise<Category[]> {
  await delay(200);
  return categories;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  await delay(700);
  const list = readProducts();
  const nextId = list.reduce((max, p) => Math.max(max, p.id), 0) + 1;

  const product: Product = {
    ...input,
    id: nextId,
    image_url: input.image_url || placeholder(input.name),
  };
  writeProducts([...list, product]);
  return product;
}

export async function updateProduct(id: number, input: ProductInput): Promise<Product> {
  await delay(700);
  const list = readProducts();
  const index = list.findIndex((p) => p.id === id);
  if (index === -1) throw new Error("Produto não encontrado");

  const updated: Product = {
    ...input,
    id,
    image_url: input.image_url || placeholder(input.name),
  };
  list[index] = updated;
  writeProducts(list);
  return updated;
}

export async function deleteProduct(id: number): Promise<void> {
  await delay(700);
  const list = readProducts();
  if (!list.some((p) => p.id === id)) throw new Error("Produto não encontrado");
  writeProducts(list.filter((p) => p.id !== id));
}

export interface StockItem {
  product_id: number;
  quantity: number;
}

// Valida tudo antes de alterar: se algum item falhar, nenhum estoque é baixado
export function reserveStock(items: StockItem[]): void {
  const list = readProducts();

  for (const item of items) {
    const product = list.find((p) => p.id === item.product_id);
    if (!product) {
      throw new Error("Um dos produtos do carrinho não está mais disponível.");
    }
    if (product.stock < item.quantity) {
      throw new Error(
        product.stock === 0
          ? `"${product.name}" está sem estoque.`
          : `Estoque insuficiente para "${product.name}" (disponível: ${product.stock}).`
      );
    }
  }

  writeProducts(
    list.map((p) => {
      const item = items.find((i) => i.product_id === p.id);
      return item ? { ...p, stock: p.stock - item.quantity } : p;
    })
  );
}

// Produtos que foram excluídos no meio tempo são simplesmente ignorados
export function releaseStock(items: StockItem[]): void {
  const list = readProducts();

  writeProducts(
    list.map((p) => {
      const item = items.find((i) => i.product_id === p.id);
      return item ? { ...p, stock: p.stock + item.quantity } : p;
    })
  );
}