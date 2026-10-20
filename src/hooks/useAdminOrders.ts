import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminCancelOrder,
  deliverOrder,
  getAdminOrders,
  getOrderSummary,
  shipOrder,
  startProcessing,
  type AdminOrderFilters,
} from "../services/ordersService";
import type { Order, ShippingInput } from "../types";

export function useAdminOrders(filters: AdminOrderFilters) {
  return useQuery({
    queryKey: ["orders", "admin", filters],
    queryFn: () => getAdminOrders(filters),
    placeholderData: keepPreviousData, // evita "piscar" ao trocar de página
  });
}

export function useOrderSummary() {
  return useQuery({ queryKey: ["orders", "summary"], queryFn: getOrderSummary });
}

// Toda ação atualiza o pedido em cache e invalida lista e contadores
function useOrderAction<TVars>(
  mutationFn: (vars: TVars) => Promise<Order>,
  refreshProducts = false
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (order) => {
      queryClient.setQueryData(["order", order.id], order);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      if (refreshProducts) {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["product"] });
      }
    },
  });
}

export const useStartProcessing = () => useOrderAction((id: string) => startProcessing(id));

export const useShipOrder = () =>
  useOrderAction(({ id, input }: { id: string; input: ShippingInput }) => shipOrder(id, input));

export const useDeliverOrder = () => useOrderAction((id: string) => deliverOrder(id));

// Cancelar devolve o estoque
export const useAdminCancelOrder = () =>
  useOrderAction((id: string) => adminCancelOrder(id), true);