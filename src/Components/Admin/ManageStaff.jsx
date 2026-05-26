import { useEffect, useState, useCallback } from "react";
import { api } from "../../services/api";
import Pagination from "../Pagination";
import { useTranslation } from "react-i18next";
import Swal from "../../utils/swal";

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
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          Manage Staff
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => fetchStaff(1)}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            {showForm ? "Cancel" : "+ Add Staff"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Add Staff Form */}
      {showForm && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6 backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-4">Create Staff Account</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">First Name</label>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleInputChange}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 px-4 py-2 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleInputChange}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 px-4 py-2 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 px-4 py-2 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleInputChange}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 px-4 py-2 rounded-lg text-white"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-zinc-400 mb-1">Assign Ground</label>
              <select
                name="ground_id"
                value={form.ground_id}
                onChange={handleInputChange}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 px-4 py-2 rounded-lg text-white"
                required
              >
                <option value="">Select a ground</option>
                {grounds.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full md:w-auto px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 rounded-lg transition-colors font-medium"
              >
                {submitting ? "Creating..." : "Create Staff"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-zinc-800/50 text-zinc-400 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium text-start">Name</th>
                <th className="px-6 py-4 font-medium text-start">Email</th>
                <th className="px-6 py-4 font-medium text-start">Ground</th>
                <th className="px-6 py-4 font-medium text-start">Created</th>
                <th className="px-6 py-4 font-medium text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-zinc-500">
                    No staff accounts found
                  </td>
                </tr>
              ) : (
                staff.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium">{s.first_name} {s.last_name}</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-mono text-sm">{s.email}</td>
                    <td className="px-6 py-4">
                      <span className="text-green-400" dir="auto">{s.ground_name || "—"}</span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-end">
                      <button
                        onClick={() => handleDelete(s.id, `${s.first_name} ${s.last_name}`)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                      >
                        Delete
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
  );
}
