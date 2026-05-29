import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../services/api";
import StaffLayout from "../Layouts/StaffLayout";
import GlassButton from "../../UI/GlassButton";
import { FaQrcode, FaArrowAltCircleRight } from "react-icons/fa";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function StaffDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchStats = useCallback(() => {
    setLoading(true);
    api.getStaffStats()
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
        } else if (data.status === 403) {
          setError(data.message || "Access denied");
        } else if (data.status === 429) {
          setError(data.message || "Too many requests");
        } else {
          setError("Failed to load dashboard");
        }
      })
      .catch(() => setError("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed": return "bg-green-500/10 text-green-400 border-green-500/30 shadow-glass-emerald";
      case "Pending": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "Cancelled": return "bg-red-500/10 text-red-400 border-red-500/30";
      default: return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-base flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-emerald shadow-glass-emerald"></div>
      </div>
    );
  }

  if (error) {
    return (
      <StaffLayout>
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-2xl">
          {error}
        </div>
      </StaffLayout>
    );
  }

  const { today_bookings, next_booking, scans_today, pending_count, recent_bookings, chart_data } = stats || {};

  // Translate day names for the chart
  const chartDataTranslated = (chart_data || []).map(item => ({
    ...item,
    day: t("days." + item.day.toLowerCase(), item.day)
  }));

  return (
    <StaffLayout>
      <div className="space-y-6">
        {/* Dynamic header cards */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-brand-emerald to-brand-cyan bg-clip-text text-transparent uppercase tracking-wider">
              {t("staff.dashboard_title", "Parking Staff Workspace")}
            </h1>
            <p className="text-zinc-500 text-xs mt-0.5 uppercase tracking-widest font-mono font-semibold">
              {t("staff.subtitle", "Active Spot Management & Check-in Control")}
            </p>
          </div>

          <GlassButton
            variant="emerald"
            className="w-full sm:w-auto font-bold uppercase text-xs tracking-wider"
            onClick={() => navigate("/staff/verify")}
          >
            <FaQrcode className="w-4 h-4" />
            {t("staff.scan_qr_nav", "Validate Reservation")}
          </GlassButton>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label={t("staff.total_today", "Total Bookings")} value={today_bookings?.length || 0} color="text-white" />
          <StatCard label={t("staff.confirmed_today", "Checked In")} value={today_bookings?.filter(b => b.status === "Confirmed").length || 0} color="text-brand-emerald" />
          <StatCard label={t("staff.pending_today", "Expected Drivers")} value={pending_count || 0} color="text-amber-400" />
          <StatCard label={t("staff.cancelled_today", "Cancelled Spaces")} value={today_bookings?.filter(b => b.status === "Cancelled").length || 0} color="text-red-400" />
        </div>

        {/* Next Booking Detail */}
        {next_booking && (
          <div className="glass-panel rounded-3xl p-5 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent to-brand-cyan/5 pointer-events-none"></div>
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 font-mono">
              {t("staff.next_upcoming", "Next Expected Vehicle")}
            </h2>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-white font-extrabold text-lg" dir="auto">{next_booking.terrain_name}</p>
                <p className="text-sm text-zinc-400 mt-1" dir="auto">{next_booking.client_name}</p>
              </div>
              <div className="text-left sm:text-right bg-zinc-900/40 p-3 rounded-2xl border border-white/5 font-mono">
                <p className="text-brand-cyan font-bold text-sm">{next_booking.date}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{next_booking.start_time}</p>
              </div>
            </div>
          </div>
        )}

        {/* Today's Bookings */}
        <div className="glass-panel rounded-3xl p-6">
          <h2 className="text-md font-extrabold text-white uppercase tracking-wider mb-4 font-mono">
            {t("staff.todays_bookings", "Today's Parking Grid")}
          </h2>
          {!today_bookings || today_bookings.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-zinc-600 font-mono text-sm">{t("staff.no_bookings_today", "No parking activities registered today.")}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-hide">
              {today_bookings.map((b) => (
                <button
                  key={b.id}
                  onClick={() => navigate(`/staff/booking/${b.id}`)}
                  className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl p-4 text-start hover:border-zinc-700 transition-all duration-300 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white truncate" dir="auto">{b.terrain_name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 font-mono" dir="auto">{b.client_name}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0 font-mono text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(b.status)}`}>
                      {b.status}
                    </span>
                    <span className="text-xs text-zinc-400 mt-1">
                      {b.start_time} - {b.end_time}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Weekly Chart */}
        {chart_data && chart_data.length > 0 && (
          <div className="glass-panel rounded-3xl p-6">
            <h2 className="text-md font-extrabold text-white uppercase tracking-wider mb-6 font-mono">
              {t("staff.weekly_bookings", "Weekly Congestion Trends")}
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartDataTranslated}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#71717a" tickLine={false} style={{ fontSize: "11px", fontFamily: "monospace" }} />
                <YAxis stroke="#71717a" tickLine={false} style={{ fontSize: "11px", fontFamily: "monospace" }} />
                <Tooltip contentStyle={{ backgroundColor: "#09090b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", color: "#fff" }} />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Bookings */}
        {recent_bookings && recent_bookings.length > 0 && (
          <div className="glass-panel rounded-3xl p-6">
            <h2 className="text-md font-extrabold text-white uppercase tracking-wider mb-4 font-mono">
              {t("staff.recent_bookings", "Recent Check-ins")}
            </h2>
            <div className="space-y-3">
              {recent_bookings.map((b) => (
                <button
                  key={b.id}
                  onClick={() => navigate(`/staff/booking/${b.id}`)}
                  className="w-full bg-zinc-900/20 border border-white/5 rounded-2xl p-4 text-start hover:border-zinc-700 transition-all duration-300 flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <p className="text-white font-bold text-sm" dir="auto">{b.terrain_name}</p>
                    <p className="text-xs text-zinc-500 mt-1 font-mono">{b.client_name} · {b.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(b.status)}`}>
                      {b.status}
                    </span>
                    <FaArrowAltCircleRight className="text-zinc-500 w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="glass-panel p-5 rounded-3xl text-center">
      <p className={`text-2xl font-black font-mono tracking-tight ${color || "text-white"}`}>{value}</p>
      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1.5">{label}</p>
    </div>
  );
}
