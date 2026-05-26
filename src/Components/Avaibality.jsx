import { useTranslation } from "react-i18next";

export default function Availability({ days, setDays }) {
  const { t } = useTranslation();

  const toggleDay = (day) => {
    setDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
    console.log(days);
    
  };

  const week = [
    t("Sun"),
    t("Mon"),
    t("Tue"),
    t("Wed"),
    t("Thu"),
    t("Fri"),
    t("Sat"),
  ];

  return (
    <div className="flex gap-2">
      {week.map((day, i) => (
        <button
          key={i}
          onClick={() => toggleDay(i)}
          className={`px-3 py-1 rounded ${
            days.includes(i) ? "bg-green-500" : "bg-gray-500"
          }`}
          type="button"
        >
          {day}
        </button>
      ))}
    </div>
  );
}