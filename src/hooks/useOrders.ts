import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cancelOrder, createOrder, getOrder, getOrders, payOrder } from "../services/ordersService";
import { useAuth } from "../store/authStore";
import type { PaymentMethod } from "../types";

export function useMyOrders() {
  const email = useAuth((s) => s.user?.email);
  return useQuery({
    queryKey: ["orders", email],
    queryFn: () => getOrders(email!),
    enabled: !!email,
  });
}

export function usePendingOrdersCount() {
  const { data } = useMyOrders();
  return data?.filter((o) => o.status === "pending").length ?? 0;
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

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: (order) => {
      queryClient.setQueryData(["order", order.id], order);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}