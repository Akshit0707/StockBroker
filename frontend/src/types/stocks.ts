export interface Stock {
  id: string,
  symbol: string,
  name: string,
  companyName: string,
  price: number,
  currentPrice: number,  // ← add this
  previousClose: number,
  change: number,
  changePercent: number,
  volume: number,
  high24h: number,
  low24h: number,
}

export interface PriceHistory{
    timestamp:string,
    open:number,
    high:number,
    low:number,
    close:number,
    volume:number,
}