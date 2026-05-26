import { useEffect, useState, useCallback } from "react";
import { api } from "../../services/api";
import Pagination from "../Pagination";
import { useTranslation } from "react-i18next";

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
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "Pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "Cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/50";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          {t("allBookings")}
        </h1>
        <button 
          onClick={() => fetchBookings(1)}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors"
        >
          {t("refresh")}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-zinc-800/50 text-zinc-400 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium text-start">{t("date")}</th>
                <th className="px-6 py-4 font-medium text-start">{t("client")}</th>
                <th className="px-6 py-4 font-medium text-start">{t("ground")}</th>
                <th className="px-6 py-4 font-medium text-start">{t("time")}</th>
                <th className="px-6 py-4 font-medium text-start">{t("price")}</th>
                <th className="px-6 py-4 font-medium text-start">{t("status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-zinc-500">
                    {t("noBookings")}
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4 text-start">
                      <div className="font-medium">{booking.date}</div>
                      <div className="text-xs text-zinc-500">{new Date(booking.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 text-start">
                      <div className="font-medium">
                        {booking.client_first_name ? `${booking.client_first_name} ${booking.client_last_name}` : 
                         booking.user_first_name ? `${booking.user_first_name} ${booking.user_last_name}` : t("unknown")}
                      </div>
                      <div className="text-sm text-zinc-400">{booking.client_phone || t("noPhone")}</div>
                    </td>
                    <td className="px-6 py-4 text-start">
                      <div className="font-medium text-green-400" dir="auto">{booking.ground_name}</div>
                      <div className="text-sm text-zinc-400" dir="auto">{booking.terrain_name}</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-300 text-start">
                      {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
                    </td>
                    <td className="px-6 py-4 font-mono text-blue-400 text-start">
                      {booking.total_price} {t("booking.currency")}
                    </td>
                    <td className="px-6 py-4 text-start">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
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

      <Pagination currentPage={page} lastPage={lastPage} onPageChange={handlePageChange} />
    </div>
  );
}
