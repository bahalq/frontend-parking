import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SiGooglemaps } from "react-icons/si";
import { getGroundImages, getImageUrl } from "../utils/imageUrl";
import { HOME_IMAGE_URL } from "../utils/publicAsset";

export default function GroundCard({ ground,price }) {
  const { t } = useTranslation();
  const groundImages = getGroundImages(ground);

  return (
    <div className="bg-zinc-900 rounded-lg overflow-hidden shadow">
      {/* Updated to support both 'image' string or 'images' array */}
      <img
        src={getImageUrl(groundImages[0]) || HOME_IMAGE_URL}
        alt={ground.name}
        className="h-40 w-full object-cover"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = HOME_IMAGE_URL;
        }}
      />

      <div className="p-4 text-white flex flex-col gap-2">
        <h3 className="text-lg font-bold">{ground.name}</h3>
        <p className="flex items-center gap-1">
          {ground.city}{" "}
          <abbr title={t("viewOnMap")}>
            <a
              href={`https://www.google.com/maps?q=${ground.latitude},${ground.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 "
            >
              <SiGooglemaps />
            </a>
          </abbr>
        </p>
        <p className="text-sm text-gray-400">
          {t("pricePerHour")}: {ground.min_price > 0 ? `${t('starting_from')} ${ground.min_price} ${t("booking.currency")}` : t("contact_for_price")} 
        </p>

        <Link
          to={`/grounds/${ground.id}`}
          className="mt-2 bg-green-600 text-center py-2 rounded hover:bg-green-700"
        >
          {t("bookNow")}
        </Link>
      </div>
    </div>
  );
}
