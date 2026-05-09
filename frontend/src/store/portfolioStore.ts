import { Portfolio, PortfolioHolding } from "../types/portfolio";
import { create } from "zustand";
import { portfolioApi } from "../services/api";

interface PortfolioStore {
  portfolio: Portfolio | null;
  holdings: PortfolioHolding[];
  isLoading: boolean;
  error: string | null;
  
  fetchPortfolio: () => Promise<void>;
  fetchHoldings: () => Promise<void>;
  calculateTotalValue: () => number;
  calculateTotalProfitLoss: () => number;
}

const usePortfolioStore = create<PortfolioStore>((set, get) => ({
  portfolio: null,
  holdings: [],
  isLoading: false,
  error: null,
  
  fetchPortfolio: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await portfolioApi.getPortfolio();
      set({ portfolio: response.data, isLoading: false });
    } catch (error) {
      set({ error: "Failed to fetch portfolio", isLoading: false });
    }
  },
  
  fetchHoldings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await portfolioApi.getHoldings();
      set({ holdings: response.data, isLoading: false });
    } catch (error) {
      set({ error: "Failed to fetch holdings", isLoading: false });
    }
  },
  
  calculateTotalValue: () => {
    const { holdings } = get();
    return holdings.reduce((total, holding) => {
      return total + (holding.currentPrice * holding.quantity);
    }, 0);
  },
  
  calculateTotalProfitLoss: () => {
    const { holdings } = get();
    return holdings.reduce((total, holding) => {
      const investedValue = holding.averageBuyPrice * holding.quantity;
      const currentValue = holding.currentPrice * holding.quantity;
      return total + (currentValue - investedValue);
    }, 0);
  },
}));

export default usePortfolioStore;