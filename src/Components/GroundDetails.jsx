import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import BookingStepper from "./Booking/BookingStepper";
import ImageCarousel from "./ImageCarousel";
import { api } from "../services/api";
import { SiGooglemaps } from "react-icons/si";
import { useTranslation } from "react-i18next";
import { getGroundImages } from "../utils/imageUrl";

export default function GroundDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [ground, setGround] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getGroundDetails(id)
      .then((data) => {
        if (data.success) setGround(data.ground);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="p-10 text-center text-white">
        {t("loading")}
      </div>
    );
  if (!ground)
    return (
      <div className="p-10 text-center text-red-500">{t("ground_not_found")}</div>
    );

  const groundImages = getGroundImages(ground);

  return (
    <div className="p-6 max-w-4xl mx-auto text-white">
      <ImageCarousel images={groundImages} details={true} />

      <div className="mt-6 mb-8">
        <h1 className="text-3xl font-bold">{ground.name}</h1>
        <div className="flex items-center gap-1 text-gray-400 mt-2">
          <span>{ground.city}</span>
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
        </div>
        <p className="text-gray-300 mt-4 leading-relaxed">
          {ground.description}
        </p>
      </div>

      <BookingStepper ground={ground} />
    </div>
  );
}
