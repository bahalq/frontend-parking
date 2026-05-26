import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../services/api";
import StaffBookingDetails from "./StaffBookingDetails";

export default function StaffBookingDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lang = ["fr", "en", "ar"].includes(i18n.language?.slice(0, 2))
    ? i18n.language.slice(0, 2)
    : "en";

  useEffect(() => {
    if (!id) {
      return;
    }

    api
      .getStaffBooking(id)
      .then((data) => {
        if (data.success) {
          setBooking(data.booking);
          setError(null);
        } else {
          setError(data.message || t("staff.booking_details"));
        }
      })
      .catch(() => setError(t("staff.booking_details")))
      .finally(() => setLoading(false));
  }, [id, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <main className="pt-[10vh] pb-20 px-4 max-w-3xl mx-auto">
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {!error && booking && (
          <StaffBookingDetails
            booking={booking}
            status={booking.status}
            language={lang}
            message={t("staff.booking_details")}
          />
        )}
      </main>
    </div>
  );
}
