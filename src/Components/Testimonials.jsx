import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { buildApiUrl } from "../config/api";

export default function Testimonials() {
  const { t } = useTranslation();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch(buildApiUrl("feedbacks"), {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "X-App-Locale": (i18n.language || "en").slice(0, 2),
        },
      });

      const data = await response.json();

      if (data.success) {
        setFeedbacks(data.feedbacks);
      } else {
        setError(data.message || "Failed to load testimonials");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ rating }) => (
    <div className="flex gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-lg ${
            star <= rating ? "text-yellow-400" : "text-gray-600"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );

  if (loading) {
    return (
      <section className="py-16 bg-zinc-950">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-12">
            {t("testimonials_title", "What Our Drivers Say")}
          </h2>
          <div className="flex justify-center items-center h-40">
            <div className="text-green-500 text-xl animate-pulse">
              {t("loading", "Loading...")}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-zinc-950">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-12">
            {t("testimonials_title", "What Our Drivers Say")}
          </h2>
          <p className="text-red-400">{error}</p>
        </div>
      </section>
    );
  }

  if (feedbacks.length === 0) {
    return null; // Don't show section if no feedbacks yet
  }

  return (
    <section className="py-16 bg-zinc-950">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">
          {t("testimonials_title", "What Our Drivers Say")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className="bg-zinc-900 rounded-xl p-6 shadow-lg border border-zinc-800 hover:border-green-500/50 transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Star Rating */}
              <div className="mb-4">
                <StarRating rating={feedback.rating} />
              </div>

              {/* Message */}
              <p className="text-gray-300 mb-4 line-clamp-4">
                "{feedback.message}"
              </p>

              {/* User Info */}
              <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                <div>
                  <p className="text-green-400 font-semibold">
                    {feedback.name || t("anonymous", "Anonymous")}
                  </p>
                  {feedback.ground_name && (
                    <p className="text-gray-500 text-sm">
                      {t("at_ground", "at")} {feedback.ground_name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}