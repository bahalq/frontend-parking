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
    <div className="flex gap-1.5 animate-fade-in" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          onClick={() => interactive && setRating(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          disabled={!interactive}
          className={`text-3xl transition-transform ${
            interactive ? "cursor-pointer hover:scale-115 active:scale-95" : "cursor-default"
          } ${
            star <= (interactive ? (hoverRating || rating) : rating)
              ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
              : "text-slate-700"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="glass-panel border-cyan-500/35 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-fade-in relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none"></div>
          <div className="text-cyan-400 text-5xl mb-4 drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">✓</div>
          <h3 className="text-2xl font-extrabold text-white tracking-tight mb-2">
            {t("feedback_success_title", "Thank You!")}
          </h3>
          <p className="text-slate-300 text-sm">
            {t("feedback_success_message", "Your feedback has been submitted successfully.")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="glass-panel border-cyan-500/30 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-hide animate-fade-in-up">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none"></div>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-cyan-400 text-2xl transition-colors font-bold"
        >
          ×
        </button>

        <h2 className="text-2xl font-extrabold text-white tracking-tight mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-cyan-500 rounded-full"></span>
          {t("feedback_title", "Share Your Feedback")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* Star Rating */}
          <div>
            <label className="block text-xs font-bold tracking-wider text-slate-500 uppercase mb-2">
              {t("feedback_rating_label", "Rating")} *
            </label>
            <StarRating interactive={true} />
            {rating === 0 && (
              <p className="text-red-400 text-xs mt-1">
                {t("feedback_rating_required", "Please select a rating")}
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-bold tracking-wider text-slate-500 uppercase mb-2">
              {t("feedback_message_label", "Your Feedback")} *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("feedback_message_placeholder", "Tell us about your experience...")}
              rows={4}
              className="w-full bg-slate-950/65 border border-slate-800 rounded-xl p-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300"
              required
              minLength={10}
            />
            <p className="text-slate-500 text-xs mt-1.5 font-medium">
              {message.length}/10 {t("feedback_min_chars", "minimum characters")}
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold tracking-wider text-slate-500 uppercase mb-2">
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
              className="w-full bg-slate-950/65 border border-slate-800 rounded-xl p-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300"
              maxLength={255}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-950/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || rating === 0}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-850 disabled:shadow-none text-white font-bold py-3.5 px-6 rounded-xl transition duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]"
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