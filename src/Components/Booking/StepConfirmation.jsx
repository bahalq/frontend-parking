import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../services/api";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import Swal from "../../utils/swal";

const FLOW_COPY = {
  en: {
    confirmedEmailNotice:
      "Your reference and QR code have been sent to {{email}}.",
    codeStepTitle: "Enter the 6-digit code",
    codeStepText:
      "We sent a verification code to {{email}}. Enter it below to finish confirming your booking.",
    codeLabel: "Verification code",
    codePlaceholder: "000000",
    codeExpiryNotice: "This code expires at {{time}}.",
    codeInvalid: "Please enter the 6-digit code from your email.",
    confirmCode: "Confirm Code",
    confirmingCode: "Confirming...",
    resendCode: "Resend Code",
    resendingCode: "Resending...",
    codeResent: "A new code has been sent to your email.",
  },
  fr: {
    confirmedEmailNotice:
      "Votre reference et votre QR code ont ete envoyes a {{email}}.",
    codeStepTitle: "Entrez le code a 6 chiffres",
    codeStepText:
      "Nous avons envoye un code de verification a {{email}}. Saisissez-le ci-dessous pour finaliser la confirmation de votre reservation.",
    codeLabel: "Code de verification",
    codePlaceholder: "000000",
    codeExpiryNotice: "Ce code expire a {{time}}.",
    codeInvalid: "Veuillez saisir le code a 6 chiffres recu par e-mail.",
    confirmCode: "Confirmer le code",
    confirmingCode: "Confirmation...",
    resendCode: "Renvoyer le code",
    resendingCode: "Renvoi...",
    codeResent: "Un nouveau code a ete envoye a votre e-mail.",
  },
  ar: {
    confirmedEmailNotice: "تم إرسال المرجع ورمز QR إلى {{email}}.",
    codeStepTitle: "أدخل الرمز المكون من 6 أرقام",
    codeStepText:
      "أرسلنا رمز تحقق إلى {{email}}. أدخله أدناه لإكمال تأكيد الحجز.",
    codeLabel: "رمز التحقق",
    codePlaceholder: "000000",
    codeExpiryNotice: "تنتهي صلاحية هذا الرمز عند {{time}}.",
    codeInvalid: "يرجى إدخال الرمز المكون من 6 أرقام من بريدك الإلكتروني.",
    confirmCode: "تأكيد الرمز",
    confirmingCode: "جارٍ التأكيد...",
    resendCode: "إعادة إرسال الرمز",
    resendingCode: "جارٍ إعادة الإرسال...",
    codeResent: "تم إرسال رمز جديد إلى بريدك الإلكتروني.",
  },
};

