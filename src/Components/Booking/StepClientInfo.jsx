import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function StepClientInfo({ data, updateData, nextStep, prevStep }) {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState(data.client);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateData("client", formData);
    nextStep();
  };

  return (
    <div className="relative">
      <h2 className="text-xl font-extrabold text-white tracking-tight mb-6 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-cyan-500 rounded-full"></span>
        {t("booking.client_info")}
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl text-slate-200">
        <input
          required
          name="firstName"
          placeholder={t("booking.placeholders.firstName")}
          value={formData.firstName}
          onChange={handleChange}
          className="p-3.5 bg-slate-950/65 border border-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 placeholder-slate-500 text-white rounded-xl transition-all duration-300"
        />
        <input
          required
          name="lastName"
          placeholder={t("booking.placeholders.lastName")}
          value={formData.lastName}
          onChange={handleChange}
          className="p-3.5 bg-slate-950/65 border border-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 placeholder-slate-500 text-white rounded-xl transition-all duration-300"
        />
        <input
          required
          type="email"
          name="email"
          placeholder={t("booking.placeholders.email")}
          value={formData.email}
          onChange={handleChange}
          className="p-3.5 bg-slate-950/65 border border-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 placeholder-slate-500 text-white rounded-xl transition-all duration-300"
        />
        <input
          required
          name="phone"
          placeholder={t("booking.placeholders.phone")}
          value={formData.phone}
          onChange={handleChange}
          className="p-3.5 bg-slate-950/65 border border-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 placeholder-slate-500 text-white rounded-xl transition-all duration-300"
        />
        <input
          required
          name="cin"
          placeholder={t("booking.placeholders.cin")}
          value={formData.cin}
          onChange={handleChange}
          className="p-3.5 bg-slate-950/65 border border-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 placeholder-slate-500 text-white rounded-xl transition-all duration-300 md:col-span-2"
        />
        <input
          required
          name="licensePlate"
          placeholder={t("booking.placeholders.licensePlate") || "License Plate / Matricule (e.g. 1234-A-7)"}
          value={formData.licensePlate}
          onChange={handleChange}
          className="p-3.5 bg-slate-950/65 border border-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 placeholder-slate-500 text-white rounded-xl transition-all duration-300 md:col-span-2 uppercase font-mono tracking-wider"
        />
        
        <div className="md:col-span-2 flex justify-between mt-8">
          <button type="button" onClick={prevStep} className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-2 font-medium text-sm">
            {i18n.language === "ar" ? "←" : "←"} {t("booking.back")}
          </button>
          <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-8 py-3 rounded-xl transition-all duration-300 active:scale-95 shadow-md hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            {t("booking.next_review")}
          </button>
        </div>
      </form>
    </div>
  );
}
