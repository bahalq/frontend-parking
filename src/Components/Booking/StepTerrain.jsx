import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useTranslation } from "react-i18next";

export default function StepTerrain({ ground, data, updateData, nextStep, prevStep }) {
  const { t, i18n } = useTranslation();
  const [terrains, setTerrains] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data.activityId) {
      api.getTerrainsByActivity(ground.id, data.activityId)
        .then((res) => {
          if (res.success) setTerrains(res.terrains);
        })
        .finally(() => setLoading(false));
    }
  }, [ground.id, data.activityId]);

  const handleSelect = (terrain) => {
    updateData("terrainId", terrain.id);
    updateData("terrainPrice", terrain.price_per_hour);
    nextStep();
  };

  if (loading) return <div className="text-cyan-500 animate-pulse">{t("booking.loading_terrains")}</div>;

  return (
    <div className="relative">
      <h2 className="text-xl font-extrabold text-white tracking-tight mb-6 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-cyan-500 rounded-full"></span>
        {t("booking.select_terrain")}
      </h2>
      
      {terrains.length === 0 ? (
        <div className="text-slate-400">{t("booking.no_terrains")}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {terrains.map((terrain) => (
            <button
              key={terrain.id}
              onClick={() => handleSelect(terrain)}
              className="text-start p-5 bg-slate-900 border border-slate-800 hover:border-cyan-500/40 hover:bg-cyan-950/15 rounded-xl transition-all duration-300 border-s-4 border-s-cyan-500 shadow-md hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] interactive-spring flex flex-col gap-1"
            >
              <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                <span dir="ltr">{terrain.name}</span>
              </h3>
              <p className="text-xs text-slate-400">{terrain.type || t("booking.standard_terrain")}</p>
              <p className="text-cyan-400 font-bold mt-2 text-sm">{terrain.price_per_hour} {t("booking.currency")}/{t("time").toLowerCase()}</p>
            </button>
          ))}
        </div>
      )}

      <button onClick={prevStep} className="mt-8 text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-2 font-medium text-sm">
        {i18n.language === "ar" ? "←" : "←"} {t("booking.back")}
      </button>
    </div>
  );
}
