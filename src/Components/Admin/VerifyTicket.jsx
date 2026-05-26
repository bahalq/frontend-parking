import { useState } from "react";
import { api } from "../../services/api";
import { useTranslation } from "react-i18next";
import { FaTicketAlt, FaSearch, FaCheckCircle, FaTimesCircle, FaUser, FaCalendarAlt, FaClock, FaMapMarkerAlt } from "react-icons/fa";

export default function VerifyTicket() {
  const { t } = useTranslation();
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!reference.trim()) return;

    setLoading(true);
    setBooking(null);
    setError("");

    try {
      const data = await api.verifyTicket(reference.trim());
      if (data.success) {
        setBooking(data.booking);
      } else {
        setError(data.message || t("booking.invalid_ticket"));
      }
    } catch (err) {
      setError(t("errors.server_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-white max-w-4xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2">
          {t("booking.verify_ticket")}
        </h1>
        <p className="text-zinc-400">{t("booking.verify_ticket_prompt")}</p>
      </div>

      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-3xl p-8 shadow-2xl mb-8">
        <form onSubmit={handleVerify} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FaTicketAlt className="absolute start-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value.toUpperCase())}
              placeholder={t("booking.enter_ref")}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl py-4 ps-12 pe-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-lg hover:shadow-green-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <FaSearch />}
            {t("booking.verify")}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-6 rounded-3xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <FaTimesCircle className="text-2xl flex-shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {booking && (
        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95">
          <div className="flex justify-between items-start mb-8 border-b border-zinc-800 pb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">{t("booking.ticket_details")}</h2>
              <span className="text-zinc-500 font-mono text-sm uppercase tracking-widest">{booking.reference}</span>
            </div>
            <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold ${
              booking.status === 'Confirmed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}>
              {booking.status === 'Confirmed' ? <FaCheckCircle /> : <FaTimesCircle />}
              {t(`statuses.${booking.status}`, booking.status)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <FaUser />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">{t("client")}</p>
                  <p className="text-lg font-semibold">{booking.first_name} {booking.last_name}</p>
                  <p className="text-sm text-zinc-400">{booking.email} • {booking.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">{t("ground")}</p>
                  <p className="text-lg font-semibold" dir="auto">{booking.ground_name}</p>
                  <p className="text-sm text-zinc-400" dir="auto">{booking.terrain_name}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <FaCalendarAlt />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">{t("date")}</p>
                  <p className="text-lg font-semibold">{booking.date}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <FaClock />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">{t("time")}</p>
                  <p className="text-lg font-semibold">{booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-zinc-800 flex justify-between items-center text-zinc-500 text-sm">
             <span>{t("joined")} {new Date(booking.created_at).toLocaleDateString()}</span>
             <span className="font-bold text-lg text-white">{booking.total_price} {t("booking.currency")}</span>
          </div>
        </div>
      )}
    </div>
  );
}
