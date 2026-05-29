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

    return "available"; // Cyan
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
    <div className="relative">
      <h2 className="text-xl font-extrabold text-white tracking-tight mb-6 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-cyan-500 rounded-full"></span>
        {t("booking.select_date")}
      </h2>

      <div className="flex flex-wrap gap-4 mb-6 text-xs font-semibold tracking-wide uppercase">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-cyan-950/40 border border-cyan-500/35"></span>
          <span className="text-slate-300">{t("booking.available")}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-red-950/40 border border-red-500/30"></span>
          <span className="text-slate-300">{t("booking.full")}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-slate-950 border border-slate-800"></span>
          <span className="text-slate-500">{t("booking.closed")}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 hover:bg-slate-800 hover:text-cyan-400 rounded-lg transition-colors"
        >
          {i18n.language === "ar" ? <HiChevronRight size={20} /> : <HiChevronLeft size={20} />}
        </button>
        <span className="font-bold text-white tracking-tight">
          {currentDate.toLocaleString(i18n.language, {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button
          onClick={() => changeMonth(1)}
          className="p-2 hover:bg-slate-800 hover:text-cyan-400 rounded-lg transition-colors"
        >
          {i18n.language === "ar" ? <HiChevronLeft size={20} /> : <HiChevronRight size={20} />}
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center mb-3 text-xs font-bold tracking-wide uppercase text-slate-500">
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
          let bgClass = "bg-slate-950 border border-slate-900 text-slate-600 cursor-not-allowed"; // disabled

          if (status === "available") {
            bgClass =
              "bg-cyan-950/20 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500 hover:text-white cursor-pointer shadow-sm"; // Cyan
            if (
              data.date ===
              `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            ) {
              bgClass = "bg-cyan-600 text-white border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.4)]"; // Selected
            }
          } else if (status === "full") {
            bgClass = "bg-red-950/20 text-red-400 border border-red-500/20 cursor-not-allowed opacity-50"; // Red
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
              className={`p-3 rounded-xl font-bold transition-all text-sm ${bgClass}`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <button
        onClick={prevStep}
        className="mt-8 text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-2 font-medium text-sm"
      >
        {i18n.language === "ar" ? <HiArrowRight /> : <HiArrowLeft />}
        {t("booking.back")}
      </button>
    </div>
  );
}
