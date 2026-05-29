import React from "react";
import { useTranslation } from "react-i18next";
export default function Badge({ status, className = "" }) {
  const { t } = useTranslation();
  const configs = {
    // Spot States
    Available: {
      style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
      pulse: "bg-emerald-400",
      animate: "animate-pulse",
    },
    Reserved: {
      style: "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
      pulse: "bg-amber-400",
      animate: "",
    },
    Occupied: {
      style: "bg-red-500/10 text-red-400 border-red-500/30",
      pulse: "bg-red-400",
      animate: "",
    },
    Maintenance: {
      style: "bg-zinc-800/40 text-zinc-400 border-zinc-700/50",
      pulse: "bg-zinc-500",
      animate: "",
    },
    
    // Booking States
    Pending: {
      style: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.1)]",
      pulse: "bg-yellow-400",
      animate: "animate-ping",
    },
    Confirmed: {
      style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      pulse: "bg-emerald-400",
      animate: "",
    },
    Cancelled: {
      style: "bg-red-500/10 text-red-400 border-red-500/30",
      pulse: "bg-red-400",
      animate: "",
    },
    Active: {
      style: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]",
      pulse: "bg-cyan-400",
      animate: "animate-pulse",
    },
  };
  const current = configs[status] || configs.Maintenance;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${current.style} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {current.animate && (
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${current.pulse} ${current.animate}`}></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${current.pulse}`}></span>
      </span>
      {t(`statuses.${status}`, status)}
    </span>
  );
}
