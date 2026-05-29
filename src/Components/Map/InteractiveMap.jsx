import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useRealtime } from "../../context/RealtimeContext";
import "leaflet/dist/leaflet.css";

// Helper component to handle flying to a selected location
function MapFlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function InteractiveMap({ zones, selectedZone, onSelectZone }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { occupancyUpdates } = useRealtime();
  
  const isRTL = i18n.language === "ar";
  // Standard fallback center (e.g. Morocco coordinates or central area of the zones)
  const defaultCenter = [33.5731, -7.5898]; 
  const mapCenter = selectedZone && selectedZone.latitude && selectedZone.longitude
    ? [parseFloat(selectedZone.latitude), parseFloat(selectedZone.longitude)]
    : defaultCenter;

  // Custom visual DivIcons representing occupancy rate colors
  const createCustomIcon = (zone) => {
    const liveUpdate = occupancyUpdates[zone.id];
    const total = liveUpdate ? liveUpdate.total_spots : (zone.total_spots || zone.terrains?.length || 20);
    const occupied = liveUpdate ? liveUpdate.occupied_spots : (zone.terrains?.filter(t => t.status === "Occupied").length || 5);
    const free = total - occupied;
    const freePercent = total > 0 ? Math.round((free / total) * 100) : 100;

    let markerColor = "border-emerald-400 text-brand-emerald shadow-glass-emerald bg-emerald-500/20";
    if (freePercent <= 10) {
      markerColor = "border-red-400 text-status-occupied shadow-[0_0_15px_rgba(239,68,68,0.25)] bg-red-500/20";
    } else if (freePercent <= 30) {
      markerColor = "border-amber-400 text-status-reserved shadow-[0_0_15px_rgba(245,158,11,0.25)] bg-amber-500/20";
    }
    return L.divIcon({
      className: "custom-leaflet-icon",
      html: `
        <div class="relative flex items-center justify-center h-10 w-10">
          <span class="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${freePercent <= 10 ? 'bg-red-500/20' : freePercent <= 30 ? 'bg-amber-500/20' : 'bg-emerald-500/20'}"></span>
          <span class="relative flex items-center justify-center rounded-full h-8 w-8 bg-zinc-950 border ${markerColor} text-xs font-black tracking-tighter font-mono">
            ${freePercent}%
          </span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };
  return (
    <div className="w-full h-[55vh] rounded-3xl overflow-hidden border border-white/5 relative bg-zinc-950 shadow-2xl">
      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full dark-leaflet-map"
      >
        {/* Futuristic dark CartoDB tiles overlay */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapFlyTo center={mapCenter} />
        {zones.map((zone) => {
          if (!zone.latitude || !zone.longitude) return null;
          
          const position = [parseFloat(zone.latitude), parseFloat(zone.longitude)];
          
          return (
            <Marker
              key={zone.id}
              position={position}
              icon={createCustomIcon(zone)}
              eventHandlers={{
                click: () => {
                  if (onSelectZone) onSelectZone(zone);
                },
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-3 bg-zinc-950 text-white min-w-[200px]" dir={isRTL ? "rtl" : "ltr"}>
                  <h3 className="font-extrabold text-sm tracking-tight text-white mb-1">
                    {zone.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mb-2">{zone.city}</p>
                  
                  <div className="flex justify-between items-center py-1.5 border-t border-b border-white/5 my-2">
                    <span className="text-xs text-zinc-400">{t("pricePerHour") || "Price"}</span>
                    <span className="text-xs font-bold text-brand-cyan">
                      {zone.price_per_hour || 10} MAD/{t("time").toLowerCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/grounds/${zone.id}`)}
                    className="w-full mt-1 bg-brand-cyan/20 border border-brand-cyan/40 hover:bg-brand-cyan/40 hover:shadow-glass-cyan text-white text-xs font-bold py-2 rounded-xl transition-all duration-300 active:scale-95 text-center block cursor-pointer"
                  >
                    {t("bookNow") || "Reserve Spot"}
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      {/* Styled helper CSS directly injected to keep Leaflet look premium */}
      <style>{`
        .leaflet-container {
          background: #030303 !important;
        }
        .leaflet-bar {
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          background-color: rgba(9, 9, 11, 0.85) !important;
          backdrop-filter: blur(8px);
        }
        .leaflet-bar a {
          background-color: transparent !important;
          color: #a1a1aa !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        }
        .leaflet-bar a:hover {
          color: #fff !important;
        }
        .leaflet-popup-content-wrapper {
          background: rgba(9, 9, 11, 0.85) !important;
          backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 20px !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.6) !important;
        }
        .leaflet-popup-tip {
          background: rgba(9, 9, 11, 0.85) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
        }
        .leaflet-popup-close-button {
          color: #71717a !important;
          top: 10px !important;
          right: 10px !important;
        }
      `}</style>
    </div>
  );
}
