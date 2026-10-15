import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../types";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  add: (product: Product) => void;
  setQuantity: (id: number, quantity: number) => void;
  remove: (id: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (product) =>
        set((state) => {
          const found = state.items.find((i) => i.product.id === product.id);
          if (found) {
            const quantity = Math.min(found.quantity + 1, product.stock);
            return {
              items: state.items.map((i) => (i.product.id === product.id ? { ...i, quantity } : i)),
            };
          }
          return { items: [...state.items, { product, quantity: 1 }] };
        }),
      setQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.product.id === id ? { ...i, quantity: Math.min(quantity, i.product.stock) } : i))
            .filter((i) => i.quantity > 0),
        })),
      remove: (id) => set((state) => ({ items: state.items.filter((i) => i.product.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: "auto-parts-cart" }
  )
);

export const selectCount = (s: CartState) => s.items.reduce((acc, i) => acc + i.quantity, 0);
export const selectTotal = (s: CartState) => s.items.reduce((acc, i) => acc + i.quantity * i.product.price, 0);