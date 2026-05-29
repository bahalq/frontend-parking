import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useTranslation } from "react-i18next";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function VerifyBookingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const query = useQuery();
  const token = query.get("token") || "";
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState({
    success: false,
    message: "",
    booking: null,
  });

  useEffect(() => {
    const normalizedToken = token.match(/[a-f0-9]{64}/i)?.[0] || "";

    if (!normalizedToken) {
      setResult({
        success: false,
        message: t("booking.verify_page.invalid_token"),
        booking: null,
      });
      setLoading(false);
      return;
    }

    api
      .verifyBookingByToken(normalizedToken)
      .then((data) => {
        setResult({
          success: !!data.success,
          message: data.message || (data.success ? t("booking.verify_page.valid") : t("booking.verify_page.invalid")),
          booking: data.booking || null,
        });
      })
      .catch(() => {
        setResult({
          success: false,
          message: t("booking.verify_page.error"),
          booking: null,
        });
      })
      .finally(() => setLoading(false));
  }, [token, t]);

  return (
    <div className="min-h-screen bg-black grid-bg shroud-cyber px-4 py-16 text-white flex items-center justify-center">
      <div className="mx-auto max-w-2xl rounded-2xl glass-panel p-6 shadow-2xl sm:p-8 relative overflow-hidden w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none"></div>
        
        <div className="mb-8 text-center relative z-10">
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">{t("booking.verify_page.title")}</h1>
          <p className="mt-3 text-slate-400 font-medium">
            {loading ? t("booking.verify_page.verifying") : result.message}
          </p>
        </div>

        {!loading && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm font-semibold tracking-wide relative z-10 text-center ${
              result.success
                ? "border-cyan-500/30 bg-cyan-950/20 text-cyan-300"
                : "border-red-500/30 bg-red-950/20 text-red-300"
            }`}
          >
            {result.success ? t("booking.verify_page.confirmed") : result.message}
          </div>
        )}

        {result.booking && (
          <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/60 p-5 relative z-10">
            <div>
              <p className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-1">{t("booking.verify_page.reference")}</p>
              <p className="font-mono text-lg font-bold text-cyan-400">{result.booking.reference}</p>
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-1">{t("booking.verify_page.complex")}</p>
              <p className="text-lg font-bold text-white leading-snug">{result.booking.ground_name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{result.booking.terrain_name}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-1">{t("date")}</p>
                <p className="font-semibold text-slate-300">{result.booking.date}</p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-1">{t("time")}</p>
                <p className="font-semibold text-slate-300">
                  {result.booking.start_time?.substring(0, 5)} - {result.booking.end_time?.substring(0, 5)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-1">{t("booking.verify_page.status")}</p>
              <p className="font-semibold text-slate-300">{t(`statuses.${result.booking.status}`, result.booking.status)}</p>
            </div>
          </div>
        )}

        <div className="mt-8 text-center relative z-10">
          <button
            onClick={() => navigate("/", { replace: true })}
            className="rounded-xl bg-cyan-600 px-6 py-3.5 font-bold text-white transition-all duration-300 hover:bg-cyan-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
          >
            {t("booking.verify_page.return_home")}
          </button>
        </div>
      </div>
    </div>
  );
}
