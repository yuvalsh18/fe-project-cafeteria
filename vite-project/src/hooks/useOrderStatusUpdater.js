import { useCallback } from "react";

// Custom hook to refresh orders after status change
export function useOrderStatusUpdater(fetchOrders) {
  return useCallback(
    async (order, newStatus) => {
      await fetchOrders();
    },
    [fetchOrders]
  );
}
