import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../services/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";

const STATUS_COLORS = { Confirmed: "#10b981", Pending: "#f59e0b", Cancelled: "#ef4444" };

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchStats = useCallback(() => {
    setLoading(true);
    api.getAdminStats()
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
        } else if (data.status === 403) {
          setError(data.message || "Access denied");
        } else if (data.status === 429) {
          setError(data.message || "Too many requests");
        } else {
          setError("Failed to load dashboard stats");
        }
      })
      .catch(() => setError("Failed to load dashboard stats"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto pt-[10vh]">
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const { bookings, revenue, terrains, peak_hours, recent_activity, charts } = stats || {};

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="pt-[10vh] pb-20 px-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-6">
          {t("admin.dashboard_title")}
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label={t("admin.total_bookings")} value={bookings?.total} color="text-white" />
          <StatCard label={t("admin.today")} value={bookings?.today} color="text-emerald-400" />
          <StatCard label={t("admin.this_week")} value={bookings?.week} color="text-blue-400" />
          <StatCard label={t("admin.this_month")} value={bookings?.month} color="text-purple-400" />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard label={t("statuses.Confirmed")} value={bookings?.breakdown?.confirmed} color="text-green-400" />
          <StatCard label={t("statuses.Pending")} value={bookings?.breakdown?.pending} color="text-yellow-400" />
          <StatCard label={t("statuses.Cancelled")} value={bookings?.breakdown?.cancelled} color="text-red-400" />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatCard label={t("admin.revenue_total")} value={(revenue?.total || 0).toFixed(0) + " MAD"} color="text-green-400" />
          <StatCard label={t("admin.revenue_week")} value={(revenue?.week || 0).toFixed(0) + " MAD"} color="text-blue-400" />
          <StatCard label={t("admin.revenue_month")} value={(revenue?.month || 0).toFixed(0) + " MAD"} color="text-purple-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-white mb-4">{t("admin.bookings_per_day")}</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={charts?.bookings_daily || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="label" stroke="#a1a1aa" />
                <YAxis stroke="#a1a1aa" />
                <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", color: "#fff" }} />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-white mb-4">{t("admin.status_breakdown")}</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={charts?.status_pie || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(charts?.status_pie || []).map((entry, index) => (
                    <Cell key={"cell-" + index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", color: "#fff" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">{t("admin.top_terrains")}</h2>
          <div dir="ltr">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={terrains?.top_5 || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis type="number" stroke="#a1a1aa" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#a1a1aa" 
                  width={120} 
                  tick={(props) => (
                    <text 
                      {...props} 
                      x={props.x - 5} 
                      textAnchor="end" 
                      fill="#a1a1aa" 
                      style={{ direction: "ltr", unicodeBidi: "embed" }}
                    >
                      {props.payload.value}
                    </text>
                  )}
                />
                <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", color: "#fff" }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-white mb-4">{t("admin.terrain_stats")}</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">{t("admin.most_booked")}</span>
                <span className="text-white font-semibold" dir="auto">{terrains?.most_booked?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">{t("admin.occupation_rate")}</span>
                <span className="text-white font-semibold">{terrains?.occupation_rate}%</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-white mb-4">{t("admin.peak_hours")}</h2>
            <div className="space-y-2">
              {(peak_hours || []).map((h, i) => (
                <div key={i} className="flex justify-between py-1">
                  <span className="text-zinc-400">{h.hour}</span>
                  <span className="text-white">{h.count} {t("admin.bookings_count")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white mb-4">{t("admin.recent_activity")}</h2>
          <div className="space-y-2">
            {(recent_activity || []).length === 0 ? (
              <p className="text-zinc-500 text-center py-4">{t("admin.no_recent_activity")}</p>
            ) : (
              recent_activity.map((b) => (
                <div key={b.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                  <div>
                    <p className="text-white font-medium" dir="auto">{b.client_name}</p>
                    <p className="text-sm text-zinc-400" dir="auto">{b.terrain} · {b.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-zinc-300" dir="auto">{b.start_time}</span>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"
                      style={{
                        backgroundColor: (STATUS_COLORS[b.status] || "#71717a") + "20",
                        color: STATUS_COLORS[b.status] || "#a1a1aa",
                        borderColor: (STATUS_COLORS[b.status] || "#71717a") + "50",
                      }}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
      <p className={"text-2xl font-bold " + (color || "")}>{value ?? 0}</p>
      <p className="text-xs text-zinc-400 mt-1">{label}</p>
    </div>
  );
}
