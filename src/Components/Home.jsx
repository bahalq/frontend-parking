import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import GroundsList from "./GroundsList";
import Testimonials from "./Testimonials";
import FeedbackForm from "./FeedbackForm";
import {
  FaCar,
  FaMotorcycle,
  FaChargingStation,
  FaTruck,
  FaCarSide,
  FaShuttleVan,
  FaWheelchair,
  FaClock,
  FaParking,
  FaCrown,
} from "react-icons/fa";
import { api } from "../services/api";

const heroBackground = "/smart_city_traffic.png";

const analyzeIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 text-cyan-400 mb-4 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
    />
  </svg>
);

const reserveIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 text-cyan-400 mb-4 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const verifyIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 text-cyan-400 mb-4 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

export default function Home({ isLogin, role }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  useEffect(() => {
    document.body.style.fontFamily = i18n.language === "ar" ? "Cairo" : "Outfit, Inter";
  }, [i18n.language]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await api.getActivities();
        if (data.success) {
          setActivities(data.activities || []);
        }
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setLoadingActivities(false);
      }
    };
    fetchActivities();
  }, []);

  const getActivityIcon = (activityName) => {
    const iconMap = {
      Football: <FaCar className="w-10 h-10 text-cyan-400 mb-2 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" />,
      Tennis: <FaMotorcycle className="w-10 h-10 text-cyan-400 mb-2 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" />,
      Basketball: <FaChargingStation className="w-10 h-10 text-cyan-400 mb-2 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" />,
      Volleyball: <FaShuttleVan className="w-10 h-10 text-cyan-400 mb-2 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" />,
      Handball: <FaCarSide className="w-10 h-10 text-cyan-400 mb-2 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" />,
      Badminton: <FaWheelchair className="w-10 h-10 text-cyan-400 mb-2 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" />,
      Swimming: <FaTruck className="w-10 h-10 text-cyan-400 mb-2 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" />,
      "Table Tennis": <FaClock className="w-10 h-10 text-cyan-400 mb-2 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" />,
      Padel: <FaCrown className="w-10 h-10 text-cyan-400 mb-2 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" />,
    };
    return iconMap[activityName] || <FaParking className="w-10 h-10 text-cyan-400 mb-2" />;
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-200 grid-bg shroud-cyber overflow-x-hidden">
      {/* Hero Section */}
      <section
        className="relative h-screen bg-cover bg-center flex items-center justify-center text-center p-4"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        {/* Obsidian Glass Gradient Shroud */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-transparent z-0"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent z-0"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/20 bg-cyan-950/20 backdrop-blur-md mb-6 animate-fade-in">
            <span className="live-pulse-dot"></span>
            <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
              {t("brand", "ParkSmart")} • Real-time Traffic Ecosystem
            </span>
          </div>

          <h1 className="text-5xl md:text-8xl font-extrabold text-white tracking-tight leading-none mb-6 animate-fade-in-up">
            {t("home_hero_headline")}
          </h1>
          <p className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto mb-10 font-normal leading-relaxed animate-fade-in-up delay-200">
            {t("home_hero_subtext")}
          </p>

          <button
            onClick={() => navigate("/grounds")}
            className="group relative inline-flex items-center justify-center px-10 py-4 font-bold text-white bg-cyan-600 rounded-xl overflow-hidden transition-all duration-300 hover:bg-cyan-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-black transform hover:scale-105 active:scale-95 animate-fade-in-up delay-400"
          >
            <span className="relative z-10 flex items-center gap-2">
              {t("home_hero_cta")}
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </button>
        </div>

        {/* Diagonal Bottom Grid Shutter Accent */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-transparent to-transparent pointer-events-none"></div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 relative bg-transparent backdrop-blur-md border-y border-slate-900/50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              {t("how_it_works_title")}
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center p-8 bg-slate-950/40 backdrop-blur-sm rounded-2xl border border-slate-900 shadow-xl interactive-spring">
              {analyzeIcon}
              <h3 className="text-xl font-bold text-cyan-400 mb-3">
                {t("how_it_works_step1_title")}
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                {t("how_it_works_step1_description")}
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center p-8 bg-slate-950/40 backdrop-blur-sm rounded-2xl border border-slate-900 shadow-xl interactive-spring">
              {reserveIcon}
              <h3 className="text-xl font-bold text-cyan-400 mb-3">
                {t("how_it_works_step2_title")}
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                {t("how_it_works_step2_description")}
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center p-8 bg-slate-950/40 backdrop-blur-sm rounded-2xl border border-slate-900 shadow-xl interactive-spring">
              {verifyIcon}
              <h3 className="text-xl font-bold text-cyan-400 mb-3">
                {t("how_it_works_step3_title")}
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                {t("how_it_works_step3_description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Activities / Vehicle Categories Section */}
      <section className="py-24 relative bg-transparent">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              {t("activities_title")}
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto rounded-full"></div>
          </div>

          {loadingActivities ? (
            <div className="flex justify-center items-center h-40">
              <div className="text-cyan-500 text-xl animate-pulse">
                {t("loading", "Loading...")}
              </div>
            </div>
          ) : activities.length === 0 ? (
            <p className="text-slate-500">{t("no_activities_available", "No vehicle categories available")}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-w-6xl mx-auto">
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex flex-col items-center justify-center p-6 bg-slate-950/40 backdrop-blur-sm rounded-xl border border-slate-900 shadow-md transition-all duration-300 cursor-pointer hover:border-cyan-500/40 hover:bg-slate-900/60 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                  style={{ transitionDelay: `${index * 40}ms` }}
                >
                  {getActivityIcon(activity.name) || (
                    <div className="w-10 h-10 flex items-center justify-center text-cyan-400 mb-3 text-2xl font-bold">
                      {activity.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm font-semibold tracking-wide text-slate-300">
                    {t(`booking.activities.${activity.name}`, activity.name)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <div className="bg-transparent border-t border-slate-900/50">
        <Testimonials />
      </div>

      {/* Floating Feedback Button */}
      <button
        onClick={() => setShowFeedbackForm(true)}
        className="fixed bottom-6 right-6 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 transform hover:scale-105 active:scale-95 z-40 flex items-center gap-2 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
        aria-label={t("feedback_title", "Share Your Feedback")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span className="hidden sm:inline tracking-wide">
          {t("feedback_title", "Share Feedback")}
        </span>
      </button>

      {/* Feedback Form Modal */}
      {showFeedbackForm && (
        <FeedbackForm
          onSuccess={() => {}}
          onClose={() => setShowFeedbackForm(false)}
        />
      )}
    </div>
  );
}
