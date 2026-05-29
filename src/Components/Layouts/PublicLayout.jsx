import React from "react";
import Header from "../Header";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function PublicLayout({ children }) {
  const { t, i18n } = useTranslation();
  const { role, isLogin, setIslogin, setRole } = useAuth();
  const isRTL = i18n.language === "ar";

  return (
    <div className="min-h-screen bg-background-base text-gray-200 flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      {/* PERSISTENT HEADER NAVBAR */}
      <Header
        role={role}
        isLogin={isLogin}
        setIslogin={setIslogin}
        setRole={setRole}
      />

      {/* VIEWPORT PANEL */}
      <main className="flex-1 bg-background-base">
        <div className="w-full animate-fade-in">
          {children}
        </div>
      </main>

      {/* FUTURISTIC PREMIUM FOOTER */}
      <footer className="py-8 bg-zinc-950 border-t border-white/5 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 {t("brand", "ParkSmart")}. {t("p2", "Reserve, Park, Lock - Smart Parking!")}</p>
          <div className="flex gap-4">
            <span className="text-brand-cyan uppercase tracking-widest text-[9px] font-bold">
              {t("admin.dashboard_title", "Smart Parking Network")}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
