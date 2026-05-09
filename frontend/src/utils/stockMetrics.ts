export type StockLike = {
  id?: string;
  stockId?: string;
  symbol?: string;
  name?: string;

  currentPrice?: number | string;
  current_price?: number | string;
  lastPrice?: number | string;
  last_price?: number | string;
  price?: number | string;

  previousClose?: number | string;
  previous_close?: number | string;
  openPrice?: number | string;
  open_price?: number | string;

  change?: number | string;
  priceChange?: number | string;
  price_change?: number | string;
  dayChange?: number | string;
  day_change?: number | string;

  changePercent?: number | string;
  change_percent?: number | string;
  percentChange?: number | string;
  percent_change?: number | string;
  priceChangePercent?: number | string;
  price_change_percent?: number | string;
  dayChangePercent?: number | string;
  day_change_percent?: number | string;
  changePercentage?: number | string;
  change_percentage?: number | string;
};

const toNum = (v: unknown) => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const cleaned = v.replace(/[₹,%\s]/g, '');
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return Number(v ?? 0) || 0;
};

const pick = (...vals: unknown[]) => vals.find((v) => v !== undefined && v !== null && v !== '');

export const getCurrentPrice = (stock: StockLike) =>
  toNum(
    pick(
      stock.currentPrice,
      stock.current_price,
      stock.lastPrice,
      stock.last_price,
      stock.price,
    ),
  );

export const getPreviousPrice = (stock: StockLike) =>
  toNum(pick(stock.previousClose, stock.previous_close, stock.openPrice, stock.open_price));

export const getPriceChange = (stock: StockLike) => {
  const explicitDelta = pick(
    stock.change,
    stock.priceChange,
    stock.price_change,
    stock.dayChange,
    stock.day_change,
  );

  if (explicitDelta !== undefined) return toNum(explicitDelta);

  const current = getCurrentPrice(stock);
  const prev = getPreviousPrice(stock);
  if (current && prev) return current - prev;

  return 0;
};

export const getPercentChange = (stock: StockLike) => {
  const explicitPercent = pick(
    stock.changePercent,
    stock.change_percent,
    stock.percentChange,
    stock.percent_change,
    stock.priceChangePercent,
    stock.price_change_percent,
    stock.dayChangePercent,
    stock.day_change_percent,
    stock.changePercentage,
    stock.change_percentage,
  );

  if (explicitPercent !== undefined) return toNum(explicitPercent);

  const current = getCurrentPrice(stock);
  const prev = getPreviousPrice(stock);
  if (current && prev) return ((current - prev) / prev) * 100;

  const delta = getPriceChange(stock);
  if (current && delta) {
    const base = current - delta;
    if (base) return (delta / base) * 100;
  }

  return 0;
};

export const normalizeStock = (stock: StockLike) => ({
  ...stock,
  currentPrice: getCurrentPrice(stock),
  change: getPriceChange(stock),
  changePercent: getPercentChange(stock),
});