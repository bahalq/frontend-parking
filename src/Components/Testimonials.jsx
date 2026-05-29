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
      <section className="py-24 bg-black/40 border-t border-slate-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            {t("testimonials_title", "What Our Drivers Say")}
          </h2>
          <div className="h-1.5 w-20 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto rounded-full mb-12"></div>
          <div className="flex justify-center items-center h-40">
            <div className="text-cyan-500 text-xl animate-pulse">
              {t("loading", "Loading...")}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 bg-black/40 border-t border-slate-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            {t("testimonials_title", "What Our Drivers Say")}
          </h2>
          <div className="h-1.5 w-20 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto rounded-full mb-12"></div>
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      </section>
    );
  }

  if (feedbacks.length === 0) {
    return null; // Don't show section if no feedbacks yet
  }

  return (
    <section className="py-24 bg-black/40 relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            {t("testimonials_title", "What Our Drivers Say")}
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {feedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className="glass-panel rounded-xl p-6 shadow-xl relative overflow-hidden group hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 z-0"></div>
              {/* Star Rating */}
              <div className="mb-4 relative z-10">
                <StarRating rating={feedback.rating} />
              </div>

              {/* Message */}
              <p className="text-slate-300 mb-5 line-clamp-4 leading-relaxed text-sm relative z-10 font-medium">
                "{feedback.message}"
              </p>

              {/* User Info */}
              <div className="flex items-center justify-between border-t border-slate-900 pt-4 relative z-10">
                <div>
                  <p className="text-cyan-400 font-extrabold tracking-wide text-sm">
                    {feedback.name || t("anonymous", "Anonymous")}
                  </p>
                  {feedback.ground_name && (
                    <p className="text-slate-500 text-xs font-semibold mt-0.5">
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