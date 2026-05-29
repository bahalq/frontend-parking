import { useEffect, useState, useCallback } from "react";
import { api } from "../../services/api";
import Pagination from "../Pagination";
import { useTranslation } from "react-i18next";
import AdminLayout from "../Layouts/AdminLayout";
import GlassButton from "../../UI/GlassButton";
import { FaSyncAlt } from "react-icons/fa";

export default function ViewBookings() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchBookings = useCallback((pageNumber) => {
    setLoading(true);
    api.getAllBookings(pageNumber)
      .then((data) => {
        if (data.success) {
          const paginator = data.bookings;
          if (paginator && paginator.data) {
            setBookings(paginator.data);
            setLastPage(paginator.last_page || 1);
            setPage(paginator.current_page || 1);
          } else if (Array.isArray(paginator)) {
            setBookings(paginator);
            setLastPage(1);
            setPage(1);
          } else {
            setBookings([]);
            setLastPage(1);
            setPage(1);
          }
        } else if (data.status === 403) {
          setError(data.message);
        } else if (data.status === 429) {
          setError(data.message);
        } else {
          setError(t("errors.fetchBookings"));
        }
      })
      .catch((err) => {
        setError(t("errors.fetchBookings"));
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    fetchBookings(1);
  }, [fetchBookings]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= lastPage) {
      fetchBookings(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-500/10 text-green-400 border-green-500/30 shadow-glass-emerald";
      case "Pending":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "Cancelled":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-base flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan shadow-glass-cyan"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Block */}
        <div className="flex justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-brand-cyan to-brand-violet bg-clip-text text-transparent uppercase tracking-wider">
              {t("allBookings", "All Reservations")}
            </h1>
            <p className="text-zinc-500 text-xs mt-0.5 uppercase tracking-widest font-mono font-semibold">
              {t("admin.bookings_subtitle", "Complete transaction ledger for all vehicle spaces")}
            </p>
          </div>
          
          <GlassButton 
            variant="cyan"
            className="font-bold uppercase text-xs tracking-wider"
            onClick={() => fetchBookings(1)}
          >
            <FaSyncAlt className="w-3 h-3" />
            {t("refresh")}
          </GlassButton>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-2xl">
            {error}
          </div>
        )}

        {/* Dynamic Glassmorphic Table Container */}
        <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-zinc-500 uppercase tracking-wider font-mono bg-zinc-950/40">
                  <th className="px-6 py-4 font-bold text-start">{t("date")}</th>
                  <th className="px-6 py-4 font-bold text-start">{t("client")}</th>
                  <th className="px-6 py-4 font-bold text-start">{t("ground")}</th>
                  <th className="px-6 py-4 font-bold text-start">{t("time")}</th>
                  <th className="px-6 py-4 font-bold text-start">{t("price")}</th>
                  <th className="px-6 py-4 font-bold text-end">{t("status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center text-zinc-500 font-mono">
                      {t("noBookings")}
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 text-start font-mono">
                        <div className="font-bold text-white text-sm">{booking.date}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{new Date(booking.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 text-start">
                        <div className="font-semibold text-white">
                          {booking.client_first_name ? `${booking.client_first_name} ${booking.client_last_name}` : 
                           booking.user_first_name ? `${booking.user_first_name} ${booking.user_last_name}` : t("unknown")}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{booking.client_phone || t("noPhone")}</div>
                      </td>
                      <td className="px-6 py-4 text-start">
                        <div className="font-bold text-brand-cyan truncate max-w-[200px]" dir="auto">{booking.ground_name}</div>
                        <div className="text-xs text-zinc-400 mt-0.5 font-mono" dir="auto">{booking.terrain_name}</div>
                      </td>
                      <td className="px-6 py-4 text-zinc-300 text-start font-mono">
                        {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-brand-emerald text-start text-sm">
                        {booking.total_price} {t("booking.currency")}
                      </td>
                      <td className="px-6 py-4 text-end">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(booking.status)}`}>
                          {t(`statuses.${booking.status}`, booking.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reusable Pagination controls */}
        <Pagination currentPage={page} lastPage={lastPage} onPageChange={handlePageChange} />
      </div>
    </AdminLayout>
  );
}
