import { create } from "zustand";
import { PriceHistory } from "../types";
import { stockApi } from "../services/api";


interface PriceStore{
    priceHistory: PriceHistory[];
    currentPrice: Map<string, number>;
    isLoadingPriceHistory: boolean;
    errorPriceHistory: string | null;

    fetchPriceHistory: (symbol: string, interval?: string, limit?: number) => Promise<void>;
    updatePrice:(symbol: string, price: number) => void;
    updatePriceFromWebsocket: (symbol: string, price: number) => void;
}


const usePriceStore= create<PriceStore>((set)=>({
    priceHistory: [],
    currentPrice: new Map(),
    isLoadingPriceHistory: false,
    errorPriceHistory: null,

    fetchPriceHistory:async (symbol, interval = "1h", limit = 100) => {
        set({ isLoadingPriceHistory: true, errorPriceHistory: null });
        try{
            const response = await stockApi.getPriceHistory(symbol, interval, limit);
            set({ priceHistory: response.data, isLoadingPriceHistory: false });
        }catch(error){
            set({ errorPriceHistory: "Failed to fetch price history", isLoadingPriceHistory: false });
        }
    },
    updatePrice: (symbol, price) => {
        set((state) => {
            const newCurrentPrice = new Map(state.currentPrice);
            newCurrentPrice.set(symbol, price);
            return { currentPrice: newCurrentPrice };
        });
    },
    updatePriceFromWebsocket: (symbol, price) => {
        set((state) => {
            const newCurrentPrice = new Map(state.currentPrice);
            newCurrentPrice.set(symbol, price);
            return { currentPrice: newCurrentPrice };
        });
    },
}));    

export default usePriceStore;