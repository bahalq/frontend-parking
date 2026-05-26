import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FcNext, FcPrevious } from "react-icons/fc";
import { getImageUrl } from "../utils/imageUrl";
import { HOME_IMAGE_URL } from "../utils/publicAsset";

export default function ImageCarousel({ images, details }) {
  const { t, i18n } = useTranslation();
  const [index, setIndex] = useState(0);
  const currentImage = images?.[index];

  if (!images || images.length === 0) {
    return (
      <div className="h-40 bg-gray-800 flex items-center justify-center text-gray-400">
        {t("no_images")}
      </div>
    );
  }

  const prev = () => {
    setIndex((index - 1 + images.length) % images.length);
  };

  const next = () => {
    setIndex((index + 1) % images.length);
  };

  const isRtl = i18n.language === "ar";

  return (
    <div className="relative overflow-hidden rounded">
      <img
        src={getImageUrl(currentImage) || HOME_IMAGE_URL}
        alt="ground"
        className={
          !details
            ? "h-52 w-full object-cover sm:h-60"
            : "h-100 m-auto object-cover rounded"
        }
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = HOME_IMAGE_URL;
        }}
      />

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute start-2 top-1/2 -translate-y-1/2 text-white px-2 rounded hover:bg-black/20 transition-colors"
          >
            {isRtl ? (
              <FcNext className="text-2xl cursor-pointer" />
            ) : (
              <FcPrevious className="text-2xl cursor-pointer" />
            )}
          </button>
          <button
            onClick={next}
            className="absolute end-2 top-1/2 -translate-y-1/2 text-white px-2 rounded hover:bg-black/20 transition-colors"
          >
            {isRtl ? (
              <FcPrevious className="text-2xl cursor-pointer" />
            ) : (
              <FcNext className="text-2xl cursor-pointer" />
            )}
          </button>
        </>
      )}
    </div>
  );
}
