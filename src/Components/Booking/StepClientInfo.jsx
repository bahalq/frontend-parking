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
    <div>
      <h2 className="text-xl font-bold mb-4">{t("booking.client_info")}</h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl text-white">
        <input
          required
          name="firstName"
          placeholder={t("booking.placeholders.firstName")}
          value={formData.firstName}
          onChange={handleChange}
          className="p-3 bg-zinc-700 rounded border border-zinc-600 placeholder-zinc-400"
        />
        <input
          required
          name="lastName"
          placeholder={t("booking.placeholders.lastName")}
          value={formData.lastName}
          onChange={handleChange}
          className="p-3 bg-zinc-700 rounded border border-zinc-600 placeholder-zinc-400"
        />
        <input
          required
          type="email"
          name="email"
          placeholder={t("booking.placeholders.email")}
          value={formData.email}
          onChange={handleChange}
          className="p-3 bg-zinc-700 rounded border border-zinc-600 placeholder-zinc-400"
        />
        <input
          required
          name="phone"
          placeholder={t("booking.placeholders.phone")}
          value={formData.phone}
          onChange={handleChange}
          className="p-3 bg-zinc-700 rounded border border-zinc-600 placeholder-zinc-400"
        />
        <input
          required
          name="cin"
          placeholder={t("booking.placeholders.cin")}
          value={formData.cin}
          onChange={handleChange}
          className="p-3 bg-zinc-700 rounded border border-zinc-600 md:col-span-2 placeholder-zinc-400"
        />
        <input
          required
          name="licensePlate"
          placeholder={t("booking.placeholders.licensePlate") || "License Plate / Matricule (e.g. 1234-A-7)"}
          value={formData.licensePlate}
          onChange={handleChange}
          className="p-3 bg-zinc-700 rounded border border-zinc-600 md:col-span-2 placeholder-zinc-400"
        />
        
        <div className="md:col-span-2 flex justify-between mt-4">
          <button type="button" onClick={prevStep} className="text-gray-400 hover:text-white flex items-center gap-2">
            {i18n.language === "ar" ? "→" : "←"} {t("booking.back")}
          </button>
          <button type="submit" className="bg-green-600 px-8 py-2 rounded hover:bg-green-500 font-bold">
            {t("booking.next_review")}
          </button>
        </div>
      </form>
    </div>
  );
}
