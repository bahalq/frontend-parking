import { useTranslation } from "react-i18next";
import {
  FaCar,
  FaMotorcycle,
  FaChargingStation,
  FaCarSide,
  FaShuttleVan,
  FaWheelchair,
  FaParking,
} from "react-icons/fa";

export default function StepActivity({ ground, updateData, nextStep }) {
  const { t } = useTranslation();
  const activitiesFromGround = Array.isArray(ground?.activities) ? ground.activities : [];

  const activitiesFromTerrains = Array.isArray(ground?.terrains)
    ? Array.from(
        new Map(
          ground.terrains
            .filter((t) => t.activity_id)
            .map((t) => [
              t.activity_id,
              {
                id: t.activity_id,
                name: t.activity_name || `Activity ${t.activity_id}`,
                icon: t.activity_icon,
              },
            ]),
        ).values(),
      )
    : [];

  const availableActivities =
    activitiesFromGround.length > 0 ? activitiesFromGround : activitiesFromTerrains;

  if (availableActivities.length === 0) {
    return (
      <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-5 text-center text-amber-100">
        <p className="font-semibold">{t("booking.no_activities")}</p>
        <p className="mt-2 text-sm text-amber-100/75">
          {t("booking.no_activities_hint", "This parking zone has no linked spots or vehicle categories yet. Please refresh or choose another zone.")}
        </p>
      </div>
    );
  }

  const icons = {
    Compact: <FaCar className="text-cyan-300" />,
    Sedan: <FaCarSide className="text-cyan-300" />,
    SUV: <FaShuttleVan className="text-cyan-300" />,
    "Electric Vehicle": <FaChargingStation className="text-cyan-300" />,
    Motorcycle: <FaMotorcycle className="text-cyan-300" />,
    "Disabled Access": <FaWheelchair className="text-cyan-300" />,
    EV: <FaChargingStation className="text-cyan-300" />,
    Accessible: <FaWheelchair className="text-cyan-300" />,
  };

  const handleSelect = (id) => {
    updateData("activityId", id);
    nextStep();
  };

  return (
    <div className="relative">
      <h2 className="text-xl font-extrabold text-white tracking-tight mb-6 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-cyan-500 rounded-full"></span>
        {t("booking.select_activity")}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {availableActivities.map((act) => (
          <button
            key={act.id}
            onClick={() => handleSelect(act.id)}
            className="group flex min-h-40 flex-col items-center justify-center rounded-xl border border-cyan-400/20 bg-slate-950/80 p-5 text-slate-200 shadow-[0_0_22px_rgba(6,182,212,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/60 hover:bg-cyan-950/25 hover:text-white hover:shadow-[0_0_28px_rgba(6,182,212,0.22)] interactive-spring"
          >
            <span className="text-4xl mb-3 drop-shadow-[0_0_10px_rgba(6,182,212,0.45)] transition-transform duration-300 group-hover:scale-110">
              {icons[act.name] || <FaParking className="text-cyan-400" />}
            </span>
            <span className="font-semibold text-sm tracking-wide">
              {t(`booking.activities.${act.name}`, act.name)}
            </span>
            {typeof act.spots_count !== "undefined" && (
              <span className="mt-2 text-xs text-cyan-100/70">
                {act.spots_count} {t("booking.spots", "spots")}
              </span>
            )}
            {typeof act.min_price_per_hour !== "undefined" && (
              <span className="mt-1 text-xs font-semibold text-cyan-300">
                {act.min_price_per_hour} {t("booking.currency")}/{t("time").toLowerCase()}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
