import { useState } from "react";
import { api } from "../../services/api";
import { useTranslation } from "react-i18next";
import { FaTicketAlt, FaSearch, FaCheckCircle, FaTimesCircle, FaUser, FaCalendarAlt, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import AdminLayout from "../Layouts/AdminLayout";
import GlassButton from "../../UI/GlassButton";

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
    <AdminLayout>
      <div className="p-6 text-white max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-brand-cyan to-brand-violet bg-clip-text text-transparent mb-2 uppercase tracking-wider">
            {t("booking.verify_ticket")}
          </h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest font-mono font-semibold">{t("booking.verify_ticket_prompt")}</p>
        </div>

        <div className="glass-panel rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleVerify} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <FaTicketAlt className="absolute start-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value.toUpperCase())}
                placeholder={t("booking.enter_ref")}
                className="w-full bg-zinc-800/50 border border-white/5 rounded-2xl py-4 ps-12 pe-4 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all font-mono text-white placeholder-zinc-500"
              />
            </div>
            <GlassButton
              type="submit"
              disabled={loading}
              variant="cyan"
              className="py-4 px-10 rounded-2xl font-bold uppercase text-xs tracking-wider"
            >
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <FaSearch className="w-4 h-4" />}
              {t("booking.verify")}
            </GlassButton>
          </form>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-6 rounded-3xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
            <FaTimesCircle className="text-2xl flex-shrink-0" />
            <p className="font-medium text-start">{error}</p>
          </div>
        )}

        {booking && (
          <div className="glass-panel rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 border border-white/5">
            <div className="flex justify-between items-start mb-8 border-b border-white/5 pb-6">
              <div className="text-start">
                <h2 className="text-2xl font-bold mb-1 text-white">{t("booking.ticket_details")}</h2>
                <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest">{booking.reference}</span>
              </div>
              <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider border ${
                booking.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
              }`}>
                {booking.status === 'Confirmed' ? <FaCheckCircle /> : <FaTimesCircle />}
                {t(`statuses.${booking.status}`, booking.status)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-start">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900/40 border border-white/5 flex items-center justify-center text-zinc-400">
                    <FaUser />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1 font-mono">{t("client")}</p>
                    <p className="text-lg font-bold text-white">{booking.first_name} {booking.last_name}</p>
                    <p className="text-xs text-zinc-400 font-mono">{booking.email} • {booking.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900/40 border border-white/5 flex items-center justify-center text-zinc-400">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1 font-mono">{t("ground")}</p>
                    <p className="text-lg font-bold text-brand-cyan" dir="auto">{booking.ground_name}</p>
                    <p className="text-xs text-zinc-400 font-mono" dir="auto">{booking.terrain_name}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900/40 border border-white/5 flex items-center justify-center text-zinc-400">
                    <FaCalendarAlt />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1 font-mono">{t("date")}</p>
                    <p className="text-lg font-bold text-white font-mono">{booking.date}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900/40 border border-white/5 flex items-center justify-center text-zinc-400">
                    <FaClock />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1 font-mono">{t("time")}</p>
                    <p className="text-lg font-bold text-white font-mono">{booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-white/5 flex justify-between items-center text-zinc-500 text-xs font-mono">
               <span>Processed on {new Date(booking.created_at).toLocaleDateString()}</span>
               <span className="font-bold text-xl text-brand-emerald tracking-tighter">{booking.total_price} {t("booking.currency")}</span>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
