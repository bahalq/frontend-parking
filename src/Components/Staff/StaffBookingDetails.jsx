import { HiCheckCircle, HiExclamationCircle, HiXCircle } from "react-icons/hi";
import { useTranslation } from "react-i18next";

function getValue(...values) {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== "") {
      return value;
    }
  }

  return null;
}

function formatBookingDate(booking, language) {
  const formattedDate = getValue(booking?.formatted_date);
  if (formattedDate) {
    return formattedDate;
  }

  const rawDate = getValue(booking?.date);
  if (!rawDate) {
    return "—";
  }

  const parsed = new Date(`${rawDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return rawDate;
  }

  return new Intl.DateTimeFormat(language || "en", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsed);
}

function formatTimeRange(booking) {
  const start = getValue(booking?.start_time)?.toString().substring(0, 5);
  const end = getValue(booking?.end_time)?.toString().substring(0, 5);

  if (!start || !end) {
    return "—";
  }

  return `${start} - ${end}`;
}

function getStatusMeta(status, t) {
  switch (status) {
    case "Confirmed":
      return {
        label: t("staff.confirmed"),
        icon: (
          <HiCheckCircle className="h-20 w-20 text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.6)]" />
        ),
        wrapper: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
        badge: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
      };
    case "Pending":
      return {
        label: t("staff.pending"),
        icon: (
          <HiExclamationCircle className="h-20 w-20 text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]" />
        ),
        wrapper: "border-amber-500/30 bg-amber-500/10 text-amber-100",
        badge: "bg-amber-500/15 text-amber-300 border-amber-400/30",
      };
    case "Cancelled":
      return {
        label: t("staff.cancelled"),
        icon: (
          <HiXCircle className="h-20 w-20 text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]" />
        ),
        wrapper: "border-red-500/30 bg-red-500/10 text-red-200",
        badge: "bg-red-500/15 text-red-300 border-red-400/30",
      };
    case "Passed":
      return {
        label: t("staff.passed"),
        icon: (
          <HiExclamationCircle className="h-20 w-20 text-orange-400 drop-shadow-[0_0_20px_rgba(251,146,60,0.6)]" />
        ),
        wrapper: "border-orange-500/30 bg-orange-500/10 text-orange-100",
        badge: "bg-orange-500/15 text-orange-300 border-orange-400/30",
      };
    default:
      return {
        label: status || t("staff.invalid"),
        icon: (
          <HiXCircle className="h-20 w-20 text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]" />
        ),
        wrapper: "border-white/10 bg-white/5 text-white",
        badge: "bg-white/10 text-zinc-200 border-white/15",
      };
  }
}

function Field({ label, value, mono = false, dir }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
        {label}
      </p>
      <p
        className={`mt-2 text-base font-semibold ${mono ? "font-mono" : ""}`}
        dir={dir}
      >
        {value || "—"}
      </p>
    </div>
  );
}

export default function StaffBookingDetails({
  booking,
  status,
  message,
  language = "en",
  showStatusHero = true,
}) {
  const { t } = useTranslation();
  const rawStatus = getValue(status, booking?.status);
  const statusMeta = getStatusMeta(rawStatus, t);
  const fullName = [
    getValue(booking?.first_name, booking?.client_first_name),
    getValue(booking?.last_name, booking?.client_last_name),
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    <div className={`rounded-3xl border p-5 sm:p-6 ${statusMeta.wrapper}`}>
      {showStatusHero && (
        <div className="mb-4 flex flex-col items-center text-center">
          <div className="mb-4">{statusMeta.icon}</div>
          <div
            className={`mb-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest ${statusMeta.badge}`}
          >
            {statusMeta.label}
          </div>
          <h3 className="text-2xl font-black">{statusMeta.label}</h3>
          <p className="mt-2 text-sm text-white/70 max-w-sm">
            {message || t("staff.no_result")}
          </p>
        </div>
      )}

      {booking ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field
            label={t("status")}
            value={rawStatus || "—"}
            mono
            dir="ltr"
          />
          <Field label={t("client")} value={fullName} />
          <Field
            label={t("email")}
            value={getValue(booking.email, booking.client_email)}
          />
          <Field
            label="CIN"
            value={getValue(booking.cin, booking.client_cin)}
            dir="ltr"
          />
          <Field
            label={t("ground")}
            value={getValue(booking.ground_name)}
            dir="auto"
          />
          <Field
            label={t("booking.steps.terrain")}
            value={getValue(booking.terrain_name)}
            dir="auto"
          />
          <Field
            label={t("booking.steps.activity")}
            value={getValue(booking.activity_name)}
            dir="auto"
          />
          <Field
            label={t("date")}
            value={formatBookingDate(booking, language)}
          />
          <Field
            label={t("time")}
            value={formatTimeRange(booking)}
            mono
            dir="ltr"
          />
          <Field
            label={t("price")}
            value={
              getValue(booking.total_price, booking.price) !== null
                ? `${getValue(booking.total_price, booking.price)} MAD`
                : null
            }
            mono
            dir="ltr"
          />
        </div>
      ) : null}
    </div>
  );
}
