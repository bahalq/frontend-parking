import { useTranslation } from "react-i18next";
import {
  FaCar,
  FaMotorcycle,
  FaChargingStation,
  FaTruck,
  FaCarSide,
  FaShuttleVan,
  FaWheelchair,
  FaClock,
  FaParking,
  FaCrown,
} from "react-icons/fa";

export default function StepActivity({ ground, updateData, nextStep }) {
  const { t } = useTranslation();
  const activitiesFromGround = Array.isArray(ground.activities) ? ground.activities : [];

  const activitiesFromTerrains = Array.isArray(ground.terrains)
    ? Array.from(
        new Map(
          ground.terrains
            .filter((t) => t.activity_id)
            .map((t) => [
              t.activity_id,
              {
                id: t.activity_id,
                name: t.activity_name || `Activity ${t.activity_id}`,
              },
            ]),
        ).values(),
      )
    : [];

  const availableActivities =
    activitiesFromGround.length > 0 ? activitiesFromGround : activitiesFromTerrains;

  if (availableActivities.length === 0) {
    return (
      <div className="text-center text-slate-400">
        {t("booking.no_activities")}
      </div>
    );
  }

  const icons = {
    Football: <FaCar className="text-cyan-400" />,
    Tennis: <FaMotorcycle className="text-cyan-400" />,
    Basketball: <FaChargingStation className="text-cyan-400" />,
    Volleyball: <FaShuttleVan className="text-cyan-400" />,
    Handball: <FaCarSide className="text-cyan-400" />,
    Badminton: <FaWheelchair className="text-cyan-400" />,
    Swimming: <FaTruck className="text-cyan-400" />,
    "Table Tennis": <FaClock className="text-cyan-400" />,
    Padel: <FaCrown className="text-cyan-400" />,
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
            className="flex flex-col items-center justify-center p-6 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl transition-all duration-300 hover:border-cyan-500/40 hover:bg-cyan-950/20 hover:text-white hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] interactive-spring"
          >
            <span className="text-4xl mb-3 drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]">
              {icons[act.name] || <FaParking className="text-cyan-400" />}
            </span>
            <span className="font-semibold text-sm tracking-wide">
              {t(`booking.activities.${act.name}`, act.name)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
