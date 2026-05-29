import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../services/api";
import AdminLayout from "../Layouts/AdminLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FaChartPie,
  FaHistory,
  FaClock,
} from "react-icons/fa";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(() => {
    setLoading(true);
    api
      .getAdminDashboardStats()
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-transparent flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan shadow-glass-cyan"></div>
        </div>
      </AdminLayout>
    );
  }

  const { bookings, revenue, terrains: spots, peak_hours, recent_activity, charts } = stats || {};

  const statusBreakdownData = [
    { name: t("statuses.Confirmed"), value: bookings?.breakdown?.confirmed || 0, color: "#10b981" },
    { name: t("statuses.Pending"), value: bookings?.breakdown?.pending || 0, color: "#f59e0b" },
    { name: t("statuses.Cancelled"), value: bookings?.breakdown?.cancelled || 0, color: "#ef4444" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header Title */}
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-brand-cyan to-brand-violet bg-clip-text text-transparent uppercase tracking-wider text-start">
            {t("admin.dashboard_title", "Admin Control Center")}
          </h1>
          <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest font-mono font-semibold text-start">
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
            <h2 className="text-md font-extrabold uppercase tracking-wider text-white mb-6 text-start">
              {t("admin.bookings_per_day", "Daily Reservation Frequencies")}
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={charts?.bookings_daily || []}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="date" stroke="#6b7280" tickLine={false} style={{ fontSize: "10px" }} />
                <YAxis stroke="#6b7280" tickLine={false} style={{ fontSize: "10px" }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px", fontSize: "11px" }}
                />
                <Area type="monotone" dataKey="count" stroke="#22d3ee" fillOpacity={1} fill="url(#colorBookings)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 2: Status Breakdown Pie */}
          <div className="glass-panel rounded-3xl p-6">
            <h2 className="text-md font-extrabold uppercase tracking-wider text-white mb-6 text-start">
              {t("admin.status_breakdown", "Real-Time Status Allocation")}
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-between h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {statusBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px", fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full md:w-48 space-y-3 mt-4 md:mt-0">
                {statusBreakdownData.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{entry.name}</span>
                    </div>
                    <span className="text-xs font-black text-white">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Second Row: Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Spots Vertical Bar */}
          <div className="lg:col-span-2 glass-panel rounded-3xl p-8 border border-white/5 shadow-2xl">
            <h2 className="text-xl font-black mb-8 text-white text-start uppercase tracking-widest flex items-center gap-3">
              <FaHistory className="text-brand-cyan" />
              {t("admin.top_terrains", "Top Occupied Parking Spots")}
            </h2>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spots?.top_5 || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                  <XAxis type="number" stroke="#71717a" tickLine={false} style={{ fontSize: "11px" }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#71717a" 
                    width={120} 
                    tickLine={false}
                    tick={({ x, y, payload }) => (
                      <text 
                        x={x - 5} 
                        y={y} 
                        dy={4}
                        textAnchor="end" 
                        fill="#a1a1aa" 
                        style={{ direction: "ltr", unicodeBidi: "embed", fontSize: "11px" }}
                      >
                        {payload.value}
                      </text>
                    )}
                  />
                  <Tooltip 
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "12px", fontSize: "12px" }}
                  />
                  <Bar dataKey="bookings_count" fill="url(#cyanGradient)" radius={[0, 6, 6, 0]} barSize={30} />
                  <defs>
                    <linearGradient id="cyanGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0891b2" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* STATS BREAKDOWN */}
          <div className="space-y-6">
            <div className="glass-panel rounded-3xl p-8 border border-white/5 shadow-2xl">
              <h2 className="text-xl font-black mb-8 text-white text-start uppercase tracking-widest flex items-center gap-3">
                <FaChartPie className="text-brand-violet" />
                {t("admin.terrain_stats", "Parking Spot Analytics")}
              </h2>
              <div className="space-y-6">
                <div className="p-5 bg-zinc-950/40 rounded-2xl border border-white/5 text-start">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">{t("admin.most_booked", "Most Occupied Spot")}</p>
                  <span className="text-white font-bold" dir="auto">{spots?.most_booked?.name || "N/A"}</span>
                </div>
                <div className="p-5 bg-zinc-950/40 rounded-2xl border border-white/5 text-start">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">{t("admin.occupation_rate", "System Occupation Rate")}</p>
                  <span className="text-brand-cyan font-bold font-mono text-2xl">{spots?.occupation_rate}%</span>
                </div>
              </div>
            </div>

            {/* PEAK HOURS */}
            <div className="glass-panel rounded-3xl p-8 border border-white/5 shadow-2xl">
              <h2 className="text-xl font-black mb-8 text-white text-start uppercase tracking-widest flex items-center gap-3">
                <FaClock className="text-brand-emerald" />
                {t("admin.peak_hours", "Demand Surge Periods")}
              </h2>
              <div className="space-y-3">
                {(peak_hours || []).map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-all">
                    <span className="text-xs text-zinc-400 font-mono">{h.hour}</span>
                    <span className="text-white font-semibold">{h.count} {t("admin.bookings_count")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="glass-panel rounded-3xl p-8 border border-white/5 shadow-2xl">
          <h2 className="text-xl font-black mb-8 text-white text-start uppercase tracking-widest flex items-center gap-3">
            <FaHistory className="text-brand-cyan" />
            {t("admin.recent_activity", "Real-Time Entry/Exit Feed")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(recent_activity || []).length === 0 ? (
              <p className="text-zinc-500 text-center py-8">{t("admin.no_recent_activity")}</p>
            ) : (
              recent_activity.map((b) => (
                <div key={b.id} className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan">
                    <FaHistory />
                  </div>
                  <div className="flex-1 text-start">
                    <p className="text-sm font-bold text-white">{b.client}</p>
                    <p className="text-xs text-zinc-500 mt-0.5" dir="auto">{b.terrain} · {b.date}</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">{b.time}</span>
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
    <div className="glass-panel rounded-2xl p-6 border border-white/5 shadow-lg flex flex-col items-center justify-center text-center">
      <p className={`text-3xl font-black font-mono tracking-tight ${color || "text-white"}`}>
        {value ?? 0}
      </p>
      <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-2">{label}</p>
    </div>
  );
}
