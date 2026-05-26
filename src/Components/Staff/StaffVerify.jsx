import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useTranslation } from "react-i18next";
import {
  HiOutlineCamera,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiXCircle,
} from "react-icons/hi";
import { api } from "../../services/api";
import StaffBookingDetails from "./StaffBookingDetails";

function extractToken(value) {
  const rawValue = (value || "").trim();

  if (!rawValue) {
    return "";
  }

  const directMatch = rawValue.match(/\b[a-f0-9]{64}\b/i);
  if (directMatch) {
    return directMatch[0];
  }

  try {
    const url = new URL(rawValue);
    const searchToken = url.searchParams.get("token");
    if (searchToken) {
      return searchToken;
    }

    const hash = url.hash || "";
    const hashQuery = hash.includes("?") ? hash.split("?")[1] : "";
    const hashParams = new URLSearchParams(hashQuery);
    return hashParams.get("token") || "";
  } catch {
    return "";
  }
}

export default function StaffVerify() {
  const { t, i18n } = useTranslation();
  const scannerRef = useRef(null);
  const scanLockRef = useRef(false);
  const [mode, setMode] = useState("qr");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [scannerNonce, setScannerNonce] = useState(0);
  const [scannerError, setScannerError] = useState("");
  const lang = ["fr", "en", "ar"].includes(i18n.language?.slice(0, 2))
    ? i18n.language.slice(0, 2)
    : "en";
  const scannerId = `staff-qr-reader-${scannerNonce}`;

  const verifyResponseToState = (data) => ({
    success: !!data?.success,
    status: data?.status || data?.booking?.status || "Invalid",
    message: data?.message || "",
    booking: data?.booking || null,
  });

  const buildRequestErrorState = () => ({
    success: false,
    status: "NetworkError",
    message: t("errors.server_error"),
    booking: null,
  });

  const verifyByToken = async (token) => {
    setLoading(true);
    setScannerError("");

    try {
      const data = await api.staffVerifyBookingByToken(token);
      const nextResult = verifyResponseToState(data);
      setResult(nextResult);
      return nextResult;
    } catch {
      const nextResult = buildRequestErrorState();
      setResult(nextResult);
      return nextResult;
    } finally {
      setLoading(false);
    }
  };

  const verifyByReference = async (event) => {
    event.preventDefault();

    if (!reference.trim()) {
      return;
    }

    setLoading(true);
    setResult(null);
    setScannerError("");

    try {
      const data = await api.staffVerifyTicket(reference.trim().toUpperCase());
      setResult(verifyResponseToState(data));
    } catch {
      setResult(buildRequestErrorState());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode !== "qr") {
      return undefined;
    }

    scanLockRef.current = false;
    setScannerError("");

    const scanner = new Html5QrcodeScanner(
      scannerId,
      {
        fps: 10,
        qrbox: { width: 220, height: 220 },
        rememberLastUsedCamera: true,
      },
      false,
    );

    scanner.render(
      async (decodedText) => {
        if (scanLockRef.current) {
          return;
        }

        const token = extractToken(decodedText);
        if (!token) {
          scanLockRef.current = false;
          setScannerError(t("staff.invalid_qr"));
          setResult({
            success: false,
            status: "InvalidQRCode",
            message: t("staff.invalid_qr"),
            booking: null,
          });
          return;
        }

        scanLockRef.current = true;

        try {
          const nextResult = await verifyByToken(token);
          const hasValidBookingResult = !!nextResult?.booking;

          if (hasValidBookingResult) {
            await scanner.clear();
            return;
          }
        } catch {
          setScannerError(t("errors.server_error"));
        }

        scanLockRef.current = false;
      },
      () => {},
    );

    scannerRef.current = scanner;

    return () => {
      scanLockRef.current = false;
      const activeScanner = scannerRef.current;
      scannerRef.current = null;

      if (activeScanner) {
        activeScanner.clear().catch(() => {});
      }
    };
  }, [mode, scannerId, t]);

  const resetScanner = () => {
    setResult(null);
    setScannerError("");
    setScannerNonce((current) => current + 1);
  };

  return (
    <div className="min-h-screen text-white">
      <div className="pt-[10vh] pb-20 px-4 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 rounded-[28px] border border-white/10 bg-zinc-900/70 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300/80">
              {t("brand")}
            </p>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
              {t("staff.verify")}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
              {t("staff.subtitle")}
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-zinc-900/70 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-6">
            <div className="mb-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode("qr")}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  mode === "qr"
                    ? "border-emerald-400/40 bg-emerald-500/15 text-white"
                    : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                }`}
              >
                {t("staff.scan_qr")}
              </button>
              <button
                type="button"
                onClick={() => setMode("reference")}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  mode === "reference"
                    ? "border-emerald-400/40 bg-emerald-500/15 text-white"
                    : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                }`}
              >
                {t("staff.enter_reference")}
              </button>
            </div>

            {mode === "qr" && (
              <div className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                      <HiOutlineCamera className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">
                        {t("staff.scan_qr")}
                      </h2>
                      <p className="text-xs text-zinc-400">
                        {t("staff.scan_hint")}
                      </p>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-black">
                    <div className="pointer-events-none absolute top-3 left-3 z-10 h-7 w-7 rounded-tl-lg border-t-2 border-l-2 border-emerald-400" />
                    <div className="pointer-events-none absolute top-3 right-3 z-10 h-7 w-7 rounded-tr-lg border-t-2 border-r-2 border-emerald-400" />
                    <div className="pointer-events-none absolute bottom-3 left-3 z-10 h-7 w-7 rounded-bl-lg border-b-2 border-l-2 border-emerald-400" />
                    <div className="pointer-events-none absolute bottom-3 right-3 z-10 h-7 w-7 rounded-br-lg border-b-2 border-r-2 border-emerald-400" />
                    <div id={scannerId} className="w-full" />
                  </div>

                  {scannerError && (
                    <div className="mt-4 flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                      <HiXCircle className="h-5 w-5 shrink-0 text-red-400" />
                      <p className="text-sm text-red-200">{scannerError}</p>
                    </div>
                  )}

                  {result?.booking && (
                    <button
                      type="button"
                      onClick={resetScanner}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 py-3.5 text-sm font-bold text-emerald-300 transition hover:bg-emerald-500/20 active:scale-95"
                    >
                      <HiOutlineRefresh className="h-5 w-5" />
                      {t("staff.scan_again")}
                    </button>
                  )}
                </div>
              </div>
            )}

            {mode === "reference" && (
              <form onSubmit={verifyByReference} className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-4">
                  <div className="mb-4 flex items-center gap-3 text-zinc-200">
                    <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-300">
                      <HiOutlineSearch className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">
                        {t("staff.enter_reference")}
                      </h2>
                      <p className="text-sm text-zinc-400">
                        {t("staff.reference_help")}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      value={reference}
                      onChange={(event) =>
                        setReference(event.target.value.toUpperCase())
                      }
                      placeholder={t("staff.reference_placeholder")}
                      className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-4 font-mono text-base text-white outline-none transition focus:border-emerald-400"
                      dir="ltr"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                    >
                      {t("staff.verify_btn")}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {loading && (
              <div className="mt-5 flex items-center justify-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-5 py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
                <span className="text-sm font-medium text-zinc-300">
                  {t("staff.loading")}
                </span>
              </div>
            )}

            {result ? (
              <div className="mt-6">
                <StaffBookingDetails
                  booking={result.booking}
                  status={result.status}
                  message={result.message}
                  language={lang}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
