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
  FaBicycle,
  FaWheelchair,
  FaClock,
  FaParking,
  FaStar,
} from "react-icons/fa";
import { api } from "../services/api";

// Placeholder for images and icons
const heroBackground = new URL("/home.png", import.meta.url).href;
const browseIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 text-green-500 mb-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);
const bookIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 text-green-500 mb-4"
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
const playIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 text-green-500 mb-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export default function Home({ isLogin, role }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  // Set font family based on language
  useEffect(() => {
    document.body.style.fontFamily = i18n.language === "ar" ? "Cairo" : "Inter";
  }, [i18n.language]);

  // Fetch activities on mount
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

  // Map activity name to icon component
  // Map vehicle category name to icon component
  const getActivityIcon = (activityName) => {
    const iconMap = {
      Football: <FaCar className="w-10 h-10 text-green-400 mb-2" />,
      Tennis: <FaMotorcycle className="w-10 h-10 text-green-400 mb-2" />,
      Basketball: <FaChargingStation className="w-10 h-10 text-green-400 mb-2" />,
      Volleyball: <FaTruck className="w-10 h-10 text-green-400 mb-2" />,
      Handball: <FaBicycle className="w-10 h-10 text-green-400 mb-2" />,
      Badminton: <FaWheelchair className="w-10 h-10 text-green-400 mb-2" />,
      Swimming: <FaClock className="w-10 h-10 text-green-400 mb-2" />,
      "Table Tennis": <FaParking className="w-10 h-10 text-green-400 mb-2" />,
      Padel: <FaStar className="w-10 h-10 text-green-400 mb-2" />,
    };
    return iconMap[activityName] || <FaParking className="w-10 h-10 text-green-400 mb-2" />;
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-gray-200">
      {/* Hero Section */}
      <section
        className="relative h-screen bg-cover bg-center flex items-center justify-center text-center p-4"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-4 animate-fade-in-up">
            {t("home_hero_headline")}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 animate-fade-in-up delay-200">
            {t("home_hero_subtext")}
          </p>
          <button
            onClick={() => navigate("/grounds")}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg animate-fade-in-up delay-400"
          >
            {t("home_hero_cta")}
          </button>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-zinc-950">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-12">
            {t("how_it_works_title")}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-6 bg-zinc-900 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
              {browseIcon}
              <h3 className="text-xl font-semibold text-green-400 mb-2">
                {t("how_it_works_step1_title")}
              </h3>
              <p className="text-gray-400">
                {t("how_it_works_step1_description")}
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-zinc-900 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 delay-100">
              {bookIcon}
              <h3 className="text-xl font-semibold text-green-400 mb-2">
                {t("how_it_works_step2_title")}
              </h3>
              <p className="text-gray-400">
                {t("how_it_works_step2_description")}
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-zinc-900 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 delay-200">
              {playIcon}
              <h3 className="text-xl font-semibold text-green-400 mb-2">
                {t("how_it_works_step3_title")}
              </h3>
              <p className="text-gray-400">
                {t("how_it_works_step3_description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="py-16 bg-zinc-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-12">
            {t("activities_title")}
          </h2>
          {loadingActivities ? (
            <div className="flex justify-center items-center h-40">
              <div className="text-green-500 text-xl animate-pulse">
                {t("loading", "Loading...")}
              </div>
            </div>
          ) : activities.length === 0 ? (
            <p className="text-gray-400">{t("no_activities_available", "No activities available")}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex flex-col items-center p-4 bg-zinc-800 rounded-xl shadow-md transform hover:scale-105 transition-all duration-300 cursor-pointer"
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                {getActivityIcon(activity.name) || (
                  <div className="w-10 h-10 flex items-center justify-center text-green-400 mb-2 text-2xl font-bold">
                    {activity.name.charAt(0)}
                  </div>
                )}
                  <span className="text-lg font-medium text-gray-200">
                    {t(`booking.activities.${activity.name}`, activity.name)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Floating Feedback Button */}
      <button
        onClick={() => setShowFeedbackForm(true)}
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 z-40 flex items-center gap-2"
        aria-label={t("feedback_title", "Share Your Feedback")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span className="hidden sm:inline">
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
