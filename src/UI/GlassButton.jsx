import React from "react";
export default function GlassButton({
  children,
  onClick,
  type = "button",
  variant = "cyan", // cyan, emerald, violet, secondary
  className = "",
  disabled = false,
  ariaLabel,
}) {
  const baseStyle =
    "relative px-6 py-3 font-semibold rounded-2xl text-sm transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 select-none flex items-center justify-center gap-2";
  const variants = {
    cyan: "bg-brand-cyan/10 border border-brand-cyan/40 text-white hover:bg-brand-cyan/20 hover:border-brand-cyan hover:shadow-glass-cyan focus:ring-brand-cyan/30",
    emerald: "bg-brand-emerald/10 border border-brand-emerald/40 text-white hover:bg-brand-emerald/20 hover:border-brand-emerald hover:shadow-glass-emerald focus:ring-brand-emerald/30",
    violet: "bg-brand-violet/10 border border-brand-violet/40 text-white hover:bg-brand-violet/20 hover:border-brand-violet hover:shadow-glass-violet focus:ring-brand-violet/30",
    secondary: "bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:border-white/20 focus:ring-white/20",
    "solid-cyan": "bg-cyan-600 hover:bg-cyan-500 text-white shadow-glass-cyan focus:ring-brand-cyan/30 border border-transparent",
    ghost: "text-zinc-400 hover:text-white hover:bg-white/5 focus:ring-white/10 border border-transparent",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${baseStyle} ${variants[variant] || variants.secondary} ${className}`}
    >
      {children}
    </button>
  );
}
