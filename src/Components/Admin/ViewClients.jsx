import { useEffect, useState, useCallback } from "react";
import { api } from "../../services/api";
import Pagination from "../Pagination";
import { useTranslation } from "react-i18next";
import AdminLayout from "../Layouts/AdminLayout";

export default function ViewClients() {
  const { t } = useTranslation();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchClients = useCallback((pageNumber) => {
    setLoading(true);
    api.getAllClients(pageNumber)
      .then((data) => {
        if (data.success) {
          const paginator = data.clients;
          if (paginator && paginator.data) {
            setClients(paginator.data);
            setLastPage(paginator.last_page || 1);
            setPage(paginator.current_page || 1);
          } else if (Array.isArray(paginator)) {
            setClients(paginator);
            setLastPage(1);
            setPage(1);
          } else {
            setClients([]);
            setLastPage(1);
            setPage(1);
          }
        } else if (data.status === 403) {
          setError(data.message);
        } else if (data.status === 429) {
          setError(data.message);
        } else {
          setError(t("errors.fetchClients"));
        }
      })
      .catch((err) => {
        setError(t("errors.fetchClients"));
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchClients(1);
  }, [fetchClients]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= lastPage) {
      fetchClients(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 text-white max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            {t("allClients")}
          </h1>
          <button 
            onClick={() => fetchClients(1)}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors"
          >
            {t("refresh")}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="bg-zinc-800/50 text-zinc-400 text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium text-start">{t("name")}</th>
                  <th className="px-6 py-4 font-medium text-start">{t("email")}</th>
                  <th className="px-6 py-4 font-medium text-start">{t("phone")}</th>
                  <th className="px-6 py-4 font-medium text-start">{t("booking.placeholders.cin")}</th>
                  <th className="px-6 py-4 font-medium text-start">{t("joined")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-zinc-500">
                      {t("noClients")}
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client.id} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="px-6 py-4 text-start">
                        <div className="font-medium">{`${client.first_name} ${client.last_name}`}</div>
                        <div className="text-xs text-zinc-500">ID: #{client.id}</div>
                      </td>
                      <td className="px-6 py-4 text-zinc-300 text-start">
                        {client.email}
                      </td>
                      <td className="px-6 py-4 text-zinc-300 text-start">
                        {client.phone}
                      </td>
                      <td className="px-6 py-4 text-zinc-400 font-mono text-start">
                        {client.cin || t("n_a")}
                      </td>
                      <td className="px-6 py-4 text-zinc-500 text-sm text-start">
                        {new Date(client.created_at).toLocaleDateString()}
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
