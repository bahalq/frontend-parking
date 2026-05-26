import { useTranslation } from "react-i18next";

export default function ScheduleEditor({ schedule, setSchedule }) {
  const { t } = useTranslation();

  return (
    <div className="flex gap-3 ">
      <label>{t("from")}</label>
      <input
        type="time"
        value={schedule.from}
        onChange={(e) =>
          setSchedule({ ...schedule, from: e.target.value })
        }
      />
      <label>{t("to")}</label>
      <input
        type="time"
        value={schedule.to}
        onChange={(e) =>
          setSchedule({ ...schedule, to: e.target.value })
        }
      />
    </div>
  );
}