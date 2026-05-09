export interface Portfolio {
  id: string;
  userId: string;
  stockId: string;
  quantity: number;
  averageBuyPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioHolding {
  symbol: string;
  name: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCash: number;
  totalInvested: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  holdings: PortfolioHolding[];
}