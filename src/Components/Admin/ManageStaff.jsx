import { useEffect, useState, useCallback } from "react";
import { api } from "../../services/api";
import Pagination from "../Pagination";
import { useTranslation } from "react-i18next";
import Swal from "../../utils/swal";
import AdminLayout from "../Layouts/AdminLayout";
import GlassButton from "../../UI/GlassButton";
import { FaUsersCog, FaPlusCircle, FaSyncAlt, FaPowerOff } from "react-icons/fa";

export default function ManageStaff() {
  const { t } = useTranslation();
  const [staff, setStaff] = useState([]);
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    ground_id: "",
  });

  const fetchStaff = useCallback((pageNumber) => {
    setLoading(true);
    api.getAdminStaffList(pageNumber)
      .then((data) => {
        if (data.success) {
          const paginator = data.staff;
          if (paginator && paginator.data) {
            setStaff(paginator.data);
            setLastPage(paginator.last_page || 1);
            setPage(paginator.current_page || 1);
          } else if (Array.isArray(paginator)) {
            setStaff(paginator);
            setLastPage(1);
            setPage(1);
          } else {
            setStaff([]);
            setLastPage(1);
            setPage(1);
          }
        } else if (data.status === 403) {
          setError(data.message);
        } else if (data.status === 429) {
          setError(data.message);
        } else {
          setError("Failed to load staff");
        }
      })
      .catch(() => setError("Failed to load staff"))
      .finally(() => setLoading(false));
  }, []);

  const fetchGrounds = useCallback(() => {
    api.getGroundsList()
      .then((data) => {
        if (data.success) {
          setGrounds(data.grounds || []);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchStaff(1);
    fetchGrounds();
  }, [fetchStaff, fetchGrounds]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= lastPage) {
      fetchStaff(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.first_name || !form.last_name || !form.email || !form.password || !form.ground_id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "All fields are required",
        background: "#18181b",
        color: "#fff",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    setSubmitting(true);

    try {
      const data = await api.createStaff(form);

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: `Staff created. Credentials sent to ${form.email}`,
          background: "#18181b",
          color: "#fff",
          confirmButtonColor: "#10b981",
        });
        setForm({ first_name: "", last_name: "", email: "", password: "", ground_id: "" });
        setShowForm(false);
        fetchStaff(1);
      } else if (data.status === 403) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Unauthorized",
          background: "#18181b",
          color: "#fff",
          confirmButtonColor: "#dc2626",
        });
      } else if (data.status === 422) {
        const msgs = data.errors ? Object.values(data.errors).flat().join("\n") : data.message;
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: msgs,
          background: "#18181b",
          color: "#fff",
          confirmButtonColor: "#dc2626",
        });
      } else if (data.status === 429) {
        Swal.fire({
          icon: "warning",
          title: "Too Many Requests",
          text: data.message || "Please wait a moment and try again.",
          background: "#18181b",
          color: "#fff",
          confirmButtonColor: "#f59e0b",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to create staff",
          background: "#18181b",
          color: "#fff",
          confirmButtonColor: "#dc2626",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong",
        background: "#18181b",
        color: "#fff",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id, name) => {
    Swal.fire({
      title: "Delete Staff?",
      text: `Remove ${name}? This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#3f3f46",
      confirmButtonText: "Yes, delete",
      background: "#18181b",
      color: "#fff",
    }).then((result) => {
      if (result.isConfirmed) {
        api.deleteStaff(id)
          .then((data) => {
            if (data.success) {
              Swal.fire({
                icon: "success",
                title: "Deleted",
                text: "Staff account removed",
                background: "#18181b",
                color: "#fff",
                confirmButtonColor: "#10b981",
              });
              fetchStaff(page);
            } else if (data.status === 403) {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: data.message || "Unauthorized",
                background: "#18181b",
                color: "#fff",
                confirmButtonColor: "#dc2626",
              });
            } else if (data.status === 429) {
              Swal.fire({
                icon: "warning",
                title: "Too Many Requests",
                text: data.message || "Please wait.",
                background: "#18181b",
                color: "#fff",
                confirmButtonColor: "#f59e0b",
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: data.message || "Failed to delete",
                background: "#18181b",
                color: "#fff",
                confirmButtonColor: "#dc2626",
              });
            }
          })
          .catch(() => {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Something went wrong",
              background: "#18181b",
              color: "#fff",
              confirmButtonColor: "#dc2626",
            });
          });
      }
    });
  };

  if (loading && staff.length === 0) {
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
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div className="text-start">
            <h1 className="text-3xl font-black bg-gradient-to-r from-brand-cyan to-brand-violet bg-clip-text text-transparent uppercase tracking-wider">
              {t("errors.manage_staff", "Staff Management")}
            </h1>
            <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest font-mono font-semibold">
              {t("admin.manage_staff_subtitle", "Provision and monitor parking facility personnel")}
            </p>
          </div>
          <div className="flex gap-2">
            <GlassButton
              variant="cyan"
              onClick={() => fetchStaff(1)}
              className="px-4 py-2 font-bold uppercase text-xs tracking-wider"
            >
              <FaSyncAlt className="w-3 h-3" />
              {t("refresh")}
            </GlassButton>
            <GlassButton
              variant={showForm ? "violet" : "emerald"}
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 font-bold uppercase text-xs tracking-wider"
            >
              {showForm ? t("cancel") : <><FaPlusCircle className="w-3 h-3" /> {t("errors.add_staff")}</>}
            </GlassButton>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-2xl mb-6">
            {error}
          </div>
        )}

        {/* Add Staff Form */}
        {showForm && (
          <div className="glass-panel rounded-3xl p-8 mb-8 border border-white/5 shadow-2xl animate-in slide-in-from-top-4">
            <h2 className="text-xl font-black mb-6 text-white uppercase tracking-wider text-start">Create Official Account</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-start">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 px-1">{t("firstName")}</label>
                <input
                  type="text"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-800/50 border border-white/5 focus:ring-2 focus:ring-brand-emerald/30 px-4 py-3 rounded-xl text-white outline-none transition-all"
                  required
                />
              </div>
              <div className="text-start">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 px-1">{t("lastName")}</label>
                <input
                  type="text"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-800/50 border border-white/5 focus:ring-2 focus:ring-brand-emerald/30 px-4 py-3 rounded-xl text-white outline-none transition-all"
                  required
                />
              </div>
              <div className="text-start">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 px-1">{t("email")}</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-800/50 border border-white/5 focus:ring-2 focus:ring-brand-emerald/30 px-4 py-3 rounded-xl text-white outline-none transition-all font-mono"
                  required
                />
              </div>
              <div className="text-start">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 px-1">{t("password")}</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-800/50 border border-white/5 focus:ring-2 focus:ring-brand-emerald/30 px-4 py-3 rounded-xl text-white outline-none transition-all font-mono"
                  required
                />
              </div>
              <div className="md:col-span-2 text-start">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 px-1">{t("errors.staff_ground")}</label>
                <select
                  name="ground_id"
                  value={form.ground_id}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-800/50 border border-white/5 focus:ring-2 focus:ring-brand-emerald/30 px-4 py-3 rounded-xl text-white outline-none transition-all"
                  required
                >
                  <option value="" className="bg-zinc-900">Select Facility</option>
                  {grounds.map((g) => (
                    <option key={g.id} value={g.id} className="bg-zinc-900">{g.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 text-start">
                <GlassButton
                  type="submit"
                  disabled={submitting}
                  variant="emerald"
                  className="w-full md:w-auto px-10 py-3 font-black uppercase text-xs tracking-widest shadow-glass-emerald"
                >
                  {submitting ? t("processing") : t("errors.add_staff")}
                </GlassButton>
              </div>
            </form>
          </div>
        )}

        {/* Staff Table */}
        <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-950/40 text-zinc-500 uppercase tracking-wider font-mono">
                  <th className="px-6 py-4 font-bold text-start">{t("errors.staff_name")}</th>
                  <th className="px-6 py-4 font-bold text-start">{t("errors.staff_email")}</th>
                  <th className="px-6 py-4 font-bold text-start">{t("errors.staff_ground")}</th>
                  <th className="px-6 py-4 font-bold text-start">Join Date</th>
                  <th className="px-6 py-4 font-bold text-end">{t("errors.staff_actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {staff.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-zinc-500 font-mono">
                      {t("errors.no_staff_found")}
                    </td>
                  </tr>
                ) : (
                  staff.map((s) => (
                    <tr key={s.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white text-sm">{s.first_name} {s.last_name}</div>
                        <div className="text-[10px] text-zinc-500 font-mono uppercase">ID: #{s.id}</div>
                      </td>
                      <td className="px-6 py-4 text-zinc-300 font-mono">{s.email}</td>
                      <td className="px-6 py-4">
                        <span className="text-brand-cyan font-bold" dir="auto">{s.ground_name || "—"}</span>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 font-mono">
                        {new Date(s.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-end">
                        <button
                          onClick={() => handleDelete(s.id, `${s.first_name} ${s.last_name}`)}
                          className="text-red-400 hover:text-red-300 text-[10px] font-black uppercase tracking-widest transition-all p-2 hover:bg-red-500/10 rounded-lg"
                        >
                          {t("delete")}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination currentPage={page} lastPage={lastPage} onPageChange={handlePageChange} />
      </div>
    </AdminLayout>
  );
}
