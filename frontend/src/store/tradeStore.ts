import { create } from "zustand";
import {tradeApi} from "../services/api";
import { orderBookApi } from "../services/api";
import { OrderBook, Trade } from "../types";

interface TradeStore{
    trades:Trade[];
    recentTrades:Trade[];
    orderBook:OrderBook | null;
    isLoadingTrades:boolean;
    isLoadingOrderBook:boolean;
    errorTrades:string | null;
    errorOrderBook:string | null;

    fetchTrades:() => Promise<void>;
    fetchOrderBook:() => Promise<void>;
    fetchRecentTrades:() => Promise<void>;
    addTrade:(trade:Trade) => void;
}

const useTradeStore= create<TradeStore>((set)=>({
    trades:[],
    recentTrades:[],
    orderBook: null,
    isLoadingTrades:false,
    isLoadingOrderBook:false,
    errorTrades:null,
    errorOrderBook:null,

    fetchTrades: async () => {
        set({ isLoadingTrades: true, errorTrades: null });
        try {
            const response = await tradeApi.getUserTrades();
            set({ trades: response.data, isLoadingTrades: false });
        } catch (error) {
            set({ errorTrades: 'Failed to fetch trades', isLoadingTrades: false });
        }
    },
    fetchOrderBook: async () => {
        set({ isLoadingOrderBook: true, errorOrderBook: null });
        try {
            const response = await orderBookApi.getOrderBook('AAPL');
            set({ orderBook: response.data, isLoadingOrderBook: false });
        } catch (error) {
            set({ errorOrderBook: 'Failed to fetch order book', isLoadingOrderBook: false });
        }
    },
    fetchRecentTrades: async () => {
        set({ isLoadingTrades: true, errorTrades: null });
        try {
            const response = await tradeApi.getTrades('AAPL');
            set({ recentTrades: response.data, isLoadingTrades: false });
        } catch (error) {
            set({ errorTrades: 'Failed to fetch recent trades', isLoadingTrades: false });
        }
    },
    addTrade: (trade) => {
        set((state) => ({ trades: [...state.trades, trade] }));
    }    
}));

export default useTradeStore;

