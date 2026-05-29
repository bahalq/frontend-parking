import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useTranslation } from "react-i18next";
import StepActivity from "./StepActivity";
import StepTerrain from "./StepTerrain";
import StepDate from "./StepDate";
import StepTime from "./StepTime";
import StepClientInfo from "./StepClientInfo";
import StepConfirmation from "./StepConfirmation";

export default function BookingStepper({ ground }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    groundId: ground.id,
    activityId: null,
    terrainId: null,
    terrainPrice: 0,
    date: null,
    timeSlot: null,
    client: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      cin: "",
      licensePlate: ""
    }
  });

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const updateData = (field, value) => {
    setBookingData((prev) => ({ ...prev, [field]: value }));
  };

  const steps = [
    { id: 1, title: t("booking.steps.activity"), component: StepActivity },
    { id: 2, title: t("booking.steps.terrain"), component: StepTerrain },
    { id: 3, title: t("booking.steps.date"), component: StepDate },
    { id: 4, title: t("booking.steps.time"), component: StepTime },
    { id: 5, title: t("booking.steps.info"), component: StepClientInfo },
    { id: 6, title: t("booking.steps.confirm"), component: StepConfirmation },
  ];

  const CurrentComponent = steps.find((s) => s.id === step)?.component;

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl text-white mt-8">
      {/* Stepper Header */}
      <div className="flex justify-between mb-8 border-b border-white/5 pb-4">
        {steps.map((s) => (
          <div
            key={s.id}
            className={`flex items-center gap-2 transition-colors duration-300 ${
              step >= s.id ? "text-brand-cyan font-bold" : "text-zinc-500"
            }`}
          >
            <span className={`w-7 h-7 rounded-full flex items-center justify-center border text-xs transition-all duration-300 ${
               step >= s.id ? "border-brand-cyan bg-brand-cyan/15 shadow-glass-cyan text-white" : "border-zinc-700 bg-zinc-950/50 text-zinc-500"
            }`}>
              {s.id}
            </span>
            <span className="hidden md:inline text-sm">{s.title}</span>
          </div>
        ))}
      </div>

      <div className="min-h-75">
        {CurrentComponent && (
          <CurrentComponent
            data={bookingData}
            updateData={updateData}
            nextStep={nextStep}
            prevStep={prevStep}
            ground={ground}
          />
        )}
      </div>
    </div>
  );
}
