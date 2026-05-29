import React, { useState } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRealtime } from "../../context/RealtimeContext";
import { useAuth } from "../../context/AuthContext";
import LanguageSwitcher from "../LanguageSwitcher";
import { HiMenu, HiX } from "react-icons/hi";
import { 
  FaChartPie, FaPlusCircle, FaWarehouse, 
  FaUserFriends, FaHistory, FaCheckCircle, 
  FaUsersCog, FaPowerOff 
} from "react-icons/fa";

export default function AdminLayout({ children }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLive } = useRealtime();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isRTL = i18n.language === "ar";
  const adminName = user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : t("admin", "Admin");

  const navigationLinks = [
    {
      name: t("admin.dashboard_title", "Admin Dashboard"),
      path: "/admin/dashboard",
      icon: <FaChartPie className="w-5 h-5" />,
    },
    {
      name: t("addGround", "Add Parking Zone"),
      path: "/admin/grounds/add",
      icon: <FaPlusCircle className="w-5 h-5" />,
    },
    {
      name: t("viewAllGrounds", "View All Zones"),
      path: "/admin/grounds",
      icon: <FaWarehouse className="w-5 h-5" />,
    },
    {
      name: t("viewAllClients", "View Drivers"),
      path: "/admin/clients",
      icon: <FaUserFriends className="w-5 h-5" />,
    },
    {
      name: t("viewAllBookings", "View Reservations"),
      path: "/admin/bookings",
      icon: <FaHistory className="w-5 h-5" />,
    },
    {
      name: t("booking.verify_ticket", "Verify Ticket"),
      path: "/admin/verify-ticket",
      icon: <FaCheckCircle className="w-5 h-5" />,
    },
    {
      name: t("errors.manage_staff", "Manage Staff"),
      path: "/admin/manage-staff",
      icon: <FaUsersCog className="w-5 h-5" />,
    },
  ];

  const handleLogoutClick = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background-base text-gray-200 flex" dir={isRTL ? "rtl" : "ltr"}>
      {/* DESKTOP SIDEBAR */}
      <aside className={`hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-zinc-950/80 border-r border-white/5 backdrop-blur-md z-30 transition-all duration-300 ${isRTL ? "border-l border-r-0" : "border-r"}`}>
        <div className="h-[10vh] flex items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black bg-gradient-to-r from-brand-cyan to-brand-violet bg-clip-text text-transparent uppercase tracking-wider">
              {t("brand", "ParkSmart")}
            </span>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
              {t("admin", "Admin")}
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
          {navigationLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                  isActive
                    ? "bg-brand-cyan/15 text-white border border-brand-cyan/25 shadow-glass-cyan"
                    : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {link.icon}
                <span className="text-sm truncate">{link.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 bg-zinc-950/40">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all duration-300 font-medium cursor-pointer"
          >
            <FaPowerOff className="w-5 h-5" />
            <span className="text-sm">{t("logout", "Log out")}</span>
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside
        className={`fixed top-0 bottom-0 w-64 bg-zinc-950 border-r border-white/5 z-50 flex flex-col transition-transform duration-300 lg:hidden ${
          isRTL ? "right-0" : "left-0"
        } ${
          sidebarOpen
            ? "translate-x-0"
            : isRTL
            ? "translate-x-full"
            : "-translate-x-full"
        }`}
      >
        <div className="h-[10vh] flex items-center justify-between px-6 border-b border-white/5">
          <span className="text-lg font-black bg-gradient-to-r from-brand-cyan to-brand-violet bg-clip-text text-transparent uppercase tracking-wider">
            {t("brand", "ParkSmart")}
          </span>
          <button onClick={() => setSidebarOpen(false)} className="text-zinc-400 hover:text-white text-xl">
            <HiX />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigationLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                  isActive
                    ? "bg-brand-cyan/15 text-white border border-brand-cyan/25 shadow-glass-cyan"
                    : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                {link.icon}
                <span className="text-sm">{link.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 bg-zinc-950/40">
          <button
            onClick={() => {
              setSidebarOpen(false);
              handleLogoutClick();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all duration-300 font-medium cursor-pointer"
          >
            <FaPowerOff className="w-5 h-5" />
            <span className="text-sm">{t("logout", "Log out")}</span>
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR */}
        <header className="h-[10vh] sticky top-0 flex items-center justify-between px-6 border-b border-white/5 bg-background-base/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-2xl text-zinc-400 hover:text-white cursor-pointer"
            >
              <HiMenu />
            </button>
            <div className="flex items-center gap-2">
              <span className={`live-pulse-dot ${isLive ? "bg-emerald-400 shadow-glass-emerald" : "bg-zinc-600 shadow-none"}`}></span>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">
                {isLive ? t("booking.available", "Live Synced") : t("loading", "Standby")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-white truncate max-w-[150px]">
                {adminName}
              </p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest font-mono">
                {t("admin", "Admin Manager")}
              </p>
            </div>
            <LanguageSwitcher />
          </div>
        </header>

        {/* PAGE CONTENT PANEL */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-background-base">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
