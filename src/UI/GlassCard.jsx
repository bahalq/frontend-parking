import React from "react";

export default function GlassCard({ children, className = "", hover = false, onClick }) {
  const hoverClass = hover 
    ? "interactive-spring cursor-pointer hover:border-brand-cyan/40 hover:shadow-glass-cyan" 
    : "";
  
  const clickHandler = onClick 
    ? { 
        onClick, 
        role: "button", 
        tabIndex: 0,
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }
      } 
    : {};

  return (
    <div
      className={`glass-panel p-6 rounded-3xl transition-all duration-300 ${hoverClass} ${className}`}
      {...clickHandler}
    >
      {children}
    </div>
  );
}
