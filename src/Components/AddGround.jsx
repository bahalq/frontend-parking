import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LocationPicker from "./Location";
import ImageUpload from "./UploadImages";
import { useTranslation } from "react-i18next";
import { api } from "../services/api";
import AdminLayout from "./Layouts/AdminLayout";
import GlassButton from "../UI/GlassButton";
import { FaMapMarkerAlt, FaImage, FaArrowRight, FaArrowLeft, FaPlusCircle } from "react-icons/fa";

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
      <div className="max-w-4xl mx-auto space-y-8 p-6">
        <div className="text-start">
          <h1 className="text-3xl font-black bg-gradient-to-r from-brand-cyan to-brand-violet bg-clip-text text-transparent uppercase tracking-wider">
            {t("addGround")}
          </h1>
          <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest font-mono font-semibold">
            {t("admin.add_ground_subtitle", "Initialize a new parking facility in the system")}
          </p>
        </div>

        <div className="glass-panel rounded-3xl shadow-2xl overflow-hidden border border-white/5">
          {/* Progress Header */}
          <div className="bg-zinc-950/40 p-8 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step === 1 ? 'bg-brand-cyan text-white shadow-glass-cyan' : 'bg-zinc-800 text-zinc-500'}`}>1</div>
                <span className={`text-xs font-black uppercase tracking-widest ${step === 1 ? 'text-white' : 'text-zinc-500'}`}>{t("fields.general") || "General Info"}</span>
              </div>
              <div className="h-px flex-1 bg-white/5 mx-4"></div>
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step === 2 ? 'bg-brand-cyan text-white shadow-glass-cyan' : 'bg-zinc-800 text-zinc-500'}`}>2</div>
                <span className={`text-xs font-black uppercase tracking-widest ${step === 2 ? 'text-white' : 'text-zinc-500'}`}>{t("fields.location")} & {t("images")}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            {error && (
              <div className="bg-red-500/10 text-red-400 p-6 rounded-2xl border border-red-500/20 text-start animate-in fade-in slide-in-from-top-4">
                <p className="font-bold uppercase text-[10px] tracking-widest mb-1">{t("error")}</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Step 1: Basic Details */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <div className="space-y-2 text-start">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">
                    {t("groundName")}
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-brand-cyan/30 transition-all"
                    placeholder="e.g. Downtown Central Parking"
                  />
                </div>

                <div className="space-y-2 text-start">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">
                    {t("groundDescription")}
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-brand-cyan/30 transition-all resize-none"
                    placeholder="Brief overview of the facility and its access points..."
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <GlassButton
                    type="button"
                    variant="cyan"
                    onClick={() => setStep(2)}
                    className="px-8 py-3 font-black uppercase text-xs tracking-widest"
                  >
                    {t("next")} <FaArrowRight className="ms-2 rtl:rotate-180" />
                  </GlassButton>
                </div>
              </div>
            )}

            {/* Step 2: Location & Images */}
            {step === 2 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-left-4">
                <div className="space-y-4 text-start">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <FaImage className="text-brand-cyan" />
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      {t("imageUpload")}
                    </label>
                  </div>
                  <div className="bg-zinc-950/40 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <ImageUpload onChange={setImages} />
                  </div>
                </div>

                 <div className="space-y-4 text-start">
                   <div className="flex items-center gap-2 mb-2 px-1">
                     <FaMapMarkerAlt className="text-brand-violet" />
                     <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                       {t("locationPicker")}
                     </label>
                   </div>
                  <div className="h-80 rounded-3xl overflow-hidden border border-white/5 relative shadow-xl">
                    <LocationPicker
                      location={location}
                      setCity={setCity}
                      setLocation={setLocation}
                    />
                  </div>
                  {location && (
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/20 text-[10px] font-mono font-bold uppercase mt-2">
                      <FaMapMarkerAlt /> {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-6 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-zinc-500 hover:text-white px-4 py-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all"
                  >
                    <FaArrowLeft className="rtl:rotate-180" /> {t("booking.back")}
                  </button>
                  <GlassButton
                    type="submit"
                    disabled={loading}
                    variant="emerald"
                    className="px-10 py-3 font-black uppercase text-xs tracking-widest shadow-glass-emerald"
                  >
                    {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <FaPlusCircle className="me-2" />}
                    {t("saveGround")}
                  </GlassButton>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
