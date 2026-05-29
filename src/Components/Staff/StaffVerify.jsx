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
import StaffLayout from "../Layouts/StaffLayout";

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
    <StaffLayout>
      <div className="space-y-6">
        {/* Verification Title */}
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-emerald font-mono">
            {t("brand", "ParkSmart Gatekeeper")}
          </p>
          <h1 className="mt-2 text-2xl font-black bg-gradient-to-r from-brand-emerald to-brand-cyan bg-clip-text text-transparent uppercase tracking-wider">
            {t("staff.verify", "Reservation Validation")}
          </h1>
          <p className="mt-2 text-xs leading-5 text-zinc-400 font-medium">
            {t("staff.subtitle", "Scan the booking QR code or enter the reference manually to verify reservation details instantly.")}
          </p>
        </div>

        {/* Validator Controls */}
        <div className="glass-panel p-5 rounded-3xl">
          <div className="mb-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode("qr")}
              className={`rounded-2xl border py-3.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                mode === "qr"
                  ? "border-brand-emerald/40 bg-brand-emerald/15 text-white shadow-glass-emerald"
                  : "border-white/5 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-900"
              }`}
            >
              {t("staff.scan_qr", "QR Scan Camera")}
            </button>
            <button
              type="button"
              onClick={() => setMode("reference")}
              className={`rounded-2xl border py-3.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                mode === "reference"
                  ? "border-brand-emerald/40 bg-brand-emerald/15 text-white shadow-glass-emerald"
                  : "border-white/5 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-900"
              }`}
            >
              {t("staff.enter_reference", "Keyboard Input")}
            </button>
          </div>

          {mode === "qr" && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-zinc-950/60 p-4 border border-white/5">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-emerald/15 text-brand-emerald">
                    <HiOutlineCamera className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                      {t("staff.scan_qr", "QR Code Reader")}
                    </h2>
                    <p className="text-[11px] text-zinc-500 font-medium">
                      {t("staff.scan_hint", "Use device camera to focus on the driver's QR ticket.")}
                    </p>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-black">
                  <div className="pointer-events-none absolute top-4 left-4 z-10 h-6 w-6 rounded-tl-md border-t-2 border-l-2 border-brand-emerald animate-pulse" />
                  <div className="pointer-events-none absolute top-4 right-4 z-10 h-6 w-6 rounded-tr-md border-t-2 border-r-2 border-brand-emerald animate-pulse" />
                  <div className="pointer-events-none absolute bottom-4 left-4 z-10 h-6 w-6 rounded-bl-md border-b-2 border-l-2 border-brand-emerald animate-pulse" />
                  <div className="pointer-events-none absolute bottom-4 right-4 z-10 h-6 w-6 rounded-br-md border-b-2 border-r-2 border-brand-emerald animate-pulse" />
                  <div id={scannerId} className="w-full text-zinc-400" />
                </div>

                {scannerError && (
                  <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3">
                    <HiXCircle className="h-5 w-5 shrink-0 text-red-400" />
                    <p className="text-xs font-semibold text-red-200">{scannerError}</p>
                  </div>
                )}

                {result?.booking && (
                  <button
                    type="button"
                    onClick={resetScanner}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-brand-emerald/30 bg-brand-emerald/10 py-3.5 text-xs font-extrabold uppercase tracking-widest text-brand-emerald hover:bg-brand-emerald/20 transition-all duration-300 active:scale-98 cursor-pointer"
                  >
                    <HiOutlineRefresh className="h-4 w-4" />
                    {t("staff.scan_again", "Scan Next Code")}
                  </button>
                )}
              </div>
            </div>
          )}

          {mode === "reference" && (
            <form onSubmit={verifyByReference} className="space-y-4">
              <div className="rounded-2xl bg-zinc-950/60 p-4 border border-white/5">
                <div className="mb-4 flex items-center gap-3 text-zinc-200">
                  <div className="rounded-xl bg-brand-emerald/15 p-3 text-brand-emerald">
                    <HiOutlineSearch className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                      {t("staff.enter_reference", "Enter Reference")}
                    </h2>
                    <p className="text-[11px] text-zinc-500 font-medium">
                      {t("staff.reference_help", "Type booking reference exactly as printed on the email receipt.")}
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
                    placeholder={t("staff.reference_placeholder", "PRK-XXXXXXXX")}
                    className="w-full rounded-2xl border border-white/5 bg-zinc-900 px-4 py-3.5 font-mono text-sm text-white outline-none focus:outline-none focus:border-brand-emerald/60 focus:ring-2 focus:ring-brand-emerald/20 transition-all duration-300"
                    dir="ltr"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-2xl bg-brand-emerald text-zinc-950 px-6 py-3.5 text-xs font-extrabold uppercase tracking-wider hover:bg-emerald-400 disabled:opacity-50 transition-all duration-300 cursor-pointer active:scale-95 flex-shrink-0"
                  >
                    {t("staff.verify_btn", "Verify")}
                  </button>
                </div>
              </div>
            </form>
          )}

          {loading && (
            <div className="mt-5 flex items-center justify-center gap-3 rounded-2xl border border-white/5 bg-zinc-900/40 py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-emerald/30 border-t-brand-emerald shadow-glass-emerald" />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono">
                {t("staff.loading", "Validating Account...")}
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
    </StaffLayout>
  );
}
