import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../services/api";
import { useTranslation } from "react-i18next";
import Pagination from "../Pagination";
import ScheduleEditor from "../Shdule";
import Availability from "../Avaibality";
import { MdOutlineEdit, MdOutlineDelete } from "react-icons/md";
import Swal from "../../utils/swal";
import AdminLayout from "../Layouts/AdminLayout";
import GlassButton from "../../UI/GlassButton";

export default function ManageParkingSpots() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [terrains, setTerrains] = useState([]);
  const [activities, setActivities] = useState([]);
   const [loading, setLoading] = useState(true);
   const [showForm, setShowForm] = useState(false);
   const [editingId, setEditingId] = useState(null);
   const [page, setPage] = useState(1);
   const [lastPage, setLastPage] = useState(1);

   // Form State
   const [form, setForm] = useState({
     name: "",
     width: "",
     length: "",
     price: "",
     activityId: "1",
   });
   const [schedule, setSchedule] = useState({ from: "08:00", to: "23:00" });
   const [days, setDays] = useState([]);

   const fetchTerrains = useCallback((pageNumber) => {
    setLoading(true);
    api.getTerrainsByGround(id, pageNumber).then((res) => {
      if (res.success) {
        const paginator = res.terrains;
        if (paginator && paginator.data) {
          setTerrains(paginator.data);
          setLastPage(paginator.last_page || 1);
          setPage(paginator.current_page || 1);
        } else if (Array.isArray(paginator)) {
          setTerrains(paginator);
          setLastPage(1);
          setPage(1);
        } else {
          setTerrains([]);
          setLastPage(1);
          setPage(1);
        }
      } else if (res.status === 403) {
        Swal.fire({
          icon: 'error',
          title: 'Access Denied',
          text: res.message || 'You do not have permission.',
          background: '#09090b',
          color: '#fff',
          confirmButtonColor: '#dc2626',
        });
      }
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    fetchTerrains(1);
    api.getActivities().then((res) => {
      if (res.success) setActivities(res.activities);
    });
  }, [fetchTerrains]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("ground_id", id);
    formData.append("name", form.name);
    formData.append("width", form.width);
    formData.append("length", form.length);
    formData.append("price", form.price);
    formData.append("activity_id", form.activityId);
    formData.append("schedule_from", schedule.from);
    formData.append("schedule_to", schedule.to);
    days.forEach((day) => formData.append("days[]", day));

    try {
      let res;
      if (editingId) {
        res = await api.updateTerrain(editingId, formData);
      } else {
        res = await api.addTerrain(formData);
      }

       if (res.success) {
         setForm({ name: "", width: "", length: "", price: "", activityId: "1" });
         setSchedule({ from: "08:00", to: "23:00" });
         setDays([]);
         setShowForm(false);
         setEditingId(null);
         fetchTerrains(page);
         Swal.fire({
           icon: 'success',
           title: t("booking.manage_terrains.success_save") || 'Success',
           text: editingId ? t("booking.manage_terrains.updated_success") : t("booking.manage_terrains.added_success"),
           background: '#09090b',
           color: '#fff',
           confirmButtonColor: '#16a34a',
         });
       } else {
         Swal.fire({
           icon: 'error',
           title: t("booking.error_prefix") || 'Error',
           text: res.message || "Failed to save parking spot",
           background: '#09090b',
           color: '#fff',
           confirmButtonColor: '#dc2626',
         });
       }
     } catch (error) {
       Swal.fire({
         icon: 'error',
         title: 'Error',
         text: "An unexpected error occurred",
         background: '#09090b',
         color: '#fff',
         confirmButtonColor: '#dc2626',
       });
     }
  };

  const handleEdit = (terrain) => {
    setForm({
      name: terrain.name,
      width: terrain.width || "",
      length: terrain.length || "",
      price: terrain.price_per_hour || "",
      activityId: terrain.activity_id || "1",
    });
    setSchedule({ from: terrain.start_time?.substring(0, 5) || "08:00", to: terrain.end_time?.substring(0, 5) || "23:00" });
    setDays(terrain.available_days || []);
    setEditingId(terrain.id);
    setShowForm(true);
  };

  const handleDelete = async (terrainId) => {
    const result = await Swal.fire({
      title: t("booking.manage_terrains.confirm_delete"),
      text: t("booking.manage_terrains.confirm_delete_message"),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t("booking.manage_terrains.delete"),
      cancelButtonText: t("booking.manage_terrains.cancel"),
      background: '#09090b',
      color: '#fff',
    });

    if (!result.isConfirmed) return;

    try {
      const res = await api.deleteTerrain(terrainId);
      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: t("booking.manage_terrains.deleted_success"),
          text: t("booking.manage_terrains.deleted_message"),
          background: '#09090b',
          color: '#fff',
          confirmButtonColor: '#16a34a',
        });
        fetchTerrains(page);
      }
    } catch (error) {
       // handled
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= lastPage) {
      fetchTerrains(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[60vh] bg-transparent">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan shadow-glass-cyan"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="w-full max-w-6xl mx-auto space-y-8 p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="text-start">
            <h1 className="text-3xl font-black bg-gradient-to-r from-brand-cyan to-brand-violet bg-clip-text text-transparent uppercase tracking-wider">
              {t("booking.manage_terrains.title")}
            </h1>
            <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest font-mono font-semibold">
              {t("admin.manage_spots_subtitle", "Configure individual parking space parameters")}
            </p>
          </div>
        </div>

        {/* List Existing Parking Spots */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {terrains.map((terrain) => (
            <div key={terrain.id} className="glass-panel rounded-3xl p-6 border border-white/5 flex flex-col justify-between transition-all duration-300 hover:border-white/10 shadow-xl group">
              <div className="text-start mb-6">
                <h3 className="font-bold text-xl text-white mb-1 group-hover:text-brand-cyan transition-colors" dir="auto">{terrain.name}</h3>
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-mono font-bold mb-3">{terrain.activity_name || terrain.type}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-brand-emerald font-black text-2xl font-mono">{terrain.price_per_hour}</span>
                  <span className="text-zinc-500 text-[10px] font-bold uppercase">{t("booking.currency")}/{t("time").toLowerCase()}</span>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="text-zinc-500 text-[10px] font-mono uppercase font-bold">ID: #{terrain.id}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(terrain)}
                    className="p-2.5 bg-zinc-800/50 hover:bg-brand-cyan/20 border border-white/5 hover:border-brand-cyan/50 rounded-xl text-zinc-400 hover:text-brand-cyan flex items-center justify-center transition-all duration-300"
                    title={t("booking.manage_terrains.edit")}
                  >
                    <MdOutlineEdit className="text-lg" />
                  </button>
                  <button
                    onClick={() => handleDelete(terrain.id)}
                    className="p-2.5 bg-zinc-800/50 hover:bg-red-500/10 border border-white/5 hover:border-red-500/50 rounded-xl text-zinc-400 hover:text-red-500 flex items-center justify-center transition-all duration-300"
                    title={t("booking.manage_terrains.delete")}
                  >
                    <MdOutlineDelete className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add Button */}
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (!showForm) {
                setEditingId(null);
                setForm({ name: "", width: "", length: "", price: "", activityId: "1" });
                setSchedule({ from: "08:00", to: "23:00" });
                setDays([]);
              }
            }}
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-800 rounded-3xl hover:border-brand-cyan hover:bg-brand-cyan/5 transition-all duration-300 text-zinc-500 hover:text-brand-cyan group"
          >
            <span className="text-4xl font-bold mb-2 transition-transform duration-300 group-hover:scale-125">+</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{t("booking.manage_terrains.add_pitch")}</span>
          </button>
        </div>

        <Pagination currentPage={page} lastPage={lastPage} onPageChange={handlePageChange} />

        {/* Add/Edit Parking Spot Form */}
        {showForm && (
          <div className="glass-panel rounded-3xl p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-8 border border-white/5 text-start">
            <h2 className="text-2xl font-black mb-10 text-white uppercase tracking-widest border-b border-white/5 pb-6">
              {editingId ? t("booking.manage_terrains.edit") : t("booking.manage_terrains.add_pitch")}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">{t("fields.name")}</label>
                  <input
                    name="name"
                    placeholder="e.g. A-101"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-zinc-900/50 border border-white/5 p-4 rounded-2xl text-white placeholder-zinc-700 focus:ring-2 focus:ring-brand-cyan/30 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">{t("booking.steps.activity")}</label>
                  <select
                    name="activityId"
                    value={form.activityId}
                    onChange={handleChange}
                    className="w-full bg-zinc-900/50 border border-white/5 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-brand-cyan/30 transition-all"
                  >
                    {activities.map((a) => (
                      <option key={a.id} value={a.id} className="bg-zinc-900">
                        {t(`booking.activities.${a.name}`, a.name)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">{t("fields.price")}</label>
                  <input
                    name="price"
                    type="number"
                    placeholder="0.00"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full bg-zinc-900/50 border border-white/5 p-4 rounded-2xl text-white placeholder-zinc-700 focus:ring-2 focus:ring-brand-cyan/30 outline-none transition-all font-mono"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">{t("fields.width")}</label>
                    <input
                      name="width"
                      type="number"
                      placeholder="meters"
                      value={form.width}
                      onChange={handleChange}
                      className="w-full bg-zinc-900/50 border border-white/5 p-4 rounded-2xl text-white placeholder-zinc-700 focus:ring-2 focus:ring-brand-cyan/30 outline-none transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">{t("fields.length")}</label>
                    <input
                      name="length"
                      type="number"
                      placeholder="meters"
                      value={form.length}
                      onChange={handleChange}
                      className="w-full bg-zinc-900/50 border border-white/5 p-4 rounded-2xl text-white placeholder-zinc-700 focus:ring-2 focus:ring-brand-cyan/30 outline-none transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-zinc-950/40 p-8 rounded-3xl border border-white/5 space-y-6">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">
                  {t("booking.manage_terrains.schedule")}
                </label>
                <ScheduleEditor schedule={schedule} setSchedule={setSchedule} />
              </div>

              <div className="bg-zinc-950/40 p-8 rounded-3xl border border-white/5 space-y-6">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">
                  {t("booking.manage_terrains.available_days")}
                </label>
                <Availability days={days} setDays={setDays} />
              </div>

              <div className="pt-6">
                <GlassButton
                  type="submit"
                  variant="emerald"
                  className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-glass-emerald"
                >
                  {editingId ? t("booking.manage_terrains.update") : t("saveGround")}
                </GlassButton>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
