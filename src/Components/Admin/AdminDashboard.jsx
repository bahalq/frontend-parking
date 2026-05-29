import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../services/api";
import AdminLayout from "../Layouts/AdminLayout";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area
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
      <div className="min-h-screen bg-background-base flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan shadow-glass-cyan"></div>
      </div>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-2xl glow-red">
          {error}
        </div>
      </AdminLayout>
    );
  }

  const { bookings, revenue, terrains, peak_hours, recent_activity, charts } = stats || {};

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header Title */}
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-brand-cyan to-brand-violet bg-clip-text text-transparent uppercase tracking-wider">
            {t("admin.dashboard_title", "Admin Control Center")}
          </h1>
          <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest font-mono font-semibold">
            {t("admin.dashboard_subtitle", "Real-Time Smart Parking & Traffic Management")}
          </p>
        </div>

        {/* Stats Section 1: Total volume */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label={t("admin.total_bookings")} value={bookings?.total} color="text-white" />
          <StatCard label={t("admin.today")} value={bookings?.today} color="text-brand-emerald" />
          <StatCard label={t("admin.this_week")} value={bookings?.week} color="text-brand-cyan" />
          <StatCard label={t("admin.this_month")} value={bookings?.month} color="text-brand-violet" />
        </div>

        {/* Stats Section 2: Reservation state breakdowns */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label={t("statuses.Confirmed")} value={bookings?.breakdown?.confirmed} color="text-emerald-400" />
          <StatCard label={t("statuses.Pending")} value={bookings?.breakdown?.pending} color="text-amber-400" />
          <StatCard label={t("statuses.Cancelled")} value={bookings?.breakdown?.cancelled} color="text-red-400" />
        </div>

        {/* Stats Section 3: Revenue aggregates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label={t("admin.revenue_total")} value={(revenue?.total || 0).toFixed(0) + " MAD"} color="text-brand-emerald" />
          <StatCard label={t("admin.revenue_week")} value={(revenue?.week || 0).toFixed(0) + " MAD"} color="text-brand-cyan" />
          <StatCard label={t("admin.revenue_month")} value={(revenue?.month || 0).toFixed(0) + " MAD"} color="text-brand-violet" />
        </div>

        {/* Grid: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Traffic Area Flow */}
          <div className="glass-panel rounded-3xl p-6">
            <h2 className="text-md font-extrabold uppercase tracking-wider text-white mb-6">
              {t("admin.bookings_per_day", "Daily Reservation Frequencies")}
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={charts?.bookings_daily || []}>
                <defs>
                  <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" stroke="#71717a" tickLine={false} style={{ fontSize: "11px", fontFamily: "monospace" }} />
                <YAxis stroke="#71717a" tickLine={false} style={{ fontSize: "11px", fontFamily: "monospace" }} />
                <Tooltip contentStyle={{ backgroundColor: "#09090b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", color: "#fff" }} />
                <Area type="monotone" dataKey="count" stroke="#06b6d4" fillOpacity={1} fill="url(#colorCyan)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 2: Status Breakdown Pie */}
          <div className="glass-panel rounded-3xl p-6">
            <h2 className="text-md font-extrabold uppercase tracking-wider text-white mb-6">
              {t("admin.status_breakdown", "Active Status Breakdown")}
            </h2>
            <ResponsiveContainer width="100%" height={260}>
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
                <Tooltip contentStyle={{ backgroundColor: "#09090b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", color: "#fff" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", color: "#a1a1aa" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top spots horizontal chart */}
        <div className="glass-panel rounded-3xl p-6">
          <h2 className="text-md font-extrabold uppercase tracking-wider text-white mb-6">
            {t("admin.top_terrains", "Top Occupied Parking Spots")}
          </h2>
          <div dir="ltr">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={terrains?.top_5 || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#71717a" tickLine={false} style={{ fontSize: "11px", fontFamily: "monospace" }} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#71717a" 
                  width={120} 
                  tickLine={false}
                  style={{ fontSize: "11px" }}
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
                <Tooltip contentStyle={{ backgroundColor: "#09090b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", color: "#fff" }} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom grid: Statistics feeds */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel rounded-3xl p-6">
            <h2 className="text-md font-extrabold uppercase tracking-wider text-white mb-6">
              {t("admin.terrain_stats", "Parking Spot Analytics")}
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-zinc-500 font-medium">{t("admin.most_booked")}</span>
                <span className="text-white font-bold" dir="auto">{terrains?.most_booked?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-zinc-500 font-medium">{t("admin.occupation_rate")}</span>
                <span className="text-brand-cyan font-bold font-mono">{terrains?.occupation_rate}%</span>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6">
            <h2 className="text-md font-extrabold uppercase tracking-wider text-white mb-6">
              {t("admin.peak_hours", "Congestion Peak Hours")}
            </h2>
            <div className="space-y-2.5 max-h-[140px] overflow-y-auto scrollbar-hide">
              {(peak_hours || []).map((h, i) => (
                <div key={i} className="flex justify-between items-center py-1">
                  <span className="text-zinc-500 font-mono">{h.hour}</span>
                  <span className="text-white font-semibold">{h.count} {t("admin.bookings_count")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent logs */}
        <div className="glass-panel rounded-3xl p-6">
          <h2 className="text-md font-extrabold uppercase tracking-wider text-white mb-6">
            {t("admin.recent_activity", "Real-Time Entry/Exit Feed")}
          </h2>
          <div className="space-y-3">
            {(recent_activity || []).length === 0 ? (
              <p className="text-zinc-500 text-center py-8">{t("admin.no_recent_activity")}</p>
            ) : (
              recent_activity.map((b) => (
                <div key={b.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-white font-semibold text-sm" dir="auto">{b.client_name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5" dir="auto">{b.terrain} · {b.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-zinc-400 font-mono" dir="auto">{b.start_time}</span>
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border"
                      style={{
                        backgroundColor: (STATUS_COLORS[b.status] || "#71717a") + "15",
                        color: STATUS_COLORS[b.status] || "#a1a1aa",
                        borderColor: (STATUS_COLORS[b.status] || "#71717a") + "30",
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
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="glass-panel p-6 rounded-3xl transition-all duration-300 hover:border-white/10 text-center">
      <p className={`text-3xl font-black font-mono tracking-tight ${color || "text-white"}`}>
        {value ?? 0}
      </p>
      <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-2">{label}</p>
    </div>
  );
}
