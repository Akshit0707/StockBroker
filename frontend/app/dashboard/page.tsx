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
    <div className="dashboard-container">
      <style>{`
        :root {
          --gap-sm: 12px;
          --gap-md: 16px;
          --gap-lg: 24px;
        }

        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          animation: fadeIn 0.25s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--gap-md);
          margin-bottom: var(--gap-lg);
        }

        .greeting {
          margin: 0;
          font-family: var(--font-display);
        }
        .greeting h1 {
          font-size: 28px;
          font-weight: 800;
          margin: 0;
        }
        .greeting p {
          color: var(--text-secondary);
          margin-top: 8px;
          font-size: 14px;
        }

        /* Stat cards grid */
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: var(--gap-md);
          margin-bottom: 28px;
        }

        /* Top movers & table responsiveness */
        .top-movers-wrapper {
          margin-bottom: 28px;
        }

        .table-wrapper {
          border: 1px solid var(--border-color);
          border-radius: 12px;
          overflow: hidden;
        }

        .table-scroll {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 12px;
        }

        /* Header auth buttons spacing (adjust based on your header markup) */
        .site-header .auth-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        /* Mobile adjustments */
        @media (max-width: 640px) {
          .dashboard-container { padding: 14px; }
          .dashboard-header { flex-direction: column; align-items: flex-start; gap: 10px; }
          .greeting h1 { font-size: 20px; }
          .stat-grid { grid-template-columns: 1fr; gap: 10px; }
          th, td { padding: 8px; font-size: 13px; }
          .recent-title { margin-top: 18px; font-size: 16px; }
        }

        @media (max-width: 420px) {
          .dashboard-container { padding: 12px; }
          .greeting h1 { font-size: 18px; }
          .greeting p { font-size: 13px; }
        }
      `}</style>

      <div className="dashboard-header">
        <div className="greeting">
          <h1>{greeting}, {user?.firstName}! 👋</h1>
          <p>Here's your trading overview for today</p>
        </div>
        {/* Keep this area free for optional header actions / quick buttons */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Example placeholders — remove or replace with your actual header buttons */}
        </div>
      </div>

      {portfolioError && (
        <div
          style={{
            background: "var(--color-loss)",
            color: "white",
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 24,
            fontSize: 14,
          }}
        >
          {portfolioError}
        </div>
      )}

      <div className="stat-grid">
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

      <div className="top-movers-wrapper">
        {isLoading ? (
          <div
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              borderRadius: 12,
              padding: 24,
              textAlign: "center",
              color: "var(--text-secondary)",
            }}
          >
            Loading market data...
          </div>
        ) : stockError ? (
          <div
            style={{
              background: "var(--color-loss)",
              color: "white",
              padding: "12px 16px",
              borderRadius: 8,
              marginBottom: 24,
              fontSize: 14,
            }}
          >
            {stockError}
          </div>
        ) : validStocks.length > 0 ? (
          <TopMovers topGainers={topGainers} topLosers={topLosers} />
        ) : (
          <div
            style={{
              background: "var(--color-gain)",
              border: "1px solid var(--border-color)",
              borderRadius: 12,
              padding: 24,
              textAlign: "center",
              color: "var(--text-secondary)",
            }}
          >
            No market data available.
          </div>
        )}
      </div>

      {/* Recent trades block */}
      <div style={{ marginTop: 8 }}>
        <h2 className="recent-title" style={{ fontSize: 20, margin: "0 0 8px 0", fontWeight: 800 }}>
          Recent Trades
        </h2>

        {tradesLoading ? (
          <div style={{ padding: 16, color: "var(--text-secondary)" }}>
            Loading trades...
          </div>
        ) : recentTrades.length === 0 ? (
          <div style={{ padding: 16, color: "var(--text-secondary)" }}>
            No recent trades.
          </div>
        ) : (
          <div className="table-wrapper">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr style={{ textAlign: "left", background: "var(--bg-primary)" }}>
                    <th style={{ padding: 12 }}>Time</th>
                    <th>Symbol</th>
                    <th>Side</th>
                    <th style={{ textAlign: "right", paddingRight: 12 }}>Qty</th>
                    <th style={{ textAlign: "right", paddingRight: 12 }}>
                      Price
                    </th>
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
                      <tr
                        key={t.id}
                        style={{ borderTop: "1px solid var(--border-color)" }}
                      >
                        <td style={{ padding: 12, fontSize: 13 }}>
                          {time ? new Date(time).toLocaleString() : "-"}
                        </td>
                        <td style={{ padding: "12px 8px", fontWeight: 700 }}>
                          {symbol}
                        </td>
                        <td
                          style={{
                            padding: "12px 8px",
                            color: side === "SELL" ? "#ef4444" : "#10b981",
                            fontWeight: 700,
                          }}
                        >
                          {side}
                        </td>
                        <td
                          style={{
                            padding: 12,
                            textAlign: "right",
                            paddingRight: 12,
                          }}
                        >
                          {qty}
                        </td>
                        <td
                          style={{
                            padding: 12,
                            textAlign: "right",
                            paddingRight: 12,
                          }}
                        >
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
