import React from "react";
export default function StatWidget({
  label,
  value,
  trend,
  icon: Icon,
  variant = "cyan", // cyan, emerald, violet, amber
}) {
  const glows = {
    cyan: "hover:border-brand-cyan/30 hover:shadow-glass-cyan",
    emerald: "hover:border-brand-emerald/30 hover:shadow-glass-emerald",
    violet: "hover:border-brand-violet/30 hover:shadow-glass-violet",
    amber: "hover:border-amber-500/30 hover:shadow-[0_0_15px_rgba(245,158,11,0.25)]",
  };
  const icons = {
    cyan: "text-brand-cyan bg-brand-cyan/10",
    emerald: "text-brand-emerald bg-brand-emerald/10",
    violet: "text-brand-violet bg-brand-violet/10",
    amber: "text-amber-400 bg-amber-500/10",
  };
  return (
    <div
      className={`bg-zinc-950/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 relative overflow-hidden transition-all duration-300 ${glows[variant] || glows.cyan}`}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block">
            {label}
          </span>
          <span className="text-3xl font-extrabold text-white mt-2 font-sans tracking-tight block">
            {value ?? 0}
          </span>
        </div>
        {Icon && (
          <div className={`p-3 rounded-2xl ${icons[variant] || icons.cyan}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          <span
            className={`font-bold px-2 py-0.5 rounded-full ${
              trend.value >= 0
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
          <span className="text-zinc-500 font-medium">{trend.label}</span>
        </div>
      )}
    </div>
  );
}