import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useTranslation } from "react-i18next";
import { HiChevronLeft, HiChevronRight, HiArrowLeft, HiArrowRight } from "react-icons/hi";

export default function StepDate({ data, updateData, nextStep, prevStep }) {
  const { t, i18n } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-12

  useEffect(() => {
    if (data.terrainId) {
      api.getMonthAvailability(data.terrainId, year, month).then((res) => {
        if (res.success) setAvailability(res);
      });
    }
  }, [data.terrainId, year, month]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0-6

  const handleDateClick = (day) => {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    updateData("date", dateStr);
    nextStep();
  };

  const getDayStatus = (day) => {
    if (!availability) return "loading";

    // Check Date
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dateObj = new Date(dateStr);
    const dayOfWeek = dateObj.getDay(); // 0-6

    // 1. Check Capacity
    const capacity = availability.capacity_map[dayOfWeek] || 0;
    if (capacity === 0) return "disabled"; // Closed day

    // 2. Check Bookings
    const booked = availability.bookings_map[dateStr] || 0;
    if (booked >= capacity) return "full"; // Red

    // 3. Past Date check
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj < today) return "disabled";

    return "available"; // Light blue
  };

  const changeMonth = (delta) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);

    const now = new Date();
    if (
      newDate.getFullYear() < now.getFullYear() ||
      (newDate.getFullYear() === now.getFullYear() &&
        newDate.getMonth() < now.getMonth())
    ) {
      return;
    }

    setCurrentDate(newDate);
  };

  const weekDays = [
    t("Sun"),
    t("Mon"),
    t("Tue"),
    t("Wed"),
    t("Thu"),
    t("Fri"),
    t("Sat"),
  ];

  const formatWeekDayLabel = (label) => {
    return i18n.language === "ar" ? label : label.substring(0, 3);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{t("booking.select_date")}</h2>
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-blue-300"></span>
          <span>{t("booking.available")}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-red-500"></span>
          <span>{t("booking.full")}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-zinc-700 border border-zinc-500"></span>
          <span>{t("booking.closed")}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4 bg-zinc-700 p-2 rounded">
        <button
          onClick={() => changeMonth(-1)}
          className="px-3 py-1 hover:bg-zinc-600 rounded"
        >
          {i18n.language === "ar" ? <HiChevronRight /> : <HiChevronLeft />}
        </button>
        <span className="font-bold">
          {currentDate.toLocaleString(i18n.language, {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button
          onClick={() => changeMonth(1)}
          className="px-3 py-1 hover:bg-zinc-600 rounded"
        >
          {i18n.language === "ar" ? <HiChevronLeft /> : <HiChevronRight />}
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center mb-2 text-xs text-gray-400">
        {weekDays.map((d) => (
          <div key={d}>{formatWeekDayLabel(d)}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const status = getDayStatus(day);
          let bgClass = "bg-zinc-700 text-gray-400 cursor-not-allowed"; // disabled

          if (status === "available") {
            bgClass =
              "bg-blue-200 text-blue-900 hover:bg-blue-400 cursor-pointer"; // Light blue
            if (
              data.date ===
              `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            ) {
              bgClass = "bg-blue-600 text-white"; // Selected (Dark blue)
            }
          } else if (status === "full") {
            bgClass = "bg-red-500 text-white cursor-not-allowed opacity-50"; // Red
          }

          return (
            <button
              key={day}
              disabled={
                status === "disabled" ||
                status === "full" ||
                status === "loading"
              }
              onClick={() => handleDateClick(day)}
              className={`p-2 rounded-lg font-bold transition-all ${bgClass}`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <button
        onClick={prevStep}
        className="mt-6 text-gray-400 hover:text-white flex items-center gap-2"
      >
        {i18n.language === "ar" ? <HiArrowRight /> : <HiArrowLeft />}
        {t("booking.back")}
      </button>
    </div>
  );
}
