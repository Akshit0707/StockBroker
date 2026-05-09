import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) throw new Error('NEXT_PUBLIC_API_URL is not set');

// axios example
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const WS_URL = process.env.NEXT_PUBLIC_WS_URL;
if (!WS_URL) throw new Error('NEXT_PUBLIC_WS_URL is not set');

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window === 'undefined') return config;

    const token = localStorage.getItem('token');
    const url = config.url ?? '';
    const isAuthRoute = /\/auth\/(login|register)/.test(url);

    if (token && !isAuthRoute) {
      const headers = axios.AxiosHeaders.from(config.headers);
      headers.set('Authorization', `Bearer ${token}`);
      config.headers = headers;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url ?? '';
    const isAuthRoute = /\/auth\/(login|register)/.test(url);

    if (typeof window !== 'undefined') {
      console.error('API error:', {
        url,
        status,
        message: error?.response?.data?.message,
        data: error?.response?.data,
      });
    }

    if (status === 401 && !isAuthRoute && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => api.post('/auth/register', data),
  login: (data: {
    email: string;
    password: string;
  }) => api.post('/auth/login', data),
};

export const stockApi = {
  getStocks: () => api.get('/stocks'),
  getAllStocks: () => api.get('/stocks'),
  getPriceHistory: (symbol: string, interval: string = '1h', limit: number = 100) =>
    api.get(`/stocks/${symbol}/price-history`, { params: { interval, limit } }),
};

export const orderApi = {
  placeOrder: (data: {
    stockSymbol: string;
    orderType: 'buy' | 'sell';
    quantity: number;
    price: number;
  }) => api.post('/orders', data),

  getOrders: () => api.get('/orders'), 

  cancelOrder: (orderId: string) => api.delete(`/orders/${orderId}`),
};

export const tradeApi = {
  getTrades: (symbol?: string) => api.get('/trades'),
  getUserTrades: (userId?: string) =>
    api.get('/trades/user', { params: userId ? { userId } : {} }),
  getStockTrades: (stockId: string) => api.get(`/trades/stock/${stockId}`),
  getTrade: (id: string) => api.get(`/trades/${id}`),
};

export const portfolioApi = {
  getPortfolio: () => api.get('/portfolio'),
  getHoldings: () => api.get('/portfolio/holdings'),
  calculateTotalValue: () => api.get('/portfolio/total-value'),
  calculateTotalProfitLoss: () => api.get('/portfolio/total-profit-loss'),
};

export const orderBookApi = {
  getOrderBook: (symbol: string) => api.get(`/orderbook/${symbol}`),
};

export default api;