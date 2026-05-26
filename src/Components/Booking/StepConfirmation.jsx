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
    background: "#18181b",
    color: "#fff",
    confirmButtonColor: "#16a34a",
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
    <div>
      <h2 className="mb-4 text-xl font-bold">{t("booking.review_title")}</h2>

      <div className="mb-6 space-y-3 rounded-lg bg-zinc-900 p-6">
        <div className="flex justify-between border-b border-zinc-700 pb-2">
          <span className="text-gray-400">{t("booking.ground")}</span>
          <span>{ground.name}</span>
        </div>
        <div className="flex justify-between border-b border-zinc-700 pb-2">
          <span className="text-gray-400">{t("booking.steps.date")}</span>
          <span>{data.date}</span>
        </div>
        <div className="flex justify-between border-b border-zinc-700 pb-2">
          <span className="text-gray-400">{t("booking.steps.time")}</span>
          <span>{data.timeSlot}</span>
        </div>
        <div className="flex justify-between border-b border-zinc-700 pb-2">
          <span className="text-gray-400">{t("booking.total_price")}</span>
          <span className="text-lg font-bold text-green-400">
            {data.terrainPrice} {t("booking.currency")}
          </span>
        </div>
        <div className="pt-2">
          <span className="mb-1 block text-gray-400">{t("client")}</span>
          <span className="block font-medium">
            {data.client.firstName} {data.client.lastName}
          </span>
          <span className="block text-sm text-zinc-300">
            {t("booking.license_plate") || "License Plate"}: <span className="font-mono text-green-400 font-bold">{data.client.licensePlate}</span>
          </span>
          <span className="block text-sm text-gray-500">
            {data.client.email}
          </span>
        </div>
      </div>

      {phase === "awaiting_code" && (
        <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-5">
          <h3 className="mb-2 text-lg font-semibold text-white">
            {flowCopy.codeStepTitle}
          </h3>
          <p className="mb-4 text-sm leading-6 text-zinc-300">
            {flowCopy.codeStepText.replace("{{email}}", data.client.email)}
          </p>

          <label className="mb-2 block text-sm font-medium text-zinc-200">
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
            className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] text-white outline-none transition focus:border-emerald-400"
          />

          {expiryLabel && (
            <p className="mt-3 text-sm text-emerald-200/90">
              {flowCopy.codeExpiryNotice.replace("{{time}}", expiryLabel)}
            </p>
          )}

          {resendNotice && (
            <p className="mt-3 text-sm text-emerald-300">{resendNotice}</p>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleConfirmCode}
              disabled={isSubmitting}
              className="rounded-lg bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-500 disabled:opacity-50"
            >
              {phase === "confirming"
                ? flowCopy.confirmingCode
                : flowCopy.confirmCode}
            </button>
            <button
              onClick={handleResendCode}
              disabled={isSubmitting || isResending}
              className="rounded-lg border border-zinc-600 px-6 py-3 font-semibold text-zinc-200 hover:border-zinc-500 hover:text-white disabled:opacity-50"
            >
              {isResending ? flowCopy.resendingCode : flowCopy.resendCode}
            </button>
          </div>
        </div>
      )}

      {phase === "review" || phase === "creating" ? (
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            className="flex items-center gap-2 text-gray-400 hover:text-white"
            disabled={isSubmitting}
          >
            {i18n.language === "ar" ? <HiArrowRight /> : <HiArrowLeft />}{" "}
            {t("booking.back")}
          </button>
          <button
            onClick={handleCreateBooking}
            disabled={isSubmitting}
            className="rounded bg-green-600 px-8 py-3 font-bold hover:bg-green-500 disabled:opacity-50"
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
