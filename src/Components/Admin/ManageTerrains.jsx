import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../services/api";
import { useTranslation } from "react-i18next";
import Pagination from "../Pagination";
import ScheduleEditor from "../Shdule";
import Availability from "../Avaibality";
import { MdOutlineEdit, MdOutlineDelete } from "react-icons/md";
import Swal from "../../utils/swal";

export default function ManageTerrains() {
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
          background: '#18181b',
          color: '#fff',
          confirmButtonColor: '#dc2626',
        });
      } else if (res.status === 429) {
        Swal.fire({
          icon: 'warning',
          title: 'Too Many Requests',
          text: res.message,
          background: '#18181b',
          color: '#fff',
          confirmButtonColor: '#f59e0b',
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

    console.log("Submitting FormData:", Object.fromEntries(formData));

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
           text: editingId ? t("booking.manage_terrains.updated_success") || 'Terrain updated successfully' : t("booking.manage_terrains.added_success") || 'Terrain added successfully',
           background: '#18181b',
           color: '#fff',
           confirmButtonColor: '#16a34a',
         });
       } else if (res.status === 403) {
         Swal.fire({
           icon: 'error',
           title: 'Access Denied',
           text: res.message || 'You do not have permission.',
           background: '#18181b',
           color: '#fff',
           confirmButtonColor: '#dc2626',
         });
       } else if (res.status === 429) {
         Swal.fire({
           icon: 'warning',
           title: 'Too Many Requests',
           text: res.message,
           background: '#18181b',
           color: '#fff',
           confirmButtonColor: '#f59e0b',
         });
       } else {
         let errorMsg = res.message || "Failed to save terrain";
         if (res.errors) {
           const errors = Object.values(res.errors).flat();
           errorMsg = errors.join(", ");
         }
         Swal.fire({
           icon: 'error',
           title: t("booking.error_prefix") || 'Error',
           text: errorMsg,
           background: '#18181b',
           color: '#fff',
           confirmButtonColor: '#dc2626',
         });
       }
     } catch (error) {
       let message =
         error.response?.data?.message ||
         JSON.stringify(error.response?.data?.errors) ||
         "An error occurred";
       Swal.fire({
         icon: 'error',
         title: 'Error',
         text: message,
         background: '#18181b',
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
    setSchedule({ from: "08:00", to: "23:00" });
    setDays([0, 1, 2, 3, 4, 5, 6]);
    setEditingId(terrain.id);
    setShowForm(true);
  };

  const handleDelete = async (terrainId) => {
    const result = await Swal.fire({
      title: t("booking.manage_terrains.confirm_delete"),
      text: t("booking.manage_terrains.confirm_delete_message") || "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t("booking.manage_terrains.delete"),
      cancelButtonText: t("booking.manage_terrains.cancel"),
      background: '#18181b',
      color: '#fff',
    });

    if (!result.isConfirmed) return;

    try {
      const res = await api.deleteTerrain(terrainId);
      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: t("booking.manage_terrains.deleted_success") || 'Deleted',
          text: t("booking.manage_terrains.deleted_message") || 'Terrain deleted successfully',
          background: '#18181b',
          color: '#fff',
          confirmButtonColor: '#16a34a',
        });
        fetchTerrains(page);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: res.error || res.message || "Failed to delete terrain",
          background: '#18181b',
          color: '#fff',
          confirmButtonColor: '#dc2626',
        });
      }
    } catch (error) {
      let message =
        error.response?.data?.message ||
        "An error occurred during deletion";
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        background: '#18181b',
        color: '#fff',
        confirmButtonColor: '#dc2626',
      });
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
      <div className="min-h-screen bg-black text-white p-6 flex justify-center">
        <div className="text-green-500">{t("loading")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  text-white p-6 flex justify-center">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold mb-6">{t("booking.manage_terrains.title")}</h1>

        {/* List Existing Terrains */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {terrains.map((terrain) => (
            <div key={terrain.id} className="bg-zinc-900 p-4 rounded border border-zinc-800 flex justify-between items-center">
              <div className="text-start">
                <h3 className="font-bold text-xl" dir="auto">{terrain.name}</h3>
                <p className="text-gray-400">{terrain.type}</p>
                <p className="text-green-400 font-bold">{terrain.price_per_hour} {t("booking.currency")}/{t("time").toLowerCase()}</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(terrain)}
                    className="p-3 bg-zinc-800 hover:bg-green-900/50 border border-zinc-700 hover:border-green-500 rounded-lg text-green-400 hover:text-green-300 flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-green-900/20"
                    title={t("booking.manage_terrains.edit")}
                  >
                    <MdOutlineEdit className="text-xl" />
                  </button>
                   <button
                     onClick={() => handleDelete(terrain.id)}
                     className="p-3 bg-zinc-800 hover:bg-red-900/50 border border-zinc-700 hover:border-red-500 rounded-lg text-red-400 hover:text-red-300 flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-red-900/20"
                     title={t("booking.manage_terrains.delete")}
                   >
                     <MdOutlineDelete className="text-xl" />
                   </button>
                </div>
                <div className="text-gray-500 text-xs text-end">ID: {terrain.id}</div>
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
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded hover:border-green-500 hover:bg-zinc-900 transition-all text-gray-400 hover:text-green-500"
          >
            <span className="text-4xl font-bold">+</span>
            <span>{t("booking.manage_terrains.add_pitch")}</span>
          </button>
        </div>

        <Pagination currentPage={page} lastPage={lastPage} onPageChange={handlePageChange} />

        {/* Add/Edit Terrain Form */}
        {showForm && (
          <div className="bg-zinc-900 p-6 rounded border border-zinc-800 animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-4 text-green-500">
              {editingId ? t("booking.manage_terrains.edit") : t("booking.manage_terrains.add_pitch")}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="name"
                  placeholder={t("fields.name")}
                  value={form.name}
                  onChange={handleChange}
                  className="bg-black border border-zinc-700 p-3 rounded"
                  required
                />
                <select
                  name="activityId"
                  value={form.activityId}
                  onChange={handleChange}
                  className="bg-black border border-zinc-700 p-3 rounded"
                >
                  {activities.map((a) => (
                    <option key={a.id} value={a.id}>
                      {t(`booking.activities.${a.name}`, a.name)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="price"
                  type="number"
                  placeholder={t("fields.price")}
                  value={form.price}
                  onChange={handleChange}
                  className="bg-black border border-zinc-700 p-3 rounded"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="width"
                    type="number"
                    placeholder={t("fields.width")}
                    value={form.width}
                    onChange={handleChange}
                    className="bg-black border border-zinc-700 p-3 rounded"
                  />
                  <input
                    name="length"
                    type="number"
                    placeholder={t("fields.length")}
                    value={form.length}
                    onChange={handleChange}
                    className="bg-black border border-zinc-700 p-3 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-bold text-start">
                  {t("booking.manage_terrains.schedule")}
                </label>
                <ScheduleEditor schedule={schedule} setSchedule={setSchedule} />
              </div>

              <div>
                <label className="block mb-2 font-bold text-start">
                  {t("booking.manage_terrains.available_days")}
                </label>
                <Availability days={days} setDays={setDays} />
              </div>

              <button
                type="submit"
                className="bg-green-600 w-full py-3 rounded font-bold hover:bg-green-500 transition-colors"
              >
                {editingId ? t("booking.manage_terrains.update") : t("saveGround")}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
