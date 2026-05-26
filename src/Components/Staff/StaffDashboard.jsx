import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../services/api";
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
      case "Confirmed": return "bg-green-500/20 text-green-400 border-green-500/50";
      case "Pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "Cancelled": return "bg-red-500/20 text-red-400 border-red-500/50";
      default: return "bg-blue-500/20 text-blue-400 border-blue-500/50";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen text-white p-6">
        <div className="max-w-4xl mx-auto pt-[10vh]">
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const { today_bookings, next_booking, scans_today, pending_count, recent_bookings, chart_data } = stats || {};

  // Translate day names for the chart
  const chartDataTranslated = (chart_data || []).map(item => ({
    ...item,
    day: t("days." + item.day.toLowerCase())
  }));

  return (
    <div className="min-h-screen text-white">
      <main className="pt-[10vh] pb-20 px-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent mb-6">
          {t("staff.dashboard_title")}
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label={t("staff.total_today")} value={today_bookings?.length || 0} color="text-white" />
          <StatCard label={t("staff.confirmed_today")} value={today_bookings?.filter(b => b.status === "Confirmed").length || 0} color="text-emerald-400" />
          <StatCard label={t("staff.pending_today")} value={pending_count || 0} color="text-yellow-400" />
          <StatCard label={t("staff.cancelled_today")} value={today_bookings?.filter(b => b.status === "Cancelled").length || 0} color="text-red-400" />
        </div>

        {/* Next Booking Detail */}
        {next_booking && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-6">
            <h2 className="text-sm font-semibold text-zinc-400 mb-2">{t("staff.next_upcoming")}</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium" dir="auto">{next_booking.terrain_name}</p>
                <p className="text-sm text-zinc-400" dir="auto">{next_booking.client_name}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-mono">{next_booking.date}</p>
                <p className="text-sm text-zinc-400">{next_booking.start_time}</p>
              </div>
            </div>
          </div>
        )}

        {/* Today's Bookings */}
        <div className="mb-6">
        <h2 className="text-lg font-bold mb-3 text-zinc-200">{t("staff.todays_bookings")}</h2>
        {!today_bookings || today_bookings.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center">
            <p className="text-zinc-500">{t("staff.no_bookings_today")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {today_bookings.map((b) => (
              <button
                key={b.id}
                onClick={() => navigate(`/staff/booking/${b.id}`)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-start hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate" dir="auto">{b.terrain_name}</p>
                    <p className="text-sm text-zinc-400" dir="auto">{b.activity_name}</p>
                    <p className="text-sm text-zinc-300 mt-1" dir="auto">
                      {b.client_name}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(b.status)}`}>
                      {b.status}
                    </span>
                    <span className="text-sm text-zinc-300 font-mono">
                      {b.start_time} - {b.end_time}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        </div>

        {/* Weekly Chart */}
        {chart_data && chart_data.length > 0 && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">{t("staff.weekly_bookings")}</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartDataTranslated}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="day" stroke="#a1a1aa" />
                <YAxis stroke="#a1a1aa" />
                <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", color: "#fff" }} />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Bookings */}
        {recent_bookings && recent_bookings.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold mb-3 text-zinc-200">{t("staff.recent_bookings")}</h2>
            <div className="space-y-2">
              {recent_bookings.map((b) => (
                <button
                  key={b.id}
                  onClick={() => navigate(`/staff/booking/${b.id}`)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-start hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{b.terrain_name}</p>
                      <p className="text-sm text-zinc-400">{b.client_name} · {b.date}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(b.status)}`}>
                      {b.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, color, small }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
      <p className={`font-bold ${color} ${small ? 'text-lg' : 'text-2xl'}`}>{value}</p>
      <p className="text-xs text-zinc-400 mt-1">{label}</p>
    </div>
  );
}
