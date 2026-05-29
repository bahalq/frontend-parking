import React from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRealtime } from "../../context/RealtimeContext";
import { useAuth } from "../../context/AuthContext";
import LanguageSwitcher from "../LanguageSwitcher";
import { FaQrcode, FaChartBar, FaPowerOff } from "react-icons/fa";
const logo1 = new URL("/favicon.svg", import.meta.url).href;

function readStaffUser() {
  try {
    const raw = localStorage.getItem("staff_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export default function StaffLayout({ children }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLive } = useRealtime();
  const { logout, role } = useAuth();

  const isRTL = i18n.language === "ar";
  const staffUser = role === "Staff" ? readStaffUser() : null;
  const zoneName = staffUser?.ground_name || t("booking.standard_terrain", "My Parking Zone");
  const staffName = `${staffUser?.first_name || ""} ${staffUser?.last_name || ""}`.trim() || t("staff", "Staff");

  const handleLogoutClick = async () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("staff_user");
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
    navigate("/staff/login");
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-200 flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      {/* MOBILE-FIRST TOPBAR */}
      <header className="h-[10vh] sticky top-0 flex items-center justify-between px-4 border-b border-white/5 bg-zinc-950/40 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <img
            src={logo1}
            alt="Logo"
            className="h-9 w-9 cursor-pointer"
            onClick={() => navigate("/staff/dashboard")}
          />
          <div className="min-w-0">
            <span className="text-xs text-brand-emerald font-extrabold block truncate leading-tight uppercase font-mono tracking-wide">
              {zoneName}
            </span>
            <span className="text-[10px] text-zinc-500 block truncate">
              {staffName}
            </span>
          </div>
        </div>

        {/* Realtime & Scan Status */}
        <div className="hidden sm:flex items-center gap-3">
          <span className={`live-pulse-dot ${isLive ? "bg-emerald-400 shadow-glass-emerald" : "bg-zinc-600 shadow-none"}`}></span>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
            {isLive ? t("booking.available", "Live Feed") : t("loading", "Standby")}
          </span>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={handleLogoutClick}
            className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 cursor-pointer"
            title={t("staff.logout", "Logout")}
            aria-label={t("staff.logout", "Logout")}
          >
            <FaPowerOff className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* VIEWPORT LAYOUT */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-transparent pb-24 lg:pb-8">
        <div className="max-w-4xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>

      {/* HIGH-ACCESSIBILITY MOBILE BOTTOM SHEET NAV BAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[8vh] bg-zinc-950/60 border-t border-white/5 flex justify-around items-center px-6 z-40 backdrop-blur-md">
        <NavLink
          to="/staff/dashboard"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 py-1 w-20 text-xs font-semibold transition-all duration-300 ${
              isActive ? "text-brand-cyan scale-105" : "text-zinc-500 hover:text-zinc-300"
            }`
          }
        >
          <FaChartBar className="w-5 h-5" />
          <span>{t("dashboard", "Dashboard")}</span>
        </NavLink>

        <NavLink
          to="/staff/verify"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 py-1 w-24 text-xs font-bold transition-all duration-300 relative ${
              isActive ? "text-brand-emerald scale-105" : "text-zinc-500 hover:text-zinc-300"
            }`
          }
        >
          <div className={`p-3 rounded-full absolute -top-6 border-4 border-background-base shadow-lg transition-colors ${
            location.pathname === "/staff/verify"
              ? "bg-brand-emerald text-zinc-950 shadow-glass-emerald border-emerald-500/20"
              : "bg-zinc-800 text-zinc-400"
          }`}>
            <FaQrcode className="w-6 h-6" />
          </div>
          <span className="mt-6">{t("staff.scan_qr_nav", "Scan QR")}</span>
        </NavLink>
      </nav>
    </div>
  );
}
