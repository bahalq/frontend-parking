import React from "react";
import { useTranslation } from "react-i18next";
import Badge from "../UI/Badge";
import { FaCar, FaMotorcycle, FaChargingStation, FaBan, FaWrench } from "react-icons/fa";
export default function SpotSelectorGrid({ spots, selectedSpotId, onSelectSpot }) {
  const { t } = useTranslation();
  const handleSpotClick = (spot) => {
    // Only Available spots are selectable
    if (spot.status === "Available") {
      onSelectSpot(spot);
    }
  };
  const getSpotIcon = (spot) => {
    switch (spot.status) {
      case "Occupied": return <FaCar className="w-5 h-5 opacity-65 text-red-400" />;
      case "Reserved": return <FaCar className="w-5 h-5 opacity-80 text-amber-400" />;
      case "Maintenance": return <FaWrench className="w-4 h-4 opacity-40 text-zinc-500" />;
      default: return <FaCar className="w-5 h-5 text-emerald-400 animate-pulse" />;
    }
  };
  // Split spots into Left and Right lanes to simulate a real physical parking aisle layout
  const midPoint = Math.ceil(spots.length / 2);
  const leftLane = spots.slice(0, midPoint);
  const rightLane = spots.slice(midPoint);
  return (
    <div className="space-y-6">
      {/* Legend Header */}
      <div className="flex flex-wrap gap-3 py-3 border-b border-white/5 justify-center md:justify-start">
        <Badge status="Available" />
        <Badge status="Reserved" />
        <Badge status="Occupied" />
        <Badge status="Maintenance" />
      </div>
      <div className="relative p-6 rounded-3xl bg-zinc-950/80 border border-white/5 overflow-hidden">
        {/* Driving Lane grid with Left and Right parking lanes */}
        <div className="grid grid-cols-11 gap-4 items-center">
          
          {/* LEFT LANE SPOTS */}
          <div className="col-span-5 space-y-3">
            {leftLane.map((spot) => {
              const isSelected = selectedSpotId === spot.id;
              const isAvailable = spot.status === "Available";
              
              return (
                <button
                  key={spot.id}
                  type="button"
                  onClick={() => handleSpotClick(spot)}
                  disabled={!isAvailable}
                  className={`w-full p-4 rounded-2xl flex items-center justify-between border transition-all duration-300 relative select-none ${
                    isSelected
                      ? "bg-brand-cyan/15 border-brand-cyan shadow-glass-cyan text-white scale-[1.03]"
                      : isAvailable
                      ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/60 hover:shadow-glass-emerald cursor-pointer"
                      : spot.status === "Reserved"
                      ? "bg-amber-500/5 border-amber-500/10 cursor-not-allowed opacity-75"
                      : spot.status === "Maintenance"
                      ? "bg-zinc-800/10 border-zinc-800 cursor-not-allowed opacity-50"
                      : "bg-red-500/5 border-red-500/10 cursor-not-allowed opacity-75"
                  }`}
                >
                  <div className="text-start space-y-1">
                    <span className="text-xs text-zinc-500 font-semibold block uppercase font-mono">
                      {spot.code || `SPT-${spot.id}`}
                    </span>
                    <span className="text-sm font-bold text-white block">
                      {spot.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getSpotIcon(spot)}
                    <span className="text-xs font-bold text-zinc-400 font-mono">
                      {spot.price_per_hour} MAD
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          {/* CENTRAL DRIVING LANE */}
          <div className="col-span-1 h-full flex flex-col justify-around items-center border-l border-r border-dashed border-zinc-700/60 py-6 min-h-[250px]">
            <div className="text-zinc-600/50 font-bold uppercase tracking-widest text-[10px] transform rotate-90 select-none">
              ← ENTRY
            </div>
            <div className="flex flex-col gap-8 text-zinc-700 select-none">
              <span className="text-xs">▲</span>
              <span className="text-xs">▲</span>
              <span className="text-xs">▲</span>
            </div>
            <div className="text-zinc-600/50 font-bold uppercase tracking-widest text-[10px] transform rotate-90 select-none">
              EXIT →
            </div>
          </div>
          {/* RIGHT LANE SPOTS */}
          <div className="col-span-5 space-y-3">
            {rightLane.map((spot) => {
              const isSelected = selectedSpotId === spot.id;
              const isAvailable = spot.status === "Available";
              
              return (
                <button
                  key={spot.id}
                  type="button"
                  onClick={() => handleSpotClick(spot)}
                  disabled={!isAvailable}
                  className={`w-full p-4 rounded-2xl flex items-center justify-between border transition-all duration-300 relative select-none ${
                    isSelected
                      ? "bg-brand-cyan/15 border-brand-cyan shadow-glass-cyan text-white scale-[1.03]"
                      : isAvailable
                      ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/60 hover:shadow-glass-emerald cursor-pointer"
                      : spot.status === "Reserved"
                      ? "bg-amber-500/5 border-amber-500/10 cursor-not-allowed opacity-75"
                      : spot.status === "Maintenance"
                      ? "bg-zinc-800/10 border-zinc-800 cursor-not-allowed opacity-50"
                      : "bg-red-500/5 border-red-500/10 cursor-not-allowed opacity-75"
                  }`}
                >
                  <div className="text-start space-y-1">
                    <span className="text-xs text-zinc-500 font-semibold block uppercase font-mono">
                      {spot.code || `SPT-${spot.id}`}
                    </span>
                    <span className="text-sm font-bold text-white block">
                      {spot.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getSpotIcon(spot)}
                    <span className="text-xs font-bold text-zinc-400 font-mono">
                      {spot.price_per_hour} MAD
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
