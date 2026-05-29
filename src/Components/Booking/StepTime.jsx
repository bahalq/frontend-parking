import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useTranslation } from "react-i18next";

export default function StepTime({ data, updateData, nextStep, prevStep }) {
  const { t, i18n } = useTranslation();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data.terrainId && data.date) {
      setLoading(true);
      api.getAvailability(data.terrainId, data.date)
        .then((res) => {
          if (res.success) {
            setSlots(res.available_slots || []);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [data.terrainId, data.date]);

  const handleSelect = (time) => {
    updateData("timeSlot", time);
    nextStep();
  };

  if (loading) return <div className="text-cyan-500 animate-pulse">{t("booking.checking_availability")}</div>;

  return (
    <div className="relative">
      <h2 className="text-xl font-extrabold text-white tracking-tight mb-6 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-cyan-500 rounded-full"></span>
        {t("booking.select_time")}
      </h2>
      
      {slots.length === 0 ? (
        <div className="text-red-400 font-semibold">{t("booking.no_slots")}</div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          {slots.map((slot) => (
            <button
              key={slot.time}
              onClick={() => handleSelect(slot.time)}
              className="p-3 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:border-cyan-500/40 hover:bg-cyan-950/20 hover:text-white hover:shadow-[0_0_12px_rgba(6,182,212,0.15)] transition-all duration-300 text-sm font-semibold tracking-wide"
            >
              {slot.display}
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
