import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createOrder, getOrder, getOrders, payOrder } from "../services/ordersService";
import type { PaymentMethod } from "../types";

export function useMyOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrder(id!),
    enabled: !!id,
  });
}

export function usePayOrder(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (method: PaymentMethod) => payOrder(id, method),
    onSuccess: (order) => {
      queryClient.setQueryData(["order", id], order);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}