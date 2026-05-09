"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

interface CommonLayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_WIDTH = 260;

const NO_SIDEBAR_ROUTES = ["/", "/auth/login", "/auth/register"];

export const CommonLayout: React.FC<CommonLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(true);

  const showSidebar = !NO_SIDEBAR_ROUTES.includes(pathname);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const dark = savedTheme !== "light";
    setIsDarkMode(dark);
    applyTheme(dark);
  }, []);

  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
    }
  };

  const handleToggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    applyTheme(newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
  };

  if (!showSidebar) {
    return <main style={{ minHeight: "100vh" }}>{children}</main>;
  }

  return (
    <>
      <style>{`
        .layout-wrapper {
          display: flex;
          min-height: 100vh;
          background: var(--bg-primary);
        }
        .layout-main {
          margin-left: ${SIDEBAR_WIDTH}px;
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        .layout-mobile-header {
          display: none;
        }
        @media (max-width: 768px) {
          .layout-main {
            margin-left: 0;
          }
          .layout-mobile-header {
            display: flex;
            height: 56px;
            align-items: center;
            padding: 0 16px 0 56px;
            border-bottom: 1px solid var(--border-color);
            background: var(--bg-primary);
            position: sticky;
            top: 0;
            z-index: 30;
            font-weight: 700;
            color: var(--text-primary);
          }
        }
      `}</style>
      <div className="layout-wrapper">
        <Sidebar isDarkMode={isDarkMode} onThemeToggle={handleToggleTheme} />
        <div className="layout-main">
          <div
            className="layout-mobile-header"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontWeight: 800,
              color: "var(--accent-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            TraderSuite
          </div>
          <main style={{ flex: 1, overflow: "auto", padding: "24px", minWidth: 0 }}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
};