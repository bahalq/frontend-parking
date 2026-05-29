import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import PublicLayout from "./Layouts/PublicLayout";
import GlassCard from "../UI/GlassCard";
import GlassButton from "../UI/GlassButton";
import { QRCodeSVG } from "qrcode.react";
import { 
  FaCar, FaQrcode, FaHistory, FaPlus, 
  FaCalendarAlt, FaClock, FaCheckCircle, FaTrashAlt 
} from "react-icons/fa";

export default function DriverDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isLogin, user } = useAuth();
  const isRTL = i18n.language === "ar";

  // Mock initial driver state for prototype fidelity
  const [vehicles, setVehicles] = useState([
    { id: 1, plate: "12345-A-1", model: "Tesla Model Y (Electric)" },
    { id: 2, plate: "67890-B-7", model: "Yamaha TMAX (Motorcycle)" }
  ]);
  const [newPlate, setNewPlate] = useState("");
  const [newModel, setNewModel] = useState("");
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  const [activePasses, setActivePasses] = useState([
    {
      id: "PRK-902816",
      zone: "Gare Rabat Ville - Zone A",
      spot: "SPT-14",
      date: "2026-05-28",
      time: "19:00 - 21:00",
      status: "Confirmed",
      qrcode: "d836967f-b9fa-4d36-895f-5dd59701bd04-PRK902816"
    }
  ]);

  const [history, setHistory] = useState([
    { id: 1, zone: "Marrakech Medina Parking", spot: "SPT-08", date: "2026-05-20", price: "20 MAD", status: "Checked Out" },
    { id: 2, zone: "Technopolis Salé EV Station", spot: "SPT-32", date: "2026-05-14", price: "45 MAD", status: "Checked Out" }
  ]);

  // Handle adding new vehicle matricule
  const handleAddVehicle = (e) => {
    e.preventDefault();
    if (!newPlate.trim()) return;
    const added = {
      id: Date.now(),
      plate: newPlate.trim().toUpperCase(),
      model: newModel.trim() || t("booking.standard_terrain", "Standard Passenger Car")
    };
    setVehicles([...vehicles, added]);
    setNewPlate("");
    setNewModel("");
    setShowAddVehicle(false);
  };

  const handleRemoveVehicle = (id) => {
    setVehicles(vehicles.filter(v => v.id !== id));
  };

  return (
    <PublicLayout>
      <div className="pt-[12vh] pb-20 px-4 max-w-6xl mx-auto space-y-8" dir={isRTL ? "rtl" : "ltr"}>
        {/* Profile Card Header */}
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-cyan font-mono">
              {t("brand", "ParkSmart Driver Portal")}
            </span>
            <h1 className="mt-2 text-3xl font-black bg-gradient-to-r from-brand-cyan to-brand-violet bg-clip-text text-transparent uppercase tracking-wider">
              {t("home_welcome", "Welcome Back")}, {user?.first_name || t("client", "Driver")}
            </h1>
            <p className="text-xs text-zinc-500 font-mono mt-1">
              {user?.email || "driver@parksmart.city"}
            </p>
          </div>
          <GlassButton
            variant="cyan"
            className="w-full md:w-auto font-bold uppercase text-xs tracking-wider"
            onClick={() => navigate("/grounds")}
          >
            {t("home_hero_cta", "Book Next Parking Spot")}
          </GlassButton>
        </div>

        {/* Grid Area: Dynamic Pass & Vehicle Registers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Tickets Carousel (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-2">
              <FaQrcode className="text-brand-cyan" />
              {t("staff.scan_qr_nav", "Active Check-In Passes")}
            </h2>

            {activePasses.length === 0 ? (
              <GlassCard className="text-center py-12">
                <p className="text-zinc-500 font-mono text-sm">{t("noBookings", "No active reservations registered.")}</p>
              </GlassCard>
            ) : (
              activePasses.map((pass) => (
                <div key={pass.id} className="glass-panel rounded-3xl p-6 relative overflow-hidden border border-brand-cyan/20">
                  <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-gradient-to-r from-transparent to-brand-cyan/5 pointer-events-none"></div>
                  
                  {/* Visual Pass Content */}
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="space-y-4 w-full md:w-2/3">
                      <div>
                        <span className="text-[9px] bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/25 px-2 py-0.5 rounded-full font-mono font-bold uppercase">
                          {pass.id}
                        </span>
                        <h3 className="text-lg font-black text-white mt-2" dir="auto">{pass.zone}</h3>
                        <p className="text-xs text-brand-emerald font-extrabold font-mono mt-1">{pass.spot}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs text-zinc-400 border-t border-white/5 pt-4">
                        <div className="flex items-center gap-2 font-mono">
                          <FaCalendarAlt className="text-brand-cyan" />
                          <span>{pass.date}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <FaClock className="text-brand-cyan" />
                          <span>{pass.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* QR Code Graphic element */}
                    <div className="bg-white p-4 rounded-2xl flex items-center justify-center shadow-glass-cyan flex-shrink-0">
                      <QRCodeSVG value={pass.qrcode} size={110} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Garage vehicle lists (1 Col) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-2">
                <FaCar className="text-brand-violet" />
                {t("driver.my_garage", "My Registered Vehicles")}
              </h2>
              <button 
                onClick={() => setShowAddVehicle(!showAddVehicle)}
                className="p-2 rounded-full bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <FaPlus className="w-3.5 h-3.5" />
              </button>
            </div>

            {showAddVehicle && (
              <form onSubmit={handleAddVehicle} className="glass-panel p-4 rounded-3xl space-y-3 animate-fade-in">
                <input
                  required
                  type="text"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  placeholder={t("booking.placeholders.licensePlate", "Matricule (e.g. 12345-A-1)")}
                  className="w-full p-3 bg-zinc-900 rounded-2xl border border-white/5 text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:border-brand-cyan/60"
                  dir="ltr"
                />
                <input
                  type="text"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  placeholder={t("driver.vehicle_model", "Vehicle Model (e.g. Tesla Model 3)")}
                  className="w-full p-3 bg-zinc-900 rounded-2xl border border-white/5 text-xs text-white focus:outline-none focus:border-brand-cyan/60"
                />
                <div className="flex justify-end gap-2 text-xs">
                  <button 
                    type="button" 
                    onClick={() => setShowAddVehicle(false)}
                    className="text-zinc-500 font-bold px-3 py-1 cursor-pointer"
                  >
                    {t("confirm.cancel", "Cancel")}
                  </button>
                  <button 
                    type="submit" 
                    className="bg-brand-violet text-white font-bold px-4 py-2 rounded-xl hover:bg-indigo-500 transition-colors cursor-pointer"
                  >
                    {t("confirm.yes", "Save")}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {vehicles.map((v) => (
                <div key={v.id} className="glass-panel rounded-2xl p-4 flex justify-between items-center border border-white/5 hover:border-brand-violet/20 transition-all duration-300">
                  <div className="min-w-0">
                    <span className="text-xs font-black text-white font-mono tracking-wider block uppercase">
                      {v.plate}
                    </span>
                    <span className="text-[10px] text-zinc-500 mt-0.5 block truncate">
                      {v.model}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleRemoveVehicle(v.id)}
                    className="p-2 text-zinc-600 hover:text-red-400 transition-colors cursor-pointer"
                    title={t("delete", "Delete")}
                  >
                    <FaTrashAlt className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section: Reservation History Log */}
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-2">
            <FaHistory className="text-brand-cyan" />
            {t("viewAllBookings", "Reservation History")}
          </h2>

          <div className="glass-panel rounded-3xl p-5 overflow-hidden border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-zinc-500 uppercase tracking-wider font-mono">
                    <th className="py-3 px-4 text-start font-bold">{t("ground", "Parking Zone")}</th>
                    <th className="py-3 px-4 text-start font-bold">{t("booking.steps.terrain", "Spot")}</th>
                    <th className="py-3 px-4 text-start font-bold">{t("date", "Date")}</th>
                    <th className="py-3 px-4 text-start font-bold">{t("price", "Paid")}</th>
                    <th className="py-3 px-4 text-end font-bold">{t("status", "Status")}</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-300">
                  {history.map((row) => (
                    <tr key={row.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 font-bold text-white text-sm" dir="auto">{row.zone}</td>
                      <td className="py-4 px-4 font-mono font-semibold text-brand-cyan">{row.spot}</td>
                      <td className="py-4 px-4 font-mono">{row.date}</td>
                      <td className="py-4 px-4 font-mono font-bold text-brand-emerald">{row.price}</td>
                      <td className="py-4 px-4 text-end font-mono font-bold">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-[10px] text-zinc-400">
                          <FaCheckCircle className="w-3 h-3 text-brand-emerald" />
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
