import { NavLink, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Logo } from "./Logo";
import { SessionBar } from "./SessionBar";
import { api } from "../lib/api";
import type { Plan } from "../lib/types";

const nav = [
  ["Catálogo", "/catalogo"],
  ["Progreso", "/progreso"],
  ["Reconocimientos", "/reconocimientos"],
  ["Tutoría", "/tutoria"],
  ["Panel AHC", "/dashboard"],
  ["Admin", "/admin/ecogestos"]
];

export function Layout() {
  return (
    <div className="app-shell">
      <header className="site-header no-print">
        <div className="header-inner">
          <NavLink to="/" className="brand-link">
            <Logo />
          </NavLink>
          <nav className="nav-list" aria-label="Navegación principal">
            {nav.map(([label, to]) => (
              <NavLink key={to} to={to} className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
                {label}
              </NavLink>
            ))}
            <NavLink to="/plan" className="plan-nav-item">
              <span className="material-symbols-outlined icon">eco</span>
              Mi plan
              <PlanCountBadge />
            </NavLink>
          </nav>
        </div>
      </header>
      <div className="main-shell">
        <SessionBar />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function PlanCountBadge() {
  const localCount = (() => {
    try {
      return (JSON.parse(localStorage.getItem("eg-selection") || "[]") as string[]).length;
    } catch {
      return 0;
    }
  })();
  const plans = useQuery({
    queryKey: ["plans-nav"],
    queryFn: () => api<Plan[]>("/planes"),
    retry: false
  });
  const apiCount = plans.data?.[0]?.items?.length ?? 0;
  return <span className="plan-badge">{localCount || apiCount}</span>;
}
