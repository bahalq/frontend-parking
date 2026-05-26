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
    <div className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">{t("booking.verify_page.title")}</h1>
          <p className="mt-3 text-zinc-400">
            {loading ? t("booking.verify_page.verifying") : result.message}
          </p>
        </div>

        {!loading && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-medium ${
              result.success
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            {result.success ? t("booking.verify_page.confirmed") : result.message}
          </div>
        )}

        {result.booking && (
          <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
            <div>
              <p className="text-sm text-zinc-500">{t("booking.verify_page.reference")}</p>
              <p className="font-mono text-lg font-semibold">{result.booking.reference}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">{t("booking.verify_page.complex")}</p>
              <p className="text-lg font-semibold">{result.booking.ground_name}</p>
              <p className="text-sm text-zinc-400">{result.booking.terrain_name}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-zinc-500">{t("date")}</p>
                <p className="font-medium">{result.booking.date}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">{t("time")}</p>
                <p className="font-medium">
                  {result.booking.start_time?.substring(0, 5)} - {result.booking.end_time?.substring(0, 5)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-zinc-500">{t("booking.verify_page.status")}</p>
              <p className="font-medium">{t(`statuses.${result.booking.status}`, result.booking.status)}</p>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/", { replace: true })}
            className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-500"
          >
            {t("booking.verify_page.return_home")}
          </button>
        </div>
      </div>
    </div>
  );
}
