import { useMutation, useQuery } from "@tanstack/react-query";
import { createOrder, getOrder } from "../services/ordersService";

export function useCreateOrder() {
  return useMutation({ mutationFn: createOrder });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrder(id!),
    enabled: !!id,
  });
}