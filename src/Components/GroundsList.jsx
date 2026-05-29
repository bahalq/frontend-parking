import { useEffect, useState, useMemo, useCallback } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import GroundCard from "./GroundCard";
import Pagination from "./Pagination";
import { api } from "../services/api";
import { useTranslation } from "react-i18next";

export default function GroundsList() {
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const { t, i18n } = useTranslation();

  const isRTL = i18n.language === "ar";

  const fetchGrounds = useCallback((pageNumber) => {
    setLoading(true);
    api.getAllGrounds(pageNumber)
      .then((data) => {
        if (data.success) {
          const paginator = data.grounds;
          if (paginator && paginator.data) {
            setGrounds(paginator.data);
            setLastPage(paginator.last_page || 1);
            setPage(paginator.current_page || 1);
          } else if (Array.isArray(paginator)) {
            setGrounds(paginator);
            setLastPage(1);
            setPage(1);
          } else {
            setGrounds([]);
            setLastPage(1);
            setPage(1);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch grounds and activities
  useEffect(() => {
    fetchGrounds(1);

    api.getActivities().then((data) => {
      if (data.success) {
        setActivities(data.activities || data.data || []);
      }
    });
  }, [fetchGrounds]);

  // Extract unique cities from grounds
  const cities = useMemo(() => {
    const citySet = new Set();
    grounds.forEach((g) => {
      if (g.city) {
        citySet.add(g.city);
      }
    });
    return Array.from(citySet).sort((a, b) => a.localeCompare(b, i18n.language));
  }, [grounds, i18n.language]);

  // Filter grounds based on search and filters
  const filteredGrounds = useMemo(() => {
    return grounds.filter((ground) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = ground.name?.toLowerCase().includes(query);
        const cityMatch = ground.city?.toLowerCase().includes(query);
        if (!nameMatch && !cityMatch) {
          return false;
        }
      }

      if (selectedActivity) {
        const selectedActivityName = activities.find((act) => String(act.id) === selectedActivity)?.name;
        const hasActivity = ground.activities?.some(
          (a) => a.name === selectedActivityName
        );
        const hasTerrainActivity = ground.terrains?.some(
          (t) => String(t.activity_id) === selectedActivity
        );
        if (!hasActivity && !hasTerrainActivity) {
          return false;
        }
      }

      if (selectedCity && ground.city !== selectedCity) {
        return false;
      }

      return true;
    });
  }, [grounds, searchQuery, selectedActivity, selectedCity, activities]);

  const hasActiveFilters = searchQuery || selectedActivity || selectedCity;

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedActivity("");
    setSelectedCity("");
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= lastPage) {
      fetchGrounds(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-white">{t("loading")}</div>;
  }

  return (
    <div className="w-full">
      {/* Search and Filters Section */}
      <div
        className="mb-6 rounded-xl glass-panel p-6 shadow-2xl relative"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent rounded-xl pointer-events-none z-0"></div>
        <div className="relative z-10">
          {/* Search Bar */}
          <div className="relative mb-6 group">
            <FiSearch
              className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-4" : "left-4"} h-5 w-5 text-slate-500 transition-colors group-focus-within:text-cyan-400`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("search_placeholder")}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/65 py-3 pl-12 pr-4 text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:bg-slate-950/90 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              dir="auto"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-4">
            {/* Activity Filter - Pills */}
            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold tracking-wide text-cyan-400 uppercase">
                {t("filter_by_activity")}
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedActivity("")}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${selectedActivity === ""
                      ? "bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-100 hover:border-cyan-500/25"
                    }`}
                >
                  {t("all_activities")}
                </button>
                {activities.map((act) => {
                  const displayName = t(`booking.activities.${act.name}`, act.name);
                  const isActive = selectedActivity === String(act.id);
                  return (
                    <button
                      key={act.id}
                      onClick={() =>
                        setSelectedActivity(isActive ? "" : String(act.id))
                      }
                      className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${isActive
                          ? "bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                          : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-100 hover:border-cyan-500/25"
                        }`}
                      title={displayName}
                    >
                      {displayName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* City Filter - Dropdown */}
            {cities.length > 0 && (
              <div className="sm:w-48">
                <label className="mb-2 block text-sm font-semibold tracking-wide text-cyan-400 uppercase">
                  {t("filter_by_city")}
                </label>
                <div className="relative">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-800 bg-slate-950/65 py-3 pl-4 pr-10 text-white transition-colors focus:border-cyan-500 focus:bg-slate-950/90 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    dir={isRTL ? "rtl" : "ltr"}
                  >
                    <option value="">{t("all_cities")}</option>
                    {cities.map((city) => (
                      <option key={city} value={city} dir="auto">
                        {city}
                      </option>
                    ))}
                  </select>
                  <svg
                    className={`pointer-events-none absolute top-1/2 ${isRTL ? "left-3" : "right-3"} -translate-y-1/2 h-4 w-4 text-slate-500`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            )}

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="sm:w-auto">
                <button
                  onClick={clearAllFilters}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-400 transition-all hover:border-red-900/50 hover:bg-red-950/50 hover:text-red-400 sm:w-auto"
                >
                  <FiX className="h-4 w-4" />
                  {t("clear_filters")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {filteredGrounds.length === 0 ? (
        <div className="rounded-xl bg-zinc-900/80 p-12 text-center">
          <div className="mb-4 text-zinc-600">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-semibold text-white">
            {t("no_results_found")}
          </h3>
          {hasActiveFilters && (
            <p className="text-zinc-500">
              {t("loading") === "Loading..." ? "Try adjusting your filters." : t("clear_filters") + " to see all results."}
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGrounds.map((g) => (
              <div
                key={g.id}
                className="animate-fade-in"
                style={{ animationDuration: "0.3s" }}
              >
                <GroundCard ground={g} />
              </div>
            ))}
          </div>
          <Pagination currentPage={page} lastPage={lastPage} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
}
