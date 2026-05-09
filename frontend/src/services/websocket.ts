export type PriceUpdateEvent = {
  symbol: string;
  price: number;
  [key: string]: unknown;
};

type Callback<T = unknown> = (data: T) => void;

let socket: WebSocket | null = null;

const safeSend = (data: unknown) => {
  if (socket?.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify(data));
};

const priceUpdateCallbacks = new Set<Callback<PriceUpdateEvent>>();
const ordersUpdateCallbacks = new Set<Callback<any>>();
const tradeUpdateCallbacks = new Set<Callback<any>>();

const handleMessage = (event: MessageEvent) => {
  try {
    const parsed = JSON.parse(event.data as string);

    switch (parsed?.type) {
      case 'price_update':
      case 'PRICE_UPDATE':
        priceUpdateCallbacks.forEach((cb) => cb(parsed.message ?? parsed));
        break;
      case 'orders_update':
      case 'ORDERS_UPDATE':
        ordersUpdateCallbacks.forEach((cb) => cb(parsed.message ?? parsed));
        break;
      case 'trade_update':
      case 'TRADE_UPDATE':
        tradeUpdateCallbacks.forEach((cb) => cb(parsed.message ?? parsed));
        break;
      default:
        console.log('WebSocket message', parsed);
    }
  } catch {
    console.log('WebSocket message', event.data);
  }
};

export const connectSocket = (token: string) => {
  if (socket && socket.readyState === WebSocket.OPEN) return;

  const baseUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (!baseUrl) {
    console.error('NEXT_PUBLIC_WS_URL is missing');
    return;
  }

  socket = new WebSocket(`${baseUrl.replace(/^http/, 'ws')}/ws`);

  socket.onopen = () => {
    console.log('WebSocket connected');
    safeSend({ type: 'auth', token });
  };

  socket.onclose = () => {
    console.log('WebSocket disconnected');
  };

  socket.onerror = (error) => {
    console.error('WebSocket error', error);
  };

  socket.onmessage = handleMessage;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
  priceUpdateCallbacks.clear();
  ordersUpdateCallbacks.clear();
  tradeUpdateCallbacks.clear();
};

export const PriceUpdates = (
  callback: Callback<PriceUpdateEvent>
): (() => void) => {
  priceUpdateCallbacks.add(callback);
  return () => {
    priceUpdateCallbacks.delete(callback);
  };
};

export const OrdersUpdates = (callback: Callback<any>): (() => void) => {
  ordersUpdateCallbacks.add(callback);
  return () => {
    ordersUpdateCallbacks.delete(callback);
  };
};

export const TradeUpdates = (callback: Callback<any>): (() => void) => {
  tradeUpdateCallbacks.add(callback);
  return () => {
    tradeUpdateCallbacks.delete(callback);
  };
};

export const joinStockRoom = (symbol: string) => {
  safeSend({ type: 'join_stock_room', symbol });
};

export const leaveStockRoom = (symbol: string): void => {
  safeSend({ type: 'leave_stock_room', symbol });
};

export const isSocketConnected = (): boolean => {
  return socket?.readyState === WebSocket.OPEN;
};