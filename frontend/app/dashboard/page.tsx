"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/src/store/authStore";
import useStockStore from "@/src/store/stockStore";
import { PortfolioData, Stock } from "@/src/types/index";
import { portfolioApi } from "@/src/services/api";
import { tradeApi } from "@/src/services/api";
import { StatCard } from "@/src/components/dashboard/statcard";
import { TopMovers } from "@/src/components/dashboard/topMovers";
import { formatCurrency, toRupees } from "@/src/utils";

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: authLoading, initialize } = useAuthStore();
  const {
    stocks,
    isLoading,
    error: stockError,
    fetchStocks,
    subscribeToPriceUpdates,
  } = useStockStore();

  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [tradesLoading, setTradesLoading] = useState(true);

  const mountedRef = useRef(true);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const response = await portfolioApi.getPortfolio();
        const raw = response?.data?.data ?? response?.data ?? {};

        setPortfolio({
          ...raw,
          cashBalance: Number(raw.cashBalance ?? raw.cash_balance ?? 0),
          totalValue: Number(raw.totalValue ?? raw.total_value ?? 0),
          totalInvested: Number(raw.totalInvested ?? raw.total_invested ?? 0),
          totalPL: Number(raw.totalPL ?? raw.total_pl ?? 0),
          totalPLPercent: Number(
            raw.totalPLPercent ?? raw.total_pl_percent ?? 0,
          ),
          holdings: Array.isArray(raw.holdings) ? raw.holdings : [],
        });

        setPortfolioError(null);
      } catch (error) {
        console.error("Failed to load portfolio:", error);
        setPortfolioError("Failed to load portfolio data");
      } finally {
        setPortfolioLoading(false);
      }
    };

    if (user) loadPortfolio();
  }, [user]);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  useEffect(() => {
    const unsubscribe = subscribeToPriceUpdates();
    return unsubscribe;
  }, [subscribeToPriceUpdates]);

  const dashboard = useMemo(() => {
    return {
      availableBalanceRs: Number(portfolio?.cashBalance ?? 0),
      portfolioValueRs: Number(portfolio?.totalValue ?? 0),
      totalInvestedRs: Number(portfolio?.totalInvested ?? 0),
      totalPLRs: Number(portfolio?.totalPL ?? 0),
      totalPLPercent: Number(portfolio?.totalPLPercent ?? 0),
      holdingsCount: Number(portfolio?.holdings?.length ?? 0),
    };
  }, [portfolio]);

  const loadTrades = useCallback(async () => {
    mountedRef.current = true;
    setTradesLoading(true);

    try {
      if (!stocks || stocks.length === 0) {
        await fetchStocks();
      }

      let res: any = null;

      if (user?.id) {
        const userId = user.id;
        try {
          const userRes = await tradeApi.getUserTrades(userId);
          if (userRes && (userRes.status === 200 || userRes.status === 201)) {
            const payload = userRes?.data?.data ?? userRes?.data;
            if (payload && payload.length !== 0) {
              res = userRes;
            } else {
              console.debug(
                "getUserTrades returned empty, falling back to public trades",
              );
            }
          } else {
            console.debug(
              "getUserTrades returned non-200, falling back",
              userRes?.status,
            );
          }
        } catch (e) {
          console.debug(
            "getUserTrades failed, falling back to public trades",
            e,
          );
          res = null;
        }
      }

      if (!res) {
        try {
          res = await tradeApi.getTrades();
        } catch (e) {
          console.error("getTrades failed", e);
          res = null;
        }
      }

      const raw = res?.data?.data ?? res?.data ?? [];
      console.debug("raw recent trades from API:", raw);

      const normalized = (Array.isArray(raw) ? raw : [])
        .filter(Boolean)
        .map((t: any) => {
          let symbol = t.symbol ?? t.stock_symbol ?? t.stock_name ?? undefined;

          if (!symbol && t.stock_id && Array.isArray(stocks)) {
            const byId = stocks.find(
              (s: any) => String(s.id) === String(t.stock_id),
            );
            const bySymbol = stocks.find(
              (s: any) => String(s.symbol) === String(t.stock_id),
            );
            symbol = byId?.symbol ?? bySymbol?.symbol;
          }

          const executed_at =
            t.executed_at ??
            t.executedAt ??
            t.created_at ??
            t.createdAt ??
            null;
          return { ...t, symbol: symbol ?? "—", executed_at };
        })
        .sort((a: any, b: any) => {
          const ta = a.executed_at ? new Date(a.executed_at).getTime() : 0;
          const tb = b.executed_at ? new Date(b.executed_at).getTime() : 0;
          return tb - ta;
        });

      if (!mountedRef.current) return;
      setRecentTrades(normalized.slice(0, 5));
    } catch (err) {
      console.error("Failed to load recent trades", err);
      if (mountedRef.current) setRecentTrades([]);
    } finally {
      if (mountedRef.current) setTradesLoading(false);
    }
  }, [user, stocks, fetchStocks]);

  useEffect(() => {
    if (!user) return;

    loadTrades();

    return () => {
      mountedRef.current = false;
    };
  }, [user, loadTrades]);

  if (authLoading || portfolioLoading) return null;
  if (!user) return null;

  const validStocks: Stock[] = stocks.filter(
    (stock) => stock && stock.id && stock.symbol && stock.name,
  );

  const topGainers: Stock[] = [...validStocks].sort(
    (a, b) => (b.changePercent || 0) - (a.changePercent || 0),
  );
  const topLosers: Stock[] = [...validStocks].sort(
    (a, b) => (a.changePercent || 0) - (b.changePercent || 0),
  );

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="dashboardPage">
      <div className="dashboardHeader">
        <div className="dashboardGreeting">
          <h1>{greeting}, {user?.firstName || "Trader"} 👋</h1>
          <p>Here&apos;s your trading overview for today</p>
        </div>
      </div>

      {portfolioError && (
        <div className="dashboardError">
          {portfolioError}
        </div>
      )}

      <div className="dashboardStatGrid">
        <StatCard
          title="AVAILABLE BALANCE"
          value={formatCurrency(dashboard.availableBalanceRs)}
          subtitle="Cash in wallet"
        />
        <StatCard
          title="PORTFOLIO VALUE"
          value={formatCurrency(dashboard.portfolioValueRs)}
          subtitle={`${dashboard.holdingsCount} holdings`}
        />
        <StatCard
          title="TOTAL P&L"
          value={formatCurrency(dashboard.totalPLRs)}
          subtitle={`${dashboard.totalPLPercent.toFixed(2)}%`}
        />
        <StatCard
          title="TOTAL INVESTED"
          value={formatCurrency(dashboard.totalInvestedRs)}
          subtitle="Capital deployed"
        />
      </div>

      <div className="dashboardTopMovers">
        {isLoading ? (
          <div className="dashboardLoadingBox">Loading market data...</div>
        ) : stockError ? (
          <div className="dashboardErrorBox">{stockError}</div>
        ) : validStocks.length > 0 ? (
          <TopMovers topGainers={topGainers} topLosers={topLosers} />
        ) : (
          <div className="dashboardEmptyBox">No market data available.</div>
        )}
      </div>

      <div className="dashboardRecentTrades">
        <h2 className="dashboardSectionTitle">Recent Trades</h2>

        {tradesLoading ? (
          <div className="dashboardLoadingText">Loading trades...</div>
        ) : recentTrades.length === 0 ? (
          <div className="dashboardLoadingText">No recent trades.</div>
        ) : (
          <div className="dashboardTableWrapper">
            <div className="dashboardTableScroll">
              <table className="dashboardTable">
                <thead>
                  <tr className="dashboardTableHeadRow">
                    <th>Time</th>
                    <th>Symbol</th>
                    <th>Side</th>
                    <th className="dashboardQtyCol">Qty</th>
                    <th className="dashboardPriceCol">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrades.map((t) => {
                    const time =
                      t.executed_at ??
                      t.executedAt ??
                      t.created_at ??
                      t.createdAt;
                    const symbol =
                      t.symbol ?? t.stock_symbol ?? t.stock_name ?? "—";
                    const side =
                      (t.orderType ?? t.side ?? t.trade_side ?? t.action ?? "")
                        .toString()
                        .toUpperCase() ||
                      (Number(t.quantity ?? 0) < 0 ? "SELL" : "BUY");
                    const qty = Math.abs(Number(t.quantity ?? t.qty ?? 0));
                    const priceVal = Number(t.price ?? 0);

                    return (
                      <tr key={t.id} className="dashboardTableRow">
                        <td className="dashboardTimeCell">
                          {time ? new Date(time).toLocaleString() : "-"}
                        </td>
                        <td className="dashboardSymbolCell">{symbol}</td>
                        <td className={side === "SELL" ? "dashboardSellCell" : "dashboardBuyCell"}>
                          {side}
                        </td>
                        <td className="dashboardQtyCell">{qty}</td>
                        <td className="dashboardPriceCell">
                          {formatCurrency(priceVal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
