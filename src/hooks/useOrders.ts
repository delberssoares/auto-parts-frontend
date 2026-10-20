import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cancelOrder, createOrder, getOrder, getOrders, payOrder } from "../services/ordersService";
import { useAuth } from "../store/authStore";
import type { PaymentMethod } from "../types";

export function useMyOrders() {
  const userId = useAuth((s) => s.user?.id);
  return useQuery({
    queryKey: ["orders", "mine", userId],
    queryFn: getOrders,
    enabled: !!userId,
  });
}

export function usePendingOrdersCount() {
  const { data } = useMyOrders();
  return data?.filter((o) => o.status === "pending").length ?? 0;
}

// Criar e cancelar mexem no estoque, então atualizam os produtos também
function useRefreshStock() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["product"] });
  };
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const refreshStock = useRefreshStock();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      refreshStock();
    },
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
  const refreshStock = useRefreshStock();
  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: (order) => {
      queryClient.setQueryData(["order", order.id], order);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      refreshStock();
    },
  });
}