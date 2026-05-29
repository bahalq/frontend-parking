import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LocationPicker from "./Location";
import ImageUpload from "./UploadImages";
import { useTranslation } from "react-i18next";
import { api } from "../services/api";
import AdminLayout from "./Layouts/AdminLayout";

export default function AddGround() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setErr] = useState(null);

  const [step, setStep] = useState(1);
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const handleChange = ({ target }) => {
    const { name, value } = target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);

    // Validation
    if (!form.name) {
      setErr(t("errors.field_required", { field: t("groundName") }));
      return;
    }
    if (!location) {
      setErr(t("errors.field_required", { field: t("fields.location") }));
      return;
    }
    if (images.length === 0) {
      setErr(t("errors.field_required", { field: t("images") }));
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("lat", location.lat);
    formData.append("lng", location.lng);
    formData.append("city", city);
    images.forEach((img) => formData.append("images[]", img));

    setLoading(true);

    try {
      const res = await api.createGround(formData);
      if (res.success) {
        navigate(`/admin/grounds/${res.ground_id}/terrains`);
      } else if (res.status === 403) {
        setErr(res.message || "Access denied.");
      } else if (res.status === 429) {
        setErr(res.message || "Too many requests. Please wait.");
      } else {
        setErr(res.error || t("errors.server_error"));
      }
    } catch (e) {
      setErr(t("genericError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-center">
        <div className="w-full max-w-4xl bg-zinc-900 rounded-xl shadow-2xl overflow-hidden border border-zinc-800">
          {/* Header */}
          <div className="bg-zinc-800 p-6 border-b border-zinc-700">
            <h1 className="text-2xl font-bold text-white mb-2 text-start">
              {t("addGround")} - {step === 1 ? t("booking.steps.info") : t("fields.location")}
            </h1>
            <div className="flex gap-2 text-sm text-gray-400">
              <span className={step === 1 ? "text-green-400 font-bold" : ""}>
                1. {t("fields.general") || "General"}
              </span>
              <span>{i18n.language === "ar" ? "←" : "→"}</span>
              <span className={step === 2 ? "text-green-400 font-bold" : ""}>
                2. {t("fields.location")} & {t("images")}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="bg-red-900/50 text-red-200 p-4 rounded mb-6 border border-red-800 text-start">
                {error}
              </div>
            )}

            {/* Step 1: Basic Details */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 block text-start">
                    {t("groundName")}
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 focus:border-green-500 focus:outline-none transition-colors"
                    placeholder={t("groundName")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 block text-start">
                    {t("groundDescription")}
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 focus:border-green-500 focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    {t("next")} {i18n.language === "ar" ? "←" : "→"}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Location & Images */}
            {step === 2 && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-lg font-bold text-white mb-2 block text-start">
                    {t("imageUpload")}
                  </label>
                  <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
                    <ImageUpload onChange={setImages} />
                  </div>
                </div>

                 <div className="space-y-2">
                   <label className="text-lg font-bold text-white mb-2 block text-start">
                     {t("locationPicker")}
                   </label>
                  <div className="h-64 rounded-lg overflow-hidden border border-zinc-700 relative">
                    <LocationPicker
                      location={location}
                      setCity={setCity}
                      setLocation={setLocation}
                    />
                  </div>
                  {location && (
                    <p className="text-sm text-green-400 mt-2 text-start">
                      {t("selected")}: {location.lat.toFixed(6)},{" "}
                      {location.lng.toFixed(6)}
                    </p>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-gray-400 hover:text-white px-4 py-2 flex items-center gap-2"
                  >
                    {i18n.language === "ar" ? "→" : "←"} {t("booking.back")}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-bold transition-all transform hover:scale-105 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {loading ? t("loading") : t("saveGround")}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