function formatExpiry(expiresAt, language) {
  if (!expiresAt) {
    return "";
  }

  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(language || "en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function StepConfirmation({ data, prevStep, ground }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = ["fr", "en", "ar"].includes(i18n.language?.slice(0, 2))
    ? i18n.language.slice(0, 2)
    : "en";
  const flowCopy = FLOW_COPY[lang];
  const [phase, setPhase] = useState("review");
  const [bookingId, setBookingId] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [resendNotice, setResendNotice] = useState("");
  const [isResending, setIsResending] = useState(false);

  const handleCreateBooking = () => {
    setResendNotice("");
    setPhase("creating");

    api
      .createBooking({
        terrain_id: data.terrainId,
        date: data.date,
        start_time: data.timeSlot,
        client_first_name: data.client.firstName,
        client_last_name: data.client.lastName,
        client_email: data.client.email,
        client_phone: data.client.phone,
        client_cin: data.client.cin,
        license_plate: data.client.licensePlate, // Added license_plate support
      })
      .then((res) => {
        if (res.success && res.pending_confirmation) {
          setBookingId(res.booking_id);
          setExpiresAt(res.confirmation_code_expires_at || "");
          setConfirmationCode("");
          setPhase("awaiting_code");
          return;
        }

        setPhase("review");
        showError(res.message || t("errors.server_error"));
      })
      .catch(() => {
        setPhase("review");
        showError(t("errors.server_error"));
      });
  };

  const handleConfirmCode = () => {
    const normalizedCode = confirmationCode.replace(/\D/g, "").slice(0, 6);

    if (normalizedCode.length !== 6) {
      showError(flowCopy.codeInvalid);
      return;
    }

    setResendNotice("");
    setPhase("confirming");

    api
      .confirmBookingByCode(bookingId, normalizedCode)
      .then((res) => {
        if (res.success) {
          showSuccess();
          return;
        }

        setPhase("awaiting_code");
        showError(res.message || t("errors.server_error"));
      })
      .catch(() => {
        setPhase("awaiting_code");
        showError(t("errors.server_error"));
      });
  };

  const handleResendCode = () => {
    if (!bookingId) {
      return;
    }

    setResendNotice("");
    setIsResending(true);

    api
      .resendConfirmationCode(bookingId)
      .then((res) => {
        if (res.success) {
          setExpiresAt(res.confirmation_code_expires_at || "");
          setResendNotice(flowCopy.codeResent);
          return;
        }

        showError(res.message || t("errors.server_error"));
      })
      .catch(() => {
        showError(t("errors.server_error"));
      })
      .finally(() => setIsResending(false));
  };

  const isSubmitting = phase === "creating" || phase === "confirming";
  const expiryLabel = formatExpiry(expiresAt, i18n.language);
  const swalBase = {
    background: "#09090b",
    color: "#fff",
    confirmButtonColor: "#06b6d4",
    customClass: { popup: lang === "ar" ? "text-right" : "text-left" },
  };

  const showError = (message) => {
    Swal.fire({
      ...swalBase,
      icon: "error",
      title: lang === "ar" ? "خطأ" : lang === "fr" ? "Erreur" : "Error",
      text: message,
      confirmButtonText: "OK",
    });
  };

  const showSuccess = () => {
    Swal.fire({
      ...swalBase,
      icon: "success",
      title: t("booking.confirmed_title"),
      text: flowCopy.confirmedEmailNotice.replace("{{email}}", data.client.email),
      confirmButtonText: t("booking.return_home"),
    }).then(() => navigate("/"));
  };

  return (
    <div className="relative">
      <h2 className="text-xl font-extrabold text-white tracking-tight mb-6 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-cyan-500 rounded-full"></span>
        {t("booking.review_title")}
      </h2>

      <div className="mb-6 space-y-4 rounded-xl bg-slate-950/65 border border-slate-800 p-6 shadow-md">
        <div className="flex justify-between border-b border-slate-800/80 pb-3 text-sm">
          <span className="text-slate-400 font-medium">{t("booking.ground")}</span>
          <span className="font-semibold text-white">{ground.name}</span>
        </div>
        <div className="flex justify-between border-b border-slate-800/80 pb-3 text-sm">
          <span className="text-slate-400 font-medium">{t("booking.steps.date")}</span>
          <span className="font-semibold text-white">{data.date}</span>
        </div>
        <div className="flex justify-between border-b border-slate-800/80 pb-3 text-sm">
          <span className="text-slate-400 font-medium">{t("booking.steps.time")}</span>
          <span className="font-semibold text-white">{data.timeSlot}</span>
        </div>
        <div className="flex justify-between border-b border-slate-800/80 pb-3 text-sm">
          <span className="text-slate-400 font-medium">{t("booking.total_price")}</span>
          <span className="text-base font-extrabold text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.2)]">
            {data.terrainPrice} {t("booking.currency")}
          </span>
        </div>
        <div className="pt-3">
          <span className="mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase">{t("client")}</span>
          <span className="block font-bold text-white text-base">
            {data.client.firstName} {data.client.lastName}
          </span>
          <span className="block text-sm text-slate-300 mt-1.5">
            {t("booking.license_plate") || "License Plate"}: <span className="font-mono text-cyan-400 font-bold bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-500/10 ml-1">{data.client.licensePlate}</span>
          </span>
          <span className="block text-xs text-slate-500 mt-1 font-medium">
            {data.client.email}
          </span>
        </div>
      </div>

      {phase === "awaiting_code" && (
        <div className="mb-6 rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none"></div>
          <h3 className="mb-2 text-lg font-bold text-white tracking-tight relative z-10">
            {flowCopy.codeStepTitle}
          </h3>
          <p className="mb-4 text-sm leading-relaxed text-slate-300 relative z-10">
            {flowCopy.codeStepText.replace("{{email}}", data.client.email)}
          </p>

          <label className="mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase relative z-10">
            {flowCopy.codeLabel}
          </label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={confirmationCode}
            onChange={(e) =>
              setConfirmationCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder={flowCopy.codePlaceholder}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 relative z-10"
          />

          {expiryLabel && (
            <p className="mt-3 text-xs text-cyan-300/80 font-medium relative z-10">
              {flowCopy.codeExpiryNotice.replace("{{time}}", expiryLabel)}
            </p>
          )}

          {resendNotice && (
            <p className="mt-3 text-sm text-cyan-300 font-semibold relative z-10">{resendNotice}</p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row relative z-10">
            <button
              onClick={handleConfirmCode}
              disabled={isSubmitting}
              className="rounded-xl bg-cyan-600 px-6 py-3 font-bold text-white hover:bg-cyan-500 transition-all duration-300 disabled:opacity-50 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              {phase === "confirming"
                ? flowCopy.confirmingCode
                : flowCopy.confirmCode}
            </button>
            <button
              onClick={handleResendCode}
              disabled={isSubmitting || isResending}
              className="rounded-xl border border-slate-800 px-6 py-3 font-semibold text-slate-300 hover:bg-slate-900 transition-colors disabled:opacity-50"
            >
              {isResending ? flowCopy.resendingCode : flowCopy.resendCode}
            </button>
          </div>
        </div>
      )}

      {phase === "review" || phase === "creating" ? (
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={prevStep}
            className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors font-medium text-sm"
            disabled={isSubmitting}
          >
            {i18n.language === "ar" ? <HiArrowRight size={18} /> : <HiArrowLeft size={18} />}{" "}
            {t("booking.back")}
          </button>
          <button
            onClick={handleCreateBooking}
            disabled={isSubmitting}
            className="rounded-xl bg-cyan-600 px-8 py-3.5 font-bold text-white hover:bg-cyan-500 transition-all duration-300 disabled:opacity-50 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            {phase === "creating"
              ? t("booking.processing")
              : t("booking.confirm_booking")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
