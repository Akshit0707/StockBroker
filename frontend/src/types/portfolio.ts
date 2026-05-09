export interface Holding {
  stockId: string;
  symbol: string;
  name: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

export interface PortfolioData {
  cashBalance: number;
  totalValue: number;
  totalInvested: number;
  totalPL: number;
  totalPLPercent: number;
  holdings: Holding[];
}
