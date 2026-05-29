import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SiGooglemaps } from "react-icons/si";
import { getGroundImages, getImageUrl } from "../utils/imageUrl";
import { HOME_IMAGE_URL } from "../utils/publicAsset";

export default function GroundCard({ ground, price }) {
  const { t } = useTranslation();
  const groundImages = getGroundImages(ground);

  return (
    <div className="glass-panel rounded-xl overflow-hidden shadow-2xl relative group interactive-spring transition-all duration-300">
      {/* Decorative Cyan Corner Overlay */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-500/10 to-transparent pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 z-10"></div>

      <div className="relative overflow-hidden h-44">
        <img
          src={getImageUrl(groundImages[0]) || HOME_IMAGE_URL}
          alt={ground.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = HOME_IMAGE_URL;
          }}
        />
        {/* Shutter Gradient on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
      </div>

      <div className="p-5 flex flex-col gap-3 relative z-20">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xl font-bold text-white tracking-tight leading-snug group-hover:text-cyan-400 transition-colors">
            {ground.name}
          </h3>
          <abbr title={t("viewOnMap")}>
            <a
              href={`https://www.google.com/maps?q=${ground.latitude},${ground.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition-colors text-xl p-1 bg-slate-900/60 rounded-lg border border-slate-800"
            >
              <SiGooglemaps />
            </a>
          </abbr>
        </div>

        <p className="text-sm text-slate-400 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {ground.city}
        </p>

        <p className="text-sm font-semibold text-slate-300">
          {t("pricePerHour")}: <span className="text-cyan-400 text-base">{ground.min_price > 0 ? `${ground.min_price} ${t("booking.currency")}` : t("contact_for_price")}</span>
        </p>

        <Link
          to={`/grounds/${ground.id}`}
          className="mt-2 bg-cyan-600/90 text-white text-center py-2.5 rounded-xl font-bold transition-all duration-300 hover:bg-cyan-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] tracking-wide"
        >
          {t("bookNow")}
        </Link>
      </div>
    </div>
  );
}
