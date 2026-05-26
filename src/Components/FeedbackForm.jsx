import { useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { buildApiUrl } from "../config/api";

export default function FeedbackForm({ onSuccess, onClose }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(buildApiUrl("feedbacks"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-App-Locale": (i18n.language || "en").slice(0, 2),
        },
        body: JSON.stringify({
          rating,
          message,
          name: name.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        if (onSuccess) onSuccess(data.feedback);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(data.message || "Failed to submit feedback");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ interactive = false }) => (
    <div className="flex gap-1" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          onClick={() => interactive && setRating(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          disabled={!interactive}
          className={`text-3xl transition-colors ${
            interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
          } ${
            star <= (interactive ? (hoverRating || rating) : rating)
              ? "text-yellow-400"
              : "text-gray-600"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-zinc-900 border border-green-500 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {t("feedback_success_title", "Thank You!")}
          </h3>
          <p className="text-gray-300">
            {t("feedback_success_message", "Your feedback has been submitted successfully.")}
          </p>
        </div>
      </div>
    );
  }

   return (
     <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
       <div className="bg-zinc-900 border border-green-500 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-hide">
         <button
           onClick={onClose}
           className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
         >
           ×
         </button>

        <h2 className="text-2xl font-bold text-white mb-6">
          {t("feedback_title", "Share Your Feedback")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div>
            <label className="block text-green-400 font-semibold mb-2">
              {t("feedback_rating_label", "Rating")} *
            </label>
            <StarRating interactive={true} />
            {rating === 0 && (
              <p className="text-red-400 text-sm mt-1">
                {t("feedback_rating_required", "Please select a rating")}
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block text-green-400 font-semibold mb-2">
              {t("feedback_message_label", "Your Feedback")} *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("feedback_message_placeholder", "Tell us about your experience...")}
              rows={4}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              minLength={10}
            />
            <p className="text-gray-500 text-sm mt-1">
              {message.length}/10 {t("feedback_min_chars", "minimum characters")}
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-green-400 font-semibold mb-2">
              {t("feedback_name_label", "Your Name")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t(
                "feedback_name_placeholder",
                i18n.language === "fr"
                  ? "Votre nom (optionnel)"
                  : "Your name (optional)"
              )}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              maxLength={255}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || rating === 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-lg"
          >
            {loading
              ? t("feedback_submitting", "Submitting...")
              : t("feedback_submit", "Submit Feedback")}
          </button>
        </form>
      </div>
    </div>
  );
}