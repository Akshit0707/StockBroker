import { create } from "zustand";
import { orderApi } from "../services/api";
import { OrderItem } from "../types";

interface OrderStore {
  orders: OrderItem[];
  isLoading: boolean;
  error: string | null;
  
  fetchOrders: () => Promise<void>;
  placeOrder: (stockSymbol: string, orderType: "buy" | "sell", quantity: number, price: number) => Promise<OrderItem>;
  cancelOrder: (orderId: string) => Promise<void>;
  addOrder: (order: OrderItem) => void;
}

const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  isLoading: false,
  error: null,
  
  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderApi.getOrders();
      set({ orders: response.data, isLoading: false });
    } catch (error) {
      set({ error: "Failed to fetch orders", isLoading: false });
    }
  },
  
  placeOrder: async (stockSymbol, orderType, quantity, price) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderApi.placeOrder({
        stockSymbol,
        orderType,
        quantity,
        price,
      });
      set((state) => ({
        orders: [...state.orders, response.data],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({ error: "Failed to place order", isLoading: false });
      throw error;
    }
  },
  
  cancelOrder: async (orderId) => {
    try {
      await orderApi.cancelOrder(orderId);
      set((state) => ({
        orders: state.orders.filter((order) => order.id !== orderId),
      }));
    } catch (error) {
      set({ error: "Failed to cancel order" });
      throw error;
    }
  },
  
  addOrder: (order) => {
    set((state) => ({
      orders: [...state.orders, order],
    }));
  },
}));

export default useOrderStore;