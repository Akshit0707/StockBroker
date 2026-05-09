import { create } from "zustand";
import { Stock } from "../types";
import { stockApi } from "../services/api";
import { PriceUpdates } from "../services/websocket";

interface stockStore {
  stocks: Stock[];
  isLoading: boolean;
  error: string | null;
  fetchStocks: () => Promise<void>;
  updateStockPrice: (
    symbol: string,
    price: number,
    change?: number,
    changePercent?: number
  ) => void;
  subscribeToPriceUpdates: () => (() => void);
}

const normalizeApiStock = (stock: any) => ({
  ...stock,
  id: stock.id ?? stock.stockId ?? stock.stock_id,
  stockId: stock.stockId ?? stock.stock_id ?? stock.id,
  symbol: stock.symbol ?? '',
  name: stock.name ?? '',
  currentPrice: Number(
    stock.currentPrice ?? stock.current_price ?? stock.lastPrice ?? stock.last_price ?? stock.price ?? 0,
  ),
  previousClose: Number(
    stock.previousClose ?? stock.previous_close ?? stock.openPrice ?? stock.open_price ?? 0,
  ),
  change: Number(
    stock.change ?? stock.priceChange ?? stock.price_change ?? stock.dayChange ?? stock.day_change ?? 0,
  ),
  changePercent: Number(
    stock.changePercent ??
      stock.change_percent ??
      stock.percentChange ??
      stock.percent_change ??
      stock.priceChangePercent ??
      stock.price_change_percent ??
      stock.dayChangePercent ??
      stock.day_change_percent ??
      0,
  ),
});

const useStockStore = create<stockStore>((set, get) => ({
  stocks: [],
  isLoading: false,
  error: null,

  fetchStocks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await stockApi.getStocks();
      const rawStocks = response.data.data ?? response.data ?? [];
      set({
        stocks: Array.isArray(rawStocks) ? rawStocks.map(normalizeApiStock) : [],
        isLoading: false,
      });
    } catch {
      set({
        error: "Failed to load market data",
        isLoading: false,
      });
    }
  },

  updateStockPrice: (symbol, price, change, changePercent) => {
    set((state) => ({
      stocks: state.stocks.map((stock) =>
        stock.symbol === symbol
          ? {
              ...stock,
              price,
              change: change ?? stock.change ?? 0,
              changePercent: changePercent ?? stock.changePercent ?? 0,
            }
          : stock
      ),
    }));
  },

  subscribeToPriceUpdates: () => {
    const unsubscribe = PriceUpdates((data: any) => {
      const symbol = data.symbol;
      if (!symbol) return;

      const price = Number(data.price ?? data.currentPrice ?? 0);
      const change = Number(data.change ?? 0);
      const changePercent = Number(data.changePercent ?? data.change_percent ?? 0);

      get().updateStockPrice(symbol, price, change, changePercent);
    });

    return unsubscribe;
  },
}));

export default useStockStore;

