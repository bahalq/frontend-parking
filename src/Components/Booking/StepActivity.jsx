import { useTranslation } from "react-i18next";
import {
  GiBasketballBall,
  GiSoccerBall,
  GiTennisRacket,
  GiVolleyballBall,
} from "react-icons/gi";
import { FaTableTennis } from "react-icons/fa";
import { TbPlayHandball, TbSwimming } from "react-icons/tb";

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
      <div className="text-center text-gray-400">
        {t("booking.no_activities")}
      </div>
    );
  }

  const icons = {
    Football: <GiSoccerBall />,
    Tennis: <GiTennisRacket />,
    Basketball: <GiBasketballBall />,
    Volleyball: <GiVolleyballBall />,
    Handball: <TbPlayHandball />,
    Badminton: <img src="/badminton.png" alt="" srcset="" />,
    Swimming: <TbSwimming />,
    "Table Tennis": <FaTableTennis />,
  };

  const handleSelect = (id) => {
    updateData("activityId", id);
    nextStep();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{t("booking.select_activity")}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {availableActivities.map((act) => (
          <button
            key={act.id}
            onClick={() => handleSelect(act.id)}
            className="flex flex-col items-center justify-center p-6 bg-zinc-700 hover:bg-green-600 rounded-lg transition-colors border border-transparent hover:border-green-400"
          >
            <span className="text-4xl mb-2">{icons[act.name]}</span>
            <span className="font-semibold">{t(`booking.activities.${act.name}`, act.name)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
