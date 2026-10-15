import { useQuery } from "@tanstack/react-query";
import { getCategories, getProduct, getProducts, type ProductFilters } from "../services/productsService";

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => getProducts(filters),
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
    enabled: !Number.isNaN(id),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: Infinity,
  });
}